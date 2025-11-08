---
title: "[Domain Storytelling #5] 실전 적용 전략 - 다른 기법들과 함께 사용하기"
date: 2025-11-08 15:20:00 +0900
categories: [Blog]
tags: [domain-storytelling, event-storming, user-story-mapping, collaborative-modeling, sdlc]
---

## 시작하며

이번 시리즈의 마지막 포스트에서는 Domain Storytelling을 실제 프로젝트에 적용하는 방법과, Event Storming, User Story Mapping 등 다른 협업 모델링 기법들과 어떻게 통합하여 사용하는지 알아보겠습니다.

## 프로젝트 단계별 Domain Storytelling 활용

### Phase 1: 프로젝트 초기 - 도메인 이해

**목표: 전체 비즈니스 이해, 핵심 프로세스 파악**

```
워크샵 구성:
- 기간: 1-2일
- 참여자: 주요 도메인 전문가, 아키텍트, 테크 리드
- 산출물: 3-5개의 Big Picture Domain Stories
```

**진행 순서:**

```
Day 1 Morning: Domain Story 작성
1. 핵심 비즈니스 프로세스 선정 (2-3개)
2. 각 프로세스의 Happy Path 스토리 작성
3. 주요 변형 케이스 1-2개 추가

예시:
- "정상적인 주문 처리"
- "재고 부족 시 대체 상품 제안"  
- "VIP 고객 긴급 주문"

Day 1 Afternoon: 경계 식별
1. Domain Story 분석
2. Bounded Context 후보 식별
3. Context Map 초안 작성

Day 2 Morning: 용어 정리
1. Ubiquitous Language 용어 수집
2. 용어 불일치 해결
3. 용어 사전 초안 작성

Day 2 Afternoon: 다음 단계 계획
1. 추가 분석 필요 영역 식별
2. 상세 Domain Story 작성 계획
3. Event Storming 등 후속 워크샵 계획
```

**산출물 예시:**

```
output/
├── domain-stories/
│   ├── order-happy-path.egn
│   ├── order-out-of-stock.egn
│   └── order-vip-rush.egn
├── bounded-context-candidates.md
├── context-map-draft.png
└── ubiquitous-language-v1.md
```

### Phase 2: 요구사항 분석 - 상세화

**목표: 세부 프로세스 이해, User Story 도출**

```
반복 주기: Sprint 0 또는 각 Epic 시작 시
참여자: Feature 팀 전체 (PO, 개발자, QA)
기간: 2-4시간
```

**Domain Storytelling → User Story 변환:**

```
Domain Story:
1. [고객] --선택--> <상품>
2. [고객] --추가--> <장바구니>
3. [고객] --확인--> <장바구니 내역>
4. [시스템] --계산--> <총액> --표시--> [고객]

→ User Stories:

US-101: 상품 선택
As a 고객
I want to 상품 상세 정보를 보고
So that 구매 결정을 할 수 있다

Acceptance Criteria:
- Domain Story 1번 단계 참조
- 상품 이미지, 가격, 재고 상태 표시
- 옵션 선택 가능 (색상, 크기 등)

US-102: 장바구니 추가
As a 고객
I want to 선택한 상품을 장바구니에 추가하고
So that 나중에 함께 주문할 수 있다

Acceptance Criteria:
- Domain Story 2번 단계 참조
- 수량 지정 가능
- 중복 추가 시 수량 증가
- 장바구니 아이콘에 개수 표시

US-103: 장바구니 확인
...
```

### Phase 3: 설계 - 아키텍처 결정

**목표: 기술 아키텍처 설계, API 설계**

```
활용 방법:
1. Domain Story를 기반으로 시스템 경계 확정
2. Context 간 통신 방식 결정
3. API 명세 초안 작성
```

**Domain Story 기반 API 설계:**

```
Domain Story:
[Order Service] --발행--> <OrderCreated 이벤트>
[Inventory Service] --수신--> <OrderCreated 이벤트>
[Inventory Service] --예약--> <재고>

→ Event-Driven Architecture 설계:

Event: OrderCreated
{
  "eventId": "...",
  "orderId": "...",
  "orderLines": [
    {
      "productId": "...",
      "quantity": 10
    }
  ],
  "timestamp": "..."
}

Inventory Service Subscription:
- Topic: order.created
- Handler: reserveInventoryForOrder()
```

### Phase 4: 개발 - 구현 가이드

**목표: 개발자가 비즈니스 로직을 정확히 구현**

```
활용 방법:
1. Domain Story를 개발자 온보딩 자료로 활용
2. 코드 리뷰 시 Domain Story와 일치 여부 확인
3. 테스트 시나리오 작성 기준으로 활용
```

**Domain Story 기반 테스트:**

```
Domain Story: "정상 주문 처리"

→ Integration Test:

@Test
@DisplayName("정상 주문 처리 - Domain Story 기반")
void testNormalOrderProcess() {
    // Given: Domain Story 1-3번
    Customer customer = createCustomer();
    Product product = createProduct();
    customer.addToCart(product, quantity: 2);
    
    // When: Domain Story 4-6번  
    Order order = customer.placeOrder(
        deliveryInfo: deliveryInfo,
        paymentMethod: creditCard
    );
    
    // Then: Domain Story 7-9번
    assertThat(order.getStatus()).isEqualTo(PENDING_PAYMENT);
    assertThat(paymentService.hasPaymentRequest(order.getId()))
        .isTrue();
}
```

### Phase 5: 운영 - 프로세스 모니터링

**목표: 실제 운영과 설계의 차이 파악**

```
활용 방법:
1. As-Is Domain Story 업데이트
2. 병목 지점 식별
3. 개선 To-Be Domain Story 작성
```

## 다른 협업 기법과의 통합

### 1. Event Storming과의 통합

**Event Storming: 빠른 이벤트 발견**
**Domain Storytelling: 프로세스 흐름 이해**

**통합 워크플로우:**

```
Step 1: Event Storming으로 시작
기간: 2-4시간
목표: 도메인 이벤트 빠르게 발견

[주문됨] → [결제됨] → [재고예약됨] → [배송시작됨] → [배송완료됨]

Step 2: 중요 이벤트를 Domain Story로 상세화
기간: 각 30분-1시간
목표: 이벤트 발생 맥락 이해

Event: [주문됨]
→ Domain Story: "고객 주문 생성 프로세스"
   1. [고객] --선택--> <상품>
   2. [고객] --입력--> <배송 정보>
   3. [시스템] --생성--> <주문>
   4. [시스템] --발행--> <주문됨 이벤트>

Event: [재고예약됨]
→ Domain Story: "재고 예약 프로세스"
   ...

Step 3: Event Storming 결과 업데이트
Domain Story에서 놓친 이벤트 추가
```

**실전 예시: E-Commerce 주문 프로세스**

```
Phase 1: Event Storming (2시간)
산출물: 타임라인에 배치된 40개 이벤트

Phase 2: 핵심 프로세스를 Domain Story로 (각 1시간)
- "고객 주문 생성"
- "재고 예약 및 출고"
- "결제 처리"
- "배송 및 추적"

Phase 3: Event Storming 보완 (30분)
Domain Story에서 발견된 누락 이벤트 추가
```

**언제 어떤 기법을 사용할까?**

```
Event Storming 먼저:
✅ 도메인이 매우 복잡하고 넓을 때
✅ 빠르게 전체 그림을 파악해야 할 때
✅ 많은 이해관계자가 참여할 때

Domain Storytelling 먼저:
✅ 특정 프로세스를 깊이 이해해야 할 때
✅ 참여자가 소수일 때
✅ 기존 비즈니스 프로세스를 문서화할 때

병행 사용:
✅ Event Storming으로 빅픽처
✅ Domain Storytelling으로 상세 프로세스
✅ 서로 보완하며 진화
```

### 2. User Story Mapping과의 통합

**User Story Mapping: 사용자 여정 중심**
**Domain Storytelling: 시스템 프로세스 중심**

**통합 방법:**

```
Step 1: User Story Mapping으로 사용자 여정 파악
┌──────────────────────────────────────────────────┐
│  상품 검색  │  상품 선택  │  주문 생성  │  결제  │
├──────────────────────────────────────────────────┤
│ □ 키워드 검색│ □ 상세 보기 │ □ 장바구니  │ □ 결제│
│ □ 필터링    │ □ 옵션 선택 │ □ 수량 변경 │ □ 확인│
│ □ 정렬      │ □ 비교     │ □ 쿠폰     │      │
└──────────────────────────────────────────────────┘

Step 2: 각 Activity를 Domain Story로 상세화

Activity: "주문 생성"
→ Domain Story:
   [고객] --확인--> <장바구니>
   [고객] --입력--> <배송 정보>
   [시스템] --계산--> <배송비>
   [고객] --선택--> <결제 수단>
   [시스템] --생성--> <주문>

Step 3: User Story 도출
Domain Story의 각 단계가 User Story 후보가 됨
```

**실전 워크플로우:**

```
Sprint Planning:
1. User Story Map에서 이번 Sprint 범위 선택
2. 해당 Activity의 Domain Story 리뷰
3. 구현 가능한 User Story로 분해
4. 각 User Story에 Domain Story 링크

예시:
US-201: 배송 정보 입력
- Domain Story: order-process.egn (5-7번 단계)
- 배송지 주소 입력 (기본 주소 또는 새 주소)
- 수령인 정보 입력
- 배송 요청사항 입력
```

### 3. Example Mapping과의 통합

**Example Mapping: 구체적인 예시로 요구사항 명확화**
**Domain Storytelling: 프로세스 전체 맥락 이해**

**통합 방법:**

```
Step 1: Domain Story로 전체 프로세스 파악
"주문 생성 프로세스"

Step 2: 복잡한 규칙을 Example Mapping으로 탐색

Rule: "재고 확인 로직"
┌────────────────────────────────────┐
│ Story: 장바구니에서 주문 생성       │
├────────────────────────────────────┤
│ Rule 1: 재고 충분 → 주문 생성      │
│   Example 1: 재고 100, 주문 10     │
│   Example 2: 재고 10, 주문 10      │
│                                    │
│ Rule 2: 재고 부족 → 대체품 제안    │
│   Example 1: 재고 0, 대체품 있음   │
│   Example 2: 재고 5, 주문 10       │
│                                    │
│ Question: 예약 재고는 어떻게?      │
└────────────────────────────────────┘

Step 3: Example을 Domain Story에 반영

Domain Story: "재고 부족 시 대체 상품 제안"
- Example Mapping의 Rule 2 구현
- Example 1, 2를 주석으로 추가
```

### 4. Impact Mapping과의 통합

**Impact Mapping: 목표와 영향 중심**
**Domain Storytelling: 구현 프로세스 중심**

```
Impact Map:
Goal: 주문 처리 시간 50% 단축
└── Actor: 주문 담당자
    └── Impact: 수동 검증 제거
        └── Deliverable: 자동 검증 시스템

→ To-Be Domain Story 작성:
"자동화된 주문 검증 프로세스"

1. [시스템] --수신--> <주문>
2. [시스템] --자동 검증--> <재고>
3. [시스템] --자동 검증--> <고객 신용도>
4. [시스템] --자동 검증--> <배송 가능 여부>
5. [시스템] --승인--> <주문>

vs. As-Is Domain Story:
(수동 검증 프로세스 비교)
```

## 조직 내 Domain Storytelling 정착시키기

### 1. 점진적 도입 전략

**Level 1: 실험 (1-2개월)**

```
목표: 효과 검증
범위: 단일 프로젝트 또는 팀
활동:
- 1-2회 워크샵 진행
- 피드백 수집
- 성과 측정
```

**Level 2: 확산 (3-6개월)**

```
목표: 베스트 프랙티스 확립
범위: 여러 팀
활동:
- 성공 사례 공유
- 모더레이터 양성
- 템플릿/가이드 정리
```

**Level 3: 정착 (6개월~)**

```
목표: 표준 프로세스화
범위: 조직 전체
활동:
- SDLC에 공식 통합
- KPI에 반영
- 지속적 개선
```

### 2. 모더레이터 역량 개발

**초급 모더레이터 (1-2회 워크샵 진행)**

```
필요 역량:
✓ Domain Storytelling 표기법 이해
✓ Egon.io 기본 사용법
✓ 간단한 워크샵 진행

학습 방법:
- 공식 문서 학습
- 시니어 모더레이터 워크샵 참관
- 소규모 워크샵부터 시작
```

**중급 모더레이터 (5-10회 워크샵 진행)**

```
추가 역량:
✓ 갈등 조정 능력
✓ 적절한 범위 설정
✓ DDD 개념 이해

학습 방법:
- 다양한 도메인 경험
- 실패 사례 학습
- 피드백 기반 개선
```

**고급 모더레이터 (20회+ 워크샵 진행)**

```
추가 역량:
✓ 다른 기법들과 통합
✓ 조직 프로세스 설계
✓ 모더레이터 코칭

기여 방법:
- 조직 가이드 작성
- 후배 모더레이터 멘토링
- 워크샵 프로세스 개선
```

### 3. 산출물 관리 체계

**중앙 저장소 구축:**

```
company-domain-stories/
├── README.md                 (저장소 사용 가이드)
├── templates/                (템플릿)
│   ├── workshop-agenda.md
│   └── context-canvas.md
├── guidelines/               (가이드라인)
│   ├── modeling-guide.md
│   └── naming-conventions.md
├── domains/                  (도메인별)
│   ├── order-management/
│   │   ├── README.md
│   │   ├── stories/
│   │   │   ├── order-normal.egn
│   │   │   └── order-vip.egn
│   │   ├── bounded-contexts.md
│   │   └── ubiquitous-language.md
│   └── inventory/
│       └── ...
└── archive/                  (과거 버전)
```

**버전 관리:**

```bash
# 새 Domain Story 추가
git commit -m "Add: VIP 고객 주문 프로세스 Domain Story"

# Domain Story 수정
git commit -m "Update: 재고 확인 로직 변경 반영"

# 리팩토링
git commit -m "Refactor: 주문 Context 세분화"
```

### 4. 측정 및 개선

**효과 측정 지표:**

```
정량적 지표:
├── 요구사항 변경 횟수 (감소 목표)
├── 재작업 시간 (감소 목표)
├── 개발자 온보딩 시간 (감소 목표)
└── 도메인 전문가 참여 시간 (증가는 OK)

정성적 지표:
├── 팀원 만족도 설문
├── 도메인 이해도 자가 평가
└── 커뮤니케이션 품질
```

**개선 사이클:**

```
분기별:
1. 워크샵 참여자 피드백 수집
2. 주요 이슈 식별
3. 가이드라인 업데이트
4. 다음 분기 개선 사항 적용

예시:
Q1: "범위가 너무 넓어 시간 초과"
→ 개선: Big Picture vs. Detailed Story 구분 가이드 추가

Q2: "용어 불일치 해결이 어려움"
→ 개선: Dictionary 활용 가이드 보강

Q3: "온라인 워크샵 효율이 낮음"
→ 개선: Miro 통합 워크플로우 정립
```

## 실전 체크리스트

### 워크샵 전

```
[ ] 목표와 범위 명확히 정의
[ ] 적절한 참여자 선정 및 초대
[ ] 필요 도구 준비 (화이트보드 or Egon.io)
[ ] 참여자에게 사전 자료 공유
[ ] 시간 계획 수립 (타임박스)
```

### 워크샵 중

```
[ ] Domain Storytelling 간단 소개 (5-10분)
[ ] 구체적인 사례로 시작
[ ] 도메인 전문가의 언어 사용
[ ] 실시간 시각화 및 피드백
[ ] 번호 순서 명확히 유지
[ ] 주석으로 변형 케이스 기록
[ ] 용어 불일치 즉시 해결
[ ] 정해진 시간 준수
```

### 워크샵 후

```
[ ] 1주일 내 결과물 정리 및 공유
[ ] 참여자 피드백 수집
[ ] 발견된 이슈 목록 작성
[ ] 후속 조치 계획 수립
[ ] Ubiquitous Language 용어 사전 업데이트
[ ] Bounded Context 후보 문서화
[ ] 다음 워크샵 일정 잡기
```

## 자주 묻는 질문 (FAQ)

**Q1: Domain Storytelling은 언제 쓰고 Event Storming은 언제 쓰나요?**

```
Domain Storytelling:
✅ 기존 프로세스 이해/문서화
✅ 명확한 순서가 있는 프로세스
✅ 소규모 팀 (5-8명)
✅ 도메인 전문가가 주도

Event Storming:
✅ 새로운 시스템 설계
✅ 복잡한 이벤트 흐름
✅ 대규모 팀 (10-20명)
✅ 빠른 전체 파악

병행:
Event Storming → 전체 이벤트 파악
Domain Storytelling → 세부 프로세스 이해
```

**Q2: 기술 부채가 많은 레거시 시스템에도 적용 가능한가요?**

```
오히려 효과적입니다:

1. As-Is Domain Story 작성
   - 현재 시스템의 실제 동작 이해
   - 문서화되지 않은 프로세스 파악

2. 문제점 식별
   - 불필요한 단계 발견
   - 복잡도 시각화

3. To-Be Domain Story 작성
   - 개선된 프로세스 설계
   - 리팩토링 우선순위 결정

4. 단계적 개선
   - Domain Story 단위로 리팩토링
   - 비즈니스 영향 최소화
```

**Q3: Domain Story가 너무 많아지면 관리가 어렵지 않나요?**

```
계층화 전략:

Level 0: Overview (2-3개)
- 전체 비즈니스 맥락
- 5-10개 활동으로 요약

Level 1: Core Process (5-10개)
- 핵심 비즈니스 프로세스
- 20-30개 활동

Level 2: Detail (필요시)
- 복잡한 부분만 상세화
- 10-20개 활동

관리 팁:
- README에 Domain Story 맵 작성
- 계층 간 링크 명확히
- 주기적으로 정리 (분기 1회)
```

**Q4: 도메인 전문가가 참여하기 어려운 경우는?**

```
대안 전략:

Plan A: 녹화된 인터뷰 활용
- 사전에 프로세스 설명 녹화
- 워크샵에서 영상 보며 Domain Story 작성
- 비동기로 피드백 수집

Plan B: 문서 기반 시작
- 기존 문서, 매뉴얼 분석
- 초안 Domain Story 작성
- 짧은 검증 미팅 (30분)

Plan C: 현장 관찰
- 실제 업무 수행 관찰
- 관찰 내용을 Domain Story로
- 후속 검증 미팅

주의: 도메인 전문가 검증은 필수!
```

## 마치며

Domain Storytelling은 단순한 다이어그램 도구가 아니라 **팀이 도메인을 함께 이해하는 여정**입니다. 완벽한 문서를 만드는 것보다 함께 대화하고 이해를 맞춰가는 과정 자체가 더 큰 가치를 만듭니다.

이 시리즈를 통해 여러분의 팀도 Domain Storytelling을 활용하여 더 나은 소프트웨어를 만들 수 있기를 바랍니다.

## 시리즈 전체 요약

```
[#1] Domain Storytelling 소개
- 개념과 필요성
- 전통적 방식의 한계
- 실제 적용 사례

[#2] 표기법과 워크샵 가이드
- Pictographic Language
- 워크샵 진행 방법
- 모더레이터 가이드

[#3] Egon.io 도구 활용
- 기본 사용법
- 고급 기능
- 팀 협업 방법

[#4] DDD와의 통합
- Bounded Context 식별
- Ubiquitous Language 확립
- Context Mapping

[#5] 실전 적용 전략
- 프로젝트 단계별 활용
- 다른 기법과의 통합
- 조직 내 정착 방법
```

## 추가 학습 자료

**책:**
- "Domain Storytelling" by Stefan Hofer and Henning Schwentner (필독!)
- "Domain-Driven Design" by Eric Evans
- "Implementing Domain-Driven Design" by Vaughn Vernon

**온라인 리소스:**
- [domainstorytelling.org](https://domainstorytelling.org/) - 공식 사이트
- [Egon.io](https://egon.io/) - 무료 모델링 도구
- [Domain Storytelling GitHub](https://github.com/WPS/egon.io-examples) - 예제 모음

**워크샵:**
- DDD Europe - Domain Storytelling 워크샵
- Kalele.io - 온라인 트레이닝

**커뮤니티:**
- DDD Community Slack
- Domain Storytelling Meetups
- LinkedIn DDD Groups

## 맺음말

5편의 긴 여정을 함께 해주셔서 감사합니다. 

Domain Storytelling은 배우기 쉽지만 잘 활용하기는 어렵습니다. 여러분의 조직과 프로젝트 상황에 맞게 적용하고, 실패도 하고, 개선하면서 여러분만의 Domain Storytelling 방법을 찾아가시기 바랍니다.

궁금한 점이 있거나 실전 경험을 공유하고 싶으시다면 언제든 댓글로 소통합시다!

---

***"The best way to understand a domain is to tell its stories."***

*- Domain Storytelling 시리즈를 마치며*

