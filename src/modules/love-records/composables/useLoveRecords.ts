import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { initialLoveData } from '../mock/records'
import type { Anniversary, LoveData, LoveRecord, RecordCategory, RecordDraft, ViewKey } from '../types/records'
import { daysBetween, nextOccurrence, parseLocalDate } from '../utils/date'

const STORAGE_KEY = 'diary-love-album-v2'

// 初始数据始终深拷贝，避免用户编辑时污染作为“恢复示例数据”使用的常量。
function cloneInitialData(): LoveData {
  return structuredClone(initialLoveData)
}

function loadData(): LoveData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return cloneInitialData()
    const parsed = JSON.parse(raw) as LoveData
    return parsed.relationship && Array.isArray(parsed.records) ? parsed : cloneInitialData()
  } catch {
    return cloneInitialData()
  }
}

export function useLoveRecords() {
  // 页面状态与业务数据集中在 composable 中，视图组件只负责展示和派发用户操作。
  const data = ref<LoveData>(loadData())
  const activeView = ref<ViewKey>('timeline')
  const activeFilter = ref<'全部' | RecordCategory>('全部')
  const selectedId = ref<string | null>(null)
  const editingId = ref<string | null>(null)
  const drawerMode = ref<'detail' | 'form' | null>(null)

  const sortedRecords = computed(() => [...data.value.records].sort((a, b) => b.date.localeCompare(a.date)))
  const filteredRecords = computed(() => activeFilter.value === '全部'
    ? sortedRecords.value
    : sortedRecords.value.filter((item) => item.category === activeFilter.value || item.tags.includes(activeFilter.value)))
  const selectedRecord = computed(() => data.value.records.find((item) => item.id === selectedId.value) ?? null)
  const editingRecord = computed(() => data.value.records.find((item) => item.id === editingId.value) ?? null)

  const togetherDays = computed(() => Math.max(1, daysBetween(parseLocalDate(data.value.relationship.startDate), new Date()) + 1))
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

  function persist(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data.value))
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
  }

  function closeDrawer(): void {
    drawerMode.value = null
    selectedId.value = null
    editingId.value = null
  }

  function saveRecord(draft: RecordDraft): void {
    // 编辑时保留原坐标；新记录未选经纬度时使用城市中心作为安全降级点。
    const fallbackPoint = { lat: 29.56, lng: 106.57, x: 52, y: 52 }
    if (draft.id) {
      const index = data.value.records.findIndex((item) => item.id === draft.id)
      if (index >= 0) data.value.records[index] = { ...data.value.records[index], ...draft, id: draft.id }
    } else {
      data.value.records.unshift({ ...draft, id: crypto.randomUUID(), point: fallbackPoint })
    }
    persist()
    closeDrawer()
  }

  function deleteRecord(id: string): void {
    data.value.records = data.value.records.filter((item) => item.id !== id)
    persist()
    closeDrawer()
  }

  function toggleImportant(id: string): void {
    const item = data.value.records.find((record) => record.id === id)
    if (item) { item.important = !item.important; persist() }
  }

  function navigateRecord(direction: -1 | 1): void {
    if (!selectedId.value) return
    const index = sortedRecords.value.findIndex((item) => item.id === selectedId.value)
    const next = sortedRecords.value[index + direction]
    if (next) selectedId.value = next.id
  }

  function updateRelationship(startDate: string, partnerName: string): void {
    data.value.relationship.startDate = startDate
    data.value.relationship.partnerName = partnerName.trim() || '未命名'
    persist()
  }

  function saveAnniversaries(items: Anniversary[]): void {
    data.value.relationship.anniversaries = items
    persist()
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
    data.value = parsed
    persist()
  }

  function clearData(): void {
    data.value.records = []
    persist()
    closeDrawer()
  }

  function resetData(): void {
    data.value = cloneInitialData()
    persist()
  }

  function onKeydown(event: KeyboardEvent): void {
    // 只在详情抽屉打开时接管快捷键，避免干扰设置表单中的正常键盘操作。
    if (drawerMode.value !== 'detail') return
    if (event.key === 'Escape') closeDrawer()
    if (event.key === 'ArrowLeft') navigateRecord(-1)
    if (event.key === 'ArrowRight') navigateRecord(1)
  }

  onMounted(() => window.addEventListener('keydown', onKeydown))
  onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))

  return {
    data, activeView, activeFilter, drawerMode, filteredRecords, sortedRecords, selectedRecord, editingRecord,
    togetherDays, upcomingAnniversaries, locations, stats, relatedRecords, switchView, openDetail, openForm,
    closeDrawer, saveRecord, deleteRecord, toggleImportant, navigateRecord, updateRelationship,
    saveAnniversaries, exportData, importData, clearData, resetData,
  }
}
