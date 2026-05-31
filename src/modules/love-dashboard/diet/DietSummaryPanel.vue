<template>
  <div class="summary-panel horizontal-layout">
    <section class="summary-block summary-intake">
      <h3>今日摄入汇总</h3>
      <div class="intake-chart">
        <svg viewBox="0 0 36 36" class="donut intake-donut">
          <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#E2E8F0" stroke-width="5" />
          <circle 
            v-if="kcalRatio > 0"
            cx="18" cy="18" r="15.915" 
            fill="transparent" 
            :stroke="colors.kcal" 
            :stroke-dasharray="kcalRatio + ' ' + (100-kcalRatio)" 
            stroke-dashoffset="0" 
            stroke-width="5" 
          />
        </svg>
        <div class="intake-legend">
          <div><span class="dot" :style="{background: colors.kcal}"></span>卡路里 {{ total.kcal }} kcal</div>
          <div><span class="dot" :style="{background: colors.protein}"></span>蛋白质 {{ total.protein }}g</div>
          <div><span class="dot" :style="{background: colors.carbs}"></span>碳水 {{ total.carbs }}g</div>
          <div><span class="dot" :style="{background: colors.fat}"></span>脂肪 {{ total.fat }}g</div>
        </div>
      </div>
    </section>
    <section class="summary-block summary-ratio">
      <h3>三大营养素比例</h3>
      <div class="ratio-chart">
        <svg viewBox="0 0 36 36" class="donut ratio-donut">
          <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#E2E8F0" stroke-width="5" />
          <circle cx="18" cy="18" r="15.915" fill="transparent" :stroke="colors.protein" :stroke-dasharray="proteinRatio + ' ' + (100-proteinRatio)" stroke-dashoffset="0" stroke-width="5" />
          <circle cx="18" cy="18" r="15.915" fill="transparent" :stroke="colors.carbs" :stroke-dasharray="carbsRatio + ' ' + (100-carbsRatio)" :stroke-dashoffset="-proteinRatio" stroke-width="5" />
          <circle cx="18" cy="18" r="15.915" fill="transparent" :stroke="colors.fat" :stroke-dasharray="fatRatio + ' ' + (100-fatRatio)" :stroke-dashoffset="-(proteinRatio+carbsRatio)" stroke-width="5" />
        </svg>
        <div class="ratio-legend">
          <div><span class="dot" :style="{background: colors.protein}"></span>蛋白质 {{ proteinRatio }}%</div>
          <div><span class="dot" :style="{background: colors.carbs}"></span>碳水 {{ carbsRatio }}%</div>
          <div><span class="dot" :style="{background: colors.fat}"></span>脂肪 {{ fatRatio }}%</div>
        </div>
      </div>
    </section>
  </div>
  <section class="summary-block summary-goal">
    <h3>今日目标</h3>
    <div class="goal-list">
      <div class="goal-row">
        <div class="goal-info">
          <span>卡路里</span>
          <span>{{ total.kcal }} / 2000 kcal</span>
        </div>
        <div class="goal-bar">
          <div class="goal-bar-inner" :style="{width: Math.min(100, Math.round(total.kcal/2000*100)) + '%', background: colors.kcal}"></div>
        </div>
      </div>
      <div class="goal-row">
        <div class="goal-info">
          <span>蛋白质</span>
          <span>{{ total.protein }} / 120g</span>
        </div>
        <div class="goal-bar">
          <div class="goal-bar-inner" :style="{width: Math.min(100, Math.round(total.protein/120*100)) + '%', background: colors.protein}"></div>
        </div>
      </div>
      <div class="goal-row">
        <div class="goal-info">
          <span>碳水</span>
          <span>{{ total.carbs }} / 250g</span>
        </div>
        <div class="goal-bar">
          <div class="goal-bar-inner" :style="{width: Math.min(100, Math.round(total.carbs/250*100)) + '%', background: colors.carbs}"></div>
        </div>
      </div>
      <div class="goal-row">
        <div class="goal-info">
          <span>脂肪</span>
          <span>{{ total.fat }} / 65g</span>
        </div>
        <div class="goal-bar">
          <div class="goal-bar-inner" :style="{width: Math.min(100, Math.round(total.fat/65*100)) + '%', background: colors.fat}"></div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  meals: {
    type: Array,
    required: true
  }
})
const colors = {
  kcal: '#ff6b6b',
  protein: '#006c49',
  carbs: '#2170e4',
  fat: '#e29100'
}
const total = computed(() => {
  return props.meals.reduce((acc, m) => ({
    kcal: acc.kcal + (m.kcal || 0),
    protein: acc.protein + (m.protein || 0),
    carbs: acc.carbs + (m.carbs || 0),
    fat: acc.fat + (m.fat || 0)
  }), {kcal:0, protein:0, carbs:0, fat:0})
})
const sum = computed(() => total.value.protein + total.value.carbs + total.value.fat)
const proteinRatio = computed(() => sum.value ? Math.round(total.value.protein/sum.value*100) : 0)
const carbsRatio = computed(() => sum.value ? Math.round(total.value.carbs/sum.value*100) : 0)
const fatRatio = computed(() => sum.value ? 100 - proteinRatio.value - carbsRatio.value : 0)
const kcalRatio = computed(() => total.value.kcal > 0 ? 100 : 0)
</script>

<style scoped>
.summary-panel.horizontal-layout {
  display: flex;
  flex-direction: row;
  gap: 2.5rem;
  justify-content: space-between;
  align-items: stretch;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.04);
  border: 1px solid #e2e8f0;
  padding: 2.2rem 2rem 1.5rem 2rem;
  margin-bottom: 1.5rem;
}
.summary-block {
  flex: 1 1 0;
  min-width: 220px;
  background: none;
  box-shadow: none;
  border: none;
  padding: 0;
}
.summary-block h3 {
  text-align: left;
  margin: 0 0 1.5rem 0;
  font-size: 1.15rem;
  color: #1a202c;
  font-weight: 600;
}
.summary-intake {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.intake-chart {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 2rem;
}
.donut {
  transform: rotate(-90deg);
}
.intake-donut,
.ratio-donut {
  width: 100px;
  height: 100px;
}
.intake-legend {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  font-size: 0.95rem;
}
.summary-ratio {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.ratio-chart {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 2rem;
}
.ratio-legend {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  font-size: 0.95rem;
}
.dot {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 0.3rem;
}
.summary-goal {
  margin-top: 1.5rem;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.04);
  border: 1px solid #e2e8f0;
  padding: 2rem 2rem 1.5rem 2rem;
}
.summary-goal h3 {
  text-align: left;
  margin: 0 0 1.5rem 0;
  font-size: 1.15rem;
  color: #1a202c;
  font-weight: 600;
}
.goal-list {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}
.goal-row {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.goal-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.95rem;
  color: #4a5568;
}
.goal-bar {
  width: 100%;
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}
.goal-bar-inner {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}
@media (max-width: 900px) {
  .summary-panel.horizontal-layout {
    flex-direction: column;
    gap: 1.5rem;
    padding: 1.2rem 0.7rem 1.2rem 0.7rem;
  }
  .summary-goal {
    padding: 1.2rem 0.7rem 1.2rem 0.7rem;
  }
  .intake-donut,
  .ratio-donut {
    width: 120px;
    height: 120px;
  }
  .intake-chart,
  .ratio-chart {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>