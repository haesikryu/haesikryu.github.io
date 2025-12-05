---
title: "Github Page에 댓글 기능 추가하기"
date: 2025-12-06 01:01:49 +0900
categories: [Blog]
tags: [Github, Giscus, Utterances, Reaction]
---

# [Github Page] Github Page에 댓글 기능 추가하기

Github Page를 운영하면서 가장 아쉬웠던 부분이 **좋아요**, **싫어요**와 같은 리엑션 기능이 없는 것이었습니다.

그래서 Gemini 3, Antigravity를 활용해서 github page에 리액션 기능을 추가했고, 제가 했던 방법을 정리해서 공유합니다.

GitHub Pages는 정적 웹사이트 호스팅 서비스이기 때문에, 데이터베이스(DB)가 없어서 자체적으로 댓글 기능을 구현할 수는 없습니다. 대신 **외부 댓글 서비스(JavaScript 위젯)**를 연동하여 이 문제를 해결합니다.

기술 블로그 운영자들에게 가장 인기 있고 추천하는 방법 3가지를 정리해 드립니다.

-----

### 1. Giscus (가장 추천 ⭐)

현재 개발자 블로그에서 가장 많이 사용되는 도구입니다. **GitHub Discussions** 기능을 기반으로 작동합니다.

  * **장점:** 무료, 광고 없음, 트래킹 없음. 방문자가 GitHub 계정으로 로그인하여 댓글을 남기므로 기술 블로그 독자층(개발자)과 잘 맞습니다.
  * **원리:** 댓글이 달리면 해당 리포지토리의 'Discussions' 탭에 스레드로 저장됩니다.
  * **설치 방법:**
    1.  블로그 리포지토리의 **Settings**에서 **Discussions** 기능을 켭니다.
    2.  [Giscus 앱](https://github.com/apps/giscus)을 해당 리포지토리에 설치합니다.
    3.  [Giscus 공식 홈페이지](https://giscus.app/ko)에 접속하여 저장소 이름 등을 입력하면 자동으로 `<script>` 태그를 생성해 줍니다.
    4.  생성된 코드를 블로그 템플릿 파일(예: `_layouts/post.html`)에 붙여넣습니다.

### 2. Utterances

Giscus가 나오기 전에 가장 많이 쓰이던 도구로, **GitHub Issues**를 기반으로 작동합니다.

  * **장점:** Giscus와 유사하게 GitHub 친화적이며 가볍습니다.
  * **단점:** 댓글이 달릴 때마다 'Issue'가 생성되거나 이슈에 댓글이 달리는 방식이라, 프로젝트 관리 목적의 이슈 트래커와 섞이면 관리가 지저분해질 수 있습니다. (이 때문에 최근엔 Discussions 기반인 Giscus로 넘어가는 추세입니다.)
  * **설치 방법:** [Utterances 홈페이지](https://utteranc.es/)에서 설정 후 스크립트를 발급받습니다.

### 3. Disqus

가장 대중적이고 오래된 댓글 서비스입니다. GitHub 계정이 없는 일반 대중도 쉽게 댓글을 달 수 있습니다.

  * **장점:** 소셜 로그인(구글, 페이스북 등) 지원, 강력한 관리자 기능, 비회원 댓글 허용 가능.
  * **단점:** **무겁습니다.** 사이트 로딩 속도가 느려질 수 있으며, 무료 버전은 **광고**가 붙고 사용자 추적(Tracking) 이슈가 있어 개발자들은 선호하지 않는 경향이 있습니다.
  * **설치 방법:** Disqus 사이트 가입 후 제공되는 유니버셜 코드를 삽입합니다.

-----

### 📊 요약 및 비교

| 특징 | Giscus (추천) | Utterances | Disqus |
| :--- | :--- | :--- | :--- |
| **저장소** | GitHub Discussions | GitHub Issues | Disqus 자체 서버 |
| **로그인** | GitHub 계정 필수 | GitHub 계정 필수 | 다양한 SNS 및 비회원 |
| **광고/비용** | 무료 / 없음 | 무료 / 없음 | 무료 버전 광고 있음 |
| **속도** | 빠름 | 빠름 | 다소 느림 |
| **주요 대상** | 개발자 친화적 | 개발자 친화적 | 일반 대중 친화적 |

-----
## 그래서 저는 개발자 느낌이 물씬 나는 1번 Giscus를 선택했습니다.

그럼 이제부터는 기술 블로그에 **Giscus**를 적용하는 과정을 단계별로 상세하게 안내해 드리겠습니다. Giscus는 설정이 매우 간단해서 복잡한 코딩 없이 진행할 수 있습니다.

> 준비물: 본인의 블로그 GitHub 리포지토리 접근 권한

-----

### 1단계: GitHub 저장소 설정 (Discussions 켜기)

Giscus는 댓글을 GitHub의 'Discussions(토론)' 탭에 저장합니다. 따라서 리포지토리에서 이 기능을 먼저 활성화해야 합니다.

1.  블로그용 **GitHub 리포지토리**로 이동합니다.
2.  상단 메뉴의 **Settings(설정)** 탭을 클릭합니다.
3.  **General(일반)** 메뉴에서 스크롤을 조금 내려 **Features** 섹션을 찾습니다.
4.  **Discussions** 체크박스를 클릭하여 활성화합니다.
      * *참고: 이미 체크되어 있다면 그대로 두시면 됩니다.*

### 2단계: Giscus 앱 설치

Giscus 봇이 내 리포지토리의 Discussions에 글을 쓸 수 있도록 권한을 주는 과정입니다.

1.  [Giscus 앱 설치 페이지](https://github.com/apps/giscus)로 이동합니다.
2.  **Install** 버튼을 클릭합니다.
3.  **Repository access**에서 `All repositories`보다는 **`Only select repositories`**를 선택하고, 블로그 리포지토리만 선택하는 것을 보안상 추천합니다.
4.  **Install**을 눌러 완료합니다.

### 3단계: 설정 스크립트 생성 (자동 생성)

코드를 직접 짤 필요 없이, Giscus 공식 사이트에서 옵션을 선택하면 자동으로 만들어줍니다.

1.  [Giscus 공식 홈페이지(한국어)](https://giscus.app/ko)에 접속합니다.
2.  **저장소** 섹션에 `사용자명/리포지토리명`을 입력합니다. (예: `honggildong/my-tech-blog`)
      * *입력 후 로딩이 돌면서 "성공\! 이 저장소는..." 이라는 메시지가 나와야 합니다.*
3.  **페이지 ↔️ discussion 연결** 섹션에서 **`pathname`**을 선택하는 것을 가장 추천합니다.
      * *이유: 블로그 글의 주소(URL 경로)를 기준으로 댓글 공간을 생성하므로 가장 정확합니다.*
4.  **Discussion 카테고리**는 보통 `General` 또는 `Announcements`를 선택합니다. (댓글이 이 카테고리에 쌓입니다.)
5.  **기능** 및 **테마**는 취향껏 선택합니다. (보통 기본값이나 `Github Light`를 많이 씁니다.)
6.  스크롤을 맨 아래로 내리면 **`구성 활성화`** 부분에 `<script>` 코드가 생성되어 있습니다. 이 코드를 **복사**합니다.

### 4단계: 블로그 코드에 붙여넣기

이제 복사한 코드를 블로그의 "게시글 레이아웃" 파일에 붙여넣으면 끝입니다. 사용 중인 정적 사이트 생성기(Jekyll 등)에 따라 파일 위치가 조금 다를 수 있지만, 기본 원리는 같습니다.

**가장 일반적인 Jekyll(제킬) 테마 기준:**

1.  블로그 프로젝트 폴더에서 "_layouts" 폴더를 엽니다.
2.  "post.html" 파일을 엽니다. (이 파일이 블로그 게시글의 뼈대입니다.)
3.  파일 내용 중 "{{ content }}" (본문 내용이 들어가는 부분)를 찾습니다.
4.  그 **바로 아래**, 혹은 "<article>" 태그가 닫히기 직전에 복사한 스크립트를 붙여넣습니다.

**코드 예시:**

```html
<article class="post-content">
  {{ content }}
</article>

<script src="https://giscus.app/client.js"
        data-repo="사용자명/리포지토리명"
        data-repo-id="R_kgD..."
        data-category="General"
        data-category-id="DIC_..."
        data-mapping="pathname"
        data-strict="0"
        data-reactions-enabled="1"
        data-emit-metadata="0"
        data-input-position="bottom"
        data-theme="preferred_color_scheme"
        data-lang="ko"
        crossorigin="anonymous"
        async>
</script>
```

5.  파일을 저장하고 GitHub에 `commit` 및 `push` 합니다.

-----

### 적용이 잘 되었는지 확인하기

잠시 후(GitHub Pages 배포 완료 후) 블로그의 아무 게시글이나 들어가 보세요. 글 하단에 댓글 입력창이 나타났다면 성공입니다! 방문자가 댓글을 남기면 GitHub 로그인 팝업이 뜨고, 작성된 댓글은 리포지토리의 Discussions 탭에서 확인할 수 있습니다.

-----

### 적용 팁 (Jekyll 테마 기준)

대부분의 GitHub Pages 블로그(Jekyll)는 "_layouts" 폴더 안에 게시글의 뼈대를 담당하는 "post.html" 파일이 있습니다.

1. 위에서 선택한 서비스의 스크립트 코드를 복사합니다.
2. "_layouts/post.html" 파일을 엽니다.
3. 본문 내용("{{ content }}")이 끝나는 하단 부분에 복사한 코드를 붙여넣습니다.

**예시 (Giscus 스크립트 위치):**

```html
<article class="post">
  {{ content }}
</article>

<script src="https://giscus.app/client.js"
        data-repo="username/repo"
        ...
        crossorigin="anonymous"
        async>
</script>
```

-----

참 쉽죠?