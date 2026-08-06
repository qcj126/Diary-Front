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
          <button class="save-button" type="button" :disabled="saving || imageUploading" @click="handleSave">
            <span class="material-symbols-outlined">save</span>
            {{ saving ? '保存中...' : '保存食谱' }}
          </button>
        </div>
      </div>

      <div class="form-grid">
        <div class="top-fields">
          <label class="field">
            <span>标题</span>
            <input v-model.trim="draft.title" type="text" placeholder="例如：红烧肉" />
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

          <label class="field">
            <span>人数</span>
            <input v-model.number="draft.servings" type="number" min="1" step="1" />
          </label>
        </div>

        <div class="story-fields">
          <label class="field">
            <span>简介</span>
            <textarea v-model.trim="draft.description" rows="3" placeholder="写一点这道菜的味道和来历" />
          </label>

          <div class="field">
            <span>食谱图片</span>
            <label class="upload-box">
              <input type="file" accept="image/*" :disabled="imageUploading" @change="handleImageChange" />
              <span class="material-symbols-outlined">add_photo_alternate</span>
              <strong>{{ imageUploading ? '上传中...' : draft.imageId ? '可重新上传图片' : '选择图片上传' }}</strong>
            </label>
            <p v-if="draft.imageId" class="image-id">图片ID：{{ draft.imageId }}</p>
            <p v-if="imageError" class="form-error">{{ imageError }}</p>
          </div>

          <label class="field">
            <span>情感故事</span>
            <textarea v-model.trim="draft.story" rows="3" placeholder="可选，用来记录这道菜背后的故事" />
          </label>
        </div>
      </div>
    </header>

    <section class="content-grid">
      <article class="list-panel">
        <div class="ingredient-header row-header">
          <span></span>
          <span>食材名</span>
          <span>用量</span>
          <span>是否主料</span>
          <span></span>
        </div>
        <div class="entry-list">
          <div v-for="(ingredient, index) in ingredients" :key="ingredient.uid" class="ingredient-row">
            <span class="ingredient-index">{{ index + 1 }}</span>
            <label class="field compact-field">
              <input v-model.trim="ingredient.name" type="text" aria-label="食材名" placeholder="五花肉" />
            </label>
            <label class="field compact-field">
              <input v-model.trim="ingredient.quantity" type="text" aria-label="用量" placeholder="500g" />
            </label>
            <label class="field compact-field">
              <select v-model.number="ingredient.isMain" aria-label="是否主料">
                <option :value="1">1</option>
                <option :value="0">0</option>
              </select>
            </label>
            <div class="row-meta">
              <div class="row-actions">
                <button class="icon-button" type="button" :disabled="ingredients.length === 1" @click="removeIngredient(index)">
                  <span class="material-symbols-outlined">remove</span>
                </button>
                <button class="icon-button add-inline-button" type="button" @click="addIngredientAfter(index)">
                  <span class="material-symbols-outlined">add</span>
                </button>
              </div>
            </div>
          </div>
        </div>


      </article>

      <article class="list-panel">
        <div class="step-header row-header">
          <span></span>
          <span>步骤描述</span>
          <span>耗时</span>
          <span></span>
        </div>
        <div class="entry-list">
          <div v-for="(step, index) in steps" :key="step.uid" class="step-row">
            <span class="step-number">{{ index + 1 }}</span>
            <label class="field compact-field step-description">
              <input v-model.trim="step.description" type="text" aria-label="步骤描述" placeholder="五花肉切块后冷水下锅焯水。" />
            </label>
            <label class="field compact-field timer-field">
              <input v-model.number="step.timerMin" type="number" min="0" aria-label="耗时" />
            </label>
            <div class="row-meta">
              <div class="row-actions">
                <button class="icon-button" type="button" :disabled="steps.length === 1" @click="removeStep(index)">
                  <span class="material-symbols-outlined">remove</span>
                </button>
                <button class="icon-button add-inline-button" type="button" @click="addStepAfter(index)">
                  <span class="material-symbols-outlined">add</span>
                </button>
              </div>
            </div>
          </div>
        </div>


      </article>
    </section>
  </section>
</template>

<script setup>
import { ref, watch } from 'vue'
import { uploadRecipeImages } from './api/recipe.js'

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
const ingredients = ref([])
const steps = ref([])
const imageUploading = ref(false)
const imageError = ref('')
let rowId = 0

function nextRowId() {
  rowId += 1
  return rowId
}

function cloneRecipe(recipe) {
  return {
    ...recipe,
    title: recipe.title ?? '',
    imageId: recipe.imageId ?? '',
    coverImg: recipe.coverImg ?? recipe.imageUrl ?? recipe.detail?.heroImageUrl ?? '',
    description: recipe.description ?? recipe.detail?.description ?? '',
    category: recipe.category ?? 0,
    mealTypeValue: recipe.mealTypeValue ?? 3,
    difficultyValue: recipe.difficultyValue ?? recipe.difficulty ?? 1,
    cookingTime: recipe.cookingTime ?? null,
    servings: recipe.servings ?? recipe.detail?.servings ?? 1,
    story: recipe.story ?? recipe.detail?.story ?? '',
  }
}

function emptyIngredient() {
  return { uid: nextRowId(), name: '', quantity: '', isMain: 0 }
}

function emptyStep() {
  return { uid: nextRowId(), description: '', timerMin: 0 }
}

function formatIngredients(recipe) {
  const rows = (recipe.ingredients ?? []).map((item) => ({
    uid: nextRowId(),
    name: typeof item === 'string' ? item : item?.name ?? '',
    quantity: typeof item === 'string' ? '' : item?.quantity ?? item?.amount ?? '',
    isMain: Number(typeof item === 'string' ? 0 : item?.isMain ?? 0),
  }))
  return rows.length ? rows : [emptyIngredient()]
}

function formatSteps(recipe) {
  const rawSteps = recipe.rawSteps ?? recipe.steps ?? []
  const rows = rawSteps.map((step) => {
    if (typeof step === 'string') {
      return { uid: nextRowId(), description: step.replace(/^\d+\.\s*/, ''), timerMin: 0 }
    }

    return {
      uid: nextRowId(),
      description: step?.description ?? '',
      timerMin: Number(step?.timerMin ?? 0),
    }
  })
  return rows.length ? rows : [emptyStep()]
}

function addIngredientAfter(index) {
  ingredients.value.splice(index + 1, 0, emptyIngredient())
}

function removeIngredient(index) {
  if (ingredients.value.length > 1) ingredients.value.splice(index, 1)
}

function addStepAfter(index) {
  steps.value.splice(index + 1, 0, emptyStep())
}

function removeStep(index) {
  if (steps.value.length > 1) steps.value.splice(index, 1)
}


async function handleImageChange(event) {
  const file = event.target.files?.[0]
  imageError.value = ''
  if (!file) return

  imageUploading.value = true

  try {
    const [imageId] = await uploadRecipeImages([file])
    draft.value.imageId = imageId
  } catch (error) {
    imageError.value = error instanceof Error ? error.message : '图片上传失败'
    draft.value.imageId = ''
  } finally {
    imageUploading.value = false
    event.target.value = ''
  }
}

watch(
  () => props.recipe,
  (next) => {
    draft.value = cloneRecipe(next)
    ingredients.value = formatIngredients(next)
    steps.value = formatSteps(next)
    imageError.value = ''
  },
  { immediate: true },
)


function handleSave() {
  emit('save', {
    ...draft.value,
    imageId: String(draft.value.imageId ?? '').trim(),
    servings: Number(draft.value.servings ?? 1),
    ingredients: ingredients.value.map((item, index) => ({
      name: item.name,
      quantity: item.quantity,
      isMain: Number(item.isMain),
      sort: index + 1,
    })),
    steps: steps.value.map((item, index) => ({
      stepNumber: index + 1,
      description: item.description,
      timerMin: Number(item.timerMin ?? 0),
      sort: index + 1,
    })),
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
.delete-button,
.icon-button {
  border: none;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  font-weight: 700;
}

.back-button,
.save-button,
.delete-button {
  padding: 12px 16px;
}

.back-button {
  background: #f3ecea;
  color: #3a0a00;
}

.save-button {
  background: #9a4024;
  color: #ffffff;
}

.save-button:disabled,
.icon-button:disabled,
.upload-box:has(input:disabled) {
  opacity: 0.65;
  cursor: wait;
}

.delete-button {
  background: #f6d8d1;
  color: #7a2f16;
}

.form-grid {
  display: grid;
  gap: 16px;
}

.top-fields,
.story-fields {
  display: grid;
  gap: 16px;
}

.top-fields {
  grid-template-columns: repeat(6, minmax(0, 1fr));
}

.top-fields .field > span {
  text-align: center;
}

.story-fields {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: start;
}

.story-fields .field {
  grid-template-rows: auto 1fr auto auto;
  height: 100%;
}

.story-fields .field > span {
  text-align: center;
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
.field textarea {
  width: 100%;
  border: 1px solid rgba(220, 193, 185, 0.9);
  border-radius: 8px;
  background: rgba(255, 248, 246, 0.92);
  color: #1d1b1a;
  font: inherit;
  padding: 12px 14px;
}

.field textarea {
  resize: vertical;
  line-height: 1.7;
}

.story-fields textarea,
.story-fields .upload-box {
  min-height: 150px;
  height: 150px;
}

.story-fields textarea {
  resize: none;
}

.upload-box {
  min-height: 78px;
  border: 1px dashed rgba(154, 64, 36, 0.55);
  border-radius: 8px;
  background: rgba(255, 248, 246, 0.92);
  color: #7a2f16;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
}

.upload-box input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}

.image-id,
.form-error {
  margin: 0;
  font-size: 13px;
}

.image-id {
  color: #576a4d;
}

.form-error {
  color: #b42318;
}


.content-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
}

.list-panel {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 10px;
}

.section-head {
  display: grid;
  gap: 8px;
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

.entry-list {
  display: grid;
  width: 100%;
  gap: 14px;
}

.row-header {
  display: grid;
  gap: 12px;
  align-items: center;
  padding: 0 14px;
  color: #56423d;
  font-size: 14px;
  font-weight: 800;
}

.row-header span {
  text-align: left;
}

.row-header span:not(:first-child):not(:last-child) {
  padding-left: 10px;
}

.ingredient-header {
  grid-template-columns: 34px minmax(112px, 0.9fr) minmax(92px, 0.72fr) minmax(86px, 0.54fr) 84px;
}

.step-header {
  grid-template-columns: 34px minmax(190px, 1fr) 72px 84px;
}

.ingredient-row,
.step-row {
  display: grid;
  gap: 12px;
  align-items: end;
  padding: 14px;
  border: 1px solid rgba(220, 193, 185, 0.6);
  border-radius: 10px;
  background: rgba(255, 251, 249, 0.72);
}

.ingredient-row {
  grid-template-columns: 34px minmax(112px, 0.9fr) minmax(92px, 0.72fr) minmax(86px, 0.54fr) 84px;
  padding-inline: 14px;
}

.ingredient-row .field input,
.ingredient-row .field select {
  min-height: 40px;
  padding: 9px 10px;
}

.step-row {
  grid-template-columns: 34px minmax(190px, 1fr) 72px 84px;
  padding-inline: 14px;
}

.step-row .field input {
  min-height: 40px;
  padding: 9px 10px;
}

.compact-field {
  min-width: 0;
}


.step-number,
.ingredient-index {
  border-radius: 999px;
  background: #f3ecea;
  color: #7a2f16;
  font-weight: 800;
}

.step-number,
.ingredient-index {
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}


.row-meta {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.ingredient-row .row-meta,
.step-row .row-meta {
  align-self: end;
}

.row-actions {
  display: grid;
  grid-template-columns: repeat(2, 38px);
  gap: 8px;
}

.icon-button {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #f6d8d1;
  color: #7a2f16;
}

.add-inline-button {
  background: #eef2e8;
  color: #576a4d;
}

.icon-button:disabled {
  cursor: not-allowed;
}

@media (max-width: 1180px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 820px) {
  .top-fields,
  .story-fields {
    grid-template-columns: 1fr;
  }

  .ingredient-row,
  .step-row {
    grid-template-columns: 34px minmax(0, 1fr);
  }

  .ingredient-header,
  .step-header {
    display: none;
  }

  .ingredient-row .compact-field,
  .ingredient-row .row-meta,
  .step-row .compact-field,
  .step-row .row-meta {
    grid-column: 2;
  }

  .detail-header,
  .panel-card {
    padding: 22px;
  }

  .step-number,
  .ingredient-index,
  .row-meta {
    justify-self: start;
  }
}
</style>
