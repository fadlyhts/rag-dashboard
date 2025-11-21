import api from './api'
import type {
  UsersListParams,
  UsersListResponse,
  UserDetailResponse,
  BlockUserResponse
} from '@/types/user.types'

export const usersService = {
  async list(params: UsersListParams = {}): Promise<UsersListResponse> {
    // Backend doesn't have this endpoint yet, return empty data
    return {
      success: true,
      users: [],
      total: 0,
      page: params.page || 1,
      limit: params.limit || 20
    }
  },

  async getById(id: string): Promise<UserDetailResponse> {
    // Backend doesn't have this endpoint yet
    const { data } = await api.get(`/api/users/${id}`)
    return data
  },

  async block(id: string): Promise<BlockUserResponse> {
    const { data } = await api.put(`/api/users/${id}/block`)
    return data
  },

  async unblock(id: string): Promise<BlockUserResponse> {
    const { data } = await api.put(`/api/users/${id}/unblock`)
    return data
  },

  async updateNotes(id: string, notes: string): Promise<{ success: boolean }> {
    const { data } = await api.put(`/api/users/${id}/notes`, { notes })
    return data
  },

  async exportData(format: 'csv' | 'json', params: UsersListParams = {}): Promise<Blob> {
    const { data } = await api.get('/api/users/export', {
      params: { ...params, format },
      responseType: 'blob'
    })
    return data
  }
}
