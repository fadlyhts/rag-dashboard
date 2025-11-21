<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import Sidebar from './Sidebar.vue'
import Navbar from './Navbar.vue'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Home, FileText, MessageSquare, Users, Database, Settings, BarChart, Wrench } from 'lucide-vue-next'

const mobileMenuOpen = ref(false)

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

const handleToggleSidebar = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Desktop Sidebar -->
    <Sidebar />
    
    <!-- Mobile Sidebar Sheet -->
    <Sheet v-model:open="mobileMenuOpen">
      <SheetContent side="left" class="w-64 p-0">
        <div class="flex items-center gap-3 px-6 py-5 border-b border-gray-200">
          <div class="w-10 h-10 rounded-lg bg-[#25D366] flex items-center justify-center">
            <MessageSquare class="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 class="text-lg font-bold text-gray-900">WhatsApp RAG</h1>
            <p class="text-xs text-gray-500">Admin Panel</p>
          </div>
        </div>
        
        <nav class="p-4 space-y-1">
          <RouterLink
            v-for="item in navigationItems"
            :key="item.path"
            :to="item.path"
            @click="mobileMenuOpen = false"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            <component :is="item.icon" class="w-5 h-5" />
            <span>{{ item.name }}</span>
          </RouterLink>
        </nav>
      </SheetContent>
    </Sheet>
    
    <!-- Main Content Area -->
    <div class="lg:pl-64">
      <Navbar @toggle-sidebar="handleToggleSidebar" />
      
      <main class="p-6">
        <RouterView />
      </main>
    </div>
  </div>
</template>
