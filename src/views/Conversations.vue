<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { toast } from 'vue-sonner'
import { conversationsService } from '@/services/conversations.service'
import type { Conversation, ConversationDetail, ConversationsListParams } from '@/types/conversation.types'
import { format } from 'date-fns'
import { MessageSquare, Download, Eye, Trash2 } from 'lucide-vue-next'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import SearchInput from '@/components/shared/SearchInput.vue'
import DateRangePicker from '@/components/shared/DateRangePicker.vue'
import ConfirmDialog from '@/components/shared/ConfirmDialog.vue'
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue'
import EmptyState from '@/components/shared/EmptyState.vue'
import ChatInterface from '@/components/conversations/ChatInterface.vue'

const conversations = ref<Conversation[]>([])
const total = ref(0)
const loading = ref(false)
const searchQuery = ref('')
const statusFilter = ref<'all' | 'active' | 'ended'>('all')
const dateRange = ref<{ start: Date | null; end: Date | null }>({ start: null, end: null })

const selectedConversation = ref<ConversationDetail | null>(null)
const chatDialogOpen = ref(false)
const loadingChat = ref(false)

const deleteDialogOpen = ref(false)
const conversationToDelete = ref<string | null>(null)
const deleting = ref(false)

const currentPage = ref(1)
const pageSize = ref(20)

onMounted(() => {
  loadConversations()
})

const loadConversations = async () => {
  loading.value = true
  try {
    const params: ConversationsListParams = {
      page: currentPage.value,
      limit: pageSize.value,
      search: searchQuery.value || undefined,
      status: statusFilter.value !== 'all' ? statusFilter.value : undefined,
      start_date: dateRange.value.start ? dateRange.value.start.toISOString() : undefined,
      end_date: dateRange.value.end ? dateRange.value.end.toISOString() : undefined,
    }

    const response = await conversationsService.list(params)
    conversations.value = response.conversations
    total.value = response.total
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Failed to load conversations')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  loadConversations()
}

const handleStatusChange = (value: string | number | null | undefined) => {
  if (value && typeof value === 'string') {
    statusFilter.value = value as 'all' | 'active' | 'ended'
    currentPage.value = 1
    loadConversations()
  }
}

const handleDateRangeChange = () => {
  currentPage.value = 1
  loadConversations()
}

const viewConversation = async (id: string) => {
  loadingChat.value = true
  chatDialogOpen.value = true
  try {
    const response = await conversationsService.getById(id)
    selectedConversation.value = response.conversation
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Failed to load conversation details')
    chatDialogOpen.value = false
  } finally {
    loadingChat.value = false
  }
}

const confirmDelete = (id: string) => {
  conversationToDelete.value = id
  deleteDialogOpen.value = true
}

const handleDelete = async () => {
  if (!conversationToDelete.value) return

  deleting.value = true
  try {
    await conversationsService.delete(conversationToDelete.value)
    toast.success('Conversation deleted successfully')
    deleteDialogOpen.value = false
    conversationToDelete.value = null
    loadConversations()
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Failed to delete conversation')
  } finally {
    deleting.value = false
  }
}

const exportData = async (format: 'csv' | 'json') => {
  try {
    const blob = await conversationsService.exportData(format, {
      search: searchQuery.value || undefined,
      status: statusFilter.value !== 'all' ? statusFilter.value : undefined,
    })

    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `conversations-${format}-${Date.now()}.${format}`
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
    : 'bg-gray-100 text-gray-800'
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Conversations</h1>
        <p class="text-gray-500 mt-1">View and manage WhatsApp conversations</p>
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
          <SelectItem value="ended">Ended</SelectItem>
        </SelectContent>
      </Select>

      <DateRangePicker
        v-model="dateRange"
        @change="handleDateRangeChange"
      />

      <Button variant="outline" @click="loadConversations">
        Refresh
      </Button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-white p-6 rounded-lg border border-gray-200">
        <p class="text-sm text-gray-600">Total Conversations</p>
        <p class="text-2xl font-bold text-gray-900 mt-2">{{ total }}</p>
      </div>
      <div class="bg-white p-6 rounded-lg border border-gray-200">
        <p class="text-sm text-gray-600">Active</p>
        <p class="text-2xl font-bold text-green-600 mt-2">
          {{ conversations.filter(c => c.status === 'active').length }}
        </p>
      </div>
      <div class="bg-white p-6 rounded-lg border border-gray-200">
        <p class="text-sm text-gray-600">Ended</p>
        <p class="text-2xl font-bold text-gray-600 mt-2">
          {{ conversations.filter(c => c.status === 'ended').length }}
        </p>
      </div>
      <div class="bg-white p-6 rounded-lg border border-gray-200">
        <p class="text-sm text-gray-600">Total Messages</p>
        <p class="text-2xl font-bold text-blue-600 mt-2">
          {{ conversations.reduce((sum, c) => sum + c.message_count, 0) }}
        </p>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-lg border border-gray-200">
      <LoadingSpinner v-if="loading" size="lg" class="py-12" />
      <EmptyState
        v-else-if="conversations.length === 0"
        :icon="MessageSquare"
        title="No conversations found"
        description="No conversations match your search criteria"
      />
      <Table v-else>
        <TableHeader>
          <TableRow>
            <TableHead>Phone</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Last Message</TableHead>
            <TableHead>Messages</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Active</TableHead>
            <TableHead class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="conversation in conversations" :key="conversation.id">
            <TableCell class="font-mono text-sm">{{ conversation.phone }}</TableCell>
            <TableCell>{{ conversation.name || '-' }}</TableCell>
            <TableCell class="max-w-xs truncate">{{ conversation.last_message }}</TableCell>
            <TableCell>{{ conversation.message_count }}</TableCell>
            <TableCell>
              <Badge :class="getStatusBadge(conversation.status)">
                {{ conversation.status }}
              </Badge>
            </TableCell>
            <TableCell class="text-sm text-gray-600">
              {{ formatDate(conversation.last_message_time) }}
            </TableCell>
            <TableCell class="text-right">
              <div class="flex items-center justify-end gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  @click="viewConversation(conversation.id)"
                >
                  <Eye class="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  @click="confirmDelete(conversation.id)"
                >
                  <Trash2 class="w-4 h-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <!-- Chat Dialog -->
    <Dialog v-model:open="chatDialogOpen">
      <DialogContent class="max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            Conversation with {{ selectedConversation?.name || selectedConversation?.phone }}
          </DialogTitle>
          <DialogDescription>
            <div class="flex items-center gap-4 mt-2">
              <span>Phone: {{ selectedConversation?.phone }}</span>
              <Badge :class="getStatusBadge(selectedConversation?.status || '')">
                {{ selectedConversation?.status }}
              </Badge>
              <span class="text-sm">Messages: {{ selectedConversation?.message_count }}</span>
            </div>
          </DialogDescription>
        </DialogHeader>

        <LoadingSpinner v-if="loadingChat" size="lg" class="py-12" />
        <ChatInterface
          v-else-if="selectedConversation"
          :messages="selectedConversation.messages"
        />
      </DialogContent>
    </Dialog>

    <!-- Delete Confirmation Dialog -->
    <ConfirmDialog
      v-model:open="deleteDialogOpen"
      title="Delete Conversation"
      description="Are you sure you want to delete this conversation? This action cannot be undone."
      confirm-text="Delete"
      variant="destructive"
      :loading="deleting"
      @confirm="handleDelete"
    />
  </div>
</template>
