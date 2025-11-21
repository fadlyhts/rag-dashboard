export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  rag_context?: RAGContext[]
}

export interface RAGContext {
  document_id: string
  document_title: string
  chunk_text: string
  score: number
}

export interface Conversation {
  id: string
  phone: string
  name?: string
  last_message: string
  last_message_time: string
  status: 'active' | 'ended'
  message_count: number
  created_at: string
  updated_at: string
}

export interface ConversationDetail extends Conversation {
  messages: Message[]
}

export interface ConversationsListParams {
  page?: number
  limit?: number
  search?: string
  status?: 'active' | 'ended' | 'all'
  start_date?: string
  end_date?: string
}

export interface ConversationsListResponse {
  success: boolean
  conversations: Conversation[]
  total: number
  page: number
  limit: number
}

export interface ConversationDetailResponse {
  success: boolean
  conversation: ConversationDetail
}
