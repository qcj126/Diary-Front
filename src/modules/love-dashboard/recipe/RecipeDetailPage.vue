<template>
  <section class="recipe-detail-page">
    <div class="detail-header">
      <button class="back-button" type="button" @click="$emit('close')">
        <span class="material-symbols-outlined">arrow_back</span>
        返回列表
      </button>
      <div class="detail-title-group">
        <p class="eyebrow">完整食谱</p>
        <h1 class="detail-title">{{ recipe.title }}</h1>
        <p class="detail-description">{{ recipe.detail.description }}</p>
      </div>
    </div>

    <div class="detail-hero">
      <img class="hero-image" :src="recipe.detail.heroImageUrl || recipe.imageUrl" :alt="recipe.title" />
      <div class="hero-meta">
        <div class="meta-chip"><span class="material-symbols-outlined">timer</span> 准备 {{ recipe.detail.prepTime }}</div>
        <div class="meta-chip"><span class="material-symbols-outlined">cooking</span> 烹饪 {{ recipe.detail.cookTime }}</div>
        <div class="meta-chip"><span class="material-symbols-outlined">star</span> 难度 {{ recipe.detail.difficulty }}</div>
        <div class="meta-chip"><span class="material-symbols-outlined">group</span> 份量 {{ recipe.detail.servings }}</div>
      </div>
    </div>

    <div class="detail-grid">
      <aside class="detail-sidebar">
        <div class="panel card nutrition-card">
          <h2>营养成分</h2>
          <div class="nutrition-grid">
            <div v-for="item in recipe.detail.nutrition" :key="item.label" class="nutrition-item">
              <div class="nutrition-value">{{ item.value }}</div>
              <div class="nutrition-label">{{ item.label }}</div>
            </div>
          </div>
        </div>

        <div class="panel card ingredients-card">
          <h2>完整食材</h2>
          <div class="ingredient-scroll">
            <ul class="ingredient-list">
              <li v-for="(ingredient, index) in recipe.detail.ingredients" :key="index">
                <span class="ingredient-name">{{ ingredient }}</span>
              </li>
            </ul>
          </div>
        </div>
      </aside>

      <main class="detail-main">
        <CookingStepsEditor
          v-model="instructions"
          @save="saveStepEdits"
        />

        <div class="panel card action-panel">
          <button class="action-button primary-button" type="button">
            <span class="material-symbols-outlined">play_circle</span>
            开始烹饪模式
          </button>
          <button class="action-button secondary-button" type="button">
            <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">favorite</span>
            收藏
          </button>
          <button class="action-button tertiary-button" type="button">
            <span class="material-symbols-outlined">share</span>
            分享
          </button>
        </div>
      </main>
    </div>
  </section>
</template>

<script setup>
import { ref, watch } from 'vue'
import CookingStepsEditor from './CookingStepsEditor.vue'

const props = defineProps({
  recipe: {
    type: Object,
    required: true
  }
})

const instructions = ref([...props.recipe.detail.instructions])

watch(
  () => props.recipe.detail.instructions,
  (newInstructions) => {
    instructions.value = [...newInstructions]
  },
  { deep: true }
)

const saveStepEdits = (updatedSteps) => {
  instructions.value = updatedSteps.map((item) => ({ ...item }))
  if (props.recipe && props.recipe.detail) {
    props.recipe.detail.instructions = instructions.value.map((item) => ({ ...item }))
  }
}
</script>

<style scoped>
.recipe-detail-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-bottom: 40px;
}

.detail-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.back-button {
  border: none;
  background: #f3ecea;
  color: #1d1b1a;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
}

.detail-title-group {
  flex: 1;
  min-width: 240px;
}

.eyebrow {
  margin: 0 0 8px;
  color: #526447;
  font-size: 0.95rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.detail-title {
  margin: 0;
  font-family: 'Playfair Display', serif;
  font-size: clamp(2rem, 3vw, 3rem);
  line-height: 1.05;
  color: #9a4024;
}

.detail-description {
  margin: 12px 0 0;
  color: #56423d;
  font-size: 1rem;
  line-height: 1.8;
}

.detail-hero {
  display: grid;
  gap: 16px;
}

.hero-image {
  width: 100%;
  min-height: 320px;
  object-fit: cover;
  border-radius: 24px;
  box-shadow: 0 25px 70px rgba(0, 0, 0, 0.08);
}

.hero-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.meta-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid #e8e1df;
  color: #3a0a00;
  font-weight: 600;
}

.detail-grid {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 24px;
}

.detail-sidebar {
  display: grid;
  gap: 24px;
}

.panel.card {
  padding: 24px;
  border-radius: 24px;
  background: #ffffff;
  border: 1px solid #e8e1df;
  box-shadow: 0 18px 40px rgba(213, 199, 187, 0.3);
}

.nutrition-card h2,
.ingredients-card h2,
.steps-card h2 {
  margin: 0 0 20px;
  font-size: 1.1rem;
  color: #1d1b1a;
}

.nutrition-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.nutrition-item {
  background: #fff8f6;
  border-radius: 18px;
  padding: 16px;
  text-align: center;
}

.nutrition-value {
  font-size: 1.4rem;
  font-weight: 700;
  color: #9a4024;
}

.nutrition-label {
  margin-top: 6px;
  color: #56423d;
  font-size: 0.95rem;
}

.ingredient-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 12px;
}

.ingredient-name {
  color: #3a0a00;
  font-weight: 600;
}

.ingredient-scroll {
  max-height: 320px;
  overflow-y: auto;
  padding-right: 8px;
}

.step-scroll {
  max-height: 460px;
  overflow-y: auto;
  padding-right: 8px;
}

.ingredient-scroll::-webkit-scrollbar,
.step-scroll::-webkit-scrollbar {
  width: 6px;
}

.ingredient-scroll::-webkit-scrollbar-thumb,
.step-scroll::-webkit-scrollbar-thumb {
  background: #dcc1b9;
  border-radius: 10px;
}

.steps-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 18px;
}

.steps-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.step-action-button {
  border: none;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.2s ease;
}

.step-action-button:hover:not(:disabled) {
  transform: translateY(-1px);
}

.step-action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.add-step {
  background: #526447;
  color: #ffffff;
}

.delete-step {
  background: #d4e9c5;
  color: #3a4c31;
}

.step-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 24px;
  position: relative;
}

.step-list::before {
  content: '';
  position: absolute;
  top: 36px;
  left: 33px;
  bottom: 24px;
  width: 4px;
  background: #d4e9c5;
}

.step-item {
  display: grid;
  grid-template-columns: 56px 1fr;
  gap: 18px;
  align-items: start;
  position: relative;
}

.step-card {
  background: #f9f2f0;
  border-radius: 22px;
  padding: 20px 22px;
  border: 1px solid #e8e1df;
  box-shadow: 0 10px 24px rgba(50, 47, 46, 0.06);
}

.step-index {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: #ba5839;
  color: white;
  display: grid;
  place-items: center;
  font-weight: 700;
  z-index: 1;
  box-shadow: 0 10px 20px rgba(154, 64, 36, 0.18);
}

.step-card {
  background: #f9f2f0;
  border-radius: 22px;
  padding: 18px 20px;
  border: 1px solid #e8e1df;
}

.step-heading {
  margin: 0 0 8px;
  font-size: 1rem;
  font-weight: 700;
  color: #1d1b1a;
}

.step-text {
  margin: 0;
  color: #56423d;
  line-height: 1.75;
}

.action-panel {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.action-button {
  border: none;
  border-radius: 14px;
  padding: 16px 22px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  transition: transform 0.2s ease, background-color 0.2s ease;
}

.action-button:hover {
  transform: translateY(-1px);
}

.primary-button {
  background: #9a4024;
  color: #ffffff;
}

.secondary-button {
  background: #d4e9c5;
  color: #3a4c31;
}

.tertiary-button {
  background: #f3ecea;
  color: #1d1b1a;
}

@media (max-width: 1000px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
