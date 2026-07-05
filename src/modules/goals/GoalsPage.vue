<template>
  <section class="goals-page">
    <header class="goals-header">
      <div>
        <span class="eyebrow">Milestone Control</span>
        <h1>阶段目标</h1>
      </div>
      <p>用表格管理阶段目标，展开查看执行细节，用图表追踪分类与小分类的学时差距。</p>
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

      <form v-if="queryPanelOpen" class="query-panel" @submit.prevent>
        <input v-model.trim="filters.creator" type="text" placeholder="创建人" />
        <select v-model="filters.category">
          <option value="">全部分类</option>
          <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
        </select>
        <input v-model.trim="filters.title" type="text" placeholder="标题" />
        <input v-model.number="filters.recentDays" type="number" min="0" placeholder="最近X天" />
        <button type="button" @click="resetFilters">重置</button>
      </form>
    </section>

    <section class="table-panel">
      <div class="table-wrap">
        <table>
          <colgroup>
            <col :style="{ width: `${columnWidths.main.select}px` }" />
            <col :style="{ width: `${columnWidths.main.expand}px` }" />
            <col :style="{ width: `${columnWidths.main.creator}px` }" />
            <col :style="{ width: `${columnWidths.main.category}px` }" />
            <col :style="{ width: `${columnWidths.main.title}px` }" />
            <col :style="{ width: `${columnWidths.main.content}px` }" />
            <col :style="{ width: `${columnWidths.main.hours}px` }" />
            <col :style="{ width: `${columnWidths.main.hours}px` }" />
            <col :style="{ width: `${columnWidths.main.progress}px` }" />
            <col :style="{ width: `${columnWidths.main.estimated}px` }" />
            <col :style="{ width: `${columnWidths.main.date}px` }" />
            <col :style="{ width: `${columnWidths.main.date}px` }" />
            <col :style="{ width: `${columnWidths.main.stale}px` }" />
          </colgroup>
          <thead>
            <tr>
              <th class="select-col"></th>
              <th class="expand-col"></th>
              <th>创建人</th>
              <th>分类</th>
              <th>标题</th>
              <th>内容</th>
              <th>已学时长</th>
              <th>剩余时长</th>
              <th>进度</th>
              <th>预计用时</th>
              <th>创建时间</th>
              <th>修改时间</th>
              <th>距上次更新</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="goal in filteredGoals" :key="goal.id">
              <tr :class="{ selected: selectedIds.includes(goal.id), expanded: expandedIds.includes(goal.id) }">
                <td class="select-col">
                  <input v-model="selectedIds" type="checkbox" :value="goal.id" :aria-label="`选择${goal.title}`" />
                </td>
                <td class="expand-col">
                  <button type="button" :aria-label="`展开${goal.title}`" @click="toggleExpand(goal.id)">
                    <span class="material-symbols-outlined">
                      {{ expandedIds.includes(goal.id) ? 'expand_less' : 'expand_more' }}
                    </span>
                  </button>
                </td>
                <td>{{ goal.creator }}</td>
                <td><span class="tag">{{ goal.category }}</span></td>
                <td class="strong">{{ goal.title }}</td>
                <td class="content-cell">{{ goal.content }}</td>
                <td>{{ goal.learnedHours }}h</td>
                <td>{{ remainingHours(goal) }}h</td>
                <td>
                  <div class="progress-cell">
                    <span>{{ goal.progress }}%</span>
                    <i><b :style="{ width: `${goal.progress}%` }" /></i>
                  </div>
                </td>
                <td>{{ goal.estimatedHours }}h</td>
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
                    <aside class="sub-gap-panel">
                      <h3>小分类学时差距</h3>
                      <div class="sub-gap-list">
                        <div v-for="sub in goal.subcategories" :key="`gap-${sub.name}`" class="sub-gap-row">
                          <div class="sub-gap-meta">
                            <span>{{ sub.name }}</span>
                            <strong>{{ sub.learnedHours }}/{{ sub.estimatedHours }}h</strong>
                          </div>
                          <div class="sub-gap-track">
                            <i class="total" />
                            <i class="learned" :style="{ width: `${subProgress(sub)}%` }" />
                          </div>
                        </div>
                      </div>
                    </aside>
                    <div class="sub-table-wrap">
                      <table class="sub-table">
                        <colgroup>
                          <!-- 对齐到大分类列：小分类列宽使用大分类对应列宽，保证垂直对齐 -->
                          <col :style="{ width: `${columnWidths.main.title}px` }" />
                          <col :style="{ width: `${columnWidths.main.content}px` }" />
                          <col :style="{ width: `${columnWidths.main.hours}px` }" />
                          <col :style="{ width: `${columnWidths.main.hours}px` }" />
                          <col :style="{ width: `${columnWidths.main.progress}px` }" />
                          <col :style="{ width: `${columnWidths.main.estimated}px` }" />
                          <col :style="{ width: `${columnWidths.main.date}px` }" />
                          <col :style="{ width: `${columnWidths.main.date}px` }" />
                          <col :style="{ width: `${columnWidths.main.stale}px` }" />
                        </colgroup>
                        <thead>
                        <tr>
                          <th>小分类</th>
                          <th>内容</th>
                          <th>已学时长</th>
                          <th>剩余时长</th>
                          <th>进度</th>
                          <th>预计用时</th>
                          <th>创建时间</th>
                          <th>修改时间</th>
                          <th>距上次更新</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr v-for="(sub, subIndex) in goal.subcategories" :key="sub.name">
                          <td class="strong">{{ sub.name }}</td>
                          <td class="content-cell">{{ sub.content }}</td>
                          <td>{{ sub.learnedHours }}h</td>
                          <td>{{ subRemainingHours(sub) }}h</td>
                          <td>
                            <div class="sub-progress-vert">
                              <div class="sub-progress-pct">{{ subProgress(sub) }}%</div>
                              <div class="progress-cell">
                                <i><b :style="{ width: `${subProgress(sub)}%` }" /></i>
                              </div>
                            </div>
                          </td>
                          <td>{{ sub.estimatedHours }}h</td>
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
          <button type="button" @click="confirmDeleteOpen = false">取消</button>
          <button type="button" class="danger" @click="confirmDelete">确定删除</button>
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
              <option :value="1">Excel</option>
              <option :value="2">PDF</option>
              <option :value="3">图片</option>
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

        <div class="form-grid">
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
          <label class="wide">
            <span>阶段目标内容</span>
            <textarea v-model.trim="draft.content" required rows="3" />
          </label>
        </div>

        <section class="sub-editor">
          <div class="sub-editor-head">
            <h3>小分类</h3>
            <button type="button" @click="addDraftSubcategory">
              <span class="material-symbols-outlined">add</span>
              添加小分类
            </button>
          </div>
          <article v-for="(sub, index) in draft.subcategories" :key="index" class="sub-edit-row">
            <input v-model.trim="sub.name" type="text" placeholder="小分类，如 同步执行" />
            <input v-model.number="sub.estimatedHours" type="number" min="0" placeholder="预计小时" />
            <textarea v-model.trim="sub.content" rows="2" placeholder="小分类内容" />
            <button type="button" aria-label="删除小分类" @click="removeDraftSubcategory(index)">
              <span class="material-symbols-outlined">delete</span>
            </button>
          </article>
        </section>

        <footer>
          <button type="button" @click="closeEditor">取消</button>
          <button type="submit" class="primary">保存</button>
        </footer>
      </form>
    </div>
  </section>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { GOAL_API } from '../../api/index.js'

const categories = ['技术', '学习', '健康', '生活']

// 列宽配置 - 可以手动调整每个列的宽度
const columnWidths = {
  // 大分类表格列宽
  main: {
    select: 42,      // 选择列
    expand: 42,      // 展开列
    creator: 97,     // 创建人
    category: 97,    // 分类
    title: 140,      // 标题
    content: 300,    // 内容
    hours: 90,       // 已学时长/剩余时长
    progress: 140,   // 进度
    estimated: 110,  // 预计用时
    date: 120,       // 创建时间/修改时间
    stale: 120,      // 距上次更新
  },
  // 小分类表格列宽（与大分类对应）
  sub: {
    // 使用与大分类一致的列宽，保证列垂直对齐
    title: 140,      // 小分类 -> 对齐到大分类的标题宽
    content: 300,    // 内容 -> 对齐到大分类的内容宽
    hours: 90,       // 已学时长/剩余时长 -> 对齐到大分类的 hours
    progress: 140,   // 进度 -> 对齐到大分类的进度
    estimated: 110,  // 预计用时
    date: 120,       // 创建时间/修改时间
    stale: 120,      // 距上次更新
  }
}

const expandedIds = ref(['goal-java'])
const selectedIds = ref([])
const queryPanelOpen = ref(false)
const editorOpen = ref(false)
const editorMode = ref('create')
const editingId = ref(null)
const confirmDeleteOpen = ref(false)
const exportOpen = ref(false)
const exporting = ref(false)
const toast = reactive({ visible: false, leaving: false, message: '' })
let toastTimer = 0
let toastLeaveTimer = 0

const exportDayOptions = [1, 3, 5, 7, 10, 15, 30]
const exportSizeOptions = [10, 20, 30, 40, 50, 100]
const exportForm = reactive({
  exportType: 1,
  lastDays: 0,
  exportSize: 50,
})

const filters = reactive({
  creator: '',
  category: '',
  title: '',
  recentDays: null,
})

const emptyDraft = () => ({
  title: '',
  category: '技术',
  content: '',
  subcategories: [{ name: '', content: '', learnedHours: 0, estimatedHours: 1 }],
})

const draft = reactive(emptyDraft())

const goals = ref([
  {
    id: 'goal-java',
    creator: '小加',
    category: '技术',
    title: 'Java 多线程',
    content: '推进 XXL-JOB、虚拟线程、SpringSecurity，并沉淀线程模型理解。',
    learnedHours: 18,
    estimatedHours: 52,
    progress: 35,
    createdAt: '2026-06-01',
    updatedAt: '2026-06-26',
    daysSinceUpdate: 2,
    subcategories: [
      { name: '同步执行', content: '梳理 synchronized、Lock、CAS 的边界。', learnedHours: 5, estimatedHours: 10, createdAt: '2026-06-01', updatedAt: '2026-06-25', daysSinceUpdate: 3 },
      { name: '异步执行', content: '整理 CompletableFuture 编排实践。', learnedHours: 4, estimatedHours: 12, createdAt: '2026-06-03', updatedAt: '2026-06-26', daysSinceUpdate: 2 },
      { name: '线程池基础', content: '掌握核心参数、队列策略和拒绝策略。', learnedHours: 9, estimatedHours: 20, createdAt: '2026-06-04', updatedAt: '2026-06-26', daysSinceUpdate: 2 },
    ],
  },
  {
    id: 'goal-security',
    creator: '小媛',
    category: '学习',
    title: 'SpringSecurity',
    content: '完成认证、授权、JWT、过滤器链和异常处理的学习闭环。',
    learnedHours: 7,
    estimatedHours: 28,
    progress: 25,
    createdAt: '2026-06-10',
    updatedAt: '2026-06-24',
    daysSinceUpdate: 4,
    subcategories: [
      { name: '认证流程', content: '理解登录认证和上下文保存。', learnedHours: 3, estimatedHours: 8, createdAt: '2026-06-10', updatedAt: '2026-06-24', daysSinceUpdate: 4 },
      { name: '权限模型', content: '整理 RBAC 与接口鉴权。', learnedHours: 2, estimatedHours: 10, createdAt: '2026-06-11', updatedAt: '2026-06-23', daysSinceUpdate: 5 },
      { name: 'JWT 集成', content: '完成 token 生成、刷新和校验。', learnedHours: 2, estimatedHours: 10, createdAt: '2026-06-12', updatedAt: '2026-06-24', daysSinceUpdate: 4 },
    ],
  },
  {
    id: 'goal-health',
    creator: '小加',
    category: '健康',
    title: '运动耐力',
    content: '用步行和轻力量训练恢复身体稳定性。',
    learnedHours: 6,
    estimatedHours: 20,
    progress: 30,
    createdAt: '2026-06-15',
    updatedAt: '2026-06-27',
    daysSinceUpdate: 1,
    subcategories: [
      { name: '每日步数', content: '保持 10000 步左右。', learnedHours: 4, estimatedHours: 12, createdAt: '2026-06-15', updatedAt: '2026-06-27', daysSinceUpdate: 1 },
      { name: '拉伸恢复', content: '睡前 10 分钟拉伸。', learnedHours: 2, estimatedHours: 8, createdAt: '2026-06-16', updatedAt: '2026-06-27', daysSinceUpdate: 1 },
    ],
  },
])

const filteredGoals = computed(() =>
  goals.value.filter((goal) => {
    const creatorHit = !filters.creator || goal.creator.includes(filters.creator)
    const categoryHit = !filters.category || goal.category === filters.category
    const titleHit = !filters.title || goal.title.includes(filters.title)
    const recentHit = !Number(filters.recentDays) || goal.daysSinceUpdate <= Number(filters.recentDays)
    return creatorHit && categoryHit && titleHit && recentHit
  }),
)

function remainingHours(goal) {
  return Math.max((Number(goal.estimatedHours) || 0) - (Number(goal.learnedHours) || 0), 0)
}

function subRemainingHours(sub) {
  return Math.max((Number(sub.estimatedHours) || 0) - (Number(sub.learnedHours) || 0), 0)
}

function subProgress(sub) {
  return sub.estimatedHours ? Math.min(Math.round((sub.learnedHours / sub.estimatedHours) * 100), 100) : 0
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

function changeSubHours(goal, subIndex, delta) {
  const sub = goal.subcategories[subIndex]
  if (!sub) return
  const nextHours = Math.min(Math.max((Number(sub.learnedHours) || 0) + delta, 0), Number(sub.estimatedHours) || 0)
  sub.learnedHours = nextHours
  sub.updatedAt = currentDateTime()
  sub.daysSinceUpdate = 0
  recalculateGoal(goal)
}

function recalculateGoal(goal) {
  goal.learnedHours = goal.subcategories.reduce((sum, sub) => sum + (Number(sub.learnedHours) || 0), 0)
  goal.estimatedHours = goal.subcategories.reduce((sum, sub) => sum + (Number(sub.estimatedHours) || 0), 0)
  goal.progress = goal.estimatedHours ? Math.min(Math.round((goal.learnedHours / goal.estimatedHours) * 100), 100) : 0
  goal.updatedAt = currentDateTime()
  goal.daysSinceUpdate = 0
}

function toggleExpand(id) {
  expandedIds.value = expandedIds.value.includes(id)
    ? expandedIds.value.filter((item) => item !== id)
    : [...expandedIds.value, id]
}

function resetFilters() {
  filters.creator = ''
  filters.category = ''
  filters.title = ''
  filters.recentDays = null
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

function confirmDelete() {
  goals.value = goals.value.filter((goal) => !selectedIds.value.includes(goal.id))
  expandedIds.value = expandedIds.value.filter((id) => !selectedIds.value.includes(id))
  selectedIds.value = []
  confirmDeleteOpen.value = false
}

async function confirmExport() {
  exporting.value = true
  try {
    const params = new URLSearchParams({
      exportType: String(exportForm.exportType),
      lastDays: String(exportForm.lastDays),
      exportSize: String(exportForm.exportSize),
    })
    const response = await fetch(`${GOAL_API.export}?${params.toString()}`, {
      method: 'POST',
    })
    if (!response.ok) {
      throw new Error('导出请求失败')
    }
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
  draft.subcategories.push({ name: '', content: '', learnedHours: 0, estimatedHours: 1 })
}

function removeDraftSubcategory(index) {
  draft.subcategories.splice(index, 1)
}

function saveGoal() {
  const now = currentDateTime()
  const existingGoal = editorMode.value === 'edit' ? goals.value.find((item) => item.id === editingId.value) : null
  const subcategories = draft.subcategories
    .filter((sub) => sub.name.trim())
    .map((sub) => {
      const previous = existingGoal?.subcategories.find((item) => item.name === sub.name)
      return {
        name: sub.name,
        content: sub.content,
        learnedHours: Number(sub.learnedHours) || 0,
        estimatedHours: Number(sub.estimatedHours) || 0,
        createdAt: sub.createdAt || previous?.createdAt || now,
        updatedAt: now,
        daysSinceUpdate: 0,
      }
    })
  const estimatedHours = subcategories.reduce((sum, sub) => sum + sub.estimatedHours, 0)
  const learnedHours = subcategories.reduce((sum, sub) => sum + sub.learnedHours, 0)
  const progress = estimatedHours ? Math.min(Math.round((learnedHours / estimatedHours) * 100), 100) : 0

  if (editorMode.value === 'edit') {
    const goal = existingGoal
    if (goal) {
      goal.title = draft.title
      goal.category = draft.category
      goal.content = draft.content
      goal.subcategories = subcategories
      goal.estimatedHours = estimatedHours
      goal.learnedHours = learnedHours
      goal.progress = progress
      goal.updatedAt = now
      goal.daysSinceUpdate = 0
    }
  } else {
    const id = `goal-${Date.now()}`
    goals.value.unshift({
      id,
      creator: '小加',
      category: draft.category,
      title: draft.title,
      content: draft.content,
      learnedHours,
      estimatedHours,
      progress,
      createdAt: now,
      updatedAt: now,
      daysSinceUpdate: 0,
      subcategories,
    })
    expandedIds.value = [id, ...expandedIds.value]
  }

  closeEditor()
}
</script>

<style scoped>
.goals-page {
  min-height: 100vh;
  padding: clamp(24px, 3vw, 44px) clamp(18px, 4vw, 64px);
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
.sub-editor-head {
  display: flex;
}

.goals-header {
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
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
  margin-top: 6px;
  font-size: clamp(28px, 3vw, 42px);
  line-height: 1.08;
}

.goals-header p {
  max-width: 520px;
  color: #5c5f61;
  line-height: 1.7;
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

.actions button,
.query-panel button,
.editor-modal footer button,
.sub-editor-head button {
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
.sub-editor-head button {
  background: #1c1b1b;
  color: #ffffff;
}

.query-panel {
  justify-content: flex-end;
}

.query-panel input,
.query-panel select,
.form-grid input,
.form-grid select,
.form-grid textarea,
.sub-edit-row input,
.sub-edit-row textarea {
  border: 1px solid rgba(196, 199, 199, 0.58);
  border-radius: 12px;
  padding: 10px 12px;
  background: #ffffff;
  color: #1c1b1b;
  font: 700 13px/1.4 Inter, sans-serif;
  outline: none;
}

.table-panel {
  overflow: hidden;
}

.table-wrap {
  overflow-x: auto;
}

table {
  width: 100%;
  min-width: 1484px;
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
  color: #5c5f61;
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

.select-col,
.expand-col {
  text-align: center;
}

.expand-col button {
  display: grid;
  width: 30px;
  height: 30px;
  place-items: center;
  border-radius: 10px;
  background: rgba(224, 227, 229, 0.68);
  color: #1c1b1b;
}

.strong {
  color: #1c1b1b;
  font-weight: 900;
}

.content-cell {
  max-width: 260px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tag,
.stale-pill {
  display: inline-flex;
  border-radius: 999px;
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 900;
}

.tag {
  background: rgba(255, 152, 0, 0.13);
  color: #9a5a00;
}

.stale-pill {
  background: rgba(76, 175, 80, 0.12);
  color: #2f7c34;
}

.stale-pill.warn {
  background: rgba(186, 26, 26, 0.1);
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
  display: grid;
  grid-template-columns: 400px minmax(0, 1fr);
  gap: 0;
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
  gap: 8px;
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
  height: 12px;
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
  min-width: 1484px;
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

.sub-progress-vert {
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

.sub-progress-vert .progress-cell {
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
.editor-modal {
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

.editor-modal header,
.editor-modal footer,
.sub-editor-head {
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

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.form-grid label {
  display: grid;
  gap: 7px;
  color: #444748;
  font-size: 12px;
  font-weight: 900;
}

.form-grid .wide {
  grid-column: 1 / -1;
}

.sub-editor {
  display: grid;
  gap: 12px;
}

.sub-edit-row {
  display: grid;
  grid-template-columns: minmax(120px, 0.8fr) 110px minmax(180px, 1.2fr) 40px;
  gap: 10px;
  align-items: start;
}

.sub-edit-row button {
  display: grid;
  width: 40px;
  height: 40px;
  place-items: center;
  border-radius: 12px;
  background: rgba(186, 26, 26, 0.1);
  color: #ba1a1a;
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
  .form-grid {
    grid-template-columns: 1fr;
  }

  .export-fields {
    grid-template-columns: 1fr;
  }

  .sub-edit-row {
    grid-template-columns: 1fr;
  }
}
</style>
