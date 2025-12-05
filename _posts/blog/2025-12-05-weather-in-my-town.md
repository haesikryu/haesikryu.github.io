---
title: "Gemini 3 으로 나만의 '3D 미니어처 날씨 카드' 만들기"
date: 2025-12-05 11:53:18 +0900
categories: [Blog]
tags: [AI, AI-Art, Gemini, NanoBanana]
---

# [AI Art] Gemini와 Nano Banana로 나만의 '3D 미니어처 날씨 카드' 만들기

**Gemini**의 이미지 생성 기능을 활용해서 우리동네 날씨 카드를 만드는 프롬프트 엔지니어링 과정을 정리해 드립니다.

매일 확인하는 날씨 정보, 텍스트나 단순한 아이콘으로만 보고 계신가요?
오늘은 생성형 AI **Gemini**와 저만의 창작 페르소나인 **Nano Banana** 스타일을 결합하여, 실시간 날씨와 지역의 랜드마크를 반영한 **'3D 아이소메트릭(Isometric) 미니어처 카드'**를 만드는 과정을 공유하려 합니다.

단순히 "그림 그려줘"가 아닌, 원하는 구도, 질감, 그리고 텍스트 레이아웃까지 제어하는 **프롬프트 엔지니어링**의 구체적인 사례를 소개합니다.

-----

## 1. The Goal: 감성적인 날씨 정보 시각화

목표는 간단합니다. 특정 지역(예: 판교, 횡성)의 랜드마크를 반영한 미니어처 도시에 현재의 날씨(눈, 비, 맑음)를 입혀, 한 장의 **'작품'** 같은 날씨 카드를 만드는 것입니다.

여기서 핵심 도구는 두 가지입니다.

  * **Engine:** Google **Gemini** (이미지 생성 모델 Imagen 3 활용)
  * **Style Concept:** **Nano Banana** (부드러운 텍스처와 장난감 같은 감성을 담은 나노블럭/미니어처 스타일)

## 2. The Prompt Strategy (프롬프트 전략)

원하는 결과물을 얻기 위해 프롬프트를 3가지 핵심 영역으로 구조화했습니다.

### A. 구도 및 스타일 (Composition & Style)

가장 중요한 것은 시점입니다. 도시 건설 시뮬레이션 게임(SimCity 등)에서 자주 보이는 `45° top-down isometric` 뷰를 사용하여 전체적인 조형미를 살렸습니다.

> **Key Keywords:**
>
>   * `45° top-down isometric`: 쿼터뷰 시점 고정
>   * `Miniature 3D cartoon scene`: 실사보다는 귀엽고 정돈된 느낌
>   * `Soft, refined textures with realistic PBR materials`: PBR(Physically Based Rendering) 재질감을 명시하여 장난감 같으면서도 고급스러운 빛 반사 유도

### B. 환경 및 대기 (Environment & Atmosphere)

단순한 배경이 아닌, 현재의 '날씨'가 반영되어야 합니다. Gemini는 프롬프트 입력 시점의 컨텍스트를 이해할 수 있으므로, 날씨 조건을 환경에 녹여달라고 요청했습니다.

> **Key Keywords:**
>
>   * `Integrate the current weather conditions`: 현재 날씨(눈, 비 등)를 장면에 통합
>   * `Immersive atmospheric mood`: 대기 효과(안개, 눈보라 등) 추가

### C. 타이포그래피 (Typography)

이미지 생성 AI가 가장 어려워하는 부분이 텍스트입니다. 이를 해결하기 위해 텍스트의 위치, 정렬, 내용을 아주 구체적으로 지시해야 합니다.

> **Key Keywords:**
>
>   * `Top-center`: 위치 고정
>   * `Large bold text`: 폰트 스타일 지정
>   * `Consistent spacing`: 자간/행간 유지 요청

-----

## 3 . Actual Prompt (실제 사용한 프롬프트)

아래는 **경기도 성남시 판교신도시**와 **강원도 횡성군 안흥면** 이미지를 생성할 때 사용한 실제 프롬프트 구조입니다.

```markdown
Present a clear, 45° top-down isometric miniature 3D cartoon scene of [Location Name],
featuring its most iconic landmarks and architectural elements.

Use soft, refined textures with realistic PBR materials and gentle, lifelike lighting and shadows.
Integrate the current weather conditions directly into the city environment to create an immersive atmospheric mood.

Use a clean, minimalistic composition with a soft, solid-colored background.

At the top-center, place the title “[Location Name]” in large bold text,
a prominent weather icon beneath it, then the date (small text) and temperature (medium text).

All text must be centered with consistent spacing, and may subtly overlap the tops of the buildings.

Square 1080x1080 dimension.
```

## 4. Result: Nano Banana 스타일의 결과물

이 프롬프트를 Gemini에 입력했을 때, AI는 위치 정보를 기반으로 해당 지역의 특징(판교의 현대적인 빌딩 숲, 횡성 안흥의 한적한 시골 풍경 등)을 추론하여 **Nano Banana** 특유의 몽글몽글하고 부드러운 3D 룩으로 렌더링해 줍니다.

### A. 경기도 성남시 판교 날씨 카드
![판교 날씨 카드](/assets/img/blog/weather-pangyo.png)  

### B. 강원도 횡성군 안흥면 날씨 카드
![횡성 날씨 카드](/assets/img/blog/weather-anhueng.png)

특히, 프롬프트 입력 당시의 실제 날씨(예: 영하의 기온, 눈 내리는 날씨)가 반영되어, 건물 지붕에 눈이 쌓이거나 차가운 색감의 조명이 적용된 것을 확인할 수 있습니다.

## 5. Insight & Next Steps

이번 작업을 통해 얻은 인사이트는 다음과 같습니다.

1.  **디테일한 재질(Material) 정의의 중요성:** 단순히 "3D로 그려줘"라고 하는 것보다 `PBR materials`, `Soft texture` 등을 명시했을 때 훨씬 완성도 높은 '미니어처' 느낌이 납니다.
2.  **데이터와 아트의 결합:** 날씨 API의 데이터를 프롬프트 변수로 넣어 자동화한다면, 매일 아침 그날의 날씨에 맞는 '오늘의 도시 카드'를 자동으로 발행하는 서비스도 가능할 것입니다.

앞으로는 이 **Nano Banana** 스타일을 더 발전시켜, 개발자들을 위한 GitHub 프로필 이미지나 프로젝트 아키텍처 다이어그램을 이처럼 예쁜 3D 아이소메트릭 형태로 시각화하는 방법도 연구해 볼 예정입니다.

-----

위 프롬프트 구조를 활용하여 "서울 남산타워"나 "제주도" 버전의 이미지를 생성해 보세요.