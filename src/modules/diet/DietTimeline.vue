<template>
  <div class="diet-timeline split-timeline">
    <section v-for="group in mealGroups" :key="group.key" class="meal-column">
      <div class="column-head">
        <h3>{{ group.title }}</h3>
        <span>{{ group.items.length }} 条</span>
      </div>

      <div class="column-timeline">
        <div class="timeline-line" aria-hidden="true" />

        <article v-for="meal in group.items" :key="meal.id" class="timeline-entry">
          <div class="time-dot" aria-hidden="true" />

          <div class="meal-card" :class="{ outside: group.key === 'outside' }">
            <time class="meal-time">{{ meal.recordedAt || meal.time }}</time>

            <div class="meal-photo" :class="{ empty: !meal.img }">
              <img v-if="meal.img" :src="meal.img" :alt="meal.name" />
            </div>

            <div class="meal-body">
              <div class="meal-topline">
                <span class="meal-period">{{ meal.period }}</span>
              </div>

              <h3 class="meal-name">{{ meal.name }}</h3>
              <p class="meal-desc">{{ meal.desc }}</p>

              <div v-if="group.key === 'home'" class="meal-tags">
                <span class="tag">蛋白质 {{ meal.protein }}g</span>
                <span class="tag">碳水 {{ meal.carbs }}g</span>
                <span class="tag">脂肪 {{ meal.fat }}g</span>
                <span class="tag">钠 {{ meal.sodium ?? 0 }}mg</span>
                <span class="tag kcal-tag">热量 {{ meal.kcal }}kcal</span>
              </div>
            </div>
          </div>
        </article>
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

const mealGroups = computed(() => [
  {
    key: 'home',
    title: '在家吃的',
    items: props.meals.filter((meal) => meal.place !== 'outside'),
  },
  {
    key: 'outside',
    title: '在外吃的',
    items: props.meals.filter((meal) => meal.place === 'outside'),
  },
])
</script>

<style scoped>
.diet-timeline {
  position: relative;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  flex: 1 1 auto;
  gap: 14px;
  min-height: 0;
  overflow-y: auto;
  padding-right: 8px;
}

.meal-column {
  min-width: 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.column-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 8px;
  padding: 0 2px 0 20px;
}

.column-head h3 {
  margin: 0;
  color: #1d1b1a;
  font-size: 15px;
  line-height: 20px;
}

.column-head span {
  color: #89726c;
  font-size: 12px;
  font-weight: 800;
}

.column-timeline {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 0;
}

.timeline-line {
  position: absolute;
  left: 6px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(180deg, #d4e9c5 0%, #dcc1b9 100%);
}

.timeline-entry {
  position: relative;
  padding-left: 20px;
}

.time-dot {
  position: absolute;
  left: 1px;
  top: 14px;
  z-index: 1;
  width: 12px;
  height: 12px;
  border-radius: 999px;
  background: #ba5839;
  border: 3px solid #fff8f6;
  box-shadow: 0 0 0 1px rgba(154, 64, 36, 0.28);
}

.meal-card {
  position: relative;
  display: grid;
  grid-template-columns: 104px minmax(0, 1fr);
  gap: 10px;
  align-items: stretch;
  padding: 28px 10px 10px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(220, 193, 185, 0.92);
  box-shadow: 0 10px 22px rgba(50, 47, 46, 0.06);
}

.meal-card.outside {
  background: rgba(249, 242, 240, 0.92);
}

.meal-time {
  position: absolute;
  top: 9px;
  right: 10px;
  color: #89726c;
  font-size: 11px;
  font-weight: 800;
  line-height: 14px;
  white-space: nowrap;
}

.meal-photo {
  height: 86px;
  border-radius: 10px;
  overflow: hidden;
  background: linear-gradient(135deg, #f3ecea, #e8e1df);
}

.meal-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.meal-body {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.meal-topline {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 5px;
}

.meal-period,
.tag {
  display: inline-flex;
  align-items: center;
  border-radius: 8px;
  padding: 5px 8px;
  font-size: 12px;
  line-height: 1;
  font-weight: 700;
}

.meal-period {
  background: #ffdbd1;
  color: #7e2c11;
}

.meal-name {
  margin: 0;
  font-size: 15px;
  line-height: 1.25;
  color: #1d1b1a;
}

.meal-desc {
  display: -webkit-box;
  margin: 5px 0 8px;
  overflow: hidden;
  color: #56423d;
  font-size: 12px;
  line-height: 18px;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.meal-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  background: #f3ecea;
  color: #56423d;
}

.kcal-tag {
  background: #ffdbd1;
  color: #9a4024;
}

@media (max-width: 1180px) {
  .meal-card {
    grid-template-columns: 96px minmax(0, 1fr);
  }
}

@media (max-width: 900px) {
  .diet-timeline {
    grid-template-columns: 1fr;
  }

  .meal-card {
    grid-template-columns: 120px minmax(0, 1fr);
  }
}

@media (max-width: 560px) {
  .meal-card {
    grid-template-columns: 88px minmax(0, 1fr);
  }
}
</style>
