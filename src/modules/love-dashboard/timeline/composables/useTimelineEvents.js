import { ref, computed } from 'vue'
import { TIMELINE_EVENTS } from '../mock/timelineData.js'
import { CAROUSEL_CONFIG } from '../constants/carouselConfig.js'

export function useTimelineEvents() {
  // 当前选中的大类和子类
  const selectedCategory = ref('all')
  const selectedSubcategory = ref(null)

  // 分页相关
  const currentPage = ref(1)
  const itemsPerPage = 10 // 事件列表每页10个(仅用于翻页)
  const initialLoadCount = 10 // 每个分类初始加载10条
  const scrollLoadCount = 10 // 点击按钮每次加载10条

  // 记录每个分类已加载的数量
  const loadedCounts = ref({})

  // 所有事件(按日期降序排列)
  const allEvents = computed(() => {
    return [...TIMELINE_EVENTS].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  })

  // 轮播图用的最近20个事件
  const recentEvents = computed(() => {
    return allEvents.value.slice(0, CAROUSEL_CONFIG.maxItems)
  })

  // 获取分类的已加载数量
  function getLoadedCount(categoryKey, subcategoryKey) {
    const key = subcategoryKey ? `${categoryKey}_${subcategoryKey}` : categoryKey
    return loadedCounts.value[key] || initialLoadCount
  }

  // 设置分类的已加载数量
  function setLoadedCount(categoryKey, subcategoryKey, count) {
    const key = subcategoryKey ? `${categoryKey}_${subcategoryKey}` : categoryKey
    loadedCounts.value[key] = count
  }

  // 根据选中分类筛选事件(支持动态加载)
  const filteredEvents = computed(() => {
    let events = allEvents.value
    
    if (selectedCategory.value !== 'all') {
      events = events.filter(e => e.categoryKey === selectedCategory.value)
      
      if (selectedSubcategory.value) {
        events = events.filter(e => e.subcategoryKey === selectedSubcategory.value)
      }
    }
    
    // 根据已加载数量截取
    const loadedCount = getLoadedCount(selectedCategory.value, selectedSubcategory.value)
    const result = events.slice(0, loadedCount)
    
    // 调试日志 - 检查是否有重复ID
    const ids = result.map(e => e.id)
    const uniqueIds = [...new Set(ids)]
    if (ids.length !== uniqueIds.length) {
      console.error('发现重复ID!', { ids, uniqueIds })
    }
    console.log('filteredEvents:', {
      category: selectedCategory.value,
      subcategory: selectedSubcategory.value,
      loadedCount,
      totalFiltered: events.length,
      returned: result.length,
      ids
    })
    
    return result
  })

  // 总事件数(用于判断是否还有更多)
  const totalEventsCount = computed(() => {
    let events = allEvents.value
    
    if (selectedCategory.value !== 'all') {
      events = events.filter(e => e.categoryKey === selectedCategory.value)
      
      if (selectedSubcategory.value) {
        events = events.filter(e => e.subcategoryKey === selectedSubcategory.value)
      }
    }
    
    return events.length
  })

  // 是否还有更多数据
  const hasMore = computed(() => {
    const loadedCount = getLoadedCount(selectedCategory.value, selectedSubcategory.value)
    return loadedCount < totalEventsCount.value
  })

  // 总页数(基于已加载的数据)
  const totalPages = computed(() => {
    return Math.ceil(filteredEvents.value.length / itemsPerPage)
  })

  // 当前页的事件 - 显示所有已加载的数据,不受分页限制
  const currentPageEvents = computed(() => {
    return filteredEvents.value
  })

  // 翻页方法
  function goToPage(page) {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
    }
  }

  function nextPage() {
    if (currentPage.value < totalPages.value) {
      currentPage.value++
    }
  }

  function prevPage() {
    if (currentPage.value > 1) {
      currentPage.value--
    }
  }

  // 滚动加载更多内容
  function loadMore() {
    if (!hasMore.value) {
      console.log('没有更多数据了')
      return
    }
    
    const currentCount = getLoadedCount(selectedCategory.value, selectedSubcategory.value)
    const newCount = Math.min(currentCount + scrollLoadCount, totalEventsCount.value)
    console.log('加载更多: 从', currentCount, '到', newCount, '总数:', totalEventsCount.value)
    setLoadedCount(selectedCategory.value, selectedSubcategory.value, newCount)
  }

  // 切换分类时重置
  function selectCategory(categoryKey) {
    selectedCategory.value = categoryKey
    selectedSubcategory.value = null
    currentPage.value = 1
    // 清空加载记录,确保从初始数量开始
    loadedCounts.value = {}
    // 初始加载10条
    setLoadedCount(categoryKey, null, initialLoadCount)
    console.log('选择大类:', categoryKey, '初始加载:', initialLoadCount, '条')
  }

  function selectSubcategory(subcategoryKey) {
    selectedSubcategory.value = subcategoryKey
    currentPage.value = 1
    // 初始加载10条
    setLoadedCount(selectedCategory.value, subcategoryKey, initialLoadCount)
    console.log('选择子类:', subcategoryKey, '初始加载:', initialLoadCount, '条')
  }

  return {
    selectedCategory,
    selectedSubcategory,
    currentPage,
    recentEvents,
    filteredEvents,
    currentPageEvents,
    totalPages,
    hasMore,
    totalEventsCount,
    goToPage,
    nextPage,
    prevPage,
    loadMore,
    selectCategory,
    selectSubcategory
  }
}
