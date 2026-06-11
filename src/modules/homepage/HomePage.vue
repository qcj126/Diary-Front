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
                <span>饮水目标：2L</span>
              </li>
              <li>
                <span class="material-symbols-outlined checked">directions_walk</span>
                <span>运动目标：10000 步</span>
              </li>
            </ul>

            <div v-if="targetEditorOpen" class="target-editor">
              <div class="water-editor">
                <span class="label">饮水量</span>
                <div class="stepper">
                  <button type="button" aria-label="减少一杯水" @click="changeWaterCups(-1)">
                    <span class="material-symbols-outlined">remove</span>
                  </button>
                  <strong>{{ waterCups }} 杯</strong>
                  <button type="button" aria-label="增加一杯水" @click="changeWaterCups(1)">
                    <span class="material-symbols-outlined">add</span>
                  </button>
                </div>
                <p>{{ waterMl }}ml <span>每杯 500ml</span></p>
              </div>

              <label class="steps-editor">
                <span class="label">运动量</span>
                <input
                  v-model.number="stepCount"
                  type="number"
                  min="0"
                  max="100000"
                  step="100"
                  inputmode="numeric"
                  @blur="normalizeStepCount"
                />
              </label>
            </div>
          </template>

          <template v-else-if="card.type === 'finance'">
            <div v-for="item in expenseItems" :key="item.id" class="expense-row">
              <span>{{ item.name }}</span>
              <strong>{{ formatAmount(item.amount) }} 元</strong>
            </div>

            <form v-if="expenseEditorOpen" class="expense-editor" @submit.prevent.stop="addExpense">
              <label>
                <span class="label">名称</span>
                <input v-model.trim="expenseName" type="text" placeholder="例如 午餐" />
              </label>
              <label>
                <span class="label">金额</span>
                <input
                  v-model.number="expenseAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  inputmode="decimal"
                  placeholder="0.00"
                />
              </label>
              <button type="submit" :disabled="!canAddExpense">
                <span class="material-symbols-outlined">check</span>
                记一笔
              </button>
            </form>
          </template>

          <template v-else-if="card.type === 'goal'">
            <div class="study-goal-current">
              <span class="label">Java求学目标</span>
              <h3>{{ selectedStudyGoal }}</h3>
              <p>{{ studyGoalProgress }}% 已完成</p>
            </div>

            <div v-if="studyGoalEditorOpen" class="study-goal-editor">
              <label>
                <span class="label">选择目标</span>
                <select v-model="selectedStudyGoal">
                  <option v-for="goal in javaStudyGoals" :key="goal" :value="goal">
                    {{ goal }}
                  </option>
                </select>
              </label>

              <label>
                <span class="label">更新进度</span>
                <input
                  v-model.number="studyGoalProgress"
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  aria-label="更新Java求学目标进度"
                />
              </label>

              <div class="progress-stepper">
                <button type="button" aria-label="减少进度" @click="changeStudyProgress(-5)">
                  <span class="material-symbols-outlined">remove</span>
                </button>
                <strong>{{ studyGoalProgress }}%</strong>
                <button type="button" aria-label="增加进度" @click="changeStudyProgress(5)">
                  <span class="material-symbols-outlined">add</span>
                </button>
              </div>
            </div>
          </template>
        </div>

        <div class="card-foot" :class="card.type">
          <template v-if="card.type === 'diet'">
            <div class="target-progress-list">
              <div v-for="target in dailyTargets" :key="target.label" class="target-progress">
                <div class="target-meta">
                  <span class="label">{{ target.label }}</span>
                  <strong>{{ target.currentText }} <span>/ {{ target.goalText }}</span></strong>
                </div>
                <div class="target-track">
                  <span
                    class="target-fill"
                    :class="{ ready: progressReady }"
                    :style="{ '--target-progress': target.progress }"
                  />
                </div>
              </div>
            </div>
          </template>

          <template v-else-if="card.type === 'finance'">
            <div class="total-line">
              <span class="label">今日总计</span>
              <strong>{{ formatAmount(expenseTotal) }} 元</strong>
            </div>
          </template>

          <template v-else-if="card.type === 'goal'">
            <div class="progress-meta">
              <span>阶段进度</span>
              <strong>{{ studyGoalProgress }}%</strong>
            </div>
            <div class="progress-track">
              <span
                class="progress-fill"
                :class="{ ready: progressReady }"
                :style="{ '--goal-progress': `${studyGoalProgress}%` }"
              />
            </div>
            <p class="goal-note">{{ selectedStudyGoal }} <span>/ Java求学</span></p>
          </template>
        </div>

        <button type="button" class="card-action" :style="card.buttonStyle" @click="handleCardAction(card)">
          {{ card.action }}
        </button>
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
          <button type="button" aria-label="更多" @click="toggleThoughtWeekMenu">
            <span class="material-symbols-outlined">more_horiz</span>
          </button>
          <div v-if="thoughtWeekMenuOpen" class="thought-week-menu" aria-label="生活随想周数选择">
            <button type="button" aria-label="上一周" @click="changeThoughtWeek(-1)">
              <span class="material-symbols-outlined">remove</span>
            </button>
            <span>第 <strong>{{ selectedWeekNumber }}</strong> 周</span>
            <button type="button" aria-label="下一周" @click="changeThoughtWeek(1)">
              <span class="material-symbols-outlined">add</span>
            </button>
          </div>
        </div>

        <div class="thought-list">
          <div v-for="(item, index) in visibleThoughts" :key="item.id" class="thought-item">
            <div class="rail">
              <span />
              <i v-if="index !== visibleThoughts.length - 1" />
            </div>
            <div>
              <time>{{ item.dateLabel }} {{ item.time }}</time>
              <p>{{ item.text }}</p>
            </div>
          </div>
          <p v-if="!visibleThoughts.length" class="empty-thoughts">这一周还没有随想。</p>
        </div>
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

function handleWheel(e) {
  // 检查事件目标是否在可滚动的子元素内，如果是则允许滚动
  let target = e.target
  while (target && target !== e.currentTarget) {
    const style = getComputedStyle(target)
    const overflowY = style.overflowY
    if (
      (overflowY === 'auto' || overflowY === 'scroll') &&
      target.scrollHeight > target.clientHeight
    ) {
      return // 子元素可滚动，不阻止
    }
    target = target.parentElement
  }
  // 阻止主页级别的滚动
  e.preventDefault()
}

const quickText = ref('')
const progressReady = ref(false)
const targetEditorOpen = ref(false)
const expenseEditorOpen = ref(false)
const studyGoalEditorOpen = ref(false)
const waterCups = ref(0)
const stepCount = ref(0)
const selectedStudyGoal = ref('XXL-JOB')
const studyGoalProgress = ref(0)
const expenseName = ref('')
const expenseAmount = ref(null)
const thoughtWeekMenuOpen = ref(false)
const selectedWeekOffset = ref(0)
const expenseItems = ref([
  { id: 1, name: '早餐', amount: 12 },
  { id: 2, name: '咖啡', amount: 28 },
])

const WATER_PER_CUP_ML = 500
const WATER_GOAL_ML = 2000
const STEP_GOAL = 10000
const javaStudyGoals = ['XXL-JOB', '虚拟线程', 'SpringSecurity', '异步任务', '线程池', 'Netty', 'Stream流', '文件流']

const waterMl = computed(() => waterCups.value * WATER_PER_CUP_ML)
const waterLiters = computed(() => formatLiters(waterMl.value))
const waterGoalLiters = computed(() => formatLiters(WATER_GOAL_ML))
const expenseTotal = computed(() => expenseItems.value.reduce((total, item) => total + item.amount, 0))
const canAddExpense = computed(() => expenseName.value && Number(expenseAmount.value) > 0)
const selectedWeekStart = computed(() => addDays(getWeekStart(new Date()), selectedWeekOffset.value * 7))
const selectedWeekEnd = computed(() => addDays(selectedWeekStart.value, 7))
const selectedWeekNumber = computed(() => getWeekNumber(selectedWeekStart.value))
const visibleThoughts = computed(() =>
  thoughts.value
    .filter((item) => {
      const date = new Date(item.createdAt)
      return date >= selectedWeekStart.value && date < selectedWeekEnd.value
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((item) => ({
      ...item,
      time: formatTime(item.createdAt),
      dateLabel: formatThoughtDate(item.createdAt),
    })),
)

const dailyTargets = computed(() => [
  {
    label: '每日饮水量',
    currentText: waterLiters.value,
    goalText: waterGoalLiters.value,
    progress: progressPercent(waterMl.value, WATER_GOAL_ML),
  },
  {
    label: '每日运动量',
    currentText: `${stepCount.value} 步`,
    goalText: `${STEP_GOAL} 步`,
    progress: progressPercent(stepCount.value, STEP_GOAL),
  },
])

const summaryCards = [
  {
    type: 'diet',
    title: '今日目标',
    tag: 'Daily Goals',
    icon: 'track_changes',
    color: '#4caf50',
    action: '记录目标',
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

const now = new Date()
const thoughts = ref([
  { id: 1, createdAt: setTime(now, 9, 32).toISOString(), text: '今天地铁上遇到一件温柔的小事。' },
  { id: 2, createdAt: setTime(now, 18, 20).toISOString(), text: '雨停了，空气很好，深呼吸的感觉很棒。' },
  { id: 3, createdAt: setTime(now, 21, 15).toISOString(), text: '完成运动 30 分钟，出汗的感觉很解压。' },
  { id: 4, createdAt: setTime(addDays(now, -7), 20, 8).toISOString(), text: '上周散步时路过花店，顺手买了一束小雏菊。' },
])

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
  const text = quickText.value.trim()
  if (!text) return

  thoughts.value.push({
    id: Date.now(),
    createdAt: new Date().toISOString(),
    text,
  })
  selectedWeekOffset.value = 0
  quickText.value = ''
}

function toggleThoughtWeekMenu() {
  thoughtWeekMenuOpen.value = !thoughtWeekMenuOpen.value
}

function changeThoughtWeek(delta) {
  selectedWeekOffset.value += delta
}

function pressCard(event) {
  event.currentTarget.classList.add('pressed')
}

function releaseCard(event) {
  event.currentTarget.classList.remove('pressed')
}

function progressPercent(current, goal) {
  if (!goal) return '0%'
  return `${Math.min(Math.max((current / goal) * 100, 0), 100)}%`
}

function formatLiters(ml) {
  const liters = ml / 1000
  return `${Number.isInteger(liters) ? liters : liters.toFixed(1)}L`
}

function formatAmount(amount) {
  return Number.isInteger(amount) ? amount : amount.toFixed(2)
}

function formatTime(value) {
  return new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(value))
}

function formatThoughtDate(value) {
  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(value))
}

function setTime(date, hour, minute) {
  const nextDate = new Date(date)
  nextDate.setHours(hour, minute, 0, 0)
  return nextDate
}

function addDays(date, days) {
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + days)
  return nextDate
}

function getWeekStart(date) {
  const nextDate = new Date(date)
  const day = nextDate.getDay() || 7
  nextDate.setHours(0, 0, 0, 0)
  nextDate.setDate(nextDate.getDate() - day + 1)
  return nextDate
}

function getWeekNumber(date) {
  const target = getWeekStart(date)
  const yearStart = getWeekStart(new Date(target.getFullYear(), 0, 4))
  return Math.floor((target - yearStart) / (7 * 24 * 60 * 60 * 1000)) + 1
}

function changeWaterCups(delta) {
  waterCups.value = Math.max(0, waterCups.value + delta)
}

function handleCardAction(card) {
  if (card.type === 'diet') {
    targetEditorOpen.value = !targetEditorOpen.value
  } else if (card.type === 'finance') {
    expenseEditorOpen.value = !expenseEditorOpen.value
  } else if (card.type === 'goal') {
    studyGoalEditorOpen.value = !studyGoalEditorOpen.value
  }
}

function addExpense() {
  if (!canAddExpense.value) return

  expenseItems.value.push({
    id: Date.now(),
    name: expenseName.value,
    amount: Number(expenseAmount.value),
  })
  expenseName.value = ''
  expenseAmount.value = null
}

function normalizeStepCount() {
  const value = Number(stepCount.value)
  stepCount.value = Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0
}

function changeStudyProgress(delta) {
  studyGoalProgress.value = clampProgress(studyGoalProgress.value + delta)
}

function clampProgress(value) {
  const normalized = Number(value)
  if (!Number.isFinite(normalized)) return 0
  return Math.min(Math.max(Math.round(normalized), 0), 100)
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
  max-width: 1680px;
  margin: 0 auto;
  padding: clamp(24px, 3vw, 44px) clamp(18px, 4vw, 64px);
  color: #1c1b1b;
  font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  min-height: 100vh;
  overflow-x: hidden;
}

.home-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: clamp(16px, 2vw, 24px);
  margin-bottom: clamp(24px, 3vw, 40px);
}

.home-header h1 {
  margin: 0;
  font-size: clamp(24px, 2vw, 34px);
  line-height: 1.2;
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
  max-width: 100%;
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
  width: min(100%, 820px);
  margin: 0 auto clamp(36px, 4vw, 64px);
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
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
  margin-bottom: clamp(36px, 4vw, 64px);
}

.neo-card {
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  background: #f7f9fb;
  padding: clamp(18px, 2vw, 24px);
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
  min-height: clamp(248px, 26vw, 292px);
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

.target-editor {
  display: grid;
  gap: 14px;
  margin-top: 18px;
  padding: 14px;
  border: 1px solid rgba(76, 175, 80, 0.18);
  border-radius: 16px;
  background: rgba(76, 175, 80, 0.06);
}

.water-editor,
.steps-editor {
  display: grid;
  gap: 8px;
}

.stepper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.stepper button {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  border: 0;
  border-radius: 10px;
  background: #ffffff;
  color: #4caf50;
  cursor: pointer;
  box-shadow: inset 0 0 0 1px rgba(76, 175, 80, 0.22);
}

.stepper strong {
  font-size: 18px;
}

.water-editor p {
  margin: 0;
  color: #1c1b1b;
  font-size: 13px;
  font-weight: 600;
}

.water-editor p span {
  color: rgba(28, 27, 27, 0.5);
  font-weight: 400;
}

.steps-editor input {
  width: 100%;
  height: 40px;
  border: 1px solid rgba(196, 199, 199, 0.5);
  border-radius: 12px;
  padding: 0 12px;
  background: #ffffff;
  color: #1c1b1b;
  font: 600 16px/1 Inter, sans-serif;
  outline: none;
}

.steps-editor input:focus {
  border-color: #4caf50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.16);
}

.muted {
  opacity: 0.5;
}

.expense-row {
  margin-bottom: 12px;
  font-size: 16px;
}

.expense-editor {
  display: grid;
  gap: 12px;
  margin-top: 18px;
  padding: 14px;
  border: 1px solid rgba(33, 150, 243, 0.18);
  border-radius: 16px;
  background: rgba(33, 150, 243, 0.06);
}

.expense-editor label {
  display: grid;
  gap: 6px;
}

.expense-editor input {
  width: 100%;
  height: 40px;
  border: 1px solid rgba(196, 199, 199, 0.5);
  border-radius: 12px;
  padding: 0 12px;
  background: #ffffff;
  color: #1c1b1b;
  font: 600 15px/1 Inter, sans-serif;
  outline: none;
}

.expense-editor input:focus {
  border-color: #2196f3;
  box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.16);
}

.expense-editor button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 38px;
  border: 0;
  border-radius: 12px;
  background: #2196f3;
  color: #ffffff;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.expense-editor button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.study-goal-current {
  display: grid;
  gap: 4px;
}

.study-goal-current p {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
}

.study-goal-editor {
  display: grid;
  gap: 14px;
  margin-top: 18px;
  padding: 14px;
  border: 1px solid rgba(255, 152, 0, 0.22);
  border-radius: 16px;
  background: rgba(255, 152, 0, 0.07);
}

.study-goal-editor label {
  display: grid;
  gap: 8px;
}

.study-goal-editor select {
  width: 100%;
  height: 40px;
  border: 1px solid rgba(196, 199, 199, 0.5);
  border-radius: 12px;
  padding: 0 12px;
  background: #ffffff;
  color: #1c1b1b;
  font: 600 15px/1 Inter, sans-serif;
  outline: none;
}

.study-goal-editor select:focus {
  border-color: #ff9800;
  box-shadow: 0 0 0 2px rgba(255, 152, 0, 0.16);
}

.study-goal-editor input[type='range'] {
  width: 100%;
  accent-color: #ff9800;
}

.progress-stepper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.progress-stepper button {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  border: 0;
  border-radius: 10px;
  background: #ffffff;
  color: #ff9800;
  cursor: pointer;
  box-shadow: inset 0 0 0 1px rgba(255, 152, 0, 0.25);
}

.progress-stepper strong {
  font-size: 18px;
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
  display: block;
}

.target-progress-list {
  display: grid;
  gap: 14px;
}

.target-progress {
  display: grid;
  gap: 8px;
}

.target-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.target-meta strong {
  white-space: nowrap;
}

.target-track {
  height: 8px;
  overflow: hidden;
  border-radius: 999px;
  background: #e0e3e5;
}

.target-fill {
  display: block;
  width: 0;
  height: 100%;
  border-radius: inherit;
  background: #4caf50;
  transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
}

.target-fill.ready {
  width: var(--target-progress);
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
  width: var(--goal-progress, 60%);
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
  grid-template-columns: minmax(360px, 6fr) minmax(300px, 4fr);
  margin-bottom: clamp(36px, 4vw, 64px);
}

.memory-photo {
  position: relative;
  min-height: 280px;
  height: clamp(300px, 34vw, 440px);
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
  min-height: clamp(300px, 34vw, 440px);
}

.thoughts-head {
  position: relative;
  margin-bottom: clamp(20px, 3vw, 40px);
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

.thought-week-menu {
  position: absolute;
  top: 40px;
  right: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 172px;
  padding: 10px 12px;
  border: 1px solid rgba(196, 199, 199, 0.45);
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
}

.thought-week-menu button {
  width: 30px;
  height: 30px;
  background: #f7f9fb;
}

.thought-week-menu span {
  flex: 1;
  color: #444748;
  font-size: 13px;
  font-weight: 600;
  text-align: center;
  white-space: nowrap;
}

.thought-week-menu strong {
  color: #1c1b1b;
}

.thought-list {
  display: grid;
  gap: clamp(22px, 3vw, 40px);
  max-height: min(292px, 38vh);
  overflow-y: auto;
  padding-right: 8px;
  scrollbar-width: thin;
  scrollbar-color: #c4c7c7 transparent;
}

.thought-list::-webkit-scrollbar {
  width: 6px;
}

.thought-list::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: #c4c7c7;
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

.empty-thoughts {
  margin: 0;
  color: rgba(68, 71, 72, 0.7);
  font-size: 14px;
  line-height: 22px;
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
  grid-template-columns: max-content minmax(0, 1fr);
  align-items: center;
  gap: 16px 24px;
  padding: clamp(18px, 2vw, 24px);
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
  justify-content: flex-end;
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
  grid-column: 1 / -1;
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
  .feature-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .home-page {
    padding: 20px 14px 88px;
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
    padding: 0 64px 0 18px;
    font-size: 16px;
  }

  .memory-photo {
    height: 300px;
  }

  .summary-card {
    min-height: 0;
  }

  .home-footer {
    grid-template-columns: 1fr;
    align-items: stretch;
  }

  .countdown {
    width: 100%;
  }

  .stats {
    justify-content: flex-start;
  }
}
</style>
