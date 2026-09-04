import { AUTH_STORAGE_KEY } from '../../constants/auth.js'

function canUseStorage() {
  return typeof window !== 'undefined' && Boolean(window.localStorage)
}

export function saveAuthSession(data) {
  if (!data || typeof data !== 'object' || !canUseStorage()) return

  const session = {
    userId: data.userId ?? null,
    username: data.username ?? '',
    email: data.email ?? '',
    phone: data.phone ?? '',
    roles: Array.isArray(data.roles) ? data.roles : [],
    tokenType: data.tokenType || 'Bearer',
    accessToken: data.accessToken || '',
    accessTokenExpiresIn: data.accessTokenExpiresIn ?? null,
    refreshToken: data.refreshToken || '',
    refreshTokenExpiresIn: data.refreshTokenExpiresIn ?? null,
    savedAt: Date.now(),
  }

  if (!session.accessToken || session.userId == null) return
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
}

export function getAuthSession() {
  if (!canUseStorage()) return null

  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function hasAuthSession() {
  const session = getAuthSession()
  return Boolean(session?.accessToken && session?.userId != null)
}

export function requireAuthUserId() {
  const userId = getAuthSession()?.userId
  if (userId == null || userId === '') throw new Error('登录信息中缺少 userId，请重新登录')
  return userId
}

export function clearAuthSession() {
  if (canUseStorage()) window.localStorage.removeItem(AUTH_STORAGE_KEY)
}
