/**
 * 브라우저 RAG 클라이언트: 벡터 스토어 로드, 쿼리 임베딩, 코사인 유사도 Top-K
 */

import { pipeline, env } from "@xenova/transformers";
import type { RetrievedChunk, VectorStoreFile } from "../types/rag";

/** Jekyll/Chirpy 기본 정적 경로 (site.baseurl 은 호출 측에서 접두로 전달) */
export const VECTOR_STORE_PATH = "/assets/data/vector_store.json";

const MODEL_ID = "Xenova/all-MiniLM-L6-v2";

// Hugging Face CDN에서 모델 로드 (GitHub Pages 정적 호스팅과 호환)
env.allowLocalModels = false;
env.useBrowserCache = true;

/** @typescript-eslint/no-explicit-any -- xenova pipeline 제네릭이 복잡함 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let extractorPromise: Promise<any> | null = null;

/**
 * 임베딩 파이프라인 싱글톤 (중복 로드 방지)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getEmbeddingPipeline(): Promise<any> {
  if (!extractorPromise) {
    extractorPromise = pipeline("feature-extraction", MODEL_ID, {
      quantized: true,
    });
  }
  return extractorPromise;
}

/**
 * 벡터 스토어 JSON fetch 및 파싱
 */
export async function loadVectorStore(
  baseUrl = ""
): Promise<VectorStoreFile> {
  const url = `${baseUrl.replace(/\/$/, "")}${VECTOR_STORE_PATH}`;
  const res = await fetch(url, { credentials: "same-origin" });
  if (!res.ok) {
    throw new Error(
      `vector_store 로드 실패: ${res.status} ${res.statusText} (${url})`
    );
  }
  const data = (await res.json()) as VectorStoreFile;
  if (!data.entries?.length) {
    throw new Error("vector_store.entries 가 비어 있습니다.");
  }
  return data;
}

/**
 * 텍스트 → L2 정규화된 임베딩 벡터
 */
export async function embedQuery(text: string): Promise<number[]> {
  const extractor = await getEmbeddingPipeline();
  const output = await extractor(text.trim(), {
    pooling: "mean",
    normalize: true,
  });
  const data = output.data;
  if (!data?.length) {
    throw new Error("쿼리 임베딩 결과가 비어 있습니다.");
  }
  return Array.from(data);
}

/**
 * L2 정규화된 두 벡터의 코사인 유사도 (= 내적)
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
  }
  return dot;
}

/**
 * 쿼리 임베딩과 가장 유사한 상위 K개 청크
 */
export function retrieveTopK(
  queryEmbedding: number[],
  store: VectorStoreFile,
  k = 3
): RetrievedChunk[] {
  const scored: RetrievedChunk[] = store.entries.map((entry) => ({
    chunk: entry.chunk,
    score: cosineSimilarity(queryEmbedding, entry.embedding),
  }));
  scored.sort((x, y) => y.score - x.score);
  return scored.slice(0, k);
}

/** Gemini 무료 티어 입력 토큰 절약용 청크당 최대 글자 수 */
const DEFAULT_MAX_CHARS_PER_CHUNK = 900;

function truncateForContext(text: string, maxChars: number): string {
  const t = text.trim();
  if (t.length <= maxChars) return t;
  return `${t.slice(0, maxChars)}\n…(이하 생략)`;
}

/**
 * LLM에 넣을 컨텍스트 문자열 조합 (청크가 길면 잘라 무료 API 토큰 한도 완화)
 */
export function buildContextBlock(
  chunks: RetrievedChunk[],
  maxCharsPerChunk = DEFAULT_MAX_CHARS_PER_CHUNK
): string {
  return chunks
    .map(
      (r, i) =>
        `### 문서 ${i + 1} (${r.chunk.title ?? "제목 없음"})\n출처: ${r.chunk.url ?? r.chunk.sourcePath}\n${truncateForContext(r.chunk.text, maxCharsPerChunk)}`
    )
    .join("\n\n---\n\n");
}
