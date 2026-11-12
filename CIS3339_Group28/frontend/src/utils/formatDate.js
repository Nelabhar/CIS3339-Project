// MIGRATION (Sprint 2): formatDate() used to be copy-pasted as a method inside
// home.vue, findevents.vue, clientdetails.vue and servicedetails.vue (Options API
// `methods: { formatDate() }`). With the Composition API, shared logic lives in a
// plain module that any <script setup> component can import, so there is now one
// definition instead of four.

// Formats an ISO date string (stored in UTC by the backend) as MM/DD/YYYY
export function formatDate(date) {
  const isoDate = new Date(date)
  const year = isoDate.getUTCFullYear()
  const month = String(isoDate.getUTCMonth() + 1).padStart(2, '0')
  const day = String(isoDate.getUTCDate()).padStart(2, '0')
  return `${month}/${day}/${year}`
}
