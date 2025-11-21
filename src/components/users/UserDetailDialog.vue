<script setup lang="ts">
import { computed } from 'vue'
import { format } from 'date-fns'
import type { UserDetail } from '@/types/user.types'
import { User, MessageSquare, Clock, TrendingUp } from 'lucide-vue-next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Props {
  open: boolean
  user: UserDetail | null
  notes: string
  savingNotes: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'update:notes': [value: string]
  'save-notes': []
}>()

const formatDate = (date: string) => {
  return format(new Date(date), 'MMM dd, yyyy HH:mm')
}

const getStatusBadge = computed(() => {
  if (!props.user) return ''
  return props.user.status === 'active'
    ? 'bg-green-100 text-green-800'
    : 'bg-red-100 text-red-800'
})
</script>

<template>
  <Dialog :open="open" @update:open="(val) => emit('update:open', val)">
    <DialogContent class="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>User Details</DialogTitle>
        <DialogDescription v-if="user">
          Detailed information for {{ user.name || user.phone }}
        </DialogDescription>
      </DialogHeader>

      <div v-if="user" class="space-y-6">
        <!-- User Info Card -->
        <Card class="p-6">
          <div class="flex items-start justify-between">
            <div class="flex items-start gap-4">
              <div class="w-16 h-16 rounded-full bg-[#25D366]/10 flex items-center justify-center">
                <User class="w-8 h-8 text-[#25D366]" />
              </div>
              <div>
                <h3 class="text-xl font-bold text-gray-900">{{ user.name || 'Unknown' }}</h3>
                <p class="text-sm text-gray-600 font-mono mt-1">{{ user.phone }}</p>
                <Badge :class="getStatusBadge" class="mt-2">
                  {{ user.status }}
                </Badge>
              </div>
            </div>
            <div class="text-right text-sm text-gray-600">
              <p>Joined: {{ formatDate(user.created_at) }}</p>
              <p class="mt-1">Last Active: {{ formatDate(user.last_active) }}</p>
            </div>
          </div>
        </Card>

        <!-- Statistics Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card class="p-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <MessageSquare class="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p class="text-sm text-gray-600">Total Messages</p>
                <p class="text-2xl font-bold text-gray-900">{{ user.messages_count }}</p>
              </div>
            </div>
          </Card>

          <Card class="p-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <TrendingUp class="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p class="text-sm text-gray-600">Tokens Used</p>
                <p class="text-2xl font-bold text-gray-900">{{ user.total_tokens_used.toLocaleString() }}</p>
              </div>
            </div>
          </Card>

          <Card class="p-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <Clock class="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p class="text-sm text-gray-600">Avg Response</p>
                <p class="text-2xl font-bold text-gray-900">{{ Math.round(user.avg_response_time_ms) }}ms</p>
              </div>
            </div>
          </Card>
        </div>

        <!-- Conversation History -->
        <div>
          <h4 class="text-lg font-semibold text-gray-900 mb-3">Conversation History</h4>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Last Message</TableHead>
                  <TableHead>Messages</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="conversation in user.conversations" :key="conversation.id">
                  <TableCell class="max-w-md truncate">{{ conversation.last_message }}</TableCell>
                  <TableCell>{{ conversation.message_count }}</TableCell>
                  <TableCell class="text-sm text-gray-600">
                    {{ formatDate(conversation.last_message_time) }}
                  </TableCell>
                </TableRow>
                <TableRow v-if="user.conversations.length === 0">
                  <TableCell colspan="3" class="text-center text-gray-500 py-8">
                    No conversations yet
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Card>
        </div>

        <!-- Notes Section -->
        <div>
          <h4 class="text-lg font-semibold text-gray-900 mb-3">Notes</h4>
          <div class="space-y-3">
            <Textarea
              :model-value="notes"
              @update:model-value="(val: string | number) => emit('update:notes', String(val))"
              placeholder="Add notes about this user..."
              rows="4"
              class="resize-none"
            />
            <div class="flex justify-end">
              <Button
                @click="emit('save-notes')"
                :disabled="savingNotes"
                class="bg-[#25D366] hover:bg-[#1fb855]"
              >
                {{ savingNotes ? 'Saving...' : 'Save Notes' }}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
