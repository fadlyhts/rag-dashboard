<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { toast } from 'vue-sonner'
import { adminsService, type Admin, type AdminCreate, type AdminUpdate } from '@/services/admins.service'
import { format } from 'date-fns'
import { Users as UsersIcon, Plus, Edit, Trash2, Key } from 'lucide-vue-next'
import api from '@/services/api'
import { useAuthStore } from '@/stores/auth'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import DeleteConfirmDialog from '@/components/shared/DeleteConfirmDialog.vue'

import LoadingSpinner from '@/components/shared/LoadingSpinner.vue'
import EmptyState from '@/components/shared/EmptyState.vue'

const admins = ref<Admin[]>([])
const loading = ref(false)
const divisions = ref<any[]>([])

const authStore = useAuthStore()

// Dialog State
const isDialogOpen = ref(false)
const isEditing = ref(false)
const saving = ref(false)

const currentAdminId = ref<number | null>(null)
const formData = ref({
  username: '',
  email: '',
  password: '',
  role: 'admin',
  division_id: 'none' as string | null,
  is_active: true
})

onMounted(() => {
  loadAdmins()
  loadDivisions()
})

const activeTab = ref('staff')

// Division state
const isDivisionDialogOpen = ref(false)
const divisionFormData = ref({ id: null as number | null, name: '' })
const savingDivision = ref(false)

const openCreateDivisionDialog = () => {
  divisionFormData.value = { id: null, name: '' }
  isDivisionDialogOpen.value = true
}

const openEditDivisionDialog = (div: any) => {
  divisionFormData.value = { id: div.id, name: div.name }
  isDivisionDialogOpen.value = true
}

const saveDivision = async () => {
  if (!divisionFormData.value.name) {
    toast.error('Division name is required')
    return
  }
  savingDivision.value = true
  try {
    if (divisionFormData.value.id) {
      await api.put(`/api/documents/divisions/${divisionFormData.value.id}`, { name: divisionFormData.value.name })
      toast.success('Division updated')
    } else {
      await api.post('/api/documents/divisions', { name: divisionFormData.value.name })
      toast.success('Division created')
    }
    isDivisionDialogOpen.value = false
    loadDivisions()
  } catch (error: any) {
    toast.error(error.response?.data?.detail || 'Failed to save division')
  } finally {
    savingDivision.value = false
  }
}

const deleteDivisionDialogOpen = ref(false)
const divisionToDelete = ref<any>(null)
const deletingDivision = ref(false)

const confirmDeleteDivision = (div: any) => {
  divisionToDelete.value = div
  deleteDivisionDialogOpen.value = true
}

const handleDeleteDivision = async () => {
  if (!divisionToDelete.value) return
  deletingDivision.value = true
  try {
    await api.delete(`/api/documents/divisions/${divisionToDelete.value.id}`)
    toast.success('Division deleted')
    deleteDivisionDialogOpen.value = false
    loadDivisions()
  } catch (error: any) {
    toast.error(error.response?.data?.detail || 'Failed to delete division')
  } finally {
    deletingDivision.value = false
  }
}

const loadDivisions = async () => {
  try {
    const { data } = await api.get('/api/documents/divisions')
    divisions.value = data
  } catch (error) {
    console.error('Failed to load divisions:', error)
  }
}

const loadAdmins = async () => {
  loading.value = true
  try {
    admins.value = await adminsService.getAdmins()
  } catch (error: any) {
    toast.error(error.response?.data?.detail || 'Failed to load admins')
  } finally {
    loading.value = false
  }
}

const openCreateDialog = () => {
  isEditing.value = false
  currentAdminId.value = null
  formData.value = {
    username: '',
    email: '',
    password: '',
    role: 'admin',
    division_id: 'none',
    is_active: true
  }
  isDialogOpen.value = true
}

const openEditDialog = (admin: Admin) => {
  isEditing.value = true
  currentAdminId.value = admin.id
  formData.value = {
    username: admin.username,
    email: admin.email || '',
    password: '', // Empty password means don't change
    role: admin.role,
    division_id: admin.division_id ? String(admin.division_id) : 'none',
    is_active: admin.is_active
  }
  isDialogOpen.value = true
}

const saveAdmin = async () => {
  if (!formData.value.username) {
    toast.error("Username is required")
    return
  }
  if (!isEditing.value && !formData.value.password) {
    toast.error("Password is required for new accounts")
    return
  }

  saving.value = true
  try {
    const divId = formData.value.division_id === 'none' ? null : parseInt(formData.value.division_id!)
    
    if (isEditing.value && currentAdminId.value) {
      const payload: AdminUpdate = {
        email: formData.value.email || undefined,
        role: formData.value.role,
        division_id: divId,
        is_active: formData.value.is_active
      }
      if (formData.value.password) {
        payload.password = formData.value.password
      }
      await adminsService.updateAdmin(currentAdminId.value, payload)
      toast.success("Admin updated successfully")
    } else {
      const payload: AdminCreate = {
        username: formData.value.username,
        password: formData.value.password,
        email: formData.value.email || undefined,
        role: formData.value.role,
        division_id: divId
      }
      await adminsService.createAdmin(payload)
      toast.success("Admin created successfully")
    }
    
    isDialogOpen.value = false
    loadAdmins()
  } catch (error: any) {
    toast.error(error.response?.data?.detail || 'Failed to save admin')
  } finally {
    saving.value = false
  }
}

const deleteStaffDialogOpen = ref(false)
const staffToDelete = ref<Admin | null>(null)
const deletingStaff = ref(false)

const confirmDelete = (admin: Admin) => {
  if (admin.id === authStore.user?.id) {
    toast.error("You cannot delete your own account")
    return
  }
  staffToDelete.value = admin
  deleteStaffDialogOpen.value = true
}

const handleDeleteStaff = async () => {
  if (!staffToDelete.value) return
  deletingStaff.value = true
  try {
    await adminsService.deleteAdmin(staffToDelete.value.id)
    toast.success("Admin deleted")
    deleteStaffDialogOpen.value = false
    loadAdmins()
  } catch (error: any) {
    toast.error(error.response?.data?.detail || 'Failed to delete admin')
  } finally {
    deletingStaff.value = false
  }
}

const toggleStatus = async (admin: Admin) => {
  if (admin.id === authStore.user?.id) {
    toast.error("You cannot deactivate your own account")
    return
  }
  try {
    await adminsService.updateAdmin(admin.id, { is_active: !admin.is_active })
    admin.is_active = !admin.is_active
    toast.success(`Account ${admin.is_active ? 'activated' : 'deactivated'}`)
  } catch (error: any) {
    toast.error('Failed to change status')
  }
}

const getDivisionName = (id: number | null) => {
  if (!id) return 'General / All Divisions'
  const div = divisions.value.find(d => d.id === id)
  return div ? div.name : 'Unknown'
}

</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 tracking-tight">Staff Management</h1>
        <p class="text-gray-500 mt-1">Manage dashboard users and their division assignments</p>
      </div>
    </div>
    
    <Tabs v-model="activeTab" class="w-full mt-6">
      <TabsList>
        <TabsTrigger value="staff">Staff Accounts</TabsTrigger>
        <TabsTrigger value="divisions">Divisions</TabsTrigger>
      </TabsList>
      
      <TabsContent value="staff" class="mt-4">
        <div class="mb-4 flex justify-end">
          <Button @click="openCreateDialog" class="bg-[#128C7E] hover:bg-[#075E54] text-white gap-2">
            <Plus class="w-4 h-4" />
            Add Staff
          </Button>
        </div>
        
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <LoadingSpinner v-if="loading" class="py-12" />
          
          <EmptyState
            v-else-if="admins.length === 0"
            icon="Users"
            title="No Staff Found"
            description="There are no staff accounts registered yet."
          >
            <template #action>
              <Button @click="openCreateDialog" class="bg-[#128C7E] hover:bg-[#075E54] text-white">Add Staff</Button>
            </template>
          </EmptyState>

          <div v-else class="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Division</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead class="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="admin in admins" :key="admin.id">
                  <TableCell>
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <UsersIcon class="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p class="font-medium text-gray-900">{{ admin.username }}</p>
                        <p class="text-xs text-gray-500">{{ admin.email || 'No email' }}</p>
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <Badge :variant="admin.role === 'super_admin' ? 'default' : 'secondary'">
                      {{ admin.role.replace('_', ' ').toUpperCase() }}
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
                    <span class="text-sm text-gray-600">{{ getDivisionName(admin.division_id) }}</span>
                  </TableCell>
                  
                  <TableCell>
                    <Switch 
                      :checked="admin.is_active" 
                      @update:checked="toggleStatus(admin)"
                      :disabled="admin.id === authStore.user?.id"
                    />
                  </TableCell>
                  
                  <TableCell>
                    <span class="text-sm text-gray-500">
                      {{ format(new Date(admin.created_at), 'MMM d, yyyy') }}
                    </span>
                  </TableCell>
                  
                  <TableCell class="text-right">
                    <div class="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" @click="openEditDialog(admin)">
                        <Edit class="w-4 h-4 text-gray-500" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        @click="confirmDelete(admin)"
                        :disabled="admin.id === authStore.user?.id"
                      >
                        <Trash2 class="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="divisions" class="mt-4">
        <div class="mb-4 flex justify-end">
          <Button @click="openCreateDivisionDialog" class="bg-[#128C7E] hover:bg-[#075E54] text-white gap-2">
            <Plus class="w-4 h-4" />
            Add Division
          </Button>
        </div>
        
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <EmptyState
            v-if="divisions.length === 0"
            icon="Users"
            title="No Divisions Found"
            description="There are no divisions created yet."
          >
            <template #action>
              <Button @click="openCreateDivisionDialog" class="bg-[#128C7E] hover:bg-[#075E54] text-white">Add Division</Button>
            </template>
          </EmptyState>

          <div v-else class="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Division Name</TableHead>
                  <TableHead class="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="div in divisions" :key="div.id">
                  <TableCell>{{ div.id }}</TableCell>
                  <TableCell class="font-medium">{{ div.name }}</TableCell>
                  <TableCell class="text-right">
                    <div class="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" @click="openEditDivisionDialog(div)">
                        <Edit class="w-4 h-4 text-gray-500" />
                      </Button>
                      <Button variant="ghost" size="icon" @click="confirmDeleteDivision(div)">
                        <Trash2 class="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </TabsContent>
    </Tabs>

    <!-- Dialog -->
    <Dialog :open="isDialogOpen" @update:open="val => isDialogOpen = val">
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{{ isEditing ? 'Edit Staff' : 'Add New Staff' }}</DialogTitle>
        </DialogHeader>
        
        <div class="space-y-4 py-4">
          <div class="space-y-2">
            <label class="text-sm font-medium">Username</label>
            <Input v-model="formData.username" :disabled="isEditing" placeholder="johndoe" />
            <p v-if="isEditing" class="text-xs text-gray-500">Username cannot be changed.</p>
          </div>
          
          <div class="space-y-2">
            <label class="text-sm font-medium">Email (Optional)</label>
            <Input v-model="formData.email" type="email" placeholder="john@example.com" />
          </div>
          
          <div class="space-y-2">
            <label class="text-sm font-medium">Password</label>
            <Input v-model="formData.password" type="password" :placeholder="isEditing ? 'Leave blank to keep current' : 'Enter password'" />
          </div>
          
          <div class="space-y-2">
            <label class="text-sm font-medium">Role</label>
            <Select v-model="formData.role">
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin Divisi (PIC)</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div class="space-y-2">
            <label class="text-sm font-medium">Division</label>
            <Select v-model="formData.division_id">
              <SelectTrigger>
                <SelectValue placeholder="Select division" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">General / Super Admin</SelectItem>
                <SelectItem v-for="div in divisions" :key="div.id" :value="String(div.id)">
                  {{ div.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" @click="isDialogOpen = false">Cancel</Button>
          <Button @click="saveAdmin" :disabled="saving">
            {{ saving ? 'Saving...' : 'Save' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Division Dialog -->
    <Dialog :open="isDivisionDialogOpen" @update:open="val => isDivisionDialogOpen = val">
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{{ divisionFormData.id ? 'Edit Division' : 'Add New Division' }}</DialogTitle>
        </DialogHeader>
        
        <div class="space-y-4 py-4">
          <div class="space-y-2">
            <label class="text-sm font-medium">Division Name</label>
            <Input v-model="divisionFormData.name" placeholder="e.g. IT Department" />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" @click="isDivisionDialogOpen = false">Cancel</Button>
          <Button @click="saveDivision" :disabled="savingDivision">
            {{ savingDivision ? 'Saving...' : 'Save' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <DeleteConfirmDialog 
      v-model:open="deleteStaffDialogOpen"
      title="Delete Staff Account"
      :item-name="staffToDelete?.username"
      :loading="deletingStaff"
      @confirm="handleDeleteStaff"
    />

    <DeleteConfirmDialog 
      v-model:open="deleteDivisionDialogOpen"
      title="Delete Division"
      :item-name="divisionToDelete?.name"
      :loading="deletingDivision"
      @confirm="handleDeleteDivision"
    />
  </div>
</template>
