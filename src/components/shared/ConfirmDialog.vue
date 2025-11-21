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

interface Props {
  open: boolean
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive'
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Are you sure?',
  description: 'This action cannot be undone.',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  variant: 'default',
  loading: false
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  confirm: []
  cancel: []
}>()

const handleCancel = () => {
  emit('update:open', false)
  emit('cancel')
}

const handleConfirm = () => {
  emit('confirm')
}
</script>

<template>
  <Dialog :open="open" @update:open="(val) => emit('update:open', val)">
    <DialogContent>
      <DialogHeader>
        <div class="flex items-center gap-3">
          <div 
            :class="[
              'w-10 h-10 rounded-full flex items-center justify-center',
              variant === 'destructive' ? 'bg-red-100' : 'bg-yellow-100'
            ]"
          >
            <AlertTriangle 
              :class="[
                'w-5 h-5',
                variant === 'destructive' ? 'text-red-600' : 'text-yellow-600'
              ]" 
            />
          </div>
          <DialogTitle>{{ title }}</DialogTitle>
        </div>
        <DialogDescription>
          {{ description }}
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button 
          variant="outline" 
          @click="handleCancel"
          :disabled="loading"
        >
          {{ cancelText }}
        </Button>
        <Button 
          :variant="variant === 'destructive' ? 'destructive' : 'default'"
          @click="handleConfirm"
          :disabled="loading"
        >
          {{ loading ? 'Loading...' : confirmText }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
