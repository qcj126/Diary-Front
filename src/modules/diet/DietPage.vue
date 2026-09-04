<template>
  <div class="diet-dashboard">
    <section class="hero-card">
      <div class="hero-copy">
        <h1 class="page-title">饮食记录</h1>
      </div>
    </section>

    <section class="toolbar">
      <div class="actions">
        <button type="button" class="primary" @click="openAddDialog">
          <span class="material-symbols-outlined">add</span>
          增
        </button>
        <button type="button" :disabled="!selectedMeal || loading" @click="removeSelectedMeal">
          <span class="material-symbols-outlined">delete</span>
          删
        </button>
        <button type="button" :disabled="!selectedMeal || loading" @click="openEditDialog">
          <span class="material-symbols-outlined">edit</span>
          改
        </button>
        <button type="button" @click="queryPanelOpen = !queryPanelOpen">
          <span class="material-symbols-outlined">search</span>
          查
        </button>
        <button type="button" :disabled="!meals.length" @click="exportCsv">
          <span class="material-symbols-outlined">ios_share</span>
          导出
        </button>
      </div>

      <form v-if="queryPanelOpen" class="query-panel" @submit.prevent="loadMeals">
        <div class="segment-buttons" aria-label="饮食记录时间范围">
          <button
            v-for="seg in segments"
            :key="seg.key"
            :class="['seg-btn', { active: seg.key === activeSegment }]"
            type="button"
            @click="selectSegment(seg.key)"
          >
            {{ seg.label }}
          </button>
        </div>

        <label class="search-bar">
          <span class="material-symbols-outlined">search</span>
          <input v-model="search" type="text" placeholder="筛选餐次、菜名或备注" />
        </label>
        <button type="submit" :disabled="loading">{{ loading ? '查询中' : '查询' }}</button>
        <button type="button" @click="resetQuery">重置</button>
      </form>
    </section>

    <p v-if="notice.message" :class="['operation-notice', notice.type]" role="status">
      {{ notice.message }}
    </p>

    <main class="diet-main">
      <section class="timeline-area">
        <div class="section-heading">
          <div>
            <h2>餐食轨迹</h2>
          </div>
        </div>
        <DietTimeline :meals="filteredMeals" :selected-id="selectedId" @select="selectMeal" />
      </section>

      <section class="summary-area">
        <DietSummaryPanel :meals="filteredMeals" />
      </section>
    </main>

    <div v-if="dialogOpen" class="dialog-backdrop" role="presentation">
      <section class="diet-dialog" role="dialog" aria-modal="true" :aria-labelledby="'diet-dialog-title'">
        <div class="dialog-head">
          <h2 id="diet-dialog-title">{{ dialogMode === 'add' ? '新增饮食记录' : '修改饮食记录' }}</h2>
          <button type="button" class="icon-button" aria-label="关闭" @click="closeDialog">×</button>
        </div>

        <form class="diet-form" @submit.prevent="saveMeal">
          <label class="field wide">
            <span>食物名称</span>
            <input v-model.trim="form.foodName" maxlength="200" required placeholder="例如：香煎三文鱼能量碗" />
          </label>
          <label class="field">
            <span>食用时间</span>
            <input v-model="form.eatTime" type="datetime-local" required />
          </label>
          <label class="field">
            <span>餐别</span>
            <select v-model.number="form.mealType" required>
              <option v-for="option in mealTypeOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </label>
          <label class="field">
            <span>用餐地点</span>
            <select v-model="form.location" required>
              <option value="home">在家吃</option>
              <option value="outside">在外吃</option>
            </select>
          </label>
          <label v-for="nutrient in nutrientFields" :key="nutrient.key" class="field">
            <span>{{ nutrient.label }}</span>
            <input
              v-model.number="form[nutrient.key]"
              type="number"
              min="0"
              :step="nutrient.step"
              required
            />
          </label>
          <label class="field wide">
            <span>图片地址</span>
            <input v-model.trim="form.imageUrl" maxlength="1000" type="url" placeholder="https://..." />
          </label>
          <label class="field wide">
            <span>备注</span>
            <textarea v-model.trim="form.note" maxlength="500" rows="3" placeholder="食材、口味或当时的感受"></textarea>
          </label>

          <div class="dialog-actions wide">
            <button type="button" @click="closeDialog">取消</button>
            <button type="submit" class="primary" :disabled="saving">
              {{ saving ? '保存中…' : '保存' }}
            </button>
          </div>
        </form>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { DIET_SEGMENTS, MEAL_TYPE_OPTIONS, NUTRIENT_FIELDS } from '../../constants/diet.js'
import DietTimeline from './DietTimeline.vue'
import DietSummaryPanel from './DietSummaryPanel.vue'
import {
  addDietRecord,
  currentDietUserId,
  deleteDietRecord,
  queryDietRecords,
  updateDietRecord,
} from './api/diet.js'

const segments = DIET_SEGMENTS

const activeSegment = ref('all')
const search = ref('')
const queryPanelOpen = ref(false)
const meals = ref([])
const selectedId = ref(null)
const loading = ref(false)
const saving = ref(false)
const dialogOpen = ref(false)
const dialogMode = ref('add')
const notice = ref({ type: '', message: '' })

const mealTypeOptions = MEAL_TYPE_OPTIONS
const nutrientFields = NUTRIENT_FIELDS

const form = ref(createEmptyForm())
const selectedMeal = computed(() =>
  meals.value.find((meal) => String(meal.id) === String(selectedId.value)) || null,
)

const filteredMeals = computed(() => {
  const keyword = search.value.trim().toLowerCase()
  if (!keyword) return meals.value

  return meals.value.filter((meal) =>
    [meal.period, meal.name, meal.desc]
      .join(' ')
      .toLowerCase()
      .includes(keyword),
  )
})

function resetQuery() {
  activeSegment.value = 'all'
  search.value = ''
  loadMeals()
}

function selectSegment(key) {
  activeSegment.value = key
  loadMeals()
}

function selectMeal(meal) {
  selectedId.value = String(meal.id) === String(selectedId.value) ? null : meal.id
}

async function loadMeals() {
  loading.value = true
  setNotice('', '')
  try {
    meals.value = await queryDietRecords({
      userId: currentDietUserId(),
      keyword: search.value,
      ...dateRange(activeSegment.value),
    })
    if (!selectedMeal.value) selectedId.value = null
  } catch (error) {
    setNotice('error', error.message || '查询饮食记录失败')
  } finally {
    loading.value = false
  }
}

function openAddDialog() {
  dialogMode.value = 'add'
  form.value = createEmptyForm()
  dialogOpen.value = true
}

function openEditDialog() {
  if (!selectedMeal.value) return
  const meal = selectedMeal.value
  dialogMode.value = 'edit'
  form.value = {
    id: meal.id,
    userId: meal.userId,
    eatTime: String(meal.eatTime || '').slice(0, 16),
    mealType: meal.mealType,
    foodName: meal.name,
    calories: meal.kcal,
    protein: meal.protein,
    carbohydrate: meal.carbs,
    fat: meal.fat,
    sugar: meal.sugar,
    sodium: meal.sodium,
    location: meal.place,
    note: meal.desc,
    imageUrl: meal.img,
  }
  dialogOpen.value = true
}

function closeDialog() {
  if (!saving.value) dialogOpen.value = false
}

async function saveMeal() {
  saving.value = true
  try {
    const action = dialogMode.value === 'add' ? addDietRecord : updateDietRecord
    await action(form.value)
    dialogOpen.value = false
    await loadMeals()
    setNotice('success', dialogMode.value === 'add' ? '饮食记录已新增' : '饮食记录已修改')
  } catch (error) {
    setNotice('error', error.message || '保存饮食记录失败')
  } finally {
    saving.value = false
  }
}

async function removeSelectedMeal() {
  const meal = selectedMeal.value
  if (!meal || !window.confirm(`确定删除“${meal.name}”吗？`)) return
  loading.value = true
  try {
    await deleteDietRecord(meal.id)
    selectedId.value = null
    await loadMeals()
    setNotice('success', '饮食记录已删除')
  } catch (error) {
    setNotice('error', error.message || '删除饮食记录失败')
  } finally {
    loading.value = false
  }
}

function createEmptyForm() {
  const now = new Date()
  return {
    id: null,
    userId: currentDietUserId(),
    eatTime: toDateTimeInput(now),
    mealType: defaultMealType(now.getHours()),
    foodName: '',
    calories: 0,
    protein: 0,
    carbohydrate: 0,
    fat: 0,
    sugar: 0,
    sodium: 0,
    location: 'home',
    note: '',
    imageUrl: '',
  }
}

function defaultMealType(hour) {
  if (hour < 10) return 10
  if (hour < 11) return 15
  if (hour < 14) return 20
  if (hour < 17) return 25
  if (hour < 22) return 30
  return 35
}

function dateRange(segment) {
  if (segment === 'all' || segment === 'habit') return {}
  const now = new Date()
  let start = new Date(now)
  let end = new Date(now)

  if (segment === 'today') {
    start.setHours(0, 0, 0, 0)
    end.setHours(23, 59, 59, 999)
  } else if (segment === 'week') {
    const mondayOffset = (now.getDay() + 6) % 7
    start.setDate(now.getDate() - mondayOffset)
    start.setHours(0, 0, 0, 0)
    end.setDate(start.getDate() + 6)
    end.setHours(23, 59, 59, 999)
  } else if (segment === 'month') {
    start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
    end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
  }
  return { startTime: toApiDateTime(start), endTime: toApiDateTime(end) }
}

function toDateTimeInput(date) {
  return toApiDateTime(date).slice(0, 16)
}

function toApiDateTime(date) {
  const pad = (value) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

function setNotice(type, message) {
  notice.value = { type, message }
}

function exportCsv() {
  const headers = ['食用时间', '餐别', '食物名称', '地点', '热量', '蛋白质', '碳水', '脂肪', '糖', '钠', '备注']
  const rows = meals.value.map((meal) => [
    meal.recordedAt,
    meal.period,
    meal.name,
    meal.place === 'outside' ? '在外' : '在家',
    meal.kcal,
    meal.protein,
    meal.carbs,
    meal.fat,
    meal.sugar,
    meal.sodium,
    meal.desc,
  ])
  const csv = [headers, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n')
  const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `饮食记录-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

function csvCell(value) {
  let text = String(value ?? '')
  if (/^[=+\-@]/.test(text)) text = `'${text}`
  return `"${text.replaceAll('"', '""')}"`
}

onMounted(loadMeals)

</script>

<style scoped>
.diet-dashboard {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: hidden;
  padding: 12px;
  background:
    radial-gradient(circle at top left, rgba(212, 233, 197, 0.55), transparent 28%),
    radial-gradient(circle at top right, rgba(255, 219, 209, 0.65), transparent 32%),
    linear-gradient(180deg, #fff8f6 0%, #f9f2f0 100%);
  color: #1d1b1a;
}

.material-symbols-outlined {
  font-family: 'Material Symbols Outlined';
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  font-size: 20px;
  line-height: 1;
}

.diet-dashboard > .hero-card {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  height: 56px;
  min-height: 56px;
  margin: -12px -12px 4px;
  padding: 0 2.5rem;
  background-color: #fff8f6;
  border: 0;
  border-bottom: 1px solid rgba(220, 193, 185, 0.72);
  box-shadow: none;
}

.hero-copy {
  max-width: min(760px, 100%);
}

.eyebrow,
.section-kicker,
.meta-label {
  margin: 0 0 10px;
  font-size: 12px;
  line-height: 16px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #7e2c11;
  font-weight: 700;
}

.page-title {
  margin: 0;
  font-size: 1.5rem;
  line-height: 1.2;
  letter-spacing: 0;
  color: #1d1b1a;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  padding: 16px;
  border-radius: 18px;
  background: rgba(255, 248, 246, 0.88);
  border: 1px solid rgba(220, 193, 185, 0.72);
  box-shadow: 0 18px 40px rgba(50, 47, 46, 0.06);
  backdrop-filter: blur(16px);
}

.actions,
.query-panel {
  display: flex;
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
  opacity: 0.48;
  transform: none;
}

.operation-notice {
  margin: -4px 0 0;
  padding: 9px 13px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
}

.operation-notice.success {
  color: #315b25;
  background: rgba(212, 233, 197, 0.85);
}

.operation-notice.error {
  color: #8d2f22;
  background: rgba(255, 219, 209, 0.9);
}

.actions button,
.query-panel button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 38px;
  border-radius: 12px;
  padding: 0 14px;
  background: #f1edec;
  color: #444748;
  font-size: 14px;
  font-weight: 800;
  white-space: nowrap;
}

.actions .primary {
  background: #1c1b1b;
  color: #ffffff;
}

.query-panel {
  justify-content: flex-end;
  align-items: center;
  flex: 1 1 520px;
  margin-left: auto;
}

.segment-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.seg-btn {
  min-width: 64px;
  min-height: 38px;
  padding: 0 14px;
  border-radius: 12px;
  border: 1px solid transparent;
  background: #f3ecea;
  color: #56423d;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.seg-btn.active {
  background: #1c1b1b;
  color: #fff;
  box-shadow: 0 10px 18px rgba(28, 27, 27, 0.14);
}

.search-bar {
  flex: 0 0 226px;
  width: 226px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 16px;
  min-height: 38px;
  border-radius: 12px;
  background: #ffffff;
  border: 1px solid rgba(220, 193, 185, 0.72);
  color: #89726c;
}

.search-bar input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  font-size: 15px;
  color: #1d1b1a;
}

.diet-main {
  display: grid;
  grid-template-columns: minmax(0, 1.65fr) minmax(300px, 0.95fr);
  flex: 1 1 auto;
  gap: 16px;
  min-height: 0;
  overflow: hidden;
}

.section-heading {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: end;
  margin-bottom: 10px;
}

.section-heading h2 {
  margin: 0;
  font-family: 'Playfair Display', 'Times New Roman', serif;
  font-size: clamp(20px, 1.8vw, 26px);
  line-height: 1.1;
  color: #1d1b1a;
}

.section-note {
  color: #89726c;
  font-size: 14px;
}

.timeline-area,
.summary-area {
  min-width: 0;
  min-height: 0;
}

.timeline-area {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.summary-area {
  overflow: hidden;
}

.dialog-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(28, 27, 27, 0.38);
  backdrop-filter: blur(5px);
}

.diet-dialog {
  width: min(760px, 100%);
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  padding: 22px;
  border-radius: 20px;
  background: #fffaf8;
  border: 1px solid rgba(220, 193, 185, 0.9);
  box-shadow: 0 28px 80px rgba(50, 47, 46, 0.24);
}

.dialog-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.dialog-head h2 {
  margin: 0;
  font-size: 22px;
}

.icon-button {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #f1edec;
  color: #56423d;
  font-size: 24px;
}

.diet-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 13px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.field.wide,
.dialog-actions.wide {
  grid-column: 1 / -1;
}

.field span {
  color: #56423d;
  font-size: 13px;
  font-weight: 800;
}

.field input,
.field select,
.field textarea {
  box-sizing: border-box;
  width: 100%;
  min-height: 42px;
  border: 1px solid rgba(220, 193, 185, 0.92);
  border-radius: 11px;
  outline: none;
  padding: 9px 12px;
  background: #fff;
  color: #1d1b1a;
  font: inherit;
}

.field textarea {
  resize: vertical;
}

.field input:focus,
.field select:focus,
.field textarea:focus {
  border-color: #9a4024;
  box-shadow: 0 0 0 3px rgba(154, 64, 36, 0.1);
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 5px;
}

.dialog-actions button {
  min-width: 92px;
  min-height: 40px;
  border-radius: 11px;
  padding: 0 16px;
  background: #f1edec;
  color: #444748;
  font-weight: 800;
}

.dialog-actions .primary {
  background: #1c1b1b;
  color: #fff;
}

@media (max-width: 1280px) {
  .diet-main {
    grid-template-columns: minmax(0, 1.35fr) minmax(280px, 0.9fr);
  }
}

@media (max-width: 1100px) {
  .section-heading {
    flex-direction: column;
    align-items: stretch;
  }

  .diet-main {
    grid-template-columns: 1fr;
  }

  .hero-meta {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .diet-dashboard {
    padding: 12px;
  }

  .diet-dashboard > .hero-card {
    margin: -12px -12px 1rem;
    padding: 0 1rem;
    border-radius: 0;
  }

  .hero-meta {
    grid-template-columns: 1fr;
  }

  .actions,
  .query-panel,
  .segment-buttons {
    width: 100%;
  }

  .query-panel {
    margin-left: 0;
  }

  .search-bar {
    flex: 1 1 100%;
    width: 100%;
  }

  .actions button,
  .query-panel button,
  .seg-btn {
    flex: 1 1 auto;
  }

  .diet-form {
    grid-template-columns: 1fr;
  }

  .field.wide,
  .dialog-actions.wide {
    grid-column: auto;
  }
}
</style>


