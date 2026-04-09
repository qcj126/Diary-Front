/** 中国大陆手机号 */
const PHONE_CN = /^1[3-9]\d{9}$/

/** 邮箱（常用子集） */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * 密码：至少 8 位，需含大写、小写、数字、特殊字符
 */
const PASSWORD = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,128}$/

export function validatePhone(phone) {
  const v = String(phone ?? '').trim()
  if (!v) return { ok: false, message: '请输入手机号' }
  if (!PHONE_CN.test(v)) return { ok: false, message: '请输入正确的 11 位手机号' }
  return { ok: true, message: '', value: v }
}

export function validateEmail(email) {
  const v = String(email ?? '').trim()
  if (!v) return { ok: false, message: '请输入邮箱' }
  if (!EMAIL.test(v)) return { ok: false, message: '邮箱格式不正确' }
  return { ok: true, message: '', value: v }
}

export function validatePassword(password) {
  const v = String(password ?? '')
  if (!v) return { ok: false, message: '请输入密码' }
  if (!PASSWORD.test(v)) {
    return {
      ok: false,
      message: '密码至少 8 位，需包含大写字母、小写字母、数字和特殊字符',
    }
  }
  return { ok: true, message: '', value: v }
}

export function validateUsername(username) {
  const v = String(username ?? '').trim()
  if (!v) return { ok: false, message: '请输入用户名' }
  if (v.length < 2 || v.length > 32) return { ok: false, message: '用户名长度为 2–32 个字符' }
  return { ok: true, message: '', value: v }
}

export function validateVerifyCode(code) {
  const v = String(code ?? '').trim()
  if (!v) return { ok: false, message: '请输入验证码' }
  if (!/^\d{4,8}$/.test(v)) return { ok: false, message: '验证码应为 4–8 位数字' }
  return { ok: true, message: '', value: v }
}
