const STORAGE_KEY = 'diarylove.auth'

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
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

export function getAuthSession() {
  if (!canUseStorage()) return null

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function hasAuthSession() {
  const session = getAuthSession()
  return Boolean(session?.accessToken && session?.userId != null)
}

export function clearAuthSession() {
  if (canUseStorage()) window.localStorage.removeItem(STORAGE_KEY)
}
