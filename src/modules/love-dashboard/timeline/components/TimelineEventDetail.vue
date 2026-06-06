<template>
  <aside class="detail-panel">
    <template v-if="event">
      <header class="detail-header">
        <div>
          <span class="detail-kicker">记录详情</span>
          <h2>{{ draft.title || '未命名记录' }}</h2>
        </div>
        <button class="icon-button" type="button" aria-label="关闭详情" @click="$emit('close')">
          ×
        </button>
      </header>

      <div class="photo-frame">
        <img v-if="draft.imageUrl" :src="draft.imageUrl" :alt="draft.title" />
        <div v-else class="photo-empty">上传照片</div>
      </div>

      <label class="upload-button">
        <input type="file" accept="image/*" @change="handlePhotoUpload" />
        上传照片
      </label>

      <form class="detail-form" @submit.prevent="handleSave">
        <label>
          <span>标题</span>
          <input v-model.trim="draft.title" type="text" placeholder="写一个标题" />
        </label>

        <label>
          <span>日期</span>
          <input v-model="draft.date" type="date" />
        </label>

        <label>
          <span>内容</span>
          <textarea v-model.trim="draft.content" rows="7" placeholder="记录这一天的细节" />
        </label>

        <div class="actions">
          <button class="secondary-button" type="button" @click="resetDraft">取消修改</button>
          <button class="primary-button" type="submit">保存</button>
        </div>
      </form>
    </template>

    <div v-else class="empty-detail">
      <span>选择一张记录卡片</span>
      <p>点击左侧任意卡片后，可以编辑文字并上传新的照片。</p>
    </div>
  </aside>
</template>

<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({
  event: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['save', 'close'])

const draft = reactive({
  id: '',
  title: '',
  date: '',
  content: '',
  imageUrl: '',
})

function syncDraft(event) {
  draft.id = event?.id || ''
  draft.title = event?.title || ''
  draft.date = event?.date || ''
  draft.content = event?.content || ''
  draft.imageUrl = event?.imageUrl || ''
}

function resetDraft() {
  syncDraft(props.event)
}

function handlePhotoUpload(event) {
  const file = event.target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.addEventListener('load', () => {
    draft.imageUrl = String(reader.result || '')
  })
  reader.readAsDataURL(file)
}

function handleSave() {
  emit('save', { ...draft })
}

watch(
  () => props.event,
  event => syncDraft(event),
  { immediate: true }
)
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
  aspect-ratio: 4 / 3;
  overflow: hidden;
  border-radius: 0.8rem;
  background: rgba(255, 255, 255, 0.08);
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

.upload-button {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0.75rem 0 1rem;
  padding: 0.7rem 1rem;
  border: 1px dashed rgba(125, 244, 255, 0.42);
  border-radius: 0.75rem;
  color: #b9fbff;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 700;
}

.upload-button input {
  display: none;
}

.detail-form {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.detail-form label {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
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

.detail-form textarea {
  resize: vertical;
  min-height: 8rem;
}

.detail-form input:focus,
.detail-form textarea:focus {
  border-color: rgba(125, 244, 255, 0.68);
  box-shadow: 0 0 0 3px rgba(125, 244, 255, 0.12);
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 0.25rem;
}

.primary-button,
.secondary-button {
  border: 0;
  border-radius: 0.65rem;
  cursor: pointer;
  font-weight: 800;
  padding: 0.68rem 1rem;
}

.primary-button {
  background: linear-gradient(135deg, #00f0ff, #d1bcff);
  color: #101014;
}

.secondary-button {
  background: rgba(255, 255, 255, 0.1);
  color: #e5e1e4;
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
</style>
