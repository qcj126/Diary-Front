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
  gap: 0.35rem;
  height: 100%;
  overflow-y: auto;
  padding: 0;
  color: var(--dashboard-text, #1c1b1b);
}

.category-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.category-item-wrapper {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.add-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 1px solid var(--dashboard-border-soft, rgba(196, 199, 199, 0.56));
  border-radius: 8px;
  background: var(--dashboard-surface-soft, #f7f3f2);
  color: var(--dashboard-accent, #1c1b1a);
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, color 0.2s, transform 0.2s;
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
  border-color: var(--dashboard-accent, #1c1b1a);
  background: var(--dashboard-accent, #1c1b1a);
  color: var(--dashboard-accent-contrast, #ffffff);
  transform: translateY(-1px);
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
  gap: 0.45rem;
  flex: 0 1 auto;
  width: fit-content;
  max-width: 100%;
  min-width: 0;
  min-height: 32px;
  padding: 0.38rem 0.55rem;
  border: 1px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, color 0.2s, transform 0.2s;
  background: transparent;
  color: var(--dashboard-text-muted, #5c5f61);
}

.category-item:hover {
  border-color: var(--dashboard-border-soft, rgba(196, 199, 199, 0.56));
  background: var(--dashboard-hover, #e0e3e5);
  color: var(--dashboard-text, #1c1b1b);
}

.category-item.active {
  border-color: var(--dashboard-accent, #1c1b1a);
  background: var(--dashboard-accent, #1c1b1a);
  color: var(--dashboard-accent-contrast, #ffffff);
  font-weight: 700;
}

.category-icon {
  display: grid;
  width: 22px;
  height: 22px;
  place-items: center;
  border-radius: 6px;
  background: var(--dashboard-surface-muted, #f1edec);
  color: var(--dashboard-text, #1c1b1b);
  font-size: 0.95rem;
  flex-shrink: 0;
}

.category-item.active .category-icon {
  background: rgba(255, 255, 255, 0.16);
  color: inherit;
}

.category-label {
  min-width: 0;
  font-size: 0.82rem;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.subcategories {
  margin: 0.15rem 0 0.25rem 0.65rem;
  padding-left: 0.45rem;
  border-left: 1px solid var(--dashboard-border-soft, rgba(196, 199, 199, 0.56));
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  width: fit-content;
  max-width: calc(100% - 0.8rem);
}

.subcategory-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  width: fit-content;
  max-width: 112px;
  min-height: 28px;
  padding: 0.28rem 0.38rem;
  border: 1px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, color 0.2s;
  font-size: 0.8rem;
  background: transparent;
  color: var(--dashboard-text-muted, #5c5f61);
}

.subcategory-item:hover {
  border-color: var(--dashboard-border-soft, rgba(196, 199, 199, 0.56));
  background: var(--dashboard-surface-soft, #f7f3f2);
  color: var(--dashboard-text, #1c1b1b);
}

.subcategory-item.active {
  border-color: var(--dashboard-accent, #1c1b1a);
  background: var(--dashboard-surface-muted, #f1edec);
  color: var(--dashboard-text-strong, #000000);
  font-weight: 700;
}

.subcategory-icon {
  font-size: 1rem;
  flex-shrink: 0;
}

.subcategory-label {
  min-width: 0;
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
  background: var(--dashboard-border, #c4c7c7);
  border-radius: 2px;
}

.category-nav::-webkit-scrollbar-thumb:hover {
  background: var(--dashboard-text-muted, #5c5f61);
}
</style>
