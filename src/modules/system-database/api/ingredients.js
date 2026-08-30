import { API_BASE, SYS_INFO_API } from '../../../api/index.js'
import { getAuthSession } from '../../auth/session.js'

function authHeaders(contentType = 'application/json') {
  const session = getAuthSession()
  const headers = contentType ? { 'Content-Type': contentType } : {}

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

function assertApiSuccess(response, data, fallback) {
  const code = data && typeof data === 'object' ? data.code : undefined
  const okCode = code === undefined || String(code) === '200' || String(code) === '0'
  if (response.ok && okCode) return

  const message = data && typeof data === 'object'
    ? data.message || data.msg || data.error
    : ''
  throw new Error(message || fallback)
}

function responseData(data) {
  if (data && typeof data === 'object' && 'data' in data) return data.data
  if (data && typeof data === 'object' && 'result' in data) return data.result
  return data
}

function toPayloadList(value) {
  if (Array.isArray(value)) return value
  if (Array.isArray(value?.records)) return value.records
  if (Array.isArray(value?.list)) return value.list
  if (Array.isArray(value?.rows)) return value.rows
  return value ? [value] : []
}

async function getJson(url, fallback) {
  const response = await fetch(url, {
    method: 'GET',
    headers: authHeaders(null),
  })
  const data = parseApiPayload(await response.text())
  assertApiSuccess(response, data, fallback)
  return responseData(data)
}

async function postJson(url, body, fallback) {
  const response = await fetch(url, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  })
  const data = parseApiPayload(await response.text())
  assertApiSuccess(response, data, fallback)
  return responseData(data)
}

function normalizeIconUrl(path) {
  const value = String(path ?? '').trim()
  if (!value) return ''
  if (/^(https?:)?\/\//i.test(value) || value.startsWith('data:') || value.startsWith('blob:')) {
    return value
  }

  const normalized = value.replaceAll('\\', '/')
  const iconIndex = normalized.toLowerCase().lastIndexOf('/icon/')
  const fileName = iconIndex >= 0
    ? normalized.slice(iconIndex + '/icon/'.length)
    : normalized.replace(/^\/?(?:(?:file|sys\/info)\/)?icon\//i, '').replace(/^\/+/, '')
  return fileName ? encodeURI(`${API_BASE}/sys/info/icon/${fileName}`) : ''
}

export async function queryIngredientCategories(isMain) {
  const params = new URLSearchParams({ isMain: String(Number(isMain)) })
  const payload = await getJson(
    `${SYS_INFO_API.ingredientCategories}?${params.toString()}`,
    '查询食材分类失败',
  )

  return toPayloadList(payload).map((item, index) => ({
    ...item,
    id: item?.id ?? item?.category ?? index,
    category: String(item?.category ?? '').trim(),
    categoryName: String(item?.categoryName ?? item?.name ?? '').trim(),
  }))
}

export async function queryIngredients({ category, isMain }) {
  const payload = await postJson(
    SYS_INFO_API.ingredients,
    {
      category: String(category ?? '').trim(),
      isMain: Number(isMain),
    },
    '查询食材失败',
  )

  return toPayloadList(payload).map((item, index) => ({
    ...item,
    id: item?.id ?? `${category}_${index}`,
    name: String(item?.name ?? '').trim(),
    category: String(item?.category ?? category ?? '').trim(),
    categoryName: String(item?.categoryName ?? '').trim(),
    isMain: Number(item?.isMain ?? isMain),
    iconUrl: normalizeIconUrl(item?.iconPath ?? item?.iconFileName),
  }))
}

export function addIngredient({ name, category, categoryName, isMain, iconId }) {
  return postJson(
    SYS_INFO_API.addIngredient,
    {
      name: String(name ?? '').trim(),
      category: String(category ?? '').trim(),
      categoryName: String(categoryName ?? '').trim(),
      isMain: Number(isMain),
      iconId,
    },
    '添加食材失败',
  )
}

export async function queryCookWays() {
  const payload = await getJson(SYS_INFO_API.cookWays, '查询烹饪方式失败')
  return toPayloadList(payload).map((item, index) => ({
    ...item,
    id: item?.id ?? item?.name ?? index,
    name: String(item?.name ?? '').trim(),
    description: String(item?.description ?? '').trim(),
  }))
}
