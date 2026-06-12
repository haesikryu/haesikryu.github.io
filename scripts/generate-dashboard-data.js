/**
 * 블로그 대시보드용 통계 JSON 생성
 *
 * _posts/ 포스트, graph-data.json, vector_store.json 을 집계합니다.
 *
 * Usage: node scripts/generate-dashboard-data.js
 * Output: assets/data/dashboard-data.json
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..");
const POSTS_DIR = path.join(REPO_ROOT, "_posts");
const OUT_FILE = path.join(REPO_ROOT, "assets", "data", "dashboard-data.json");
const GRAPH_FILE = path.join(REPO_ROOT, "assets", "data", "graph-data.json");
const VECTOR_FILE = path.join(REPO_ROOT, "assets", "data", "vector_store.json");

const SECTION_LABELS = {
  blog: "Blog",
  news: "News",
  "book-review": "Book Review",
  portfolio: "Portfolio",
  other: "기타",
};

function collectMarkdownFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...collectMarkdownFiles(full));
    else if (ent.isFile() && ent.name.endsWith(".md")) out.push(full);
  }
  return out;
}

function toSlug(relativePath, data) {
  if (typeof data.permalink === "string" && data.permalink.startsWith("/")) {
    const m = data.permalink.match(/\/posts\/([^/]+)/);
    return m ? m[1] : path.basename(relativePath, ".md").replace(/^\d{4}-\d{2}-\d{2}-/, "");
  }
  return path.basename(relativePath, ".md").replace(/^\d{4}-\d{2}-\d{2}-/, "");
}

function slugToPath(slug) {
  const s = String(slug).trim().replace(/^\/*|\/*$/g, "");
  if (!s) return null;
  return `/posts/${s}/`;
}

function sectionFromPath(relativePath) {
  const top = relativePath.split("/")[0];
  return SECTION_LABELS[top] ? top : "other";
}

function monthKey(date) {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function lastNMonths(n) {
  const keys = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(monthKey(d));
  }
  return keys;
}

function readJsonSafe(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function main() {
  console.log("[generate-dashboard-data] Starting…");

  const mdFiles = collectMarkdownFiles(POSTS_DIR);
  const sections = Object.fromEntries(Object.keys(SECTION_LABELS).map((k) => [k, 0]));
  const monthly = {};
  const tagCounts = new Map();
  /** @type {{ title: string, url: string, date: string, section: string }[]} */
  const posts = [];

  for (const absPath of mdFiles) {
    const relPath = path.relative(POSTS_DIR, absPath).replace(/\\/g, "/");
    let raw;
    try {
      raw = fs.readFileSync(absPath, "utf8");
    } catch {
      continue;
    }

    let parsed;
    try {
      parsed = matter(raw);
    } catch {
      continue;
    }

    const fm = parsed.data || {};
    const section = sectionFromPath(relPath);
    sections[section] = (sections[section] || 0) + 1;

    const dateRaw = fm.date;
    const dateObj = dateRaw ? new Date(dateRaw) : null;
    const mk = dateObj ? monthKey(dateObj) : null;
    if (mk) monthly[mk] = (monthly[mk] || 0) + 1;

    const tags = Array.isArray(fm.tags) ? fm.tags.map(String) : [];
    for (const t of tags) {
      const key = t.trim();
      if (key) tagCounts.set(key, (tagCounts.get(key) || 0) + 1);
    }

    const slug = toSlug(relPath, fm);
    const url = slugToPath(slug);
    const title = typeof fm.title === "string" ? fm.title.trim() : slug;
    if (url && title) {
      posts.push({
        title,
        url,
        date: dateObj && !Number.isNaN(dateObj.getTime()) ? dateObj.toISOString() : "",
        section,
        sectionLabel: SECTION_LABELS[section] || section,
      });
    }
  }

  posts.sort((a, b) => (b.date || "").localeCompare(a.date || ""));

  const monthKeys = lastNMonths(12);
  const monthlySeries = monthKeys.map((key) => ({
    month: key,
    count: monthly[key] || 0,
  }));

  const topTags = [...tagCounts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 12)
    .map(([tag, count]) => ({ tag, count }));

  const graph = readJsonSafe(GRAPH_FILE);
  const vector = readJsonSafe(VECTOR_FILE);

  const graphNodes = Array.isArray(graph?.nodes) ? graph.nodes.length : 0;
  const graphLinks = Array.isArray(graph?.links) ? graph.links.length : 0;
  const vectorEntries = Array.isArray(vector?.entries) ? vector.entries.length : 0;
  const uniqueSources = vector?.entries
    ? new Set(vector.entries.map((e) => e?.chunk?.sourcePath).filter(Boolean)).size
    : 0;

  const sectionBreakdown = Object.entries(sections)
    .filter(([, count]) => count > 0)
    .map(([key, count]) => ({
      key,
      label: SECTION_LABELS[key] || key,
      count,
    }))
    .sort((a, b) => b.count - a.count);

  const payload = {
    generatedAt: new Date().toISOString(),
    summary: {
      totalPosts: posts.length,
      sections: sectionBreakdown,
      firstPostDate: posts.length ? posts[posts.length - 1].date : null,
      latestPostDate: posts.length ? posts[0].date : null,
    },
    monthly: monthlySeries,
    topTags,
    recentPosts: posts.slice(0, 8),
    knowledgeGraph: {
      nodes: graphNodes,
      links: graphLinks,
      avgDegree: graphNodes && graphLinks ? Number(((graphLinks * 2) / graphNodes).toFixed(1)) : 0,
    },
    rag: {
      chunks: vectorEntries,
      indexedPosts: uniqueSources,
      model: vector?.model || null,
      generatedAt: vector?.generatedAt || null,
    },
  };

  const outDir = path.dirname(OUT_FILE);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(payload, null, 2) + "\n", "utf8");

  console.log(
    `[generate-dashboard-data] Done. ${payload.summary.totalPosts} posts → ${path.relative(REPO_ROOT, OUT_FILE)}`
  );
}

main();
