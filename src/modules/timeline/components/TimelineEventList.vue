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
        :selected="selectedEventIds.includes(String(event.id))"
        @select="handleSelectEvent"
        @toggle-selection="handleToggleSelection"
      />
      
      <!-- 空状态 -->
      <div v-if="currentPageEvents.length === 0" class="empty-state">
        <p>暂无事件</p>
      </div>
    </div>
    
    <!-- 加载更多按钮 -->
    <div v-if="hasMore" class="load-more-area">
      <button class="load-more-btn" @click="handleLoadMore">
        加载更多
      </button>
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
  },
  selectedEventIds: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['load-more', 'select-event', 'toggle-event-selection'])
const eventListRef = ref(null)

function handleLoadMore() {
  emit('load-more')
}

function handleSelectEvent(event) {
  emit('select-event', event)
}

function handleToggleSelection(eventId) {
  emit('toggle-event-selection', eventId)
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
  position: relative;
  height: 100%;
  overflow: hidden;
}

.event-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  grid-auto-rows: 200px;
  gap: 0.75rem;
  height: 100%;
  overflow-y: auto;
  align-content: start;
  padding-right: 0.5rem;
  padding-bottom: 1rem;
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
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  display: flex;
  justify-content: center;
  padding: 1rem;
  pointer-events: none;
  background: linear-gradient(180deg, rgba(19, 19, 21, 0), rgba(19, 19, 21, 0.92) 38%, rgba(19, 19, 21, 0.98));
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
  pointer-events: auto;
}

.load-more-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
}

.load-more-btn:active {
  transform: translateY(0);
}

/* 滚动条样式 */
.event-grid::-webkit-scrollbar {
  width: 6px;
}

.event-grid::-webkit-scrollbar-track {
  background: transparent;
}

.event-grid::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.event-grid::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

@media (max-width: 720px) {
  .event-grid {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 721px) and (max-width: 1120px) {
  .event-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
