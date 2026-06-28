<template>
  <LoveDashboard v-if="loggedIn" />

  <div v-else class="app-root">
    <div class="bg-effects" aria-hidden="true">
      <span class="mesh-blob mesh-blob-a" />
      <span class="mesh-blob mesh-blob-b" />
      <span class="mesh-blob mesh-blob-c" />
    </div>

    <div class="bubble-shell" aria-hidden="true">
      <div
        v-for="bubble in bubbles"
        :key="bubble.id"
        class="bubble-box"
        :style="{
          width: `${bubble.size}px`,
          height: `${bubble.size}px`,
          opacity: bubble.opacity,
          transform: `translate3d(${bubble.x}px, ${bubble.y}px, 0)`,
        }"
      >
        <div class="bubble-ball"></div>
        <div v-if="bubble.hasShadow" class="bubble-shadow"></div>
      </div>
    </div>

    <main class="shell">
      <header class="hero entrance-anim">
        <h1 class="title">DiaryLove</h1>
      </header>

      <div class="panel card entrance-anim">
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

    </main>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import LoginForm from './modules/auth/components/LoginForm.vue'
import RegisterForm from './modules/auth/components/RegisterForm.vue'
import ResetPasswordForm from './modules/auth/components/ResetPasswordForm.vue'
import { hasAuthSession } from './modules/auth/session.js'
import LoveDashboard from './modules/love-dashboard/LoveDashboard.vue'

const BUBBLE_COUNT = 10
const bubbles = ref([])
const page = ref('login')
const loginNotice = ref('')
const loggedIn = ref(hasAuthSession())
let bubbleFrame = 0
let lastBubbleTime = 0

function randomBetween(min, max) {
  return min + Math.random() * (max - min)
}

function createBubble(id) {
  const size = randomBetween(34, 170)
  const width = window.innerWidth
  const height = window.innerHeight
  const speed = randomBetween(24, 72)
  const angle = randomBetween(0, Math.PI * 2)

  return {
    id,
    size,
    opacity: randomBetween(0.18, 0.62).toFixed(2),
    hasShadow: size > 56,
    x: randomBetween(0, Math.max(width - size, 0)),
    y: randomBetween(0, Math.max(height - size, 0)),
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
  }
}

function moveBubbles(time = 0) {
  const dt = Math.min((time - lastBubbleTime) / 1000, 0.04) || 0
  lastBubbleTime = time
  const width = window.innerWidth
  const height = window.innerHeight

  for (const bubble of bubbles.value) {
    bubble.x += bubble.vx * dt
    bubble.y += bubble.vy * dt

    if (bubble.x <= 0) {
      bubble.x = 0
      bubble.vx = Math.abs(bubble.vx)
    } else if (bubble.x + bubble.size >= width) {
      bubble.x = width - bubble.size
      bubble.vx = -Math.abs(bubble.vx)
    }

    if (bubble.y <= 0) {
      bubble.y = 0
      bubble.vy = Math.abs(bubble.vy)
    } else if (bubble.y + bubble.size >= height) {
      bubble.y = height - bubble.size
      bubble.vy = -Math.abs(bubble.vy)
    }
  }

  bubbleFrame = requestAnimationFrame(moveBubbles)
}

function clampBubblesToViewport() {
  const width = window.innerWidth
  const height = window.innerHeight

  for (const bubble of bubbles.value) {
    bubble.x = Math.min(Math.max(bubble.x, 0), Math.max(width - bubble.size, 0))
    bubble.y = Math.min(Math.max(bubble.y, 0), Math.max(height - bubble.size, 0))
  }
}

onMounted(() => {
  bubbles.value = Array.from({ length: BUBBLE_COUNT }, (_, index) => createBubble(index))
  lastBubbleTime = performance.now()
  bubbleFrame = requestAnimationFrame(moveBubbles)
  window.addEventListener('resize', clampBubblesToViewport)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(bubbleFrame)
  window.removeEventListener('resize', clampBubblesToViewport)
})


function handleRegistered() {
  page.value = 'login'
  loginNotice.value = '注册成功，已跳转登录'
}

function handleResetDone() {
  page.value = 'login'
  loginNotice.value = '密码重置成功，请使用新密码登录'
}
</script>

<style scoped>
.app-root {
  position: relative;
  min-height: 100vh;
  color: var(--auth-fg);
  overflow: hidden;
}

.bg-effects {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
  background:
    radial-gradient(circle at 50% -20%, rgba(30, 64, 175, 0.28), transparent 34rem),
    linear-gradient(145deg, #020617 0%, #08111f 48%, #020617 100%);
}

.bg-effects::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 56px 56px;
  mask-image: radial-gradient(circle at center, black, transparent 72%);
}

.bubble-shell {
  position: fixed;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  overflow: hidden;
}

.bubble-box {
  position: absolute;
  left: 0;
  top: 0;
  will-change: transform;
}

.bubble-ball {
  animation: float 3.5s ease-in-out infinite;
  height: 100%;
  width: 100%;
  border-radius: 50%;
  position: relative;
  background: radial-gradient(circle at 77% 30%,
      white 5px,
      aqua 8%,
      darkblue 60%,
      aqua 100%);
  box-shadow: inset 0 0 20px #fff,
      inset 10px 0 46px #eaf5fc,
      inset 88px 0px 60px #c2d8fe,
      inset -20px -60px 100px #fde9ea,
      inset 0 50px 140px #fde9ea,
      0 0 90px #fff;
}

.bubble-shadow {
  background: #b490b27c;
  width: 75%;
  height: 20%;
  left: 12.5%;
  top: 82%;
  animation: expand 4s infinite;
  position: absolute;
  border-radius: 50%;
}

.mesh-blob {
  position: absolute;
  display: block;
  border-radius: 999px;
  filter: blur(80px);
  opacity: 0.42;
  animation: drift 20s infinite alternate ease-in-out;
}

.mesh-blob-a {
  width: 32rem;
  height: 32rem;
  top: -13rem;
  left: -13rem;
  background: #1e3a8a;
}

.mesh-blob-b {
  width: 26rem;
  height: 26rem;
  right: -9rem;
  bottom: -8rem;
  background: #4c1d95;
  animation-delay: -5s;
  animation-direction: alternate-reverse;
}

.mesh-blob-c {
  width: 20rem;
  height: 20rem;
  left: 45%;
  top: 58%;
  background: #0ea5e9;
  opacity: 0.18;
  animation-delay: -11s;
}

.shell {
  position: relative;
  z-index: 2;
  max-width: 480px;
  margin: 0 auto;
  padding: 2rem 1rem 4rem;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.hero {
  text-align: center;
  margin-bottom: 1.5rem;
}

.title {
  margin: 0;
  font-size: clamp(2rem, 6vw, 2.6rem);
  font-weight: 700;
  letter-spacing: 0;
  color: #f8fafc;
  text-shadow: 0 0 28px rgba(184, 196, 255, 0.35);
}

.subtitle {
  margin: 0.5rem 0 0;
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.62);
}

.panel.card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.37);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

.segmented {
  position: relative;
  display: flex;
  gap: 0;
  padding: 0;
  margin-bottom: 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: transparent;
}

.segmented::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 50%;
  height: 2px;
  background: var(--auth-primary);
  transform: translateX(0);
  transition: transform 0.3s ease;
}

.segmented:has(.seg-btn:nth-child(2).active)::after {
  transform: translateX(100%);
}

.seg-btn {
  flex: 1;
  border: none;
  padding: 0 0 1rem;
  border-radius: 0;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.5);
  background: transparent;
  transition: color 0.2s;
}

.seg-btn:hover {
  color: rgba(255, 255, 255, 0.82);
}

.seg-btn.active {
  background: transparent;
  box-shadow: none;
  color: var(--auth-primary);
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
  color: rgba(255, 255, 255, 0.48);
}

.mono {
  font-family: ui-monospace, 'Cascadia Code', monospace;
  font-size: 0.78rem;
  padding: 0.15rem 0.4rem;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.08);
  color: #e2e8f0;
}

.entrance-anim {
  animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.panel.entrance-anim {
  animation-delay: 0.08s;
}

@keyframes drift {
  0% {
    transform: translate(0, 0) scale(1);
  }

  100% {
    transform: translate(50px, 100px) scale(1.1);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0% {
    transform: translatey(0px) rotate(-10deg);
  }

  50% {
    transform: translatey(-80px) rotate(10deg);
  }

  100% {
    transform: translatey(0px) rotate(-10deg);
  }
}

@keyframes expand {

  0%,
  100% {
    transform: scale(0.5);
  }

  50% {
    transform: scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .mesh-blob,
  .entrance-anim,
  .bubble-ball,
  .bubble-shadow {
    animation: none;
  }
}

@media (max-width: 520px) {
  .panel.card {
    padding: 1.35rem;
    border-radius: 22px;
  }

  .shell {
    padding-block: 1.25rem 2rem;
  }
}
</style>
