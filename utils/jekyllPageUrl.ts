import { normalizeReadHistorySlug } from "../constants/readHistoryStorage";

/** Jekyll `page.url`에서 `site.baseurl` 접두 제거 후 그래프 노드 id(`/posts/.../`)로 정규화 */
export function graphPathFromPageUrl(currentPostUrl: string, baseUrl: string): string {
  const p = currentPostUrl.trim();
  if (!p) return "";
  const b = baseUrl.replace(/\/$/, "");
  let path = p;
  if (b && path.startsWith(`${b}/`)) {
    const rest = path.slice(b.length);
    path = rest.startsWith("/") ? rest : `/${rest}`;
  } else if (!path.startsWith("/")) {
    path = `/${path}`;
  }
  if (p === b || p === `${b}/`) return normalizeReadHistorySlug("/");
  return normalizeReadHistorySlug(path);
}
