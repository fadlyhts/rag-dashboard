<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Menu, Search, User, LogOut, Settings, ChevronRight } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const emit = defineEmits<{
  'toggle-sidebar': []
}>()

const searchQuery = ref('')

const breadcrumbs = computed(() => {
  const paths = route.path.split('/').filter(Boolean)
  return paths.map((path, index) => ({
    name: path.charAt(0).toUpperCase() + path.slice(1),
    path: '/' + paths.slice(0, index + 1).join('/')
  }))
})

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <header class="sticky top-0 z-30 w-full bg-white border-b border-gray-200">
    <div class="flex items-center justify-between h-16 px-6">
      <!-- Left Side -->
      <div class="flex items-center gap-4 flex-1">
        <!-- Mobile Menu Button -->
        <Button variant="ghost" size="icon" class="lg:hidden" @click="emit('toggle-sidebar')">
          <Menu class="w-5 h-5" />
        </Button>
        
        <!-- Breadcrumbs -->
        <nav class="hidden md:flex items-center space-x-2 text-sm">
          <RouterLink to="/" class="text-gray-500 hover:text-gray-700">
            Home
          </RouterLink>
          <template v-for="(crumb, index) in breadcrumbs" :key="crumb.path">
            <ChevronRight class="w-4 h-4 text-gray-400" />
            <RouterLink 
              :to="crumb.path" 
              class="text-gray-500 hover:text-gray-700"
              :class="{ 'text-gray-900 font-medium': index === breadcrumbs.length - 1 }"
            >
              {{ crumb.name }}
            </RouterLink>
          </template>
        </nav>
      </div>
      
      <!-- Search Bar (Optional) -->
      <div class="hidden md:flex items-center flex-1 max-w-md mx-4">
        <div class="relative w-full">
          <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            v-model="searchQuery"
            placeholder="Search..."
            class="pl-10 bg-gray-50 border-gray-200"
          />
        </div>
      </div>
      
      <!-- Right Side -->
      <div class="flex items-center gap-3">
        <!-- User Dropdown -->
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="ghost" class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-full bg-[#25D366] flex items-center justify-center">
                <User class="w-4 h-4 text-white" />
              </div>
              <span class="hidden md:inline-block text-sm font-medium">Admin</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="w-48">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem @click="router.push('/profile')">
              <User class="w-4 h-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem @click="router.push('/settings')">
              <Settings class="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem @click="handleLogout" class="text-red-600">
              <LogOut class="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  </header>
</template>
