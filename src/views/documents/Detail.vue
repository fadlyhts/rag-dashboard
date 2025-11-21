<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDocumentStore } from '@/stores/documents'
import { toast } from 'vue-sonner'
import { ArrowLeft, RotateCw, Trash2, Download, FileText } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import DocumentPreview from '@/components/documents/DocumentPreview.vue'
import ChunkViewer from '@/components/documents/ChunkViewer.vue'

const route = useRoute()
const router = useRouter()
const documentStore = useDocumentStore()

const deleteDialogOpen = ref(false)
const deleting = ref(false)
const reindexing = ref(false)

const documentId = computed(() => Number(route.params.id))

onMounted(async () => {
  await loadDocument()
  await loadChunks()
})

const loadDocument = async () => {
  try {
    await documentStore.getDocumentById(documentId.value)
  } catch (error) {
    toast.error('Failed to load document')
    router.push({ name: 'documents' })
  }
}

const loadChunks = async () => {
  try {
    await documentStore.getChunks(documentId.value)
  } catch (error) {
    toast.error('Failed to load chunks')
  }
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800'
    case 'processing':
      return 'bg-blue-100 text-blue-800'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'failed':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const handleReindex = async () => {
  reindexing.value = true
  try {
    await documentStore.reindexDocument(documentId.value)
    toast.success('Document reindexing started')
    await loadDocument()
  } catch (error) {
    toast.error('Failed to reindex document')
  } finally {
    reindexing.value = false
  }
}

const confirmDelete = () => {
  deleteDialogOpen.value = true
}

const handleDelete = async () => {
  deleting.value = true
  try {
    await documentStore.deleteDocument(documentId.value)
    toast.success('Document deleted successfully')
    router.push({ name: 'documents' })
  } catch (error) {
    toast.error('Failed to delete document')
    deleting.value = false
  }
}

const goBack = () => {
  router.push({ name: 'documents' })
}

const document = computed(() => documentStore.currentDocument)
const chunks = computed(() => documentStore.chunks)
</script>

<template>
  <div class="max-w-6xl mx-auto space-y-6">
    <!-- Header -->
    <div class="flex items-center gap-4">
      <Button variant="ghost" size="icon" @click="goBack">
        <ArrowLeft class="w-5 h-5" />
      </Button>
      <div class="flex-1">
        <h1 class="text-3xl font-bold text-gray-900">Document Details</h1>
        <p class="text-gray-500 mt-1">View and manage document information</p>
      </div>
    </div>
    
    <div v-if="documentStore.loading && !document" class="text-center py-12">
      <p class="text-gray-500">Loading document...</p>
    </div>
    
    <template v-else-if="document">
      <!-- Document Info Card -->
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <div class="flex items-start justify-between">
          <div class="flex items-start gap-4 flex-1">
            <div class="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
              <FileText class="w-6 h-6 text-gray-600" />
            </div>
            <div class="flex-1">
              <h2 class="text-2xl font-bold text-gray-900">{{ document.title }}</h2>
              <div class="flex items-center gap-4 mt-3 text-sm text-gray-600">
                <span>{{ document.file_type.toUpperCase() }}</span>
                <span>•</span>
                <span>{{ formatFileSize(document.file_size) }}</span>
                <span>•</span>
                <span>Uploaded {{ formatDate(document.upload_date) }}</span>
              </div>
              <div class="mt-3">
                <Badge :class="getStatusColor(document.status)">
                  {{ document.status }}
                </Badge>
              </div>
            </div>
          </div>
          
          <!-- Actions -->
          <div class="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              @click="handleReindex"
              :disabled="reindexing || document.status === 'processing'"
            >
              <RotateCw class="w-4 h-4 mr-2" :class="{ 'animate-spin': reindexing }" />
              {{ reindexing ? 'Reindexing...' : 'Reindex' }}
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              class="text-red-600 hover:text-red-700 hover:bg-red-50"
              @click="confirmDelete"
            >
              <Trash2 class="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
        
        <Separator class="my-6" />
        
        <!-- Stats -->
        <div class="grid grid-cols-3 gap-4">
          <div>
            <p class="text-sm text-gray-600">Total Chunks</p>
            <p class="text-2xl font-bold text-gray-900 mt-1">
              {{ document.chunks_count || chunks.length }}
            </p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Category</p>
            <p class="text-lg font-semibold text-gray-900 mt-1">
              {{ document.category || 'Uncategorized' }}
            </p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Document ID</p>
            <p class="text-lg font-mono text-gray-900 mt-1">#{{ document.id }}</p>
          </div>
        </div>
      </div>
      
      <!-- Tabs for Preview and Chunks -->
      <Tabs default-value="preview" class="w-full">
        <TabsList class="grid w-full grid-cols-2">
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="chunks">
            Chunks ({{ chunks.length }})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="preview" class="mt-6">
          <DocumentPreview 
            :file-url="`/api/documents/${document.id}/download`"
            :file-type="document.file_type"
            :title="document.title"
          />
        </TabsContent>
        
        <TabsContent value="chunks" class="mt-6">
          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <ChunkViewer 
              :chunks="chunks"
              :loading="documentStore.loading"
            />
          </div>
        </TabsContent>
      </Tabs>
    </template>
    
    <!-- Delete Confirmation Dialog -->
    <Dialog v-model:open="deleteDialogOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Document</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{{ document?.title }}"? This action cannot be undone and will remove all associated chunks from the vector database.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" @click="deleteDialogOpen = false" :disabled="deleting">
            Cancel
          </Button>
          <Button variant="destructive" @click="handleDelete" :disabled="deleting">
            {{ deleting ? 'Deleting...' : 'Delete' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
