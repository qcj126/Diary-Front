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
        <button type="button" :disabled="!selectedMeal || loading" @click="requestSelectedNutritionAnalysis">
          <span class="material-symbols-outlined">nutrition</span>
          营养分析
        </button>
        <button type="button" :disabled="!selectedMeal || loading" @click="previewSelectedNutritionResult">
          <span class="material-symbols-outlined">visibility</span>
          结果预览
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
          <label class="field">
            <span>食物名称</span>
            <input v-model.trim="form.foodName" maxlength="200" required placeholder="例如：香煎三文鱼能量碗" />
          </label>
          <label class="field">
            <span>用餐地点</span>
            <select v-model="form.location" required>
              <option value="home">在家吃</option>
              <option value="outside">在外吃</option>
            </select>
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
          <label class="field wide">
            <span>上传图片</span>
            <input accept="image/png,image/jpeg" type="file" :disabled="uploadingImage" @change="uploadImage" />
            <small v-if="uploadingImage">{{ imageUploadDescription }}（{{ imageUploadProgress }}%）</small>
          </label>
          <label class="field wide">
            <span>图片地址（可选）</span>
            <input v-model.trim="form.imageUrl" maxlength="1000" type="text" placeholder="https://... 或上传后自动填写" />
          </label>
          <label class="field wide">
            <span>备注</span>
            <input v-model.trim="form.note" maxlength="500" type="text" placeholder="食材、口味或当时的感受" />
          </label>

          <div class="dialog-actions record-actions wide">
            <button type="button" @click="closeDialog">取消</button>
            <button type="submit" class="primary" :disabled="saving || uploadingImage">
              {{ saving ? '保存中…' : uploadingImage ? '图片上传中…' : '保存' }}
            </button>
          </div>
        </form>
      </section>
    </div>

    <div v-if="nutritionPromptOpen" class="dialog-backdrop" role="presentation">
      <section class="diet-dialog nutrition-prompt-dialog" role="dialog" aria-modal="true" aria-labelledby="nutrition-prompt-title">
        <div class="nutrition-prompt-icon">
          <span class="material-symbols-outlined">nutrition</span>
        </div>
        <p class="dialog-kicker">记录保存成功</p>
        <h2 id="nutrition-prompt-title">是否使用 AI 进行营养分析？</h2>
        <div class="dialog-actions prompt-actions">
          <button type="button" @click="skipNutritionAnalysis">暂不分析</button>
          <button type="button" class="primary" @click="openNutritionAnalysisDialog">使用 AI 分析</button>
        </div>
      </section>
    </div>

    <div v-if="nutritionDialogOpen" class="dialog-backdrop" role="presentation">
      <section class="diet-dialog nutrition-analysis-dialog" role="dialog" aria-modal="true" aria-labelledby="nutrition-dialog-title">
        <div class="dialog-head">
          <div>
            <p class="dialog-kicker">AI 营养分析</p>
            <h2 id="nutrition-dialog-title">{{ nutritionTarget?.foodName || '饮食记录' }}</h2>
          </div>
          <button type="button" class="icon-button" aria-label="关闭" :disabled="nutritionSubmitting" @click="closeNutritionAnalysisDialog">×</button>
        </div>

        <form class="nutrition-form" @submit.prevent="submitNutritionAnalysis">
          <label class="field wide">
            <span>烹饪方式</span>
            <input v-model.trim="nutritionForm.cookWay" maxlength="100" required placeholder="例如：少油香煎、清蒸、凉拌" />
          </label>

          <section class="ingredient-panel wide" aria-labelledby="diet-ingredient-title">
            <div class="ingredient-heading">
              <div>
                <h3 id="diet-ingredient-title">食材列表</h3>
                <p>填写食材名称及对应份量，佐料和用油也建议列出。</p>
              </div>
              <button type="button" class="add-ingredient-button" @click="addIngredient">+ 添加食材</button>
            </div>
            <div class="ingredient-table-head" aria-hidden="true">
              <span>食材名称</span>
              <span>用量</span>
              <span></span>
            </div>
            <div class="ingredient-rows">
              <div v-for="(ingredient, index) in nutritionForm.ingredients" :key="ingredient.key" class="ingredient-row">
                <input v-model.trim="ingredient.name" maxlength="100" required placeholder="例如：三文鱼" />
                <input v-model.trim="ingredient.quantity" maxlength="100" required placeholder="例如：150g" />
                <button type="button" class="remove-ingredient-button" aria-label="删除食材" :disabled="nutritionForm.ingredients.length === 1" @click="removeIngredient(index)">×</button>
              </div>
            </div>
          </section>

          <label class="field wide">
            <span>AI 类型</span>
            <select v-model.number="nutritionForm.aiType" required>
              <option :value="1">Qwen 3.7 Plus</option>
              <option :value="2">DeepSeek V4 Pro 0813</option>
            </select>
          </label>

          <p v-if="nutritionError" class="nutrition-error wide">{{ nutritionError }}</p>

          <div class="dialog-actions wide">
            <button type="button" :disabled="nutritionSubmitting" @click="closeNutritionAnalysisDialog">取消</button>
            <button type="submit" class="primary" :disabled="nutritionSubmitting">
              {{ nutritionSubmitting ? '提交中…' : '一键分析' }}
            </button>
          </div>
        </form>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { DIET_SEGMENTS, MEAL_TYPE_OPTIONS } from '../../constants/diet.js'
import DietTimeline from './DietTimeline.vue'
import DietSummaryPanel from './DietSummaryPanel.vue'
import {
  addDietRecord,
  deleteDietRecord,
  queryDietRecords,
  submitDietNutritionAnalysis,
  uploadDietImage,
  updateDietRecord,
} from './api/diet.js'
import { loadTrackedAiTasks, saveTrackedAiTask } from '../ai-results/taskStore.js'

const emit = defineEmits(['preview-ai-result'])

const segments = DIET_SEGMENTS
const uploadingImage = ref(false)
const imageUploadProgress = ref(0)
const imageUploadDescription = ref('正在准备图片')

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
const nutritionPromptOpen = ref(false)
const nutritionDialogOpen = ref(false)
const nutritionTarget = ref(null)
const nutritionSubmitting = ref(false)
const nutritionError = ref('')
const nutritionForm = ref(createEmptyNutritionForm())

const mealTypeOptions = MEAL_TYPE_OPTIONS

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

function requestSelectedNutritionAnalysis() {
  const meal = selectedMeal.value
  if (!meal) {
    setNotice('error', '请选择一条需要分析的饮食记录')
    return
  }
  nutritionTarget.value = { id: meal.id, foodName: meal.name }
  openNutritionAnalysisDialog()
}

function previewSelectedNutritionResult() {
  const meal = selectedMeal.value
  if (!meal) {
    setNotice('error', '请选择一条需要预览结果的饮食记录')
    return
  }

  const task = loadTrackedAiTasks()
    .filter((item) => item.flag === 'DIET' && String(item.universalId) === String(meal.id))
    .sort((a, b) => String(b.submittedAt ?? '').localeCompare(String(a.submittedAt ?? '')))[0]
  if (!task?.taskId) {
    setNotice('error', '该饮食记录暂无可预览的 AI 分析任务，请先提交营养分析')
    return
  }

  emit('preview-ai-result', task.taskId)
}

async function loadMeals() {
  loading.value = true
  setNotice('', '')
  try {
    meals.value = await queryDietRecords({
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
    eatTime: String(meal.eatTime || '').slice(0, 16),
    mealType: meal.mealType,
    foodName: meal.name,
    location: meal.place,
    note: meal.desc,
    imageUrl: meal.imageUrl ?? meal.img,
    imageId: meal.imageId ?? '0',
  }
  dialogOpen.value = true
}

function closeDialog() {
  if (!saving.value) dialogOpen.value = false
}

async function saveMeal() {
  saving.value = true
  try {
    const isAdding = dialogMode.value === 'add'
    const action = isAdding ? addDietRecord : updateDietRecord
    const recordId = await action(form.value)
    const savedFoodName = form.value.foodName
    dialogOpen.value = false
    await loadMeals()
    setNotice('success', isAdding ? '饮食记录已新增' : '饮食记录已修改')
    if (isAdding) {
      nutritionTarget.value = { id: recordId, foodName: savedFoodName }
      nutritionPromptOpen.value = true
    }
  } catch (error) {
    setNotice('error', error.message || '保存饮食记录失败')
  } finally {
    saving.value = false
  }
}

async function uploadImage(event) {
  const file = event.target.files?.[0]
  if (!file) return
  uploadingImage.value = true
  imageUploadProgress.value = 0
  imageUploadDescription.value = '正在准备图片'
  try {
    const uploaded = await uploadDietImage(file, {
      onProgress: (percentage, detail) => {
        imageUploadProgress.value = percentage
        imageUploadDescription.value = detail?.description || `正在上传图片 ${percentage}%`
      },
    })
    form.value.imageId = uploaded.imageId
    form.value.imageUrl = uploaded.imageUrl
    setNotice('success', '图片上传成功')
  } catch (error) {
    setNotice('error', error.message || '图片上传失败')
  } finally {
    uploadingImage.value = false
    imageUploadProgress.value = 0
    imageUploadDescription.value = '正在准备图片'
    event.target.value = ''
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
    eatTime: toDateTimeInput(now),
    mealType: defaultMealType(now.getHours()),
    foodName: '',
    location: 'home',
    note: '',
    imageUrl: '',
    imageId: '0',
  }
}

function createEmptyNutritionForm() {
  return {
    aiType: 1,
    cookWay: '',
    ingredients: [createIngredient()],
  }
}

function createIngredient() {
  return {
    key: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: '',
    quantity: '',
  }
}

function skipNutritionAnalysis() {
  nutritionPromptOpen.value = false
  nutritionTarget.value = null
}

function openNutritionAnalysisDialog() {
  nutritionPromptOpen.value = false
  nutritionForm.value = createEmptyNutritionForm()
  nutritionError.value = ''
  nutritionDialogOpen.value = true
}

function closeNutritionAnalysisDialog() {
  if (nutritionSubmitting.value) return
  nutritionDialogOpen.value = false
  nutritionTarget.value = null
  nutritionError.value = ''
}

function addIngredient() {
  nutritionForm.value.ingredients.push(createIngredient())
}

function removeIngredient(index) {
  if (nutritionForm.value.ingredients.length === 1) return
  nutritionForm.value.ingredients.splice(index, 1)
}

function buildIngredients() {
  return nutritionForm.value.ingredients.reduce((result, ingredient) => {
    const name = ingredient.name.trim()
    const quantity = ingredient.quantity.trim()
    if (!name || !quantity) return result
    result[name] = result[name] ? `${result[name]}、${quantity}` : quantity
    return result
  }, {})
}

function createClientRequestId() {
  const randomValues = new Uint32Array(1)
  const randomNumber = globalThis.crypto?.getRandomValues
    ? globalThis.crypto.getRandomValues(randomValues)[0]
    : Math.floor(Math.random() * 0xffffffff)
  return `diet-web-${Date.now()}-${String(randomNumber).padStart(10, '0')}`
}

async function submitNutritionAnalysis() {
  const universalId = nutritionTarget.value?.id
  const cookWay = nutritionForm.value.cookWay.trim()
  const ingredients = buildIngredients()
  if (!universalId) {
    nutritionError.value = '未获取到饮食记录主键，请刷新后重试'
    return
  }
  if (!cookWay || !Object.keys(ingredients).length) {
    nutritionError.value = '请完整填写烹饪方式、食材名称和用量'
    return
  }

  nutritionSubmitting.value = true
  nutritionError.value = ''
  const clientRequestId = createClientRequestId()
  try {
    const result = await submitDietNutritionAnalysis({
      clientRequestId,
      aiType: Number(nutritionForm.value.aiType),
      flag: 'DIET',
      universalId,
      cookWay,
      ingredients,
    })
    if (result?.taskId) {
      saveTrackedAiTask({
        taskId: result.taskId,
        status: result.status || 'PENDING',
        flag: 'DIET',
        aiApplication: 1,
        aiType: Number(nutritionForm.value.aiType),
        universalId,
        clientRequestId,
        title: nutritionTarget.value?.foodName || '饮食营养分析',
      })
    }
    nutritionSubmitting.value = false
    closeNutritionAnalysisDialog()
    setNotice('success', result?.taskId ? `营养分析任务已提交（${result.taskId}）` : '营养分析任务已提交')
  } catch (error) {
    nutritionError.value = error.message || '营养分析任务提交失败'
  } finally {
    nutritionSubmitting.value = false
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

.record-actions {
  justify-content: space-between;
}

.dialog-kicker {
  margin: 0 0 6px;
  color: #9a4024;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.nutrition-prompt-dialog {
  width: min(480px, 100%);
  text-align: center;
}

.nutrition-prompt-dialog h2 {
  margin: 0;
  font-size: 24px;
}

.nutrition-prompt-dialog > p:not(.dialog-kicker) {
  margin: 12px auto 22px;
  max-width: 390px;
  color: #78625c;
  line-height: 1.7;
}

.nutrition-prompt-icon {
  display: grid;
  place-items: center;
  width: 58px;
  height: 58px;
  margin: 0 auto 14px;
  border-radius: 18px;
  color: #315b25;
  background: #d4e9c5;
}

.nutrition-prompt-icon .material-symbols-outlined {
  font-size: 30px;
}

.prompt-actions {
  justify-content: center;
  margin-top: 22px;
}

.nutrition-analysis-dialog {
  width: min(720px, 100%);
}

.nutrition-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.nutrition-form .wide,
.ingredient-panel.wide,
.nutrition-error.wide {
  grid-column: 1 / -1;
}

.ingredient-panel {
  padding: 16px;
  border: 1px solid rgba(220, 193, 185, 0.9);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.66);
}

.ingredient-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
}

.ingredient-heading h3,
.ingredient-heading p {
  margin: 0;
}

.ingredient-heading h3 {
  font-size: 16px;
}

.ingredient-heading p {
  margin-top: 5px;
  color: #89726c;
  font-size: 13px;
}

.add-ingredient-button {
  flex: 0 0 auto;
  min-height: 34px;
  padding: 0 12px;
  border-radius: 10px;
  color: #7e2c11;
  background: #f3e5df;
  font-weight: 800;
}

.ingredient-table-head,
.ingredient-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 0.85fr) 38px;
  gap: 10px;
  align-items: center;
}

.ingredient-table-head {
  padding: 0 2px 7px;
  color: #78625c;
  font-size: 12px;
  font-weight: 800;
}

.ingredient-rows {
  display: grid;
  gap: 9px;
}

.ingredient-row input {
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  min-height: 40px;
  padding: 8px 11px;
  border: 1px solid rgba(220, 193, 185, 0.92);
  border-radius: 10px;
  outline: none;
  background: #fff;
  font: inherit;
}

.remove-ingredient-button {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  color: #8d2f22;
  background: #ffe4dc;
  font-size: 20px;
}

.nutrition-error {
  margin: 0;
  padding: 10px 12px;
  border-radius: 10px;
  color: #8d2f22;
  background: rgba(255, 219, 209, 0.9);
  font-size: 13px;
  font-weight: 700;
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

  .nutrition-form {
    grid-template-columns: 1fr;
  }

  .nutrition-form .wide,
  .ingredient-panel.wide,
  .nutrition-error.wide {
    grid-column: auto;
  }

  .ingredient-heading {
    flex-direction: column;
  }

  .ingredient-table-head {
    display: none;
  }

  .ingredient-row {
    grid-template-columns: 1fr 1fr 38px;
  }

  .field.wide,
  .dialog-actions.wide {
    grid-column: auto;
  }
}
</style>


