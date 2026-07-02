---
categories:
- news
- ai
date: 2026-07-02 18:45:38 +0900
layout: post
tags:
- awdl
- hephaestus
- "\uC5D0\uC774\uC804\uD2B8"
- ethernet
- ai
- "\uD504\uB860\uD2F0\uC5B4"
- gpt
- claude
- openevidence
- uptodate
- microsoft
- office
- google
- apps
- "\uC18C\uD504\uD2B8\uC6E8\uC5B4"
- "\uB124\uD2B8\uC6CC\uD06C"
- "\uBAA8\uB2C8\uD130\uB9C1"
- macos
- android
title: "\uB85C\uCEEC \uD654\uBA74 \uC2A4\uD2B8\uB9AC\uBC0D\uC758 \uBB38\uC81C\uC810\
  \ \u2014 macOS\uC758 AWDL\uC774 \u539F\u56E0 \uB4F1 5\uAC1C \uAE30\uC0AC"
---

안녕하세요!

이번 digest에는 **5개의 기사**가 실렸습니다.


# 오늘의 기술 뉴스 다이제스트
오늘은 다양한 기술 소식이 쏟아져 나왔습니다. 로컬 화면 스트리밍의 문제점, 오픈소스 에이전트 OS, 수동 Ethernet 탭 만들기, 프론티어 AI의 의료 분야 성과, 내부 사용자용 페이지 배포 플랫폼, 인도 기술 대기업의 AI 오피스 소프트웨어 개발 등 интерес로운 뉴스들을 만나보겠습니다.

## 1. 로컬 화면 스트리밍의 문제점 — macOS의 AWDL이 原因
**요약:** 최근에 iOS/Android 시뮬레이터를 브라우저로 스트리밍하는 셀프 호스팅 도구를 만들었습니다. 하지만 로컬에서 실행하는 것처럼 부드럽게 동작하지 않고, 약 0.5초마다 화면이 잠깐 멈췄다가 다시 따라가는 현상이 발생했습니다. 조사 결과, 이 문제는 macOS의 AWDL(Apple Wireless Direct Link) 때문이었습니다.
**문제점:** 로컬 화면 스트리밍은 실시간으로 화면을 전송해야 하지만, AWDL 때문에 네트워크에 문제가 발생했습니다. 이러한 문제점은 개발자에게 큰 어려움을 주었습니다.
**해결책:** AWDL을 비활성화하거나, 다른 네트워크 설정을 변경해야 합니다. 따라서, 개발자들은 이러한 문제점을 해결하기 위해 노력해야 합니다.
[Link to Article](https://news.hada.io/topic?id=31045)

## 2. 오픈소스 에이전트 OS — Hephaestus
**요약:** 태스크가 생길 때마다 에이전트를 새로 만들고 프롬프트·툴을 다시 세팅하는 게 너무 귀찮아서, 반대 방향의 워크플로우를 만들어 오픈소스로 공개했습니다. Hephaestus는 기존 코딩 에이전트 도구들과는 다르게, 오케스트레이터가 고정되어 있는 것이 아니라, 태스크마다 임시 서브에이전트를 만들어 쓰는 구조입니다.
**중요성:** 기존의 에이전트 도구들은 오케스트레이터가 고정되어 있어 태스크마다 임시 서브에이전트를 만들어야 하지만, Hephaestus는 이러한 구조를 개선하여 더 효율적으로 작업할 수 있습니다.
**기대 효과:** Hephaestus는 개발자들에게 더 효율적인 작업 환경을 제공할 수 있을 것입니다. 따라서, 개발자들은 이러한 도구를 활용하여 더 좋을 결과를 얻을 수 있을 것입니다.
[Link to Article](https://news.hada.io/topic?id=31044)

## 3. 수동 Ethernet 탭 만들기
**요약:** 스마트 TV의 유휴 트래픽을 직접 확인하려고 €39짜리 Throwing Star LAN Tap 대신 RJ45 브레이크아웃 보드와 미니 브레드보드로 수동 Ethernet 탭을 복제했습니다. 이 탭은 라우터와 대상 기기 사이에 인라인으로 들어가 신호를 두 개의 모니터 포트로 복사하며, 전원·소자를 별도로 연결할 수 있습니다.
**중요성:** 기존의 네트워크 모니터링 도구들은 비싸고, 복잡했습니다. 하지만, 수동 Ethernet 탭을 만들면 이러한 문제를 해결할 수 있습니다.
**기대 효과:** 수동 Ethernet 탭을 만들면, 개발자들은 더 효율적으로 네트워크를 모니터링할 수 있을 것입니다. 따라서, 이러한 도구를 활용하여 더 좋을 결과를 얻을 수 있을 것입니다.
[Link to Article](https://news.hada.io/topic?id=31043)

## 4. 프론티어 AI의 의료 분야 성과
**요약:** Nature Medicine에 2026년 6월 12일 게재된 논문 "General-purpose large language models outperform specialized clinical AI tools on medical benchmarks"에서 GPT-5.2, Gemini 3.1 Pro, Claude Opus 4.6 같은 범용 프론티어 모델이 OpenEvidence, UpToDate AI 같은 의료 전용 모델들을 제치고 의료 분야에서 좋은 성과를 보였습니다.
**중요성:** 프론티어 AI는 의료 분야에서 기존의モデル들을 제치고 좋은 성과를 보였습니다. 이러한 결과는 의료 분야에서 AI를 활용할 수 있는 가능성을 보여줍니다.
**기대 효과:** 프론티어 AI는 의료 분야에서 더 좋을 결과를 얻을 수 있을 것입니다. 따라서, 이러한 도구를 활용하여 더 좋을 결과를 얻을 수 있을 것입니다.
[Link to Article](https://news.hada.io/topic?id=31041)

## 5. 인도 기술 대기업의 AI 오피스 소프트웨어 개발
**요약:** 인도 기술 대기업의 창립자는 Microsoft Office, Google Apps를 도전하기 위해 3,000만 달러를 투자했습니다. 이 проект는 AI를 활용하여 오피스 소프트웨어를 개발하는 것입니다.
**중요성:** 인도 기술 대기업의 이 프로젝트는 기존의 오피스 소프트웨어를 도전할 수 있는 가능성을 보여줍니다. 이러한 결과는 더 효율적인 작업 환경을 제공할 수 있을 것입니다.
**기대 효과:** 인도 기술 대기업의 AI 오피스 소프트웨어는 더 좋을 결과를 얻을 수 있을 것입니다. 따라서, 이러한 도구를 활용하여 더 좋을 결과를 얻을 수 있을 것입니다.
[Link to Article](https://techcrunch.com/2026/07/01/indian-tech-tycoon-bets-30m-to-build-an-ai-alternative-to-microsoft-office/)