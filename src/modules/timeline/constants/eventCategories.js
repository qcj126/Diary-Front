export const EVENT_CATEGORIES = [
  {
    key: 'food',
    label: '美食',
    icon: '🍜',
    color: 'orange',
  },
  {
    key: 'bead_art',
    label: '拼豆',
    icon: '🧩',
    color: 'cyan',
  },
  {
    key: 'gift',
    label: '礼物',
    icon: '🎁',
    color: 'purple',
  },
  {
    key: 'snack',
    label: '零食',
    icon: '🍪',
    color: 'gold',
  },
  {
    key: 'milk_tea',
    label: '奶茶',
    icon: '🧋',
    color: 'pink',
  },
  {
    key: 'travel',
    label: '旅行',
    icon: '✈️',
    color: 'indigo',
  },
  {
    key: 'daily_life',
    label: '日常',
    icon: '🏠',
    color: 'gray',
  },
  {
    key: 'exercise',
    label: '锻炼',
    icon: '🏃',
    color: 'green',
  },
  {
    key: 'walk',
    label: '散步',
    icon: '🚶',
    color: 'blue',
  },
]

export const CATEGORY_FILTER_MAP = {
  bead_art: {
    categoryKey: 'wishlist_complete',
    subcategoryKey: 'experience_wish',
  },
  snack: {
    categoryKey: 'food',
    subcategoryKey: 'takeout',
  },
  milk_tea: {
    categoryKey: 'food',
    subcategoryKey: 'dessert',
  },
  exercise: {
    categoryKey: 'daily_life',
    subcategoryKey: 'walk',
  },
  walk: {
    categoryKey: 'daily_life',
    subcategoryKey: 'walk',
  },
}

export const COLOR_MAP = {
  blue: { primary: '#3b82f6', light: '#dbeafe', bg: '#eff6ff' },
  purple: { primary: '#8b5cf6', light: '#ede9fe', bg: '#f5f3ff' },
  pink: { primary: '#ec4899', light: '#fce7f3', bg: '#fdf2f8' },
  cyan: { primary: '#06b6d4', light: '#cffafe', bg: '#ecfeff' },
  red: { primary: '#ef4444', light: '#fee2e2', bg: '#fef2f2' },
  orange: { primary: '#f97316', light: '#ffedd5', bg: '#fff7ed' },
  gold: { primary: '#eab308', light: '#fef9c3', bg: '#fefce8' },
  green: { primary: '#22c55e', light: '#dcfce7', bg: '#f0fdf4' },
  indigo: { primary: '#6366f1', light: '#e0e7ff', bg: '#eef2ff' },
  gray: { primary: '#6b7280', light: '#f3f4f6', bg: '#f9fafb' },
}
