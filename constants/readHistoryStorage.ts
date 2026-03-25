/** localStorage 키 — graph 노드 id와 동일한 permalink 경로 배열 (최신 우선) */
export const READ_HISTORY_STORAGE_KEY = "readHistory";

export const READ_HISTORY_MAX_ITEMS = 20;

/** 그래프 `node.id` 형식: `/posts/slug/` */
export function normalizeReadHistorySlug(slug: string): string {
  let s = slug.trim();
  if (!s) return "";
  if (!s.startsWith("/")) s = `/${s}`;
  if (!s.endsWith("/")) s = `${s}/`;
  return s;
}

export function loadReadHistoryFromStorage(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(READ_HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((x): x is string => typeof x === "string" && x.length > 0)
      .map((x) => normalizeReadHistorySlug(x))
      .filter(Boolean)
      .slice(0, READ_HISTORY_MAX_ITEMS);
  } catch {
    return [];
  }
}

export function persistReadHistory(ids: readonly string[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(READ_HISTORY_STORAGE_KEY, JSON.stringify([...ids]));
}
