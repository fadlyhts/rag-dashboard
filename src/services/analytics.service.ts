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
    return data
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
