---
title: "[Domain Storytelling #3] Egon.io 도구 활용 - 디지털 도구로 효율적으로 작업하기"
date: 2025-11-08 14:45:00 +0900
categories: [Blog]
tags: [domain-storytelling, egon-io, modeling-tool, collaboration]
---

## 시작하며

이전 포스트(표기법과 워크샵 가이드 - 실제로 어떻게 그리고 진행하는가)에서 Domain Storytelling 워크샵을 화이트보드로 진행하는 방법을 살펴봤습니다. 하지만 실제 프로젝트에서는 디지털 도구의 활용이 필수적입니다. 이번 포스트에서는 Domain Storytelling 전용 오픈소스 도구인 **Egon.io**의 활용 방법을 상세히 알아보겠습니다.

## Egon.io란?

Egon.io는 Domain Storytelling을 위해 특별히 설계된 **무료 오픈소스 웹 기반 모델링 도구**입니다.

### 핵심 특징

**1. 브라우저 기반**
- 설치 불필요
- 어떤 OS에서도 동일하게 작동
- https://egon.io/app 접속만으로 즉시 사용 가능

**2. Domain Storytelling 문법 내장**
- 액터, 작업 객체, 활동을 정확히 표현
- 문장 번호 자동 관리
- 도메인에 맞게 아이콘 커스터마이징 가능

**3. 협업 친화적**
- 파일로 저장하고 공유
- SVG, PNG, HTML 등 다양한 포맷 지원
- 리플레이 기능으로 이야기를 단계별로 재생

**4. 오픈소스 & 무료**
- GitHub: https://github.com/WPS/egon.io
- MIT 라이선스
- 커뮤니티 기여 활발

## Egon.io 시작하기

### 접속 방법

**옵션 1: 온라인 버전 (추천)**
```
1. https://egon.io/app 접속
2. 즉시 모델링 시작
3. 로그인/회원가입 불필요
```

**옵션 2: 로컬 실행**
```bash
# GitHub에서 다운로드
git clone https://github.com/WPS/egon.io.git
cd egon.io

# 로컬 서버 실행
npm install
npm run start

# http://localhost:4200 접속
```

**옵션 3: Docker**
```bash
# Docker 이미지 다운로드 및 실행
docker pull ghcr.io/wps/egon.io:latest
docker run -p 4040:80 ghcr.io/wps/egon.io:latest

# http://localhost:4040 접속
```

### 첫 화면 구성

```
┌─────────────────────────────────────────────┐
│ 🎨 도구 모음                                  │
├─────────────────────────────────────────────┤
│                                             │
│         [캔버스 영역]                         │
│                                             │
│                                             │
│                                             │
├─────────────────────────────────────────────┤
│ 📦 아이콘 팔레트                              │
│ [👤][💼][🖥️][📄]...                         │
└─────────────────────────────────────────────┘
```

**주요 도구:**
- 📝 New: 새 Domain Story 생성
- 💾 Export: 저장
- 📂 Import: 불러오기
- ▶️ Replay: 리플레이 시작
- ⚙️ Settings: 설정

## 기본 사용법

### 1. Domain Story 작성하기

**Step 1: 액터 추가**

```
1. 팔레트에서 액터 아이콘 선택 (예: 👤 사람 아이콘)
2. 캔버스에 클릭하여 배치
3. 더블클릭하여 이름 입력 (예: "고객")
```

**팁:**
- 여러 액터를 동시에 배치할 때는 Shift 키를 누른 채로 클릭
- 액터를 드래그하여 위치 조정 가능

**Step 2: 작업 객체 추가**

```
1. 팔레트에서 작업 객체 아이콘 선택 (예: 📄 문서 아이콘)
2. 캔버스에 클릭하여 배치
3. 더블클릭하여 이름 입력 (예: "주문서")
```

**Step 3: 활동으로 연결**

```
1. 시작점 액터 선택
2. Context Pad에서 화살표 아이콘 선택
3. 끝점 객체로 드래그
4. 화살표를 더블클릭하여 활동명 입력 (예: "작성")
```

**자동 번호 부여:**
Egon.io는 화살표를 그리는 순서대로 자동으로 번호를 매깁니다.

```
첫 번째 화살표: 1
두 번째 화살표: 2
세 번째 화살표: 3
...
```

### 2. Domain Story 편집하기

**요소 이동:**
```
- 클릭 & 드래그: 개별 요소 이동
- Shift + 클릭: 여러 요소 선택
- Ctrl + A: 전체 선택
```

**요소 삭제:**
```
- 요소 선택 후 Delete 키
- Context Pad의 휴지통 아이콘
```

**번호 재정렬:**
```
문제: 중간에 활동을 추가하면 번호가 뒤죽박죽
해결: 
1. Dictionary 버튼 (📖) 클릭
2. 활동 목록에서 순서 조정
3. 자동으로 번호 재정렬
```

### 3. 주석 추가하기

Domain Story의 제목과 설명을 추가할 수 있습니다:

```
1. 캔버스 상단의 제목 클릭
2. "고객 주문 프로세스" 입력

3. 설명 영역 클릭
4. 주요 가정이나 변형 케이스 설명 입력
   예: "재고가 충분한 일반적인 경우를 가정"
```

**주석 작성 팁:**
```
좋은 주석:
✓ "정상 재고 상태 가정"
✓ "VIP 고객은 빠른 배송 선택 가능"
✓ "결제 실패 시는 별도 시나리오 참조"

나쁜 주석:
✗ "시스템 아키텍처는..."
✗ "DB 테이블 구조는..."
```

### 4. 그룹핑 (Grouping)

관련된 활동들을 논리적으로 묶을 수 있습니다:

```
1. 팔레트에서 Group 아이콘 (□) 선택
2. 캔버스에 드래그하여 그룹 영역 생성
3. 관련 요소들을 그룹 안으로 이동
4. 그룹에 이름 부여 (예: "주문 검증")
```

**그룹 활용 예시:**

```
╔════════════════════════╗
║  주문 검증              ║
║  3. 재고 확인           ║
║  4. 가격 계산           ║
║  5. 배송비 계산         ║
╚════════════════════════╝
```

## 고급 기능 활용

### 1. 아이콘 커스터마이징

Egon.io의 강력한 기능 중 하나는 도메인에 맞게 아이콘을 커스터마이징할 수 있다는 점입니다.

**기본 아이콘 세트 선택:**

```
1. Settings (⚙️) 버튼 클릭
2. Icon Configuration 선택
3. 필요한 아이콘만 팔레트에 표시
```

**카테고리별 아이콘:**
```
Actors (액터):
- Person (일반 사용자)
- System (시스템)
- Organization (조직)
- External (외부 시스템)

Work Objects (작업 객체):
- Document (문서)
- Data (데이터)
- Email (이메일)
- Report (리포트)
```

**커스텀 아이콘 업로드:**

```
1. Icon Configuration에서 "Upload Custom Icon"
2. SVG 파일 업로드 (권장)
   - 정사각형 비율 권장
   - Google Material Icons 스타일 추천
3. 팔레트에 추가
```

**도메인별 아이콘 세트 예시:**

```
금융 도메인:
- 💳 카드 → 고객
- 🏦 은행 → 결제 시스템
- 📊 차트 → 리스크 분석 시스템
- 💰 돈 → 거래 내역

물류 도메인:
- 📦 박스 → 패키지
- 🚚 트럭 → 배송 시스템
- 📍 위치 → 주소 정보
- 🏭 공장 → 물류센터

헬스케어 도메인:
- 👨‍⚕️ 의사 → 의료진
- 🏥 병원 → 병원 시스템
- 💊 약 → 처방전
- 🔬 실험 → 검사 결과
```

### 2. 리플레이 기능 (Replay)

작성한 Domain Story를 단계별로 재생하여 발표할 수 있습니다.

**리플레이 시작:**

```
1. Replay 버튼 (▶️) 클릭
2. 1번 활동만 표시됨
3. Next (⏭️) 버튼으로 다음 단계
4. Previous (⏮️) 버튼으로 이전 단계
5. Stop (⏹️) 버튼으로 종료
```

**활용 시나리오:**

```
시나리오 1: 이해관계자 발표
"자, 고객이 먼저 무엇을 하죠?" [클릭]
"그 다음에는?" [클릭]
"여기서 시스템이 개입합니다" [클릭]

시나리오 2: 교육/온보딩
신입 개발자에게 비즈니스 프로세스를 
단계별로 설명

시나리오 3: 리뷰 회의
"3번 단계에서 문제가 있었는데..." [해당 단계로 이동]
```

**리플레이 팁:**
- 그룹은 마지막 단계에서 나타남
- 프레젠테이션 모드와 함께 사용하면 효과적
- 주석을 미리 확인하여 설명 준비

### 3. Dictionary 기능

여러 Domain Story에서 일관된 용어를 사용하기 위한 기능입니다.

```
1. Dictionary 버튼 (📖) 클릭
2. 사용 중인 모든 활동과 작업 객체 목록 표시
3. 한 번에 이름 변경 가능
```

**활용 예시:**

```
문제 상황:
- 어떤 Story에서는 "등록"
- 다른 Story에서는 "생성"
- 또 다른 Story에서는 "추가"

Dictionary로 해결:
1. "생성", "추가"를 모두 "등록"으로 통일
2. 모든 Domain Story에 일괄 적용
3. Ubiquitous Language 확립
```

## 파일 관리

### 저장 (Export)

Egon.io는 다양한 포맷으로 저장을 지원합니다.

**1. .egn 파일 (권장)**

```
특징:
✓ Egon.io 전용 포맷
✓ 모든 정보 보존 (아이콘 설정 포함)
✓ 버전 관리 시스템(Git)에 적합
✓ JSON 형식으로 가독성 좋음

사용법:
1. Export 버튼 클릭
2. "Download .egn" 선택
3. 파일명 입력 (예: order-process.egn)
```

**Git 저장소 예시:**

```
project/
├── docs/
│   └── domain-stories/
│       ├── order-normal.egn
│       ├── order-out-of-stock.egn
│       └── payment-failure.egn
├── src/
└── README.md
```

**2. .svg 파일 (임베딩된 .egn 포함)**

```
특징:
✓ 이미지로 사용 가능
✓ .egn 파일이 SVG 안에 임베딩됨
✓ Miro, Confluence 등에 삽입 가능
✓ 다시 Egon.io로 불러올 수 있음

사용법:
1. Export 버튼 클릭
2. "Download .svg" 선택
```

**3. .html 파일 (프레젠테이션)**

```
특징:
✓ 리플레이 기능 포함된 웹페이지
✓ Egon.io 없이도 볼 수 있음
✓ 이해관계자 공유용으로 최적

사용법:
1. Export 버튼 클릭
2. "Download .html" 선택
3. 브라우저로 열어서 재생
```

**4. .png 파일**

```
특징:
✓ 일반 이미지 파일
✓ 문서, 슬라이드에 삽입 용이
✓ 편집 불가능

사용법:
1. Export 버튼 클릭
2. "Download .png" 선택
```

### 불러오기 (Import)

**방법 1: 파일 선택**

```
1. Import 버튼 (📂) 클릭
2. .egn 또는 .svg 파일 선택
3. 자동으로 아이콘 설정까지 복원
```

**방법 2: 드래그 앤 드롭**

```
1. .egn 또는 .svg 파일을 캔버스에 드래그
2. 즉시 로드됨
```

**방법 3: URL로 불러오기**

```
1. Import from URL 버튼 클릭
2. GitHub raw URL 입력
   예: https://raw.githubusercontent.com/.../story.egn
3. 자동으로 로드

주의: CORS 정책으로 일부 서버는 불가능
```

### 자동 저장 (Auto-save)

브라우저의 Local Storage를 활용한 자동 저장 기능:

```
1. Settings (⚙️) → Auto-save 활성화
2. 저장 간격 설정 (기본: 30초)
3. 유지할 드래프트 수 설정 (기본: 5개)
```

**주의사항:**
```
✓ 브라우저별로 별도 저장
✓ 시크릿 모드에서는 작동 안 함
✓ 브라우저 캐시 삭제 시 손실
✓ 중요한 작업은 .egn 파일로 별도 저장 필수
```

## 워크샵에서 Egon.io 활용하기

### 오프라인 워크샵에서

**준비물:**
```
✓ 노트북 + Egon.io
✓ 프로젝터 (화면 공유용)
✓ 큰 화면에 투영
```

**진행 방법:**

```
Step 1: 화면 설정
- F11 키로 전체 화면 모드
- 줌 레벨 조정 (Ctrl + 마우스 휠)

Step 2: 실시간 기록
모더레이터: 노트북으로 실시간 작성
참여자들: 프로젝터 화면으로 확인

Step 3: 즉각적 수정
참여자: "2번이 잘못됐어요"
모더레이터: [즉시 수정]
```

**장점:**
- 화이트보드보다 깔끔한 결과물
- 즉시 파일로 공유 가능
- 수정이 쉬움

**단점:**
- 초기 러닝 커브
- 모더레이터가 도구에 익숙해야 함

**추천 방법:**
처음에는 화이트보드로 러프하게 그리고,
휴식 시간에 Egon.io로 옮기는 하이브리드 방식

### 온라인 워크샵에서

**준비:**
```
✓ Zoom/Teams 등 화상회의
✓ 모더레이터가 Egon.io 화면 공유
✓ (선택) Miro와 병행 사용
```

**진행 방법:**

```
Option 1: Egon.io만 사용
- 모더레이터가 Egon.io로 실시간 작성
- 화면 공유로 모든 참여자가 확인

Option 2: Miro + Egon.io 병행
- Miro에서 브레인스토밍
- Egon.io로 정리
```

**Miro와 Egon.io 통합 워크플로우:**

```
1단계 (Miro): 자유로운 아이디어 발산
   - 포스트잇으로 활동 나열
   - 순서 대략 정리
   - 참여자들이 동시 편집

2단계 (Egon.io): 구조화된 정리
   - Miro의 내용을 Egon.io로 옮김
   - 명확한 문법으로 정리
   - .svg 파일을 다시 Miro에 첨부
```

## Egon.io 실전 활용 패턴

### 패턴 1: 점진적 상세화

```
Level 0: Big Picture (거시적)
파일: business-overview.egn
내용: 전체 비즈니스 흐름을 5-10개 활동으로

Level 1: Process Detail (중간)
파일: order-process.egn
내용: 주문 프로세스를 20-30개 활동으로

Level 2: Sub-process (미시적)
파일: payment-verification.egn
내용: 결제 검증 세부 과정을 10-15개 활동으로
```

**폴더 구조:**

```
domain-stories/
├── 0-overview/
│   └── business-overview.egn
├── 1-order/
│   ├── order-normal.egn
│   ├── order-out-of-stock.egn
│   └── order-vip.egn
├── 2-payment/
│   ├── payment-card.egn
│   └── payment-failure.egn
└── 3-delivery/
    └── delivery-process.egn
```

### 패턴 2: As-Is / To-Be 비교

```
as-is/
├── order-current.egn     (현재 수작업 프로세스)
└── payment-current.egn   (현재 전화 승인)

to-be/
├── order-future.egn      (자동화된 프로세스)
└── payment-future.egn    (API 자동 승인)

gap-analysis.md           (차이점 분석)
```

### 패턴 3: 시나리오 라이브러리

```
scenarios/
├── happy-path/
│   └── order-normal.egn
├── exceptions/
│   ├── out-of-stock.egn
│   ├── payment-failed.egn
│   └── delivery-delayed.egn
└── edge-cases/
    ├── vip-rush-order.egn
    └── bulk-order.egn
```

## 팀 협업 베스트 프랙티스

### 1. 명명 규칙

```
파일명 규칙:
[도메인]-[시나리오]-[버전].egn

예시:
order-normal-v1.egn
order-normal-v2.egn
payment-card-failure-v1.egn
```

### 2. Git 통합

**.gitignore 설정:**

```gitignore
# Egon.io 자동 저장 파일 (로컬 전용)
*.egn.backup

# 임시 파일
*.tmp
```

**커밋 메시지 예시:**

```bash
git commit -m "Add: 재고 부족 시나리오 Domain Story"
git commit -m "Update: 주문 프로세스에 VIP 고객 처리 추가"
git commit -m "Fix: 결제 검증 단계 순서 수정"
```

### 3. 리뷰 프로세스

```
1. 작성자가 .egn 파일을 PR로 제출
2. 리뷰어가 Egon.io로 열어서 확인
3. 의견을 주석이나 GitHub 코멘트로 작성
4. 수정 후 머지
```

### 4. 문서화 통합

**README에 Domain Story 링크:**

```markdown
## 주요 비즈니스 프로세스

### 주문 처리
- [정상 주문](./domain-stories/order-normal.egn)
- [재고 부족 시](./domain-stories/order-out-of-stock.egn)
- [VIP 긴급 주문](./domain-stories/order-vip-rush.egn)

### 결제
- [카드 결제](./domain-stories/payment-card.egn)
- [결제 실패 처리](./domain-stories/payment-failure.egn)
```

## 다른 도구들과의 비교

### Egon.io vs. Miro

| 특징 | Egon.io | Miro |
|-----|---------|------|
| Domain Storytelling 문법 | ✅ 완벽 지원 | ⚠️ 수동 구현 필요 |
| 리플레이 기능 | ✅ 내장 | ❌ 없음 |
| 다른 다이어그램 지원 | ❌ Domain Story만 | ✅ 범용 |
| 실시간 협업 | ❌ 없음 | ✅ 강력함 |
| 비용 | ✅ 완전 무료 | 💰 유료 (무료 제한적) |

**추천 사용법:**
- Miro로 브레인스토밍 → Egon.io로 정리

### Egon.io vs. diagrams.net

| 특징 | Egon.io | diagrams.net |
|-----|---------|--------------|
| Domain Storytelling | ✅ 전용 도구 | ⚠️ 범용 도구 |
| 학습 곡선 | ✅ 쉬움 | ⚠️ 복잡함 |
| 자동 번호 | ✅ 자동 | ❌ 수동 |
| 다른 다이어그램 | ❌ 없음 | ✅ 모든 타입 |

## 자주 묻는 질문 (FAQ)

**Q1: 여러 사람이 동시에 편집할 수 있나요?**
```
A: 안타깝게도 실시간 협업은 지원하지 않습니다.
대안:
- 한 사람이 작성하고 파일 공유
- Miro에서 협업 후 Egon.io로 정리
- 각자 작성 후 병합
```

**Q2: 모바일에서 사용할 수 있나요?**
```
A: 기술적으로 가능하지만 권장하지 않습니다.
작은 화면에서는 복잡한 Domain Story 작성이 어렵습니다.
최소 태블릿 크기 이상 권장.
```

**Q3: 대용량 Domain Story는 어떻게 관리하나요?**
```
A: 50개 이상의 활동은 여러 Story로 분리 권장.
1. 큰 Story를 레벨별로 나누기
2. 서브 프로세스를 별도 파일로
3. 개요(overview) Story에서 참조
```

**Q4: Egon.io 파일을 Confluence에 삽입하려면?**
```
A: .svg 파일로 export하여 삽입.
SVG 안에 .egn이 임베딩되어 있어서
나중에 다시 편집 가능.
```

## 마치며

Egon.io는 Domain Storytelling을 위한 최적의 디지털 도구입니다. 특히 원격 팀이나 문서화가 중요한 프로젝트에서 그 진가를 발휘합니다.

다음 포스트에서는 Domain Storytelling을 DDD(Domain-Driven Design)와 어떻게 통합하여 Bounded Context를 식별하고 Ubiquitous Language를 확립하는지 알아보겠습니다.

### 다음 글 예고

- **[Domain Storytelling #4]** DDD와의 통합 - Bounded Context와 Ubiquitous Language
- **[Domain Storytelling #5]** 실전 적용 전략 - 다른 기법들과 함께 사용하기

## 참고자료

- [Egon.io 공식 사이트](https://egon.io/)
- [Egon.io GitHub](https://github.com/WPS/egon.io)
- [Egon.io 예제 모음](https://github.com/WPS/egon.io-examples)
- [How to Use 가이드](https://egon.io/howto)

---

*Egon.io로 만든 Domain Story가 있다면 링크를 공유해주세요!*
