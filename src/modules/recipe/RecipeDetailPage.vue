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
            <label class="field compact-control">
              <span class="field-heading"><span>标题</span></span>
              <input v-model.trim="draft.title" type="text" placeholder="例如：红烧肉" />
            </label>

            <label class="field compact-control">
              <span class="field-heading">
                <span>分类</span>
                <button type="button" class="field-control-button" aria-label="展开分类" @click.prevent.stop="openSelectPicker">
                  <span class="material-symbols-outlined">arrow_drop_down</span>
                </button>
              </span>
              <select v-model.number="draft.categoryNum">
                <option v-if="!categories.length" :value="null" disabled>暂无分类</option>
                <option v-for="category in categories" :key="category.key" :value="category.value">
                  {{ category.label }}
                </option>
              </select>
            </label>

            <label class="field compact-control">
              <span class="field-heading">
                <span>餐别</span>
                <button type="button" class="field-control-button" aria-label="展开餐别" @click.prevent.stop="openSelectPicker">
                  <span class="material-symbols-outlined">arrow_drop_down</span>
                </button>
              </span>
              <select v-model.number="draft.mealTypeValue">
                <option :value="null" disabled>请选择餐别</option>
                <option :value="1">早餐</option>
                <option :value="2">午餐</option>
                <option :value="3">晚餐</option>
                <option :value="4">夜宵</option>
              </select>
            </label>

            <label class="field compact-control">
              <span class="field-heading">
                <span>难度</span>
                <button type="button" class="field-control-button" aria-label="展开难度" @click.prevent.stop="openSelectPicker">
                  <span class="material-symbols-outlined">arrow_drop_down</span>
                </button>
              </span>
              <select v-model.number="draft.difficultyValue">
                <option :value="null" disabled>请选择难度</option>
                <option :value="1">简单</option>
                <option :value="2">中等</option>
                <option :value="3">困难</option>
              </select>
            </label>

            <label class="field compact-control numeric-control">
              <span class="field-heading">
                <span>人数</span>
                <span class="number-actions">
                  <button type="button" aria-label="减少人数" @click.prevent.stop="adjustNumber('familyMember', -1, 1)">
                    <span class="material-symbols-outlined">remove</span>
                  </button>
                  <button type="button" aria-label="增加人数" @click.prevent.stop="adjustNumber('familyMember', 1, 1)">
                    <span class="material-symbols-outlined">add</span>
                  </button>
                </span>
              </span>
              <input v-model.number="draft.familyMember" type="number" min="1" step="1" />
            </label>

            <label class="field compact-control">
              <span class="field-heading">
                <span>烹饪</span>
                <button type="button" class="field-control-button" aria-label="展开烹饪方式" @click.prevent.stop="openSelectPicker">
                  <span class="material-symbols-outlined">arrow_drop_down</span>
                </button>
              </span>
              <select v-model="draft.cookWay" :disabled="systemInfoLoading && !cookWayOptions.length">
                <option value="" disabled>{{ systemInfoLoading ? '烹饪方式加载中...' : '请选择烹饪方式' }}</option>
                <option v-if="draft.cookWay && !hasCookWay(draft.cookWay)" :value="draft.cookWay">
                  {{ draft.cookWay }}
                </option>
                <option v-for="cookWay in cookWayOptions" :key="cookWay.id" :value="cookWay.name">
                  {{ cookWay.name }}
                </option>
              </select>
            </label>

            <label class="field compact-control numeric-control">
              <span class="field-heading">
                <span>时长</span>
                <span class="number-actions">
                  <button type="button" aria-label="减少时长" @click.prevent.stop="adjustNumber('cookingTime', -1, 0)">
                    <span class="material-symbols-outlined">remove</span>
                  </button>
                  <button type="button" aria-label="增加时长" @click.prevent.stop="adjustNumber('cookingTime', 1, 0)">
                    <span class="material-symbols-outlined">add</span>
                  </button>
                </span>
              </span>
              <input v-model.number="draft.cookingTime" type="number" min="0" />
            </label>
        </div>

        <div class="story-layout">
          <div class="story-fields">
            <label class="field">
              <span>简介</span>
              <textarea v-model.trim="draft.description" rows="3" placeholder="写一点这道菜的味道和来历" />
            </label>

            <label class="field">
              <span>情感故事</span>
              <textarea v-model.trim="draft.story" rows="3" placeholder="可选，用来记录这道菜背后的故事" />
            </label>
          </div>

          <div class="field image-field">
            <span>食谱图片</span>
            <label class="upload-box" :class="{ 'has-image': draft.coverImg }">
              <input
                type="file"
                accept="image/*"
                aria-label="上传食谱图片"
                :disabled="imageUploading"
                @change="handleImageChange"
              />
              <img v-if="draft.coverImg" :src="draft.coverImg" alt="食谱图片预览" />
              <span class="upload-prompt">
                <span class="material-symbols-outlined">add_photo_alternate</span>
                <strong>{{ imageUploading ? '上传中...' : draft.coverImg ? '重新上传图片' : '选择图片上传' }}</strong>
              </span>
            </label>
            <p v-if="imageError" class="form-error">{{ imageError }}</p>
          </div>
        </div>
      </div>
    </header>

    <section class="content-grid">
      <article class="list-panel">
        <div class="ingredient-header row-header">
          <span></span>
          <span>是否主料</span>
          <span>食材分类</span>
          <span>食材名</span>
          <span>用量</span>
          <span></span>
        </div>
        <p v-if="systemInfoLoading" class="system-info-status">正在加载烹饪方式...</p>
        <p v-else-if="systemInfoError" class="system-info-status error">{{ systemInfoError }}</p>
        <div class="entry-list">
          <div v-for="(ingredient, index) in ingredients" :key="ingredient.uid" class="ingredient-row">
            <span class="ingredient-index">{{ index + 1 }}</span>
            <label class="field compact-field">
              <select
                v-model.number="ingredient.isMain"
                aria-label="是否主料"
                @change="handleIngredientMainChange(ingredient)"
              >
                <option :value="1">主料</option>
                <option :value="0">配料</option>
              </select>
            </label>
            <label class="field compact-field">
              <select
                v-model="ingredient.category"
                aria-label="食材分类"
                @pointerdown="loadIngredientCategories(ingredient)"
                @change="loadIngredientOptions(ingredient)"
              >
                <option value="" disabled>
                  {{ ingredient.categoryOptionsLoading ? '正在加载分类...' : '请选择分类' }}
                </option>
                <option
                  v-if="ingredient.category && !hasIngredientCategoryOption(ingredient, ingredient.category)"
                  :value="ingredient.category"
                >
                  {{ ingredient.category }}（当前）
                </option>
                <option
                  v-for="category in ingredientCategoryOptions(ingredient)"
                  :key="category.id"
                  :value="category.category"
                >
                  {{ category.categoryName }}
                </option>
              </select>
              <small v-if="ingredient.categoryOptionsError" class="ingredient-field-error">
                {{ ingredient.categoryOptionsError }}
              </small>
            </label>
            <label class="field compact-field">
              <span class="ingredient-picker">
                <img
                  v-if="selectedIngredientOption(ingredient)?.iconUrl"
                  :src="selectedIngredientOption(ingredient).iconUrl"
                  :alt="`${ingredient.name}图标`"
                />
                <select
                  v-model="ingredient.name"
                  aria-label="食材名"
                  :disabled="!ingredient.category || ingredient.optionsLoading"
                >
                  <option value="" disabled>
                    {{ ingredient.optionsLoading ? '食材加载中...' : ingredient.category ? '请选择食材' : '请先选择分类' }}
                  </option>
                  <option
                    v-if="ingredient.name && !hasIngredientOption(ingredient, ingredient.name)"
                    :value="ingredient.name"
                  >
                    {{ ingredient.name }}（当前）
                  </option>
                  <option
                    v-for="option in ingredient.availableIngredients"
                    :key="option.id"
                    :value="option.name"
                  >
                    {{ option.name }}
                  </option>
                </select>
              </span>
              <small v-if="ingredient.optionsError" class="ingredient-field-error">
                {{ ingredient.optionsError }}
              </small>
            </label>
            <label class="field compact-field">
              <input v-model.trim="ingredient.quantity" type="text" aria-label="用量" placeholder="500g" />
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
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  queryCookWays,
  queryIngredientCategories,
  queryIngredients,
  uploadRecipeImages,
} from './api/recipe.js'

const props = defineProps({
  recipe: {
    type: Object,
    required: true,
  },
  categories: {
    type: Array,
    default: () => [],
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
const ingredientCategoriesByMain = ref({})
const cookWayOptions = ref([])
const systemInfoLoading = ref(false)
const systemInfoError = ref('')
let imagePreviewObjectUrl = ''
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
    categoryNum: recipe.categoryNum ?? props.categories[0]?.value ?? null,
    mealTypeValue: recipe.mealTypeValue ?? null,
    difficultyValue: recipe.difficultyValue ?? recipe.difficulty ?? null,
    cookingTime: recipe.cookingTime ?? null,
    familyMember: recipe.familyMember ?? recipe.detail?.familyMember ?? null,
    cookWay: recipe.cookWay ?? '',
    story: recipe.story ?? recipe.detail?.story ?? '',
  }
}

function releaseImagePreview() {
  if (!imagePreviewObjectUrl) return
  URL.revokeObjectURL(imagePreviewObjectUrl)
  imagePreviewObjectUrl = ''
}

function emptyIngredient() {
  return {
    uid: nextRowId(),
    category: '',
    name: '',
    quantity: '',
    isMain: 1,
    availableIngredients: [],
    optionsLoading: false,
    optionsError: '',
    requestId: 0,
    categoryOptionsLoading: false,
    categoryOptionsError: '',
    categoryRequestId: 0,
  }
}

function emptyStep() {
  return { uid: nextRowId(), description: '', timerMin: 0 }
}

function formatIngredients(recipe) {
  const rows = (recipe.ingredients ?? []).map((item) => ({
    uid: nextRowId(),
    category: typeof item === 'string' ? '' : item?.category ?? '',
    name: typeof item === 'string' ? item : item?.name ?? '',
    quantity: typeof item === 'string' ? '' : item?.quantity ?? item?.amount ?? '',
    isMain: Number(typeof item === 'string' ? 0 : item?.isMain ?? 0),
    availableIngredients: [],
    optionsLoading: false,
    optionsError: '',
    requestId: 0,
    categoryOptionsLoading: false,
    categoryOptionsError: '',
    categoryRequestId: 0,
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

function hasCookWay(name) {
  return cookWayOptions.value.some((item) => item.name === name)
}

function hasIngredientOption(ingredient, name) {
  return ingredient.availableIngredients.some((item) => item.name === name)
}

function selectedIngredientOption(ingredient) {
  return ingredient.availableIngredients.find((item) => item.name === ingredient.name)
}

function openSelectPicker(event) {
  const select = event.currentTarget.closest('.field')?.querySelector('select')
  if (!select || select.disabled) return

  select.focus()
  try {
    if (typeof select.showPicker === 'function') select.showPicker()
    else select.click()
  } catch {
    select.click()
  }
}

function adjustNumber(field, delta, minimum) {
  const current = Number(draft.value[field])
  const base = Number.isFinite(current) ? current : minimum
  draft.value[field] = Math.max(minimum, base + delta)
}

function ingredientCategoryOptions(ingredient) {
  return ingredientCategoriesByMain.value[ingredient.isMain] ?? []
}

function hasIngredientCategoryOption(ingredient, category) {
  return ingredientCategoryOptions(ingredient).some((item) => item.category === category)
}

async function loadSystemInfoOptions() {
  systemInfoLoading.value = true
  systemInfoError.value = ''

  try {
    const result = await queryCookWays()
    cookWayOptions.value = result.filter((item) => item.name)
  } catch (error) {
    systemInfoError.value = error instanceof Error ? error.message : '系统信息加载失败'
  } finally {
    systemInfoLoading.value = false
  }
}

async function loadIngredientCategories(ingredient) {
  if (ingredient.isMain !== 0 && ingredient.isMain !== 1) return

  ingredient.categoryRequestId += 1
  const requestId = ingredient.categoryRequestId
  ingredient.categoryOptionsLoading = true
  ingredient.categoryOptionsError = ''

  try {
    const result = await queryIngredientCategories(ingredient.isMain)
    if (ingredient.categoryRequestId === requestId) {
      ingredientCategoriesByMain.value = {
        ...ingredientCategoriesByMain.value,
        [ingredient.isMain]: result.filter((item) => item.category),
      }
    }
  } catch (error) {
    if (ingredient.categoryRequestId === requestId) {
      ingredient.categoryOptionsError = error instanceof Error ? error.message : '食材分类加载失败'
    }
  } finally {
    if (ingredient.categoryRequestId === requestId) ingredient.categoryOptionsLoading = false
  }
}

function handleIngredientMainChange(ingredient) {
  ingredient.categoryRequestId += 1
  ingredient.categoryOptionsLoading = false
  ingredient.categoryOptionsError = ''
  ingredient.requestId += 1
  ingredient.optionsLoading = false
  ingredient.optionsError = ''
  ingredient.category = ''
  ingredient.name = ''
  ingredient.availableIngredients = []
}

async function loadIngredientOptions(ingredient, resetName = true) {
  ingredient.requestId += 1
  const requestId = ingredient.requestId
  ingredient.optionsError = ''
  ingredient.availableIngredients = []
  if (resetName) ingredient.name = ''
  if (!ingredient.category) return

  ingredient.optionsLoading = true
  try {
    const result = await queryIngredients({
      category: ingredient.category,
      isMain: ingredient.isMain,
    })
    if (ingredient.requestId === requestId) ingredient.availableIngredients = result.filter((item) => item.name)
  } catch (error) {
    if (ingredient.requestId === requestId) {
      ingredient.optionsError = error instanceof Error ? error.message : '食材加载失败'
    }
  } finally {
    if (ingredient.requestId === requestId) ingredient.optionsLoading = false
  }
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
    releaseImagePreview()
    imagePreviewObjectUrl = URL.createObjectURL(file)
    draft.value.imageId = imageId
    draft.value.coverImg = imagePreviewObjectUrl
  } catch (error) {
    imageError.value = error instanceof Error ? error.message : '图片上传失败'
  } finally {
    imageUploading.value = false
    event.target.value = ''
  }
}

watch(
  () => props.recipe,
  (next) => {
    releaseImagePreview()
    draft.value = cloneRecipe(next)
    ingredients.value = formatIngredients(next)
    ingredients.value.forEach((ingredient) => {
      if (ingredient.category) loadIngredientOptions(ingredient, false)
    })
    steps.value = formatSteps(next)
    imageError.value = ''
  },
  { immediate: true },
)

onBeforeUnmount(releaseImagePreview)
onMounted(loadSystemInfoOptions)


function handleSave() {
  emit('save', {
    ...draft.value,
    imageId: String(draft.value.imageId ?? '').trim(),
    familyMember:
      draft.value.familyMember === '' ||
      draft.value.familyMember === null ||
      draft.value.familyMember === undefined
        ? null
        : Number(draft.value.familyMember),
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
  min-width: 0;
}

.top-fields {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  align-items: start;
  gap: 8px;
}

.top-fields .compact-control {
  width: 100%;
  min-width: 0;
}

.top-fields .field-heading {
  display: flex;
  width: 100%;
  min-height: 24px;
  align-items: center;
  justify-content: center;
  gap: 4px;
  text-align: center;
  white-space: nowrap;
}

.top-fields .compact-control > input,
.top-fields .compact-control > select {
  width: 100%;
  min-width: 0;
  text-align: center;
  text-align-last: center;
}

.top-fields .compact-control > input::placeholder {
  text-align: center;
}

.top-fields .compact-control > select {
  appearance: none;
  background-image: none;
}

.top-fields .compact-control > select::-ms-expand {
  display: none;
}

.top-fields .numeric-control > input {
  appearance: textfield;
}

.top-fields .numeric-control > input::-webkit-inner-spin-button,
.top-fields .numeric-control > input::-webkit-outer-spin-button {
  margin: 0;
  appearance: none;
}

.field-control-button,
.number-actions button {
  display: inline-grid;
  width: 20px;
  height: 20px;
  flex: 0 0 20px;
  padding: 0;
  place-items: center;
  border: 1px solid rgba(154, 64, 36, 0.34);
  border-radius: 6px;
  background: rgba(255, 248, 246, 0.94);
  color: #7a2f16;
  cursor: pointer;
}

.field-control-button:hover,
.number-actions button:hover {
  border-color: rgba(154, 64, 36, 0.72);
  background: #f6e3dd;
}

.field-control-button .material-symbols-outlined,
.number-actions .material-symbols-outlined {
  font-size: 16px;
  line-height: 1;
}

.number-actions {
  display: inline-flex;
  gap: 3px;
}

.story-fields {
  display: grid;
  grid-template-rows: repeat(2, minmax(0, 1fr));
  gap: 16px;
  min-height: 300px;
}

.story-layout {
  display: grid;
  grid-template-columns: minmax(320px, 0.75fr) minmax(280px, 1.25fr);
  gap: 16px;
  align-items: stretch;
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

.story-fields textarea {
  min-height: 126px;
  height: 100%;
  resize: none;
}

.image-field {
  grid-template-rows: auto minmax(0, 1fr) auto;
  min-width: 0;
  height: 100%;
}

.image-field > span {
  text-align: center;
}

.upload-box {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 370px;
  overflow: hidden;
  border: 1px dashed rgba(154, 64, 36, 0.55);
  border-radius: 8px;
  background: rgba(255, 248, 246, 0.92);
  color: #7a2f16;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.upload-box img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-prompt {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 8px;
}

.upload-box.has-image .upload-prompt {
  align-self: flex-end;
  width: 100%;
  border-radius: 0;
  background: rgba(29, 27, 26, 0.7);
  color: #ffffff;
}

.upload-box input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}

.form-error {
  margin: 0;
  font-size: 13px;
}

.form-error {
  color: #b42318;
}

.input-with-unit {
  position: relative;
  display: block;
  font-weight: 700;
}

.input-with-unit input {
  padding-right: 52px;
}

.input-with-unit > span {
  position: absolute;
  top: 50%;
  right: 14px;
  color: #7a625c;
  font-size: 13px;
  transform: translateY(-50%);
  pointer-events: none;
}


.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
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
  grid-template-columns: 34px minmax(86px, 0.54fr) minmax(94px, 0.72fr) minmax(112px, 0.9fr) minmax(92px, 0.68fr) 84px;
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
  grid-template-columns: 34px minmax(86px, 0.54fr) minmax(94px, 0.72fr) minmax(112px, 0.9fr) minmax(92px, 0.68fr) 84px;
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

.system-info-status {
  margin: 0;
  padding: 10px 14px;
  border-radius: 8px;
  background: #f3ecea;
  color: #7a625c;
  font-size: 13px;
}

.system-info-status.error,
.ingredient-field-error {
  color: #b42318;
}

.ingredient-field-error {
  font-size: 12px;
  font-weight: 600;
}

.ingredient-picker {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 8px;
}

.ingredient-picker img {
  width: 32px;
  height: 32px;
  flex: 0 0 32px;
  border-radius: 8px;
  object-fit: cover;
}

.ingredient-picker select {
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
  .story-layout {
    grid-template-columns: 1fr;
  }

  .top-fields {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .image-field .upload-box {
    min-height: 320px;
  }

  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 820px) {
  .top-fields {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .story-fields {
    grid-template-rows: auto;
    min-height: 0;
  }

  .story-fields textarea {
    min-height: 140px;
    height: 140px;
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
