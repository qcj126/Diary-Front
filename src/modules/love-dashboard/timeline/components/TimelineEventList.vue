<template>
  <div class="event-list" ref="eventListRef">
    <!-- 事件网格 -->
    <div class="event-grid">
      <TimelineEventCard 
        v-for="event in currentPageEvents" 
        :key="event.id" 
        :event="event"
        :category-label="getCategoryLabel(event)"
        :event-icon="getEventIcon(event)"
      />
      
      <!-- 空状态 -->
      <div v-if="currentPageEvents.length === 0" class="empty-state">
        <p>暂无事件</p>
      </div>
    </div>
    
    <!-- 加载更多按钮 -->
    <div v-if="hasMore" class="load-more-area">
      <button class="load-more-btn" @click="handleLoadMore">
        加载更多 (还有 {{ totalEventsCount - currentPageEvents.length }} 条)
      </button>
    </div>
    
    <!-- 已加载全部提示 -->
    <div v-else-if="currentPageEvents.length > 0" class="load-more-area">
      <p class="all-loaded">已加载全部 {{ currentPageEvents.length }} 条事件</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import TimelineEventCard from './TimelineEventCard.vue'
import { EVENT_CATEGORIES } from '../constants/eventCategories.js'

const props = defineProps({
  currentPageEvents: {
    type: Array,
    required: true
  },
  currentPage: {
    type: Number,
    required: true
  },
  totalPages: {
    type: Number,
    required: true
  },
  hasMore: {
    type: Boolean,
    default: false
  },
  totalEventsCount: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['load-more'])

const eventListRef = ref(null)

function handleLoadMore() {
  emit('load-more')
}

function getCategoryLabel(event) {
  const category = EVENT_CATEGORIES.find(c => c.key === event.categoryKey)
  if (!category) return ''
  
  const subcategory = category.children?.find(sc => sc.key === event.subcategoryKey)
  return subcategory ? subcategory.label : category.label
}

function getEventIcon(event) {
  const category = EVENT_CATEGORIES.find(c => c.key === event.categoryKey)
  if (!category) return '📝'
  
  const subcategory = category.children?.find(sc => sc.key === event.subcategoryKey)
  return subcategory ? subcategory.icon : category.icon
}
</script>

<style scoped>
.event-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 100%;
  overflow-y: auto;
  padding-right: 0.5rem;
}

.event-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  flex: 1;
  min-height: 0;
}

.empty-state {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  border-radius: 10px;
  color: #64748b;
  font-size: 1rem;
}

.load-more-area {
  display: flex;
  justify-content: center;
  padding: 1rem;
  flex-shrink: 0;
}

.load-more-btn {
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.load-more-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
}

.load-more-btn:active {
  transform: translateY(0);
}

.all-loaded {
  margin: 0;
  color: #94a3b8;
  font-size: 0.9rem;
  text-align: center;
}

/* 滚动条样式 */
.event-list::-webkit-scrollbar {
  width: 6px;
}

.event-list::-webkit-scrollbar-track {
  background: transparent;
}

.event-list::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.event-list::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
