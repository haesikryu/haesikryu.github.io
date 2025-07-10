---
title: Claude Code 단게별 설치 방법
date: 2025-07-10 13:14:00 +0900
categories: [Blog]
tags: [LLM기반AI도구, 2025년AI트렌드, ChatGPT분석, Claude코딩특화, AI도구비교분석, 멀티모달AI, 실시간AI검색, AI도구선택가이드]
---

# Claude Code 단게별 설치 방법

몇 단계만 거치면 Claude Code를 시스템에 설치하고 실행할 수 있습니다. 이 Claude Code 설치 및 설정 가이드는 Windows, Mac, Linux 시스템에 대한 다운로드, 설치, 구성 및 모델 선택을 다룹니다.

참고: 최신 설치 지침을 보려면 공식 [Claude Code 문서](https://docs.anthropic.com/en/docs/claude-code/overview)를 방문하세요.

## 클로드 코드 시스템 요구 사항 및 
Claude Code는 다음 운영 체제를 지원합니다.
- macOS 10.15(Catalina) 이상
- Windows 10 이상
- Linux (Ubuntu 18.04+, CentOS 7+ 또는 동급)

하드웨어 요구 사항:
- 최소 4GB RAM (16GB 권장)
- 사용 가능한 디스크 공간 500MB
- API 통신을 위한 인터넷 연결

Claude Code를 설치하기 전에 다음 사항을 확인하세요.
- Node.js 버전 18.0 이상
- Anthropic API 키 ( console.anthropic.com 에서 받으세요 )
- 터미널 또는 명령 프롬프트

## Claude Code 설치 방법: 단계별 
### 옵션 1: npm (권장 
'''
npm install -g @anthropic-ai/claude-code
'''

### 옵션 2: 직접 
GitHub 릴리스 페이지 에서 최신 바이너리를 다운로드하세요 .

## Claude Code 설정 및 구성 
### API 키 
설치 후 API 키로 Claude Code를 구성하세요.
'''
claude config
'''
Claude Max 또는 Anthropic Console 계정을 사용하여 일회성 OAuth 프로세스를 완료합니다.

### 대안: 환경 
환경 변수를 사용하여 API 키를 설정할 수도 있습니다.
'''
export ANTHROPIC_API_KEY="your-api-key-here"
'''
이를 셸 프로필( .bashrc, .zshrc, 등)에 추가하여 영구적으로 적용하세요.

---

### 클로드 맥스 
**중요**: Anthropic API는 사용량에 따라 요금이 부과되므로 자주 사용할 경우 비용이 많이 들 수 있습니다. Claude Code를 정기적으로 사용하는 경우 [Claude Max 구독](https://claude.ai/upgrade)이 더 경제적인 옵션일 수 있습니다. Claude Max는 고정 월 요금으로 더 높은 사용량 한도를 제공하므로 Claude Code를 광범위하게 사용하는 개발자에게 이상적입니다.

다음과 같은 경우 Claude Max를 고려해 보세요.
- 하루에 여러 시간 동안 Claude Code를 사용하세요
- 대규모 코드베이스 작업
- 복잡한 다중 파일 작업을 정기적으로 수행합니다.

**시작하기**: 사용 패턴이 확실하지 않다면, 일반적인 워크플로에서 Claude Code를 테스트하기 위해 약 20달러 상당의 API 크레딧으로 시작하는 것을 고려해 보세요. 이를 통해 Claude Max 구독이 특정 사용 사례에 투자할 가치가 있는지 판단하는 데 도움이 될 것입니다.

전체 가격 내역과 요금제 비교를 보려면 [Claude AI 가격 가이드](https://claudelog.com/pricing/)를 참조하세요 .

*면책 조항: 저자는 Claude Max 5x를 사용합니다.*

### 클로드 코드 모델 선택
Claude Code는 여러 모델을 지원합니다. 최적의 성능을 위해 사용할 모델을 지정할 수 있습니다.

**클로드 4 소네트**: 최신 균형 잡힌 연주와 속도
'''
export ANTHROPIC_MODEL="claude-sonnet-4-20250514"
'''
**클로드 4 오푸스**: 복잡한 작업에 대한 최대 역량
'''
export ANTHROPIC_MODEL="claude-opus-4-20250514"
'''
**클로드 3.5 하이쿠**: 가장 빠르고 비용 효율적
'''
export ANTHROPIC_MODEL="claude-3-5-haiku-20241022"
'''
**중요한 제한 사항** : Claude 3.5 Haiku
Haiku는 비용 효율적이지만 Claude Code 사용에는 상당한 제한이 있습니다.
- 추론 능력 저하: 복잡한 다단계 계획 및 아키텍처 결정에 어려움을 겪음
- 제한된 컨텍스트 이해: 대규모 코드베이스를 분석하고 여러 파일에 걸쳐 컨텍스트를 유지하는 데 덜 효과적입니다.
- 간소화된 코드 분석: 최신 모델이 포착하는 미묘한 버그, 종속성 또는 복잡한 패턴을 놓칠 수 있습니다.
- 기본 리팩토링만 가능: 정교한 구조 조정이나 기능 구현에는 적합하지 않음
- 제한된 프레임워크 지식: 복잡한 프레임워크나 새로운 코딩 패턴에서는 효과적이지 않음
Haiku에 권장되는 사용 사례:
- 간단한 단일 파일 편집
- 기본 구문 수정
- 빠른 코드 질문
- 업그레이드 전 Claude Code 기본 사항 학습
본격적인 개발 작업의 경우, Claude 4 Sonnet이나 Opus를 사용하면 훨씬 더 나은 결과를 얻을 수 있으며 추가 비용을 지불할 만한 가치가 있습니다.

**대체 방법**: Claude Code를 시작할 때 모델을 직접 지정할 수도 있습니다.
'''
claude --model claude-sonnet-4-20250514
claude --model claude-opus-4-20250514
claude --model claude-3-5-haiku-20241022
'''
사용량과 비용을 모니터링하려면 cc-usage 애드온을 고려해보세요 .

자세한 모델 비교 및 ​​선택 지침은 전체 모델 비교 가이드를 참조하세요 .

플랫폼별 Claude 코드 설정: Windows, Mac 및 
클로드 코드 Windows 
Windows에서 Claude Code를 가장 효과적으로 사용하려면 다음 최적화 단계를 따르세요.

WSL2 설치 및 
1. WSL2를 설치합니다 (아직 설치되지 않은 경우):

wsl --install

2. Linux 배포판을 설치하세요 (Ubuntu 권장):

wsl --install -d Ubuntu

3. WSL2 성능 최적화:

.wslconfigWindows 사용자 디렉토리에 다음을 만들어 WSL2 메모리 제한을 설정합니다 .

# In Windows: %USERPROFILE%\.wslconfig
[wsl2]
memory=8GB          # Limit WSL2 memory usage
processors=4        # Limit CPU cores
swap=2GB           # Set swap size
localhostForwarding=true

4. WSL2를 최신 버전으로 업데이트하세요.

wsl --update

터미널 
저는 개인적으로 Claude Code 개발에 Windows Terminal 앱을 사용합니다. Microsoft Store 또는 GitHub 릴리스 에서 다운로드할 수 있습니다 .

클로드 코드 VS 코드 
1. VS Code 확장 프로그램 설치:

WSL 확장: ms-vscode-remote.remote-wsl
원격 개발 확장 팩: ms-vscode-remote.vscode-remote-extensionpack
2. VS Code를 WSL에 연결합니다.

# From WSL terminal in your project directory
code .

3. Claude Code VS Code 확장 프로그램 설치: VS Code Marketplace 에서 공식 Claude Code 확장 프로그램을 설치하거나 VS Code의 확장 프로그램 패널에서 "Claude Code"를 검색하세요.

4. 확장 기능을 적용하려면 VS Code를 완전히 다시 시작하세요 .

5. VS Code와 함께 Claude Code 사용하기:

# In VS Code integrated terminal (WSL)
claude
# Or use /ide command from any external terminal to connect

6. VS Code 통합 기능:

Cmd+Esc(Mac) 또는 (Windows/Linux) 를 사용하여 Ctrl+EscClaude Code를 직접 엽니다.
파일 참조: Cmd+Option+K(Mac) 또는 Alt+Ctrl+K(Windows/Linux) 파일 참조를 삽입합니다.
VS Code의 diff 뷰어에서 제안된 변경 사항 보기
Claude 코드 설치 확인: 
다음을 실행하여 Claude Code 설치를 확인하세요.

claude --version

Claude Code의 현재 버전이 터미널에 출력되어 표시됩니다.

설치 완료
Claude Code가 성공적으로 설치되었으므로 이제 가장 강력한 AI 개발 도구 중 하나를 사용할 수 있습니다. 모든 훌륭한 개발 여정은 견고한 기반에서 시작됩니다.

사용자 정의 이미지
다음: 시작하기 섹션 으로 이동하여 Claude Code 프로젝트 설정, 기본 명령 및 워크플로 최적화에 대해 알아보세요.