import { IMAGE_API } from './endpoints.js'
import { getAuthSession } from '../modules/auth/session.js'

const DEFAULT_INITIAL_DELAY = 800
const DEFAULT_POLL_INTERVAL = 1500
const DEFAULT_TIMEOUT = 120000

function parseApiPayload(text) {
  if (!text) return null

  try {
    const safeText = text.replace(/(:\s*|\[\s*|,\s*)(-?\d{16,})(?=\s*[,}\]])/g, '$1"$2"')
    return JSON.parse(safeText)
  } catch {
    return text
  }
}

function normalizeImageId(id) {
  const value = String(id ?? '').trim()
  return value || null
}

function normalizeUploadStatus(item) {
  if (!item || typeof item !== 'object') return null
  const imageId = normalizeImageId(item.imageId ?? item.id)
  if (!imageId) return null

  return {
    imageId,
    statusCode: Number(item.statusCode),
    status: String(item.status ?? ''),
    description: String(item.description ?? ''),
    terminal: Boolean(item.terminal),
    success: Boolean(item.success),
  }
}

function abortError() {
  return new DOMException('上传状态查询已取消', 'AbortError')
}

function wait(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(abortError())
      return
    }

    const handleAbort = () => {
      window.clearTimeout(timer)
      reject(abortError())
    }
    const timer = window.setTimeout(() => {
      signal?.removeEventListener('abort', handleAbort)
      resolve()
    }, ms)
    signal?.addEventListener('abort', handleAbort, { once: true })
  })
}

export async function queryImageUploadStatuses(imageIds, { signal } = {}) {
  const session = getAuthSession()
  const headers = { 'Content-Type': 'application/json' }
  if (session?.accessToken) {
    headers.Authorization = `${session.tokenType || 'Bearer'} ${session.accessToken}`
  }

  const response = await fetch(IMAGE_API.queryStatuses, {
    method: 'POST',
    headers,
    body: JSON.stringify(imageIds),
    signal,
  })
  const payload = parseApiPayload(await response.text())
  const code = payload && typeof payload === 'object' ? payload.code : undefined
  const isSuccessfulCode = code === undefined || String(code) === '200' || String(code) === '0'
  if (!response.ok || !isSuccessfulCode) {
    const message = payload && typeof payload === 'object'
      ? payload.message || payload.msg || payload.error
      : null
    throw new Error(message || '图片上传状态查询失败')
  }

  const data = payload && typeof payload === 'object' && 'data' in payload ? payload.data : payload
  return Array.isArray(data) ? data.map(normalizeUploadStatus).filter(Boolean) : []
}

/**
 * @param {Array<string | number>} imageIds
 * @param {{
 *   signal?: AbortSignal,
 *   onStatus?: (statuses: Array<NonNullable<ReturnType<typeof normalizeUploadStatus>>>) => void,
 *   initialDelay?: number,
 *   pollInterval?: number,
 *   timeout?: number
 * }} [options]
 */
export async function waitForImageUploads(imageIds, options = {}) {
  const {
    signal,
    onStatus,
    initialDelay = DEFAULT_INITIAL_DELAY,
    pollInterval = DEFAULT_POLL_INTERVAL,
    timeout = DEFAULT_TIMEOUT,
  } = options
  const expectedImageIds = [...new Set(imageIds.map(normalizeImageId).filter(Boolean))]
  if (!expectedImageIds.length) throw new Error('缺少待查询的图片 ID')

  const deadline = Date.now() + timeout
  await wait(initialDelay, signal)

  while (!signal?.aborted) {
    const statuses = await queryImageUploadStatuses(expectedImageIds, { signal })
    const statusByImageId = new Map(statuses.map((status) => [status.imageId, status]))
    const missingImageIds = expectedImageIds.filter((imageId) => !statusByImageId.has(imageId))
    if (missingImageIds.length) {
      throw new Error(`无法查询图片上传状态：${missingImageIds.join('、')}`)
    }

    onStatus?.(statuses)

    const failedStatus = statuses.find((status) => status.terminal && !status.success)
    if (failedStatus) throw new Error(failedStatus.description || '图片云端处理失败')
    if (statuses.every((status) => status.terminal && status.success)) return statuses
    if (Date.now() >= deadline) throw new Error('图片云端处理超时，请稍后重试')

    await wait(pollInterval, signal)
  }

  throw abortError()
}
