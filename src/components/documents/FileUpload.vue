<script setup lang="ts">
import { ref } from 'vue'
import { Upload, X, FileText } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'

interface Emits {
  (e: 'files-selected', files: File[]): void
  (e: 'remove-file', index: number): void
}

const emit = defineEmits<Emits>()

const isDragging = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

const allowedTypes = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/markdown',
  'text/csv'
]

const maxSize = 10 * 1024 * 1024 // 10MB

const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = true
}

const handleDragLeave = () => {
  isDragging.value = false
}

const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = false
  
  const files = Array.from(e.dataTransfer?.files || [])
  processFiles(files)
}

const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement
  const files = Array.from(target.files || [])
  processFiles(files)
  if (target) target.value = ''
}

const processFiles = (files: File[]) => {
  const validFiles = files.filter(file => {
    if (!allowedTypes.includes(file.type)) {
      return false
    }
    if (file.size > maxSize) {
      return false
    }
    return true
  })
  
  if (validFiles.length > 0) {
    emit('files-selected', validFiles)
  }
}

const openFileDialog = () => {
  fileInput.value?.click()
}

defineExpose({
  openFileDialog
})
</script>

<template>
  <div>
    <div
      class="border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer"
      :class="{
        'border-[#25D366] bg-[#25D366]/5': isDragging,
        'border-gray-300 hover:border-gray-400': !isDragging
      }"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
      @click="openFileDialog"
    >
      <div class="flex flex-col items-center justify-center space-y-4">
        <div 
          class="w-16 h-16 rounded-full flex items-center justify-center transition-colors"
          :class="{
            'bg-[#25D366] text-white': isDragging,
            'bg-gray-100 text-gray-400': !isDragging
          }"
        >
          <Upload class="w-8 h-8" />
        </div>
        
        <div>
          <p class="text-lg font-medium text-gray-900">
            {{ isDragging ? 'Drop files here' : 'Drag and drop files here' }}
          </p>
          <p class="text-sm text-gray-500 mt-1">
            or click to browse
          </p>
        </div>
        
        <div class="text-xs text-gray-500 space-y-1">
          <p>Supported formats: PDF, DOCX, TXT, MD, CSV</p>
          <p>Maximum file size: 10MB</p>
        </div>
      </div>
    </div>
    
    <input
      ref="fileInput"
      type="file"
      multiple
      accept=".pdf,.docx,.txt,.md,.csv"
      class="hidden"
      @change="handleFileSelect"
    />
  </div>
</template>
