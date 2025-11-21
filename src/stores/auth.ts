import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

interface User {
  id: string
  username: string
  email?: string
}

interface LoginResponse {
  access_token: string
  token_type: string
  user?: User
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('auth_token'))
  const user = ref<User | null>(null)
  
  const isAuthenticated = computed(() => !!token.value)
  
  const login = async (username: string, password: string): Promise<void> => {
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
    
    const { data } = await axios.post<LoginResponse>(
      `${baseURL}/api/auth/login`,
      {
        username,
        password
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    )
    
    token.value = data.access_token
    localStorage.setItem('auth_token', data.access_token)
    
    if (data.user) {
      user.value = data.user
    }
  }
  
  const logout = () => {
    token.value = null
    user.value = null
    localStorage.removeItem('auth_token')
  }
  
  const checkAuth = () => {
    const storedToken = localStorage.getItem('auth_token')
    if (storedToken) {
      token.value = storedToken
    } else {
      token.value = null
      user.value = null
    }
  }
  
  return {
    token,
    user,
    isAuthenticated,
    login,
    logout,
    checkAuth
  }
})
