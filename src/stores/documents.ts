import { defineStore } from 'pinia'
import { ref } from 'vue'
import { documentsService } from '@/services/documents.service'
import type { Document, DocumentChunk, DocumentUploadProgress } from '@/types/document.types'

export const useDocumentStore = defineStore('documents', () => {
  const documents = ref<Document[]>([])
  const currentDocument = ref<Document | null>(null)
  const chunks = ref<DocumentChunk[]>([])
  const loading = ref(false)
  const uploading = ref(false)
  const uploadProgress = ref<DocumentUploadProgress[]>([])
  const error = ref<string | null>(null)
  const total = ref(0)
  
  async function fetchDocuments(params?: { 
    search?: string
    status?: string
    page?: number
    limit?: number
  }) {
    loading.value = true
    error.value = null
    try {
      const { data } = await documentsService.getAll(params)
      // Ensure documents is always an array
      documents.value = Array.isArray(data.documents) 
        ? data.documents 
        : (data.documents ? [data.documents] : [])
      total.value = data.total || documents.value.length
    } catch (e: any) {
      error.value = e.message || 'Failed to fetch documents'
      console.error('Error fetching documents:', e)
      // Ensure documents is always an array even on error
      documents.value = []
      total.value = 0
    } finally {
      loading.value = false
    }
  }
  
  async function uploadDocument(file: File) {
    uploading.value = true
    error.value = null
    
    const progressItem: DocumentUploadProgress = {
      filename: file.name,
      progress: 0,
      status: 'uploading'
    }
    uploadProgress.value.push(progressItem)
    
    try {
      const { data } = await documentsService.upload(file, (progressEvent: any) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        progressItem.progress = percentCompleted
      })
      
      progressItem.status = 'success'
      progressItem.progress = 100
      await fetchDocuments()
      return data
    } catch (e: any) {
      progressItem.status = 'error'
      const errorMsg = e.response?.data?.detail || 'Upload failed'
      progressItem.error = errorMsg
      error.value = errorMsg
      throw e
    } finally {
      uploading.value = false
    }
  }
  
  async function uploadMultiple(files: File[]) {
    uploading.value = true
    uploadProgress.value = []
    
    const uploads = files.map(file => uploadDocument(file))
    
    try {
      await Promise.all(uploads)
    } finally {
      uploading.value = false
    }
  }
  
  async function getDocumentById(id: number) {
    loading.value = true
    error.value = null
    try {
      const { data } = await documentsService.getById(id)
      currentDocument.value = data
      return data
    } catch (e: any) {
      error.value = e.message || 'Failed to fetch document'
      console.error('Error fetching document:', e)
      throw e
    } finally {
      loading.value = false
    }
  }
  
  async function getChunks(id: number) {
    loading.value = true
    error.value = null
    try {
      const { data } = await documentsService.getChunks(id)
      chunks.value = data
      return data
    } catch (e: any) {
      error.value = e.message || 'Failed to fetch chunks'
      console.error('Error fetching chunks:', e)
      throw e
    } finally {
      loading.value = false
    }
  }
  
  async function reindexDocument(id: number) {
    loading.value = true
    error.value = null
    try {
      const { data } = await documentsService.reindex(id)
      await fetchDocuments()
      return data
    } catch (e: any) {
      error.value = e.message || 'Failed to reindex document'
      console.error('Error reindexing document:', e)
      throw e
    } finally {
      loading.value = false
    }
  }
  
  async function deleteDocument(id: number) {
    loading.value = true
    error.value = null
    try {
      await documentsService.delete(id)
      await fetchDocuments()
    } catch (e: any) {
      error.value = e.message || 'Failed to delete document'
      console.error('Error deleting document:', e)
      throw e
    } finally {
      loading.value = false
    }
  }
  
  function clearUploadProgress() {
    uploadProgress.value = []
  }
  
  return {
    documents,
    currentDocument,
    chunks,
    loading,
    uploading,
    uploadProgress,
    error,
    total,
    fetchDocuments,
    uploadDocument,
    uploadMultiple,
    getDocumentById,
    getChunks,
    reindexDocument,
    deleteDocument,
    clearUploadProgress
  }
})
