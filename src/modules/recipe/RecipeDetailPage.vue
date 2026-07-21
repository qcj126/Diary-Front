<template>
  <section class="recipe-detail-page">
    <header class="detail-header card-shell">
      <div class="header-topline">
        <button class="back-button" type="button" @click="$emit('close')">
          <span class="material-symbols-outlined">arrow_back</span>
          返回食谱时间线
        </button>
        <div class="header-actions">
          <button v-if="draft.recipeId" class="delete-button" type="button" @click="handleDelete">
            <span class="material-symbols-outlined">delete</span>
            删除
          </button>
          <button class="save-button" type="button" :disabled="saving" @click="handleSave">
            <span class="material-symbols-outlined">save</span>
            {{ saving ? '保存中...' : '保存食谱' }}
          </button>
        </div>
      </div>

      <div class="form-grid">
        <label class="field field-wide">
          <span>标题</span>
          <input v-model.trim="draft.title" type="text" placeholder="例如：红烧肉" />
        </label>

        <label class="field field-wide">
          <span>封面图片 URL</span>
          <input v-model.trim="draft.coverImg" type="url" placeholder="https://..." />
        </label>

        <label class="field field-wide">
          <span>简介</span>
          <textarea v-model.trim="draft.description" rows="3" placeholder="写一点这道菜的味道和来历" />
        </label>

        <label class="field">
          <span>分类</span>
          <select v-model.number="draft.category">
            <option :value="0">家常</option>
            <option :value="1">西餐</option>
            <option :value="2">甜点</option>
            <option :value="3">汤粥</option>
            <option :value="4">其他</option>
          </select>
        </label>

        <label class="field">
          <span>餐别</span>
          <select v-model.number="draft.mealTypeValue">
            <option :value="1">早餐</option>
            <option :value="2">午餐</option>
            <option :value="3">晚餐</option>
            <option :value="4">夜宵</option>
          </select>
        </label>

        <label class="field">
          <span>难度</span>
          <select v-model.number="draft.difficultyValue">
            <option :value="1">简单</option>
            <option :value="2">中等</option>
            <option :value="3">困难</option>
          </select>
        </label>

        <label class="field">
          <span>烹饪时长（分钟）</span>
          <input v-model.number="draft.cookingTime" type="number" min="0" />
        </label>

        <label class="field field-wide">
          <span>情感故事</span>
          <textarea v-model.trim="draft.story" rows="3" placeholder="可选，用来记录这道菜背后的故事" />
        </label>
      </div>

      <div class="hero-frame">
        <img class="hero-image" :src="draft.coverImg || '/stitch_timeline_glow.png'" :alt="draft.title" />
      </div>
    </header>

    <section class="content-grid">
      <article class="panel-card">
        <div class="section-head">
          <p class="section-kicker">Ingredients</p>
          <h2>食材</h2>
        </div>
        <textarea
          v-model="ingredientsText"
          class="large-textarea"
          rows="10"
          placeholder="每行一个食材，例如：五花肉 500g"
        />
      </article>

      <article class="panel-card">
        <div class="section-head">
          <p class="section-kicker">Method</p>
          <h2>步骤</h2>
        </div>
        <textarea
          v-model="stepsText"
          class="large-textarea"
          rows="10"
          placeholder="每行一个步骤，例如：切块焯水"
        />
      </article>
    </section>
  </section>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  recipe: {
    type: Object,
    required: true,
  },
  saving: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close', 'save', 'delete'])

const draft = ref({})
const ingredientsText = ref('')
const stepsText = ref('')

function cloneRecipe(recipe) {
  return {
    ...recipe,
    title: recipe.title ?? '',
    coverImg: recipe.coverImg ?? recipe.imageUrl ?? recipe.detail?.heroImageUrl ?? '',
    description: recipe.description ?? recipe.detail?.description ?? '',
    category: recipe.category ?? 0,
    mealTypeValue: recipe.mealTypeValue ?? 3,
    difficultyValue: recipe.difficultyValue ?? recipe.difficulty ?? 1,
    cookingTime: recipe.cookingTime ?? null,
    story: recipe.story ?? recipe.detail?.story ?? '',
  }
}

function formatIngredients(recipe) {
  return (recipe.ingredients ?? [])
    .map((item) => [item.name, item.amount].filter(Boolean).join(' '))
    .filter(Boolean)
    .join('\n')
}

function formatSteps(recipe) {
  const rawSteps = recipe.rawSteps ?? recipe.steps ?? []
  return rawSteps
    .map((step) => {
      if (typeof step === 'string') return step.replace(/^\d+\.\s*/, '')
      return step?.description ?? ''
    })
    .filter(Boolean)
    .join('\n')
}

function parseIngredients(text) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, ...amountParts] = line.split(/\s+/)
      return { name, amount: amountParts.join(' ') }
    })
}

function parseSteps(text) {
  return text
    .split('\n')
    .map((line) => line.trim().replace(/^\d+\.\s*/, ''))
    .filter(Boolean)
    .map((description, index) => ({ stepNum: index + 1, description }))
}

watch(
  () => props.recipe,
  (next) => {
    draft.value = cloneRecipe(next)
    ingredientsText.value = formatIngredients(next)
    stepsText.value = formatSteps(next)
  },
  { immediate: true },
)

function handleSave() {
  emit('save', {
    ...draft.value,
    ingredients: parseIngredients(ingredientsText.value),
    steps: parseSteps(stepsText.value),
  })
}

function handleDelete() {
  emit('delete', draft.value)
}
</script>

<style scoped>
.recipe-detail-page {
  display: grid;
  gap: 28px;
  padding-bottom: 40px;
}

.card-shell,
.panel-card {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(249, 242, 240, 0.92));
  border: 1px solid rgba(220, 193, 185, 0.75);
  border-radius: 18px;
  box-shadow: 0 24px 50px rgba(50, 47, 46, 0.08);
}

.detail-header,
.panel-card {
  padding: 28px;
}

.header-topline {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}

.header-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.back-button,
.save-button,
.delete-button {
  border: none;
  border-radius: 8px;
  padding: 12px 16px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-weight: 700;
}

.back-button {
  background: #f3ecea;
  color: #3a0a00;
}

.save-button {
  background: #9a4024;
  color: #ffffff;
}

.save-button:disabled {
  opacity: 0.65;
  cursor: wait;
}

.delete-button {
  background: #f6d8d1;
  color: #7a2f16;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.field {
  display: grid;
  gap: 8px;
  color: #56423d;
  font-size: 14px;
  font-weight: 700;
}

.field-wide {
  grid-column: 1 / -1;
}

.field input,
.field select,
.field textarea,
.large-textarea {
  width: 100%;
  border: 1px solid rgba(220, 193, 185, 0.9);
  border-radius: 8px;
  background: rgba(255, 248, 246, 0.92);
  color: #1d1b1a;
  font: inherit;
  padding: 12px 14px;
}

.field textarea,
.large-textarea {
  resize: vertical;
  line-height: 1.7;
}

.hero-frame {
  margin-top: 24px;
  overflow: hidden;
  border-radius: 14px;
  min-height: 360px;
  background: #e8e1df;
}

.hero-image {
  width: 100%;
  height: 100%;
  min-height: 360px;
  object-fit: cover;
  display: block;
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
}

.section-head {
  display: grid;
  gap: 8px;
  margin-bottom: 18px;
}

.section-kicker {
  margin: 0;
  color: #576a4d;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.section-head h2 {
  margin: 0;
  font-family: 'Playfair Display', serif;
  color: #1d1b1a;
  font-size: 1.6rem;
}

@media (max-width: 820px) {
  .form-grid,
  .content-grid {
    grid-template-columns: 1fr;
  }

  .detail-header,
  .panel-card {
    padding: 22px;
  }

  .hero-frame,
  .hero-image {
    min-height: 260px;
  }
}
</style>
