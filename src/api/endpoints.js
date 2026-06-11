export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:10000'

export const AUTH_API = {
  login: `${API_BASE}/user/login`,
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

export const API_ENDPOINTS = {
  auth: AUTH_API,
  loveDashboard: LOVE_DASHBOARD_API,
}
