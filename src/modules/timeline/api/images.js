import { API_BASE, TIMELINE_API } from '../../../api/index.js'

function parseApiPayload(text) {
  if (!text) return null
  try {
    return JSON.parse(text)
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

function getResponseData(data) {
  if (data && typeof data === 'object' && 'data' in data) return data.data
  return data
}

export async function uploadTimelineImages(files, imageDTO) {
  const formData = new FormData()
  for (const file of files) {
    formData.append('files', file)
  }

  const payload = {
    code: imageDTO.code,
    userId: imageDTO.userId,
  }

  formData.append('imageDTO', new Blob([JSON.stringify(payload)], { type: 'application/json' }))
  formData.append('code', String(payload.code ?? ''))
  formData.append('userId', String(payload.userId ?? ''))

  const res = await fetch(TIMELINE_API.uploadImages, {
    method: 'POST',
    body: formData,
  })
  const data = parseApiPayload(await res.text())
  assertApiSuccess(res, data, 'Image upload failed.')

  const ids = getResponseData(data)
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new Error('Image upload succeeded, but no image IDs were returned.')
  }

  return ids.map((id) => Number(id)).filter((id) => Number.isFinite(id))
}

export async function queryTimelineImageUrls(imageIds) {
  const res = await fetch(TIMELINE_API.queryImageUrls, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(imageIds),
  })
  const data = parseApiPayload(await res.text())
  assertApiSuccess(res, data, 'Image URL query failed.')

  const images = getResponseData(data)
  return Array.isArray(images) ? images : []
}

export function normalizeImageUrl(url) {
  const value = String(url ?? '').trim()
  if (!value) return ''
  if (/^(https?:)?\/\//i.test(value) || value.startsWith('data:') || value.startsWith('blob:')) {
    return value
  }
  return `${API_BASE}${value.startsWith('/') ? '' : '/'}${value}`
}
