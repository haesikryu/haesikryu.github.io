---
categories:
- news
- ai
date: 2026-07-23 18:12:25 +0900
layout: post
tags:
- gigatoken
- huggingface
- tiktoken
- simd
- show
- llm
- agent
- hitl
- gemini
- api
- managed
- agents
- anthropic
- claude
- ai
- chatbot
title: "GigaToken - \uC5B8\uC5B4 \uBAA8\uB378 \uD1A0\uD070\uD654\uB97C \uC57D 1,000\uBC30\
  \ \uAC00\uC18D \uB4F1 4\uAC1C \uAE30\uC0AC"
---

안녕하세요!

이번 digest에는 **4개의 기사**가 실렸습니다.


## AI와 기술 뉴스 데일리 디제스트 
AI와 기술 관련 최신 뉴스들을 모아보았습니다. 오늘의 주요 뉴스들입니다.

## 1. GigaToken - 언어 모델 토큰화를 약 1,000배 가속
**요약:**最近 출시된 GigaToken은 다양한 CPU와 널리 쓰이는 토크나이저를 지원하며, 텍스트를 GB/s 단위로 처리하는 Tiktoken 과 HuggingFace Tokenizers 대체 도구입니다. GigaToken은 정규식 엔진이 맡던 사전 토큰화를 SIMD로 최적화하고 분기·스레드 통신·Python 상호작용을 줄이며, 이전에 본 단어의 토큰 매핑을 효율적으로 캐싱합니다.
**중요성:** GigaToken은 언어 모델의 성능을 크게 향상시킬 수 있습니다. 기존의 토크나이저와 비교하여 약 1,000배 가속할 수 있으므로, 자연어 처리와 관련된 다양한 분야에서 큰 영향을 미칠 수 있습니다.
**출처:** [GigaToken - 언어 모델 토큰화를 약 1,000배 가속](https://news.hada.io/topic?id=31724)

## 2. Show GN: 로컬 LLM 에이전트 개발과 테스트를 한곳에서, 툴 검색과 HITL, MCP 연동까지 
**요약:** 국가통계포털(KOSIS)이 공식 MCP 시범サービス를 열어서, 노트북에서 도는 9B 로컬 모델에 붙여봤습니다. API 키 없이 합계출산율을 찾아 차트를 그리고, CSV로 저장하려는 순간에는 승인 창이 뜹니다. 파일 쓰기처럼 사람이 승인(HITL)해야만 하는 작업은 UI에서 사람이 확인하고 승인하도록 해뒀기 때문입니다.
**중요성:** 로컬 LLM 에이전트의 개발과 테스트를 한곳에서 할 수 있게 되었습니다. 또한, 툴 검색과 HITL, MCP 연동까지 가능해져서 개발자의 효율성을 크게提高시킬 수 있습니다.
**출처:** [Show GN: 로컬 LLM 에이전트 개발과 테스트를 한곳에서, 툴 검색과 HITL, MCP 연동까지](https://news.hada.io/topic?id=31719)

## 3. Expanding Managed Agents in Gemini API:  background tasks, remote MCP and more
**요약:** Managed agents feature bundle launch
**중요성:** Gemini API의 Managed Agents 기능이 확장되었습니다. 이제 배경 작업, 원격 MCP 및 더 많은 기능을 사용할 수 있습니다. 이 기능은 개발자들이 더욱 효율적으로 작업할 수 있도록 도와줍니다.
**출처:** [Expanding Managed Agents in Gemini API:  background tasks, remote MCP and more](https://blog.google/innovation-and-ai/technology/developers-tools/expanding-managed-agents-gemini-api/)

## 4. Agentic orchestration: Enterprise AI organizations have a deployment problem, not a platform problem — and most are calling chatbots agents
**요약:** Enterprise AI 조직에서는 배포 문제가 아니라 플랫폼 문제를 가지고 있습니다. 대부분의องค織은 chatbot을 에이전트라고 부릅니다.
**중요성:** Enterprise AI 조직에서는 에이전트 오케스트레이션을 통해 배포 문제를 해결할 수 있습니다. Anthropic의 Claude가 에이전트 오케스트레이션을 위한 주요 플랫폼으로 떠올랐습니다.
**출처:** [Agentic orchestration: Enterprise AI organizations have a deployment problem, not a platform problem — and most are calling chatbots agents](https://venturebeat.com/ai/agentic-orchestration-enterprise-ai-organizations-have-a-deployment-problem-not-a-platform-problem)