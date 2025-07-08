---
title: GitHub Pages에에 Google Analytics 연동하는 방법 (GA4 기준)
date: 2025-07-09 07:50:00 +0900
categories: [Blog]
tags: [GitHubPages, GoogleAnalytics, GA4, Jekyll, 웹분석, 블로그운영, 정적사이트, 트래픽분석]

---

# GitHub Pages에에 Google Analytics 연동하는 방법 (GA4 기준)

개발자나 기술 블로거라면 방문자 수, 유입 경로, 페이지별 트래픽을 파악하고 싶을 때가 많습니다. 이 가이드는 GitHub Pages 기반 블로그에 **Google Analytics 4 (GA4)**를 연동하는 방법을 처음 해보는 분도 쉽게 따라할 수 있도록 단계별로 상세히 안내합니다.

---

## 사전 준비사항

### 필요한 것들
- **Google 계정 (Gmail)** - 없다면 [여기서 생성](https://accounts.google.com/signup)
- **GitHub Pages 블로그** - 이미 운영 중이어야 함
- **기본적인 HTML/파일 편집 지식**

### 지원되는 블로그 플랫폼
- Jekyll 기반 블로그
- Hugo 기반 블로그  
- 정적 HTML 사이트
- 기타 GitHub Pages 호스팅 사이트

---

## STEP 1: Google Analytics 계정 설정

### 1-1. Google Analytics 접속
1. 웹브라우저에서 [https://analytics.google.com/](https://analytics.google.com/) 접속
2. Google 계정으로 로그인
3. 처음 접속이라면 "시작하기" 버튼 클릭

### 1-2. 계정 만들기
1. **계정 이름** 입력
   - 예시: `MyBlog Analytics`, `개인블로그분석` 등
   - 나중에 여러 사이트를 관리할 때 구분하기 쉬운 이름으로 설정
2. **데이터 공유 설정**
   - 기본값 그대로 두거나 필요에 따라 체크 해제
   - 잘 모르겠다면 기본값 유지 권장
3. **"다음"** 클릭

### 1-3. 속성 만들기
1. **속성 이름** 입력
   - 예시: `github-blog`, `my-tech-blog` 등
   - 블로그 이름과 비슷하게 설정하면 좋음
2. **보고 시간대** 선택
   - 한국: `(GMT+09:00) 서울`
   - 본인이 거주하는 지역의 시간대 선택
3. **통화** 선택
   - 한국: `대한민국 원화(KRW)`
   - 광고 수익이 있다면 해당 통화 선택
4. **"다음"** 클릭

### 1-4. 비즈니스 정보 입력
1. **업종 카테고리**
   - 기술 블로그: `컴퓨터 및 전자제품`
   - 개인 블로그: `온라인 커뮤니티`
   - 잘 모르겠다면 `기타` 선택
2. **비즈니스 규모**
   - 개인 블로그: `소규모`
   - 회사 블로그: 해당 규모 선택
3. **Analytics 사용 목적**
   - `사이트 또는 앱의 성과 측정` 체크 (필수)
   - 다른 항목들도 필요에 따라 체크
4. **"만들기"** 클릭

---

## STEP 2: 웹사이트 데이터 스트림 설정

### 2-1. 플랫폼 선택
1. **"웹"** 선택 (GitHub Pages는 웹사이트이므로)

### 2-2. 웹 스트림 세부정보 입력
1. **웹사이트 URL** 입력
   - 기본 GitHub Pages: `https://username.github.io`
   - 커스텀 도메인 사용 시: `https://yourdomain.com`
   - ⚠️ **중요**: `http://`가 아닌 `https://`로 시작해야 함
   
2. **스트림 이름** 입력
   - 예시: `My GitHub Blog`, `Tech Blog Main` 등
   - 나중에 여러 사이트를 추가할 때 구분하기 쉬운 이름

3. **"스트림 만들기"** 클릭

### 2-3. 측정 ID 확인 및 복사
1. 스트림 생성 후 나타나는 화면에서 **측정 ID** 확인
2. 측정 ID는 `G-XXXXXXXXXX` 형태
3. 📋 **이 ID를 복사해서 메모장에 저장** (나중에 사용)

---

## STEP 3: 추적 코드 설치

### 3-1. 추적 코드 복사
Google Analytics에서 제공하는 추적 코드:

```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

⚠️ **중요**: `G-XXXXXXXXXX` 부분을 본인의 실제 측정 ID로 변경해야 함

### 3-2. Jekyll 블로그에 설치하기

#### 방법 1: _config.yml 파일 수정 (권장)
```yaml
# _config.yml 파일에 추가
google_analytics: G-XXXXXXXXXX
```

#### 방법 2: _includes 폴더에 파일 생성
1. `_includes` 폴더에 `google-analytics.html` 파일 생성
2. 파일 내용:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id={{ site.google_analytics }}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '{{ site.google_analytics }}');
</script>
```

3. `_layouts/default.html` 파일의 `<head>` 태그 안에 추가:
```html
{% if site.google_analytics %}
  {% include google-analytics.html %}
{% endif %}
```

#### 방법 3: 직접 HTML 파일에 추가
1. `_layouts/default.html` 파일 열기
2. `<head>` 태그 안에 추적 코드 직접 붙여넣기
3. 측정 ID를 본인의 실제 ID로 변경

### 3-3. 일반 HTML 사이트에 설치하기
1. 모든 HTML 파일의 `<head>` 태그 안에 추적 코드 추가
2. 또는 공통 헤더 파일이 있다면 그 파일에 추가

---

## STEP 4: 변경사항 적용 및 배포

### 4-1. GitHub에 변경사항 업로드
```bash
# 터미널 또는 명령 프롬프트에서
git add .
git commit -m "Add Google Analytics tracking code"
git push origin main
```

### 4-2. GitHub Pages 배포 확인
1. GitHub 저장소 페이지로 이동
2. **Settings** → **Pages** 메뉴 확인
3. 배포 상태가 ✅ 초록색이 되면 완료

---

## STEP 5: 설치 확인 및 테스트

### 5-1. 실시간 확인
1. Google Analytics 대시보드로 돌아가기
2. 좌측 메뉴에서 **보고서** → **실시간** 클릭
3. 새 탭에서 본인의 블로그 접속
4. 실시간 보고서에서 방문자 수 확인 (1~2분 소요)

### 5-2. 브라우저 개발자 도구로 확인
1. 블로그 페이지에서 **F12** 키 또는 **우클릭** → **검사**
2. **Console** 탭에서 `gtag` 입력 후 엔터
3. 에러 없이 함수 정보가 표시되면 정상 설치

### 5-3. 페이지 소스 확인
1. 블로그 페이지에서 **Ctrl+U** (페이지 소스 보기)
2. **Ctrl+F**로 `googletagmanager` 검색
3. 추적 코드가 포함되어 있으면 정상 설치

---

## STEP 6: 기본 설정 최적화

### 6-1. 향상된 측정 기능 활성화
1. Google Analytics → **관리** → **데이터 스트림**
2. 생성한 스트림 클릭
3. **향상된 측정** 섹션에서 다음 항목 체크:
   -  페이지 조회수
   - 스크롤
   - 아웃바운드 클릭
   - 사이트 검색
   - 동영상 참여도
   - 파일 다운로드

### 6-2. 목표 설정 (선택사항)
1. **관리** → **목표** 클릭
2. **새 목표** 생성
3. 목표 유형 선택:
   - 특정 페이지 방문 (예: About 페이지)
   - 특정 시간 이상 머물기
   - 특정 링크 클릭

---

## 문제해결 가이드

### 문제 1: 실시간 데이터가 표시되지 않음
**해결방법:**
1. 브라우저 캐시 삭제
2. 시크릿 모드에서 블로그 접속
3. 광고 차단 프로그램 비활성화
4. 24시간 후 다시 확인

### 문제 2: 측정 ID를 찾을 수 없음
**해결방법:**
1. Google Analytics → **관리** → **데이터 스트림**
2. 해당 스트림 클릭
3. 측정 ID 다시 확인 및 복사

### 문제 3: Jekyll 빌드 에러
**해결방법:**
1. `_config.yml` 파일 문법 확인
2. YAML 문법 검사기 사용
3. 들여쓰기 및 콜론 뒤 공백 확인

### 문제 4: GitHub Pages 배포 실패
**해결방법:**
1. **Actions** 탭에서 에러 로그 확인
2. Jekyll 플러그인 호환성 확인
3. 로컬에서 `bundle exec jekyll serve` 테스트

---

## 데이터 분석 시작하기

### 주요 보고서 살펴보기
1. **실시간**: 현재 방문자 현황
2. **사용자**: 방문자 수, 신규/재방문 비율
3. **참여도**: 페이지뷰, 세션 길이, 이탈률
4. **트래픽 소스**: 방문자 유입 경로

### 유용한 측정 기준
- **페이지별 조회수**: 인기 게시물 파악
- **유입 경로**: 검색엔진, 소셜미디어 등
- **기기별 접속**: 모바일/데스크톱 비율
- **지