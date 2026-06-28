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
    // Ensure user IDs are strings for frontend consistency
    if (data.users) {
      data.users = data.users.map((u: any) => ({ ...u, id: String(u.id) }))
    }
    return data
  },

  async createUser(payload: { phone_number: string, whatsapp_name?: string, division_id?: number | null }): Promise<{ success: boolean, message: string, user_id: number }> {
    const { data } = await api.post('/api/users', payload)
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

  async updateDivision(id: string, division_id: number | null): Promise<{ success: boolean }> {
    const { data } = await api.put(`/api/users/${id}/division`, { division_id })
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
