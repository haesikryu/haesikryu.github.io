# 블로그 RAG 챗봇 — Cloudflare Worker 프록시

Gemini API 키를 **브라우저에 두지 않고** Worker 시크릿에만 두며, **Origin 화이트리스트·IP 기준 레이트리밋·본문/모델/출력 토큰 상한**으로 남용과 비용을 줄입니다.

## 동작 요약

| 항목 | 설명 |
|------|------|
| **CORS** | `ALLOWED_ORIGINS`에 있는 `Origin`만 POST 허용 |
| **분당 한도** | IP(`CF-Connecting-IP`)당 `RATE_LIMIT_PER_MINUTE` (KV) |
| **일일 한도** | `RATE_LIMIT_PER_DAY`가 0보다 크면 IP당 일일 요청 수 제한 (KV) |
| **본문** | `MAX_BODY_BYTES`, `MAX_USER_TEXT_CHARS`, `MAX_SYSTEM_PROMPT_CHARS` |
| **모델** | `ALLOWED_MODELS`에 나열된 ID만 허용 |
| **출력** | `MAX_OUTPUT_TOKENS` (기본 1024) |

> KV 무료 티어(읽기/쓰기 한도)가 있으므로 트래픽이 크면 유료 플랜 또는 대시보드 **Rate Limiting 규칙**을 추가하는 것을 권장합니다.

## 1. KV 네임스페이스 생성

```bash
cd workers/rag-proxy
npm install
npx wrangler kv namespace create RATE_LIMIT
```

출력된 `id`를 `wrangler.toml`의 `[[kv_namespaces]]` → `id`에 붙여넣습니다.

## 2. Gemini API 키 등록

```bash
npx wrangler secret put GEMINI_API_KEY
```

## 3. Origin 수정

`_config.yml`의 사이트 URL과 로컬 주소가 `wrangler.toml`의 `[vars] ALLOWED_ORIGINS`에 포함되어야 합니다.

- GitHub Pages: `https://사용자.github.io` (프로젝트 페이지면 `https://사용자.github.io/저장소명` 등 **실제 Origin**)
- 로컬 Jekyll: `http://127.0.0.1:4000`, `http://localhost:4000`

콤마로 구분, 공백 없이 나열해도 되고 공백은 코드에서 `trim` 처리됩니다.

## 4. 배포

```bash
npx wrangler deploy
```

배포 후 표시되는 Worker URL(예: `https://blog-rag-proxy.xxx.workers.dev`)을 복사합니다.

## 5. Jekyll 설정

저장소 루트 `_config.yml`:

```yaml
rag_chat:
  proxy_url: "https://blog-rag-proxy.xxx.workers.dev"
```

그다음 `npm run build:rag` 후 Jekyll 빌드/배포합니다.

`proxy_url`을 비우면 기존처럼 브라우저에서 Gemini 키를 입력하는 모드로 동작합니다.

## 로컬에서 Worker 테스트

```bash
npx wrangler dev
```

`.dev.vars` 파일(커밋 금지)에 로컬용 키를 넣을 수 있습니다:

```
GEMINI_API_KEY=AIza...
```

`wrangler dev`는 기본적으로 다른 Origin에서의 CORS를 허용하지 않으므로, `ALLOWED_ORIGINS`에 로컬 블로그 주소를 넣은 뒤 브라우저에서 해당 Origin으로 페이지를 열어 테스트합니다.

## 추가 하드닝 (선택)

- Cloudflare 대시보드에서 해당 Worker 또는 경로에 **Rate limiting** 규칙 추가
- **WAF** 커스텀 규칙으로 의심 국가/ASN 차단
- 유료 전환 시 Gemini **유료** 키와 할당량 알림 설정

## 파일

- `src/index.ts` — 라우팅, 검증, Gemini 스트리밍 프록시
- `wrangler.toml` — 바인딩·한도 변수 (배포 후 대시보드에서도 수정 가능)
