<script setup lang="ts">
import { AlertTriangle } from 'lucide-vue-next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

defineProps<{
  open: boolean
  title: string
  itemName?: string
  description?: string
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'confirm'): void
}>()
</script>

<template>
  <Dialog :open="open" @update:open="(v) => emit('update:open', v)">
    <DialogContent class="sm:max-w-md text-center border-t-4 border-t-red-600">
      <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-2">
        <AlertTriangle class="h-8 w-8 text-red-600" />
      </div>
      
      <DialogHeader>
        <DialogTitle class="text-center text-xl font-bold text-gray-900">{{ title }}</DialogTitle>
        <DialogDescription class="text-center mt-3 text-base text-gray-600">
          <slot name="description">
            Are you sure you want to delete <strong>{{ itemName }}</strong>?
            <br/>
            {{ description || 'This action cannot be undone and all associated data will be permanently removed.' }}
          </slot>
        </DialogDescription>
      </DialogHeader>
      
      <DialogFooter class="flex sm:justify-center gap-3 w-full mt-6">
        <Button 
          variant="outline" 
          class="flex-1" 
          @click="emit('update:open', false)"
          :disabled="loading"
        >
          Cancel
        </Button>
        <Button 
          variant="destructive" 
          class="flex-1 bg-red-600 hover:bg-red-700 text-white" 
          @click="emit('confirm')"
          :disabled="loading"
        >
          {{ loading ? 'Deleting...' : 'Delete' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
