<template>
  <section class="recipe-detail-page">
    <header class="detail-header card-shell">
      <div class="header-topline">
        <button class="back-button" type="button" @click="$emit('close')">
          <span class="material-symbols-outlined">arrow_back</span>
          返回食谱时间轴
        </button>
        <button class="save-button" type="button">
          <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">favorite</span>
          收藏食谱
        </button>
      </div>

      <div class="title-block">
        <p class="eyebrow">{{ recipe.mealType }} · {{ recipe.detail.difficulty }}</p>
        <h1 class="detail-title">{{ recipe.title }}</h1>
        <p class="detail-description">{{ recipe.detail.description }}</p>
      </div>

      <div class="hero-frame">
        <img class="hero-image" :src="recipe.detail.heroImageUrl || recipe.imageUrl" :alt="recipe.title" />
      </div>

      <div class="hero-meta">
        <article class="meta-card">
          <span class="meta-label">准备时间</span>
          <strong class="meta-value">{{ recipe.detail.prepTime }}</strong>
        </article>
        <article class="meta-card">
          <span class="meta-label">烹饪时间</span>
          <strong class="meta-value">{{ recipe.detail.cookTime }}</strong>
        </article>
        <article class="meta-card">
          <span class="meta-label">难度</span>
          <strong class="meta-value">{{ recipe.detail.difficulty }}</strong>
        </article>
        <article class="meta-card">
          <span class="meta-label">份量</span>
          <strong class="meta-value">{{ recipe.detail.servings }}</strong>
        </article>
      </div>
    </header>

    <section class="content-grid">
      <aside class="detail-sidebar">
        <article class="panel-card ingredients-card">
          <div class="section-head">
            <p class="section-kicker">Ingredients</p>
            <h2>完整食材</h2>
          </div>
          <div class="panel-scroll panel-scroll-ingredients">
            <ul class="ingredient-list">
              <li v-for="ingredient in recipe.detail.ingredients" :key="ingredient" class="ingredient-item">
                <span class="ingredient-check">✓</span>
                <span>{{ ingredient }}</span>
              </li>
            </ul>
          </div>
        </article>

        <article class="panel-card nutrition-card">
          <div class="section-head">
            <p class="section-kicker">Nutrition</p>
            <h2>营养成分</h2>
          </div>
          <div class="panel-scroll panel-scroll-nutrition">
            <div class="nutrition-grid">
              <div v-for="item in recipe.detail.nutrition" :key="item.label" class="nutrition-item">
                <span class="nutrition-label">{{ item.label }}</span>
                <strong class="nutrition-value">{{ item.value }}</strong>
              </div>
            </div>
          </div>
        </article>
      </aside>

      <main class="detail-main">
        <article class="panel-card story-card">
          <div class="section-head">
            <p class="section-kicker">Method</p>
            <h2>烹饪步骤</h2>
          </div>

          <div class="panel-scroll panel-scroll-steps">
            <ol class="step-list">
              <li v-for="(instruction, index) in instructions" :key="`${recipe.id}-${index}`" class="step-item">
                <div class="step-marker">{{ index + 1 }}</div>
                <div class="step-content">
                  <input
                    v-model="instruction.title"
                    type="text"
                    class="step-title-input"
                    :class="{ 'placeholder-text': instruction.title === '步骤标题' }"
                    @focus="handleTitleFocus(instruction)"
                    @blur="handleTitleBlur(instruction)"
                  />
                  <textarea
                    v-model="instruction.description"
                    class="step-textarea"
                    rows="4"
                    :class="{ 'placeholder-text': instruction.description === '步骤内容' }"
                    @focus="handleDescriptionFocus(instruction)"
                    @blur="handleDescriptionBlur(instruction)"
                  />
                </div>
              </li>
            </ol>
          </div>

          <button class="add-step-button" type="button" @click="addStep">
            <span class="material-symbols-outlined">add</span>
            添加一个步骤
          </button>
        </article>

        <article class="panel-card action-panel">
          <div class="panel-scroll panel-scroll-action action-copy-block">
            <p class="section-kicker">Cook Mode</p>
            <h2 class="action-title">准备开始这道料理了吗？</h2>
            <p class="action-copy">按 Stitch 详情页的叙事节奏保留大图、信息卡片和步骤时间轴，让阅读顺序更接近纸质食谱。</p>
          </div>

          <div class="action-buttons">
            <button class="action-button primary-button" type="button">
              <span class="material-symbols-outlined">play_circle</span>
              开始烹饪
            </button>
            <button class="action-button secondary-button" type="button">
              <span class="material-symbols-outlined">ios_share</span>
              分享食谱
            </button>
          </div>
        </article>
      </main>
    </section>
  </section>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  recipe: {
    type: Object,
    required: true
  }
})

defineEmits(['close'])

const instructions = ref([])

const cloneInstructions = (source = []) =>
  source.map((item) => ({
    title: item?.title ?? '',
    description: item?.description ?? ''
  }))

watch(
  () => props.recipe.detail.instructions,
  (next) => {
    instructions.value = cloneInstructions(next)
  },
  { deep: true, immediate: true }
)

watch(
  instructions,
  (next) => {
    props.recipe.detail.instructions = cloneInstructions(next)
  },
  { deep: true }
)

const addStep = () => {
  const newStep = {
    title: '步骤标题',
    description: '步骤内容'
  }
  instructions.value.push(newStep)
}

const handleTitleFocus = (instruction) => {
  if (instruction.title === '步骤标题') {
    instruction.title = ''
  }
}

const handleTitleBlur = (instruction) => {
  if (instruction.title.trim() === '') {
    instruction.title = '步骤标题'
  }
}

const handleDescriptionFocus = (instruction) => {
  if (instruction.description === '步骤内容') {
    instruction.description = ''
  }
}

const handleDescriptionBlur = (instruction) => {
  if (instruction.description.trim() === '') {
    instruction.description = '步骤内容'
  }
}

</script>

<style scoped>
.recipe-detail-page {
  display: grid;
  gap: 32px;
  padding-bottom: 40px;
  overflow: hidden;
}

.card-shell,
.panel-card {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(249, 242, 240, 0.92));
  border: 1px solid rgba(220, 193, 185, 0.75);
  border-radius: 32px;
  box-shadow:
    0 24px 50px rgba(50, 47, 46, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.65);
}

.detail-header {
  padding: 28px;
  display: grid;
  gap: 28px;
  max-height: 1000px;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.header-topline {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.back-button,
.save-button {
  border: none;
  border-radius: 999px;
  padding: 12px 18px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-weight: 700;
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.back-button {
  background: #f3ecea;
  color: #3a0a00;
}

.save-button {
  background: #d4e9c5;
  color: #3a4c31;
}

.back-button:hover,
.save-button:hover,
.action-button:hover {
  transform: translateY(-1px);
}

.title-block {
  display: grid;
  gap: 10px;
  max-width: 760px;
}

.eyebrow,
.section-kicker {
  margin: 0;
  color: #576a4d;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.detail-title {
  margin: 0;
  font-family: 'Playfair Display', serif;
  font-size: clamp(2.5rem, 4vw, 4.5rem);
  line-height: 0.96;
  color: #9a4024;
}

.detail-description {
  margin: 0;
  color: #56423d;
  font-size: 1.05rem;
  line-height: 1.85;
}

.hero-frame {
  overflow: hidden;
  border-radius: 28px;
  min-height: 460px;
  background: #e8e1df;
}

.hero-image {
  width: 100%;
  height: 100%;
  min-height: 460px;
  object-fit: cover;
  display: block;
}

.hero-meta {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.meta-card {
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(220, 193, 185, 0.75);
  border-radius: 22px;
  padding: 18px 20px;
  display: grid;
  gap: 8px;
}

.meta-label {
  color: #89726c;
  font-size: 0.82rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.meta-value {
  color: #1d1b1a;
  font-size: 1.15rem;
}

.content-grid {
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  gap: 28px;
}

.detail-sidebar,
.detail-main {
  display: grid;
  gap: 24px;
  align-content: start;
  min-width: 0;
}

.panel-card {
  padding: 28px;
  min-height: 0;
  overflow: hidden;
}

.section-head {
  display: grid;
  gap: 8px;
  margin-bottom: 22px;
}

.section-head h2,
.action-title,
.step-title {
  margin: 0;
}

.section-head h2,
.action-title {
  font-family: 'Playfair Display', serif;
  color: #1d1b1a;
  font-size: clamp(1.5rem, 2vw, 2rem);
  line-height: 1.1;
}

.ingredient-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 14px;
}

.ingredient-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.76);
  border-radius: 18px;
  color: #3a0a00;
  font-weight: 600;
}

.ingredient-check {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: inline-grid;
  place-items: center;
  background: #d4e9c5;
  color: #3a4c31;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.nutrition-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.nutrition-item {
  padding: 18px;
  background: rgba(255, 255, 255, 0.76);
  border-radius: 20px;
  display: grid;
  gap: 8px;
}

.nutrition-label {
  color: #56423d;
  font-size: 0.92rem;
}

.nutrition-value {
  color: #9a4024;
  font-size: 1.5rem;
  font-weight: 700;
}

.panel-scroll {
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding-right: 8px;
}

.panel-scroll-ingredients {
  max-height: 320px;
}

.panel-scroll-nutrition {
  max-height: 240px;
}

.panel-scroll-steps {
  max-height: 640px;
}

.panel-scroll-action {
  max-height: 180px;
}

.detail-header::-webkit-scrollbar,
.panel-scroll::-webkit-scrollbar {
  width: 8px;
}

.detail-header::-webkit-scrollbar-thumb,
.panel-scroll::-webkit-scrollbar-thumb {
  background: #dcc1b9;
  border-radius: 999px;
}

.detail-header::-webkit-scrollbar-track,
.panel-scroll::-webkit-scrollbar-track {
  background: rgba(243, 236, 234, 0.5);
  border-radius: 999px;
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
  left: 25px;
  top: 20px;
  bottom: 20px;
  width: 3px;
  background: #d4e9c5;
}

.step-item {
  position: relative;
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr);
  gap: 18px;
  align-items: start;
}

.step-marker {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: #ba5839;
  color: #ffffff;
  font-weight: 700;
  box-shadow: 0 12px 24px rgba(154, 64, 36, 0.2);
  z-index: 1;
}

.step-content {
  padding: 20px 22px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(220, 193, 185, 0.65);
  border-radius: 24px;
  display: grid;
  gap: 14px;
}

.step-title-input,
.step-textarea {
  width: 100%;
  border: 1px solid rgba(220, 193, 185, 0.9);
  border-radius: 16px;
  background: rgba(255, 248, 246, 0.92);
  color: #1d1b1a;
  font: inherit;
  padding: 14px 16px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.step-title-input {
  font-size: 1.05rem;
  font-weight: 700;
}

.step-textarea {
  resize: vertical;
  min-height: 120px;
  line-height: 1.8;
}

.step-title-input:focus,
.step-textarea:focus {
  outline: none;
  border-color: #9a4024;
  box-shadow: 0 0 0 3px rgba(154, 64, 36, 0.12);
}

.placeholder-text {
  color: #aabba0;
}

.step-text,
.action-copy {
  margin: 0;
  color: #56423d;
  line-height: 1.85;
}

.action-panel {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.action-buttons {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
}

.add-step-button {
  width: 100%;
  margin-top: 20px;
  border: 1px dashed #ba5839;
  border-radius: 20px;
  padding: 18px 22px;
  background: rgba(255, 255, 255, 0.78);
  color: #9a4024;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease, background-color 0.2s ease;
}

.add-step-button:hover {
  background: #fff8f6;
  transform: translateY(-1px);
}

.action-copy-block {
  max-width: 520px;
}

.action-button {
  border: none;
  border-radius: 18px;
  padding: 16px 22px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-weight: 700;
  transition: transform 0.2s ease, filter 0.2s ease;
}

.primary-button {
  background: #9a4024;
  color: #ffffff;
}

.secondary-button {
  background: #f3ecea;
  color: #3a0a00;
}

@media (max-width: 1100px) {
  .hero-meta,
  .content-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .content-grid {
    gap: 24px;
  }

  .detail-sidebar {
    grid-column: 1 / -1;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .detail-main {
    grid-column: 1 / -1;
  }
}

@media (max-width: 720px) {
  .detail-header,
  .panel-card {
    padding: 22px;
    border-radius: 26px;
  }

  .hero-frame,
  .hero-image {
    min-height: 280px;
  }

  .hero-meta,
  .content-grid,
  .detail-sidebar,
  .nutrition-grid {
    grid-template-columns: 1fr;
  }

  .step-item {
    grid-template-columns: 1fr;
  }

  .step-list::before {
    display: none;
  }
}

.placeholder-text {
  color: #9ca3af !important;
  opacity: 0.7;
}

.step-title-input.placeholder-text::placeholder,
.step-textarea.placeholder-text::placeholder {
  color: #9ca3af;
  opacity: 1;
}
</style>
