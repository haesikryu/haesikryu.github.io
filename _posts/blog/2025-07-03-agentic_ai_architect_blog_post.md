---
title: "Agentic AI, 아키텍처를 다시 설계하다: 새로운 코파일럿의 등장"
date: 2025-07-03 21:57:00 +0900
categories: [Blog]
tags: [AgenticAI, AIArchitecture, SoftwareArchitect , LLMOrchestration, PromptEngineering, AutonomousAgents, ArchitectureAutomation, AIinDevelopment]
---

# 🧠 Agentic AI, 아키텍처를 다시 설계하다: 새로운 코파일럿의 등장

> 📚 참고: [Ashvini K. Upadhyay, Medium](https://medium.com/@ashu667/the-software-architects-new-co-pilot-is-agentic-ai-about-to-re-architect-how-we-build-software-7d00a5993c11?utm_source=chatgpt.com)

---

## ❓ 지금, 소프트웨어 아키텍처에 무슨 일이 일어나고 있는가?

우리는 지금, **코드를 직접 짜는 AI**에서 한 걸음 더 나아가,  
**"시스템을 이해하고 설계하는 AI"**, 즉 *Agentic AI*의 시대를 맞고 있습니다.

단순한 도우미(copilot)가 아니라, 이제는 아키텍트와 함께  
- 설계서를 작성하고  
- 컴포넌트를 정의하며  
- 구성 요소 간 의존성을 조율하고  
- 심지어 테스트 시나리오까지 제안하는  
“**지능형 설계 파트너**”가 실현되려 하고 있습니다.

---

## 🤖 Agentic AI란 무엇인가?

Agentic AI는 단순 LLM 기반 응답 생성기를 넘어, **목표 지향성(goal-directedness)**을 갖춘 다중 에이전트 시스템을 지칭합니다.

### 구성요소 예시:

- **Planner Agent**: 전체 시스템 구조 정의 및 의사결정 흐름 설계  
- **Coder Agent**: 각 컴포넌트에 대한 코드 생성 및 수정  
- **Critic Agent**: 설계 품질 및 충돌 감지  
- **Tester Agent**: 테스트 케이스 생성 및 시뮬레이션 수행

이들은 독립적으로 동작하지만, 공유된 목표(예: 서비스 설계, SLA 만족)를 기준으로 **상호 협력**합니다.

---

## 🧩 아키텍트의 역할, 어떻게 재정의되는가?

Agentic AI 도입은 아키텍트의 역할을 ‘축소’시키지 않습니다. 오히려 다음과 같이 **재정의**합니다:

| 전통 아키텍트 역할 | Agentic 시대 역할 변화 |
|------------------|--------------------|
| 기술 스택 정의 | Agent 분해 구조 정의 + 권한 위임 정책 설계 |
| 아키텍처 문서화 | Prompt 체계 설계 + 평가 기준 명세화 |
| 컴포넌트 설계 | Agent 간 책임(RACI) 및 협업 프로토콜 정의 |
| 설계 리뷰 | 에이전트 생성물에 대한 메타 피드백 시스템 설계 |

즉, **AI의 ‘설계 능력’을 설계하는 사람**이 되어야 합니다.

---

## 🔍 실전: Agentic 설계 흐름 예시

### 시나리오: 새로운 인증 모듈 설계

```
1. Architect: "OAuth2 기반 인증 서비스 설계 시작"
2. Planner Agent: "인증 서버, 토큰 관리자, 클라이언트 SDK 필요"
3. Coder Agent: 각 컴포넌트 코드 스캐폴드 생성
4. Critic Agent: 보안 설계 결함 탐지 → 토큰 저장소 변경 권고
5. Tester Agent: JWT 유효기간 관련 테스트 케이스 생성
```

### 결과: 아키텍트는 초기 선언과 리뷰만으로,  
**Agent들이 구조를 제안하고, 구현하고, 검증까지 진행**

---

## ⚙️ 이를 가능하게 하는 기술 스택

| 구성 요소 | 기술 예시 |
|-----------|-----------|
| LLM Backend | GPT-4o, Claude 3, Mixtral 등 |
| Orchestration | LangGraph, CrewAI, Autogen |
| Memory & Feedback | Vector DB (Weaviate), Redis + LangChain Memory |
| 평가체계 | RAG 기반 평가 + 인간 피드백 Loop (RLHF 기반) |

---

## 🧠 실무에서 고려해야 할 3가지

1. **Agent의 책임과 범위 명확화**  
   - AI가 “어디까지 설계하고, 언제 사람에게 넘길지” 경계 설계 필요  
   - `RACI 모델`을 AI 에이전트에게도 적용하라

2. **비즈니스 제약 조건 포함 설계**  
   - 단가, 유지보수 용이성, 도메인 제약 등 “비기술 요건”을 prompt로 명시해야 설계가 실효성을 갖는다

3. **검증 가능성과 회고 피드백 채널 확보**  
   - 설계 근거, 변경 이유, 대안 평가가 남아야 → 에이전트의 개선과 학습이 가능

---

## ✅ 마무리: 우리는 'AI를 위한 설계'에서 'AI와 함께하는 설계'로 이동 중이다

Agentic AI는 **설계 과정 그 자체를 아키텍처화(Architecting Architecture)**하고 있습니다.

아키텍트는 더 이상 ‘그림 그리는 사람’이 아니라,  
**AI와 함께 문제를 정의하고, 방향을 세우고, 품질을 판단하는 메타 설계자**로 변화하고 있습니다.

---

## 🔍 필자의 통찰

AI가 설계를 보조하는 시대가 아니라, **AI가 스스로 설계 결정을 내리는 시대**가 열리고 있습니다.  
이 변화 속에서 아키텍트는 **통제자에서 조율자, 관리자에서 촉진자(facilitator)**로 이동하고 있습니다.

우리가 해야 할 일은,  
AI가 똑똑해지기를 기다리는 것이 아니라  
**AI가 똑똑해지도록 설계하는 역할**을 스스로 맡는 것입니다.

아키텍트의 미래는 “그리는 사람”이 아닌 “관계를 설계하고 흐름을 설계하는 사람”에게 열려 있습니다.

---

## 🏷️ 추천 태그

`#AgenticAI` `#AI아키텍처` `#ArchitectRole` `#설계자동화` `#LangGraph`  
`#CrewAI` `#GenerativeAI` `#아키텍트의미래` `#AI코파일럿`
