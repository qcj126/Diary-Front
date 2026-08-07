<template>
  <section class="home-page">
    <header class="home-header">
      <h1>主页</h1>
    </header>

    <main class="home-grid">
      <section class="today-panel">
        <div class="day-mark">
          <span>{{ dayNumber }}</span>
          <small>{{ weekLabel }}</small>
        </div>
        <div class="today-copy">
          <p class="kicker">今日总览</p>
          <h2>{{ monthLabel }}的生活节奏</h2>
          <p>{{ dailyLine }}</p>
        </div>
        <div class="today-actions" aria-label="今日快捷入口">
          <button type="button" @click="go('timeline')">
            <span class="material-symbols-outlined">auto_stories</span>
            时光机
          </button>
          <button type="button" @click="go('board')">
            <span class="material-symbols-outlined">chat_bubble</span>
            生活随想
          </button>
        </div>
      </section>

      <section class="focus-panel">
        <div class="section-head">
          <h2>今日重点</h2>
          <span>{{ activeFocusCount }} 项进行中</span>
        </div>
        <div class="focus-list">
          <article v-for="item in focusItems" :key="item.key" class="focus-item" :style="{ '--accent': item.color }">
            <span class="material-symbols-outlined">{{ item.icon }}</span>
            <div>
              <strong>{{ item.title }}</strong>
              <p>{{ item.detail }}</p>
            </div>
            <button type="button" :aria-label="item.title" @click="go(item.key)">
              <span class="material-symbols-outlined">arrow_forward</span>
            </button>
          </article>
        </div>
      </section>

      <section class="module-map">
        <div class="section-head">
          <h2>菜单联动</h2>
          <span>7 个空间</span>
        </div>
        <div class="module-grid">
          <button
            v-for="module in modules"
            :key="module.key"
            type="button"
            class="module-card"
            :style="{ '--accent': module.color }"
            @click="go(module.key)"
          >
            <span class="material-symbols-outlined">{{ module.icon }}</span>
            <strong>{{ module.label }}</strong>
            <small>{{ module.meta }}</small>
          </button>
        </div>
      </section>

      <section class="ledger-panel">
        <div class="section-head">
          <h2>账目脉搏</h2>
          <button type="button" @click="go('ledger')">
            <span class="material-symbols-outlined">payments</span>
          </button>
        </div>
        <div class="money-line">
          <span>本周预算余量</span>
          <strong>¥1,260</strong>
        </div>
        <div class="meter"><i style="width: 68%"></i></div>
        <div class="ledger-tags">
          <span>餐饮 ¥286</span>
          <span>交通 ¥72</span>
          <span>学习 ¥399</span>
        </div>
      </section>

      <section class="wellness-panel">
        <div class="section-head">
          <h2>饮食与厨房</h2>
          <div class="icon-actions">
            <button type="button" @click="go('diet')">
              <span class="material-symbols-outlined">restaurant</span>
            </button>
            <button type="button" @click="go('diary')">
              <span class="material-symbols-outlined">edit_note</span>
            </button>
          </div>
        </div>
        <div class="meal-row">
          <span>早餐</span>
          <strong>牛油果吐司</strong>
          <small>420 kcal</small>
        </div>
        <div class="meal-row">
          <span>晚餐灵感</span>
          <strong>番茄牛腩</strong>
          <small>30 分钟</small>
        </div>
      </section>
    </main>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const emit = defineEmits(['navigate'])

const focusItems = [
  {
    key: 'wishlist',
    title: '阶段目标',
    detail: 'XXL-JOB 学习进度推进到 65%',
    icon: 'flag',
    color: '#ff9800',
  },
  {
    key: 'diet',
    title: '饮食记录',
    detail: '今日已记录 3 餐，蛋白摄入稳定',
    icon: 'restaurant',
    color: '#4d938a',
  },
  {
    key: 'ledger',
    title: '账目',
    detail: '本周支出保持在预算线以内',
    icon: 'payments',
    color: '#3f7bd8',
  },
]

const modules = [
  { key: 'timeline', label: '时光机', meta: '最近 6 条记忆', icon: 'auto_stories', color: '#00b8d9' },
  { key: 'dates', label: '恋爱记录', meta: '纪念日倒计时', icon: 'favorite', color: '#e85d75' },
  { key: 'diary', label: '厨房创食记', meta: '今日食谱 2 道', icon: 'edit_note', color: '#ba5839' },
  { key: 'wishlist', label: '阶段目标', meta: '3 项进行中', icon: 'flag', color: '#ff9800' },
  { key: 'board', label: '生活随想', meta: '本周 4 条', icon: 'chat_bubble', color: '#6f7bd9' },
  { key: 'ledger', label: '账目', meta: '预算余量 68%', icon: 'payments', color: '#3f7bd8' },
  { key: 'diet', label: '饮食记录', meta: '摄入 1,610 kcal', icon: 'restaurant', color: '#4d938a' },
]

const now = new Date()
const dayNumber = computed(() => String(now.getDate()).padStart(2, '0'))
const weekLabel = computed(() => new Intl.DateTimeFormat('zh-CN', { weekday: 'long' }).format(now))
const monthLabel = computed(() => new Intl.DateTimeFormat('zh-CN', { month: 'long' }).format(now))
const activeFocusCount = computed(() => focusItems.length)
const dailyLine = computed(() => '把记录、目标、吃饭、花钱和那些小情绪放在同一张桌面上。')

function go(key) {
  emit('navigate', key)
}
</script>

<style scoped>
.home-page {
  width: 100%;
  min-height: 100vh;
  padding: 1rem;
  overflow-x: hidden;
  background:
    radial-gradient(circle at 12% 10%, rgba(77, 147, 138, 0.14), transparent 26rem),
    radial-gradient(circle at 86% 14%, rgba(255, 152, 0, 0.12), transparent 24rem),
    linear-gradient(135deg, var(--dashboard-bg, #fdf8f8), var(--dashboard-surface-soft, #f7f3f2));
  color: var(--dashboard-text, #1c1b1b);
  font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.home-header {
  display: flex;
  align-items: center;
  height: 72px;
  min-height: 72px;
  margin: -1rem -1rem 1rem;
  padding: 0 2.5rem;
  background-color: #fff8f6;
  border-bottom: 1px solid rgba(220, 193, 185, 0.72);
}

.home-header h1,
.section-head h2,
.today-copy h2 {
  margin: 0;
  color: var(--dashboard-text-strong, #000000);
}

.home-header h1 {
  font-size: 1.75rem;
  line-height: 1.2;
  font-weight: 700;
}

.home-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(320px, 0.65fr);
  gap: 1rem;
}

.today-panel,
.focus-panel,
.module-map,
.ledger-panel,
.wellness-panel {
  border: 1px solid var(--dashboard-border-soft, rgba(196, 199, 199, 0.56));
  border-radius: 8px;
  background: color-mix(in srgb, var(--dashboard-surface, #ffffff) 88%, transparent);
  box-shadow: var(--dashboard-shadow, 0 18px 50px rgba(28, 27, 27, 0.08));
  backdrop-filter: blur(16px);
}

.today-panel {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 1.25rem;
  align-items: center;
  min-height: 218px;
  padding: 1.5rem;
}

.day-mark {
  display: grid;
  place-items: center;
  width: 112px;
  aspect-ratio: 1;
  border: 1px solid var(--dashboard-border-soft, rgba(196, 199, 199, 0.56));
  border-radius: 8px;
  background: #1c1b1a;
  color: #ffffff;
}

.day-mark span {
  font-size: 3rem;
  font-weight: 800;
  line-height: 1;
}

.day-mark small,
.kicker,
.section-head span,
.module-card small,
.meal-row small,
.money-line span,
.ledger-tags span,
.memory-card time {
  color: var(--dashboard-text-muted, #5c5f61);
}

.day-mark small {
  color: rgba(255, 255, 255, 0.72);
}

.kicker {
  margin: 0 0 0.6rem;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.today-copy h2 {
  font-size: clamp(2rem, 4vw, 4.2rem);
  line-height: 1.05;
}

.today-copy p:last-child {
  max-width: 620px;
  margin: 1rem 0 0;
  color: var(--dashboard-text-muted, #5c5f61);
  line-height: 1.7;
}

.today-actions,
.icon-actions {
  display: flex;
  gap: 0.5rem;
}

button {
  min-height: 40px;
  border: 1px solid var(--dashboard-border, #c4c7c7);
  border-radius: 8px;
  background: var(--dashboard-surface-muted, #f1edec);
  color: var(--dashboard-text, #1c1b1b);
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.today-actions {
  flex-direction: column;
}

.today-actions button,
.section-head button,
.icon-actions button,
.focus-item button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  padding: 0 0.9rem;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.1rem 1.25rem 0;
}

.section-head h2 {
  font-size: 1.05rem;
  line-height: 1.25;
}

.focus-panel,
.timeline-strip,
.module-map,
.ledger-panel,
.wellness-panel {
  min-height: 0;
}

.focus-list {
  display: grid;
  gap: 0.75rem;
  padding: 1rem 1.25rem 1.25rem;
}

.focus-item {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr) 42px;
  gap: 0.85rem;
  align-items: center;
  padding: 0.9rem;
  border: 1px solid color-mix(in srgb, var(--accent) 32%, transparent);
  border-radius: 8px;
  background: color-mix(in srgb, var(--accent) 9%, var(--dashboard-surface, #ffffff));
}

.focus-item > .material-symbols-outlined {
  display: grid;
  place-items: center;
  width: 42px;
  aspect-ratio: 1;
  border-radius: 8px;
  background: var(--accent);
  color: #ffffff;
}

.focus-item strong,
.memory-card strong,
.module-card strong,
.money-line strong,
.meal-row strong {
  color: var(--dashboard-text-strong, #000000);
}

.focus-item p {
  margin: 0.2rem 0 0;
  color: var(--dashboard-text-muted, #5c5f61);
  line-height: 1.5;
}

.module-map {
  grid-column: 1 / -1;
}

.module-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 0.75rem;
  padding: 1rem 1.25rem 1.25rem;
}

.module-card {
  display: grid;
  gap: 0.5rem;
  justify-items: start;
  min-height: 112px;
  padding: 0.9rem;
  text-align: left;
  border-color: color-mix(in srgb, var(--accent) 28%, var(--dashboard-border, #c4c7c7));
  background: color-mix(in srgb, var(--accent) 8%, var(--dashboard-surface, #ffffff));
}

.module-card .material-symbols-outlined {
  color: var(--accent);
}

.ledger-panel,
.wellness-panel {
  padding-bottom: 1.25rem;
}

.money-line,
.meal-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin: 1rem 1.25rem 0;
}

.money-line strong {
  font-size: 2rem;
}

.meter {
  height: 10px;
  margin: 1rem 1.25rem 0;
  overflow: hidden;
  border-radius: 999px;
  background: var(--dashboard-hover, #e0e3e5);
}

.meter i {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #4d938a, #ff9800);
}

.ledger-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 1rem 1.25rem 0;
}

.ledger-tags span {
  padding: 0.35rem 0.55rem;
  border: 1px solid var(--dashboard-border-soft, rgba(196, 199, 199, 0.56));
  border-radius: 8px;
  background: var(--dashboard-surface-soft, #f7f3f2);
}

.meal-row {
  min-height: 52px;
  padding-bottom: 0.85rem;
  border-bottom: 1px solid var(--dashboard-border-soft, rgba(196, 199, 199, 0.56));
}

.meal-row:last-child {
  border-bottom: 0;
}

.material-symbols-outlined {
  font-family: 'Material Symbols Outlined';
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  font-size: 22px;
  line-height: 1;
}

@media (max-width: 1180px) {
  .home-grid {
    grid-template-columns: 1fr;
  }

  .module-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .today-panel {
    grid-template-columns: 1fr;
  }

  .today-actions {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .module-grid {
    grid-template-columns: 1fr 1fr;
  }

  .today-copy h2 {
    font-size: 2rem;
  }
}
</style>
