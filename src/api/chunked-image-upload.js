import { IMAGE_API } from './endpoints.js'
import { uploadMultipart } from './multipart-upload.js'
import { getAuthSession } from '../modules/auth/session.js'

const MAX_CONCURRENT_CHUNKS = 4
const MAX_CHUNK_ATTEMPTS = 3

function abortError() {
  return new DOMException('图片上传已取消', 'AbortError')
}

function throwIfAborted(signal) {
  if (signal?.aborted) throw abortError()
}

function authHeaders() {
  const headers = { 'Content-Type': 'application/json' }
  const session = getAuthSession()
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

function responseData(payload) {
  if (payload && typeof payload === 'object' && 'data' in payload) return payload.data
  if (payload && typeof payload === 'object' && 'result' in payload) return payload.result
  return payload
}

async function postJson(url, body, signal, fallback) {
  const response = await fetch(url, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
    signal,
  })
  const payload = parseApiPayload(await response.text())
  const code = payload && typeof payload === 'object' ? payload.code : undefined
  const successfulCode = code === undefined || String(code) === '200' || String(code) === '0'
  if (!response.ok || !successfulCode) {
    const message = payload && typeof payload === 'object'
      ? payload.message || payload.msg || payload.error
      : null
    throw new Error(message || fallback)
  }
  return responseData(payload)
}

async function getJson(url, signal, fallback) {
  const response = await fetch(url, {
    method: 'GET',
    headers: authHeaders(),
    signal,
  })
  const payload = parseApiPayload(await response.text())
  const code = payload && typeof payload === 'object' ? payload.code : undefined
  const successfulCode = code === undefined || String(code) === '200' || String(code) === '0'
  if (!response.ok || !successfulCode) {
    const message = payload && typeof payload === 'object'
      ? payload.message || payload.msg || payload.error
      : null
    throw new Error(message || fallback)
  }
  return responseData(payload)
}

function positiveInteger(value, fieldName) {
  const normalized = Number(value)
  if (!Number.isSafeInteger(normalized) || normalized <= 0) {
    throw new Error(`服务端返回的 ${fieldName} 配置无效`)
  }
  return normalized
}

function stringSet(value, fieldName) {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`服务端返回的 ${fieldName} 配置无效`)
  }
  const normalized = value
    .map((item) => String(item ?? '').trim().toLowerCase())
    .filter(Boolean)
  if (normalized.length === 0) {
    throw new Error(`服务端返回的 ${fieldName} 配置无效`)
  }
  return new Set(normalized)
}

async function loadUploadConfig(signal) {
  const result = await getJson(
    IMAGE_API.uploadConfig,
    signal,
    '获取图片上传配置失败',
  )
  return {
    chunkSize: positiveInteger(result?.chunkSize, 'chunkSize'),
    maxImageSize: positiveInteger(result?.maxImageSize, 'maxImageSize'),
    allowedMimeTypes: stringSet(result?.allowedMimeTypes, 'allowedMimeTypes'),
    allowedExtensions: stringSet(result?.allowedExtensions, 'allowedExtensions'),
  }
}

function formatFileSize(size) {
  if (size >= 1024 * 1024) return `${Math.round(size / (1024 * 1024))}MB`
  if (size >= 1024) return `${Math.round(size / 1024)}KB`
  return `${size}B`
}

function toHex(buffer) {
  return Array.from(new Uint8Array(buffer), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

async function digestBlob(blob) {
  if (!globalThis.crypto?.subtle) throw new Error('当前环境不支持安全摘要计算，请使用 HTTPS 或 localhost 访问')
  return toHex(await crypto.subtle.digest('SHA-256', await blob.arrayBuffer()))
}

export function calculateFileSha256(file, signal) {
  throwIfAborted(signal)
  if (!globalThis.crypto?.subtle) return Promise.reject(new Error('当前环境不支持安全摘要计算，请使用 HTTPS 或 localhost 访问'))
  if (typeof Worker === 'undefined') return digestBlob(file)

  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('../workers/file-sha256.worker.js', import.meta.url), { type: 'module' })
    const cleanup = () => {
      signal?.removeEventListener('abort', handleAbort)
      worker.terminate()
    }
    const handleAbort = () => {
      cleanup()
      reject(abortError())
    }

    worker.addEventListener('message', (event) => {
      cleanup()
      if (event.data?.error) reject(new Error(event.data.error))
      else resolve(String(event.data?.sha256 || ''))
    }, { once: true })
    worker.addEventListener('error', () => {
      cleanup()
      reject(new Error('文件摘要计算失败'))
    }, { once: true })
    signal?.addEventListener('abort', handleAbort, { once: true })
    worker.postMessage(file)
  })
}

async function validateImageFile(file, uploadConfig) {
  if (!(file instanceof File) || file.size <= 0) throw new Error('请选择有效的图片文件')
  if (file.size > uploadConfig.maxImageSize) {
    throw new Error(`${file.name} 超过 ${formatFileSize(uploadConfig.maxImageSize)} 限制`)
  }

  const extension = file.name.split('.').pop()?.toLowerCase() || ''
  if (!uploadConfig.allowedMimeTypes.has(file.type.toLowerCase())
    || !uploadConfig.allowedExtensions.has(extension)) {
    throw new Error(`${file.name} 只允许 JPG、PNG 格式`)
  }

  const signature = new Uint8Array(await file.slice(0, 8).arrayBuffer())
  const isPng = signature.length >= 8
    && [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((byte, index) => signature[index] === byte)
  const isJpeg = signature.length >= 3
    && signature[0] === 0xff && signature[1] === 0xd8 && signature[2] === 0xff
  if ((file.type === 'image/png' && !isPng) || (file.type === 'image/jpeg' && !isJpeg)) {
    throw new Error(`${file.name} 的文件内容与扩展名不匹配`)
  }
}

function delay(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(abortError())
      return
    }
    const handleAbort = () => {
      clearTimeout(timer)
      reject(abortError())
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', handleAbort)
      resolve()
    }, ms)
    signal?.addEventListener('abort', handleAbort, { once: true })
  })
}

async function uploadChunkWithRetry({ file, uploadId, chunkIndex, chunkSize, signal, onLoaded }) {
  const start = chunkIndex * chunkSize
  const chunk = file.slice(start, Math.min(file.size, start + chunkSize))
  const chunkSha256 = await digestBlob(chunk)

  for (let attempt = 1; attempt <= MAX_CHUNK_ATTEMPTS; attempt += 1) {
    throwIfAborted(signal)
    const formData = new FormData()
    formData.append('chunk', chunk, `${file.name}.part-${chunkIndex}`)
    formData.append('chunkSha256', chunkSha256)

    try {
      await uploadMultipart({
        url: IMAGE_API.uploadChunk(uploadId, chunkIndex),
        formData,
        signal,
        errorMessage: `分片 ${chunkIndex + 1} 上传失败`,
        onProgress: (_, event) => onLoaded(chunkIndex, Math.min(event?.loaded ?? 0, chunk.size)),
      })
      onLoaded(chunkIndex, chunk.size, chunk.size)
      return
    } catch (error) {
      onLoaded(chunkIndex, 0, chunk.size)
      if (signal?.aborted || attempt === MAX_CHUNK_ATTEMPTS) throw error
      await delay(300 * (2 ** (attempt - 1)), signal)
    }
  }
}

async function uploadMissingChunks({ file, init, signal, onProgress }) {
  const uploaded = new Set((init.uploadedChunkIndexes || []).map(Number))
  const loadedByChunk = new Map()
  for (const chunkIndex of uploaded) {
    const start = chunkIndex * init.chunkSize
    loadedByChunk.set(chunkIndex, Math.min(init.chunkSize, file.size - start))
  }

  const reportProgress = () => {
    const loaded = [...loadedByChunk.values()].reduce((sum, size) => sum + size, 0)
    onProgress?.(Math.min(100, Math.round((loaded / file.size) * 100)))
  }
  reportProgress()

  const pending = Array.from({ length: init.totalChunks }, (_, index) => index)
    .filter((index) => !uploaded.has(index))
  let cursor = 0
  const worker = async () => {
    while (cursor < pending.length) {
      const chunkIndex = pending[cursor]
      cursor += 1
      await uploadChunkWithRetry({
        file,
        uploadId: init.uploadId,
        chunkIndex,
        chunkSize: init.chunkSize,
        signal,
        onLoaded: (index, loaded) => {
          loadedByChunk.set(index, loaded)
          reportProgress()
        },
      })
    }
  }
  await Promise.all(Array.from({ length: Math.min(MAX_CONCURRENT_CHUNKS, pending.length) }, worker))
}

function normalizeInitResult(result, requestedChunkSize, requestedTotalChunks) {
  const imageId = String(result?.imageId ?? result?.id ?? '').trim()
  if (!imageId) throw new Error('初始化上传成功，但没有返回图片 ID')
  if (result?.instantUpload) return { imageId, instantUpload: true }

  const uploadId = String(result?.uploadId ?? '').trim()
  if (!uploadId) throw new Error('初始化上传成功，但没有返回上传会话 ID')
  return {
    imageId,
    uploadId,
    instantUpload: false,
    chunkSize: Number(result?.chunkSize ?? requestedChunkSize),
    totalChunks: Number(result?.totalChunks ?? requestedTotalChunks),
    uploadedChunkIndexes: Array.isArray(result?.uploadedChunkIndexes) ? result.uploadedChunkIndexes : [],
  }
}

async function uploadOneImage(file, imageTypeCode, options) {
  const { signal, onState, uploadConfig } = options
  onState?.({ phase: 'validating', percentage: 0, description: `正在校验 ${file.name}` })
  await validateImageFile(file, uploadConfig)
  throwIfAborted(signal)

  onState?.({ phase: 'hashing', percentage: 0, description: `正在计算 ${file.name} 的摘要` })
  const sha256 = await calculateFileSha256(file, signal)
  const totalChunks = Math.ceil(file.size / uploadConfig.chunkSize)

  onState?.({ phase: 'checking', percentage: 0, description: `正在检查 ${file.name} 是否已上传` })
  const init = normalizeInitResult(await postJson(
    IMAGE_API.initializeUpload,
    {
      originalName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      sha256,
      chunkSize: uploadConfig.chunkSize,
      totalChunks,
      imageTypeCode: Number(imageTypeCode),
    },
    signal,
    '初始化图片上传失败',
  ), uploadConfig.chunkSize, totalChunks)

  if (init.instantUpload) {
    onState?.({ phase: 'instant', percentage: 100, description: `${file.name} 已秒传` })
    return init.imageId
  }
  if (init.chunkSize !== uploadConfig.chunkSize || init.totalChunks !== totalChunks) {
    throw new Error('服务端返回的分片参数与客户端不一致')
  }

  onState?.({ phase: 'transferring', percentage: 0, description: `正在上传 ${file.name}` })
  await uploadMissingChunks({
    file,
    init,
    signal,
    onProgress: (percentage) => onState?.({
      phase: 'transferring',
      percentage,
      description: `正在上传 ${file.name} ${percentage}%`,
    }),
  })

  onState?.({ phase: 'merging', percentage: 100, description: `正在合并 ${file.name}` })
  const completed = await postJson(
    IMAGE_API.completeUpload(init.uploadId),
    { imageId: init.imageId, sha256, totalChunks },
    signal,
    '合并图片分片失败',
  )
  const completedImageId = String(completed?.imageId ?? completed?.id ?? init.imageId).trim()
  if (!completedImageId) throw new Error('合并图片成功，但没有返回图片 ID')
  return completedImageId
}

/**
 * 顺序处理多个文件，分片大小由后端配置决定，单个文件内部最多并发上传4个分片。
 * onProgress 的第二个参数包含当前阶段，兼容原来只接收 percentage 的调用方。
 */
export async function uploadImageFiles(files, imageTypeCode, { signal, onProgress } = {}) {
  const imageFiles = Array.from(files || [])
  if (!imageFiles.length) throw new Error('请选择待上传的图片')

  onProgress?.(0, {
    phase: 'preparing',
    percentage: 0,
    description: '正在获取图片上传配置',
    fileIndex: 0,
    fileCount: imageFiles.length,
  })
  const uploadConfig = await loadUploadConfig(signal)
  throwIfAborted(signal)

  const imageIds = []
  for (let index = 0; index < imageFiles.length; index += 1) {
    const file = imageFiles[index]
    const imageId = await uploadOneImage(file, imageTypeCode, {
      signal,
      uploadConfig,
      onState: (state) => {
        const percentage = Math.round(((index + state.percentage / 100) / imageFiles.length) * 100)
        onProgress?.(percentage, { ...state, fileIndex: index, fileCount: imageFiles.length })
      },
    })
    imageIds.push(imageId)
  }
  return imageIds
}
