export interface VectorCollection {
  name: string
  vectors_count: number
  indexed_vectors_count: number
  points_count: number
  segments_count: number
  status: string
  optimizer_status: string
  disk_data_size: number
}

export interface VectorCollectionStats {
  success: boolean
  collection: VectorCollection
  payload_schema: Record<string, any>
}

export interface VectorSearchParams {
  query: string
  top_k: number
  collection?: string
}

export interface VectorSearchResult {
  id: string
  score: number
  payload: {
    text: string
    title?: string
    document_id?: string
    chunk_index?: number
  }
}

export interface VectorSearchResponse {
  success: boolean
  query: string
  results: VectorSearchResult[]
  time_ms: number
}

export interface VectorCollectionsResponse {
  success: boolean
  collections: VectorCollection[]
}

export interface VectorActionResponse {
  success: boolean
  message: string
  time_ms?: number
}
