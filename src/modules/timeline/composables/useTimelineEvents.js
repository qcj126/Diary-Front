import { computed, ref } from 'vue'
import { TIMELINE_EVENTS } from '../mock/timelineData.js'
import { CAROUSEL_CONFIG } from '../constants/carouselConfig.js'
import { COLOR_MAP, EVENT_CATEGORIES } from '../constants/eventCategories.js'
import { normalizeImageUrl, queryTimelineImageUrls } from '../api/images.js'
import {
  addTimeCard,
  addTimeCategory,
  deleteTimeCard,
  deleteTimeCategory,
  queryTimeCards,
  queryTimeCategories,
  updateTimeCard,
  updateTimeCategory,
} from '../api/timeMachine.js'

const CATEGORY_COLORS = Object.keys(COLOR_MAP)
const CATEGORY_ICONS = ['📝', '🍱', '🎁', '✈️', '🏠', '🚶', '📷', '⭐']

function readUserId() {
  const keys = ['user', 'userInfo', 'loginUser', 'currentUser']
  const storages = [window.localStorage, window.sessionStorage]

  for (const storage of storages) {
    for (const key of keys) {
      const raw = storage.getItem(key)
      if (!raw) continue

      try {
        const parsed = JSON.parse(raw)
        const id = parsed?.userId ?? parsed?.id ?? parsed?.data?.userId ?? parsed?.data?.id
        const numericId = Number(id)
        if (Number.isFinite(numericId)) return numericId
      } catch {
        const numericId = Number(raw)
        if (Number.isFinite(numericId)) return numericId
      }
    }
  }

  return 0
}

function toArray(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.records)) return data.records
  if (Array.isArray(data?.list)) return data.list
  if (Array.isArray(data?.rows)) return data.rows
  return []
}

function toDateInputValue(value) {
  if (!value) return new Date().toISOString().slice(0, 10)
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10)
  return date.toISOString().slice(0, 10)
}

function toRecordTime(value) {
  if (!value) return new Date().toISOString()
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return new Date().toISOString()
  return date.toISOString()
}

function normalizeSavedEntity(result, fallback) {
  if (!result || typeof result !== 'object') return fallback
  return { ...fallback, ...result }
}

function mapCategoryDTO(dto, index = 0) {
  const id = dto?.id ?? index + 1
  return {
    id,
    userId: dto?.userId ?? readUserId(),
    key: dto?.key || `cat_${id}`,
    label: dto?.categoryName || dto?.label || `Category ${index + 1}`,
    icon: dto?.icon || CATEGORY_ICONS[index % CATEGORY_ICONS.length],
    color: dto?.color || CATEGORY_COLORS[index % CATEGORY_COLORS.length] || 'blue',
    sort: dto?.sort ?? index,
    deleted: dto?.deleted ?? 0,
  }
}

function mapCategoryToDTO(category) {
  return {
    id: category?.id ?? null,
    userId: category?.userId ?? readUserId(),
    categoryName: category?.categoryName ?? category?.label ?? '',
    deleted: category?.deleted ?? 0,
    sort: category?.sort ?? 0,
  }
}

function categoryKeyById(categoryMap, categoryId) {
  return categoryMap.get(Number(categoryId))?.key || 'all'
}

function mapCardDTO(dto, categoryMap) {
  const id = dto?.id ?? Date.now()
  const categoryId = dto?.categoryId ?? null
  const category = categoryMap.get(Number(categoryId))
  return {
    id: String(id),
    rawId: Number(id),
    userId: dto?.userId ?? readUserId(),
    imageId: dto?.imageId ?? null,
    categoryId,
    categoryKey: categoryKeyById(categoryMap, categoryId),
    subcategoryKey: null,
    title: dto?.cardTitle || dto?.title || '',
    content: dto?.cardContent || dto?.content || '',
    imageUrl: normalizeImageUrl(dto?.imageUrl ?? dto?.url ?? ''),
    date: toDateInputValue(dto?.recordTime ?? dto?.date),
    color: category?.color || 'blue',
    deleted: dto?.deleted ?? 0,
  }
}

function mapEventToCardDTO(event, categoryMap) {
  const categoryId =
    event?.categoryId ??
    [...categoryMap.values()].find((category) => category.key === event?.categoryKey)?.id ??
    null

  return {
    id: event?.rawId ?? event?.id ?? null,
    userId: event?.userId ?? readUserId(),
    imageId: event?.imageId ?? null,
    categoryId,
    cardTitle: event?.cardTitle ?? event?.title ?? '',
    cardContent: event?.cardContent ?? event?.content ?? '',
    recordTime: toRecordTime(event?.recordTime ?? event?.date),
    deleted: event?.deleted ?? 0,
  }
}

async function attachImageUrls(events) {
  const imageIds = [
    ...new Set(events.map((event) => Number(event.imageId)).filter((id) => Number.isFinite(id))),
  ]
  if (!imageIds.length) return events

  try {
    const images = await queryTimelineImageUrls(imageIds)
    const imageMap = new Map(images.map((image) => [Number(image?.id), normalizeImageUrl(image?.url)]))
    return events.map((event) => ({
      ...event,
      imageUrl: event.imageUrl || imageMap.get(Number(event.imageId)) || '',
    }))
  } catch (error) {
    console.error(error)
    return events
  }
}

export function useTimelineEvents() {
  const categories = ref(EVENT_CATEGORIES.map((category, index) => mapCategoryDTO(category, index)))
  const events = ref(TIMELINE_EVENTS.map((event) => ({ ...event })))
  const loading = ref(false)
  const error = ref('')

  const selectedCategory = ref('all')
  const selectedSubcategory = ref(null)
  const currentPage = ref(1)
  const itemsPerPage = 10
  const initialLoadCount = 10
  const scrollLoadCount = 10
  const loadedCounts = ref({})

  const categoryMap = computed(() => new Map(categories.value.map((category) => [Number(category.id), category])))

  const allEvents = computed(() => {
    return [...events.value].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  })

  const recentEvents = computed(() => allEvents.value.slice(0, CAROUSEL_CONFIG.maxItems))

  function getLoadedCount(categoryKey, subcategoryKey) {
    const key = subcategoryKey ? `${categoryKey}_${subcategoryKey}` : categoryKey
    return loadedCounts.value[key] || initialLoadCount
  }

  function setLoadedCount(categoryKey, subcategoryKey, count) {
    const key = subcategoryKey ? `${categoryKey}_${subcategoryKey}` : categoryKey
    loadedCounts.value[key] = count
  }

  function getFilteredSource() {
    if (selectedCategory.value === 'all') return allEvents.value

    return allEvents.value.filter((event) => {
      if (event.categoryKey !== selectedCategory.value) return false
      if (!selectedSubcategory.value) return true
      return event.subcategoryKey === selectedSubcategory.value
    })
  }

  const filteredEvents = computed(() => {
    const source = getFilteredSource()
    const loadedCount = getLoadedCount(selectedCategory.value, selectedSubcategory.value)
    return source.slice(0, loadedCount)
  })

  const totalEventsCount = computed(() => getFilteredSource().length)
  const hasMore = computed(() => getLoadedCount(selectedCategory.value, selectedSubcategory.value) < totalEventsCount.value)
  const totalPages = computed(() => Math.ceil(filteredEvents.value.length / itemsPerPage))
  const currentPageEvents = computed(() => filteredEvents.value)

  function goToPage(page) {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
    }
  }

  function nextPage() {
    if (currentPage.value < totalPages.value) currentPage.value += 1
  }

  function prevPage() {
    if (currentPage.value > 1) currentPage.value -= 1
  }

  function loadMore() {
    if (!hasMore.value) return
    const currentCount = getLoadedCount(selectedCategory.value, selectedSubcategory.value)
    const newCount = Math.min(currentCount + scrollLoadCount, totalEventsCount.value)
    setLoadedCount(selectedCategory.value, selectedSubcategory.value, newCount)
  }

  function selectCategory(categoryKey) {
    selectedCategory.value = categoryKey
    selectedSubcategory.value = null
    currentPage.value = 1
    loadedCounts.value = {}
    setLoadedCount(categoryKey, null, initialLoadCount)
  }

  function selectSubcategory(subcategoryKey) {
    selectedSubcategory.value = subcategoryKey
    currentPage.value = 1
    setLoadedCount(selectedCategory.value, subcategoryKey, initialLoadCount)
  }

  async function refreshCategories() {
    const result = await queryTimeCategories({ userId: readUserId(), deleted: 0 })
    const nextCategories = toArray(result).map(mapCategoryDTO).filter((category) => category.deleted !== 1)
    if (nextCategories.length) {
      categories.value = nextCategories.sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
    }
  }

  async function refreshCards() {
    const result = await queryTimeCards({ userId: readUserId(), deleted: 0 })
    const mappedEvents = toArray(result)
      .map((card) => mapCardDTO(card, categoryMap.value))
      .filter((event) => event.deleted !== 1)
    events.value = await attachImageUrls(mappedEvents)
  }

  async function refreshTimeline() {
    loading.value = true
    error.value = ''
    try {
      await refreshCategories()
      await refreshCards()
    } catch (caught) {
      console.error(caught)
      error.value = caught instanceof Error ? caught.message : 'Timeline query failed.'
    } finally {
      loading.value = false
    }
  }

  async function createCategory(category) {
    const dto = mapCategoryToDTO({ ...category, userId: readUserId() })
    const saved = normalizeSavedEntity(await addTimeCategory(dto), dto)
    const nextCategory = mapCategoryDTO(saved, categories.value.length)
    categories.value = [...categories.value, nextCategory].sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
    return nextCategory
  }

  async function updateCategory(category) {
    const dto = mapCategoryToDTO({ ...category, userId: readUserId() })
    const saved = normalizeSavedEntity(await updateTimeCategory(dto), dto)
    const nextCategory = mapCategoryDTO(saved)
    categories.value = categories.value.map((item) => (item.id === nextCategory.id ? { ...item, ...nextCategory } : item))
    return nextCategory
  }

  async function removeCategory(category) {
    const dto = mapCategoryToDTO({ ...category, userId: readUserId(), deleted: 1 })
    await deleteTimeCategory(dto)
    categories.value = categories.value.filter((item) => item.id !== dto.id)
    if (selectedCategory.value === category?.key) selectCategory('all')
  }

  async function createEvent(event) {
    const dto = mapEventToCardDTO({ ...event, userId: readUserId() }, categoryMap.value)
    const saved = normalizeSavedEntity(await addTimeCard(dto), dto)
    let nextEvent = mapCardDTO(saved, categoryMap.value)
    nextEvent = (await attachImageUrls([nextEvent]))[0]
    events.value = [nextEvent, ...events.value]
    return nextEvent
  }

  async function updateEvent(updatedEvent) {
    const dto = mapEventToCardDTO({ ...updatedEvent, userId: readUserId() }, categoryMap.value)
    const saved = normalizeSavedEntity(await updateTimeCard(dto), dto)
    let nextEvent = mapCardDTO(saved, categoryMap.value)
    nextEvent = {
      ...events.value.find((event) => event.id === String(updatedEvent.id)),
      ...nextEvent,
      imageUrl: updatedEvent.imageUrl || nextEvent.imageUrl,
    }
    events.value = events.value.map((event) => (event.id === String(updatedEvent.id) ? nextEvent : event))
    return nextEvent
  }

  async function removeEvent(eventId) {
    const event = events.value.find((item) => item.id === String(eventId))
    if (!event) return
    await deleteTimeCard(mapEventToCardDTO({ ...event, deleted: 1, userId: readUserId() }, categoryMap.value))
    events.value = events.value.filter((item) => item.id !== String(eventId))
  }

  return {
    categories,
    allEvents,
    selectedCategory,
    selectedSubcategory,
    currentPage,
    recentEvents,
    filteredEvents,
    currentPageEvents,
    totalPages,
    hasMore,
    totalEventsCount,
    loading,
    error,
    goToPage,
    nextPage,
    prevPage,
    loadMore,
    selectCategory,
    selectSubcategory,
    refreshTimeline,
    createCategory,
    updateCategory,
    removeCategory,
    createEvent,
    updateEvent,
    removeEvent,
  }
}
