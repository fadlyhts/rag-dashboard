import api from './api'
import type {
  VectorCollectionsResponse,
  VectorCollectionStats,
  VectorSearchParams,
  VectorSearchResponse,
  VectorActionResponse
} from '@/types/vector.types'

export const vectorService = {
  async getCollections(): Promise<VectorCollectionsResponse> {
    const { data } = await api.get('/api/vector/collections')
    return data
  },

  async getCollectionStats(name: string): Promise<VectorCollectionStats> {
    const { data } = await api.get(`/api/vector/collections/${name}/stats`)
    return data
  },

  async search(params: VectorSearchParams): Promise<VectorSearchResponse> {
    const { data } = await api.post('/api/vector/search', params)
    return data
  },

  async optimize(collection?: string): Promise<VectorActionResponse> {
    const { data } = await api.post('/api/vector/optimize', { collection })
    return data
  },

  async rebuild(collection?: string): Promise<VectorActionResponse> {
    const { data } = await api.post('/api/vector/rebuild', { collection })
    return data
  },

  async backup(collection?: string): Promise<VectorActionResponse> {
    const { data } = await api.post('/api/vector/backup', { collection })
    return data
  }
}
