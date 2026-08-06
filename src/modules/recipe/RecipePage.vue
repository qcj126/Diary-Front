<template>
  <div class="recipe-page">
    <header class="recipe-main-header">
      <h1 class="page-title">厨房创食记</h1>
    </header>

    <div class="main-layout">
      <aside class="category-sidebar">
        <div class="sidebar-header">
          <h2 class="sidebar-title">分类</h2>
          <p class="sidebar-subtitle">按食谱分类筛选</p>
        </div>

        <nav class="category-menu">
          <button
            v-for="category in categories"
            :key="category.key"
            type="button"
            class="menu-item"
            :class="{ active: activeCategory === category.value }"
            @click="selectCategory(category.value)"
          >
            <span class="material-symbols-outlined">{{ category.icon }}</span>
            <span>{{ category.label }}</span>
          </button>
        </nav>

        <div class="sidebar-action">
          <button class="add-recipe-btn" type="button" @click="createDraftRecipe">
            <span class="material-symbols-outlined">add</span>
            添加新食谱
          </button>
          <button class="add-category-btn" type="button" @click="addCategory">
            <span class="material-symbols-outlined">add_circle</span>
            添加新分类
          </button>
        </div>

        <div class="sidebar-footer">
          <button type="button" class="menu-item" @click="selectAnniversary">
            <span class="material-symbols-outlined">favorite</span>
            <span>红心食谱</span>
          </button>
        </div>
      </aside>

      <main class="content-area">
        <div class="content-wrapper" :class="{ 'content-wrapper-wide': isWideView }">
          <header class="page-header" v-if="currentView === 'timeline'">
            <form class="search-row" @submit.prevent="loadRecipes">
              <input v-model.trim="keyword" type="search" placeholder="搜索标题关键词" />
              <button type="submit">搜索</button>
            </form>
          </header>

          <RecipeDetailPage
            v-if="selectedRecipe"
            :recipe="selectedRecipe"
            :saving="recipeSaving"
            @close="closeRecipeDetail"
            @save="saveRecipe"
            @delete="removeRecipe"
          />

          <div v-else>
            <div v-if="recipeLoading" class="recipe-status-card">
              <span class="material-symbols-outlined">progress_activity</span>
              <span>食谱加载中...</span>
            </div>

            <div v-else-if="recipeError" class="recipe-status-card warning">
              <span class="material-symbols-outlined">cloud_off</span>
              <span>{{ recipeError }}</span>
              <button type="button" class="retry-button" @click="loadRecipes">重试</button>
            </div>

            <div v-if="recipeNotice" class="recipe-status-card success">
              <span class="material-symbols-outlined">check_circle</span>
              <span>{{ recipeNotice }}</span>
            </div>

            <div class="timeline-container">
              <section class="day-section">
                <div class="day-header">
                  <div class="day-badge today">今天</div>
                  <h2 class="day-date">{{ todayData.date }}</h2>
                </div>

                <div v-for="recipe in todayData.recipes" :key="recipe.id" class="timeline-entry">
                  <RecipeCard
                    :meal-type="recipe.mealType"
                    :duration="recipe.duration"
                    :title="recipe.title"
                    :image-url="recipe.imageUrl"
                    :ingredients="recipe.ingredients"
                    :steps="recipe.steps"
                    :is-favorite="recipe.isFavorite"
                    @update:is-favorite="(val) => updateFavorite(recipe.id, val)"
                    @toggle-ingredient="(index) => toggleIngredient(recipe.id, index)"
                    @viewRecipe="openRecipeDetail(recipe)"
                  />
                </div>

                <div v-if="!todayData.recipes.length && !recipeLoading" class="recipe-empty-card">
                  暂时还没有食谱。点击左侧“添加新食谱”创建一条，或确认后端 /recipe/query 是否已有数据。
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>

    <div v-if="categoryDialogOpen" class="modal-backdrop" @click.self="closeCategoryDialog">
      <form class="category-dialog" @submit.prevent="confirmAddCategory">
        <header class="dialog-header">
          <h2>添加新分类</h2>
          <button class="dialog-icon-button" type="button" @click="closeCategoryDialog">
            <span class="material-symbols-outlined">close</span>
          </button>
        </header>

        <label class="dialog-field">
          <span>分类名称</span>
          <input v-model.trim="categoryDraft.label" type="text" placeholder="例如：轻食" />
        </label>

        <label class="dialog-field">
          <span>图标</span>
          <input v-model.trim="categoryDraft.icon" type="text" placeholder="例如：restaurant" />
        </label>

        <div v-if="categoryDialogError" class="dialog-error">{{ categoryDialogError }}</div>

        <footer class="dialog-actions">
          <button class="dialog-secondary-button" type="button" @click="closeCategoryDialog">取消</button>
          <button class="dialog-primary-button" type="submit">确认添加</button>
        </footer>
      </form>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import RecipeCard from './components/RecipeCard.vue'
import RecipeDetailPage from './RecipeDetailPage.vue'
import { addRecipe, deleteRecipe, normalizeRecipe, queryRecipes, updateRecipe } from './api/recipe.js'
import { RECIPE_DATA, RECIPE_CATEGORIES } from './mock/recipeData.js'

const todayData = ref(RECIPE_DATA.today)
const categories = ref([...RECIPE_CATEGORIES])
const selectedRecipe = ref(null)
const currentView = ref('timeline')
const recipeLoading = ref(false)
const recipeSaving = ref(false)
const recipeError = ref('')
const recipeNotice = ref('')
const keyword = ref('')
const activeCategory = ref(null)
const anniversaryOnly = ref(null)
const categoryDialogOpen = ref(false)
const categoryDialogError = ref('')
const categoryDraft = ref({
  label: '',
  icon: '',
})

const isWideView = computed(() => !!selectedRecipe.value)

const formatToday = () =>
  new Intl.DateTimeFormat('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(new Date())

function showNotice(message) {
  recipeNotice.value = message
  window.setTimeout(() => {
    if (recipeNotice.value === message) recipeNotice.value = ''
  }, 2400)
}

async function loadRecipes() {
  recipeLoading.value = true
  recipeError.value = ''

  try {
    const result = await queryRecipes({
      pageIndex: 1,
      pageSize: 20,
      category: activeCategory.value,
      isAnniversary: anniversaryOnly.value,
      keyword: keyword.value,
    })

    todayData.value = {
      date: formatToday(),
      isToday: true,
      recipes: result.records,
    }
  } catch (error) {
    console.error(error)
    recipeError.value =
      error instanceof Error
        ? `${error.message}，当前显示本地示例数据。`
        : '食谱加载失败，当前显示本地示例数据。'
    todayData.value = { ...RECIPE_DATA.today, date: formatToday() }
  } finally {
    recipeLoading.value = false
  }
}

function selectCategory(value) {
  activeCategory.value = value
  anniversaryOnly.value = null
  currentView.value = 'timeline'
  selectedRecipe.value = null
  loadRecipes()
}

function selectAnniversary() {
  anniversaryOnly.value = anniversaryOnly.value === 1 ? null : 1
  currentView.value = 'timeline'
  selectedRecipe.value = null
  loadRecipes()
}

function addCategory() {
  categoryDraft.value = {
    label: '',
    icon: '',
  }
  categoryDialogError.value = ''
  categoryDialogOpen.value = true
}

function closeCategoryDialog() {
  categoryDialogOpen.value = false
  categoryDialogError.value = ''
}

function confirmAddCategory() {
  const label = categoryDraft.value.label.trim()
  const icon = categoryDraft.value.icon.trim()

  if (!label) {
    categoryDialogError.value = '请填写分类名称'
    return
  }

  const numericValues = categories.value
    .map((category) => category.value)
    .filter((value) => typeof value === 'number')
  const nextValue = numericValues.length ? Math.max(...numericValues) + 1 : 0

  categories.value.push({
    key: `custom_${Date.now()}`,
    label,
    icon: icon || 'category',
    value: nextValue,
  })

  closeCategoryDialog()
  selectCategory(nextValue)
}

function updateFavorite(recipeId, isFavorite) {
  const recipe = todayData.value.recipes.find((item) => item.id === recipeId)
  if (recipe) recipe.isFavorite = isFavorite
}

function toggleIngredient(recipeId, ingredientIndex) {
  const recipe = todayData.value.recipes.find((item) => item.id === recipeId)
  if (recipe && recipe.ingredients[ingredientIndex]) {
    recipe.ingredients[ingredientIndex].checked = !recipe.ingredients[ingredientIndex].checked
  }
}

function openRecipeDetail(recipe) {
  currentView.value = 'detail'
  selectedRecipe.value = recipe
}

function closeRecipeDetail() {
  currentView.value = 'timeline'
  selectedRecipe.value = null
}

function createDraftRecipe() {
  currentView.value = 'detail'
  selectedRecipe.value = normalizeRecipe({
    title: '新食谱',
    description: '',
    category: activeCategory.value ?? 0,
    mealType: 3,
    difficulty: 1,
    cookingTime: 30,
    servings: 1,
    status: 1,
    ingredients: [],
    steps: [],
  })
}

async function saveRecipe(recipe) {
  recipeSaving.value = true
  recipeError.value = ''

  try {
    if (recipe.recipeId) {
      await updateRecipe(recipe)
      showNotice('食谱已更新')
    } else {
      await addRecipe(recipe)
      showNotice('食谱已新增')
    }

    selectedRecipe.value = null
    currentView.value = 'timeline'
    await loadRecipes()
  } catch (error) {
    console.error(error)
    recipeError.value = error instanceof Error ? error.message : '保存食谱失败'
  } finally {
    recipeSaving.value = false
  }
}

async function removeRecipe(recipe) {
  if (!recipe.recipeId) return
  if (!window.confirm(`确定删除“${recipe.title}”吗？`)) return

  recipeSaving.value = true
  recipeError.value = ''

  try {
    await deleteRecipe(recipe.recipeId)
    selectedRecipe.value = null
    currentView.value = 'timeline'
    showNotice('食谱已删除')
    await loadRecipes()
  } catch (error) {
    console.error(error)
    recipeError.value = error instanceof Error ? error.message : '删除食谱失败'
  } finally {
    recipeSaving.value = false
  }
}

onMounted(loadRecipes)
</script>

<style scoped>
.recipe-page {
  --recipe-header-height: 72px;
  height: 100vh;
  min-height: 100%;
  background-color: #fff8f6;
  color: #1d1b1a;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  -webkit-font-smoothing: antialiased;
}

.recipe-main-header {
  position: sticky;
  top: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  flex: 0 0 var(--recipe-header-height);
  min-height: var(--recipe-header-height);
  padding: 0 2.5rem;
  background-color: #fff8f6;
  border-bottom: 1px solid rgba(220, 193, 185, 0.72);
}

.material-symbols-outlined {
  font-family: 'Material Symbols Outlined';
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  font-size: 24px;
  line-height: 1;
  display: inline-block;
  white-space: nowrap;
}

.main-layout {
  display: flex;
  flex: 1;
  min-height: 0;
}

.category-sidebar {
  width: 256px;
  padding: 24px 0;
  background-color: #f9f2f0;
  border-right: 1px solid #dcc1b9;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
  flex-shrink: 0;
  position: sticky;
  top: var(--recipe-header-height);
  height: calc(100vh - var(--recipe-header-height));
}

.sidebar-header {
  padding: 0 24px;
  margin-bottom: 16px;
}

.sidebar-title {
  margin: 0;
  font-family: 'Playfair Display', serif;
  font-size: 24px;
  line-height: 32px;
  color: #9a4024;
}

.sidebar-subtitle {
  margin: 8px 0 0;
  font-size: 15px;
  line-height: 22px;
  color: #56423d;
}

.category-menu,
.sidebar-footer {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0 16px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  color: #56423d;
  border-radius: 8px;
  border: none;
  background: transparent;
  width: 100%;
  cursor: pointer;
  text-align: left;
  transition: background-color 0.2s ease;
}

.menu-item:hover,
.menu-item.active {
  background-color: #eee7e5;
  color: #9a4024;
}

.menu-item span:last-child {
  font-size: 14px;
  line-height: 20px;
  font-weight: 700;
}

.sidebar-action {
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.add-recipe-btn,
.add-category-btn {
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 14px;
  line-height: 20px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  border: none;
  cursor: pointer;
}

.add-recipe-btn {
  background-color: #9a4024;
  color: #ffffff;
}

.add-category-btn {
  background-color: #ba5839;
  color: #ffffff;
}

.sidebar-footer {
  margin-top: auto;
}

.content-area {
  flex: 1;
  min-width: 0;
  padding: 1rem;
  overflow-y: auto;
  height: calc(100vh - var(--recipe-header-height));
}

.content-wrapper {
  max-width: 896px;
}

.content-wrapper-wide {
  max-width: 1240px;
}

.page-header {
  padding: 0;
  margin-bottom: 32px;
}

.page-title {
  margin: 0;
  font-size: 1.75rem;
  line-height: 1.2;
  font-weight: 700;
  color: #1d1b1a;
}

.search-row {
  display: flex;
  gap: 10px;
  max-width: 560px;
}

.search-row input {
  flex: 1;
  min-width: 0;
  border: 1px solid rgba(220, 193, 185, 0.9);
  border-radius: 8px;
  background: #ffffff;
  padding: 12px 14px;
  font: inherit;
}

.search-row button,
.retry-button {
  border: none;
  border-radius: 8px;
  padding: 10px 14px;
  background: #9a4024;
  color: #ffffff;
  cursor: pointer;
  font-weight: 700;
}

.timeline-container {
  position: relative;
}

.timeline-container::before {
  content: '';
  position: absolute;
  left: 24px;
  top: 0;
  bottom: 0;
  width: 2px;
  background-color: #dcc1b9;
  z-index: 0;
}

.day-section {
  margin-bottom: 48px;
}

.day-header {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.day-badge {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #ba5839;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fffbff;
  font-size: 14px;
  line-height: 20px;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.day-date {
  margin: 0;
  font-family: 'Playfair Display', serif;
  font-size: 32px;
  line-height: 40px;
  font-weight: 700;
  color: #1d1b1a;
}

.timeline-entry {
  margin-left: 48px;
  margin-bottom: 24px;
}

.recipe-status-card,
.recipe-empty-card {
  margin: 0 0 24px 48px;
  padding: 16px 18px;
  border: 1px solid rgba(220, 193, 185, 0.75);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.76);
  color: #56423d;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  line-height: 20px;
}

.recipe-status-card.warning {
  background: #fff4ed;
  color: #7a2f16;
}

.recipe-status-card.success {
  background: #eef8e9;
  color: #3a4c31;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(29, 27, 26, 0.38);
}

.category-dialog {
  width: min(420px, 100%);
  border: 1px solid rgba(220, 193, 185, 0.86);
  border-radius: 8px;
  background: #fff8f6;
  box-shadow: 0 24px 60px rgba(50, 47, 46, 0.22);
  padding: 22px;
  display: grid;
  gap: 16px;
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.dialog-header h2 {
  margin: 0;
  color: #1d1b1a;
  font-size: 20px;
  line-height: 28px;
}

.dialog-icon-button {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: #f3ecea;
  color: #7a2f16;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.dialog-field {
  display: grid;
  gap: 8px;
  color: #56423d;
  font-size: 14px;
  font-weight: 700;
}

.dialog-field input {
  width: 100%;
  border: 1px solid rgba(220, 193, 185, 0.9);
  border-radius: 8px;
  background: #ffffff;
  color: #1d1b1a;
  font: inherit;
  padding: 12px 14px;
}

.dialog-error {
  color: #b42318;
  font-size: 13px;
  line-height: 18px;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.dialog-secondary-button,
.dialog-primary-button {
  border: none;
  border-radius: 8px;
  padding: 10px 14px;
  cursor: pointer;
  font-weight: 700;
}

.dialog-secondary-button {
  background: #f3ecea;
  color: #56423d;
}

.dialog-primary-button {
  background: #9a4024;
  color: #ffffff;
}

.content-area::-webkit-scrollbar {
  width: 6px;
}

.content-area::-webkit-scrollbar-track {
  background: #f9f2f0;
}

.content-area::-webkit-scrollbar-thumb {
  background: #dcc1b9;
  border-radius: 3px;
}

@media (max-width: 768px) {
  .recipe-page {
    height: auto;
    min-height: 100vh;
    overflow: visible;
  }

  .recipe-main-header {
    padding: 0 1rem;
  }

  .category-sidebar {
    display: none;
  }

  .content-area {
    height: auto;
    padding: 1rem;
  }

  .page-title {
    font-size: 1.75rem;
    line-height: 1.2;
  }

  .timeline-entry,
  .recipe-status-card,
  .recipe-empty-card {
    margin-left: 0;
  }

  .timeline-container::before {
    display: none;
  }
}
</style>
