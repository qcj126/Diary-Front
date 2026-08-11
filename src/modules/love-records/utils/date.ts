const DAY_MS = 86_400_000

export function parseLocalDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function daysBetween(from: Date, to: Date): number {
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate()).getTime()
  const end = new Date(to.getFullYear(), to.getMonth(), to.getDate()).getTime()
  return Math.round((end - start) / DAY_MS)
}

export function nextOccurrence(value: string, base = new Date()): Date {
  const source = parseLocalDate(value)
  let result = new Date(base.getFullYear(), source.getMonth(), source.getDate())
  const today = new Date(base.getFullYear(), base.getMonth(), base.getDate())
  if (result < today) result = new Date(base.getFullYear() + 1, source.getMonth(), source.getDate())
  return result
}

export function formatDate(value: string, full = false): string {
  return new Intl.DateTimeFormat('zh-CN', full
    ? { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }
    : { month: '2-digit', day: '2-digit', weekday: 'short' }).format(parseLocalDate(value))
}

export function formatMonth(value: string): string {
  return new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: 'long' }).format(parseLocalDate(value))
}

export function toInputDate(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
