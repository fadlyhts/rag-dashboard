<script setup lang="ts">
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import type { PopularQuery } from '@/types/analytics.types'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface Props {
  data: PopularQuery[]
}

const props = defineProps<Props>()

const chartData = computed(() => ({
  labels: props.data.map(q => {
    const query = q.query
    return query.length > 40 ? query.substring(0, 40) + '...' : query
  }),
  datasets: [
    {
      label: 'Query Count',
      data: props.data.map(q => q.count),
      backgroundColor: '#3B82F6',
      borderRadius: 6,
      barThickness: 30
    }
  ]
}))

const chartOptions = {
  indexAxis: 'y' as const,
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      titleColor: '#fff',
      bodyColor: '#fff',
      borderColor: '#3B82F6',
      borderWidth: 1,
      callbacks: {
        title: function(context: any) {
          const index = context[0].dataIndex
          return props.data[index].query
        },
        afterBody: function(context: any) {
          const index = context[0].dataIndex
          const query = props.data[index]
          return [
            `Count: ${query.count}`,
            `Avg Response: ${Math.round(query.avg_response_time_ms)}ms`
          ]
        }
      }
    }
  },
  scales: {
    x: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.05)'
      },
      ticks: {
        precision: 0
      }
    },
    y: {
      grid: {
        display: false
      }
    }
  }
}
</script>

<template>
  <div class="h-[400px]">
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>
