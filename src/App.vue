<template>
  <LoveDashboard v-if="loggedIn" />

  <div v-else class="app-root">
    <div class="bg-effects" aria-hidden="true" />

    <main class="shell">
      <header class="hero">
        <h1 class="title">DiaryLove</h1>
        <p class="subtitle">安全登录与注册 · 模块化前端</p>
      </header>

      <div class="panel card">
        <nav v-if="page !== 'reset'" class="segmented" aria-label="登录或注册">
          <button
            type="button"
            class="seg-btn"
            :class="{ active: page === 'login' }"
            @click="page = 'login'"
          >
            登录
          </button>
          <button
            type="button"
            class="seg-btn"
            :class="{ active: page === 'register' }"
            @click="page = 'register'"
          >
            注册
          </button>
        </nav>
        <div v-else class="reset-head">
          <button type="button" class="back-btn" @click="page = 'login'">← 返回登录</button>
        </div>

        <LoginForm
          v-if="page === 'login'"
          :notice="loginNotice"
          @notice-shown="loginNotice = ''"
          @forgot-password="page = 'reset'"
          @logged-in="loggedIn = true"
        />
        <RegisterForm v-else-if="page === 'register'" @registered="handleRegistered" />
        <ResetPasswordForm v-else @done="handleResetDone" />
      </div>

      <footer class="foot">
        <span>后端 API：</span>
        <code class="mono">http://localhost:8806</code>
      </footer>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import LoginForm from './modules/auth/components/LoginForm.vue'
import RegisterForm from './modules/auth/components/RegisterForm.vue'
import ResetPasswordForm from './modules/auth/components/ResetPasswordForm.vue'
import LoveDashboard from './modules/love-dashboard/LoveDashboard.vue'

const page = ref('login')
const loginNotice = ref('')
const loggedIn = ref(false)

function handleRegistered() {
  page.value = 'login'
  loginNotice.value = '注册成功，已跳转登录'
}

function handleResetDone() {
  page.value = 'login'
  loginNotice.value = '密码重置成功，请使用新密码登录'
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap');

:root {
  --auth-fg: #0f172a;
  --auth-fg-soft: #334155;
  --auth-muted: #64748b;
  --auth-placeholder: #94a3b8;
  --auth-border: #e2e8f0;
  --auth-input-bg: #f8fafc;
  --auth-tabs-bg: #f1f5f9;
  --auth-panel-bg: #ffffff;
  --auth-code-bg: #f1f5f9;
  --auth-code-fg: #475569;
  --auth-primary: #6366f1;
  --auth-primary-2: #8b5cf6;
  --auth-primary-contrast: #ffffff;
  --auth-danger: #ef4444;
  --auth-success: #16a34a;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  font-family: 'DM Sans', system-ui, -apple-system, 'Segoe UI', sans-serif;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

body {
  margin: 0;
  min-height: 100vh;
  background: #0b1020;
}

#app {
  min-height: 100vh;
}
</style>

<style scoped>
.app-root {
  position: relative;
  min-height: 100vh;
  color: var(--auth-fg);
}

.bg-effects {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background:
    radial-gradient(ellipse 80% 55% at 20% 15%, rgba(99, 102, 241, 0.28), transparent 55%),
    radial-gradient(ellipse 70% 50% at 85% 25%, rgba(14, 165, 233, 0.22), transparent 50%),
    radial-gradient(ellipse 60% 45% at 50% 100%, rgba(139, 92, 246, 0.18), transparent 55%),
    linear-gradient(165deg, #0b1020 0%, #111827 45%, #0f172a 100%);
}

.shell {
  position: relative;
  z-index: 1;
  max-width: 440px;
  margin: 0 auto;
  padding: 2.5rem 1.25rem 5rem;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.hero {
  text-align: center;
  margin-bottom: 1.75rem;
}

.title {
  margin: 0;
  font-size: clamp(1.75rem, 5vw, 2.25rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  color: #f8fafc;
  text-shadow: 0 2px 24px rgba(99, 102, 241, 0.35);
}

.subtitle {
  margin: 0.5rem 0 0;
  font-size: 0.95rem;
  color: rgba(226, 232, 240, 0.72);
}

.panel.card {
  background: rgba(255, 255, 255, 0.96);
  border-radius: 22px;
  padding: 1.5rem 1.35rem 1.75rem;
  border: 1px solid rgba(255, 255, 255, 0.55);
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.04),
    0 28px 70px rgba(15, 23, 42, 0.2);
  backdrop-filter: blur(12px);
}

.segmented {
  display: flex;
  gap: 0.5rem;
  padding: 0.35rem;
  margin-bottom: 1.5rem;
  border-radius: 14px;
  background: var(--auth-tabs-bg);
}

.seg-btn {
  flex: 1;
  border: none;
  padding: 0.6rem 0.75rem;
  border-radius: 11px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  color: var(--auth-muted);
  background: transparent;
  transition: background 0.2s, color 0.2s, box-shadow 0.2s;
}

.seg-btn:hover {
  color: var(--auth-fg);
}

.seg-btn.active {
  background: #fff;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.08);
  color: var(--auth-fg);
}

.reset-head {
  margin-bottom: 1rem;
}

.back-btn {
  border: none;
  background: transparent;
  color: var(--auth-primary);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
}

.back-btn:hover {
  text-decoration: underline;
}

.foot {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.8rem;
  color: rgba(226, 232, 240, 0.58);
}

.mono {
  font-family: ui-monospace, 'Cascadia Code', monospace;
  font-size: 0.78rem;
  padding: 0.15rem 0.4rem;
  border-radius: 6px;
  background: rgba(15, 23, 42, 0.35);
  color: #e2e8f0;
}
</style>
