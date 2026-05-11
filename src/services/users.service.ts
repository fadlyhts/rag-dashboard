import api from './api'
import type {
  UsersListParams,
  UsersListResponse,
  UserDetailResponse,
  BlockUserResponse
} from '@/types/user.types'

export const usersService = {
  async list(params: UsersListParams = {}): Promise<UsersListResponse> {
    const { data } = await api.get('/api/users', { params })
    return data
  },

  async getById(id: string): Promise<UserDetailResponse> {
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
