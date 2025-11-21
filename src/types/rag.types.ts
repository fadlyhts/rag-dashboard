export interface LLMConfig {
  model: string
  temperature: number
  max_tokens: number
  top_p: number
}

export interface RetrievalConfig {
  top_k: number
  similarity_threshold: number
  chunk_size: number
  chunk_overlap: number
}

export interface PromptTemplate {
  type: 'system' | 'user'
  template: string
}

export interface RAGConfig {
  llm: LLMConfig
  retrieval: RetrievalConfig
}

export interface RAGConfigResponse {
  success: boolean
  config: RAGConfig
}

export interface PromptsResponse {
  success: boolean
  prompts: {
    system: string
    user: string
  }
}

export interface RAGTestParams {
  query: string
  use_rag?: boolean
}

export interface RAGTestResponse {
  success: boolean
  query: string
  response: string
  context_used: Array<{
    document_id: string
    document_title: string
    chunk_text: string
    score: number
  }>
  tokens_used: number
  time_ms: number
}

export interface UpdateConfigResponse {
  success: boolean
  message: string
}
