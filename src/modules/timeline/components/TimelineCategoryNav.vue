<template>
  <div class="category-nav">
    <!-- 全部选项 -->
    <div 
      class="category-item"
      :class="{ active: selectedCategory === 'all' }"
      @click="handleSelectCategory('all')"
    >
      <span class="category-icon">📋</span>
      <span class="category-label">全部</span>
    </div>

    <!-- 各大类 -->
    <div 
      v-for="category in categories" 
      :key="category.key"
      class="category-group"
    >
      <div 
        class="category-item-wrapper"
      >
        <div 
          class="category-item"
          :class="{ active: selectedCategory === category.key }"
          @click="handleSelectCategory(category.key)"
        >
          <span class="category-icon">{{ category.icon }}</span>
          <span class="category-label">{{ category.label }}</span>
        </div>
        <Transition name="add-btn-slide">
          <button 
            v-if="selectedCategory === category.key"
            class="add-btn"
            @click.stop="handleAddCategory(category)"
            title="新增卡片"
          >
            <span class="material-symbols-outlined">add</span>
          </button>
        </Transition>
      </div>

      <!-- 子类展开 -->
      <div 
        v-if="selectedCategory === category.key && category.children" 
        class="subcategories"
      >
        <div 
          v-for="child in category.children" 
          :key="child.key"
          class="subcategory-item"
          :class="{ active: selectedSubcategory === child.key }"
          @click.stop="handleSelectSubcategory(child.key)"
        >
          <span class="subcategory-icon">{{ child.icon }}</span>
          <span class="subcategory-label">{{ child.label }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  categories: {
    type: Array,
    required: true
  },
  selectedCategory: {
    type: String,
    required: true
  },
  selectedSubcategory: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['update:category', 'update:subcategory', 'add-category'])

function handleSelectCategory(categoryKey) {
  emit('update:category', categoryKey)
  emit('update:subcategory', null)
}

function handleSelectSubcategory(subcategoryKey) {
  emit('update:subcategory', subcategoryKey)
}

function handleAddCategory(category) {
  emit('add-category', category)
}

</script>

<style scoped>
.category-nav {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  height: 100%;
  overflow-y: auto;
  padding: 0.5rem 0;
}

.category-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.category-item-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.add-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 6px rgba(99, 102, 241, 0.3);
  flex-shrink: 0;
}

.add-btn-slide-enter-active,
.add-btn-slide-leave-active {
  overflow: hidden;
  transition:
    opacity 1s ease,
    transform 1s ease,
    width 1s ease,
    margin 1s ease;
}

.add-btn-slide-enter-from,
.add-btn-slide-leave-to {
  width: 0;
  margin-left: -0.5rem;
  opacity: 0;
  transform: translateX(-24px);
}

.add-btn-slide-enter-to,
.add-btn-slide-leave-from {
  width: 32px;
  margin-left: 0;
  opacity: 1;
  transform: translateX(0);
}

.add-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.add-btn:active {
  transform: scale(0.95);
}

.add-btn .material-symbols-outlined {
  font-size: 20px;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  background: transparent;
}

.category-item:hover {
  background: #f1f5f9;
}

.category-item.active {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(14, 165, 233, 0.15));
  color: #6366f1;
  font-weight: 600;
}

.category-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.category-label {
  font-size: 0.85rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.subcategories {
  margin-left: 1rem;
  margin-top: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.subcategory-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.85rem;
  background: transparent;
}

.subcategory-item:hover {
  background: #e2e8f0;
}

.subcategory-item.active {
  background: rgba(99, 102, 241, 0.2);
  color: #6366f1;
  font-weight: 500;
}

.subcategory-icon {
  font-size: 1rem;
  flex-shrink: 0;
}

.subcategory-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 滚动条样式 */
.category-nav::-webkit-scrollbar {
  width: 4px;
}

.category-nav::-webkit-scrollbar-track {
  background: transparent;
}

.category-nav::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 2px;
}

.category-nav::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
