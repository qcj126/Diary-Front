import { computed } from 'vue'
import { expenseCategories, LEDGER_TODAY } from '../mock/ledgerRecords.js'

const DAY_MS = 86400000

function startOfWeek(date) {
  const result = new Date(date)
  const offset = (result.getDay() + 6) % 7
  result.setDate(result.getDate() - offset)
  result.setHours(0, 0, 0, 0)
  return result
}

function toIso(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function useLedgerAnalytics(records, activePeriod, filters, drillCategory, drillDate) {
  const periodRecords = computed(() => records.value.filter((record) => isInPeriod(record.date, activePeriod.value)))

  // 顶部概览使用当前周期数据；快捷分类和日期下钻会联动更新。
  const drilledRecords = computed(() => periodRecords.value.filter((record) => {
    return (!drillCategory.value || record.primary === drillCategory.value)
      && (!drillDate.value || record.date === drillDate.value)
  }))

  const filteredRecords = computed(() => {
    const query = filters.keyword.toLowerCase()
    const recentStart = filters.recentDays
      ? new Date(LEDGER_TODAY.getFullYear(), LEDGER_TODAY.getMonth(), LEDGER_TODAY.getDate() - filters.recentDays + 1)
      : null
    return drilledRecords.value.filter((record) => {
      const date = new Date(`${record.date}T00:00:00`)
      return (!query || [record.note, record.primary, record.secondary].join(' ').toLowerCase().includes(query))
        && (filters.type === 'all' || record.type === filters.type)
        && (filters.category === 'all' || record.primary === filters.category)
        && (!recentStart || date >= recentStart)
        && (!filters.exactDate || record.date === filters.exactDate)
    }).sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id)
  })

  const expenseRecords = computed(() => drilledRecords.value.filter((record) => record.type === 'expense'))
  const incomeRecords = computed(() => drilledRecords.value.filter((record) => record.type === 'income'))
  const totalExpense = computed(() => sum(expenseRecords.value))
  const totalIncome = computed(() => sum(incomeRecords.value))
  const balance = computed(() => totalIncome.value - totalExpense.value)
  const expenseCount = computed(() => expenseRecords.value.length)
  const incomeCount = computed(() => incomeRecords.value.length)
  const periodDayCount = computed(() => ({ today: 1, week: 7, month: LEDGER_TODAY.getDate(), quarter: 42, year: 223 })[activePeriod.value] || 7)
  const dailyAverage = computed(() => totalExpense.value / periodDayCount.value)
  const savingRate = computed(() => totalIncome.value > 0 ? balance.value / totalIncome.value * 100 : 0)
  const largestExpense = computed(() => expenseRecords.value.reduce((largest, item) => !largest || item.amount > largest.amount ? item : largest, null))

  // 环形图：当前周期支出按一级分类聚合。
  const categoryData = computed(() => expenseCategories.map((category) => {
    const items = expenseRecords.value.filter((record) => record.primary === category.name)
    return { name: category.name, value: sum(items), count: items.length, itemStyle: { color: category.color } }
  }).filter((item) => item.value > 0).sort((a, b) => b.value - a.value))
  const largestCategory = computed(() => categoryData.value[0] || null)

  // 柱状图：固定按本周周一到周日聚合，缺失日期补 0。
  const weeklyDailyData = computed(() => {
    const monday = startOfWeek(LEDGER_TODAY)
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(monday.getTime() + index * DAY_MS)
      const iso = toIso(date)
      const value = sum(records.value.filter((record) => record.type === 'expense' && record.date === iso && (!drillCategory.value || record.primary === drillCategory.value)))
      return { date: iso, label: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'][index], value }
    })
  })
  const weeklyAverage = computed(() => weeklyDailyData.value.reduce((total, item) => total + item.value, 0) / 7)
  const highestDay = computed(() => weeklyDailyData.value.reduce((largest, item) => item.value > largest.value ? item : largest, weeklyDailyData.value[0]))

  // 月度累计折线：逐日累计本月支出。
  const monthlyCumulative = computed(() => {
    let runningTotal = 0
    return Array.from({ length: LEDGER_TODAY.getDate() }, (_, index) => {
      const date = new Date(LEDGER_TODAY.getFullYear(), LEDGER_TODAY.getMonth(), index + 1)
      const iso = toIso(date)
      runningTotal += sum(records.value.filter((record) => record.type === 'expense' && record.date === iso))
      return { date: iso, label: `${index + 1}日`, value: Number(runningTotal.toFixed(2)) }
    })
  })

  const subtotal = computed(() => ({ count: filteredRecords.value.length, amount: filteredRecords.value.reduce((total, item) => total + Number(item.amount), 0) }))
  const personality = computed(() => {
    const name = largestCategory.value?.name
    if (!name) return '本周消费节奏很轻，继续保持从容记录。'
    const messages = {
      居住: '本周你是个务实的生活建设者，稳定感是你的消费主线。',
      饮食: '本周你是个认真吃饭的生活家，也别忘了为体验留一点预算。',
      交通: '本周你的行动半径很活跃，下一周可以试试更经济的出行组合。',
      购物: '本周你偏爱用新物件改善生活，记得给冲动消费留冷静期。',
      娱乐: '本周你很会为快乐买单，体验型消费让生活更有记忆点。',
    }
    return messages[name] || `本周支出主要集中在${name}，你的消费目标很清晰。`
  })
  const predictedDailyExpense = computed(() => weeklyAverage.value * 1.06)

  return {
    periodRecords, filteredRecords, totalExpense, totalIncome, balance, expenseCount, incomeCount,
    dailyAverage, savingRate, largestExpense, categoryData, largestCategory, weeklyDailyData,
    weeklyAverage, highestDay, monthlyCumulative, subtotal, personality, predictedDailyExpense,
  }
}

function sum(items) {
  return items.reduce((total, item) => total + Number(item.amount ?? item.value ?? 0), 0)
}

function isInPeriod(dateString, period) {
  const date = new Date(`${dateString}T00:00:00`)
  const start = new Date(LEDGER_TODAY)
  if (period === 'today') start.setHours(0, 0, 0, 0)
  if (period === 'week') return date >= startOfWeek(LEDGER_TODAY) && date <= LEDGER_TODAY
  if (period === 'month') start.setDate(1)
  if (period === 'quarter') start.setMonth(Math.floor(LEDGER_TODAY.getMonth() / 3) * 3, 1)
  if (period === 'year') start.setMonth(0, 1)
  return date >= start && date <= LEDGER_TODAY
}
