<template>
  <div class="timeline-page">
    <!-- 顶部标题 -->
    <header class="timeline-header">
      <h1>恋爱时光轴</h1>
    </header>
    
    <!-- 轮播图区域 - 标题下方,从左向右平铺 -->
    <div class="carousel-section">
      <TimelineCarousel :events="recentEvents" />
    </div>
    
    <!-- 分类+事件列表区域 -->
    <div class="events-section">
      <!-- 左侧类别导航 -->
      <div class="category-nav-area">
        <TimelineCategoryNav 
          :categories="categories"
          :selected-category="selectedCategory"
          :selected-subcategory="selectedSubcategory"
          @update:category="selectCategory"
          @update:subcategory="selectSubcategory"
        />
      </div>
      
      <!-- 右侧事件列表 -->
      <div class="event-list-area">
        <TimelineEventList 
          :currentPageEvents="currentPageEvents"
          :currentPage="currentPage"
          :totalPages="totalPages"
          :hasMore="hasMore"
          :totalEventsCount="totalEventsCount"
          @load-more="loadMore"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { EVENT_CATEGORIES } from './constants/eventCategories.js'
import TimelineCarousel from './components/TimelineCarousel.vue'
import TimelineCategoryNav from './components/TimelineCategoryNav.vue'
import TimelineEventList from './components/TimelineEventList.vue'
import { useTimelineEvents } from './composables/useTimelineEvents.js'

const categories = EVENT_CATEGORIES

const {
  selectedCategory,
  selectedSubcategory,
  currentPage,
  recentEvents,
  currentPageEvents,
  totalPages,
  hasMore,
  nextPage,
  prevPage,
  loadMore,
  selectCategory,
  selectSubcategory,
  totalEventsCount
} = useTimelineEvents()
</script>

<style scoped>
.timeline-page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 100%;
}

.timeline-header {
  background: #fff;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.timeline-header h1 {
  margin: 0;
  font-size: 1.5rem;
  color: #0f172a;
  font-weight: 700;
}

/* 轮播图区域 - 横向全宽 */
.carousel-section {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  height: 280px;
  flex-shrink: 0;
}

/* 事件区域 - 左右布局 */
.events-section {
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 0.75rem;
  flex: 1;
  min-height: 0;
}

.category-nav-area {
  background: #fff;
  border-radius: 12px;
  padding: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.event-list-area {
  background: transparent;
  overflow: hidden;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .carousel-section {
    height: 240px;
  }
}

@media (max-width: 900px) {
  .events-section {
    grid-template-columns: 1fr;
  }
  
  .category-nav-area {
    max-height: 200px;
    overflow-y: auto;
  }
  
  .carousel-section {
    height: 200px;
  }
}
</style>
