<template>
  <section class="ingredient-page">
    <header class="ingredient-header">
      <div>
        <p class="section-kicker">Ingredient Library</p>
        <h2>食材库</h2>
        <p class="header-copy">按主辅料和分类维护食材，新增时可直接关联系统图标。</p>
      </div>
      <button class="primary-button" type="button" @click="openAddDialog">
        <span class="material-symbols-outlined">add</span>
        <span>新增食材</span>
      </button>
    </header>

    <div class="toolbar">
      <div class="ingredient-type-tabs" aria-label="食材类型">
        <button
          v-for="option in ingredientTypes"
          :key="option.value"
          type="button"
          :class="{ active: filters.isMain === option.value }"
          @click="selectIngredientType(option.value)"
        >
          {{ option.label }}
        </button>
      </div>

      <label class="select-field">
        <span class="material-symbols-outlined">filter_alt</span>
        <select v-model="filters.category" :disabled="categoryLoading || !categories.length" @change="loadIngredients">
          <option v-if="!categories.length" value="">暂无分类</option>
          <option v-for="category in categories" :key="category.id" :value="category.category">
            {{ category.categoryName || category.category }}
          </option>
        </select>
      </label>

      <label class="search-field">
        <span class="material-symbols-outlined">search</span>
        <input v-model.trim="filters.keyword" type="search" placeholder="搜索食材名称" />
      </label>

      <button class="refresh-button" type="button" title="刷新" :disabled="loading" @click="refreshAll">
        <span class="material-symbols-outlined">refresh</span>
      </button>
    </div>

    <p v-if="notice" class="notice-row">{{ notice }}</p>
    <p v-if="error" class="state-row error">{{ error }}</p>

    <div class="library-layout">
      <div class="ingredient-panel">
        <div class="panel-heading">
          <div>
            <strong>{{ selectedCategoryName || '食材列表' }}</strong>
            <span>{{ filteredIngredients.length }} 项</span>
          </div>
          <span class="type-badge">{{ filters.isMain ? '主料' : '辅料' }}</span>
        </div>

        <div v-if="loading || categoryLoading" class="state-row">加载中...</div>
        <div v-else-if="!filters.category" class="state-row">当前类型暂无可查询分类</div>
        <div v-else-if="!filteredIngredients.length" class="state-row">暂无食材</div>
        <div v-else class="ingredient-grid">
          <article v-for="ingredient in filteredIngredients" :key="ingredient.id" class="ingredient-card">
            <div class="ingredient-icon">
              <img v-if="ingredient.iconUrl" :src="ingredient.iconUrl" :alt="ingredient.name" />
              <span v-else class="material-symbols-outlined">grocery</span>
            </div>
            <div class="ingredient-copy">
              <strong>{{ ingredient.name || '未命名食材' }}</strong>
              <span>{{ ingredient.categoryName || selectedCategoryName || ingredient.category }}</span>
            </div>
            <code>#{{ ingredient.id }}</code>
          </article>
        </div>
      </div>

      <aside class="cook-way-panel">
        <div class="panel-heading">
          <div>
            <strong>烹饪方式</strong>
            <span>{{ cookWays.length }} 项</span>
          </div>
          <span class="material-symbols-outlined">skillet</span>
        </div>
        <div v-if="cookWayLoading" class="state-row compact">加载中...</div>
        <p v-else-if="cookWayError" class="state-row compact error">{{ cookWayError }}</p>
        <div v-else class="cook-way-list">
          <div v-for="cookWay in cookWays" :key="cookWay.id" class="cook-way-item">
            <strong>{{ cookWay.name }}</strong>
            <span v-if="cookWay.description">{{ cookWay.description }}</span>
          </div>
        </div>
      </aside>
    </div>

    <div v-if="formOpen" class="modal-backdrop" @click.self="closeForm">
      <form class="ingredient-dialog" @submit.prevent="saveIngredient">
        <header class="dialog-header">
          <div>
            <p class="section-kicker">New Ingredient</p>
            <h3>新增食材</h3>
          </div>
          <button class="dialog-icon-button" type="button" @click="closeForm">
            <span class="material-symbols-outlined">close</span>
          </button>
        </header>

        <div class="dialog-grid">
          <label class="dialog-field">
            <span>食材类型</span>
            <select v-model.number="draft.isMain" @change="loadDraftCategories">
              <option :value="1">主料</option>
              <option :value="0">辅料</option>
            </select>
          </label>

          <label class="dialog-field">
            <span>食材分类</span>
            <select v-model="draft.category" :disabled="draftCategoryLoading" required>
              <option disabled value="">请选择分类</option>
              <option v-for="category in draftCategories" :key="category.id" :value="category.category">
                {{ category.categoryName || category.category }}
              </option>
            </select>
          </label>
        </div>

        <label class="dialog-field">
          <span>食材名称</span>
          <input v-model.trim="draft.name" type="text" maxlength="64" placeholder="例如：番茄" required />
        </label>

        <fieldset class="icon-picker-field">
          <legend>关联图标</legend>
          <p v-if="iconLoading" class="state-row compact">图标加载中...</p>
          <div v-else class="icon-picker-grid">
            <button
              v-for="icon in icons"
              :key="icon.id"
              type="button"
              :class="{ selected: String(draft.iconId) === String(icon.id) }"
              :title="icon.iconName"
              @click="draft.iconId = icon.id"
            >
              <span class="icon-preview">
                <img v-if="icon.iconUrl" :src="icon.iconUrl" :alt="icon.iconName" />
                <span v-else class="material-symbols-outlined">image</span>
              </span>
              <span>{{ icon.iconName }}</span>
            </button>
          </div>
        </fieldset>

        <p v-if="formError" class="dialog-error">{{ formError }}</p>

        <footer class="dialog-actions">
          <button class="secondary-button" type="button" @click="closeForm">取消</button>
          <button class="primary-button" type="submit" :disabled="saving">
            {{ saving ? '添加中...' : '添加食材' }}
          </button>
        </footer>
      </form>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { queryIcons } from '../icons/api/icons.js'
import {
  addIngredient,
  queryCookWays,
  queryIngredientCategories,
  queryIngredients,
} from './api/ingredients.js'

const ingredientTypes = [
  { label: '主料', value: 1 },
  { label: '辅料', value: 0 },
]

const filters = reactive({ isMain: 1, category: '', keyword: '' })
const categories = ref([])
const ingredients = ref([])
const cookWays = ref([])
const icons = ref([])
const categoryLoading = ref(false)
const loading = ref(false)
const cookWayLoading = ref(false)
const iconLoading = ref(false)
const saving = ref(false)
const error = ref('')
const cookWayError = ref('')
const notice = ref('')
const formOpen = ref(false)
const formError = ref('')
const draftCategories = ref([])
const draftCategoryLoading = ref(false)

const draft = reactive({
  name: '',
  isMain: 1,
  category: '',
  iconId: '',
})

const selectedCategoryName = computed(() => {
  const selected = categories.value.find((item) => item.category === filters.category)
  return selected?.categoryName || selected?.category || ''
})

const filteredIngredients = computed(() => {
  const keyword = filters.keyword.toLocaleLowerCase()
  if (!keyword) return ingredients.value
  return ingredients.value.filter((item) => String(item.name).toLocaleLowerCase().includes(keyword))
})

async function loadCategories(preferredCategory = '') {
  categoryLoading.value = true
  error.value = ''
  try {
    categories.value = await queryIngredientCategories(filters.isMain)
    const nextCategory = categories.value.some((item) => item.category === preferredCategory)
      ? preferredCategory
      : categories.value[0]?.category || ''
    filters.category = nextCategory
    await loadIngredients()
  } catch (caught) {
    categories.value = []
    ingredients.value = []
    error.value = caught instanceof Error ? caught.message : '食材分类加载失败'
  } finally {
    categoryLoading.value = false
  }
}

async function loadIngredients() {
  if (!filters.category) {
    ingredients.value = []
    return
  }

  loading.value = true
  error.value = ''
  try {
    ingredients.value = await queryIngredients({
      category: filters.category,
      isMain: filters.isMain,
    })
  } catch (caught) {
    ingredients.value = []
    error.value = caught instanceof Error ? caught.message : '食材加载失败'
  } finally {
    loading.value = false
  }
}

async function loadCookWays() {
  cookWayLoading.value = true
  cookWayError.value = ''
  try {
    cookWays.value = await queryCookWays()
  } catch (caught) {
    cookWayError.value = caught instanceof Error ? caught.message : '烹饪方式加载失败'
  } finally {
    cookWayLoading.value = false
  }
}

async function selectIngredientType(isMain) {
  if (filters.isMain === isMain) return
  filters.isMain = isMain
  filters.keyword = ''
  await loadCategories()
}

function refreshAll() {
  notice.value = ''
  return Promise.all([loadCategories(filters.category), loadCookWays()])
}

function resetDraft() {
  draft.name = ''
  draft.isMain = filters.isMain
  draft.category = filters.category
  draft.iconId = ''
}

async function loadDraftCategories() {
  draftCategoryLoading.value = true
  formError.value = ''
  try {
    draftCategories.value = await queryIngredientCategories(draft.isMain)
    if (!draftCategories.value.some((item) => item.category === draft.category)) {
      draft.category = draftCategories.value[0]?.category || ''
    }
  } catch (caught) {
    draftCategories.value = []
    draft.category = ''
    formError.value = caught instanceof Error ? caught.message : '食材分类加载失败'
  } finally {
    draftCategoryLoading.value = false
  }
}

async function loadDialogIcons() {
  if (icons.value.length) return
  iconLoading.value = true
  try {
    icons.value = await queryIcons()
  } catch (caught) {
    formError.value = caught instanceof Error ? caught.message : '图标加载失败'
  } finally {
    iconLoading.value = false
  }
}

async function openAddDialog() {
  resetDraft()
  formError.value = ''
  formOpen.value = true
  await Promise.all([loadDraftCategories(), loadDialogIcons()])
}

function closeForm() {
  if (saving.value) return
  formOpen.value = false
  formError.value = ''
}

async function saveIngredient() {
  const category = draftCategories.value.find((item) => item.category === draft.category)
  if (!draft.name || !category) {
    formError.value = '请填写食材名称并选择分类'
    return
  }
  if (draft.iconId === '' || draft.iconId === null || draft.iconId === undefined) {
    formError.value = '请选择关联图标'
    return
  }

  saving.value = true
  formError.value = ''
  try {
    await addIngredient({
      name: draft.name,
      category: draft.category,
      categoryName: category.categoryName || category.category,
      isMain: draft.isMain,
      iconId: draft.iconId,
    })
    const addedCategory = draft.category
    filters.isMain = draft.isMain
    formOpen.value = false
    notice.value = `“${draft.name}”已添加`
    await loadCategories(addedCategory)
  } catch (caught) {
    formError.value = caught instanceof Error ? caught.message : '添加食材失败'
  } finally {
    saving.value = false
  }
}

onMounted(() => Promise.all([loadCategories(), loadCookWays()]))
</script>

<style scoped>
.ingredient-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-height: 0;
}

.ingredient-header,
.toolbar,
.panel-heading,
.dialog-header,
.dialog-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.ingredient-header h2,
.dialog-header h3 {
  margin: 3px 0 0;
  color: var(--dashboard-text-strong, #201b1b);
  font-size: 28px;
}

.section-kicker {
  margin: 0;
  color: var(--dashboard-primary, #b85a62);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: .16em;
  text-transform: uppercase;
}

.header-copy {
  margin: 7px 0 0;
  color: var(--dashboard-text-muted, #7d7474);
  font-size: 13px;
}

button,
input,
select {
  font: inherit;
}

.primary-button,
.secondary-button,
.refresh-button,
.dialog-icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  border: 0;
  border-radius: 12px;
  cursor: pointer;
}

.primary-button {
  min-height: 42px;
  padding: 0 18px;
  color: #fff;
  background: var(--dashboard-primary, #b85a62);
  font-weight: 800;
  box-shadow: 0 8px 20px rgba(184, 90, 98, .22);
}

.toolbar {
  justify-content: flex-start;
  padding: 12px;
  border: 1px solid var(--dashboard-border-soft, #e6dede);
  border-radius: 16px;
  background: var(--dashboard-surface, #fff);
}

.ingredient-type-tabs {
  display: flex;
  gap: 4px;
  padding: 4px;
  border-radius: 11px;
  background: var(--dashboard-surface-soft, #f7f3f2);
}

.ingredient-type-tabs button {
  min-width: 64px;
  padding: 8px 14px;
  border: 0;
  border-radius: 8px;
  color: var(--dashboard-text-muted, #756d6d);
  background: transparent;
  cursor: pointer;
  font-weight: 750;
}

.ingredient-type-tabs button.active {
  color: var(--dashboard-primary, #b85a62);
  background: var(--dashboard-surface, #fff);
  box-shadow: 0 3px 10px rgba(70, 45, 45, .08);
}

.search-field,
.select-field {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 40px;
  padding: 0 12px;
  border: 1px solid var(--dashboard-border-soft, #e2dada);
  border-radius: 11px;
  background: var(--dashboard-surface, #fff);
}

.search-field {
  flex: 1;
  min-width: 160px;
  max-width: 320px;
}

.search-field input,
.select-field select {
  width: 100%;
  border: 0;
  outline: 0;
  color: var(--dashboard-text, #3c3636);
  background: transparent;
}

.select-field select {
  min-width: 150px;
}

.search-field .material-symbols-outlined,
.select-field .material-symbols-outlined {
  color: var(--dashboard-text-muted, #8b8282);
  font-size: 20px;
}

.refresh-button,
.dialog-icon-button {
  width: 40px;
  height: 40px;
  color: var(--dashboard-text, #4a4242);
  background: var(--dashboard-surface-soft, #f6f1f0);
}

.refresh-button:disabled,
.primary-button:disabled {
  cursor: wait;
  opacity: .55;
}

.library-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(220px, 280px);
  gap: 18px;
  align-items: start;
}

.ingredient-panel,
.cook-way-panel {
  overflow: hidden;
  border: 1px solid var(--dashboard-border-soft, #e6dede);
  border-radius: 18px;
  background: var(--dashboard-surface, #fff);
}

.panel-heading {
  min-height: 62px;
  padding: 0 18px;
  border-bottom: 1px solid var(--dashboard-border-soft, #ece5e5);
}

.panel-heading > div {
  display: flex;
  align-items: baseline;
  gap: 9px;
}

.panel-heading strong {
  color: var(--dashboard-text-strong, #2c2727);
  font-size: 15px;
}

.panel-heading span {
  color: var(--dashboard-text-muted, #8a8080);
  font-size: 12px;
}

.panel-heading > .material-symbols-outlined {
  color: var(--dashboard-primary, #b85a62);
  font-size: 22px;
}

.type-badge {
  padding: 5px 9px;
  border-radius: 999px;
  color: var(--dashboard-primary, #b85a62) !important;
  background: color-mix(in srgb, var(--dashboard-primary, #b85a62) 10%, transparent);
  font-weight: 800;
}

.ingredient-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 10px;
  padding: 14px;
}

.ingredient-card {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr) auto;
  align-items: center;
  gap: 11px;
  min-height: 64px;
  padding: 10px 12px;
  border: 1px solid var(--dashboard-border-soft, #ece5e5);
  border-radius: 13px;
  background: var(--dashboard-surface-soft, #fbf8f7);
}

.ingredient-icon,
.icon-preview {
  display: grid;
  place-items: center;
  overflow: hidden;
  border-radius: 10px;
  background: var(--dashboard-surface, #fff);
}

.ingredient-icon {
  width: 42px;
  height: 42px;
}

.ingredient-icon img,
.icon-preview img {
  width: 28px;
  height: 28px;
  object-fit: contain;
}

.ingredient-icon .material-symbols-outlined {
  color: var(--dashboard-primary, #b85a62);
}

.ingredient-copy {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 3px;
}

.ingredient-copy strong,
.ingredient-copy span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ingredient-copy strong {
  color: var(--dashboard-text-strong, #302a2a);
  font-size: 14px;
}

.ingredient-copy span,
.ingredient-card code {
  color: var(--dashboard-text-muted, #887e7e);
  font-size: 11px;
}

.ingredient-card code {
  max-width: 58px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cook-way-list {
  display: flex;
  max-height: 450px;
  padding: 10px;
  flex-direction: column;
  gap: 4px;
  overflow: auto;
}

.cook-way-item {
  display: flex;
  padding: 10px 9px;
  flex-direction: column;
  gap: 3px;
  border-radius: 9px;
}

.cook-way-item:nth-child(odd) {
  background: var(--dashboard-surface-soft, #faf6f5);
}

.cook-way-item strong {
  color: var(--dashboard-text, #453d3d);
  font-size: 13px;
}

.cook-way-item span {
  color: var(--dashboard-text-muted, #817777);
  font-size: 11px;
  line-height: 1.5;
}

.state-row {
  display: grid;
  min-height: 150px;
  padding: 20px;
  place-items: center;
  color: var(--dashboard-text-muted, #817777);
  font-size: 13px;
}

.state-row.compact {
  min-height: 80px;
}

.state-row.error,
.dialog-error {
  color: #bd3f4e;
}

.notice-row {
  margin: -8px 0 0;
  padding: 10px 13px;
  border-radius: 10px;
  color: #267455;
  background: rgba(67, 167, 124, .12);
  font-size: 13px;
  font-weight: 700;
}

.modal-backdrop {
  position: fixed;
  z-index: 1000;
  inset: 0;
  display: grid;
  padding: 24px;
  place-items: center;
  background: rgba(23, 18, 18, .42);
  backdrop-filter: blur(5px);
}

.ingredient-dialog {
  width: min(620px, 100%);
  max-height: min(760px, calc(100vh - 48px));
  padding: 24px;
  overflow: auto;
  border-radius: 20px;
  background: var(--dashboard-surface, #fff);
  box-shadow: 0 24px 70px rgba(32, 18, 18, .25);
}

.dialog-header {
  margin-bottom: 20px;
}

.dialog-header h3 {
  font-size: 22px;
}

.dialog-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.dialog-field {
  display: flex;
  margin-bottom: 15px;
  flex-direction: column;
  gap: 7px;
}

.dialog-field > span,
.icon-picker-field legend {
  color: var(--dashboard-text, #433b3b);
  font-size: 12px;
  font-weight: 800;
}

.dialog-field input,
.dialog-field select {
  min-height: 42px;
  padding: 0 12px;
  border: 1px solid var(--dashboard-border-soft, #ded5d5);
  border-radius: 10px;
  outline: 0;
  color: var(--dashboard-text, #393232);
  background: var(--dashboard-surface, #fff);
}

.dialog-field input:focus,
.dialog-field select:focus {
  border-color: var(--dashboard-primary, #b85a62);
}

.icon-picker-field {
  margin: 4px 0 16px;
  padding: 0;
  border: 0;
}

.icon-picker-field legend {
  margin-bottom: 9px;
}

.icon-picker-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(88px, 1fr));
  gap: 7px;
  max-height: 238px;
  padding: 8px;
  overflow: auto;
  border: 1px solid var(--dashboard-border-soft, #e3dbdb);
  border-radius: 12px;
  background: var(--dashboard-surface-soft, #faf7f6);
}

.icon-picker-grid button {
  display: flex;
  min-width: 0;
  padding: 8px 5px;
  align-items: center;
  flex-direction: column;
  gap: 5px;
  border: 1px solid transparent;
  border-radius: 9px;
  color: var(--dashboard-text-muted, #746b6b);
  background: transparent;
  cursor: pointer;
  font-size: 10px;
}

.icon-picker-grid button.selected {
  border-color: var(--dashboard-primary, #b85a62);
  color: var(--dashboard-primary, #b85a62);
  background: var(--dashboard-surface, #fff);
  box-shadow: 0 4px 12px rgba(90, 50, 50, .08);
}

.icon-preview {
  width: 38px;
  height: 38px;
}

.icon-picker-grid button > span:last-child {
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dialog-error {
  margin: 0 0 14px;
  font-size: 12px;
}

.dialog-actions {
  justify-content: flex-end;
}

.secondary-button {
  min-height: 42px;
  padding: 0 18px;
  color: var(--dashboard-text, #4b4343);
  background: var(--dashboard-surface-soft, #f3eeee);
  font-weight: 750;
}

@media (max-width: 900px) {
  .library-layout {
    grid-template-columns: 1fr;
  }

  .cook-way-panel {
    order: -1;
  }

  .cook-way-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    max-height: 220px;
  }
}

@media (max-width: 660px) {
  .ingredient-header,
  .toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .search-field,
  .select-field,
  .search-field input,
  .select-field select {
    max-width: none;
  }

  .ingredient-type-tabs button {
    flex: 1;
  }

  .refresh-button {
    width: 100%;
  }

  .dialog-grid {
    grid-template-columns: 1fr;
    gap: 0;
  }
}
</style>
