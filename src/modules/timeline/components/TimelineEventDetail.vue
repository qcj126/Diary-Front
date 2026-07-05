<template>
  <aside class="detail-panel">
    <template v-if="event || category">
      <header class="detail-header">
        <div>
          <span class="detail-kicker">{{ category ? '添加新事件' : '记录详情' }}</span>
          <h2>{{ draft.title || (category ? '新事件' : '未命名记录') }}</h2>
        </div>
        <button class="icon-button" type="button" aria-label="关闭详情" @click="$emit('close')">
          ×
        </button>
      </header>

      <div class="photo-frame" :class="{ 'is-uploading': isUploadingImage }">
        <img v-if="draft.imageUrl" :src="draft.imageUrl" :alt="draft.title || '记录照片'" />
        <div v-else class="photo-empty">上传照片</div>
        <div v-if="isUploadingImage" class="photo-uploading" aria-live="polite">
          <span class="upload-spinner" aria-hidden="true"></span>
          <span>上传中...</span>
        </div>
      </div>

      <div v-if="!isEditing && !category" class="view-mode">
        <div class="info-item">
          <span class="info-label">标题</span>
          <p class="info-value">{{ draft.title || '无' }}</p>
        </div>
        <div class="info-item">
          <span class="info-label">日期</span>
          <p class="info-value">{{ draft.date || '无' }}</p>
        </div>
        <div class="info-item">
          <span class="info-label">内容</span>
          <p class="info-value content-text">{{ draft.content || '无' }}</p>
        </div>
      </div>

      <form v-else class="detail-form" @submit.prevent="handleSave">
        <label>
          <span>标题</span>
          <input
            v-model.trim="draft.title"
            type="text"
            placeholder="写一个标题"
            :required="isCreating"
            :aria-invalid="Boolean(validationErrors.title)"
            @input="clearValidationError('title')"
          />
          <p v-if="validationErrors.title" class="field-error">{{ validationErrors.title }}</p>
        </label>

        <label>
          <span>日期</span>
          <input
            v-model="draft.date"
            type="date"
            :required="isCreating"
            :aria-invalid="Boolean(validationErrors.date)"
            @input="clearValidationError('date')"
          />
          <p v-if="validationErrors.date" class="field-error">{{ validationErrors.date }}</p>
        </label>

        <label>
          <span>内容</span>
          <textarea
            v-model.trim="draft.content"
            rows="7"
            placeholder="记录这一天的细节"
            :required="isCreating"
            :aria-invalid="Boolean(validationErrors.content)"
            @input="clearValidationError('content')"
          />
          <p v-if="validationErrors.content" class="field-error">{{ validationErrors.content }}</p>
        </label>

        <label class="photo-field">
          <span>照片</span>
          <span class="upload-button" :class="{ disabled: isUploadingImage }">
            <input type="file" accept="image/*" :disabled="isUploadingImage" @change="handlePhotoUpload" />
            上传照片
          </span>
          <p v-if="validationErrors.imageUrl" class="field-error photo-error">
            <span class="warning-icon" aria-hidden="true">!</span>
            <span>请上传照片</span>
          </p>
        </label>

        <p v-if="imageUploadError" class="upload-error">{{ imageUploadError }}</p>

        <div class="actions">
          <button class="success-button" type="button" @click="cancelEditing">取消</button>
          <button
            class="save-button"
            :class="{ 'is-ready': canSave }"
            type="submit"
            :disabled="!canSave"
          >
            保存
          </button>
        </div>
      </form>

      <div v-if="!isEditing && !category" class="view-actions-bottom">
        <button class="danger-button" type="button" @click="handleDelete">删除</button>
        <button class="primary-button" type="button" @click="startEditing">修改</button>
      </div>
    </template>

    <div v-else class="empty-detail">
      <span>选择一张记录卡片</span>
      <p>点击左侧任意卡片后，可以查看详情。</p>
    </div>

    <div v-if="showDeleteConfirm" class="delete-modal-overlay" @click.self="cancelDelete">
      <div class="delete-modal">
        <h3>确定删除？</h3>
        <div class="delete-modal-actions">
          <button class="modal-btn modal-btn-cancel" @click="cancelDelete">否</button>
          <button class="modal-btn modal-btn-confirm" @click="confirmDelete">是</button>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import {
  normalizeImageUrl,
  queryTimelineImageUrls,
  uploadTimelineImages,
} from '../api/images.js'
import { GLOBAL_USER_ID, getImageTypeByCategoryKey } from '../constants/imageTypes.js'

const props = defineProps({
  event: {
    type: Object,
    default: null,
  },
  category: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['save', 'close', 'delete'])

const isEditing = ref(false)
const showDeleteConfirm = ref(false)
const pendingDeleteId = ref('')
const isUploadingImage = ref(false)
const imageUploadError = ref('')
const validationErrors = reactive({
  title: '',
  date: '',
  content: '',
  imageUrl: '',
})
let activeUploadToken = 0

const IMAGE_URL_POLL_DELAY = 3000
const IMAGE_URL_POLL_INTERVAL = 3000

const isCreating = computed(() => Boolean(props.category))
const hasRequiredFields = computed(() => Boolean(
  draft.title.trim()
    && draft.date
    && draft.content.trim()
    && (draft.imageUrl || draft.imageId)
))
const canSave = computed(() => (isCreating.value ? hasRequiredFields.value : true))

const draft = reactive({
  id: '',
  rawId: null,
  userId: null,
  categoryId: null,
  title: '',
  date: '',
  content: '',
  imageUrl: '',
  imageId: null,
  categoryKey: '',
})

function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

function readUserId() {
  return GLOBAL_USER_ID
}

function getUploadImageCode() {
  return getImageTypeByCategoryKey(draft.categoryKey || props.category?.key).code
}

function toKey(value) {
  return String(value ?? '').trim()
}

function clearValidationError(field) {
  validationErrors[field] = ''
}

function clearValidationErrors() {
  validationErrors.title = ''
  validationErrors.date = ''
  validationErrors.content = ''
  validationErrors.imageUrl = ''
}

function validateRequiredFields() {
  clearValidationErrors()
  if (!isCreating.value) return true

  if (!draft.title.trim()) validationErrors.title = '标题为必填项'
  if (!draft.date) validationErrors.date = '日期为必填项'
  if (!draft.content.trim()) validationErrors.content = '内容为必填项'
  if (!draft.imageUrl && !draft.imageId) validationErrors.imageUrl = '请上传照片'

  return !validationErrors.title
    && !validationErrors.date
    && !validationErrors.content
    && !validationErrors.imageUrl
}

async function pollImageUrl(imageIds, token) {
  await wait(IMAGE_URL_POLL_DELAY)

  while (token === activeUploadToken) {
    if (token !== activeUploadToken) return null

    const images = await queryTimelineImageUrls(imageIds)
    const image = images.find((item) => imageIds.includes(String(item?.id)))
    const url = normalizeImageUrl(image?.url)
    if (url) return { id: String(image.id), url }

    await wait(IMAGE_URL_POLL_INTERVAL)
  }

  return null
}

function syncDraft(event) {
  draft.id = toKey(event?.id)
  draft.rawId = event?.rawId == null ? null : toKey(event.rawId)
  draft.userId = event?.userId || null
  draft.categoryId = event?.categoryId || props.category?.id ? toKey(event?.categoryId || props.category?.id) : null
  draft.title = event?.title || ''
  draft.date = event?.date || ''
  draft.content = event?.content || ''
  draft.imageUrl = event?.imageUrl || ''
  draft.imageId = event?.imageId == null ? null : toKey(event.imageId)
  draft.categoryKey = event?.categoryKey || props.category?.key || ''
}

function resetDraft() {
  if (props.category) {
    draft.id = ''
    draft.rawId = null
    draft.userId = props.category?.userId || null
    draft.categoryId = props.category?.id == null ? null : toKey(props.category.id)
    draft.title = ''
    draft.date = new Date().toISOString().split('T')[0]
    draft.content = ''
    draft.imageUrl = ''
    draft.imageId = null
    draft.categoryKey = props.category.key
  } else {
    syncDraft(props.event)
  }
}

async function handlePhotoUpload(event) {
  const input = event.target
  const file = input.files?.[0]
  if (!file) return

  const token = activeUploadToken + 1
  activeUploadToken = token
  isUploadingImage.value = true
  imageUploadError.value = ''
  clearValidationError('imageUrl')
  draft.imageUrl = URL.createObjectURL(file)

  try {
    const imageIds = await uploadTimelineImages([file], {
      code: getUploadImageCode(),
      userId: readUserId(),
    })
    draft.imageId = imageIds[0] || null

    const image = await pollImageUrl(imageIds, token)
    if (!image || token !== activeUploadToken) return

    draft.imageId = image.id
    draft.imageUrl = image.url
  } catch (error) {
    console.error(error)
    if (token === activeUploadToken) {
      imageUploadError.value = error instanceof Error ? error.message : '图片上传失败'
    }
  } finally {
    if (token === activeUploadToken) {
      isUploadingImage.value = false
    }
    input.value = ''
  }
}

function handleSave() {
  if (!validateRequiredFields()) return
  emit('save', { ...draft })
  isEditing.value = false
}

function handleDelete() {
  pendingDeleteId.value = draft.id
  showDeleteConfirm.value = true
}

function confirmDelete() {
  emit('delete', pendingDeleteId.value)
  showDeleteConfirm.value = false
  pendingDeleteId.value = ''
}

function cancelDelete() {
  showDeleteConfirm.value = false
  pendingDeleteId.value = ''
}

function startEditing() {
  isEditing.value = true
}

function cancelEditing() {
  activeUploadToken += 1
  isUploadingImage.value = false
  imageUploadError.value = ''
  clearValidationErrors()
  resetDraft()

  if (isCreating.value) {
    emit('close')
    return
  }

  isEditing.value = false
}

watch(
  () => [props.event, props.category],
  ([event, category]) => {
    activeUploadToken += 1
    isUploadingImage.value = false
    imageUploadError.value = ''
    clearValidationErrors()
    isEditing.value = false

    if (category && !event) {
      draft.id = ''
      draft.rawId = null
      draft.userId = category.userId || null
      draft.categoryId = category.id == null ? null : toKey(category.id)
      draft.title = ''
      draft.date = new Date().toISOString().split('T')[0]
      draft.content = ''
      draft.imageUrl = ''
      draft.imageId = null
      draft.categoryKey = category.key
    } else {
      syncDraft(event)
    }
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  activeUploadToken += 1
})
</script>

<style scoped>
.detail-panel {
  min-height: 100%;
  padding: 1rem;
  border: 0.5px solid rgba(255, 255, 255, 0.12);
  border-radius: 1rem;
  background: rgba(18, 18, 24, 0.82);
  color: #e5e1e4;
  backdrop-filter: blur(16px);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
  display: flex;
  flex-direction: column;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.detail-kicker {
  display: block;
  margin-bottom: 0.35rem;
  color: #7df4ff;
  font-size: 0.76rem;
  font-weight: 700;
}

.detail-header h2 {
  margin: 0;
  color: #fff;
  font-size: 1.15rem;
  line-height: 1.35;
}

.icon-button {
  width: 2rem;
  height: 2rem;
  border: 0;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  cursor: pointer;
  font-size: 1.35rem;
  line-height: 1;
}

.photo-frame {
  position: relative;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  border-radius: 0.8rem;
  background: rgba(255, 255, 255, 0.08);
}

.photo-frame.is-uploading img,
.photo-frame.is-uploading .photo-empty {
  filter: blur(1px);
  opacity: 0.68;
}

.photo-frame img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.photo-empty {
  height: 100%;
  display: grid;
  place-items: center;
  color: #9ca3af;
  font-size: 0.9rem;
}

.photo-uploading {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  gap: 0.6rem;
  align-content: center;
  background: rgba(15, 23, 42, 0.54);
  color: #e0fbff;
  font-size: 0.86rem;
  font-weight: 800;
}

.upload-spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid rgba(224, 251, 255, 0.28);
  border-top-color: #7df4ff;
  border-radius: 999px;
  animation: image-upload-spin 0.8s linear infinite;
}

.view-mode,
.detail-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.view-mode {
  margin-top: 1rem;
  flex: 1;
}

.info-item,
.detail-form label {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.info-label {
  color: #7df4ff;
  font-size: 0.82rem;
  font-weight: 700;
}

.info-value {
  margin: 0;
  color: #e5e1e4;
  font-size: 0.95rem;
  line-height: 1.6;
}

.content-text {
  white-space: pre-wrap;
  min-height: 3rem;
}

.detail-form label {
  color: #cbd5e1;
  font-size: 0.82rem;
  font-weight: 700;
}

.detail-form input,
.detail-form textarea {
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 0.65rem;
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  font: inherit;
  line-height: 1.5;
  padding: 0.68rem 0.75rem;
  outline: none;
}

.detail-form input[aria-invalid='true'],
.detail-form textarea[aria-invalid='true'] {
  border-color: rgba(252, 165, 165, 0.78);
  box-shadow: 0 0 0 3px rgba(252, 165, 165, 0.12);
}

.detail-form input:focus,
.detail-form textarea:focus {
  border-color: rgba(125, 244, 255, 0.68);
  box-shadow: 0 0 0 3px rgba(125, 244, 255, 0.12);
}

.detail-form textarea {
  resize: vertical;
  min-height: 8rem;
}

.upload-button {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 0.7rem 1rem;
  border: 1px dashed rgba(125, 244, 255, 0.42);
  border-radius: 0.75rem;
  color: #b9fbff;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 700;
}

.upload-button.disabled {
  cursor: wait;
  opacity: 0.72;
}

.upload-button input {
  display: none;
}

.field-error,
.upload-error {
  margin: -0.2rem 0 0;
  color: #fca5a5;
  font-size: 0.78rem;
  line-height: 1.5;
}

.photo-error {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.warning-icon {
  width: 1rem;
  height: 1rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: #facc15;
  color: #422006;
  font-size: 0.72rem;
  font-weight: 900;
  line-height: 1;
}

.upload-error {
  margin-top: 0;
}

.actions {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  margin-top: 0.25rem;
}

.success-button,
.save-button,
.primary-button,
.secondary-button {
  border: 0;
  border-radius: 0.65rem;
  cursor: pointer;
  font-weight: 800;
  padding: 0.68rem 1rem;
}

.success-button,
.save-button.is-ready {
  background: #16a34a;
  color: #fff;
  box-shadow: 0 8px 18px rgba(22, 163, 74, 0.28);
}

.save-button {
  background: linear-gradient(135deg, #00f0ff, #d1bcff);
  color: #101014;
}

.save-button:disabled {
  cursor: not-allowed;
  opacity: 0.68;
}

.primary-button {
  background: linear-gradient(135deg, #00f0ff, #d1bcff);
  color: #101014;
}

.secondary-button {
  background: rgba(255, 255, 255, 0.1);
  color: #e5e1e4;
}

.view-actions-bottom {
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.view-actions-bottom .danger-button {
  margin-right: auto;
}

.view-actions-bottom .primary-button {
  margin-left: auto;
}

.danger-button {
  border: 0;
  border-radius: 0.65rem;
  cursor: pointer;
  font-weight: 800;
  padding: 0.68rem 1rem;
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
  transition: all 0.2s;
}

.danger-button:hover {
  background: rgba(239, 68, 68, 0.3);
  color: #fecaca;
}

.empty-detail {
  height: 100%;
  min-height: 18rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: #94a3b8;
  text-align: center;
}

.empty-detail span {
  color: #e5e1e4;
  font-size: 1rem;
  font-weight: 800;
}

.empty-detail p {
  margin: 0.5rem auto 0;
  max-width: 15rem;
  line-height: 1.6;
}

.delete-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.delete-modal {
  background: rgba(18, 18, 24, 0.95);
  border: 0.5px solid rgba(255, 255, 255, 0.12);
  border-radius: 1rem;
  padding: 2rem;
  min-width: 300px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(16px);
}

.delete-modal h3 {
  margin: 0 0 1.5rem;
  color: #fff;
  font-size: 1.25rem;
  font-weight: 700;
  text-align: center;
}

.delete-modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.modal-btn {
  flex: 1;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.65rem;
  cursor: pointer;
  font-weight: 700;
  font-size: 0.95rem;
  transition: all 0.2s;
}

.modal-btn-cancel {
  background: rgba(255, 255, 255, 0.1);
  color: #e5e1e4;
}

.modal-btn-cancel:hover {
  background: rgba(255, 255, 255, 0.15);
}

.modal-btn-confirm {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: #fff;
}

.modal-btn-confirm:hover {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

@keyframes image-upload-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
