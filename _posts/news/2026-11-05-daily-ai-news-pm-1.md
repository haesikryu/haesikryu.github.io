---
categories:
- news
- ai
date: 2026-11-05 23:55:22 +0900
layout: post
tags:
- qualcomm
- ai
- tops
- tflops
- pcie
- llm
- nvidia
- nemotron
- agent
- openai
- policy
- blueprint
- supermicro
- gpu
title: "Qualcomm Cloud AI\u202F100 Ultra \u2013 150W AI \uAC00\uC18D\uAE30 \uCE74\uB4DC\
  \uAC00 \uACF5\uAC1C \uB4F1 5\uAC1C \uAE30\uC0AC (2)"
---

안녕하세요!

이번 digest에는 **5개의 기사**가 실렸습니다.


## 1. Qualcomm Cloud AI 100 Ultra – 150W AI 가속기 카드가 공개
**Summary:** Qualcomm이 새롭게 발표한 Cloud AI 100 Ultra는 128 GB ECC 메모리와 548 GB/s 메모리 대역폭을 갖춘 150 W 전력 소모 AI 가속기 카드다. 64개의 AI 코어와 최대 870 TOPS(INT8)·288 TFLOPS(FP16) 연산 성능을 제공하며, PCIe Gen4 16레인 인터페이스로 서버에 연결된다. 생성형 AI와 대규모 언어 모델(LLM) 추론을 위해 설계된 이 카드가 목표로 하는 것은 높은 성능을 유지하면서 전력 효율과 비용을 최적화하는 점이다.  

**Why it matters:** 대규모 언어 모델이 실시간 서비스에 점점 더 많이 사용되면서, 추론 단계에서의 비용과 전력 문제가 심각해졌다. Cloud AI 100 Ultra는 이러한 문제를 완화시킬 수 있는 고성능 저전력 솔루션을 제공한다. 특히 128 GB 메모리와 초고속 대역폭은 멀티모델 배포와 복잡한 파이프라인을 한 카드에서 실행할 수 있게 해, 클라우드 서비스 제공자가 인프라 비용을 크게 절감할 수 있다.  

**Source:** [Link to Article](https://news.hada.io/topic?id=36652&utm_source=geeknews&utm_medium=rss&utm_campaign=news)

## 2. Box, Nvidia Nemotron 기반 에이전트‑퍼스트 검색 시스템 도입
**Summary:** 클라우드 스토리지 기업 Box가 Nvidia의 최신 대규모 언어 모델인 Nemotron을 활용한 새로운 에이전트‑퍼스트 콘텐츠 검색 시스템을 공개했다. 이 시스템은 기존 검색 대비 4배 빠른 응답 속도와 20 % 적은 오류율, 그리고 토큰 사용량을 90 % 절감한다는 평가를 받고 있다. Nemotron 모델을 기반으로 한 AI 에이전트가 사용자의 질의에 맞춰 문서를 선별·요약해 제공한다.  

**Why it matters:** 기업 데이터가 폭발적으로 늘어나면서 효율적인 검색과 정보 추출이 핵심 과제로 떠올랐다. Box는 고성능 LLM을 직접 서비스에 통합함으로써 사용자 경험을 크게 향상시키고, 비용 효율적인 토큰 사용을 실현했다. 이는 다른 SaaS 기업들에게도 AI 모델을 서비스 레이어에 직접 삽입하는 새로운 패러다임을 제시한다.  

**Source:** [Link to Article](https://techcrunch.com/2026/11/05/box-taps-nvidias-nemotron-for-new-agent-first-content-retrieval-system/)

## 3. OpenAI, 책임 있는 AI 인프라를 위한 새로운 표준 발표
**Summary:** OpenAI가 ‘National Community Compact and Compute Campus Policy Blueprint’를 공개했다. 이 정책은 로컬 컴퓨팅 리소스를 보호하고, 지역 일자리 창출을 지원하며, AI 인프라 구축 시 책임 있는 운영 원칙을 제시한다. 주요 내용으로는 데이터 센터 위치 선정 시 지역 사회와의 협의, 에너지 효율 목표 설정, 그리고 투명한 리소스 사용 보고가 포함된다.  

**Why it matters:** AI 모델이 점점 더 큰 규모와 연산량을 요구함에 따라, 인프라 구축이 환경·사회에 미치는 영향이 커지고 있다. OpenAI의 정책은 기업들이 단순히 성능에만 집중하지 않고, 지속 가능하고 윤리적인 AI 생태계를 조성하도록 가이드한다. 이는 향후 AI 규제와 투자 판단에 중요한 기준이 될 가능성이 크다.  

**Source:** [Link to Article](https://openai.com/index/setting-new-standard-responsible-ai-infrastructure)

## 4. Supermicro, 장기 컨텍스트 AI를 위한 공유 KV 캐시 스토리지 출시
**Summary:** Supermicro가 IBM·NVIDIA와 공동으로 장기 컨텍스트 AI 작업을 위한 KV 캐시 스토리지 솔루션을 발표했다. 이 시스템은 GPU 메모리를 넘어 130 000 토큰 프롬프트에 대해 최초 토큰 생성 속도를 56배 가속한다. AMD EPYC 9005 프로세서 기반의 플래시 스토리지 서버와 IBM Storage Scale 소프트웨어, NVIDIA Dynamo 프레임워크가 결합돼 대용량 컨텍스트 데이터를 빠르게 재사용할 수 있다.  

**Why it matters:** 현재 많은 생성형 AI 모델이 수천 토큰 제한에 걸려 긴 문서나 복잡한 대화 흐름을 처리하기 어려운 상황이다. 공유 KV 캐시 스토리지는 이러한 제한을 완화하고, 모델이 이전 대화나 문서를 메모리 외부에서 효율적으로 참조하도록 해, 더 자연스러운 장기 기억 능력을 제공한다. 이는 기업용 AI 어플리케이션의 생산성을 크게 높일 전망이다.  

**Source:** [Link to Article](https://www.unite.ai/supermicro-launches-shared-kv-cache-storage-for-long-context-ai/)

## 5. Aina의 스마트 링, AI 에이전트와 대화 가능한 새로운 웨어러블
**Summary:** Aina가 출시한 스마트 링은 화면, 조이스틱, 마이크를 내장해 사용자가 AI 에이전트와 직접 대화할 수 있게 설계되었다. 링을 통해 전화 통화, 메모 기록, 그리고 Mac에서의 음성 명령이 가능하다. 손가락에 착용하는 형태로 언제 어디서나 AI와 인터랙션할 수 있는 새로운 사용자 경험을 제공한다.  

**Why it matters:** 웨어러블 디바이스가 점점 더 많은 기능을 탑재하면서, AI와의 자연스러운 인터랙션이 핵심 경쟁 요소가 되고 있다. Aina의 링은 화면 기반 디바이스와 달리 손에 착용하는 형태로 실시간 음성 인터페이스를 제공, 업무 효율성과 개인 생산성을 높인다. 또한 AI 에이전트가 일상 생활에 깊숙이 스며들 수 있는 사례를 보여준다.  

**Source:** [Link to Article](https://techcrunch.com/2026/11/05/ainas-smart-ring-has-a-screen-a-joystick-and-a-mic-so-you-can-talk-to-ai-agents/)