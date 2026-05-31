<template>
  <div class="recipe-page">
    <div class="main-layout">
      <!-- Category Sidebar -->
      <aside class="category-sidebar">
        <div class="sidebar-header">
          <h2 class="sidebar-title">分类</h2>
          <p class="sidebar-subtitle">按餐次浏览</p>
        </div>
        <nav class="category-menu">
          <a 
            v-for="category in categories" 
            :key="category.key"
            href="#" 
            class="menu-item"
          >
            <span class="material-symbols-outlined">{{ category.icon }}</span>
            <span>{{ category.label }}</span>
          </a>
        </nav>
        <div class="sidebar-action">
          <button class="add-recipe-btn">
            <span class="material-symbols-outlined">add</span>
            添加新食谱
          </button>
          <button class="add-category-btn">
            <span class="material-symbols-outlined">category</span>
            添加新分类
          </button>
        </div>
        <div class="sidebar-footer">
          <a href="#" class="menu-item">
            <span class="material-symbols-outlined">menu_book</span>
            <span>我的收藏</span>
          </a>
          <a href="#" class="menu-item">
            <span class="material-symbols-outlined">settings</span>
            <span>设置</span>
          </a>
        </div>
      </aside>

      <!-- Main Content Area -->
      <main class="content-area">
        <div class="content-wrapper">
          <header class="page-header">
            <h1 class="page-title">食谱时间轴</h1>
            <p class="page-subtitle">您的烹饪之旅，按天有序呈现。</p>
          </header>

          <!-- Timeline Section -->
          <div class="timeline-container">
            <!-- Day Group: Today -->
            <section class="day-section">
              <div class="day-header">
                <div class="day-badge" :class="{ 'today': todayData.isToday }">
                  {{ todayData.isToday ? '今天' : '' }}
                </div>
                <h2 class="day-date">{{ todayData.date }}</h2>
              </div>

              <!-- Recipe Entries -->
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
                />
              </div>
            </section>

            <!-- Day Group: Yesterday (Visual teaser) -->
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
import { ref } from 'vue'
import RecipeCard from './components/RecipeCard.vue'
import { RECIPE_DATA, RECIPE_CATEGORIES } from './mock/recipeData.js'

const todayData = ref(RECIPE_DATA.today)
const yesterdayData = ref(RECIPE_DATA.yesterday)
const categories = ref(RECIPE_CATEGORIES)

const updateFavorite = (recipeId, isFavorite) => {
  const recipe = todayData.value.recipes.find(r => r.id === recipeId)
  if (recipe) {
    recipe.isFavorite = isFavorite
  }
}

const toggleIngredient = (recipeId, ingredientIndex) => {
  const recipe = todayData.value.recipes.find(r => r.id === recipeId)
  if (recipe && recipe.ingredients[ingredientIndex]) {
    recipe.ingredients[ingredientIndex].checked = !recipe.ingredients[ingredientIndex].checked
  }
}
</script>

<style scoped>
.recipe-page {
  min-height: 100%;
  background-color: #fff8f6;
  color: #1d1b1a;
  -webkit-font-smoothing: antialiased;
}

/* Material Symbols */
.material-symbols-outlined {
  font-family: 'Material Symbols Outlined';
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  font-weight: normal;
  font-style: normal;
  font-size: 24px;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  white-space: nowrap;
  word-wrap: normal;
  direction: ltr;
  -webkit-font-feature-settings: 'liga';
  -webkit-font-smoothing: antialiased;
}

/* Main Layout */
.main-layout {
  display: flex;
  min-height: 100%;
}

/* Category Sidebar */
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
  flex-shrink: 0;
}

.sidebar-title {
  font-family: 'Playfair Display', serif;
  font-size: 24px;
  line-height: 32px;
  color: #9a4024;
}

.sidebar-subtitle {
  font-size: 16px;
  line-height: 24px;
  color: #56423d;
}

.category-menu {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0 16px;
  flex-shrink: 0;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  color: #56423d;
  text-decoration: none;
  transition: background-color 0.2s;
  border-radius: 8px;
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
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.add-recipe-btn {
  background-color: #9a4024;
  color: #ffffff;
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
  transition: transform 0.2s;
}

.add-recipe-btn:active {
  transform: scale(0.95);
}

.add-recipe-btn .material-symbols-outlined {
  font-size: 20px;
}

.add-category-btn {
  background-color: #ba5839;
  color: #ffffff;
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
  transition: transform 0.2s, background-color 0.2s;
}

.add-category-btn:hover {
  background-color: #9a4024;
}

.add-category-btn:active {
  transform: scale(0.95);
}

.add-category-btn .material-symbols-outlined {
  font-size: 20px;
}

.sidebar-footer {
  margin-top: auto;
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex-shrink: 0;
}

/* Content Area */
.content-area {
  flex: 1;
  min-width: 0;
  padding: 24px 40px 24px 24px;
  overflow-y: auto;
  height: calc(100vh - 64px);
}

.content-wrapper {
  max-width: 896px;
  margin: 0;
}

.page-header {
  margin-bottom: 48px;
}

.page-title {
  font-family: 'Playfair Display', serif;
  font-size: 48px;
  line-height: 56px;
  letter-spacing: -0.02em;
  font-weight: 700;
  color: #9a4024;
  margin-bottom: 8px;
}

.page-subtitle {
  font-size: 18px;
  line-height: 28px;
  color: #56423d;
}

/* Timeline */
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

/* Custom Scrollbar for Content Area */
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

.content-area::-webkit-scrollbar-thumb:hover {
  background: #89726c;
}

/* Responsive Design */
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