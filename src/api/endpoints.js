export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:10000'

export const AUTH_API = {
  login: `${API_BASE}/user/login`,
  refresh: `${API_BASE}/user/refresh`,
  register: `${API_BASE}/user/register`,
  resetPw: `${API_BASE}/user/resetPw`,
  verifyCode: `${API_BASE}/user/verifycode`,
}

export const LOVE_DASHBOARD_API = {
  timelineEvents: `${API_BASE}/love/timeline/events`,
  timelineCategories: `${API_BASE}/love/timeline/categories`,
  homeData: `${API_BASE}/love/home/data`,
  diary: `${API_BASE}/love/diary`,
  photos: `${API_BASE}/love/photos`,
  wishlist: `${API_BASE}/love/wishlist`,
  stats: `${API_BASE}/love/stats`,
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
  add: `${API_BASE}/file/icon/add`,
  query: `${API_BASE}/file/icon/query`,
  update: `${API_BASE}/file/icon/update`,
  delete: `${API_BASE}/file/icon/delete`,
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
  queryIcons: `${API_BASE}/icon/query`,
}

export const API_ENDPOINTS = {
  auth: AUTH_API,
  loveDashboard: LOVE_DASHBOARD_API,
  timeline: TIMELINE_API,
  icon: ICON_API,
  goal: GOAL_API,
  recipe: RECIPE_API,
}
