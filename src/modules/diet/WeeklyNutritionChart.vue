<template>
  <section class="summary-card trend-card">
    <div class="panel-head compact">
      <div>
        <p class="panel-kicker">Week</p>
        <h3 class="panel-title">一周营养趋势</h3>
      </div>
    </div>

    <div class="line-chart-wrap">
      <svg class="line-chart" viewBox="0 0 360 170" role="img" aria-label="一周营养摄入折线图">
        <g class="chart-grid">
          <line v-for="tick in xTicks" :key="tick" :x1="chartX(tick)" :x2="chartX(tick)" y1="18" y2="132" />
        </g>
        <g class="chart-axis">
          <line x1="52" x2="340" y1="132" y2="132" />
          <line x1="52" x2="52" y1="18" y2="132" />
          <text class="axis-title x-axis-title" x="340" y="164">营养量</text>
          <text class="axis-title y-axis-title" x="18" y="16">周几</text>
          <text v-for="tick in xTicks" :key="tick" class="x-label" :x="chartX(tick)" y="151">{{ tickLabel(tick) }}</text>
          <text v-for="day in weekDays" :key="day.label" class="y-label" x="42" :y="day.y + 4">{{ day.label }}</text>
        </g>
        <g class="chart-lines">
          <polyline
            v-for="series in weeklySeries"
            :key="series.key"
            :points="series.points"
            :stroke="series.color"
          />
        </g>
        <g class="chart-points">
          <template v-for="series in weeklySeries" :key="series.key">
            <circle
              v-for="point in series.pointList"
                :key="`${series.key}-${point.index}`"
              :cx="point.x"
              :cy="point.y"
              r="2.6"
              :fill="series.color"
            />
          </template>
        </g>
      </svg>
    </div>

    <div class="trend-legend">
      <span v-for="series in weeklySeries" :key="series.key">
        <i :style="{ background: series.color }" />
        {{ series.label }}
      </span>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  total: {
    type: Object,
    required: true,
  },
  colors: {
    type: Object,
    required: true,
  },
  targets: {
    type: Object,
    required: true,
  },
})

const xTicks = [0, 0.5, 1]

const weekData = computed(() => {
  const factors = [0.78, 0.9, 0.84, 1.05, 0.96, 1.12, 1]
  return factors.map((factor, index) => ({
    label: ['周一', '周二', '周三', '周四', '周五', '周六', '今日'][index],
    kcal: Math.round(props.total.kcal * factor),
    protein: Math.round(props.total.protein * (factor + (index % 2 ? 0.04 : -0.02))),
    carbs: Math.round(props.total.carbs * (factor + (index % 3 === 0 ? 0.05 : -0.03))),
    fat: Math.round(props.total.fat * (factor + (index % 2 ? -0.03 : 0.03))),
    sodium: Math.round(props.total.sodium * (factor + (index % 3 === 1 ? 0.06 : -0.01))),
  }))
})

const weekDays = computed(() => weekData.value.map((day, index) => ({ label: day.label, y: chartY(index) })))
const weeklySeries = computed(() =>
  [
    { key: 'kcal', label: '热量', color: props.colors.kcal },
    { key: 'protein', label: '蛋白质', color: props.colors.protein },
    { key: 'carbs', label: '碳水', color: props.colors.carbs },
    { key: 'fat', label: '脂肪', color: props.colors.fat },
    { key: 'sodium', label: '钠', color: props.colors.sodium },
  ].map((series) => {
    const pointList = weekData.value.map((day, index) => {
      const ratio = props.targets[series.key] ? day[series.key] / props.targets[series.key] : 0
      return {
        index,
        x: chartX(ratio),
        y: chartY(index),
      }
    })
    return {
      ...series,
      pointList,
      points: pointList.map((point) => `${point.x},${point.y}`).join(' '),
    }
  }),
)

function chartX(ratio) {
  const clamped = Math.max(0, Math.min(1.35, ratio))
  return Math.round(52 + (clamped / 1.35) * 288)
}

function chartY(index) {
  return 22 + index * (110 / 6)
}

function tickLabel(tick) {
  return `${Math.round(tick * 100)}%`
}
</script>

<style scoped>
.summary-card {
  padding: 10px;
  border-radius: 14px;
  background: rgba(249, 242, 240, 0.9);
  border: 1px solid #dcc1b9;
  box-shadow: 0 16px 34px rgba(50, 47, 46, 0.06);
}

.trend-card {
  background: rgba(255, 255, 255, 0.82);
}

.panel-kicker {
  margin: 0 0 4px;
  font-size: 12px;
  line-height: 16px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #7e2c11;
  font-weight: 700;
}

.panel-title {
  margin: 0;
  font-size: clamp(18px, 1.5vw, 22px);
  line-height: 1.15;
  color: #1d1b1a;
}

.panel-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 6px;
}

.line-chart-wrap {
  height: 170px;
}

.line-chart {
  display: block;
  width: 100%;
  height: 100%;
}

.chart-grid line {
  stroke: rgba(220, 193, 185, 0.62);
  stroke-width: 1;
}

.chart-lines polyline {
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2.4;
}

.chart-axis text {
  fill: #89726c;
  font-size: 11px;
  font-weight: 700;
}

.axis-title {
  fill: #7e2c11;
  font-size: 11px;
  font-weight: 900;
}

.x-axis-title {
  text-anchor: end;
}

.y-axis-title {
  text-anchor: middle;
}

.x-label {
  text-anchor: middle;
}

.y-label {
  text-anchor: end;
}

.chart-axis line {
  stroke: rgba(126, 44, 17, 0.36);
  stroke-width: 1.2;
}

.trend-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 10px;
  margin-top: 6px;
}

.trend-legend span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: #56423d;
  font-size: 12px;
  font-weight: 800;
}

.trend-legend i {
  width: 8px;
  height: 8px;
  border-radius: 999px;
}
</style>
