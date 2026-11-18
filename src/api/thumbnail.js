import { IMAGE_API } from './endpoints.js'
import { loadProtectedFileUrl } from './protected-file.js'
import { getAuthSession } from '../modules/auth/session.js'

function parsePayload(text) {
  if (!text) return null
  try {
    const safeText = text.replace(/(:\s*|\[\s*|,\s*)(-?\d{16,})(?=\s*[,}\]])/g, '$1"$2"')
    return JSON.parse(safeText)
  } catch {
    return text
  }
}

/** 批量查询当前用户可访问的缩略图，并返回 imageId -> 受保护 Blob URL。 */
export async function queryThumbnailUrlMap(imageIds, { signal } = {}) {
  const ids = [...new Set(Array.from(imageIds || [], (id) => String(id ?? '').trim()).filter((id) => /^\d+$/.test(id) && id !== '0'))]
  if (!ids.length) return new Map()

  const session = getAuthSession()
  const headers = { 'Content-Type': 'application/json' }
  if (session?.accessToken) headers.Authorization = `${session.tokenType || 'Bearer'} ${session.accessToken}`
  const response = await fetch(IMAGE_API.queryThumbnailUrls, {
    method: 'POST',
    headers,
    body: JSON.stringify(ids),
    signal,
  })
  const payload = parsePayload(await response.text())
  const code = payload && typeof payload === 'object' ? payload.code : undefined
  if (!response.ok || (code !== undefined && !['0', '200'].includes(String(code)))) {
    throw new Error(payload?.message || payload?.msg || '缩略图地址查询失败')
  }

  const rows = payload && typeof payload === 'object' && 'data' in payload ? payload.data : payload
  const pairs = await Promise.all((Array.isArray(rows) ? rows : []).map(async (row) => {
    const imageId = String(row?.id ?? row?.imageId ?? '').trim()
    const url = String(row?.url ?? row?.imageUrl ?? '').trim()
    if (!imageId || !url) return null
    return [imageId, await loadProtectedFileUrl(url)]
  }))
  return new Map(pairs.filter(Boolean))
}
