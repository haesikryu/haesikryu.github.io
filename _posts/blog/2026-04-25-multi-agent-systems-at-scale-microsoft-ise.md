---
layout: post
title: "대규모 멀티에이전트 시스템을 위한 패턴: Microsoft ISE 블로그 요약"
date: 2026-04-25 14:00:00 +0900
categories: [Engineering, AI]
tags:
  [
    multi-agent-systems,
    microsoft-ise,
    semantic-search,
    agent-orchestration,
    llm,
    azure-ai-search,
    semantic-kernel,
    supervisor-pattern,
    factory-pattern,
  ]
author: Ryu
image:
  path: /assets/img/blog/group_chat_orchestration.webp
  alt: 시맨틱 검색·온보딩·팩토리·슈퍼바이저를 묶은 그룹 채팅 오케스트레이션 개념도 (Microsoft ISE 블로그)
---

# 대규모 멀티에이전트 시스템을 위한 패턴: Microsoft ISE 블로그 요약

> 본 글은 Microsoft ISE Developer Blog의 [Patterns for Building a Scalable Multi-Agent System](https://devblogs.microsoft.com/ise/multi-agent-systems-at-scale/) (2025년 11월)을 읽고, 실무 아키텍처 관점에서 정리한 메모입니다. 원문의 사례·도식·구현 세부는 링크를 참고하세요.

---

## 들어가며

LLM을 쓰는 **멀티에이전트** 시스템은 프로토타입에서는 잘 돌아가도, 에이전트가 수십~수백 개로 늘면 **선택 정확도·지연·토큰 비용·응답 일관성**이 동시에 깨지기 쉽습니다. 위 글은 전자상거래 음성 어시스턴트(주문 조회, 반품, 추천, FAQ 등)를 가정하고, **런타임에 관련 에이전트만 골라 쓰는 동적 설계**를 중심으로 패턴을 정리합니다.

원문이 강조하는 요구사항은 네 가지입니다.

1. **정확한 에이전트 선택** — 질의에 맞는 전문 에이전트만 호출
2. **LLM 사용 최적화** — 에이전트 수가 늘어도 지연·비용 통제
3. **효율적 오케스트레이션** — 핸드오프와 최종 응답의 일관성
4. **확장성** — 새 에이전트 추가 시 성능 저하 최소화

---

## 문제 정의

사용자는 무엇이든, 어떤 순서로든 물을 수 있습니다. **매 요청마다 시스템에 정의된 모든 에이전트를 컨텍스트에 넣는 방식**은 토큰·비용·지연이 기하급수적으로 나빠져 현실적이지 않습니다. 대신 **질의 의도에 맞게 에이전트 풀을 동적으로 좁히고**, 범위 밖 질문은 우아하게 처리해야 합니다. 멀티턴으로 “어느 주문 말씀이신가요?” 같은 **명확화(clarification)** 가 필요한 경우도 설계에 포함됩니다.

---

## 솔루션 설계: 네 가지 과제와 패턴

### 1) 에이전트 우주를 좁히기 — 시맨틱 캐시·검색 기반 검색

모든 에이전트를 매번 참여시키지 않고, **에이전트 이름 + 다양한 예시 발화**를 임베딩해 벡터 인덱스(글에서는 Azure AI Search)에 올립니다. 사용자 질의를 같은 임베딩 모델로 벡터화한 뒤 유사도로 상위 k개 에이전트만 고릅니다. 예시로는 “Track my recent order” → 주문 추적 에이전트처럼 매핑됩니다. 다국어는 `text-embedding-3-small` 같은 **사전 학습 임베딩**으로 처리 가능하다고 설명합니다.

**팁:** 에이전트당 **서로 다른 예시 발화를 최소 5개 이상** 두는 것이 검색 정확도에 의미 있다고 합니다.

![시맨틱 캐시 기반 에이전트 검색](/assets/img/blog/semantic_cache_agent_retrieval.webp)
*그림: 질의 임베딩과 예시 발화·에이전트 메타데이터를 매칭해 후보를 좁히는 흐름. [원문](https://devblogs.microsoft.com/ise/multi-agent-systems-at-scale/) · Microsoft*

### 2) 에이전트 온보딩 표준화

에이전트가 많아질수록 **반복 가능한 온보딩**이 필요합니다. 글에서는 두 가지를 제안합니다.

- **코드 기반** — 선택한 프레임워크 언어로 에이전트 정의 (예: Semantic Kernel 기반 Python)
- **템플릿 기반** — YAML 등으로 선언적으로 메타데이터·프롬프트만 관리. 단순 에이전트나 서드파티 연계에 유리

온보딩은 **SOP(표준 작업 절차)** 로 문서화하고, 해당 에이전트용 **시맨틱 캐시에 임베딩을 추가하는 단계**를 명시하라고 강조합니다.

**코드 기반** — Semantic Kernel 등으로 에이전트를 정의하는 예시 도식입니다.

![Python 기반 에이전트 정의](/assets/img/blog/python_based_agent.webp)

**템플릿 기반** — YAML로 메타데이터·프롬프트만 선언하는 예시입니다.

![YAML 템플릿 에이전트](/assets/img/blog/template_based_agent.webp)

*위 두 도식 출처: [Microsoft ISE — Scalable Multi-Agent System](https://devblogs.microsoft.com/ise/multi-agent-systems-at-scale/) · Microsoft*

### 3) 에이전트 객체 생성 — Factory 패턴

정의가 코드와 YAML 템플릿에 **동시에 존재할 수** 있으므로, 에이전트 이름을 받아 인스턴스를 만드는 **`AgentFactory`** 를 두는 방식이 제안됩니다. 예를 들어 `X_Agent.py`와 `x_agent.yaml`이 모두 있을 때 **템플릿을 코드보다 우선**하게 하면, 코드 수정 없이 YAML로 동작을 덮어쓰기 쉽습니다.

![AgentFactory로 코드·템플릿 정의에서 인스턴스 생성](/assets/img/blog/agent_factory_xl.webp)
*그림: 에이전트 이름으로 팩토리가 구현체를 선택·생성하는 구조. [원문](https://devblogs.microsoft.com/ise/multi-agent-systems-at-scale/) · Microsoft*

### 4) 그룹 채팅 오케스트레이션 — SupervisorAgent

시맨틱 검색으로 후보는 좁혔지만, **한 질문에 여러 의도**가 섞이면 개별 에이전트 답을 나열하는 것만으로는 부족합니다. **순서**(“X이면 Y해라”에서 X 먼저)와 **하나의 응답으로 요약·정합**이 필요합니다.

이를 위해 중앙 **`SupervisorAgent`** 가 의도를 파싱하고, 다음 핸드오프를 고르는 **선택 전략(selection)**, 반복을 끝내는 **종료 전략(termination)** 을 관리하는 루프를 돌립니다. Semantic Kernel Group Chat처럼 프레임워크가 selection/termination 훅을 주면 그걸 쓰고, 없으면 **슈퍼바이저 LLM 지시문에 동등한 로직을 인코딩**하면 된다고 합니다.

![SupervisorAgent가 그룹 채팅에서 선택·종료 전략을 관리](/assets/img/blog/supervisor_agent_xl.webp)
*그림: 중앙 슈퍼바이저가 전문 에이전트와의 대화를 조율하는 모습. [원문](https://devblogs.microsoft.com/ise/multi-agent-systems-at-scale/) · Microsoft*

---

## 한데 모으면

1. 시맨틱 캐시 기반 검색으로 **후보 에이전트만** 고른다.  
2. 코드·템플릿 온보딩으로 **확장 절차**를 통일한다.  
3. **Factory**로 런타임 생성을 추상화한다.  
4. **Supervisor**로 다중 의도·순서·최종 응답을 정리한다.

아래는 위 네 구성요소를 한 장으로 묶은 **전체 오케스트레이션** 개념도입니다.

![시맨틱 검색·온보딩·AgentFactory·Supervisor를 연결한 아키텍처](/assets/img/blog/group_chat_orchestration.webp)
*그림: 동적 에이전트 선택부터 그룹 채팅까지의 통합 뷰. [원문](https://devblogs.microsoft.com/ise/multi-agent-systems-at-scale/) · Microsoft*

---

## 최적화 아이디어

- **단일 의도 빠른 경로:** 시맨틱 캐시 신뢰도가 매우 높고 에이전트가 하나면, Supervisor를 거치지 않고 **해당 에이전트만 직접 호출**
- **수다(chattiness) 제어:** 에이전트 간 대화가 루프에 빠지지 않도록 `max_iterations` 등으로 상한 설정 (예: 사용자 질의당 의도 2개 가정 시 약 3회 등)
- **LLM 파라미터:** 일관성을 위해 `temperature`·`top_p`를 낮게, `max_completion_tokens`로 장황함 억제

---

## 평가와 반복

컴포넌트별·E2E 평가를 하고, 에이전트마다 **골든 데이터셋**(호출 기대·응답 기준)을 둡니다. `recall@k`, `precision@k`, BLEU, relevance 등으로 측정합니다. 새 에이전트는 **서로 겹치지 않는 설명과 예시 발화**를 제공해 혼선을 줄이라고 합니다.

---

## 마치며

이 글의 메시지는 “멀티에이전트 = 정적 워크플로 고정”이 아니라, **의도에 따라 에이전트를 조합하는 동적 시스템**으로 가져가되, **검색·온보딩·팩토리·슈퍼바이저**로 복잡도를 나누라는 것입니다. 음성 비서 사례를 넘어, **의도 기반으로 전문 워크플로를 조합하는 엔터프라이즈 AI**에도 그대로 이식 가능한 패턴이라고 정리할 수 있습니다.

이전에 이 블로그에서 다룬 [Multi-Agent 시스템의 과학적 스케일링](/posts/towards-science-of-scaling-agent-systems/)은 실험·수치 중심이었다면, 이번 Microsoft 글은 **검색·팩토리·오케스트레이션** 같은 **운영 아키텍처 레시피**에 가깝습니다. 둘을 같이 보면 “언제 몇 개의 에이전트를 쓸지”와 “런타임에 어떻게 고르고 묶을지”를 함께 설계하는 데 도움이 됩니다.

### 참고

- [Patterns for Building a Scalable Multi-Agent System — Microsoft ISE Developer Blog](https://devblogs.microsoft.com/ise/multi-agent-systems-at-scale/)
- 원문 하단: [Semantic Kernel 문서](https://learn.microsoft.com/en-us/semantic-kernel/), [Azure AI Search](https://learn.microsoft.com/en-us/azure/search/), [OpenAI 모델 파라미터](https://platform.openai.com/docs/api-reference/chat/create), [Microsoft Agent Framework](https://learn.microsoft.com/en-us/agent-framework/) 링크 안내
- 본문에 넣은 도식 이미지는 위 원문 게시물에 실린 자료를 그대로 인용·저장한 것이며, 저작권은 Microsoft에 있습니다.
