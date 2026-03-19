# 블로그 RAG 챗봇 구현 정리

Jekyll + Chirpy 테마 기반 GitHub Pages 블로그에 **검색형 RAG 챗봇**을 붙인 작업을 정리한 문서입니다.  
(빌드 타임 임베딩 인덱스 + 브라우저에서 검색·생성)

---

## 1. 목표와 개요

| 항목 | 내용 |
|------|------|
| **역할** | 블로그 `_posts` 본문을 참고해 질문에 한국어로 답변 |
| **검색(R)** | 브라우저에서 `vector_store.json` + `@xenova/transformers`(all-MiniLM-L6-v2)로 코사인 유사도 Top-K |
| **생성(G)** | Google Gemini API 스트리밍 (또는 Cloudflare Worker 프록시 경유) |
| **호스팅** | 정적 사이트(GitHub Pages)만으로 검색·UI 가능, LLM 호출은 API 필요 |

---

## 2. 아키텍처

```
[빌드 시]  _posts/**/*.md  →  generate-vector-store.js  →  assets/data/vector_store.json
[런타임]   브라우저: vector_store.json fetch + 쿼리 임베딩 + Top-K 선택
           →  system/user 프롬프트 구성  →  Gemini (직접 또는 Worker 프록시)
```

- **임베딩 모델**: 빌드·런타임 모두 `Xenova/all-MiniLM-L6-v2` (검색 일치를 위해 동일 모델 사용).
- **청킹**: 스크립트에서 마크다운 → 평문 후 슬라이딩 윈도우(문자 단위, overlap 포함).

---

## 3. 주요 파일·디렉터리

| 경로 | 설명 |
|------|------|
| `scripts/generate-vector-store.js` | `_posts` 재귀 스캔, 청크·임베딩, `assets/data/vector_store.json` 출력 |
| `types/rag.ts` | `VectorStoreFile`, `RagChunk`, `RagUserSettings`, `DEFAULT_CHAT_MODEL` 등 타입 |
| `utils/ragClient.ts` | 스토어 로드, 임베딩 파이프라인, `retrieveTopK`, `buildContextBlock`(청크 길이 제한 포함) |
| `components/RagChatbot.tsx` | 플로팅 UI, 설정, 스트리밍, 직접 Gemini / Worker 프록시 분기 |
| `rag-chat/main.tsx` | `#rag-chat-root` 마운트, `data-baseurl`, `data-proxy-url` 읽기 |
| `rag-chat/index.css` | Tailwind 엔트리, `.rag-fab` 등 스코프 보조 |
| `vite.config.ts` | `outDir: assets/js/rag`, 단일 `embed.js`, `rag-chat.css` 고정 파일명 |
| `tailwind.config.js` | `content`: rag-chat/components, `preflight: false`(Chirpy와 충돌 완화) |
| `_includes/rag-chat.html` | `rag-chat.css` 링크, `#rag-chat-root`, `embed.js` 모듈 |
| `_layouts/default.html` | Chirpy 6.5.5 본문 구조 유지 + `tail_includes: rag-chat` |
| `workers/rag-proxy/` | (선택) Gemini 프록시, CORS·레이트리밋·본문/모델 제한 |
| `_config.yml` | `rag_chat.proxy_url`, Jekyll `exclude`에 소스 디렉터리·`workers` 등 |

---

## 4. Jekyll·테마 연동

### 4.1 `default.html` 복원

챗봇 추가 과정에서 `#main-wrapper` / `.container` / `.row` / `<main>` 그리드가 빠지면 Chirpy CSS·JS가 본문 위치를 잘못 잡을 수 있음.  
**Chirpy 6.5.5 `default.html`과 동일한 뼈대**로 되돌리고, YAML에만 다음을 둠:

```yaml
tail_includes:
  - rag-chat
```

`rag-chat.html`은 테마처럼 **`#tail-wrapper`** 안에서 로드됨.

### 4.2 `rag-chat.html`

- `link` → `/assets/js/rag/rag-chat.css` (`relative_url`)
- `div#rag-chat-root`에 `data-baseurl`, `data-proxy-url`(선택)
- `script type="module"` → `embed.js`

### 4.3 CSS 번들

Vite에서 `cssCodeSplit: false`, `assetFileNames: "rag-chat.[ext]"`로 **`rag-chat.css` 파일명 고정** → HTML에서 안정적으로 링크.

---

## 5. 프론트엔드(RagChatbot) 동작

1. 마운트 시 `vector_store.json` 로드, 임베딩 파이프라인 워밍업.
2. 사용자 질문 시 쿼리 임베딩 → **Top 2** 청크(현재 설정) → `buildContextBlock`으로 컨텍스트 문자열 생성.
3. 시스템 프롬프트: 참고 문서에만 근거, 한국어·마크다운 권장.
4. **스트리밍**: Gemini SSE 파싱 로직을 `consumeGeminiSseReader`로 공통화 (직접 API / Worker 응답 동일 형식).

### 5.1 직접 Gemini 모드 (`proxy_url` 비움)

- `localStorage`의 `geminiApiKey`, 선택적 `chatModel`.
- 기본 모델: `gemini-2.0-flash` (`types/rag.ts`).

### 5.2 Worker 프록시 모드 (`rag_chat.proxy_url` 설정)

- 브라우저는 Worker `POST /`만 호출 (JSON: `model`, `systemPrompt`, `userText`).
- API 키는 Worker 시크릿만 사용 → 설정 UI에서 키 입력 필드 숨김.

### 5.3 무료 티어·UX 완화

- 참고 청크 **2개**, 청크당 문자 **약 900자** 초과 시 `…(이하 생략)` (`utils/ragClient.ts`).
- HTTP 429 등: `formatGeminiApiError` / `parseApiErrorBody`로 짧은 한국어 메시지.
- 패널 **여백·스크롤**: `min-h-0`, `px-4`, `overflow-x-hidden`, 말풍선 `break-words` 등.

---

## 6. Cloudflare Worker (`workers/rag-proxy/`)

| 항목 | 설명 |
|------|------|
| **시크릿** | `GEMINI_API_KEY` (`wrangler secret put`) |
| **KV** | `RATE_LIMIT` 바인딩 — IP 기준 분·(선택)일 요청 수 |
| **CORS** | `ALLOWED_ORIGINS`에 있는 `Origin`만 POST/OPTIONS 허용 |
| **본문** | 최대 바이트, `userText`/`systemPrompt` 글자 상한 |
| **모델** | `ALLOWED_MODELS` 화이트리스트만 허용 |
| **출력** | `MAX_OUTPUT_TOKENS` 상한(기본 1024 등) |

배포·KV 생성 절차는 **`workers/rag-proxy/README.md`** 참고.

---

## 7. npm 스크립트·CI

| 명령 | 역할 |
|------|------|
| `npm run generate-embeddings` | `vector_store.json` 생성 |
| `npm run build:rag` | Vite로 `assets/js/rag/embed.js`, `rag-chat.css` 빌드 |

**GitHub Actions** (`pages-deploy.yml`):

1. `npm install`
2. `npm run generate-embeddings`
3. `npm run build:rag`
4. `jekyll build` → htmlproofer → Pages 배포

> **Daily News 워크플로**가 `_posts/news/*.md`를 푸시하면, 이후 **Pages 빌드**에서 `generate-embeddings`가 다시 돌아가므로 새 뉴스도 인덱스에 포함됨(빌드가 트리거되는 전제).

---

## 8. 로컬 개발

```bash
bundle install
npm install
npm run generate-embeddings   # 최초 또는 포스트 변경 후
npm run build:rag
bundle exec jekyll serve --livereload
```

- RAG 소스(`components/`, `utils/`, `rag-chat/` 등)는 `_config.yml` **`exclude`**에 있어 Jekyll 출력물에 섞이지 않음.
- `workers/`도 exclude — Worker는 별도 `wrangler deploy`.

---

## 9. UI 스타일 (최종 방향 요약)

| 요소 | 스타일 요약 |
|------|-------------|
| **플로팅 버튼(FAB)** | 흰 배경, **굵은 테두리**(`border-2 border-slate-400`), 회색 말풍선 아이콘, 그림자 없음 (1번 아웃라인 강조안) |
| **전송 버튼** | 상단 설정/닫기와 유사: 연한 `slate-100` 배경, `slate-600` 아이콘, 얇은 테두리, 호버 시 `slate-200` |
| **패널·모달** | Tailwind 유틸 + 다크 모드 `dark:` 대응 |

(중간에 제안했던 “은은한 에메랄드 아이콘” 등은 이후 **1번(테두리 강조)**으로 FAB를 다시 맞춤.)

---

## 10. 보안·운영 참고

- **브라우저 직접 Gemini**: 키는 `localStorage` — XSS·DevTools 노출 위험. 공개 블로그에서는 **Worker 프록시 + 시크릿** 권장.
- **Worker**: Origin 화이트리스트는 브라우저 CORS용; 스크립트로 `Origin` 스푸핑 가능하므로 **IP 레이트리밋**을 함께 사용.
- **비용**: Worker에서 토큰·모델·요청 수 제한; 클라이언트에서도 청크 수·길이 제한으로 입력 토큰 완화.

---

## 11. 관련 문서

- `CLAUDE.md` — RAG 빌드·`proxy_url` 요약
- `workers/rag-proxy/README.md` — Worker 배포 상세

---

## 12. 변경 이력 요약(작업 타임라인)

1. Chirpy `default.html` 구조 복원 + `tail_includes`로 RAG 삽입  
2. OpenAI → **Gemini** 전환 및 오류 메시지·토큰 절약  
3. **`rag-chat.css`** 고정 파일명 링크  
4. **Cloudflare Worker** 프록시 + `_config.yml` `rag_chat.proxy_url`  
5. FAB·전송 버튼 스타일을 사이드바/헤더 톤에 맞게 조정  

---

*문서 생성: 구현 기준 정리. 테마 업그레이드 시 `default.html`은 Chirpy 버전과 반드시 재대조할 것.*
