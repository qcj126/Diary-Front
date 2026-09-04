import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import {
  clearRecordsApi,
  deleteRecordApi,
  loadLoveData,
  queryLocationOptionsApi,
  replaceLoveDataApi,
  saveAnniversariesApi,
  saveRecordApi,
  saveRelationshipApi,
} from '../api/loveRecords'
import { initialLoveData } from '../mock/records'
import type { Anniversary, LoveData, LoveLocationOption, LoveRecord, RecordCategory, RecordDraft, ViewKey } from '../types/records'
import { daysBetween, nextOccurrence, parseLocalDate } from '../utils/date'

// 初始数据始终深拷贝，避免用户编辑时污染作为“恢复示例数据”使用的常量。
function cloneInitialData(): LoveData {
  return structuredClone(initialLoveData)
}

function emptyData(): LoveData {
  return {
    relationship: {
      startDate: new Date().toISOString().slice(0, 10),
      partnerName: '未命名',
      anniversaries: [],
    },
    records: [],
  }
}

export function useLoveRecords() {
  // 页面状态与业务数据集中在 composable 中，视图组件只负责展示和派发用户操作。
  const data = ref<LoveData>(emptyData())
  const loading = ref(false)
  const error = ref('')
  const activeView = ref<ViewKey>('timeline')
  const activeFilter = ref<'全部' | RecordCategory>('全部')
  const selectedId = ref<string | null>(null)
  const editingId = ref<string | null>(null)
  const drawerMode = ref<'detail' | 'form' | null>(null)
  const locationOptions = ref<LoveLocationOption[]>([])
  const locationsLoading = ref(false)

  const sortedRecords = computed(() => [...data.value.records].sort((a, b) => b.date.localeCompare(a.date)))
  const filteredRecords = computed(() => activeFilter.value === '全部'
    ? sortedRecords.value
    : sortedRecords.value.filter((item) => item.category === activeFilter.value || item.tags.includes(activeFilter.value)))
  const selectedRecord = computed(() => data.value.records.find((item) => item.id === selectedId.value) ?? null)
  const editingRecord = computed(() => data.value.records.find((item) => item.id === editingId.value) ?? null)

  const togetherStartDate = computed(() => {
    const anniversaries = data.value.relationship.anniversaries
    const relationshipAnniversary = anniversaries.find((item) =>
      /(恋爱纪念日|在一起|相恋|确定关系)/.test(item.name.trim()),
    ) ?? anniversaries[0]
    return relationshipAnniversary?.date || data.value.relationship.startDate
  })
  const togetherDays = computed(() => Math.max(1, daysBetween(parseLocalDate(togetherStartDate.value), new Date()) + 1))
  const upcomingAnniversaries = computed(() => data.value.relationship.anniversaries.map((item) => {
    const nextDate = nextOccurrence(item.date)
    return { ...item, nextDate, daysLeft: daysBetween(new Date(), nextDate) }
  }).sort((a, b) => a.daysLeft - b.daysLeft))

  const locations = computed(() => {
    // 以地点名聚合访问次数；同名地点共享坐标，并保留关联记录 ID 供地图打开详情。
    const map = new Map<string, { name: string; count: number; latest: string; point: LoveRecord['point']; recordIds: string[] }>()
    sortedRecords.value.forEach((item) => {
      if (!item.location) return
      const current = map.get(item.location)
      if (current) {
        current.count += 1
        current.recordIds.push(item.id)
        if (item.date > current.latest) current.latest = item.date
      } else map.set(item.location, { name: item.location, count: 1, latest: item.date, point: item.point, recordIds: [item.id] })
    })
    return [...map.values()].sort((a, b) => b.count - a.count)
  })

  const stats = computed(() => ({
    records: data.value.records.length,
    locations: locations.value.length,
    photos: data.value.records.reduce((sum, item) => sum + item.images.length, 0),
    trips: data.value.records.filter((item) => item.category === '旅行').length,
    favoriteLocation: locations.value[0]?.name ?? '暂无',
  }))

  const relatedRecords = computed(() => {
    if (!selectedRecord.value) return []
    return sortedRecords.value.filter((item) => item.id !== selectedRecord.value?.id && (
      item.location === selectedRecord.value?.location || item.tags.some((tag) => selectedRecord.value?.tags.includes(tag))
    )).slice(0, 3)
  })

  async function refreshData(): Promise<void> {
    loading.value = true
    error.value = ''
    try {
      data.value = await loadLoveData((relationship) => {
        data.value = { ...data.value, relationship }
      })
    } catch (caught) {
      error.value = caught instanceof Error ? caught.message : '恋爱记录加载失败'
      throw caught
    } finally {
      loading.value = false
    }
  }

  function switchView(view: ViewKey): void {
    activeView.value = view
    closeDrawer()
  }

  function openDetail(id: string): void {
    selectedId.value = id
    drawerMode.value = 'detail'
  }

  function openForm(id: string | null = null): void {
    editingId.value = id
    drawerMode.value = 'form'
    void refreshLocationOptions()
  }

  async function refreshLocationOptions(): Promise<void> {
    const coupleId = data.value.relationship.id
    if (!coupleId) {
      locationOptions.value = []
      return
    }
    locationsLoading.value = true
    try {
      locationOptions.value = await queryLocationOptionsApi(coupleId)
    } catch (caught) {
      error.value = caught instanceof Error ? caught.message : '已有地点加载失败'
    } finally {
      locationsLoading.value = false
    }
  }

  function closeDrawer(): void {
    drawerMode.value = null
    selectedId.value = null
    editingId.value = null
  }

  async function saveRecord(draft: RecordDraft): Promise<void> {
    const current = draft.id
      ? data.value.records.find((item) => item.id === draft.id) ?? null
      : null
    await saveRecordApi(data.value.relationship, draft, current)
    await refreshData()
    closeDrawer()
  }

  async function deleteRecord(id: string): Promise<void> {
    await deleteRecordApi(id)
    await refreshData()
    closeDrawer()
  }

  async function toggleImportant(id: string): Promise<void> {
    const item = data.value.records.find((record) => record.id === id)
    if (!item) return
    await saveRecordApi(data.value.relationship, { ...item, important: !item.important }, item)
    await refreshData()
  }

  function navigateRecord(direction: -1 | 1): void {
    if (!selectedId.value) return
    const index = sortedRecords.value.findIndex((item) => item.id === selectedId.value)
    const next = sortedRecords.value[index + direction]
    if (next) selectedId.value = next.id
  }

  async function updateRelationship(startDate: string, partnerName: string): Promise<void> {
    data.value.relationship = await saveRelationshipApi(data.value.relationship, startDate, partnerName)
  }

  async function saveAnniversaries(items: Anniversary[]): Promise<void> {
    data.value.relationship = await saveAnniversariesApi(data.value.relationship, items)
  }

  function exportData(): void {
    // Blob 下载不会把用户数据上传到任何服务，适合作为本地纪念册的离线备份。
    const blob = new Blob([JSON.stringify(data.value, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `恋爱纪念册-${new Date().toISOString().slice(0, 10)}.json`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  async function importData(file: File): Promise<void> {
    const parsed = JSON.parse(await file.text()) as LoveData
    if (!parsed.relationship || !Array.isArray(parsed.records)) throw new Error('文件格式不正确')
    await replaceLoveDataApi(data.value, parsed)
    await refreshData()
  }

  async function clearData(): Promise<void> {
    await clearRecordsApi(data.value.records)
    await refreshData()
    closeDrawer()
  }

  async function resetData(): Promise<void> {
    await replaceLoveDataApi(data.value, cloneInitialData())
    await refreshData()
  }

  function onKeydown(event: KeyboardEvent): void {
    // 只在详情抽屉打开时接管快捷键，避免干扰设置表单中的正常键盘操作。
    if (drawerMode.value !== 'detail') return
    if (event.key === 'Escape') closeDrawer()
    if (event.key === 'ArrowLeft') navigateRecord(-1)
    if (event.key === 'ArrowRight') navigateRecord(1)
  }

  onMounted(() => {
    window.addEventListener('keydown', onKeydown)
    void refreshData().catch(() => undefined)
  })
  onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))

  return {
    data, loading, error, activeView, activeFilter, drawerMode, filteredRecords, sortedRecords, selectedRecord, editingRecord,
    togetherDays, upcomingAnniversaries, locations, locationOptions, locationsLoading, stats, relatedRecords, switchView, openDetail, openForm,
    closeDrawer, saveRecord, deleteRecord, toggleImportant, navigateRecord, updateRelationship,
    saveAnniversaries, exportData, importData, clearData, resetData, refreshData,
  }
}
