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
    {% include header.html %}
    
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
        
        {% include language-selector.html %}
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