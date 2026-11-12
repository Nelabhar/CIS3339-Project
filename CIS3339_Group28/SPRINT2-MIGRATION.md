# Sprint 2 – Options API → Composition API (Group 28)

Every Vue file in `frontend/src` now uses `<script setup>`. No `export default`,
`data()`, `methods`, `mounted()`, `created()`, `this.$route` or `this.$router` remains.
Each converted block has a `// MIGRATION:` comment that explains what it replaced.

## Migration patterns used

| Options API (before)                   | Composition API (after)                       |
| -------------------------------------- | --------------------------------------------- |
| `data() { return { x: 1 } }`           | `const x = ref(1)` (use `x.value` in script)  |
| `methods: { save() {} }`               | `function save() {}`                          |
| `mounted()` / `created()`              | `onMounted(() => {})`                         |
| `props: { label: Array }`              | `const props = defineProps({ label: Array })` |
| `components: { Chart }`                | just `import Chart from ...`                  |
| `this.$route.params.id`                | `const route = useRoute(); route.params.id`   |
| `this.$router.push(...)`               | `const router = useRouter(); router.push()`   |
| `this.$refs.canvas`                    | `const canvas = ref(null)` + `ref="canvas"`   |
| `validations()` + `useVuelidate()`     | `useVuelidate(rules, { state })`              |
| `setup() { return { store } }`         | `const store = useStore()`                    |

## Files migrated

- `App.vue`
- `components/barChart.vue`, `components/donutZipChart.vue`
- `views/login.vue`, `views/home.vue`
- `views/clientform.vue`, `views/findclient.vue`, `views/clientdetails.vue`
- `views/eventform.vue`, `views/findevents.vue`, `views/eventDetails.vue`
- `views/serviceform.vue`, `views/findservice.vue`, `views/servicedetails.vue`

## Related changes made during the migration

- **New `src/utils/formatDate.js`**: one shared `formatDate()` replaces four copy-pasted methods.
- **Charts**: they now update when their data changes (`watch`) and are destroyed on unmount
  (`onBeforeUnmount`), which stops the memory leak. The useless `await new Chart()` was removed.
- **`router/index.js`**: the import `eventdetails.vue` was changed to `eventDetails.vue`. The old
  lowercase name breaks the build on Mac/Linux, where file names are case-sensitive.
- **`App.vue`**: the logo path `@\assets\...` (Windows-only) became `@/assets/...`. Removed the
  dead Vuex `logout()` method and fixed `catch { throw (error) }`, which referenced an
  undefined variable.
- **`home.vue`**: the template called `editEvent()`, but it was never defined. It now opens
  the event's details.
- **`findevents.vue`**: removed `this.isLoading`, which was never declared.

## Verified

- `npm run build` succeeds.
- A headless-browser test against a mock API passed every page and workflow: dashboard and
  charts, login/logout, find/search for clients, events and services, all three create forms
  with validation, client/event/service details, update, register a client for an event, the
  delete guard, and the back buttons.

## Known issues left for Sprint 3 (not in this sprint's scope)

- Login doesn't survive a page refresh (F4: session restore).
- Error toasts sometimes show `[object Object]` (F2: `useApi` + Axios interceptor).
- Routes don't check roles yet, only that the user is logged in (F4).
