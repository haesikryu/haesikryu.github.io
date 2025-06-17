---
title: Claude Code 설정 가이드 (터미널에서 AI와 함께 코딩하기)
date: 2025-06-16 00:00:00 +0900
categories: [Blog]
tags: [AI Coding, Claude Code]
---

# Claude Code 설정 가이드: 터미널에서 AI와 함께 코딩하기

Claude Code는 Anthropic에서 제공하는 아직 연구 미리보기 단계의 혁신적인 도구입니다. 개발자들이 터미널에서 직접 Claude에게 코딩 작업을 위임할 수 있는 에이전틱(agentic) 명령줄 도구로, 개발 워크플로우를 크게 향상시킬 수 있습니다.

## Claude Code란?

Claude Code는 명령줄 환경에서 Claude AI와 직접 상호작용할 수 있게 해주는 도구입니다. 복잡한 코딩 작업을 Claude에게 위임하고, 실시간으로 피드백을 받으며, 더 효율적인 개발 경험을 제공합니다.

## 시스템 요구사항

설치하기 전에 다음 요구사항을 확인하세요:

- **운영체제**: macOS, Linux, 또는 Windows (WSL 권장)
- **Node.js**: 16.0 이상 버전
- **터미널**: 현대적인 터미널 에뮬레이터 (iTerm2, Windows Terminal 등)
- **인터넷 연결**: Anthropic API 접근을 위해 필요

## 1단계: API 키 발급받기

### 1.1 Anthropic Console 접속
1. [Anthropic Console](https://console.anthropic.com)에 접속합니다
2. 계정이 없다면 회원가입을 진행합니다
3. 로그인 후 대시보드로 이동합니다

### 1.2 API 키 생성
1. 좌측 메뉴에서 **"API Keys"** 섹션을 클릭합니다
2. **"Create Key"** 버튼을 클릭합니다
3. 키에 대한 설명을 입력합니다 (예: "Claude Code Local Development")
4. **"Create Key"** 버튼을 클릭하여 생성을 완료합니다
5. 생성된 API 키를 안전한 곳에 복사해둡니다

⚠️ **중요**: API 키는 한 번만 표시되므로 반드시 안전한 곳에 저장해두세요.

## 2단계: Claude Code 설치

### 2.1 npm을 통한 설치 (권장)
```bash
npm install -g @anthropic-ai/claude-code
```

### 2.2 yarn을 사용하는 경우
```bash
yarn global add @anthropic-ai/claude-code
```

### 2.3 설치 확인
```bash
claude-code --version
```

정상적으로 설치되었다면 버전 정보가 출력됩니다.

## 3단계: 초기 설정

### 3.1 API 키 설정
다음 명령어로 API 키를 설정합니다:

```bash
claude-code config set api-key YOUR_API_KEY_HERE
```

### 3.2 환경변수를 통한 설정 (선택사항)
API 키를 환경변수로 설정하는 것도 가능합니다:

**Linux/macOS:**
```bash
export ANTHROPIC_API_KEY="your-api-key-here"
echo 'export ANTHROPIC_API_KEY="your-api-key-here"' >> ~/.bashrc
source ~/.bashrc
```

**Windows (PowerShell):**
```powershell
$env:ANTHROPIC_API_KEY="your-api-key-here"
[Environment]::SetEnvironmentVariable("ANTHROPIC_API_KEY", "your-api-key-here", "User")
```

### 3.3 기본 설정 확인
```bash
claude-code config list
```

이 명령어로 현재 설정된 값들을 확인할 수 있습니다.

## 4단계: 첫 번째 사용

### 4.1 기본 사용법
프로젝트 디렉토리에서 Claude Code를 실행합니다:

```bash
cd your-project-directory
claude-code
```

### 4.2 대화형 모드
Claude Code는 대화형 모드로 실행되며, 다음과 같은 프롬프트가 나타납니다:

```
Claude Code (Research Preview)
Type 'help' for available commands or 'exit' to quit.

> 
```

### 4.3 첫 번째 명령 실행
간단한 예시로 시작해봅시다:

```
> Create a simple Python function to calculate factorial
```

Claude가 코드를 생성하고 파일을 만들어줄 것입니다.

## 5단계: 고급 설정

### 5.1 프로젝트별 설정
각 프로젝트마다 다른 설정을 사용하고 싶다면, 프로젝트 루트에 `.claude-code.json` 파일을 생성합니다:

```json
{
  "model": "claude-sonnet-4-20250514",
  "temperature": 0.1,
  "max_tokens": 4096,
  "excluded_files": ["node_modules/**", "*.log", ".git/**"],
  "included_extensions": [".js", ".ts", ".py", ".java", ".cpp"]
}
```

### 5.2 자주 사용하는 명령어 별칭 설정
`.bashrc` 또는 `.zshrc`에 별칭을 추가합니다:

```bash
alias cc="claude-code"
alias ccq="claude-code --quick"  # 빠른 실행을 위한 별칭
```

### 5.3 IDE 통합 설정
VS Code와 같은 IDE에서 터미널을 통해 Claude Code를 더 편리하게 사용할 수 있습니다. VS Code의 통합 터미널에서 직접 실행 가능합니다.

## 6단계: 보안 및 모범 사례

### 6.1 API 키 보안
- API 키를 코드에 하드코딩하지 말고 환경변수를 사용하세요
- `.env` 파일을 사용한다면 `.gitignore`에 추가하세요
- 정기적으로 API 키를 로테이션하세요

### 6.2 프로젝트 설정
- 민감한 파일들을 `excluded_files`에 추가하세요
- 대용량 파일이나 바이너리 파일은 제외하세요
- 프로젝트의 컨텍스트를 명확히 제공하세요

### 6.3 사용량 모니터링
Anthropic Console에서 API 사용량을 정기적으로 확인하고 예산을 설정하세요.

## 문제 해결

### 자주 발생하는 문제들

**1. "Command not found" 오류**
```bash
# npm의 글로벌 경로가 PATH에 없는 경우
npm config get prefix
export PATH=$PATH:$(npm config get prefix)/bin
```

**2. API 키 인증 오류**
```bash
# 설정된 API 키 확인
claude-code config get api-key
# 새로운 키로 재설정
claude-code config set api-key NEW_API_KEY
```

**3. 네트워크 연결 문제**
프록시 환경에서는 추가 설정이 필요할 수 있습니다:
```bash
claude-code config set proxy http://your-proxy:port
```

## 추가 리소스

- **공식 문서**: Anthropic 웹사이트에서 최신 정보 확인
- **API 문서**: [https://docs.anthropic.com](https://docs.anthropic.com)
- **지원 센터**: [https://support.anthropic.com](https://support.anthropic.com)

## 마무리

Claude Code는 아직 연구 미리보기 단계이지만, 개발자의 생산성을 크게 향상시킬 수 있는 강력한 도구입니다. 이 가이드를 따라 설정을 완료했다면, 이제 터미널에서 Claude와 함께 더 효율적인 코딩을 시작할 수 있습니다.

설정 과정에서 문제가 발생하거나 추가적인 도움이 필요하다면, Anthropic의 공식 문서나 지원 센터를 참고하시기 바랍니다.