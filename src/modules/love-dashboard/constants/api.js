export const API_BASE = 'http://localhost:10000'

export const API = {
  // 恋爱时光轴相关API
  timelineEvents: `${API_BASE}/love/timeline/events`,
  timelineCategories: `${API_BASE}/love/timeline/categories`,
  
  // 恋爱首页相关API
  homeData: `${API_BASE}/love/home/data`,
  
  // 其他恋爱模块API
  diary: `${API_BASE}/love/diary`,
  photos: `${API_BASE}/love/photos`,
  wishlist: `${API_BASE}/love/wishlist`,
  stats: `${API_BASE}/love/stats`
}
