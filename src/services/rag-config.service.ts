import api from './api'
import type {
  RAGConfigResponse,
  PromptsResponse,
  LLMConfig,
  RetrievalConfig,
  RAGTestParams,
  RAGTestResponse,
  UpdateConfigResponse
} from '@/types/rag.types'

export const ragConfigService = {
  async getConfig(): Promise<RAGConfigResponse> {
    const { data } = await api.get('/api/settings/rag/config')
    // Transform backend response to expected format
    const backendConfig = data.config || {}
    return {
      success: data.success || true,
      config: {
        llm: {
          model: backendConfig.model || 'gpt-4',
          temperature: backendConfig.temperature || 0.7,
          max_tokens: backendConfig.max_tokens || 500,
          top_p: backendConfig.top_p || 1.0
        },
        retrieval: {
          top_k: backendConfig.top_k || 5,
          similarity_threshold: backendConfig.min_score || 0.7,
          chunk_size: backendConfig.chunk_size || 1000,
          chunk_overlap: backendConfig.chunk_overlap || 200
        }
      }
    }
  },

  async updateLLMConfig(config: LLMConfig): Promise<UpdateConfigResponse> {
    const { data } = await api.put('/api/settings/rag_llm_config', { value: config })
    return data
  },

  async updateRetrievalConfig(config: RetrievalConfig): Promise<UpdateConfigResponse> {
    const { data } = await api.put('/api/settings/rag_retrieval_config', { value: config })
    return data
  },

  async getPrompts(): Promise<PromptsResponse> {
    try {
      const settings = await api.get('/api/settings')
      const data = settings.data.settings || settings.data || {}
      return {
        success: true,
        prompts: {
          system: data.system_prompt || 'You are a helpful assistant.',
          user: data.user_prompt_template || 'Context: {context}\n\nQuestion: {query}'
        }
      }
    } catch (error) {
      return {
        success: false,
        prompts: {
          system: 'You are a helpful assistant.',
          user: 'Context: {context}\n\nQuestion: {query}'
        }
      }
    }
  },

  async updatePrompt(type: 'system' | 'user', template: string): Promise<UpdateConfigResponse> {
    const key = type === 'system' ? 'system_prompt' : 'user_prompt'
    const { data } = await api.put(`/api/settings/${key}`, { value: template })
    return data
  },

  async testRAG(params: RAGTestParams): Promise<RAGTestResponse> {
    const { data } = await api.post('/api/vector/test-search', { query: params.query })
    return data
  }
}
