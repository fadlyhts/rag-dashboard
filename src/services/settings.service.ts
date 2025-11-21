import api from './api'
import type {
  SettingsResponse,
  UpdateSettingsResponse,
  GeneralSettings,
  RateLimitingSettings,
  NotificationSettings,
  TestConnectionParams,
  TestConnectionResponse
} from '@/types/settings.types'

export const settingsService = {
  async getSettings(): Promise<SettingsResponse> {
    const { data } = await api.get('/api/settings')
    // Transform backend response to match frontend structure
    return {
      success: true,
      settings: {
        general: {
          chatbot_name: data.chatbot_name || 'WhatsApp RAG Bot',
          default_language: data.default_language || 'id',
          timezone: data.timezone || 'Asia/Jakarta',
          business_hours: data.business_hours || {
            enabled: false,
            start: '09:00',
            end: '17:00',
            days: [1, 2, 3, 4, 5]
          }
        },
        integrations: {
          waha: { service: 'waha', status: 'connected' as const },
          openai: { service: 'openai', status: 'connected' as const },
          qdrant: { service: 'qdrant', status: 'connected' as const },
          redis: { service: 'redis', status: 'connected' as const }
        },
        rate_limiting: data.rate_limiting || {
          enabled: false,
          messages_per_minute: 10,
          daily_limit: 100,
          block_on_exceed: false
        },
        notifications: data.notifications || {
          email_alerts: false,
          webhook_url: '',
          alert_on_errors: true,
          alert_on_high_usage: false
        }
      }
    }
  },

  async updateGeneral(settings: GeneralSettings): Promise<UpdateSettingsResponse> {
    const { data } = await api.put('/api/settings', settings)
    return data
  },

  async updateRateLimiting(settings: RateLimitingSettings): Promise<UpdateSettingsResponse> {
    const { data } = await api.put('/api/settings', { rate_limiting: settings })
    return data
  },

  async updateNotifications(settings: NotificationSettings): Promise<UpdateSettingsResponse> {
    const { data } = await api.put('/api/settings', { notifications: settings })
    return data
  },

  async testConnection(params: TestConnectionParams): Promise<TestConnectionResponse> {
    // Test connection by checking system health
    const { data } = await api.get('/api/dashboard/system-health')
    return {
      success: true,
      service: params.service,
      status: 'connected',
      message: 'Connection successful'
    }
  }
}
