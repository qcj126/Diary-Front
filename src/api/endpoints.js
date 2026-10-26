export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://192.168.101.128:10000'

export function resolveApiUrl(path) {
  const value = String(path ?? '').trim()
  if (!value || /^(https?:)?\/\//i.test(value) || value.startsWith('data:') || value.startsWith('blob:')) return value
  return `${API_BASE}${value.startsWith('/') ? '' : '/'}${value}`
}

function decodeFileName(fileName) {
  const value = String(fileName ?? '').trim()
  if (!value) return ''

  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

export const AUTH_API = {
  login: `${API_BASE}/user/login`,
  refresh: `${API_BASE}/user/refresh`,
  register: `${API_BASE}/user/register`,
  resetPw: `${API_BASE}/user/resetPw`,
  verifyCode: `${API_BASE}/user/verifycode`,
}

export const LOVE_DASHBOARD_API = {
  couples: {
    add: `${API_BASE}/love/add/couples`,
    query: `${API_BASE}/love/query/couples`,
    update: `${API_BASE}/love/update/couples`,
    delete: (id) => `${API_BASE}/love/delete/couples/${encodeURIComponent(id)}`,
  },
  anniversaries: {
    add: `${API_BASE}/love/add/anniversaries`,
    query: (coupleId) => `${API_BASE}/love/query/anniversaries/${encodeURIComponent(coupleId)}`,
    update: `${API_BASE}/love/update/anniversaries`,
    delete: (id) => `${API_BASE}/love/delete/anniversaries/${encodeURIComponent(id)}`,
  },
  locations: {
    query: (coupleId) => `${API_BASE}/love/query/locations/${encodeURIComponent(coupleId)}`,
    update: `${API_BASE}/love/update/locations`,
    delete: (id) => `${API_BASE}/love/delete/locations/${encodeURIComponent(id)}`,
  },
  records: {
    add: `${API_BASE}/love/add/records`,
    query: `${API_BASE}/love/query/records`,
    detail: (id) => `${API_BASE}/love/query/records/${encodeURIComponent(id)}`,
    update: `${API_BASE}/love/update/records`,
    delete: (id) => `${API_BASE}/love/delete/records/${encodeURIComponent(id)}`,
  },
  recordImages: {
    add: `${API_BASE}/love/add/record-images`,
    query: (recordId) => `${API_BASE}/love/query/record-images/${encodeURIComponent(recordId)}`,
    update: `${API_BASE}/love/update/record-images`,
    delete: (id) => `${API_BASE}/love/delete/record-images/${encodeURIComponent(id)}`,
  },
  recordMoods: {
    query: (recordId) => `${API_BASE}/love/query/record-moods/${encodeURIComponent(recordId)}`,
  },
  moods: {
    add: `${API_BASE}/love/add/moods`,
    query: (enabled) => enabled == null
      ? `${API_BASE}/love/query/moods`
      : `${API_BASE}/love/query/moods?enabled=${encodeURIComponent(enabled)}`,
    update: `${API_BASE}/love/update/moods`,
    delete: (id) => `${API_BASE}/love/delete/moods/${encodeURIComponent(id)}`,
  },
  files: {
    uploadImages: `${API_BASE}/file/upload/images`,
    queryImageUrls: `${API_BASE}/file/query/images/urls`,
  },
}

export const TIMELINE_API = {
  uploadImages: `${API_BASE}/file/upload/images`,
  queryImageUrls: `${API_BASE}/file/query/images/urls`,
  queryCarouselImages: `${API_BASE}/file/query/images/carousel`,
  categoryAdd: `${API_BASE}/time-machine/category/add`,
  categoryUpdate: `${API_BASE}/time-machine/category/update`,
  categoryDelete: `${API_BASE}/time-machine/category/delete`,
  categoryQuery: `${API_BASE}/time-machine/category/query`,
  cardAdd: `${API_BASE}/time-machine/card/add`,
  cardUpdate: `${API_BASE}/time-machine/card/update`,
  cardDelete: `${API_BASE}/time-machine/card/delete`,
  cardQuery: `${API_BASE}/time-machine/card/query`,
}

export const ICON_API = {
  add: `${API_BASE}/file/sys/icon/add`,
  query: `${API_BASE}/file/sys/icon/query`,
  update: `${API_BASE}/file/sys/icon/update`,
  delete: `${API_BASE}/file/sys/icon/delete`,
  file: (fileName) => `${API_BASE}/file/sys/icon/${encodeURIComponent(decodeFileName(fileName))}`,
}

export const IMAGE_API = {
  file: (fileName) => `${API_BASE}/file/images/${encodeURIComponent(decodeFileName(fileName))}`,
  upload: `${API_BASE}/file/upload/images`,
  queryUrls: `${API_BASE}/file/query/images/urls`,
}

export const GOAL_API = {
  add: `${API_BASE}/goal/add`,
  batchAddSubGoal: `${API_BASE}/goal/batch/addSubGoal`,
  delete: (id) => `${API_BASE}/goal/delete/${encodeURIComponent(id)}`,
  update: `${API_BASE}/goal/update`,
  query: `${API_BASE}/goal/query`,
  export: (query = '') => `${API_BASE}/goal/export${query ? `?${query}` : ''}`,
  dashboardReview: `${API_BASE}/goal/dashboard/review`,
  checkin: {
    add: `${API_BASE}/goal/checkin/add`,
    update: `${API_BASE}/goal/checkin/update`,
    delete: (id) => `${API_BASE}/goal/checkin/delete/${encodeURIComponent(id)}`,
    detail: (id) => `${API_BASE}/goal/checkin/query/${encodeURIComponent(id)}`,
    query: `${API_BASE}/goal/checkin/query`,
  },
}

export const RECIPE_API = {
  add: `${API_BASE}/recipe/add`,
  query: `${API_BASE}/recipe/query`,
  update: `${API_BASE}/recipe/update`,
  delete: `${API_BASE}/recipe/delete`,
  addCategory: `${API_BASE}/recipe/add/category`,
  queryCategory: `${API_BASE}/recipe/query/category`,
  updateCategory: `${API_BASE}/recipe/update/category`,
  deleteCategory: `${API_BASE}/recipe/delete/category`,
  uploadImages: `${API_BASE}/file/upload/images`,
  queryImageUrls: `${API_BASE}/file/query/images/urls`,
  queryIcons: `${API_BASE}/file/sys/icon/query`,
}

export const DIET_API = {
  add: `${API_BASE}/diet/add`,
  query: `${API_BASE}/diet/query`,
  update: `${API_BASE}/diet/update`,
  delete: (id) => `${API_BASE}/diet/delete/${encodeURIComponent(id)}`,
}

// diary-sysinfo 已移除，系统食材数据由 diary-recipe 提供。
export const RECIPE_SYS_API = {
  ingredientCategories: `${API_BASE}/recipe/sys/ingredients/category`,
  ingredients: `${API_BASE}/recipe/sys/ingredients`,
  addIngredient: `${API_BASE}/recipe/sys/ingredients/add`,
  cookWays: `${API_BASE}/recipe/sys/cook-ways`,
}

export const AI_API = {
  nutrition: {
    submit: `${API_BASE}/ai/nutrient/task/nutrient-analyze`,
    taskStatus: (taskId) => `${API_BASE}/ai/nutrient/tasks/${encodeURIComponent(taskId)}`,
    taskResult: (taskId) => `${API_BASE}/ai/nutrient/tasks/${encodeURIComponent(taskId)}/result`,
  },
  sentiment: {
    submit: `${API_BASE}/ai/sentiment/task/love-record-analyze`,
    taskStatus: (taskId) => `${API_BASE}/ai/sentiment/tasks/${encodeURIComponent(taskId)}`,
    taskResult: (taskId) => `${API_BASE}/ai/sentiment/tasks/${encodeURIComponent(taskId)}/result`,
  },
  taskList: `${API_BASE}/ai/tasks/query/list`,
}

export const API_ENDPOINTS = {
  auth: AUTH_API,
  loveDashboard: LOVE_DASHBOARD_API,
  timeline: TIMELINE_API,
  icon: ICON_API,
  image: IMAGE_API,
  goal: GOAL_API,
  diet: DIET_API,
  recipe: RECIPE_API,
  recipeSys: RECIPE_SYS_API,
  ai: AI_API,
}
