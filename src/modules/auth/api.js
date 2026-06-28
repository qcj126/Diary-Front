import { API } from './constants.js'

function toText(v) {
  return typeof v === 'string' ? v.trim() : ''
}

export function getApiMessage(data, fallback = '请求失败，请稍后重试') {
  if (typeof data === 'string') return toText(data) || fallback
  if (!data || typeof data !== 'object') return fallback

  const direct = [data.message, data.msg, data.error, data.detail, data.title]
    .map(toText)
    .find(Boolean)
  if (direct) return direct

  if (Array.isArray(data.errors) && data.errors.length) {
    return data.errors.map((x) => toText(x?.message ?? x)).filter(Boolean).join('；') || fallback
  }

  return fallback
}

export function isApiSuccess(res, data) {
  if (!res.ok) return false
  if (data == null) return true
  if (typeof data === 'boolean') return data
  if (typeof data === 'string') return true
  if (typeof data !== 'object') return true

  if (typeof data.success === 'boolean') return data.success
  if (typeof data.code !== 'undefined') {
    const code = String(data.code).toLowerCase()
    return code === '0' || code === '200' || code === 'ok' || code === 'success'
  }
  if (typeof data.status === 'number' && data.status >= 400) return false
  if (data.error || data.exception) return false
  return true
}

async function postJson(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  let data = null
  const text = await res.text()
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = text
  }
  return { res, data }
}

export function getApiData(data) {
  if (!data || typeof data !== 'object' || !('data' in data)) return data
  return data.data
}

export async function login(body) {
  return postJson(API.login, body)
}

export async function refreshToken(refreshToken) {
  return postJson(API.refresh, { refreshToken })
}

export async function register(body) {
  return postJson(API.register, body)
}

export async function resetPassword(body) {
  return postJson(API.resetPw, body)
}

export async function sendVerifyCode(phone) {
  return postJson(API.verifyCode, { phone })
}
