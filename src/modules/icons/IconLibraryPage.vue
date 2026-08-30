<template>
  <section class="icon-page" :class="{ embedded }">
    <header class="icon-header">
      <div>
        <p class="section-kicker">Icon Library</p>
        <component :is="embedded ? 'h2' : 'h1'">图标库</component>
      </div>
      <button class="primary-button" type="button" @click="openAddDialog">
        <span class="material-symbols-outlined">add</span>
        <span>新增图标</span>
      </button>
    </header>

    <div class="toolbar">
      <label class="search-field">
        <span class="material-symbols-outlined">search</span>
        <input v-model.trim="filters.iconName" type="search" placeholder="图标名称" @keyup.enter="loadIcons" />
      </label>

      <div class="resolution-tabs" aria-label="按分辨率查询">
        <button
          v-for="option in resolutionOptions"
          :key="option.value"
          type="button"
          :class="{ active: filters.pixel === option.value }"
          @click="selectResolution(option.value)"
        >
          {{ option.label }}
        </button>
      </div>

      <button class="icon-button" type="button" title="查询" aria-label="查询" :disabled="loading" @click="loadIcons">
        <span class="material-symbols-outlined">refresh</span>
      </button>
    </div>

    <div v-if="loading" class="state-row">加载中...</div>
    <div v-else-if="error" class="state-row error">{{ error }}</div>
    <div v-else-if="displayIcons.length === 0" class="state-row">暂无图标</div>

    <div v-else class="icon-grid">
      <article
        v-for="icon in displayIcons"
        :key="icon.id"
        class="icon-card"
        :title="icon.iconName"
        @click="openEditDialog(icon)"
      >
        <button class="delete-button" type="button" title="删除" aria-label="删除" @click.stop="requestDelete(icon)">
          <span class="material-symbols-outlined">delete</span>
        </button>
        <div class="preview" :style="{ '--icon-size': `${previewSize(icon.iconPixel)}px` }">
          <img v-if="icon.iconUrl && !imageFailed(icon.id)" :src="icon.iconUrl" :alt="icon.iconName" @error="markImageFailed(icon.id)" />
          <span v-else class="material-symbols-outlined">image</span>
        </div>
        <strong>{{ icon.iconName }}</strong>
        <span>{{ icon.iconPixel || '-' }}px</span>
      </article>
    </div>

    <div v-if="formOpen" class="modal-backdrop" @click.self="closeForm">
      <form class="icon-dialog" @submit.prevent="saveIcon">
        <header class="dialog-header">
          <h2>{{ editingIcon ? '修改图标' : '新增图标' }}</h2>
          <button class="dialog-icon-button" type="button" @click="closeForm">
            <span class="material-symbols-outlined">close</span>
          </button>
        </header>

        <label class="dialog-field">
          <span>图标名称</span>
          <input v-model.trim="draft.iconName" type="text" maxlength="64" required />
        </label>

        <label class="dialog-field">
          <span>分辨率</span>
          <select v-model.number="draft.iconPixel" required>
            <option v-for="size in iconSizes" :key="size" :value="size">{{ size }}px</option>
          </select>
        </label>

        <label class="upload-field">
          <input type="file" accept="image/*,.svg" @change="handleFileChange" />
          <span class="material-symbols-outlined">upload_file</span>
          <strong>{{ draft.fileName || (editingIcon ? '保留原文件' : '选择图标文件') }}</strong>
        </label>

        <p v-if="formError" class="dialog-error">{{ formError }}</p>

        <footer class="dialog-actions split">
          <button class="secondary-button" type="button" @click="closeForm">取消</button>
          <button class="primary-button" type="submit" :disabled="saving">
            {{ saving ? '保存中...' : '保存' }}
          </button>
        </footer>
      </form>
    </div>

    <div v-if="deleteOpen" class="modal-backdrop" @click.self="closeDeleteDialog">
      <section class="confirm-dialog">
        <header class="dialog-header">
          <h2>删除图标</h2>
          <button class="dialog-icon-button" type="button" @click="closeDeleteDialog">
            <span class="material-symbols-outlined">close</span>
          </button>
        </header>
        <p>确认删除吗？</p>
        <footer class="dialog-actions split">
          <button class="secondary-button" type="button" :disabled="deleting" @click="closeDeleteDialog">取消</button>
          <button class="danger-button" type="button" :disabled="deleting" @click="confirmDelete">
            {{ deleting ? '删除中...' : '确定删除' }}
          </button>
        </footer>
      </section>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { addIcon, deleteIcon, queryIcons, updateIcon } from './api/icons.js'

defineProps({
  embedded: {
    type: Boolean,
    default: false,
  },
})

const iconSizes = [16, 32, 48]
const resolutionOptions = [
  { label: '全部', value: null },
  ...iconSizes.map((size) => ({ label: `${size}px`, value: size })),
]

const icons = ref([])
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const error = ref('')
const formError = ref('')
const formOpen = ref(false)
const deleteOpen = ref(false)
const editingIcon = ref(null)
const pendingDeleteIcon = ref(null)
const failedImages = ref(new Set())

const filters = reactive({
  iconName: '',
  pixel: null,
})

const draft = reactive({
  iconName: '',
  iconPixel: 32,
  file: null,
  fileName: '',
})

const displayIcons = computed(() =>
  icons.value
    .filter((icon) => !filters.pixel || Number(icon.iconPixel) === Number(filters.pixel))
    .sort((a, b) => (a.iconPixel || 0) - (b.iconPixel || 0) || String(a.iconName).localeCompare(String(b.iconName))),
)

function previewSize(size) {
  const value = Number(size)
  if (!Number.isFinite(value)) return 32
  return Math.min(Math.max(value, 16), 48)
}

async function loadIcons() {
  loading.value = true
  error.value = ''

  try {
    failedImages.value = new Set()
    icons.value = await queryIcons({ iconName: filters.iconName })
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : '查询图标失败'
  } finally {
    loading.value = false
  }
}

function selectResolution(pixel) {
  filters.pixel = pixel
}

function resetDraft() {
  draft.iconName = ''
  draft.iconPixel = 32
  draft.file = null
  draft.fileName = ''
}

function openAddDialog() {
  editingIcon.value = null
  formError.value = ''
  resetDraft()
  formOpen.value = true
}

function openEditDialog(icon) {
  editingIcon.value = icon
  formError.value = ''
  draft.iconName = icon.iconName
  draft.iconPixel = iconSizes.includes(Number(icon.iconPixel)) ? Number(icon.iconPixel) : 32
  draft.file = null
  draft.fileName = ''
  formOpen.value = true
}

function closeForm() {
  formOpen.value = false
  formError.value = ''
}

function fileNameWithoutExtension(fileName) {
  const lastDotIndex = fileName.lastIndexOf('.')
  return lastDotIndex > 0 ? fileName.slice(0, lastDotIndex) : fileName
}

function handleFileChange(event) {
  const [file] = Array.from(event.target.files || [])
  draft.file = file || null
  draft.fileName = file?.name || ''

  if (!editingIcon.value && file) {
    draft.iconName = fileNameWithoutExtension(file.name)
  }
}

async function saveIcon() {
  if (!draft.iconName) {
    formError.value = '请填写图标名称'
    return
  }

  if (!editingIcon.value && !draft.file) {
    formError.value = '请选择图标文件'
    return
  }

  saving.value = true
  formError.value = ''

  try {
    if (editingIcon.value) {
      await updateIcon({
        id: editingIcon.value.id,
        file: draft.file,
        iconName: draft.iconName,
        iconPixel: draft.iconPixel,
      })
    } else {
      await addIcon({
        file: draft.file,
        iconName: draft.iconName,
        iconPixel: draft.iconPixel,
      })
    }

    formOpen.value = false
    await loadIcons()
  } catch (caught) {
    formError.value = caught instanceof Error ? caught.message : '保存图标失败'
  } finally {
    saving.value = false
  }
}

function requestDelete(icon) {
  pendingDeleteIcon.value = icon
  deleteOpen.value = true
}

function closeDeleteDialog() {
  if (deleting.value) return
  deleteOpen.value = false
  pendingDeleteIcon.value = null
}

async function confirmDelete() {
  if (!pendingDeleteIcon.value) return
  deleting.value = true

  try {
    await deleteIcon(pendingDeleteIcon.value.id)
    deleteOpen.value = false
    pendingDeleteIcon.value = null
    await loadIcons()
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : '删除图标失败'
  } finally {
    deleting.value = false
  }
}

function markImageFailed(id) {
  const next = new Set(failedImages.value)
  next.add(String(id))
  failedImages.value = next
}

function imageFailed(id) {
  return failedImages.value.has(String(id))
}

onMounted(loadIcons)
</script>

<style scoped>
.icon-page {
  min-height: 100vh;
  padding: 32px;
  background: var(--dashboard-bg, #fdf8f8);
  color: var(--dashboard-text, #1c1b1b);
}

.icon-page.embedded {
  min-height: 0;
  padding: 0;
  background: transparent;
}

.icon-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 24px;
}

.section-kicker {
  margin: 0 0 6px;
  color: var(--dashboard-text-muted, #5c5f61);
  font-size: 12px;
  font-weight: 700;
}

.icon-header h1,
.icon-header h2 {
  margin: 0;
  color: var(--dashboard-text-strong, #000000);
  font-size: 30px;
  line-height: 1.2;
}

.toolbar {
  display: grid;
  grid-template-columns: minmax(220px, 360px) auto 44px;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.search-field {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 44px;
  padding: 0 14px;
  border: 1px solid var(--dashboard-border, #c4c7c7);
  border-radius: 8px;
  background: var(--dashboard-surface, #ffffff);
}

.search-field .material-symbols-outlined {
  color: var(--dashboard-text-muted, #5c5f61);
  font-size: 20px;
}

.search-field input {
  min-width: 0;
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: inherit;
  font: inherit;
}

.resolution-tabs {
  display: inline-flex;
  gap: 4px;
  width: max-content;
  padding: 4px;
  border: 1px solid var(--dashboard-border, #c4c7c7);
  border-radius: 8px;
  background: var(--dashboard-surface, #ffffff);
}

.resolution-tabs button,
.primary-button,
.secondary-button,
.danger-button,
.icon-button {
  border: 0;
  border-radius: 8px;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.resolution-tabs button {
  min-width: 58px;
  min-height: 34px;
  padding: 0 12px;
  background: transparent;
  color: var(--dashboard-text-muted, #5c5f61);
}

.resolution-tabs button.active {
  background: var(--dashboard-accent, #1c1b1a);
  color: var(--dashboard-accent-contrast, #ffffff);
}

.primary-button,
.secondary-button,
.danger-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 42px;
  padding: 0 16px;
}

.primary-button {
  background: var(--dashboard-accent, #1c1b1a);
  color: var(--dashboard-accent-contrast, #ffffff);
}

.secondary-button {
  border: 1px solid var(--dashboard-border, #c4c7c7);
  background: var(--dashboard-surface, #ffffff);
  color: var(--dashboard-text, #1c1b1b);
}

.danger-button {
  background: #b42318;
  color: #ffffff;
}

.icon-button {
  display: grid;
  width: 44px;
  height: 44px;
  place-items: center;
  border: 1px solid var(--dashboard-border, #c4c7c7);
  background: var(--dashboard-surface, #ffffff);
  color: var(--dashboard-accent, #1c1b1a);
}

.primary-button:disabled,
.danger-button:disabled,
.icon-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(128px, 1fr));
  gap: 12px;
}

.icon-card {
  position: relative;
  display: grid;
  gap: 8px;
  min-height: 150px;
  padding: 18px 12px 14px;
  border: 1px solid var(--dashboard-border-soft, rgba(196, 199, 199, 0.56));
  border-radius: 8px;
  background: var(--dashboard-surface, #ffffff);
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
}

.icon-card:hover {
  border-color: var(--dashboard-accent, #1c1b1a);
  box-shadow: var(--dashboard-shadow, 0 18px 50px rgba(28, 27, 27, 0.08));
  transform: translateY(-2px);
}

.preview {
  display: grid;
  width: 64px;
  height: 64px;
  margin: 0 auto;
  place-items: center;
}

.preview img {
  width: var(--icon-size);
  height: var(--icon-size);
  object-fit: contain;
}

.preview .material-symbols-outlined {
  color: var(--dashboard-text-muted, #5c5f61);
  font-size: 32px;
}

.icon-card strong {
  overflow: hidden;
  color: var(--dashboard-text-strong, #000000);
  font-size: 13px;
  line-height: 18px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.icon-card > span {
  color: var(--dashboard-text-muted, #5c5f61);
  font-size: 12px;
}

.delete-button {
  position: absolute;
  top: 8px;
  right: 8px;
  display: grid;
  width: 32px;
  height: 32px;
  place-items: center;
  border: 0;
  border-radius: 8px;
  background: #b42318;
  color: #ffffff;
  cursor: pointer;
  opacity: 0;
  pointer-events: none;
  transform: translateY(-4px);
  transition: opacity 0.18s, transform 0.18s;
}

.icon-card:hover .delete-button,
.delete-button:focus-visible {
  opacity: 1;
  pointer-events: auto;
  transform: translateY(0);
}

.delete-button .material-symbols-outlined,
.primary-button .material-symbols-outlined,
.dialog-icon-button .material-symbols-outlined,
.icon-button .material-symbols-outlined {
  font-size: 20px;
}

.state-row {
  display: grid;
  min-height: 220px;
  place-items: center;
  border: 1px dashed var(--dashboard-border, #c4c7c7);
  border-radius: 8px;
  color: var(--dashboard-text-muted, #5c5f61);
  background: var(--dashboard-surface, #ffffff);
}

.state-row.error,
.dialog-error {
  color: #b42318;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgba(17, 19, 24, 0.44);
}

.icon-dialog,
.confirm-dialog {
  width: min(92vw, 420px);
  border: 1px solid var(--dashboard-border, #c4c7c7);
  border-radius: 8px;
  background: var(--dashboard-surface, #ffffff);
  color: var(--dashboard-text, #1c1b1b);
  box-shadow: 0 22px 70px rgba(0, 0, 0, 0.22);
}

.icon-dialog {
  display: grid;
  gap: 16px;
  padding: 20px;
}

.confirm-dialog {
  padding: 20px;
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.dialog-header h2 {
  margin: 0;
  color: var(--dashboard-text-strong, #000000);
  font-size: 18px;
}

.dialog-icon-button {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  border: 0;
  border-radius: 8px;
  background: var(--dashboard-surface-muted, #f1edec);
  color: var(--dashboard-text, #1c1b1b);
  cursor: pointer;
}

.dialog-field {
  display: grid;
  gap: 8px;
  color: var(--dashboard-text-muted, #5c5f61);
  font-size: 13px;
  font-weight: 700;
}

.dialog-field input,
.dialog-field select {
  width: 100%;
  min-height: 42px;
  border: 1px solid var(--dashboard-border, #c4c7c7);
  border-radius: 8px;
  background: var(--dashboard-surface, #ffffff);
  color: var(--dashboard-text, #1c1b1b);
  font: inherit;
  padding: 0 12px;
}

.upload-field {
  display: grid;
  min-height: 92px;
  place-items: center;
  gap: 6px;
  border: 1px dashed var(--dashboard-border, #c4c7c7);
  border-radius: 8px;
  background: var(--dashboard-surface-soft, #f7f3f2);
  color: var(--dashboard-text-muted, #5c5f61);
  cursor: pointer;
}

.upload-field input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}

.upload-field .material-symbols-outlined {
  font-size: 28px;
}

.upload-field strong {
  max-width: 90%;
  overflow: hidden;
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dialog-error {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.dialog-actions.split {
  justify-content: space-between;
  margin-top: 20px;
}

.confirm-dialog p {
  margin: 18px 0 0;
  color: var(--dashboard-text, #1c1b1b);
  font-size: 15px;
}

@media (max-width: 760px) {
  .icon-page {
    padding: 20px 16px;
  }

  .icon-header,
  .toolbar {
    grid-template-columns: 1fr;
  }

  .icon-header {
    align-items: stretch;
  }

  .toolbar {
    display: grid;
  }

  .resolution-tabs {
    width: 100%;
    overflow-x: auto;
  }

  .resolution-tabs button {
    flex: 1 0 58px;
  }

  .icon-button {
    width: 100%;
  }
}
</style>
