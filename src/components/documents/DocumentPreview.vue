<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Loader2, AlertCircle, RotateCw } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import VuePdfEmbed from 'vue-pdf-embed'
import api from '@/services/api'

interface Props {
  fileUrl: string
  fileType: string
  title: string
  documentId: number
}

const props = defineProps<Props>()

const currentPage = ref(1)
const totalPages = ref(0)
const scale = ref(1.0)
const loading = ref(false)
const error = ref<string | null>(null)
const textContent = ref<string>('')
const pdfLoading = ref(true)

const isPDF = computed(() => props.fileType.toLowerCase().includes('pdf'))
const isText = computed(() => {
  const type = props.fileType.toLowerCase()
  return type.includes('txt') || type.includes('md') || type.includes('csv')
})

// Compute PDF source URL with auth token
const pdfSource = computed(() => {
  const token = localStorage.getItem('auth_token')
  if (!token) return null
  const baseUrl = import.meta.env.VITE_API_URL || ''
  return `${baseUrl}/api/documents/${props.documentId}/download?token=${token}`
})

const handlePageChange = (delta: number) => {
  const newPage = currentPage.value + delta
  if (newPage >= 1 && newPage <= totalPages.value) {
    currentPage.value = newPage
  }
}

const handleZoom = (delta: number) => {
  const newScale = scale.value + delta
  if (newScale >= 0.5 && newScale <= 3.0) {
    scale.value = Math.round(newScale * 10) / 10
  }
}

const handleLoadedPdf = (pdf: any) => {
  totalPages.value = pdf.numPages
  pdfLoading.value = false
}

const handlePdfError = (err: Error) => {
  pdfLoading.value = false
  // Check if the error message contains the backend's "not found on disk" detail
  if (err.message && err.message.includes('not found on disk')) {
    error.value = 'The original file is no longer available on the server. It may have been removed during a server update.'
  } else {
    error.value = `Failed to load PDF: ${err.message}`
  }
}

const fetchTextContent = async () => {
  if (!props.documentId) return
  loading.value = true
  error.value = null
  try {
    const { data } = await api.get(`/api/documents/${props.documentId}/preview`, {
      params: { length: 5000 }
    })
    textContent.value = data.preview || data.content || ''
  } catch (err: any) {
    error.value = err.response?.data?.detail || 'Failed to load document content'
  } finally {
    loading.value = false
  }
}

const retry = () => {
  error.value = null
  if (isPDF.value) {
    pdfLoading.value = true
    // Force re-render by toggling a key (handled by Vue reactivity)
  } else if (isText.value) {
    fetchTextContent()
  }
}

onMounted(() => {
  if (isText.value) {
    fetchTextContent()
  }
})

watch(() => props.documentId, () => {
  if (isText.value) {
    fetchTextContent()
  }
})
</script>

<template>
  <div class="space-y-4">
    <!-- Error State -->
    <div v-if="error" class="border border-red-200 rounded-lg bg-red-50 p-6 text-center">
      <AlertCircle class="w-8 h-8 text-red-500 mx-auto mb-3" />
      <p class="text-red-700">{{ error }}</p>
      <Button variant="outline" size="sm" class="mt-4" @click="retry">
        <RotateCw class="w-4 h-4 mr-2" />
        Retry
      </Button>
    </div>

    <!-- PDF Preview -->
    <div v-else-if="isPDF" class="border border-gray-200 rounded-lg bg-white">
      <!-- Controls -->
      <div class="flex items-center justify-between p-4 border-b border-gray-200">
        <div class="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            @click="handlePageChange(-1)"
            :disabled="currentPage <= 1"
          >
            <ChevronLeft class="w-4 h-4" />
          </Button>
          <span class="text-sm text-gray-600 min-w-[100px] text-center">
            Page {{ currentPage }} of {{ totalPages }}
          </span>
          <Button 
            variant="outline" 
            size="sm"
            @click="handlePageChange(1)"
            :disabled="currentPage >= totalPages"
          >
            <ChevronRight class="w-4 h-4" />
          </Button>
        </div>
        
        <div class="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            @click="handleZoom(-0.1)"
            :disabled="scale <= 0.5"
          >
            <ZoomOut class="w-4 h-4" />
          </Button>
          <span class="text-sm text-gray-600 min-w-[60px] text-center">
            {{ Math.round(scale * 100) }}%
          </span>
          <Button 
            variant="outline" 
            size="sm"
            @click="handleZoom(0.1)"
            :disabled="scale >= 3.0"
          >
            <ZoomIn class="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <!-- PDF Viewer -->
      <div class="p-4 bg-gray-50 overflow-auto max-h-[800px]">
        <!-- Loading state -->
        <div v-if="pdfLoading" class="flex items-center justify-center py-12">
          <Loader2 class="w-8 h-8 text-gray-400 animate-spin" />
          <span class="ml-3 text-gray-500">Loading PDF...</span>
        </div>
        
        <div class="flex justify-center">
          <div :style="{ transform: `scale(${scale})`, transformOrigin: 'top center' }">
            <VuePdfEmbed
              v-if="pdfSource"
              :source="pdfSource"
              :page="currentPage"
              :width="800"
              @loaded="handleLoadedPdf"
              @loading-failed="handlePdfError"
              class="shadow-lg"
            />
          </div>
        </div>
      </div>
    </div>
    
    <!-- Text Preview -->
    <div v-else-if="isText" class="border border-gray-200 rounded-lg bg-white p-6">
      <!-- Loading state -->
      <div v-if="loading" class="flex items-center justify-center py-8">
        <Loader2 class="w-6 h-6 text-gray-400 animate-spin" />
        <span class="ml-3 text-gray-500">Loading content...</span>
      </div>
      
      <div v-else class="prose max-w-none">
        <pre class="whitespace-pre-wrap text-sm text-gray-700 font-sans bg-gray-50 p-4 rounded max-h-[600px] overflow-auto">{{ textContent || 'No content available' }}</pre>
      </div>
    </div>
    
    <!-- Unsupported Format -->
    <div v-else class="border border-gray-200 rounded-lg bg-white p-12 text-center">
      <p class="text-gray-500">Preview not available for this file type</p>
      <p class="text-sm text-gray-400 mt-2">File type: {{ fileType }}</p>
    </div>
  </div>
</template>
