import { AI_API } from '../../../api/index.js'
import { getAuthSession } from '../../auth/session.js'

function authHeaders() {
  const session = getAuthSession()
  if (!session?.accessToken) return {}
  return { Authorization: `${session.tokenType || 'Bearer'} ${session.accessToken}` }
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

async function getJson(url, fallback) {
  const response = await fetch(url, { method: 'GET', headers: authHeaders() })
  const payload = parseApiPayload(await response.text())
  const code = payload && typeof payload === 'object' ? payload.code : undefined
  const successCode = code === undefined || String(code) === '200' || String(code) === '0'

  if (!response.ok || !successCode) {
    const message = payload && typeof payload === 'object'
      ? payload.message || payload.msg || payload.error
      : ''
    throw new Error(message || fallback)
  }

  if (payload && typeof payload === 'object' && 'data' in payload) return payload.data
  if (payload && typeof payload === 'object' && 'result' in payload) return payload.result
  return payload
}

export function queryAiTaskStatus(taskId) {
  return getJson(AI_API.taskStatus(taskId), 'AI任务状态查询失败')
}

export function queryAiTaskResult(taskId) {
  return getJson(AI_API.taskResult(taskId), 'AI分析结果查询失败')
}
