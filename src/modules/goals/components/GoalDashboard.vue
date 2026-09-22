<template>
  <div class="goal-dashboard">
    <section class="review-hero">
      <div>
        <span class="eyebrow">GOAL REVIEW</span>
        <h2>{{ dashboard.periodName || periodLabel }}</h2>
        <p v-if="dashboard.startDate" class="period-copy">
          {{ formatDate(dashboard.startDate) }} — {{ formatDate(dashboard.endDate) }}
          <span>· 数据截至 {{ formatDate(dashboard.dataThroughDate) }}</span>
        </p>
        <p v-else class="period-copy">把每一次投入，变成看得见的成长轨迹。</p>
      </div>

      <form class="review-controls" @submit.prevent="loadDashboard">
        <div class="period-switch" aria-label="复盘周期">
          <button
            v-for="option in periodOptions"
            :key="option.value"
            type="button"
            :class="{ active: filters.periodType === option.value }"
            @click="changePeriod(option.value)"
          >
            {{ option.label }}
          </button>
        </div>
        <label class="control-field">
          <span>统计日期</span>
          <input v-model="filters.anchorDate" type="date" :max="today" @change="loadDashboard" />
        </label>
        <label class="control-field stale-field">
          <span>未更新阈值</span>
          <span class="number-input"><input v-model.number="filters.staleDays" type="number" min="1" max="3650" /><b>天</b></span>
        </label>
        <button class="refresh-button" type="submit" :disabled="loading" title="刷新复盘数据">
          <span class="material-symbols-outlined" :class="{ spinning: loading }">refresh</span>
          {{ loading ? '统计中' : '刷新' }}
        </button>
      </form>
    </section>

    <div v-if="errorMessage && !hasDashboardData" class="state-panel error-state">
      <span class="material-symbols-outlined">cloud_off</span>
      <div>
        <strong>复盘数据暂时没有加载成功</strong>
        <p>{{ errorMessage }}</p>
      </div>
      <button type="button" @click="loadDashboard">重新加载</button>
    </div>

    <template v-else>
      <div v-if="errorMessage" class="inline-error">
        <span class="material-symbols-outlined">info</span>
        {{ errorMessage }}，当前仍展示上一次统计结果。
      </div>

      <section class="summary-grid" :class="{ skeleton: loading && !hasDashboardData }">
        <article class="summary-card completion-card">
          <div class="rate-ring" :style="rateRingStyle(summary.completionRate, '#26a69a')">
            <span>{{ formatPercent(summary.completionRate) }}</span>
          </div>
          <div>
            <span class="metric-label">目标完成率</span>
            <strong>{{ summary.completedGoalCount }} / {{ summary.dueGoalCount }}</strong>
            <small>已完成 / 已到期目标</small>
          </div>
        </article>

        <article class="summary-card overdue-card">
          <span class="metric-icon"><span class="material-symbols-outlined">event_busy</span></span>
          <div>
            <span class="metric-label">目标逾期率</span>
            <strong>{{ formatPercent(summary.overdueRate) }}</strong>
            <small>{{ summary.overdueGoalCount }} 个目标发生逾期</small>
          </div>
        </article>

        <article class="summary-card hours-card">
          <span class="metric-icon"><span class="material-symbols-outlined">timer</span></span>
          <div>
            <span class="metric-label">周期投入</span>
            <strong>{{ formatHours(summary.periodSpentHours) }}<i>h</i></strong>
            <small>有效打卡累计时长</small>
          </div>
        </article>

        <article class="summary-card streak-card">
          <span class="metric-icon"><span class="material-symbols-outlined">local_fire_department</span></span>
          <div>
            <span class="metric-label">连续打卡</span>
            <strong>{{ summary.currentStreakDays }}<i>天</i></strong>
            <small>周期最长 {{ summary.longestStreakDays }} 天</small>
          </div>
        </article>
      </section>

      <section class="deviation-strip">
        <div class="deviation-copy">
          <span class="metric-icon"><span class="material-symbols-outlined">balance</span></span>
          <div>
            <span class="metric-label">预计与实际时长偏差</span>
            <strong :class="deviationTone">
              {{ signedHours(summary.hourDeviation) }}
              <small>（{{ signedPercent(summary.hourDeviationRate) }}）</small>
            </strong>
          </div>
        </div>
        <div class="comparison-bar" aria-label="预计与实际投入对比">
          <div>
            <span>预计</span>
            <i><b class="estimated" :style="{ width: `${estimatedWidth}%` }" /></i>
            <strong>{{ formatHours(summary.completedEstimatedHours) }}h</strong>
          </div>
          <div>
            <span>实际</span>
            <i><b class="actual" :style="{ width: `${actualWidth}%` }" /></i>
            <strong>{{ formatHours(summary.completedActualHours) }}h</strong>
          </div>
        </div>
      </section>

      <section class="chart-grid">
        <article class="dashboard-card trend-card">
          <header>
            <div>
              <span class="eyebrow">FOCUS TIME</span>
              <h3>投入时长趋势</h3>
            </div>
            <strong>{{ formatHours(summary.periodSpentHours) }}h</strong>
          </header>
          <div v-if="!dashboard.timeTrend.length && !loading" class="chart-empty">
            <span class="material-symbols-outlined">monitoring</span>
            <p>本周期还没有投入记录</p>
          </div>
          <div ref="trendChartEl" class="chart" role="img" aria-label="每日或每周投入时长趋势图" />
        </article>

        <article class="dashboard-card category-card">
          <header>
            <div>
              <span class="eyebrow">TIME SHARE</span>
              <h3>分类投入占比</h3>
            </div>
          </header>
          <div v-if="!dashboard.categoryDistribution.length && !loading" class="chart-empty">
            <span class="material-symbols-outlined">donut_large</span>
            <p>打卡后将在这里形成分类占比</p>
          </div>
          <div ref="categoryChartEl" class="chart category-chart" role="img" aria-label="目标分类投入占比图" />
          <div v-if="dashboard.categoryDistribution.length" class="category-legend">
            <span v-for="(item, index) in dashboard.categoryDistribution" :key="item.category">
              <i :style="{ background: chartColors[index % chartColors.length] }" />
              {{ item.category }} <b>{{ formatPercent(item.percentage) }}</b>
            </span>
          </div>
        </article>

        <article class="dashboard-card burndown-card">
          <header>
            <div>
              <span class="eyebrow">BURNDOWN</span>
              <h3>目标燃尽图</h3>
            </div>
            <div class="line-legend"><span class="actual-line">实际剩余</span><span class="ideal-line">理想剩余</span></div>
          </header>
          <div v-if="!dashboard.burndown.length && !loading" class="chart-empty">
            <span class="material-symbols-outlined">ssid_chart</span>
            <p>暂无可计算的目标工时</p>
          </div>
          <div ref="burndownChartEl" class="chart burndown-chart" role="img" aria-label="目标工时燃尽图" />
        </article>
      </section>

      <section class="dashboard-card stale-card">
        <header>
          <div>
            <span class="eyebrow">NEEDS ATTENTION</span>
            <h3>长期未更新目标</h3>
          </div>
          <span class="stale-count">{{ dashboard.staleGoals.length }} 个待关注</span>
        </header>

        <div v-if="dashboard.staleGoals.length" class="stale-list">
          <article v-for="goal in dashboard.staleGoals" :key="goal.goalId" class="stale-item">
            <div class="stale-main">
              <span class="category-dot" :data-category="goal.category" />
              <div>
                <strong>{{ goal.title || '未命名目标' }}</strong>
                <p>{{ goal.category }} · 最后活动 {{ formatDate(goal.lastActivityDate) || '暂无记录' }}</p>
              </div>
            </div>
            <span :class="['status-pill', statusClass(goal.status)]">{{ goal.statusName || statusName(goal.status) }}</span>
            <strong class="inactive-days">{{ goal.inactiveDays }}<small>天未更新</small></strong>
          </article>
        </div>
        <div v-else class="stale-empty">
          <span class="material-symbols-outlined">task_alt</span>
          <div><strong>节奏保持得很好</strong><p>没有超过 {{ filters.staleDays }} 天未更新的进行中目标。</p></div>
        </div>
      </section>

      <footer class="review-footer">
        <button type="button" :disabled="loading" @click="shiftPeriod(-1)">
          <span class="material-symbols-outlined">arrow_back</span> 上一{{ periodUnit }}
        </button>
        <span>{{ updatedAt ? `更新于 ${updatedAt}` : '等待统计' }}</span>
        <button type="button" :disabled="loading || nextPeriodDisabled" @click="shiftPeriod(1)">
          下一{{ periodUnit }} <span class="material-symbols-outlined">arrow_forward</span>
        </button>
      </footer>
    </template>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import * as echarts from 'echarts/core'
import { LineChart, PieChart } from 'echarts/charts'
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { GOAL_STATUS } from '../../../constants/goals.js'
import { queryGoalDashboard } from '../api/goals.js'

echarts.use([LineChart, PieChart, GridComponent, LegendComponent, TooltipComponent, CanvasRenderer])

const periodOptions = Object.freeze([{ value: 1, label: '周报' }, { value: 2, label: '月报' }])
const chartColors = Object.freeze(['#ff8a65', '#26a69a', '#5c6bc0', '#f6b44c', '#ab7ac6', '#42a5f5', '#7cb342'])
const today = formatLocalDate(new Date())
const filters = reactive({ periodType: 1, anchorDate: today, staleDays: 7 })
const loading = ref(false)
const errorMessage = ref('')
const updatedAt = ref('')
const trendChartEl = ref(null)
const categoryChartEl = ref(null)
const burndownChartEl = ref(null)
let trendChart
let categoryChart
let burndownChart
let resizeObserver
let themeObserver

const emptyDashboard = () => ({
  periodType: 1,
  periodName: '',
  startDate: '',
  endDate: '',
  dataThroughDate: '',
  summary: {
    dueGoalCount: 0,
    completedGoalCount: 0,
    overdueGoalCount: 0,
    completionRate: 0,
    overdueRate: 0,
    periodSpentHours: 0,
    currentStreakDays: 0,
    longestStreakDays: 0,
    completedEstimatedHours: 0,
    completedActualHours: 0,
    hourDeviation: 0,
    hourDeviationRate: 0,
  },
  timeTrend: [],
  categoryDistribution: [],
  burndown: [],
  staleGoals: [],
})

const dashboard = reactive(emptyDashboard())
const summary = computed(() => dashboard.summary)
const periodLabel = computed(() => filters.periodType === 2 ? '月报' : '周报')
const periodUnit = computed(() => filters.periodType === 2 ? '月' : '周')
const hasDashboardData = computed(() => Boolean(dashboard.startDate))
const nextPeriodDisabled = computed(() => dashboard.endDate ? dashboard.endDate >= today : filters.anchorDate >= today)
const comparisonMax = computed(() => Math.max(summary.value.completedEstimatedHours, summary.value.completedActualHours, 1))
const estimatedWidth = computed(() => Math.round(summary.value.completedEstimatedHours / comparisonMax.value * 100))
const actualWidth = computed(() => Math.round(summary.value.completedActualHours / comparisonMax.value * 100))
const deviationTone = computed(() => summary.value.hourDeviation > 0 ? 'negative' : summary.value.hourDeviation < 0 ? 'positive' : 'neutral')

function formatLocalDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function parseLocalDate(value) {
  const parts = String(value || '').split('-').map(Number)
  return parts.length === 3 && parts.every(Number.isFinite) ? new Date(parts[0], parts[1] - 1, parts[2]) : new Date()
}

function formatDate(value) {
  if (!value) return ''
  const date = parseLocalDate(value)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

function formatHours(value) {
  const number = Number(value)
  return Number.isFinite(number) ? String(Number(number.toFixed(2))) : '0'
}

function formatPercent(value) {
  const number = Number(value)
  return `${Number.isFinite(number) ? Number(number.toFixed(1)) : 0}%`
}

function signedHours(value) {
  const number = Number(value) || 0
  return `${number > 0 ? '+' : ''}${formatHours(number)}h`
}

function signedPercent(value) {
  const number = Number(value) || 0
  return `${number > 0 ? '+' : ''}${formatPercent(number)}`
}

function rateRingStyle(value, color) {
  const percentage = Math.min(Math.max(Number(value) || 0, 0), 100)
  return { background: `conic-gradient(${color} ${percentage}%, var(--review-track) ${percentage}% 100%)` }
}

function statusName(status) {
  return GOAL_STATUS[Number(status)]?.label ?? '未知状态'
}

function statusClass(status) {
  return GOAL_STATUS[Number(status)]?.type ?? 'not-started'
}

function changePeriod(periodType) {
  if (filters.periodType === periodType) return
  filters.periodType = periodType
  loadDashboard()
}

function shiftPeriod(direction) {
  const date = parseLocalDate(filters.anchorDate)
  if (filters.periodType === 2) date.setMonth(date.getMonth() + direction)
  else date.setDate(date.getDate() + direction * 7)
  const nextDate = formatLocalDate(date)
  filters.anchorDate = nextDate > today ? today : nextDate
  loadDashboard()
}

async function loadDashboard() {
  const staleDays = Number(filters.staleDays)
  if (!Number.isInteger(staleDays) || staleDays < 1 || staleDays > 3650) {
    errorMessage.value = '未更新阈值必须是 1 到 3650 之间的整数'
    return
  }
  if (filters.anchorDate > today) {
    filters.anchorDate = today
  }

  loading.value = true
  errorMessage.value = ''
  try {
    const result = await queryGoalDashboard(filters)
    Object.assign(dashboard, result)
    updatedAt.value = new Intl.DateTimeFormat('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date())
    await nextTick()
    renderCharts()
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '查询目标周期复盘失败'
  } finally {
    loading.value = false
  }
}

function chartTheme() {
  const styles = getComputedStyle(document.querySelector('.dashboard') || document.documentElement)
  return {
    text: styles.getPropertyValue('--dashboard-text').trim() || '#1c1b1b',
    muted: styles.getPropertyValue('--dashboard-text-muted').trim() || '#6f6967',
    border: styles.getPropertyValue('--dashboard-border-soft').trim() || 'rgba(196,199,199,.42)',
    surface: styles.getPropertyValue('--dashboard-surface').trim() || '#ffffff',
  }
}

function axisOptions(theme) {
  return {
    axisLine: { lineStyle: { color: theme.border } },
    axisTick: { show: false },
    axisLabel: { color: theme.muted, fontSize: 11 },
  }
}

function renderTrend(theme) {
  if (!trendChart) return
  const values = dashboard.timeTrend.map((item) => item.spentHours)
  trendChart.setOption({
    animationDuration: 500,
    tooltip: { trigger: 'axis', backgroundColor: theme.surface, borderColor: theme.border, textStyle: { color: theme.text }, formatter: (items) => `${items[0]?.axisValue || ''}<br/>投入 ${formatHours(items[0]?.value)} 小时` },
    grid: { left: 44, right: 18, top: 28, bottom: 32 },
    xAxis: { type: 'category', data: dashboard.timeTrend.map((item) => item.label), boundaryGap: false, ...axisOptions(theme) },
    yAxis: { type: 'value', minInterval: 1, name: '小时', nameTextStyle: { color: theme.muted, fontSize: 11 }, splitLine: { lineStyle: { type: 'dashed', color: theme.border } }, ...axisOptions(theme) },
    series: [{ type: 'line', data: values, smooth: true, symbol: 'circle', symbolSize: 8, lineStyle: { width: 3, color: '#ff8a65' }, itemStyle: { color: '#ff8a65', borderColor: theme.surface, borderWidth: 2 }, areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(255,138,101,.36)' }, { offset: 1, color: 'rgba(255,138,101,.02)' }]) } }],
  }, true)
}

function renderCategory(theme) {
  if (!categoryChart) return
  categoryChart.setOption({
    animationDuration: 500,
    tooltip: { trigger: 'item', backgroundColor: theme.surface, borderColor: theme.border, textStyle: { color: theme.text }, formatter: ({ name, value, percent }) => `${name}<br/>${formatHours(value)} 小时 · ${Number(percent).toFixed(1)}%` },
    series: [{
      type: 'pie', radius: ['58%', '82%'], center: ['50%', '50%'], minAngle: 3,
      itemStyle: { borderColor: theme.surface, borderWidth: 4, borderRadius: 6 },
      label: { show: false }, labelLine: { show: false },
      data: dashboard.categoryDistribution.map((item, index) => ({ value: item.spentHours, name: item.category, itemStyle: { color: chartColors[index % chartColors.length] } })),
    }],
  }, true)
}

function renderBurndown(theme) {
  if (!burndownChart) return
  burndownChart.setOption({
    animationDuration: 500,
    tooltip: { trigger: 'axis', backgroundColor: theme.surface, borderColor: theme.border, textStyle: { color: theme.text }, formatter: (items) => `${formatDate(items[0]?.axisValue)}<br/>${items.map((item) => `${item.marker}${item.seriesName}：${formatHours(item.value)}h`).join('<br/>')}` },
    grid: { left: 48, right: 20, top: 28, bottom: 32 },
    xAxis: { type: 'category', data: dashboard.burndown.map((item) => item.date), boundaryGap: false, axisLabel: { color: theme.muted, fontSize: 11, formatter: (value) => String(value).slice(5) }, axisLine: { lineStyle: { color: theme.border } }, axisTick: { show: false } },
    yAxis: { type: 'value', name: '剩余小时', nameTextStyle: { color: theme.muted, fontSize: 11 }, splitLine: { lineStyle: { type: 'dashed', color: theme.border } }, ...axisOptions(theme) },
    series: [
      { name: '实际剩余', type: 'line', data: dashboard.burndown.map((item) => item.actualRemainingHours), smooth: true, symbol: 'circle', symbolSize: 6, lineStyle: { width: 3, color: '#5c6bc0' }, itemStyle: { color: '#5c6bc0' } },
      { name: '理想剩余', type: 'line', data: dashboard.burndown.map((item) => item.idealRemainingHours), smooth: true, showSymbol: false, lineStyle: { width: 2, type: 'dashed', color: '#26a69a' }, itemStyle: { color: '#26a69a' } },
    ],
  }, true)
}

function renderCharts() {
  const theme = chartTheme()
  renderTrend(theme)
  renderCategory(theme)
  renderBurndown(theme)
}

watch(() => dashboard, () => nextTick(renderCharts), { deep: true })

onMounted(async () => {
  trendChart = echarts.init(trendChartEl.value)
  categoryChart = echarts.init(categoryChartEl.value)
  burndownChart = echarts.init(burndownChartEl.value)
  resizeObserver = new ResizeObserver(() => {
    trendChart?.resize()
    categoryChart?.resize()
    burndownChart?.resize()
  })
  ;[trendChartEl.value, categoryChartEl.value, burndownChartEl.value].forEach((element) => resizeObserver.observe(element))
  const dashboardRoot = document.querySelector('.dashboard')
  if (dashboardRoot) {
    themeObserver = new MutationObserver(() => window.setTimeout(renderCharts, 40))
    themeObserver.observe(dashboardRoot, { attributes: true, attributeFilter: ['data-theme'] })
  }
  await loadDashboard()
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  themeObserver?.disconnect()
  trendChart?.dispose()
  categoryChart?.dispose()
  burndownChart?.dispose()
})
</script>

<style scoped>
.goal-dashboard {
  --review-card: color-mix(in srgb, var(--dashboard-surface, #fff) 92%, transparent);
  --review-card-soft: color-mix(in srgb, var(--dashboard-surface-soft, #f7f3f2) 90%, transparent);
  --review-border: var(--dashboard-border-soft, rgba(196, 199, 199, 0.45));
  --review-text: var(--dashboard-text, #1c1b1b);
  --review-muted: var(--dashboard-text-muted, #696465);
  --review-track: var(--dashboard-surface-muted, #e9e5e4);
  display: grid;
  gap: 18px;
  color: var(--review-text);
}

.review-hero,
.review-controls,
.period-switch,
.summary-card,
.deviation-strip,
.deviation-copy,
.dashboard-card > header,
.stale-main,
.review-footer,
.state-panel,
.stale-empty {
  display: flex;
  align-items: center;
}

.review-hero {
  justify-content: space-between;
  gap: 22px;
  border: 1px solid var(--review-border);
  border-radius: 22px;
  padding: 22px 24px;
  background:
    radial-gradient(circle at 86% 20%, rgba(255, 138, 101, 0.15), transparent 32%),
    var(--review-card);
  box-shadow: var(--dashboard-shadow, 0 18px 40px rgba(28, 27, 27, 0.06));
}

.eyebrow {
  color: #b45c43;
  font-size: 10px;
  font-weight: 950;
  letter-spacing: 0.16em;
}

h2,
h3,
p {
  margin: 0;
}

h2 {
  margin-top: 5px;
  font-size: clamp(1.55rem, 2.4vw, 2.2rem);
  letter-spacing: -0.035em;
}

h3 {
  margin-top: 4px;
  font-size: 17px;
}

.period-copy {
  margin-top: 7px;
  color: var(--review-muted);
  font-size: 13px;
  font-weight: 700;
}

.period-copy span {
  color: #b45c43;
}

.review-controls {
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 10px;
}

.period-switch {
  gap: 3px;
  border: 1px solid var(--review-border);
  border-radius: 12px;
  padding: 3px;
  background: var(--review-card-soft);
}

button,
input {
  font: inherit;
}

button {
  border: 0;
  cursor: pointer;
}

.period-switch button {
  min-height: 34px;
  border-radius: 9px;
  padding: 0 13px;
  background: transparent;
  color: var(--review-muted);
  font-size: 12px;
  font-weight: 900;
}

.period-switch button.active {
  background: var(--dashboard-accent, #1c1b1b);
  color: var(--dashboard-accent-contrast, #fff);
  box-shadow: 0 4px 12px rgba(28, 27, 27, 0.15);
}

.control-field {
  display: grid;
  gap: 4px;
  color: var(--review-muted);
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 0.05em;
}

.control-field input {
  box-sizing: border-box;
  min-height: 38px;
  border: 1px solid var(--review-border);
  border-radius: 11px;
  padding: 0 10px;
  background: var(--dashboard-surface, #fff);
  color: var(--review-text);
  outline: none;
  font-size: 12px;
  font-weight: 800;
}

.number-input {
  position: relative;
}

.number-input input {
  width: 74px;
  padding-right: 27px;
}

.number-input b {
  position: absolute;
  top: 50%;
  right: 10px;
  color: var(--review-muted);
  font-size: 11px;
  transform: translateY(-50%);
}

.refresh-button {
  display: inline-flex;
  align-items: center;
  align-self: end;
  gap: 6px;
  min-height: 38px;
  border-radius: 11px;
  padding: 0 14px;
  background: #ff8a65;
  color: #fff;
  font-size: 12px;
  font-weight: 900;
}

.refresh-button:disabled,
.review-footer button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.spinning {
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.inline-error {
  display: flex;
  align-items: center;
  gap: 7px;
  border-radius: 12px;
  padding: 10px 14px;
  background: rgba(186, 26, 26, 0.09);
  color: #ba1a1a;
  font-size: 12px;
  font-weight: 800;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.summary-card,
.deviation-strip,
.dashboard-card,
.state-panel {
  border: 1px solid var(--review-border);
  background: var(--review-card);
  box-shadow: 0 12px 30px rgba(28, 27, 27, 0.045);
}

.summary-card {
  min-height: 106px;
  gap: 15px;
  border-radius: 18px;
  padding: 17px;
}

.metric-icon {
  display: grid;
  width: 46px;
  height: 46px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 15px;
  background: var(--review-card-soft);
}

.overdue-card .metric-icon { background: rgba(239, 83, 80, 0.12); color: #d84343; }
.hours-card .metric-icon { background: rgba(92, 107, 192, 0.12); color: #5c6bc0; }
.streak-card .metric-icon { background: rgba(255, 138, 101, 0.14); color: #ef6c48; }

.metric-label {
  display: block;
  margin-bottom: 6px;
  color: var(--review-muted);
  font-size: 11px;
  font-weight: 850;
}

.summary-card strong {
  display: block;
  font-size: 24px;
  line-height: 1.1;
}

.summary-card strong i {
  margin-left: 2px;
  font-size: 13px;
  font-style: normal;
}

.summary-card small {
  display: block;
  margin-top: 6px;
  color: var(--review-muted);
  font-size: 10px;
  font-weight: 700;
}

.rate-ring {
  position: relative;
  display: grid;
  width: 58px;
  height: 58px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 50%;
}

.rate-ring::after {
  position: absolute;
  inset: 7px;
  border-radius: inherit;
  background: var(--dashboard-surface, #fff);
  content: '';
}

.rate-ring span {
  z-index: 1;
  font-size: 12px;
  font-weight: 950;
}

.skeleton {
  opacity: 0.55;
  animation: pulse 1.2s ease-in-out infinite alternate;
}

@keyframes pulse { to { opacity: 0.8; } }

.deviation-strip {
  justify-content: space-between;
  gap: 30px;
  border-radius: 18px;
  padding: 17px 20px;
}

.deviation-copy {
  gap: 13px;
  min-width: 245px;
}

.deviation-copy strong {
  font-size: 20px;
}

.deviation-copy strong small {
  font-size: 12px;
}

.deviation-copy .positive { color: #16867a; }
.deviation-copy .negative { color: #d3504b; }
.deviation-copy .neutral { color: var(--review-text); }

.comparison-bar {
  display: grid;
  width: min(100%, 620px);
  gap: 10px;
}

.comparison-bar > div {
  display: grid;
  grid-template-columns: 34px 1fr 58px;
  align-items: center;
  gap: 10px;
  color: var(--review-muted);
  font-size: 11px;
  font-weight: 800;
}

.comparison-bar > div > i {
  height: 8px;
  overflow: hidden;
  border-radius: 999px;
  background: var(--review-track);
}

.comparison-bar b {
  display: block;
  height: 100%;
  border-radius: inherit;
}

.comparison-bar .estimated { background: #a9b1ba; }
.comparison-bar .actual { background: linear-gradient(90deg, #5c6bc0, #ff8a65); }
.comparison-bar strong { color: var(--review-text); text-align: right; }

.chart-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.65fr) minmax(300px, 0.85fr);
  gap: 14px;
}

.dashboard-card {
  position: relative;
  min-width: 0;
  overflow: hidden;
  border-radius: 20px;
  padding: 19px 20px;
}

.dashboard-card > header {
  justify-content: space-between;
  gap: 12px;
}

.trend-card > header > strong {
  color: #ef6c48;
  font-size: 19px;
}

.burndown-card {
  grid-column: 1 / -1;
}

.chart {
  width: 100%;
  height: 270px;
  margin-top: 5px;
}

.category-chart { height: 230px; }
.burndown-chart { height: 290px; }

.chart-empty {
  position: absolute;
  inset: 72px 20px 18px;
  z-index: 2;
  display: grid;
  place-content: center;
  justify-items: center;
  gap: 6px;
  border-radius: 14px;
  background: var(--review-card);
  color: var(--review-muted);
  text-align: center;
}

.chart-empty .material-symbols-outlined {
  font-size: 30px;
  opacity: 0.6;
}

.chart-empty p { font-size: 12px; font-weight: 800; }

.category-legend {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 6px 12px;
  margin-top: -6px;
  color: var(--review-muted);
  font-size: 10px;
  font-weight: 800;
}

.category-legend span { display: inline-flex; align-items: center; gap: 5px; }
.category-legend i { width: 7px; height: 7px; border-radius: 50%; }
.category-legend b { color: var(--review-text); }

.line-legend {
  display: flex;
  gap: 15px;
  color: var(--review-muted);
  font-size: 10px;
  font-weight: 800;
}

.line-legend span::before {
  display: inline-block;
  width: 18px;
  margin-right: 6px;
  border-top: 2px solid;
  content: '';
  vertical-align: middle;
}

.line-legend .actual-line::before { border-color: #5c6bc0; }
.line-legend .ideal-line::before { border-color: #26a69a; border-top-style: dashed; }

.stale-card > header { margin-bottom: 14px; }
.stale-count { border-radius: 999px; padding: 6px 10px; background: rgba(255, 138, 101, 0.12); color: #c85f40; font-size: 10px; font-weight: 900; }
.stale-list { display: grid; gap: 8px; }

.stale-item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto 110px;
  align-items: center;
  gap: 14px;
  border: 1px solid var(--review-border);
  border-radius: 14px;
  padding: 12px 14px;
  background: var(--review-card-soft);
}

.stale-main { min-width: 0; gap: 11px; }
.stale-main > div { min-width: 0; }
.stale-main strong { display: block; overflow: hidden; font-size: 13px; text-overflow: ellipsis; white-space: nowrap; }
.stale-main p { margin-top: 4px; color: var(--review-muted); font-size: 10px; font-weight: 700; }
.category-dot { width: 9px; height: 9px; flex: 0 0 auto; border-radius: 50%; background: #ff8a65; box-shadow: 0 0 0 5px rgba(255, 138, 101, 0.12); }
.category-dot[data-category="技术"] { background: #5c6bc0; box-shadow: 0 0 0 5px rgba(92, 107, 192, 0.12); }
.category-dot[data-category="健康"] { background: #26a69a; box-shadow: 0 0 0 5px rgba(38, 166, 154, 0.12); }
.category-dot[data-category="生活"] { background: #f6b44c; box-shadow: 0 0 0 5px rgba(246, 180, 76, 0.14); }

.status-pill { border-radius: 999px; padding: 5px 9px; background: var(--review-track); color: var(--review-muted); font-size: 10px; font-weight: 900; }
.status-pill.in-progress { background: rgba(38, 166, 154, 0.12); color: #16867a; }
.status-pill.paused { background: rgba(246, 180, 76, 0.16); color: #9a6900; }
.inactive-days { color: #d3504b; font-size: 18px; text-align: right; }
.inactive-days small { display: block; color: var(--review-muted); font-size: 9px; }

.stale-empty {
  justify-content: center;
  gap: 12px;
  min-height: 92px;
  border: 1px dashed var(--review-border);
  border-radius: 14px;
  color: var(--review-muted);
}

.stale-empty .material-symbols-outlined { color: #26a69a; font-size: 30px; }
.stale-empty strong { color: var(--review-text); font-size: 13px; }
.stale-empty p { margin-top: 3px; font-size: 11px; }

.review-footer {
  justify-content: space-between;
  padding: 2px 4px 12px;
  color: var(--review-muted);
  font-size: 10px;
  font-weight: 700;
}

.review-footer button {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  border: 1px solid var(--review-border);
  border-radius: 10px;
  padding: 8px 11px;
  background: var(--review-card);
  color: var(--review-text);
  font-size: 11px;
  font-weight: 850;
}

.review-footer .material-symbols-outlined { font-size: 15px; }

.state-panel {
  justify-content: center;
  gap: 16px;
  min-height: 240px;
  border-radius: 20px;
  padding: 28px;
}

.state-panel > .material-symbols-outlined { color: #d3504b; font-size: 38px; }
.state-panel strong { font-size: 16px; }
.state-panel p { margin-top: 5px; color: var(--review-muted); font-size: 12px; }
.state-panel button { border-radius: 10px; padding: 9px 13px; background: var(--dashboard-accent, #1c1b1b); color: var(--dashboard-accent-contrast, #fff); font-weight: 850; }

@media (max-width: 1180px) {
  .review-hero { align-items: flex-start; flex-direction: column; }
  .review-controls { justify-content: flex-start; width: 100%; }
  .summary-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 780px) {
  .review-hero { padding: 18px; }
  .review-controls { align-items: stretch; }
  .control-field { flex: 1; }
  .control-field input, .number-input input { width: 100%; }
  .chart-grid { grid-template-columns: 1fr; }
  .burndown-card { grid-column: auto; }
  .deviation-strip { align-items: flex-start; flex-direction: column; }
  .comparison-bar { width: 100%; }
}

@media (max-width: 560px) {
  .summary-grid { grid-template-columns: 1fr; }
  .period-switch { width: 100%; }
  .period-switch button { flex: 1; }
  .stale-item { grid-template-columns: minmax(0, 1fr) auto; }
  .inactive-days { grid-column: 1 / -1; text-align: left; }
  .inactive-days small { display: inline; margin-left: 3px; }
  .line-legend { display: none; }
  .review-footer > span { display: none; }
}
</style>
