export const DEFAULT_MENU_KEY = 'home'

export const MENU_ITEMS = Object.freeze([
  { key: 'home', label: '主页', icon: 'home', description: '进入生活总览', color: '#64748b' },
  { key: 'timeline', label: '时光机', icon: 'auto_stories', description: '浏览和记录生活片段', color: '#00b8d9' },
  { key: 'dates', label: '恋爱记录', icon: 'favorite', description: '管理纪念日与共同回忆', color: '#e85d75' },
  { key: 'diary', label: '厨房创食记', icon: 'edit_note', description: '维护食谱与烹饪记录', color: '#ba5839' },
  { key: 'wishlist', label: '阶段目标', icon: 'flag', description: '跟踪阶段目标与进度', color: '#ff9800' },
  { key: 'board', label: '生活随想', icon: 'chat_bubble', description: '保存随想与片刻灵感', color: '#6f7bd9' },
  { key: 'ledger', label: '账目', icon: 'payments', description: '记录并分析日常收支', color: '#3f7bd8' },
  { key: 'diet', label: '饮食记录', icon: 'restaurant', description: '记录饮食与营养数据', color: '#4d938a' },
  { key: 'ai-results', label: 'AI分析结果', icon: 'neurology', description: '查看异步分析任务结果', color: '#8b5cf6' },
  { key: 'system-database', label: '系统数据库', icon: 'database', description: '维护图标和食材资料', color: '#475569' },
])

export const HOME_MENU_ITEMS = Object.freeze(MENU_ITEMS.filter((item) => item.key !== DEFAULT_MENU_KEY))
