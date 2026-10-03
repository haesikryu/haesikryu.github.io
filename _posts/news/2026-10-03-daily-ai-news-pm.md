---
categories:
- news
- ai
date: 2026-10-03 21:02:57 +0900
layout: post
tags:
- apple
- macos
- google
- ai
- economy
- claude-code
- codex
- alps
- writer
- adam
- post
- checkout
- frank
- wiles
- dropbox
title: "Apple, macOS \u2018\uC804\uCCB4 \uB514\uC2A4\uD06C \uC811\uADFC\u2019 \uAD8C\
  \uD55C \uD1B5\uC81C \uAC15\uD654 \uC608\uACE0 \uB4F1 5\uAC1C \uAE30\uC0AC"
---

안녕하세요!

이번 digest에는 **5개의 기사**가 실렸습니다.


## 1. Apple, macOS ‘전체 디스크 접근’ 권한 통제 강화 예고  
**Summary:** Apple은 macOS에서 앱에 전체 디스크 접근 권한을 부여할 때, 사용자가 위험성을 충분히 이해하고 명시적으로 허용하도록 하는 추가 통제 장치를 도입할 계획이라고 발표했습니다. 이 권한은 백업 앱 등 시스템 수준에서 동작하는 프로그램이 사용자 데이터에 자유롭게 접근할 수 있게 해 주지만, 악성 코드가 이를 악용하면 개인 정보가 크게 유출될 위험이 있습니다. Apple은 권한 부여 화면에 상세 설명을 제공하고, 사용자가 선택을 재검토할 수 있는 옵션을 추가할 예정입니다.  

**Why it matters:** 전체 디스크 접근은 macOS 보안 모델의 핵심 허점 중 하나였으며, 이번 업데이트로 사용자 프라이버시 보호가 한층 강화됩니다. 특히 기업 환경에서 중요한 데이터가 저장된 노트북을 보호하려는 IT 관리자들에게 큰 의미가 있으며, 향후 macOS 생태계 전체에 보안 베스트 프랙티스가 확대될 것으로 기대됩니다.  

**Source:** [Apple, macOS ‘전체 디스크 접근’ 권한 통제 강화 예고](https://news.hada.io/topic?id=34706)

## 2. Google AI & Economy 팀에 신규 전문가 영입  
**Summary:** Google은 인공지능과 경제 연구를 담당하는 “AI & Economy Research Program”에 새로운 전문가들을 합류시켰다고 공식 블로그에 알렸습니다. 이들은 AI 기술이 노동 시장, 생산성, 소득 불평등 등에 미치는 영향을 정량적으로 분석하고 정책 제안을 만드는 역할을 맡게 됩니다. 발표 자료에는 새로운 연구 방향과 현재 진행 중인 프로젝트 목록이 포함되어 있습니다.  

**Why it matters:** AI가 경제 전반에 미치는 파급 효과는 아직 충분히 이해되지 않은 부분이 많습니다. Google이 이 분야에 인재를 집중함으로써 보다 체계적인 데이터와 분석이 가능해지고, 기업·정부가 AI 도입 전략을 수립하는 데 중요한 인사이트를 제공받게 됩니다. 이는 AI 정책 논의와 사회적 합의를 형성하는 데 핵심적인 역할을 할 전망입니다.  

**Source:** [New experts join Google’s AI & Economy team](https://blog.google/innovation-and-ai/technology/ai/expanding-ai-economy-research-bench/)

## 3. ALPS Writer·ADR Writer: Claude Code와 Codex용 설계 관리 플러그인 오픈소스 공개  
**Summary:** 개발자들이 Claude Code와 Codex 같은 대형 언어 모델을 활용해 제품 요구사항 문서(PRD)와 설계 결정 기록(ADR)을 자동으로 작성할 수 있도록 돕는 두 개의 플러그인, ALPS Writer와 ADR Writer가 MIT 라이선스로 공개되었습니다. ALPS Writer는 질문‑답변 형식으로 PRD 초안을 만들고, ADR Writer는 설계 선택 이유와 대안들을 체계적으로 정리합니다. GitHub 저장소에는 설치 방법과 사용 예시가 상세히 안내돼 있습니다.  

**Why it matters:** AI 코딩 도구를 사용할 때 가장 큰 고민은 생성된 코드와 설계가 프로젝트 목표에 부합하는지 검증하는 것입니다. 이 플러그인들은 AI가 만든 결과물을 문서화하고 추적할 수 있게 해 줌으로써, 개발 프로세스의 투명성과 유지 보수성을 크게 높입니다. 오픈소스로 제공되니 다양한 팀이 자유롭게 커스터마이징해 활용할 수 있다는 점도 큰 장점입니다.  

**Source:** [Show GN: ALPS Writer·ADR Writer - Claude Code와 Codex용 제품 명세·설계 결정 관리 플러그인](https://news.hada.io/topic?id=34705)

## 4. SGD vs. Adam: 머신러닝 최적화 알고리즘 실전 비교 가이드  
**Summary:** Unite.ai는 대표적인 두 최적화 알고리즘인 Stochastic Gradient Descent(SGD)와 Adam에 대해 메커니즘, 장단점, 실제 적용 시 고려해야 할 설정들을 상세히 설명하는 가이드를 발표했습니다. SGD는 학습률 스케줄링과 모멘텀을 통해 안정적인 수렴을 도모하고, Adam은 각 파라미터마다 적응형 학습률을 적용해 빠른 초기 수렴을 특징으로 합니다. 기사에서는 벤치마크 실험 결과와 함께 언제 어떤 알고리즘을 선택해야 하는지 실용적인 조언을 제공합니다.  

**Why it matters:** 최적화 알고리즘 선택은 모델 학습 효율과 최종 성능에 직접적인 영향을 미칩니다. 특히 대규모 모델을 훈련할 때는 학습 비용과 시간 절감이 중요하므로, 이 가이드는 연구자와 엔지니어가 상황에 맞는 알고리즘을 판단하는 데 큰 도움이 됩니다. 또한 최신 트렌드인 학습률 워밍업, 레귤러리제이션과 같은 기법과의 조합도 다루어 실전 적용성을 높였습니다.  

**Source:** [SGD vs. Adam: How Machine Learning Optimizers Actually Learn](https://www.unite.ai/sgd-vs-adam-how-machine-learning-optimizers-actually-learn/)

## 5. Git post-checkout 훅을 이용한 자격 증명 탈취 시도 경고  
**Summary:** 한 교육 기술 웹앱 개발 의뢰를 가장한 공격자가 GitHub 사용자 Frank Wiles의 노트북에 악의적인 post-checkout 훅 코드를 삽입해 자격 증명을 탈취하려는 시도가 포착되었습니다. 공격자는 미팅 전 프로젝트 자료 검토와 NDA 서명을 요구한 뒤, Dropbox 링크를 통해 악성 코드를 전달했습니다. 이 훅은 Git checkout이 발생할 때마다 자동으로 실행돼 사용자 인증 정보를 외부 서버로 전송하도록 설계되었습니다.  

**Why it matters:** 개발 환경에 깊숙이 침투하는 공격은 탐지가 어렵고 피해 규모가 클 수 있습니다. 특히 Git 훅은 로컬에서 자동으로 동작하므로, 팀 전체가 동일한 위험에 노출될 가능성이 있습니다. 이번 사례는 보안 교육과 Git 훅 관리 정책의 필요성을 재조명하며, 개발자들이 신뢰할 수 없는 스크립트를 무작위로 실행하지 않도록 주의해야 함을 경고합니다.  

**Source:** [내가 표적이 됐다: git post-checkout 훅으로 자격 증명 탈취를 노린 시도](https://news.hada.io/topic?id=34709)