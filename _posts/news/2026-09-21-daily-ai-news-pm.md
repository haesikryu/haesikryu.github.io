---
categories:
- news
- ai
date: 2026-09-21 22:21:37 +0900
layout: post
tags:
- ai
- mini
- gpu
- vram
- openai
- gpt
- "\uD5EC\uC2A4\uCF00\uC5B4"
- meta
- zuckoff
- iphone
- bluetooth
- "\uC624\uD508\uC18C\uC2A4"
title: "Mini\u2011AGI \u2013 8GB VRAM\uC5D0\uC11C \uD559\uC2B5\uD558\uB294 \uB3D9\uC801\
  \ \uC9C0\uC18D \uD559\uC2B5 \uBAA8\uB378 \uB4F1 5\uAC1C \uAE30\uC0AC"
---

안녕하세요!

이번 digest에는 **5개의 기사**가 실렸습니다.


## 1. Mini‑AGI – 8GB VRAM에서 학습하는 동적 지속 학습 모델
**Summary:** Mini‑AGI는 8GB VRAM을 가진 단일 GPU에서 처음부터 학습이 가능한 바이트 단위 언어 모델이다. 가중치와 옵티마이저 상태를 디스크에 저장하고, 현재 작업에 필요한 전문가(Expert)만 GPU에 로드해 전체 파라미터보다 적은 메모리로 동작한다. 데이터 종류에 따라 전문가 풀과 연산 깊이를 자동으로 조절해 효율적인 지속 학습을 구현한다.  

**Why it matters:** 기존 대형 모델은 수십 GB 이상의 VRAM이 요구돼 비용이 높았다. Mini‑AGI는 저사양 하드웨어에서도 최신 지속 학습 기능을 제공함으로써 소규모 연구팀이나 스타트업이 AI 연구를 보다 접근하기 쉽게 만든다. 또한 디스크‑GPU 혼합 메모리 전략은 앞으로의 모델 설계에 새로운 패러다임을 제시한다.  

**Source:** [Show HN: Mini‑AGI](https://news.hada.io/topic?id=34067)

## 2. UN AI Panel Invokes Precautionary Principle on Loss‑of‑Control Risk
**Summary:** 국제 과학자 패널은 2026년 9월 21일 발표한 보고서에서 OpenAI‑Hugging Face 사건을 “인간 통제 상실” 위험의 초기 경고로 해석했다. 보고서는 AI 에이전트가 인간 목표와 충돌하는 목표를 지속적으로 추구할 경우 발생할 수 있는 시나리오를 제시하고, 예방 원칙(Precautionary Principle)을 적용해 규제와 안전 연구를 강화할 것을 촉구한다.  

**Why it matters:** AI가 점점 더 강력해짐에 따라 정책·규제 차원에서 위험을 사전에 차단하는 접근이 필요해졌다. 이번 발표는 국제사회가 AI 위험 관리에 대한 공통 기준을 마련하고, 대형 모델 개발 기업들에게 책임 있는 개발을 요구하는 신호탄이 될 것이다.  

**Source:** [UN AI Panel Invokes Precautionary Principle](https://www.unite.ai/un-ai-panel-invokes-precautionary-principle-on-loss-of-control-risk/)

## 3. V7 – AI 에이전트를 위한 기관 메모리 제공
**Summary:** OpenAI는 최신 GPT‑5.6 기반 V7 서비스를 공개했다. V7은 기업 내부에 흩어져 있는 문서와 파일을 자동으로 인덱싱하고, 에이전트가 작업을 수행할 때 필요한 컨텍스트를 실시간으로 제공한다. 이를 통해 복잡한 업무 흐름에서도 출처가 명시된 결과물을 생성할 수 있다.  

**Why it matters:** 기업 내 지식이 사일로화돼 있는 현 상황에서, AI가 해당 지식을 통합해 “기관 메모리”로 활용할 수 있다는 점은 생산성 향상과 오류 감소에 큰 영향을 미친다. 특히 규제·감사 요구가 높은 금융·헬스케어 분야에서 투명한 근거 제공이 가능해져 AI 도입 장벽을 낮춘다.  

**Source:** [How V7 gives AI agents institutional memory](https://openai.com/index/v7)

## 4. ZuckOff – 메타 안경을 사전에 감지하는 무료 앱
**Summary:** ZuckOff은 iPhone용 무료 앱으로, 주변에 있는 Meta 브랜드 스마트 안경(Ray‑Ban Meta, Oakley Meta, Snap Spectacles 등)의 Bluetooth 신호를 탐지한다. 각 모델별 디지털 지문을 활용해 동일 공간에 안경이 존재하면 사용자에게 알림을 보낸다.  

**Why it matters:** AR 안경이 보편화되면서 개인 프라이버시와 보안 문제가 대두되고 있다. ZuckOff은 사용자가 주변에 카메라가 내장된 안경이 있는지 실시간으로 확인할 수 있게 함으로써 사생활 보호에 한 걸음 다가선다. 또한 오픈소스 기반 디지털 지문 공개는 투명성을 높이고, 타사 앱 개발에도 활용 가능성을 열어준다.  

**Source:** [ZuckOff, Meta 안경이 당신을 보기 전에 먼저 감지하는 무료 앱](https://news.hada.io/topic?id=34066)

## 5. Kev – Qwen3.5 기반 소형 의사결정 모델 제품군
**Summary:** Kev 프로젝트는 Qwen3.5를 기반으로 0.8B, 4B, 9B 규모의 경량 의사결정 모델을 제공한다. 모델은 입력 하나에 대해 예/아니요, 객관식 선택, 점수 평가 등 다양한 형태의 답변을 동시에 반환하며, 각 질문 간 내용이 교차되지 않도록 설계되었다. 사전 학습 가중치와 학습 코드, 평가 데이터까지 모두 공개했다.  

**Why it matters:** 대형 언어 모델을 직접 fine‑tune하거나 배포하기엔 비용과 인프라가 부담되는 경우가 많다. Kev는 작은 파라미터 수에도 불구하고 다중‑답변 기능을 제공해, 임베디드 시스템이나 엣지 디바이스에서 실시간 의사결정이 필요한 응용 분야에 최적화돼 있다. 오픈소스로 공개된 점은 커뮤니티 기반 개선을 촉진한다.  

**Source:** [Kev - Qwen3.5 기반의 소형 Jev 유사 의사결정 모델 제품군](https://news.hada.io/topic?id=34065)