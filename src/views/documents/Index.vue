<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDocumentStore } from '@/stores/documents'
import { toast } from 'vue-sonner'
import { Plus, Search, Filter } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import DocumentTable from '@/components/documents/DocumentTable.vue'

const router = useRouter()
const documentStore = useDocumentStore()

const searchQuery = ref('')
const statusFilter = ref('all')
const deleteDialogOpen = ref(false)
const documentToDelete = ref<number | null>(null)
const deleting = ref(false)

onMounted(() => {
  loadDocuments()
})

const loadDocuments = async () => {
  try {
    await documentStore.fetchDocuments({
      search: searchQuery.value || undefined,
      status: statusFilter.value !== 'all' ? statusFilter.value : undefined
    })
  } catch (error) {
    toast.error('Failed to load documents')
  }
}

const handleSearch = () => {
  loadDocuments()
}

const handleFilterChange = (value: string) => {
  statusFilter.value = value
  loadDocuments()
}

const handleView = (id: number) => {
  router.push({ name: 'documents-detail', params: { id } })
}

const handleReindex = async (id: number) => {
  try {
    await documentStore.reindexDocument(id)
    toast.success('Document reindexing started')
  } catch (error) {
    toast.error('Failed to reindex document')
  }
}

const confirmDelete = (id: number) => {
  documentToDelete.value = id
  deleteDialogOpen.value = true
}

const handleDelete = async () => {
  if (!documentToDelete.value) return
  
  deleting.value = true
  try {
    await documentStore.deleteDocument(documentToDelete.value)
    toast.success('Document deleted successfully')
    deleteDialogOpen.value = false
    documentToDelete.value = null
  } catch (error) {
    toast.error('Failed to delete document')
  } finally {
    deleting.value = false
  }
}

const handleUpload = () => {
  router.push({ name: 'documents-upload' })
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Documents</h1>
        <p class="text-gray-500 mt-1">Manage your document library</p>
      </div>
      <Button @click="handleUpload" class="bg-[#25D366] hover:bg-[#1fb855]">
        <Plus class="w-4 h-4 mr-2" />
        Upload Document
      </Button>
    </div>
    
    <!-- Filters -->
    <div class="flex items-center gap-4">
      <div class="relative flex-1 max-w-sm">
        <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          v-model="searchQuery"
          placeholder="Search documents..."
          class="pl-10"
          @keyup.enter="handleSearch"
        />
      </div>
      
      <Select :model-value="statusFilter" @update:model-value="(val: any) => handleFilterChange(val)">
        <SelectTrigger class="w-[180px]">
          <Filter class="w-4 h-4 mr-2" />
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="processing">Processing</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="failed">Failed</SelectItem>
        </SelectContent>
      </Select>
      
      <Button variant="outline" @click="loadDocuments">
        Refresh
      </Button>
    </div>
    
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-white p-6 rounded-lg border border-gray-200">
        <p class="text-sm text-gray-600">Total Documents</p>
        <p class="text-2xl font-bold text-gray-900 mt-2">{{ documentStore.total }}</p>
      </div>
      <div class="bg-white p-6 rounded-lg border border-gray-200">
        <p class="text-sm text-gray-600">Completed</p>
        <p class="text-2xl font-bold text-green-600 mt-2">
          {{ documentStore.documents?.filter(d => d.status === 'completed').length || 0 }}
        </p>
      </div>
      <div class="bg-white p-6 rounded-lg border border-gray-200">
        <p class="text-sm text-gray-600">Processing</p>
        <p class="text-2xl font-bold text-blue-600 mt-2">
          {{ documentStore.documents?.filter(d => d.status === 'processing').length || 0 }}
        </p>
      </div>
      <div class="bg-white p-6 rounded-lg border border-gray-200">
        <p class="text-sm text-gray-600">Failed</p>
        <p class="text-2xl font-bold text-red-600 mt-2">
          {{ documentStore.documents?.filter(d => d.status === 'failed').length || 0 }}
        </p>
      </div>
    </div>
    
    <!-- Documents Table -->
    <div class="bg-white rounded-lg border border-gray-200">
      <DocumentTable
        :documents="documentStore.documents"
        :loading="documentStore.loading"
        @view="handleView"
        @reindex="handleReindex"
        @delete="confirmDelete"
      />
    </div>
    
    <!-- Delete Confirmation Dialog -->
    <Dialog v-model:open="deleteDialogOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Document</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this document? This action cannot be undone.
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
