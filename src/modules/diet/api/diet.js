import { DIET_API } from '../../../api/index.js'
import { getAuthSession } from '../../auth/session.js'

const DEFAULT_USER_ID = 10000

const mealTypeMap = {
  10: { type: 'breakfast', period: '早餐' },
  15: { type: 'snack', period: '早加餐' },
  20: { type: 'lunch', period: '午餐' },
  25: { type: 'snack', period: '午加餐' },
  30: { type: 'dinner', period: '晚餐' },
  35: { type: 'snack', period: '夜宵' },
}

function authHeaders() {
  const session = getAuthSession()
  const headers = { 'Content-Type': 'application/json' }
  if (session?.accessToken) {
    headers.Authorization = `${session.tokenType || 'Bearer'} ${session.accessToken}`
  }
  return headers
}

function parseApiPayload(text) {
  if (!text) return null
  try {
    const safeText = text.replace(/(:\s*|\[\s*|,\s*)(-?\d{16,})(?=\s*[,}\]])/g, '$1"$2"')
    return JSON.parse(safeText)
  } catch {
    return text
  }
}

function assertApiSuccess(res, data, fallback) {
  const code = data && typeof data === 'object' ? data.code : undefined
  const okCode = code === undefined || String(code) === '200' || String(code) === '0'
  if (res.ok && okCode) return

  const message =
    (data && typeof data === 'object' && (data.message || data.msg || data.error)) || fallback
  throw new Error(message)
}

function responseData(data) {
  return data && typeof data === 'object' && 'data' in data ? data.data : data
}

async function postJson(url, body, fallback) {
  const res = await fetch(url, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  })
  const data = parseApiPayload(await res.text())
  assertApiSuccess(res, data, fallback)
  return responseData(data)
}

function toNumber(value) {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

function compactObject(object) {
  return Object.fromEntries(
    Object.entries(object).filter(([, value]) => value !== '' && value !== null && value !== undefined),
  )
}

export function currentDietUserId() {
  return getAuthSession()?.userId ?? DEFAULT_USER_ID
}

export function normalizeDietRecord(raw = {}) {
  const meal = mealTypeMap[Number(raw.mealType)] || { type: 'snack', period: raw.mealTypeName || '其他' }
  const eatTime = String(raw.eatTime || '')
  return {
    id: raw.id,
    userId: raw.userId,
    mealType: Number(raw.mealType),
    type: meal.type,
    period: raw.mealTypeName || meal.period,
    time: eatTime.slice(11, 16),
    recordedAt: eatTime.replace('T', ' '),
    eatTime,
    place: raw.location || 'home',
    name: raw.foodName || '',
    desc: raw.note || '',
    kcal: toNumber(raw.calories),
    protein: toNumber(raw.protein),
    carbs: toNumber(raw.carbohydrate),
    fat: toNumber(raw.fat),
    sugar: toNumber(raw.sugar),
    sodium: toNumber(raw.sodium),
    fullnessScore: raw.fullnessScore ?? null,
    img: raw.imageUrl || '',
    createdAt: raw.createTime || '',
    updatedAt: raw.updateTime || '',
  }
}

export function createDietRecordDTO(meal = {}) {
  return {
    id: meal.id ?? null,
    userId: meal.userId ?? currentDietUserId(),
    eatTime: meal.eatTime,
    mealType: Number(meal.mealType),
    foodName: String(meal.foodName ?? meal.name ?? '').trim(),
    calories: toNumber(meal.calories ?? meal.kcal),
    protein: toNumber(meal.protein),
    fat: toNumber(meal.fat),
    carbohydrate: toNumber(meal.carbohydrate ?? meal.carbs),
    sugar: toNumber(meal.sugar),
    sodium: toNumber(meal.sodium),
    fullnessScore: meal.fullnessScore || null,
    location: meal.location ?? meal.place ?? 'home',
    note: String(meal.note ?? meal.desc ?? '').trim(),
    imageUrl: String(meal.imageUrl ?? meal.img ?? '').trim(),
  }
}

export async function queryDietRecords(filters = {}) {
  const payload = await postJson(
    DIET_API.query,
    compactObject({
      userId: filters.userId ?? currentDietUserId(),
      keyword: String(filters.keyword || '').trim(),
      startTime: filters.startTime,
      endTime: filters.endTime,
      mealType: filters.mealType,
      location: filters.location,
    }),
    '查询饮食记录失败',
  )
  return (Array.isArray(payload) ? payload : []).map(normalizeDietRecord)
}

export function addDietRecord(meal) {
  return postJson(DIET_API.add, createDietRecordDTO(meal), '新增饮食记录失败')
}

export function updateDietRecord(meal) {
  return postJson(DIET_API.update, createDietRecordDTO(meal), '修改饮食记录失败')
}

export function deleteDietRecord(id) {
  return postJson(`${DIET_API.delete}/${encodeURIComponent(id)}`, {}, '删除饮食记录失败')
}
