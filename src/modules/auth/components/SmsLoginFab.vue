<template>
  <button
    type="button"
    class="trigger-btn"
    :class="{ inline }"
    aria-label="手机号验证码登录"
    @click="open = true"
  >
    <span v-if="!inline" class="fab-icon" aria-hidden="true">📱</span>
    <span class="fab-text">验证码登录</span>
  </button>

  <Teleport to="body">
    <Transition name="fade">
      <div v-if="open" class="overlay" role="dialog" aria-modal="true" @click.self="close">
        <div class="drawer">
          <header class="drawer-head">
            <h2 class="drawer-title">??? + ???</h2>
            <button type="button" class="icon-btn" aria-label="??" @click="close">�</button>
          </header>
          <p class="drawer-desc">使用 JSON 请求 <code>POST /user/login</code>，载荷为 <code>phone</code> + <code>code</code>。</p>

          <label class="field">
            <span class="label">手机号</span>
            <input
              v-model="phone"
              class="input"
              type="tel"
              inputmode="numeric"
              maxlength="11"
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

          <p v-if="banner" class="banner" :class="bannerType">{{ banner }}</p>

          <button type="button" class="btn primary full" :disabled="loading" @click="submit">
            {{ loading ? '登录中…' : '登录' }}
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { getApiMessage, isApiSuccess, login as loginApi, sendVerifyCode } from '../api.js'

import { validatePhone, validateVerifyCode } from '../validators.js'

defineProps({
  inline: {
    type: Boolean,
    default: false,
  },
})
const emit = defineEmits(['logged-in'])

const open = ref(false)
const phone = ref('')
const code = ref('')
const touch = reactive({ phone: false, code: false })

const sending = ref(false)
const loading = ref(false)
const countdown = ref(0)
let timer = null

const banner = ref('')
const bannerType = ref('info')

const phoneErr = computed(() => {
  const r = validatePhone(phone.value)
  return r.ok ? '' : r.message
})
const codeErr = computed(() => {
  const r = validateVerifyCode(code.value)
  return r.ok ? '' : r.message
})

watch(countdown, (n) => {
  if (n <= 0 && timer) {
    clearInterval(timer)
    timer = null
  }
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})

watch(open, (v) => {
  if (v) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

function close() {
  open.value = false
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
    const ok = isApiSuccess(res, data)
    if (ok) {
      banner.value = '验证码已发送'
      bannerType.value = 'ok'
      if (timer) clearInterval(timer)
      countdown.value = 60
      timer = setInterval(() => {
        countdown.value -= 1
      }, 1000)
    } else {
      const msg = getApiMessage(data, '发送失败，请稍后重试')
      banner.value = msg
      bannerType.value = 'warn'

    }
  } catch (e) {
    console.error(e)
    const msg = e instanceof Error ? e.message : '网络异常'
    banner.value = msg
    bannerType.value = 'warn'

  } finally {
    sending.value = false
  }
}

async function submit() {
  touch.phone = true
  touch.code = true
  const ph = validatePhone(phone.value)
  const c = validateVerifyCode(code.value)
  if (!ph.ok || !c.ok) {
    banner.value = '??????????'
    bannerType.value = 'warn'
    return
  }

  loading.value = true
  banner.value = ''
  try {
    const { res, data } = await loginApi({ phone: ph.value, code: c.value, type: 2 })
    if (isApiSuccess(res, data)) {
      banner.value = getApiMessage(data, '????')
      bannerType.value = 'ok'
      emit('logged-in')
      setTimeout(() => {
        close()
      }, 250)
    } else {
      const msg = getApiMessage(data, `?????${res.status}?`)
      banner.value = msg
      bannerType.value = 'warn'

    }
  } catch (e) {
    console.error(e)
    const msg = e instanceof Error ? e.message : '??????????'
    banner.value = msg
    bannerType.value = 'warn'

  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.trigger-btn {
  position: fixed;
  right: 1.25rem;
  bottom: 1.25rem;
  z-index: 50;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1rem;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #0ea5e9, #6366f1);
  box-shadow: 0 12px 32px rgba(14, 165, 233, 0.35);
  transition: transform 0.2s, box-shadow 0.2s;
}

.trigger-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 40px rgba(99, 102, 241, 0.4);
}

.trigger-btn.inline {
  position: static;
  right: auto;
  bottom: auto;
  z-index: auto;
  display: inline-flex;
  padding: 0;
  border: none;
  border-radius: 0;
  font-size: 0.86rem;
  font-weight: 600;
  color: var(--auth-primary);
  background: transparent;
  box-shadow: none;
}

.trigger-btn.inline:hover {
  transform: none;
  box-shadow: none;
  text-decoration: underline;
}

.fab-icon {
  font-size: 1.1rem;
  line-height: 1;
}

.fab-text {
  white-space: nowrap;
}

@media (max-width: 480px) {
  .fab-text {
    display: none;
  }
  .trigger-btn.inline .fab-text {
    display: inline;
  }
  .trigger-btn {
    width: 3.25rem;
    height: 3.25rem;
    padding: 0;
    justify-content: center;
    border-radius: 50%;
  }
  .trigger-btn.inline {
    width: auto;
    height: auto;
  }
}

.overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 0;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(4px);
}

@media (min-width: 640px) {
  .overlay {
    align-items: center;
    padding: 1rem;
  }
}

.drawer {
  width: 100%;
  max-width: 420px;
  max-height: min(88vh, 560px);
  overflow: auto;
  padding: 1.25rem 1.25rem 1.5rem;
  border-radius: 20px 20px 0 0;
  background: var(--auth-panel-bg, #fff);
  color: var(--auth-fg, #0f172a);
  box-shadow: 0 -8px 40px rgba(15, 23, 42, 0.15);
}

@media (min-width: 640px) {
  .drawer {
    border-radius: 20px;
    box-shadow: 0 24px 60px rgba(15, 23, 42, 0.2);
  }
}

.drawer-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.drawer-title {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
}

.icon-btn {
  border: none;
  background: transparent;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  color: var(--auth-muted, #64748b);
  padding: 0.25rem;
  border-radius: 8px;
}

.icon-btn:hover {
  background: var(--auth-tabs-bg, #f1f5f9);
  color: var(--auth-fg, #0f172a);
}

.drawer-desc {
  margin: 0 0 1rem;
  font-size: 0.78rem;
  color: var(--auth-muted, #64748b);
}

.drawer-desc code {
  font-size: 0.72rem;
  padding: 0.1rem 0.3rem;
  border-radius: 4px;
  background: var(--auth-code-bg, #f1f5f9);
  color: var(--auth-code-fg, #475569);
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 1rem;
}

.label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--auth-fg-soft, #334155);
}

.row {
  display: flex;
  gap: 0.5rem;
  align-items: stretch;
}

.input {
  box-sizing: border-box;
  padding: 0.75rem 0.9rem;
  border: 1px solid var(--auth-border, #e2e8f0);
  border-radius: 10px;
  font-size: 1rem;
  background: var(--auth-input-bg, #fff);
  color: var(--auth-fg, #0f172a);
  outline: none;
}

.input.grow {
  flex: 1;
  min-width: 0;
}

.input:focus {
  border-color: var(--auth-primary, #6366f1);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
}

.err {
  font-size: 0.75rem;
  color: var(--auth-danger, #ef4444);
}

.btn.secondary {
  flex-shrink: 0;
  padding: 0 0.85rem;
  border: 1px solid var(--auth-border, #e2e8f0);
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  background: var(--auth-input-bg, #fff);
  color: var(--auth-fg, #0f172a);
  white-space: nowrap;
  transition: background 0.15s;
}

.btn.secondary:hover:not(:disabled) {
  background: var(--auth-tabs-bg, #f8fafc);
}

.btn.secondary:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.btn.primary {
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  color: #fff;
  background: linear-gradient(135deg, var(--auth-primary, #6366f1), var(--auth-primary-2, #8b5cf6));
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.35);
  transition: filter 0.15s, transform 0.15s, opacity 0.15s;
}

.btn.primary.full {
  width: 100%;
  padding: 0.85rem 1rem;
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

.banner {
  margin: 0 0 0.75rem;
  padding: 0.65rem 0.75rem;
  border-radius: 10px;
  font-size: 0.85rem;
}

.banner.ok {
  background: rgba(34, 197, 94, 0.12);
  color: var(--auth-success, #16a34a);
}

.banner.warn {
  background: rgba(239, 68, 68, 0.1);
  color: var(--auth-danger, #ef4444);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
