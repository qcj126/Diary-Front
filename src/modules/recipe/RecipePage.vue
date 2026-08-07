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
          <div
            v-for="category in categories"
            :key="category.key"
            class="category-row"
            :class="{ active: activeCategory === category.value }"
          >
            <button type="button" class="menu-item category-select-button" @click="selectCategory(category.value)">
              <img v-if="isIconUrl(category.icon)" class="category-image-icon" :src="category.icon" alt="" />
              <span v-else class="material-symbols-outlined">{{ category.icon }}</span>
              <span>{{ category.label }}</span>
            </button>
            <label v-if="category.id !== null" class="category-check" :aria-label="`选择${category.label}`">
              <input
                type="checkbox"
                :checked="selectedCategoryIds.includes(category.id)"
                @change="toggleCategorySelection(category.id)"
              />
              <span></span>
            </label>
          </div>
        </nav>

        <div class="sidebar-action">
          <button class="delete-category-btn" type="button" @click="requestDeleteCategories">
            <span class="material-symbols-outlined">delete</span>
            删除分类
          </button>
          <button class="edit-category-btn" type="button" @click="requestUpdateCategory">
            <span class="material-symbols-outlined">edit</span>
            修改分类
          </button>
          <button class="add-category-btn" type="button" @click="addCategory">
            <span class="material-symbols-outlined">add_circle</span>
            添加分类
          </button>
          <button class="add-recipe-btn" type="button" @click="createDraftRecipe">
            <span class="material-symbols-outlined">add</span>
            添加食谱
          </button>
        </div>
      </aside>

      <main class="content-area">
        <div class="content-wrapper" :class="{ 'content-wrapper-wide': isWideView }">
          <section class="recipe-toolbar" v-if="currentView === 'timeline'">
            <div class="recipe-actions">
              <button type="button" class="primary" @click="createDraftRecipe">
                <span class="material-symbols-outlined">add</span>
                增
              </button>
              <button type="button" @click="requestDeleteCategories">
                <span class="material-symbols-outlined">delete</span>
                删
              </button>
              <button type="button" @click="requestUpdateCategory">
                <span class="material-symbols-outlined">edit</span>
                改
              </button>
              <button type="button" @click="recipeQueryPanelOpen = !recipeQueryPanelOpen">
                <span class="material-symbols-outlined">search</span>
                查
              </button>
            </div>

            <form v-if="recipeQueryPanelOpen" class="search-row" @submit.prevent="loadRecipes">
              <input v-model.trim="keyword" type="text" placeholder="关键字" />
              <button
                type="button"
                class="red-heart-query-button"
                :class="{ active: redHeart === 1 }"
                aria-label="红心"
                title="红心"
                @click="toggleRedHeartQuery"
              >
                <span class="material-symbols-outlined">favorite</span>
              </button>
              <button type="submit">搜索</button>
              <button type="button" @click="resetRecipeQuery">重置</button>
            </form>
          </section>

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
      <form class="category-dialog" @submit.prevent="saveCategory">
        <header class="dialog-header">
          <h2>{{ categoryDialogMode === 'edit' ? '修改分类' : '添加新分类' }}</h2>
          <button class="dialog-icon-button" type="button" @click="closeCategoryDialog">
            <span class="material-symbols-outlined">close</span>
          </button>
        </header>

        <label class="dialog-field">
          <span>分类名称</span>
          <input v-model.trim="categoryDraft.label" type="text" placeholder="例如：轻食" />
        </label>

        <fieldset class="dialog-field icon-picker">
          <span>图标</span>
          <div v-if="iconLoading" class="icon-picker-status">图标加载中...</div>
          <div v-else-if="!categoryIcons.length" class="icon-picker-status">暂无可选图标</div>
          <div v-else class="icon-grid">
            <button
              v-for="icon in categoryIcons"
              :key="icon.id ?? icon.label"
              type="button"
              class="icon-option"
              :class="{ active: String(categoryDraft.iconId) === String(icon.id) }"
              :title="icon.label"
              @click="selectCategoryIcon(icon)"
            >
              <img v-if="isIconUrl(icon.icon)" :src="icon.icon" alt="" />
              <span v-else class="material-symbols-outlined">{{ icon.icon }}</span>
            </button>
          </div>
        </fieldset>

        <div v-if="categoryDialogError" class="dialog-error">{{ categoryDialogError }}</div>

        <footer class="dialog-actions category-add-actions">
          <button class="dialog-secondary-button" type="button" @click="closeCategoryDialog">取消</button>
          <button class="dialog-primary-button" type="submit" :disabled="categorySaving">
            {{ categorySaving ? '保存中...' : '保存' }}
          </button>
        </footer>
      </form>
    </div>

    <div v-if="categoryAlertOpen" class="modal-backdrop" @click.self="closeCategoryAlert">
      <section class="category-dialog message-dialog">
        <header class="dialog-header">
          <h2>提示</h2>
          <button class="dialog-icon-button" type="button" @click="closeCategoryAlert">
            <span class="material-symbols-outlined">close</span>
          </button>
        </header>

        <p class="dialog-message">{{ categoryAlertMessage }}</p>

        <footer class="dialog-actions">
          <button class="dialog-primary-button" type="button" @click="closeCategoryAlert">知道了</button>
        </footer>
      </section>
    </div>

    <div v-if="deleteCategoryDialogOpen" class="modal-backdrop" @click.self="closeDeleteCategoryDialog">
      <section class="category-dialog message-dialog">
        <header class="dialog-header">
          <h2>删除分类</h2>
          <button class="dialog-icon-button" type="button" @click="closeDeleteCategoryDialog">
            <span class="material-symbols-outlined">close</span>
          </button>
        </header>

        <p class="dialog-message">确定删除分类？</p>

        <footer class="dialog-actions split">
          <button class="dialog-secondary-button" type="button" @click="closeDeleteCategoryDialog">取消</button>
          <button class="dialog-primary-button" type="button" :disabled="categoryDeleting" @click="confirmDeleteCategories">
            {{ categoryDeleting ? '保存中...' : '保存' }}
          </button>
        </footer>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import RecipeCard from './components/RecipeCard.vue'
import RecipeDetailPage from './RecipeDetailPage.vue'
import {
  addRecipeCategory,
  addRecipe,
  deleteRecipe,
  deleteRecipeCategories,
  normalizeRecipe,
  queryRecipeIcons,
  queryRecipeCategories,
  queryRecipes,
  updateRecipe,
  updateRecipeCategory,
} from './api/recipe.js'
import { RECIPE_DATA, RECIPE_CATEGORIES } from './mock/recipeData.js'

const todayData = ref(RECIPE_DATA.today)
const categories = ref(
  RECIPE_CATEGORIES.map((category) => ({
    ...category,
    id: category.value,
  })),
)
const selectedRecipe = ref(null)
const currentView = ref('timeline')
const recipeLoading = ref(false)
const recipeSaving = ref(false)
const categorySaving = ref(false)
const categoryDeleting = ref(false)
const iconLoading = ref(false)
const recipeError = ref('')
const recipeNotice = ref('')
const keyword = ref('')
const recipeQueryPanelOpen = ref(false)
const activeCategory = ref(null)
const redHeart = ref(0)
const selectedCategoryIds = ref([])
const categoryDialogOpen = ref(false)
const categoryDialogMode = ref('add')
const categoryDialogError = ref('')
const categoryAlertOpen = ref(false)
const categoryAlertMessage = ref('请选择分类')
const deleteCategoryDialogOpen = ref(false)
const categoryDraft = ref({
  categoryId: null,
  label: '',
  iconId: '',
  icon: '',
})
const categoryIcons = ref([])
const RECIPE_MENU_NAME = '厨房创食记'

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
      redHeart: redHeart.value,
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

function isIconUrl(icon) {
  return /^(https?:)?\/\//i.test(String(icon ?? '')) || String(icon ?? '').startsWith('data:')
}

async function loadCategories() {
  try {
    const result = await queryRecipeCategories()
    if (!result.length) return

    categories.value = [
      { key: 'all', label: '全部', icon: 'restaurant_menu', value: null, id: null },
      ...result,
    ]
    selectedCategoryIds.value = selectedCategoryIds.value.filter((id) =>
      result.some((category) => String(category.id) === String(id)),
    )
    if (
      activeCategory.value !== null &&
      !result.some((category) => String(category.value) === String(activeCategory.value))
    ) {
      activeCategory.value = null
    }
  } catch (error) {
    console.error(error)
    recipeError.value = error instanceof Error ? `${error.message}，当前显示本地分类。` : '分类加载失败，当前显示本地分类。'
  }
}

function selectCategory(value) {
  activeCategory.value = value
  currentView.value = 'timeline'
  selectedRecipe.value = null
  loadRecipes()
}

function toggleCategorySelection(categoryId) {
  const id = Number(categoryId)
  if (!Number.isFinite(id)) return
  selectedCategoryIds.value = selectedCategoryIds.value.includes(id)
    ? selectedCategoryIds.value.filter((item) => item !== id)
    : [...selectedCategoryIds.value, id]
}

function requestDeleteCategories() {
  if (!selectedCategoryIds.value.length) {
    categoryAlertMessage.value = '请选择分类'
    categoryAlertOpen.value = true
    return
  }
  deleteCategoryDialogOpen.value = true
}

function resetRecipeQuery() {
  keyword.value = ''
  redHeart.value = 0
  loadRecipes()
}

function toggleRedHeartQuery() {
  redHeart.value = redHeart.value === 1 ? 0 : 1
}

function getSelectedEditableCategory() {
  const [categoryId] = selectedCategoryIds.value
  return categories.value.find((category) => String(category.id) === String(categoryId))
}

async function requestUpdateCategory() {
  if (!selectedCategoryIds.value.length) {
    categoryAlertMessage.value = '请选择分类'
    categoryAlertOpen.value = true
    return
  }

  if (selectedCategoryIds.value.length > 1) {
    categoryAlertMessage.value = '请选择一个分类'
    categoryAlertOpen.value = true
    return
  }

  const category = getSelectedEditableCategory()
  if (!category) {
    categoryAlertMessage.value = '请选择分类'
    categoryAlertOpen.value = true
    return
  }

  categoryDialogMode.value = 'edit'
  categoryDraft.value = {
    categoryId: category.id,
    label: category.label ?? '',
    iconId: category.iconId ?? '',
    icon: category.icon ?? '',
  }
  categoryDialogError.value = ''
  categoryDialogOpen.value = true
  await loadCategoryIcons(false)
}

function closeCategoryAlert() {
  categoryAlertOpen.value = false
}

function closeDeleteCategoryDialog() {
  if (categoryDeleting.value) return
  deleteCategoryDialogOpen.value = false
}

async function confirmDeleteCategories() {
  if (!selectedCategoryIds.value.length) {
    deleteCategoryDialogOpen.value = false
    categoryAlertOpen.value = true
    return
  }

  categoryDeleting.value = true
  recipeError.value = ''

  try {
    const ids = [...selectedCategoryIds.value]
    await deleteRecipeCategories(ids)
    selectedCategoryIds.value = []
    deleteCategoryDialogOpen.value = false
    if (ids.some((id) => String(id) === String(activeCategory.value))) {
      activeCategory.value = null
    }
    showNotice('分类已删除')
    await loadCategories()
    await loadRecipes()
  } catch (error) {
    console.error(error)
    recipeError.value = error instanceof Error ? error.message : '删除分类失败'
  } finally {
    categoryDeleting.value = false
  }
}

async function addCategory() {
  categoryDialogMode.value = 'add'
  categoryDraft.value = {
    categoryId: null,
    label: '',
    iconId: '',
    icon: '',
  }
  categoryDialogError.value = ''
  categoryDialogOpen.value = true
  await loadCategoryIcons(true)
}

function closeCategoryDialog() {
  if (categorySaving.value) return
  categoryDialogOpen.value = false
  categoryDialogError.value = ''
}

async function loadCategoryIcons(selectDefault = true) {
  iconLoading.value = true
  categoryDialogError.value = ''

  try {
    categoryIcons.value = await queryRecipeIcons(RECIPE_MENU_NAME)
    const firstIcon = categoryIcons.value[0]
    if (selectDefault && firstIcon) selectCategoryIcon(firstIcon)
  } catch (error) {
    console.error(error)
    categoryIcons.value = []
    categoryDialogError.value = error instanceof Error ? error.message : '图标查询失败'
  } finally {
    iconLoading.value = false
  }
}

function selectCategoryIcon(icon) {
  categoryDraft.value = {
    ...categoryDraft.value,
    iconId: icon.id,
    icon: icon.icon,
  }
}

async function saveCategory() {
  const label = categoryDraft.value.label.trim()
  const iconId = categoryDraft.value.iconId

  if (!label) {
    categoryDialogError.value = '请填写分类名称'
    return
  }

  if (iconId === '' || iconId === null || iconId === undefined) {
    categoryDialogError.value = '请选择分类图标'
    return
  }

  categorySaving.value = true
  categoryDialogError.value = ''

  try {
    if (categoryDialogMode.value === 'edit') {
      await updateRecipeCategory({
        categoryId: categoryDraft.value.categoryId,
        categoryName: label,
        iconId,
      })
      showNotice('分类已修改')
    } else {
      await addRecipeCategory({
        categoryName: label,
        iconId,
      })
      showNotice('分类已新增')
    }
    categoryDialogOpen.value = false
    categoryDialogError.value = ''
    await loadCategories()
  } catch (error) {
    console.error(error)
    categoryDialogError.value =
      error instanceof Error
        ? error.message
        : categoryDialogMode.value === 'edit'
          ? '修改分类失败'
          : '新增分类失败'
  } finally {
    categorySaving.value = false
  }
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

onMounted(async () => {
  await loadCategories()
  await loadRecipes()
})
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

.category-image-icon,
.icon-option img {
  width: 24px;
  height: 24px;
  object-fit: contain;
  flex: 0 0 24px;
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

.category-row {
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: 8px;
  transition: background-color 0.2s ease;
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

.category-select-button {
  flex: 1;
  min-width: 0;
}

.category-row:hover,
.category-row.active,
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

.category-check {
  width: 34px;
  height: 34px;
  margin-right: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.category-check input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.category-check span {
  width: 18px;
  height: 18px;
  border: 1px solid rgba(154, 64, 36, 0.58);
  border-radius: 4px;
  background: #fff;
  box-shadow: inset 0 0 0 2px #fff;
}

.category-check input:checked + span {
  background: #9a4024;
  border-color: #9a4024;
}

.sidebar-action {
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.add-recipe-btn,
.add-category-btn,
.edit-category-btn,
.delete-category-btn {
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

.edit-category-btn {
  background-color: #fff8f6;
  color: #9a4024;
  border: 1px solid rgba(154, 64, 36, 0.28);
}

.delete-category-btn {
  background-color: #f3ecea;
  color: #7a2f16;
  border: 1px solid rgba(154, 64, 36, 0.2);
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

.page-title {
  margin: 0;
  font-size: 1.75rem;
  line-height: 1.2;
  font-weight: 700;
  color: #1d1b1a;
}

.recipe-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
  padding: 16px;
  border: 1px solid rgba(220, 193, 185, 0.72);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 18px 40px rgba(50, 47, 46, 0.06);
}

.recipe-actions,
.search-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.recipe-actions button,
.search-row button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 38px;
  border: 0;
  border-radius: 12px;
  padding: 0 14px;
  background: #f3ecea;
  color: #56423d;
  cursor: pointer;
  font-weight: 800;
  transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
}

.recipe-actions button:hover,
.search-row button:hover {
  transform: translateY(-1px);
}

.recipe-actions .primary,
.search-row button[type='submit'] {
  background: #9a4024;
  color: #ffffff;
}

.red-heart-query-button {
  width: 42px;
  padding: 0;
}

.red-heart-query-button .material-symbols-outlined {
  color: #7a5a51;
  transition: color 0.18s ease, font-variation-settings 0.18s ease;
}

.red-heart-query-button.active .material-symbols-outlined {
  color: #ff0000;
  font-variation-settings: 'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24;
}

.search-row input {
  width: 78px;
  min-width: 0;
  border: 1px solid rgba(220, 193, 185, 0.9);
  border-radius: 12px;
  background: #ffffff;
  padding: 10px 12px;
  color: #1d1b1a;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.4;
  text-align: center;
  outline: none;
}

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

.icon-picker {
  margin: 0;
  padding: 0;
  border: none;
  min-width: 0;
}

.icon-picker-status {
  min-height: 52px;
  border: 1px dashed rgba(220, 193, 185, 0.9);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.7);
  color: #7a625c;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  line-height: 18px;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(44px, 1fr));
  gap: 8px;
  max-height: 168px;
  overflow-y: auto;
  padding: 2px;
}

.icon-option {
  width: 44px;
  height: 44px;
  border: 1px solid rgba(220, 193, 185, 0.9);
  border-radius: 8px;
  background: #ffffff;
  color: #7a2f16;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.icon-option.active {
  border-color: #9a4024;
  background: #f3ecea;
  box-shadow: inset 0 0 0 2px rgba(154, 64, 36, 0.16);
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

.category-add-actions {
  justify-content: space-between;
}

.dialog-actions.split {
  justify-content: space-between;
}

.dialog-message {
  margin: 2px 0 8px;
  color: #56423d;
  font-size: 16px;
  line-height: 24px;
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

.dialog-primary-button:disabled {
  cursor: not-allowed;
  opacity: 0.68;
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

  .recipe-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .recipe-actions,
  .search-row {
    justify-content: flex-start;
  }

  .search-row input {
    flex: 1 1 160px;
    width: auto;
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
