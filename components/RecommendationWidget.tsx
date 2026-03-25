/**
 * 지식 그래프 기반 추천: Tailwind 전용 수평 바 차트 (Recharts 미사용)
 * UI는 PRD 목업(넷플릭스형 헤드라인·0–90 축·Score 범례)에 맞춤.
 */

import { useMemo } from "react";
import type { Recommendation } from "../hooks/useRecommendations";

export type RecommendationWidgetProps = {
  recommendations: Recommendation[];
  /** 현재 글 permalink 조각(예: `/posts/foo/` 또는 `posts/foo`) — 동일 글 행 제외·접근성 */
  currentSlug: string;
  /** 그래프 로딩 중이면 스켈레톤 표시 (없으면 빈 배열은 “추천 없음”) */
  isLoading?: boolean;
};

function normalizePostPath(p: string): string {
  let x = p.trim();
  if (!x) return "";
  if (!x.startsWith("/")) x = `/${x}`;
  if (!x.endsWith("/")) x = `${x}/`;
  return x.toLowerCase();
}

function isCurrentPost(nodeId: string, currentSlug: string): boolean {
  const cur = normalizePostPath(currentSlug);
  if (!cur) return false;
  return normalizePostPath(nodeId) === cur;
}

/** 배치 내 상대 비율 → 표시 % (최고점 = 100%) */
function withDisplayPercent(items: Recommendation[]): Array<
  Recommendation & { percent: number }
> {
  if (items.length === 0) return [];
  const maxScore = Math.max(1, ...items.map((r) => r.score));
  return items.map((r) => ({
    ...r,
    percent: Math.min(100, Math.max(0, Math.round((r.score / maxScore) * 100))),
  }));
}

/** 막대 길이: 축 0–90과 정렬 (100% 표시점 → 트랙의 90%) */
function barWidthOnAxis(percent: number): string {
  const w = (percent / 100) * 90;
  return `${Math.min(90, Math.max(0, w))}%`;
}

/** 90+ 녹색, 70–89 주황, 50–69 회색 */
function barGradientClass(percent: number): string {
  if (percent >= 90) {
    return "bg-gradient-to-r from-emerald-600 via-green-500 to-lime-500 dark:from-emerald-700 dark:via-green-600 dark:to-lime-600";
  }
  if (percent >= 70) {
    return "bg-gradient-to-r from-amber-400 via-orange-400 to-orange-500 dark:from-amber-500 dark:via-orange-500 dark:to-orange-600";
  }
  if (percent >= 50) {
    return "bg-gradient-to-r from-zinc-400 to-zinc-500 dark:from-zinc-500 dark:to-zinc-600";
  }
  return "bg-gradient-to-r from-zinc-300 to-zinc-400 dark:from-zinc-600 dark:to-zinc-700";
}

function formatTooltip(percent: number, reason: string): string {
  const line1 = `${percent}% 독자가 다음으로 선택 | Direct Link 연결`;
  return reason.trim() ? `${line1}\n${reason}` : line1;
}

function ScoreLegend() {
  const steps: { label: string; className: string }[] = [
    { label: "90", className: "bg-emerald-600 dark:bg-emerald-500" },
    { label: "85", className: "bg-lime-500 dark:bg-lime-400" },
    { label: "80", className: "bg-yellow-400 dark:bg-yellow-500" },
    { label: "75", className: "bg-orange-400 dark:bg-orange-500" },
    { label: "70", className: "bg-zinc-400 dark:bg-zinc-500" },
  ];
  return (
    <div
      className="flex w-11 shrink-0 flex-col justify-center gap-1 border-l border-zinc-200 pl-2 dark:border-zinc-600"
      aria-hidden
    >
      <p className="mb-0.5 text-center text-[9px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        Score
      </p>
      {steps.map(({ label, className }) => (
        <div key={label} className="flex items-center justify-end gap-1">
          <span className="text-[9px] tabular-nums text-zinc-600 dark:text-zinc-400">{label}</span>
          <span className={`h-2 w-2 shrink-0 rounded-sm ${className}`} />
        </div>
      ))}
    </div>
  );
}

function BarRow(props: {
  item: Recommendation & { percent: number };
  href: string;
}) {
  const { item, href } = props;
  const { node, percent, reason } = item;
  const gradient = barGradientClass(percent);
  const tip = formatTooltip(percent, reason);

  return (
    <div className="grid grid-cols-[minmax(0,42%)_1fr] items-center gap-x-2 gap-y-0.5 py-0.5">
      <a
        href={href}
        className="min-w-0 truncate text-left text-[11px] font-medium leading-snug text-emerald-800 underline-offset-2 hover:underline dark:text-emerald-400"
      >
        {node.name}
      </a>
      <div className="group relative flex min-w-0 items-center gap-1">
        <div
          className="relative h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-zinc-200/90 dark:bg-zinc-700/80"
          role="img"
          aria-label={`${node.name}, ${percent}%, ${tip}`}
          title={tip}
        >
          <div
            className={`h-full rounded-full transition-[width] duration-500 ease-out ${gradient}`}
            style={{ width: barWidthOnAxis(percent) }}
          />
        </div>
        <span className="w-7 shrink-0 text-right text-[10px] tabular-nums text-zinc-600 dark:text-zinc-400">
          {percent}%
        </span>
        <div
          className="pointer-events-none absolute bottom-full left-0 z-10 mb-1 max-w-[min(100%,18rem)] whitespace-pre-line rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-[11px] leading-snug text-zinc-700 shadow-lg opacity-0 transition-opacity duration-150 group-hover:pointer-events-auto group-hover:opacity-100 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200"
          role="tooltip"
        >
          {tip}
        </div>
      </div>
    </div>
  );
}

function ChartBlock(props: { rows: Array<Recommendation & { percent: number }> }) {
  const { rows } = props;
  return (
    <div className="flex min-h-0 flex-1 gap-2">
      <div className="flex min-w-0 min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 space-y-0 overflow-y-auto pr-1">
          {rows.map((item) => (
            <BarRow key={item.node.id} item={item} href={item.node.id} />
          ))}
        </div>
        <div className="mt-1 grid shrink-0 grid-cols-[minmax(0,42%)_1fr] gap-x-2 border-t border-zinc-200 pt-1.5 dark:border-zinc-600">
          <span className="sr-only">추천 스코어 축</span>
          <div className="min-w-0" />
          <div className="min-w-0">
            <div className="flex justify-between px-0.5 text-[10px] tabular-nums text-zinc-500 dark:text-zinc-400">
              <span>0</span>
              <span>30</span>
              <span>60</span>
              <span>90</span>
            </div>
            <p className="text-center text-[10px] leading-tight text-zinc-500 dark:text-zinc-400">
              추천 스코어 (%)
            </p>
          </div>
        </div>
      </div>
      <ScoreLegend />
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2" aria-busy="true" aria-live="polite">
      <div className="space-y-1">
        <div className="h-3 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
        <div className="h-2 w-2/3 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
      </div>
      <div className="flex min-h-0 flex-1 gap-2">
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="grid grid-cols-[minmax(0,42%)_1fr] gap-2">
              <div className="h-3 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
              <div className="h-2 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-700" />
            </div>
          ))}
        </div>
        <div className="w-11 shrink-0 animate-pulse rounded border border-zinc-200 bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-800" />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 px-2 text-center">
      <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">표시할 추천이 없습니다</p>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        다른 글을 읽으면 그래프 기반 추천이 여기에 나타납니다.
      </p>
    </div>
  );
}

export function RecommendationWidget(props: RecommendationWidgetProps) {
  const { recommendations, currentSlug, isLoading = false } = props;

  const rows = useMemo(() => {
    const filtered = recommendations.filter((r) => !isCurrentPost(r.node.id, currentSlug));
    return withDisplayPercent(filtered);
  }, [recommendations, currentSlug]);

  const headlinePct = rows[0]?.percent;

  return (
    <section
      className="flex h-[320px] w-full max-w-full flex-col rounded-xl border border-zinc-200 bg-zinc-50/80 p-3 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/40 sm:p-4"
      aria-labelledby="recommendation-widget-heading"
    >
      <header className="mb-2 shrink-0 space-y-0.5">
        <h2
          id="recommendation-widget-heading"
          className="text-sm font-semibold leading-snug tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-[15px]"
        >
          {headlinePct != null ? (
            <>
              AI 추천: 이 글을 읽은{" "}
              <span className="text-emerald-700 dark:text-emerald-400">{headlinePct}%</span>의 사람들이
              다음 글을 읽었습니다
            </>
          ) : (
            <>AI 추천: 읽기 이력이 쌓이면 맞춤 다음 글을 제안합니다</>
          )}
        </h2>
        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
          실시간 개인화 | 읽을수록 정확해집니다
        </p>
      </header>

      {isLoading ? (
        <LoadingSkeleton />
      ) : rows.length === 0 ? (
        <EmptyState />
      ) : (
        <ChartBlock rows={rows} />
      )}
    </section>
  );
}
