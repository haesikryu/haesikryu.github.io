---
title: "DDD, Hexagonal Architecture를 활용한 Backend 구조 표준"
date: 2025-11-20 23:06:48 +0900
categories: [Blog]
tags: [ddd, donain-driven-design, hexagonal-architecture, ports-and-adapters, package-by-feature, coding-standard, java, spring-boot]
---

# DDD, Hexagonal Architecture를 활용한 Backend 구조 표준

DDD(Domain-Driven Design)와 헥사고날 아키텍처(Hexagonal Architecture, Ports and Adapters)를 Spring Boot 환경에 적용할 때 가장 중요한 핵심은 **"도메인(비즈니스 로직)이 외부 기술(Web, DB, 외부 API 등)에 의존하지 않도록 격리하는 것"**입니다.
이를 달성하기 위한 패키지 구조 표준과 구성 가이드를 제안합니다.


## 1. 전체 패키지 구조 (Package by Feature)
최상위 레벨은 도메인(기능)별로 나누고, 그 내부에서 **계층(Layer)**을 나누는 방식을 추천합니다.

``` text
com.company.project
├── common                // 전역 공통 (Util, Global Exception 등)
├── member                // [Bounded Context] 회원 도메인
│   ├── adapter           // [Hexagonal] 외부와의 어댑터 (Web, Persistence)
│   ├── application       // [Hexagonal] 애플리케이션 비즈니스 로직 (Service, UseCase)
│   └── domain            // [DDD] 핵심 도메인 로직 (Entity, Policy)
├── order                 // [Bounded Context] 주문 도메인
│   ├── adapter
│   ├── application
│   └── domain
└── ProjectApplication.java
```

## 2. 상세 패키지 구성 및 역할 가이드
order (주문) 도메인을 예시로 상세 구조를 정의합니다.
### 2-1. Domain (핵심 코어)
외부 세계(DB, UI, Framework)를 전혀 몰라야 합니다. POJO(Plain Old Java Object)로 구성하는 것이 이상적입니다.

``` text
└── domain
    ├── model             // 핵심 비즈니스 객체
    │   ├── Order.java    // (Aggregate Root)
    │   ├── OrderId.java  // (Value Object)
    │   ├── OrderLine.java
    │   └── OrderStatus.java
    ├── repository        // [Output Port] 레포지토리 인터페이스
    │   └── OrderRepository.java
    ├── service           // 도메인 서비스 (Entity만으로 로직 처리가 힘들 때)
    │   └── OrderValidator.java
    └── event             // 도메인 이벤트
        └── OrderCreatedEvent.java
```

- 규칙:
    - jpa, web 관련 어노테이션 사용 금지 (가능하다면).
    - Repository Interface는 여기에 위치하지만, 구현체는 여기에 없습니다 (의존성 역전).

### 2-2. Application (애플리케이션 계층)
도메인 객체를 사용하여 비즈니스 유스케이스(Use Case)를 흐름대로 제어합니다.

``` text
└── application
    ├── port              // [Input/Output Port]
    │   ├── in            // [Input Port] 외부에서 이 서비스를 사용할 때의 인터페이스 (UseCase)
    │   │   └── CreateOrderUseCase.java
    │   └── out           // [Output Port] 외부 시스템(결제 등) 통신 인터페이스
    │       └── PaymentPort.java
    ├── service           // [Input Port 구현체] 실제 애플리케이션 로직
    │   └── CreateOrderService.java
    └── dto               // 도메인 로직에 진입하기 위한 데이터 전달 객체
        ├── CreateOrderCommand.java
        └── OrderResult.java
```

- 규칙:
    - @Transactional은 여기서 사용합니다.
    - 비즈니스 로직을 직접 수행하기보다 도메인 모델에 위임하여 **오케스트레이션(순서 제어)**만 담당해야 합니다.

### 2-3. Adapter (인프라/외부 계층)
애플리케이션을 실행하거나, 애플리케이션이 필요로 하는 데이터를 제공합니다.

``` text
└── adapter
    ├── in                // [Driving Adapter] 입력을 받는 곳 (Web)
    │   └── web
    │       ├── OrderController.java
    │       ├── request/CreateOrderRequest.java
    │       └── response/OrderResponse.java
    └── out               // [Driven Adapter] 출력을 내보내는 곳 (DB, External API)
        ├── persistence   // DB 어댑터
        │   ├── OrderJpaEntity.java      // JPA 전용 엔티티
        │   ├── OrderJpaRepository.java  // Spring Data JPA
        │   ├── OrderPersistenceAdapter.java // Domain Repository 구현체
        │   └── OrderMapper.java         // JpaEntity <-> DomainEntity 변환
        └── external      // 외부 시스템 어댑터
            └── KakaoPaymentAdapter.java // PaymentPort 구현체
```

- 규칙:
    - Spring MVC, JPA, Feign Client 등 구체적인 기술이 여기서 사용됩니다.
    - adapter.out은 domain이나 application의 인터페이스를 implements 합니다.

## 3. 의존성 방향 (Dependency Flow)
헥사고날 아키텍처의 핵심은 모든 의존성이 중심(Domain)을 향해야 한다는 점입니다.
Adapter (Web/DB) -> Application (Service) -> Domain (Model)

- Controller는 Service를 압니다.
- Service는 Domain을 압니다.
- Domain은 아무것도 모릅니다.
- DB 구현체(Adapter)는 Domain Repository 인터페이스를 구현(implements)하므로, 소스 코드상 의존성은 Adapter -> Domain이 됩니다. (DIP: 의존성 역전 원칙)

## 4. 주요 Java 파일 작성 예시
### 4-1. Domain (핵심 로직)

``` java
package com.company.project.order.domain.model;

import lombok.Getter;

@Getter
public class Order { // POJO
    private final Long id;
    private final String product;
    private OrderStatus status;

    // 생성자 및 비즈니스 로직
    public void complete() {
        if (this.status == OrderStatus.CANCELED) {
            throw new IllegalStateException("이미 취소된 주문입니다.");
        }
        this.status = OrderStatus.COMPLETED;
    }
}
```

### 4-2. Application (Input Port & Service)

``` java
package com.company.project.order.application.port.in;

public interface CreateOrderUseCase {
    Long createOrder(CreateOrderCommand command);
}
```

``` java
package com.company.project.order.application.service;

import com.company.project.order.application.port.in.CreateOrderUseCase;
import com.company.project.order.domain.model.Order;
import com.company.project.order.domain.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CreateOrderService implements CreateOrderUseCase {

    private final OrderRepository orderRepository; // Domain의 인터페이스 의존

    @Override
    @Transactional
    public Long createOrder(CreateOrderCommand command) {
        Order order = Order.create(command.getProduct()); // 도메인 로직 호출
        orderRepository.save(order);
        return order.getId();
    }
}
```

### 4-3. Adapter Out (Persistence - 의존성 역전의 핵심)
여기서 가장 고민이 되는 부분은 Domain Entity와 JPA Entity의 분리 여부입니다.
완벽한 헥사고날을 추구한다면 분리해야 합니다.

``` java
// 1. JPA Entity (DB 테이블 매핑용)
@Entity
@Table(name = "orders")
class OrderJpaEntity { 
    @Id @GeneratedValue
    private Long id;
    private String product;
    // ...
}

// 2. Spring Data JPA
interface OrderJpaRepository extends JpaRepository<OrderJpaEntity, Long> {}

// 3. Adapter 구현체 (Domain Repository 인터페이스 구현)
@Component
@RequiredArgsConstructor
public class OrderPersistenceAdapter implements OrderRepository {

    private final OrderJpaRepository jpaRepository;

    @Override
    public void save(Order order) {
        // Domain Entity -> JPA Entity 변환 (Mapper 사용 권장)
        OrderJpaEntity entity = toJpaEntity(order);
        jpaRepository.save(entity);
    }
    
    @Override
    public Order findById(Long id) {
         // JPA Entity -> Domain Entity 변환 후 리턴
         return jpaRepository.findById(id).map(this::toDomain).orElseThrow();
    }
}
```

## 5. 요약: 이 구조를 채택했을 때의 장점
1. 기술 교체 용이성: 추후 JPA를 MyBatis로 바꾸거나, RDB를 NoSQL로 바꿔도 adapter.out.persistence 패키지 내부만 수정하면 되며, domain 로직은 전혀 건드리지 않아도 됩니다.
2. 테스트 용이성: domain 패키지는 순수 자바 코드이므로 Spring 통합 테스트 없이 단위 테스트 작성이 매우 쉽습니다.
3. 관심사의 분리: 비즈니스 로직에 집중하는 사람(Domain 영역)과 기술적 구현에 집중하는 사람(Adapter 영역)이 명확히 나뉩니다.

## 6. 실무적 팁 (Trade-off)
이 구조는 파일 수가 많아지고 매핑 작업(Domain Entity <-> JPA Entity <-> Web DTO)이 번거로울 수 있습니다.

- 완화 전략: 프로젝트 초기이거나 복잡도가 낮다면, Domain Entity에 JPA 어노테이션을 붙여서 겸용으로 사용하고 adapter.out에서 매핑 과정을 생략하는 **"느슨한 계층형 아키텍처"**로 시작했다가, 도메인이 복잡해질 때 분리하는 것도 좋은 전략입니다.