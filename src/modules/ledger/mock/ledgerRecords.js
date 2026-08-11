// 本地预览数据。接入后端时，只需让接口返回相同字段结构。
export const LEDGER_TODAY = new Date(2026, 7, 11)
export const LEDGER_TODAY_ISO = '2026-08-11'

export const expenseCategories = [
  { name: '居住', icon: '🏠', color: '#45B7D1', secondary: ['房贷/租金', '房屋杂费', '生活耗能'] },
  { name: '交通', icon: '🚗', color: '#4ECDC4', secondary: ['车辆费用', '公共交通', '长途出行'] },
  { name: '饮食', icon: '🍜', color: '#FF6B6B', secondary: ['日常餐饮', '饮品零食', '社交餐饮'] },
  { name: '购物', icon: '🛍️', color: '#96CEB4', secondary: ['服饰', '个护美妆', '数码电子', '日用百货'] },
  { name: '娱乐', icon: '💡', color: '#FFEAA7', secondary: ['文化消费', '兴趣爱好', '旅行度假'] },
  { name: '健康', icon: '💊', color: '#A88CDB', secondary: ['医疗', '健身'] },
  { name: '教育', icon: '🧑‍🎓', color: '#779FE8', secondary: ['自我提升', '子女教育'] },
  { name: '人情', icon: '🎁', color: '#E594B7', secondary: ['社交', '宠物'] },
  { name: '通讯', icon: '📱', color: '#F6B26B', secondary: ['话费网费'] },
]

export const incomeCategories = [
  { name: '红包', icon: '🧧', color: '#E594B7', secondary: ['红包'] },
  { name: '工资', icon: '💼', color: '#65B594', secondary: ['工资'] },
]

export const ledgerMockRecords = [
  { id: 1, date: '2026-08-11', type: 'expense', primary: '饮食', secondary: '日常餐饮', note: '公司楼下简餐', amount: 38 },
  { id: 2, date: '2026-08-11', type: 'expense', primary: '交通', secondary: '公共交通', note: '地铁通勤', amount: 6 },
  { id: 3, date: '2026-08-10', type: 'expense', primary: '购物', secondary: '日用百货', note: '生活用品补给', amount: 126.8 },
  { id: 4, date: '2026-08-09', type: 'expense', primary: '饮食', secondary: '社交餐饮', note: '周末朋友聚餐', amount: 268 },
  { id: 5, date: '2026-08-08', type: 'income', primary: '工资', secondary: '工资', note: '八月工资', amount: 13800 },
  { id: 6, date: '2026-08-07', type: 'expense', primary: '居住', secondary: '生活耗能', note: '水电燃气费', amount: 386.4 },
  { id: 7, date: '2026-08-06', type: 'expense', primary: '娱乐', secondary: '文化消费', note: '双人电影票', amount: 96 },
  { id: 8, date: '2026-08-05', type: 'expense', primary: '健康', secondary: '健身', note: '游泳月卡', amount: 299 },
  { id: 9, date: '2026-08-03', type: 'expense', primary: '居住', secondary: '房贷/租金', note: '八月房租', amount: 4200 },
  { id: 10, date: '2026-07-28', type: 'expense', primary: '教育', secondary: '自我提升', note: '设计课程', amount: 399 },
  { id: 11, date: '2026-07-20', type: 'income', primary: '红包', secondary: '红包', note: '生日红包', amount: 520 },
  { id: 12, date: '2026-06-18', type: 'expense', primary: '交通', secondary: '长途出行', note: '周末高铁票', amount: 458 },
  { id: 13, date: '2026-05-10', type: 'expense', primary: '通讯', secondary: '话费网费', note: '家庭宽带续费', amount: 1200 },
  { id: 14, date: '2026-03-16', type: 'expense', primary: '人情', secondary: '社交', note: '朋友婚礼礼金', amount: 1000 },
  { id: 15, date: '2026-08-02', type: 'expense', primary: '饮食', secondary: '饮品零食', note: '咖啡豆', amount: 88 },
  { id: 16, date: '2026-08-01', type: 'expense', primary: '交通', secondary: '车辆费用', note: '停车费', amount: 32 },
]
