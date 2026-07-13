import api from './api'

export interface DatasetInfo {
  name: string
  num_questions: number
  has_ground_truth: boolean
}

export interface EvaluationItem {
  id: number
  question_ref?: string | null
  question: string
  ground_truth?: string | null
  answer?: string | null
  contexts?: string[] | null
  sources?: any[] | null
  category?: string | null
  bertscore_f1?: number | null
  bleu?: number | null
  rougeL?: number | null
  ragas_faithfulness?: number | null
  ragas_answer_relevancy?: number | null
  ragas_context_precision?: number | null
  total_time_ms?: number | null
  error?: string | null
}

export interface EvaluationRun {
  id: number
  run_name?: string | null
  dataset_name?: string | null
  status: string
  num_samples: number
  processed_samples: number
  division_id?: number | null
  category_id?: number | null
  bertscore_f1?: number | null
  bertscore_precision?: number | null
  bertscore_recall?: number | null
  bleu?: number | null
  rougeL?: number | null
  ragas_faithfulness?: number | null
  ragas_answer_relevancy?: number | null
  ragas_context_precision?: number | null
  avg_total_ms?: number | null
  config?: Record<string, any> | null
  error?: string | null
  created_at: string
  completed_at?: string | null
  items?: EvaluationItem[]
}

export interface CreateRunPayload {
  dataset_name: string
  run_name?: string
  metrics: string[]
  ragas_use_ground_truth: boolean
  limit?: number | null
  division_id?: number | null
  category_id?: number | null
  lexical_normalization?: string
}

export interface RefItem {
  id: number
  name: string
}

export const evaluationService = {
  async getDatasets(): Promise<DatasetInfo[]> {
    const { data } = await api.get('/api/evaluation/datasets')
    return data
  },

  async getDivisions(): Promise<RefItem[]> {
    const { data } = await api.get('/api/documents/divisions')
    return data
  },

  async getCategories(): Promise<RefItem[]> {
    const { data } = await api.get('/api/documents/categories')
    return (data || []).map((c: any) => ({ id: c.id, name: c.name }))
  },

  async uploadDataset(file: File): Promise<DatasetInfo> {
    const formData = new FormData()
    formData.append('file', file)
    const { data } = await api.post('/api/evaluation/datasets/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  async getRuns(): Promise<EvaluationRun[]> {
    const { data } = await api.get('/api/evaluation/runs')
    return data
  },

  async getRun(id: number): Promise<EvaluationRun> {
    const { data } = await api.get(`/api/evaluation/runs/${id}`)
    return data
  },

  async createRun(payload: CreateRunPayload): Promise<EvaluationRun> {
    const { data } = await api.post('/api/evaluation/runs', payload)
    return data
  },

  async deleteRun(id: number): Promise<void> {
    await api.delete(`/api/evaluation/runs/${id}`)
  },

  async exportRun(id: number, format: 'json' | 'csv'): Promise<void> {
    const response = await api.get(`/api/evaluation/runs/${id}/export`, {
      params: { format },
      responseType: 'blob',
    })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `evaluation_run_${id}.${format}`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  },
}
