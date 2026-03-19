/**
 * Build-time RAG 벡터 인덱스 생성
 *
 * _posts/ 이하 모든 .md 를 읽어 청킹 후 Xenova/all-MiniLM-L6-v2 임베딩을 계산하고
 * Jekyll 정적 자산 경로 assets/data/vector_store.json 에 기록합니다.
 *
 * Usage: npm run generate-embeddings
 * Prerequisites: npm install (루트에서)
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import { marked } from "marked";
import { pipeline } from "@xenova/transformers";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..");
const POSTS_DIR = path.join(REPO_ROOT, "_posts");
const OUT_DIR = path.join(REPO_ROOT, "assets", "data");
const OUT_FILE = path.join(OUT_DIR, "vector_store.json");

const MODEL_ID = "Xenova/all-MiniLM-L6-v2";
const SCHEMA_VERSION = 1;

/** 기본 청크 길이(문자). 임베딩 품질·토큰 한도 균형 */
const CHUNK_MAX_CHARS = 1000;
const CHUNK_OVERLAP = 150;

/**
 * 마크다운 본문을 임베딩용 평문으로 단순 변환 (HTML 태그 제거)
 * @param {string} md
 * @returns {string}
 */
function markdownToPlainText(md) {
  if (!md || typeof md !== "string") return "";
  try {
    const html = marked.parse(md, { async: false, gfm: true });
    return String(html)
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&[a-z]+;/gi, " ")
      .replace(/\s+/g, " ")
      .trim();
  } catch (e) {
    console.warn("[generate-vector-store] marked parse failed, using raw text:", e.message);
    return md.replace(/\s+/g, " ").trim();
  }
}

/**
 * 긴 텍스트를 겹침(overlap)을 두고 슬라이딩 윈도우로 분할
 * @param {string} text
 * @param {number} maxLen
 * @param {number} overlap
 * @returns {string[]}
 */
function chunkText(text, maxLen = CHUNK_MAX_CHARS, overlap = CHUNK_OVERLAP) {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return [];
  if (normalized.length <= maxLen) return [normalized];

  const chunks = [];
  let start = 0;
  while (start < normalized.length) {
    const end = Math.min(start + maxLen, normalized.length);
    chunks.push(normalized.slice(start, end).trim());
    if (end >= normalized.length) break;
    start = Math.max(end - overlap, start + 1);
  }
  return chunks.filter(Boolean);
}

/**
 * Jekyll permalink /posts/:title/ 용 슬러그 (날짜 접두 제거)
 * @param {string} relativePath _posts/ 기준 상대 경로
 * @param {Record<string, unknown>} data front matter
 */
function inferPostUrlPath(relativePath, data) {
  if (typeof data.permalink === "string" && data.permalink.startsWith("/")) {
    return data.permalink;
  }
  const base = path.basename(relativePath, ".md");
  const slug = base.replace(/^\d{4}-\d{2}-\d{2}-/, "");
  return `/posts/${slug}/`;
}

/**
 * 디렉터리에서 재귀적으로 .md 파일 목록
 * @param {string} dir
 * @param {string} [base]
 * @returns {string[]} 절대 경로
 */
function collectMarkdownFiles(dir, base = dir) {
  if (!fs.existsSync(dir)) {
    console.warn(`[generate-vector-store] Directory not found (skip): ${dir}`);
    return [];
  }
  /** @type {string[]} */
  const out = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      out.push(...collectMarkdownFiles(full, base));
    } else if (ent.isFile() && ent.name.endsWith(".md")) {
      out.push(full);
    }
  }
  return out;
}

/**
 * Float32Array / TypedArray → 일반 number[] (JSON 직렬화)
 * @param {import('@xenova/transformers').Tensor} tensor
 */
function tensorToEmbeddingArray(tensor) {
  const data = tensor.data;
  if (!data) return [];
  return Array.from(data);
}

async function main() {
  console.log("[generate-vector-store] Starting…");
  console.log("[generate-vector-store] Model:", MODEL_ID);

  const mdFiles = collectMarkdownFiles(POSTS_DIR);
  if (mdFiles.length === 0) {
    console.error("[generate-vector-store] No markdown files under _posts/. Abort.");
    process.exit(1);
  }
  console.log(`[generate-vector-store] Found ${mdFiles.length} post file(s).`);

  /** @type {import('@xenova/transformers').Pipeline} */
  let extractor;
  try {
    extractor = await pipeline("feature-extraction", MODEL_ID, {
      quantized: true,
    });
  } catch (e) {
    console.error("[generate-vector-store] Failed to load embedding pipeline:", e);
    process.exit(1);
  }

  /** @type {{ chunk: object, embedding: number[] }[]} */
  const entries = [];

  for (const absPath of mdFiles) {
    const relFromRepo = path.relative(REPO_ROOT, absPath).split(path.sep).join("/");
    let raw;
    try {
      raw = fs.readFileSync(absPath, "utf8");
    } catch (e) {
      console.warn(`[generate-vector-store] Skip read error: ${relFromRepo}`, e.message);
      continue;
    }

    let parsed;
    try {
      parsed = matter(raw);
    } catch (e) {
      console.warn(`[generate-vector-store] Skip invalid front matter: ${relFromRepo}`, e.message);
      continue;
    }

    const fm = parsed.data || {};
    const title =
      typeof fm.title === "string"
        ? fm.title
        : path.basename(absPath, ".md").replace(/^\d{4}-\d{2}-\d{2}-/, "");
    const plain = markdownToPlainText(parsed.content || "");
    if (!plain) {
      console.warn(`[generate-vector-store] Empty body after strip: ${relFromRepo}`);
      continue;
    }

    const textChunks = chunkText(plain);
    const urlPath = inferPostUrlPath(relFromRepo, fm);

    let chunkIndex = 0;
    for (const text of textChunks) {
      const id = `${relFromRepo}#${chunkIndex}`;
      /** Embedding */
      let embedding;
      try {
        const output = await extractor(text, {
          pooling: "mean",
          normalize: true,
        });
        embedding = tensorToEmbeddingArray(output);
      } catch (e) {
        console.warn(`[generate-vector-store] Embedding failed for ${id}:`, e.message);
        continue;
      }

      if (!embedding.length) {
        console.warn(`[generate-vector-store] Empty embedding: ${id}`);
        continue;
      }

      entries.push({
        chunk: {
          id,
          text,
          sourcePath: relFromRepo,
          title,
          url: urlPath,
          chunkIndex,
        },
        embedding,
      });
      chunkIndex += 1;
    }
    console.log(`[generate-vector-store] Indexed: ${relFromRepo} (${textChunks.length} chunk(s))`);
  }

  if (entries.length === 0) {
    console.error("[generate-vector-store] No entries produced. Abort.");
    process.exit(1);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const payload = {
    version: SCHEMA_VERSION,
    model: MODEL_ID,
    generatedAt: new Date().toISOString(),
    entries,
  };

  try {
    fs.writeFileSync(OUT_FILE, JSON.stringify(payload), "utf8");
  } catch (e) {
    console.error("[generate-vector-store] Failed to write output:", e);
    process.exit(1);
  }

  const sizeMb = (fs.statSync(OUT_FILE).size / (1024 * 1024)).toFixed(2);
  console.log(
    `[generate-vector-store] Done. ${entries.length} vectors → ${path.relative(REPO_ROOT, OUT_FILE)} (${sizeMb} MB)`
  );
}

main().catch((err) => {
  console.error("[generate-vector-store] Unhandled error:", err);
  process.exit(1);
});
