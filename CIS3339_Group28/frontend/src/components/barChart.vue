<template>
  <div>
    <canvas class="p-10" ref="attendanceChart"></canvas>
  </div>
</template>

<script setup>
// MIGRATION (Sprint 2): Options API -> Composition API (<script setup>)
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { Chart, registerables } from 'chart.js'
import { Colors } from 'chart.js'

Chart.register(...registerables)
Chart.register(Colors)

// MIGRATION: props: { label, chartData } -> defineProps()
const props = defineProps({
  label: {
    type: Array
  },
  chartData: {
    type: Array
  }
})

// MIGRATION: this.$refs.attendanceChart -> template ref
// A ref() with the same name as ref="attendanceChart" in the template is filled
// with the <canvas> element after mount.
const attendanceChart = ref(null)

// holds the Chart.js instance so it can be updated and destroyed
let chart = null

// MIGRATION: async mounted() { await new Chart(...) } -> onMounted()
// The old `await` on a constructor did nothing, so it was removed.
onMounted(() => {
  chart = new Chart(attendanceChart.value, {
    type: 'bar',
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
      scales: {
        y: {
          ticks: {
            stepSize: 1
          }
        },
        x: {
          gridLines: {
            display: false
          }
        }
      },
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: true,
          text: 'Attendance Chart'
        }
      },
      responsive: true,
      maintainAspectRatio: true
    }
  })
})

// MIGRATION: new watch() - the Options API version never reacted to prop changes,
// so the chart went stale. Now new labels/data are pushed into the chart.
watch(
  () => [props.label, props.chartData],
  ([newLabels, newData]) => {
    if (!chart) return
    chart.data.labels = newLabels
    chart.data.datasets[0].data = newData
    chart.update()
  }
)

// MIGRATION: new onBeforeUnmount() - the chart was never destroyed before,
// leaking the canvas and its listeners every time you left the dashboard.
onBeforeUnmount(() => {
  if (chart) {
    chart.destroy()
    chart = null
  }
})
</script>

