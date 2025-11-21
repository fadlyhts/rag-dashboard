import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Layout from '@/components/layout/Layout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/Login.vue'),
      meta: { title: 'Login', requiresAuth: false }
    },
    {
      path: '/',
      component: Layout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('@/views/Dashboard.vue'),
          meta: { title: 'Dashboard' }
        },
        {
          path: 'documents',
          name: 'documents',
          component: () => import('@/views/documents/Index.vue'),
          meta: { title: 'Documents' }
        },
        {
          path: 'documents/upload',
          name: 'documents-upload',
          component: () => import('@/views/documents/Upload.vue'),
          meta: { title: 'Upload Document' }
        },
        {
          path: 'documents/:id',
          name: 'documents-detail',
          component: () => import('@/views/documents/Detail.vue'),
          meta: { title: 'Document Detail' }
        },
        {
          path: 'test',
          name: 'test',
          component: () => import('@/views/Test.vue'),
          meta: { title: 'Test Query' }
        },
        {
          path: 'analytics',
          name: 'analytics',
          component: () => import('@/views/Analytics.vue'),
          meta: { title: 'Analytics' }
        },
        {
          path: 'conversations',
          name: 'conversations',
          component: () => import('@/views/Conversations.vue'),
          meta: { title: 'Conversations' }
        },
        {
          path: 'users',
          name: 'users',
          component: () => import('@/views/Users.vue'),
          meta: { title: 'Users' }
        },
        {
          path: 'vector-db',
          name: 'vector-db',
          component: () => import('@/views/VectorDB.vue'),
          meta: { title: 'Vector DB' }
        },
        {
          path: 'rag-config',
          name: 'rag-config',
          component: () => import('@/views/RagConfig.vue'),
          meta: { title: 'RAG Config' }
        },
        {
          path: 'settings',
          name: 'settings',
          component: () => import('@/views/Settings.vue'),
          meta: { title: 'Settings' }
        }
      ]
    },
    {
      path: '/500',
      name: 'server-error',
      component: () => import('@/views/ServerError.vue'),
      meta: { title: 'Server Error', requiresAuth: false }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFound.vue'),
      meta: { title: 'Page Not Found', requiresAuth: false }
    }
  ]
})

// Auth guard and page title
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  document.title = `${to.meta.title || 'RAG'} - Admin Dashboard`
  
  authStore.checkAuth()
  
  if (to.meta.requiresAuth !== false && !authStore.isAuthenticated) {
    next({ name: 'login' })
  } else if (to.name === 'login' && authStore.isAuthenticated) {
    next({ name: 'dashboard' })
  } else {
    next()
  }
})

export default router
