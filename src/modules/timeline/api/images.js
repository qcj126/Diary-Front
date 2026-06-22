import { API_BASE, TIMELINE_API } from '../../../api/index.js'

let carouselImageUrlCache = null
let carouselImageUrlRequest = null

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

function getResponseData(data) {
  if (data && typeof data === 'object' && 'data' in data) return data.data
  if (data && typeof data === 'object' && 'result' in data) return data.result
  return data
}

function normalizeImageId(id) {
  const value = String(id ?? '').trim()
  return value ? value : null
}

function normalizeImageVO(image) {
  if (!image || typeof image !== 'object') return null
  const id = normalizeImageId(image.id ?? image.imageId)
  const url = normalizeImageUrl(image.url ?? image.imageUrl)
  if (!id || !url) return null
  return { id, url }
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

  const imageIds = ids.map(normalizeImageId).filter((id) => id !== null)
  if (!imageIds.length) {
    throw new Error('Image upload succeeded, but returned image IDs are invalid.')
  }

  return imageIds
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
  return Array.isArray(images) ? images.map(normalizeImageVO).filter(Boolean) : []
}

export async function queryCarouselImageUrls() {
  if (carouselImageUrlCache) {
    return [...carouselImageUrlCache]
  }

  if (carouselImageUrlRequest) {
    return carouselImageUrlRequest
  }

  carouselImageUrlRequest = queryCarouselImageUrlsFromApi().finally(() => {
    carouselImageUrlRequest = null
  })

  return carouselImageUrlRequest
}

async function queryCarouselImageUrlsFromApi() {
  const res = await fetch(TIMELINE_API.queryCarouselImages, {
    method: 'POST',
  })
  const data = parseApiPayload(await res.text())
  assertApiSuccess(res, data, 'Carousel image query failed.')

  const images = getResponseData(data)
  const urls = Array.isArray(images) ? images.map(normalizeImageUrl).filter(Boolean) : []
  if (urls.length) {
    carouselImageUrlCache = urls
  }
  return [...urls]
}

export function normalizeImageUrl(url) {
  const value = String(url ?? '').trim()
  if (!value) return ''
  if (/^(https?:)?\/\//i.test(value) || value.startsWith('data:') || value.startsWith('blob:')) {
    return value
  }
  return `${API_BASE}${value.startsWith('/') ? '' : '/'}${value}`
}
