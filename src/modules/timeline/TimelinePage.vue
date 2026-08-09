<template>
  <div class="timeline-page" ref="timelinePageRef">
    <header class="timeline-header">
      <h1>时光机</h1>
    </header>

    <div class="carousel-section">
      <TimelineCarousel :events="carouselEvents" />
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

      <form v-if="queryPanelOpen" class="query-panel" @submit.prevent="applyQueryFilters">
        <span class="date-picker-field">
          <button type="button" class="date-picker-btn" aria-label="选择日期" @click="openExactDatePicker">
            <span class="material-symbols-outlined">calendar_month</span>
          </button>
          <span v-if="queryFilters.exactDate" class="date-picker-value">{{ queryFilters.exactDate }}</span>
          <span v-else class="date-picker-placeholder">精确时间</span>
          <input ref="exactDateInput" v-model="queryFilters.exactDate" class="date-picker-input" type="date" />
        </span>
        <select v-model.number="queryFilters.pageSize" class="page-size-query-select">
          <option v-for="size in pageSizeOptions" :key="size" :value="size">
            {{ size }}
          </option>
        </select>
        <input
          v-model.number="queryFilters.page"
          class="page-query-input"
          type="number"
          min="1"
          step="1"
          placeholder="页数"
          @blur="normalizeQueryPage"
        />
        <button type="submit">查询</button>
        <button type="button" @click="resetQueryFilters">重置</button>
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
          :categories="categories"
          :currentPage="currentPage"
          :totalPages="totalPages"
          :hasMore="hasMore"
          :totalEventsCount="filteredEventsCount"
          :selected-event-ids="selectedEventIds"
          @load-more="handleLoadMore"
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
          <div class="category-icon-picker">
            <span class="category-icon-preview">
              <img v-if="isIconUrl(categoryDraft.icon)" :src="categoryDraft.icon" alt="" />
              <span v-else>{{ categoryDraft.icon || '?' }}</span>
            </span>
            <select
              v-model="categoryDraft.iconId"
              required
              :disabled="iconLoading || !categoryIconOptions.length"
              @change="selectCategoryIconById"
            >
              <option value="" disabled>{{ iconLoading ? '图标加载中...' : '请选择图标' }}</option>
              <option v-for="icon in categoryIconOptions" :key="icon.id ?? icon.iconName" :value="String(icon.id)">
                {{ icon.iconName }}
              </option>
            </select>
          </div>
        </label>
        <p v-if="categoryIconError" class="category-icon-error">{{ categoryIconError }}</p>

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
import { queryIcons } from '../icons/api/icons.js'

const timelinePageRef = ref(null)
const exactDateInput = ref(null)

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
const pageSizeOptions = Array.from({ length: 10 }, (_, index) => (index + 1) * 30)

const categoryDraft = reactive({
  label: '',
  icon: '',
  iconId: '',
  iconName: '',
  iconPath: '',
})
const categoryIconOptions = ref([])
const iconLoading = ref(false)
const categoryIconError = ref('')

const queryFilters = reactive({
  exactDate: '',
  pageSize: 30,
  page: 1,
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
  carouselEvents,
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
  refreshCards,
} = useTimelineEvents()

const selectedEvent = computed(() => {
  if (!selectedEventId.value) return null
  return allEvents.value.find((event) => String(event.id) === String(selectedEventId.value)) || null
})

const filteredEvents = computed(() => {
  return sourcePageEvents.value.filter((event) => {
    if (queryFilters.exactDate && event.date !== queryFilters.exactDate) return false
    return true
  })
})

const selectedPageSize = computed(() => {
  const size = Number(queryFilters.pageSize)
  return pageSizeOptions.includes(size) ? size : pageSizeOptions[0]
})

const selectedQueryPage = computed(() => {
  const page = Number(queryFilters.page)
  if (!Number.isFinite(page)) return 1
  return Math.max(1, Math.floor(page))
})

const currentPageEvents = computed(() => {
  return filteredEvents.value.slice(0, selectedPageSize.value)
})

const filteredEventsCount = computed(() => filteredEvents.value.length)

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
  categoryDraft.label = ''
  categoryDraft.icon = ''
  categoryDraft.iconId = ''
  categoryDraft.iconName = ''
  categoryDraft.iconPath = ''
  categoryEditorOpen.value = true
  loadCategoryIcons()
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
  categoryIconError.value = ''
}

function isIconUrl(icon) {
  const value = String(icon ?? '')
  return /^(https?:)?\/\//i.test(value) || value.startsWith('data:') || value.startsWith('blob:')
}

async function loadCategoryIcons() {
  iconLoading.value = true
  categoryIconError.value = ''

  try {
    categoryIconOptions.value = await queryIcons()
    const firstIcon = categoryIconOptions.value[0]
    if (!categoryDraft.iconId && firstIcon) selectCategoryIcon(firstIcon)
  } catch (error) {
    console.error(error)
    categoryIconOptions.value = []
    categoryIconError.value = error instanceof Error ? error.message : '图标查询失败'
  } finally {
    iconLoading.value = false
  }
}

function selectCategoryIcon(icon) {
  categoryDraft.iconId = icon?.id === null || icon?.id === undefined ? '' : String(icon.id)
  categoryDraft.icon = icon?.iconUrl || icon?.iconPath || ''
  categoryDraft.iconName = icon?.iconName || ''
  categoryDraft.iconPath = icon?.iconPath || categoryDraft.icon
}

function selectCategoryIconById() {
  const icon = categoryIconOptions.value.find((item) => String(item.id) === String(categoryDraft.iconId))
  if (icon) selectCategoryIcon(icon)
}

async function saveCategory() {
  if (!categoryDraft.iconId) {
    categoryIconError.value = iconLoading.value ? '图标加载中，请稍后再保存' : '请选择子菜单图标'
    return
  }

  try {
    await createCategory({
      label: categoryDraft.label,
      icon: categoryDraft.icon,
      iconId: categoryDraft.iconId,
      iconName: categoryDraft.iconName,
      iconPath: categoryDraft.iconPath,
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

function resetQueryPage() {
  queryFilters.page = 1
}

function normalizeQueryPage() {
  const page = Number(queryFilters.page)
  queryFilters.page = Number.isFinite(page) ? Math.max(1, Math.floor(page)) : 1
}

function buildCardQueryParams({ append = false, nextPageIndex = selectedQueryPage.value } = {}) {
  return {
    categoryKey: selectedCategory.value,
    nextPageIndex,
    nextPageSize: selectedPageSize.value,
    exactDate: queryFilters.exactDate,
    append,
  }
}

async function applyQueryFilters() {
  normalizeQueryPage()
  await refreshCards(buildCardQueryParams())
}

async function handleLoadMore() {
  if (!queryPanelOpen.value) {
    await loadMore()
    return
  }
  if (!hasMore.value) return
  const nextPageIndex = selectedQueryPage.value + 1
  queryFilters.page = nextPageIndex
  await refreshCards(buildCardQueryParams({ append: true, nextPageIndex }))
}

async function resetQueryFilters() {
  queryFilters.exactDate = ''
  queryFilters.pageSize = 30
  queryFilters.page = 1
  await refreshCards(buildCardQueryParams())
}

function openExactDatePicker() {
  if (typeof exactDateInput.value?.showPicker === 'function') {
    exactDateInput.value.showPicker()
    return
  }
  exactDateInput.value?.click()
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
  resetQueryPage()
})

watch(
  () => [queryFilters.exactDate, queryFilters.pageSize],
  () => {
    resetQueryPage()
  }
)

watch(
  () => queryFilters.page,
  () => {
    normalizeQueryPage()
  }
)

watch(selectedPageSize, (size) => {
  if (queryFilters.pageSize !== size) {
    queryFilters.pageSize = size
  }
})

</script>

<style scoped>
.timeline-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  padding: 1rem;
  color: var(--dashboard-text, #1c1b1b);
  background: var(--dashboard-bg, #fdf8f8);
  overflow: hidden;
}

.timeline-page::before {
  display: none;
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
  flex: 0 0 72px;
  height: 72px;
  min-height: 72px;
  margin: -1rem -1rem 0.45rem;
  padding: 0 2.5rem;
  border: 0;
  border-bottom: 1px solid rgba(220, 193, 185, 0.72);
  background-color: #fff8f6;
  border-radius: 0;
  box-shadow: none;
}

.timeline-header h1 {
  margin: 0;
  color: #1d1b1a;
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: 0;
  text-shadow: none;
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
  box-sizing: border-box;
  flex: 0 0 64px;
  min-height: 64px;
  padding: 0.8rem;
  border: 1px solid var(--dashboard-border-soft, rgba(196, 199, 199, 0.56));
  border-radius: 8px;
  background: var(--dashboard-surface, #ffffff);
  box-shadow: var(--dashboard-shadow, 0 18px 50px rgba(28, 27, 27, 0.08));
  overflow: hidden;
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
  border: 1px solid var(--dashboard-border-soft, rgba(196, 199, 199, 0.56));
  border-radius: 8px;
  padding: 0 0.9rem;
  background: var(--dashboard-surface-soft, #f7f3f2);
  color: var(--dashboard-text, #1c1b1b);
  cursor: pointer;
  font-weight: 800;
  transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
}

.timeline-actions button:hover,
.confirm-modal button:hover {
  transform: translateY(-1px);
  background: var(--dashboard-hover, #e0e3e5);
}

.timeline-actions .primary {
  border-color: var(--dashboard-accent, #1c1b1a);
  background: var(--dashboard-accent, #1c1b1a);
  color: var(--dashboard-accent-contrast, #ffffff);
}

.timeline-actions .material-symbols-outlined {
  font-size: 19px;
}

.query-panel {
  display: flex;
  flex: 1 1 auto;
  flex-wrap: nowrap;
  justify-content: flex-end;
  gap: 10px;
  min-width: 0;
  overflow-x: auto;
  overflow-y: hidden;
}

.category-modal label {
  display: grid;
  gap: 0.35rem;
  color: var(--dashboard-text-muted, #5c5f61);
  font-size: 0.78rem;
  font-weight: 800;
}

.category-modal input,
.category-modal select {
  min-height: 36px;
  border: 1px solid var(--dashboard-border-soft, rgba(196, 199, 199, 0.56));
  border-radius: 8px;
  padding: 0 0.7rem;
  background: var(--dashboard-surface-soft, #f7f3f2);
  color: var(--dashboard-text, #1c1b1b);
  font: 700 0.86rem/1.2 Inter, sans-serif;
  outline: none;
}

.category-icon-picker {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr);
  gap: 0.6rem;
  align-items: center;
}

.category-icon-preview {
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  border: 1px solid var(--dashboard-border-soft, rgba(196, 199, 199, 0.56));
  border-radius: 8px;
  background: var(--dashboard-surface-soft, #f7f3f2);
  color: var(--dashboard-text, #1c1b1b);
  font-weight: 800;
}

.category-icon-preview img {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.category-icon-error {
  margin: -0.35rem 0 0;
  color: #c2410c;
  font-size: 0.78rem;
  font-weight: 800;
}

.query-panel input,
.query-panel select,
.date-picker-field {
  box-sizing: border-box;
  width: 96px;
  min-height: 38px;
  border: 1px solid rgba(196, 199, 199, 0.58);
  border-radius: 12px;
  padding: 10px 12px;
  background: #ffffff;
  color: var(--dashboard-text, #1c1b1b);
  font: 700 13px/1.4 Inter, sans-serif;
  text-align: center;
  outline: none;
}

.query-panel select {
  cursor: pointer;
  padding-right: 4px;
  padding-left: 4px;
  text-align-last: center;
}

.query-panel .page-size-query-select {
  width: 68px;
}

.query-panel .page-query-input {
  width: 58px;
  text-align: center;
}

.query-panel .page-size-query-select {
  padding-left: 8px;
  padding-right: 4px;
  text-align: left;
  text-align-last: left;
}

.query-panel .page-size-query-select option {
  text-align: left;
}

.query-panel select:disabled {
  opacity: 0.72;
  cursor: not-allowed;
}

.date-picker-field {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  width: 128px;
  gap: 6px;
  padding: 0 8px;
}

.query-panel .date-picker-btn,
:global(.dashboard[data-theme='night']) .query-panel .date-picker-btn {
  display: inline-grid;
  width: 18px;
  height: 22px;
  min-height: 0;
  place-items: center;
  flex: 0 0 auto;
  border: 0;
  border-radius: 0;
  padding: 0;
  background: transparent;
  box-shadow: none;
  color: var(--dashboard-accent, #1c1b1a);
  cursor: pointer;
  transform: none;
}

.query-panel .date-picker-btn:hover,
:global(.dashboard[data-theme='night']) .query-panel .date-picker-btn:hover {
  background: transparent;
  box-shadow: none;
  transform: none;
}

.date-picker-btn .material-symbols-outlined {
  font-size: 17px;
}

.date-picker-placeholder {
  display: block;
  min-width: 0;
  flex: 1;
  color: #757575;
  font-weight: 700;
  text-align: center;
  white-space: nowrap;
}

.date-picker-value {
  min-width: 0;
  flex: 1;
  overflow: hidden;
  color: var(--dashboard-text, #1c1b1b);
  font-size: 13px;
  font-weight: 700;
  line-height: 1.2;
  text-align: center;
  text-overflow: clip;
  white-space: nowrap;
}

:global(.dashboard[data-theme='night']) .date-picker-field {
  border-color: var(--dashboard-border-soft);
  background: var(--dashboard-surface-soft);
  color: var(--dashboard-text);
}

:global(.dashboard[data-theme='night']) .date-picker-placeholder {
  color: var(--dashboard-text-muted);
}

.query-panel .date-picker-input {
  position: absolute;
  inset: 0 auto auto 0;
  width: 1px;
  height: 1px;
  min-height: 0;
  padding: 0;
  border: 0;
  opacity: 0;
  pointer-events: none;
}

.query-panel button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 38px;
  border: 0;
  border-radius: 12px;
  padding: 0 14px;
  background: #f1edec;
  color: #444748;
  font-weight: 800;
  cursor: pointer;
}

.events-section {
  display: grid;
  grid-template-columns: 156px minmax(0, 1fr);
  gap: 1rem;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.category-nav-area {
  height: 100%;
  min-height: 0;
  overflow-y: auto;
  padding: 0.75rem;
  border: 1px solid var(--dashboard-border-soft, rgba(196, 199, 199, 0.56));
  border-radius: 8px;
  background: var(--dashboard-surface, #ffffff);
  box-shadow: var(--dashboard-shadow, 0 18px 50px rgba(28, 27, 27, 0.08));
}

.event-list-area {
  height: 100%;
  min-height: 0;
  overflow-y: auto;
  border-radius: 8px;
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
  background: var(--dashboard-border, #c4c7c7);
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
  width: min(100%, 720px);
  max-height: min(84vh, 640px);
  overflow-y: auto;
}

.confirm-modal,
.category-modal {
  width: min(100%, 420px);
  padding: 1.5rem;
  border: 1px solid var(--dashboard-border-soft, rgba(196, 199, 199, 0.56));
  border-radius: 8px;
  background: var(--dashboard-surface, #ffffff);
  color: var(--dashboard-text, #1c1b1b);
  box-shadow: var(--dashboard-shadow, 0 18px 50px rgba(28, 27, 27, 0.08));
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
  border: 1px solid var(--dashboard-border-soft, rgba(196, 199, 199, 0.56));
  border-radius: 8px;
  padding: 0 0.9rem;
  background: var(--dashboard-surface-soft, #f7f3f2);
  color: var(--dashboard-text, #1c1b1b);
  cursor: pointer;
  font-weight: 800;
}

.category-modal footer .primary {
  border-color: var(--dashboard-accent, #1c1b1a);
  background: var(--dashboard-accent, #1c1b1a);
  color: var(--dashboard-accent-contrast, #ffffff);
}

.confirm-modal h2,
.confirm-modal p {
  margin: 0;
}

.confirm-modal p {
  margin-top: 0.65rem;
  color: var(--dashboard-text-muted, #5c5f61);
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
  border: 1px solid var(--dashboard-border-soft, rgba(196, 199, 199, 0.56));
  border-radius: 8px;
  background: var(--dashboard-surface, #ffffff);
  color: var(--dashboard-text-strong, #000000);
  font-weight: 900;
  box-shadow: 0 18px 44px rgba(0, 0, 0, 0.34);
  transform: translate(-50%, -50%);
}

@media (max-width: 900px) {
  .timeline-page {
    padding: 0.75rem;
  }

  .timeline-header {
    margin: -0.75rem -0.75rem 0.45rem;
    padding: 0 1rem;
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
