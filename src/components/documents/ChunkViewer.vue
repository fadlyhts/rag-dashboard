<script setup lang="ts">
import { computed } from 'vue'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import type { DocumentChunk } from '@/types/document.types'

interface Props {
  chunks: DocumentChunk[]
  loading?: boolean
}

const props = defineProps<Props>()

const formatChunkSize = (size: number) => {
  return `${size} chars`
}

const groupedChunks = computed(() => {
  const groups: { [key: number]: DocumentChunk[] } = {}
  props.chunks.forEach(chunk => {
    const groupIndex = Math.floor(chunk.chunk_index / 10)
    if (!groups[groupIndex]) {
      groups[groupIndex] = []
    }
    groups[groupIndex].push(chunk)
  })
  return groups
})
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-semibold text-gray-900">
        Document Chunks
      </h3>
      <Badge variant="secondary">
        {{ chunks.length }} chunks
      </Badge>
    </div>
    
    <div v-if="loading" class="text-center py-8 text-gray-500">
      Loading chunks...
    </div>
    
    <div v-else-if="chunks.length === 0" class="text-center py-8 text-gray-500">
      No chunks available
    </div>
    
    <Tabs v-else default-value="0" class="w-full">
      <TabsList class="grid w-full" :style="{ gridTemplateColumns: `repeat(${Object.keys(groupedChunks).length}, 1fr)` }">
        <TabsTrigger 
          v-for="(group, index) in groupedChunks" 
          :key="index"
          :value="String(index)"
        >
          {{ Number(index) * 10 + 1 }}-{{ Math.min((Number(index) + 1) * 10, chunks.length) }}
        </TabsTrigger>
      </TabsList>
      
      <TabsContent 
        v-for="(group, groupIndex) in groupedChunks" 
        :key="groupIndex"
        :value="String(groupIndex)"
        class="space-y-4 mt-4"
      >
        <div 
          v-for="chunk in group" 
          :key="chunk.id"
          class="border border-gray-200 rounded-lg p-4 bg-white"
        >
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-3">
              <Badge variant="outline">Chunk #{{ chunk.chunk_index }}</Badge>
              <span class="text-sm text-gray-500">{{ formatChunkSize(chunk.chunk_size) }}</span>
            </div>
            <div v-if="chunk.metadata" class="text-xs text-gray-400">
              {{ Object.keys(chunk.metadata).length }} metadata fields
            </div>
          </div>
          
          <Separator class="my-3" />
          
          <div class="prose prose-sm max-w-none">
            <pre class="whitespace-pre-wrap text-sm text-gray-700 font-sans bg-gray-50 p-3 rounded">{{ chunk.chunk_text }}</pre>
          </div>
          
          <div v-if="chunk.metadata && Object.keys(chunk.metadata).length > 0" class="mt-4">
            <details class="text-sm">
              <summary class="cursor-pointer text-gray-600 hover:text-gray-900 font-medium">
                View Metadata
              </summary>
              <div class="mt-2 bg-gray-50 p-3 rounded border border-gray-200">
                <pre class="text-xs text-gray-600 overflow-x-auto">{{ JSON.stringify(chunk.metadata, null, 2) }}</pre>
              </div>
            </details>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  </div>
</template>
