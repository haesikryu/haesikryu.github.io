/**
 * 사이드바용 추천: 세로 카드, 3초 주기 갱신 애니메이션, 접기/펼침
 */

import { ChevronDown, ChevronUp } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRecommendationContext } from "../contexts/RecommendationContext";
import { useRecommendations, type Recommendation } from "../hooks/useRecommendations";
import { graphPathFromPageUrl } from "../utils/jekyllPageUrl";

const COLLAPSE_KEY = "sidebar-recommendations-collapsed";
const REFRESH_MS = 3000;

export type SidebarRecommendationsProps = {
  baseUrl: string;
  /** Jekyll `page.url` */
  currentPostUrl: string;
};

function cardPercent(items: Recommendation[], item: Recommendation): number {
  if (items.length === 0) return 0;
  const maxScore = Math.max(1, ...items.map((r) => r.score));
  return Math.min(100, Math.max(0, Math.round((item.score / maxScore) * 100)));
}

function scoreToneClass(percent: number): string {
  if (percent >= 90) return "border-emerald-200/80 bg-emerald-50/90 dark:border-emerald-800 dark:bg-emerald-950/40";
  if (percent >= 70) return "border-amber-200/80 bg-amber-50/80 dark:border-amber-800 dark:bg-amber-950/35";
  return "border-zinc-200 bg-zinc-50/90 dark:border-zinc-600 dark:bg-zinc-800/50";
}

export function SidebarRecommendations(props: SidebarRecommendationsProps) {
  const { baseUrl, currentPostUrl } = props;
  const graphPath = useMemo(
    () => graphPathFromPageUrl(currentPostUrl, baseUrl),
    [currentPostUrl, baseUrl]
  );

  const { markAsRead } = useRecommendationContext();
  const { recommendations, isLoading, error, mutate } = useRecommendations({
    currentPostId: graphPath || undefined,
    baseUrl,
  });

  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(COLLAPSE_KEY) === "1";
  });

  const [refreshGen, setRefreshGen] = useState(0);

  const setCollapsedPersist = useCallback((next: boolean) => {
    setCollapsed(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
    }
  }, []);

  useEffect(() => {
    if (graphPath.startsWith("/posts/")) markAsRead(graphPath);
  }, [graphPath, markAsRead]);

  useEffect(() => {
    const id = window.setInterval(() => {
      void mutate(undefined, { revalidate: true });
      setRefreshGen((g) => g + 1);
    }, REFRESH_MS);
    return () => window.clearInterval(id);
  }, [mutate]);

  const cards = useMemo(() => {
    return recommendations.map((r) => ({
      ...r,
      percent: cardPercent(recommendations, r),
    }));
  }, [recommendations]);

  if (error) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-2 py-2 text-xs text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
        추천을 불러오지 못했습니다.
      </div>
    );
  }

  return (
    <section
      className="sidebar-recommendations w-full min-w-0 max-w-full text-zinc-800 dark:text-zinc-100"
      aria-labelledby="sidebar-recommendations-title"
    >
      <div className="mb-2 flex w-full min-w-0 items-center justify-between gap-2">
        <h2
          id="sidebar-recommendations-title"
          className="min-w-0 truncate text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
        >
          추천 글
        </h2>
        <button
          type="button"
          onClick={() => setCollapsedPersist(!collapsed)}
          className="flex shrink-0 items-center gap-1 rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          aria-expanded={!collapsed}
          aria-controls="sidebar-recommendations-panel"
        >
          {collapsed ? (
            <>
              펼치기 <ChevronDown className="h-3.5 w-3.5" aria-hidden />
            </>
          ) : (
            <>
              접기 <ChevronUp className="h-3.5 w-3.5" aria-hidden />
            </>
          )}
        </button>
      </div>

      <div
        id="sidebar-recommendations-panel"
        className={collapsed ? "hidden" : "block"}
        aria-hidden={collapsed}
      >
        {isLoading ? (
          <ul className="flex flex-col gap-2">
            {Array.from({ length: 4 }, (_, i) => (
              <li
                key={i}
                className="h-16 animate-pulse rounded-lg bg-zinc-200/80 dark:bg-zinc-700/60"
              />
            ))}
          </ul>
        ) : cards.length === 0 ? (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            표시할 추천이 없습니다. 글을 더 읽으면 맞춤 추천이 생깁니다.
          </p>
        ) : (
          <ul
            key={refreshGen}
            className="sidebar-rec-refresh flex flex-col gap-2"
          >
            {cards.map((item) => (
              <li key={item.node.id} className="min-w-0">
                <a
                  href={item.node.id}
                  title={item.reason}
                  className={`block min-w-0 rounded-lg border px-3 py-2.5 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md ${scoreToneClass(item.percent)}`}
                >
                  <span className="line-clamp-2 text-sm font-medium leading-snug text-zinc-900 dark:text-zinc-50">
                    {item.node.name}
                  </span>
                  <span className="mt-1 flex items-center justify-between gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                    <span className="tabular-nums">{item.percent}%</span>
                    <span className="truncate text-zinc-500 dark:text-zinc-500" title={item.reason}>
                      {item.reason}
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
