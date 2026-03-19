/**
 * RAG 챗봇 엔트리 — Jekyll 페이지의 #rag-chat-root 에 마운트
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import RagChatbot from "../components/RagChatbot";
import "./index.css";

const rootEl = document.getElementById("rag-chat-root");
if (rootEl) {
  const baseUrl = rootEl.getAttribute("data-baseurl") ?? "";
  const proxyUrl = (rootEl.getAttribute("data-proxy-url") ?? "").trim();
  createRoot(rootEl).render(
    <StrictMode>
      <RagChatbot baseUrl={baseUrl} proxyUrl={proxyUrl || undefined} />
    </StrictMode>
  );
}
