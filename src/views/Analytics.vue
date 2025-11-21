<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { toast } from 'vue-sonner'
import { analyticsService } from '@/services/analytics.service'
import type {
  AnalyticsOverview,
  MessageVolumeData,
  TokenUsageData,
  PopularQuery
} from '@/types/analytics.types'
import { Download, MessageSquare, Users, Clock, Zap } from 'lucide-vue-next'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import DateRangePicker from '@/components/shared/DateRangePicker.vue'
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue'
import MessageChart from '@/components/analytics/MessageChart.vue'
import TokenChart from '@/components/analytics/TokenChart.vue'
import QueryChart from '@/components/analytics/QueryChart.vue'

const loading = ref(true)
const dateRange = ref<{ start: Date | null; end: Date | null }>({
  start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
  end: new Date()
})

const overview = ref<AnalyticsOverview | null>(null)
const messageData = ref<MessageVolumeData[]>([])
const tokenData = ref<TokenUsageData[]>([])
const queryData = ref<PopularQuery[]>([])

onMounted(() => {
  loadAnalytics()
})

const loadAnalytics = async () => {
  loading.value = true
  try {
    const params = {
      start_date: dateRange.value.start?.toISOString(),
      end_date: dateRange.value.end?.toISOString()
    }

    const [overviewRes, messagesRes, tokensRes, queriesRes] = await Promise.all([
      analyticsService.getOverview(params),
      analyticsService.getMessagesChart(params),
      analyticsService.getTokensChart(params),
      analyticsService.getPopularQueries(params)
    ])

    overview.value = overviewRes.data
    messageData.value = messagesRes.data
    tokenData.value = tokensRes.data
    queryData.value = queriesRes.data
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Failed to load analytics')
  } finally {
    loading.value = false
  }
}

const handleDateRangeChange = () => {
  loadAnalytics()
}

const exportData = async (format: 'csv' | 'pdf') => {
  try {
    const blob = await analyticsService.exportData(format, {
      start_date: dateRange.value.start?.toISOString(),
      end_date: dateRange.value.end?.toISOString()
    })

    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-${format}-${Date.now()}.${format}`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)

    toast.success(`Exported as ${format.toUpperCase()}`)
  } catch (error) {
    toast.error('Failed to export data')
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Analytics</h1>
        <p class="text-gray-500 mt-1">Monitor system performance and usage</p>
      </div>
      <div class="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="outline">
              <Download class="w-4 h-4 mr-2" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem @click="exportData('csv')">
              Export as CSV
            </DropdownMenuItem>
            <DropdownMenuItem @click="exportData('pdf')">
              Export as PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="outline" @click="loadAnalytics">
          Refresh
        </Button>
      </div>
    </div>

    <!-- Date Range Filter -->
    <div class="flex items-center gap-3">
      <span class="text-sm font-medium text-gray-700">Date Range:</span>
      <DateRangePicker
        v-model="dateRange"
        @change="handleDateRangeChange"
      />
    </div>

    <LoadingSpinner v-if="loading" size="lg" class="py-12" />

    <div v-else class="space-y-6">
      <!-- KPI Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Total Messages</p>
              <p class="text-3xl font-bold text-gray-900 mt-2">
                {{ overview?.total_messages.toLocaleString() || 0 }}
              </p>
              <p class="text-xs text-gray-500 mt-2">
                Today: {{ overview?.messages_today || 0 }}
              </p>
            </div>
            <MessageSquare class="w-10 h-10 text-blue-500" />
          </div>
        </Card>

        <Card class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Active Users</p>
              <p class="text-3xl font-bold text-gray-900 mt-2">
                {{ overview?.active_users || 0 }}
              </p>
              <p class="text-xs text-gray-500 mt-2">
                7d: {{ overview?.messages_7d || 0 }}
              </p>
            </div>
            <Users class="w-10 h-10 text-green-500" />
          </div>
        </Card>

        <Card class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Avg Response Time</p>
              <p class="text-3xl font-bold text-gray-900 mt-2">
                {{ Math.round(overview?.avg_response_time_ms || 0) }}<span class="text-lg">ms</span>
              </p>
              <p class="text-xs text-gray-500 mt-2">
                Per message
              </p>
            </div>
            <Clock class="w-10 h-10 text-orange-500" />
          </div>
        </Card>

        <Card class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Token Usage</p>
              <p class="text-3xl font-bold text-gray-900 mt-2">
                {{ (overview?.total_tokens || 0).toLocaleString() }}
              </p>
              <p class="text-xs text-gray-500 mt-2">
                Total consumed
              </p>
            </div>
            <Zap class="w-10 h-10 text-purple-500" />
          </div>
        </Card>
      </div>

      <!-- Charts Row 1 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Message Volume Chart -->
        <Card class="p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Message Volume</h3>
          <MessageChart v-if="messageData.length > 0" :data="messageData" />
          <div v-else class="h-[300px] flex items-center justify-center text-gray-500">
            No data available
          </div>
        </Card>

        <!-- Token Usage Chart -->
        <Card class="p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Token Usage</h3>
          <TokenChart v-if="tokenData.length > 0" :data="tokenData" />
          <div v-else class="h-[300px] flex items-center justify-center text-gray-500">
            No data available
          </div>
        </Card>
      </div>

      <!-- Popular Queries Chart -->
      <Card class="p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Top 10 Popular Queries</h3>
        <QueryChart v-if="queryData.length > 0" :data="queryData" />
        <div v-else class="h-[400px] flex items-center justify-center text-gray-500">
          No queries data available
        </div>
      </Card>

      <!-- Top Users Table -->
      <Card class="p-6" v-if="overview?.top_users && overview.top_users.length > 0">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Top Active Users</h3>
        <div class="space-y-3">
          <div
            v-for="(user, idx) in overview.top_users"
            :key="idx"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-[#25D366] flex items-center justify-center text-white font-bold">
                {{ idx + 1 }}
              </div>
              <div>
                <p class="font-medium text-gray-900">{{ user.name || 'Unknown' }}</p>
                <p class="text-sm text-gray-600 font-mono">{{ user.phone }}</p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-lg font-bold text-gray-900">{{ user.message_count }}</p>
              <p class="text-xs text-gray-500">messages</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>
