import axios from 'axios'
import type { 
  UploadResult, 
  SystemStatus, 
  TestQueryResult, 
  Analytics,
  DocumentsListResponse 
} from '@/types'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 30000 // 30 seconds
})

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
    } else if (error.response?.status >= 500) {
      // Redirect to 500 error page for server errors
      if (!window.location.pathname.includes('/500')) {
        window.location.href = '/500'
      }
    }
    return Promise.reject(error)
  }
)

// Document API
export const documentApi = {
  async upload(
    file: File, 
    title?: string, 
    contentType: string = 'document'
  ): Promise<UploadResult> {
    const formData = new FormData()
    formData.append('file', file)
    if (title) formData.append('title', title)
    formData.append('content_type', contentType)
    
    const { data } = await api.post('/api/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return data
  },
  
  async list(): Promise<DocumentsListResponse> {
    const { data } = await api.get('/api/documents')
    // Transform backend response to expected format
    // Backend returns: { items: [...], total: 10 }
    // Frontend expects: { documents: [...], total: 10 }
    const items = data.items || data.documents || (Array.isArray(data) ? data : [])
    
    // Transform each document to match frontend expectations
    const transformedDocuments = items.map((doc: any) => ({
      ...doc,
      status: doc.embedding_status || doc.status // Map embedding_status to status
    }))
    
    return {
      documents: transformedDocuments,
      total: data.total || transformedDocuments.length
    }
  },
  
  async delete(id: string): Promise<void> {
    await api.delete(`/api/documents/${id}`)
  }
}

// System API
export const systemApi = {
  async getStatus(): Promise<SystemStatus> {
    const { data } = await api.get('/api/dashboard/system-health')
    return data
  },
  
  async testQuery(query: string): Promise<TestQueryResult> {
    const { data } = await api.post('/api/vector/test-search', { query })
    return data
  },
  
  async getAnalytics(): Promise<Analytics> {
    const { data } = await api.get('/api/dashboard/stats')
    return data
  }
}

export default api
