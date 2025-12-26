---
layout: post
title: GitHub Pages 블로그 SEO 최적화하기 (검색 엔진 노출 높이기)
date: 2025-12-26 20:00:00 +0900
categories: [dev, seo]
tags: [github-pages, jekyll, seo, google-search-console]
---

기술 블로그를 열심히 작성했는데 검색 결과에 나오지 않는다면 정말 속상하겠죠? 오늘은 제 GitHub Pages(Jekyll) 블로그에 **SEO(검색 엔진 최적화)** 작업을 적용한 과정을 공유합니다.

블로그를 갓 만드셨거나 검색 유입이 적어 고민이신 분들은 이 글을 따라 해보세요!

## 1. Jekyll SEO 플러그인 설치

Jekyll에는 SEO를 돕는 강력한 플러그인들이 있습니다. 가장 필수적인 두 가지를 설치합니다.

- **`jekyll-seo-tag`**: 페이지마다 적절한 메타 태그(Title, Description, Open Graph 등)를 자동으로 생성해줍니다.
- **`jekyll-sitemap`**: 검색 엔진 로봇이 내 사이트 구조를 쉽게 파악하도록 `sitemap.xml` 파일을 자동으로 생성해줍니다.

### 적용 방법
`Gemfile`을 열어 아래 내용을 추가합니다.

```ruby
gem "jekyll-sitemap"
gem "jekyll-seo-tag"
```

그리고 터미널에서 설치 명령어를 실행합니다.

```bash
bundle install
```

## 2. robots.txt 생성

`robots.txt`는 검색 엔진 크롤러에게 "내 사이트는 여기고, 사이트맵은 저기 있어"라고 알려주는 길잡이 역할을 합니다. 블로그 루트 디렉토리(최상위 폴더)에 `robots.txt` 파일을 만들고 아래 내용을 작성합니다.

```text
User-agent: *
Allow: /

Sitemap: https://haesikryu.github.io/sitemap.xml
```

> **Note**: `Sitemap:` 뒤에는 본인의 블로그 주소로 변경하여 `sitemap.xml` 경로를 적어주어야 합니다.

## 3. Google Search Console 등록

구글 검색 결과에 내 블로그가 잘 나오게 하려면 **Google Search Console**에 등록하는 것이 필수입니다.

1.  [Google Search Console](https://search.google.com/search-console)에 접속합니다.
2.  **'속성 추가'**를 누르고 **'URL 접두어'** 방식을 선택합니다.
3.  내 블로그 주소(예: `https://haesikryu.github.io`)를 입력합니다.
4.  소유권 확인 방법 중 **'HTML 태그'**를 선택합니다.
5.  `<meta name="google-site-verification" content="..." />` 형태의 코드가 나오는데, 여기서 `content` 안에 있는 값만 복사합니다.

## 4. _config.yml 설정

복사한 소유권 확인 코드를 Jekyll 설정 파일인 `_config.yml`에 추가합니다. 이렇게 하면 모든 페이지의 헤더에 자동으로 인증 코드가 심어집니다.

```yaml
# _config.yml 파일

webmaster_verifications:
  google: "복사한_인증_코드_붙여넣기"
  # bing: ... (빙 검색 등록 시 사용)
  # naver: ... (네이버 서치어드바이저 등록 시 사용)
```

## 5. 배포 및 확인

모든 설정이 끝났으면 GitHub에 변경 사항을 올립니다.

```bash
git add Gemfile _config.yml robots.txt
git commit -m "Enhance SEO: Add sitemap & seo plugins"
git push origin main
```

사이트 배포가 완료(약 1~3분 소요)된 후, 다시 Google Search Console로 돌아가 **[확인]** 버튼을 누르면 "소유권 확인됨" 메시지가 뜹니다.

이제 며칠 기다리면 구글에서 내 글들이 하나둘씩 검색되기 시작할 것입니다! 🎉
