import { computed, ref } from 'vue'
import { API_BASE } from '../../../api/index.js'
import { CAROUSEL_CONFIG } from '../constants/carouselConfig.js'
import { COLOR_MAP } from '../constants/eventCategories.js'
import { GLOBAL_USER_ID } from '../constants/imageTypes.js'
import { normalizeImageUrl, queryCarouselImageUrls, queryTimelineImageUrls } from '../api/images.js'
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
const ICON_STATIC_PREFIX = '/file/icon'

function readUserId() {
  return GLOBAL_USER_ID
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
  if (result === null || typeof result === 'undefined') return fallback
  if (typeof result !== 'object') return { ...fallback, id: result }
  return { ...fallback, ...result }
}

function toKey(value) {
  return String(value ?? '').trim()
}

function normalizeIconPath(path) {
  const value = String(path ?? '').trim()
  if (!value) return ''
  if (/^(https?:)?\/\//i.test(value) || value.startsWith('data:') || value.startsWith('blob:')) {
    return value
  }

  const normalized = value.replaceAll('\\', '/')
  const iconIndex = normalized.toLowerCase().lastIndexOf('/icon/')
  if (iconIndex >= 0) {
    const fileName = normalized.slice(iconIndex + '/icon/'.length)
    return encodeURI(`${API_BASE}${ICON_STATIC_PREFIX}/${fileName}`)
  }
  return encodeURI(`${API_BASE}${ICON_STATIC_PREFIX}/${normalized.replace(/^\/+/, '')}`)
}

function mapCategoryDTO(dto, index = 0) {
  const id = dto?.id ?? dto?.categoryId ?? dto?.categoryID ?? dto?.value ?? index + 1
  const iconPath = dto?.iconPath || dto?.iconUrl || dto?.icon || ''
  const icon = normalizeIconPath(iconPath)
  return {
    id: toKey(id),
    userId: dto?.userId ?? readUserId(),
    key: dto?.key || `cat_${id}`,
    label: dto?.categoryName || dto?.label || '',
    icon,
    iconName: dto?.iconName ?? '',
    iconPath,
    iconId: dto?.iconId ?? null,
    color: dto?.color || CATEGORY_COLORS[index % CATEGORY_COLORS.length] || 'blue',
    sort: dto?.sort ?? index,
    deleted: dto?.deleted ?? 0,
    children: toArray(dto?.children ?? dto?.subcategories ?? dto?.subMenus).map((child, childIndex) =>
      mapCategoryDTO(child, childIndex),
    ),
  }
}

function mapCategoryToDTO(category) {
  return {
    id: category?.id ?? null,
    userId: category?.userId ?? readUserId(),
    categoryName: category?.categoryName ?? category?.label ?? '',
    iconId: category?.iconId ?? null,
    iconName: category?.iconName ?? '',
    iconPath: category?.iconPath ?? category?.icon ?? '',
    icon: category?.icon ?? '',
    color: category?.color ?? '',
    deleted: category?.deleted ?? 0,
    sort: category?.sort ?? 0,
  }
}

function categoryKeyById(categoryMap, categoryId) {
  return categoryMap.get(toKey(categoryId))?.key || ''
}

function mapCardDTO(dto, categoryMap, fallback = {}) {
  const id = dto?.id ?? Date.now()
  const categoryId = dto?.categoryId ?? dto?.categoryID ?? dto?.timeMachineCategoryId ?? fallback.categoryId ?? null
  const category = categoryMap.get(toKey(categoryId))
  return {
    id: toKey(id),
    rawId: toKey(id),
    userId: dto?.userId ?? readUserId(),
    imageId: dto?.imageId ?? null,
    categoryId: categoryId === null ? null : toKey(categoryId),
    categoryKey: categoryKeyById(categoryMap, categoryId) || fallback.categoryKey || 'all',
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
    ...new Set(events.map((event) => String(event.imageId ?? '').trim()).filter(Boolean)),
  ]
  if (!imageIds.length) return events

  try {
    const images = await queryTimelineImageUrls(imageIds)
    const imageMap = new Map(images.map((image) => [String(image?.id), normalizeImageUrl(image?.url)]))
    return events.map((event) => ({
      ...event,
      imageUrl: event.imageUrl || imageMap.get(String(event.imageId)) || '',
    }))
  } catch (error) {
    console.error(error)
    return events
  }
}

export function useTimelineEvents() {
  const categories = ref([])
  const events = ref([])
  const carouselImageUrls = ref([])
  const loading = ref(false)
  const error = ref('')
  let cardQueryToken = 0

  const selectedCategory = ref('all')
  const selectedSubcategory = ref(null)
  const currentPage = ref(1)
  const pageIndex = ref(1)
  const pageSize = 30
  const hasMoreCards = ref(false)

  const categoryMap = computed(() => new Map(categories.value.map((category) => [toKey(category.id), category])))

  const allEvents = computed(() => {
    return [...events.value].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  })

  // The carousel is an independent data source. Do not fall back to card events here:
  // category queries replace `events`, which would otherwise also replace/empty the carousel.
  const carouselEvents = computed(() =>
    carouselImageUrls.value.slice(0, CAROUSEL_CONFIG.maxItems).map((imageUrl, index) => ({
      id: `carousel-${index}`,
      imageUrl,
      title: '',
      content: '',
      date: '',
    })),
  )

  function getLoadedCount(categoryKey, subcategoryKey) {
    return events.value.length
  }

  function setLoadedCount(categoryKey, subcategoryKey, count) {
    return count
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
    return getFilteredSource()
  })

  const totalEventsCount = computed(() => getFilteredSource().length)
  const hasMore = computed(() => hasMoreCards.value)
  const totalPages = computed(() => pageIndex.value)
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

  async function loadMore() {
    if (!hasMore.value) return
    await refreshCards({
      categoryKey: selectedCategory.value,
      nextPageIndex: pageIndex.value + 1,
      append: true,
    })
  }

  async function selectCategory(categoryKey) {
    selectedCategory.value = categoryKey
    selectedSubcategory.value = null
    currentPage.value = 1
    pageIndex.value = 1
    await refreshCards({ categoryKey, nextPageIndex: 1, append: false })
  }

  function selectSubcategory(subcategoryKey) {
    selectedSubcategory.value = subcategoryKey
    currentPage.value = 1
  }

  async function refreshCategories() {
    const result = await queryTimeCategories({ userId: readUserId() })
    const nextCategories = toArray(result).map(mapCategoryDTO).filter((category) => category.deleted !== 1)
    if (nextCategories.length) {
      categories.value = nextCategories.sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
    }
  }

  function getCategoryIdByKey(categoryKey) {
    if (!categoryKey || categoryKey === 'all') return null
    return categories.value.find((category) => category.key === categoryKey)?.id ?? null
  }

  async function refreshCards({
    categoryKey = selectedCategory.value,
    nextPageIndex = 1,
    nextPageSize = pageSize,
    daysAgo = null,
    exactDate = '',
    append = false,
  } = {}) {
    const token = cardQueryToken + 1
    cardQueryToken = token
    const categoryId = getCategoryIdByKey(categoryKey)
    const result = await queryTimeCards({
      userId: readUserId(),
      categoryId,
      deleted: 0,
      pageIndex: nextPageIndex,
      pageSize: nextPageSize,
      daysAgo,
      exactDate,
    })
    if (token !== cardQueryToken) return

    const mappedEvents = toArray(result)
      .map((card) => mapCardDTO(card, categoryMap.value, { categoryId, categoryKey }))
      .filter((event) => event.deleted !== 1)
    const nextEvents = await attachImageUrls(mappedEvents)
    if (token !== cardQueryToken) return

    pageIndex.value = nextPageIndex
    hasMoreCards.value = mappedEvents.length >= nextPageSize
    events.value = append ? [...events.value, ...nextEvents] : nextEvents
  }

  async function refreshCarouselImages() {
    try {
      const urls = await queryCarouselImageUrls()
      if (urls.length) {
        carouselImageUrls.value = urls
      }
    } catch (caught) {
      console.error(caught)
    }
  }

  async function refreshTimeline() {
    loading.value = true
    error.value = ''
    try {
      await refreshCarouselImages()
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
    categories.value = categories.value.map((item) => (toKey(item.id) === toKey(nextCategory.id) ? { ...item, ...nextCategory } : item))
    return nextCategory
  }

  async function removeCategory(category) {
    const dto = mapCategoryToDTO({ ...category, userId: readUserId(), deleted: 1 })
    await deleteTimeCategory(dto)
    categories.value = categories.value.filter((item) => toKey(item.id) !== toKey(dto.id))
    if (selectedCategory.value === category?.key) selectCategory('all')
  }

  async function createEvent(event) {
    const dto = mapEventToCardDTO({ ...event, userId: readUserId() }, categoryMap.value)
    const saved = normalizeSavedEntity(await addTimeCard(dto), dto)
    let nextEvent = mapCardDTO(saved, categoryMap.value)
    nextEvent = {
      ...nextEvent,
      title: event?.title || nextEvent.title,
      content: event?.content || nextEvent.content,
      imageId: event?.imageId ?? nextEvent.imageId,
      imageUrl: event?.imageUrl || nextEvent.imageUrl,
      categoryId: event?.categoryId ?? nextEvent.categoryId,
      categoryKey: event?.categoryKey || nextEvent.categoryKey,
      date: event?.date || nextEvent.date,
    }
    nextEvent = (await attachImageUrls([nextEvent]))[0]
    selectedCategory.value = nextEvent.categoryKey || selectedCategory.value
    selectedSubcategory.value = null
    currentPage.value = 1
    pageIndex.value = 1
    events.value = [nextEvent, ...events.value]
    return nextEvent
  }

  async function updateEvent(updatedEvent) {
    const currentEvent = events.value.find((event) => toKey(event.id) === toKey(updatedEvent.id))
    const dto = mapEventToCardDTO({ ...updatedEvent, userId: readUserId() }, categoryMap.value)
    const saved = normalizeSavedEntity(await updateTimeCard(dto), dto)
    let nextEvent = mapCardDTO(saved, categoryMap.value)
    nextEvent = {
      ...currentEvent,
      ...nextEvent,
      id: currentEvent?.id ?? nextEvent.id,
      rawId: currentEvent?.rawId ?? nextEvent.rawId,
      categoryId: updatedEvent.categoryId ?? currentEvent?.categoryId ?? nextEvent.categoryId,
      categoryKey: updatedEvent.categoryKey ?? currentEvent?.categoryKey ?? nextEvent.categoryKey,
      title: updatedEvent.title ?? nextEvent.title,
      content: updatedEvent.content ?? nextEvent.content,
      date: updatedEvent.date ?? nextEvent.date,
      imageId: updatedEvent.imageId ?? nextEvent.imageId,
      imageUrl: updatedEvent.imageUrl || nextEvent.imageUrl,
    }
    events.value = events.value.map((event) => (toKey(event.id) === toKey(updatedEvent.id) ? nextEvent : event))
    return nextEvent
  }

  async function removeEvent(eventId) {
    const event = events.value.find((item) => toKey(item.id) === toKey(eventId))
    if (!event) return
    await deleteTimeCard(mapEventToCardDTO({ ...event, deleted: 1, userId: readUserId() }, categoryMap.value))
    events.value = events.value.filter((item) => toKey(item.id) !== toKey(eventId))
  }

  return {
    categories,
    allEvents,
    selectedCategory,
    selectedSubcategory,
    currentPage,
    carouselEvents,
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
    refreshCards,
  }
}
