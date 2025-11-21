export interface Document {
  id: string
  title: string
  content_type: string
  chunks: number
  created_at: string
  status: 'pending' | 'completed' | 'failed'
}

export interface UploadResult {
  success: boolean
  document_id: string
  title: string
  chunks_created: number
  total_tokens: number
  message: string
}

export interface SystemStatus {
  success: boolean
  qdrant: {
    status: string
    collection: string
    vectors: number
    points: number
    url: string
  }
  timestamp: string
}

export interface TestQueryResult {
  success: boolean
  query: string
  response: string
  sources: Array<{
    id: string
    title: string
    score: number
  }>
  tokens: number
  time_ms: number
  docs_retrieved: number
  retrieval_time_ms?: number
  generation_time_ms?: number
}

export interface Analytics {
  success: boolean
  total_messages: number
  avg_response_time_ms: number
  total_tokens: number
  recent_messages_7d: number
  today_messages: number
}

export interface DocumentsListResponse {
  success: boolean
  documents: Document[]
  total_vectors: number
  collection: string
  status: string
}
