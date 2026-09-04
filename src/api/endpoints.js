export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:10000'

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
  moods: {
    add: `${API_BASE}/sys/info/add/moods`,
    query: `${API_BASE}/sys/info/query/moods`,
    update: `${API_BASE}/sys/info/update/moods`,
    delete: (id) => `${API_BASE}/sys/info/delete/moods/${encodeURIComponent(id)}`,
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
  add: `${API_BASE}/sys/info/icon/add`,
  query: `${API_BASE}/sys/info/icon/query`,
  update: `${API_BASE}/sys/info/icon/update`,
  delete: `${API_BASE}/sys/info/icon/delete`,
  file: (fileName) => `${API_BASE}/sys/info/icon/${encodeURIComponent(fileName)}`,
}

export const GOAL_API = {
  add: `${API_BASE}/goal/add`,
  batchAddSubGoal: `${API_BASE}/goal/batch/addSubGoal`,
  delete: `${API_BASE}/goal/delete`,
  update: `${API_BASE}/goal/update`,
  query: `${API_BASE}/goal/query`,
  export: `${API_BASE}/goal/export`,
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
  queryIcons: `${API_BASE}/sys/info/icon/query`,
}

export const DIET_API = {
  add: `${API_BASE}/diet/add`,
  query: `${API_BASE}/diet/query`,
  update: `${API_BASE}/diet/update`,
  delete: `${API_BASE}/diet/delete`,
}

export const SYS_INFO_API = {
  ingredientCategories: `${API_BASE}/sys/info/ingredients/category`,
  ingredients: `${API_BASE}/sys/info/ingredients`,
  addIngredient: `${API_BASE}/sys/info/ingredients/add`,
  cookWays: `${API_BASE}/sys/info/cook-ways`,
}

export const AI_API = {
  tasks: `${API_BASE}/ai/tasks`,
  taskStatus: (taskId) => `${API_BASE}/ai/tasks/${encodeURIComponent(taskId)}`,
  taskResult: (taskId) => `${API_BASE}/ai/tasks/${encodeURIComponent(taskId)}/result`,
}

export const API_ENDPOINTS = {
  auth: AUTH_API,
  loveDashboard: LOVE_DASHBOARD_API,
  timeline: TIMELINE_API,
  icon: ICON_API,
  goal: GOAL_API,
  diet: DIET_API,
  recipe: RECIPE_API,
  sysInfo: SYS_INFO_API,
  ai: AI_API,
}
