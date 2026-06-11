import { reactive } from 'vue'

const state = reactive({
  items: [],
})

let seq = 1

export function pushToast(message, type = 'error', duration = 2600) {
  const text = String(message ?? '').trim()
  if (!text) return

  const id = seq++
  state.items.push({ id, message: text, type })
  setTimeout(() => removeToast(id), duration)
}

export function removeToast(id) {
  const i = state.items.findIndex((x) => x.id === id)
  if (i >= 0) state.items.splice(i, 1)
}

export function useToastState() {
  return state
}

