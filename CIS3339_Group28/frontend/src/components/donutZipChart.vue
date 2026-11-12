<template>
  <div class="w-1/2">
    <canvas class="p-10" ref="zipChart"></canvas>
  </div>
</template>

<script setup>
// MIGRATION (Sprint 2): Options API -> Composition API (<script setup>)
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

// MIGRATION: props: { label, chartData } -> defineProps()
//define props (label and chartData)
const props = defineProps({
  label: {
    type: Array
  },
  chartData: {
    type: Array
  }
})

// MIGRATION: this.$refs.zipChart -> template ref (same name as ref="zipChart")
const zipChart = ref(null)

// holds the Chart.js instance so it can be updated and destroyed
let chart = null

// MIGRATION: async mounted() { await new Chart(...) } -> onMounted()
// (removed the meaningless `await` on the constructor)
onMounted(() => {
  //uses the data to load the chart's values
  chart = new Chart(zipChart.value, {
    type: 'doughnut',
    data: {
      labels: props.label,
      datasets: [
        {
          borderWidth: 1,
          data: props.chartData
        }
      ]
    },
    options: {
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: true,
          text: 'Clients by Zip Code'
        }
      },
      responsive: true,
      maintainAspectRatio: true
    }
  })
})

// MIGRATION: new watch() so the chart updates when its props change
watch(
  () => [props.label, props.chartData],
  ([newLabels, newData]) => {
    if (!chart) return
    chart.data.labels = newLabels
    chart.data.datasets[0].data = newData
    chart.update()
  }
)

// MIGRATION: new onBeforeUnmount() - destroy the chart to avoid a memory leak
onBeforeUnmount(() => {
  if (chart) {
    chart.destroy()
    chart = null
  }
})
</script>
