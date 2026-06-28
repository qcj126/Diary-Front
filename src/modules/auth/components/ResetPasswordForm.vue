<template>
  <div class="auth-card">
    <form class="form" @submit.prevent="onSubmit">
      <label class="field">
        <span class="label">用户名</span>
        <input
          v-model="username"
          class="input"
          placeholder="请输入用户名"
          autocomplete="username"
          @blur="touch.username = true"
        />
        <span v-if="touch.username && usernameErr" class="err">{{ usernameErr }}</span>
      </label>

      <label class="field">
        <span class="label">手机号</span>
        <input
          v-model="phone"
          class="input"
          type="tel"
          inputmode="numeric"
          maxlength="11"
          autocomplete="tel"
          placeholder="11 位手机号"
          @blur="touch.phone = true"
        />
        <span v-if="touch.phone && phoneErr" class="err">{{ phoneErr }}</span>
      </label>

      <label class="field">
        <span class="label">验证码</span>
        <div class="row">
          <input
            v-model="code"
            class="input grow"
            inputmode="numeric"
            maxlength="8"
            placeholder="输入验证码"
            @blur="touch.code = true"
          />
          <button
            type="button"
            class="btn secondary"
            :disabled="sending || countdown > 0"
            @click="sendCode"
          >
            {{ countdown > 0 ? `${countdown}s` : sending ? '发送中…' : '获取验证码' }}
          </button>
        </div>
        <span v-if="touch.code && codeErr" class="err">{{ codeErr }}</span>
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
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { getApiMessage, isApiSuccess, resetPassword, sendVerifyCode } from '../api.js'
import { validatePassword, validatePhone, validateUsername, validateVerifyCode } from '../validators.js'

const emit = defineEmits(['done'])

const username = ref('')
const phone = ref('')
const code = ref('')
const password = ref('')
const password2 = ref('')

const touch = reactive({
  username: false,
  phone: false,
  code: false,
  password: false,
  password2: false,
})

const sending = ref(false)
const loading = ref(false)
const countdown = ref(0)
const banner = ref('')
const bannerType = ref('info')
let timer = null

watch(countdown, (n) => {
  if (n <= 0 && timer) {
    clearInterval(timer)
    timer = null
  }
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})

const usernameErr = computed(() => {
  const r = validateUsername(username.value)
  return r.ok ? '' : r.message
})
const phoneErr = computed(() => {
  const r = validatePhone(phone.value)
  return r.ok ? '' : r.message
})
const codeErr = computed(() => {
  const r = validateVerifyCode(code.value)
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
  const user = validateUsername(username.value)
  const ph = validatePhone(phone.value)
  const c = validateVerifyCode(code.value)
  const p = validatePassword(password.value)
  if (!user.ok || !ph.ok || !c.ok || !p.ok) return null
  if (password2.value !== p.value) return null
  return {
    username: user.value,
    phone: ph.value,
    code: c.value,
    password: p.value,
  }
}

async function sendCode() {
  touch.phone = true
  const ph = validatePhone(phone.value)
  if (!ph.ok) {
    banner.value = ph.message
    bannerType.value = 'warn'
    return
  }

  sending.value = true
  banner.value = ''
  try {
    const { res, data } = await sendVerifyCode(ph.value)
    if (isApiSuccess(res, data)) {
      banner.value = getApiMessage(data, '验证码已发送')
      bannerType.value = 'ok'
      if (timer) clearInterval(timer)
      countdown.value = 60
      timer = setInterval(() => {
        countdown.value -= 1
      }, 1000)
    } else {
      banner.value = getApiMessage(data, `发送失败（${res.status}）`)
      bannerType.value = 'warn'
    }
  } catch (e) {
    console.error(e)
    banner.value = e instanceof Error ? e.message : '网络异常，请稍后重试'
    bannerType.value = 'warn'
  } finally {
    sending.value = false
  }
}

async function onSubmit() {
  touch.username = true
  touch.phone = true
  touch.code = true
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

.row {
  display: flex;
  gap: 0.5rem;
  align-items: stretch;
}

.input {
  width: 100%;
  box-sizing: border-box;
  padding: 0.9rem 1rem;
  border: 1px solid var(--auth-border);
  border-radius: 12px;
  font-size: 1rem;
  background: var(--auth-input-bg);
  color: var(--auth-fg);
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s, background 0.2s;
}

.input::placeholder {
  color: var(--auth-placeholder);
}

.input.grow {
  flex: 1;
  min-width: 0;
}

.input:focus {
  border-color: rgba(59, 130, 246, 0.5);
  background: rgba(255, 255, 255, 0.07);
  box-shadow: 0 0 15px var(--auth-glow);
  transform: scale(1.01);
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
  position: relative;
  overflow: hidden;
  margin-top: 0.25rem;
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: 14px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  color: #fff;
  background: linear-gradient(135deg, var(--auth-primary-2), #3755c3);
  box-shadow: 0 14px 34px rgba(30, 64, 175, 0.34);
  transition: transform 0.15s, filter 0.15s, opacity 0.15s, box-shadow 0.15s;
}

.btn.secondary {
  flex-shrink: 0;
  padding: 0 0.85rem;
  border: 1px solid var(--auth-border);
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.06);
  color: var(--auth-fg);
  white-space: nowrap;
  transition: background 0.15s, opacity 0.15s;
}

.btn.secondary:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
}

.btn.secondary:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.btn.primary::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -60%;
  width: 20%;
  height: 200%;
  background: rgba(255, 255, 255, 0.22);
  transform: rotate(30deg);
  transition: transform 0.6s ease-in-out;
}

.btn.primary:hover:not(:disabled) {
  filter: brightness(1.05);
  transform: translateY(-1px);
  box-shadow: 0 18px 42px rgba(30, 64, 175, 0.44);
}

.btn.primary:hover:not(:disabled)::after {
  transform: translate(620%, 0) rotate(30deg);
}

.btn.primary:active:not(:disabled) {
  transform: scale(0.98);
}

.btn.primary:disabled {
  opacity: 0.65;
  cursor: not-allowed;
  transform: none;
}
</style>
