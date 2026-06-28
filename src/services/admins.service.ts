import api from './api'

export interface Admin {
  id: number
  username: string
  email: string | null
  role: string
  division_id: number | null
  is_active: boolean
  created_at: string
  last_login: string | null
}

export interface AdminCreate {
  username: string
  password: string
  email?: string
  role: string
  division_id?: number | null
}

export interface AdminUpdate {
  email?: string
  password?: string
  role?: string
  is_active?: boolean
  division_id?: number | null
}

class AdminsService {
  async getAdmins(): Promise<Admin[]> {
    const { data } = await api.get<Admin[]>('/api/admins')
    return data
  }

  async createAdmin(adminData: AdminCreate): Promise<Admin> {
    const { data } = await api.post<Admin>('/api/admins', adminData)
    return data
  }

  async updateAdmin(id: number, adminData: AdminUpdate): Promise<Admin> {
    const { data } = await api.put<Admin>(`/api/admins/${id}`, adminData)
    return data
  }

  async deleteAdmin(id: number): Promise<void> {
    await api.delete(`/api/admins/${id}`)
  }
}

export const adminsService = new AdminsService()
