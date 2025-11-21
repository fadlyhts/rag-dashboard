export interface WhatsAppUser {
  id: string
  phone: string
  name?: string
  messages_count: number
  last_active: string
  status: 'active' | 'blocked'
  created_at: string
  notes?: string
}

export interface UserDetail extends WhatsAppUser {
  conversations: UserConversation[]
  total_tokens_used: number
  avg_response_time_ms: number
}

export interface UserConversation {
  id: string
  last_message: string
  last_message_time: string
  message_count: number
}

export interface UsersListParams {
  page?: number
  limit?: number
  search?: string
  status?: 'active' | 'blocked' | 'all'
}

export interface UsersListResponse {
  success: boolean
  users: WhatsAppUser[]
  total: number
  page: number
  limit: number
}

export interface UserDetailResponse {
  success: boolean
  user: UserDetail
}

export interface BlockUserResponse {
  success: boolean
  message: string
}
