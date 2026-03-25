/**
 * Jekyll 정적 사이트용 앱 셸 — Next.js `pages/_app` 역할.
 * RAG·추천 등 동일 번들의 React 트리를 한 Provider 아래에서 공유합니다.
 */

import type { ReactNode } from "react";
import { RecommendationProvider } from "../contexts/RecommendationContext";

export function AppProviders({ children }: { children: ReactNode }) {
  return <RecommendationProvider>{children}</RecommendationProvider>;
}
