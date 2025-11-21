<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { toast } from 'vue-sonner'
import * as z from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Lock, User } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const isLoading = ref(false)

const username = ref('')
const password = ref('')
const errors = ref<{ username?: string; password?: string }>({})

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required')
})

const onSubmit = async (e: Event) => {
  e.preventDefault()
  
  errors.value = {}
  
  const result = loginSchema.safeParse({
    username: username.value,
    password: password.value
  })
  
  if (!result.success) {
    result.error.errors.forEach((error) => {
      if (error.path[0]) {
        errors.value[error.path[0] as 'username' | 'password'] = error.message
      }
    })
    return
  }
  
  isLoading.value = true
  try {
    await authStore.login(result.data.username, result.data.password)
    toast.success('Login successful', {
      description: 'Welcome back!'
    })
    router.push('/')
  } catch (error: any) {
    console.error('Login error:', error.response?.data)
    const errorMsg = error.response?.data?.detail || 
                     JSON.stringify(error.response?.data) || 
                     'Invalid credentials'
    toast.error('Login failed', {
      description: errorMsg
    })
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
    <Card class="w-full max-w-md shadow-xl border-t-4 border-t-[#25D366]">
      <CardHeader class="space-y-1 text-center">
        <CardTitle class="text-3xl font-bold text-gray-900">
          RAG Admin
        </CardTitle>
        <CardDescription class="text-gray-600">
          Sign in to access the admin dashboard
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form @submit="onSubmit" class="space-y-4">
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">Username</label>
            <div class="relative">
              <User class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                v-model="username"
                type="text"
                placeholder="Enter your username"
                class="pl-10"
                :disabled="isLoading"
              />
            </div>
            <p v-if="errors.username" class="text-sm text-red-600">{{ errors.username }}</p>
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">Password</label>
            <div class="relative">
              <Lock class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                v-model="password"
                type="password"
                placeholder="Enter your password"
                class="pl-10"
                :disabled="isLoading"
              />
            </div>
            <p v-if="errors.password" class="text-sm text-red-600">{{ errors.password }}</p>
          </div>

          <Button
            type="submit"
            class="w-full bg-[#25D366] hover:bg-[#1fb855] text-white font-semibold py-2.5 transition-colors"
            :disabled="isLoading"
          >
            <span v-if="!isLoading">Sign In</span>
            <span v-else class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing in...
            </span>
          </Button>
        </form>
        
        <div class="mt-6 text-center text-sm text-gray-500">
          <p>RAG System Admin Panel v1.0</p>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
