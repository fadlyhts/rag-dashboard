<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { toast } from 'vue-sonner'
import {
  ClipboardCheck, Play, Download, Trash2, RefreshCw, X, FileJson, FileSpreadsheet, Upload,
} from 'lucide-vue-next'
import {
  evaluationService,
  type DatasetInfo,
  type EvaluationRun,
  type RefItem,
} from '@/services/evaluation.service'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'

const ALL_METRICS = [
  { key: 'bertscore', label: 'BERTScore' },
  { key: 'bleu', label: 'BLEU-4' },
  { key: 'rouge', label: 'ROUGE-L' },
  { key: 'ragas', label: 'RAGAS' },
]

const activeTab = ref<'run' | 'history'>('run')

// --- Run config ---
const datasets = ref<DatasetInfo[]>([])
const selectedDataset = ref<string>('')
const selectedMetrics = ref<string[]>(['bertscore', 'bleu', 'rouge', 'ragas'])
const ragasUseGroundTruth = ref(true)
const quickTest = ref(false) // limit to 3 questions
const lexicalNorm = ref<'none' | 'basic' | 'strong'>('basic')

// Retrieval scope (mirrors production per-division access control)
const divisions = ref<RefItem[]>([])
const categories = ref<RefItem[]>([])
const selectedDivision = ref<number | null>(null)
const selectedCategory = ref<number | null>(null)

// --- Runs ---
const runs = ref<EvaluationRun[]>([])
const loadingRuns = ref(false)
const starting = ref(false)
const uploading = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const activeRun = ref<EvaluationRun | null>(null)
let pollTimer: number | undefined

// --- Detail modal ---
const detailRun = ref<EvaluationRun | null>(null)
const expandedItem = ref<number | null>(null)

const isRunning = computed(
  () => activeRun.value && ['pending', 'running'].includes(activeRun.value.status)
)
const progressPct = computed(() => {
  if (!activeRun.value || !activeRun.value.num_samples) return 0
  return Math.round((activeRun.value.processed_samples / activeRun.value.num_samples) * 100)
})

onMounted(async () => {
  await Promise.all([loadDatasets(), loadRuns(), loadRefs()])
})

const loadRefs = async () => {
  try {
    const [divs, cats] = await Promise.all([
      evaluationService.getDivisions(),
      evaluationService.getCategories(),
    ])
    divisions.value = divs
    categories.value = cats
  } catch {
    // non-fatal — scope selectors just stay empty
  }
}

onUnmounted(() => stopPolling())

const loadDatasets = async () => {
  try {
    datasets.value = await evaluationService.getDatasets()
    const preferred = datasets.value.find(d => d.name === 'evaluation_dataset.json')
    selectedDataset.value = preferred?.name || datasets.value[0]?.name || ''
  } catch (e: any) {
    toast.error(e.response?.data?.detail || 'Gagal memuat dataset')
  }
}

const loadRuns = async () => {
  loadingRuns.value = true
  try {
    runs.value = await evaluationService.getRuns()
  } catch (e: any) {
    toast.error(e.response?.data?.detail || 'Gagal memuat riwayat')
  } finally {
    loadingRuns.value = false
  }
}

const triggerUpload = () => fileInput.value?.click()

const onFileSelected = async (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  uploading.value = true
  try {
    const info = await evaluationService.uploadDataset(file)
    toast.success(`Dataset "${info.name}" diunggah (${info.num_questions} soal)`)
    await loadDatasets()
    selectedDataset.value = info.name
  } catch (err: any) {
    toast.error(err.response?.data?.detail || 'Gagal mengunggah dataset')
  } finally {
    uploading.value = false
    if (input) input.value = ''
  }
}

const toggleMetric = (key: string) => {
  const i = selectedMetrics.value.indexOf(key)
  if (i >= 0) selectedMetrics.value.splice(i, 1)
  else selectedMetrics.value.push(key)
}

const startRun = async () => {
  if (!selectedDataset.value) {
    toast.error('Pilih dataset terlebih dahulu')
    return
  }
  if (selectedMetrics.value.length === 0) {
    toast.error('Pilih minimal satu metrik')
    return
  }
  starting.value = true
  try {
    const run = await evaluationService.createRun({
      dataset_name: selectedDataset.value,
      metrics: selectedMetrics.value,
      ragas_use_ground_truth: ragasUseGroundTruth.value,
      limit: quickTest.value ? 3 : null,
      division_id: selectedDivision.value,
      category_id: selectedCategory.value,
      lexical_normalization: lexicalNorm.value,
    })
    activeRun.value = run
    toast.success('Evaluasi dimulai...')
    startPolling(run.id)
    loadRuns()
  } catch (e: any) {
    toast.error(e.response?.data?.detail || 'Gagal memulai evaluasi')
  } finally {
    starting.value = false
  }
}

const startPolling = (runId: number) => {
  stopPolling()
  pollTimer = window.setInterval(async () => {
    try {
      const run = await evaluationService.getRun(runId)
      activeRun.value = run
      if (!['pending', 'running'].includes(run.status)) {
        stopPolling()
        loadRuns()
        if (run.status === 'completed') toast.success('Evaluasi selesai ✔')
        else toast.error('Evaluasi gagal: ' + (run.error || 'unknown'))
      }
    } catch {
      // keep polling on transient errors
    }
  }, 3000)
}

const stopPolling = () => {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = undefined
  }
}

const openDetail = async (run: EvaluationRun) => {
  try {
    detailRun.value = await evaluationService.getRun(run.id)
    expandedItem.value = null
  } catch (e: any) {
    toast.error(e.response?.data?.detail || 'Gagal memuat detail')
  }
}

const removeRun = async (run: EvaluationRun) => {
  if (!confirm(`Hapus run #${run.id}? Tindakan ini permanen.`)) return
  try {
    await evaluationService.deleteRun(run.id)
    toast.success('Run dihapus')
    loadRuns()
  } catch (e: any) {
    toast.error(e.response?.data?.detail || 'Gagal menghapus run')
  }
}

const doExport = async (run: EvaluationRun, format: 'json' | 'csv') => {
  try {
    await evaluationService.exportRun(run.id, format)
  } catch {
    toast.error('Gagal mengunduh')
  }
}

const fmt = (v?: number | null, pct = false) => {
  if (v === null || v === undefined) return '—'
  return pct ? (v * 100).toFixed(1) + '%' : v.toFixed(3)
}
const fmtDate = (s?: string | null) => (s ? new Date(s).toLocaleString('id-ID') : '—')

const statusColor = (s: string) => ({
  completed: 'bg-green-100 text-green-800',
  running: 'bg-blue-100 text-blue-800',
  pending: 'bg-yellow-100 text-yellow-800',
  failed: 'bg-red-100 text-red-800',
}[s] || 'bg-gray-100 text-gray-800')

const AGG_METRICS: { key: keyof EvaluationRun; label: string }[] = [
  { key: 'bertscore_f1', label: 'BERTScore F1' },
  { key: 'bleu', label: 'BLEU-4' },
  { key: 'rougeL', label: 'ROUGE-L' },
  { key: 'ragas_faithfulness', label: 'Faithfulness' },
  { key: 'ragas_answer_relevancy', label: 'Answer Rel.' },
  { key: 'ragas_context_precision', label: 'Context Prec.' },
]
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Evaluasi Metrik Otomatis</h1>
        <p class="text-gray-500 mt-1">
          Jalankan dataset uji ke pipeline RAG dan hitung BERTScore, BLEU, ROUGE-L, dan RAGAS
        </p>
      </div>
      <ClipboardCheck class="w-10 h-10 text-[#25D366]" />
    </div>

    <!-- Tabs -->
    <div class="flex gap-2 border-b border-gray-200">
      <button
        v-for="tab in [{ k: 'run', l: 'Jalankan' }, { k: 'history', l: 'Riwayat & Hasil' }]"
        :key="tab.k"
        @click="activeTab = tab.k as any"
        class="px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors"
        :class="activeTab === tab.k
          ? 'border-[#25D366] text-[#25D366]'
          : 'border-transparent text-gray-500 hover:text-gray-700'"
      >
        {{ tab.l }}
      </button>
    </div>

    <!-- ============ TAB: JALANKAN ============ -->
    <div v-show="activeTab === 'run'" class="space-y-6">
      <Card class="p-6 space-y-5">
        <h3 class="text-lg font-semibold text-gray-900">Konfigurasi Evaluasi</h3>

        <!-- Dataset -->
        <div>
          <label class="text-sm font-medium text-gray-700 mb-1.5 block">Dataset Uji</label>
          <div class="flex gap-2">
            <select
              v-model="selectedDataset"
              class="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366]"
            >
              <option v-for="d in datasets" :key="d.name" :value="d.name">
                {{ d.name }} — {{ d.num_questions }} soal{{ d.has_ground_truth ? '' : ' (tanpa ground truth)' }}
              </option>
              <option v-if="!datasets.length" disabled value="">Belum ada dataset</option>
            </select>
            <input ref="fileInput" type="file" accept=".json,application/json" class="hidden" @change="onFileSelected" />
            <Button variant="outline" :disabled="uploading" @click="triggerUpload">
              <Upload class="w-4 h-4 mr-2" />
              {{ uploading ? 'Mengunggah...' : 'Upload' }}
            </Button>
          </div>
          <p class="text-xs text-gray-400 mt-1.5">
            Field per pertanyaan: <code>id</code>, <code>question</code>, <code>ground_truth</code>, <code>division_id</code>, <code>category</code>.
            <code>division_id</code> menimpa scope di bawah. Lihat <code>evaluation_dataset_template.json</code>. Disimpan di <code>backend/scripts/</code>.
          </p>
        </div>

        <!-- Metrics -->
        <div>
          <label class="text-sm font-medium text-gray-700 mb-1.5 block">Metrik</label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="m in ALL_METRICS"
              :key="m.key"
              @click="toggleMetric(m.key)"
              class="px-3 py-1.5 rounded-full text-sm border transition-colors"
              :class="selectedMetrics.includes(m.key)
                ? 'bg-[#25D366]/10 border-[#25D366] text-[#1a9c4c] font-medium'
                : 'bg-white border-gray-300 text-gray-500'"
            >
              {{ m.label }}
            </button>
          </div>
        </div>

        <!-- Lexical normalization (BLEU/ROUGE only) -->
        <div>
          <label class="text-sm font-medium text-gray-700 mb-1.5 block">Normalisasi teks (khusus BLEU/ROUGE)</label>
          <select
            v-model="lexicalNorm"
            class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366]"
          >
            <option value="none">Tanpa normalisasi (teks apa adanya)</option>
            <option value="basic">Basic — buang sitasi [1], emoji, lowercase</option>
            <option value="strong">Strong — + buang sapaan/penutup ("Halo", "Semoga membantu")</option>
          </select>
          <p class="text-xs text-gray-400 mt-1.5">
            Hanya memengaruhi BLEU &amp; ROUGE-L (diterapkan ke jawaban &amp; ground truth). BERTScore &amp; RAGAS tetap memakai teks asli.
          </p>
        </div>

        <!-- Retrieval scope (division / category) -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-700 mb-1.5 block">Divisi (scope retrieval)</label>
            <select
              v-model="selectedDivision"
              class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366]"
            >
              <option :value="null">Semua divisi (tanpa filter)</option>
              <option v-for="d in divisions" :key="d.id" :value="d.id">{{ d.name }}</option>
            </select>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-700 mb-1.5 block">Kategori (opsional)</label>
            <select
              v-model="selectedCategory"
              class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366]"
            >
              <option :value="null">Semua kategori</option>
              <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
          </div>
        </div>
        <p class="text-xs text-amber-600 -mt-2">
          ⚠️ Di produksi, retrieval dibatasi per divisi user. Pilih divisi pemilik dokumen uji agar hasil evaluasi
          mencerminkan kondisi nyata. Nilai <code>division_id</code>/<code>category_id</code> per pertanyaan di dataset akan menimpa pilihan ini.
        </p>

        <!-- Options -->
        <div class="flex flex-col gap-2">
          <label class="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" v-model="ragasUseGroundTruth" class="rounded" />
            RAGAS pakai ground truth (Context Precision) — ala Baur et al.
          </label>
          <label class="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" v-model="quickTest" class="rounded" />
            Uji cepat (hanya 3 pertanyaan pertama)
          </label>
        </div>

        <Button
          @click="startRun"
          :disabled="starting || !!isRunning"
          class="bg-[#25D366] hover:bg-[#1fb855]"
        >
          <Play class="w-4 h-4 mr-2" />
          {{ isRunning ? 'Sedang berjalan...' : 'Jalankan Evaluasi' }}
        </Button>
      </Card>

      <!-- Live progress -->
      <Card v-if="activeRun" class="p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">
            Run #{{ activeRun.id }}
          </h3>
          <Badge :class="statusColor(activeRun.status)">{{ activeRun.status }}</Badge>
        </div>

        <div v-if="isRunning">
          <div class="flex justify-between text-sm text-gray-600 mb-1">
            <span>Memproses pertanyaan…</span>
            <span>{{ activeRun.processed_samples }}/{{ activeRun.num_samples }}</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2.5">
            <div class="bg-[#25D366] h-2.5 rounded-full transition-all" :style="{ width: progressPct + '%' }" />
          </div>
          <p class="text-xs text-gray-400 mt-2">
            BERTScore &amp; RAGAS dihitung di akhir — mohon tunggu beberapa menit.
          </p>
        </div>

        <!-- Aggregate scores when done -->
        <div v-if="activeRun.status === 'completed'" class="grid grid-cols-2 md:grid-cols-6 gap-3">
          <div v-for="m in AGG_METRICS" :key="m.key" class="text-center p-3 bg-gray-50 rounded-lg">
            <p class="text-xs text-gray-500">{{ m.label }}</p>
            <p class="text-xl font-bold text-gray-900 mt-1">{{ fmt(activeRun[m.key] as number) }}</p>
          </div>
        </div>
        <p v-if="activeRun.error" class="text-sm text-amber-600">Catatan: {{ activeRun.error }}</p>
      </Card>
    </div>

    <!-- ============ TAB: RIWAYAT ============ -->
    <div v-show="activeTab === 'history'" class="space-y-4">
      <div class="flex justify-end">
        <Button variant="outline" @click="loadRuns" :disabled="loadingRuns">
          <RefreshCw :class="['w-4 h-4 mr-2', loadingRuns && 'animate-spin']" />
          Refresh
        </Button>
      </div>

      <Card class="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Waktu</TableHead>
              <TableHead>Dataset</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>N</TableHead>
              <TableHead>BERT F1</TableHead>
              <TableHead>BLEU</TableHead>
              <TableHead>ROUGE-L</TableHead>
              <TableHead>Faith.</TableHead>
              <TableHead>Ans.Rel</TableHead>
              <TableHead>Ctx.Prec</TableHead>
              <TableHead class="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow
              v-for="run in runs"
              :key="run.id"
              class="cursor-pointer hover:bg-gray-50"
              @click="openDetail(run)"
            >
              <TableCell class="font-medium">{{ run.id }}</TableCell>
              <TableCell class="text-sm text-gray-600 whitespace-nowrap">{{ fmtDate(run.created_at) }}</TableCell>
              <TableCell class="text-sm">{{ run.dataset_name }}</TableCell>
              <TableCell><Badge :class="statusColor(run.status)">{{ run.status }}</Badge></TableCell>
              <TableCell>{{ run.num_samples }}</TableCell>
              <TableCell>{{ fmt(run.bertscore_f1) }}</TableCell>
              <TableCell>{{ fmt(run.bleu) }}</TableCell>
              <TableCell>{{ fmt(run.rougeL) }}</TableCell>
              <TableCell>{{ fmt(run.ragas_faithfulness) }}</TableCell>
              <TableCell>{{ fmt(run.ragas_answer_relevancy) }}</TableCell>
              <TableCell>{{ fmt(run.ragas_context_precision) }}</TableCell>
              <TableCell class="text-right whitespace-nowrap" @click.stop>
                <button class="p-1.5 text-gray-500 hover:text-gray-800" title="Export JSON" @click="doExport(run, 'json')">
                  <FileJson class="w-4 h-4" />
                </button>
                <button class="p-1.5 text-gray-500 hover:text-gray-800" title="Export CSV" @click="doExport(run, 'csv')">
                  <FileSpreadsheet class="w-4 h-4" />
                </button>
                <button class="p-1.5 text-red-400 hover:text-red-600" title="Hapus" @click="removeRun(run)">
                  <Trash2 class="w-4 h-4" />
                </button>
              </TableCell>
            </TableRow>
            <TableRow v-if="!runs.length && !loadingRuns">
              <TableCell colspan="12" class="text-center text-gray-400 py-8">Belum ada run evaluasi</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>
    </div>

    <!-- ============ DETAIL MODAL ============ -->
    <div v-if="detailRun" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" @click.self="detailRun = null">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <div class="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h3 class="text-lg font-semibold text-gray-900">Detail Run #{{ detailRun.id }}</h3>
            <p class="text-sm text-gray-500">{{ detailRun.dataset_name }} · {{ fmtDate(detailRun.created_at) }}</p>
          </div>
          <div class="flex items-center gap-2">
            <Button variant="outline" size="sm" @click="doExport(detailRun, 'json')">
              <Download class="w-4 h-4 mr-1" /> JSON
            </Button>
            <Button variant="outline" size="sm" @click="doExport(detailRun, 'csv')">
              <Download class="w-4 h-4 mr-1" /> CSV
            </Button>
            <button class="p-2 text-gray-400 hover:text-gray-700" @click="detailRun = null"><X class="w-5 h-5" /></button>
          </div>
        </div>

        <!-- Aggregate -->
        <div class="px-6 py-4 border-b grid grid-cols-3 md:grid-cols-6 gap-3">
          <div v-for="m in AGG_METRICS" :key="m.key" class="text-center p-2 bg-gray-50 rounded">
            <p class="text-[11px] text-gray-500">{{ m.label }}</p>
            <p class="text-lg font-bold text-gray-900">{{ fmt(detailRun[m.key] as number) }}</p>
          </div>
        </div>

        <!-- Items -->
        <div class="overflow-y-auto px-6 py-4 space-y-2">
          <div v-for="(it, idx) in detailRun.items" :key="it.id" class="border rounded-lg">
            <button
              class="w-full flex items-start justify-between gap-3 p-3 text-left hover:bg-gray-50"
              @click="expandedItem = expandedItem === it.id ? null : it.id"
            >
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900">
                  <span v-if="it.question_ref" class="text-gray-400">{{ it.question_ref }} · </span>{{ idx + 1 }}. {{ it.question }}
                </p>
                <p class="text-xs text-gray-500 truncate mt-0.5">{{ it.answer }}</p>
              </div>
              <div class="flex gap-1.5 flex-wrap justify-end shrink-0">
                <Badge variant="secondary" class="text-xs">BERT {{ fmt(it.bertscore_f1) }}</Badge>
                <Badge variant="secondary" class="text-xs">Faith {{ fmt(it.ragas_faithfulness) }}</Badge>
              </div>
            </button>

            <div v-if="expandedItem === it.id" class="px-3 pb-3 space-y-3 text-sm">
              <div>
                <p class="font-medium text-gray-700">Jawaban Sistem</p>
                <p class="text-gray-600 whitespace-pre-wrap">{{ it.answer || '—' }}</p>
              </div>
              <div>
                <p class="font-medium text-gray-700">Ground Truth</p>
                <p class="text-gray-600 whitespace-pre-wrap">{{ it.ground_truth || '—' }}</p>
              </div>
              <div>
                <p class="font-medium text-gray-700">Konteks yang di-retrieve ({{ it.contexts?.length || 0 }})</p>
                <ul class="list-disc pl-5 text-gray-600 space-y-1">
                  <li v-for="(c, ci) in it.contexts" :key="ci" class="text-xs">{{ c.slice(0, 300) }}{{ c.length > 300 ? '…' : '' }}</li>
                </ul>
              </div>
              <div class="grid grid-cols-3 md:grid-cols-6 gap-2 pt-1">
                <div class="text-center"><p class="text-[11px] text-gray-400">BERT F1</p><p class="font-semibold">{{ fmt(it.bertscore_f1) }}</p></div>
                <div class="text-center"><p class="text-[11px] text-gray-400">BLEU</p><p class="font-semibold">{{ fmt(it.bleu) }}</p></div>
                <div class="text-center"><p class="text-[11px] text-gray-400">ROUGE-L</p><p class="font-semibold">{{ fmt(it.rougeL) }}</p></div>
                <div class="text-center"><p class="text-[11px] text-gray-400">Faith.</p><p class="font-semibold">{{ fmt(it.ragas_faithfulness) }}</p></div>
                <div class="text-center"><p class="text-[11px] text-gray-400">Ans.Rel</p><p class="font-semibold">{{ fmt(it.ragas_answer_relevancy) }}</p></div>
                <div class="text-center"><p class="text-[11px] text-gray-400">Ctx.Prec</p><p class="font-semibold">{{ fmt(it.ragas_context_precision) }}</p></div>
              </div>
            </div>
          </div>
          <p v-if="!detailRun.items?.length" class="text-center text-gray-400 py-6">Belum ada item</p>
        </div>
      </div>
    </div>
  </div>
</template>
