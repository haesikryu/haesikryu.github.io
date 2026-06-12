/**
 * 블로그 대시보드 렌더링 (Chart.js + dashboard-data.json)
 */

const charts = [];

function isDark() {
  return document.documentElement.getAttribute("data-mode") === "dark";
}

function palette() {
  const dark = isDark();
  return {
    text: dark ? "#e5e7eb" : "#374151",
    grid: dark ? "#374151" : "#e5e7eb",
    colors: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#64748b"],
  };
}

function destroyCharts() {
  while (charts.length) {
    const c = charts.pop();
    if (c) c.destroy();
  }
}

function renderSummary(root, summary) {
  const el = root.querySelector("#dash-summary");
  if (!el || !summary) return;

  const cards = [
    { label: "총 포스트", value: summary.totalPosts, sub: "전체 글" },
    ...summary.sections.map((s) => ({
      label: s.label,
      value: s.count,
      sub: "섹션",
    })),
  ];

  el.innerHTML = cards
    .map(
      (c) => `
    <div class="dashboard-card">
      <div class="label">${c.label}</div>
      <div class="value">${c.value}</div>
      <div class="sub">${c.sub}</div>
    </div>`
    )
    .join("");
}

function renderMonthlyChart(canvas, monthly) {
  const p = palette();
  const labels = monthly.map((m) => m.month.slice(2));
  const values = monthly.map((m) => m.count);

  charts.push(
    new Chart(canvas, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "발행 수",
            data: values,
            backgroundColor: p.colors[0] + "cc",
            borderRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            ticks: { color: p.text, maxRotation: 45, minRotation: 0 },
            grid: { color: p.grid },
          },
          y: {
            beginAtZero: true,
            ticks: { color: p.text, precision: 0 },
            grid: { color: p.grid },
          },
        },
      },
    })
  );
}

function renderSectionChart(canvas, sections) {
  const p = palette();
  charts.push(
    new Chart(canvas, {
      type: "doughnut",
      data: {
        labels: sections.map((s) => s.label),
        datasets: [
          {
            data: sections.map((s) => s.count),
            backgroundColor: p.colors.slice(0, sections.length),
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: { color: p.text, boxWidth: 12 },
          },
        },
      },
    })
  );
}

function renderTags(root, topTags) {
  const el = root.querySelector("#dash-tags");
  if (!el || !topTags?.length) {
    if (el) el.innerHTML = '<p class="dashboard-meta-line">태그 데이터 없음</p>';
    return;
  }
  const max = topTags[0].count || 1;
  el.innerHTML = topTags
    .map(
      (t) => `
    <div class="dashboard-tag-row">
      <span class="name" title="${t.tag}">${t.tag}</span>
      <div class="bar-wrap"><div class="bar" style="width:${Math.round((t.count / max) * 100)}%"></div></div>
      <span class="count">${t.count}</span>
    </div>`
    )
    .join("");
}

function renderRecent(root, recentPosts) {
  const el = root.querySelector("#dash-recent");
  if (!el) return;
  if (!recentPosts?.length) {
    el.innerHTML = '<p class="dashboard-meta-line">최근 글 없음</p>';
    return;
  }
  const base = root.dataset.baseurl || "";
  el.innerHTML = `<ul class="dashboard-list">${recentPosts
    .map((p) => {
      const d = p.date ? new Date(p.date).toLocaleDateString("ko-KR") : "";
      return `<li><a href="${base}${p.url}">${p.title}</a><span class="meta">${d} · ${p.sectionLabel || p.section}</span></li>`;
    })
    .join("")}</ul>`;
}

function renderExtras(root, data) {
  const el = root.querySelector("#dash-extras");
  if (!el) return;
  const kg = data.knowledgeGraph || {};
  const rag = data.rag || {};
  const gen = data.generatedAt ? new Date(data.generatedAt).toLocaleString("ko-KR") : "";

  el.innerHTML = `
    <div class="dashboard-grid">
      <div class="dashboard-card">
        <div class="label">Knowledge Graph</div>
        <div class="value">${kg.nodes ?? 0}</div>
        <div class="sub">노드 · 링크 ${kg.links ?? 0} · 평균 연결 ${kg.avgDegree ?? 0}</div>
      </div>
      <div class="dashboard-card">
        <div class="label">RAG 인덱스</div>
        <div class="value">${rag.chunks ?? 0}</div>
        <div class="sub">청크 · 포스트 ${rag.indexedPosts ?? 0}개</div>
      </div>
    </div>
    <p class="dashboard-meta-line">통계 갱신: ${gen}</p>`;
}

function renderDashboard(root, data) {
  destroyCharts();
  renderSummary(root, data.summary);
  renderTags(root, data.topTags);
  renderRecent(root, data.recentPosts);
  renderExtras(root, data);

  const monthlyCanvas = root.querySelector("#dash-monthly-chart");
  const sectionCanvas = root.querySelector("#dash-section-chart");
  if (monthlyCanvas && data.monthly) renderMonthlyChart(monthlyCanvas, data.monthly);
  if (sectionCanvas && data.summary?.sections) renderSectionChart(sectionCanvas, data.summary.sections);
}

async function init() {
  const root = document.getElementById("dashboard-root");
  if (!root) return;

  const baseUrl = (root.dataset.baseurl || "").replace(/\/$/, "");
  try {
    const res = await fetch(`${baseUrl}/assets/data/dashboard-data.json`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    renderDashboard(root, data);

    const observer = new MutationObserver(() => renderDashboard(root, data));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-mode"] });
  } catch (e) {
    root.innerHTML = `<p class="dashboard-error">대시보드 데이터를 불러올 수 없습니다: ${e.message}</p>`;
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
