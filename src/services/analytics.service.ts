import api from './api'
import type {
  AnalyticsParams,
  AnalyticsOverviewResponse,
  MessagesChartResponse,
  TokensChartResponse,
  PopularQueriesResponse
} from '@/types/analytics.types'

export const analyticsService = {
  async getOverview(params: AnalyticsParams = {}): Promise<AnalyticsOverviewResponse> {
    const { data } = await api.get('/api/dashboard/stats', { params })
    
    // Map backend response to match AnalyticsOverview expected by Analytics.vue
    return {
      success: data.success,
      data: {
        total_messages: data.messages?.total || 0,
        messages_today: data.messages?.today || 0,
        avg_response_time_ms: data.performance?.avg_response_time_ms || 0,
        total_tokens: data.tokens?.total_used || 0
      }
    } as any
  },

  async getMessagesChart(params: AnalyticsParams = {}): Promise<MessagesChartResponse> {
    const { data } = await api.get('/api/dashboard/charts/messages', { params })
    return data
  },

  async getTokensChart(params: AnalyticsParams = {}): Promise<TokensChartResponse> {
    // Backend doesn't have this endpoint, return mock data structure
    return { success: true, data: [] }
  },

  async getPopularQueries(params: AnalyticsParams = {}): Promise<PopularQueriesResponse> {
    // Backend doesn't have this endpoint, return mock data structure
    return { success: true, data: [] }
  },

  async exportData(
    format: 'csv' | 'pdf',
    params: AnalyticsParams = {}
  ): Promise<Blob> {
    const { data } = await api.get('/api/analytics/export', {
      params: { ...params, format },
      responseType: 'blob'
    })
    return data
  }
}
