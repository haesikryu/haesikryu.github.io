---
layout: post
title: "[Domain Storytelling #4] DDD와의 통합 - Bounded Context와 Ubiquitous Language 식별하기"
date: 2025-11-08
categories: [Software Architecture, DDD]
tags: [domain-storytelling, ddd, bounded-context, ubiquitous-language, strategic-design]
series: Domain Storytelling
series_order: 4
---

## 시작하며

Domain Storytelling은 단순한 프로세스 모델링 기법이 아닙니다. Domain-Driven Design(DDD)의 핵심 개념인 **Bounded Context 식별**과 **Ubiquitous Language 확립**을 위한 강력한 도구입니다.

이번 포스트에서는 Domain Story에서 DDD의 전략적 설계(Strategic Design) 요소들을 어떻게 찾아내는지 구체적으로 알아보겠습니다.

## Domain Storytelling과 DDD의 관계

### DDD의 핵심 과제

Eric Evans의 Domain-Driven Design은 복잡한 소프트웨어를 다루기 위한 전략을 제시합니다:

```
Strategic Design (전략적 설계):
├── Bounded Context: 모델의 경계 설정
├── Ubiquitous Language: 팀 공통 언어
├── Context Map: 컨텍스트 간 관계
└── Core Domain: 핵심 도메인 식별

Tactical Design (전술적 설계):
├── Entity, Value Object
├── Aggregate, Repository
└── Domain Service, Factory
```

**Domain Storytelling이 도움을 주는 영역:**

```
✅ Bounded Context 후보 식별
✅ Ubiquitous Language 수집
✅ Context 간 상호작용 파악
✅ Core Domain vs. Supporting Domain 구분

⚠️  직접 다루지 않는 영역:
- 구체적인 Aggregate 설계
- 데이터베이스 스키마
- 기술 스택 선택
```

### Domain Storytelling이 DDD에 기여하는 방식

**1. 도메인 지식 획득 (Knowledge Crunching)**

```
Before Domain Storytelling:
개발자: "고객 관리 시스템을 만들어야 합니다"
도메인 전문가: "네, 고객 정보를 저장하는 거죠"
→ 피상적인 이해

After Domain Storytelling:
모더레이터: "지난주 VIP 고객 등록은 어떻게 하셨나요?"
도메인 전문가: "VIP는 영업이사 승인이 필요하고..."
→ 실제 비즈니스 규칙 발견
```

**2. 언어 통일 (Ubiquitous Language)**

```
Before:
개발자: "User가 Item을 Cart에 담는다"
도메인 전문가: "고객이 상품을 장바구니에..."
→ 다른 용어 사용

After Domain Story:
[고객] --선택--> <상품> --추가--> <장바구니>
→ 팀 전체가 같은 용어 사용
```

**3. 경계 발견 (Boundary Detection)**

```
Domain Story를 그리다 보면:
"여기서 담당 부서가 바뀌네요"
"이 용어가 여기서는 다른 의미네요"
"업무 리듬이 여기서 완전히 달라지네요"
→ Bounded Context의 경계 후보
```

## Bounded Context 식별 패턴

### 패턴 1: 언어적 경계 (Linguistic Boundaries)

**지표: 같은 단어, 다른 의미**

Domain Story 예시:

```
Story 1: 영업 프로세스
[영업사원] --생성--> <고객>
              📝 고객 = 잠재 구매자, 연락처와 관심사 중심

Story 2: 배송 프로세스  
[물류팀] --조회--> <고객>
            📝 고객 = 배송 받는 사람, 주소와 연락처 중심

Story 3: 회계 프로세스
[회계팀] --관리--> <고객>
             📝 고객 = 거래처, 신용도와 결제 조건 중심
```

**분석:**

```
같은 "고객"이라는 단어지만:
- 영업 Context: Customer (Prospect)
- 배송 Context: Recipient
- 회계 Context: Account

→ 최소 3개의 Bounded Context 후보

Context Map:
┌─────────────┐     ┌─────────────┐
│   Sales     │────▶│  Delivery   │
│  Context    │     │  Context    │
└─────────────┘     └─────────────┘
       │
       ▼
┌─────────────┐
│ Accounting  │
│  Context    │
└─────────────┘
```

### 패턴 2: 조직적 경계 (Organizational Boundaries)

**지표: 담당 부서/팀이 바뀌는 지점**

Domain Story 예시:

```
Title: "주문부터 배송까지"

1. [고객] --제출--> <주문> --접수--> [주문팀]
2. [주문팀] --검증--> <주문> --승인-->
3. [주문팀] --전달--> <승인된 주문> --→ [재고팀]
   ╔═══════════════════════════════════╗
   ║  여기서 부서 전환                  ║
   ║  주문 Context → 재고 Context       ║
   ╚═══════════════════════════════════╝
4. [재고팀] --확인--> <재고>
5. [재고팀] --예약--> <재고> --생성--> <출고 지시서>
6. [재고팀] --전달--> <출고 지시서> --→ [배송팀]
   ╔═══════════════════════════════════╗
   ║  또 다른 부서 전환                 ║
   ║  재고 Context → 배송 Context       ║
   ╚═══════════════════════════════════╝
7. [배송팀] --포장--> <상품>
8. [배송팀] --배송--> <상품> --→ [고객]
```

**식별된 Bounded Context:**

```
1. Order Management Context
   - 주체: 주문팀
   - 핵심 개념: 주문, 주문 항목, 주문 상태
   - 책임: 주문 접수, 검증, 승인

2. Inventory Context
   - 주체: 재고팀
   - 핵심 개념: 재고, 재고 위치, 출고 지시
   - 책임: 재고 관리, 재고 예약, 출고 준비

3. Delivery Context
   - 주체: 배송팀
   - 핵심 개념: 배송, 배송 상태, 배송 경로
   - 책임: 포장, 배송, 배송 추적
```

### 패턴 3: 시간적 경계 (Temporal Boundaries)

**지표: 업무 리듬이 다른 지점**

Domain Story 비교:

```
Story A: "재고 조회 및 즉시 예약"
[시스템] --조회--> <재고>
[시스템] --즉시 예약--> <재고>
📝 실시간 처리 (밀리초 단위)

Story B: "일일 재고 정산"
[시스템] --집계--> <일일 재고 현황>
[재고 관리자] --검토--> <재고 현황>
📝 배치 처리 (일 1회)
```

**분석:**

```
다른 시간 특성:
- Real-time Inventory Context: 실시간 재고 예약
- Inventory Planning Context: 일일 재고 계획

이들은 다른 모델과 다른 데이터 정합성 요구사항을 가짐
→ 별도 Bounded Context로 분리 고려
```

### 패턴 4: 도메인 개념의 복잡도 차이

**지표: 개념의 깊이가 확연히 다른 영역**

```
Story 1: "상품 검색 및 조회"
[고객] --검색--> <상품>
[시스템] --표시--> <상품 목록>
📝 상품 = {id, 이름, 가격, 이미지}

Story 2: "상품 재고 관리"
[재고 관리자] --등록--> <상품>
[시스템] --계산--> <안전 재고량>
[시스템] --생성--> <발주 계획>
📝 상품 = {SKU, 카테고리, 공급업체, 리드타임, 
           ABC 분류, 재고 회전율, ...}
```

**분석:**

```
같은 "상품"이지만:
- Catalog Context: 단순 상품 정보 (읽기 위주)
- Inventory Management Context: 복잡한 상품 속성 (쓰기 위주)

→ 관심사가 다르므로 별도 Context
```

## Ubiquitous Language 확립하기

### Domain Story에서 용어 추출

**Step 1: 액터와 작업 객체 수집**

모든 Domain Story에서 사용된 용어들을 수집:

```
Actors:
- 고객
- 영업사원
- 주문 관리 시스템
- 재고팀
- 배송팀

Work Objects:
- 주문
- 주문 항목
- 상품
- 재고
- 출고 지시서
- 송장
```

**Step 2: 활동(동사) 수집**

```
Activities:
- 제출
- 검증
- 승인
- 확인
- 예약
- 생성
- 전달
- 배송
```

**Step 3: Bounded Context별로 정리**

```
┌──────────────────────────────────────┐
│ Order Management Context             │
├──────────────────────────────────────┤
│ 주문 (Order)                          │
│ - 상태: 접수됨, 검증됨, 승인됨        │
│ - 행위: 제출하다, 검증하다, 승인하다   │
│                                       │
│ 주문 항목 (Order Line)                │
│ - 수량, 가격                          │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ Inventory Context                    │
├──────────────────────────────────────┤
│ 재고 (Stock)                         │
│ - 상태: 가용, 예약됨, 출고됨          │
│ - 행위: 확인하다, 예약하다            │
│                                       │
│ 출고 지시 (Picking Order)             │
│ - 출고 목록                           │
└──────────────────────────────────────┘
```

### 용어 불일치 해결하기

Domain Story 작성 중 발견되는 용어 불일치:

```
문제 상황:
- 개발팀: "Order를 생성"
- 영업팀: "주문을 접수"
- 물류팀: "오더를 받음"

Dictionary 기능으로 통일:
✅ "주문을 접수" 로 통일
✅ 코드에서도 receiveOrder() 사용
✅ DB 테이블도 order_received_at
```

### Ubiquitous Language 문서화

**Context별 용어 사전:**

```markdown
# Order Management Context - 용어 사전

## 엔티티

### 주문 (Order)
고객이 상품 구매를 요청한 것. 

**속성:**
- 주문번호
- 주문 일시
- 주문 상태 (접수됨, 검증됨, 승인됨, 취소됨)

**행위:**
- 접수하다 (receive): 고객으로부터 주문을 받음
- 검증하다 (validate): 재고, 결제 수단 등을 확인
- 승인하다 (approve): 처리 가능함을 확인
- 취소하다 (cancel): 주문을 취소함

**Domain Story 참조:**
- [정상 주문 처리](./stories/order-normal.egn)
- [주문 취소](./stories/order-cancellation.egn)

### 주문 항목 (Order Line)
주문에 포함된 개별 상품과 수량

**속성:**
- 상품
- 수량
- 단가
```

## Domain Story를 활용한 Context Mapping

### Context 간 관계 유형 식별

Domain Story를 분석하여 Context 간 관계를 파악:

**1. Customer-Supplier (고객-공급자)**

```
Story: "주문 승인 후 재고 예약"

[Order Context] --전달--> <승인된 주문> --→ [Inventory Context]

분석:
- Order Context가 상위(Customer)
- Inventory Context가 하위(Supplier)
- Order가 요구하고 Inventory가 제공
```

**Context Map 표현:**

```
┌─────────────┐
│   Order     │ (U) Upstream
│   Context   │
└──────┬──────┘
       │ Customer-Supplier
       │
       ▼
┌─────────────┐
│  Inventory  │ (D) Downstream
│   Context   │
└─────────────┘
```

**2. Shared Kernel (공유 커널)**

```
Story: "상품 정보 조회"

[Order Context] --조회--> <상품>
[Inventory Context] --관리--> <상품>

분석:
- 두 Context 모두 "상품" 개념 사용
- 공유하는 모델 존재
- 하지만 각자의 관점이 다름
```

**해결 방법:**

```
Option 1: Shared Kernel
공통 Product 모델을 공유
└── 장점: 일관성
└── 단점: 강한 결합

Option 2: Published Language
Product 카탈로그 서비스를 별도로 분리
└── 장점: 느슨한 결합
└── 단점: 복잡도 증가
```

**3. Anti-Corruption Layer (ACL)**

```
Story: "외부 결제 시스템 연동"

[Order Context] --요청--> <결제 정보> --→ [외부 결제 게이트웨이]
[Order Context] --수신--> <결제 결과> ←-- [외부 결제 게이트웨이]

분석:
- 외부 시스템의 모델을 직접 사용하면 오염 위험
- ACL로 외부 모델을 내부 모델로 변환 필요
```

**ACL 구현:**

```
┌───────────────────────────────┐
│     Order Context             │
│  내부 모델: Payment           │
│  ┌─────────────────────────┐  │
│  │ Anti-Corruption Layer   │  │
│  │ - translate()           │  │
│  │ - adapt()               │  │
│  └─────────────────────────┘  │
└───────────────┬───────────────┘
                │
                ▼
        [외부 결제 게이트웨이]
```

## 실전 사례: E-Commerce 시스템

### 초기 Domain Story

```
Title: "상품 주문 전체 프로세스"

1. [고객] --검색--> <상품> --→ [상품 카탈로그]
2. [고객] --선택--> <상품> --추가--> <장바구니>
3. [고객] --확인--> <장바구니> --조회-->
4. [고객] --입력--> <배송 정보> --저장-->
5. [고객] --결제--> <주문> --요청--> [결제 시스템]
6. [결제 시스템] --승인--> <결제> --완료-->
7. [시스템] --생성--> <주문> --전송--> [재고 시스템]
8. [재고 시스템] --예약--> <재고>
9. [재고 시스템] --생성--> <출고 지시> --→ [물류팀]
10. [물류팀] --포장--> <상품>
11. [물류팀] --배송--> <상품> --→ [고객]
12. [배송팀] --업데이트--> <배송 추적 정보> --→ [고객]
```

### Bounded Context 식별 과정

**Step 1: 경계 지표 찾기**

```
지표 발견:
├── 3-4번: 부서 변경 없음 (같은 Context)
├── 6-7번: 외부 시스템 경계 (ACL 필요)
├── 7-8번: 부서 변경 (주문팀 → 재고팀)
├── 9-10번: 부서 변경 (재고팀 → 물류팀)
└── 11-12번: 시간적 분리 (실시간 배송 vs 추적 정보)
```

**Step 2: Context 후보 정의**

```
1. Catalog Context
   - 책임: 상품 정보 제공
   - 핵심 개념: 상품, 카테고리, 가격

2. Shopping Context  
   - 책임: 장바구니 관리, 주문 생성
   - 핵심 개념: 장바구니, 장바구니 항목, 주문

3. Payment Context
   - 책임: 결제 처리
   - 핵심 개념: 결제, 결제 수단, 거래

4. Fulfillment Context
   - 책임: 주문 이행
   - 핵심 개념: 재고 예약, 출고 지시

5. Delivery Context
   - 책임: 배송 실행 및 추적
   - 핵심 개념: 배송, 배송 상태, 추적 정보
```

**Step 3: Context Map 작성**

```
     [Catalog Context]
            ↓ OHS (Open Host Service)
     [Shopping Context]
            ↓ CF (Conformist)
     [Payment Context]
            ↓ Customer-Supplier
     [Fulfillment Context]
            ↓ Customer-Supplier
     [Delivery Context]
```

### 상세 Domain Story 작성

각 Context별로 상세한 Domain Story 작성:

**Shopping Context:**

```
Story: "장바구니에서 주문 생성"

1. [고객] --추가--> <상품> --→ <장바구니>
2. [고객] --변경--> <수량> --업데이트--> <장바구니 항목>
3. [고객] --제거--> <상품> --삭제--> <장바구니>
4. [고객] --클릭--> <주문하기 버튼>
5. [시스템] --검증--> <장바구니>
   📝 재고 가용성 확인 (Catalog Context 조회)
6. [시스템] --계산--> <총액>
7. [고객] --입력--> <배송 정보>
8. [시스템] --생성--> <주문>
   📝 주문 상태: PendingPayment
9. [시스템] --발행--> <OrderCreated 이벤트>
```

**Fulfillment Context:**

```
Story: "주문 이행 프로세스"

1. [Fulfillment System] --수신--> <OrderPaid 이벤트>
   📝 Payment Context로부터
2. [Fulfillment System] --조회--> <재고 가용성>
3. [Fulfillment System] --예약--> <재고>
4. [Fulfillment System] --생성--> <출고 지시서>
5. [Fulfillment System] --발행--> <PickingOrderCreated 이벤트>
   📝 Delivery Context로 전달
```

## Bounded Context 검증

### 검증 질문

각 Bounded Context가 올바른지 검증:

**1. 응집도 (Cohesion)**
```
질문: 이 Context 내의 개념들이 밀접하게 관련되어 있는가?

예시:
✅ Order Context: 주문, 주문 항목, 주문 상태
   → 모두 "주문"이라는 핵심 개념과 관련

❌ Order Context: 주문, 재고, 배송, 고객 프로필
   → 너무 많은 책임, 분리 필요
```

**2. 결합도 (Coupling)**
```
질문: 다른 Context와의 의존성이 최소화되어 있는가?

예시:
✅ Delivery Context가 Order Context의 "주문번호"만 참조
   → 느슨한 결합

❌ Delivery Context가 Order Context의 내부 상태를 직접 변경
   → 강한 결합, 재설계 필요
```

**3. 팀 구조**
```
질문: 한 팀이 독립적으로 개발/배포할 수 있는가?

예시:
✅ Catalog팀이 Payment팀과 독립적으로 배포 가능
   → 좋은 경계

❌ Order 변경 시 항상 Inventory도 함께 배포 필요
   → 경계 재검토 필요
```

## 마치며

Domain Storytelling은 DDD의 전략적 설계를 위한 실용적인 도구입니다. 복잡한 도메인을 구체적인 이야기로 풀어내고, 그 과정에서 자연스럽게 경계와 언어를 발견할 수 있습니다.

다음 포스트에서는 Domain Storytelling을 Event Storming, User Story Mapping 등 다른 협업 모델링 기법들과 함께 사용하는 실전 전략을 알아보겠습니다.

### 다음 글 예고

- **[Domain Storytelling #5]** 실전 적용 전략 - 다른 기법들과 함께 사용하기

## 참고자료

- "Domain Storytelling" 책 Chapter 9: Ubiquitous Language
- "Domain Storytelling" 책 Chapter 10: Finding Bounded Contexts
- Eric Evans, "Domain-Driven Design"
- Vaughn Vernon, "Implementing Domain-Driven Design"
- [Domain Storytelling과 DDD](https://domainstorytelling.org/domain-driven-design)

---

*여러분의 프로젝트에서 Domain Story로 Bounded Context를 찾아낸 경험을 공유해주세요!*
