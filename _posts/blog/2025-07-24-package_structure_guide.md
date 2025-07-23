---
title: "애플리케이션 패키지 구조 설계 접근법과 설계 원칙 알아보기"
date: 2025-07-24 07:50:00 +0900
categories: [Blog]
tags: [inner-architecture, package-structure, clean-code, software-architecture, design-pattern, backend, maintainability, development-methodology]
---

# 애플리케이션 패키지 구조 설계 접근법과 설계 원칙 알아보기 

## 들어가며

좋은 패키지 구조는 코드의 품질을 결정하는 핵심 요소입니다. 단순히 파일을 정리하는 것을 넘어서, 팀의 생산성과 애플리케이션의 유지보수성을 좌우하는 중요한 아키텍처 결정사항입니다.

## 패키지 구조의 주요 접근법

### 1. 계층형 구조 (Layer-based Structure)

기술적 관심사에 따라 패키지를 구성하는 전통적인 방식입니다.

```
com.company.app/
├── controller/     # 모든 컨트롤러
├── service/        # 모든 서비스
├── repository/     # 모든 리포지토리
├── dto/           # 모든 DTO
├── entity/        # 모든 엔티티
├── config/        # 설정 클래스
└── util/          # 유틸리티 클래스
```

**장점**
- 구조가 단순하고 이해하기 쉬움
- 소규모 프로젝트에 적합
- 개발 초기 단계에서 빠른 개발 가능

**단점**
- 비즈니스 로직이 분산되어 파악 어려움
- 기능 추가 시 여러 패키지를 수정해야 함
- 패키지 간 순환 의존성 발생 가능
- 팀 단위 개발 시 충돌 빈번

### 2. 기능별 구조 (Feature-based Structure)

비즈니스 기능 단위로 패키지를 구성하는 방식입니다.

```
com.company.app/
├── user/
│   ├── UserController
│   ├── UserService
│   ├── UserRepository
│   └── UserDto
├── order/
│   ├── OrderController
│   ├── OrderService
│   ├── OrderRepository
│   └── OrderDto
├── product/
│   ├── ProductController
│   ├── ProductService
│   ├── ProductRepository
│   └── ProductDto
└── common/
    ├── config/
    ├── util/
    └── exception/
```

**장점**
- 비즈니스 로직이 응집되어 이해하기 쉬움
- 기능별 독립적 개발 가능
- 새로운 기능 추가 시 한 곳에서 작업
- 마이크로서비스 분리 시 용이

**단점**
- 공통 로직 중복 가능성
- 기능 간 의존성 관리 복잡
- 초기 설계 시 기능 경계 설정 어려움

### 3. 도메인 주도 설계 (Domain-Driven Design)

비즈니스 도메인과 아키텍처 계층을 모두 고려한 구조입니다.

```
com.company.app/
├── domain/                    # 도메인 계층
│   ├── user/
│   │   ├── User               # 엔티티
│   │   ├── UserRepository     # 리포지토리 인터페이스
│   │   └── UserService        # 도메인 서비스
│   └── order/
│       ├── Order
│       ├── OrderRepository
│       └── OrderService
├── application/               # 애플리케이션 계층
│   ├── user/
│   │   ├── UserApplicationService
│   │   └── dto/
│   └── order/
│       ├── OrderApplicationService
│       └── dto/
├── infrastructure/            # 인프라스트럭처 계층
│   ├── persistence/
│   │   ├── UserRepositoryImpl
│   │   └── OrderRepositoryImpl
│   ├── web/
│   │   ├── UserController
│   │   └── OrderController
│   └── external/
│       ├── PaymentGateway
│       └── EmailService
└── common/                    # 공통 기능
    ├── config/
    ├── exception/
    └── util/
```

## 권장 패키지 구조: 하이브리드 접근법

실제 프로젝트에서는 여러 접근법을 조합한 하이브리드 구조를 권장합니다.

```
com.company.app/
├── common/                           # 횡단 관심사
│   ├── config/                      # 설정
│   │   ├── SecurityConfig
│   │   ├── DatabaseConfig
│   │   └── WebConfig
│   ├── exception/                   # 예외 처리
│   │   ├── GlobalExceptionHandler
│   │   ├── BusinessException
│   │   └── ErrorCode
│   ├── util/                       # 유틸리티
│   │   ├── DateUtils
│   │   ├── StringUtils
│   │   └── ValidationUtils
│   ├── constant/                   # 상수
│   │   ├── ApiConstants
│   │   └── MessageConstants
│   └── security/                   # 보안
│       ├── JwtProvider
│       └── SecurityUtils
│
├── domain/                          # 비즈니스 도메인
│   ├── user/                       # 사용자 도메인
│   │   ├── controller/
│   │   │   └── UserController
│   │   ├── service/
│   │   │   ├── UserService
│   │   │   └── UserValidationService
│   │   ├── repository/
│   │   │   └── UserRepository
│   │   ├── entity/
│   │   │   └── User
│   │   └── dto/
│   │       ├── request/
│   │       │   ├── CreateUserRequest
│   │       │   └── UpdateUserRequest
│   │       └── response/
│   │           └── UserResponse
│   ├── order/                      # 주문 도메인
│   │   ├── controller/
│   │   ├── service/
│   │   ├── repository/
│   │   ├── entity/
│   │   └── dto/
│   └── product/                    # 상품 도메인
│       ├── controller/
│       ├── service/
│       ├── repository/
│       ├── entity/
│       └── dto/
│
├── infrastructure/                  # 인프라스트럭처
│   ├── external/                   # 외부 연동
│   │   ├── payment/
│   │   │   ├── PaymentGateway
│   │   │   └── PaymentService
│   │   └── notification/
│   │       ├── EmailService
│   │       └── SmsService
│   ├── persistence/                # 데이터 접근
│   │   ├── config/
│   │   └── migration/
│   └── messaging/                  # 메시징
│       ├── producer/
│       └── consumer/
│
└── application/                     # 애플리케이션 서비스
    ├── facade/                     # 복합 비즈니스 로직
    │   ├── OrderFacade
    │   └── UserFacade
    └── event/                      # 이벤트 처리
        ├── handler/
        └── publisher/
```

## 패키지 설계 원칙

### 1. 단일 책임 원칙 (Single Responsibility Principle)
각 패키지는 하나의 명확한 책임만 가져야 합니다.

```java
// 좋은 예: 사용자 관련 기능만 포함
com.company.app.domain.user/
├── UserController
├── UserService
└── UserRepository

// 나쁜 예: 여러 도메인이 혼재
com.company.app.controller/
├── UserController
├── OrderController
└── ProductController
```

### 2. 개방-폐쇄 원칙 (Open-Closed Principle)
새로운 기능 추가 시 기존 코드 수정을 최소화해야 합니다.

```java
// 확장 가능한 구조
com.company.app.domain.notification/
├── NotificationService        # 인터페이스
├── EmailNotificationService   # 구현체
├── SmsNotificationService     # 새로운 구현체 추가 용이
└── PushNotificationService
```

### 3. 의존성 역전 원칙 (Dependency Inversion Principle)
상위 계층이 하위 계층에 의존하지 않도록 설계해야 합니다.

```java
// 올바른 의존성 방향
domain (인터페이스) ← application ← infrastructure (구현체)
```

## 좋은 패키지 구조의 장점

### 1. 개발 생산성 향상
- **빠른 코드 탐색**: 기능별로 코드가 응집되어 있어 관련 파일을 쉽게 찾을 수 있음
- **병렬 개발 지원**: 팀원들이 서로 다른 도메인에서 독립적으로 작업 가능
- **신규 개발자 온보딩**: 직관적인 구조로 빠른 코드베이스 파악 가능

### 2. 유지보수성 증대
- **영향 범위 최소화**: 기능 변경 시 관련 패키지만 수정하면 됨
- **버그 추적 용이**: 문제 발생 시 해당 도메인 내에서 원인 파악 가능
- **테스트 작성 편의**: 도메인별로 독립적인 테스트 작성 가능

### 3. 확장성 보장
- **마이크로서비스 분리**: 도메인별 패키지를 독립적인 서비스로 분리 용이
- **새로운 기능 추가**: 기존 구조를 따라 일관성 있게 확장 가능
- **기술 스택 변경**: 계층별 분리로 특정 기술 교체 시 영향 범위 제한

## 잘못된 패키지 구조의 단점

### 1. 개발 효율성 저하
- **코드 탐색 어려움**: 관련 코드가 여러 패키지에 분산
- **중복 코드 증가**: 공통 기능의 재사용성 부족
- **의존성 혼란**: 순환 의존성으로 인한 컴파일 오류

### 2. 유지보수 비용 증가
- **변경 영향 범위 확산**: 작은 수정이 여러 패키지에 영향
- **버그 추적 복잡**: 문제의 원인을 찾기 위해 여러 패키지 확인 필요
- **리팩토링 어려움**: 구조적 문제로 인한 대규모 수정 필요

### 3. 팀 협업 저해
- **코드 충돌 빈발**: 여러 개발자가 동일 파일 수정
- **책임 경계 모호**: 기능의 소유권이 불분명
- **코드 리뷰 복잡**: 변경사항의 영향 범위 파악 어려움

## 실무 적용 가이드

### 1. 프로젝트 규모별 접근법

**소규모 프로젝트 (개발자 1-3명)**
```
com.company.app/
├── controller/
├── service/
├── repository/
├── entity/
└── dto/
```

**중규모 프로젝트 (개발자 4-10명)**
```
com.company.app/
├── domain/
│   ├── user/
│   ├── order/
│   └── product/
├── common/
└── config/
```

**대규모 프로젝트 (개발자 10명 이상)**
```
com.company.app/
├── domain/
├── application/
├── infrastructure/
└── common/
```

### 2. 패키지명 네이밍 컨벤션

**권장사항**
- 소문자 사용
- 단수형 사용 (user, order, product)
- 명확하고 간결한 이름
- 도메인 언어 사용

**피해야 할 것**
- 축약어 사용 (usr, ord, prod)
- 복수형 사용 (users, orders)
- 기술적 용어 (impl, data, mgr)

### 3. 점진적 리팩토링 전략

**1단계: 현재 구조 분석**
- 기존 패키지 의존성 파악
- 순환 의존성 식별
- 응집도가 낮은 패키지 확인

**2단계: 목표 구조 설계**
- 비즈니스 도메인 식별
- 계층 간 의존성 정의
- 공통 기능 분리

**3단계: 단계적 이전**
- 공통 기능부터 분리
- 도메인별 패키지 생성
- 의존성 정리 및 테스트

## 마치며

좋은 패키지 구조는 하루아침에 만들어지지 않습니다. 프로젝트의 특성과 팀의 상황을 고려하여 점진적으로 개선해 나가는 것이 중요합니다. 무엇보다 팀원들과의 충분한 논의를 통해 모두가 이해하고 동의할 수 있는 구조를 만드는 것이 성공의 핵심입니다.

패키지 구조는 코드의 품질을 나타내는 척도이자, 개발팀의 성숙도를 보여주는 지표입니다. 오늘부터라도 여러분의 프로젝트 구조를 점검해보고, 더 나은 구조로 개선해 나가시기 바랍니다.