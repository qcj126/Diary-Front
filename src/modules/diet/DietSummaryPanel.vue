<template>
  <div class="summary-stack">
    <section class="summary-card spotlight-card">
      <div class="panel-head">
        <div>
          <p class="panel-kicker">Nutrition</p>
          <h3 class="panel-title">营养总览</h3>
        </div>
        <label class="date-picker-button" title="选择日期" aria-label="选择日期">
          <span class="material-symbols-outlined">calendar_month</span>
          <span>{{ selectedDate }}</span>
          <input v-model="selectedDate" type="date" />
        </label>
      </div>

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
            <span class="center-label">热量</span>
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
          <div class="macro-row">
            <span class="macro-label"><i :style="{ background: colors.sodium }" />钠</span>
            <strong>{{ total.sodium }}mg</strong>
          </div>
        </div>
      </div>
    </section>

    <WeeklyNutritionChart :total="total" :colors="colors" :targets="nutritionTargets" />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import WeeklyNutritionChart from './WeeklyNutritionChart.vue'

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
  sodium: '#4d938a',
  kcal: '#9a4024',
}

const selectedDate = ref('2026-08-07')

const total = computed(() =>
  props.meals.reduce(
    (acc, meal) => ({
      kcal: acc.kcal + (meal.kcal || 0),
      protein: acc.protein + (meal.protein || 0),
      carbs: acc.carbs + (meal.carbs || 0),
      fat: acc.fat + (meal.fat || 0),
      sodium: acc.sodium + (meal.sodium || 0),
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0, sodium: 0 },
  ),
)

const sum = computed(() => total.value.protein + total.value.carbs + total.value.fat)
const proteinRatio = computed(() => (sum.value ? Math.round((total.value.protein / sum.value) * 100) : 0))
const carbsRatio = computed(() => (sum.value ? Math.round((total.value.carbs / sum.value) * 100) : 0))
const fatRatio = computed(() => (sum.value ? Math.max(0, 100 - proteinRatio.value - carbsRatio.value) : 0))

const proteinArc = computed(() => proteinRatio.value)
const carbsArc = computed(() => carbsRatio.value)
const fatArc = computed(() => fatRatio.value)

const nutritionTargets = {
  kcal: 2000,
  protein: 120,
  carbs: 220,
  fat: 65,
  sodium: 2000,
}

function emptyArc(value) {
  return Math.max(0, 100 - value)
}

</script>

<style scoped>
.summary-stack {
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 100%;
  overflow: hidden;
}

.summary-card {
  padding: 10px;
  border-radius: 14px;
  background: rgba(249, 242, 240, 0.9);
  border: 1px solid #dcc1b9;
  box-shadow: 0 16px 34px rgba(50, 47, 46, 0.06);
}

.material-symbols-outlined {
  font-family: 'Material Symbols Outlined';
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  font-size: 18px;
  line-height: 1;
}

.spotlight-card {
  background:
    radial-gradient(circle at top, rgba(255, 219, 209, 0.65), transparent 36%),
    rgba(249, 242, 240, 0.96);
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
  margin-bottom: 8px;
}

.date-picker-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 34px;
  border-radius: 10px;
  padding: 0 10px;
  background: #ffffff;
  border: 1px solid rgba(220, 193, 185, 0.9);
  color: #444748;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  white-space: nowrap;
}

.date-picker-button input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

.ring-block {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
}

.ring-chart {
  position: relative;
  flex: 0 0 112px;
  width: 112px;
  margin: 0 auto;
}

.donut-chart {
  width: 112px;
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
  font-size: 11px;
}

.chart-center strong {
  font-size: 22px;
  line-height: 1;
  color: #9a4024;
}

.macro-list {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.macro-list {
  flex: 1;
  min-width: 0;
}

.macro-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.macro-row strong {
  color: #1d1b1a;
  font-size: 12px;
}

.macro-label {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: #56423d;
  font-size: 12px;
}

.macro-label i {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  display: inline-block;
}

@media (max-width: 900px) {
  .summary-card {
    padding: 10px;
    border-radius: 14px;
  }

  .ring-block {
    flex-direction: column;
  }

  .ring-chart,
  .donut-chart {
    width: min(112px, 100%);
  }
}
</style>
