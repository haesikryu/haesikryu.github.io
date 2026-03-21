/**
 * 블로그 RAG 챗봇용 Gemini 프록시
 * - 시크릿 GEMINI_API_KEY 만 서버에 보관
 * - Origin 화이트리스트 (CORS)
 * - IP 기준 분·일 요청 한도 (KV)
 * - 본문/모델/출력 토큰 상한으로 비용 가드
 */

export interface Env {
  GEMINI_API_KEY: string;
  RATE_LIMIT: KVNamespace;
  ALLOWED_ORIGINS: string;
  MAX_BODY_BYTES: string;
  RATE_LIMIT_PER_MINUTE: string;
  RATE_LIMIT_PER_DAY: string;
  MAX_USER_TEXT_CHARS: string;
  MAX_SYSTEM_PROMPT_CHARS: string;
  ALLOWED_MODELS: string;
  MAX_OUTPUT_TOKENS: string;
}

type ChatBody = {
  model?: string;
  systemPrompt?: string;
  userText?: string;
};

function parseList(s: string): string[] {
  return s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

function corsHeadersForOrigin(origin: string | null): HeadersInit {
  const headers: HeadersInit = {
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
  if (origin) {
    (headers as Record<string, string>)["Access-Control-Allow-Origin"] = origin;
  }
  return headers;
}

/** POST/OPTIONS: 브라우저 Origin 이 화이트리스트에 있어야 함 (curl 스푸핑은 레이트리밋으로 완화) */
function resolveAllowedOrigin(request: Request, env: Env): string | null {
  const allowed = parseList(env.ALLOWED_ORIGINS || "");
  const origin = request.headers.get("Origin");
  if (origin && allowed.includes(origin)) return origin;
  return null;
}

function jsonErr(
  status: number,
  message: string,
  cors: HeadersInit,
  extra?: Record<string, string>
): Response {
  const h = new Headers({
    "Content-Type": "application/json; charset=utf-8",
  });
  for (const [k, v] of Object.entries(cors as Record<string, string>)) {
    h.set(k, v);
  }
  if (extra) {
    for (const [k, v] of Object.entries(extra)) h.set(k, v);
  }
  return new Response(JSON.stringify({ error: message }), { status, headers: h });
}

async function checkRateLimits(
  env: Env,
  ip: string
): Promise<{ ok: true } | { ok: false; retryAfter: number; message: string }> {
  const perMin = Math.max(1, parseInt(env.RATE_LIMIT_PER_MINUTE || "10", 10));
  const perDayConfigured = parseInt(env.RATE_LIMIT_PER_DAY || "0", 10);
  const perDay = perDayConfigured > 0 ? perDayConfigured : 0;

  const minuteBucket = Math.floor(Date.now() / 60000);
  const minKey = `m:${ip}:${minuteBucket}`;
  const minRaw = await env.RATE_LIMIT.get(minKey);
  const minCount = minRaw ? parseInt(minRaw, 10) : 0;
  if (minCount >= perMin) {
    return {
      ok: false,
      retryAfter: 60,
      message: "요청이 너무 잦습니다. 잠시 후 다시 시도해 주세요.",
    };
  }

  if (perDay > 0) {
    const day = new Date().toISOString().slice(0, 10);
    const dayKey = `d:${ip}:${day}`;
    const dayRaw = await env.RATE_LIMIT.get(dayKey);
    const dayCount = dayRaw ? parseInt(dayRaw, 10) : 0;
    if (dayCount >= perDay) {
      return {
        ok: false,
        retryAfter: 3600,
        message: "일일 사용 한도에 도달했습니다. 내일 다시 시도해 주세요.",
      };
    }
    await env.RATE_LIMIT.put(dayKey, String(dayCount + 1), {
      expirationTtl: 86400 * 2,
    });
  }

  await env.RATE_LIMIT.put(minKey, String(minCount + 1), {
    expirationTtl: 120,
  });
  return { ok: true };
}

export default {
  async fetch(
    request: Request,
    env: Env,
    _ctx: ExecutionContext
  ): Promise<Response> {
    const url = new URL(request.url);
    const allowedOrigin = resolveAllowedOrigin(request, env);
    const cors = corsHeadersForOrigin(allowedOrigin);

    if (request.method === "OPTIONS") {
      if (!allowedOrigin) {
        return new Response(null, { status: 403 });
      }
      return new Response(null, { status: 204, headers: cors });
    }

    if (request.method === "GET" && (url.pathname === "/" || url.pathname === "")) {
      return new Response(
        JSON.stringify({
          ok: true,
          service: "blog-rag-proxy",
          hint: "POST JSON { model, systemPrompt, userText }",
        }),
        { headers: { "Content-Type": "application/json; charset=utf-8" } }
      );
    }

    if (request.method !== "POST" || url.pathname !== "/") {
      return jsonErr(404, "Not Found", corsHeadersForOrigin(null));
    }

    if (!allowedOrigin) {
      return jsonErr(403, "허용되지 않은 출처(Origin)입니다.", corsHeadersForOrigin(null));
    }

    const apiKey = (env.GEMINI_API_KEY || "").trim();
    if (!apiKey) {
      return jsonErr(500, "서버 설정 오류(GEMINI_API_KEY)", cors);
    }

    const ip =
      request.headers.get("CF-Connecting-IP") ||
      request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() ||
      "unknown";

    const limitResult = await checkRateLimits(env, ip);
    if (!limitResult.ok) {
      return jsonErr(429, limitResult.message, cors, {
        "Retry-After": String(limitResult.retryAfter),
      });
    }

    const maxBytes = Math.min(
      98304,
      Math.max(1024, parseInt(env.MAX_BODY_BYTES || "24576", 10))
    );
    const ct = request.headers.get("Content-Type") || "";
    if (!ct.includes("application/json")) {
      return jsonErr(415, "Content-Type 은 application/json 이어야 합니다.", cors);
    }

    const raw = await request.text();
    if (raw.length > maxBytes) {
      return jsonErr(413, "요청 본문이 너무 깁니다.", cors);
    }

    let body: ChatBody;
    try {
      body = JSON.parse(raw) as ChatBody;
    } catch {
      return jsonErr(400, "JSON 파싱 실패", cors);
    }

    const model = (body.model || "gemini-2.0-flash").trim();
    const allowedModels = new Set(parseList(env.ALLOWED_MODELS || "gemini-2.0-flash"));
    if (!allowedModels.has(model)) {
      return jsonErr(400, "허용되지 않은 모델입니다.", cors);
    }

    const systemPrompt = (body.systemPrompt || "").trim();
    const userText = (body.userText || "").trim();
    const maxSys = parseInt(env.MAX_SYSTEM_PROMPT_CHARS || "4000", 10);
    const maxUser = parseInt(env.MAX_USER_TEXT_CHARS || "2000", 10);
    if (!userText) {
      return jsonErr(400, "userText 가 필요합니다.", cors);
    }
    if (systemPrompt.length > maxSys || userText.length > maxUser) {
      return jsonErr(400, "systemPrompt 또는 userText 길이 초과", cors);
    }

    const maxOut = Math.min(
      8192,
      Math.max(256, parseInt(env.MAX_OUTPUT_TOKENS || "1024", 10))
    );

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:streamGenerateContent?alt=sse&key=${encodeURIComponent(apiKey)}`;

    const upstream = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts: [{ text: userText }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: maxOut,
        },
      }),
    });

    if (!upstream.ok) {
      const errText = await upstream.text();
      return new Response(errText, {
        status: upstream.status,
        headers: {
          ...cors,
          "Content-Type": upstream.headers.get("Content-Type") || "text/plain",
        },
      });
    }

    if (!upstream.body) {
      return jsonErr(502, "업스트림 응답 스트림 없음", cors);
    }

    return new Response(upstream.body, {
      status: 200,
      headers: {
        ...cors,
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  },
};
