<script setup lang="ts">
import { ref, computed } from 'vue'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'

interface Props {
  fileUrl: string
  fileType: string
  title: string
}

const props = defineProps<Props>()

const currentPage = ref(1)
const totalPages = ref(0)
const scale = ref(1.0)

const isPDF = computed(() => props.fileType.toLowerCase().includes('pdf'))
const isText = computed(() => {
  const type = props.fileType.toLowerCase()
  return type.includes('txt') || type.includes('md') || type.includes('csv')
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
    scale.value = newScale
  }
}

const handleLoadedPdf = (pdf: any) => {
  totalPages.value = pdf.numPages
}
</script>

<template>
  <div class="space-y-4">
    <!-- PDF Preview -->
    <div v-if="isPDF" class="border border-gray-200 rounded-lg bg-white">
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
      <div class="p-6 bg-gray-50 overflow-auto max-h-[600px]">
        <div class="flex justify-center">
          <div class="bg-white shadow-lg">
            <!-- Note: vue-pdf-embed integration -->
            <div class="p-8 text-center text-gray-500">
              <p>PDF Preview</p>
              <p class="text-sm mt-2">{{ title }}</p>
              <p class="text-xs mt-4 text-gray-400">
                vue-pdf-embed component would render here
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Text Preview -->
    <div v-else-if="isText" class="border border-gray-200 rounded-lg bg-white p-6">
      <div class="prose max-w-none">
        <pre class="whitespace-pre-wrap text-sm text-gray-700 font-sans bg-gray-50 p-4 rounded max-h-[600px] overflow-auto">Loading text content...</pre>
      </div>
    </div>
    
    <!-- Unsupported Format -->
    <div v-else class="border border-gray-200 rounded-lg bg-white p-12 text-center">
      <p class="text-gray-500">Preview not available for this file type</p>
      <p class="text-sm text-gray-400 mt-2">File type: {{ fileType }}</p>
    </div>
  </div>
</template>
