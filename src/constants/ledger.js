export const EXPENSE_CATEGORIES = Object.freeze([
  { name: '居住', icon: '🏠', color: '#45B7D1', secondary: ['房贷/租金', '房屋杂费', '生活耗能'] },
  { name: '交通', icon: '🚗', color: '#4ECDC4', secondary: ['车辆费用', '公共交通', '长途出行'] },
  { name: '饮食', icon: '🍜', color: '#FF6B6B', secondary: ['日常餐饮', '饮品零食', '社交餐饮'] },
  { name: '购物', icon: '🛍️', color: '#96CEB4', secondary: ['服饰', '个护美妆', '数码电子', '日用百货'] },
  { name: '娱乐', icon: '💡', color: '#FFEAA7', secondary: ['文化消费', '兴趣爱好', '旅行度假'] },
  { name: '健康', icon: '💊', color: '#A88CDB', secondary: ['医疗', '健身'] },
  { name: '教育', icon: '🧑‍🎓', color: '#779FE8', secondary: ['自我提升', '子女教育'] },
  { name: '人情', icon: '🎁', color: '#E594B7', secondary: ['社交', '宠物'] },
  { name: '通讯', icon: '📱', color: '#F6B26B', secondary: ['话费网费'] },
])

export const INCOME_CATEGORIES = Object.freeze([
  { name: '红包', icon: '🧧', color: '#E594B7', secondary: ['红包'] },
  { name: '工资', icon: '💼', color: '#65B594', secondary: ['工资'] },
])

export const LEDGER_PERIODS = Object.freeze([
  { key: 'today', label: '今日', short: '日' },
  { key: 'week', label: '本周', short: '周' },
  { key: 'month', label: '本月', short: '月' },
  { key: 'quarter', label: '本季', short: '季' },
  { key: 'year', label: '今年', short: '年' },
])
