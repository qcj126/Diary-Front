<template>
  <div class="love-album-app" :class="{ 'drawer-open': drawerMode }">
    <LoveTopBar
      :together-days="togetherDays"
      :partner-name="data.relationship.partnerName"
      :next-anniversary="nextAnniversary"
      @back="emit('back')"
      @home="switchView('timeline')"
      @settings="switchView('settings')"
    />
    <LoveSidebar
      :active-view="activeView"
      :filter="activeFilter"
      :records="sortedRecords"
      :anniversaries="upcomingAnniversaries"
      @view="switchView"
      @filter="applyFilter"
      @create="openForm()"
      @settings="switchView('settings')"
    />

    <main class="main-stage" @click.self="closeDrawer">
      <TimelineView v-if="activeView === 'timeline'" :records="filteredRecords" @open="openDetail" @create="openForm()" />
      <AlbumView v-else-if="activeView === 'album'" :records="sortedRecords" @open="openDetail" />
      <MapView v-else-if="activeView === 'map'" :locations="locations" @open="openDetail" />
      <YearReviewView v-else-if="activeView === 'review'" :records="sortedRecords" :locations="locations" @open="openDetail" />
      <SettingsView
        v-else
        :relationship="data.relationship"
        @relationship="handleRelationship"
        @anniversaries="handleAnniversaries"
        @export="exportData"
        @import="handleImport"
        @clear="handleClear"
        @reset="handleReset"
      />
    </main>

    <div v-if="loading" class="sync-loading"><span class="material-symbols-outlined">cloud_sync</span>正在同步服务端数据…</div>

    <Transition name="drawer">
      <div v-if="drawerMode" class="drawer-shell">
        <RecordDetailDrawer
          v-if="drawerMode === 'detail' && selectedRecord"
          :record="selectedRecord"
          :related="relatedRecords"
          @close="closeDrawer"
          @navigate="navigateRecord"
          @edit="openForm"
          @delete="handleDeleteRecord"
          @important="handleToggleImportant"
          @map="showRecordOnMap"
          @open="openDetail"
        />
        <RecordFormDrawer
          v-else-if="drawerMode === 'form'"
          :record="editingRecord"
          :locations="locationOptions"
          :locations-loading="locationsLoading"
          @close="closeDrawer"
          @save="handleSaveRecord"
        />
      </div>
    </Transition>

    <LoveBottomBar :year="currentYear" :stats="footerStats" />
    <Transition name="toast"><div v-if="notice" class="global-notice"><span class="material-symbols-outlined">{{ noticeError ? 'error' : 'check_circle' }}</span>{{ notice }}</div></Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import LoveTopBar from './components/LoveTopBar.vue'
import LoveSidebar from './components/LoveSidebar.vue'
import LoveBottomBar from './components/LoveBottomBar.vue'
import RecordDetailDrawer from './components/RecordDetailDrawer.vue'
import RecordFormDrawer from './components/RecordFormDrawer.vue'
import TimelineView from './pages/TimelineView.vue'
import AlbumView from './pages/AlbumView.vue'
import MapView from './pages/MapView.vue'
import YearReviewView from './pages/YearReviewView.vue'
import SettingsView from './pages/SettingsView.vue'
import { useLoveRecords } from './composables/useLoveRecords'
import type { Anniversary, RecordCategory, RecordDraft } from './types/records'

const emit = defineEmits<{ back: [] }>()

const {
  data, loading, error, activeView, activeFilter, drawerMode, filteredRecords, sortedRecords, selectedRecord, editingRecord,
  togetherDays, upcomingAnniversaries, locations, locationOptions, locationsLoading, stats, relatedRecords, switchView, openDetail, openForm,
  closeDrawer, saveRecord, deleteRecord, toggleImportant, navigateRecord, updateRelationship,
  saveAnniversaries, exportData, importData, clearData, resetData,
} = useLoveRecords()

const currentYear = new Date().getFullYear()
const nextAnniversary = computed(() => upcomingAnniversaries.value[0] ?? { name: '等待添加', daysLeft: 0 })
const footerStats = computed(() => {
  const records = activeView.value === 'timeline' ? filteredRecords.value : sortedRecords.value
  const locationCounts = new Map<string, number>()
  records.forEach((item) => { if (item.location) locationCounts.set(item.location, (locationCounts.get(item.location) ?? 0) + 1) })
  const favoriteLocation = [...locationCounts].sort((a, b) => b[1] - a[1])[0]?.[0] ?? '暂无'
  return {
    records: records.length,
    locations: locationCounts.size,
    photos: records.reduce((sum, item) => sum + item.images.length, 0),
    favoriteLocation,
  }
})
const notice = ref('')
const noticeError = ref(false)
let noticeTimer = 0

watch(error, (message) => {
  if (message) showNotice(message, true)
})

function applyFilter(value: '全部' | RecordCategory): void {
  activeFilter.value = value
  switchView('timeline')
}

function showRecordOnMap(): void {
  switchView('map')
}

async function handleImport(file: File): Promise<void> {
  try {
    await importData(file)
    showNotice('数据导入成功')
  } catch (error) {
    showNotice(error instanceof Error ? error.message : '导入失败，请检查文件', true)
  }
}

async function runMutation(operation: () => Promise<void>, successMessage: string): Promise<void> {
  try {
    await operation()
    showNotice(successMessage)
  } catch (caught) {
    showNotice(caught instanceof Error ? caught.message : '服务端操作失败', true)
  }
}

function handleSaveRecord(draft: RecordDraft): void {
  void runMutation(() => saveRecord(draft), draft.id ? '记录修改成功' : '记录新增成功')
}

function handleDeleteRecord(id: string): void {
  void runMutation(() => deleteRecord(id), '记录删除成功')
}

function handleToggleImportant(id: string): void {
  void runMutation(() => toggleImportant(id), '重要标记已同步')
}

function handleRelationship(startDate: string, partnerName: string): void {
  void runMutation(() => updateRelationship(startDate, partnerName), '关系信息已同步')
}

function handleAnniversaries(items: Anniversary[]): void {
  void runMutation(() => saveAnniversaries(items), '纪念日已同步')
}

function handleClear(): void {
  void runMutation(clearData, '恋爱记录已清空')
}

function handleReset(): void {
  void runMutation(resetData, '示例数据已写入服务端')
}

function showNotice(message: string, isError = false): void {
  notice.value = message
  noticeError.value = isError
  window.clearTimeout(noticeTimer)
  noticeTimer = window.setTimeout(() => { notice.value = '' }, 2400)
}
</script>

<style scoped>
.love-album-app{position:fixed;inset:0;z-index:1000;display:grid;grid-template-areas:'top top' 'side main' 'foot foot';grid-template-columns:240px minmax(0,1fr);grid-template-rows:70px minmax(0,1fr) 36px;overflow:hidden;color:#433435;background:#fdf6f0;font-family:'Noto Sans SC','Microsoft YaHei',system-ui,sans-serif}.main-stage{grid-area:main;min-width:0;min-height:0;overflow:auto;background:radial-gradient(circle at 80% 8%,rgba(255,202,194,.18),transparent 24rem),#fdf8f4;transition:padding-right .3s ease}.drawer-shell{position:absolute;z-index:40;top:70px;right:0;bottom:36px;width:380px;min-height:0;overflow:hidden}.drawer-enter-active,.drawer-leave-active{transition:transform .3s ease,opacity .3s ease}.drawer-enter-from,.drawer-leave-to{opacity:0;transform:translateX(100%)}.sync-loading{position:fixed;z-index:75;left:50%;top:84px;display:flex;align-items:center;gap:7px;padding:9px 14px;border-radius:999px;color:#715f5e;background:rgba(255,255,255,.94);box-shadow:0 8px 24px rgba(68,42,40,.14);font-size:10px}.sync-loading .material-symbols-outlined{color:#ff657d;font-size:17px;animation:sync-spin 1.2s linear infinite}.global-notice{position:fixed;z-index:80;right:24px;bottom:52px;display:flex;align-items:center;gap:6px;padding:9px 13px;border-radius:999px;color:#fff;background:#4b383a;box-shadow:0 12px 28px rgba(55,35,37,.22);font-size:9px}.global-notice .material-symbols-outlined{font-size:15px}.toast-enter-active,.toast-leave-active{transition:.2s}.toast-enter-from,.toast-leave-to{opacity:0;transform:translateY(8px)}@keyframes sync-spin{to{transform:rotate(360deg)}}
@media(min-width:1440px){.drawer-open .main-stage{padding-right:380px}}
@media(max-width:1023px){.love-album-app{min-width:1024px}}
</style>
