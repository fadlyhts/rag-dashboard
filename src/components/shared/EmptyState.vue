<script setup lang="ts">
import type { Component } from 'vue'
import { FileQuestion } from 'lucide-vue-next'

interface Props {
  icon?: Component
  title: string
  description?: string
  actionText?: string
}

const props = withDefaults(defineProps<Props>(), {
  icon: FileQuestion
})

const emit = defineEmits<{
  action: []
}>()
</script>

<template>
  <div class="flex flex-col items-center justify-center py-12 px-4 text-center">
    <div class="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
      <component :is="props.icon" class="w-8 h-8 text-gray-400" />
    </div>
    <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ title }}</h3>
    <p v-if="description" class="text-sm text-gray-500 max-w-sm mb-6">
      {{ description }}
    </p>
    <button
      v-if="actionText"
      @click="emit('action')"
      class="px-4 py-2 bg-[#25D366] text-white rounded-lg hover:bg-[#1fb855] transition-colors text-sm font-medium"
    >
      {{ actionText }}
    </button>
  </div>
</template>
