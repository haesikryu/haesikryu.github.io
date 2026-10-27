---
title: "REA로 macOS 계산기를 정적 분석하고 React 웹 계산기로 재구현하기"
date: 2026-10-27 14:10:00 +0900
categories: [AI, Development]
tags: [REA, Reverse-Engineering, Codex, React, TypeScript, Vite, macOS, SwiftUI]
description: "macOS 기본 계산기 앱을 REA로 실행 없이 분석하고, 관찰된 구조와 새 설계를 구분해 React·TypeScript 웹 계산기로 재구현한 기록"
toc: true
---

## 개요

앞선 글에서는 macOS에서 **REA(Reverse Engineer Anything)**를 Codex MCP로 연결하고 읽기 전용 도구 호출까지 검증했다. 이번에는 실제 분석 대상으로 macOS 기본 계산기를 선택했다.

```text
/System/Applications/Calculator.app
```

목표는 두 가지였다.

1. 앱을 실행하지 않고 번들·Mach-O·Swift/Objective-C 메타데이터와 의존성을 조사한다.
2. 확인된 구조적 아이디어를 바탕으로 React·TypeScript·Vite 웹 계산기를 독립적으로 구현한다.

중요한 원칙은 **관찰한 사실과 새로 설계한 부분을 섞지 않는 것**이었다. 원본 코드를 복원하거나 복사하는 대신, 정적 분석으로 확인한 책임 분리와 기술 구성을 참고해 작은 웹 애플리케이션을 새로 만들었다.

> 이 글의 분석은 정적 분석으로 한정했다. 앱 실행, 디버깅, 런타임 계측, 코드 주입, 원본 파일 변경은 수행하지 않았다.

---

## 1. 분석 범위와 사용한 REA 도구

분석 질문을 다음과 같이 나눴다.

| 질문 | 사용한 REA 도구 |
| --- | --- |
| 번들 전체 구조와 런타임 후보는 무엇인가? | `inspect_desktop_application` |
| Info.plist와 버전 정보는 무엇인가? | `open_bundle_resources`, `inspect_plist` |
| 리소스에는 무엇이 들어 있는가? | `inspect_asset_catalog` |
| 실행 파일 형식과 아키텍처는 무엇인가? | `open_binary`, `inspect_macho` |
| Swift·Objective-C 사용 근거가 있는가? | `inspect_native_dispatch_metadata` |
| 앱과 확장의 관계는 무엇인가? | `inspect_artifact`, `project_apple_application_graph` |

`inspect_desktop_application`은 앱 디렉터리 아래 112개 엔트리를 제한 범위 안에서 모두 조사했다. 네이티브 실행 파일은 두 개였다.

```text
Calculator.app
├── Contents/MacOS/Calculator
└── Contents/PlugIns/CalculatorWidget.appex/
    └── Contents/MacOS/CalculatorWidget
```

Electron, .NET, Unity, Unreal, Godot 같은 범용 데스크톱 런타임 후보는 나오지 않았다. 대신 Apple 애플리케이션 그래프는 이 앱을 네이티브 앱으로 분류했다.

여기서 후보가 없다는 결과를 “런타임이 없다”로 해석하면 안 된다. 해당 탐지기가 찾는 외부 런타임 특징이 없다는 뜻이며, Mach-O와 Apple 번들 구조라는 별도 증거를 함께 봐야 한다.

---

## 2. 정적 분석으로 확인한 사실

### 2.1 앱과 위젯의 기본 정보

주 앱의 `Info.plist`와 `version.plist`에서 다음 값을 확인했다.

| 항목 | 값 |
| --- | --- |
| Bundle Identifier | `com.apple.calculator` |
| 앱 버전 | 12.0 |
| 빌드 | 225 |
| 프로젝트명 | `UniversalCalculator` |
| 실행 파일 | `Calculator` |
| 최소 macOS | 26.5 |
| URL Scheme | `calc` |

포함된 확장의 정보는 다음과 같았다.

| 항목 | 값 |
| --- | --- |
| Bundle Identifier | `com.apple.calculator.CalculatorWidget` |
| 패키지 타입 | `XPC!` |
| Extension Point | `com.apple.widgetkit-extension` |
| 버전 / 빌드 | 11.0 / 224 |

경로 규칙과 plist를 함께 보면 루트 앱 하나와 WidgetKit 앱 확장 하나로 구성된 형태다.

### 2.2 Mach-O 파일과 아키텍처

두 실행 파일 모두 64비트 universal Mach-O였다.

| 실행 파일 | 아키텍처 | SHA-256 |
| --- | --- | --- |
| `Calculator` | `x86_64`, `arm64e` | `f11151e6...e69e5c42` |
| `CalculatorWidget` | `x86_64`, `arm64e` | `7dcff42f...dc8a520` |

주 실행 파일의 arm64e 슬라이스에는 `__TEXT`, `__DATA_CONST`, `__DATA`, `__LINKEDIT` 등이 있었고, 다음과 같은 Swift·Objective-C 관련 섹션이 확인됐다.

```text
__swift5_typeref
__swift5_types
__swift5_fieldmd
__swift5_reflstr
__swift5_proto
__swift5_capture
__objc_classlist
__objc_methlist
__objc_selrefs
__objc_protolist
```

이 섹션 이름은 단순한 파일명 추측이 아니라 해당 Mach-O 슬라이스에서 관찰된 메타데이터다.

### 2.3 Swift 사용 근거

Swift 사용은 여러 독립적인 증거로 확인됐다.

- `__swift5_*` 메타데이터 섹션
- `_TtC10Calculator...` 형식의 Swift 타입 심볼
- `libswiftCore`, `libswift_Concurrency`, `libswift_StringProcessing` 의존성
- SwiftUI, SwiftData, Combine, AppIntents 직접 링크
- REA 메타데이터 해독 결과 Swift 선언 129개

관찰된 타입 중 일부는 다음과 같다.

```text
CalculatorMainView
CalculatorAppView
CalculatorViewModel
CalculatorExpressionManager
CalculatorKeypadView
CalculatorHistoryViewModel
CalculatorHistoryRecordManager
CalculatorUnitConversionViewModel
CalculatorCurrencyCacheProvider
CalculatorNetworkManager
LaunchCalculatorOpenIntent
SchemaV1.HistoryRecord
```

### 2.4 Objective-C는 어디까지 확인됐는가

`libobjc.A.dylib` 의존성과 `__objc_*` 섹션, Objective-C selector와 protocol도 확인됐다.

```text
NSObject
NSApplicationDelegate
NSCacheDelegate
NSTouchBarDelegate
NSTextFieldDelegate
```

여기서 구분이 필요하다.

- **확인된 사실:** Objective-C 런타임과 AppKit 상호운용을 사용한다.
- **확인되지 않은 것:** 별도의 Objective-C 소스 파일로 구현됐는지 여부.

Swift 타입을 `@objc`로 노출해도 동일한 런타임 메타데이터가 만들어질 수 있다. 따라서 “Objective-C로 작성됐다”가 아니라 “Objective-C 런타임을 사용한다”라고 표현하는 것이 정확하다.

### 2.5 프레임워크 의존성

앱 번들 내부에는 `Contents/Frameworks`가 없었다. 자체 포함 프레임워크 없이 시스템 프레임워크에 링크한다.

주요 의존성:

```text
Calculate.framework          Apple 비공개 프레임워크
CalculateUI.framework        Apple 비공개 프레임워크
SwiftUI.framework
AppKit.framework
SwiftData.framework
AppIntents.framework
Combine.framework
Network.framework
```

확장 실행 파일은 SwiftUI, WidgetKit, AppIntents에 링크하며 다음 Swift 선언을 포함했다.

```text
ControlCenterExtensionBundle
CalculatorControl
CalculatorAppView
LaunchCalculatorOpenIntent
```

### 2.6 리소스

`Contents/Resources`에는 다음 자산이 있었다.

- `Assets.car`: 287개 레코드
- `AppIcon.icns`
- `Localizable.loctable`
- `InfoPlist.loctable`
- `WidgetLocalizable.loctable`
- `Metadata.appintents`
- 다국어 `.lproj` 디렉터리

Asset catalog에서는 `AccentColor`가 sRGB `(1, 0.576, 0, 1)`인 주황색으로 확인됐다. 웹 계산기 디자인은 이 색을 시각적 참고점으로 삼았다.

---

## 3. 사실과 추정을 분리해 구조 해석하기

정적 분석에서는 이름과 의존성만으로 동작을 단정하지 않는 것이 중요하다.

| 영역 | 관찰한 사실 | 구조적 추정 |
| --- | --- | --- |
| 계산 엔진 | `Calculate`, `CalculateUI`에 직접 링크 | 표현식 평가와 계산 UI의 일부를 위임할 가능성이 높음 |
| UI | SwiftUI·AppKit 의존성과 View 타입 존재 | 주 UI는 SwiftUI, macOS 전용 부분은 AppKit 브리지일 가능성 |
| 기록 | SwiftData, `SchemaV1.HistoryRecord` 존재 | 계산 기록을 SwiftData로 영속화할 가능성 |
| 통화 변환 | Network, `CalculatorNetworkManager`, Currency Cache 타입 존재 | 환율을 가져와 캐시하는 계층일 가능성 |
| 시스템 통합 | AppIntents 메타데이터와 Open Intent 존재 | 단축어·검색 등에서 계산기를 여는 동작 제공 가능성 |

예를 들어 `CalculatorNetworkManager`라는 타입이 있다고 해서 실제 접속 서버나 호출 시점을 알 수 있는 것은 아니다. 그런 결론에는 호출 그래프, URL 구성 코드 또는 런타임 네트워크 관찰이 추가로 필요하다.

---

## 4. 분석 결과에서 웹 구현으로 가져온 것

REA 분석에서 재사용한 것은 코드가 아니라 **구조적 아이디어**다.

```text
REA에서 관찰한 책임 분리
├── View
├── ViewModel
├── Expression Manager
└── Keypad View

웹 프로젝트의 새 설계
├── App.tsx              화면과 입력 이벤트
├── calculator.ts        순수 상태 전이와 계산
├── calculator.test.ts   계산 규칙 테스트
└── styles.css           반응형 시각 체계
```

원본 앱의 내부 계산 알고리즘이나 SwiftUI 코드는 복원하지 않았다. React reducer를 이용해 상태 전이를 새로 정의했다.

```ts
export interface CalculatorState {
  display: string
  accumulator: number | null
  pendingOperator: Operator | null
  waitingForOperand: boolean
  error: string | null
}
```

액션은 숫자, 소수점, 연산자, 등호, 초기화로 제한했다.

```ts
export type CalculatorAction =
  | { type: 'digit'; digit: string }
  | { type: 'decimal' }
  | { type: 'operator'; operator: Operator }
  | { type: 'equals' }
  | { type: 'clear' }
```

---

## 5. React 웹 계산기 구현

프로젝트 기술 스택은 다음과 같다.

```text
React 19
TypeScript
Vite 7
Vitest 5
CSS
```

구현 범위:

1. 사칙연산
2. 숫자 입력과 AC 초기화
3. 소수점 입력
4. 중간 결과를 이용한 연속 계산
5. 0으로 나누기 오류와 입력 복구
6. 키보드 입력
7. 반응형 레이아웃

### 5.1 계산 규칙

연속 계산은 일반적인 단순 계산기처럼 입력 순서대로 중간 결과를 확정한다.

```text
2 + 3 × 4 =

2 + 3  → 5
5 × 4  → 20
```

이는 수식 파서의 연산자 우선순위 평가가 아니라 **계산기 키 입력 상태 머신**으로 새로 정한 규칙이다.

부동소수점 오차가 화면에 길게 노출되지 않도록 결과는 12자리 유효 숫자로 정규화했다.

```ts
function normalizeResult(value: number): number {
  return Number.parseFloat(value.toPrecision(12))
}
```

따라서 `0.1 + 0.2`는 화면에 `0.3`으로 표시된다.

### 5.2 0으로 나누기

나눗셈의 오른쪽 피연산자가 0이면 계산 결과 대신 오류 상태를 반환한다.

```ts
case '÷':
  return right === 0 ? null : normalizeResult(left / right)
```

화면에는 `오류`와 `0으로 나눌 수 없습니다`를 표시한다. 그 상태에서 새 숫자를 누르면 입력 상태로 복구하고, AC를 누르면 전체 상태를 초기화한다.

### 5.3 키보드와 접근성

마우스뿐 아니라 숫자 키, `+`, `-`, `*`, `/`, Enter, Escape 입력도 지원했다. 결과 영역에는 `aria-live`, 활성 연산자에는 `aria-pressed`, 각 버튼에는 읽을 수 있는 label을 적용했다.

CSS는 원본 자산을 복사하지 않고 새로 작성했다. REA에서 관찰된 주황색 AccentColor만 컬러 방향의 참고점으로 사용했다.

---

## 6. 구현 중 발견한 그리드 버그

첫 구현에서는 `AC`와 `0`을 모두 같은 `wide` 속성으로 처리했다.

```text
AC = 2칸
0  = 2칸
```

그런데 4열 키패드의 첫 줄에는 `AC`와 나누기 버튼만 있으므로 `AC`가 2칸이면 한 칸이 비게 된다. CSS Grid의 자동 배치 결과 `7`, `4`, `1`이 의도한 첫 번째 열에서 밀렸다.

이를 단순한 boolean 대신 열 수를 명시하는 속성으로 수정했다.

```ts
interface ButtonConfig {
  label: string
  action: CalculatorAction
  columnSpan?: 2 | 3
}

{ label: 'AC', columnSpan: 3, ... }
{ label: '0',  columnSpan: 2, ... }
```

CSS도 두 경우를 분리했다.

```css
.key--span-2 {
  grid-column: span 2;
}

.key--span-3 {
  grid-column: span 3;
}
```

이 수정으로 첫 행은 `AC 3칸 + ÷ 1칸`이 되고, `7·4·1`은 정상적으로 첫 번째 열에 정렬됐다.

작은 UI 버그였지만 “넓은 버튼”이라는 모호한 boolean보다 실제 레이아웃 의도를 타입으로 표현하는 편이 더 안전하다는 점을 보여준다.

---

## 7. 테스트와 빌드

계산 로직을 React 컴포넌트에서 분리했기 때문에 DOM 없이 reducer를 빠르게 테스트할 수 있었다.

테스트 항목:

- 숫자 입력 및 초기화
- 중복 소수점 방지
- 덧셈·뺄셈·곱셈·나눗셈
- 연속 계산
- 0으로 나누기 오류
- 오류 후 숫자 입력 복구
- `0.1 + 0.2` 정밀도 정규화

```bash
npm test
```

결과:

```text
Test Files  1 passed (1)
Tests       9 passed (9)
```

프로덕션 빌드도 확인했다.

```bash
npm run build
```

```text
✓ 30 modules transformed.
✓ built successfully
```

초기 설치에서는 Vitest 3 계열의 하위 의존성에 npm audit 취약점이 보고됐다. Vitest를 5.0.5로 올린 뒤 다시 설치·테스트·빌드했고 최종 audit 결과는 0건이었다.

---

## 8. REA 분석의 한계와 다음 단계

이번 환경에서는 심층 네이티브 provider가 바인딩되지 않아 `analyze_swift_types`, `get_objc_classes`, 함수 의사코드와 호출 그래프 기능을 사용할 수 없었다. REA의 Apple 정적 메타데이터 리더로 타입과 프로토콜을 확인했지만 다음 영역은 부분 범위다.

- generic/resilient witness table
- 일부 async/coroutine vtable
- 외부 바인딩 상대 포인터
- stripped 또는 toolchain-hidden import/export

더 깊게 분석하려면 다음 작업이 필요하다.

1. Hopper, Ghidra, IDA 또는 Kuna를 REA에 연결한다.
2. `CalculatorExpressionManager`와 `CalculatorViewModel`에서 호출 경로를 추적한다.
3. `Calculate.framework`, `CalculateUI.framework`를 별도 분석한다.
4. arm64e와 x86_64 슬라이스의 함수와 의존성을 비교한다.
5. `Metadata.appintents`와 SwiftData 스키마를 형식별 도구로 분석한다.

다만 웹 계산기의 목표는 원본을 완전히 복제하는 것이 아니었다. 사칙연산이라는 명확한 범위에서는 정적 분석으로 얻은 구조적 통찰과 독립적인 설계만으로 충분했다.

---

## 9. 정리

이번 작업의 핵심 흐름은 다음과 같다.

```text
대상과 분석 원칙 고정
    ↓
번들·plist·리소스 인벤토리
    ↓
Mach-O와 언어 메타데이터 확인
    ↓
관찰 사실 / 구조적 추정 분리
    ↓
웹에 필요한 책임만 새로 설계
    ↓
React reducer로 구현
    ↓
테스트·빌드·보안 감사
    ↓
UI 피드백 반영과 회귀 검증
```

역공학 결과를 활용할 때 가장 중요한 것은 디컴파일된 조각을 곧바로 복사하는 일이 아니다. 어떤 사실을 실제로 관찰했는지, 어떤 부분을 추정했는지, 새 시스템에서는 무엇을 의도적으로 다시 설계했는지를 추적 가능하게 남기는 일이다.

이번 계산기 실습은 규모는 작지만 **증거 기반 분석 → 책임 분리 → 독립 구현 → 검증**이라는 재구현 작업의 기본 흐름을 끝까지 경험했다는 데 의미가 있다.
