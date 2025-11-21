<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { usersService } from '@/services/users.service'
import type { WhatsAppUser, UserDetail, UsersListParams } from '@/types/user.types'
import { format } from 'date-fns'
import { Users as UsersIcon, Download, Eye, Ban, Check } from 'lucide-vue-next'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import SearchInput from '@/components/shared/SearchInput.vue'
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue'
import EmptyState from '@/components/shared/EmptyState.vue'
import UserDetailDialog from '@/components/users/UserDetailDialog.vue'

const router = useRouter()

const users = ref<WhatsAppUser[]>([])
const total = ref(0)
const loading = ref(false)
const searchQuery = ref('')
const statusFilter = ref<'all' | 'active' | 'blocked'>('all')

const selectedUser = ref<UserDetail | null>(null)
const detailDialogOpen = ref(false)
const loadingDetail = ref(false)
const userNotes = ref('')
const savingNotes = ref(false)

const currentPage = ref(1)
const pageSize = ref(20)

const blockingUsers = ref<Set<string>>(new Set())

onMounted(() => {
  loadUsers()
})

const loadUsers = async () => {
  loading.value = true
  try {
    const params: UsersListParams = {
      page: currentPage.value,
      limit: pageSize.value,
      search: searchQuery.value || undefined,
      status: statusFilter.value !== 'all' ? statusFilter.value : undefined,
    }

    const response = await usersService.list(params)
    users.value = response.users
    total.value = response.total
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Failed to load users')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  loadUsers()
}

const handleStatusChange = (value: string | number | null | undefined) => {
  if (value && typeof value === 'string') {
    statusFilter.value = value as 'all' | 'active' | 'blocked'
    currentPage.value = 1
    loadUsers()
  }
}

const toggleBlockUser = async (user: WhatsAppUser) => {
  blockingUsers.value.add(user.id)
  try {
    if (user.status === 'active') {
      await usersService.block(user.id)
      toast.success('User blocked successfully')
    } else {
      await usersService.unblock(user.id)
      toast.success('User unblocked successfully')
    }
    loadUsers()
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Failed to update user status')
  } finally {
    blockingUsers.value.delete(user.id)
  }
}

const viewUserDetail = async (id: string) => {
  loadingDetail.value = true
  detailDialogOpen.value = true
  try {
    const response = await usersService.getById(id)
    selectedUser.value = response.user
    userNotes.value = response.user.notes || ''
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Failed to load user details')
    detailDialogOpen.value = false
  } finally {
    loadingDetail.value = false
  }
}

const saveNotes = async () => {
  if (!selectedUser.value) return

  savingNotes.value = true
  try {
    await usersService.updateNotes(selectedUser.value.id, userNotes.value)
    toast.success('Notes saved successfully')
    if (selectedUser.value) {
      selectedUser.value.notes = userNotes.value
    }
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Failed to save notes')
  } finally {
    savingNotes.value = false
  }
}

const viewConversations = (phone: string) => {
  router.push({ name: 'conversations', query: { search: phone } })
}

const exportData = async (format: 'csv' | 'json') => {
  try {
    const blob = await usersService.exportData(format, {
      search: searchQuery.value || undefined,
      status: statusFilter.value !== 'all' ? statusFilter.value : undefined,
    })

    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `users-${format}-${Date.now()}.${format}`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)

    toast.success(`Exported as ${format.toUpperCase()}`)
  } catch (error) {
    toast.error('Failed to export data')
  }
}

const formatDate = (date: string) => {
  return format(new Date(date), 'MMM dd, yyyy HH:mm')
}

const getStatusBadge = (status: string) => {
  return status === 'active'
    ? 'bg-green-100 text-green-800'
    : 'bg-red-100 text-red-800'
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Users Management</h1>
        <p class="text-gray-500 mt-1">Manage WhatsApp users and their access</p>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="outline">
            <Download class="w-4 h-4 mr-2" />
            Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem @click="exportData('csv')">
            Export as CSV
          </DropdownMenuItem>
          <DropdownMenuItem @click="exportData('json')">
            Export as JSON
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    <!-- Filters -->
    <div class="flex flex-col md:flex-row gap-4">
      <div class="flex-1">
        <SearchInput
          v-model="searchQuery"
          placeholder="Search by phone or name..."
          @search="handleSearch"
        />
      </div>

      <Select :model-value="statusFilter" @update:model-value="(val: any) => handleStatusChange(val)">
        <SelectTrigger class="w-[180px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="blocked">Blocked</SelectItem>
        </SelectContent>
      </Select>

      <Button variant="outline" @click="loadUsers">
        Refresh
      </Button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-white p-6 rounded-lg border border-gray-200">
        <p class="text-sm text-gray-600">Total Users</p>
        <p class="text-2xl font-bold text-gray-900 mt-2">{{ total }}</p>
      </div>
      <div class="bg-white p-6 rounded-lg border border-gray-200">
        <p class="text-sm text-gray-600">Active Users</p>
        <p class="text-2xl font-bold text-green-600 mt-2">
          {{ users.filter(u => u.status === 'active').length }}
        </p>
      </div>
      <div class="bg-white p-6 rounded-lg border border-gray-200">
        <p class="text-sm text-gray-600">Blocked Users</p>
        <p class="text-2xl font-bold text-red-600 mt-2">
          {{ users.filter(u => u.status === 'blocked').length }}
        </p>
      </div>
      <div class="bg-white p-6 rounded-lg border border-gray-200">
        <p class="text-sm text-gray-600">Total Messages</p>
        <p class="text-2xl font-bold text-blue-600 mt-2">
          {{ users.reduce((sum, u) => sum + u.messages_count, 0) }}
        </p>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-lg border border-gray-200">
      <LoadingSpinner v-if="loading" size="lg" class="py-12" />
      <EmptyState
        v-else-if="users.length === 0"
        :icon="UsersIcon"
        title="No users found"
        description="No users match your search criteria"
      />
      <Table v-else>
        <TableHeader>
          <TableRow>
            <TableHead>Phone</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Messages</TableHead>
            <TableHead>Last Active</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Block/Unblock</TableHead>
            <TableHead class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="user in users" :key="user.id">
            <TableCell class="font-mono text-sm">{{ user.phone }}</TableCell>
            <TableCell>{{ user.name || '-' }}</TableCell>
            <TableCell>{{ user.messages_count }}</TableCell>
            <TableCell class="text-sm text-gray-600">
              {{ formatDate(user.last_active) }}
            </TableCell>
            <TableCell>
              <Badge :class="getStatusBadge(user.status)">
                {{ user.status }}
              </Badge>
            </TableCell>
            <TableCell>
              <div class="flex items-center gap-2">
                <Switch
                  :checked="user.status === 'active'"
                  @update:checked="() => toggleBlockUser(user)"
                  :disabled="blockingUsers.has(user.id)"
                />
                <span class="text-sm text-gray-600">
                  {{ user.status === 'active' ? 'Active' : 'Blocked' }}
                </span>
              </div>
            </TableCell>
            <TableCell class="text-right">
              <div class="flex items-center justify-end gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  @click="viewUserDetail(user.id)"
                >
                  <Eye class="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  @click="viewConversations(user.phone)"
                >
                  View Chats
                </Button>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <!-- User Detail Dialog -->
    <UserDetailDialog
      v-model:open="detailDialogOpen"
      v-model:notes="userNotes"
      :user="selectedUser"
      :saving-notes="savingNotes"
      @save-notes="saveNotes"
    />
  </div>
</template>
