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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Label } from '@/components/ui/label'
import DeleteConfirmDialog from '@/components/shared/DeleteConfirmDialog.vue'
import DocumentTable from '@/components/documents/DocumentTable.vue'
import { documentsService } from '@/services/documents.service'
import { useAuthStore } from '@/stores/auth'
import { computed } from 'vue'

const router = useRouter()
const documentStore = useDocumentStore()
const authStore = useAuthStore()

const isSuperAdmin = computed(() => authStore.user?.role === 'super_admin')

const searchQuery = ref('')
const statusFilter = ref('all')
const categoryFilter = ref('all')
const divisionFilter = ref('all')
const deleteDialogOpen = ref(false)
const documentToDelete = ref<number | null>(null)
const deleting = ref(false)
const limitFilter = ref('20')

const loadDocuments = async () => {
  try {
    await documentStore.fetchDocuments({
      search: searchQuery.value || undefined,
      status: statusFilter.value !== 'all' ? statusFilter.value : undefined,
      category: categoryFilter.value !== 'all' ? Number(categoryFilter.value) : undefined,
      division: divisionFilter.value !== 'all' ? Number(divisionFilter.value) : undefined,
      limit: limitFilter.value === 'all' ? 1000 : Number(limitFilter.value)
    })
  } catch (error) {
    toast.error('Failed to load documents')
  }
}

const handleSearch = () => {
  loadDocuments()
}

const handleFilterChange = (filter: string, value: string) => {
  if (filter === 'status') statusFilter.value = value
  if (filter === 'category') categoryFilter.value = value
  if (filter === 'division') divisionFilter.value = value
  if (filter === 'limit') limitFilter.value = value
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

// Category CRUD State
const categories = ref<any[]>([])
const loadingCategories = ref(false)
const categoryDialogOpen = ref(false)
const savingCategory = ref(false)
const isEditingCategory = ref(false)
const currentCategory = ref({ id: 0, name: '', description: '' })
const deleteCategoryDialogOpen = ref(false)
const categoryToDelete = ref<number | null>(null)

const loadCategories = async () => {
  loadingCategories.value = true
  try {
    const { data } = await documentsService.getCategories()
    categories.value = data
  } catch (error) {
    toast.error('Failed to load categories')
  } finally {
    loadingCategories.value = false
  }
}

const divisions = ref<any[]>([])
const loadDivisions = async () => {
  try {
    const { data } = await documentsService.getDivisions()
    divisions.value = data
  } catch (error) {
    console.error('Failed to load divisions:', error)
  }
}

const handleAddCategory = () => {
  isEditingCategory.value = false
  currentCategory.value = { id: 0, name: '', description: '' }
  categoryDialogOpen.value = true
}

const handleEditCategory = (cat: any) => {
  isEditingCategory.value = true
  currentCategory.value = { ...cat }
  categoryDialogOpen.value = true
}

const saveCategory = async () => {
  if (!currentCategory.value.name) return toast.error('Name is required')
  
  savingCategory.value = true
  try {
    if (isEditingCategory.value) {
      await documentsService.updateCategory(currentCategory.value.id, {
        name: currentCategory.value.name,
        description: currentCategory.value.description
      })
      toast.success('Category updated')
    } else {
      await documentsService.createCategory({
        name: currentCategory.value.name,
        description: currentCategory.value.description
      })
      toast.success('Category created')
    }
    categoryDialogOpen.value = false
    loadCategories()
  } catch (error: any) {
    toast.error(error.response?.data?.detail || 'Failed to save category')
  } finally {
    savingCategory.value = false
  }
}

const confirmDeleteCategory = (id: number) => {
  categoryToDelete.value = id
  const cat = categories.value.find(c => c.id === id)
  if (cat) {
    currentCategory.value = { ...cat }
  }
  deleteCategoryDialogOpen.value = true
}

const handleDeleteCategory = async () => {
  if (!categoryToDelete.value) return
  
  deleting.value = true
  try {
    await documentsService.deleteCategory(categoryToDelete.value)
    toast.success('Category deleted')
    deleteCategoryDialogOpen.value = false
    loadCategories()
  } catch (error) {
    toast.error('Failed to delete category')
  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  loadDocuments()
  loadCategories()
  if (isSuperAdmin.value) {
    loadDivisions()
  }
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">
          {{ isSuperAdmin ? 'Documents & Categories' : 'Documents' }}
        </h1>
        <p class="text-gray-500 mt-1">
          {{ isSuperAdmin ? 'Manage your document library and categories' : 'Manage your document library' }}
        </p>
      </div>
    </div>
    
    <Tabs defaultValue="documents" class="space-y-6">
      <TabsList v-if="isSuperAdmin">
        <TabsTrigger value="documents">Documents</TabsTrigger>
        <TabsTrigger v-if="isSuperAdmin" value="categories">Categories</TabsTrigger>
      </TabsList>
      
      <!-- DOCUMENTS TAB -->
      <TabsContent value="documents" class="space-y-6">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-bold">Document List</h2>
          <Button @click="handleUpload" class="bg-[#128C7E] hover:bg-[#075E54] text-white">
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
      
      <Select :model-value="statusFilter" @update:model-value="(val: any) => handleFilterChange('status', val)">
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
      
      <Select v-if="isSuperAdmin" :model-value="divisionFilter" @update:model-value="(val: any) => handleFilterChange('division', val)">
        <SelectTrigger class="w-[180px]">
          <Filter class="w-4 h-4 mr-2" />
          <SelectValue placeholder="Filter by division" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Divisions</SelectItem>
          <SelectItem v-for="div in divisions" :key="div.id" :value="div.id.toString()">
            {{ div.name }}
          </SelectItem>
        </SelectContent>
      </Select>
      
      <Select v-if="isSuperAdmin" :model-value="categoryFilter" @update:model-value="(val: any) => handleFilterChange('category', val)">
        <SelectTrigger class="w-[180px]">
          <Filter class="w-4 h-4 mr-2" />
          <SelectValue placeholder="Filter by category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          <SelectItem v-for="cat in categories" :key="cat.id" :value="cat.id.toString()">
            {{ cat.name }}
          </SelectItem>
        </SelectContent>
      </Select>
      
      <Select :model-value="limitFilter" @update:model-value="(val: any) => handleFilterChange('limit', val)">
        <SelectTrigger class="w-[140px]">
          <Filter class="w-4 h-4 mr-2" />
          <SelectValue placeholder="Items per page" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="10">10 items</SelectItem>
          <SelectItem value="20">20 items</SelectItem>
          <SelectItem value="50">50 items</SelectItem>
          <SelectItem value="100">100 items</SelectItem>
          <SelectItem value="all">All items</SelectItem>
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
    <div class="bg-white rounded-lg border border-gray-200 min-h-[500px]">
      <DocumentTable
        :documents="documentStore.documents"
        :loading="documentStore.loading"
        @view="handleView"
        @reindex="handleReindex"
        @delete="confirmDelete"
      />
    </div>
    </TabsContent>
    
    <!-- CATEGORIES TAB -->
    <TabsContent v-if="isSuperAdmin" value="categories" class="space-y-6">
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-bold">Document Categories</h2>
        <Button @click="handleAddCategory" class="bg-[#128C7E] hover:bg-[#075E54] text-white">
          <Plus class="w-4 h-4 mr-2" /> Add Category
        </Button>
      </div>
      
      <div class="bg-white rounded-lg border border-gray-200 min-h-[500px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead class="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-if="categories.length === 0">
              <TableCell colspan="3" class="text-center py-8 text-gray-500">
                No categories found. Create one to organize documents.
              </TableCell>
            </TableRow>
            <TableRow v-for="cat in categories" :key="cat.id">
              <TableCell class="font-medium">{{ cat.name }}</TableCell>
              <TableCell>{{ cat.description || '-' }}</TableCell>
              <TableCell class="text-right">
                <Button variant="ghost" size="sm" @click="handleEditCategory(cat)">
                  Edit
                </Button>
                <Button variant="ghost" size="sm" class="text-red-500 hover:text-red-700" @click="confirmDeleteCategory(cat.id)">
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </TabsContent>
  </Tabs>
    
    <DeleteConfirmDialog
      v-model:open="deleteDialogOpen"
      title="Delete Document"
      :item-name="documentStore.documents?.find(d => d.id === documentToDelete)?.title"
      :loading="deleting"
      @confirm="handleDelete"
    />

    <!-- Category Form Dialog -->
    <Dialog v-model:open="categoryDialogOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{{ isEditingCategory ? 'Edit Category' : 'Add Category' }}</DialogTitle>
        </DialogHeader>
        <div class="space-y-4 py-4">
          <div class="space-y-2">
            <Label for="cat-name">Category Name <span class="text-red-500">*</span></Label>
            <Input id="cat-name" v-model="currentCategory.name" placeholder="e.g. SOP" />
          </div>
          <div class="space-y-2">
            <Label for="cat-desc">Description</Label>
            <Input id="cat-desc" v-model="currentCategory.description" placeholder="Optional description" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="categoryDialogOpen = false" :disabled="savingCategory">Cancel</Button>
          <Button @click="saveCategory" :disabled="savingCategory || !currentCategory.name">
            {{ savingCategory ? 'Saving...' : 'Save Category' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <DeleteConfirmDialog
      v-model:open="deleteCategoryDialogOpen"
      title="Delete Category"
      :item-name="currentCategory.name"
      description="Associated documents will not be deleted but will lose their category association."
      :loading="deleting"
      @confirm="handleDeleteCategory"
    />
  </div>
</template>
