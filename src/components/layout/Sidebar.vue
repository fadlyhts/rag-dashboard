<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'
import { Home, FileText, MessageSquare, Users, Database, Settings, BarChart, Wrench } from 'lucide-vue-next'

const route = useRoute()

const navigationItems = [
  { name: 'Dashboard', path: '/', icon: Home },
  { name: 'Documents', path: '/documents', icon: FileText },
  { name: 'Conversations', path: '/conversations', icon: MessageSquare },
  { name: 'Users', path: '/users', icon: Users },
  { name: 'Vector DB', path: '/vector-db', icon: Database },
  { name: 'RAG Config', path: '/rag-config', icon: Wrench },
  { name: 'Analytics', path: '/analytics', icon: BarChart },
  { name: 'Settings', path: '/settings', icon: Settings }
]
</script>

<template>
  <aside class="fixed left-0 top-0 z-40 h-screen w-64 bg-white border-r border-gray-200 hidden lg:block">
    <!-- Logo -->
    <div class="flex items-center gap-3 px-6 py-5 border-b border-gray-200">
      <div class="w-10 h-10 rounded-lg bg-[#25D366] flex items-center justify-center">
        <MessageSquare class="w-6 h-6 text-white" />
      </div>
      <div>
        <h1 class="text-lg font-bold text-gray-900">WhatsApp RAG</h1>
        <p class="text-xs text-gray-500">Admin Panel</p>
      </div>
    </div>
    
    <!-- Navigation -->
    <nav class="flex-1 overflow-y-auto p-4 space-y-1">
      <RouterLink
        v-for="item in navigationItems"
        :key="item.path"
        :to="item.path"
        class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors group"
        :class="{
          'bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 hover:text-[#25D366] font-medium': route.path === item.path
        }"
      >
        <component 
          :is="item.icon" 
          class="w-5 h-5" 
          :class="{
            'text-[#25D366]': route.path === item.path,
            'text-gray-500 group-hover:text-gray-700': route.path !== item.path
          }"
        />
        <span>{{ item.name }}</span>
      </RouterLink>
    </nav>
    
    <!-- Footer -->
    <div class="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
      <p class="text-xs text-gray-500">RAG Admin v1.0</p>
      <p class="text-xs text-gray-400">Powered by Vue 3</p>
    </div>
  </aside>
</template>
