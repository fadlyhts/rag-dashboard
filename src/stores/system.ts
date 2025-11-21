import { defineStore } from 'pinia'
import { ref } from 'vue'
import { systemApi } from '@/services/api'
import type { SystemStatus, Analytics } from '@/types'

export const useSystemStore = defineStore('system', () => {
  const status = ref<SystemStatus | null>(null)
  const analytics = ref<Analytics | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  async function fetchStatus() {
    loading.value = true
    error.value = null
    try {
      status.value = await systemApi.getStatus()
    } catch (e: any) {
      error.value = e.message || 'Failed to fetch system status'
      console.error('Error fetching status:', e)
    } finally {
      loading.value = false
    }
  }
  
  async function fetchAnalytics() {
    loading.value = true
    error.value = null
    try {
      analytics.value = await systemApi.getAnalytics()
    } catch (e: any) {
      error.value = e.message || 'Failed to fetch analytics'
      console.error('Error fetching analytics:', e)
    } finally {
      loading.value = false
    }
  }
  
  async function fetchAll() {
    loading.value = true
    error.value = null
    try {
      const [statusData, analyticsData] = await Promise.all([
        systemApi.getStatus(),
        systemApi.getAnalytics()
      ])
      
      // Transform backend response to match expected format
      status.value = {
        success: statusData.success || true,
        qdrant: statusData.qdrant || statusData.vector_db || {
          status: statusData.status || 'unknown',
          collection: 'documents',
          vectors: statusData.total_vectors || 0,
          points: statusData.total_points || 0,
          url: statusData.qdrant_url || ''
        },
        timestamp: statusData.timestamp || new Date().toISOString()
      }
      
      analytics.value = {
        success: analyticsData.success || true,
        total_messages: analyticsData.total_messages || 0,
        avg_response_time_ms: analyticsData.avg_response_time_ms || 0,
        total_tokens: analyticsData.total_tokens || 0,
        recent_messages_7d: analyticsData.recent_messages_7d || 0,
        today_messages: analyticsData.today_messages || 0
      }
    } catch (e: any) {
      error.value = e.message || 'Failed to fetch system data'
      console.error('Error fetching system data:', e)
      // Set default values on error
      status.value = {
        success: false,
        qdrant: {
          status: 'error',
          collection: 'documents',
          vectors: 0,
          points: 0,
          url: ''
        },
        timestamp: new Date().toISOString()
      }
      analytics.value = {
        success: false,
        total_messages: 0,
        avg_response_time_ms: 0,
        total_tokens: 0,
        recent_messages_7d: 0,
        today_messages: 0
      }
    } finally {
      loading.value = false
    }
  }
  
  return {
    status,
    analytics,
    loading,
    error,
    fetchStatus,
    fetchAnalytics,
    fetchAll
  }
})
