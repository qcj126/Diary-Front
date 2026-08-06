<template>
  <section class="thoughts-page">
    <header class="thoughts-hero">
      <div class="hero-copy">
        <h1>生活随想</h1>
      </div>
    </header>

    <section class="toolbar">
      <div class="moment-strip" aria-label="生活随想概览">
        <div>
          <span>记录总数</span>
          <strong>{{ thoughtStats.total }}</strong>
        </div>
        <div>
          <span>收藏灵感</span>
          <strong>{{ thoughtStats.favorite }}</strong>
        </div>
        <div>
          <span>鲜活标签</span>
          <strong>{{ thoughtStats.tags }}</strong>
        </div>
        <div>
          <span>今日状态</span>
          <strong>{{ thoughtStats.mood }}</strong>
        </div>
      </div>

      <div class="tool-group">
        <button type="button" class="primary" @click="openCreate"><span class="material-symbols-outlined">add</span>新增</button>
        <button type="button" :disabled="!selectedThought" @click="openEdit(selectedThought)"><span class="material-symbols-outlined">edit</span>编辑</button>
        <button type="button" :disabled="!selectedThought" @click="deleteThought(selectedThought.id)"><span class="material-symbols-outlined">delete</span>删除</button>
        <button type="button" @click="exportThoughts('json')"><span class="material-symbols-outlined">data_object</span>JSON</button>
        <button type="button" @click="exportThoughts('csv')"><span class="material-symbols-outlined">table_view</span>CSV</button>
        <button type="button" @click="exportThoughts('md')"><span class="material-symbols-outlined">ios_share</span>Markdown</button>
      </div>

      <div class="search-row">
        <label class="search-box">
          <span class="material-symbols-outlined">search</span>
          <input v-model.trim="keyword" type="search" placeholder="搜索标题、内容、地点或标签" />
        </label>
        <select v-model="activeMood">
          <option value="">全部状态</option>
          <option v-for="mood in moods" :key="mood.name" :value="mood.name">{{ mood.icon }} {{ mood.name }}</option>
        </select>
        <select v-model="activeTag">
          <option value="">全部标签</option>
          <option v-for="tag in allTags" :key="tag" :value="tag">{{ tag }}</option>
        </select>
      </div>
    </section>

    <main class="thoughts-layout">
      <section class="thought-list">
        <article
          v-for="thought in filteredThoughts"
          :key="thought.id"
          class="thought-card"
          :class="{ active: thought.id === activeId, favorite: thought.favorite }"
          @click="activeId = thought.id"
        >
          <div class="card-top">
            <span class="mood-pill">{{ moodIcon(thought.mood) }} {{ thought.mood }}</span>
            <button
              type="button"
              class="favorite-toggle"
              :class="{ active: thought.favorite }"
              :aria-label="thought.favorite ? '取消收藏' : '收藏'"
              @click.stop="toggleFavorite(thought)"
            >
              <span class="material-symbols-outlined">{{ thought.favorite ? 'star' : 'star_border' }}</span>
            </button>
          </div>
          <h2>{{ thought.title }}</h2>
          <p>{{ thought.content }}</p>
          <div v-if="thought.photos.length" class="photo-strip">
            <img v-for="photo in thought.photos.slice(0, 3)" :key="photo.id" :src="photo.url" :alt="photo.name" />
            <span v-if="thought.photos.length > 3">+{{ thought.photos.length - 3 }}</span>
          </div>
          <div class="card-meta">
            <span>{{ thought.date }}</span>
            <span>{{ thought.location }}</span>
          </div>
          <div class="tag-row">
            <span v-for="tag in thought.tags" :key="tag">#{{ tag }}</span>
          </div>
        </article>

        <div v-if="!filteredThoughts.length" class="empty-state">
          <span class="material-symbols-outlined">auto_stories</span>
          <strong>还没有匹配的随想</strong>
          <p>换个关键词，或者写下一条新的生活片段。</p>
        </div>
      </section>

      <aside class="detail-panel">
        <template v-if="selectedThought">
          <div class="detail-head">
            <div>
              <span class="eyebrow">{{ selectedThought.date }}</span>
              <h2>{{ selectedThought.title }}</h2>
            </div>
            <button type="button" @click="openEdit(selectedThought)"><span class="material-symbols-outlined">edit_note</span></button>
          </div>
          <p class="detail-content">{{ selectedThought.content }}</p>
          <dl class="detail-grid">
            <div><dt>状态</dt><dd>{{ moodIcon(selectedThought.mood) }} {{ selectedThought.mood }}</dd></div>
            <div><dt>地点</dt><dd>{{ selectedThought.location }}</dd></div>
            <div><dt>天气</dt><dd>{{ selectedThought.weather }}</dd></div>
            <div><dt>更新</dt><dd>{{ selectedThought.updatedAt }}</dd></div>
          </dl>
          <div class="detail-tags">
            <span v-for="tag in selectedThought.tags" :key="tag">#{{ tag }}</span>
          </div>
          <div class="gallery">
            <img v-for="photo in selectedThought.photos" :key="photo.id" :src="photo.url" :alt="photo.name" />
          </div>
        </template>
      </aside>
    </main>

    <div v-if="editorOpen" class="modal-backdrop" @click.self="closeEditor">
      <form class="editor-modal" @submit.prevent="saveThought">
        <div v-if="photoDeleteConfirmOpen" class="confirm-backdrop" @click.self="closePhotoDeleteConfirm">
          <section class="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="photo-delete-title">
            <span class="confirm-icon material-symbols-outlined">delete</span>
            <h3 id="photo-delete-title">确认删除图片吗？</h3>
            <p>删除后，这张图片会从当前随想编辑内容中移除。</p>
            <div class="confirm-actions">
              <button type="button" @click="closePhotoDeleteConfirm">取消</button>
              <button type="button" class="danger-action" @click="removePhoto">确认删除</button>
            </div>
          </section>
        </div>

        <div class="modal-title">
          <div>
            <span class="eyebrow">{{ editingId ? 'Edit Note' : 'New Note' }}</span>
            <h2>{{ editingId ? '编辑随想' : '新增随想' }}</h2>
          </div>
          <button type="button" @click="closeEditor"><span class="material-symbols-outlined">close</span></button>
        </div>

        <div class="form-grid">
          <label><span>标题</span><input v-model.trim="form.title" required maxlength="40" placeholder="今天想记下什么" /></label>
          <label>
            <span>日期</span>
            <span class="date-picker-field">
              <button type="button" class="date-picker-btn" aria-label="选择日期" @click="openThoughtDatePicker">
                <span class="material-symbols-outlined">calendar_month</span>
              </button>
              <span v-if="form.date" class="date-picker-value">{{ form.date }}</span>
              <span v-else class="date-picker-placeholder">精确时间</span>
              <input ref="thoughtDateInput" v-model="form.date" class="date-picker-input" required type="date" />
            </span>
          </label>
          <label class="mood-field">
            <span>状态</span>
            <span class="mood-select" @keydown.esc="moodMenuOpen = false">
              <button type="button" class="mood-select-trigger" :aria-expanded="moodMenuOpen" aria-haspopup="listbox" @click="moodMenuOpen = !moodMenuOpen">
                <span class="mood-icon">{{ selectedMood.icon }}</span>
                <span class="mood-name">{{ selectedMood.name }}</span>
                <span class="material-symbols-outlined mood-arrow">expand_more</span>
              </button>
              <span v-if="moodMenuOpen" class="mood-menu" role="listbox">
                <button
                  v-for="mood in moods"
                  :key="mood.name"
                  type="button"
                  class="mood-option"
                  :class="{ active: form.mood === mood.name }"
                  role="option"
                  :aria-selected="form.mood === mood.name"
                  @click="selectMood(mood.name)"
                >
                  <span class="mood-icon">{{ mood.icon }}</span>
                  <span class="mood-name">{{ mood.name }}</span>
                </button>
              </span>
            </span>
          </label>
          <label><span>地点</span><input v-model.trim="form.location" placeholder="家、咖啡店、江边..." /></label>
          <label><span>天气</span><input v-model.trim="form.weather" placeholder="晴 / 雨 / 微风" /></label>
          <label><span>标签</span><input v-model.trim="tagInput" placeholder="用逗号分隔，如 周末,电影,散步" /></label>
        </div>

        <div class="editor-body">
          <label class="content-field">
            <span>内容</span>
            <textarea v-model.trim="form.content" required rows="9" placeholder="写下这段生活的声音、颜色和温度"></textarea>
          </label>

          <div class="upload-column">
            <span class="upload-title">上传图片</span>
            <section class="upload-frame">
              <img v-if="form.photos[0]" :src="form.photos[0].url" :alt="form.photos[0].name" />
              <label v-if="!form.photos[0]" class="upload-frame-button" aria-label="上传图片">
                <span class="material-symbols-outlined">add</span>
                <input type="file" accept="image/*" @change="handlePhotoUpload" />
              </label>
              <button v-else type="button" class="upload-frame-button danger" aria-label="删除图片" @click="confirmRemovePhoto">
                <span class="material-symbols-outlined">delete</span>
              </button>
            </section>
          </div>
        </div>

        <div class="modal-actions">
          <button type="button" @click="closeEditor">取消</button>
          <button type="submit" class="primary">保存</button>
        </div>
      </form>
    </div>

    <div v-if="toast" class="toast">{{ toast }}</div>
  </section>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'

const STORAGE_KEY = 'diary-love.life-thoughts'
const moods = [
  { name: '开心', icon: '☀' },
  { name: '平静', icon: '◌' },
  { name: '期待', icon: '✦' },
  { name: '疲惫', icon: '☾' },
  { name: '感动', icon: '♡' },
]
const seedThoughts = [
  {
    id: 'thought-1',
    title: '晚风把一天吹软了',
    content: '下班后沿着路灯慢慢走，空气里有烤红薯的味道。忽然觉得，平凡的一天也可以很值得收藏。',
    mood: '平静',
    date: '2026-07-01',
    location: '小区外的梧桐路',
    weather: '微风',
    tags: ['散步', '日常'],
    photos: [],
    favorite: true,
    createdAt: '2026-07-01 21:15',
    updatedAt: '2026-07-01 21:15',
  },
  {
    id: 'thought-2',
    title: '早餐店的新豆浆',
    content: '今天豆浆有一点焦香，老板说是换了新豆子。小小的变化让早晨突然有了新鲜感。',
    mood: '开心',
    date: '2026-06-30',
    location: '楼下早餐店',
    weather: '晴',
    tags: ['早餐', '烟火气'],
    photos: [],
    favorite: false,
    createdAt: '2026-06-30 08:20',
    updatedAt: '2026-06-30 08:20',
  },
  {
    id: 'thought-3',
    title: '雨声适合整理书桌',
    content: '把旧便签和数据线都归位，桌面空出来以后，心里也跟着亮了一块。',
    mood: '期待',
    date: '2026-06-28',
    location: '书房',
    weather: '雨',
    tags: ['整理', '居家'],
    photos: [],
    favorite: true,
    createdAt: '2026-06-28 16:40',
    updatedAt: '2026-06-28 16:40',
  },
]

const thoughts = ref(loadThoughts())
const activeId = ref(thoughts.value[0]?.id ?? '')
const keyword = ref('')
const activeMood = ref('')
const activeTag = ref('')
const editorOpen = ref(false)
const editingId = ref('')
const tagInput = ref('')
const toast = ref('')
const thoughtDateInput = ref(null)
const moodMenuOpen = ref(false)
const photoDeleteConfirmOpen = ref(false)
let toastTimer = 0

const form = reactive({
  title: '',
  content: '',
  mood: '平静',
  date: today(),
  location: '',
  weather: '',
  photos: [],
  favorite: false,
})

const filteredThoughts = computed(() => {
  const q = keyword.value.toLowerCase()
  return thoughts.value.filter((thought) => {
    const haystack = [thought.title, thought.content, thought.location, thought.weather, thought.tags.join(' ')].join(' ').toLowerCase()
    return (!q || haystack.includes(q))
      && (!activeMood.value || thought.mood === activeMood.value)
      && (!activeTag.value || thought.tags.includes(activeTag.value))
  })
})
const selectedThought = computed(() => filteredThoughts.value.find((item) => item.id === activeId.value) ?? filteredThoughts.value[0] ?? null)
const allTags = computed(() => [...new Set(thoughts.value.flatMap((thought) => thought.tags))])
const selectedMood = computed(() => moods.find((mood) => mood.name === form.mood) ?? moods[0])
const thoughtStats = computed(() => ({
  total: thoughts.value.length,
  favorite: thoughts.value.filter((thought) => thought.favorite).length,
  tags: allTags.value.length,
  mood: selectedThought.value ? `${moodIcon(selectedThought.value.mood)} ${selectedThought.value.mood}` : '◌ 平静',
}))

watch(thoughts, (value) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
}, { deep: true })
watch(filteredThoughts, (value) => {
  if (value.length && !value.some((thought) => thought.id === activeId.value)) activeId.value = value[0].id
})

function loadThoughts() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : seedThoughts
  } catch {
    return seedThoughts
  }
}
function today() {
  return new Date().toISOString().slice(0, 10)
}
function nowText() {
  const date = new Date()
  const pad = (value) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}
function normalizeDateSeparator(value) {
  const normalized = String(value ?? '').trim().replace(/[/.年月]/g, '-').replace(/日/g, '').replace(/-+/g, '-')
  const parts = normalized.split('-')
  if (parts.length === 3 && parts[0].length === 4) {
    const [year, month, day] = parts
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }
  return normalized
}
function moodIcon(name) {
  return moods.find((mood) => mood.name === name)?.icon ?? '◌'
}
function openCreate() {
  editingId.value = ''
  Object.assign(form, { title: '', content: '', mood: '平静', date: today(), location: '', weather: '', photos: [], favorite: false })
  tagInput.value = ''
  moodMenuOpen.value = false
  photoDeleteConfirmOpen.value = false
  editorOpen.value = true
}
function openEdit(thought) {
  if (!thought) return
  editingId.value = thought.id
  Object.assign(form, {
    title: thought.title,
    content: thought.content,
    mood: thought.mood,
    date: normalizeDateSeparator(thought.date),
    location: thought.location,
    weather: thought.weather,
    photos: [...thought.photos],
    favorite: thought.favorite,
  })
  tagInput.value = thought.tags.join(', ')
  moodMenuOpen.value = false
  photoDeleteConfirmOpen.value = false
  editorOpen.value = true
}
function closeEditor() {
  moodMenuOpen.value = false
  photoDeleteConfirmOpen.value = false
  editorOpen.value = false
}
function selectMood(name) {
  form.mood = name
  moodMenuOpen.value = false
}
function openThoughtDatePicker() {
  if (typeof thoughtDateInput.value?.showPicker === 'function') {
    thoughtDateInput.value.showPicker()
    return
  }
  thoughtDateInput.value?.click()
}
function saveThought() {
  const tags = tagInput.value.split(/[,，]/).map((tag) => tag.trim()).filter(Boolean)
  const payload = {
    title: form.title,
    content: form.content,
    mood: form.mood,
    date: normalizeDateSeparator(form.date),
    location: form.location || '未记录地点',
    weather: form.weather || '未记录天气',
    tags,
    photos: [...form.photos],
    favorite: form.favorite,
    updatedAt: nowText(),
  }
  if (editingId.value) {
    thoughts.value = thoughts.value.map((thought) => thought.id === editingId.value ? { ...thought, ...payload } : thought)
    showToast('随想已更新')
  } else {
    const next = { ...payload, id: `thought-${Date.now()}`, createdAt: nowText() }
    thoughts.value = [next, ...thoughts.value]
    activeId.value = next.id
    showToast('新的随想已保存')
  }
  closeEditor()
}
function deleteThought(id) {
  if (!id) return
  thoughts.value = thoughts.value.filter((thought) => thought.id !== id)
  activeId.value = thoughts.value[0]?.id ?? ''
  showToast('随想已删除')
}
function toggleFavorite(thought) {
  thought.favorite = !thought.favorite
  thought.updatedAt = nowText()
}
async function handlePhotoUpload(event) {
  const files = Array.from(event.target.files ?? [])
  const photos = await Promise.all(files.map(readPhoto))
  form.photos = photos.slice(0, 1)
  photoDeleteConfirmOpen.value = false
  event.target.value = ''
}
function readPhoto(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve({ id: `photo-${Date.now()}-${file.name}`, name: file.name, url: reader.result })
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
function confirmRemovePhoto() {
  photoDeleteConfirmOpen.value = true
}
function closePhotoDeleteConfirm() {
  photoDeleteConfirmOpen.value = false
}
function removePhoto() {
  form.photos = []
  photoDeleteConfirmOpen.value = false
}
function exportThoughts(type) {
  const records = filteredThoughts.value
  const exporters = {
    json: { content: JSON.stringify(records, null, 2), type: 'application/json', filename: 'life-thoughts.json' },
    csv: { content: toCsv(records), type: 'text/csv', filename: 'life-thoughts.csv' },
    md: { content: toMarkdown(records), type: 'text/markdown', filename: 'life-thoughts.md' },
  }
  const exportData = exporters[type]
  download(exportData.content, exportData.type, exportData.filename)
  showToast(`已导出 ${records.length} 条随想`)
}
function toCsv(records) {
  const header = ['标题', '日期', '状态', '地点', '天气', '标签', '内容', '照片数']
  const rows = records.map((item) => [item.title, item.date, item.mood, item.location, item.weather, item.tags.join('|'), item.content, item.photos.length])
  return [header, ...rows].map((row) => row.map(csvCell).join(',')).join('\n')
}
function csvCell(value) {
  return `"${String(value).replaceAll('"', '""')}"`
}
function toMarkdown(records) {
  return records.map((item) => [`## ${item.title}`, '', `- 日期：${item.date}`, `- 状态：${item.mood}`, `- 地点：${item.location}`, `- 标签：${item.tags.map((tag) => `#${tag}`).join(' ') || '无'}`, '', item.content, ''].join('\n')).join('\n')
}
function download(content, type, filename) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
function showToast(message) {
  window.clearTimeout(toastTimer)
  toast.value = message
  toastTimer = window.setTimeout(() => {
    toast.value = ''
  }, 1800)
}
</script>

<style scoped>
.thoughts-page {
  --thoughts-accent: #4d938a;
  --thoughts-accent-soft: rgba(77, 147, 138, 0.12);
  --thoughts-warm: #f6c85f;
  --thoughts-warm-soft: rgba(246, 200, 95, 0.14);
  --thoughts-rose-soft: rgba(211, 107, 75, 0.08);
  position: relative;
  overflow-x: hidden;
  min-height: 100vh;
  padding: 1rem;
  background:
    radial-gradient(circle at 12% 8%, var(--thoughts-warm-soft), transparent 26rem),
    radial-gradient(circle at 88% 16%, var(--thoughts-accent-soft), transparent 24rem),
    linear-gradient(135deg, var(--dashboard-bg, #fdf8f8), var(--dashboard-surface-soft, #f7f3f2));
  color: var(--dashboard-text, #1c1b1b);
}
.thoughts-page::before {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(120deg, rgba(255, 255, 255, 0.34), transparent 36%),
    repeating-linear-gradient(90deg, rgba(28, 27, 27, 0.018) 0 1px, transparent 1px 96px);
  content: '';
  pointer-events: none;
}
.thoughts-page > * {
  position: relative;
  z-index: 1;
}
.thoughts-hero {
  display: flex;
  align-items: center;
  min-height: 56px;
  padding: 0 1.5rem;
  margin-bottom: 24px;
}
.hero-copy,
.hero-card,
.toolbar,
.detail-panel,
.editor-modal,
.empty-state {
  border: 1px solid var(--dashboard-border-soft, rgba(196, 199, 199, 0.56));
  background: color-mix(in srgb, var(--dashboard-surface, #ffffff) 90%, transparent);
  box-shadow: var(--dashboard-shadow, 0 18px 50px rgba(28, 27, 27, 0.08));
  backdrop-filter: blur(18px);
}
.hero-copy {
  position: relative;
  overflow: hidden;
  padding: 0;
  border: 0;
  background: transparent;
  box-shadow: none;
  backdrop-filter: none;
}
.eyebrow {
  color: var(--dashboard-text-muted, #5c5f61);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.hero-copy h1 {
  position: relative;
  z-index: 1;
  margin: 0;
  color: var(--dashboard-text-strong, #000000);
  font-size: 1.75rem;
  line-height: 1.2;
}
.mood-orbit {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  align-items: end;
}
.mood-orbit i {
  display: grid;
  height: var(--level);
  min-height: 34px;
  place-items: center;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.15);
  color: #f6c85f;
  font-style: normal;
}
.toolbar {
  display: grid;
  gap: 16px;
  margin-bottom: 24px;
  padding: 18px;
  border-radius: 8px;
  background:
    linear-gradient(135deg, color-mix(in srgb, var(--dashboard-surface, #ffffff) 94%, transparent), color-mix(in srgb, var(--dashboard-surface-soft, #f7f3f2) 86%, transparent)),
    linear-gradient(90deg, var(--thoughts-warm-soft), var(--thoughts-accent-soft));
}
.moment-strip {
  display: grid;
  grid-template-columns: repeat(4, minmax(120px, 1fr));
  gap: 10px;
}
.moment-strip div {
  min-width: 0;
  padding: 14px 16px;
  border: 1px solid var(--dashboard-border-soft, rgba(196, 199, 199, 0.46));
  border-radius: 8px;
  background:
    linear-gradient(135deg, color-mix(in srgb, var(--dashboard-surface, #ffffff) 92%, transparent), color-mix(in srgb, var(--dashboard-surface-muted, #f1edec) 72%, transparent)),
    linear-gradient(135deg, var(--thoughts-warm-soft), var(--thoughts-accent-soft));
}
.moment-strip div:nth-child(2) {
  background:
    linear-gradient(135deg, color-mix(in srgb, var(--dashboard-surface, #ffffff) 92%, transparent), color-mix(in srgb, var(--dashboard-surface-muted, #f1edec) 72%, transparent)),
    linear-gradient(135deg, var(--thoughts-warm-soft), var(--thoughts-rose-soft));
}
.moment-strip div:nth-child(3) {
  background:
    linear-gradient(135deg, color-mix(in srgb, var(--dashboard-surface, #ffffff) 92%, transparent), color-mix(in srgb, var(--dashboard-surface-muted, #f1edec) 72%, transparent)),
    linear-gradient(135deg, var(--thoughts-accent-soft), rgba(111, 123, 217, 0.08));
}
.moment-strip div:nth-child(4) {
  background:
    linear-gradient(135deg, color-mix(in srgb, var(--dashboard-surface, #ffffff) 92%, transparent), color-mix(in srgb, var(--dashboard-surface-muted, #f1edec) 72%, transparent)),
    linear-gradient(135deg, rgba(111, 123, 217, 0.08), var(--thoughts-warm-soft));
}
.moment-strip span {
  display: block;
  margin-bottom: 6px;
  color: var(--dashboard-text-muted, #5c5f61);
  font-size: 12px;
  font-weight: 800;
}
.moment-strip strong {
  display: block;
  overflow: hidden;
  color: var(--dashboard-text-strong, #000000);
  font-size: 24px;
  line-height: 1.1;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.tool-group,
.search-row,
.card-top,
.card-meta,
.tag-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.tool-group,
.search-row {
  flex-wrap: wrap;
}
button,
select,
input,
textarea {
  font: inherit;
}
button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 40px;
  border: 1px solid var(--dashboard-border, #c4c7c7);
  border-radius: 8px;
  background: var(--dashboard-surface, #ffffff);
  color: var(--dashboard-text, #1c1b1b);
  cursor: pointer;
  transition: transform 0.2s, border-color 0.2s, background 0.2s, color 0.2s, box-shadow 0.2s;
}
button:hover:not(:disabled) {
  border-color: var(--thoughts-accent);
  transform: translateY(-1px);
  box-shadow: 0 10px 24px rgba(28, 27, 27, 0.1);
}
button:disabled {
  cursor: not-allowed;
  opacity: 0.48;
}
button.primary {
  border-color: transparent;
  background: var(--dashboard-accent, #1c1b1a);
  color: var(--dashboard-accent-contrast, #ffffff);
  box-shadow: 0 12px 26px rgba(28, 27, 27, 0.16);
}
.tool-group button {
  padding: 0 14px;
}
.material-symbols-outlined {
  font-size: 20px;
}
.search-box {
  display: flex;
  align-items: center;
  flex: 1 1 320px;
  gap: 10px;
  min-height: 44px;
  padding: 0 14px;
  border: 1px solid var(--dashboard-border, #c4c7c7);
  border-radius: 8px;
  background: var(--dashboard-surface, #ffffff);
}
.search-box input {
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--dashboard-text, #1c1b1b);
}
select,
input,
textarea {
  border: 1px solid var(--dashboard-border, #c4c7c7);
  border-radius: 8px;
  background: var(--dashboard-surface, #ffffff);
  color: var(--dashboard-text, #1c1b1b);
}
select {
  min-height: 44px;
  padding: 0 12px;
}
.thoughts-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 390px;
  gap: 24px;
}
.thought-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  align-content: start;
}
.thought-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 270px;
  padding: 18px;
  overflow: hidden;
  border: 1px solid var(--dashboard-border-soft, rgba(196, 199, 199, 0.56));
  border-radius: 8px;
  background:
    linear-gradient(160deg, color-mix(in srgb, var(--dashboard-surface, #ffffff) 94%, transparent), color-mix(in srgb, var(--dashboard-surface-soft, #f7f3f2) 86%, transparent)),
    linear-gradient(135deg, var(--thoughts-warm-soft), var(--thoughts-accent-soft));
  cursor: pointer;
  transition: transform 0.22s, border-color 0.22s, box-shadow 0.22s;
}
.thought-card::before {
  position: absolute;
  inset: 0 0 auto;
  height: 6px;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--thoughts-warm), var(--thoughts-accent));
  content: '';
  opacity: 0.62;
  transition: opacity 0.22s;
}
.thought-card:nth-child(3n + 2) {
  background:
    linear-gradient(160deg, color-mix(in srgb, var(--dashboard-surface, #ffffff) 94%, transparent), color-mix(in srgb, var(--dashboard-surface-soft, #f7f3f2) 86%, transparent)),
    linear-gradient(135deg, rgba(111, 123, 217, 0.08), var(--thoughts-accent-soft));
}
.thought-card:nth-child(3n) {
  background:
    linear-gradient(160deg, color-mix(in srgb, var(--dashboard-surface, #ffffff) 94%, transparent), color-mix(in srgb, var(--dashboard-surface-soft, #f7f3f2) 86%, transparent)),
    linear-gradient(135deg, var(--thoughts-warm-soft), var(--thoughts-rose-soft));
}
.thought-card:hover,
.thought-card.active {
  border-color: var(--thoughts-accent);
  box-shadow: 0 18px 34px rgba(28, 27, 27, 0.12);
  transform: translateY(-3px);
}
.thought-card:hover::before,
.thought-card.active::before {
  opacity: 1;
}
.thought-card > * {
  position: relative;
  z-index: 1;
}
.card-top {
  justify-content: space-between;
}
.card-top button {
  width: 34px;
  min-height: 34px;
  padding: 0;
  border-radius: 999px;
}
.card-top .favorite-toggle.active {
  border-color: rgba(245, 158, 11, 0.34);
  background: rgba(245, 158, 11, 0.14);
  color: #f59e0b;
}
.card-top .favorite-toggle.active .material-symbols-outlined {
  color: #f59e0b;
  font-variation-settings: 'FILL' 1;
}
.mood-pill {
  padding: 6px 10px;
  border-radius: 999px;
  background: var(--dashboard-surface-muted, #f1edec);
  color: var(--dashboard-text-muted, #5c5f61);
  font-size: 12px;
  font-weight: 700;
}
.thought-card h2 {
  margin: 0;
  color: var(--dashboard-text-strong, #000000);
  font-size: 20px;
}
.thought-card p {
  display: -webkit-box;
  margin: 0;
  overflow: hidden;
  color: var(--dashboard-text-muted, #5c5f61);
  line-height: 1.7;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}
.photo-strip {
  display: grid;
  grid-template-columns: repeat(3, 1fr) 44px;
  gap: 8px;
  margin-top: auto;
}
.photo-strip img,
.photo-strip span,
.gallery img {
  aspect-ratio: 1;
  width: 100%;
  border-radius: 8px;
  object-fit: cover;
}
.photo-strip span {
  display: grid;
  place-items: center;
  background: var(--dashboard-surface-muted, #f1edec);
  color: var(--dashboard-text-muted, #5c5f61);
  font-weight: 800;
}
.card-meta {
  justify-content: space-between;
  color: var(--dashboard-text-muted, #5c5f61);
  font-size: 12px;
}
.tag-row,
.detail-tags {
  flex-wrap: wrap;
}
.tag-row span,
.detail-tags span {
  color: var(--thoughts-accent);
  font-size: 12px;
  font-weight: 700;
}
.detail-panel {
  position: sticky;
  top: 24px;
  align-self: start;
  min-height: 560px;
  padding: 24px;
  border-radius: 8px;
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--dashboard-surface, #ffffff) 92%, transparent), color-mix(in srgb, var(--dashboard-surface-soft, #f7f3f2) 82%, transparent)),
    linear-gradient(145deg, var(--thoughts-accent-soft), var(--thoughts-warm-soft));
}
.detail-head,
.modal-title,
.modal-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.detail-head {
  align-items: flex-start;
}
.detail-head h2 {
  margin: 8px 0 0;
  color: var(--dashboard-text-strong, #000000);
  font-size: 28px;
}
.detail-head button {
  width: 42px;
  padding: 0;
}
.detail-content {
  margin: 22px 0;
  color: var(--dashboard-text, #1c1b1b);
  font-size: 15px;
  line-height: 1.9;
  white-space: pre-wrap;
}
.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin: 0 0 18px;
}
.detail-grid div {
  padding: 14px;
  border-radius: 8px;
  background: var(--dashboard-surface-muted, #f1edec);
}
.detail-grid dt {
  margin-bottom: 6px;
  color: var(--dashboard-text-muted, #5c5f61);
  font-size: 11px;
}
.detail-grid dd {
  margin: 0;
  font-weight: 800;
}
.gallery {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-top: 20px;
}
.empty-state {
  display: grid;
  grid-column: 1 / -1;
  min-height: 300px;
  place-items: center;
  padding: 32px;
  border-radius: 8px;
  text-align: center;
  background:
    linear-gradient(135deg, color-mix(in srgb, var(--dashboard-surface, #ffffff) 90%, transparent), color-mix(in srgb, var(--dashboard-surface-soft, #f7f3f2) 82%, transparent)),
    linear-gradient(135deg, var(--thoughts-warm-soft), var(--thoughts-accent-soft));
}
.empty-state .material-symbols-outlined {
  font-size: 44px;
  color: var(--thoughts-accent);
}
.empty-state p {
  margin: 0;
  color: var(--dashboard-text-muted, #5c5f61);
}
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgba(12, 14, 18, 0.56);
  backdrop-filter: blur(12px);
}
.editor-modal {
  position: relative;
  width: min(1180px, 100%);
  max-height: min(90vh, 920px);
  overflow: auto;
  padding: 24px;
  border-radius: 8px;
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--dashboard-surface, #ffffff) 94%, transparent), color-mix(in srgb, var(--dashboard-surface-soft, #f7f3f2) 88%, transparent)),
    linear-gradient(135deg, var(--thoughts-warm-soft), var(--thoughts-accent-soft));
}
.modal-title h2 {
  margin: 6px 0 0;
  text-align: center;
}
.modal-title .eyebrow {
  display: block;
  text-align: center;
}
.modal-title button {
  width: 40px;
  padding: 0;
}
.form-grid {
  display: grid;
  grid-template-columns: minmax(150px, 1.2fr) minmax(126px, 0.82fr) minmax(96px, 0.62fr) minmax(130px, 0.95fr) minmax(112px, 0.78fr) minmax(160px, 1.2fr);
  gap: 10px;
  margin: 22px 0 14px;
}
.form-grid label,
.content-field {
  display: grid;
  gap: 8px;
  text-align: left;
}
.form-grid label > span:first-child,
.content-field > span,
.upload-title {
  display: block;
  color: var(--dashboard-text-muted, #5c5f61);
  font-size: 12px;
  font-weight: 700;
  padding-left: 12px;
  text-align: left;
}
.form-grid input,
.form-grid select,
.content-field textarea {
  box-sizing: border-box;
  width: 100%;
  padding: 12px;
  outline: none;
  text-align: left;
}
.form-grid input::placeholder,
.content-field textarea::placeholder {
  text-align: left;
}
.form-grid select {
  text-align-last: left;
}
.mood-field {
  position: relative;
}
.mood-select {
  position: relative;
  display: block;
  min-width: 0;
}
.mood-select-trigger,
:global(.dashboard[data-theme='night']) .mood-select-trigger {
  display: grid;
  grid-template-columns: 18px minmax(0, 1fr) 16px;
  align-items: center;
  justify-content: start;
  width: 100%;
  min-height: 45px;
  gap: 6px;
  padding: 0 10px;
  border: 1px solid var(--dashboard-border, #c4c7c7);
  border-radius: 8px;
  background: var(--dashboard-surface, #ffffff);
  box-shadow: none;
  color: var(--dashboard-text, #1c1b1b);
  transform: none;
}
.mood-select-trigger:hover,
:global(.dashboard[data-theme='night']) .mood-select-trigger:hover {
  border-color: var(--thoughts-accent);
  box-shadow: none;
  transform: none;
}
.mood-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  font-size: inherit;
  font-weight: 400;
  line-height: 1;
  text-align: center;
}
.mood-name {
  display: block;
  min-width: 0;
  overflow: hidden;
  font-size: inherit;
  font-weight: 400;
  line-height: normal;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.mood-arrow {
  color: var(--dashboard-text-muted, #5c5f61);
  font-size: 17px;
}
.mood-menu {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  z-index: 6;
  display: grid;
  width: min(128px, 100vw);
  padding: 6px;
  border: 1px solid var(--dashboard-border, #c4c7c7);
  border-radius: 8px;
  background: var(--dashboard-surface, #ffffff);
  box-shadow: 0 16px 34px rgba(28, 27, 27, 0.16);
}
.mood-option,
:global(.dashboard[data-theme='night']) .mood-option {
  display: grid;
  grid-template-columns: 18px minmax(0, 1fr);
  align-items: center;
  justify-content: start;
  min-height: 34px;
  gap: 8px;
  padding: 0 8px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  box-shadow: none;
  color: var(--dashboard-text, #1c1b1b);
  transform: none;
}
.mood-option:hover,
.mood-option.active,
:global(.dashboard[data-theme='night']) .mood-option:hover,
:global(.dashboard[data-theme='night']) .mood-option.active {
  background: color-mix(in srgb, var(--thoughts-accent) 12%, transparent);
  box-shadow: none;
  transform: none;
}
.date-picker-field {
  position: relative;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  min-height: 45px;
  gap: 8px;
  padding: 12px;
  border: 1px solid var(--dashboard-border, #c4c7c7);
  border-radius: 8px;
  background: var(--dashboard-surface, #ffffff);
  color: var(--dashboard-text, #1c1b1b);
  font: inherit;
  line-height: normal;
}
.date-picker-btn,
:global(.dashboard[data-theme='night']) .date-picker-btn {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  min-height: 0;
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
  color: var(--dashboard-accent, #1c1b1a);
  cursor: pointer;
  transform: none;
}
.date-picker-btn:hover,
:global(.dashboard[data-theme='night']) .date-picker-btn:hover {
  background: transparent;
  box-shadow: none;
  transform: none;
}
.date-picker-btn .material-symbols-outlined {
  color: inherit;
  font-size: 18px;
}
.date-picker-placeholder,
.date-picker-value {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  font-size: inherit;
  font-weight: 400;
  line-height: normal;
  text-align: left;
  text-overflow: clip;
  white-space: nowrap;
}
.date-picker-placeholder {
  color: #757575;
}
.date-picker-value {
  color: var(--dashboard-text, #1c1b1b);
}
.form-grid label .date-picker-field {
  display: flex;
  color: var(--dashboard-text, #1c1b1b);
  font-size: inherit;
  font-weight: 400;
  text-align: left;
}
.form-grid label .date-picker-placeholder,
.form-grid label .date-picker-value {
  display: block;
  font-size: inherit;
  font-weight: 400;
  text-align: left;
}
.date-picker-input {
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
.editor-body {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  align-items: stretch;
  margin: 16px 0 18px;
}
.content-field textarea {
  display: block;
  aspect-ratio: 16 / 9;
  height: auto;
  min-height: 260px;
  resize: none;
  vertical-align: top;
  line-height: 1.7;
}
.upload-column {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.upload-title {
  margin-bottom: 8px;
  padding-left: 0;
  text-align: left;
}
.upload-frame {
  position: relative;
  display: grid;
  min-height: 260px;
  aspect-ratio: 16 / 9;
  width: 100%;
  place-items: center;
  overflow: hidden;
  border: 1px dashed color-mix(in srgb, var(--thoughts-accent) 48%, var(--dashboard-border, #c4c7c7));
  border-radius: 8px;
  background: color-mix(in srgb, var(--dashboard-surface-muted, #f1edec) 88%, transparent);
}
.upload-frame img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.upload-frame-button {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: clamp(58px, 24%, 92px);
  aspect-ratio: 1;
  border: 1px solid color-mix(in srgb, var(--dashboard-surface-muted, #f1edec) 88%, transparent);
  border-radius: 8px;
  background: color-mix(in srgb, var(--dashboard-surface-muted, #f1edec) 88%, transparent);
  color: var(--dashboard-text, #1c1b1b);
  cursor: pointer;
  box-shadow: none;
  transition: background 0.5s, border-color 0.5s, color 0.5s, box-shadow 0.5s, transform 0.5s;
}
.upload-frame-button:hover {
  border-color: #1c1b1b;
  background: #1c1b1b;
  color: #ffffff;
  box-shadow: 0 14px 28px rgba(28, 27, 27, 0.2);
  transform: translateY(-1px);
}
.upload-frame-button.danger {
  border-color: #1c1b1b;
  background: #1c1b1b;
  color: #ffffff;
  opacity: 0;
  transition: opacity 1s, transform 0.5s;
}
.upload-frame-button.danger:hover,
.upload-frame-button.danger:focus-visible {
  border-color: #1c1b1b;
  background: #1c1b1b;
  color: #ffffff;
  opacity: 1;
}
.upload-frame-button .material-symbols-outlined {
  font-size: clamp(28px, 6vw, 42px);
}
.upload-frame-button input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}
.modal-actions button {
  min-width: 92px;
  padding: 0 18px;
}
.confirm-backdrop {
  position: absolute;
  inset: 0;
  z-index: 3;
  display: grid;
  place-items: center;
  padding: 24px;
  border-radius: inherit;
  background: rgba(12, 14, 18, 0.28);
  backdrop-filter: blur(8px);
}
.confirm-dialog {
  width: min(360px, 100%);
  padding: 22px;
  border: 1px solid var(--dashboard-border-soft, rgba(196, 199, 199, 0.56));
  border-radius: 8px;
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--dashboard-surface, #ffffff) 96%, transparent), color-mix(in srgb, var(--dashboard-surface-soft, #f7f3f2) 90%, transparent)),
    linear-gradient(135deg, var(--thoughts-warm-soft), var(--thoughts-accent-soft));
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.22);
  text-align: center;
}
.confirm-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  margin-bottom: 12px;
  border-radius: 8px;
  background: rgba(179, 38, 30, 0.1);
  color: #b3261e;
  font-size: 26px;
}
.confirm-dialog h3 {
  margin: 0;
  color: var(--dashboard-text-strong, #000000);
  font-size: 18px;
}
.confirm-dialog p {
  margin: 10px 0 18px;
  color: var(--dashboard-text-muted, #5c5f61);
  line-height: 1.6;
}
.confirm-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
}
.confirm-actions button {
  min-width: 96px;
  padding: 0 16px;
}
.confirm-actions .danger-action {
  border-color: transparent;
  background: #b3261e;
  color: #ffffff;
}
.confirm-actions .danger-action:hover {
  border-color: transparent;
  background: #961f18;
}
.toast {
  position: fixed;
  right: 32px;
  bottom: 32px;
  z-index: 80;
  padding: 14px 18px;
  border-radius: 8px;
  background: var(--dashboard-accent, #1c1b1a);
  color: var(--dashboard-accent-contrast, #ffffff);
  box-shadow: 0 18px 36px rgba(0, 0, 0, 0.22);
}
:global(.dashboard[data-theme='night']) .thoughts-page {
  background:
    radial-gradient(circle at 12% 8%, rgba(246, 200, 95, 0.1), transparent 26rem),
    radial-gradient(circle at 88% 16%, rgba(77, 147, 138, 0.12), transparent 24rem),
    linear-gradient(135deg, var(--dashboard-bg, #111318), var(--dashboard-surface-soft, #151820));
}
:global(.dashboard[data-theme='night']) .toolbar,
:global(.dashboard[data-theme='night']) .detail-panel,
:global(.dashboard[data-theme='night']) .editor-modal,
:global(.dashboard[data-theme='night']) .confirm-dialog,
:global(.dashboard[data-theme='night']) .empty-state {
  border-color: rgba(255, 255, 255, 0.1);
  background: rgba(26, 29, 36, 0.78);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.34);
}
:global(.dashboard[data-theme='night']) .moment-strip div,
:global(.dashboard[data-theme='night']) .thought-card,
:global(.dashboard[data-theme='night']) .detail-grid div {
  border-color: var(--dashboard-border-soft);
  background: var(--dashboard-surface-soft);
}
:global(.dashboard[data-theme='night']) .moment-strip span,
:global(.dashboard[data-theme='night']) .card-meta,
:global(.dashboard[data-theme='night']) .thought-card p,
:global(.dashboard[data-theme='night']) .detail-grid dt,
:global(.dashboard[data-theme='night']) .form-grid label > span:first-child,
:global(.dashboard[data-theme='night']) .content-field > span,
:global(.dashboard[data-theme='night']) .upload-title,
:global(.dashboard[data-theme='night']) .date-picker-placeholder {
  color: #a7afbc;
}
:global(.dashboard[data-theme='night']) .moment-strip strong,
:global(.dashboard[data-theme='night']) .thought-card h2,
:global(.dashboard[data-theme='night']) .detail-head h2,
:global(.dashboard[data-theme='night']) .confirm-dialog h3,
:global(.dashboard[data-theme='night']) .detail-content,
:global(.dashboard[data-theme='night']) .date-picker-value,
:global(.dashboard[data-theme='night']) button,
:global(.dashboard[data-theme='night']) select,
:global(.dashboard[data-theme='night']) input,
:global(.dashboard[data-theme='night']) textarea {
  color: #f5f7fb;
}
:global(.dashboard[data-theme='night']) .confirm-dialog p {
  color: #a7afbc;
}
:global(.dashboard[data-theme='night']) button,
:global(.dashboard[data-theme='night']) select,
:global(.dashboard[data-theme='night']) input,
:global(.dashboard[data-theme='night']) textarea,
:global(.dashboard[data-theme='night']) .date-picker-field,
:global(.dashboard[data-theme='night']) .mood-menu,
:global(.dashboard[data-theme='night']) .search-box {
  border-color: rgba(255, 255, 255, 0.14);
  background: rgba(20, 24, 32, 0.88);
}
:global(.dashboard[data-theme='night']) button.primary {
  background: var(--dashboard-accent);
  color: var(--dashboard-accent-contrast);
}
:global(.dashboard[data-theme='night']) .upload-frame-button {
  border-color: rgba(255, 255, 255, 0.14);
  background: rgba(20, 24, 32, 0.88);
  color: #f5f7fb;
}
:global(.dashboard[data-theme='night']) .upload-frame-button.danger {
  border-color: #000000;
  background: #000000;
  color: #ffffff;
}
:global(.dashboard[data-theme='night']) .upload-frame-button:hover,
:global(.dashboard[data-theme='night']) .upload-frame-button.danger:focus-visible,
:global(.dashboard[data-theme='night']) .upload-frame-button.danger:hover {
  border-color: #000000;
  background: #000000;
  color: #ffffff;
  opacity: 1;
}
@media (max-width: 1180px) {
  .thoughts-hero,
  .thoughts-layout {
    grid-template-columns: 1fr;
  }
  .detail-panel {
    position: static;
  }
}
@media (max-width: 700px) {
  .thoughts-page {
    padding: 18px;
  }
  .moment-strip {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .hero-copy h1 {
    font-size: 1.75rem;
  }
  .form-grid,
  .editor-body,
  .detail-grid {
    grid-template-columns: 1fr;
  }
  .tool-group button {
    width: 100%;
  }
}
</style>
