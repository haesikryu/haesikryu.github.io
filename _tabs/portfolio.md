---
title: Portfolio
icon: fas fa-project-diagram
order: 3
---

## 포트폴리오

제가 진행한 프로젝트들을 소개합니다.

### 주요 프로젝트

{% for project in site.portfolio limit:5 %}
### [{{ project.title }}]({{ project.url }})
{{ project.description }}
- 기술 스택: {{ project.tech_stack }}
- 기간: {{ project.period }}
{% endfor %}

### 기술 데모

- [GitHub Repository](https://github.com/haesikryu)
- [기술 블로그](https://haesikryu.github.io)

### 오픈 소스 기여

- 프로젝트 1
- 프로젝트 2

### 기술 스택

#### Frontend
- React.js
- TypeScript
- HTML5/CSS3

#### Backend
- Node.js
- Spring Boot
- Python

#### Database
- MySQL
- MongoDB
- Redis

#### DevOps
- Docker
- AWS
- CI/CD 