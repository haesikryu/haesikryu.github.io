import { useEffect, useMemo } from "react";
import { useRecommendationContext } from "../contexts/RecommendationContext";
import { useRecommendations } from "../hooks/useRecommendations";
import { graphPathFromPageUrl } from "../utils/jekyllPageUrl";
import { RecommendationWidget } from "./RecommendationWidget";

export type PostRecommendationIslandProps = {
  baseUrl: string;
  /** Jekyll `page.url` (baseurl 포함 가능) */
  currentPostUrl: string;
};

export function PostRecommendationIsland(props: PostRecommendationIslandProps) {
  const { baseUrl, currentPostUrl } = props;
  const graphPath = useMemo(
    () => graphPathFromPageUrl(currentPostUrl, baseUrl),
    [currentPostUrl, baseUrl]
  );

  const { markAsRead } = useRecommendationContext();
  const { recommendations, isLoading, error } = useRecommendations({
    currentPostId: graphPath || undefined,
    baseUrl,
  });

  useEffect(() => {
    if (graphPath.startsWith("/posts/")) markAsRead(graphPath);
  }, [graphPath, markAsRead]);

  if (!graphPath) return null;

  if (error) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
        추천을 불러오지 못했습니다.
      </div>
    );
  }

  return (
    <RecommendationWidget
      recommendations={recommendations}
      currentSlug={graphPath}
      isLoading={isLoading}
    />
  );
}
