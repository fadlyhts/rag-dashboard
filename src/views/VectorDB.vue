<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { toast } from 'vue-sonner'
import { vectorService } from '@/services/vector.service'
import type { VectorCollection, VectorSearchResult } from '@/types/vector.types'
import { Database, Search, RefreshCw, Archive, Zap } from 'lucide-vue-next'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'

import LoadingSpinner from '@/components/shared/LoadingSpinner.vue'
import EmptyState from '@/components/shared/EmptyState.vue'

const collections = ref<VectorCollection[]>([])
const loading = ref(false)
const selectedCollection = ref<VectorCollection | null>(null)

const searchQuery = ref('')
const topK = ref([5])
const searchResults = ref<VectorSearchResult[]>([])
const searching = ref(false)
const searchTime = ref(0)

const optimizing = ref(false)
const rebuilding = ref(false)
const backing = ref(false)

onMounted(() => {
  loadCollections()
})

const loadCollections = async () => {
  loading.value = true
  try {
    const response = await vectorService.getCollections()
    collections.value = response.collections
    if (collections.value.length > 0) {
      // Select the active collection by default, or the first one
      const activeCollection = collections.value.find(c => c.is_active)
      selectedCollection.value = activeCollection || collections.value[0]
    }
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Failed to load collections')
  } finally {
    loading.value = false
  }
}

const performSearch = async () => {
  if (!searchQuery.value.trim()) {
    toast.error('Please enter a search query')
    return
  }

  searching.value = true
  try {
    const response = await vectorService.search({
      query: searchQuery.value,
      top_k: topK.value[0],
      collection: selectedCollection.value?.name
    })
    searchResults.value = response.results
    searchTime.value = response.time_ms
    toast.success(`Found ${response.results.length} results in ${response.time_ms}ms`)
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Search failed')
  } finally {
    searching.value = false
  }
}

const optimizeCollection = async () => {
  optimizing.value = true
  try {
    const response = await vectorService.optimize(selectedCollection.value?.name)
    toast.success(response.message)
    loadCollections()
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Optimization failed')
  } finally {
    optimizing.value = false
  }
}

const rebuildCollection = async () => {
  if (!confirm('Are you sure? This will rebuild the entire collection and may take time.')) {
    return
  }

  rebuilding.value = true
  try {
    const response = await vectorService.rebuild(selectedCollection.value?.name)
    toast.success(response.message)
    loadCollections()
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Rebuild failed')
  } finally {
    rebuilding.value = false
  }
}

const backupCollection = async () => {
  backing.value = true
  try {
    const response = await vectorService.backup(selectedCollection.value?.name)
    toast.success(response.message)
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Backup failed')
  } finally {
    backing.value = false
  }
}

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    green: 'bg-green-100 text-green-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    red: 'bg-red-100 text-red-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Vector Database</h1>
        <p class="text-gray-500 mt-1">Manage Qdrant collections and search vectors</p>
      </div>
      <Button variant="outline" @click="loadCollections" :disabled="loading">
        <RefreshCw :class="['w-4 h-4 mr-2', loading && 'animate-spin']" />
        Refresh
      </Button>
    </div>

    <LoadingSpinner v-if="loading" size="lg" class="py-12" />

    <div v-else-if="collections.length > 0" class="space-y-6">
      <!-- Collection Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Total Vectors</p>
              <p class="text-3xl font-bold text-gray-900 mt-2">
                {{ (selectedCollection?.vectors_count || selectedCollection?.points_count || 0).toLocaleString() }}
              </p>
            </div>
            <Database class="w-10 h-10 text-blue-500" />
          </div>
        </Card>

        <Card class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Points Count</p>
              <p class="text-3xl font-bold text-green-900 mt-2">
                {{ selectedCollection?.points_count?.toLocaleString() || 0 }}
              </p>
            </div>
            <Zap class="w-10 h-10 text-green-500" />
          </div>
        </Card>

        <Card class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Collection Size</p>
              <p class="text-2xl font-bold text-gray-900 mt-2">
                {{ formatBytes(selectedCollection?.disk_data_size || 0) }}
              </p>
            </div>
            <Archive class="w-10 h-10 text-purple-500" />
          </div>
        </Card>

        <Card class="p-6">
          <div>
            <p class="text-sm text-gray-600 mb-2">Status</p>
            <Badge :class="getStatusColor(selectedCollection?.status || 'gray')">
              {{ selectedCollection?.status || 'unknown' }}
            </Badge>
            <p class="text-xs text-gray-500 mt-2">
              Optimizer: {{ selectedCollection?.optimizer_status || 'unknown' }}
            </p>
          </div>
        </Card>
      </div>

      <!-- Collection Info -->
      <Alert>
        <Database class="h-4 w-4" />
        <AlertTitle>Collection: {{ selectedCollection?.name }}</AlertTitle>
        <AlertDescription>
          Points: {{ selectedCollection?.points_count?.toLocaleString() || 0 }} | 
          Vector Size: {{ selectedCollection?.vector_size || 'N/A' }}
        </AlertDescription>
      </Alert>

      <!-- Test Search Section -->
      <Card class="p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Test Vector Search</h3>
        
        <div class="space-y-4">
          <div class="flex gap-4">
            <div class="flex-1">
              <Input
                v-model="searchQuery"
                placeholder="Enter search query..."
                @keyup.enter="performSearch"
              />
            </div>
            <Button
              @click="performSearch"
              :disabled="searching"
              class="bg-[#25D366] hover:bg-[#1fb855]"
            >
              <Search class="w-4 h-4 mr-2" />
              {{ searching ? 'Searching...' : 'Search' }}
            </Button>
          </div>

          <div>
            <label class="text-sm font-medium text-gray-700 mb-2 block">
              Top-K Results: {{ topK[0] }}
            </label>
            <Slider
              v-model="topK"
              :min="1"
              :max="10"
              :step="1"
              class="w-full"
            />
          </div>

          <div v-if="searchResults.length > 0">
            <div class="flex items-center justify-between mb-3">
              <h4 class="text-sm font-semibold text-gray-900">
                Search Results ({{ searchResults.length }})
              </h4>
              <span class="text-xs text-gray-500">
                Search completed in {{ searchTime }}ms
              </span>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead>Text Preview</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Relevance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="result in searchResults" :key="result.id">
                  <TableCell class="font-medium">
                    {{ result.payload.title || 'Untitled' }}
                  </TableCell>
                  <TableCell class="max-w-md">
                    <p class="text-sm text-gray-600 line-clamp-2">
                      {{ result.payload.text }}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {{ (result.score * 100).toFixed(2) }}%
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Progress
                      :model-value="result.score * 100"
                      class="w-24"
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <EmptyState
            v-else-if="!searching && searchQuery"
            :icon="Search"
            title="No results found"
            description="Try adjusting your search query or increasing Top-K"
          />
        </div>
      </Card>

      <!-- Collection Actions -->
      <Card class="p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Collection Actions</h3>
        
        <div class="flex flex-wrap gap-3">
          <Button
            @click="optimizeCollection"
            :disabled="optimizing"
            variant="outline"
          >
            <Zap class="w-4 h-4 mr-2" />
            {{ optimizing ? 'Optimizing...' : 'Optimize Collection' }}
          </Button>

          <Button
            @click="rebuildCollection"
            :disabled="rebuilding"
            variant="outline"
          >
            <RefreshCw class="w-4 h-4 mr-2" />
            {{ rebuilding ? 'Rebuilding...' : 'Rebuild Collection' }}
          </Button>

          <Button
            @click="backupCollection"
            :disabled="backing"
            variant="outline"
          >
            <Archive class="w-4 h-4 mr-2" />
            {{ backing ? 'Backing up...' : 'Backup Collection' }}
          </Button>
        </div>

        <Alert class="mt-4">
          <AlertDescription class="text-sm text-gray-600">
            <strong>Note:</strong> Optimize improves search performance. Rebuild recreates the entire index. 
            Backup creates a snapshot of the current collection state.
          </AlertDescription>
        </Alert>
      </Card>
    </div>

    <EmptyState
      v-else
      :icon="Database"
      title="No collections found"
      description="No vector collections are available in the database"
    />
  </div>
</template>
