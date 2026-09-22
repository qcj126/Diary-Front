export const GOAL_CATEGORIES = Object.freeze(['技术', '学习', '健康', '生活'])

export const GOAL_STATUS = Object.freeze({
  0: { label: '未开始', type: 'not-started' },
  1: { label: '进行中', type: 'in-progress' },
  2: { label: '已暂停', type: 'paused' },
  3: { label: '已完成', type: 'completed' },
  4: { label: '已放弃', type: 'abandoned' },
})

export const GOAL_CHECKIN_TYPES = Object.freeze([
  { value: 1, label: '正常打卡' },
  { value: 2, label: '完成目标' },
  { value: 3, label: '重新开始' },
  { value: 4, label: '补打卡' },
])

export const GOAL_COLUMN_WIDTHS = Object.freeze({
  main: {
    controls: 78,
    creator: 70,
    category: 68,
    title: 118,
    content: 190,
    hours: 70,
    progress: 98,
    estimated: 78,
    status: 78,
    date: 96,
    ddl: 96,
    stale: 80,
    complete: 68,
  },
  sub: {
    title: 140,
    content: 300,
    hours: 90,
    progress: 140,
    estimated: 110,
    date: 120,
    stale: 120,
  },
})
