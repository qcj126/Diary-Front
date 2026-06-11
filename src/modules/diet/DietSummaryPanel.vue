<template>
  <div class="summary-stack">
    <section class="summary-card spotlight-card">
      <p class="panel-kicker">Nutrition</p>
      <h3 class="panel-title">今日营养总览</h3>

      <div class="ring-block">
        <div class="ring-chart">
          <svg viewBox="0 0 220 220" class="donut-chart">
            <circle cx="110" cy="110" r="78" fill="transparent" stroke="#eadfdc" stroke-width="18" />
            <circle
              v-if="proteinRatio > 0"
              cx="110"
              cy="110"
              r="78"
              fill="transparent"
              :stroke="colors.protein"
              :stroke-dasharray="proteinArc + ' ' + emptyArc(proteinArc)"
              stroke-dashoffset="0"
              stroke-width="18"
              class="chart-segment"
            />
            <circle
              v-if="carbsRatio > 0"
              cx="110"
              cy="110"
              r="78"
              fill="transparent"
              :stroke="colors.carbs"
              :stroke-dasharray="carbsArc + ' ' + emptyArc(carbsArc)"
              :stroke-dashoffset="-(proteinArc)"
              stroke-width="18"
              class="chart-segment"
            />
            <circle
              v-if="fatRatio > 0"
              cx="110"
              cy="110"
              r="78"
              fill="transparent"
              :stroke="colors.fat"
              :stroke-dasharray="fatArc + ' ' + emptyArc(fatArc)"
              :stroke-dashoffset="-(proteinArc + carbsArc)"
              stroke-width="18"
              class="chart-segment"
            />
          </svg>

          <div class="chart-center">
            <span class="center-label">今日热量</span>
            <strong>{{ total.kcal }}</strong>
            <span class="center-unit">kcal</span>
          </div>
        </div>

        <div class="macro-list">
          <div class="macro-row">
            <span class="macro-label"><i :style="{ background: colors.protein }" />蛋白质</span>
            <strong>{{ total.protein }}g · {{ proteinRatio }}%</strong>
          </div>
          <div class="macro-row">
            <span class="macro-label"><i :style="{ background: colors.carbs }" />碳水</span>
            <strong>{{ total.carbs }}g · {{ carbsRatio }}%</strong>
          </div>
          <div class="macro-row">
            <span class="macro-label"><i :style="{ background: colors.fat }" />脂肪</span>
            <strong>{{ total.fat }}g · {{ fatRatio }}%</strong>
          </div>
        </div>
      </div>
    </section>

    <section class="summary-card">
      <p class="panel-kicker">Goals</p>
      <h3 class="panel-title">目标完成进度</h3>

      <div class="goal-list">
        <div v-for="goal in goals" :key="goal.key" class="goal-row">
          <div class="goal-head">
            <span>{{ goal.label }}</span>
            <strong>{{ goal.current }} / {{ goal.target }}{{ goal.unit }}</strong>
          </div>
          <div class="goal-track">
            <div class="goal-fill" :style="{ width: goal.progress + '%', background: goal.color }" />
          </div>
        </div>
      </div>
    </section>

    <section class="summary-card insight-card">
      <p class="panel-kicker">Insight</p>
      <h3 class="panel-title">今日状态小结</h3>

      <div class="insight-grid">
        <div class="insight-item">
          <span>热量区间</span>
          <strong>{{ total.kcal > 1600 ? '接近目标' : '略低一些' }}</strong>
        </div>
        <div class="insight-item">
          <span>蛋白表现</span>
          <strong>{{ total.protein >= 90 ? '很稳定' : '还能再补' }}</strong>
        </div>
        <div class="insight-item">
          <span>饮食节奏</span>
          <strong>{{ meals.length >= 4 ? '分配均衡' : '可增加加餐' }}</strong>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  meals: {
    type: Array,
    required: true,
  },
})

const colors = {
  protein: '#7a8d6e',
  carbs: '#d36b4b',
  fat: '#c8953d',
  kcal: '#9a4024',
}

const total = computed(() =>
  props.meals.reduce(
    (acc, meal) => ({
      kcal: acc.kcal + (meal.kcal || 0),
      protein: acc.protein + (meal.protein || 0),
      carbs: acc.carbs + (meal.carbs || 0),
      fat: acc.fat + (meal.fat || 0),
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 },
  ),
)

const sum = computed(() => total.value.protein + total.value.carbs + total.value.fat)
const proteinRatio = computed(() => (sum.value ? Math.round((total.value.protein / sum.value) * 100) : 0))
const carbsRatio = computed(() => (sum.value ? Math.round((total.value.carbs / sum.value) * 100) : 0))
const fatRatio = computed(() => (sum.value ? Math.max(0, 100 - proteinRatio.value - carbsRatio.value) : 0))

const proteinArc = computed(() => proteinRatio.value)
const carbsArc = computed(() => carbsRatio.value)
const fatArc = computed(() => fatRatio.value)

const goals = computed(() => [
  createGoal('kcal', '热量', total.value.kcal, 2000, ' kcal', colors.kcal),
  createGoal('protein', '蛋白质', total.value.protein, 120, 'g', colors.protein),
  createGoal('carbs', '碳水', total.value.carbs, 220, 'g', colors.carbs),
  createGoal('fat', '脂肪', total.value.fat, 65, 'g', colors.fat),
])

function createGoal(key, label, current, target, unit, color) {
  return {
    key,
    label,
    current,
    target,
    unit,
    color,
    progress: Math.min(100, Math.round((current / target) * 100)),
  }
}

function emptyArc(value) {
  return Math.max(0, 100 - value)
}
</script>

<style scoped>
.summary-stack {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.summary-card {
  padding: clamp(18px, 2vw, 24px);
  border-radius: 24px;
  background: rgba(249, 242, 240, 0.9);
  border: 1px solid #dcc1b9;
  box-shadow: 0 16px 34px rgba(50, 47, 46, 0.06);
}

.spotlight-card {
  background:
    radial-gradient(circle at top, rgba(255, 219, 209, 0.65), transparent 36%),
    rgba(249, 242, 240, 0.96);
}

.panel-kicker {
  margin: 0 0 8px;
  font-size: 12px;
  line-height: 16px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #7e2c11;
  font-weight: 700;
}

.panel-title {
  margin: 0 0 20px;
  font-family: 'Playfair Display', 'Times New Roman', serif;
  font-size: clamp(22px, 2vw, 28px);
  line-height: 1.15;
  color: #1d1b1a;
}

.ring-block {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.ring-chart {
  position: relative;
  width: min(220px, 100%);
  margin: 0 auto;
}

.donut-chart {
  width: min(220px, 100%);
  height: auto;
  transform: rotate(-90deg);
}

.chart-segment {
  transition: stroke-dasharray 0.3s ease;
}

.chart-center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.center-label,
.center-unit {
  color: #89726c;
  font-size: 13px;
}

.chart-center strong {
  font-family: 'Playfair Display', 'Times New Roman', serif;
  font-size: 42px;
  line-height: 1;
  color: #9a4024;
}

.macro-list,
.goal-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.macro-row,
.goal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.macro-row strong,
.goal-head strong,
.insight-item strong {
  color: #1d1b1a;
}

.macro-label {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: #56423d;
}

.macro-label i {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  display: inline-block;
}

.goal-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.goal-head span {
  color: #56423d;
}

.goal-track {
  width: 100%;
  height: 10px;
  border-radius: 999px;
  background: #eadfdc;
  overflow: hidden;
}

.goal-fill {
  height: 100%;
  border-radius: inherit;
}

.insight-card {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.75), rgba(249, 242, 240, 0.98)),
    #f9f2f0;
}

.insight-grid {
  display: grid;
  gap: 12px;
}

.insight-item {
  padding: 16px 18px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(220, 193, 185, 0.85);
}

.insight-item span {
  display: block;
  margin-bottom: 6px;
  color: #89726c;
  font-size: 13px;
}

@media (max-width: 900px) {
  .summary-card {
    padding: 20px;
    border-radius: 24px;
  }

  .ring-chart,
  .donut-chart {
    width: min(200px, 100%);
  }
}
</style>
