export interface Document {
  id: number
  title: string
  file_type: string
  file_size: number
  upload_date: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  chunks_count?: number
  category?: string
}

export interface DocumentChunk {
  id: number
  chunk_index: number
  chunk_text: string
  chunk_size: number
  metadata?: any
}

export interface DocumentUploadProgress {
  filename: string
  progress: number
  status: 'uploading' | 'success' | 'error'
  error?: string
}
