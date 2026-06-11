const DAY_MS = 24 * 60 * 60 * 1000

function toDate(value) {
  return value instanceof Date ? value : new Date(value)
}

export function daysDiff(from, to = new Date()) {
  const start = toDate(from)
  const end = toDate(to)
  const startAt = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime()
  const endAt = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime()
  return Math.max(0, Math.floor((endAt - startAt) / DAY_MS))
}

export function formatDate(value) {
  const d = toDate(value)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function milestoneInfo(startDate, step = 100) {
  const days = daysDiff(startDate, new Date()) + 1
  const next = Math.ceil(days / step) * step
  return {
    daysTogether: days,
    nextMilestone: next,
    daysToNext: next - days,
  }
}
