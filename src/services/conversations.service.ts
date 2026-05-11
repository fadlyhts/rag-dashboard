import api from './api'
import type {
  ConversationsListParams,
  ConversationsListResponse,
  ConversationDetailResponse
} from '@/types/conversation.types'

export const conversationsService = {
  async list(params: ConversationsListParams = {}): Promise<ConversationsListResponse> {
    const { data } = await api.get('/api/conversations', { params })
    return data
  },

  async getById(id: string): Promise<ConversationDetailResponse> {
    const { data } = await api.get(`/api/conversations/${id}`)
    return data
  },

  async delete(id: string): Promise<{ success: boolean; message: string }> {
    const { data } = await api.delete(`/api/conversations/${id}`)
    return data
  },

  async exportData(format: 'csv' | 'json', params: ConversationsListParams = {}): Promise<Blob> {
    const { data } = await api.get('/api/conversations/export', {
      params: { ...params, format },
      responseType: 'blob'
    })
    return data
  }
}
