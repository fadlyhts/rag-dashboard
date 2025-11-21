<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDocumentStore } from '@/stores/documents'
import { toast } from 'vue-sonner'
import { ArrowLeft, X, FileText, CheckCircle, AlertCircle } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import FileUpload from '@/components/documents/FileUpload.vue'
import api from '@/services/api'

const router = useRouter()
const documentStore = useDocumentStore()

interface FileWithMetadata {
  file: File
  title: string
  categoryId: number | null
}

const selectedFiles = ref<FileWithMetadata[]>([])
const categories = ref<any[]>([])
const loadingCategories = ref(false)

onMounted(async () => {
  await loadCategories()
})

const loadCategories = async () => {
  loadingCategories.value = true
  try {
    const { data } = await api.get('/api/documents/categories')
    categories.value = data
  } catch (error) {
    console.error('Failed to load categories:', error)
  } finally {
    loadingCategories.value = false
  }
}

const handleFilesSelected = (files: File[]) => {
  const filesWithMetadata = files.map(file => ({
    file,
    title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension for default title
    categoryId: null // Default to no category
  }))
  selectedFiles.value = [...selectedFiles.value, ...filesWithMetadata]
}

const removeFile = (index: number) => {
  selectedFiles.value.splice(index, 1)
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const handleUpload = async () => {
  if (selectedFiles.value.length === 0) return
  
  try {
    // Upload files with metadata
    for (const fileData of selectedFiles.value) {
      const formData = new FormData()
      formData.append('file', fileData.file)
      
      const params = new URLSearchParams()
      if (fileData.title) params.append('title', fileData.title)
      if (fileData.categoryId) params.append('category_id', String(fileData.categoryId))
      params.append('content_type', 'document')
      
      try {
        await api.post(`/api/documents/upload?${params.toString()}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent: any) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            // Update progress
            const existingProgress = documentStore.uploadProgress.find(p => p.filename === fileData.file.name)
            if (existingProgress) {
              existingProgress.progress = percentCompleted
            } else {
              documentStore.uploadProgress.push({
                filename: fileData.file.name,
                progress: percentCompleted,
                status: 'uploading'
              })
            }
          }
        })
        
        // Mark as success
        const progressItem = documentStore.uploadProgress.find(p => p.filename === fileData.file.name)
        if (progressItem) {
          progressItem.status = 'success'
          progressItem.progress = 100
        }
      } catch (error: any) {
        // Mark as error
        const progressItem = documentStore.uploadProgress.find(p => p.filename === fileData.file.name)
        if (progressItem) {
          progressItem.status = 'error'
          progressItem.error = error.response?.data?.detail || 'Upload failed'
        }
      }
    }
    
    const allSuccess = documentStore.uploadProgress.every(p => p.status === 'success')
    
    if (allSuccess) {
      toast.success('All documents uploaded successfully')
      setTimeout(() => {
        router.push({ name: 'documents' })
      }, 1500)
    } else {
      toast.error('Some documents failed to upload')
    }
  } catch (error) {
    toast.error('Upload failed')
  }
}

const goBack = () => {
  router.push({ name: 'documents' })
}

const getFileIcon = (filename: string) => {
  return FileText
}

const getProgressItem = (filename: string) => {
  return documentStore.uploadProgress.find(p => p.filename === filename)
}

const updateFileTitle = (index: number, title: string) => {
  selectedFiles.value[index].title = title
}

const updateFileCategory = (index: number, categoryId: string) => {
  selectedFiles.value[index].categoryId = (categoryId && categoryId !== 'none') ? parseInt(categoryId) : null
}
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Header -->
    <div class="flex items-center gap-4">
      <Button variant="ghost" size="icon" @click="goBack">
        <ArrowLeft class="w-5 h-5" />
      </Button>
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Upload Documents</h1>
        <p class="text-gray-500 mt-1">Add new documents to your library</p>
      </div>
    </div>
    
    <!-- Upload Area -->
    <div class="bg-white p-6 rounded-lg border border-gray-200">
      <FileUpload 
        @files-selected="handleFilesSelected"
      />
    </div>
    
    <!-- Selected Files -->
    <div v-if="selectedFiles.length > 0" class="bg-white p-6 rounded-lg border border-gray-200">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900">
          Selected Files ({{ selectedFiles.length }})
        </h3>
        <Button 
          v-if="!documentStore.uploading"
          variant="outline" 
          size="sm"
          @click="selectedFiles = []"
        >
          Clear All
        </Button>
      </div>
      
      <div class="space-y-4">
        <div 
          v-for="(fileData, index) in selectedFiles" 
          :key="index"
          class="p-4 rounded-lg border border-gray-200 space-y-3"
        >
          <div class="flex items-start gap-4">
            <component 
              :is="getFileIcon(fileData.file.name)" 
              class="w-10 h-10 text-gray-400 flex-shrink-0 mt-1" 
            />
            
            <div class="flex-1 min-w-0 space-y-3">
              <div>
                <p class="font-medium text-gray-900 truncate">{{ fileData.file.name }}</p>
                <p class="text-sm text-gray-500">{{ formatFileSize(fileData.file.size) }}</p>
              </div>
              
              <!-- Title Input -->
              <div v-if="!documentStore.uploading">
                <label class="text-sm font-medium text-gray-700 mb-1 block">
                  Document Title
                </label>
                <Input
                  :model-value="fileData.title"
                  @update:model-value="(val: string) => updateFileTitle(index, val)"
                  placeholder="Enter document title"
                  class="w-full"
                />
              </div>
              
              <!-- Category Selection -->
              <div v-if="!documentStore.uploading && categories.length > 0">
                <label class="text-sm font-medium text-gray-700 mb-1 block">
                  Category
                </label>
                <Select 
                  :model-value="fileData.categoryId ? String(fileData.categoryId) : 'none'"
                  @update:model-value="(val: any) => updateFileCategory(index, val)"
                >
                  <SelectTrigger class="w-full">
                    <SelectValue placeholder="Select category (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Category</SelectItem>
                    <SelectItem 
                      v-for="category in categories" 
                      :key="category.id" 
                      :value="String(category.id)"
                    >
                      {{ category.name }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <!-- Progress Bar -->
              <div v-if="getProgressItem(fileData.file.name)">
                <div class="flex items-center justify-between text-sm mb-1">
                  <span 
                    :class="{
                      'text-blue-600': getProgressItem(fileData.file.name)?.status === 'uploading',
                      'text-green-600': getProgressItem(fileData.file.name)?.status === 'success',
                      'text-red-600': getProgressItem(fileData.file.name)?.status === 'error'
                    }"
                  >
                    {{ getProgressItem(fileData.file.name)?.status === 'uploading' ? 'Uploading...' : 
                       getProgressItem(fileData.file.name)?.status === 'success' ? 'Completed' : 
                       getProgressItem(fileData.file.name)?.error }}
                  </span>
                  <span class="text-gray-600">
                    {{ getProgressItem(fileData.file.name)?.progress }}%
                  </span>
                </div>
                <Progress 
                  :model-value="getProgressItem(fileData.file.name)?.progress" 
                  :class="{
                    '[&>div]:bg-blue-600': getProgressItem(fileData.file.name)?.status === 'uploading',
                    '[&>div]:bg-green-600': getProgressItem(fileData.file.name)?.status === 'success',
                    '[&>div]:bg-red-600': getProgressItem(fileData.file.name)?.status === 'error'
                  }"
                />
              </div>
            </div>
            
            <!-- Status Icon or Remove Button -->
            <div class="flex-shrink-0">
              <CheckCircle 
                v-if="getProgressItem(fileData.file.name)?.status === 'success'" 
                class="w-6 h-6 text-green-600" 
              />
              <AlertCircle 
                v-else-if="getProgressItem(fileData.file.name)?.status === 'error'" 
                class="w-6 h-6 text-red-600" 
              />
              <Button 
                v-else
                variant="ghost" 
                size="icon"
                @click="removeFile(index)"
                :disabled="documentStore.uploading"
              >
                <X class="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Upload Button -->
      <div class="mt-6 flex items-center justify-between">
        <p class="text-sm text-gray-600">
          {{ selectedFiles.length }} file{{ selectedFiles.length !== 1 ? 's' : '' }} ready to upload
        </p>
        <Button 
          @click="handleUpload"
          :disabled="documentStore.uploading || selectedFiles.length === 0"
          class="bg-[#25D366] hover:bg-[#1fb855]"
        >
          {{ documentStore.uploading ? 'Uploading...' : 'Upload All' }}
        </Button>
      </div>
    </div>
    
    <!-- Instructions -->
    <div class="bg-blue-50 p-6 rounded-lg border border-blue-200">
      <h3 class="font-semibold text-blue-900 mb-2">Upload Instructions</h3>
      <ul class="text-sm text-blue-800 space-y-2">
        <li>• Documents will be automatically processed and indexed</li>
        <li>• Processing time depends on document size and complexity</li>
        <li>• You can continue working while documents are being processed</li>
        <li>• Check the Documents page to monitor processing status</li>
      </ul>
    </div>
  </div>
</template>
