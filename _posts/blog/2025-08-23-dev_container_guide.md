---
title: "VS Code에 Dev Container 적용하기"
date: 2025-08-23 15:20:00 +0900
categories: [Blog]
tags: [DevContainer, Docker, 개발환경, 팀협업, VSCode, RemoteDevelopmebt, 컨테이너개발]
---

# VS Code Dev Container 완전 가이드

## Dev Container란?

Dev Container(Development Container)는 Visual Studio Code에서 제공하는 기능으로, 컨테이너 내부에서 완전한 개발 환경을 구축하고 VS Code가 이 환경에 원격으로 연결하여 개발할 수 있게 해주는 기술입니다. 단순히 코드를 컨테이너에서 실행하는 것이 아니라, IDE 자체가 컨테이너 안에서 작동하는 것처럼 느껴지게 만드는 혁신적인 솔루션입니다.

## 등장 배경

### 기존 개발 환경의 문제점

**환경 불일치의 악순환**
현대 소프트웨어 개발에서 개발자들은 다음과 같은 문제들에 지속적으로 직면해왔습니다:

- **"Works on My Machine" 신드롬**: 개발자 A의 환경에서는 정상 작동하지만 개발자 B의 환경에서는 에러가 발생
- **복잡한 환경 설정**: 새 프로젝트 시작 시 Node.js, Python, 데이터베이스 등 다양한 도구들의 버전 맞추기
- **OS별 차이점**: Windows, macOS, Linux 간의 미묘한 동작 차이로 인한 버그
- **라이브러리 의존성 충돌**: 프로젝트 A는 Node.js 14, 프로젝트 B는 Node.js 18이 필요한 상황

**팀 협업의 복잡성**
```
개발팀 현실:
👨‍💻 개발자 A: macOS + Node 16 + PostgreSQL 13
👩‍💻 개발자 B: Windows + Node 18 + PostgreSQL 14  
👨‍💻 개발자 C: Ubuntu + Node 14 + PostgreSQL 12

결과: 각자 다른 환경에서 다른 버그들을 경험
```

**클라우드 네이티브 시대의 요구**
- **마이크로서비스 아키텍처**: 하나의 애플리케이션이 여러 서비스로 분해되면서 로컬 개발 환경의 복잡성 증가
- **DevOps 문화**: 개발과 운영 환경의 일치성 요구 증대
- **원격 근무**: 코로나19 팬데믹으로 인한 원격 개발 환경의 중요성 부각

### Dev Container의 해답

Microsoft는 2019년 VS Code Remote Development 확장팩의 일부로 Dev Container를 출시하며 이러한 문제들에 대한 근본적인 해결책을 제시했습니다:

1. **Infrastructure as Code**: 개발 환경을 코드로 정의하여 버전 관리
2. **완벽한 격리**: 호스트 시스템과 독립적인 개발 환경
3. **즉시 실행**: 저장소 클론 후 몇 분 내에 동일한 환경에서 개발 시작

## 핵심 특징

### 1. 투명한 개발 경험

**로컬 개발과 동일한 UX**
- VS Code의 모든 기능(IntelliSense, 디버깅, 확장 프로그램)이 컨테이너 내에서 완전히 작동
- 키보드 단축키, 테마, 설정 등이 그대로 유지
- 파일 탐색기, 터미널, Git 통합 등 모든 기능 정상 동작

```
사용자 관점에서는 구분이 불가능:
- 로컬 개발: Ctrl+` (터미널 열기) → bash 실행
- Dev Container: Ctrl+` (터미널 열기) → 컨테이너 내 bash 실행
```

### 2. 완전한 환경 격리

**호스트 시스템 의존성 제거**
```bash
# 호스트 시스템: Windows 11 + PowerShell
# Dev Container: Ubuntu 22.04 + bash + Python 3.11 + Node.js 18

# 개발자는 Windows를 사용하지만
# 실제 개발은 Linux 환경에서 진행
```

### 3. 선언적 환경 정의

**Infrastructure as Code 방식**
```json
{
  "name": "My Project Environment",
  "image": "node:18-alpine",
  "features": {
    "ghcr.io/devcontainers/features/git:1": {},
    "ghcr.io/devcontainers/features/docker-in-docker:2": {}
  },
  "customizations": {
    "vscode": {
      "extensions": ["ms-vscode.vscode-typescript-next"]
    }
  }
}
```

### 4. 즉시 협업 가능

**원클릭 환경 공유**
```
팀 협업 플로우:
1. 개발자 A가 .devcontainer 설정 작성
2. Git에 커밋/푸시
3. 개발자 B가 저장소 클론
4. VS Code에서 "Reopen in Container" 클릭
5. 몇 분 후 개발자 A와 동일한 환경에서 작업 시작
```

### 5. 다중 서비스 통합

**복잡한 애플리케이션 스택을 로컬에서 간단히**
```yaml
# 마이크로서비스 전체를 로컬에서 실행
services:
  frontend:
    build: ./frontend
  backend:
    build: ./backend  
  database:
    image: postgres:15
  cache:
    image: redis:7
  search:
    image: elasticsearch:8
```

## 장점 분석

### 1. 개발 생산성 향상

**즉시 개발 가능 (Zero Setup Time)**
```
전통적인 방식:
- 새 개발자 온보딩: 2-8시간 (환경 설정)
- 새 프로젝트 시작: 1-4시간 (의존성 설치)

Dev Container 방식:
- 새 개발자 온보딩: 10-30분 (컨테이너 빌드)
- 새 프로젝트 시작: 5-15분 (이미지 다운로드)
```

**멀티 프로젝트 개발**
```bash
# 동시에 다른 환경에서 작업 가능
project-a/  → Python 3.8 + Django 3.2
project-b/  → Python 3.11 + FastAPI
project-c/  → Node.js 18 + React
project-d/  → Java 17 + Spring Boot

# 각 프로젝트마다 독립적인 개발 환경
```

### 2. 완벽한 환경 일관성

**개발-스테이징-운영 환경 일치**
```dockerfile
# 개발 환경
FROM node:18-alpine
RUN apk add --no-cache git python3 make g++

# 운영 환경 (동일한 베이스 이미지)
FROM node:18-alpine  
RUN apk add --no-cache python3 make g++
```

**팀 전체 표준화**
- 코드 포맷터, 린터 설정이 모든 개발자에게 동일하게 적용
- 확장 프로그램, VS Code 설정 자동 동기화
- 빌드 스크립트, 테스트 환경 완전 일치

### 3. 보안 및 안정성

**호스트 시스템 보호**
```bash
# 실험적인 도구 설치도 안전
npm install -g some-experimental-tool
pip install beta-package

# 컨테이너가 망가져도 호스트 시스템은 안전
# 컨테이너 재빌드로 깨끗한 환경 복구 가능
```

**권한 분리**
- 개발 환경에서 실행되는 프로세스가 호스트 시스템에 직접 접근 불가
- 네트워크, 파일 시스템 접근 제어 가능
- 민감한 데이터의 격리 보장

### 4. 클라우드 네이티브 개발

**컨테이너 기반 배포와의 자연스러운 연결**
```bash
# 개발 환경에서 사용한 컨테이너를 그대로 운영에 배포
docker build -t myapp:dev .        # 개발
docker build -t myapp:prod .       # 운영 (동일한 Dockerfile 기반)
```

**Kubernetes 개발 지원**
- 로컬에서 Kubernetes 클러스터와 동일한 환경 구성
- Helm, kubectl 등 도구들을 컨테이너에 미리 설치
- 클러스터 배포 전 로컬 테스트 가능

## 단점 및 한계점

### 1. 성능 오버헤드

**시스템 리소스 사용량 증가**
```
리소스 사용량 비교 (Node.js 개발 기준):
- 네이티브: RAM 2GB, CPU 일반적 사용량
- Dev Container: RAM 3-4GB, CPU 10-20% 추가 사용량

Docker Desktop 자체 리소스:
- macOS: 2-4GB RAM 상시 사용
- Windows: 1-3GB RAM + WSL2 오버헤드
```

**파일 I/O 성능 저하**
```bash
# 대용량 파일 처리 성능 (macOS 기준)
네이티브: npm install (30초)
Dev Container: npm install (45-60초)

# 파일 감시 (hot reload) 지연
네이티브: 코드 변경 → 0.1초 → 브라우저 갱신  
Dev Container: 코드 변경 → 0.3-0.5초 → 브라우저 갱신
```

### 2. 학습 곡선과 복잡성

**추가 기술 스택 학습 필요**
```
개발자가 알아야 할 기술:
기존: IDE + 프로그래밍 언어 + 프레임워크
추가: Docker + Docker Compose + 컨테이너 개념
```

**디버깅 복잡성 증가**
```bash
# 문제 발생 시 추가 확인 사항들
docker logs <container_id>           # 컨테이너 로그
docker exec -it <container_id> bash  # 컨테이너 내부 접근
docker system df                     # 디스크 사용량
docker system prune                  # 정리

# 네트워크 문제 디버깅
docker network ls
docker port <container_id>
```

### 3. 플랫폼별 제약사항

**Windows 특정 이슈**
```powershell
# WSL2 의존성
- Windows 10/11 Pro 필요 (Home 버전도 지원하지만 제한적)
- Hyper-V 활성화 필요
- BIOS에서 가상화 기술 활성화 필요

# 성능 문제
- WSL2와 Windows 파일 시스템 간 성능 저하
- 메모리 사용량 높음 (Docker Desktop + WSL2)
```

**macOS 특정 이슈**
```bash
# Docker Desktop 라이선스 이슈
- 250명 이상 기업: 유료 라이선스 필요
- 연간 $5-21 per user

# 파일 시스템 성능
- 볼륨 마운트 성능 저하 (특히 node_modules)
- 파일 감시 기능 제한
```

### 4. 개발 도구 통합의 한계

**IDE 기능 제약**
```
완벽하지 않은 통합:
- 네이티브 디버거 성능 대비 느림
- 일부 확장 프로그램의 제한적 기능
- GUI 애플리케이션 실행 어려움
- 하드웨어 직접 접근 불가 (GPU, 특수 장치)
```

**Git 통합 복잡성**
```bash
# SSH 키 관리
- 호스트의 SSH 키를 컨테이너와 공유 필요
- Git 설정 동기화 추가 작업
- GPG 서명 설정 복잡

# 파일 권한 이슈
- 컨테이너 내부의 파일이 호스트에서 다른 소유자로 표시
- Linux: UID/GID 매핑 문제
```

### 5. 네트워크 및 보안 제약

**기업 환경 제약**
```bash
# 방화벽 이슈
- 컨테이너 이미지 다운로드 차단
- Docker Hub, GitHub Container Registry 접근 제한
- 프록시 설정 복잡성

# 보안 정책 충돌
- 컨테이너 실행 정책 제한
- 특권 모드 사용 불가
- 볼륨 마운트 제한
```

## 적합한 사용 사례

### Dev Container를 사용해야 하는 경우

**✅ 강력 추천**
- 팀 규모 3명 이상의 협업 프로젝트
- 복잡한 개발 환경 설정이 필요한 프로젝트
- 마이크로서비스 아키텍처
- 오픈소스 프로젝트 (기여자 온보딩 간소화)
- 교육 목적의 프로젝트

**✅ 고려해볼 만한 경우**
- 다양한 기술 스택을 사용하는 개발자
- 클라이언트 환경에 구애받지 않는 개발 필요
- CI/CD와 완전히 동일한 환경에서 개발 필요

### 사용을 재고해야 하는 경우

**❌ 비추천**
- 단순한 정적 웹사이트 개발
- 네이티브 앱 개발 (iOS, Android)
- 하드웨어 직접 제어가 필요한 임베디드 개발
- 극도로 높은 성능이 요구되는 개발
- 개인 프로젝트 (학습 목적 제외)

## 작동 원리

### 아키텍처

```
┌─────────────────┐    ┌──────────────────────┐
│   로컬 VS Code  │────│   Dev Container      │
│   (클라이언트)   │    │                      │
│                 │    │  ┌─────────────────┐ │
│ - UI/UX         │    │  │ VS Code Server  │ │
│ - 사용자 입력   │    │  │ (백엔드)         │ │
│ - 화면 렌더링   │    │  └─────────────────┘ │
│                 │    │                      │
└─────────────────┘    │  ┌─────────────────┐ │
                       │  │ 개발 도구들      │ │
                       │  │ - 컴파일러       │ │
                       │  │ - 런타임        │ │
                       │  │ - 디버거        │ │
                       │  │ - CLI 도구들    │ │
                       │  └─────────────────┘ │
                       └──────────────────────┘
```

### 연결 과정

1. **컨테이너 생성**: VS Code가 `.devcontainer` 설정을 읽고 컨테이너 빌드
2. **VS Code Server 설치**: 컨테이너 내부에 VS Code 백엔드 자동 설치
3. **원격 연결**: 로컬 VS Code가 컨테이너의 VS Code Server에 연결
4. **확장 프로그램 동기화**: 설정된 확장 프로그램들이 컨테이너 내부에 설치
5. **개발 환경 완성**: 모든 개발 도구가 컨테이너 내부에서 실행

## 설정 파일 구조

### 기본 디렉터리 구조

```
my-project/
├── .devcontainer/
│   ├── devcontainer.json     # 메인 설정 파일
│   ├── Dockerfile           # 사용자 정의 이미지 (선택사항)
│   └── docker-compose.yml   # 다중 서비스 (선택사항)
├── src/
└── README.md
```

### devcontainer.json 핵심 설정

```json
{
  // 컨테이너 이름
  "name": "My Development Environment",
  
  // === 컨테이너 이미지 설정 (3가지 방법 중 하나) ===
  
  // 방법 1: 기존 이미지 사용
  "image": "mcr.microsoft.com/devcontainers/typescript-node:18",
  
  // 방법 2: 커스텀 Dockerfile 사용
  "build": {
    "dockerfile": "Dockerfile",
    "context": ".",
    "args": {
      "NODE_VERSION": "18"
    }
  },
  
  // 방법 3: Docker Compose 사용
  "dockerComposeFile": "docker-compose.yml",
  "service": "app",
  "workspaceFolder": "/workspace",
  
  // === 고급 기능들 ===
  
  // 사전 구축된 기능들 (Features)
  "features": {
    "ghcr.io/devcontainers/features/git:1": {
      "version": "latest",
      "ppa": true
    },
    "ghcr.io/devcontainers/features/github-cli:1": {},
    "ghcr.io/devcontainers/features/docker-in-docker:2": {
      "version": "latest",
      "enableNonRootDocker": "true"
    },
    "ghcr.io/devcontainers/features/aws-cli:1": {}
  },
  
  // VS Code 커스터마이징
  "customizations": {
    "vscode": {
      // 확장 프로그램 자동 설치
      "extensions": [
        "ms-vscode.vscode-typescript-next",
        "esbenp.prettier-vscode",
        "bradlc.vscode-tailwindcss",
        "ms-vscode.vscode-json",
        "GitHub.copilot",
        "ms-vscode.remote-containers"
      ],
      
      // VS Code 설정
      "settings": {
        "editor.defaultFormatter": "esbenp.prettier-vscode",
        "editor.formatOnSave": true,
        "editor.codeActionsOnSave": {
          "source.fixAll.eslint": true
        },
        "typescript.preferences.importModuleSpecifier": "relative",
        "git.autofetch": true,
        "terminal.integrated.defaultProfile.linux": "bash"
      }
    }
  },
  
  // 네트워크 포트 포워딩
  "forwardPorts": [3000, 5432, 6379],
  "portsAttributes": {
    "3000": {
      "label": "Application",
      "onAutoForward": "notify"
    },
    "5432": {
      "label": "PostgreSQL",
      "onAutoForward": "silent"
    }
  },
  
  // 볼륨 마운트
  "mounts": [
    "source=/var/run/docker.sock,target=/var/run/docker.sock,type=bind",
    "source=${localWorkspaceFolder}/.env,target=/workspace/.env,type=bind"
  ],
  
  // 환경 변수
  "containerEnv": {
    "NODE_ENV": "development",
    "DEBUG": "*",
    "TZ": "Asia/Seoul"
  },
  
  // 실행 사용자 (보안)
  "remoteUser": "node",
  "containerUser": "node",
  
  // 라이프사이클 스크립트
  "onCreateCommand": "echo 'Container created!'",
  "updateContentCommand": "npm install",
  "postCreateCommand": "npm run setup:dev",
  "postStartCommand": "npm run dev",
  
  // 개발 환경 최적화
  "hostRequirements": {
    "cpus": 2,
    "memory": "4gb",
    "storage": "10gb"
  },
  
  // 추가 런타임 인수
  "runArgs": [
    "--cap-add=SYS_PTRACE",
    "--security-opt", "seccomp=unconfined"
  ],
  
  // 초기화 스크립트
  "initializeCommand": "echo 'Initializing development environment...'",
  
  // 종료 시 정리
  "shutdownAction": "stopCompose"
}
```

## 다양한 구성 방식

### 1. 간단한 Node.js 환경

```json
{
  "name": "Node.js",
  "image": "node:18",
  "features": {
    "ghcr.io/devcontainers/features/git:1": {}
  },
  "customizations": {
    "vscode": {
      "extensions": ["ms-vscode.vscode-typescript-next"]
    }
  },
  "forwardPorts": [3000],
  "postCreateCommand": "npm install"
}
```

### 2. 풀스택 개발 환경 (Docker Compose)

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    volumes:
      - ../..:/workspaces:cached
    command: sleep infinity
    environment:
      - DATABASE_URL=postgres://postgres:password@db:5432/myapp
    depends_on:
      - db
      - redis

  db:
    image: postgres:15
    restart: unless-stopped
    environment:
      POSTGRES_PASSWORD: password
      POSTGRES_DB: myapp
    volumes:
      - postgres-data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    restart: unless-stopped

volumes:
  postgres-data:
```

```json
// devcontainer.json
{
  "name": "Fullstack Development",
  "dockerComposeFile": "docker-compose.yml",
  "service": "app",
  "workspaceFolder": "/workspaces/${localWorkspaceFolderBasename}",
  
  "features": {
    "ghcr.io/devcontainers/features/git:1": {},
    "ghcr.io/devcontainers/features/github-cli:1": {}
  },
  
  "customizations": {
    "vscode": {
      "extensions": [
        "ms-vscode.vscode-typescript-next",
        "ms-vscode-remote.remote-containers",
        "ckolkman.vscode-postgres"
      ]
    }
  },
  
  "forwardPorts": [3000, 5432, 6379],
  "postCreateCommand": "npm install && npm run setup:db"
}
```

### 3. 커스텀 Dockerfile 기반

```dockerfile
# Dockerfile
FROM ubuntu:22.04

# 기본 패키지 설치
RUN apt-get update && apt-get install -y \
    curl \
    git \
    wget \
    ca-certificates \
    gnupg \
    lsb-release \
    && rm -rf /var/lib/apt/lists/*

# Node.js 18 설치
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs

# Python과 개발 도구들 설치
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# 개발 사용자 생성
RUN useradd -ms /bin/bash developer \
    && usermod -aG sudo developer \
    && echo 'developer ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers

USER developer
WORKDIR /home/developer

# 개발 도구 설치
RUN npm install -g @angular/cli typescript ts-node nodemon
RUN pip3 install --user black pylint pytest

# 셸 커스터마이징
RUN echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
```

```json
// devcontainer.json
{
  "name": "Custom Development Environment",
  "build": {
    "dockerfile": "Dockerfile"
  },
  
  "features": {
    "ghcr.io/devcontainers/features/docker-in-docker:2": {}
  },
  
  "customizations": {
    "vscode": {
      "extensions": [
        "ms-python.python",
        "ms-vscode.vscode-typescript-next",
        "angular.ng-template"
      ]
    }
  },
  
  "remoteUser": "developer",
  "postCreateCommand": "echo 'Development environment ready!'"
}
```

## 실제 프로젝트 예시

### React + TypeScript + Node.js API

```json
{
  "name": "React Fullstack App",
  "dockerComposeFile": "docker-compose.dev.yml",
  "service": "app",
  "workspaceFolder": "/workspace",
  
  "features": {
    "ghcr.io/devcontainers/features/git:1": {},
    "ghcr.io/devcontainers/features/github-cli:1": {},
    "ghcr.io/devcontainers/features/docker-in-docker:2": {}
  },
  
  "customizations": {
    "vscode": {
      "extensions": [
        // Frontend
        "bradlc.vscode-tailwindcss",
        "esbenp.prettier-vscode",
        "ms-vscode.vscode-typescript-next",
        
        // Backend
        "ms-vscode.vscode-json",
        "humao.rest-client",
        
        // Database
        "ckolkman.vscode-postgres",
        
        // DevOps
        "ms-azuretools.vscode-docker",
        
        // AI/Productivity
        "GitHub.copilot",
        "GitHub.copilot-chat"
      ],
      
      "settings": {
        // 포맷터 설정
        "editor.defaultFormatter": "esbenp.prettier-vscode",
        "editor.formatOnSave": true,
        "[typescript]": {
          "editor.defaultFormatter": "esbenp.prettier-vscode"
        },
        "[typescriptreact]": {
          "editor.defaultFormatter": "esbenp.prettier-vscode"
        },
        
        // ESLint 설정
        "editor.codeActionsOnSave": {
          "source.fixAll.eslint": true
        },
        
        // TypeScript 설정
        "typescript.preferences.importModuleSpecifier": "relative",
        "typescript.suggest.autoImports": true,
        
        // 터미널 설정
        "terminal.integrated.defaultProfile.linux": "bash",
        "terminal.integrated.profiles.linux": {
          "bash": {
            "path": "bash",
            "args": ["-l"]
          }
        },
        
        // Git 설정
        "git.autofetch": true,
        "git.confirmSync": false
      }
    }
  },
  
  "forwardPorts": [3000, 3001, 5432],
  "portsAttributes": {
    "3000": {
      "label": "React App",
      "onAutoForward": "openPreview"
    },
    "3001": {
      "label": "API Server",
      "onAutoForward": "notify"
    }
  },
  
  "mounts": [
    // Docker 소켓 마운트 (Docker in Docker)
    "source=/var/run/docker.sock,target=/var/run/docker.sock,type=bind"
  ],
  
  "containerEnv": {
    "NODE_ENV": "development",
    "CHOKIDAR_USEPOLLING": "true",
    "WATCHPACK_POLLING": "true"
  },
  
  "postCreateCommand": "npm run setup:dev",
  "postStartCommand": "npm run dev:all"
}
```

## 고급 기능들

### Features 활용

Dev Container Features는 재사용 가능한 개발 도구 패키지입니다.

```json
{
  "features": {
    // Git 최신 버전
    "ghcr.io/devcontainers/features/git:1": {
      "version": "latest",
      "ppa": true
    },
    
    // AWS CLI
    "ghcr.io/devcontainers/features/aws-cli:1": {
      "version": "latest"
    },
    
    // Terraform
    "ghcr.io/devcontainers/features/terraform:1": {
      "version": "1.5"
    },
    
    // kubectl
    "ghcr.io/devcontainers/features/kubectl-helm-minikube:1": {
      "version": "latest",
      "helm": "latest",
      "minikube": "none"
    },
    
    // Java
    "ghcr.io/devcontainers/features/java:1": {
      "version": "17",
      "installMaven": "true",
      "installGradle": "true"
    }
  }
}
```

### 라이프사이클 스크립트 최적화

```json
{
  // 초기화 (로컬에서 실행)
  "initializeCommand": [
    "echo 'Starting development environment initialization...'",
    "docker system prune -f"
  ],
  
  // 컨테이너 생성 시 (한 번만 실행)
  "onCreateCommand": [
    "bash",
    "-c",
    "echo 'Setting up development environment...' && chmod +x .devcontainer/setup.sh && .devcontainer/setup.sh"
  ],
  
  // 콘텐츠 업데이트 시
  "updateContentCommand": [
    "npm ci",
    "pip install -r requirements.txt"
  ],
  
  // 컨테이너 생성 완료 후
  "postCreateCommand": [
    "npm run setup:hooks",
    "npm run build:dev"
  ],
  
  // 컨테이너 시작 시마다
  "postStartCommand": [
    "npm run start:services",
    "echo 'Development environment ready!'"
  ]
}
```

### 보안 강화 설정

```json
{
  // 비root 사용자 설정
  "remoteUser": "vscode",
  "containerUser": "vscode",
  
  // 특정 capabilities만 허용
  "capAdd": ["SYS_PTRACE"],
  "securityOpt": ["seccomp:unconfined"],
  
  // 읽기 전용 파일시스템 (필요한 경우)
  "runArgs": ["--read-only", "--tmpfs=/tmp"],
  
  // 환경 변수 격리
  "containerEnv": {
    "SHELL": "/bin/bash"
  },
  
  // 네트워크 격리
  "runArgs": ["--network=dev-network"]
}
```

## 성능 최적화 팁

### 1. 볼륨 마운트 최적화

```json
{
  // macOS/Windows에서 성능 향상
  "mounts": [
    "source=${localWorkspaceFolder},target=/workspace,type=bind,consistency=cached"
  ],
  
  // node_modules를 별도 볼륨으로 분리
  "runArgs": [
    "-v", "node_modules:/workspace/node_modules"
  ]
}
```

### 2. 이미지 레이어 캐싱

```dockerfile
# Dockerfile 최적화
FROM node:18-alpine

# 의존성 파일만 먼저 복사 (캐시 활용)
COPY package*.json ./
RUN npm ci --only=production

# 소스 코드는 나중에 복사
COPY . .
```

### 3. 빌드 컨텍스트 최소화

```dockerfile
# .dockerignore
node_modules
.git
.env*
*.log
.DS_Store
dist
build
coverage
```

## 팀 협업 모범 사례

### 1. 설정 표준화

```json
{
  "name": "Company Project Template",
  
  // 팀 전체 필수 확장 프로그램
  "customizations": {
    "vscode": {
      "extensions": [
        "esbenp.prettier-vscode",  // 필수: 코드 포맷팅
        "ms-vscode.vscode-eslint", // 필수: 린팅
        "GitHub.copilot"           // 권장: AI 어시스트
      ],
      
      // 팀 공통 설정
      "settings": {
        "editor.formatOnSave": true,
        "editor.tabSize": 2,
        "files.encoding": "utf8",
        "files.eol": "\n"
      }
    }
  },
  
  // 개발 환경 요구사항 명시
  "hostRequirements": {
    "cpus": 2,
    "memory": "4gb"
  }
}
```

### 2. 버전 관리 전략

```json
{
  // 정확한 버전 명시로 일관성 보장
  "image": "node:18.17.1-alpine",
  
  "features": {
    "ghcr.io/devcontainers/features/git:1": {
      "version": "2.41"
    }
  },
  
  // 업데이트 정책 문서화
  "// NOTE": "Node.js version should be updated quarterly"
}
```

### 3. 문서화

```markdown
# Development Environment Setup

## Requirements
- Docker Desktop 4.0+
- VS Code 1.85+
- Dev Containers extension

## Quick Start
1. Clone repository
2. Open in VS Code
3. Click "Reopen in Container" when prompted
4. Wait for setup to complete

## Troubleshooting
- If container fails to build, run: `docker system prune`
- For slow performance on macOS, enable VirtioFS in Docker Desktop
```

## 트러블슈팅

### 일반적인 문제들

**1. 컨테이너 빌드 실패**
```bash
# 캐시 클리어 후 재빌드
docker system prune -a
```

**2. 확장 프로그램이 설치되지 않음**
```json
{
  "customizations": {
    "vscode": {
      "extensions": [
        "ms-vscode.vscode-typescript-next"
      ]
    }
  }
}
```

**3. 포트 포워딩 문제**
```json
{
  "forwardPorts": [3000],
  "portsAttributes": {
    "3000": {
      "onAutoForward": "notify"
    }
  }
}
```

**4. 권한 문제**
```json
{
  "remoteUser": "node",
  "runArgs": ["--user", "1000:1000"]
}
```

### 성능 이슈 해결

**macOS/Windows 성능 개선**
```json
{
  "mounts": [
    "source=${localWorkspaceFolder},target=/workspace,type=bind,consistency=delegated"
  ]
}
```

**메모리 사용량 최적화**
```json
{
  "runArgs": [
    "--memory=2g",
    "--memory-swap=4g"
  ]
}
```

## 결론

Dev Container는 단순한 개발 도구를 넘어서 팀의 개발 문화를 바꾸는 혁신적인 기술입니다. 초기 설정에 시간이 필요하지만, 한번 구축하면 다음과 같은 혜택을 얻을 수 있습니다:

- **즉시 개발 가능**: 새 팀원도 몇 분 내에 동일한 환경에서 개발 시작
- **환경 일관성**: "내 컴퓨터에서는 되는데" 문제 완전 해결  
- **도구 표준화**: 팀 전체가 동일한 개발 도구와 설정 사용
- **배포 안정성**: 개발 환경과 운영 환경의 차이 최소화

Dev Container는 현대적인 개발팀이라면 반드시 고려해야 할 필수 도구입니다.