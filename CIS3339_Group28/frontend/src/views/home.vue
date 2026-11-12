<!-- This is the home view - which shows a dashboard -->
<template>
  <main>
    <div>
      <h1 class="font-bold text-4xl text-red-700 tracking-widest text-center mt-10">
        Dashboard
      </h1>
      <br />
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        <div class="ml-10"></div>
        <div class="flex flex-col col-span-2">
          <h1 class="font-bold text-4xl text-red-700 tracking-widest text-center mt-10">
              Events Attendance
          </h1>
      
          <div v-if="!recentEvents.length" class="flex justify-center mt-10">No events found.</div>
          <table v-if="recentEvents.length" class="min-w-full shadow-md rounded">
            <thead class="bg-gray-50 text-xl">
              <tr class="p-4 text-left">
                <th class="p-4 text-left">Event Name</th>
                <th class="p-4 text-left">Event Date</th>
                <th class="p-4 text-left">Number of Attendees</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-300"> 
              <tr
                class="cursor-pointer"
                @click="editEvent(event._id)"
                v-for="event in recentEvents"
                :key="event._id"
              >
                <td class="p-2 text-left">{{ event.name }}</td>
                <td class="p-2 text-left">{{ formatDate(event.date) }}</td>
                <td class="p-2 text-left">{{ event.attendees.length }}</td>
              </tr>
            </tbody>
          </table>
          
          <div v-if="recentEvents.length">
            <AttendanceChart
              v-if="!loading && !error"
              :label="labels"
              :chart-data="chartData"
            ></AttendanceChart>

            <!-- Start of loading animation -->
            <div class="mt-40" v-if="loading">
              <p
                class="text-6xl font-bold text-center text-gray-500 animate-pulse"
              >
                Loading...
              </p>
            </div>
            <!-- End of loading animation -->

            <!-- Start of error alert -->
            <div class="mt-12 bg-red-50" v-if="error">
              <h3 class="px-4 py-1 text-4xl font-bold text-white bg-red-800">
                {{ error.title }}
              </h3>
              <p class="p-4 text-lg font-bold text-red-900">
                {{ error.message }}
              </p>
            </div>
            <!-- End of error alert -->
          </div>
        </div>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        <div class="ml-10"></div>
        <div class="flex flex-col col-span-2">
          <h1 class="font-bold text-4xl text-red-700 tracking-widest text-center mt-10">
              Clients by Zip Code
          </h1>
          
          <div v-if="!zips.length" class="flex justify-center mt-10">No clients found.</div>
          <table v-if="zips.length" class="min-w-full shadow-md rounded">
            <thead class="bg-gray-50 text-xl">
              <tr class="p-4 text-left">
                <th class="p-4 text-left">Zip Number</th>
                <th class="p-4 text-left">Client Count</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-300">
              <tr
                v-for="zip in zips"
                :key="zip._id"
              >
                <td class="p-2 text-left">{{ zip._id }}</td>
                <td class="p-2 text-left">{{ zip.count }}</td>
              </tr>
            </tbody>
          </table>
          <div v-if="zips.length" class="flex justify-center mt-10">
            <ZipChart
              v-if="!zipLoading && !zipError"
              :label="zipLabels"
              :chart-data="zipChartData"
            ></ZipChart>

            <!-- Start of loading animation -->
            <div class="mt-40" v-if="zipLoading">
              <p
                class="text-6xl font-bold text-center text-gray-500 animate-pulse"
              >
                Loading...
              </p>
            </div>
            <!-- End of loading animation -->

            <!-- Start of error alert -->
            <div class="mt-12 bg-red-50" v-if="zipError">
              <h3 class="px-4 py-1 text-4xl font-bold text-white bg-red-800">
                {{ zipError.title }}
              </h3>
              <p class="p-4 text-lg font-bold text-red-900">
                {{ zipError.message }}
              </p>
            </div>
            <!-- End of error alert -->
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
// MIGRATION (Sprint 2): Options API -> Composition API (<script setup>)
// Removed: export default { components, data(), mounted(), methods }
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
// MIGRATION: components: { AttendanceChart, ZipChart } is no longer needed.
// In <script setup>, an imported component can be used in the template directly.
import AttendanceChart from '../components/barChart.vue'
import ZipChart from '../components/donutZipChart.vue'
import { getAttendance, getClientsByZipCode } from '../api/api'
// MIGRATION: formatDate was a copy-pasted method; now imported from a shared util
import { formatDate } from '../utils/formatDate'

const router = useRouter()

// MIGRATION: data() -> one ref() per value
const recentEvents = ref([])
const zips = ref([])
const labels = ref([])
const chartData = ref([])
const zipLabels = ref([])
const zipChartData = ref([])
const loading = ref(false)
const error = ref(null)
const zipLoading = ref(false)
const zipError = ref(null)

// Helper that turns an axios error into the { title, message } shape the template shows.
// MIGRATION: this logic was duplicated in both methods; it is now one function.
function toErrorMessage(err) {
  if (err.response) {
    // client received an error response (5xx, 4xx)
    return { title: 'Server Response', message: err.message }
  } else if (err.request) {
    // client never received a response, or request never left
    return { title: 'Unable to Reach Server', message: err.message }
  }
  // There's probably an error in your code
  return { title: 'Application Error', message: err.message }
}

// MIGRATION: methods: { getAttendanceData() } -> plain async function
async function getAttendanceData() {
  try {
    error.value = null
    loading.value = true

    const attendance = await getAttendance()
    recentEvents.value = attendance
    // MIGRATION: this.formatDate(...) -> imported formatDate(...)
    labels.value = attendance.map((item) => `${item.name} (${formatDate(item.date)})`)
    chartData.value = attendance.map((item) => item.attendees.length)
  } catch (err) {
    error.value = toErrorMessage(err)
  }
  loading.value = false
}

// MIGRATION: methods: { getZipData() } -> plain async function
async function getZipData() {
  try {
    zipError.value = null
    zipLoading.value = true

    const zipdata = await getClientsByZipCode()
    zips.value = zipdata
    zipLabels.value = zipdata.map((item) => item._id)
    zipChartData.value = zipdata.map((item) => item.count)
  } catch (err) {
    zipError.value = toErrorMessage(err)
  }
  zipLoading.value = false
}

// MIGRATION: the template called editEvent(event._id) but the Options API
// component never defined it, so clicking a row threw an error. It is now
// defined and opens that event's details page.
function editEvent(id) {
  router.push({ name: 'eventdetails', params: { id } })
}

// MIGRATION: mounted() { this.getAttendanceData(); this.getZipData() } -> onMounted()
onMounted(() => {
  getAttendanceData()
  getZipData()
})
</script>
