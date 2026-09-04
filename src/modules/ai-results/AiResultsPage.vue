<template>
  <section class="ai-results-page">
    <header class="page-header">
      <div>
        <p class="eyebrow">AI TASK CENTER</p>
        <h1>AI 分析结果</h1>
        <p class="page-description">追踪异步分析进度，在任务完成后查看结构化结果。</p>
      </div>
      <button class="refresh-all-button" type="button" :disabled="refreshingAll" @click="refreshAll">
        <span class="material-symbols-outlined" :class="{ spinning: refreshingAll }">refresh</span>
        {{ refreshingAll ? '刷新中' : '刷新全部' }}
      </button>
    </header>

    <section class="summary-grid" aria-label="AI任务概览">
      <article class="summary-card">
        <span class="summary-icon total"><span class="material-symbols-outlined">data_table</span></span>
        <div><strong>{{ taskSummary.total }}</strong><span>全部任务</span></div>
      </article>
      <article class="summary-card">
        <span class="summary-icon running"><span class="material-symbols-outlined">pending</span></span>
        <div><strong>{{ taskSummary.processing }}</strong><span>执行中</span></div>
      </article>
      <article class="summary-card">
        <span class="summary-icon success"><span class="material-symbols-outlined">check_circle</span></span>
        <div><strong>{{ taskSummary.success }}</strong><span>已完成</span></div>
      </article>
      <article class="summary-card">
        <span class="summary-icon failed"><span class="material-symbols-outlined">error</span></span>
        <div><strong>{{ taskSummary.failed }}</strong><span>异常终止</span></div>
      </article>
    </section>

    <form class="task-query-card" @submit.prevent="addAndQueryTask">
      <div class="query-copy">
        <span class="material-symbols-outlined">manage_search</span>
        <div><strong>查询指定任务</strong><small>任务会保存在当前浏览器，便于后续查看。</small></div>
      </div>
      <label>
        <span>任务 ID</span>
        <input v-model.trim="taskIdInput" inputmode="numeric" placeholder="请输入 taskId" />
      </label>
      <button class="query-button" type="submit" :disabled="addingTask">
        {{ addingTask ? '查询中...' : '查询任务' }}
      </button>
      <p v-if="queryError" class="query-error">{{ queryError }}</p>
    </form>

    <section class="workspace-card">
      <aside class="task-list-panel">
        <div class="filters">
          <label class="search-field">
            <span class="material-symbols-outlined">search</span>
            <input v-model.trim="keyword" placeholder="搜索任务 ID 或标题" />
          </label>
          <div class="filter-row">
            <select v-model="statusFilter" aria-label="按状态筛选">
              <option value="ALL">全部状态</option>
              <option v-for="item in STATUS_OPTIONS" :key="item.value" :value="item.value">
                {{ item.label }}
              </option>
            </select>
            <select v-model="applicationFilter" aria-label="按应用方向筛选">
              <option value="ALL">全部方向</option>
              <option v-for="item in availableApplications" :key="item.value" :value="String(item.value)">
                {{ item.label }}
              </option>
            </select>
          </div>
        </div>

        <div v-if="filteredTasks.length" class="task-list">
          <button
            v-for="task in filteredTasks"
            :key="task.taskId"
            type="button"
            class="task-item"
            :class="{ active: task.taskId === selectedTaskId }"
            @click="selectedTaskId = task.taskId"
          >
            <span class="task-item-top">
              <span class="application-mark">{{ applicationShortName(task.aiApplication) }}</span>
              <span class="status-badge" :class="statusTone(task.status)">
                <span class="status-dot"></span>{{ statusLabel(task.status) }}
              </span>
            </span>
            <strong>{{ task.title || getAiApplicationLabel(task.aiApplication) }}</strong>
            <span class="task-id"># {{ task.taskId }}</span>
            <span class="task-meta">
              <span>{{ getAiFlagLabel(task.flag) }}</span>
              <time>{{ formatDateTime(task.submittedAt || task.createTime) }}</time>
            </span>
          </button>
        </div>

        <div v-else class="empty-list">
          <span class="material-symbols-outlined">inbox</span>
          <strong>暂无匹配任务</strong>
          <p>提交一次 AI 分析，或在上方输入任务 ID。</p>
        </div>
      </aside>

      <article v-if="selectedTask" class="task-detail">
        <header class="detail-header">
          <div>
            <div class="detail-title-row">
              <span class="status-badge large" :class="statusTone(selectedTask.status)">
                <span class="status-dot"></span>{{ statusLabel(selectedTask.status) }}
              </span>
              <span class="detail-task-id">任务 #{{ selectedTask.taskId }}</span>
            </div>
            <h2>{{ selectedTask.title || getAiApplicationLabel(selectedTask.aiApplication) }}</h2>
            <p>{{ getAiFlagLabel(selectedTask.flag) }} · {{ getAiApplicationLabel(selectedTask.aiApplication) }}</p>
          </div>
          <div class="detail-actions">
            <button
              type="button"
              class="icon-action"
              :disabled="isTaskLoading(selectedTask.taskId)"
              title="刷新任务"
              @click="refreshTask(selectedTask)"
            >
              <span class="material-symbols-outlined" :class="{ spinning: isTaskLoading(selectedTask.taskId) }">refresh</span>
            </button>
            <button type="button" class="icon-action danger" title="移除任务" @click="removeTask(selectedTask.taskId)">
              <span class="material-symbols-outlined">delete</span>
            </button>
          </div>
        </header>

        <p v-if="taskErrors[selectedTask.taskId]" class="detail-error">
          <span class="material-symbols-outlined">warning</span>{{ taskErrors[selectedTask.taskId] }}
        </p>

        <section v-if="!isTerminal(selectedTask.status)" class="progress-panel">
          <div class="progress-copy">
            <div>
              <span class="material-symbols-outlined">auto_awesome</span>
              <strong>{{ progressTitle(selectedTask.status) }}</strong>
            </div>
            <span>{{ taskProgress(selectedTask.status) }}%</span>
          </div>
          <div class="progress-track"><span :style="{ width: `${taskProgress(selectedTask.status)}%` }"></span></div>
          <p>页面会每 4 秒自动刷新执行状态，离开本页不会影响后台任务。</p>
        </section>

        <section v-if="selectedTask.status === 'SUCCESS'" class="result-section">
          <div class="section-heading">
            <div><span class="material-symbols-outlined">analytics</span><h3>分析结果</h3></div>
            <time>完成于 {{ formatDateTime(selectedTask.finishTime) }}</time>
          </div>
          <div v-if="selectedResultEntries.length" class="result-grid">
            <article v-for="entry in selectedResultEntries" :key="entry.key" class="result-card">
              <span>{{ entry.label }}</span>
              <strong>{{ entry.value }}</strong>
            </article>
          </div>
          <div v-else class="result-empty">
            <span class="material-symbols-outlined">hourglass_top</span>
            <p>任务已完成，结果数据正在同步，请稍后刷新。</p>
          </div>
        </section>

        <section v-else-if="isFailure(selectedTask.status)" class="failure-panel">
          <span class="material-symbols-outlined">report</span>
          <div>
            <h3>{{ statusLabel(selectedTask.status) }}</h3>
            <p>{{ selectedTask.errorMessage || '任务未能生成分析结果。' }}</p>
            <code v-if="selectedTask.errorCode">{{ selectedTask.errorCode }}</code>
          </div>
        </section>

        <section class="task-info-section">
          <div class="section-heading">
            <div><span class="material-symbols-outlined">info</span><h3>任务信息</h3></div>
          </div>
          <dl class="info-grid">
            <div><dt>应用方向</dt><dd>{{ getAiApplicationLabel(selectedTask.aiApplication) }}</dd></div>
            <div><dt>应用来源</dt><dd>{{ getAiFlagLabel(selectedTask.flag) }}</dd></div>
            <div><dt>关联数据 ID</dt><dd>{{ selectedTask.result?.universalId || selectedTask.universalId || '—' }}</dd></div>
            <div><dt>结果 ID</dt><dd>{{ selectedTask.statusDetail?.resultId || selectedTask.result?.aiInfoId || '—' }}</dd></div>
            <div><dt>执行次数</dt><dd>{{ attemptText(selectedTask) }}</dd></div>
            <div><dt>版本</dt><dd>{{ selectedTask.statusDetail?.versionId ?? '—' }}</dd></div>
          </dl>
        </section>

        <section v-if="selectedTimeline.length" class="timeline-section">
          <div class="section-heading">
            <div><span class="material-symbols-outlined">schedule</span><h3>执行轨迹</h3></div>
          </div>
          <ol class="execution-timeline">
            <li v-for="item in selectedTimeline" :key="item.key">
              <span></span><div><strong>{{ item.label }}</strong><time>{{ formatDateTime(item.time) }}</time></div>
            </li>
          </ol>
        </section>
      </article>

      <article v-else class="empty-detail">
        <span class="material-symbols-outlined">neurology</span>
        <h2>选择一个 AI 任务</h2>
        <p>这里将展示执行进度、异常信息以及最终的结构化分析结果。</p>
      </article>
    </section>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { AI_APPLICATION_OPTIONS } from '../../constants/ai.js'
import { queryAiTaskResult, queryAiTaskStatus } from './api/aiResults.js'
import {
  getAiApplicationLabel,
  getAiFlagLabel,
  loadTrackedAiTasks,
  removeTrackedAiTask,
  saveTrackedAiTask,
} from './taskStore.js'

const props = defineProps({
  initialTaskId: {
    type: [String, Number],
    default: '',
  },
})

const STATUS_OPTIONS = [
  { value: 'PENDING', label: '待处理' },
  { value: 'QUEUED', label: '已排队' },
  { value: 'RUNNING', label: '运行中' },
  { value: 'RETRY_WAIT', label: '重试等待' },
  { value: 'SUCCESS', label: '成功' },
  { value: 'FAILED', label: '失败' },
  { value: 'CANCELLED', label: '已取消' },
  { value: 'DEAD_LETTER', label: '死信' },
]
const TERMINAL_STATUSES = new Set(['SUCCESS', 'FAILED', 'CANCELLED', 'DEAD_LETTER'])
const FAILURE_STATUSES = new Set(['FAILED', 'CANCELLED', 'DEAD_LETTER'])
const RESULT_LABELS = {
  calory: '热量',
  protein: '蛋白质',
  fat: '脂肪',
  carbohydrate: '碳水化合物',
  sugar: '糖',
  sodium: '钠',
}
const RESULT_META_FIELDS = new Set([
  'taskId', 'status', 'aiInfoId', 'universalId', 'flag', 'errorCode', 'errorMessage',
])
const POLL_INTERVAL_MS = 4000

const tasks = ref(loadTrackedAiTasks())
const selectedTaskId = ref(tasks.value[0]?.taskId || '')
const loadingTaskIds = ref(new Set())
const taskErrors = ref({})
const refreshingAll = ref(false)
const addingTask = ref(false)
const taskIdInput = ref(String(props.initialTaskId ?? '').trim())
const queryError = ref('')
const keyword = ref('')
const statusFilter = ref('ALL')
const applicationFilter = ref('ALL')
let pollTimer = 0

const selectedTask = computed(() => tasks.value.find((task) => task.taskId === selectedTaskId.value) || null)
const taskSummary = computed(() => ({
  total: tasks.value.length,
  processing: tasks.value.filter((task) => !isTerminal(task.status)).length,
  success: tasks.value.filter((task) => task.status === 'SUCCESS').length,
  failed: tasks.value.filter((task) => isFailure(task.status)).length,
}))
const availableApplications = computed(() => {
  const options = [...AI_APPLICATION_OPTIONS]
  const knownValues = new Set(options.map((item) => item.value))
  tasks.value.forEach((task) => {
    const value = Number(task.aiApplication)
    if (Number.isFinite(value) && !knownValues.has(value)) {
      knownValues.add(value)
      options.push({ value, label: getAiApplicationLabel(value) })
    }
  })
  return options
})
const filteredTasks = computed(() => {
  const normalizedKeyword = keyword.value.toLowerCase()
  return tasks.value.filter((task) => {
    const matchesKeyword = !normalizedKeyword || [
      task.taskId,
      task.title,
      getAiApplicationLabel(task.aiApplication),
      getAiFlagLabel(task.flag),
    ].join(' ').toLowerCase().includes(normalizedKeyword)
    const matchesStatus = statusFilter.value === 'ALL' || task.status === statusFilter.value
    const matchesApplication = applicationFilter.value === 'ALL' ||
      String(task.aiApplication) === applicationFilter.value
    return matchesKeyword && matchesStatus && matchesApplication
  })
})
const selectedResultEntries = computed(() => Object.entries(selectedTask.value?.result || {})
  .filter(([key, value]) => !RESULT_META_FIELDS.has(key) && value !== null && value !== undefined && value !== '')
  .map(([key, value]) => ({ key, label: RESULT_LABELS[key] || key, value })))
const selectedTimeline = computed(() => {
  const detail = selectedTask.value?.statusDetail || {}
  return [
    { key: 'created', label: '任务已创建', time: detail.createTime || selectedTask.value?.submittedAt },
    { key: 'queued', label: '进入执行队列', time: detail.queueTime },
    { key: 'started', label: '开始执行', time: detail.startTime },
    { key: 'finished', label: isFailure(selectedTask.value?.status) ? '任务已终止' : '执行完成', time: detail.finishTime },
  ].filter((item) => item.time)
})

function statusLabel(status) {
  return STATUS_OPTIONS.find((item) => item.value === status)?.label || status || '状态未知'
}

function statusTone(status) {
  if (status === 'SUCCESS') return 'success'
  if (isFailure(status)) return 'failed'
  if (status === 'RUNNING') return 'running'
  if (status === 'RETRY_WAIT') return 'retry'
  return 'pending'
}

function isTerminal(status) {
  return TERMINAL_STATUSES.has(status)
}

function isFailure(status) {
  return FAILURE_STATUSES.has(status)
}

function taskProgress(status) {
  return { PENDING: 12, QUEUED: 28, RUNNING: 68, RETRY_WAIT: 46, SUCCESS: 100 }[status] ||
    (isFailure(status) ? 100 : 8)
}

function progressTitle(status) {
  return {
    PENDING: '等待任务调度',
    QUEUED: '已进入执行队列',
    RUNNING: 'AI 正在生成分析结果',
    RETRY_WAIT: '等待自动重试',
  }[status] || '任务处理中'
}

function applicationShortName(code) {
  const label = getAiApplicationLabel(code)
  return label.length > 4 ? label.slice(0, 4) : label
}

function formatDateTime(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (!Number.isNaN(date.getTime())) {
    return new Intl.DateTimeFormat('zh-CN', {
      month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false,
    }).format(date)
  }
  return String(value).replace('T', ' ').slice(0, 19)
}

function attemptText(task) {
  const detail = task.statusDetail || {}
  if (detail.attemptCount === null || detail.attemptCount === undefined) return '—'
  return detail.maxAttempts ? `${detail.attemptCount} / ${detail.maxAttempts}` : String(detail.attemptCount)
}

function isTaskLoading(taskId) {
  return loadingTaskIds.value.has(String(taskId))
}

function setTaskLoading(taskId, loading) {
  const next = new Set(loadingTaskIds.value)
  if (loading) next.add(String(taskId))
  else next.delete(String(taskId))
  loadingTaskIds.value = next
}

function updateTask(taskId, patch) {
  const value = String(taskId)
  let updatedTask = null
  tasks.value = tasks.value.map((task) => {
    if (task.taskId !== value) return task
    updatedTask = { ...task, ...patch }
    return updatedTask
  })
  if (updatedTask) saveTrackedAiTask(updatedTask)
  return updatedTask
}

async function refreshTask(task, silent = false) {
  if (!task || isTaskLoading(task.taskId)) return
  setTaskLoading(task.taskId, true)
  if (!silent) taskErrors.value = { ...taskErrors.value, [task.taskId]: '' }

  try {
    const statusDetail = await queryAiTaskStatus(task.taskId)
    const patch = {
      status: statusDetail?.status || task.status,
      statusDetail,
      createTime: statusDetail?.createTime || task.createTime,
      finishTime: statusDetail?.finishTime || task.finishTime,
      errorCode: statusDetail?.errorCode || '',
      errorMessage: statusDetail?.errorMessage || '',
    }
    if (statusDetail?.status === 'SUCCESS') {
      const result = await queryAiTaskResult(task.taskId)
      patch.result = result
      patch.flag = result?.flag || task.flag
      patch.universalId = result?.universalId || task.universalId
    }
    updateTask(task.taskId, patch)
    taskErrors.value = { ...taskErrors.value, [task.taskId]: '' }
  } catch (error) {
    taskErrors.value = {
      ...taskErrors.value,
      [task.taskId]: error instanceof Error ? error.message : '任务查询失败',
    }
  } finally {
    setTaskLoading(task.taskId, false)
  }
}

async function refreshAll() {
  if (refreshingAll.value || !tasks.value.length) return
  refreshingAll.value = true
  try {
    await Promise.allSettled(tasks.value.map((task) => refreshTask(task, true)))
  } finally {
    refreshingAll.value = false
  }
}

async function addAndQueryTask() {
  queryError.value = ''
  if (!/^\d+$/.test(taskIdInput.value)) {
    queryError.value = '请输入有效的数字任务 ID'
    return
  }

  addingTask.value = true
  const existingTask = tasks.value.find((task) => task.taskId === taskIdInput.value)
  const trackedTask = saveTrackedAiTask(existingTask || {
    taskId: taskIdInput.value,
    status: 'PENDING',
  })
  tasks.value = [trackedTask, ...tasks.value.filter((task) => task.taskId !== trackedTask.taskId)]
  selectedTaskId.value = trackedTask.taskId

  try {
    await refreshTask(trackedTask)
    if (taskErrors.value[trackedTask.taskId]) queryError.value = taskErrors.value[trackedTask.taskId]
  } finally {
    addingTask.value = false
  }
}

function removeTask(taskId) {
  removeTrackedAiTask(taskId)
  tasks.value = tasks.value.filter((task) => task.taskId !== String(taskId))
  selectedTaskId.value = tasks.value[0]?.taskId || ''
}

function schedulePolling() {
  window.clearInterval(pollTimer)
  pollTimer = window.setInterval(() => {
    tasks.value.filter((task) => !isTerminal(task.status)).forEach((task) => refreshTask(task, true))
  }, POLL_INTERVAL_MS)
}

onMounted(() => {
  if (taskIdInput.value) addAndQueryTask()
  else refreshAll()
  schedulePolling()
})
onBeforeUnmount(() => window.clearInterval(pollTimer))
</script>

<style scoped>
.ai-results-page {
  min-height: 100vh;
  padding: 32px clamp(20px, 3vw, 46px) 46px;
  color: var(--dashboard-text, #1c1b1b);
  background:
    radial-gradient(circle at 92% 4%, rgba(124, 92, 255, 0.13), transparent 27%),
    radial-gradient(circle at 7% 22%, rgba(61, 168, 245, 0.1), transparent 24%),
    var(--dashboard-bg, #fdf8f8);
  font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

button, input, select { font: inherit; }
button { cursor: pointer; }
button:disabled { cursor: wait; opacity: 0.6; }

.page-header, .detail-header, .section-heading, .progress-copy, .task-item-top, .task-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.page-header { gap: 24px; margin-bottom: 24px; }
.eyebrow { margin: 0 0 7px; color: #7357d9; font-size: 11px; font-weight: 800; letter-spacing: 0.14em; }
.page-header h1 { margin: 0; color: var(--dashboard-text-strong, #17131f); font-size: clamp(28px, 3vw, 40px); letter-spacing: -0.04em; }
.page-description { margin: 9px 0 0; color: var(--dashboard-text-muted, #6f6978); font-size: 14px; }

.refresh-all-button, .query-button, .icon-action {
  border: 1px solid var(--dashboard-border-soft, #ded7e4);
  background: var(--dashboard-surface, #fff);
  color: var(--dashboard-text, #26202d);
}
.refresh-all-button { display: flex; align-items: center; gap: 8px; min-height: 42px; padding: 0 17px; border-radius: 12px; font-weight: 700; }
.refresh-all-button:hover, .icon-action:hover { border-color: #8b71e6; color: #7357d9; }

.summary-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; margin-bottom: 16px; }
.summary-card { display: flex; align-items: center; gap: 14px; min-height: 92px; padding: 18px; border: 1px solid var(--dashboard-border-soft, #e1dbe5); border-radius: 18px; background: color-mix(in srgb, var(--dashboard-surface, #fff) 92%, transparent); box-shadow: 0 12px 34px rgba(45, 33, 66, 0.055); }
.summary-icon { display: grid; width: 46px; height: 46px; place-items: center; border-radius: 14px; }
.summary-icon.total { background: #eee9ff; color: #7050d6; }
.summary-icon.running { background: #e2f3ff; color: #2278ae; }
.summary-icon.success { background: #e0f6eb; color: #21855a; }
.summary-icon.failed { background: #fee8e5; color: #c74d44; }
.summary-card div { display: grid; gap: 2px; }
.summary-card strong { color: var(--dashboard-text-strong, #17131f); font-size: 24px; }
.summary-card div span { color: var(--dashboard-text-muted, #736d7a); font-size: 12px; }

.task-query-card { display: grid; grid-template-columns: minmax(220px, 1fr) minmax(240px, 1.35fr) auto; gap: 12px; align-items: end; margin-bottom: 16px; padding: 16px; border: 1px solid var(--dashboard-border-soft, #e1dbe5); border-radius: 18px; background: var(--dashboard-surface, #fff); }
.query-copy { display: flex; align-items: center; gap: 11px; align-self: center; }
.query-copy > span { color: #7357d9; font-size: 28px; }
.query-copy div { display: grid; gap: 3px; }
.query-copy strong { font-size: 14px; }
.query-copy small { color: var(--dashboard-text-muted, #77717e); font-size: 10px; }
.task-query-card label { display: grid; gap: 6px; min-width: 0; }
.task-query-card label > span { color: var(--dashboard-text-muted, #746d7b); font-size: 11px; font-weight: 700; }
.task-query-card input, .task-query-card select, .filters input, .filters select { min-width: 0; min-height: 40px; padding: 0 11px; border: 1px solid var(--dashboard-border-soft, #ded7e4); border-radius: 10px; outline: none; background: var(--dashboard-surface-soft, #fbf9fc); color: var(--dashboard-text, #26202d); }
.task-query-card input:focus, .task-query-card select:focus, .filters input:focus, .filters select:focus { border-color: #8d73e7; box-shadow: 0 0 0 3px rgba(120, 87, 221, 0.12); }
.query-button { min-height: 40px; padding: 0 18px; border: 0; border-radius: 10px; background: linear-gradient(135deg, #7456da, #9276eb); color: #fff; font-weight: 750; }
.query-error { grid-column: 2 / -1; margin: 0; color: #bd4039; font-size: 12px; }

.workspace-card { display: grid; grid-template-columns: minmax(290px, 0.37fr) minmax(0, 1fr); min-height: 620px; overflow: hidden; border: 1px solid var(--dashboard-border-soft, #ded7e4); border-radius: 22px; background: var(--dashboard-surface, #fff); box-shadow: 0 18px 55px rgba(43, 31, 62, 0.07); }
.task-list-panel { display: flex; min-width: 0; min-height: 0; flex-direction: column; border-right: 1px solid var(--dashboard-border-soft, #e2dce7); background: color-mix(in srgb, var(--dashboard-surface-soft, #faf7fb) 92%, transparent); }
.filters { display: grid; gap: 10px; padding: 16px; border-bottom: 1px solid var(--dashboard-border-soft, #e2dce7); }
.search-field { position: relative; }
.search-field > span { position: absolute; top: 10px; left: 10px; z-index: 1; color: #8d8791; font-size: 20px; }
.filters .search-field input { width: 100%; padding-left: 37px; }
.filter-row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.task-list { display: grid; gap: 9px; overflow-y: auto; padding: 12px; }
.task-item { display: grid; gap: 8px; width: 100%; padding: 14px; text-align: left; border: 1px solid transparent; border-radius: 14px; background: transparent; color: var(--dashboard-text, #26202d); transition: 0.2s ease; }
.task-item:hover { border-color: var(--dashboard-border-soft, #ded7e4); background: var(--dashboard-surface, #fff); }
.task-item.active { border-color: rgba(126, 94, 224, 0.42); background: var(--dashboard-surface, #fff); box-shadow: 0 8px 24px rgba(75, 52, 133, 0.1); }
.application-mark { display: grid; min-width: 56px; height: 25px; padding: 0 8px; place-items: center; border-radius: 7px; background: #eee9ff; color: #6949cb; font-size: 10px; font-weight: 800; }
.status-badge { display: inline-flex; width: max-content; align-items: center; gap: 6px; padding: 5px 8px; border-radius: 999px; font-size: 10px; font-weight: 800; }
.status-badge.large { padding: 7px 11px; font-size: 11px; }
.status-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
.status-badge.success { background: #e0f6eb; color: #19754e; }
.status-badge.failed { background: #fee8e5; color: #b94039; }
.status-badge.running { background: #e2f3ff; color: #1f72a4; }
.status-badge.retry { background: #fff0d9; color: #a86613; }
.status-badge.pending { background: #edeaf0; color: #67606d; }
.task-item > strong { overflow: hidden; font-size: 13px; text-overflow: ellipsis; white-space: nowrap; }
.task-id { color: var(--dashboard-text-muted, #827b88); font-family: ui-monospace, SFMono-Regular, Consolas, monospace; font-size: 11px; }
.task-meta { color: var(--dashboard-text-muted, #827b88); font-size: 10px; }

.empty-list, .empty-detail, .result-empty { display: grid; place-items: center; align-content: center; text-align: center; color: var(--dashboard-text-muted, #7d7683); }
.empty-list { flex: 1; padding: 40px 24px; }
.empty-list > span, .empty-detail > span { margin-bottom: 12px; color: #9b87d8; font-size: 46px; }
.empty-list p, .empty-detail p, .result-empty p { max-width: 350px; margin: 7px 0 0; font-size: 12px; line-height: 1.7; }

.task-detail { min-width: 0; padding: clamp(20px, 3vw, 34px); }
.detail-header { align-items: flex-start; gap: 20px; margin-bottom: 22px; }
.detail-title-row { display: flex; align-items: center; gap: 10px; }
.detail-task-id { color: var(--dashboard-text-muted, #7e7784); font-family: ui-monospace, SFMono-Regular, Consolas, monospace; font-size: 11px; }
.detail-header h2 { margin: 12px 0 5px; color: var(--dashboard-text-strong, #17131f); font-size: 24px; }
.detail-header p { margin: 0; color: var(--dashboard-text-muted, #756e7c); font-size: 12px; }
.detail-actions { display: flex; gap: 8px; }
.icon-action { display: grid; width: 38px; height: 38px; place-items: center; border-radius: 10px; }
.icon-action.danger:hover { border-color: #d86158; color: #c7453d; }
.detail-error { display: flex; align-items: center; gap: 8px; margin: 0 0 18px; padding: 11px 13px; border-radius: 10px; background: #fff0ee; color: #ad3c35; font-size: 12px; }

.progress-panel { margin-bottom: 24px; padding: 18px; border: 1px solid rgba(100, 160, 208, 0.28); border-radius: 16px; background: linear-gradient(135deg, rgba(230, 245, 255, 0.8), rgba(239, 235, 255, 0.7)); }
.progress-copy > div, .section-heading > div { display: flex; align-items: center; gap: 8px; }
.progress-copy .material-symbols-outlined, .section-heading .material-symbols-outlined { color: #7357d9; }
.progress-copy > span { color: #7357d9; font-size: 12px; font-weight: 800; }
.progress-track { height: 7px; margin: 15px 0 10px; overflow: hidden; border-radius: 999px; background: rgba(105, 89, 132, 0.14); }
.progress-track span { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, #5ba3df, #835de0); transition: width 0.4s ease; }
.progress-panel p { margin: 0; color: #756d80; font-size: 11px; }

.result-section, .task-info-section, .timeline-section { margin-top: 24px; }
.section-heading { margin-bottom: 13px; }
.section-heading h3 { margin: 0; font-size: 15px; }
.section-heading time { color: var(--dashboard-text-muted, #827b88); font-size: 10px; }
.result-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 11px; }
.result-card { display: grid; gap: 9px; min-height: 92px; padding: 16px; border: 1px solid var(--dashboard-border-soft, #e1dbe5); border-radius: 14px; background: var(--dashboard-surface-soft, #fbf9fc); }
.result-card span { color: var(--dashboard-text-muted, #77707e); font-size: 11px; }
.result-card strong { overflow-wrap: anywhere; color: var(--dashboard-text-strong, #17131f); font-size: 20px; }
.result-empty { min-height: 130px; border: 1px dashed var(--dashboard-border, #d6cedb); border-radius: 14px; }
.result-empty span { color: #9079d5; }

.failure-panel { display: flex; gap: 14px; margin: 22px 0; padding: 18px; border: 1px solid rgba(205, 74, 64, 0.25); border-radius: 15px; background: #fff2f0; color: #a73933; }
.failure-panel > span { font-size: 28px; }
.failure-panel h3 { margin: 0 0 5px; font-size: 15px; }
.failure-panel p { margin: 0 0 8px; font-size: 12px; }
.failure-panel code { font-size: 10px; }

.info-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); margin: 0; overflow: hidden; border: 1px solid var(--dashboard-border-soft, #e1dbe5); border-radius: 14px; }
.info-grid div { min-width: 0; padding: 13px 15px; border-right: 1px solid var(--dashboard-border-soft, #e1dbe5); border-bottom: 1px solid var(--dashboard-border-soft, #e1dbe5); }
.info-grid div:nth-child(3n) { border-right: 0; }
.info-grid div:nth-last-child(-n + 3) { border-bottom: 0; }
.info-grid dt { margin-bottom: 5px; color: var(--dashboard-text-muted, #7b7481); font-size: 10px; }
.info-grid dd { overflow: hidden; margin: 0; text-overflow: ellipsis; white-space: nowrap; font-size: 12px; font-weight: 700; }

.execution-timeline { display: grid; gap: 0; margin: 0; padding: 0; list-style: none; }
.execution-timeline li { position: relative; display: grid; grid-template-columns: 18px 1fr; gap: 10px; min-height: 44px; }
.execution-timeline li::before { position: absolute; top: 12px; bottom: -3px; left: 4px; width: 1px; content: ''; background: var(--dashboard-border, #d6cedb); }
.execution-timeline li:last-child::before { display: none; }
.execution-timeline li > span { z-index: 1; width: 9px; height: 9px; margin-top: 4px; border: 2px solid var(--dashboard-surface, #fff); border-radius: 50%; background: #8263df; box-shadow: 0 0 0 2px rgba(130, 99, 223, 0.2); }
.execution-timeline li div { display: flex; justify-content: space-between; gap: 18px; }
.execution-timeline strong { font-size: 11px; }
.execution-timeline time { color: var(--dashboard-text-muted, #7c7582); font-size: 10px; }
.empty-detail { min-height: 620px; padding: 40px; }
.empty-detail h2 { margin: 0; font-size: 20px; }

.spinning { animation: spin 0.85s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 1180px) {
  .task-query-card { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .query-copy { grid-column: 1 / -1; }
  .query-button { min-height: 40px; }
  .query-error { grid-column: 1 / -1; }
  .workspace-card { grid-template-columns: minmax(260px, 0.42fr) minmax(0, 1fr); }
  .result-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 760px) {
  .ai-results-page { padding: 22px 14px 30px; }
  .page-header { align-items: flex-start; }
  .summary-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .task-query-card { grid-template-columns: 1fr; }
  .query-copy, .query-error { grid-column: auto; }
  .workspace-card { display: block; }
  .task-list-panel { max-height: 430px; border-right: 0; border-bottom: 1px solid var(--dashboard-border-soft, #e2dce7); }
  .task-detail { padding: 20px 16px; }
  .result-grid, .info-grid { grid-template-columns: 1fr 1fr; }
  .info-grid div, .info-grid div:nth-child(3n), .info-grid div:nth-last-child(-n + 3) { border-right: 1px solid var(--dashboard-border-soft, #e1dbe5); border-bottom: 1px solid var(--dashboard-border-soft, #e1dbe5); }
  .info-grid div:nth-child(2n) { border-right: 0; }
  .info-grid div:nth-last-child(-n + 2) { border-bottom: 0; }
}

@media (max-width: 460px) {
  .page-header { display: grid; }
  .summary-grid, .result-grid, .info-grid { grid-template-columns: 1fr; }
  .filter-row { grid-template-columns: 1fr; }
  .info-grid div, .info-grid div:nth-child(2n), .info-grid div:nth-last-child(-n + 2) { border-right: 0; border-bottom: 1px solid var(--dashboard-border-soft, #e1dbe5); }
  .info-grid div:last-child { border-bottom: 0; }
}
</style>
