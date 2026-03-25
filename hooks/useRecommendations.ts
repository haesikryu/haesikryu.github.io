import { useContext, useMemo } from "react";
import useSWR from "swr";
import { loadReadHistoryFromStorage } from "../constants/readHistoryStorage";
import { RecommendationContext } from "../contexts/RecommendationContext";

/** 그래프 JSON (update-graph-stats 반영 후) 노드 */
export type EnhancedNode = {
  id: string;
  name: string;
  group?: string;
  val?: number;
  degree: number;
  viewCount: number;
};

export type GraphLink = {
  source: string;
  target: string;
};

export type GraphPayload = {
  nodes: EnhancedNode[];
  links: GraphLink[];
};

export type Recommendation = {
  node: EnhancedNode;
  score: number;
  reason: string;
};

const TOP_K = 6;

/** BFS 거리: seed에서 1 = 직접 연결, 2 = 1-hop, 3 = 2-hop */
export type GraphDistance = 1 | 2 | 3;

function trimBaseUrl(base: string): string {
  return base.replace(/\/$/, "");
}

function graphDataUrl(baseUrl: string): string {
  const b = trimBaseUrl(baseUrl);
  return `${b}/assets/data/graph-data.json`;
}

/**
 * localStorage.readHistory — 포스트 id 경로 문자열 배열 (최신 우선), 최대 20개.
 * `RecommendationProvider` 안에서는 컨텍스트 상태가 우선됩니다.
 */
export function loadReadHistory(): string[] {
  return loadReadHistoryFromStorage();
}

function normalizeNode(raw: unknown): EnhancedNode | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.id !== "string" || typeof o.name !== "string") return null;
  return {
    id: o.id,
    name: o.name,
    group: typeof o.group === "string" ? o.group : undefined,
    val: typeof o.val === "number" ? o.val : undefined,
    degree: typeof o.degree === "number" ? o.degree : 0,
    viewCount: typeof o.viewCount === "number" ? o.viewCount : 0,
  };
}

function normalizeLink(raw: unknown): GraphLink | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.source !== "string" || typeof o.target !== "string") return null;
  return { source: o.source, target: o.target };
}

async function fetchGraphJson(url: string): Promise<GraphPayload> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`graph-data fetch failed: ${res.status} ${res.statusText}`);
  }
  const json: unknown = await res.json();
  if (!json || typeof json !== "object") {
    throw new Error("graph-data: invalid root");
  }
  const root = json as { nodes?: unknown; links?: unknown };
  const nodes = Array.isArray(root.nodes)
    ? root.nodes.map(normalizeNode).filter((n): n is EnhancedNode => n !== null)
    : [];
  const links = Array.isArray(root.links)
    ? root.links.map(normalizeLink).filter((l): l is GraphLink => l !== null)
    : [];
  return { nodes, links };
}

/** 무방향 인접 리스트 */
function buildAdjacency(nodes: EnhancedNode[], links: GraphLink[]): Map<string, Set<string>> {
  const adj = new Map<string, Set<string>>();
  for (const n of nodes) {
    adj.set(n.id, new Set());
  }
  for (const { source, target } of links) {
    if (!adj.has(source) || !adj.has(target)) continue;
    adj.get(source)!.add(target);
    adj.get(target)!.add(source);
  }
  return adj;
}

/**
 * 다중 시작점 BFS. 반환: 노드 id → 시작점으로부터의 **간선 수** 거리 (시작점은 0)
 */
function multiSourceBfsDistances(
  adj: Map<string, Set<string>>,
  seeds: readonly string[]
): Map<string, number> {
  const dist = new Map<string, number>();
  const queue: string[] = [];
  for (const s of seeds) {
    if (!adj.has(s) || dist.has(s)) continue;
    dist.set(s, 0);
    queue.push(s);
  }
  let head = 0;
  while (head < queue.length) {
    const u = queue[head++]!;
    const du = dist.get(u)!;
    const nbrs = adj.get(u);
    if (!nbrs) continue;
    for (const v of nbrs) {
      if (dist.has(v)) continue;
      dist.set(v, du + 1);
      queue.push(v);
    }
  }
  return dist;
}

/**
 * PRD 점수 (ip/prd 미수록 시 프로젝트 내 고정 합의식)
 *
 * - graphDistance d: seed(현재 글 + readHistory 최대 20)에서의 최단 간선 거리.
 *   해석: d=1 직접 연결, d=2 1-hop, d=3 2-hop (문서의 1=직접 / 2=1-hop / 3=2-hop 과 대응)
 * - 추천 후보: d ∈ {1,2,3} 만 (d=0 은 seed 본인, d>3 은 제외)
 * - score = (4 - d) * 28 + viewCount * 0.04 + (현재 글과 group 동일 시 12)
 * - 결과는 표시용으로 반올림
 */
function computeScore(params: {
  graphDistance: GraphDistance;
  viewCount: number;
  sameGroupAsCurrent: boolean;
}): number {
  const { graphDistance: d, viewCount, sameGroupAsCurrent } = params;
  const proximity = (4 - d) * 28;
  const popularity = viewCount * 0.04;
  const groupBonus = sameGroupAsCurrent ? 12 : 0;
  return Math.round(proximity + popularity + groupBonus);
}

function buildReason(d: GraphDistance, sameGroup: boolean, viewCount: number): string {
  const parts: string[] = [];
  if (d === 1) parts.push("읽은 글·현재 글과 직접 연결");
  else if (d === 2) parts.push("1-hop 인접");
  else parts.push("2-hop 인접");
  if (sameGroup) parts.push("같은 주제 그룹");
  if (viewCount >= 800) parts.push("가상 조회수 높음");
  else if (viewCount >= 400) parts.push("가상 조회수 중간");
  return parts.join(" · ");
}

export type UseRecommendationsOptions = {
  /** 현재 글 id (permalink 경로, 예: `/posts/foo/`) */
  currentPostId: string | null | undefined;
  /** Jekyll `baseurl` (앞뒤 슬래시 없이, 루트면 "") */
  baseUrl?: string;
};

export function useRecommendations(
  options: UseRecommendationsOptions
): {
  recommendations: Recommendation[];
  isLoading: boolean;
  isValidating: boolean;
  error: Error | undefined;
  mutate: ReturnType<typeof useSWR<GraphPayload>>["mutate"];
} {
  const { currentPostId, baseUrl = "" } = options;
  const url = useMemo(() => graphDataUrl(baseUrl || ""), [baseUrl]);

  const ctxReadHistory = useContext(RecommendationContext)?.readHistory;

  const { data, error, isLoading, isValidating, mutate } = useSWR<GraphPayload>(
    url,
    fetchGraphJson,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60_000,
    }
  );

  const readHistory = useMemo(() => {
    if (ctxReadHistory != null) return [...ctxReadHistory];
    return loadReadHistoryFromStorage();
  }, [currentPostId, ctxReadHistory]);

  const nodeById = useMemo(() => {
    const m = new Map<string, EnhancedNode>();
    if (!data?.nodes) return m;
    for (const n of data.nodes) {
      m.set(n.id, n);
    }
    return m;
  }, [data?.nodes]);

  const adjacency = useMemo(() => {
    if (!data?.nodes || !data?.links) return new Map<string, Set<string>>();
    return buildAdjacency(data.nodes, data.links);
  }, [data?.nodes, data?.links]);

  const seeds = useMemo(() => {
    const s = new Set<string>();
    if (currentPostId) s.add(currentPostId);
    for (const id of readHistory) s.add(id);
    return [...s].filter((id) => nodeById.has(id));
  }, [currentPostId, readHistory, nodeById]);

  const distances = useMemo(() => {
    if (seeds.length === 0 || adjacency.size === 0) return new Map<string, number>();
    return multiSourceBfsDistances(adjacency, seeds);
  }, [adjacency, seeds]);

  const currentGroup = useMemo(() => {
    if (!currentPostId) return undefined;
    return nodeById.get(currentPostId)?.group;
  }, [currentPostId, nodeById]);

  const recommendations = useMemo((): Recommendation[] => {
    if (!data?.nodes || distances.size === 0) return [];

    const seedSet = new Set(seeds);
    const candidates: Recommendation[] = [];

    for (const node of data.nodes) {
      if (seedSet.has(node.id)) continue;
      const d = distances.get(node.id);
      if (d === undefined || d < 1 || d > 3) continue;

      const graphDistance = d as GraphDistance;
      const sameGroup =
        currentGroup !== undefined &&
        node.group !== undefined &&
        node.group === currentGroup;
      const score = computeScore({
        graphDistance,
        viewCount: node.viewCount,
        sameGroupAsCurrent: sameGroup,
      });
      const reason = buildReason(graphDistance, sameGroup, node.viewCount);
      candidates.push({ node, score, reason });
    }

    candidates.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.node.viewCount !== a.node.viewCount) return b.node.viewCount - a.node.viewCount;
      return a.node.id.localeCompare(b.node.id);
    });

    return candidates.slice(0, TOP_K);
  }, [data?.nodes, distances, seeds, currentGroup]);

  return {
    recommendations,
    isLoading,
    isValidating,
    error: error instanceof Error ? error : error ? new Error(String(error)) : undefined,
    mutate,
  };
}
