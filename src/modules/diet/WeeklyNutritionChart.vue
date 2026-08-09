<template>
  <section class="summary-card trend-card">
    <div class="panel-head compact">
      <h3 class="panel-title">营养趋势</h3>
    </div>

    <div class="nutrition-trend-grid">
      <article v-for="chart in nutritionCharts" :key="chart.key" class="nutrition-chart">
        <div class="chart-head">
          <span class="chart-dot" :style="{ background: chart.color }" />
          <h4>{{ chart.label }}（{{ chart.unit }}）</h4>
        </div>

        <svg class="bar-chart" viewBox="0 0 220 136" role="img" :aria-label="`${chart.label}一周柱状图`">
          <g class="chart-grid">
            <line
              v-for="tick in chart.ticks"
              :key="tick"
              x1="28"
              x2="212"
              :y1="chartY(chart, tick)"
              :y2="chartY(chart, tick)"
            />
          </g>
          <g class="chart-axis">
            <line x1="28" x2="212" y1="116" y2="116" />
            <line x1="28" x2="28" y1="4" y2="116" />
            <text v-for="tick in chart.ticks" :key="tick" class="y-label" x="23" :y="chartY(chart, tick) + 3">
              {{ tick }}
            </text>
          </g>
          <g class="chart-bars">
            <rect
              v-for="bar in chart.bars"
              :key="bar.label"
              :x="bar.x"
              :y="bar.y"
              width="9"
              :height="bar.height"
              :fill="chart.color"
            />
          </g>
          <g class="x-labels">
            <text v-for="bar in chart.bars" :key="bar.label" :x="bar.x + 4.5" y="131">{{ bar.label }}</text>
          </g>
        </svg>
      </article>
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

const weekdays = ['周一', '周二', '周三', '周四', '周五', '周六', '今日']
const gramTicks = [0, 30, 60, 90, 120, 150, 180, 210]
const largeUnitTicks = [500, 1000, 1500, 2000, 2500, 3000, 3500, 4000]
const seriesMeta = [
  { key: 'protein', label: '蛋白质', unit: 'g', maxValue: 210, ticks: gramTicks },
  { key: 'carbs', label: '碳水', unit: 'g', maxValue: 210, ticks: gramTicks },
  { key: 'fat', label: '脂肪', unit: 'g', maxValue: 210, ticks: gramTicks },
  { key: 'sugar', label: '糖', unit: 'g', maxValue: 210, ticks: gramTicks },
  { key: 'sodium', label: '钠', unit: 'mg', maxValue: 4000, ticks: largeUnitTicks },
  { key: 'kcal', label: '热量', unit: 'kcal', maxValue: 4000, ticks: largeUnitTicks },
]

const weekData = computed(() => {
  const factors = [0.78, 0.9, 0.84, 1.05, 0.96, 1.12, 1]
  return factors.map((factor, index) => ({
    label: weekdays[index],
    kcal: Math.round(props.total.kcal * factor),
    protein: Math.round(props.total.protein * (factor + (index % 2 ? 0.04 : -0.02))),
    carbs: Math.round(props.total.carbs * (factor + (index % 3 === 0 ? 0.05 : -0.03))),
    fat: Math.round(props.total.fat * (factor + (index % 2 ? -0.03 : 0.03))),
    sugar: Math.round(props.total.sugar * (factor + (index % 3 === 2 ? 0.07 : -0.02))),
    sodium: Math.round(props.total.sodium * (factor + (index % 3 === 1 ? 0.06 : -0.01))),
  }))
})

const nutritionCharts = computed(() =>
  seriesMeta.map((series) => ({
    ...series,
    color: props.colors[series.key],
    bars: weekData.value.map((day, index) => {
      const height = Math.round((Math.min(day[series.key], series.maxValue) / series.maxValue) * 112)
      return {
        label: day.label.replace('周', ''),
        x: 42 + index * 25,
        y: 116 - height,
        height: Math.max(3, height),
      }
    }),
  })),
)

function chartY(chart, tick) {
  return 116 - (tick / chart.maxValue) * 112
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
  min-height: 0;
  background: rgba(255, 255, 255, 0.82);
  overflow: hidden;
}

.panel-title {
  margin: 0;
  font-size: 18px;
  line-height: 1.15;
  color: #1d1b1a;
}

.panel-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.nutrition-trend-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-template-rows: repeat(3, minmax(0, 1fr));
  gap: 8px;
  height: calc(100% - 29px);
  min-height: 0;
}

.nutrition-chart {
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 6px 6px 1px;
  border-radius: 12px;
  background: rgba(249, 242, 240, 0.74);
  border: 1px solid rgba(220, 193, 185, 0.7);
}

.chart-head {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.chart-dot {
  flex: 0 0 8px;
  width: 8px;
  height: 8px;
  border-radius: 999px;
}

.chart-head h4 {
  margin: 0;
  color: #1d1b1a;
  font-size: 12px;
  line-height: 16px;
  white-space: nowrap;
}

.bar-chart {
  display: block;
  width: 100%;
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
}

.chart-grid line {
  stroke: rgba(220, 193, 185, 0.62);
  stroke-width: 1;
}

.chart-axis line {
  stroke: rgba(126, 44, 17, 0.36);
  stroke-width: 1.2;
}

.chart-axis text,
.x-labels text {
  fill: #89726c;
  font-size: 8px;
  font-weight: 700;
}

.y-label {
  text-anchor: end;
}

.x-labels text {
  text-anchor: middle;
}

.chart-bars rect {
  opacity: 0.92;
}
</style>
