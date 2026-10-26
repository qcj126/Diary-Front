import { DIET_API, IMAGE_API, resolveApiUrl } from '../../../api/index.js'
import { loadProtectedFileUrl } from '../../../api/protected-file.js'
import { getAuthSession } from '../../auth/session.js'

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

function normalizeImageUrl(url) {
  const value = String(url ?? '').trim()
  if (!value || /^(https?:)?\/\//i.test(value) || value.startsWith('data:') || value.startsWith('blob:')) {
    return value
  }
  const normalized = value.replaceAll('\\', '/')
  const imagePath = '/file/images/'
  const imagePathIndex = normalized.toLowerCase().lastIndexOf(imagePath)
  if (imagePathIndex >= 0) {
    return encodeURI(IMAGE_API.file(normalized.slice(imagePathIndex + imagePath.length)))
  }
  return resolveApiUrl(value)
}

function wait(milliseconds) {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds))
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
    imageUrl: String(raw.imageUrl ?? '').trim(),
    img: normalizeImageUrl(raw.imageUrl),
    createdAt: raw.createTime || '',
    updatedAt: raw.updateTime || '',
  }
}

export function createDietRecordDTO(meal = {}) {
  return {
    id: meal.id ?? null,
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
      keyword: String(filters.keyword || '').trim(),
      startTime: filters.startTime,
      endTime: filters.endTime,
      mealType: filters.mealType,
      location: filters.location,
    }),
    '查询饮食记录失败',
  )
  const records = (Array.isArray(payload) ? payload : []).map(normalizeDietRecord)
  return Promise.all(records.map(async (record) => ({
    ...record,
    img: await loadProtectedFileUrl(record.img),
  })))
}

export function addDietRecord(meal) {
  return postJson(DIET_API.add, createDietRecordDTO(meal), '新增饮食记录失败')
}

export function updateDietRecord(meal) {
  return postJson(DIET_API.update, createDietRecordDTO(meal), '修改饮食记录失败')
}

export function deleteDietRecord(id) {
  return postJson(DIET_API.delete(id), {}, '删除饮食记录失败')
}

/** 上传饮食图片，返回可保存到 diet_record.image_url 的文件服务相对地址。 */
export async function uploadDietImage(file) {
  if (!(file instanceof File) || !file.type.startsWith('image/')) {
    throw new Error('请选择图片文件')
  }

  const formData = new FormData()
  formData.append('files', file, file.name)
  formData.append('code', '1000')
  const headers = authHeaders()
  delete headers['Content-Type']
  const res = await fetch(IMAGE_API.upload, {
    method: 'POST',
    headers,
    body: formData,
  })
  const data = parseApiPayload(await res.text())
  assertApiSuccess(res, data, '图片上传失败')
  const imageId = String((Array.isArray(responseData(data)) ? responseData(data)[0] : responseData(data)) ?? '').trim()
  if (!imageId) throw new Error('图片上传成功，但未返回图片 ID')

  for (let attempt = 0; attempt < 15; attempt += 1) {
    const images = await postJson(IMAGE_API.queryUrls, [imageId], '查询图片地址失败')
    const imageUrl = Array.isArray(images) ? String(images[0]?.url ?? images[0]?.imageUrl ?? '').trim() : ''
    if (imageUrl) return imageUrl
    await wait(500)
  }
  throw new Error('图片已提交，但 OSS 上传尚未完成，请稍后重试')
}
