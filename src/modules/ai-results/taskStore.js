export const AI_FLAG_OPTIONS = Object.freeze([
  { value: 'DIET', label: '饮食记录' },
  { value: 'RECIPE', label: '厨房创食记' },
  { value: 'GOAL', label: '阶段目标' },
])

export const AI_APPLICATION_OPTIONS = Object.freeze([
  { value: 1, label: '营养分析' },
  { value: 2, label: '感情分析' },
  { value: 3, label: '情绪解析' },
  { value: 4, label: '饮食分析' },
  { value: 5, label: '账单分析' },
  { value: 6, label: '天气分析' },
  { value: 7, label: '饮食推荐' },
])

const STORAGE_KEY = 'diary-ai-tasks-v1'
const MAX_TRACKED_TASKS = 100

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
    const value = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]')
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
    .slice(0, MAX_TRACKED_TASKS)
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextTasks))
  return nextTask
}

export function removeTrackedAiTask(taskId) {
  const value = String(taskId ?? '')
  const tasks = loadTrackedAiTasks().filter((item) => item.taskId !== value)
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
}
