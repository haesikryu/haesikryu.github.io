# 🌟 haesikryu.github.io

[![Website](https://img.shields.io/website?url=https%3A%2F%2Fhaesikryu.github.io)](https://haesikryu.github.io)
[![Jekyll](https://img.shields.io/badge/Jekyll-4.3.0-red?logo=jekyll)](https://jekyllrb.com/)
[![Chirpy](https://img.shields.io/badge/Theme-Chirpy-blue)](https://github.com/cotes2020/jekyll-theme-chirpy)
[![License](https://img.shields.io/github/license/haesikryu/haesikryu.github.io)](LICENSE)

> 개인 블로그 및 기술 문서를 공유하는 Jekyll 기반 웹사이트입니다.

## 🚀 사이트 방문

**Live Site**: [https://haesikryu.github.io](https://haesikryu.github.io)

## 📝 소개

이 저장소는 Jekyll과 Chirpy 테마를 사용하여 구축된 개인 블로그입니다. 기술적인 학습 내용, 프로젝트 경험, 그리고 개발 과정에서의 인사이트를 공유합니다.

### ✨ 주요 특징

- 🎨 **반응형 디자인**: 모바일과 데스크톱 환경 완벽 지원
- 🌓 **다크/라이트 테마**: 사용자 취향에 맞는 테마 선택
- 🔍 **전체 검색**: 포스트 내용 실시간 검색 기능
- 📚 **카테고리 & 태그**: 체계적인 콘텐츠 분류
- 💬 **댓글 시스템**: 독자와의 소통 지원
- 📡 **RSS 피드**: 구독 기능 제공
- ⚡ **빠른 로딩**: 정적 사이트 생성으로 최적화된 성능

## 🛠️ 기술 스택

| 기술 | 용도 |
|------|------|
| **Jekyll** | 정적 사이트 생성기 |
| **Chirpy Theme** | 블로그 테마 |
| **GitHub Pages** | 호스팅 플랫폼 |
| **GitHub Actions** | CI/CD 자동화 |
| **Liquid** | 템플릿 언어 |
| **SCSS** | 스타일시트 |

## 📂 프로젝트 구조

```
haesikryu.github.io/
├── 📁 _posts/          # 블로그 포스트
├── 📁 _tabs/           # 네비게이션 탭 페이지
├── 📁 _data/           # 사이트 데이터
├── 📁 _includes/       # 재사용 컴포넌트
├── 📁 _layouts/        # 페이지 레이아웃
├── 📁 _sass/           # 스타일시트
├── 📁 assets/          # 이미지, JS, CSS 파일
├── 📄 _config.yml      # Jekyll 설정
├── 📄 index.html       # 홈페이지
└── 📄 README.md        # 프로젝트 설명
```

## 🚀 로컬 개발 환경 설정

### 사전 요구사항

- Ruby 2.7.0 이상
- RubyGems
- Git

### 설치 및 실행

```bash
# 1. 저장소 클론
git clone https://github.com/haesikryu/haesikryu.github.io.git
cd haesikryu.github.io

# 2. 의존성 설치
bundle install

# 3. 로컬 서버 실행
bundle exec jekyll serve

# 4. 브라우저에서 확인
# http://localhost:4000
```

### 개발 모드 (실시간 새로고침)

```bash
bundle exec jekyll serve --livereload
```

## ✍️ 포스트 작성 가이드

### 새 포스트 생성

```bash
# _posts 디렉토리에 다음 형식으로 파일 생성
# YYYY-MM-DD-제목.md
```

### 포스트 템플릿

```markdown
---
title: "포스트 제목"
date: YYYY-MM-DD HH:MM:SS +0900
categories: [카테고리1, 하위카테고리]
tags: [태그1, 태그2, 태그3]
image:
  path: /assets/img/posts/image.jpg
  alt: 이미지 설명
---

포스트 내용을 여기에 작성합니다.
```

### 지원하는 포스트 유형

- 📖 **기술 블로그**: 개발 경험과 학습 내용
- 💡 **튜토리얼**: 단계별 가이드
- 🔬 **프로젝트 리뷰**: 완료된 프로젝트 회고
- 🤔 **문제 해결**: 트러블슈팅 경험

## 🎨 커스터마이징

### 사이트 설정 변경

`_config.yml` 파일에서 다음 설정들을 수정할 수 있습니다:

```yaml
title: 사이트 제목
description: 사이트 설명
url: https://haesikryu.github.io
author:
  name: 작성자 이름
  email: 이메일 주소
  links:
    - https://github.com/haesikryu
```

### 테마 색상 변경

`_sass/jekyll-theme-chirpy.scss` 파일에서 CSS 변수를 수정하여 색상을 변경할 수 있습니다.

## 🔄 배포 프로세스

이 사이트는 **GitHub Actions**를 통해 자동으로 배포됩니다:

1. `main` 브랜치에 코드 푸시
2. GitHub Actions가 자동으로 Jekyll 빌드 실행
3. 빌드된 사이트가 GitHub Pages에 배포
4. 몇 분 내에 변경사항이 라이브 사이트에 반영

### 배포 상태 확인

[![Build and Deploy](https://github.com/haesikryu/haesikryu.github.io/actions/workflows/pages-deploy.yml/badge.svg)](https://github.com/haesikryu/haesikryu.github.io/actions/workflows/pages-deploy.yml)

## 📈 사이트 통계

- **빌드 시간**: ~2분
- **페이지 로딩 속도**: <1초
- **Lighthouse 점수**: 95+ (Performance, Accessibility, Best Practices, SEO)

## 🤝 기여하기

버그 리포트나 개선 제안이 있으시면 언제든 이슈를 등록해주세요!

### 기여 방법

1. 이 저장소를 Fork 합니다
2. 새로운 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add some amazing feature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성합니다

## 📞 연락처

- 📧 **Email**: [이메일 주소]
- 💼 **LinkedIn**: [LinkedIn 프로필]
- 🐦 **Twitter**: [Twitter 계정]
- 📱 **Instagram**: [Instagram 계정]

## 📄 라이선스

이 프로젝트는 [MIT License](LICENSE) 하에 배포됩니다.

## 🙏 감사 인사

- [Jekyll](https://jekyllrb.com/) - 정적 사이트 생성기
- [Chirpy Theme](https://github.com/cotes2020/jekyll-theme-chirpy) - 아름다운 Jekyll 테마
- [GitHub Pages](https://pages.github.com/) - 무료 호스팅 서비스

---

<div align="center">
  
**⭐ 이 프로젝트가 도움이 되었다면 별점을 눌러주세요! ⭐**

Made with ❤️ by [haesikryu](https://github.com/haesikryu)

</div>
