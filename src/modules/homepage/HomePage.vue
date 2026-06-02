<template>
  <section class="home-page">
    <header class="home-header">
      <div>
        <h1>{{ todayLabel }}</h1>
        <p>保持热爱，奔赴山海</p>
      </div>

      <div class="daily-status" aria-label="今日状态">
        <span class="material-symbols-outlined sunny">wb_sunny</span>
        <strong>24°C</strong>
        <span class="divider" aria-hidden="true" />
        <span>今日心情不错 ☀</span>
      </div>
    </header>

    <form class="quick-entry" @submit.prevent="addQuickEntry">
      <input v-model="quickText" type="text" placeholder="今天发生了什么值得记录的事？" />
      <button type="submit" aria-label="添加记录">
        <span class="material-symbols-outlined">add</span>
      </button>
    </form>

    <section class="summary-grid" aria-label="今日概览">
      <article
        v-for="card in summaryCards"
        :key="card.title"
        class="neo-card summary-card"
        @mousedown="pressCard"
        @mouseup="releaseCard"
        @mouseleave="releaseCard"
      >
        <div class="card-head">
          <div class="title-wrap" :style="{ color: card.color }">
            <span class="material-symbols-outlined">{{ card.icon }}</span>
            <h2>{{ card.title }}</h2>
          </div>
          <span>{{ card.tag }}</span>
        </div>

        <div class="card-body">
          <template v-if="card.type === 'diet'">
            <ul class="check-list">
              <li>
                <span class="material-symbols-outlined checked">check_circle</span>
                <span>早餐：燕麦牛奶</span>
              </li>
              <li class="muted">
                <span class="material-symbols-outlined">schedule</span>
                <span>午餐：未记录</span>
              </li>
            </ul>
          </template>

          <template v-else-if="card.type === 'finance'">
            <div class="expense-row">
              <span>早餐</span>
              <strong>12 元</strong>
            </div>
            <div class="expense-row">
              <span>咖啡</span>
              <strong>28 元</strong>
            </div>
          </template>

          <template v-else>
            <h3>读《人类简史》第 3 章</h3>
            <p>坚持每天阅读，提升视野。</p>
          </template>
        </div>

        <div class="card-foot" :class="card.type">
          <template v-if="card.type === 'diet'">
            <div>
              <p class="label">今日喝水</p>
              <strong>3 杯 <span>/ 6 杯</span></strong>
            </div>
            <svg class="progress-ring" viewBox="0 0 36 36" aria-hidden="true">
              <path
                class="ring-bg"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                class="ring-value"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
          </template>

          <template v-else-if="card.type === 'finance'">
            <div class="total-line">
              <span class="label">今日总计</span>
              <strong>40 元</strong>
            </div>
          </template>

          <template v-else>
            <div class="progress-meta">
              <span>今日进度</span>
              <strong>60%</strong>
            </div>
            <div class="progress-track">
              <span class="progress-fill" :class="{ ready: progressReady }" />
            </div>
            <p class="goal-note">今日已读：12 页 <span>/ 目标 20 页</span></p>
          </template>
        </div>

        <button class="card-action" :style="card.buttonStyle">{{ card.action }}</button>
      </article>
    </section>

    <section class="feature-grid">
      <article class="memory-photo">
        <img :src="memoryImage" alt="城市晚霞" />
        <div class="photo-shade" aria-hidden="true" />
        <div class="photo-caption">
          <h2>昨天拍的晚霞</h2>
          <p>
            <span class="material-symbols-outlined">location_on</span>
            城市广场 · 18:45
          </p>
        </div>
      </article>

      <article class="neo-card thoughts-card">
        <div class="thoughts-head">
          <h2>生活随想</h2>
          <button aria-label="更多">
            <span class="material-symbols-outlined">more_horiz</span>
          </button>
        </div>

        <div class="thought-list">
          <div v-for="(item, index) in thoughts" :key="item.time" class="thought-item">
            <div class="rail">
              <span />
              <i v-if="index !== thoughts.length - 1" />
            </div>
            <div>
              <time>{{ item.time }}</time>
              <p>{{ item.text }}</p>
            </div>
          </div>
        </div>

        <button class="view-all">查看全部记录</button>
      </article>
    </section>

    <footer class="home-footer">
      <div class="countdown">
        <span class="material-symbols-outlined">calendar_today</span>
        <span>距“在一起第 1000 天”还有 <strong>12</strong> 天</span>
      </div>

      <div class="stats">
        <span class="material-symbols-outlined">analytics</span>
        <span>本周记录 <strong>7</strong> 天</span>
        <span>记账 <strong>5</strong> 次</span>
        <span>自己做饭 <strong>3</strong> 次</span>
      </div>

      <p>© 2024 时光记 | 珍惜当下 · 在一起第 988 天</p>
    </footer>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import memoryImage from '../../../stitch_timeline_glow.png'

const quickText = ref('')
const progressReady = ref(false)

const summaryCards = [
  {
    type: 'diet',
    title: '今日打卡',
    tag: 'Diet',
    icon: 'restaurant',
    color: '#4caf50',
    action: '快速补记',
    buttonStyle: { background: 'rgba(224, 227, 229, 0.5)', color: '#5c5f61' },
  },
  {
    type: 'finance',
    title: '今日支出',
    tag: 'Finance',
    icon: 'payments',
    color: '#2196f3',
    action: '随手记账',
    buttonStyle: { background: 'rgba(33, 150, 243, 0.1)', color: '#2196f3' },
  },
  {
    type: 'goal',
    title: '阶段目标',
    tag: 'Goals',
    icon: 'flag',
    color: '#ff9800',
    action: '更新进度',
    buttonStyle: { background: '#000000', color: '#ffffff' },
  },
]

const thoughts = [
  { time: '09:32', text: '今天地铁上看到一只导盲犬，非常乖。' },
  { time: '18:20', text: '雨停了，空气很好，深呼吸的感觉太棒了。' },
  { time: '21:15', text: '完成运动 30 分钟，出汗的感觉很解压。' },
]

const todayLabel = computed(() => {
  const formatter = new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })
  return formatter.format(new Date())
})

function addQuickEntry() {
  quickText.value = ''
}

function pressCard(event) {
  event.currentTarget.classList.add('pressed')
}

function releaseCard(event) {
  event.currentTarget.classList.remove('pressed')
}

onMounted(() => {
  window.setTimeout(() => {
    progressReady.value = true
  }, 300)
})
</script>

<style scoped>
.home-page {
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  padding: 40px 64px;
  color: #1c1b1b;
  font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.home-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 40px;
}

.home-header h1 {
  margin: 0;
  font-size: 32px;
  line-height: 40px;
  font-weight: 600;
}

.home-header p {
  margin: 4px 0 0;
  color: #444748;
  font-size: 14px;
}

.daily-status {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 44px;
  padding: 8px 24px;
  border: 1px solid rgba(196, 199, 199, 0.35);
  border-radius: 999px;
  background: #f1edec;
  font-size: 16px;
  white-space: nowrap;
}

.sunny {
  color: #ff9800;
}

.divider {
  width: 1px;
  height: 16px;
  background: #c4c7c7;
}

.quick-entry {
  position: relative;
  max-width: 768px;
  margin: 0 auto 64px;
}

.quick-entry input {
  width: 100%;
  height: 64px;
  border: 1px solid rgba(196, 199, 199, 0.5);
  border-radius: 24px;
  padding: 0 72px 0 40px;
  background: #f7f3f2;
  color: #1c1b1b;
  font: 600 18px/1 Inter, sans-serif;
  outline: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.quick-entry input:focus {
  border-color: transparent;
  box-shadow: 0 0 0 2px #000000;
}

.quick-entry button {
  position: absolute;
  top: 50%;
  right: 16px;
  display: grid;
  width: 40px;
  height: 40px;
  place-items: center;
  border: 0;
  border-radius: 12px;
  background: #000000;
  color: #ffffff;
  cursor: pointer;
  transform: translateY(-50%);
  transition: transform 0.18s;
}

.quick-entry button:hover {
  transform: translateY(-50%) scale(1.05);
}

.quick-entry button:active {
  transform: translateY(-50%) scale(0.95);
}

.summary-grid,
.feature-grid {
  display: grid;
  gap: 24px;
}

.summary-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-bottom: 64px;
}

.neo-card {
  border: 1px solid #e5e7eb;
  border-radius: 24px;
  background: #f7f9fb;
  padding: 24px;
  transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
}

.neo-card:hover {
  border-color: transparent;
  background: #ffffff;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  transform: translateY(-2px);
}

.neo-card.pressed {
  transform: scale(0.98);
}

.summary-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 292px;
}

.card-head,
.title-wrap,
.expense-row,
.total-line,
.progress-meta,
.thoughts-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.title-wrap {
  justify-content: flex-start;
  gap: 4px;
}

.title-wrap h2,
.thoughts-head h2,
.photo-caption h2 {
  margin: 0;
}

.title-wrap h2,
.thoughts-head h2 {
  font-size: 20px;
  line-height: 28px;
  font-weight: 600;
}

.card-head > span {
  color: rgba(68, 71, 72, 0.6);
  font-size: 12px;
  font-weight: 600;
}

.card-body {
  margin-top: 24px;
}

.check-list {
  display: grid;
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.check-list li {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 16px;
}

.check-list .checked {
  color: #4caf50;
}

.muted {
  opacity: 0.5;
}

.expense-row {
  margin-bottom: 12px;
  font-size: 16px;
}

.card-body h3 {
  margin: 0 0 4px;
  font-size: 16px;
}

.card-body p,
.goal-note,
.label {
  color: #444748;
}

.card-foot {
  margin-top: auto;
  padding-top: 24px;
  border-top: 1px solid rgba(196, 199, 199, 0.2);
}

.card-foot.diet {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.label {
  margin: 0 0 4px;
  font-size: 12px;
  font-weight: 600;
}

.card-foot strong {
  font-size: 20px;
}

.card-foot strong span,
.goal-note span {
  color: rgba(28, 27, 27, 0.5);
  font-size: 14px;
  font-weight: 400;
}

.progress-ring {
  width: 48px;
  height: 48px;
}

.progress-ring path {
  fill: none;
  stroke-width: 3;
}

.ring-bg {
  stroke: #e0e3e5;
}

.ring-value {
  stroke: #4caf50;
  stroke-dasharray: 50, 100;
  transform: rotate(-90deg);
  transform-origin: 50% 50%;
}

.total-line strong {
  color: #2196f3;
  font-size: 24px;
}

.progress-meta {
  margin-bottom: 4px;
  font-size: 12px;
  font-weight: 600;
}

.progress-meta strong {
  color: #ff9800;
  font-size: 12px;
}

.progress-track {
  height: 8px;
  margin-bottom: 12px;
  overflow: hidden;
  border-radius: 999px;
  background: #e0e3e5;
}

.progress-fill {
  display: block;
  width: 0;
  height: 100%;
  border-radius: inherit;
  background: #ff9800;
  transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
}

.progress-fill.ready {
  width: 60%;
}

.goal-note {
  margin: 0;
  text-align: center;
  font-size: 14px;
}

.card-action {
  width: 100%;
  min-height: 40px;
  margin-top: 24px;
  border: 0;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: filter 0.2s, opacity 0.2s;
}

.card-action:hover {
  filter: saturate(1.1);
  opacity: 0.9;
}

.feature-grid {
  grid-template-columns: minmax(0, 6fr) minmax(320px, 4fr);
  margin-bottom: 64px;
}

.memory-photo {
  position: relative;
  height: 400px;
  overflow: hidden;
  border-radius: 24px;
  background: #e5e2e1;
}

.memory-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.7s;
}

.memory-photo:hover img {
  transform: scale(1.05);
}

.photo-shade {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent);
}

.photo-caption {
  position: absolute;
  bottom: 24px;
  left: 24px;
  color: #ffffff;
}

.photo-caption h2 {
  font-size: 24px;
  line-height: 32px;
}

.photo-caption p {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 4px 0 0;
  opacity: 0.82;
  font-size: 12px;
  font-weight: 600;
}

.thoughts-card {
  display: flex;
  flex-direction: column;
}

.thoughts-head {
  margin-bottom: 40px;
}

.thoughts-head button {
  display: grid;
  width: 32px;
  height: 32px;
  place-items: center;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: #444748;
  cursor: pointer;
}

.thoughts-head button:hover {
  background: #e0e3e5;
}

.thought-list {
  display: grid;
  gap: 40px;
}

.thought-item {
  display: grid;
  grid-template-columns: 24px 1fr;
  gap: 24px;
}

.rail {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.rail span {
  width: 8px;
  height: 8px;
  margin-top: 8px;
  border-radius: 999px;
  background: #000000;
}

.rail i {
  width: 1px;
  flex: 1;
  min-height: 42px;
  background: rgba(196, 199, 199, 0.3);
}

.thought-item time {
  color: #444748;
  font-size: 12px;
  font-weight: 600;
}

.thought-item p {
  margin: 4px 0 0;
  font-size: 16px;
  line-height: 24px;
  transition: color 0.2s;
}

.thought-item:hover p {
  color: #000000;
}

.view-all {
  margin-top: auto;
  padding-top: 24px;
  border: 0;
  background: transparent;
  color: #000000;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.view-all:hover {
  text-decoration: underline;
}

.home-footer {
  display: grid;
  gap: 24px;
  padding: 24px;
  border: 1px solid rgba(196, 199, 199, 0.3);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
}

.countdown,
.stats {
  display: flex;
  align-items: center;
  gap: 12px;
}

.countdown {
  width: fit-content;
  padding: 8px 24px;
  border-radius: 12px;
  background: rgba(255, 218, 214, 0.2);
  color: #ba1a1a;
  font-size: 14px;
  font-weight: 600;
}

.countdown strong {
  font-size: 18px;
}

.stats {
  flex-wrap: wrap;
  color: #444748;
  font-size: 12px;
  font-weight: 600;
}

.stats .material-symbols-outlined {
  color: #5c5f61;
}

.stats strong {
  color: #1c1b1b;
}

.home-footer p {
  margin: 0;
  padding-top: 12px;
  border-top: 1px solid rgba(196, 199, 199, 0.1);
  color: rgba(68, 71, 72, 0.4);
  text-align: center;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.08em;
}

@media (max-width: 1180px) {
  .home-page {
    padding: 32px 24px;
  }

  .summary-grid,
  .feature-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .home-page {
    padding: 24px 16px 88px;
  }

  .home-header {
    align-items: flex-start;
    flex-direction: column;
    margin-bottom: 28px;
  }

  .home-header h1 {
    font-size: 24px;
    line-height: 32px;
  }

  .daily-status {
    width: 100%;
    justify-content: center;
    white-space: normal;
  }

  .quick-entry {
    margin-bottom: 40px;
  }

  .quick-entry input {
    height: 58px;
    padding-left: 20px;
    font-size: 16px;
  }

  .memory-photo {
    height: 320px;
  }

  .home-footer {
    align-items: stretch;
  }

  .countdown {
    width: 100%;
  }
}
</style>
