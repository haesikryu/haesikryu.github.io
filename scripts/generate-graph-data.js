/**
 * Build-time Knowledge Graph 데이터 생성
 *
 * _posts/ 이하 모든 .md를 파싱하여:
 * - 노드: 각 포스트 (id=URL 경로, name=제목, group=주요 태그)
 * - 엣지: 마크다운 내부 링크([text](/posts/slug/), [[slug]]) + 공통 태그로 연결
 *
 * Usage: node scripts/generate-graph-data.js
 * Output: assets/data/graph-data.json
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..");
const POSTS_DIR = path.join(REPO_ROOT, "_posts");
const OUT_DIR = path.join(REPO_ROOT, "assets", "data");
const OUT_FILE = path.join(OUT_DIR, "graph-data.json");

/** 마크다운 링크 추출: [text](url) 또는 [[slug]] */
const LINK_REGEX = /\[([^\]]*)\]\(([^)]+)\)|\[\[([^\]]+)\]\]/g;

/**
 * 디렉터리에서 재귀적으로 .md 파일 목록
 */
function collectMarkdownFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      out.push(...collectMarkdownFiles(full));
    } else if (ent.isFile() && ent.name.endsWith(".md")) {
      out.push(full);
    }
  }
  return out;
}

/**
 * Jekyll permalink /posts/:title/ 용 슬러그
 */
function toSlug(relativePath, data) {
  if (typeof data.permalink === "string" && data.permalink.startsWith("/")) {
    const m = data.permalink.match(/\/posts\/([^/]+)/);
    return m ? m[1] : path.basename(relativePath, ".md").replace(/^\d{4}-\d{2}-\d{2}-/, "");
  }
  const base = path.basename(relativePath, ".md");
  return base.replace(/^\d{4}-\d{2}-\d{2}-/, "");
}

/**
 * 슬러그 → /posts/slug/ 경로
 */
function slugToPath(slug) {
  const s = String(slug).trim().replace(/^\/*|\/*$/g, "");
  if (!s) return null;
  if (s.startsWith("posts/") || s.startsWith("/posts/")) {
    const inner = s.replace(/^\/?posts\/?/, "");
    return `/posts/${inner}/`;
  }
  return `/posts/${s}/`;
}

/**
 * 마크다운 본문에서 링크 URL 추출 (상대 경로, /posts/... 형태)
 */
function extractLinks(content) {
  const links = new Set();
  let m;
  LINK_REGEX.lastIndex = 0;
  while ((m = LINK_REGEX.exec(content)) !== null) {
    if (m[2]) {
      // [text](url)
      const url = m[2].trim().split("#")[0];
      if (url.startsWith("/posts/") || url.startsWith("posts/")) {
        links.add(slugToPath(url));
      } else if (!url.startsWith("http") && !url.startsWith("mailto:")) {
        links.add(slugToPath(url));
      }
    } else if (m[3]) {
      // [[slug]]
      links.add(slugToPath(m[3]));
    }
  }
  return [...links].filter(Boolean);
}

function main() {
  console.log("[generate-graph-data] Starting…");

  const mdFiles = collectMarkdownFiles(POSTS_DIR);
  if (mdFiles.length === 0) {
    console.error("[generate-graph-data] No markdown files under _posts/. Abort.");
    process.exit(1);
  }

  /** slug -> { id, name, group, tags } */
  const nodeMap = new Map();
  /** Set<"source|target"> */
  const linkSet = new Set();

  for (const absPath of mdFiles) {
    const relPath = path.relative(POSTS_DIR, absPath).replace(/\\/g, "/");
    let raw;
    try {
      raw = fs.readFileSync(absPath, "utf8");
    } catch (e) {
      console.warn("[generate-graph-data] Skip:", relPath, e.message);
      continue;
    }

    let parsed;
    try {
      parsed = matter(raw);
    } catch (e) {
      console.warn("[generate-graph-data] Skip front matter:", relPath);
      continue;
    }

    const fm = parsed.data || {};
    const slug = toSlug(relPath, fm);
    const id = slugToPath(slug);
    const title = typeof fm.title === "string" ? fm.title : slug;
    const tags = Array.isArray(fm.tags) ? fm.tags.map(String) : [];
    const group = tags[0] || "default";

    nodeMap.set(id, { id, name: title, group, tags, val: 1 + Math.min(tags.length, 3) });

    const links = extractLinks(parsed.content || "");
    for (const target of links) {
      if (target && target !== id && nodeMap.has(target)) {
        const key = [id, target].sort().join("|");
        linkSet.add(key);
      }
    }
  }

  // 공통 태그 1개 이상으로 연결
  const slugList = [...nodeMap.keys()];
  for (let i = 0; i < slugList.length; i++) {
    for (let j = i + 1; j < slugList.length; j++) {
      const a = nodeMap.get(slugList[i]);
      const b = nodeMap.get(slugList[j]);
      if (!a?.tags?.length || !b?.tags?.length) continue;
      const aSet = new Set(a.tags);
      const common = b.tags.filter((t) => aSet.has(t));
      if (common.length >= 1) {
        const key = [slugList[i], slugList[j]].sort().join("|");
        linkSet.add(key);
      }
    }
  }

  const nodes = [...nodeMap.values()].map(({ tags, ...rest }) => rest);
  const links = [...linkSet].map((k) => {
    const [source, target] = k.split("|");
    return { source, target };
  });

  const graphData = { nodes, links };
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(graphData, null, 2), "utf8");

  console.log(`[generate-graph-data] Done. ${nodes.length} nodes, ${links.length} links → ${OUT_FILE}`);
}

main();
