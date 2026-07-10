---
categories:
- news
- ai
date: 2026-07-10 19:08:45 +0900
layout: post
tags:
- ai
- rust
- postgres
- mitchell
- hashimoto
- ghostty
- "\uC624\uD508\uC18C\uC2A4"
- deutsche
- telekom
- openai
- "\uB370\uC774\uD130\uBCA0\uC774\uC2A4"
- "\uB124\uD2B8\uC6CC\uD06C"
title: "\uB290\uB9B0 \uCEF4\uD4E8\uD130\uC5D0\uC11C GLM 5.2 \uC2E4\uD589\uD558\uAE30\
  \ \uB4F1 4\uAC1C \uAE30\uC0AC"
---

안녕하세요!

이번 digest에는 **4개의 기사**가 실렸습니다.


## AI와 기술 뉴스 데일리 다이제스트
오늘은 최근의 주요 AI와 기술 소식들을 다룹니다. 
### 1. 느린 컴퓨터에서 GLM 5.2 실행하기
#### 요약
colibrì는 GLM-5.2 744B MoE를 소비자용 머신의 약 25GB RAM에서 실행하도록 만든 순수 C 엔진입니다. 또한, 라우팅된 Expert를 디스크에서 스트리밍하여 GPU 없이 동작합니다. 핵심 구조는 dense 부분 약 17B 파라미터를 int4로 RAM에 상주시켜 9.9GB를 사용합니다.
#### 왜 중요할까
이 기술은 큰 규모의 AI 모델을 일반 사용자들의 컴퓨터에서 실행할 수 있게 해주는 것을 의미합니다. 이는 많은 사람들이 접근할 수 있는 수준의 하드웨어를 사용하여 고성능 AI 모델을 사용할 수 있다는 것을 뜻합니다.
#### 소스
[Show HN: 느린 컴퓨터에서 GLM 5.2 실행하기](https://news.hada.io/topic?id=31297)

### 2. Postgres를 Rust로 재작성
#### 요약
pgrust는 Postgres 18.3 호환을 목표로 하는 Rust 재작성 프로젝트입니다. 이 프로젝트는 46,000개 이상의 회귀 쿼리에서 Postgres의 예상 출력과 일치합니다. 기존 Postgres 18.3 데이터 디렉터리에서 부팅할 수 있는 디스크 호환성을 갖추고 있습니다.
#### 왜 중요할까
Postgres를 Rust로 재작성하는 것은 데이터베이스 시스템의 안정성과 성능을 개선할 수 있는 기회를 제공합니다. Rust의 메모리 안전성과 성능 특성으로 인해 더 신뢰할 수 있는 데이터베이스 시스템을 구축할 수 있습니다.
#### 소스
[Postgres를 Rust로 재작성, 이제 Postgres 회귀 테스트 100% 통과](https://news.hada.io/topic?id=31296)

### 3. 미첼 하시모토 인터뷰: Ghostty, Zig, 오픈소스 유지보수
#### 요약
Mitchell Hashimoto는 Vagrant, Terraform, Vault 이후 Ghostty와 Vouch를 만들며, 터미널, Zig, 오픈소스 유지보수, 제품 품질에 대한 자신의 기준을 정리합니다. Ghostty는 GPU 프로그래밍, 데스크톱/단일 노드 시스템 프로그래밍, Zig를 익히려는 개인 프로젝트에서 출발하였습니다.
#### 왜 중요할까
ミ첼 하시모토의 인터뷰는 오픈소스 프로젝트와 소프트웨어 개발에 대한 깊은 통찰력을 제공합니다. Ghostty와 Zig를 포함한 그의 프로젝트는 새로운 기술과 프로그래밍 언어의 도입을 보여줍니다.
#### 소스
[미첼 하시모토 인터뷰: Ghostty, Zig, 오픈소스 유지보수](https://news.hada.io/topic?id=31294)

### 4. How Deutsche Telekom is rewiring telecommunications with AI
#### 요약
Deutsche Telekom은 OpenAI를 사용하여 고객 서비스, 직원 워크플로우, 네트워크 연산, 그리고 음성의 미래를 변革적으로 바꾸고 있습니다. 
#### 왜 중요할까
이 프로젝트는 전통적인 TELECOM 업계에서 AI 기술을 어떻게 활용할 수 있는지를 보여주는 사례입니다.ustomer 서비스의 자동화와 네트워크의 최적화 등 다양한 분야에서 AI의 잠재력을 실현하고 있습니다.
#### 소스
[How Deutsche Telekom is rewiring telecommunications with AI](https://openai.com/index/deutsche-telekom)