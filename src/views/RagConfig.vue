<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { toast } from 'vue-sonner'
import { ragConfigService } from '@/services/rag-config.service'
import type { LLMConfig, RetrievalConfig } from '@/types/rag.types'
import { Save, Play, ChevronDown, ChevronUp } from 'lucide-vue-next'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'

import LoadingSpinner from '@/components/shared/LoadingSpinner.vue'

const loading = ref(true)
const activeTab = ref('llm')

const llmConfig = ref<LLMConfig>({
  model: 'gpt-4',
  temperature: 0.7,
  max_tokens: 2000,
  top_p: 1.0
})

const retrievalConfig = ref<RetrievalConfig>({
  top_k: 5,
  similarity_threshold: 0.7,
  chunk_size: 1000,
  chunk_overlap: 200
})

const systemPrompt = ref('')
const userPrompt = ref('')

const savingLLM = ref(false)
const savingRetrieval = ref(false)
const savingPrompts = ref(false)

const testQuery = ref('')
const testResponse = ref('')
const testContext = ref<any[]>([])
const testing = ref(false)
const testTime = ref(0)
const contextExpanded = ref(false)

// Slider components require array values
const temperatureArray = computed({
  get: () => [llmConfig.value.temperature],
  set: (val: number[]) => { llmConfig.value.temperature = val[0] }
})

const topPArray = computed({
  get: () => [llmConfig.value.top_p],
  set: (val: number[]) => { llmConfig.value.top_p = val[0] }
})

const topKArray = computed({
  get: () => [retrievalConfig.value.top_k],
  set: (val: number[]) => { retrievalConfig.value.top_k = val[0] }
})

const similarityThresholdArray = computed({
  get: () => [retrievalConfig.value.similarity_threshold],
  set: (val: number[]) => { retrievalConfig.value.similarity_threshold = val[0] }
})

onMounted(() => {
  loadConfig()
})

const loadConfig = async () => {
  loading.value = true
  try {
    const [configResponse, promptsResponse] = await Promise.all([
      ragConfigService.getConfig(),
      ragConfigService.getPrompts()
    ])

    llmConfig.value = configResponse.config.llm
    retrievalConfig.value = configResponse.config.retrieval
    systemPrompt.value = promptsResponse.prompts.system
    userPrompt.value = promptsResponse.prompts.user
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Failed to load configuration')
  } finally {
    loading.value = false
  }
}

const saveLLMConfig = async () => {
  savingLLM.value = true
  try {
    await ragConfigService.updateLLMConfig(llmConfig.value)
    toast.success('LLM configuration saved successfully')
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Failed to save LLM configuration')
  } finally {
    savingLLM.value = false
  }
}

const saveRetrievalConfig = async () => {
  savingRetrieval.value = true
  try {
    await ragConfigService.updateRetrievalConfig(retrievalConfig.value)
    toast.success('Retrieval configuration saved successfully')
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Failed to save retrieval configuration')
  } finally {
    savingRetrieval.value = false
  }
}

const savePrompt = async (type: 'system' | 'user') => {
  savingPrompts.value = true
  try {
    const template = type === 'system' ? systemPrompt.value : userPrompt.value
    await ragConfigService.updatePrompt(type, template)
    toast.success(`${type === 'system' ? 'System' : 'User'} prompt saved successfully`)
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Failed to save prompt')
  } finally {
    savingPrompts.value = false
  }
}

const testRAG = async () => {
  if (!testQuery.value.trim()) {
    toast.error('Please enter a test query')
    return
  }

  testing.value = true
  testResponse.value = ''
  testContext.value = []
  
  try {
    const response = await ragConfigService.testRAG({
      query: testQuery.value,
      use_rag: true
    })

    testResponse.value = response.response
    testContext.value = response.context_used
    testTime.value = response.time_ms
    toast.success(`Test completed in ${response.time_ms}ms`)
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Test failed')
  } finally {
    testing.value = false
  }
}

const temperatureMarks = ref([{ value: 0, label: '0' }, { value: 1, label: '1' }])
const topPMarks = ref([{ value: 0, label: '0' }, { value: 1, label: '1' }])
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-3xl font-bold text-gray-900">RAG Configuration</h1>
      <p class="text-gray-500 mt-1">Configure LLM, retrieval settings, and prompts</p>
      <Alert class="mt-4">
        <Database class="h-4 w-4" />
        <AlertTitle>⚠️ Configuration Note</AlertTitle>
        <AlertDescription>
          The backend is currently configured to read settings from the <strong>.env file</strong>. 
          Changes made here are saved to the database but may not affect the active RAG system. 
          To change the active model, edit <code>backend/.env</code> and restart the backend.
        </AlertDescription>
      </Alert>
    </div>

    <LoadingSpinner v-if="loading" size="lg" class="py-12" />

    <Tabs v-else v-model="activeTab" class="w-full">
      <TabsList class="grid w-full grid-cols-4">
        <TabsTrigger value="llm">LLM Settings</TabsTrigger>
        <TabsTrigger value="retrieval">Retrieval</TabsTrigger>
        <TabsTrigger value="prompts">Prompts</TabsTrigger>
        <TabsTrigger value="test">Test RAG</TabsTrigger>
      </TabsList>

      <!-- Tab 1: LLM Settings -->
      <TabsContent value="llm" class="space-y-6">
        <Card class="p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Language Model Configuration</h3>
          
          <div class="space-y-6">
            <!-- Model Selection -->
            <div>
              <label class="text-sm font-medium text-gray-700 mb-2 block">Model</label>
              <Select v-model="llmConfig.model">
                <SelectTrigger>
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4">GPT-4</SelectItem>
                  <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                  <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro</SelectItem>
                  <SelectItem value="gemini-1.5-flash">Gemini 1.5 Flash</SelectItem>
                  <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                  <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                  <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <!-- Temperature -->
            <div>
              <label class="text-sm font-medium text-gray-700 mb-2 block">
                Temperature: {{ llmConfig.temperature }}
              </label>
              <Slider
                v-model="temperatureArray"
                :min="0"
                :max="1"
                :step="0.1"
                class="w-full"
              />
              <p class="text-xs text-gray-500 mt-1">
                Lower values make output more focused and deterministic
              </p>
            </div>

            <!-- Max Tokens -->
            <div>
              <label class="text-sm font-medium text-gray-700 mb-2 block">Max Tokens</label>
              <Input
                v-model.number="llmConfig.max_tokens"
                type="number"
                :min="100"
                :max="8000"
                :step="100"
              />
              <p class="text-xs text-gray-500 mt-1">
                Maximum number of tokens to generate in the response
              </p>
            </div>

            <!-- Top-P -->
            <div>
              <label class="text-sm font-medium text-gray-700 mb-2 block">
                Top-P: {{ llmConfig.top_p }}
              </label>
              <Slider
                v-model="topPArray"
                :min="0"
                :max="1"
                :step="0.1"
                class="w-full"
              />
              <p class="text-xs text-gray-500 mt-1">
                Nucleus sampling parameter for controlling randomness
              </p>
            </div>

            <Button
              @click="saveLLMConfig"
              :disabled="savingLLM"
              class="bg-[#25D366] hover:bg-[#1fb855]"
            >
              <Save class="w-4 h-4 mr-2" />
              {{ savingLLM ? 'Saving...' : 'Save LLM Settings' }}
            </Button>
          </div>
        </Card>
      </TabsContent>

      <!-- Tab 2: Retrieval Settings -->
      <TabsContent value="retrieval" class="space-y-6">
        <Card class="p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Vector Retrieval Configuration</h3>
          
          <div class="space-y-6">
            <!-- Top-K -->
            <div>
              <label class="text-sm font-medium text-gray-700 mb-2 block">
                Top-K Documents: {{ retrievalConfig.top_k }}
              </label>
              <Slider
                v-model="topKArray"
                :min="1"
                :max="10"
                :step="1"
                class="w-full"
              />
              <p class="text-xs text-gray-500 mt-1">
                Number of most similar documents to retrieve
              </p>
            </div>

            <!-- Similarity Threshold -->
            <div>
              <label class="text-sm font-medium text-gray-700 mb-2 block">
                Similarity Threshold: {{ retrievalConfig.similarity_threshold }}
              </label>
              <Slider
                v-model="similarityThresholdArray"
                :min="0"
                :max="1"
                :step="0.05"
                class="w-full"
              />
              <p class="text-xs text-gray-500 mt-1">
                Minimum similarity score for retrieved documents
              </p>
            </div>

            <!-- Chunk Size -->
            <div>
              <label class="text-sm font-medium text-gray-700 mb-2 block">Chunk Size</label>
              <Input
                v-model.number="retrievalConfig.chunk_size"
                type="number"
                :min="100"
                :max="2000"
                :step="100"
              />
              <p class="text-xs text-gray-500 mt-1">
                Size of text chunks for document splitting
              </p>
            </div>

            <!-- Chunk Overlap -->
            <div>
              <label class="text-sm font-medium text-gray-700 mb-2 block">Chunk Overlap</label>
              <Input
                v-model.number="retrievalConfig.chunk_overlap"
                type="number"
                :min="0"
                :max="500"
                :step="50"
              />
              <p class="text-xs text-gray-500 mt-1">
                Overlapping characters between consecutive chunks
              </p>
            </div>

            <Button
              @click="saveRetrievalConfig"
              :disabled="savingRetrieval"
              class="bg-[#25D366] hover:bg-[#1fb855]"
            >
              <Save class="w-4 h-4 mr-2" />
              {{ savingRetrieval ? 'Saving...' : 'Save Retrieval Settings' }}
            </Button>
          </div>
        </Card>
      </TabsContent>

      <!-- Tab 3: Prompts -->
      <TabsContent value="prompts" class="space-y-6">
        <Card class="p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">System Prompt</h3>
          <p class="text-sm text-gray-600 mb-4">
            Define the system behavior and personality of the chatbot
          </p>
          
          <Textarea
            v-model="systemPrompt"
            placeholder="You are a helpful assistant..."
            rows="8"
            class="font-mono text-sm"
          />

          <Button
            @click="savePrompt('system')"
            :disabled="savingPrompts"
            class="mt-4 bg-[#25D366] hover:bg-[#1fb855]"
          >
            <Save class="w-4 h-4 mr-2" />
            {{ savingPrompts ? 'Saving...' : 'Save System Prompt' }}
          </Button>
        </Card>

        <Card class="p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">User Prompt Template</h3>
          <p class="text-sm text-gray-600 mb-4">
            Template for user queries. Use {query} and {context} placeholders.
          </p>
          
          <Textarea
            v-model="userPrompt"
            placeholder="Context: {context}\n\nQuestion: {query}"
            rows="6"
            class="font-mono text-sm"
          />

          <Button
            @click="savePrompt('user')"
            :disabled="savingPrompts"
            class="mt-4 bg-[#25D366] hover:bg-[#1fb855]"
          >
            <Save class="w-4 h-4 mr-2" />
            {{ savingPrompts ? 'Saving...' : 'Save User Prompt' }}
          </Button>
        </Card>
      </TabsContent>

      <!-- Tab 4: Test RAG -->
      <TabsContent value="test" class="space-y-6">
        <Card class="p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Test RAG System</h3>
          
          <div class="space-y-4">
            <div>
              <label class="text-sm font-medium text-gray-700 mb-2 block">Test Query</label>
              <Textarea
                v-model="testQuery"
                placeholder="Enter your test query..."
                rows="3"
              />
            </div>

            <Button
              @click="testRAG"
              :disabled="testing"
              class="bg-[#25D366] hover:bg-[#1fb855]"
            >
              <Play class="w-4 h-4 mr-2" />
              {{ testing ? 'Testing...' : 'Run Test' }}
            </Button>

            <div v-if="testResponse" class="space-y-4">
              <Alert>
                <AlertTitle>Response</AlertTitle>
                <AlertDescription class="mt-2 whitespace-pre-wrap">
                  {{ testResponse }}
                </AlertDescription>
                <div class="mt-3 text-xs text-gray-500">
                  Generated in {{ testTime }}ms
                </div>
              </Alert>

              <div v-if="testContext.length > 0">
                <button
                  @click="contextExpanded = !contextExpanded"
                  class="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  <component :is="contextExpanded ? ChevronUp : ChevronDown" class="w-4 h-4" />
                  {{ contextExpanded ? 'Hide' : 'Show' }} Context Used ({{ testContext.length }})
                </button>

                <div v-if="contextExpanded" class="mt-3 space-y-3">
                  <Card
                    v-for="(ctx, idx) in testContext"
                    :key="idx"
                    class="p-4 bg-blue-50 border-blue-200"
                  >
                    <div class="flex items-start justify-between mb-2">
                      <span class="text-sm font-medium text-blue-900">
                        {{ ctx.document_title }}
                      </span>
                      <Badge variant="secondary">
                        Score: {{ (ctx.score * 100).toFixed(1) }}%
                      </Badge>
                    </div>
                    <p class="text-sm text-gray-700">
                      {{ ctx.chunk_text }}
                    </p>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
</template>
