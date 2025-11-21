<script setup lang="ts">
import { ref, computed } from 'vue'
import { Calendar as CalendarIcon } from 'lucide-vue-next'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'

interface DateRange {
  start: Date | null
  end: Date | null
}

interface Props {
  modelValue?: DateRange
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => ({ start: null, end: null })
})

const emit = defineEmits<{
  'update:modelValue': [value: DateRange]
  change: [value: DateRange]
}>()

const startDate = ref<Date | undefined>(props.modelValue.start || undefined)
const endDate = ref<Date | undefined>(props.modelValue.end || undefined)
const isStartOpen = ref(false)
const isEndOpen = ref(false)

const formattedStart = computed(() => {
  return startDate.value ? format(startDate.value, 'MMM dd, yyyy') : 'Start date'
})

const formattedEnd = computed(() => {
  return endDate.value ? format(endDate.value, 'MMM dd, yyyy') : 'End date'
})

const handleStartChange = (date: any) => {
  startDate.value = date instanceof Date ? date : (date ? new Date(date.toString()) : undefined)
  isStartOpen.value = false
  emitChange()
}

const handleEndChange = (date: any) => {
  endDate.value = date instanceof Date ? date : (date ? new Date(date.toString()) : undefined)
  isEndOpen.value = false
  emitChange()
}

const emitChange = () => {
  const range: DateRange = {
    start: startDate.value || null,
    end: endDate.value || null
  }
  emit('update:modelValue', range)
  emit('change', range)
}

const clearDates = () => {
  startDate.value = undefined
  endDate.value = undefined
  emitChange()
}
</script>

<template>
  <div class="flex items-center gap-2">
    <Popover v-model:open="isStartOpen">
      <PopoverTrigger as-child>
        <Button
          variant="outline"
          :class="[
            'justify-start text-left font-normal',
            !startDate && 'text-muted-foreground'
          ]"
        >
          <CalendarIcon class="mr-2 h-4 w-4" />
          {{ formattedStart }}
        </Button>
      </PopoverTrigger>
      <PopoverContent class="w-auto p-0" align="start">
        <Calendar
          :model-value="startDate as any"
          @update:model-value="handleStartChange"
          initial-focus
        />
      </PopoverContent>
    </Popover>
    
    <span class="text-sm text-gray-500">to</span>
    
    <Popover v-model:open="isEndOpen">
      <PopoverTrigger as-child>
        <Button
          variant="outline"
          :class="[
            'justify-start text-left font-normal',
            !endDate && 'text-muted-foreground'
          ]"
        >
          <CalendarIcon class="mr-2 h-4 w-4" />
          {{ formattedEnd }}
        </Button>
      </PopoverTrigger>
      <PopoverContent class="w-auto p-0" align="start">
        <Calendar
          :model-value="endDate as any"
          @update:model-value="handleEndChange"
          :disabled="(date: any) => startDate ? date < startDate : false"
          initial-focus
        />
      </PopoverContent>
    </Popover>
    
    <Button
      v-if="startDate || endDate"
      variant="ghost"
      size="sm"
      @click="clearDates"
      class="h-10"
    >
      Clear
    </Button>
  </div>
</template>
