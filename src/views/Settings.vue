<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { toast } from 'vue-sonner'
import { settingsService } from '@/services/settings.service'
import type {
  GeneralSettings,
  RateLimitingSettings,
  NotificationSettings,
  IntegrationStatus
} from '@/types/settings.types'
import { Settings as SettingsIcon, Save, TestTube } from 'lucide-vue-next'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
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
} from '@/components/ui/alert'

import LoadingSpinner from '@/components/shared/LoadingSpinner.vue'

const loading = ref(true)
const activeTab = ref('general')

const generalSettings = ref<GeneralSettings>({
  chatbot_name: '',
  default_language: 'id',
  timezone: 'Asia/Jakarta',
  business_hours: {
    enabled: false,
    start: '09:00',
    end: '17:00',
    days: [1, 2, 3, 4, 5]
  }
})

const integrations = ref<{
  waha: IntegrationStatus
  openai: IntegrationStatus
  qdrant: IntegrationStatus
  redis: IntegrationStatus
}>({
  waha: { service: 'waha', status: 'disconnected' },
  openai: { service: 'openai', status: 'disconnected' },
  qdrant: { service: 'qdrant', status: 'disconnected' },
  redis: { service: 'redis', status: 'disconnected' }
})

const rateLimiting = ref<RateLimitingSettings>({
  enabled: false,
  messages_per_minute: 10,
  daily_limit: 100,
  block_on_exceed: false
})

const notifications = ref<NotificationSettings>({
  email_alerts: false,
  webhook_url: '',
  alert_on_errors: true,
  alert_on_high_usage: false
})

const savingGeneral = ref(false)
const savingRateLimit = ref(false)
const savingNotifications = ref(false)
const testingConnection = ref<Record<string, boolean>>({})

onMounted(() => {
  loadSettings()
})

const loadSettings = async () => {
  loading.value = true
  try {
    const response = await settingsService.getSettings()
    generalSettings.value = response.settings.general
    integrations.value = response.settings.integrations
    rateLimiting.value = response.settings.rate_limiting
    notifications.value = response.settings.notifications
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Failed to load settings')
  } finally {
    loading.value = false
  }
}

const saveGeneral = async () => {
  savingGeneral.value = true
  try {
    await settingsService.updateGeneral(generalSettings.value)
    toast.success('General settings saved successfully')
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Failed to save general settings')
  } finally {
    savingGeneral.value = false
  }
}

const saveRateLimiting = async () => {
  savingRateLimit.value = true
  try {
    await settingsService.updateRateLimiting(rateLimiting.value)
    toast.success('Rate limiting settings saved successfully')
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Failed to save rate limiting settings')
  } finally {
    savingRateLimit.value = false
  }
}

const saveNotifications = async () => {
  savingNotifications.value = true
  try {
    await settingsService.updateNotifications(notifications.value)
    toast.success('Notification settings saved successfully')
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Failed to save notification settings')
  } finally {
    savingNotifications.value = false
  }
}

const testConnection = async (service: 'waha' | 'openai' | 'qdrant' | 'redis') => {
  testingConnection.value[service] = true
  try {
    const response = await settingsService.testConnection({ service })
    integrations.value[service].status = response.status
    integrations.value[service].last_check = new Date().toISOString()
    
    if (response.status === 'connected') {
      toast.success(`${service.toUpperCase()}: ${response.message}`)
    } else {
      toast.error(`${service.toUpperCase()}: ${response.message}`)
    }
  } catch (error: any) {
    integrations.value[service].status = 'error'
    toast.error(error.response?.data?.message || `Failed to test ${service} connection`)
  } finally {
    testingConnection.value[service] = false
  }
}

const getStatusBadge = (status: string) => {
  const colors: Record<string, string> = {
    connected: 'bg-green-100 text-green-800',
    disconnected: 'bg-gray-100 text-gray-800',
    error: 'bg-red-100 text-red-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

const languages = [
  { value: 'en', label: 'English' },
  { value: 'id', label: 'Indonesian' }
]

const timezones = [
  { value: 'Asia/Jakarta', label: 'Asia/Jakarta (WIB)' },
  { value: 'Asia/Makassar', label: 'Asia/Makassar (WITA)' },
  { value: 'Asia/Jayapura', label: 'Asia/Jayapura (WIT)' }
]
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-3xl font-bold text-gray-900">Settings</h1>
      <p class="text-gray-500 mt-1">Configure system settings and preferences</p>
    </div>

    <LoadingSpinner v-if="loading" size="lg" class="py-12" />

    <Tabs v-else v-model="activeTab" class="w-full">
      <TabsList class="grid w-full grid-cols-4">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="integrations">Integrations</TabsTrigger>
        <TabsTrigger value="rate-limiting">Rate Limiting</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>

      <!-- Tab 1: General Settings -->
      <TabsContent value="general" class="space-y-6">
        <Card class="p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">General Configuration</h3>
          
          <div class="space-y-6">
            <!-- Chatbot Name -->
            <div>
              <label class="text-sm font-medium text-gray-700 mb-2 block">Chatbot Name</label>
              <Input
                v-model="generalSettings.chatbot_name"
                placeholder="WhatsApp RAG Bot"
              />
            </div>

            <!-- Default Language -->
            <div>
              <label class="text-sm font-medium text-gray-700 mb-2 block">Default Language</label>
              <Select v-model="generalSettings.default_language">
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="lang in languages" :key="lang.value" :value="lang.value">
                    {{ lang.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <!-- Timezone -->
            <div>
              <label class="text-sm font-medium text-gray-700 mb-2 block">Timezone</label>
              <Select v-model="generalSettings.timezone">
                <SelectTrigger>
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="tz in timezones" :key="tz.value" :value="tz.value">
                    {{ tz.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <!-- Business Hours -->
            <div class="border-t pt-4">
              <div class="flex items-center justify-between mb-4">
                <label class="text-sm font-medium text-gray-700">Business Hours</label>
                <Switch
                  :checked="generalSettings.business_hours.enabled"
                  @update:checked="(val: boolean) => generalSettings.business_hours.enabled = val"
                />
              </div>

              <div v-if="generalSettings.business_hours.enabled" class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="text-sm text-gray-600 mb-1 block">Start Time</label>
                    <Input
                      v-model="generalSettings.business_hours.start"
                      type="time"
                    />
                  </div>
                  <div>
                    <label class="text-sm text-gray-600 mb-1 block">End Time</label>
                    <Input
                      v-model="generalSettings.business_hours.end"
                      type="time"
                    />
                  </div>
                </div>

                <Alert>
                  <AlertDescription class="text-sm text-gray-600">
                    Bot will only respond during business hours
                  </AlertDescription>
                </Alert>
              </div>
            </div>

            <Button
              @click="saveGeneral"
              :disabled="savingGeneral"
              class="bg-[#25D366] hover:bg-[#1fb855]"
            >
              <Save class="w-4 h-4 mr-2" />
              {{ savingGeneral ? 'Saving...' : 'Save General Settings' }}
            </Button>
          </div>
        </Card>
      </TabsContent>

      <!-- Tab 2: Integrations -->
      <TabsContent value="integrations" class="space-y-6">
        <Card class="p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Integration Status</h3>
          
          <div class="space-y-4">
            <!-- WAHA Integration -->
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-full bg-[#25D366] flex items-center justify-center text-white font-bold">
                  WA
                </div>
                <div>
                  <h4 class="font-semibold text-gray-900">WAHA (WhatsApp API)</h4>
                  <p class="text-sm text-gray-600">{{ integrations.waha.url || 'Not configured' }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <Badge :class="getStatusBadge(integrations.waha.status)">
                  {{ integrations.waha.status }}
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  @click="testConnection('waha')"
                  :disabled="testingConnection.waha"
                >
                  <TestTube class="w-4 h-4 mr-2" />
                  {{ testingConnection.waha ? 'Testing...' : 'Test' }}
                </Button>
              </div>
            </div>

            <!-- OpenAI Integration -->
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold">
                  AI
                </div>
                <div>
                  <h4 class="font-semibold text-gray-900">OpenAI</h4>
                  <p class="text-sm text-gray-600">Language Model Provider</p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <Badge :class="getStatusBadge(integrations.openai.status)">
                  {{ integrations.openai.status }}
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  @click="testConnection('openai')"
                  :disabled="testingConnection.openai"
                >
                  <TestTube class="w-4 h-4 mr-2" />
                  {{ testingConnection.openai ? 'Testing...' : 'Test' }}
                </Button>
              </div>
            </div>

            <!-- Qdrant Integration -->
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                  QD
                </div>
                <div>
                  <h4 class="font-semibold text-gray-900">Qdrant</h4>
                  <p class="text-sm text-gray-600">Vector Database</p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <Badge :class="getStatusBadge(integrations.qdrant.status)">
                  {{ integrations.qdrant.status }}
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  @click="testConnection('qdrant')"
                  :disabled="testingConnection.qdrant"
                >
                  <TestTube class="w-4 h-4 mr-2" />
                  {{ testingConnection.qdrant ? 'Testing...' : 'Test' }}
                </Button>
              </div>
            </div>

            <!-- Redis Integration -->
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center text-white font-bold">
                  RD
                </div>
                <div>
                  <h4 class="font-semibold text-gray-900">Redis</h4>
                  <p class="text-sm text-gray-600">Caching & Session Storage</p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <Badge :class="getStatusBadge(integrations.redis.status)">
                  {{ integrations.redis.status }}
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  @click="testConnection('redis')"
                  :disabled="testingConnection.redis"
                >
                  <TestTube class="w-4 h-4 mr-2" />
                  {{ testingConnection.redis ? 'Testing...' : 'Test' }}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </TabsContent>

      <!-- Tab 3: Rate Limiting -->
      <TabsContent value="rate-limiting" class="space-y-6">
        <Card class="p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Rate Limiting Configuration</h3>
          
          <div class="space-y-6">
            <!-- Enable Rate Limiting -->
            <div class="flex items-center justify-between">
              <div>
                <label class="text-sm font-medium text-gray-700">Enable Rate Limiting</label>
                <p class="text-sm text-gray-500">Limit message frequency per user</p>
              </div>
              <Switch
                :checked="rateLimiting.enabled"
                @update:checked="(val: boolean) => rateLimiting.enabled = val"
              />
            </div>

            <div v-if="rateLimiting.enabled" class="space-y-6 border-t pt-6">
              <!-- Messages Per Minute -->
              <div>
                <label class="text-sm font-medium text-gray-700 mb-2 block">
                  Messages Per Minute
                </label>
                <Input
                  v-model.number="rateLimiting.messages_per_minute"
                  type="number"
                  :min="1"
                  :max="100"
                />
                <p class="text-xs text-gray-500 mt-1">
                  Maximum messages a user can send per minute
                </p>
              </div>

              <!-- Daily Limit -->
              <div>
                <label class="text-sm font-medium text-gray-700 mb-2 block">
                  Daily Message Limit
                </label>
                <Input
                  v-model.number="rateLimiting.daily_limit"
                  type="number"
                  :min="10"
                  :max="10000"
                />
                <p class="text-xs text-gray-500 mt-1">
                  Maximum messages a user can send per day
                </p>
              </div>

              <!-- Block on Exceed -->
              <div class="flex items-center justify-between">
                <div>
                  <label class="text-sm font-medium text-gray-700">Block on Exceed</label>
                  <p class="text-sm text-gray-500">Temporarily block user when limit exceeded</p>
                </div>
                <Switch
                  :checked="rateLimiting.block_on_exceed"
                  @update:checked="(val: boolean) => rateLimiting.block_on_exceed = val"
                />
              </div>
            </div>

            <Button
              @click="saveRateLimiting"
              :disabled="savingRateLimit"
              class="bg-[#25D366] hover:bg-[#1fb855]"
            >
              <Save class="w-4 h-4 mr-2" />
              {{ savingRateLimit ? 'Saving...' : 'Save Rate Limiting Settings' }}
            </Button>
          </div>
        </Card>
      </TabsContent>

      <!-- Tab 4: Notifications -->
      <TabsContent value="notifications" class="space-y-6">
        <Card class="p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h3>
          
          <div class="space-y-6">
            <!-- Email Alerts -->
            <div class="flex items-center justify-between">
              <div>
                <label class="text-sm font-medium text-gray-700">Email Alerts</label>
                <p class="text-sm text-gray-500">Receive notifications via email</p>
              </div>
              <Switch
                :checked="notifications.email_alerts"
                @update:checked="(val: boolean) => notifications.email_alerts = val"
              />
            </div>

            <!-- Webhook URL -->
            <div>
              <label class="text-sm font-medium text-gray-700 mb-2 block">
                Webhook URL
              </label>
              <Input
                v-model="notifications.webhook_url"
                placeholder="https://your-webhook-url.com/endpoint"
                type="url"
              />
              <p class="text-xs text-gray-500 mt-1">
                POST notifications to this webhook URL
              </p>
            </div>

            <!-- Alert on Errors -->
            <div class="flex items-center justify-between">
              <div>
                <label class="text-sm font-medium text-gray-700">Alert on Errors</label>
                <p class="text-sm text-gray-500">Get notified when errors occur</p>
              </div>
              <Switch
                :checked="notifications.alert_on_errors"
                @update:checked="(val: boolean) => notifications.alert_on_errors = val"
              />
            </div>

            <!-- Alert on High Usage -->
            <div class="flex items-center justify-between">
              <div>
                <label class="text-sm font-medium text-gray-700">Alert on High Usage</label>
                <p class="text-sm text-gray-500">Get notified when usage exceeds thresholds</p>
              </div>
              <Switch
                :checked="notifications.alert_on_high_usage"
                @update:checked="(val: boolean) => notifications.alert_on_high_usage = val"
              />
            </div>

            <Button
              @click="saveNotifications"
              :disabled="savingNotifications"
              class="bg-[#25D366] hover:bg-[#1fb855]"
            >
              <Save class="w-4 h-4 mr-2" />
              {{ savingNotifications ? 'Saving...' : 'Save Notification Settings' }}
            </Button>
          </div>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
</template>
