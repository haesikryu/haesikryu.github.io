/**
 * 그래프 노드에 degree·viewCount(가상) 부여
 *
 * 1. public/graph-data.json 우선, 없으면 assets/data/graph-data.json 읽기
 * 2. links 기준 무방향 degree 계산
 * 3. viewCount = degree * 100 + [100,500] 난수
 * 4. EnhancedNode 형태로 동일 경로에 저장
 *
 * Usage: node scripts/update-graph-stats.js
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..");

/** @typedef {{ id: string, name: string, group?: string, val?: number }} GraphNodeBase */
/**
 * @typedef {GraphNodeBase & { degree: number, viewCount: number }} EnhancedNode
 */

const CANDIDATE_PATHS = [
  path.join(REPO_ROOT, "public", "graph-data.json"),
  path.join(REPO_ROOT, "assets", "data", "graph-data.json"),
];

function resolveGraphPath() {
  for (const p of CANDIDATE_PATHS) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

/** inclusive [min, max] */
function randomInt(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function main() {
  const graphPath = resolveGraphPath();
  if (!graphPath) {
    console.error(
      "[update-graph-stats] graph-data.json not found. Tried:\n  " +
        CANDIDATE_PATHS.join("\n  ")
    );
    process.exit(1);
  }

  let raw;
  try {
    raw = fs.readFileSync(graphPath, "utf8");
  } catch (e) {
    console.error("[update-graph-stats] Read failed:", graphPath, e.message);
    process.exit(1);
  }

  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    console.error("[update-graph-stats] Invalid JSON:", e.message);
    process.exit(1);
  }

  const nodes = Array.isArray(data.nodes) ? data.nodes : [];
  const links = Array.isArray(data.links) ? data.links : [];

  /** @type {Map<string, number>} */
  const degree = new Map();
  for (const n of nodes) {
    if (n && typeof n.id === "string") degree.set(n.id, 0);
  }

  for (const link of links) {
    const s = link?.source;
    const t = link?.target;
    if (typeof s !== "string" || typeof t !== "string") continue;
    if (degree.has(s)) degree.set(s, degree.get(s) + 1);
    if (degree.has(t)) degree.set(t, degree.get(t) + 1);
  }

  /** @type {EnhancedNode[]} */
  const enhancedNodes = nodes.map((n) => {
    const id = n.id;
    const d = typeof id === "string" && degree.has(id) ? degree.get(id) : 0;
    const viewCount = d * 100 + randomInt(100, 500);
    return {
      ...n,
      degree: d,
      viewCount,
    };
  });

  const out = {
    ...data,
    nodes: enhancedNodes,
  };

  const outDir = path.dirname(graphPath);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(graphPath, JSON.stringify(out, null, 2) + "\n", "utf8");
  console.log(
    `[update-graph-stats] Wrote ${enhancedNodes.length} EnhancedNode(s), ${links.length} link(s) → ${path.relative(REPO_ROOT, graphPath)}`
  );
}

main();
