---
title: QCon London 2025 - 대규모 도메인 주도 설계 적용 사례
date: 2025-06-21 17:52:00 +0900
categories: [Blog]
tags: [DDD, 도메인주도설계, 소프트웨어아키텍처, 리팩토링, 헬스케어테크, QCon, 스케일링]
---

# QCon London 2025: 대규모 도메인 주도 설계 적용 사례

## 서론

QCon London 2025에서 발표된 Leander Vanderbijl의 "대규모 도메인 주도 설계 적용" 사례는 급속도로 성장하는 헬스케어 플랫폼에서 도메인 주도 설계(DDD)가 어떻게 혼돈 상태의 아키텍처를 체계적인 비즈니스 중심 구조로 변환시켰는지 보여주는 흥미로운 발표였습니다.

## 문제 상황: 스파게티 아키텍처의 딜레마

Vanderbijl은 자신의 회사가 직면했던 전형적인 스케일링 문제를 솔직하게 공유했습니다. 급속한 성장으로 인해 서비스들이 명확한 가이드라인 없이 서로 복잡하게 얽힌 "스파게티 아키텍처"가 형성되었고, 이는 다음과 같은 문제들을 야기했습니다:

- 핵심 비즈니스 기능의 이해 어려움
- 추가 개발의 장애물
- 유지보수의 복잡성 증가
- 시스템 전체의 지속 가능성 위험

## DDD 도입 전략: 현실적인 접근법

완전한 시스템 재구축은 비현실적이라고 판단한 팀은 기존 인프라와 호환되는 현장 적용(in-situ) 방식으로 DDD를 도입하기로 결정했습니다. 이 접근법의 핵심은 다음과 같습니다:

### 1. 도메인 식별
세 가지 핵심 도메인을 식별했습니다:
- **헬스케어 서비스**: 의료 관련 핵심 기능
- **결제 시스템**: 금융 거래 처리
- **지원 시스템**: 다른 두 영역에 속하지 않는 서비스들

### 2. 혁신적인 리팩토링 전략

특히 흥미로운 점은 팀이 각 전략에 유명한 아티스트의 이름을 붙여 명명한 것입니다:

#### "Take That" 전략
- 유사한 기능들을 통합하고 서비스 간 상호작용을 단순화
- 의료 서비스를 재편성하여 핵심 의료 기능과 부수적 서비스를 분리
- 기존 코드를 새로운 서비스로 대규모로 이전

#### "Robbie Williams" 전략
- 잘 작동하는 필수 서비스는 유지하고 중복되거나 설계가 부실한 요소는 제거
- **가장 도전적인 전략**: 기존 코드를 현장에서 제거하고 분리해야 함
- 극도의 결합으로 인해 작은 변경이 큰 영향을 미치는 문제 해결

#### "Prince" 전략
- 가치가 있지만 상당한 개선이나 새로운 도메인 모델 내에서 더 정확한 정체성이 필요한 기존 서비스를 적응시키고 재브랜딩
- 기존 서비스 옆에 새로운 서비스를 구축하는 방식

### 3. FHIR 모델 도입
Fast Healthcare Interoperability Resources(FHIR) 모델에서 영감을 얻어 의료 데이터를 구조화했습니다. 이를 통해:
- 데이터 쿼리 개선
- 상호 운용성 향상
- 헬스케어 정보 처리의 표준화

## 핵심 학습 포인트

### 1. 완벽함보다는 실용성
팀은 완벽한 도메인 구조보다는 합리적인 목표 도메인 구조가 더 나은 접근법이라고 결정했습니다. 도메인 구조를 "살아있는 문서"로 간주하고 변경을 허용함으로써 빠른 진전과 합의를 가능하게 했습니다.

### 2. 소규모 팀의 효과성
초기 도메인 발견 단계에서 소규모 팀을 유지한 것이 성공의 핵심이었습니다:
- 빠른 의사결정 가능
- "만약에" 시나리오와 엣지 케이스에 대한 과도한 고민 최소화
- 신속한 합의 도달

### 3. 점진적 개선의 중요성
기존 종속성과 모든 가정을 무시하고 주요 도메인을 식별하는 것이 놀랍도록 쉬웠다고 언급합니다. 완벽할 필요가 없고 진화할 수 있다는 점을 알게 되면서 간단하고 명확하며 이해하기 쉬운 스키마를 빠르게 만들 수 있었습니다.

## DDD는 여정이다

Vanderbijl은 DDD 도입이 일회성 해결책이 아니라 지속적인 여정임을 강조했습니다. 핵심 원칙들:

- **적응성**: 비즈니스 요구사항의 지속적 평가 필요
- **비즈니스 중심**: 제품 요구사항보다 기본 도메인 기능 우선
- **진화적 프로세스**: 지속적인 개선과 변화에 대한 의지 필요

## 결론

이 사례는 대규모 시스템에서 DDD를 성공적으로 적용하기 위한 실용적인 접근법을 제시합니다. 완벽한 설계를 추구하기보다는 현실적이고 점진적인 개선을 통해 아키텍처 혼돈에서 구조화되고 유지보수 가능한 비즈니스 중심의 미래로 나아갈 수 있음을 보여줍니다.

특히 한국의 많은 스타트업과 성장하는 기업들이 비슷한 스케일링 문제를 겪고 있는 상황에서, 이러한 실용적인 DDD 적용 사례는 매우 유용한 인사이트를 제공합니다. 중요한 것은 완벽한 도메인 모델이 아니라 지속적으로 진화할 수 있는 살아있는 아키텍처를 만드는 것임을 알 수 있습니다.
