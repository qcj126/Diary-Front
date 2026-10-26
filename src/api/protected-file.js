import { API_BASE } from './endpoints.js'
import { getAuthSession } from '../modules/auth/session.js'

/**
 * 浏览器的 img 标签无法附带 Authorization；文件服务需要鉴权时，先带 Token 读取 Blob。
 */
export async function loadProtectedFileUrl(url) {
  const value = String(url ?? '').trim()
  if (!value || value.startsWith('blob:') || value.startsWith('data:')) return value
  if (!value.startsWith(`${API_BASE}/file/`)) return value

  const session = getAuthSession()
  const headers = {}
  if (session?.accessToken) {
    headers.Authorization = `${session.tokenType || 'Bearer'} ${session.accessToken}`
  }
  const response = await fetch(value, { headers })
  if (!response.ok) throw new Error(`获取图片文件失败（${response.status}）`)
  return URL.createObjectURL(await response.blob())
}
