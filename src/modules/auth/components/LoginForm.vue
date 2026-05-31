<template>
  <div class="auth-card">
    <p class="hint">使用 JSON 请求 <code>POST /user/login</code></p>

    <form class="form" @submit.prevent="onSubmit">
      <label class="field">
        <span class="label">用户</span>
        <input
          v-model="account"
          class="input"
          autocomplete="username"
          placeholder="用户名/邮箱/手机号"
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
          autocomplete="current-password"
          placeholder="含大小写、数字与特殊字符"
          @blur="touch.password = true"
        />
        <span v-if="touch.password && passwordErr" class="err">{{ passwordErr }}</span>
      </label>

      <p v-if="banner" class="banner" :class="bannerType">{{ banner }}</p>

      <button type="submit" class="btn primary" :disabled="loading">
        {{ loading ? '登录中…' : '登录' }}
      </button>

      <div class="assist-row">
        <button type="button" class="assist-btn" @click="emit('forgot-password')">忘记密码</button>
        <SmsLoginFab inline @logged-in="emit('logged-in')" />
      </div>
    </form>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { getApiMessage, isApiSuccess, login as loginApi } from '../api.js'

import SmsLoginFab from './SmsLoginFab.vue'
import {
  validateEmail,
  validatePassword,
  validatePhone,
  validateUsername,
} from '../validators.js'

const props = defineProps({
  notice: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['notice-shown', 'forgot-password', 'logged-in'])

const account = ref('')
const password = ref('')

const touch = reactive({
  account: false,
  password: false,
})

const loading = ref(false)
const banner = ref('')
const bannerType = ref('info')

watch(
  () => props.notice,
  (val) => {
    if (!val) return
    banner.value = val
    bannerType.value = 'ok'
    emit('notice-shown')
  },
  { immediate: true },
)

const passwordErr = computed(() => {
  const r = validatePassword(password.value)
  return r.ok ? '' : r.message
})

function parseAccount(raw) {
  const value = String(raw ?? '').trim()
  if (!value) return { ok: false, message: '请输入用户（用户名/邮箱/手机号）' }

  const ph = validatePhone(value)
  if (ph.ok) return { ok: true, payload: { phone: ph.value } }

  if (value.includes('@')) {
    const em = validateEmail(value)
    if (!em.ok) return { ok: false, message: em.message }
    return { ok: true, payload: { email: em.value } }
  }

  if (/^\d+$/.test(value)) return { ok: false, message: '手机号格式不正确' }

  const user = validateUsername(value)
  if (!user.ok) return { ok: false, message: user.message }
  return { ok: true, payload: { username: user.value } }
}

const accountErr = computed(() => {
  const r = parseAccount(account.value)
  return r.ok ? '' : r.message
})

function payload() {
  const user = parseAccount(account.value)
  const p = validatePassword(password.value)
  if (!user.ok || !p.ok) return null
  return { ...user.payload, password: p.value, type: 1 }
}

// async function onSubmit() {
//   touch.account = true
//   touch.password = true

//   const body = payload()
//   if (!body) {
//     banner.value = '请修正表单错误后再试'
//     bannerType.value = 'warn'
//     return
//   }

//   loading.value = true
//   banner.value = ''
//   try {
//     const { res, data } = await loginApi(body)
//     if (isApiSuccess(res, data)) {
//       banner.value = getApiMessage(data, '????')
//       bannerType.value = 'ok'
//       emit('logged-in')
//     } else {
//       const msg = getApiMessage(data, `登录失败（${res.status}）`)
//       banner.value = msg
//       bannerType.value = 'warn'

//     }
//   } catch (e) {
//     console.error(e)
//     const msg = e instanceof Error ? e.message : '网络异常，请稍后重试'
//     banner.value = msg
//     bannerType.value = 'warn'

//   } finally {
//     loading.value = false
//   }
// }
async function onSubmit() {
  emit('logged-in')
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

.banner.info {
  background: rgba(99, 102, 241, 0.1);
  color: var(--auth-primary);
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

.assist-row {
  margin-top: 0.15rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 1.2rem;
}

.assist-btn {
  border: none;
  background: transparent;
  color: var(--auth-primary);
  padding: 0;
  cursor: pointer;
  font-size: 0.86rem;
  font-weight: 600;
}

.assist-btn:hover {
  text-decoration: underline;
}
</style>
