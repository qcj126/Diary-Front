import { API_BASE, ICON_API } from '../../../api/index.js'
import { getAuthSession } from '../../auth/session.js'

const DEFAULT_USER_ID = 10000

function authHeaders(contentType = 'application/json') {
  const session = getAuthSession()
  const headers = contentType ? { 'Content-Type': contentType } : {}

  if (session?.accessToken) {
    headers.Authorization = `${session.tokenType || 'Bearer'} ${session.accessToken}`
  }

  return headers
}

function readUserId() {
  const userId = getAuthSession()?.userId
  return userId ?? DEFAULT_USER_ID
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
    (data && typeof data === 'object' && (data.message || data.msg || data.error)) ||
    fallback
  throw new Error(message)
}

function responseData(data) {
  if (data && typeof data === 'object' && 'data' in data) return data.data
  if (data && typeof data === 'object' && 'result' in data) return data.result
  return data
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

async function postForm(url, formData, fallback) {
  const res = await fetch(url, {
    method: 'POST',
    headers: authHeaders(null),
    body: formData,
  })
  const data = parseApiPayload(await res.text())
  assertApiSuccess(res, data, fallback)
  return responseData(data)
}

function toPayloadList(value) {
  if (Array.isArray(value)) return value
  if (Array.isArray(value?.records)) return value.records
  if (Array.isArray(value?.list)) return value.list
  if (Array.isArray(value?.rows)) return value.rows
  return value ? [value] : []
}

function normalizeIconPath(path) {
  const value = String(path ?? '').trim()
  if (!value) return ''
  if (/^(https?:)?\/\//i.test(value) || value.startsWith('data:') || value.startsWith('blob:')) {
    return value
  }

  const normalized = value.replaceAll('\\', '/')
  const iconIndex = normalized.toLowerCase().lastIndexOf('/icon/')
  if (iconIndex >= 0) return normalized.slice(iconIndex)
  if (normalized.startsWith('/')) return `${API_BASE}${normalized}`
  return `${API_BASE}/${normalized}`
}

export function normalizeIcon(raw = {}, index = 0) {
  const id = raw.id ?? raw.iconId ?? raw.iconID
  const iconName = raw.iconName ?? raw.name ?? raw.label ?? `图标 ${index + 1}`
  const iconPixel = Number(raw.iconPixel ?? raw.pixel ?? raw.resolution ?? 0)
  const iconPath = raw.iconPath ?? raw.iconUrl ?? raw.url ?? raw.path ?? ''

  return {
    ...raw,
    id,
    iconName,
    iconPath,
    iconUrl: normalizeIconPath(iconPath),
    iconType: raw.iconType ?? null,
    iconSize: raw.iconSize ?? null,
    iconPixel: Number.isFinite(iconPixel) ? iconPixel : 0,
    userId: raw.userId ?? readUserId(),
  }
}

export async function queryIcons(params = {}) {
  const payload = await postJson(
    ICON_API.query,
    {
      iconName: params.iconName || null,
      iconType: params.iconType ?? null,
    },
    '查询图标失败',
  )

  return toPayloadList(payload)
    .map(normalizeIcon)
    .sort((a, b) => (a.iconPixel || 0) - (b.iconPixel || 0) || String(a.iconName).localeCompare(String(b.iconName)))
}

export function addIcon({ file, iconName, iconPixel }) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('iconName', iconName)
  formData.append('iconPixel', String(iconPixel))
  formData.append('userId', String(readUserId()))

  return postForm(ICON_API.add, formData, '新增图标失败')
}

export function updateIcon({ id, file, iconName, iconPixel }) {
  const formData = new FormData()
  formData.append('id', String(id))
  formData.append('iconName', iconName)
  formData.append('iconPixel', String(iconPixel))
  formData.append('userId', String(readUserId()))
  if (file) formData.append('file', file)

  return postForm(ICON_API.update, formData, '修改图标失败')
}

export function deleteIcon(id) {
  return postJson(
    ICON_API.delete,
    {
      id,
      userId: readUserId(),
    },
    '删除图标失败',
  )
}
