<template>
  <div class="diet-timeline">
    <div v-for="meal in meals" :key="meal.id" class="timeline-entry" :class="meal.type">
      <div class="time-label">{{ meal.time }}</div>
      <div class="meal-card">
        <div class="meal-img" v-if="meal.img">
          <img :src="meal.img" :alt="meal.name" />
        </div>
        <div class="meal-info">
          <h4 class="meal-name">{{ meal.name }}</h4>
          <p class="meal-desc">{{ meal.desc }}</p>
          <p class="meal-comment">这个好好吃！~</p>
        </div>
        <div class="meal-kcal">
          <span class="kcal">{{ meal.kcal }}</span>
          <span class="unit">KCAL</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  meals: {
    type: Array,
    required: true
  }
})
</script>

<style scoped>
.diet-timeline {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.timeline-entry {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 1.2rem;
}
.time-label {
  min-width: 54px;
  font-size: 1rem;
  font-weight: 600;
  color: #006c49;
  margin-top: 0.5rem;
}
.meal-card {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 1rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.04);
  border: 1px solid #e2e8f0;
  padding: 1rem 1.2rem;
  transition: box-shadow 0.2s, transform 0.2s;
}
.meal-card:hover {
  box-shadow: 0 8px 24px rgba(0,0,0,0.10);
  transform: translateY(-2px) scale(1.01);
}
.meal-img {
  width: 56px;
  height: 56px;
  border-radius: 10px;
  overflow: hidden;
  background: #f8f9ff;
  flex-shrink: 0;
}
.meal-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.meal-info {
  flex: 1;
}
.meal-name {
  margin: 0 0 0.2rem;
  font-size: 1rem;
  font-weight: 600;
  color: #0b1c30;
}
.meal-desc {
  margin: 0;
  font-size: 0.92rem;
  color: #64748b;
}
.meal-comment {
  margin: 0.3rem 0 0;
  font-size: 0.88rem;
  color: #006c49;
  font-style: italic;
}
.meal-kcal {
  text-align: right;
}
.kcal {
  font-size: 1.1rem;
  font-weight: 700;
  color: #006c49;
}
.unit {
  display: block;
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 0.1rem;
}
</style>
