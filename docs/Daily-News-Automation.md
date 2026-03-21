# Daily News 자동 등록 가이드

이 문서는 본 블로그 저장소에서 **매일 오전·오후 각 1회, 하루 2회** IT/AI 관련 Daily News를 자동으로 등록하는 방식과 설정을 정리한 것입니다. GitHub Wiki에 올려두고 참고할 수 있습니다.

---

## 1. 개요

| 항목 | 내용 |
|------|------|
| **실행 빈도** | 하루 2회 (오전 1회, 오후 1회) |
| **실행 시각 (KST)** | **오전 9:00**, **오후 16:00** (4:00 PM) |
| **실행 주체** | GitHub Actions 워크플로우 |
| **스크립트** | `tools/daily_news.py` |
| **생성 위치** | `_posts/news/` (Jekyll 블로그 포스트) |

- RSS 피드에서 뉴스 후보를 수집한 뒤, **LLM(Gemini 또는 OpenAI)**으로 요약·정리된 **한국어 다이제스트**를 생성합니다.
- 생성된 포스트는 **첫 기사 제목 + "등 N개 기사"** 형식의 제목으로 저장되며, 같은 날 오전/오후는 **파일명**으로 `-am` / `-pm`을 구분합니다.

---

## 2. 실행 일정 (Cron)

워크플로우 파일: `.github/workflows/daily_news.yml`

```yaml
on:
  schedule:
    # 00:00 UTC = 09:00 KST, 07:00 UTC = 16:00 KST
    - cron: '0 0,7 * * *'
  workflow_dispatch:   # 수동 실행 가능
```

| Cron | UTC | KST (한국) |
|------|-----|------------|
| `0 0 * * *` | 00:00 | **09:00** (오전) |
| `0 7 * * *` | 07:00 | **16:00** (오후) |

- 매일 0시·7시 UTC에 실행되므로 한국 기준 **오전 9시**, **오후 4시**에 각각 1회씩 돌아갑니다.
- **Actions** 탭에서 **workflow_dispatch**로 수동 실행할 수 있습니다.

---

## 3. 워크플로우 단계 요약

1. **Checkout**  
   - 저장소 코드 체크아웃 (푸시용 토큰 사용).

2. **Set up Python**  
   - Python 3.11 설치.

3. **Install system dependencies**  
   - ffmpeg, imagemagick, ghostscript, fonts-nanum 등 (숏스 생성 등에 사용).

4. **Install dependencies**  
   - `tools/requirements.txt` 기준으로 pip 설치.

5. **Run Daily News Script**  
   - `python tools/daily_news.py` 실행  
   - 환경 변수: `GEMINI_API_KEY` 또는 `OPENAI_API_KEY`.

6. **Generate and Upload Short**  
   - `tools/generate_shorts.py` 실행 (당일 뉴스 기반 숏스 생성·업로드).

7. **Upload Shorts Artifact**  
   - 생성된 숏스 영상을 Artifact로 업로드 (실패해도 실행).

8. **Commit and Push**  
   - `_posts/news/*.md`, `tools/news_history.json` 변경 사항만 커밋 후 푸시.

---

## 4. Daily News 스크립트 상세 (`tools/daily_news.py`)

### 4.1 전체 흐름

1. **RSS 수집**  
   - 아래 RSS 피드 목록에서 각 피드당 최대 5개 기사 후보 수집 (제목, 링크, 요약 500자).
2. **중복 제거**  
   - `tools/news_history.json`에 기록된 URL은 제외하고, **이전에 사용한 적 없는 기사만** 후보로 사용.
3. **LLM 호출**  
   - 후보 목록을 프롬프트에 넣어 **한국어 다이제스트** 생성 (Gemini 우선, 없으면 OpenAI).
4. **포스트 저장**  
   - 본문에서 첫 기사 제목·기사 수를 파악해 **제목**을 `"첫 기사 제목 등 N개 기사"` 형식으로 설정하고, `_posts/news/`에 마크다운 파일로 저장.
5. **히스토리 갱신**  
   - 이번 실행에서 사용한 기사 URL을 `news_history.json`에 추가 (7일 이상 된 항목은 저장 시 정리).

### 4.2 RSS 피드 목록

스크립트에 정의된 `RSS_FEEDS` 예시는 다음과 같습니다.

- TechCrunch (AI)
- The Verge
- OpenAI Blog
- Google AI Blog
- VentureBeat (AI)
- MIT Technology Review
- Hugging Face Blog
- Ars Technica
- Microsoft News (AI)
- DeepMind
- MIT News (AI)
- Unite.AI
- Artificial Intelligence News

(실제 목록은 `tools/daily_news.py` 내 `RSS_FEEDS` 변수를 참고하세요.)

### 4.3 LLM 사용

- **우선**: `GEMINI_API_KEY`가 있으면 Google Gemini 사용 (여러 모델 순서대로 시도).
- **대안**: `OPENAI_API_KEY`만 있으면 OpenAI GPT 사용.
- 프롬프트는 “최근 24시간 이내 AI·기술 뉴스 중 3~5개를 골라, 한국어로 요약·분석한 다이제스트를 작성하라”는 식으로 구성되어 있으며, 각 기사는 `## 1. 제목` 형태의 헤더와 Summary / Why it matters / Source를 포함합니다.

### 4.4 생성되는 포스트 규칙

| 항목 | 규칙 |
|------|------|
| **파일명** | `YYYY-MM-DD-daily-ai-news-am.md` 또는 `...-pm.md` (같은 날 같은 am/pm에 한해 `-1`, `-2` 등으로 중복 방지) |
| **제목 (front matter)** | 본문에서 추출한 **첫 기사 제목 + " 등 N개 기사"** (예: `넷플릭스, AI 스타트업 6억 달러 인수 추진 등 4개 기사`) |
| **본문** | 인사말 다음에 **"이번 digest에는 N개의 기사가 실렸습니다."** 문구가 자동 삽입됨 |
| **카테고리/태그** | `categories: ['news', 'ai']`, `tags: ['daily-news', 'automation', 'ai']` |

- **날짜**는 KST 기준이며, 빌드 서버와의 시차를 줄이기 위해 포스트 작성 시각에서 5분을 뺀 값이 사용됩니다.
- 오전/오후 구분은 **12시 미만이면 am, 이상이면 pm**입니다.

### 4.5 히스토리 파일 (`tools/news_history.json`)

- **역할**: 이미 다이제스트에 사용한 기사 URL을 저장해, 같은 기사가 반복해서 선택되지 않도록 함.
- **형식**: `[{"title": "...", "link": "https://...", "date": "YYYY-MM-DD"}, ...]`
- **유지 기간**: 저장 시 **7일이 지난 항목은 삭제**해 파일 크기를 제한합니다.
- 이 파일도 워크플로우에서 커밋·푸시 대상에 포함됩니다.

---

## 5. 필요한 GitHub Secrets

### 5.1 설정 방법

1. 저장소 **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret** 클릭
3. Name: `GEMINI_API_KEY`, Value: [Google AI Studio](https://aistudio.google.com/apikey)에서 발급한 API 키 입력
4. 저장

> ⚠️ **API Key not found / API_KEY_INVALID** 오류 시: 시크릿이 비어 있거나 잘못된 키입니다. Google AI Studio에서 새 키를 발급한 뒤 시크릿을 다시 설정하세요. 키에 **IP 제한**이나 **HTTP 리퍼러 제한**이 있으면 GitHub Actions에서 실패할 수 있으므로, 제한 없이 사용하거나 "None"으로 두세요.

### 5.2 시크릿 목록

Daily News 자동 등록만 사용할 때 필요한 시크릿은 아래와 같습니다.

| Secret | 용도 |
|--------|------|
| `GH_PAT` | 저장소에 커밋·푸시하기 위한 Personal Access Token (repo 권한) |
| `GEMINI_API_KEY` | Google Gemini API 키 (우선 사용) |
| `OPENAI_API_KEY` | OpenAI API 키 (Gemini 미사용 시) |

- **GEMINI_API_KEY**와 **OPENAI_API_KEY** 중 **최소 하나**는 반드시 설정해야 합니다.
- 숏스 생성·업로드까지 사용할 경우 `PEXELS_API_KEY`, `YOUTUBE_CLIENT_ID`, `YOUTUBE_CLIENT_SECRET`, `YOUTUBE_REFRESH_TOKEN` 등이 추가로 필요합니다.

---

## 6. 로컬에서 테스트

```bash
# 저장소 루트에서
cd /path/to/repo

# 의존성 설치 (tools/requirements.txt 사용)
pip install -r tools/requirements.txt

# API 키 설정 후 실행
export GEMINI_API_KEY="your-key"   # 또는 OPENAI_API_KEY
python tools/daily_news.py
```

- 실행 후 `_posts/news/` 아래에 새 마크다운 파일이 생기고, `tools/news_history.json`이 갱신됩니다.
- 실제 푸시는 하지 않으므로, 로컬에서 동작만 확인할 수 있습니다.

---

## 7. 트러블슈팅

| 현상 | 확인·조치 |
|------|------------|
| 포스트가 생성되지 않음 | RSS에서 새 기사가 없거나, 전부 히스토리에 있으면 “No new news items found”로 종료됩니다. 다른 날짜나 다른 피드를 추가해 볼 수 있습니다. |
| LLM 오류 / API Key not found | GitHub **Settings > Secrets > GEMINI_API_KEY**가 설정돼 있는지 확인. [Google AI Studio](https://aistudio.google.com/apikey)에서 키 발급 후 시크릿에 추가. 키에 IP/리퍼러 제한이 있으면 해제. |
| 커밋/푸시 실패 | `GH_PAT` 권한(repo) 및 만료 여부를 확인합니다. |
| 같은 날 am/pm이 겹침 | 파일명에 `-am` / `-pm`이 붙고, 같은 am/pm 내에서만 `-1`, `-2`가 붙습니다. 스크립트가 정상이면 중복 파일명은 생성되지 않습니다. |

---

## 8. 관련 파일 정리

| 경로 | 설명 |
|------|------|
| `.github/workflows/daily_news.yml` | Daily News + 숏스 자동 실행 워크플로우 |
| `tools/daily_news.py` | 뉴스 수집·다이제스트 생성·포스트 저장 스크립트 |
| `tools/news_history.json` | 사용한 기사 URL 히스토리 (자동 생성·갱신) |
| `tools/requirements.txt` | Python 의존성 (feedparser, google-generativeai, openai, pyyaml 등) |
| `_posts/news/` | 생성되는 Daily News 마크다운 포스트 저장 위치 |

---

이 문서는 GitHub Wiki에 **Daily News 자동 등록** 설명용으로 복사해 사용할 수 있습니다.  
스케줄·시크릿·파일 경로가 바뀌면 위 내용을 해당 저장소에 맞게 수정해 두면 됩니다.
