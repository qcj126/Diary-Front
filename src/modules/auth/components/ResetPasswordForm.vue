<template>
  <div class="auth-card">
    <p class="hint">
      重置密码将调用 <code>POST /user/resetPw</code>，账号框支持用户名/邮箱/手机号自动识别。
    </p>

    <form class="form" @submit.prevent="onSubmit">
      <label class="field">
        <span class="label">用户</span>
        <input
          v-model="account"
          class="input"
          placeholder="用户名 / 邮箱 / 手机号"
          autocomplete="username"
          @blur="touch.account = true"
        />
        <span v-if="touch.account && accountErr" class="err">{{ accountErr }}</span>
      </label>

      <label class="field">
        <span class="label">密码</span>
        <input
          v-model="password"
          class="input"
          type="password"
          autocomplete="new-password"
          placeholder="含大小写、数字与特殊字符"
          @blur="touch.password = true"
        />
        <span v-if="touch.password && passwordErr" class="err">{{ passwordErr }}</span>
      </label>

      <label class="field">
        <span class="label">确认密码</span>
        <input
          v-model="password2"
          class="input"
          type="password"
          autocomplete="new-password"
          placeholder="再次输入密码"
          @blur="touch.password2 = true"
        />
        <span v-if="touch.password2 && password2Err" class="err">{{ password2Err }}</span>
      </label>

      <p v-if="banner" class="banner" :class="bannerType">{{ banner }}</p>

      <button type="submit" class="btn primary" :disabled="loading">
        {{ loading ? '提交中…' : '重置密码' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { getApiMessage, isApiSuccess, resetPassword } from '../api.js'
import { validateEmail, validatePassword, validatePhone, validateUsername } from '../validators.js'

const emit = defineEmits(['done'])

const account = ref('')
const password = ref('')
const password2 = ref('')

const touch = reactive({
  account: false,
  password: false,
  password2: false,
})

const loading = ref(false)
const banner = ref('')
const bannerType = ref('info')

function parseAccount(raw) {
  const value = String(raw ?? '').trim()
  if (!value) return { ok: false, message: '请输入用户（用户名/邮箱/手机号）' }

  const phone = validatePhone(value)
  if (phone.ok) return { ok: true, payload: { phone: phone.value } }

  if (value.includes('@')) {
    const email = validateEmail(value)
    if (!email.ok) return { ok: false, message: email.message }
    return { ok: true, payload: { email: email.value } }
  }

  if (/^\d+$/.test(value)) {
    return { ok: false, message: '手机号格式不正确' }
  }

  const username = validateUsername(value)
  if (!username.ok) return { ok: false, message: username.message }
  return { ok: true, payload: { username: username.value } }
}

const accountErr = computed(() => {
  const r = parseAccount(account.value)
  return r.ok ? '' : r.message
})
const passwordErr = computed(() => {
  const r = validatePassword(password.value)
  return r.ok ? '' : r.message
})
const password2Err = computed(() => {
  if (!password2.value) return '请再次输入密码'
  if (password2.value !== password.value) return '两次密码不一致'
  return ''
})

function payload() {
  const user = parseAccount(account.value)
  const p = validatePassword(password.value)
  if (!user.ok || !p.ok) return null
  if (password2.value !== p.value) return null
  return { ...user.payload, password: p.value }
}

async function onSubmit() {
  touch.account = true
  touch.password = true
  touch.password2 = true

  const body = payload()
  if (!body) {
    banner.value = '请修正表单错误后再试'
    bannerType.value = 'warn'
    return
  }

  loading.value = true
  banner.value = ''
  try {
    const { res, data } = await resetPassword(body)
    if (isApiSuccess(res, data)) {
      banner.value = getApiMessage(data, '密码重置成功')
      bannerType.value = 'ok'
      emit('done')
    } else {
      banner.value = getApiMessage(data, `重置失败（${res.status}）`)
      bannerType.value = 'warn'
    }
  } catch (e) {
    console.error(e)
    banner.value = e instanceof Error ? e.message : '网络异常，请稍后重试'
    bannerType.value = 'warn'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-card {
  width: 100%;
}

.hint {
  margin: 0 0 1rem;
  font-size: 0.8rem;
  color: var(--auth-muted);
}

.hint code {
  font-size: 0.75rem;
  padding: 0.15rem 0.35rem;
  border-radius: 6px;
  background: var(--auth-code-bg);
  color: var(--auth-code-fg);
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--auth-fg-soft);
}

.input {
  width: 100%;
  box-sizing: border-box;
  padding: 0.75rem 0.9rem;
  border: 1px solid var(--auth-border);
  border-radius: 10px;
  font-size: 1rem;
  background: var(--auth-input-bg);
  color: var(--auth-fg);
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.input::placeholder {
  color: var(--auth-placeholder);
}

.input:focus {
  border-color: var(--auth-primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
}

.err {
  font-size: 0.75rem;
  color: var(--auth-danger);
}

.banner {
  margin: 0;
  padding: 0.65rem 0.75rem;
  border-radius: 10px;
  font-size: 0.85rem;
}

.banner.ok {
  background: rgba(34, 197, 94, 0.12);
  color: var(--auth-success);
}

.banner.warn {
  background: rgba(239, 68, 68, 0.1);
  color: var(--auth-danger);
}

.btn.primary {
  margin-top: 0.25rem;
  width: 100%;
  padding: 0.85rem 1rem;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  color: #fff;
  background: linear-gradient(135deg, var(--auth-primary), var(--auth-primary-2));
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.35);
  transition: transform 0.15s, filter 0.15s, opacity 0.15s;
}

.btn.primary:hover:not(:disabled) {
  filter: brightness(1.05);
  transform: translateY(-1px);
}

.btn.primary:disabled {
  opacity: 0.65;
  cursor: not-allowed;
  transform: none;
}
</style>
