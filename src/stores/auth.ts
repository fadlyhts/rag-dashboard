import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

interface User {
  id: string
  username: string
  email?: string
  role?: string
  division_id?: number | null
}

interface LoginResponse {
  access_token: string
  token_type: string
  user_info?: User
  role?: string
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('auth_token'))
  const user = ref<User | null>(null)
  
  const isAuthenticated = computed(() => !!token.value)
  
  const login = async (username: string, password: string): Promise<void> => {
    const baseURL = import.meta.env.VITE_API_URL || ''
    
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
    
    if (data.user_info) {
      user.value = data.user_info
      localStorage.setItem('auth_user', JSON.stringify(data.user_info))
    }
  }
  
  const logout = () => {
    token.value = null
    user.value = null
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
  }
  
  const checkAuth = () => {
    const storedToken = localStorage.getItem('auth_token')
    const storedUser = localStorage.getItem('auth_user')
    if (storedToken) {
      token.value = storedToken
      if (storedUser) {
        try {
          user.value = JSON.parse(storedUser)
        } catch (e) {
          user.value = null
        }
      }
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
