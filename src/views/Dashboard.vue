<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSystemStore } from '@/stores/system'
import { useDocumentStore } from '@/stores/documents'
import { RouterLink } from 'vue-router'

const systemStore = useSystemStore()
const documentStore = useDocumentStore()

onMounted(async () => {
  await Promise.all([
    systemStore.fetchAll(),
    documentStore.fetchDocuments()
  ])
})

const refreshData = async () => {
  await Promise.all([
    systemStore.fetchAll(),
    documentStore.fetchDocuments()
  ])
}
</script>

<template>
  <div class="p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
      <p class="text-gray-600 mt-2">RAG System Overview and Quick Actions</p>
    </div>
    
    <div v-if="systemStore.loading" class="flex justify-center py-12">
      <div class="w-12 h-12 spinner"></div>
    </div>
    
    <div v-else class="space-y-6">
      <!-- Status Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <!-- Qdrant Status -->
        <div class="bg-white p-6 rounded-lg shadow">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Qdrant Status</p>
              <p class="mt-2">
                <span
                  :class="[
                    'inline-block px-3 py-1 rounded-full text-xs font-semibold',
                    systemStore.status?.qdrant?.status === 'healthy' || systemStore.status?.qdrant?.status === 'ok'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  ]"
                >
                  {{ systemStore.status?.qdrant?.status || 'Unknown' }}
                </span>
              </p>
            </div>
            <svg class="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
        </div>
        
        <!-- Total Documents -->
        <div class="bg-white p-6 rounded-lg shadow">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Total Documents</p>
              <p class="text-3xl font-bold mt-2">
                {{ documentStore.total || systemStore.status?.qdrant?.vectors || 0 }}
              </p>
            </div>
            <svg class="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          </div>
        </div>
        
        <!-- Total Messages -->
        <div class="bg-white p-6 rounded-lg shadow">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Total Messages</p>
              <p class="text-3xl font-bold mt-2">
                {{ systemStore.analytics?.total_messages || 0 }}
              </p>
            </div>
            <svg class="w-10 h-10 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
            </svg>
          </div>
        </div>
        
        <!-- Avg Response Time -->
        <div class="bg-white p-6 rounded-lg shadow">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Avg Response Time</p>
              <p class="text-3xl font-bold mt-2">
                {{ Math.round(systemStore.analytics?.avg_response_time_ms || 0) }}<span class="text-lg text-gray-500">ms</span>
              </p>
            </div>
            <svg class="w-10 h-10 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
        </div>
      </div>
      
      <!-- Additional Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white p-6 rounded-lg shadow">
          <p class="text-sm text-gray-600">Total Tokens Used</p>
          <p class="text-2xl font-bold mt-2">
            {{ (systemStore.analytics?.total_tokens || 0).toLocaleString() }}
          </p>
        </div>
        
        <div class="bg-white p-6 rounded-lg shadow">
          <p class="text-sm text-gray-600">Messages (7 days)</p>
          <p class="text-2xl font-bold mt-2">
            {{ systemStore.analytics?.recent_messages_7d || 0 }}
          </p>
        </div>
        
        <div class="bg-white p-6 rounded-lg shadow">
          <p class="text-sm text-gray-600">Messages Today</p>
          <p class="text-2xl font-bold mt-2">
            {{ systemStore.analytics?.today_messages || 0 }}
          </p>
        </div>
      </div>
      
      <!-- Quick Actions -->
      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-xl font-bold mb-4">Quick Actions</h2>
        <div class="flex flex-wrap gap-4">
          <RouterLink
            to="/documents/upload"
            class="bg-[#25D366] text-white px-6 py-3 rounded-lg hover:bg-[#1fb855] transition-colors flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Upload Document
          </RouterLink>
          
          <RouterLink
            to="/test"
            class="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
            </svg>
            Test Query
          </RouterLink>
          
          <button
            @click="refreshData"
            class="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            Refresh
          </button>
        </div>
      </div>
      
      <!-- System Info -->
      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-xl font-bold mb-4">System Information</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p class="text-gray-600">Collection Name</p>
            <p class="font-mono text-sm mt-1">{{ systemStore.status?.qdrant?.collection || 'documents' }}</p>
          </div>
          <div>
            <p class="text-gray-600">Qdrant URL</p>
            <p class="font-mono text-xs mt-1 truncate">{{ systemStore.status?.qdrant?.url || 'Connected' }}</p>
          </div>
          <div>
            <p class="text-gray-600">Last Updated</p>
            <p class="text-sm mt-1">{{ systemStore.status?.timestamp ? new Date(systemStore.status.timestamp).toLocaleString() : 'N/A' }}</p>
          </div>
          <div>
            <p class="text-gray-600">API Status</p>
            <p class="text-sm mt-1">
              <span class="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Connected
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
