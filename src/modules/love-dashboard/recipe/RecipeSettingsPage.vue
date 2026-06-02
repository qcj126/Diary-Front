<template>
  <section class="recipe-settings-page">
    <header class="settings-hero card-shell">
      <p class="eyebrow">Kitchen Preferences</p>
      <h1 class="hero-title">设置界面</h1>
      <p class="hero-description">
        参照 Stitch 设置页的排版节奏，将功能拆成纵向大卡片，保留温暖留白、奶油色层次和编辑感很强的面板布局。
      </p>
    </header>

    <section class="settings-stack">
      <article class="settings-card card-shell">
        <div class="card-head">
          <div>
            <p class="section-kicker">Servings</p>
            <h2>分量设置</h2>
          </div>
          <div class="head-pill">{{ settings.servingsPreset }}</div>
        </div>

        <div class="form-grid">
          <label class="field">
            <span class="field-label">默认份量</span>
            <select v-model="settings.servingsPreset">
              <option>2 人份</option>
              <option>4 人份</option>
              <option>6 人份</option>
            </select>
          </label>
          <label class="field">
            <span class="field-label">步骤排序</span>
            <select v-model="settings.stepSort">
              <option>按创作时间</option>
              <option>按最后修改</option>
              <option>手动排序优先</option>
            </select>
          </label>
          <label class="field field-wide">
            <span class="field-label">烹饪提示</span>
            <textarea v-model="settings.workflowTip" rows="4" />
          </label>
        </div>
      </article>

      <article class="settings-card card-shell">
        <div class="card-head">
          <div>
            <p class="section-kicker">Data</p>
            <h2>数据管理</h2>
          </div>
          <div class="head-pill">{{ settings.syncStatus }}</div>
        </div>

        <div class="data-layout">
          <div class="data-summary">
            <strong>最近备份</strong>
            <p>{{ settings.lastBackup }}</p>
          </div>
          <div class="action-row">
            <button class="primary-button" type="button">立即备份</button>
            <button class="secondary-button" type="button">导出数据</button>
            <button class="secondary-button" type="button">管理历史版本</button>
          </div>
        </div>
      </article>

      <article class="settings-card card-shell">
        <div class="card-head">
          <div>
            <p class="section-kicker">Recipes</p>
            <h2>管理食谱</h2>
          </div>
        </div>

        <div class="category-matrix">
          <label 
            v-for="(category, index) in categories" 
            :key="category.key"
            class="category-item"
          >
            <div class="category-info">
              <span class="material-symbols-outlined category-icon">{{ category.icon }}</span>
              <strong>{{ category.label }}</strong>
            </div>
            <input 
              v-model="selectedCategories" 
              :value="category.key" 
              type="checkbox" 
              class="toggle-input" 
            />
          </label>
        </div>

        <div class="category-actions">
          <button class="action-button add-category-btn" type="button" @click="addCategory">
            <span class="material-symbols-outlined">add</span>
            添加分类
          </button>
          <button class="action-button delete-category-btn" type="button" @click="deleteSelectedCategories">
            <span class="material-symbols-outlined">delete</span>
            删除分类
          </button>
        </div>
      </article>

      <article class="settings-card card-shell">
        <div class="card-head">
          <div>
            <p class="section-kicker">Categories</p>
            <h2>其他设置</h2>
          </div>
        </div>

        <div class="toggle-list">
          <label class="toggle-row">
            <div>
              <strong>固定食材列表滚动</strong>
              <p>查看步骤时让食材面板保持独立滚动。</p>
            </div>
            <input v-model="settings.stickyIngredients" type="checkbox" class="toggle-input" />
          </label>
          <label class="toggle-row">
            <div>
              <strong>主理人名称</strong>
              <p>用于标记这本厨房食谱簿的归属。</p>
            </div>
            <input v-model="settings.ownerName" type="text" class="compact-input" />
          </label>
          <label class="toggle-row toggle-row-textarea">
            <div>
              <strong>厨房简介</strong>
              <p>给分类页和设置页补充品牌说明。</p>
            </div>
            <textarea v-model="settings.bio" rows="4" class="compact-textarea" />
          </label>
        </div>
      </article>
    </section>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { RECIPE_CATEGORIES } from './mock/recipeData.js'

const props = defineProps({
  settings: {
    type: Object,
    required: true
  }
})

const categories = ref([...RECIPE_CATEGORIES])
const selectedCategories = ref([])

const addCategory = () => {
  const newKey = `category_${Date.now()}`
  categories.value.push({
    key: newKey,
    label: '新分类',
    icon: 'category'
  })
}

const deleteSelectedCategories = () => {
  if (selectedCategories.value.length === 0) {
    alert('请先选择要删除的分类')
    return
  }
  
  if (confirm(`确定要删除选中的 ${selectedCategories.value.length} 个分类吗？`)) {
    categories.value = categories.value.filter(
      cat => !selectedCategories.value.includes(cat.key)
    )
    selectedCategories.value = []
  }
}
</script>

<style scoped>
.recipe-settings-page {
  display: grid;
  gap: 28px;
  padding-bottom: 40px;
}

.card-shell {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(249, 242, 240, 0.94));
  border: 1px solid rgba(220, 193, 185, 0.78);
  border-radius: 32px;
  box-shadow:
    0 24px 48px rgba(50, 47, 46, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
}

.settings-hero,
.settings-card {
  padding: 30px;
}

.eyebrow,
.section-kicker {
  margin: 0 0 10px;
  color: #576a4d;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.hero-title,
.card-head h2 {
  margin: 0;
  font-family: 'Playfair Display', serif;
  color: #9a4024;
  line-height: 1;
}

.hero-title {
  font-size: clamp(2.8rem, 4vw, 4.6rem);
}

.hero-description {
  margin: 16px 0 0;
  max-width: 760px;
  color: #56423d;
  font-size: 1.02rem;
  line-height: 1.85;
}

.settings-stack {
  display: grid;
  gap: 22px;
}

.card-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 22px;
}

.head-pill {
  border-radius: 999px;
  padding: 10px 16px;
  background: #d4e9c5;
  color: #3a4c31;
  font-size: 0.9rem;
  font-weight: 700;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.field {
  display: grid;
  gap: 8px;
}

.field-wide {
  grid-column: 1 / -1;
}

.field-label {
  color: #56423d;
  font-size: 0.92rem;
  font-weight: 700;
}

.field select,
.field textarea,
.compact-input,
.compact-textarea {
  width: 100%;
  border: 1px solid rgba(220, 193, 185, 0.95);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.88);
  color: #1d1b1a;
  font: inherit;
  padding: 15px 16px;
}

.field textarea,
.compact-textarea {
  resize: vertical;
  min-height: 120px;
}

.field select:focus,
.field textarea:focus,
.compact-input:focus,
.compact-textarea:focus {
  outline: none;
  border-color: #9a4024;
  box-shadow: 0 0 0 3px rgba(154, 64, 36, 0.12);
}

.data-layout {
  display: grid;
  gap: 18px;
}

.data-summary {
  padding: 18px 20px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(220, 193, 185, 0.68);
}

.data-summary strong {
  display: block;
  margin-bottom: 8px;
  color: #1d1b1a;
}

.data-summary p,
.toggle-row p {
  margin: 0;
  color: #56423d;
  line-height: 1.7;
}

.action-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.toggle-list {
  display: grid;
  gap: 14px;
}

.toggle-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 18px;
  align-items: center;
  padding: 18px 20px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(220, 193, 185, 0.68);
}

.toggle-row-textarea {
  grid-template-columns: 1fr;
}

.toggle-row strong {
  display: block;
  margin-bottom: 6px;
  color: #1d1b1a;
}

.toggle-input {
  width: 22px;
  height: 22px;
  accent-color: #9a4024;
}

.primary-button,
.secondary-button {
  border: none;
  border-radius: 18px;
  padding: 14px 20px;
  font-weight: 700;
  cursor: pointer;
}

.primary-button {
  background: #9a4024;
  color: #ffffff;
}

.secondary-button {
  background: #f3ecea;
  color: #3a0a00;
}

.category-matrix {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.category-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 20px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(220, 193, 185, 0.68);
  cursor: pointer;
  transition: all 0.2s ease;
}

.category-item:hover {
  background: rgba(255, 255, 255, 0.95);
  border-color: #ba5839;
  transform: translateY(-2px);
}

.category-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.category-icon {
  color: #9a4024;
  font-size: 28px;
}

.category-item strong {
  color: #1d1b1a;
  font-size: 1rem;
}

.category-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.action-button {
  border: none;
  border-radius: 18px;
  padding: 14px 20px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.action-button:hover {
  transform: translateY(-1px);
}

.add-category-btn {
  background: #d4e9c5;
  color: #3a4c31;
}

.delete-category-btn {
  background: #f3ecea;
  color: #9a4024;
}

@media (max-width: 900px) {
  .form-grid,
  .toggle-row {
    grid-template-columns: 1fr;
  }

  .category-matrix {
    grid-template-columns: 1fr;
  }

  .settings-hero,
  .settings-card {
    padding: 24px;
  }
}
</style>
