---
categories:
- news
- ai
date: 2026-11-22 12:44:15 +0900
layout: post
tags:
- clawdos
- ai
- coding
- agent
- turbo
- component
- react
- svelte
- solid
- components
- "\uC81C\uACF5\uC5C5\uCCB4"
- "\uD504\uB86C\uD504\uD2B8"
- "\uC11C\uBC84\uB9AC\uC2A4"
- lean
title: "ClawDOS \u2013 DOS\uC6A9 AI \uCF54\uB529 \uC5D0\uC774\uC804\uD2B8 \uB4F1 5\uAC1C\
  \ \uAE30\uC0AC"
---

안녕하세요!

이번 digest에는 **5개의 기사**가 실렸습니다.


## 1. ClawDOS – DOS용 AI 코딩 에이전트
**Summary:** ClawDOS는 4.77 MHz 8088 CPU와 640 KB RAM, CGA 그래픽을 갖춘 IBM PC XT에서 동작하는 AI 코딩 에이전트다. 사용자는 Claude와 대화하며 파일 편집, 프로그램 작성, 컴파일, 실행까지 전체 개발 과정을 진행할 수 있다. 176 KB 크기의 DOS 하네스가 API 요청 생성, 스트리밍 응답 파싱, 도구 실행 및 대화 기록을 직접 처리하고, 별도 PC가 TLS 연결을 중계한다. 컴파일 단계에서는 하네스가 메모리 상태를 저장하고 Turbo C에 약 450 KB를 확보해 주어, 작업 후 같은 대화 흐름으로 결과를 전달한다. 또한 화면 캡처와 지속 메모리를 지원해 CGA 화면을 Claude에게 실시간으로 전달한다.

**Why it matters:** 레트로 하드웨어와 최신 대형 언어 모델을 결합한 최초 사례 중 하나로, 제한된 자원 환경에서도 AI 보조 개발이 가능함을 보여준다. 이는 저전력 임베디드 시스템이나 레거시 장비 유지보수에 AI를 적용할 수 있는 새로운 가능성을 열어준다. 또한 개발자 커뮤니티가 과거 플랫폼을 재활용하면서도 최신 AI 기술을 활용하도록 독려한다.

**Source:** [ClawDOS - DOS용 AI 코딩 에이전트](https://news.hada.io/topic?id=37604&utm_source=geeknews&utm_medium=rss&utm_campaign=news)

## 2. UI SDK – AI 에이전트가 UI 기본 동작을 조합해 컴포넌트 생성
**Summary:** UI SDK는 AI 에이전트가 UI의 기본 동작을 조합해 맞춤형 컴포넌트를 자동으로 생성하는 라이브러리다. 팝업 열기, 항목 선택, 입력 문자열 기반 검색 등 50개 이상의 동작을 재사용해 Select, 자동완성, 콤보박스, 사용자 선택기 등을 만들 수 있다. 키보드 탐색, 포커스 관리, 드래그 앤 드롭, 크기 조절, 화면 확대·축소 등 복잡한 접근성 기능도 포함한다. 또한 완성된 컴포넌트의 접근성을 검사하는 테스트 도구를 제공한다. React, Vue, Svelte, Solid, Web Components 등 주요 프레임워크를 모두 지원한다.

**Why it matters:** UI 구현에 드는 반복 작업과 접근성 보장을 AI가 자동화함으로써 개발 생산성이 크게 향상된다. 특히 접근성 요구가 강화되는 현재, AI가 키보드 조작과 스크린 리더 지원을 자동으로 처리해 규정 준수를 쉽게 만든다. 프레임워크 간 동작 정의 재사용은 유지보수 비용을 줄이고, UI 일관성을 높인다.

**Source:** [UI SDK - AI 에이전트가 UI의 기본 동작을 조합해 컴포넌트를 만드는 라이브러리](https://news.hada.io/topic?id=37600&utm_source=geeknews&utm_medium=rss&utm_campaign=news)

## 3. OpenRouter, AI 프롬프트 노출 조사 후 3개 제공업체 차단
**Summary:** OpenRouter는 2026년 11월 22일, 프롬프트와 응답을 저장하지 않는 Zero Data Retention(ZDR) 설정 하에 운영되는 125개의 엔드포인트 중 3개 제공업체와 125개의 엔드포인트를 제외했다. 이번 조치는 연구자들이 제기한 보안 우려와 잠재적 노출 위험을 사전에 차단하기 위한 조치이다. OpenRouter는 영향을 받을 수 있는 고객에게 통지를 했으며, 실제 데이터 유출이나 무단 접근이 발생한 것은 아니라고 밝혔다.

**Why it matters:** AI 서비스에서 프롬프트와 응답이 저장되지 않도록 하는 정책은 개인정보와 기업 비밀 보호에 핵심이다. 이번 차단은 공급망 보안 강화와 신뢰 가능한 AI 인프라 구축에 중요한 선례가 된다. 또한 다른 AI 플랫폼에도 유사한 데이터 보존 정책을 도입하도록 압박을 가할 수 있다.

**Source:** [OpenRouter Cuts Three Providers After AI Prompt Exposure Findings](https://www.unite.ai/openrouter-cuts-three-providers-after-ai-prompt-exposure-findings/)

## 4. Together AI, 코딩 에이전트 자격 증명 노출 후 프롬프트 유출 공개
**Summary:** Together AI는 2026년 11월 21일, 서버리스 추론 서비스에 저장된 고객 프롬프트 샘플이 무단으로 다운로드된 사건을 발표했다. 코딩 에이전트가 공개 GitHub 저장소를 개발하는 과정에서 사설 Hugging Face 저장소에 사용된 개인 레포지터리 자격 증명을 노출한 것이 원인이다. 고객은 일상적인 소프트웨어 테스트 용도로 프롬프트를 제출했으며, 해당 샘플이 비공개 저장소에 보관되었다가 외부에 유출됐다.

**Why it matters:** AI 코딩 에이전트가 개발 중에 자격 증명을 노출하는 사례는 보안 관행의 취약점을 명확히 보여준다. 프롬프트와 코드가 민감한 정보를 담고 있을 수 있기 때문에, 저장 및 접근 관리 체계가 충분히 강화돼야 함을 시사한다. 이번 사건은 AI 서비스 제공자가 보안 검증을 자동화하고, 비밀 정보가 코드에 섞이지 않도록 하는 도구 개발 필요성을 부각시킨다.

**Source:** [Together AI Discloses Prompt Leak After Coding Agent Exposed Credential](https://www.unite.ai/together-ai-discloses-prompt-leak-after-coding-agent-exposed-credential/)

## 5. Lean·Mathlib, Claude‑지원 리만 가설 증명 인증
**Summary:** Lean 및 Mathlib 커뮤니티는 2026년 11월 21일, Levent Alpöge가 Claude와 협업해 만든 1,700만 라인 규모의 Lean 라이브러리에서 리만 가설을 정확히 진술하고 증명했다는 사실을 인증했다. 하루 만에 컴파일, 명제 매칭, 증명 커널 검증을 마친 뒤, Lean FRO와 Mathlib Initiative가 공식적으로 인증하였다. Alpöge는 전날 Claude와 함께 작업하면서 이 증명을 발견하고 형식화했다고 발표했다.

**Why it matters:** 수백 년간 풀리지 않았던 리만 가설을 형식 검증 시스템을 통해 증명했다는 점은 수학·AI 협업의 새로운 가능성을 열어준다. 대규모 형식 검증과 대형 언어 모델의 조합은 복잡한 수학적 아이디어를 자동화하고 오류를 최소화한다는 점에서 학계와 산업 모두에 큰 파급 효과를 미친다. 또한 AI가 수학 연구에 직접적인 기여를 할 수 있다는 사례로, 향후 AI‑주도 과학 발견의 기반이 될 것이다.

**Source:** [Lean and Mathlib Communities Certify Claude-Assisted Riemann Proof](https://www.unite.ai/lean-and-mathlib-communities-certify-claude-assisted-riemann-proof/)