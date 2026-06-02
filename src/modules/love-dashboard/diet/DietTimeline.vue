<template>
  <div class="diet-timeline">
    <div class="timeline-line" aria-hidden="true" />

    <article
      v-for="meal in meals"
      :key="meal.id"
      class="timeline-entry"
      :class="meal.type"
    >
      <div class="time-rail">
        <div class="time-dot">{{ meal.period.slice(0, 1) }}</div>
        <div class="time-label">{{ meal.time }}</div>
      </div>

      <div class="meal-card">
        <div class="meal-photo" :class="{ empty: !meal.img }">
          <img v-if="meal.img" :src="meal.img" :alt="meal.name" />
        </div>

        <div class="meal-body">
          <div class="meal-topline">
            <span class="meal-period">{{ meal.period }}</span>
            <span class="meal-mood">{{ meal.mood }}</span>
          </div>

          <h3 class="meal-name">{{ meal.name }}</h3>
          <p class="meal-desc">{{ meal.desc }}</p>

          <div class="meal-tags">
            <span class="tag">{{ meal.protein }}g 蛋白</span>
            <span class="tag">{{ meal.carbs }}g 碳水</span>
            <span class="tag">{{ meal.fat }}g 脂肪</span>
          </div>

          <p class="meal-comment">{{ meal.comment }}</p>
        </div>

        <div class="meal-kcal">
          <span class="kcal-value">{{ meal.kcal }}</span>
          <span class="kcal-unit">kcal</span>
        </div>
      </div>
    </article>
  </div>
</template>

<script setup>
defineProps({
  meals: {
    type: Array,
    required: true,
  },
})
</script>

<style scoped>
.diet-timeline {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.timeline-line {
  position: absolute;
  left: 33px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(180deg, #d4e9c5 0%, #dcc1b9 100%);
}

.timeline-entry {
  position: relative;
  display: grid;
  grid-template-columns: 84px minmax(0, 1fr);
  gap: 20px;
  align-items: start;
}

.time-rail {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.time-dot {
  width: 34px;
  height: 34px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: #ba5839;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  box-shadow: 0 10px 18px rgba(154, 64, 36, 0.2);
}

.time-label {
  padding: 8px 10px;
  border-radius: 999px;
  background: #fff;
  border: 1px solid #dcc1b9;
  color: #7e2c11;
  font-size: 13px;
  font-weight: 700;
}

.meal-card {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr) auto;
  gap: 18px;
  align-items: stretch;
  padding: 18px;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(220, 193, 185, 0.92);
  box-shadow: 0 18px 34px rgba(50, 47, 46, 0.07);
}

.meal-photo {
  min-height: 188px;
  border-radius: 22px;
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
  margin-bottom: 10px;
}

.meal-period,
.meal-mood,
.tag {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 7px 12px;
  font-size: 12px;
  line-height: 1;
  font-weight: 700;
}

.meal-period {
  background: #ffdbd1;
  color: #7e2c11;
}

.meal-mood {
  background: #d4e9c5;
  color: #3a4c31;
}

.meal-name {
  margin: 0;
  font-family: 'Playfair Display', 'Times New Roman', serif;
  font-size: 30px;
  line-height: 1.1;
  color: #1d1b1a;
}

.meal-desc {
  margin: 10px 0 14px;
  color: #56423d;
  font-size: 15px;
  line-height: 24px;
}

.meal-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 14px;
}

.tag {
  background: #f3ecea;
  color: #56423d;
}

.meal-comment {
  margin: auto 0 0;
  padding-top: 14px;
  border-top: 1px solid #eee7e5;
  color: #89726c;
  font-size: 14px;
  line-height: 22px;
}

.meal-kcal {
  min-width: 92px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-end;
}

.kcal-value {
  font-family: 'Playfair Display', 'Times New Roman', serif;
  font-size: 42px;
  line-height: 1;
  color: #9a4024;
}

.kcal-unit {
  font-size: 13px;
  line-height: 16px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #89726c;
  font-weight: 700;
}

@media (max-width: 900px) {
  .timeline-line {
    left: 22px;
  }

  .timeline-entry {
    grid-template-columns: 56px minmax(0, 1fr);
    gap: 14px;
  }

  .meal-card {
    grid-template-columns: 1fr;
  }

  .meal-photo {
    min-height: 220px;
  }

  .meal-kcal {
    flex-direction: row;
    align-items: baseline;
    justify-content: flex-start;
    gap: 8px;
  }
}
</style>
