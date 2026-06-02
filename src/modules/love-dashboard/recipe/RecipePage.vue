<template>
  <div class="recipe-page">
    <div class="main-layout">
      <aside class="category-sidebar">
        <div class="sidebar-header">
          <h2 class="sidebar-title">分类</h2>
          <p class="sidebar-subtitle">按餐次浏览</p>
        </div>

        <nav class="category-menu">
          <button
            v-for="category in categories"
            :key="category.key"
            type="button"
            class="menu-item"
          >
            <span class="material-symbols-outlined">{{ category.icon }}</span>
            <span>{{ category.label }}</span>
          </button>
        </nav>

        <div class="sidebar-action">
          <button class="add-recipe-btn" type="button">
            <span class="material-symbols-outlined">add</span>
            添加新食谱
          </button>
          <button class="add-category-btn" type="button">
            <span class="material-symbols-outlined">category</span>
            添加新分类
          </button>
        </div>

        <div class="sidebar-footer">
          <button type="button" class="menu-item">
            <span class="material-symbols-outlined">menu_book</span>
            <span>我的收藏</span>
          </button>
          <button type="button" class="menu-item" @click="openSettings">
            <span class="material-symbols-outlined">settings</span>
            <span>设置</span>
          </button>
        </div>
      </aside>

      <main class="content-area">
        <div class="content-wrapper" :class="{ 'content-wrapper-wide': isWideView }">
          <header class="page-header" v-if="currentView === 'timeline'">
            <h1 class="page-title">食谱时间轴</h1>
            <p class="page-subtitle">您的烹饪之旅，按天有序呈现。</p>
          </header>

          <RecipeSettingsPage
            v-if="currentView === 'settings'"
            :settings="settings"
          />

          <RecipeDetailPage
            v-else-if="selectedRecipe"
            :recipe="selectedRecipe"
            @close="closeRecipeDetail"
          />

          <div v-else>
            <div class="timeline-container">
              <section class="day-section">
                <div class="day-header">
                  <div class="day-badge" :class="{ today: todayData.isToday }">
                    {{ todayData.isToday ? '今天' : '' }}
                  </div>
                  <h2 class="day-date">{{ todayData.date }}</h2>
                </div>

                <div
                  v-for="recipe in todayData.recipes"
                  :key="recipe.id"
                  class="timeline-entry"
                >
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
              </section>
            </div>

            <section class="day-section yesterday">
              <div class="day-header">
                <div class="day-badge">昨天</div>
                <h2 class="day-date">{{ yesterdayData.date }}</h2>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import RecipeCard from './components/RecipeCard.vue'
import RecipeDetailPage from './RecipeDetailPage.vue'
import RecipeSettingsPage from './RecipeSettingsPage.vue'
import { RECIPE_DATA, RECIPE_CATEGORIES, RECIPE_SETTINGS } from './mock/recipeData.js'

const todayData = ref(RECIPE_DATA.today)
const yesterdayData = ref(RECIPE_DATA.yesterday)
const categories = ref(RECIPE_CATEGORIES)
const selectedRecipe = ref(null)
const currentView = ref('timeline')
const settings = ref({ ...RECIPE_SETTINGS })

const isWideView = computed(() => currentView.value === 'settings' || !!selectedRecipe.value)

const updateFavorite = (recipeId, isFavorite) => {
  const recipe = todayData.value.recipes.find((item) => item.id === recipeId)
  if (recipe) recipe.isFavorite = isFavorite
}

const toggleIngredient = (recipeId, ingredientIndex) => {
  const recipe = todayData.value.recipes.find((item) => item.id === recipeId)
  if (recipe && recipe.ingredients[ingredientIndex]) {
    recipe.ingredients[ingredientIndex].checked = !recipe.ingredients[ingredientIndex].checked
  }
}

const openRecipeDetail = (recipe) => {
  currentView.value = 'detail'
  selectedRecipe.value = recipe
}

const closeRecipeDetail = () => {
  currentView.value = 'timeline'
  selectedRecipe.value = null
}

const openSettings = () => {
  selectedRecipe.value = null
  currentView.value = 'settings'
}
</script>

<style scoped>
.recipe-page {
  min-height: 100%;
  background-color: #fff8f6;
  color: #1d1b1a;
  -webkit-font-smoothing: antialiased;
}

.material-symbols-outlined {
  font-family: 'Material Symbols Outlined';
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  font-size: 24px;
  line-height: 1;
  display: inline-block;
  white-space: nowrap;
  direction: ltr;
  -webkit-font-feature-settings: 'liga';
  -webkit-font-smoothing: antialiased;
}

.main-layout {
  display: flex;
  min-height: 100%;
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
  top: 0;
  height: calc(100vh - 64px);
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
  font-size: 16px;
  line-height: 24px;
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

.menu-item:hover {
  background-color: #eee7e5;
}

.menu-item span:last-child {
  font-size: 14px;
  line-height: 20px;
  letter-spacing: 0.05em;
  font-weight: 600;
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
  letter-spacing: 0.05em;
  font-weight: 600;
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
  padding: 24px 40px 24px 24px;
  overflow-y: auto;
  height: calc(100vh - 64px);
}

.content-wrapper {
  max-width: 896px;
}

.content-wrapper-wide {
  max-width: 1240px;
}

.page-header {
  margin-bottom: 48px;
}

.page-title {
  margin: 0 0 8px;
  font-family: 'Playfair Display', serif;
  font-size: 48px;
  line-height: 56px;
  letter-spacing: -0.02em;
  font-weight: 700;
  color: #9a4024;
}

.page-subtitle {
  margin: 0;
  font-size: 18px;
  line-height: 28px;
  color: #56423d;
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

.day-section.yesterday {
  opacity: 0.6;
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
  background-color: #e8e1df;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #56423d;
  font-size: 14px;
  line-height: 20px;
  letter-spacing: 0.05em;
  font-weight: 600;
}

.day-badge.today {
  background-color: #ba5839;
  color: #fffbff;
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
  .category-sidebar {
    display: none;
  }

  .content-area {
    padding: 24px 20px;
  }

  .page-title {
    font-size: 32px;
    line-height: 40px;
  }
}
</style>
