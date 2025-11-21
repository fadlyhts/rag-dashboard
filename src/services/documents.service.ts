import api from './api'
import type { Document, DocumentChunk } from '@/types/document.types'

export interface DocumentsListResponse {
  documents: Document[]
  total: number
}

export interface UploadResponse {
  document_id: number
  message: string
}

export const documentsService = {
  getAll: async (params?: { 
    search?: string
    status?: string
    page?: number
    limit?: number
  }): Promise<{ data: DocumentsListResponse }> => {
    const response = await api.get('/api/documents', { params })
    // Transform backend response: { items: [...] } -> { documents: [...] }
    const items = response.data.items || response.data.documents || []
    const transformedDocuments = items.map((doc: any) => ({
      ...doc,
      status: doc.embedding_status || doc.status
    }))
    
    return {
      data: {
        documents: transformedDocuments,
        total: response.data.total || transformedDocuments.length
      }
    }
  },
  
  upload: (
    file: File,
    onUploadProgress?: (progressEvent: any) => void
  ): Promise<{ data: UploadResponse }> => {
    const formData = new FormData()
    formData.append('file', file)
    
    return api.post('/api/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress
    })
  },
  
  getById: (id: number): Promise<{ data: Document }> => {
    return api.get(`/api/documents/${id}`)
  },
  
  getChunks: (id: number): Promise<{ data: DocumentChunk[] }> => {
    return api.get(`/api/documents/${id}/chunks`)
  },
  
  reindex: (id: number): Promise<{ data: { message: string } }> => {
    return api.post(`/api/documents/${id}/reindex`)
  },
  
  delete: (id: number): Promise<void> => {
    return api.delete(`/api/documents/${id}`)
  }
}
