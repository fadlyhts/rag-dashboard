<script setup lang="ts">
import { computed } from 'vue'
import { Eye, RotateCw, Trash2 } from 'lucide-vue-next'
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
import { Skeleton } from '@/components/ui/skeleton'
import type { Document } from '@/types/document.types'

interface Props {
  documents: Document[]
  loading?: boolean
}

interface Emits {
  (e: 'view', id: number): void
  (e: 'reindex', id: number): void
  (e: 'delete', id: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

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
    month: 'short', 
    day: 'numeric' 
  })
}

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'completed':
      return 'default'
    case 'processing':
      return 'secondary'
    case 'pending':
      return 'outline'
    case 'failed':
      return 'destructive'
    default:
      return 'outline'
  }
}

const getFileTypeColor = (fileType: string) => {
  const type = fileType.toLowerCase()
  if (type.includes('pdf')) return 'bg-red-100 text-red-800'
  if (type.includes('doc')) return 'bg-blue-100 text-blue-800'
  if (type.includes('txt') || type.includes('md')) return 'bg-gray-100 text-gray-800'
  if (type.includes('csv')) return 'bg-green-100 text-green-800'
  return 'bg-gray-100 text-gray-800'
}
</script>

<template>
  <div class="rounded-md border">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Size</TableHead>
          <TableHead>Upload Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead class="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <template v-if="loading">
          <TableRow v-for="i in 5" :key="i">
            <TableCell><Skeleton class="h-4 w-[250px]" /></TableCell>
            <TableCell><Skeleton class="h-4 w-[60px]" /></TableCell>
            <TableCell><Skeleton class="h-4 w-[80px]" /></TableCell>
            <TableCell><Skeleton class="h-4 w-[100px]" /></TableCell>
            <TableCell><Skeleton class="h-4 w-[80px]" /></TableCell>
            <TableCell><Skeleton class="h-4 w-[120px]" /></TableCell>
          </TableRow>
        </template>
        
        <template v-else-if="documents.length === 0">
          <TableRow>
            <TableCell colspan="6" class="text-center py-8 text-gray-500">
              No documents found
            </TableCell>
          </TableRow>
        </template>
        
        <template v-else>
          <TableRow v-for="doc in documents" :key="doc.id" class="hover:bg-gray-50">
            <TableCell class="font-medium">{{ doc.title }}</TableCell>
            <TableCell>
              <Badge :class="getFileTypeColor(doc.file_type)" variant="outline">
                {{ doc.file_type.toUpperCase() }}
              </Badge>
            </TableCell>
            <TableCell>{{ formatFileSize(doc.file_size) }}</TableCell>
            <TableCell>{{ formatDate(doc.upload_date) }}</TableCell>
            <TableCell>
              <Badge :variant="getStatusVariant(doc.status)">
                {{ doc.status }}
              </Badge>
            </TableCell>
            <TableCell class="text-right">
              <div class="flex items-center justify-end gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  @click="emit('view', doc.id)"
                >
                  <Eye class="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  @click="emit('reindex', doc.id)"
                  :disabled="doc.status === 'processing'"
                >
                  <RotateCw class="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  class="text-red-600 hover:text-red-700 hover:bg-red-50"
                  @click="emit('delete', doc.id)"
                >
                  <Trash2 class="w-4 h-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        </template>
      </TableBody>
    </Table>
  </div>
</template>
