<template>
  <section class="thoughts-page">
    <header class="thoughts-hero">
      <div class="hero-copy">
        <span class="eyebrow">Life Notes</span>
        <h1>生活随想</h1>
        <p>把路上的风、晚饭后的闲聊、突然冒出的念头，都收进一个可以翻看的小宇宙。</p>
      </div>
      <div class="hero-card">
        <span>本月随想</span>
        <strong>{{ monthCount }}</strong>
        <small>{{ favoriteCount }} 条已收藏 · {{ photoCount }} 张照片</small>
        <div class="mood-orbit" aria-hidden="true">
          <i v-for="mood in moodStats" :key="mood.name" :style="{ '--level': mood.percent }">{{ mood.icon }}</i>
        </div>
      </div>
    </header>

    <section class="toolbar">
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
          <option value="">全部心情</option>
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
            <button type="button" :aria-label="thought.favorite ? '取消收藏' : '收藏'" @click.stop="toggleFavorite(thought)">
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
            <div><dt>心情</dt><dd>{{ moodIcon(selectedThought.mood) }} {{ selectedThought.mood }}</dd></div>
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
        <div class="modal-title">
          <div>
            <span class="eyebrow">{{ editingId ? 'Edit Note' : 'New Note' }}</span>
            <h2>{{ editingId ? '编辑随想' : '新增随想' }}</h2>
          </div>
          <button type="button" @click="closeEditor"><span class="material-symbols-outlined">close</span></button>
        </div>

        <div class="form-grid">
          <label><span>标题</span><input v-model.trim="form.title" required maxlength="40" placeholder="今天想记下什么" /></label>
          <label><span>日期</span><input v-model="form.date" required type="date" /></label>
          <label><span>心情</span><select v-model="form.mood"><option v-for="mood in moods" :key="mood.name" :value="mood.name">{{ mood.icon }} {{ mood.name }}</option></select></label>
          <label><span>地点</span><input v-model.trim="form.location" placeholder="家、咖啡店、江边..." /></label>
          <label><span>天气</span><input v-model.trim="form.weather" placeholder="晴 / 雨 / 微风" /></label>
          <label><span>标签</span><input v-model.trim="tagInput" placeholder="用逗号分隔，如 周末,电影,散步" /></label>
        </div>

        <label class="content-field">
          <span>内容</span>
          <textarea v-model.trim="form.content" required rows="7" placeholder="写下这段生活的声音、颜色和温度"></textarea>
        </label>

        <section class="upload-panel">
          <div>
            <strong>照片</strong>
            <span>支持多选，照片会保存在浏览器本地。</span>
          </div>
          <label class="upload-button">
            <span class="material-symbols-outlined">add_photo_alternate</span>
            上传照片
            <input type="file" multiple accept="image/*" @change="handlePhotoUpload" />
          </label>
        </section>

        <div v-if="form.photos.length" class="photo-editor-grid">
          <figure v-for="photo in form.photos" :key="photo.id">
            <img :src="photo.url" :alt="photo.name" />
            <button type="button" @click="removePhoto(photo.id)"><span class="material-symbols-outlined">close</span></button>
          </figure>
        </div>

        <div class="modal-actions">
          <label class="favorite-toggle"><input v-model="form.favorite" type="checkbox" /><span>加入收藏</span></label>
          <div>
            <button type="button" @click="closeEditor">取消</button>
            <button type="submit" class="primary">保存</button>
          </div>
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
const favoriteCount = computed(() => thoughts.value.filter((thought) => thought.favorite).length)
const photoCount = computed(() => thoughts.value.reduce((sum, thought) => sum + thought.photos.length, 0))
const monthCount = computed(() => {
  const month = today().slice(0, 7)
  return thoughts.value.filter((thought) => thought.date.startsWith(month)).length
})
const moodStats = computed(() => moods.map((mood) => {
  const count = thoughts.value.filter((thought) => thought.mood === mood.name).length
  return { ...mood, percent: `${Math.max(18, count * 20)}%` }
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
function moodIcon(name) {
  return moods.find((mood) => mood.name === name)?.icon ?? '◌'
}
function openCreate() {
  editingId.value = ''
  Object.assign(form, { title: '', content: '', mood: '平静', date: today(), location: '', weather: '', photos: [], favorite: false })
  tagInput.value = ''
  editorOpen.value = true
}
function openEdit(thought) {
  if (!thought) return
  editingId.value = thought.id
  Object.assign(form, {
    title: thought.title,
    content: thought.content,
    mood: thought.mood,
    date: thought.date,
    location: thought.location,
    weather: thought.weather,
    photos: [...thought.photos],
    favorite: thought.favorite,
  })
  tagInput.value = thought.tags.join(', ')
  editorOpen.value = true
}
function closeEditor() {
  editorOpen.value = false
}
function saveThought() {
  const tags = tagInput.value.split(/[,，]/).map((tag) => tag.trim()).filter(Boolean)
  const payload = {
    title: form.title,
    content: form.content,
    mood: form.mood,
    date: form.date,
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
  form.photos.push(...photos)
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
function removePhoto(id) {
  form.photos = form.photos.filter((photo) => photo.id !== id)
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
  const header = ['标题', '日期', '心情', '地点', '天气', '标签', '内容', '照片数']
  const rows = records.map((item) => [item.title, item.date, item.mood, item.location, item.weather, item.tags.join('|'), item.content, item.photos.length])
  return [header, ...rows].map((row) => row.map(csvCell).join(',')).join('\n')
}
function csvCell(value) {
  return `"${String(value).replaceAll('"', '""')}"`
}
function toMarkdown(records) {
  return records.map((item) => [`## ${item.title}`, '', `- 日期：${item.date}`, `- 心情：${item.mood}`, `- 地点：${item.location}`, `- 标签：${item.tags.map((tag) => `#${tag}`).join(' ') || '无'}`, '', item.content, ''].join('\n')).join('\n')
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
  min-height: 100vh;
  padding: 32px;
  background:
    radial-gradient(circle at 12% 10%, rgba(246, 200, 95, 0.18), transparent 26rem),
    radial-gradient(circle at 86% 18%, rgba(77, 147, 138, 0.16), transparent 24rem),
    linear-gradient(135deg, var(--dashboard-bg, #fdf8f8), var(--dashboard-surface-soft, #f7f3f2));
  color: var(--dashboard-text, #1c1b1b);
}
.thoughts-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 24px;
  align-items: stretch;
  margin-bottom: 24px;
}
.hero-copy,
.hero-card,
.toolbar,
.detail-panel,
.editor-modal,
.empty-state {
  border: 1px solid var(--dashboard-border-soft, rgba(196, 199, 199, 0.56));
  background: color-mix(in srgb, var(--dashboard-surface, #ffffff) 88%, transparent);
  box-shadow: var(--dashboard-shadow, 0 18px 50px rgba(28, 27, 27, 0.08));
  backdrop-filter: blur(18px);
}
.hero-copy {
  position: relative;
  overflow: hidden;
  min-height: 220px;
  padding: 34px;
  border-radius: 8px;
}
.hero-copy::after {
  position: absolute;
  right: 34px;
  bottom: 28px;
  width: 190px;
  height: 110px;
  border: 1px solid rgba(77, 147, 138, 0.32);
  border-radius: 48% 52% 45% 55%;
  background: linear-gradient(135deg, rgba(246, 200, 95, 0.22), rgba(77, 147, 138, 0.14));
  content: '';
  transform: rotate(-8deg);
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
  margin: 18px 0 12px;
  color: var(--dashboard-text-strong, #000000);
  font-size: 52px;
  line-height: 1.05;
}
.hero-copy p {
  position: relative;
  z-index: 1;
  max-width: 620px;
  margin: 0;
  color: var(--dashboard-text-muted, #5c5f61);
  font-size: 16px;
  line-height: 1.8;
}
.hero-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 220px;
  padding: 28px;
  border-radius: 8px;
  background: linear-gradient(145deg, rgba(28, 27, 26, 0.92), rgba(77, 147, 138, 0.88)), var(--dashboard-accent, #1c1b1a);
  color: #ffffff;
}
.hero-card span,
.hero-card small {
  color: rgba(255, 255, 255, 0.72);
  font-size: 13px;
}
.hero-card strong {
  font-size: 64px;
  line-height: 1;
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
  padding: 16px;
  border-radius: 8px;
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
  border-color: var(--dashboard-accent, #1c1b1a);
  transform: translateY(-1px);
  box-shadow: 0 10px 24px rgba(28, 27, 27, 0.12);
}
button:disabled {
  cursor: not-allowed;
  opacity: 0.48;
}
button.primary {
  border-color: var(--dashboard-accent, #1c1b1a);
  background: var(--dashboard-accent, #1c1b1a);
  color: var(--dashboard-accent-contrast, #ffffff);
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
  border: 1px solid var(--dashboard-border-soft, rgba(196, 199, 199, 0.56));
  border-radius: 8px;
  background: var(--dashboard-surface, #ffffff);
  cursor: pointer;
  transition: transform 0.22s, border-color 0.22s, box-shadow 0.22s;
}
.thought-card::before {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(135deg, rgba(246, 200, 95, 0.12), transparent 46%, rgba(77, 147, 138, 0.12));
  content: '';
  opacity: 0;
  transition: opacity 0.22s;
}
.thought-card:hover,
.thought-card.active {
  border-color: var(--dashboard-accent, #1c1b1a);
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
.gallery img,
.photo-editor-grid img {
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
  color: #4d938a;
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
}
.detail-head,
.modal-title,
.modal-actions,
.upload-panel {
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
}
.empty-state .material-symbols-outlined {
  font-size: 44px;
  color: #4d938a;
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
  width: min(920px, 100%);
  max-height: min(90vh, 920px);
  overflow: auto;
  padding: 24px;
  border-radius: 8px;
}
.modal-title h2 {
  margin: 6px 0 0;
}
.modal-title button {
  width: 40px;
  padding: 0;
}
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
  margin: 22px 0 14px;
}
.form-grid label,
.content-field {
  display: grid;
  gap: 8px;
}
.form-grid label span,
.content-field span,
.upload-panel span {
  color: var(--dashboard-text-muted, #5c5f61);
  font-size: 12px;
  font-weight: 700;
}
.form-grid input,
.content-field textarea {
  width: 100%;
  padding: 12px;
  outline: none;
}
.content-field textarea {
  resize: vertical;
  line-height: 1.7;
}
.upload-panel {
  margin: 16px 0;
  padding: 16px;
  border: 1px dashed var(--dashboard-border, #c4c7c7);
  border-radius: 8px;
  background: var(--dashboard-surface-muted, #f1edec);
}
.upload-panel strong,
.upload-panel span {
  display: block;
}
.upload-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 42px;
  padding: 0 14px;
  border-radius: 8px;
  background: var(--dashboard-accent, #1c1b1a);
  color: var(--dashboard-accent-contrast, #ffffff);
  cursor: pointer;
}
.upload-button input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}
.photo-editor-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: 12px;
  margin-bottom: 18px;
}
.photo-editor-grid figure {
  position: relative;
  margin: 0;
}
.photo-editor-grid button {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 30px;
  min-height: 30px;
  padding: 0;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.62);
  color: #ffffff;
}
.favorite-toggle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--dashboard-text-muted, #5c5f61);
  font-weight: 700;
}
.modal-actions > div {
  display: flex;
  gap: 10px;
}
.modal-actions button {
  min-width: 92px;
  padding: 0 18px;
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
    radial-gradient(circle at 12% 10%, rgba(246, 200, 95, 0.12), transparent 26rem),
    radial-gradient(circle at 86% 18%, rgba(77, 147, 138, 0.14), transparent 24rem),
    linear-gradient(135deg, var(--dashboard-bg, #111318), var(--dashboard-surface-soft, #151820));
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
  .hero-copy h1 {
    font-size: 40px;
  }
  .form-grid,
  .detail-grid {
    grid-template-columns: 1fr;
  }
  .modal-actions {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
