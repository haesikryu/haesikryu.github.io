# 📺 유튜브 쇼츠 자동 생성 & 업로드 가이드

이 프로젝트는 매일 아침 9시에 **최신 IT 뉴스**를 수집하여, **블로그 포스팅**을 작성하고, 이를 바탕으로 **유튜브 쇼츠(Shorts) 영상**을 생성하여 **자동으로 업로드**하는 100% 자동화 시스템입니다.

**주요 특징:**
- **전액 무료 모델**: OpenAI 대신 무료인 **Google Gemini** (스크립트) + **Edge TTS** (음성) + **Pexels API** (영상) 사용.
- **다이나믹 영상**: 뉴스 키워드를 분석해 관련된 고화질 무료 영상을 자동으로 찾아 배경으로 사용.
- **자동 업로드**: GitHub Actions를 통해 매일 정해진 시간에 유튜브에 업로드.

---

## 🛠️ 준비물 (Prerequisites)

시작하기 전에 아래 세 가지 계정/키가 필요합니다.

1.  **Google Cloud 계정**: 유튜브 업로드를 위해 필요합니다.
2.  **Google Gemini API Key**: 뉴스 요약 및 대본 작성용 (무료).
3.  **Pexels API Key**: 배경 영상 검색용 (무료).

---

## 🚀 설정 방법 (Step-by-Step)

### 1단계: Pexels API Key 발급
영상의 배경으로 쓸 고화질 비디오를 무료로 가져오기 위해 필요합니다.
1. [Pexels API](https://www.pexels.com/api/)에 접속하여 가입/로그인합니다.
2. **"Your API Key"** 버튼을 클릭합니다.
3. 용도 등을 간단히 입력(예: Personal Project)하고 키를 생성합니다.
4. 생성된 **긴 문자열(API Key)**을 복사해 둡니다.

### 2단계: Google Cloud 및 YouTube API 설정
유튜브에 영상을 자동으로 올리 권한을 얻는 과정입니다.

1.  [Google Cloud Console](https://console.cloud.google.com/) 접속.
2.  **새 프로젝트 만들기**: 이름은 `Daily News Bot` 등으로 자유롭게 설정.
3.  **API 사용 설정**:
    - 상단 검색창에 `YouTube Data API v3` 검색 -> **사용(Enable)** 클릭.
4.  **OAuth 동의 화면 (OAuth Consent Screen)** 설정:
    - 메뉴: **API 및 서비스 > OAuth 동의 화면**.
    - **User Type**: **외부(External)** 선택 -> 만들기.
    - **앱 정보**: 앱 이름, 이메일 입력 (대충 입력해도 됩니다).
    - **범위(Scope)**: 건너뛰기.
    - **테스트 사용자(Test Users)**: **[중요]** `+ ADD USERS`를 눌러 **본인의 구글 계정 이메일**을 반드시 추가하세요. (이거 안 하면 인증 안 됩니다!)
5.  **자격 증명 만들기 (Create Credentials)**:
    - 메뉴: **사용자 인증 정보 > 사용자 인증 정보 만들기 > OAuth 클라이언트 ID**.
    - **애플리케이션 유형**: `데스크톱 앱 (Desktop App)`.
    - 생성 완료 후 **`client_secret.json`** 파일을 다운로드합니다.
6.  다운로드한 파일의 이름을 `client_secret.json`으로 바꾸고 프로젝트의 `tools/` 폴더 안에 넣습니다.

### 3단계: 인증 토큰(Refresh Token) 발급
서버(GitHub Actions)가 내 계정에 대신 로그인할 수 있도록 '만능 열쇠(Refresh Token)'를 만드는 과정입니다.

1. 터미널에서 `tools` 폴더로 이동 후 필수 라이브러리를 설치합니다.
   ```bash
   cd tools
   pip install -r requirements.txt
   ```
2. 인증 스크립트를 실행합니다.
   ```bash
   python get_youtube_token.py
   ```
3. 터미널에 뜨는 링크를 누르고, **테스트 사용자로 등록한 구글 계정**으로 로그인합니다.
   - *경고창("Google에서 확인하지 않은 앱")이 뜨면 `고급(Advanced)` -> `이동(Go to ...)`을 눌러 진행하세요.*
4. 인증에 성공하면 터미널에 **3가지 중요한 값**이 출력됩니다. 이를 메모해 두세요.
   - `YOUTUBE_CLIENT_ID`
   - `YOUTUBE_CLIENT_SECRET`
   - `YOUTUBE_REFRESH_TOKEN`

### 4단계: GitHub Secrets 등록
내 중요한 정보(비밀번호, 키)를 GitHub에 안전하게 저장합니다.

1. GitHub 레포지토리의 **Settings > Secrets and variables > Actions** 로 이동.
2. **`New repository secret`** 버튼을 눌러 아래 5가지 변수를 각각 추가합니다.

| Name (이름) | Value (값) | 설명 |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | (Gemini API 키) | 뉴스 요약 및 대본 생성용 |
| `PEXELS_API_KEY` | (1단계에서 받은 키) | 배경 영상 검색용 |
| `YOUTUBE_CLIENT_ID` | (3단계 결과) | 유튜브 API ID |
| `YOUTUBE_CLIENT_SECRET` | (3단계 결과) | 유튜브 API 비밀번호 |
| `YOUTUBE_REFRESH_TOKEN` | (3단계 결과) | 유튜브 로그인 유지 토큰 |

---

## ▶️ 실행 방법

### 자동 실행
- 설정이 완료되면 **매일 한국 시간 오전 9시**에 자동으로 실행됩니다.
- 블로그에 글이 올라오고 -> 약 3~5분 뒤 -> 유튜브 채널에 쇼츠가 업로드됩니다.

### 수동 실행 (테스트)
1. GitHub 레포지토리의 **Actions** 탭 클릭.
2. 좌측의 **Daily IT News Automation** 워크플로우 클릭.
3. 우측의 **Run workflow** 버튼 클릭.

### 결과 확인
- **유튜브 채널**: 'Shorts' 탭에 새 영상이 올라왔는지 확인.
- **GitHub Actions**: 실행 로그(Artifacts)에서 생성된 영상 파일(`short.mp4`)을 다운로드해 볼 수도 있습니다.

---

## ❓ 문제 해결 (Troubleshooting)

**Q. "Upload failed: Quota exceeded" 에러가 나요.**
A. 유튜브 API는 하루 할당량이 정해져 있습니다. 영상 1개당 비용이 커서, 하루에 6개 정도 업로드하면 할당량이 찹니다. (매일 0시 초기화)

**Q. 영상 배경이 검은색으로 나와요.**
A. `PEXELS_API_KEY`가 없거나 잘못되었을 때 기본 배경을 사용합니다. 키 값을 다시 확인해 주세요.

**Q. 목소리가 안 나와요.**
A. 로컬 테스트 시, 회사 네트워크 등에서 Edge TTS 접속을 차단하는 경우가 있습니다. 이 경우 자동으로 Google TTS(기계음)로 전환됩니다. GitHub 서버에서는 정상적으로 고품질 목소리가 나옵니다.
