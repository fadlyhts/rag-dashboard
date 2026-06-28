import api from './api'

export interface Division {
  id: number
  name: string
}

export interface DivisionCreate {
  name: string
}

export interface DivisionUpdate {
  name: string
}

class DivisionsService {
  async getDivisions(): Promise<Division[]> {
    const { data } = await api.get<Division[]>('/api/documents/divisions')
    return data
  }

  async createDivision(divisionData: DivisionCreate): Promise<Division> {
    const { data } = await api.post<Division>('/api/documents/divisions', divisionData)
    return data
  }

  async updateDivision(id: number, divisionData: DivisionUpdate): Promise<Division> {
    const { data } = await api.put<Division>(`/api/documents/divisions/${id}`, divisionData)
    return data
  }

  async deleteDivision(id: number): Promise<void> {
    await api.delete(`/api/documents/divisions/${id}`)
  }
}

export const divisionsService = new DivisionsService()
