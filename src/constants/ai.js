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

export const AI_TASK_STORAGE_KEY = 'diary-ai-tasks-v1'
export const MAX_TRACKED_AI_TASKS = 100
