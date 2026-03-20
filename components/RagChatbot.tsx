/**
 * 블로그 RAG 챗봇: 플로팅 버튼, 설정(API 키), 스트리밍 답변
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, MessageCircle, Send, Settings, X } from "lucide-react";
import {
  DEFAULT_CHAT_MODEL,
  RAG_STORAGE_KEY,
  type ChatMessage,
  type RagUserSettings,
  type VectorStoreFile,
} from "../types/rag";
import {
  buildContextBlock,
  embedQuery,
  getEmbeddingPipeline,
  loadVectorStore,
  retrieveTopK,
} from "../utils/ragClient";

function readSettings(): RagUserSettings {
  try {
    const raw = localStorage.getItem(RAG_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as RagUserSettings;
  } catch {
    return {};
  }
}

function writeSettings(s: RagUserSettings) {
  localStorage.setItem(RAG_STORAGE_KEY, JSON.stringify(s));
}

/** Gemini REST 오류 본문 → 사용자용 짧은 메시지 */
function formatGeminiApiError(status: number, body: string): string {
  if (status === 429) {
    return (
      "Gemini 무료 한도를 초과했습니다(분·일 요청 수 또는 입력 토큰). " +
      "잠시 후 다시 시도하거나, Google AI Studio에서 사용량·요금제를 확인해 주세요."
    );
  }
  if (status === 403 || status === 400) {
    try {
      const j = JSON.parse(body) as {
        error?: { message?: string; code?: number; status?: string };
      };
      const msg = j.error?.message;
      if (msg) return msg.length > 280 ? `${msg.slice(0, 280)}…` : msg;
    } catch {
      /* JSON 아님 */
    }
  }
  const trimmed = body.replace(/\s+/g, " ").trim();
  return trimmed.length > 320 ? `${trimmed.slice(0, 320)}…` : trimmed || `HTTP ${status}`;
}

function parseApiErrorBody(status: number, detail: string): string {
  try {
    const j = JSON.parse(detail) as { error?: string };
    if (typeof j.error === "string") return j.error;
  } catch {
    /* Worker/Gemini 비 JSON 본문 */
  }
  return formatGeminiApiError(status, detail);
}

/** Gemini SSE 스트림 공통 파서 (브라우저 직접 호출·Worker 프록시 공용) */
async function consumeGeminiSseReader(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  onDelta: (t: string) => void
): Promise<void> {
  const decoder = new TextDecoder();
  let carry = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    carry += decoder.decode(value, { stream: true });
    const parts = carry.split("\n");
    carry = parts.pop() ?? "";
    for (const line of parts) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const payload = trimmed.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        const json = JSON.parse(payload) as {
          candidates?: Array<{
            content?: { parts?: Array<{ text?: string }> };
          }>;
          promptFeedback?: { blockReason?: string; blockReasonMessage?: string };
        };
        const br = json.promptFeedback?.blockReason;
        if (br) {
          const msg = json.promptFeedback?.blockReasonMessage ?? br;
          throw new Error(`요청 차단: ${msg}`);
        }
        const cParts = json.candidates?.[0]?.content?.parts;
        if (!cParts) continue;
        for (const p of cParts) {
          if (p.text) onDelta(p.text);
        }
      } catch (e) {
        if (e instanceof Error && e.message.startsWith("요청 차단")) throw e;
        /* 불완전 JSON 라인 무시 */
      }
    }
  }
}

/**
 * Google Gemini streamGenerateContent (REST + SSE, alt=sse)
 * @see https://ai.google.dev/api/rest/v1beta/models.streamGenerateContent
 */
async function streamGeminiChat(
  apiKey: string,
  model: string,
  systemPrompt: string,
  userText: string,
  onDelta: (t: string) => void
): Promise<void> {
  const base = "https://generativelanguage.googleapis.com/v1beta";
  const url = `${base}/models/${encodeURIComponent(model)}:streamGenerateContent?alt=sse&key=${encodeURIComponent(apiKey)}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: "user", parts: [{ text: userText }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 2048,
      },
    }),
  });

  if (!res.ok) {
    let detail = "";
    try {
      detail = await res.text();
    } catch {
      detail = res.statusText;
    }
    throw new Error(`Gemini API (${res.status}): ${parseApiErrorBody(res.status, detail)}`);
  }

  const reader = res.body?.getReader();
  if (!reader) {
    throw new Error("응답 스트림을 읽을 수 없습니다.");
  }
  await consumeGeminiSseReader(reader, onDelta);
}

/** Cloudflare Worker 프록시 (API 키는 Worker 시크릿만 사용) */
async function streamViaWorkerProxy(
  proxyBase: string,
  model: string,
  systemPrompt: string,
  userText: string,
  onDelta: (t: string) => void
): Promise<void> {
  const base = proxyBase.replace(/\/$/, "");
  const res = await fetch(`${base}/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, systemPrompt, userText }),
  });

  if (!res.ok) {
    let detail = "";
    try {
      detail = await res.text();
    } catch {
      detail = res.statusText;
    }
    throw new Error(parseApiErrorBody(res.status, detail));
  }

  const reader = res.body?.getReader();
  if (!reader) {
    throw new Error("응답 스트림을 읽을 수 없습니다.");
  }
  await consumeGeminiSseReader(reader, onDelta);
}

/** 설정 읽기: Gemini 키 우선, 없으면 예전 OpenAI 필드는 사용하지 않음(모델 불일치) */
function readGeminiKey(): string | undefined {
  const s = readSettings();
  return s.geminiApiKey?.trim() || undefined;
}

const SYSTEM_PROMPT = `당신은 기술 블로그 독자를 돕는 한국어 어시스턴트입니다.
아래 [참고 문서]에만 근거하여 답하세요. 문서에 없는 내용은 추측하지 말고 모른다고 하세요.
답변은 간결하고 읽기 쉽게 마크다운 형식으로 작성하세요.`;

type Props = {
  /** Jekyll site.baseurl (예: /repo-name 또는 빈 문자열) */
  baseUrl?: string;
  /** Cloudflare Worker 베이스 URL. 설정 시 API 키 없이 프록시만 사용 */
  proxyUrl?: string;
};

export default function RagChatbot({ baseUrl = "", proxyUrl = "" }: Props) {
  const useProxy = Boolean(proxyUrl?.trim());
  const [open, setOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [modelInput, setModelInput] = useState(DEFAULT_CHAT_MODEL);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [store, setStore] = useState<VectorStoreFile | null>(null);
  const [storeError, setStoreError] = useState<string | null>(null);
  const [embeddingReady, setEmbeddingReady] = useState(false);
  const [embeddingLoading, setEmbeddingLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const listEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () =>
    listEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const s = readSettings();
    setApiKeyInput(s.geminiApiKey ?? "");
    setModelInput(s.chatModel ?? DEFAULT_CHAT_MODEL);
  }, [settingsOpen]);

  /** 벡터 스토어 선로드 + 임베딩 모델 워밍업 */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await loadVectorStore(baseUrl);
        if (cancelled) return;
        setStore(data);
        setStoreError(null);
      } catch (e) {
        if (cancelled) return;
        setStoreError(e instanceof Error ? e.message : String(e));
      }
      setEmbeddingLoading(true);
      try {
        await getEmbeddingPipeline();
        if (!cancelled) setEmbeddingReady(true);
      } catch (e) {
        if (!cancelled) {
          setStoreError(
            (prev) =>
              prev ??
              (e instanceof Error ? e.message : "임베딩 모델 로드 실패")
          );
        }
      } finally {
        if (!cancelled) setEmbeddingLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [baseUrl]);

  const saveApiSettings = () => {
    writeSettings({
      ...(useProxy
        ? {}
        : { geminiApiKey: apiKeyInput.trim() || undefined }),
      chatModel: modelInput.trim() || DEFAULT_CHAT_MODEL,
    });
    setSettingsOpen(false);
  };

  const clearApiKey = () => {
    setApiKeyInput("");
    writeSettings({
      chatModel: modelInput.trim() || DEFAULT_CHAT_MODEL,
    });
  };

  const sendMessage = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || chatLoading || !store) return;

    const settings = readSettings();
    const key = readGeminiKey();
    if (!useProxy && !key) {
      setSettingsOpen(true);
      return;
    }

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
      createdAt: Date.now(),
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setChatLoading(true);

    const assistantId = crypto.randomUUID();
    setMessages((m) => [
      ...m,
      {
        id: assistantId,
        role: "assistant",
        content: "",
        createdAt: Date.now(),
      },
    ]);

    try {
      setEmbeddingLoading(true);
      const qEmb = await embedQuery(trimmed);
      setEmbeddingLoading(false);

      const top = retrieveTopK(qEmb, store, 2);
      const context = buildContextBlock(top);
      const model = settings.chatModel?.trim() || DEFAULT_CHAT_MODEL;

      const userPayload = `[참고 문서]\n${context}\n\n[질문]\n${trimmed}`;
      let acc = "";
      if (useProxy) {
        await streamViaWorkerProxy(
          proxyUrl.trim(),
          model,
          SYSTEM_PROMPT,
          userPayload,
          (delta) => {
            acc += delta;
            setMessages((m) =>
              m.map((msg) =>
                msg.id === assistantId ? { ...msg, content: acc } : msg
              )
            );
          }
        );
      } else {
        const directKey = readGeminiKey();
        if (!directKey) {
          setMessages((m) =>
            m.map((msg) =>
              msg.id === assistantId
                ? { ...msg, content: "오류: API 키가 없습니다. 설정에서 키를 저장해 주세요." }
                : msg
            )
          );
          return;
        }
        await streamGeminiChat(
          directKey,
          model,
          SYSTEM_PROMPT,
          userPayload,
          (delta) => {
            acc += delta;
            setMessages((m) =>
              m.map((msg) =>
                msg.id === assistantId ? { ...msg, content: acc } : msg
              )
            );
          }
        );
      }
    } catch (e) {
      const err = e instanceof Error ? e.message : String(e);
      setMessages((m) =>
        m.map((msg) =>
          msg.id === assistantId
            ? { ...msg, content: `오류: ${err}` }
            : msg
        )
      );
    } finally {
      setChatLoading(false);
      setEmbeddingLoading(false);
    }
  }, [input, chatLoading, store, useProxy, proxyUrl]);

  const hasKey = useProxy || Boolean(readGeminiKey());

  return (
    <>
      {/* 플로팅 버튼 */}
      <button
        type="button"
        aria-label="블로그 챗봇 열기"
        onClick={() => setOpen(true)}
        className={`rag-fab fixed bottom-6 right-6 z-[100] flex h-12 w-12 items-center justify-center rounded-full border-2 border-slate-400 bg-white text-slate-600 shadow-none transition-colors hover:border-slate-500 hover:bg-slate-50 hover:text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2 dark:border-slate-500 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 dark:focus-visible:ring-slate-500 ${
          open ? "hidden" : ""
        }`}
      >
        <MessageCircle className="h-[1.35rem] w-[1.35rem] stroke-[1.75]" aria-hidden />
      </button>

      {/* 패널 */}
      {open && (
        <div
          className="rag-panel fixed bottom-6 right-6 z-[100] flex h-[min(560px,85vh)] w-[min(400px,92vw)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
          role="dialog"
          aria-label="블로그 RAG 챗봇"
        >
          <header className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              블로그 검색 챗봇
            </h2>
            <div className="flex gap-1">
              {/* 직접 Gemini 모드에서만 API 키·모델 설정 필요. 프록시 모드는 Worker 시크릿만 사용 */}
              {!useProxy && (
                <button
                  type="button"
                  aria-label="Gemini API 키 및 모델 설정"
                  onClick={() => setSettingsOpen(true)}
                  className="rounded-lg p-2 text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  <Settings className="h-5 w-5" />
                </button>
              )}
              <button
                type="button"
                aria-label="닫기"
                onClick={() => setOpen(false)}
                className="rounded-lg p-2 text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </header>

          {/* 상태 바 */}
          <div className="border-b border-slate-100 px-4 py-2.5 text-xs leading-relaxed text-slate-500 dark:border-slate-800 dark:text-slate-400">
            {storeError && (
              <span className="text-red-600 dark:text-red-400">
                인덱스: {storeError}
              </span>
            )}
            {!storeError && !store && <span>인덱스 로딩 중…</span>}
            {store && !embeddingReady && embeddingLoading && (
              <span className="flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                임베딩 모델 로딩 중 (최초 1회 수십 초 걸릴 수 있음)
              </span>
            )}
            {store && embeddingReady && !hasKey && (
              <span>설정(톱니)에서 Gemini API 키를 입력하세요.</span>
            )}
            {store && embeddingReady && hasKey && useProxy && (
              <span className="text-emerald-700 dark:text-emerald-400">
                프록시 연결 · 상위 2개 문단 참고 · 키는 서버(Worker)에만 있습니다.
              </span>
            )}
            {store && embeddingReady && hasKey && !useProxy && (
              <span className="text-emerald-700 dark:text-emerald-400">
                준비됨 · 상위 2개 문단을 참고해 답변합니다.
              </span>
            )}
          </div>

          <div className="rag-messages flex min-h-0 flex-1 flex-col space-y-3 overflow-y-auto overflow-x-hidden px-4 py-3">
            {messages.length === 0 && (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {useProxy
                  ? "포스트 내용을 바탕으로 질문해 보세요. 답변은 Cloudflare Worker를 통해 전달되며 API 키는 브라우저에 저장되지 않습니다."
                  : "포스트 내용을 바탕으로 질문해 보세요. Gemini API 키는 브라우저(localStorage)에만 저장됩니다."}
              </p>
            )}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`max-w-full rounded-xl px-3 py-2.5 text-sm ${
                  msg.role === "user"
                    ? "ml-8 bg-emerald-100 text-slate-900 dark:bg-emerald-900/40 dark:text-slate-100"
                    : "mr-4 bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                }`}
              >
                <div className="break-words whitespace-pre-wrap [overflow-wrap:anywhere]">
                  {msg.content || (chatLoading ? "…" : "")}
                </div>
              </div>
            ))}
            <div ref={listEndRef} />
          </div>

          <div className="border-t border-slate-200 px-4 py-3 dark:border-slate-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                placeholder="질문을 입력…"
                disabled={chatLoading || !embeddingReady || !store}
                className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
              <button
                type="button"
                onClick={sendMessage}
                disabled={chatLoading || !embeddingReady || !store}
                className="flex shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 text-slate-600 hover:bg-slate-200 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                aria-label="전송"
              >
                {chatLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 설정 모달 */}
      {settingsOpen && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4"
          role="presentation"
          onClick={() => setSettingsOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-600 dark:bg-slate-900"
            role="dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-100">
              {useProxy ? "챗봇 설정" : "Gemini 설정"}
            </h3>
            {useProxy ? (
              <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
                API 키는 Cloudflare Worker 시크릿으로만 보관됩니다. 아래 모델은
                Worker에 허용된 목록과 일치해야 합니다(
                <code className="text-[11px]">wrangler.toml</code>의{" "}
                <code className="text-[11px]">ALLOWED_MODELS</code>).
              </p>
            ) : (
              <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
                키는{" "}
                <a
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 underline dark:text-emerald-400"
                >
                  Google AI Studio
                </a>
                에서 무료로 발급할 수 있습니다. 이 브라우저의 localStorage에만
                저장되며, 브라우저에서 Gemini API로 직접 호출합니다.
              </p>
            )}
            {!useProxy && (
              <>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Gemini API Key
                </label>
                <input
                  type="password"
                  autoComplete="off"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  className="mb-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  placeholder="AIza..."
                />
              </>
            )}
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              모델 ID
            </label>
            <input
              type="text"
              value={modelInput}
              onChange={(e) => setModelInput(e.target.value)}
              className="mb-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              placeholder="gemini-2.0-flash"
            />
            <div className="flex flex-wrap gap-2 justify-end">
              {!useProxy && (
                <button
                  type="button"
                  onClick={clearApiKey}
                  className="rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  키 삭제
                </button>
              )}
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                취소
              </button>
              <button
                type="button"
                onClick={saveApiSettings}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
