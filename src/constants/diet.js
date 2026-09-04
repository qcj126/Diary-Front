export const DIET_SEGMENTS = Object.freeze([
  { key: 'all', label: '全部' },
  { key: 'today', label: '今日' },
  { key: 'week', label: '本周' },
  { key: 'month', label: '本月' },
  { key: 'habit', label: '习惯' },
])

export const MEAL_TYPE_OPTIONS = Object.freeze([
  { value: 10, label: '早餐' },
  { value: 15, label: '早加餐' },
  { value: 20, label: '午餐' },
  { value: 25, label: '午加餐' },
  { value: 30, label: '晚餐' },
  { value: 35, label: '夜宵' },
])

export const NUTRIENT_FIELDS = Object.freeze([
  { key: 'calories', label: '热量（kcal）', step: 1 },
  { key: 'protein', label: '蛋白质（g）', step: 0.1 },
  { key: 'carbohydrate', label: '碳水（g）', step: 0.1 },
  { key: 'fat', label: '脂肪（g）', step: 0.1 },
  { key: 'sugar', label: '糖（g）', step: 0.1 },
  { key: 'sodium', label: '钠（mg）', step: 0.1 },
])
