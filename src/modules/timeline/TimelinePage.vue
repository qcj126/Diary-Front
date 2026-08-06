<template>
  <div class="timeline-page" ref="timelinePageRef">
    <header class="timeline-header">
      <h1>时光机</h1>
    </header>

    <div class="carousel-section">
      <TimelineCarousel :events="recentEvents" />
    </div>

    <section class="timeline-toolbar">
      <div class="timeline-actions">
        <button type="button" class="primary" @click="openCreateCategory">
          <span class="material-symbols-outlined">add</span>
          增
        </button>
        <button type="button" @click="requestDeleteSelected">
          <span class="material-symbols-outlined">delete</span>
          删
        </button>
        <button type="button" @click="openEditSelected">
          <span class="material-symbols-outlined">edit</span>
          改
        </button>
        <button type="button" @click="toggleQueryPanel">
          <span class="material-symbols-outlined">search</span>
          查
        </button>
      </div>

      <form v-if="queryPanelOpen" class="query-panel" @submit.prevent>
        <label>
          <span>距今时长</span>
          <input v-model.number="queryFilters.daysAgo" type="number" min="0" placeholder="天" />
        </label>
        <label>
          <span>精确时间</span>
          <input v-model="queryFilters.exactDate" type="date" />
        </label>
        <label>
          <span>分类</span>
          <select v-model="queryFilters.categoryKey" :disabled="selectedCategory !== 'all'">
            <option value="all">全部</option>
            <option v-for="category in categories" :key="category.key" :value="category.key">
              {{ category.icon }} {{ category.label }}
            </option>
          </select>
        </label>
      </form>
    </section>

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
          :totalEventsCount="filteredEventsCount"
          :selected-event-ids="selectedEventIds"
          @load-more="loadMore"
          @select-event="selectEvent"
          @toggle-event-selection="toggleEventSelection"
        />
      </div>
    </div>

    <div v-if="isAddingEvent || isEditingEvent" class="timeline-modal-backdrop" @click.self="closeEventModal">
      <TimelineEventDetail
        class="timeline-modal"
        :event="isEditingEvent ? selectedEvent : null"
        :category="isAddingEvent ? addingCategory : null"
        :categories="categories"
        :start-in-edit="isEditingEvent"
        @save="isEditingEvent ? saveEvent($event) : handleSaveNewEventWithApi($event)"
        @close="closeEventModal"
        @delete="handleDeleteEventWithApi"
      />
    </div>

    <div v-if="showDeleteConfirm" class="timeline-modal-backdrop" @click.self="showDeleteConfirm = false">
      <section class="confirm-modal">
        <h2>确定删除吗？</h2>
        <p>将删除已勾选的 {{ selectedEventIds.length }} 张记录卡片。</p>
        <div>
          <button type="button" @click="showDeleteConfirm = false">取消</button>
          <button type="button" class="danger" @click="confirmDeleteSelected">确定删除</button>
        </div>
      </section>
    </div>

    <div v-if="categoryEditorOpen" class="timeline-modal-backdrop" @click.self="closeCategoryEditor">
      <form class="category-modal" @submit.prevent="saveCategory">
        <header>
          <h2>新增子菜单</h2>
          <button type="button" aria-label="关闭" @click="closeCategoryEditor">
            <span class="material-symbols-outlined">close</span>
          </button>
        </header>

        <label>
          <span>子菜单名称</span>
          <input v-model.trim="categoryDraft.label" required type="text" placeholder="例如：旅行" />
        </label>
        <label>
          <span>子菜单图标</span>
          <input v-model.trim="categoryDraft.icon" required type="text" placeholder="例如：✈️" />
        </label>

        <footer>
          <button type="button" @click="closeCategoryEditor">取消</button>
          <button type="submit" class="primary">保存</button>
        </footer>
      </form>
    </div>

    <div v-if="toast.visible" class="timeline-toast">{{ toast.message }}</div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
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
const selectedEventIds = ref([])
const isAddingEvent = ref(false)
const isEditingEvent = ref(false)
const addingCategory = ref(null)
const showDeleteConfirm = ref(false)
const categoryEditorOpen = ref(false)
const queryPanelOpen = ref(false)
let toastTimer = 0

const categoryDraft = reactive({
  label: '',
  icon: '',
})

const queryFilters = reactive({
  daysAgo: null,
  exactDate: '',
  categoryKey: 'all',
})

const toast = reactive({
  visible: false,
  message: '',
})

const {
  categories,
  allEvents,
  selectedCategory,
  selectedSubcategory,
  currentPage,
  recentEvents,
  currentPageEvents: sourcePageEvents,
  totalPages,
  hasMore,
  loadMore,
  selectCategory: selectTimelineCategory,
  selectSubcategory,
  refreshTimeline,
  createCategory,
  updateCategory,
  createEvent,
  updateEvent,
  removeEvent,
} = useTimelineEvents()

const selectedEvent = computed(() => {
  if (!selectedEventId.value) return null
  return allEvents.value.find((event) => String(event.id) === String(selectedEventId.value)) || null
})

const currentPageEvents = computed(() => {
  return sourcePageEvents.value.filter((event) => {
    if (queryFilters.categoryKey !== 'all' && event.categoryKey !== queryFilters.categoryKey) return false
    if (queryFilters.exactDate && event.date !== queryFilters.exactDate) return false
    if (queryFilters.daysAgo !== null && queryFilters.daysAgo !== '' && Number.isFinite(Number(queryFilters.daysAgo))) {
      return daysBetweenToday(event.date) === Number(queryFilters.daysAgo)
    }
    return true
  })
})

const filteredEventsCount = computed(() => currentPageEvents.value.length)

function selectEvent(event) {
  selectedEventId.value = String(event.id)
  isAddingEvent.value = false
  isEditingEvent.value = true
  addingCategory.value = null
}

function toggleEventSelection(eventId) {
  const id = String(eventId)
  selectedEventIds.value = selectedEventIds.value.includes(id)
    ? selectedEventIds.value.filter((item) => item !== id)
    : [...selectedEventIds.value, id]
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
    await saveEventCategoryChanges(event)
    await updateEvent(event)
    clearSelectedEvent()
    selectedEventIds.value = selectedEventIds.value.filter((id) => id !== String(event.id))
    isEditingEvent.value = false
  } catch (error) {
    console.error(error)
  }
}

function handleAddCategory(category) {
  openAddCard(category)
}

function openAddCard(category) {
  isAddingEvent.value = true
  isEditingEvent.value = false
  addingCategory.value = category
  selectedEventId.value = null
}

function cancelAddEvent() {
  isAddingEvent.value = false
  addingCategory.value = null
}

function closeEventModal() {
  isAddingEvent.value = false
  isEditingEvent.value = false
  addingCategory.value = null
  clearSelectedEvent()
}

function openCreateEvent() {
  const category = selectedCategory.value === 'all'
    ? categories.value[0]
    : categories.value.find((item) => item.key === selectedCategory.value)
  if (!category) return
  openAddCard(category)
}

function openCreateCategory() {
  const category = selectedCategory.value === 'all'
    ? categories.value[0]
    : categories.value.find((item) => item.key === selectedCategory.value)
  categoryDraft.label = ''
  categoryDraft.icon = category?.icon || '📝'
  categoryEditorOpen.value = true
}

function openEditSelected() {
  if (!selectedEventIds.value.length) {
    showToast('请选择卡片')
    return
  }
  const event = allEvents.value.find((item) => String(item.id) === String(selectedEventIds.value[0]))
  if (!event) return
  selectedEventId.value = String(event.id)
  isAddingEvent.value = false
  isEditingEvent.value = true
  addingCategory.value = null
}

function requestDeleteSelected() {
  if (!selectedEventIds.value.length) {
    showToast('请选择卡片')
    return
  }
  showDeleteConfirm.value = true
}

function toggleQueryPanel() {
  queryPanelOpen.value = !queryPanelOpen.value
  syncQueryCategory()
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
    await saveEventCategoryChanges(event)
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
    selectedEventIds.value = selectedEventIds.value.filter((id) => id !== String(eventId))
    isEditingEvent.value = false
  } catch (error) {
    console.error(error)
  }
}

function closeCategoryEditor() {
  categoryEditorOpen.value = false
}

async function saveCategory() {
  try {
    await createCategory({
      label: categoryDraft.label,
      icon: categoryDraft.icon,
      sort: categories.value.length,
    })
    closeCategoryEditor()
  } catch (error) {
    console.error(error)
  }
}

async function saveEventCategoryChanges(event) {
  const category = categories.value.find((item) => String(item.id) === String(event.categoryId))
  if (!category) return
  const nextLabel = String(event.categoryName || '').trim()
  const nextIcon = String(event.categoryIcon || '').trim()
  if (nextLabel && (nextLabel !== category.label || nextIcon !== category.icon)) {
    await updateCategory({
      ...category,
      label: nextLabel,
      icon: nextIcon || category.icon,
    })
  }
}

async function confirmDeleteSelected() {
  const ids = [...selectedEventIds.value]
  showDeleteConfirm.value = false
  try {
    await Promise.all(ids.map((id) => removeEvent(id)))
    selectedEventIds.value = []
    clearSelectedEvent()
    isEditingEvent.value = false
  } catch (error) {
    console.error(error)
  }
}

function daysBetweenToday(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  const today = new Date()
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()
  const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
  return Math.floor((todayStart - dateStart) / 86400000)
}

function syncQueryCategory() {
  queryFilters.categoryKey = selectedCategory.value === 'all' ? queryFilters.categoryKey : selectedCategory.value
}

function showToast(message) {
  window.clearTimeout(toastTimer)
  toast.message = message
  toast.visible = true
  toastTimer = window.setTimeout(() => {
    toast.visible = false
  }, 1800)
}

watch(selectedCategory, () => {
  syncQueryCategory()
})

</script>

<style scoped>
.timeline-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
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

.carousel-section {
  height: 252px;
  margin-inline: -1rem;
  margin-top: -0.35rem;
  overflow: hidden;
}

.timeline-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.8rem;
  border: 0.5px solid rgba(255, 255, 255, 0.14);
  border-radius: 1rem;
  background: rgba(18, 18, 24, 0.72);
  backdrop-filter: blur(16px);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.timeline-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
}

.timeline-actions button,
.confirm-modal button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  min-height: 38px;
  border: 0;
  border-radius: 12px;
  padding: 0 0.9rem;
  background: rgba(255, 255, 255, 0.1);
  color: #e5e1e4;
  cursor: pointer;
  font-weight: 800;
  transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
}

.timeline-actions button:hover,
.confirm-modal button:hover {
  transform: translateY(-1px);
  background: rgba(255, 255, 255, 0.16);
}

.timeline-actions .primary {
  background: linear-gradient(135deg, #00f0ff, #d1bcff);
  color: #101014;
}

.timeline-actions .material-symbols-outlined {
  font-size: 19px;
}

.query-panel {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.65rem;
}

.query-panel label,
.category-modal label {
  display: grid;
  gap: 0.35rem;
  color: #cbd5e1;
  font-size: 0.78rem;
  font-weight: 800;
}

.query-panel input,
.query-panel select,
.category-modal input {
  min-height: 36px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 10px;
  padding: 0 0.7rem;
  background: rgba(255, 255, 255, 0.09);
  color: #fff;
  font: 700 0.86rem/1.2 Inter, sans-serif;
  outline: none;
}

.query-panel input,
.query-panel select {
  width: 128px;
}

.query-panel select:disabled {
  opacity: 0.72;
  cursor: not-allowed;
}

.events-section {
  display: grid;
  grid-template-columns: 180px minmax(0, 1fr);
  gap: 1rem;
  flex: 1;
  min-height: 0;
}

.category-nav-area {
  height: calc(100vh - 448px);
  overflow-y: auto;
  padding: 0.75rem;
  border: 0.5px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  background: rgba(32, 31, 33, 0.6);
  backdrop-filter: blur(12px);
}

.event-list-area {
  height: calc(100vh - 448px);
  overflow-y: auto;
  border-radius: 1rem;
}

.event-list-area::-webkit-scrollbar,
.category-nav-area::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

.event-list-area::-webkit-scrollbar-track,
.category-nav-area::-webkit-scrollbar-track {
  background: transparent;
}

.event-list-area::-webkit-scrollbar-thumb,
.category-nav-area::-webkit-scrollbar-thumb {
  background: rgba(0, 240, 255, 0.3);
  border-radius: 2px;
}

.timeline-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.58);
  backdrop-filter: blur(8px);
}

.timeline-modal {
  width: min(100%, 560px);
  max-height: min(86vh, 680px);
  overflow-y: auto;
}

.confirm-modal,
.category-modal {
  width: min(100%, 420px);
  padding: 1.5rem;
  border: 0.5px solid rgba(255, 255, 255, 0.14);
  border-radius: 1rem;
  background: rgba(18, 18, 24, 0.94);
  color: #e5e1e4;
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.42);
}

.category-modal {
  display: grid;
  gap: 1rem;
}

.category-modal header,
.category-modal footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.category-modal header h2 {
  margin: 0;
}

.category-modal header button,
.category-modal footer button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 38px;
  border: 0;
  border-radius: 12px;
  padding: 0 0.9rem;
  background: rgba(255, 255, 255, 0.1);
  color: #e5e1e4;
  cursor: pointer;
  font-weight: 800;
}

.category-modal footer .primary {
  background: linear-gradient(135deg, #00f0ff, #d1bcff);
  color: #101014;
}

.confirm-modal h2,
.confirm-modal p {
  margin: 0;
}

.confirm-modal p {
  margin-top: 0.65rem;
  color: #b9cacb;
  line-height: 1.6;
}

.confirm-modal div {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.25rem;
}

.confirm-modal .danger {
  background: rgba(239, 68, 68, 0.92);
  color: #fff;
}

.timeline-toast {
  position: fixed;
  top: 50%;
  left: 50%;
  z-index: 1200;
  padding: 0.9rem 1.3rem;
  border-radius: 14px;
  background: rgba(18, 18, 24, 0.94);
  color: #fff;
  font-weight: 900;
  box-shadow: 0 18px 44px rgba(0, 0, 0, 0.34);
  transform: translate(-50%, -50%);
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
  .event-list-area {
    height: auto;
    max-height: none;
  }
}
</style>
