<template>
  <div class="timeline-page" ref="timelinePageRef">
    <header class="timeline-header">
      <h1>恋爱时光机</h1>
    </header>

    <section class="hero-copy">
      <h2>岁月如歌，瞬间永恒</h2>
      <p>
        沿着记忆的轨迹，回望我们一起发光的节点。时间不再只是数字，而是被照片、心动和陪伴点亮的故事。
      </p>
    </section>

    <div class="carousel-section">
      <TimelineCarousel :events="recentEvents" />
    </div>

    <div class="events-section">
      <div class="category-nav-area">
        <TimelineCategoryNav
          :categories="categories"
          :selected-category="selectedCategory"
          :selected-subcategory="selectedSubcategory"
          @update:category="selectCategory"
          @update:subcategory="selectSubcategory"
          @add-category="handleAddCategory"
        />
      </div>

      <div class="event-list-area">
        <TimelineEventList
          :currentPageEvents="currentPageEvents"
          :currentPage="currentPage"
          :totalPages="totalPages"
          :hasMore="hasMore"
          :totalEventsCount="totalEventsCount"
          @load-more="loadMore"
          @select-event="selectEvent"
        />
      </div>

      <TimelineEventDetail
        v-if="!isAddingEvent"
        class="event-detail-area"
        :event="selectedEvent"
        @save="saveEvent"
        @close="clearSelectedEvent"
        @delete="handleDeleteEventWithApi"
      />
      
      <TimelineEventDetail
        v-else
        class="event-detail-area"
        :event="null"
        :category="addingCategory"
        @save="handleSaveNewEventWithApi"
        @close="cancelAddEvent"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import TimelineCarousel from './components/TimelineCarousel.vue'
import TimelineCategoryNav from './components/TimelineCategoryNav.vue'
import TimelineEventDetail from './components/TimelineEventDetail.vue'
import TimelineEventList from './components/TimelineEventList.vue'
import { useTimelineEvents } from './composables/useTimelineEvents.js'

const timelinePageRef = ref(null)

function handleWheel(e) {
  // 检查事件目标是否在可滚动的子元素内，如果是则允许滚动
  let target = e.target
  while (target && target !== e.currentTarget) {
    const style = getComputedStyle(target)
    const overflowY = style.overflowY
    if (
      (overflowY === 'auto' || overflowY === 'scroll') &&
      target.scrollHeight > target.clientHeight
    ) {
      return // 子元素可滚动，不阻止
    }
    target = target.parentElement
  }
  // 阻止页面级别的滚动
  e.preventDefault()
}

const selectedEventId = ref(null)
const isAddingEvent = ref(false)
const addingCategory = ref(null)

const {
  categories,
  allEvents,
  selectedCategory,
  selectedSubcategory,
  currentPage,
  recentEvents,
  currentPageEvents,
  totalPages,
  hasMore,
  loadMore,
  selectCategory: selectTimelineCategory,
  selectSubcategory,
  totalEventsCount,
  refreshTimeline,
  createEvent,
  updateEvent,
  removeEvent,
} = useTimelineEvents()

const selectedEvent = computed(() => {
  if (!selectedEventId.value) return null
  return allEvents.value.find((event) => String(event.id) === String(selectedEventId.value)) || null
})

function selectEvent(event) {
  selectedEventId.value = String(event.id)
  isAddingEvent.value = false
  addingCategory.value = null
}

async function selectCategory(categoryKey) {
  clearSelectedEvent()
  cancelAddEvent()
  await selectTimelineCategory(categoryKey)
}

function clearSelectedEvent() {
  selectedEventId.value = null
}

async function saveEvent(event) {
  try {
    await updateEvent(event)
    clearSelectedEvent()
  } catch (error) {
    console.error(error)
  }
}

function handleAddCategory(category) {
  isAddingEvent.value = true
  addingCategory.value = category
  selectedEventId.value = null
}

function cancelAddEvent() {
  isAddingEvent.value = false
  addingCategory.value = null
}

function handleSaveNewEvent(event) {
  // TODO: 调用API创建新事件
  console.log('保存新事件:', event)
  // 保存成功后退出编辑模式
  isAddingEvent.value = false
  addingCategory.value = null
  // 重新加载事件列表
  loadMore()
}

async function handleSaveNewEventWithApi(event) {
  try {
    const savedEvent = await createEvent(event)
    isAddingEvent.value = false
    addingCategory.value = null
    selectedEventId.value = savedEvent?.id ? String(savedEvent.id) : null
  } catch (error) {
    console.error(error)
  }
}

onMounted(() => {
  if (timelinePageRef.value) {
    timelinePageRef.value.addEventListener('wheel', handleWheel, { passive: false })
  }
  refreshTimeline()
})

onBeforeUnmount(() => {
  if (timelinePageRef.value) {
    timelinePageRef.value.removeEventListener('wheel', handleWheel)
  }
})

function handleDeleteEvent(eventId) {
  // TODO: 调用API删除事件
  console.log('删除事件:', eventId)
  // 删除成功后清除选择
  clearSelectedEvent()
  // 重新加载事件列表
  loadMore()
}

async function handleDeleteEventWithApi(eventId) {
  try {
    await removeEvent(eventId)
    clearSelectedEvent()
  } catch (error) {
    console.error(error)
  }
}

</script>

<style scoped>
.timeline-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  padding: 1rem;
  color: #e5e1e4;
  background:
    radial-gradient(circle at 12% 8%, rgba(0, 240, 255, 0.2) 0, transparent 34%),
    radial-gradient(circle at 84% 18%, rgba(255, 172, 232, 0.15) 0, transparent 28%),
    radial-gradient(circle at 86% 86%, rgba(112, 0, 255, 0.22) 0, transparent 34%),
    linear-gradient(135deg, #0e0e10 0%, #1a0b2e 50%, #2d1052 100%),
    #131315;
  overflow: hidden;
}

.timeline-page::before {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
  background-size: 42px 42px;
  mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.7), transparent 70%);
}

.material-symbols-outlined {
  font-family: 'Material Symbols Outlined';
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  font-size: 28px;
  line-height: 1;
}

.timeline-header {
  display: flex;
  align-items: center;
  min-height: 56px;
  padding: 0 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(14, 14, 16, 0.46);
  backdrop-filter: blur(18px);
  border-radius: 1rem;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.timeline-header h1 {
  margin: 0;
  color: #dbfcff;
  font-family: Manrope, Inter, sans-serif;
  font-size: 1.75rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  text-shadow: 0 0 18px rgba(0, 240, 255, 0.32);
}

.hero-copy {
  padding: 0.25rem 1rem 0;
  margin-top: -8px;
}

.hero-copy h2 {
  margin: 0 0 0.35rem;
  color: #e5e1e4;
  font-family: Manrope, Inter, sans-serif;
  font-size: clamp(1.6rem, 3vw, 2.45rem);
  line-height: 1.1;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.hero-copy p {
  margin: 0;
  max-width: 48rem;
  color: #b9cacb;
  font-size: 0.9rem;
  line-height: 1.45;
}

.carousel-section {
  height: 252px;
  margin-inline: -1rem;
  overflow: hidden;
}

.events-section {
  display: grid;
  grid-template-columns: 180px minmax(0, 1fr) 360px;
  gap: 1rem;
  flex: 1;
  min-height: 0;
  margin-top: -2.15rem;
}

.category-nav-area {
  height: calc(100vh - 410px);
  overflow-y: auto;
  padding: 0.75rem;
  border: 0.5px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  background: rgba(32, 31, 33, 0.6);
  backdrop-filter: blur(12px);
}

.event-list-area {
  height: calc(100vh - 410px);
  overflow-y: auto;
  border-radius: 1rem;
}

.event-detail-area {
  height: calc(100vh - 410px);
  overflow-y: auto;
}

.add-event-panel {
  padding: 1.5rem;
  background: rgba(32, 31, 33, 0.6);
  backdrop-filter: blur(12px);
  border: 0.5px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  color: #e5e1e4;
}

.add-event-panel h3 {
  margin: 0;
  color: #dbfcff;
  font-size: 1.25rem;
  font-weight: 600;
  text-shadow: 0 0 12px rgba(0, 240, 255, 0.2);
}

.add-event-panel p {
  margin: 0;
  color: #b9cacb;
  font-size: 0.9rem;
}

.cancel-btn {
  padding: 0.75rem 1.5rem;
  border: 1px solid rgba(0, 240, 255, 0.3);
  border-radius: 10px;
  background: rgba(0, 240, 255, 0.1);
  color: #7df4ff;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  align-self: flex-start;
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.1);
}

.cancel-btn:hover {
  background: rgba(0, 240, 255, 0.2);
  border-color: rgba(0, 240, 255, 0.5);
  box-shadow: 0 0 15px rgba(0, 240, 255, 0.25);
}

.event-list-area::-webkit-scrollbar,
.event-detail-area::-webkit-scrollbar,
.category-nav-area::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

.event-list-area::-webkit-scrollbar-track,
.event-detail-area::-webkit-scrollbar-track,
.category-nav-area::-webkit-scrollbar-track {
  background: transparent;
}

.event-list-area::-webkit-scrollbar-thumb,
.event-detail-area::-webkit-scrollbar-thumb,
.category-nav-area::-webkit-scrollbar-thumb {
  background: rgba(0, 240, 255, 0.3);
  border-radius: 2px;
}

@media (max-width: 900px) {
  .timeline-page {
    padding: 0.75rem;
  }

  .carousel-section {
    height: 220px;
  }

  .events-section {
    grid-template-columns: 1fr;
  }

  .category-nav-area,
  .event-list-area,
  .event-detail-area {
    height: auto;
    max-height: none;
  }
}
</style>
