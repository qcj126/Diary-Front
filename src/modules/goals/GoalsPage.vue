<template>
  <section class="goals-page">
    <header class="goals-header">
      <h1>阶段目标</h1>
    </header>

    <section class="toolbar">
      <div class="actions">
        <button type="button" class="primary" @click="openCreate">
          <span class="material-symbols-outlined">add</span>
          增
        </button>
        <button type="button" @click="handleDelete">
          <span class="material-symbols-outlined">delete</span>
          删
        </button>
        <button type="button" @click="openEdit">
          <span class="material-symbols-outlined">edit</span>
          改
        </button>
        <button type="button" @click="queryPanelOpen = !queryPanelOpen">
          <span class="material-symbols-outlined">search</span>
          查
        </button>
        <button type="button" @click="exportOpen = true">
          <span class="material-symbols-outlined">ios_share</span>
          导出
        </button>
      </div>

      <form v-if="queryPanelOpen" class="query-panel" @submit.prevent="loadGoals(true)">
        <input v-model.trim="filters.creator" type="text" placeholder="创建人" />
        <select v-model.number="filters.category">
          <option :value="1">全部</option>
          <option v-for="(category, index) in categories" :key="category" :value="index + 2">{{ category }}</option>
        </select>
        <input v-model.trim="filters.title" type="text" placeholder="标题" />
        <input v-model.number="filters.recentDays" type="number" min="0" placeholder="最近X天" />
        <span class="date-picker-field">
          <button type="button" class="date-picker-btn" aria-label="选择日期" @click="openExactDatePicker">
            <span class="material-symbols-outlined">calendar_month</span>
          </button>
          <span v-if="filters.exactDate" class="date-picker-value">{{ filters.exactDate }}</span>
          <span v-else class="date-picker-placeholder">精确时间</span>
          <input ref="exactDateInput" v-model="filters.exactDate" class="date-picker-input" type="date" />
        </span>
        <select v-model.number="filters.ddl">
          <option :value="1">全部</option>
          <option :value="2">正常</option>
          <option :value="3">即将到期</option>
          <option :value="4">已到期</option>
        </select>
        <button type="submit" :disabled="loading">{{ loading ? '查询中' : '查询' }}</button>
        <button type="button" :disabled="loading" @click="resetFilters">重置</button>
      </form>
    </section>

    <section class="table-panel">
      <div class="table-wrap">
        <table>
          <colgroup>
            <col :style="{ width: `${columnWidths.main.controls}px` }" />
            <col :style="{ width: `${columnWidths.main.creator}px` }" />
            <col :style="{ width: `${columnWidths.main.category}px` }" />
            <col :style="{ width: `${columnWidths.main.title}px` }" />
            <col :style="{ width: `${columnWidths.main.content}px` }" />
            <col :style="{ width: `${columnWidths.main.hours}px` }" />
            <col :style="{ width: `${columnWidths.main.progress}px` }" />
            <col :style="{ width: `${columnWidths.main.estimated}px` }" />
            <col :style="{ width: `${columnWidths.main.status}px` }" />
            <col :style="{ width: `${columnWidths.main.ddl}px` }" />
            <col :style="{ width: `${columnWidths.main.date}px` }" />
            <col :style="{ width: `${columnWidths.main.date}px` }" />
            <col :style="{ width: `${columnWidths.main.stale}px` }" />
          </colgroup>
          <thead>
            <tr>
              <th class="goal-controls-col"></th>
              <th>创建人</th>
              <th>分类</th>
              <th>标题</th>
              <th>内容</th>
              <th>已学时长</th>
              <th>进度</th>
              <th>预计用时</th>
              <th>状态</th>
              <th>DDL</th>
              <th>创建时间</th>
              <th>修改时间</th>
              <th>距上次更新</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="goal in filteredGoals" :key="goal.id">
              <tr :class="{ selected: selectedIds.includes(goal.id), expanded: expandedIds.includes(goal.id) }">
                <td class="goal-controls-col">
                  <div class="goal-row-actions">
                    <label class="goal-control" aria-label="select stage goal">
                      <input v-model="selectedIds" type="checkbox" :value="goal.id" />
                    </label>
                    <button type="button" aria-label="toggle stage goal" @click="toggleExpand(goal.id)">
                      <span class="material-symbols-outlined">
                        {{ expandedIds.includes(goal.id) ? 'expand_less' : 'expand_more' }}
                      </span>
                    </button>
                    <button
                      type="button"
                      class="add-sub-goal-button"
                      :aria-label="`为${goal.title}添加小目标`"
                      title="添加小目标"
                      @click="openSubGoalEditor(goal)"
                    >
                      <span class="material-symbols-outlined">add</span>
                    </button>
                  </div>
                </td>
                <td>{{ goal.creator }}</td>
                <td><span class="tag">{{ goal.category }}</span></td>
                <td class="strong">{{ goal.title }}</td>
                <td class="content-cell">{{ goal.content }}</td>
                <td>{{ formatHours(goal.learnedHours) }}h</td>
                <td>
                  <div class="progress-cell">
                    <span>{{ goal.progress }}%</span>
                    <i><b :style="{ width: `${goal.progress}%` }" /></i>
                  </div>
                </td>
                <td>{{ formatHours(goal.estimatedHours) }}h</td>
                <td><span :class="['ddl-status', ddlStatusInfo(goal.ddl).type]">{{ ddlStatusInfo(goal.ddl).label }}</span></td>
                <td>{{ formatDateTime(goal.ddl) }}</td>
                <td><span class="time-stack"><span>{{ datePart(goal.createdAt) }}</span><span>{{ timePart(goal.createdAt) }}</span></span></td>
                <td><span class="time-stack"><span>{{ datePart(goal.updatedAt) }}</span><span>{{ timePart(goal.updatedAt) }}</span></span></td>
                <td>
                  <span :class="['stale-pill', { warn: goal.daysSinceUpdate >= 3 }]">
                    {{ goal.daysSinceUpdate }}天
                  </span>
                </td>
              </tr>
              <tr v-if="expandedIds.includes(goal.id)" class="detail-row">
                <td colspan="13">
                  <div class="detail-card">
                    <div class="sub-table-wrap">
                      <table class="sub-table">
                        <colgroup>
                          <!-- 对齐到大分类列：小分类列宽使用大分类对应列宽，保证垂直对齐 -->
                          <col :style="{ width: `${columnWidths.main.controls}px` }" />
                          <col :style="{ width: `${columnWidths.main.creator}px` }" />
                          <col :style="{ width: `${columnWidths.main.category}px` }" />
                          <col :style="{ width: `${columnWidths.main.title}px` }" />
                          <col :style="{ width: `${columnWidths.main.content}px` }" />
                          <col :style="{ width: `${columnWidths.main.hours}px` }" />
                          <col :style="{ width: `${columnWidths.main.progress}px` }" />
                          <col :style="{ width: `${columnWidths.main.estimated}px` }" />
                          <col :style="{ width: `${columnWidths.main.status}px` }" />
                          <col :style="{ width: `${columnWidths.main.ddl}px` }" />
                          <col :style="{ width: `${columnWidths.main.date}px` }" />
                          <col :style="{ width: `${columnWidths.main.date}px` }" />
                          <col :style="{ width: `${columnWidths.main.stale}px` }" />
                        </colgroup>
                        <tbody>
                        <tr v-for="(sub, subIndex) in goal.subcategories" :key="sub.name">
                          <td></td>
                          <td class="sub-index">{{ circledIndex(subIndex) }}</td>
                          <td><span class="tag">{{ goal.category }}</span></td>
                          <td class="strong">{{ sub.name }}</td>
                          <td class="content-cell">{{ sub.content }}</td>
                          <td>{{ formatHours(sub.learnedHours) }}h</td>
                          <td>
                            <div class="sub-progress-with-controls">
                              <div class="sub-progress-controls-top" role="group" aria-label="sub progress controls">
                                <button type="button" class="sub-btn minus" :aria-label="`减少${sub.name}进度`" @click="changeSubHours(goal, subIndex, -1)">
                                  <span class="material-symbols-outlined">remove</span>
                                </button>

                                <div class="sub-progress-pct">{{ subProgress(sub) }}%</div>

                                <button type="button" class="sub-btn plus" :aria-label="`增加${sub.name}进度`" @click="changeSubHours(goal, subIndex, 1)">
                                  <span class="material-symbols-outlined">add</span>
                                </button>
                              </div>

                              <div class="progress-cell">
                                <i><b :style="{ width: `${subProgress(sub)}%` }" /></i>
                              </div>
                            </div>
                          </td>
                          <td>{{ formatHours(sub.estimatedHours) }}h</td>
                          <td><span :class="['ddl-status', ddlStatusInfo(sub.ddl).type]">{{ ddlStatusInfo(sub.ddl).label }}</span></td>
                          <td>{{ formatDateTime(sub.ddl) }}</td>
                          <td><span class="time-stack"><span>{{ datePart(sub.createdAt) }}</span><span>{{ timePart(sub.createdAt) }}</span></span></td>
                          <td><span class="time-stack"><span>{{ datePart(sub.updatedAt) }}</span><span>{{ timePart(sub.updatedAt) }}</span></span></td>
                          <td>
                              <span :class="['stale-pill', { warn: sub.daysSinceUpdate >= 3 }]">
                                {{ sub.daysSinceUpdate }}天
                              </span>
                          </td>
                        </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </td>
              </tr>
            </template>
            <tr v-if="!loading && !filteredGoals.length">
              <td colspan="13" class="empty-cell">暂无阶段目标</td>
            </tr>
            <tr v-if="loading">
              <td colspan="13" class="empty-cell">加载中...</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <div v-if="toast.visible" class="toast" :class="{ leaving: toast.leaving }">{{ toast.message }}</div>

    <div v-if="confirmDeleteOpen" class="modal-backdrop" @click.self="confirmDeleteOpen = false">
      <section class="confirm-modal">
        <h2>确定执行删除吗？</h2>
        <p>将删除已勾选的 {{ selectedIds.length }} 条阶段目标记录。</p>
        <div>
          <button type="button" :disabled="deleting" @click="confirmDeleteOpen = false">取消</button>
          <button type="button" class="danger" :disabled="deleting" @click="confirmDelete">{{ deleting ? '删除中' : '确定删除' }}</button>
        </div>
      </section>
    </div>

    <div v-if="exportOpen" class="modal-backdrop" @click.self="exportOpen = false">
      <form class="export-modal" @submit.prevent="confirmExport">
        <h2>导出阶段目标</h2>
        <div class="export-fields">
          <label>
            <span>文件格式</span>
            <select v-model.number="exportForm.exportType">
              <option :value="1">PDF</option>
              <option :value="2">图片</option>
              <option :value="3">Excel</option>
            </select>
          </label>
          <label>
            <span>过去天数</span>
            <select v-model.number="exportForm.lastDays">
              <option :value="0">全部</option>
              <option v-for="day in exportDayOptions" :key="day" :value="day">{{ day }} 天</option>
            </select>
          </label>
          <label>
            <span>目标条数</span>
            <select v-model.number="exportForm.exportSize">
              <option v-for="size in exportSizeOptions" :key="size" :value="size">{{ size }} 条</option>
            </select>
          </label>
        </div>
        <footer>
          <button type="button" @click="exportOpen = false">取消导出</button>
          <button type="submit" class="primary" :disabled="exporting">
            {{ exporting ? '导出中' : '确认导出' }}
          </button>
        </footer>
      </form>
    </div>

    <div v-if="subGoalEditorOpen" class="modal-backdrop" @click.self="closeSubGoalEditor">
      <form class="sub-goal-modal" @submit.prevent="saveSubGoals">
        <header>
          <div>
            <span class="eyebrow">Sub Goals</span>
            <h2>添加小目标</h2>
            <p>阶段目标：{{ subGoalStage?.title }}</p>
          </div>
          <button type="button" aria-label="关闭" @click="closeSubGoalEditor">
            <span class="material-symbols-outlined">close</span>
          </button>
        </header>

        <div class="sub-goal-fields" role="group" aria-label="小目标列表">
          <div class="sub-goal-field-head" aria-hidden="true">
            <span>小目标标题</span>
            <span>小目标学习内容</span>
            <span>预计用时（小时）</span>
            <span></span>
          </div>
          <div v-for="(subGoal, index) in subGoalDrafts" :key="subGoal.key" class="sub-goal-field-row">
            <input
              v-model.trim="subGoal.title"
              required
              type="text"
              :aria-label="`第 ${index + 1} 个小目标标题`"
              placeholder="小目标标题"
            />
            <input
              v-model.trim="subGoal.content"
              required
              type="text"
              :aria-label="`第 ${index + 1} 个小目标学习内容`"
              placeholder="小目标学习内容"
            />
            <input
              v-model="subGoal.estimatedHours"
              required
              type="number"
              min="0"
              step="0.1"
              :aria-label="`第 ${index + 1} 个小目标预计用时`"
              placeholder="预计用时"
            />
            <button
              type="button"
              class="append-sub-goal-button"
              :aria-label="`在第 ${index + 1} 个小目标后新增一行`"
              title="继续添加小目标"
              @click="addSubGoalDraft(index)"
            >
              <span class="material-symbols-outlined">add</span>
            </button>
          </div>
        </div>

        <footer>
          <button type="button" :disabled="subGoalSaving" @click="closeSubGoalEditor">取消</button>
          <button type="submit" class="primary" :disabled="subGoalSaving">
            {{ subGoalSaving ? '保存中...' : '保存' }}
          </button>
        </footer>
      </form>
    </div>

    <div v-if="editorOpen" class="modal-backdrop" @click.self="closeEditor">
      <form class="editor-modal" @submit.prevent="saveGoal">
        <header>
          <div>
            <span class="eyebrow">{{ editorMode === 'create' ? 'Create' : 'Update' }}</span>
            <h2>{{ editorMode === 'create' ? '新增阶段目标' : '修改阶段目标' }}</h2>
          </div>
          <button type="button" aria-label="关闭" @click="closeEditor">
            <span class="material-symbols-outlined">close</span>
          </button>
        </header>

        <div class="stage-goal-block">
          <label>
            <span>标题</span>
            <input v-model.trim="draft.title" required type="text" />
          </label>
          <label>
            <span>分类</span>
            <select v-model="draft.category" required>
              <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
            </select>
          </label>
          <label>
            <span>阶段目标内容</span>
            <input v-model.trim="draft.content" required type="text" />
          </label>
        </div>
        <section class="sub-editor">
          <button v-if="editorMode === 'create'" type="button" class="add-inline-sub-goal" @click="addDraftSubcategory">
            <span class="material-symbols-outlined">add</span>
            添加小目标
          </button>
          <article v-for="(sub, index) in draft.subcategories" :key="index" class="stage-sub-goal-block">
            <label>
              <span>标题</span>
              <input v-model.trim="sub.name" type="text" placeholder="小目标标题" />
            </label>
            <label>
              <span>预计用时</span>
              <input v-model.number="sub.estimatedHours" type="number" min="0" step="0.1" placeholder="预计用时" />
            </label>
            <label>
              <span>学习内容</span>
              <input v-model.trim="sub.content" type="text" placeholder="小目标学习内容" />
            </label>
          </article>
        </section>
        <footer>
          <button type="button" @click="closeEditor">取消</button>
          <button type="submit" class="primary" :disabled="saving">{{ saving ? '保存中' : '保存' }}</button>
        </footer>
      </form>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { addGoal, batchAddSubGoals, deleteGoal, exportGoals, queryGoals, updateGoal } from './api/goals.js'

const categories = ['技术', '学习', '健康', '生活']

const columnWidths = {
  main: {
    controls: 78,
    creator: 70,
    category: 68,
    title: 118,
    content: 190,
    hours: 70,
    progress: 98,
    estimated: 78,
    status: 78,
    date: 96,
    ddl: 96,
    stale: 80,
  },
  sub: {
    title: 140,
    content: 300,
    hours: 90,
    progress: 140,
    estimated: 110,
    date: 120,
    stale: 120,
  },
}

const expandedIds = ref([])
const selectedIds = ref([])
const selectedSubGoalKeys = ref([])
const queryPanelOpen = ref(false)
const exactDateInput = ref(null)
const editorOpen = ref(false)
const editorMode = ref('create')
const editingId = ref(null)
const confirmDeleteOpen = ref(false)
const exportOpen = ref(false)
const exporting = ref(false)
const subGoalEditorOpen = ref(false)
const subGoalSaving = ref(false)
const subGoalStage = ref(null)
const subGoalDrafts = ref([])
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const syncingSubKey = ref('')
const toast = reactive({ visible: false, leaving: false, message: '' })
let toastTimer = 0
let toastLeaveTimer = 0
let subGoalDraftKey = 0

const exportDayOptions = [1, 3, 5, 7, 10, 15, 30]
const exportSizeOptions = [10, 20, 30, 40, 50, 100]
const exportForm = reactive({
  exportType: 1,
  lastDays: 7,
  exportSize: 10,
})

const STATIC_GOALS = [
  {
    id: 'static-stage-goal-1',
    userId: 10000,
    creator: 'Codex',
    category: '技术',
    title: '阶段目标示例',
    content: '用于验证阶段目标和小目标展示流程',
    learnedHours: 1,
    estimatedHours: 5,
    progress: 20,
    createdAt: '2026-08-06 09:00:00',
    ddl: '2026-08-20 18:00:00',
    updatedAt: '2026-08-06 09:00:00',
    daysSinceUpdate: 0,
    subcategories: [
      {
        id: 'static-sub-goal-1',
        stageId: 'static-stage-goal-1',
        name: '梳理需求',
        content: '整理阶段目标页面的查询和新增规则',
        learnedHours: 1,
        estimatedHours: 2,
        createdAt: '2026-08-06 09:00:00',
        ddl: '2026-08-12 18:00:00',
        updatedAt: '2026-08-06 09:00:00',
        daysSinceUpdate: 0,
      },
      {
        id: 'static-sub-goal-2',
        stageId: 'static-stage-goal-1',
        name: '完成联调',
        content: '验证新增、查询和筛选参数传递',
        learnedHours: 0,
        estimatedHours: 3,
        createdAt: '2026-08-06 09:00:00',
        ddl: '2026-08-20 18:00:00',
        updatedAt: '2026-08-06 09:00:00',
        daysSinceUpdate: 0,
      },
    ],
  },
]

const filters = reactive({
  creator: '',
  category: 1,
  title: '',
  recentDays: null,
  exactDate: '',
  ddl: 1,
})

const emptyDraft = () => ({
  title: '',
  category: '技术',
  content: '',
  subcategories: [],
})

const draft = reactive(emptyDraft())
const goals = ref(STATIC_GOALS.map((goal) => ({ ...goal, subcategories: goal.subcategories.map((sub) => ({ ...sub })) })))

function roundHours(value) {
  const number = Number(value)
  return Number.isFinite(number) ? Number(number.toFixed(1)) : 0
}

function formatHours(value) {
  return String(roundHours(value))
}

function circledIndex(index) {
  const circledNumbers = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩']
  return circledNumbers[index] ?? `${index + 1}.`
}

const filteredGoals = computed(() =>
  goals.value.filter((goal) => {
    const creatorHit = !filters.creator || goal.creator.includes(filters.creator)
    const categoryHit = filters.category === 1 || goal.category === categoryLabelFromValue(filters.category)
    const titleHit = !filters.title || goal.title.includes(filters.title)
    const recentHit = !Number(filters.recentDays) || goal.daysSinceUpdate <= Number(filters.recentDays)
    const exactDateHit = !filters.exactDate || datePart(goal.ddl) === filters.exactDate
    const ddlHit = matchesDdlStatus(goal.ddl, filters.ddl)
    return creatorHit && categoryHit && titleHit && recentHit && exactDateHit && ddlHit
  }),
)

function categoryLabelFromValue(value) {
  return categories[Number(value) - 2] ?? ''
}

function matchesDdlStatus(value, status) {
  if (status === 1) return true
  const ddlTime = new Date(value).getTime()
  if (!Number.isFinite(ddlTime)) return false
  const remainingMs = ddlTime - Date.now()
  if (status === 4) return remainingMs <= 0
  if (status === 3) return remainingMs > 0 && remainingMs < 5 * 60 * 60 * 1000
  if (status === 2) return remainingMs >= 5 * 60 * 60 * 1000
  return true
}

function ddlStatusInfo(value) {
  const ddlTime = new Date(value).getTime()
  if (!Number.isFinite(ddlTime)) return { label: '正常', type: 'normal' }

  const remainingMs = ddlTime - Date.now()
  if (remainingMs <= 0) return { label: '已过期', type: 'expired' }
  if (remainingMs < 5 * 60 * 60 * 1000) return { label: '即将过期', type: 'due-soon' }
  return { label: '正常', type: 'normal' }
}

function subProgress(sub) {
  return sub.estimatedHours ? Math.min(Math.round((sub.learnedHours / sub.estimatedHours) * 100), 100) : 0
}

function formatDateTime(value) {
  const { date, time } = normalizeDateTime(value)
  return date ? `${date} ${time}` : ''
}

function datePart(value) {
  return normalizeDateTime(value).date
}

function timePart(value) {
  return normalizeDateTime(value).time
}

function normalizeDateTime(value) {
  const text = String(value || '')
  const [date = '', time = '00:00:00'] = text.includes('T') ? text.replace('T', ' ').split('.')?.[0].split(' ') : text.split(' ')
  return {
    date,
    time: time || '00:00:00',
  }
}

function currentDateTime() {
  const now = new Date()
  const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
  return `${date} ${time}`
}

function subKey(goal, sub) {
  return `${goal.id}-${sub.id ?? sub.name}`
}

async function loadGoals(showSuccess = false) {
  loading.value = true
  try {
    const nextGoals = await queryGoals(filters)
    goals.value = nextGoals
    const ids = nextGoals.map((goal) => goal.id)
    selectedIds.value = selectedIds.value.filter((id) => ids.includes(id))
    expandedIds.value = expandedIds.value.filter((id) => ids.includes(id))
    const subKeys = nextGoals.flatMap((goal) => goal.subcategories.map((sub) => subKey(goal, sub)))
    selectedSubGoalKeys.value = selectedSubGoalKeys.value.filter((key) => subKeys.includes(key))
    if (showSuccess) showToast('查询完成')
  } catch (error) {
    goals.value = STATIC_GOALS.map((goal) => ({ ...goal, subcategories: goal.subcategories.map((sub) => ({ ...sub })) }))
    if (showSuccess) {
      showToast(error instanceof Error ? error.message : '查询阶段目标失败')
    }
  } finally {
    loading.value = false
  }
}

async function changeSubHours(goal, subIndex, delta) {
  const sub = goal.subcategories[subIndex]
  if (!sub || syncingSubKey.value) return

  const previous = {
    goalLearnedHours: goal.learnedHours,
    goalEstimatedHours: goal.estimatedHours,
    goalProgress: goal.progress,
    goalUpdatedAt: goal.updatedAt,
    goalDaysSinceUpdate: goal.daysSinceUpdate,
    subLearnedHours: sub.learnedHours,
    subUpdatedAt: sub.updatedAt,
    subDaysSinceUpdate: sub.daysSinceUpdate,
  }
  const nextHours = Math.min(Math.max((Number(sub.learnedHours) || 0) + delta, 0), Number(sub.estimatedHours) || 0)
  sub.learnedHours = roundHours(nextHours)
  sub.updatedAt = currentDateTime()
  sub.daysSinceUpdate = 0
  recalculateGoal(goal)
  syncingSubKey.value = subKey(goal, sub)

  try {
    await updateGoal(goal)
    showToast('进度已同步')
  } catch (error) {
    goal.learnedHours = previous.goalLearnedHours
    goal.estimatedHours = previous.goalEstimatedHours
    goal.progress = previous.goalProgress
    goal.updatedAt = previous.goalUpdatedAt
    goal.daysSinceUpdate = previous.goalDaysSinceUpdate
    sub.learnedHours = previous.subLearnedHours
    sub.updatedAt = previous.subUpdatedAt
    sub.daysSinceUpdate = previous.subDaysSinceUpdate
    showToast(error instanceof Error ? error.message : '同步进度失败')
  } finally {
    syncingSubKey.value = ''
  }
}

function recalculateGoal(goal) {
  goal.learnedHours = roundHours(goal.subcategories.reduce((sum, sub) => sum + (Number(sub.learnedHours) || 0), 0))
  goal.estimatedHours = roundHours(goal.subcategories.reduce((sum, sub) => sum + (Number(sub.estimatedHours) || 0), 0))
  goal.progress = goal.estimatedHours ? Math.min(Math.round((goal.learnedHours / goal.estimatedHours) * 100), 100) : 0
  goal.updatedAt = currentDateTime()
  goal.daysSinceUpdate = 0
}

function toggleExpand(id) {
  expandedIds.value = expandedIds.value.includes(id)
    ? expandedIds.value.filter((item) => item !== id)
    : [...expandedIds.value, id]
}

function createSubGoalDraft() {
  subGoalDraftKey += 1
  return {
    key: subGoalDraftKey,
    title: '',
    content: '',
    estimatedHours: '',
  }
}

function openSubGoalEditor(goal) {
  subGoalStage.value = goal
  subGoalDrafts.value = [createSubGoalDraft()]
  subGoalEditorOpen.value = true
}

function closeSubGoalEditor() {
  if (subGoalSaving.value) return
  subGoalEditorOpen.value = false
  subGoalStage.value = null
  subGoalDrafts.value = []
}

function addSubGoalDraft(index) {
  subGoalDrafts.value.splice(index + 1, 0, createSubGoalDraft())
}

async function saveSubGoals() {
  const stageId = subGoalStage.value?.id
  const payload = subGoalDrafts.value.map((subGoal) => ({
    title: subGoal.title.trim(),
    content: subGoal.content.trim(),
    learnedHours: 0,
    estimatedHours: roundHours(subGoal.estimatedHours),
  }))
  const invalid = !stageId || payload.some(
    (subGoal) =>
      !subGoal.title ||
      !subGoal.content ||
      !Number.isFinite(subGoal.estimatedHours) ||
      subGoal.estimatedHours < 0,
  )
  if (invalid) {
    showToast('请完整填写小目标标题、学习内容和预计用时')
    return
  }

  subGoalSaving.value = true
  try {
    await batchAddSubGoals(stageId, payload)
    subGoalEditorOpen.value = false
    subGoalStage.value = null
    subGoalDrafts.value = []
    await loadGoals()
    if (!expandedIds.value.includes(stageId)) {
      expandedIds.value = [stageId, ...expandedIds.value]
    }
    showToast(`已添加 ${payload.length} 个小目标`)
  } catch (error) {
    showToast(error instanceof Error ? error.message : '保存小目标失败')
  } finally {
    subGoalSaving.value = false
  }
}

async function resetFilters() {
  filters.creator = ''
  filters.category = 1
  filters.title = ''
  filters.recentDays = null
  filters.exactDate = ''
  filters.ddl = 1
  await loadGoals(true)
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
  window.clearTimeout(toastLeaveTimer)
  toast.message = message
  toast.visible = true
  toast.leaving = false
  toastTimer = window.setTimeout(() => {
    toast.leaving = true
    toastLeaveTimer = window.setTimeout(() => {
      toast.visible = false
    }, 1000)
  }, 2000)
}

function handleDelete() {
  if (!selectedIds.value.length) {
    showToast('请选择数据记录')
    return
  }
  confirmDeleteOpen.value = true
}

async function confirmDelete() {
  deleting.value = true
  try {
    await Promise.all(selectedIds.value.map((id) => deleteGoal(id)))
    goals.value = goals.value.filter((goal) => !selectedIds.value.includes(goal.id))
    expandedIds.value = expandedIds.value.filter((id) => !selectedIds.value.includes(id))
    selectedIds.value = []
    selectedSubGoalKeys.value = selectedSubGoalKeys.value.filter((key) => goals.value.some((goal) => goal.subcategories.some((sub) => subKey(goal, sub) === key)))
    confirmDeleteOpen.value = false
    showToast('删除成功')
  } catch (error) {
    showToast(error instanceof Error ? error.message : '删除阶段目标失败')
  } finally {
    deleting.value = false
  }
}

async function confirmExport() {
  exporting.value = true
  try {
    await exportGoals(exportForm)
    exportOpen.value = false
    showToast('导出请求已发送')
  } catch (error) {
    showToast(error instanceof Error ? error.message : '导出请求失败')
  } finally {
    exporting.value = false
  }
}

function openCreate() {
  editorMode.value = 'create'
  editingId.value = null
  Object.assign(draft, emptyDraft())
  editorOpen.value = true
}

function openEdit() {
  if (!selectedIds.value.length) {
    showToast('请选择数据记录')
    return
  }
  const goal = goals.value.find((item) => item.id === selectedIds.value[0])
  if (!goal) return
  editorMode.value = 'edit'
  editingId.value = goal.id
  Object.assign(draft, {
    title: goal.title,
    category: goal.category,
    content: goal.content,
    subcategories: goal.subcategories.map((sub) => ({ ...sub })),
  })
  editorOpen.value = true
}

function closeEditor() {
  editorOpen.value = false
}

function addDraftSubcategory() {
  draft.subcategories.push({ name: '', content: '', learnedHours: 0, estimatedHours: '' })
}


async function saveGoal() {
  const invalidSubcategory = draft.subcategories.some((sub) => {
    const title = sub.name.trim()
    const content = sub.content.trim()
    const hasEstimatedHours = sub.estimatedHours !== '' && sub.estimatedHours !== null && sub.estimatedHours !== undefined
    const hasAnyValue = title || content || hasEstimatedHours
    const estimatedHours = Number(sub.estimatedHours)
    return hasAnyValue && (!title || !content || !Number.isFinite(estimatedHours) || estimatedHours < 0)
  })

  if (invalidSubcategory) {
    showToast('请完整填写小目标标题、学习内容和预计用时')
    return
  }

  const now = currentDateTime()
  const existingGoal = editorMode.value === 'edit' ? goals.value.find((item) => item.id === editingId.value) : null
  const subcategories = draft.subcategories
    .filter((sub) => sub.name.trim())
    .map((sub) => {
      const previous = existingGoal?.subcategories.find((item) => item.id === sub.id || item.name === sub.name)
      return {
        id: sub.id ?? previous?.id ?? null,
        stageId: sub.stageId ?? sub.stageGoalId ?? previous?.stageId ?? previous?.stageGoalId ?? existingGoal?.id ?? null,
        name: sub.name,
        content: sub.content,
        learnedHours: roundHours(sub.learnedHours),
        estimatedHours: roundHours(sub.estimatedHours),
        createdAt: sub.createdAt || previous?.createdAt || now,
        updatedAt: now,
        daysSinceUpdate: 0,
      }
    })
  const estimatedHours = roundHours(subcategories.reduce((sum, sub) => sum + sub.estimatedHours, 0))
  const learnedHours = roundHours(subcategories.reduce((sum, sub) => sum + sub.learnedHours, 0))
  const progress = estimatedHours ? Math.min(Math.round((learnedHours / estimatedHours) * 100), 100) : 0
  const payload = {
    ...existingGoal,
    id: editingId.value,
    title: draft.title,
    category: draft.category,
    content: draft.content,
    subcategories,
    estimatedHours,
    learnedHours,
    progress,
    updatedAt: now,
    daysSinceUpdate: 0,
  }

  saving.value = true
  try {
    if (editorMode.value === 'edit') {
      await updateGoal(payload)
      showToast('修改成功')
    } else {
      await addGoal(payload)
      showToast('新增成功')
    }
    closeEditor()
    await loadGoals()
    if (payload.id) expandedIds.value = [payload.id, ...expandedIds.value]
  } catch (error) {
    showToast(error instanceof Error ? error.message : '保存阶段目标失败')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadGoals()
})
</script>

<style scoped>
.goals-page {
  min-height: 100vh;
  padding: 1rem;
  background:
    radial-gradient(circle at 14% 10%, rgba(255, 152, 0, 0.11), transparent 28%),
    linear-gradient(135deg, #fdf8f8 0%, #f7f9fb 100%);
  color: #1c1b1b;
  font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.goals-header,
.toolbar,
.actions,
.query-panel,
.editor-modal header,
.editor-modal footer,
.sub-goal-modal header,
.sub-goal-modal footer {
  display: flex;
}

.goals-header {
  align-items: center;
  justify-content: flex-start;
  min-height: 56px;
  padding: 0 1.5rem;
  margin-bottom: 24px;
}

.eyebrow {
  color: #8a625c;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

h1,
h2,
h3,
p {
  margin: 0;
}

.goals-header h1 {
  margin-top: 0;
  font-size: 1.75rem;
  line-height: 1.2;
}

.toolbar,
.table-panel {
  border: 1px solid rgba(196, 199, 199, 0.4);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 18px 40px rgba(28, 27, 27, 0.06);
  backdrop-filter: blur(16px);
}

.toolbar {
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
  padding: 16px;
}

.actions,
.query-panel {
  flex-wrap: wrap;
  gap: 10px;
}

button {
  border: 0;
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
}

button:hover {
  transform: translateY(-1px);
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.62;
  transform: none;
}

.actions button,
.query-panel button,
.editor-modal footer button,
.sub-goal-modal footer button,
.add-inline-sub-goal {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 38px;
  border-radius: 12px;
  padding: 0 14px;
  background: #f1edec;
  color: #444748;
  font-weight: 800;
}

.actions .primary,
.editor-modal .primary,
.sub-goal-modal .primary,
.add-inline-sub-goal {
  background: #1c1b1b;
  color: #ffffff;
}

.query-panel {
  justify-content: flex-end;
}

.query-panel input,
.query-panel select,
.date-picker-field,
.stage-goal-block input,
.stage-goal-block select,
.stage-sub-goal-block input {
  border: 1px solid rgba(196, 199, 199, 0.58);
  border-radius: 12px;
  padding: 10px 12px;
  background: #ffffff;
  color: #1c1b1b;
  font: 700 13px/1.4 Inter, sans-serif;
  outline: none;
}

.query-panel input,
.query-panel select,
.date-picker-field {
  box-sizing: border-box;
  text-align: center;
  width: 96px;
}

.query-panel select {
  text-align-last: center;
}

.date-picker-field {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  width: 128px;
  min-height: 38px;
  gap: 6px;
  padding: 0 8px;
}

.query-panel .date-picker-btn {
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
  color: #1c1b1b;
  cursor: pointer;
  transform: none;
}

.query-panel .date-picker-btn:hover {
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
  color: #1c1b1b;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.2;
  text-align: center;
  text-overflow: clip;
  white-space: nowrap;
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

.table-panel {
  overflow: hidden;
}

.table-wrap {
  overflow-x: auto;
}

table {
  width: 100%;
  min-width: 1222px;
  border-collapse: collapse;
  table-layout: fixed;
}

/* 列宽由 columnWidths 配置对象通过内联样式控制，不再使用 CSS class 定义固定宽度 */

th,
td {
  border-bottom: 1px solid rgba(196, 199, 199, 0.24);
  padding: 13px 12px;
  text-align: left;
  vertical-align: middle;
}

th {
  position: sticky;
  top: 0;
  z-index: 1;
  background: rgba(247, 243, 242, 0.96);
  color: #1c1b1b;
  font-size: 12px;
  font-weight: 900;
  white-space: nowrap;
}

td {
  color: #444748;
  font-size: 13px;
  font-weight: 650;
}

tbody tr {
  transition: background 0.2s ease, transform 0.2s ease;
}

tbody tr:not(.detail-row):hover {
  background: rgba(255, 152, 0, 0.07);
}

tbody tr.selected {
  background: rgba(76, 175, 80, 0.09);
}

.goal-controls-col {
  text-align: center;
}

.goal-row-actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  align-items: center;
  justify-items: center;
  gap: 0;
  width: 100%;
}


.goal-control,
.goal-row-actions button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  padding: 0;
  border-radius: 7px;
}

.goal-control {
  cursor: pointer;
}

.goal-control input[type="checkbox"] {
  width: 14px;
  height: 14px;
  margin: 0;
}

.goal-row-actions button {
  background: rgba(224, 227, 229, 0.68);
  color: #1c1b1b;
}

.goal-row-actions button .material-symbols-outlined {
  display: block;
  font-size: 16px;
  line-height: 1;
}

.goal-row-actions .add-sub-goal-button {
  background: #1c1b1b;
  color: #ffffff;
}

.strong {
  color: #1c1b1b;
  font-weight: 900;
}

.empty-cell {
  padding: 28px 12px;
  color: #8a625c;
  text-align: center;
  font-weight: 900;
}

.content-cell {
  max-width: 260px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stale-pill {
  display: inline;
  font-size: 12px;
  font-weight: 900;
}

.ddl-status {
  display: inline;
  font-size: 12px;
  font-weight: 900;
}

.ddl-status.normal {
  color: #2f7c34;
}

.ddl-status.due-soon {
  color: #9a5a00;
}

.ddl-status.expired {
  color: #ba1a1a;
}

.tag {
  color: #444748;
  font-size: 13px;
  font-weight: 650;
}

.sub-index {
  color: #1c1b1b;
  font-size: 15px;
  font-weight: 900;
  line-height: 1;
}

.stale-pill {
  color: #2f7c34;
}

.stale-pill.warn {
  color: #ba1a1a;
}

.time-stack {
  display: inline-grid;
  gap: 2px;
  min-width: 92px;
  color: #444748;
  font-size: 12px;
  font-weight: 850;
  line-height: 1.25;
}

.time-stack span:last-child {
  color: #8a625c;
  font-size: 11px;
}

.progress-cell,
.progress-row {
  display: grid;
  gap: 6px;
}

.progress-cell span {
  color: #ff9800;
  font-size: 12px;
  font-weight: 900;
}

.progress-cell i {
  position: relative;
  overflow: hidden;
  border-radius: 999px;
  background: #e0e3e5;
}

.progress-cell i {
  width: 100%;
  height: 7px;
}

.progress-cell b {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #4caf50, #ff9800);
}

.detail-row td {
  padding: 0;
  background: rgba(255, 250, 242, 0.68);
}

.detail-card {
  display: block;
  padding: 18px 0;
  animation: unfold 0.24s ease both;
}

@keyframes unfold {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.sub-gap-panel,
.sub-table-wrap {
  border-radius: 16px;
  background: #ffffff;
}

.sub-gap-panel {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin: 0 12px 0 18px;
  padding: 16px;
  box-shadow: inset 0 0 0 1px rgba(255, 152, 0, 0.14);
}

.sub-gap-panel h3 {
  font-size: 16px;
}

.sub-gap-list {
  display: grid;
  gap: 0;
}

.sub-gap-row {
  display: grid;
  align-content: center;
  gap: 20px;
  min-height: 58px;
  padding: 7px 0;
  border-bottom: 1px solid rgba(196, 199, 199, 0.24);
}

.sub-gap-row:last-child {
  border-bottom: 0;
}

.sub-gap-meta {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.sub-gap-meta span {
  overflow: hidden;
  color: #444748;
  font-size: 12px;
  font-weight: 900;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sub-gap-meta strong {
  flex: 0 0 auto;
  color: #8a625c;
  font-size: 12px;
  line-height: 1;
}

.sub-gap-track {
  position: relative;
  height: 18px;
  overflow: hidden;
  border-radius: 999px;
  background: #e0e3e5;
}

.sub-gap-track .total,
.sub-gap-track .learned {
  position: absolute;
  inset: 0 auto 0 0;
  border-radius: inherit;
}

.sub-gap-track .total {
  width: 100%;
  background: rgba(224, 227, 229, 0.82);
}

.sub-gap-track .learned {
  background: linear-gradient(90deg, #2196f3, #ff9800);
}

.sub-table-wrap {
  padding: 0;
  overflow-x: auto;
}

.sub-table {
  min-width: 1222px;
  border-collapse: collapse;
  table-layout: fixed;
}

.sub-table th {
  background: #fffaf2;
}

.sub-table th,
.sub-table td {
  padding: 13px 12px;
}

.sub-progress-with-controls {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
}

.sub-progress-controls-top {
  display: grid;
  grid-template-columns: 20px 1fr 20px;
  align-items: center;
  width: 100%;
  padding: 0;
}

.sub-progress-controls-top .sub-progress-pct {
  justify-self: center;
  text-align: center;
  color: #ff9800;
  font-size: 12px;
  font-weight: 900;
}

.sub-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  padding: 0;
  border-radius: 50%;
  background: #ffffff;
  color: #9a5a00;
  border: 1px solid rgba(255, 152, 0, 0.25);
  cursor: pointer;
  box-shadow: inset 0 0 0 1px rgba(255, 152, 0, 0.12);
}

.sub-btn.minus {
  justify-self: start;
}

.sub-btn.plus {
  justify-self: end;
}

.sub-btn .material-symbols-outlined {
  display: block;
  font-size: 14px;
  line-height: 1;
}

.sub-btn:hover {
  background: #1c1b1b;
  color: #ffffff;
  transform: translateY(-1px) scale(1.04);
}

.sub-progress-vert { /* legacy - kept minimal */
  display: grid;
  gap: 6px;
  justify-items: center;
  align-items: center;
  width: 100%;
}

.sub-progress-vert .sub-progress-pct {
  color: #ff9800;
  font-size: 12px;
  font-weight: 900;
}

.sub-progress-vert .progress-cell,
.sub-progress-with-controls .progress-cell {
  width: 100%;
}

.toast {
  position: fixed;
  top: 50%;
  left: 50%;
  z-index: 60;
  padding: 18px 26px;
  border-radius: 16px;
  background: rgba(28, 27, 27, 0.92);
  color: #ffffff;
  font-weight: 900;
  box-shadow: 0 18px 40px rgba(28, 27, 27, 0.22);
  transform: translate(-50%, -50%);
  animation: toast-in 0.2s ease both;
}

.toast.leaving {
  animation: toast-out 1s ease forwards;
}

@keyframes toast-in {
  from {
    opacity: 0;
    transform: translate(-50%, -44%) scale(0.96);
  }
}

@keyframes toast-out {
  to {
    opacity: 0;
    transform: translate(-50%, -56%) scale(0.98);
  }
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgba(28, 27, 27, 0.28);
  backdrop-filter: blur(8px);
}

.confirm-modal,
.export-modal,
.editor-modal,
.sub-goal-modal {
  width: min(100%, 760px);
  border: 1px solid rgba(255, 255, 255, 0.65);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 24px 80px rgba(28, 27, 27, 0.22);
  animation: modal-pop 0.22s ease both;
}

@keyframes modal-pop {
  from {
    opacity: 0;
    transform: translateY(14px) scale(0.98);
  }
}

.confirm-modal {
  max-width: 420px;
  padding: 24px;
}

.export-modal {
  display: grid;
  max-width: 680px;
  gap: 22px;
  padding: 24px;
}

.export-fields {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.export-fields label {
  display: grid;
  gap: 8px;
  color: #444748;
  font-size: 12px;
  font-weight: 900;
}

.export-fields select {
  width: 100%;
  min-height: 42px;
  border: 1px solid rgba(196, 199, 199, 0.58);
  border-radius: 12px;
  padding: 0 12px;
  background: #ffffff;
  color: #1c1b1b;
  font: 800 14px/1.2 Inter, sans-serif;
  outline: none;
}

.export-modal footer {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.export-modal footer button {
  min-height: 40px;
  border-radius: 12px;
  padding: 0 16px;
  background: #f1edec;
  color: #444748;
  font-weight: 900;
}

.export-modal footer .primary {
  background: #1c1b1b;
  color: #ffffff;
}

.export-modal footer button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.confirm-modal p {
  margin: 10px 0 20px;
  color: #5c5f61;
}

.confirm-modal div {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.confirm-modal button {
  min-height: 38px;
  border-radius: 12px;
  padding: 0 14px;
  font-weight: 900;
}

.danger {
  background: #ba1a1a;
  color: #ffffff;
}

.editor-modal {
  display: grid;
  gap: 18px;
  padding: 22px;
}

.sub-goal-modal {
  display: grid;
  width: min(100%, 940px);
  gap: 20px;
  padding: 22px;
}

.sub-goal-modal header,
.sub-goal-modal footer {
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.sub-goal-modal header p {
  margin-top: 6px;
  color: #5c5f61;
  font-size: 13px;
  font-weight: 700;
}

.sub-goal-modal header > button {
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  border-radius: 12px;
  background: #f1edec;
}

.sub-goal-fields {
  display: grid;
  gap: 10px;
  max-height: min(52vh, 440px);
  overflow-y: auto;
}

.sub-goal-field-head,
.sub-goal-field-row {
  display: grid;
  grid-template-columns: minmax(160px, 0.8fr) minmax(260px, 1.4fr) 150px 40px;
  gap: 10px;
  align-items: center;
}

.sub-goal-field-head {
  padding: 0 2px;
  color: #444748;
  font-size: 12px;
  font-weight: 900;
}

.sub-goal-field-row input {
  min-width: 0;
  min-height: 42px;
  border: 1px solid rgba(196, 199, 199, 0.58);
  border-radius: 12px;
  padding: 0 12px;
  background: #ffffff;
  color: #1c1b1b;
  font: 700 13px/1.4 Inter, sans-serif;
  outline: none;
}

.append-sub-goal-button {
  display: grid;
  width: 40px;
  height: 40px;
  place-items: center;
  border-radius: 12px;
  background: #1c1b1b;
  color: #ffffff;
}

.editor-modal header,
.editor-modal footer,
.sub-goal-modal header,
.sub-goal-modal footer {
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.editor-modal header > button {
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  border-radius: 12px;
  background: #f1edec;
}

.stage-goal-block,
.stage-sub-goal-block {
  display: grid;
  grid-template-columns: minmax(150px, 0.9fr) minmax(96px, 0.45fr) minmax(300px, 1.8fr);
  gap: 12px;
  align-items: end;
}

.stage-goal-block label,
.stage-sub-goal-block label {
  display: grid;
  min-width: 0;
  gap: 7px;
  color: #444748;
  font-size: 12px;
  font-weight: 900;
}

.stage-goal-block input,
.stage-goal-block select,
.stage-sub-goal-block input {
  width: 100%;
  box-sizing: border-box;
}


.sub-editor {
  display: grid;
  gap: 12px;
  width: 100%;
}

.add-inline-sub-goal {
  justify-self: center;
}

@media (max-width: 980px) {
  .goals-header,
  .toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .query-panel {
    justify-content: flex-start;
  }

  .detail-card,
  .stage-goal-block,
  .stage-sub-goal-block {
    grid-template-columns: 1fr;
  }

  .export-fields {
    grid-template-columns: 1fr;
  }

  .sub-goal-field-head {
    display: none;
  }

  .sub-goal-field-row {
    grid-template-columns: 1fr 1fr 120px 40px;
  }

}

@media (max-width: 680px) {
  .sub-goal-field-row {
    grid-template-columns: 1fr 40px;
  }

  .sub-goal-field-row input {
    grid-column: 1;
  }

  .sub-goal-field-row .append-sub-goal-button {
    grid-column: 2;
    grid-row: 1 / span 3;
  }
}
</style>
