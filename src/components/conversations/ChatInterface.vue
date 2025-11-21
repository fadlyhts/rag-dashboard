<script setup lang="ts">
import { ref } from 'vue'
import { ChevronDown, ChevronUp, User, Bot } from 'lucide-vue-next'
import { format } from 'date-fns'
import type { Message } from '@/types/conversation.types'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'

interface Props {
  messages: Message[]
}

const props = defineProps<Props>()

const expandedContexts = ref<Set<string>>(new Set())

const toggleContext = (messageId: string) => {
  if (expandedContexts.value.has(messageId)) {
    expandedContexts.value.delete(messageId)
  } else {
    expandedContexts.value.add(messageId)
  }
}

const isContextExpanded = (messageId: string) => {
  return expandedContexts.value.has(messageId)
}

const formatTime = (timestamp: string) => {
  return format(new Date(timestamp), 'HH:mm')
}
</script>

<template>
  <div class="space-y-4 max-h-[600px] overflow-y-auto p-4">
    <div
      v-for="message in messages"
      :key="message.id"
      :class="[
        'flex',
        message.role === 'user' ? 'justify-start' : 'justify-end'
      ]"
    >
      <div :class="['max-w-[80%] space-y-2']">
        <!-- Message Bubble -->
        <div
          :class="[
            'rounded-lg px-4 py-3 shadow-sm',
            message.role === 'user'
              ? 'bg-gray-100 text-gray-900'
              : 'bg-[#25D366] text-white'
          ]"
        >
          <div class="flex items-center gap-2 mb-1">
            <component
              :is="message.role === 'user' ? User : Bot"
              class="w-4 h-4"
            />
            <span class="text-xs font-medium">
              {{ message.role === 'user' ? 'User' : 'Bot' }}
            </span>
            <span
              :class="[
                'text-xs ml-auto',
                message.role === 'user' ? 'text-gray-500' : 'text-white/80'
              ]"
            >
              {{ formatTime(message.timestamp) }}
            </span>
          </div>
          <p class="text-sm whitespace-pre-wrap">{{ message.content }}</p>
        </div>

        <!-- RAG Context (only for bot messages) -->
        <div
          v-if="message.role === 'assistant' && message.rag_context && message.rag_context.length > 0"
          class="ml-4"
        >
          <button
            @click="toggleContext(message.id)"
            class="flex items-center gap-2 text-xs text-gray-600 hover:text-gray-900 transition-colors"
          >
            <component
              :is="isContextExpanded(message.id) ? ChevronUp : ChevronDown"
              class="w-3 h-3"
            />
            <span>{{ isContextExpanded(message.id) ? 'Hide' : 'Show' }} RAG Context ({{ message.rag_context.length }})</span>
          </button>

          <div
            v-if="isContextExpanded(message.id)"
            class="mt-2 space-y-2"
          >
            <Card
              v-for="(context, idx) in message.rag_context"
              :key="idx"
              class="p-3 bg-blue-50 border-blue-200"
            >
              <div class="flex items-start justify-between mb-2">
                <span class="text-xs font-medium text-blue-900">
                  {{ context.document_title }}
                </span>
                <Badge variant="secondary" class="text-xs">
                  Score: {{ (context.score * 100).toFixed(1) }}%
                </Badge>
              </div>
              <p class="text-xs text-gray-700 line-clamp-3">
                {{ context.chunk_text }}
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>

    <div v-if="messages.length === 0" class="text-center py-12 text-gray-500">
      <Bot class="w-12 h-12 mx-auto mb-3 text-gray-400" />
      <p>No messages in this conversation yet</p>
    </div>
  </div>
</template>
