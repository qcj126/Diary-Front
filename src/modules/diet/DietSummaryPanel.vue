<template>
  <div class="summary-stack">
    <section class="summary-card spotlight-card">
      <div class="panel-head">
        <h3 class="panel-title">营养摄入</h3>
        <label class="date-picker-button" title="选择日期" aria-label="选择日期">
          <span class="material-symbols-outlined">calendar_month</span>
          <span>{{ selectedDate }}</span>
          <input v-model="selectedDate" type="date" />
        </label>
      </div>

      <div class="nutrition-overview">
        <div v-for="item in overviewItems" :key="item.key" class="overview-item">
          <span class="overview-name">
            <i :style="{ background: item.color }" />
            {{ item.label }}
          </span>
          <strong>{{ item.value }}{{ item.unit }}</strong>
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
  sugar: '#c45a84',
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
      sugar: acc.sugar + (meal.sugar || 0),
      sodium: acc.sodium + (meal.sodium || 0),
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0, sugar: 0, sodium: 0 },
  ),
)

const overviewItems = computed(() => [
  { key: 'protein', label: '蛋白质', value: total.value.protein, unit: 'g', color: colors.protein },
  { key: 'carbs', label: '碳水', value: total.value.carbs, unit: 'g', color: colors.carbs },
  { key: 'fat', label: '脂肪', value: total.value.fat, unit: 'g', color: colors.fat },
  { key: 'sugar', label: '糖', value: total.value.sugar, unit: 'g', color: colors.sugar },
  { key: 'sodium', label: '钠', value: total.value.sodium, unit: 'mg', color: colors.sodium },
  { key: 'kcal', label: '热量', value: total.value.kcal, unit: 'kcal', color: colors.kcal },
])

const nutritionTargets = {
  kcal: 2000,
  protein: 120,
  carbs: 220,
  fat: 65,
  sugar: 50,
  sodium: 2000,
}
</script>

<style scoped>
.summary-stack {
  display: grid;
  grid-template-rows: 104px minmax(0, 1fr);
  gap: 8px;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.summary-card {
  box-sizing: border-box;
  padding: 9px 10px;
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
  overflow: hidden;
  background:
    radial-gradient(circle at top, rgba(255, 219, 209, 0.65), transparent 36%),
    rgba(249, 242, 240, 0.96);
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
  gap: 10px;
  margin-bottom: 7px;
}

.date-picker-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 32px;
  border-radius: 10px;
  padding: 0 9px;
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

.nutrition-overview {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 4px;
  min-width: 0;
}

.overview-item {
  box-sizing: border-box;
  min-width: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 6px 4px;
  border-radius: 9px;
  background: rgba(255, 255, 255, 0.62);
  border: 1px solid rgba(220, 193, 185, 0.58);
}

.overview-name {
  min-width: 0;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  color: #56423d;
  font-size: 10px;
  line-height: 13px;
  font-weight: 800;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.overview-name i {
  flex: 0 0 6px;
  width: 6px;
  height: 6px;
  border-radius: 999px;
}

.overview-item strong {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #1d1b1a;
  font-size: 13px;
  line-height: 16px;
  font-weight: 900;
  white-space: nowrap;
}

@media (max-width: 900px) {
  .summary-card {
    padding: 10px;
    border-radius: 14px;
  }

  .summary-stack {
    grid-template-rows: auto auto;
    overflow: visible;
  }

  .nutrition-overview {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
