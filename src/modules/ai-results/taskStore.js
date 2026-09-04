import {
  AI_APPLICATION_OPTIONS,
  AI_FLAG_OPTIONS,
  AI_TASK_STORAGE_KEY,
  MAX_TRACKED_AI_TASKS,
} from '../../constants/ai.js'

function normalizeTask(task) {
  const taskId = String(task?.taskId ?? '').trim()
  if (!taskId) return null

  const aiApplication = Number(task?.aiApplication)
  return {
    ...task,
    taskId,
    flag: String(task?.flag ?? '').trim().toUpperCase(),
    aiApplication: Number.isFinite(aiApplication) ? aiApplication : null,
  }
}

export function getAiFlagLabel(flag) {
  const value = String(flag ?? '').trim().toUpperCase()
  return AI_FLAG_OPTIONS.find((item) => item.value === value)?.label || value || '未知来源'
}

export function getAiApplicationLabel(code) {
  const value = Number(code)
  return AI_APPLICATION_OPTIONS.find((item) => item.value === value)?.label ||
    (Number.isFinite(value) ? `应用方向 ${value}` : '未知应用方向')
}

export function loadTrackedAiTasks() {
  try {
    const value = JSON.parse(window.localStorage.getItem(AI_TASK_STORAGE_KEY) || '[]')
    if (!Array.isArray(value)) return []
    return value.map(normalizeTask).filter(Boolean)
  } catch {
    return []
  }
}

export function saveTrackedAiTask(task) {
  const normalized = normalizeTask(task)
  if (!normalized) return null

  const tasks = loadTrackedAiTasks()
  const existing = tasks.find((item) => item.taskId === normalized.taskId)
  const nextTask = {
    ...existing,
    ...normalized,
    submittedAt: normalized.submittedAt || existing?.submittedAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  const nextTasks = [nextTask, ...tasks.filter((item) => item.taskId !== normalized.taskId)]
    .slice(0, MAX_TRACKED_AI_TASKS)
  window.localStorage.setItem(AI_TASK_STORAGE_KEY, JSON.stringify(nextTasks))
  return nextTask
}

export function removeTrackedAiTask(taskId) {
  const value = String(taskId ?? '')
  const tasks = loadTrackedAiTasks().filter((item) => item.taskId !== value)
  window.localStorage.setItem(AI_TASK_STORAGE_KEY, JSON.stringify(tasks))
}
