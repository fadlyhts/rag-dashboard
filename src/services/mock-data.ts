// Mock data for testing frontend when backend endpoints don't exist yet

export const mockSystemStatus = {
  success: true,
  qdrant: {
    status: 'healthy',
    collection: 'documents',
    vectors: 156,
    points: 156,
    url: 'http://localhost:6333'
  },
  timestamp: new Date().toISOString()
}

export const mockAnalytics = {
  success: true,
  total_messages: 1234,
  avg_response_time_ms: 1250,
  total_tokens: 45678,
  recent_messages_7d: 234,
  today_messages: 45
}

export const mockDocuments = {
  success: true,
  documents: [
    {
      id: '1',
      title: 'Product Catalog 2024',
      content_type: 'pdf',
      chunks: 45,
      created_at: new Date().toISOString(),
      status: 'completed' as const
    },
    {
      id: '2',
      title: 'FAQ Document',
      content_type: 'text',
      chunks: 12,
      created_at: new Date().toISOString(),
      status: 'completed' as const
    },
    {
      id: '3',
      title: 'Company Policies',
      content_type: 'pdf',
      chunks: 78,
      created_at: new Date().toISOString(),
      status: 'processing' as const
    }
  ],
  total_vectors: 135,
  collection: 'documents',
  status: 'healthy'
}

export const mockConversations = {
  success: true,
  conversations: [
    {
      id: '1',
      phone: '+6281234567890',
      name: 'John Doe',
      last_message: 'Terima kasih atas informasinya!',
      last_message_time: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      status: 'active' as const,
      message_count: 15,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 30).toISOString()
    },
    {
      id: '2',
      phone: '+6289876543210',
      name: 'Jane Smith',
      last_message: 'Berapa harga produk X?',
      last_message_time: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      status: 'active' as const,
      message_count: 8,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 120).toISOString()
    }
  ],
  total: 2,
  page: 1,
  limit: 20
}

export const mockUsers = {
  success: true,
  users: [
    {
      id: '1',
      phone: '+6281234567890',
      name: 'John Doe',
      messages_count: 25,
      last_active: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      status: 'active' as const,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString()
    },
    {
      id: '2',
      phone: '+6289876543210',
      name: 'Jane Smith',
      messages_count: 12,
      last_active: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      status: 'active' as const,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString()
    }
  ],
  total: 2,
  page: 1,
  limit: 20
}

export const mockVectorCollections = {
  success: true,
  collections: [
    {
      name: 'documents',
      vectors_count: 156,
      indexed_vectors_count: 156,
      points_count: 156,
      segments_count: 1,
      status: 'green',
      optimizer_status: 'ok',
      disk_data_size: 2048000
    }
  ]
}

export const mockRagConfig = {
  success: true,
  config: {
    llm: {
      model: 'gpt-4',
      temperature: 0.7,
      max_tokens: 2000,
      top_p: 1.0
    },
    retrieval: {
      top_k: 5,
      similarity_threshold: 0.7,
      chunk_size: 1000,
      chunk_overlap: 200
    }
  }
}

export const mockPrompts = {
  success: true,
  prompts: {
    system: 'You are a helpful AI assistant. Answer questions based on the provided context.',
    user: 'Context: {context}\n\nQuestion: {query}\n\nAnswer:'
  }
}

export const mockAnalyticsOverview = {
  success: true,
  data: {
    total_messages: 1234,
    active_users: 45,
    avg_response_time_ms: 1250,
    total_tokens: 456789,
    messages_today: 67,
    messages_7d: 456,
    messages_30d: 1234,
    top_users: [
      { phone: '+6281234567890', name: 'John Doe', message_count: 125 },
      { phone: '+6289876543210', name: 'Jane Smith', message_count: 98 },
      { phone: '+6285555555555', name: 'Bob Wilson', message_count: 76 }
    ]
  }
}

export const mockMessagesChart = {
  success: true,
  data: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    count: Math.floor(Math.random() * 50) + 20
  }))
}

export const mockTokensChart = {
  success: true,
  data: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    tokens: Math.floor(Math.random() * 5000) + 1000
  }))
}

export const mockPopularQueries = {
  success: true,
  data: [
    { query: 'Berapa harga produk A?', count: 45, avg_response_time_ms: 1200 },
    { query: 'Bagaimana cara pembayaran?', count: 38, avg_response_time_ms: 1100 },
    { query: 'Apakah ada diskon?', count: 32, avg_response_time_ms: 950 },
    { query: 'Kapan bisa dikirim?', count: 28, avg_response_time_ms: 1300 },
    { query: 'Lokasi toko dimana?', count: 25, avg_response_time_ms: 800 }
  ]
}

export const mockSettings = {
  success: true,
  settings: {
    general: {
      chatbot_name: 'WhatsApp RAG Bot',
      default_language: 'id',
      timezone: 'Asia/Jakarta',
      business_hours: {
        enabled: true,
        start: '09:00',
        end: '17:00',
        days: [1, 2, 3, 4, 5]
      }
    },
    integrations: {
      waha: { service: 'waha', status: 'connected' as const, url: 'http://localhost:3000' },
      openai: { service: 'openai', status: 'connected' as const },
      qdrant: { service: 'qdrant', status: 'connected' as const, url: 'http://localhost:6333' },
      redis: { service: 'redis', status: 'connected' as const }
    },
    rate_limiting: {
      enabled: true,
      messages_per_minute: 10,
      daily_limit: 100,
      block_on_exceed: false
    },
    notifications: {
      email_alerts: true,
      webhook_url: '',
      alert_on_errors: true,
      alert_on_high_usage: false
    }
  }
}
