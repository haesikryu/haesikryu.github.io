---
title: Jekyll 다국어 블로그 구성 가이드
date: 2025-07-10 22:04:00 +0900
categories: [Blog]
tags: [Jekyll다국어블로그, GitHub, jekyll-polyglot, 다국어, 개발자블로그, 국제화i18n, 블로그운영전략, 정적사이트생성기]
---

# Jekyll 다국어 블로그 구성 가이드

## 1. 플러그인 설치 및 설정

### jekyll-polyglot 플러그인 사용

```yaml
# _config.yml
plugins:
  - jekyll-polyglot

# 다국어 설정
languages: ["ko", "en", "ja"]
default_lang: "ko"
exclude_from_localization: ["javascript", "images", "css", "favicon.ico"]
parallel_localization: true

# 사이트 기본 정보 (다국어별)
title:
  ko: "개발자 블로그"
  en: "Developer Blog"
  ja: "開発者ブログ"

description:
  ko: "개발 관련 기술 블로그입니다"
  en: "Technical blog about development"
  ja: "開発に関する技術ブログです"
```

### Gemfile 설정

```ruby
# Gemfile
source "https://rubygems.org"

gem "jekyll", "~> 4.3.0"
gem "jekyll-polyglot"
gem "minima", "~> 2.5"

group :jekyll_plugins do
  gem "jekyll-feed", "~> 0.12"
  gem "jekyll-sitemap"
  gem "jekyll-seo-tag"
end
```

## 2. 디렉토리 구조

```
your-blog/
├── _config.yml
├── _data/
│   └── navigation.yml
├── _includes/
│   ├── head.html
│   ├── header.html
│   └── language-selector.html
├── _layouts/
│   ├── default.html
│   └── post.html
├── _posts/
│   ├── ko/
│   │   ├── 2024-01-01-첫번째-포스트.md
│   │   └── 2024-01-15-jekyll-사용법.md
│   ├── en/
│   │   ├── 2024-01-01-first-post.md
│   │   └── 2024-01-15-how-to-use-jekyll.md
│   └── ja/
│       ├── 2024-01-01-最初の投稿.md
│       └── 2024-01-15-jekyll使い方.md
├── _sass/
├── about/
│   ├── ko.md
│   ├── en.md
│   └── ja.md
├── assets/
├── index.md
└── Gemfile
```

## 3. 네비게이션 데이터 설정

```yaml
# _data/navigation.yml
ko:
  - name: "홈"
    url: "/"
  - name: "소개"
    url: "/about/"
  - name: "포스트"
    url: "/posts/"

en:
  - name: "Home"
    url: "/"
  - name: "About"
    url: "/about/"
  - name: "Posts"
    url: "/posts/"

ja:
  - name: "ホーム"
    url: "/"
  - name: "について"
    url: "/about/"
  - name: "投稿"
    url: "/posts/"
```

## 4. 레이아웃 파일

### _layouts/default.html

```html
<!DOCTYPE html>
<html lang="{{ site.active_lang }}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>
        {% if page.title %}
            {{ page.title }} | {{ site.title[site.active_lang] }}
        {% else %}
            {{ site.title[site.active_lang] }}
        {% endif %}
    </title>
    <meta name="description" content="{{ site.description[site.active_lang] }}">
    
    <!-- 다국어 SEO를 위한 hreflang 태그 -->
    {% for lang in site.languages %}
        {% if lang == site.default_lang %}
            <link rel="alternate" hreflang="{{ lang }}" href="{{ site.url }}{{ page.url }}" />
        {% else %}
            <link rel="alternate" hreflang="{{ lang }}" href="{{ site.url }}/{{ lang }}{{ page.url }}" />
        {% endif %}
    {% endfor %}
    
    <link rel="stylesheet" href="{{ '/assets/css/style.css' | relative_url }}">
</head>
<body>
    <header>
    <nav>
        <div class="nav-brand">
            <a href="{{ '/' | relative_url }}">{{ site.title[site.active_lang] }}</a>
        </div>
        
        <ul class="nav-menu">
            {% for nav in site.data.navigation[site.active_lang] %}
                <li><a href="{{ nav.url | relative_url }}">{{ nav.name }}</a></li>
            {% endfor %}
        </ul>
        
    </nav>
</header>
    
    <main>
        {{ content }}
    </main>
    
    {% include footer.html %}
</body>
</html>
```

### _includes/header.html

```html
<header>
    <nav>
        <div class="nav-brand">
            <a href="{{ '/' | relative_url }}">{{ site.title[site.active_lang] }}</a>
        </div>
        
        <ul class="nav-menu">
            {% for nav in site.data.navigation[site.active_lang] %}
                <li><a href="{{ nav.url | relative_url }}">{{ nav.name }}</a></li>
            {% endfor %}
        </ul>
        
    </nav>
</header>
```

### _includes/language-selector.html

```html
<div class="language-selector">
    <select onchange="changeLanguage(this.value)">
        {% for lang in site.languages %}
            <option value="{{ lang }}" {% if lang == site.active_lang %}selected{% endif %}>
                {% case lang %}
                    {% when 'ko' %}한국어
                    {% when 'en' %}English
                    {% when 'ja' %}日本語
                {% endcase %}
            </option>
        {% endfor %}
    </select>
</div>

<script>
function changeLanguage(lang) {
    var currentPath = window.location.pathname;
    var newPath;
    
    // 기본 언어(ko)인 경우 경로에서 언어 코드 제거
    if (lang === '{{ site.default_lang }}') {
        newPath = currentPath.replace(/^\/[a-z]{2}\//, '/');
    } else {
        // 다른 언어인 경우 경로에 언어 코드 추가
        if (currentPath.startsWith('/ko/') || currentPath.startsWith('/en/') || currentPath.startsWith('/ja/')) {
            newPath = currentPath.replace(/^\/[a-z]{2}\//, '/' + lang + '/');
        } else {
            newPath = '/' + lang + currentPath;
        }
    }
    
    window.location.href = newPath;
}
</script>
```

## 5. 포스트 작성

### 한국어 포스트 예시 (_posts/ko/2024-01-01-첫번째-포스트.md)

```markdown
---
layout: post
title: "첫 번째 포스트"
date: 2024-01-01
categories: [개발, Jekyll]
tags: [시작, 블로그]
lang: ko
---

# 첫 번째 포스트

안녕하세요! 이것은 첫 번째 포스트입니다.

## 소개

Jekyll로 다국어 블로그를 만들어보았습니다.
```

### 영어 포스트 예시 (_posts/en/2024-01-01-first-post.md)

```markdown
---
layout: post
title: "First Post"
date: 2024-01-01
categories: [development, Jekyll]
tags: [start, blog]
lang: en
---

# First Post

Hello! This is my first post.

## Introduction

I've created a multilingual blog using Jekyll.
```

## 6. 페이지 작성

### about/ko.md

```markdown
---
layout: page
title: "소개"
permalink: /about/
lang: ko
---

# 소개

개발자 블로그에 오신 것을 환영합니다.
```

### about/en.md

```markdown
---
layout: page
title: "About"
permalink: /about/
lang: en
---

# About

Welcome to my developer blog.
```

## 7. 메인 페이지 (index.md)

```markdown
---
layout: default
---

<div class="home">
    <h1>{{ site.title[site.active_lang] }}</h1>
    <p>{{ site.description[site.active_lang] }}</p>
    
    <div class="posts">
        {% for post in site.posts %}
            {% if post.lang == site.active_lang %}
                <article class="post-preview">
                    <h2><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h2>
                    <p class="post-meta">{{ post.date | date: "%Y-%m-%d" }}</p>
                    <p>{{ post.excerpt }}</p>
                </article>
            {% endif %}
        {% endfor %}
    </div>
</div>
```

## 8. 빌드 및 배포

### 로컬 실행

```bash
# 의존성 설치
bundle install

# 로컬 서버 실행
bundle exec jekyll serve

# 다국어 빌드
bundle exec jekyll build
```

### GitHub Actions 배포 (.github/workflows/pages.yml)

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Ruby
      uses: ruby/setup-ruby@v1
      with:
        ruby-version: '3.1'
        bundler-cache: true
    
    - name: Build site
      run: bundle exec jekyll build
    
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./_site
```

## 9. SEO 및 최적화

### 사이트맵 생성 (sitemap.xml)

```xml
---
layout: null
---
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
    {% for post in site.posts %}
        {% for lang in site.languages %}
            {% if post.lang == lang %}
                <url>
                    <loc>{{ site.url }}{% if lang != site.default_lang %}/{{ lang }}{% endif %}{{ post.url }}</loc>
                    <lastmod>{{ post.date | date_to_xmlschema }}</lastmod>
                    {% for other_lang in site.languages %}
                        {% if other_lang != lang %}
                            <xhtml:link rel="alternate" hreflang="{{ other_lang }}" 
                                       href="{{ site.url }}{% if other_lang != site.default_lang %}/{{ other_lang }}{% endif %}{{ post.url }}" />
                        {% endif %}
                    {% endfor %}
                </url>
            {% endif %}
        {% endfor %}
    {% endfor %}
</urlset>
```

## 10. 주의사항

1. **GitHub Pages 제한**: GitHub Pages는 플러그인을 제한적으로 지원하므로 GitHub Actions 사용 권장
2. **URL 구조**: 기본 언어는 `/`, 다른 언어는 `/언어코드/` 형태
3. **이미지 경로**: 모든 언어에서 동일한 이미지를 사용하도록 설정
4. **번역 일관성**: 모든 언어에 대해 동일한 포스트를 작성하는 것이 좋음

이 가이드를 따라하면 Jekyll로 완전한 다국어 블로그를 구축할 수 있습니다.

**그럼 하나의 포스트를 지원할 언어별로 작성해야 하는건가?**
맞습니다. Jekyll의 jekyll-polyglot 플러그인을 사용하면 하나의 포스트마다 지원할 언어별로 각각 작성해야 합니다.

# Jekyll 다국어 블로그 포스트 작성 전략

## 기본 원칙: 언어별 개별 파일 작성

Jekyll의 jekyll-polyglot 플러그인을 사용하면 **하나의 포스트마다 지원할 언어별로 각각 작성**해야 합니다.

### 예시: 하나의 포스트, 3개 언어

```
_posts/
├── ko/
│   └── 2024-01-01-jekyll-시작하기.md
├── en/
│   └── 2024-01-01-getting-started-with-jekyll.md
└── ja/
    └── 2024-01-01-jekyllを始める.md
```

## 현재 방식의 장단점

### ✅ 장점

- **완전한 번역 제어**: 언어별로 내용을 완전히 다르게 작성 가능
- **SEO 최적화**: 각 언어별로 독립적인 URL과 메타데이터
- **문화적 맞춤화**: 언어권별 독자를 고려한 콘텐츠 작성 가능
- **검색 엔진 친화적**: 각 언어별 키워드 최적화 가능
- **독립적 수정**: 한 언어 수정이 다른 언어에 영향 없음

### ❌ 단점

- **작업량 증가**: 포스트 하나당 지원 언어 수만큼 작성 필요
- **유지보수 복잡**: 내용 수정 시 모든 언어 버전 업데이트 필요
- **번역 일관성**: 모든 언어에 동일한 포스트가 없을 수 있음
- **시간 소모**: 번역 시간으로 인한 포스팅 주기 증가

## 대안적 접근 방법

### 1. 선택적 다국어 지원

모든 포스트를 번역하지 않고, 중요한 포스트만 다국어로 작성

```yaml
# _config.yml
languages: ["ko", "en"]
default_lang: "ko"
```

#### 파일 구조 예시

```
_posts/
├── ko/
│   ├── 2024-01-01-한국어-전용-포스트.md        # 한국어만
│   ├── 2024-01-15-중요한-포스트.md             # 양쪽 언어
│   └── 2024-01-20-일상-이야기.md              # 한국어만
├── en/
│   └── 2024-01-15-important-post.md           # 양쪽 언어
```

#### 포스트 메타데이터 활용

```markdown
---
layout: post
title: "중요한 포스트"
date: 2024-01-15
categories: [개발]
tags: [Jekyll, 블로그]
lang: ko
translations: 
  - lang: en
    url: /en/2024/01/15/important-post/
priority: high  # 번역 우선순위
---
```

### 2. 부분 번역 시스템

포스트에 번역 여부를 표시하고, 없는 경우 기본 언어로 표시

#### 레이아웃 수정 (_layouts/post.html)

```html
{% assign translated_post = site.posts | where: "slug", page.slug | where: "lang", site.active_lang | first %}
{% if translated_post %}
    <!-- 번역된 포스트 표시 -->
    <article class="post">
        <h1>{{ translated_post.title }}</h1>
        <div class="post-meta">
            <time datetime="{{ translated_post.date | date_to_xmlschema }}">
                {{ translated_post.date | date: "%Y-%m-%d" }}
            </time>
        </div>
        <div class="post-content">
            {{ translated_post.content }}
        </div>
    </article>
{% else %}
    <!-- 기본 언어 포스트 표시 + 번역 없음 안내 -->
    <div class="translation-notice">
        <p class="notice-text">
            {% case site.active_lang %}
                {% when 'en' %}This post is not available in English. Showing original Korean version.
                {% when 'ja' %}この投稿は日本語で利用できません。元の韓国語版を表示しています。
                {% else %}이 포스트는 {{ site.active_lang }}로 번역되지 않았습니다.
            {% endcase %}
        </p>
        <button onclick="translatePage()" class="translate-btn">
            {% case site.active_lang %}
                {% when 'en' %}Auto Translate
                {% when 'ja' %}自動翻訳
                {% else %}자동 번역
            {% endcase %}
        </button>
    </div>
    
    {% assign original_post = site.posts | where: "slug", page.slug | where: "lang", site.default_lang | first %}
    <article class="post original-lang">
        <h1>{{ original_post.title }}</h1>
        <div class="post-content">
            {{ original_post.content }}
        </div>
    </article>
{% endif %}
```

#### 스타일링 (CSS)

```css
.translation-notice {
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 6px;
    padding: 1rem;
    margin-bottom: 2rem;
}

.notice-text {
    margin: 0 0 0.5rem 0;
    color: #6c757d;
}

.translate-btn {
    background: #007bff;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
}

.original-lang {
    opacity: 0.9;
}
```

### 3. 자동 번역 + 수동 검수 시스템

초기 번역을 자동화하고 필요시 수동 검수

#### 포스트 메타데이터

```markdown
---
layout: post
title: "포스트 제목"
date: 2024-01-01
lang: ko
translation_status:
  en: 
    status: "auto"      # auto, manual, reviewed
    date: "2024-01-02"
    quality: "draft"    # draft, good, excellent
  ja:
    status: "none"
---
```

#### 번역 상태 표시

```html
<!-- _includes/translation-status.html -->
{% if page.translation_status %}
    <div class="translation-status">
        {% for lang_data in page.translation_status %}
            {% assign lang = lang_data[0] %}
            {% assign status = lang_data[1] %}
            
            <span class="status-badge status-{{ status.status }}">
                {{ lang | upcase }}: 
                {% case status.status %}
                    {% when 'auto' %}자동 번역
                    {% when 'manual' %}수동 번역
                    {% when 'reviewed' %}검수 완료
                    {% else %}번역 없음
                {% endcase %}
            </span>
        {% endfor %}
    </div>
{% endif %}
```

### 4. 카테고리별 다국어 전략

콘텐츠 유형에 따라 다국어 지원을 차별화

#### 콘텐츠 분류 및 전략

| 카테고리 | 다국어 지원 | 이유 |
|----------|-------------|------|
| 기술 튜토리얼 | 🌐 영어 위주 | 국제적 공유 가치 |
| 개인 일상 | 🇰🇷 한국어만 | 개인적 내용 |
| 개발 도구 리뷰 | 🌐 다국어 | 범용적 유용성 |
| 한국 IT 뉴스 | 🇰🇷 한국어만 | 로컬 컨텍스트 |

#### 설정 예시

```yaml
# _config.yml
content_strategy:
  tutorial:
    languages: ["ko", "en"]
    priority: "high"
  personal:
    languages: ["ko"]
    priority: "low"
  review:
    languages: ["ko", "en", "ja"]
    priority: "medium"
  news:
    languages: ["ko"]
    priority: "low"
```

## 권장 접근법: 단계적 구현

### 1단계: 한국어 중심 시작
```markdown
# 초기 설정
languages: ["ko"]
default_lang: "ko"

# 포스트 작성
_posts/ko/2024-01-01-first-post.md
_posts/ko/2024-01-15-second-post.md
```

### 2단계: 인기 포스트 영어 번역
```markdown
# 설정 업데이트
languages: ["ko", "en"]
default_lang: "ko"

# 선택적 번역
_posts/ko/2024-01-01-first-post.md
_posts/en/2024-01-01-first-post.md  # 번역 추가
_posts/ko/2024-01-15-second-post.md (한국어만)
```

### 3단계: 체계적 다국어 확장
```markdown
# 전체 다국어 지원
languages: ["ko", "en", "ja"]
default_lang: "ko"

# 카테고리별 전략 적용
_posts/ko/tutorial/2024-01-01-jekyll-guide.md
_posts/en/tutorial/2024-01-01-jekyll-guide.md
_posts/ja/tutorial/2024-01-01-jekyll-guide.md
```

## 실용적 팁

### 번역 작업 효율화

1. **템플릿 활용**
```markdown
# 포스트 템플릿
---
layout: post
title: "[번역 필요]"
date: YYYY-MM-DD
categories: []
tags: []
lang: 
original_lang: ko
translation_date: 
translator: 
---

# 제목

내용...
```

2. **번역 체크리스트**
- [ ] 제목 번역
- [ ] 카테고리/태그 번역
- [ ] 본문 번역
- [ ] 코드 주석 번역
- [ ] 링크 현지화
- [ ] 이미지 alt 텍스트 번역

3. **자동화 도구 활용**
```bash
# 번역할 포스트 목록 생성
find _posts/ko -name "*.md" | while read file; do
    echo "번역 필요: $file"
done
```

### 품질 관리

1. **번역 품질 등급**
- ⭐⭐⭐ 완전 번역 (네이티브 수준)
- ⭐⭐ 좋은 번역 (의미 전달)
- ⭐ 기본 번역 (이해 가능)

2. **업데이트 동기화**
```markdown
---
last_updated: 2024-01-15
sync_status:
  ko: "2024-01-15"
  en: "2024-01-10"  # 업데이트 필요
  ja: "2024-01-15"
---
```

## 결론

다국어 블로그 운영은 **완벽함보다는 지속가능성**이 중요합니다. 

- 처음에는 한국어 중심으로 시작
- 인기 포스트부터 점진적 번역
- 카테고리별 차별화된 전략 적용
- 자동화 도구 활용으로 효율성 증대

이런 접근법으로 부담을 줄이면서도 다국어 블로그의 장점을 충분히 활용할 수 있습니다.