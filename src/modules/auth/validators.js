import { EMAIL_PATTERN, PASSWORD_PATTERN, PHONE_PATTERN, VERIFY_CODE_PATTERN } from '../../constants/auth.js'

export function validatePhone(phone) {
  const v = String(phone ?? '').trim()
  if (!v) return { ok: false, message: '请输入手机号' }
  if (!PHONE_PATTERN.test(v)) return { ok: false, message: '请输入正确的 11 位手机号' }
  return { ok: true, message: '', value: v }
}

export function validateEmail(email) {
  const v = String(email ?? '').trim()
  if (!v) return { ok: false, message: '请输入邮箱' }
  if (!EMAIL_PATTERN.test(v)) return { ok: false, message: '邮箱格式不正确' }
  return { ok: true, message: '', value: v }
}

export function validatePassword(password) {
  const v = String(password ?? '')
  if (!v) return { ok: false, message: '请输入密码' }
  if (!PASSWORD_PATTERN.test(v)) {
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
  if (!VERIFY_CODE_PATTERN.test(v)) return { ok: false, message: '验证码应为 4–8 位数字' }
  return { ok: true, message: '', value: v }
}
