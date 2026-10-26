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
      <TimelineView
        v-if="activeView === 'timeline'"
        :records="filteredRecords"
        :analysis-states="sentimentStatuses"
        @open="openDetail"
        @create="openForm()"
        @analyze="handleLoveRecordSentimentAnalysis"
      />
      <AlbumView v-else-if="activeView === 'album'" :records="sortedRecords" @open="openDetail" />
      <MapView v-else-if="activeView === 'map'" :locations="locations" @open="openDetail" />
      <YearReviewView v-else-if="activeView === 'review'" :records="sortedRecords" :locations="locations" @open="openDetail" />
      <SettingsView
        v-else
        :relationship="data.relationship"
        @relationship="handleRelationship"
        @delete-relationship="handleDeleteRelationship"
        @anniversaries="handleAnniversaries"
        @export="exportData"
        @import="handleImport"
        @clear="handleClear"
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

    <div v-if="sentimentResult" class="sentiment-result-backdrop" @click.self="closeSentimentResult">
      <section class="sentiment-result-dialog" role="dialog" aria-modal="true" aria-labelledby="sentiment-result-title">
        <header>
          <div>
            <p>AI LOVE ANALYSIS</p>
            <h2 id="sentiment-result-title">{{ sentimentResult.title || '恋爱记录情感分析' }}</h2>
          </div>
          <button type="button" aria-label="关闭情感分析结果" @click="closeSentimentResult"><span class="material-symbols-outlined">close</span></button>
        </header>
        <div class="sentiment-summary">
          <span>{{ sentimentResult.sentimentLabel || '未分类' }}</span>
          <strong>{{ sentimentResult.sentimentScore ?? '—' }}</strong>
          <small>情感分数</small>
        </div>
        <section>
          <h3>分析摘要</h3>
          <p>{{ sentimentResult.analysisSummary || '暂未返回分析摘要。' }}</p>
        </section>
        <section>
          <h3>温和建议</h3>
          <p>{{ sentimentResult.suggestion || '暂未返回建议。' }}</p>
        </section>
      </section>
    </div>

    <LoveBottomBar :year="currentYear" :stats="footerStats" />
    <Transition name="toast"><div v-if="notice" class="global-notice"><span class="material-symbols-outlined">{{ noticeError ? 'error' : 'check_circle' }}</span>{{ notice }}</div></Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
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
import { submitLoveRecordSentimentAnalysis } from './api/loveRecords'
import { queryAiTaskResult, queryAiTaskStatus } from '../ai-results/api/aiResults.js'
import { saveTrackedAiTask } from '../ai-results/taskStore.js'
import type { Anniversary, LoveRecord, RecordCategory, RecordDraft } from './types/records'

const emit = defineEmits<{ back: [] }>()

const {
  data, loading, error, activeView, activeFilter, drawerMode, filteredRecords, sortedRecords, selectedRecord, editingRecord,
  togetherDays, upcomingAnniversaries, locations, locationOptions, locationsLoading, relatedRecords, switchView, openDetail, openForm,
  closeDrawer, saveRecord, deleteRecord, toggleImportant, navigateRecord, updateRelationship,
  deleteRelationship, saveAnniversaries, exportData, importData, clearData,
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
const sentimentStatuses = ref<Record<string, string>>({})
const sentimentResult = ref<SentimentResult | null>(null)
const sentimentPollTimers = new Map<string, number>()

type SentimentResult = {
  title?: string
  sentimentLabel?: string
  sentimentScore?: number
  analysisSummary?: string
  suggestion?: string
}

const ACTIVE_SENTIMENT_STATUSES = new Set(['SUBMITTING', 'PENDING', 'QUEUED', 'RUNNING', 'RETRY_WAIT'])

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

function handleDeleteRelationship(): void {
  void runMutation(deleteRelationship, '情侣关系已删除')
}

function handleAnniversaries(items: Anniversary[]): void {
  void runMutation(() => saveAnniversaries(items), '纪念日已同步')
}

function handleClear(): void {
  void runMutation(clearData, '恋爱记录已清空')
}

function showNotice(message: string, isError = false): void {
  notice.value = message
  noticeError.value = isError
  window.clearTimeout(noticeTimer)
  noticeTimer = window.setTimeout(() => { notice.value = '' }, 2400)
}

function createClientRequestId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `love-ai-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function setSentimentStatus(recordId: string, status: string): void {
  sentimentStatuses.value = { ...sentimentStatuses.value, [recordId]: status }
}

function clearSentimentPoll(recordId: string): void {
  const timer = sentimentPollTimers.get(recordId)
  if (timer) window.clearTimeout(timer)
  sentimentPollTimers.delete(recordId)
}

function isSentimentTaskTerminal(status: string): boolean {
  return ['SUCCESS', 'FAILED', 'CANCELLED'].includes(status)
}

async function pollLoveRecordSentiment(record: LoveRecord, taskId: string, clientRequestId: string): Promise<void> {
  try {
    const statusDetail = await queryAiTaskStatus(taskId, 2)
    const status = String(statusDetail?.status ?? 'PENDING').toUpperCase()
    setSentimentStatus(record.id, status)
    saveTrackedAiTask({
      taskId,
      status,
      flag: 'LOVE_RECORD',
      aiApplication: 2,
      universalId: record.id,
      clientRequestId,
      title: record.title,
    })

    if (status === 'SUCCESS') {
      const result = await queryAiTaskResult(taskId, 2)
      saveTrackedAiTask({
        taskId,
        status,
        flag: 'LOVE_RECORD',
        aiApplication: 2,
        universalId: record.id,
        clientRequestId,
        title: record.title,
        result,
      })
      sentimentResult.value = { ...result, title: result?.title || record.title }
      clearSentimentPoll(record.id)
      showNotice('情感分析已完成')
      return
    }

    if (isSentimentTaskTerminal(status)) {
      clearSentimentPoll(record.id)
      showNotice(statusDetail?.errorMessage || '情感分析任务未完成', true)
      return
    }

    sentimentPollTimers.set(record.id, window.setTimeout(() => {
      void pollLoveRecordSentiment(record, taskId, clientRequestId)
    }, 3000))
  } catch (caught) {
    clearSentimentPoll(record.id)
    setSentimentStatus(record.id, 'FAILED')
    showNotice(caught instanceof Error ? caught.message : '情感分析状态查询失败', true)
  }
}

async function handleLoveRecordSentimentAnalysis(recordId: string): Promise<void> {
  const record = data.value.records.find((item) => item.id === recordId)
  if (!record || ACTIVE_SENTIMENT_STATUSES.has(String(sentimentStatuses.value[recordId] ?? '').toUpperCase())) return

  const clientRequestId = createClientRequestId()
  setSentimentStatus(recordId, 'SUBMITTING')
  try {
    const submitted = await submitLoveRecordSentimentAnalysis({
      clientRequestId,
      aiType: 1,
      loveRecordId: record.id,
    })
    const taskId = String(submitted?.taskId ?? '').trim()
    if (!taskId) throw new Error('情感分析任务未返回任务编号')

    const status = String(submitted?.status || 'PENDING').toUpperCase()
    setSentimentStatus(recordId, status)
    saveTrackedAiTask({
      taskId,
      status,
      flag: 'LOVE_RECORD',
      aiApplication: 2,
      universalId: record.id,
      clientRequestId,
      title: record.title,
    })
    showNotice('情感分析任务已提交')
    void pollLoveRecordSentiment(record, taskId, clientRequestId)
  } catch (caught) {
    setSentimentStatus(recordId, 'FAILED')
    showNotice(caught instanceof Error ? caught.message : '提交情感分析失败', true)
  }
}

function closeSentimentResult(): void {
  sentimentResult.value = null
}

onBeforeUnmount(() => {
  sentimentPollTimers.forEach((timer) => window.clearTimeout(timer))
  sentimentPollTimers.clear()
})
</script>

<style scoped>
.love-album-app{position:fixed;inset:0;z-index:1000;display:grid;grid-template-areas:'top top' 'side main' 'foot foot';grid-template-columns:240px minmax(0,1fr);grid-template-rows:70px minmax(0,1fr) 36px;overflow:hidden;color:#433435;background:#fdf6f0;font-family:'Noto Sans SC','Microsoft YaHei',system-ui,sans-serif}.main-stage{grid-area:main;min-width:0;min-height:0;overflow:auto;background:radial-gradient(circle at 80% 8%,rgba(255,202,194,.18),transparent 24rem),#fdf8f4;transition:padding-right .3s ease}.drawer-shell{position:absolute;z-index:40;top:70px;right:0;bottom:36px;width:380px;min-height:0;overflow:hidden}.drawer-enter-active,.drawer-leave-active{transition:transform .3s ease,opacity .3s ease}.drawer-enter-from,.drawer-leave-to{opacity:0;transform:translateX(100%)}.sync-loading{position:fixed;z-index:75;left:50%;top:84px;display:flex;align-items:center;gap:7px;padding:9px 14px;border-radius:999px;color:#715f5e;background:rgba(255,255,255,.94);box-shadow:0 8px 24px rgba(68,42,40,.14);font-size:10px}.sync-loading .material-symbols-outlined{color:#ff657d;font-size:17px;animation:sync-spin 1.2s linear infinite}.global-notice{position:fixed;z-index:80;right:24px;bottom:52px;display:flex;align-items:center;gap:6px;padding:9px 13px;border-radius:999px;color:#fff;background:#4b383a;box-shadow:0 12px 28px rgba(55,35,37,.22);font-size:9px}.global-notice .material-symbols-outlined{font-size:15px}.toast-enter-active,.toast-leave-active{transition:.2s}.toast-enter-from,.toast-leave-to{opacity:0;transform:translateY(8px)}@keyframes sync-spin{to{transform:rotate(360deg)}}
.sentiment-result-backdrop{position:fixed;z-index:82;inset:0;display:grid;place-items:center;padding:24px;background:rgba(54,34,38,.34);backdrop-filter:blur(3px)}.sentiment-result-dialog{width:min(440px,100%);padding:22px;border:1px solid rgba(255,255,255,.78);border-radius:20px;color:#493739;background:#fffaf7;box-shadow:0 24px 65px rgba(52,31,35,.28)}.sentiment-result-dialog header{display:flex;align-items:flex-start;justify-content:space-between;gap:16px}.sentiment-result-dialog header p{margin:0;color:#d66478;font-size:10px;font-weight:800;letter-spacing:.14em}.sentiment-result-dialog h2{margin:5px 0 0;font-size:21px}.sentiment-result-dialog header button{display:grid;width:30px;height:30px;place-items:center;border:0;border-radius:50%;color:#775d60;background:#f5eae6;cursor:pointer}.sentiment-result-dialog header .material-symbols-outlined{font-size:18px}.sentiment-summary{display:grid;grid-template-columns:1fr auto;gap:2px 14px;align-items:center;margin:20px 0 16px;padding:13px 16px;border-radius:13px;color:#b84f64;background:#fff0f2}.sentiment-summary span{font-size:14px;font-weight:800}.sentiment-summary strong{grid-row:span 2;font-size:32px;line-height:1}.sentiment-summary small{font-size:10px}.sentiment-result-dialog section{margin-top:13px;padding-top:13px;border-top:1px solid #f0e2dd}.sentiment-result-dialog section h3{margin:0 0 6px;font-size:12px}.sentiment-result-dialog section p{margin:0;color:#745d5f;font-size:13px;line-height:1.7}
@media(min-width:1440px){.drawer-open .main-stage{padding-right:380px}}
@media(max-width:1023px){.love-album-app{min-width:1024px}}
</style>
