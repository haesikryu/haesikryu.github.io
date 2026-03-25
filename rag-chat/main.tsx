/**
 * RAG 챗봇 + 포스트 추천 위젯 — Jekyll에서 삽입된 DOM 노드에 포털 마운트
 *
 * RagChatbot은 @xenova/transformers를 끌고 와 무겁습니다. 정적 import하면
 * 엔트리 한 번에 올라가며 실패 시 추천 위젯까지 안 뜹니다 → lazy 로 분리합니다.
 */

import { StrictMode, Suspense, lazy } from "react";
import { createPortal } from "react-dom";
import { createRoot } from "react-dom/client";
import { PostRecommendationIsland } from "../components/PostRecommendationIsland";
import { SidebarRecommendations } from "../components/SidebarRecommendations";
import { AppProviders } from "./_app";
import "./index.css";

const RagChatbot = lazy(() => import("../components/RagChatbot"));

const islandsEl = document.getElementById("react-islands-root");
const ragRootEl = document.getElementById("rag-chat-root");

function readRagDataset(el: HTMLElement) {
  return {
    baseUrl: el.getAttribute("data-baseurl") ?? "",
    proxyUrl: (el.getAttribute("data-proxy-url") ?? "").trim(),
  };
}

if (islandsEl && ragRootEl) {
  const { baseUrl, proxyUrl } = readRagDataset(ragRootEl);
  const recInlineEl =
    document.getElementById("recommendation-inline-root") ??
    document.getElementById("recommendation-widget-root");
  const recSidebarEl = document.getElementById("recommendation-sidebar-root");

  const inlineBaseUrl = (recInlineEl?.getAttribute("data-baseurl") ?? baseUrl).trim();
  const inlinePostUrl = (recInlineEl?.getAttribute("data-current-url") ?? "").trim();
  const sidebarBaseUrl = (recSidebarEl?.getAttribute("data-baseurl") ?? baseUrl).trim();
  const sidebarPostUrl = (recSidebarEl?.getAttribute("data-current-url") ?? "").trim();

  createRoot(islandsEl).render(
    <StrictMode>
      <AppProviders>
        {createPortal(
          <Suspense fallback={null}>
            <RagChatbot baseUrl={baseUrl} proxyUrl={proxyUrl || undefined} />
          </Suspense>,
          ragRootEl
        )}
        {recInlineEl
          ? createPortal(
              <PostRecommendationIsland baseUrl={inlineBaseUrl} currentPostUrl={inlinePostUrl} />,
              recInlineEl
            )
          : null}
        {recSidebarEl
          ? createPortal(
              <SidebarRecommendations baseUrl={sidebarBaseUrl} currentPostUrl={sidebarPostUrl} />,
              recSidebarEl
            )
          : null}
      </AppProviders>
    </StrictMode>
  );
} else if (ragRootEl) {
  const { baseUrl, proxyUrl } = readRagDataset(ragRootEl);
  createRoot(ragRootEl).render(
    <StrictMode>
      <AppProviders>
        <Suspense fallback={null}>
          <RagChatbot baseUrl={baseUrl} proxyUrl={proxyUrl || undefined} />
        </Suspense>
      </AppProviders>
    </StrictMode>
  );
}
