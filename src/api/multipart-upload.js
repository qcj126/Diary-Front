import { getAuthSession } from '../modules/auth/session.js'

function parseApiPayload(text) {
  if (!text) return null

  try {
    const safeText = text.replace(/(:\s*|\[\s*|,\s*)(-?\d{16,})(?=\s*[,}\]])/g, '$1"$2"')
    return JSON.parse(safeText)
  } catch {
    return text
  }
}

function getResponseData(payload) {
  if (payload && typeof payload === 'object' && 'data' in payload) return payload.data
  if (payload && typeof payload === 'object' && 'result' in payload) return payload.result
  return payload
}

function getErrorMessage(payload, fallback) {
  if (!payload || typeof payload !== 'object') return fallback
  return payload.message || payload.msg || payload.error || fallback
}

export function uploadMultipart({
  url,
  formData,
  onProgress,
  signal,
  errorMessage = '文件上传失败',
}) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    const session = getAuthSession()

    const removeAbortListener = () => signal?.removeEventListener('abort', handleAbort)
    const rejectWith = (error) => {
      removeAbortListener()
      reject(error)
    }
    const handleAbort = () => xhr.abort()

    xhr.open('POST', url)
    if (session?.accessToken) {
      xhr.setRequestHeader(
        'Authorization',
        `${session.tokenType || 'Bearer'} ${session.accessToken}`,
      )
    }

    xhr.upload.addEventListener('progress', (event) => {
      if (!event.lengthComputable) return
      const percentage = Math.min(100, Math.round((event.loaded / event.total) * 100))
      onProgress?.(percentage, event)
    })

    xhr.addEventListener('load', () => {
      removeAbortListener()
      const payload = parseApiPayload(xhr.responseText)
      const code = payload && typeof payload === 'object' ? payload.code : undefined
      const isSuccessfulCode = code === undefined || String(code) === '200' || String(code) === '0'
      const isSuccessfulStatus = xhr.status >= 200 && xhr.status < 300

      if (!isSuccessfulStatus || !isSuccessfulCode) {
        reject(new Error(getErrorMessage(payload, errorMessage)))
        return
      }

      onProgress?.(100)
      resolve(getResponseData(payload))
    })
    xhr.addEventListener('error', () => rejectWith(new Error(errorMessage)))
    xhr.addEventListener('abort', () => rejectWith(new DOMException('上传已取消', 'AbortError')))

    if (signal?.aborted) {
      rejectWith(new DOMException('上传已取消', 'AbortError'))
      return
    }
    signal?.addEventListener('abort', handleAbort, { once: true })

    onProgress?.(0)
    xhr.send(formData)
  })
}
