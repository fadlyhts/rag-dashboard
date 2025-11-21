import api from './api'
import type {
  ConversationsListParams,
  ConversationsListResponse,
  ConversationDetailResponse
} from '@/types/conversation.types'

export const conversationsService = {
  async list(params: ConversationsListParams = {}): Promise<ConversationsListResponse> {
    // Backend uses /api/messages endpoint and returns individual messages
    const { data } = await api.get('/api/messages', { 
      params: {
        page: params.page || 1,
        limit: params.limit || 20,
        ...params
      }
    })
    
    // Backend returns: { total: 1919, data: [...messages] }
    // Need to group messages by conversation_id to create conversation objects
    const messages = data.data || []
    
    // Group messages by conversation_id
    const conversationsMap = new Map()
    messages.forEach((msg: any) => {
      const convId = msg.conversation_id
      if (!conversationsMap.has(convId)) {
        // Get the last message (most recent) for this conversation
        conversationsMap.set(convId, {
          id: String(convId),
          phone: msg.phone_number || `User ${msg.user_id}`,
          name: msg.user_name || undefined,
          last_message: msg.content,
          last_message_time: msg.created_at,
          status: 'ended',
          message_count: 1,
          created_at: msg.created_at,
          updated_at: msg.created_at
        })
      } else {
        // Increment message count
        const conv = conversationsMap.get(convId)
        conv.message_count++
      }
    })
    
    const conversations = Array.from(conversationsMap.values())
    
    return {
      success: true,
      conversations: conversations,
      total: data.total || 0,
      page: params.page || 1,
      limit: params.limit || 20
    }
  },

  async getById(id: string): Promise<ConversationDetailResponse> {
    const { data } = await api.get(`/api/messages/${id}`)
    return {
      success: true,
      conversation: data
    }
  },

  async delete(id: string): Promise<{ success: boolean; message: string }> {
    const { data } = await api.delete(`/api/messages/${id}`)
    return data
  },

  async exportData(format: 'csv' | 'json', params: ConversationsListParams = {}): Promise<Blob> {
    const { data } = await api.get('/api/messages/export', {
      params: { ...params, format },
      responseType: 'blob'
    })
    return data
  }
}
