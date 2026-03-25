import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  READ_HISTORY_STORAGE_KEY,
  READ_HISTORY_MAX_ITEMS,
  loadReadHistoryFromStorage,
  normalizeReadHistorySlug,
  persistReadHistory,
} from "../constants/readHistoryStorage";

export type RecommendationContextValue = {
  /** 최신 우선, 최대 20개 (그래프 노드 id 경로) */
  readHistory: readonly string[];
  /** 읽음 처리: localStorage + React state 동기화 */
  markAsRead: (slug: string) => void;
};

export const RecommendationContext = createContext<RecommendationContextValue | null>(null);

function mergeReadHistory(prev: readonly string[], normalizedId: string): string[] {
  if (!normalizedId) return [...prev];
  const next = [normalizedId, ...prev.filter((id) => id !== normalizedId)];
  return next.slice(0, READ_HISTORY_MAX_ITEMS);
}

export function RecommendationProvider({ children }: { children: ReactNode }) {
  const [readHistory, setReadHistory] = useState<string[]>(() => loadReadHistoryFromStorage());

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== READ_HISTORY_STORAGE_KEY) return;
      setReadHistory(loadReadHistoryFromStorage());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const markAsRead = useCallback((slug: string) => {
    const id = normalizeReadHistorySlug(slug);
    if (!id) return;
    setReadHistory((prev) => {
      const next = mergeReadHistory(prev, id);
      persistReadHistory(next);
      return next;
    });
  }, []);

  const value = useMemo<RecommendationContextValue>(
    () => ({ readHistory, markAsRead }),
    [readHistory, markAsRead]
  );

  return <RecommendationContext.Provider value={value}>{children}</RecommendationContext.Provider>;
}

export function useRecommendationContext(): RecommendationContextValue {
  const ctx = useContext(RecommendationContext);
  if (!ctx) {
    throw new Error("useRecommendationContext는 RecommendationProvider 안에서만 사용할 수 있습니다.");
  }
  return ctx;
}
