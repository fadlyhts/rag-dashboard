<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Home, RefreshCw, AlertTriangle } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'

const router = useRouter()

const goHome = () => {
  router.push('/')
}

const reload = () => {
  window.location.reload()
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div class="max-w-md w-full text-center">
      <div class="mb-8">
        <div class="inline-flex items-center justify-center w-24 h-24 rounded-full bg-orange-100 mb-6">
          <AlertTriangle class="w-12 h-12 text-orange-600" />
        </div>
        <h1 class="text-6xl font-bold text-gray-900 mb-4">500</h1>
        <h2 class="text-2xl font-semibold text-gray-800 mb-2">Server Error</h2>
        <p class="text-gray-600 mb-8">
          Oops! Something went wrong on our end. Our team has been notified and we're working to fix it.
        </p>
      </div>

      <div class="flex flex-col sm:flex-row gap-3 justify-center">
        <Button @click="reload" variant="outline" class="flex items-center gap-2">
          <RefreshCw class="w-4 h-4" />
          Retry
        </Button>
        <Button @click="goHome" class="bg-[#25D366] hover:bg-[#1fb855] flex items-center gap-2">
          <Home class="w-4 h-4" />
          Go to Homepage
        </Button>
      </div>

      <div class="mt-12 pt-8 border-t border-gray-200">
        <p class="text-sm text-gray-500">
          Error Code: 500 | Internal Server Error
        </p>
        <p class="text-sm text-gray-500 mt-2">
          If the problem persists, please contact support.
        </p>
      </div>
    </div>
  </div>
</template>
