---
title: "Mac에서 REA(Reverse Engineer Anything)와 Codex 연동하기: 설치·오류 해결·MCP 검증"
date: 2026-10-26 13:30:00 +0900
categories: [AI, Development]
tags: [REA, Reverse-Engineering, Codex, MCP, Nodejs, macOS]
description: "Node.js 업그레이드부터 Codex 모델 오류 해결, REA MCP 서버의 실제 도구 호출 검증까지 기록"
toc: true
---

## 개요

기존 애플리케이션의 구조를 분석하고 재구현하는 과정에서 AI 코딩 에이전트를 활용하기 위해 **REA(Reverse Engineer Anything)**와 **OpenAI Codex CLI**를 연동했다. 이 글은 2026년 10월 26일 Mac에서 실제로 수행한 구성 및 트러블슈팅 기록이다.

**결과:** REA MCP 서버가 Codex에 등록되어 활성화되었으며, 실제 읽기 전용 분석 설정 조회에 성공했다. 다만 Ghidra·Hopper 등 외부 분석 엔진의 설치 및 특정 애플리케이션의 역공학 성공까지 검증한 것은 아니다.

## 1. 구축 환경

| 항목 | 확인 결과 |
|---|---|
| 운영 환경 | macOS, Homebrew (`/opt/homebrew`) |
| Node.js 초기 | v24.2.0 |
| Node.js 최종 | **v26.12.1** |
| npm 최종 | **v11.20.0** |
| Codex CLI | **v0.145.0** |
| REA MCP | **rea-agents@6.8.0** |
| Codex 모델 | **gpt-5.6-sol** |
| Reasoning Level | **High** |

버전 및 모델 지원 여부는 변경될 수 있으므로 위 표는 실습 당시의 확인 결과로 참고한다.

## 2. 구성 아키텍처

```text
사용자 요청
    │
    ▼
OpenAI Codex CLI
    │ 분석 계획 수립 및 MCP 도구 호출
    ▼
REA MCP Server (rea-agents)
    ├── JavaScript / Electron 분석
    ├── 웹 번들 / 런타임 분석
    ├── Native 바이너리 분석
    └── 선택적 외부 분석 엔진 연계
    │
    ▼
분석 근거 → 소프트웨어 구조 이해 → 재구현 설계
```

REA는 소프트웨어 분석 도구 집합이고, Codex는 자연어 명령을 바탕으로 적절한 도구를 선택하고 분석 결과를 해석하는 AI 에이전트 역할을 한다.

## 3. Node.js 설치 방식 확인 및 업그레이드

최초 버전 확인:

```bash
node -v
# v24.2.0
npm -v
# 11.4.1
```

설치 경로 확인:

```bash
which node
which npm
brew list --versions node node@24
```

출력:

```text
/opt/homebrew/bin/node
/opt/homebrew/bin/npm
node 24.2.0
```

Homebrew 설치 환경임을 확인하고 다음 명령으로 업그레이드했다.

```bash
brew update
brew upgrade node
```

완료 후:

```bash
node -v
# v26.12.1
npm -v
# 11.20.0
```

> `brew upgrade node`는 동일한 메이저 버전을 고정하지 않을 수 있다. 프로젝트별 Node.js 버전 호환성이 중요한 경우 nvm 또는 fnm 등 버전 관리 도구를 검토한다.

## 4. Codex CLI 확인

```bash
codex --version
# codex-cli 0.145.0
```

Codex가 없는 환경에서는 다음 명령으로 설치할 수 있다.

```bash
npm install -g @openai/codex
codex login
```

이번 구성에서는 Codex가 기존에 설치되어 있어 재설치하지 않았다.

## 5. REA MCP 등록

설치에 따른 변경 예상 내용을 먼저 확인한다.

```bash
npx rea-agents@latest setup --client codex --dry-run
```

실제 등록 명령:

```bash
npx rea-agents@latest setup --client codex
```

그 다음 등록 상태를 확인한다.

```bash
codex mcp list
```

실제 확인된 REA 항목은 다음과 같다.

```text
Name  Command  Args                     Status   Auth
rea   npx      -y rea-agents@6.8.0 mcp  enabled  Unsupported
```

`enabled`는 MCP 설정이 활성화된 상태를 뜻한다. `Auth: Unsupported`는 곧바로 실행 실패를 뜻하는 것이 아니며, 실제 도구 호출을 통해 검증해야 한다.

Codex 대화형 인터페이스에서 `/mcp`를 실행하자 `rea` 아래에 `inspect_analysis_settings`, `list_documents`, `analyze_javascript_application`, `open_binary`, `inspect_macho`, `get_call_graph`, `verify_reconstruction` 등의 도구가 표시되었다.

## 6. 오류 해결: Codex 모델 미지원

REA 진단 프롬프트를 실행하는 과정에서 다음 오류가 발생했다.

```text
status: 400
code: model_not_found
The 'gpt-6.1-sol' model is not supported
when using Codex with a ChatGPT account.
```

이는 REA 서버 오류가 아니라 **ChatGPT 계정으로 이용하는 Codex에서 선택 모델을 지원하지 않는 문제**였다.

Codex에서 `/model`을 입력해 실제 선택 가능한 모델을 확인했다.

| 모델 | 당시 모델 선택 화면의 설명 |
|---|---|
| gpt-5.6-sol | 기본 모델, 복잡한 작업에 적합 |
| gpt-5.6-terra | 균형형 모델 |
| gpt-5.6-luna | 빠른 모델 |

실습에서는 `gpt-5.6-sol`, Reasoning Level `High`를 선택했다. 모델을 명시적으로 지정하려면 다음과 같이 실행할 수도 있다.

```bash
codex -m gpt-5.6-sol
```

같은 오류가 계속되면 `~/.codex/config.toml`의 모델 설정을 확인한다. 변경 전 기존 설정 파일을 백업하고, 실제 사용 가능한 모델명을 기준으로 수정한다.

## 7. REA MCP 실제 도구 호출 검증

Codex에 다음과 같이 읽기 전용 진단을 요청했다.

```text
REA MCP의 inspect_analysis_settings 도구를 호출하여
현재 분석 환경을 확인해 줘.
이어서 list_documents 도구로 현재 분석 대상이
등록되어 있는지 확인해 줘.
파일과 설정은 변경하지 마.
```

### 7.1 `list_documents`

```text
rea.list_documents({})
```

결과:

```json
{
  "error": {
    "code": "target_unavailable",
    "category": "unavailable",
    "message": "No app is open. Ask the user which app to investigate, then call open_binary with its local path.",
    "retryable": false
  }
}
```

이것은 **MCP 연결 오류가 아니라 현재 열린 분석 대상이 없다는 의미**다. 대상 애플리케이션을 지정한 뒤 적절한 분석 도구로 열어야 한다.

### 7.2 `inspect_analysis_settings`

```text
rea.inspect_analysis_settings({})
```

이 호출은 정상적으로 성공했다. 응답에는 `revision: 0`, `scope: rea-runtime`, `active_values.status: not_observed`가 포함되어 있었다.

당시 Codex가 정리한 설정값:

| 항목 | 설정값 |
|---|---:|
| JavaScript 분석 제한 | 300,000 ms |
| JavaScript 워커 힙 | 1,024 MiB |
| Ghidra 시작 제한 | 330,000 ms |
| Hopper 시작 제한 | 120,000 ms |
| JADX 작업 제한 | 120,000 ms |
| MCP 최대 응답 크기 | 10 MiB |
| Node 부모 프로세스 힙 상한 | 약 4.09 GiB |

설정값이 존재한다는 사실만으로 관련 외부 분석 엔진이 설치되었다고 볼 수 없다. `not_observed`는 실제 실행 워커 상태가 아직 관찰되지 않았음을 의미한다.

### 7.3 최종 진단 결과

| 점검 항목 | 결과 |
|---|---|
| Node.js / npm 버전 | 확인 완료 |
| Codex CLI | 설치 확인 |
| REA MCP 등록 | 활성화 확인 |
| REA 도구 목록 | 표시 확인 |
| `inspect_analysis_settings` | 성공 |
| `list_documents` | 서버 응답 수신, 열린 대상 없음 |
| 외부 분석 엔진 | 미검증 |
| 실제 대상 역공학 | 미실시 |

즉 **Codex와 REA 간 실제 MCP 통신은 성공**했으며, 이제 분석 대상을 선택할 단계다.

## 8. 다음 실습: 분석 대상 지정

본인이 소유하거나 분석 권한이 있는 소프트웨어를 선택한다. 예를 들어 macOS 애플리케이션이라면 Codex에 다음과 같이 요청할 수 있다.

```text
REA를 활용하여 다음 앱을 읽기 전용으로 분석해 줘.
대상: /Applications/분석대상.app

1. 앱 형식과 주요 실행 파일 식별
2. 사용된 기술 스택과 주요 모듈 확인
3. 함수 호출 관계와 의존성 분석
4. 확인된 사실과 추정 구분
5. 추가 분석에 필요한 엔진과 도구 제시

원본 파일 변경, 동적 주입, 외부 전송은 수행하지 마.
```

대상 유형에 따라 사용할 REA 도구가 다르므로 먼저 형식과 경로를 확인하고 Native 분석 엔진이 필요한지도 점검한다.

## 9. 엔터프라이즈 도입 시 고려사항

- **권한 및 라이선스:** 분석 권한을 확보한 소프트웨어만 대상으로 지정한다.
- **데이터 보안:** 바이너리 문자열, 환경설정, 분석 결과에 기업 비밀이나 자격증명이 포함되는지 점검한다.
- **분석 방식:** 초기에는 읽기 전용 정적 분석을 우선하고, 프로세스 실행·동적 계측·디버깅은 별도 승인한다.
- **품질 검증:** AI가 추정한 아키텍처와 디컴파일 결과를 확정적인 사실로 간주하지 않고 테스트와 근거로 검증한다.
- **재현성:** Node.js, Codex, REA 버전 및 실행 프롬프트를 보관한다.

## 마무리

이번 구성 과정의 핵심은 **등록 여부와 실제 실행 성공을 분리해 검증했다는 점**이다. Node.js와 Codex를 준비하고 REA MCP 서버를 등록한 다음, 모델 미지원 오류를 해결하고 실제 읽기 전용 도구 호출까지 확인했다.

향후에는 샘플 소프트웨어를 대상으로 **분석 → 설계 → Codex 재구현 → 기능 동등성 검증** 흐름을 진행할 계획이다.

### 참고 자료

- [REA 공식 GitHub](https://github.com/morluto/rea)
- [OpenAI Codex GitHub](https://github.com/openai/codex)
- [Node.js 공식 사이트](https://nodejs.org/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
