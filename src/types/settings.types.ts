export interface GeneralSettings {
  chatbot_name: string
  default_language: string
  timezone: string
  business_hours: {
    enabled: boolean
    start: string
    end: string
    days: number[]
  }
}

export interface IntegrationStatus {
  service: string
  status: 'connected' | 'disconnected' | 'error'
  url?: string
  last_check?: string
  error_message?: string
}

export interface IntegrationsSettings {
  waha: IntegrationStatus
  openai: IntegrationStatus
  qdrant: IntegrationStatus
  redis: IntegrationStatus
}

export interface RateLimitingSettings {
  enabled: boolean
  messages_per_minute: number
  daily_limit: number
  block_on_exceed: boolean
}

export interface NotificationSettings {
  email_alerts: boolean
  webhook_url?: string
  alert_on_errors: boolean
  alert_on_high_usage: boolean
}

export interface Settings {
  general: GeneralSettings
  integrations: IntegrationsSettings
  rate_limiting: RateLimitingSettings
  notifications: NotificationSettings
}

export interface SettingsResponse {
  success: boolean
  settings: Settings
}

export interface UpdateSettingsResponse {
  success: boolean
  message: string
}

export interface TestConnectionParams {
  service: 'waha' | 'openai' | 'qdrant' | 'redis'
}

export interface TestConnectionResponse {
  success: boolean
  service: string
  status: 'connected' | 'disconnected' | 'error'
  message: string
  response_time_ms?: number
}
