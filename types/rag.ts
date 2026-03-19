/**
 * RAG (Retrieval-Augmented Generation) 타입 정의
 * 빌드 타임 벡터 인덱스와 런타임 클라이언트에서 공통으로 사용합니다.
 */

/** Jekyll/마크다운 포스트에서 파싱한 front matter (gray-matter 결과) */
export interface PostFrontmatter {
  title?: string;
  date?: string | Date;
  categories?: string | string[];
  tags?: string | string[];
  layout?: string;
  permalink?: string;
  /** 기타 커스텀 필드 */
  [key: string]: unknown;
}

/**
 * 의미 단위로 나눈 텍스트 청크
 * 검색 결과로 LLM에 전달되는 최소 단위
 */
export interface RagChunk {
  /** 전역 고유 ID (예: `${relativePath}#${chunkIndex}`) */
  id: string;
  /** 임베딩·검색에 사용되는 순수 텍스트 */
  text: string;
  /** 저장소 기준 상대 경로 (예: `_posts/blog/foo.md`) */
  sourcePath: string;
  /** 포스트 제목 (표시용) */
  title?: string;
  /** 사이트 내 링크 힌트 (Jekyll permalink 등) */
  url?: string;
  /** 동일 문서 내 청크 순번 */
  chunkIndex: number;
}

/**
 * 벡터 스토어에 저장되는 한 행
 * 빌드 산출물 `vector_store.json`의 원소
 */
export interface VectorStoreEntry {
  chunk: RagChunk;
  /** all-MiniLM-L6-v2 등으로 생성된 정규화 전/후 벡터 (코사인 유사도용) */
  embedding: number[];
}

/**
 * Jekyll 빌드 후 정적 URL: `/assets/data/vector_store.json`
 * (빌드 스크립트: `npm run generate-embeddings` → `assets/data/vector_store.json`)
 */
export interface VectorStoreFile {
  /** 스키마 버전 (마이그레이션용) */
  version: number;
  /** 사용한 임베딩 모델 식별자 (예: Xenova/all-MiniLM-L6-v2) */
  model: string;
  /** ISO 8601 생성 시각 */
  generatedAt: string;
  entries: VectorStoreEntry[];
}

/** 유사도 검색 결과 (런타임) */
export interface RetrievedChunk {
  chunk: RagChunk;
  /** 코사인 유사도 [-1, 1], 높을수록 유사 */
  score: number;
}

/** 채팅 메시지 (UI 상태) */
export type ChatRole = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: number;
}

/** 로컬 스토리지에 저장하는 사용자 설정 (API 키는 클라이언트만, 서버 미전송 원칙 준수) */
export interface RagUserSettings {
  /** Google AI Studio / Gemini API 키 (브라우저 localStorage 전용) */
  geminiApiKey?: string;
  /** @deprecated 예전 OpenAI 설정; 무시하고 geminiApiKey를 사용하세요 */
  openaiApiKey?: string;
  /** 선택: 사용 모델 오버라이드 (예: gemini-2.0-flash) */
  chatModel?: string;
}

export const RAG_STORAGE_KEY = "blog-rag-settings";

/** 무료 티어에서 자주 쓰는 빠른 모델 */
export const DEFAULT_CHAT_MODEL = "gemini-2.0-flash";
