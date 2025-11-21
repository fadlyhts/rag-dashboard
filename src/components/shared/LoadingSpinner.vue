<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md'
})

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }
  return sizes[props.size]
})
</script>

<template>
  <div class="flex items-center justify-center">
    <div 
      :class="[sizeClasses, 'animate-spin rounded-full border-2 border-gray-300 border-t-[#25D366]']"
    />
  </div>
</template>
