export interface AnalyticsOverview {
  total_messages: number
  active_users: number
  avg_response_time_ms: number
  total_tokens: number
  messages_today: number
  messages_7d: number
  messages_30d: number
  top_users: Array<{
    phone: string
    name?: string
    message_count: number
  }>
}

export interface MessageVolumeData {
  date: string
  count: number
}

export interface TokenUsageData {
  date: string
  tokens: number
}

export interface PopularQuery {
  query: string
  count: number
  avg_response_time_ms: number
}

export interface AnalyticsParams {
  start_date?: string
  end_date?: string
}

export interface AnalyticsOverviewResponse {
  success: boolean
  data: AnalyticsOverview
}

export interface MessagesChartResponse {
  success: boolean
  data: MessageVolumeData[]
}

export interface TokensChartResponse {
  success: boolean
  data: TokenUsageData[]
}

export interface PopularQueriesResponse {
  success: boolean
  data: PopularQuery[]
}
