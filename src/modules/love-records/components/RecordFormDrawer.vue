<template>
  <aside class="form-drawer">
    <header><div><p>{{ record ? 'EDIT MEMORY' : 'NEW MEMORY' }}</p><h2>{{ record ? '编辑这段回忆' : '记录新的心动' }}</h2></div><button type="button" aria-label="关闭表单" @click="$emit('close')"><span class="material-symbols-outlined">close</span></button></header>
    <form id="love-record-form" @submit.prevent="submit">
      <label><span>记录标题 <b>*</b></span><input v-model.trim="draft.title" maxlength="30" placeholder="给这段回忆起个名字" required></label>
      <div class="two-columns"><label><span>日期 <b>*</b></span><input v-model="draft.date" type="date" required></label><label><span>分类</span><select v-model="draft.category"><option v-for="category in categories" :key="category">{{ category }}</option></select></label></div>
      <label><span>想说的话</span><textarea v-model.trim="draft.content" rows="5" maxlength="500" placeholder="写下当时发生的事、想对 TA 说的话…… 😊" /></label>
      <section><div class="field-title"><span>照片</span><small>{{ draft.images.length }} / 8</small></div><div class="upload-zone" :class="{ dragging }" @dragover.prevent="dragging = true" @dragleave="dragging = false" @drop.prevent="onDrop"><input ref="fileInput" type="file" accept="image/*" multiple @change="onFiles"><span class="material-symbols-outlined">add_photo_alternate</span><p>拖拽照片到这里，或 <button type="button" @click="fileInput?.click()">点击上传</button></p><small>支持 JPG、PNG，单张不超过 5MB</small></div><div v-if="draft.images.length" class="upload-thumbs"><div v-for="(image, index) in draft.images" :key="`${image}-${index}`"><img :src="image" alt="照片预览"><button type="button" aria-label="删除照片" @click="draft.images.splice(index, 1)"><span class="material-symbols-outlined">close</span></button></div></div></section>
      <section class="location-editor">
        <div class="field-title"><span>地点</span><small>{{ locationsLoading ? '正在查询已有地点…' : `${locations.length} 个已有地点` }}</small></div>
        <select v-model="locationMode" @change="changeLocationMode">
          <option value="none">不添加地点</option>
          <option value="existing">选择已有地点</option>
          <option v-if="!record" value="new">新增地点</option>
        </select>
        <label v-if="locationMode === 'existing'">
          <span>已有地点 <b>*</b></span>
          <select v-model="draft.locationId" required>
            <option value="" disabled>{{ locationsLoading ? '正在加载…' : '请选择地点' }}</option>
            <option v-for="item in locations" :key="item.id" :value="item.id">{{ item.name }}{{ item.address ? ` · ${item.address}` : '' }}</option>
          </select>
          <small v-if="!locationsLoading && !locations.length" class="field-hint">暂无已有地点，请选择“新增地点”</small>
        </label>
        <div v-else-if="locationMode === 'new' && draft.newLocation" class="new-location-fields">
          <label><span>地点名称 <b>*</b></span><input v-model.trim="draft.newLocation.name" maxlength="100" placeholder="例如：南山一棵树" required></label>
          <label><span>详细地址 <b>*</b></span><input v-model.trim="draft.newLocation.address" maxlength="255" placeholder="请输入详细地址" required></label>
          <div class="two-columns">
            <label><span>城市名称 <b>*</b></span><input v-model.trim="draft.newLocation.cityName" maxlength="64" placeholder="例如：重庆市" required></label>
            <label><span>城市编码 <b>*</b></span><input v-model.trim="draft.newLocation.cityCode" maxlength="20" placeholder="例如：500100" required></label>
          </div>
          <div class="two-columns">
            <label><span>经度</span><input v-model.number="draft.newLocation.longitude" type="number" min="-180" max="180" step="any" placeholder="选填"></label>
            <label><span>纬度</span><input v-model.number="draft.newLocation.latitude" type="number" min="-90" max="90" step="any" placeholder="选填"></label>
          </div>
          <small class="field-hint">经纬度为选填；填写时需同时填写经度和纬度。</small>
        </div>
      </section>
      <section><div class="field-title"><span>当时的心情</span><small>可多选</small></div><div class="mood-options"><button v-for="item in moods" :key="item.name" type="button" :class="{ active: draft.moods.includes(item.name) }" @click="toggleMood(item.name)"><span>{{ item.emoji }}</span>{{ item.name }}</button></div></section>
      <label><span>自定义标签</span><input v-model.trim="tagInput" placeholder="输入标签后按回车" @keydown.enter.prevent="addTag"></label>
      <div v-if="draft.tags.length" class="custom-tags"><button v-for="tag in draft.tags" :key="tag" type="button" @click="draft.tags = draft.tags.filter((item) => item !== tag)">#{{ tag }} <span>×</span></button></div>
      <button class="switch-row" type="button" :aria-pressed="draft.important" @click="draft.important = !draft.important"><span><b>标记为重要回忆</b><small>重要记录会显示爱心标记</small></span><i :class="{ active: draft.important }" /></button>
    </form>
    <footer><button type="button" @click="$emit('close')">取消</button><button class="save" type="submit" form="love-record-form"><span class="material-symbols-outlined">favorite</span>保存记录</button></footer>
  </aside>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import type { LoveLocationOption, LoveRecord, Mood, NewLocationDraft, RecordCategory, RecordDraft } from '../types/records'
import { toInputDate } from '../utils/date'
const props = defineProps<{ record: LoveRecord | null; locations: LoveLocationOption[]; locationsLoading: boolean }>()
const emit = defineEmits<{ close: []; save: [draft: RecordDraft] }>()
const categories: RecordCategory[] = ['约会', '日常', '旅行', '纪念日']
const moods: Array<{ name: Mood; emoji: string }> = [{ name: '心动', emoji: '♥' }, { name: '开心', emoji: '😊' }, { name: '治愈', emoji: '🌿' }, { name: '感动', emoji: '🥹' }, { name: '平静', emoji: '☁️' }, { name: '爆笑', emoji: '😆' }]
const fileInput = ref<HTMLInputElement | null>(null)
const tagInput = ref('')
const dragging = ref(false)
const locationMode = ref<'none' | 'existing' | 'new'>('none')
const draft = reactive<RecordDraft>(emptyDraft())

function emptyLocation(): NewLocationDraft { return { name: '', address: '', cityName: '', cityCode: '', longitude: null, latitude: null } }
function emptyDraft(): RecordDraft { return { title: '', date: toInputDate(), content: '', images: [], location: '', locationId: null, newLocation: null, moods: [], tags: [], category: '日常', important: false } }
function reset(): void {
  Object.assign(draft, props.record
    ? { ...props.record, locationId: props.record.locationId ?? null, newLocation: null, images: [...props.record.images], moods: [...props.record.moods], tags: [...props.record.tags] }
    : emptyDraft())
  locationMode.value = draft.locationId ? 'existing' : 'none'
}
watch(() => props.record, reset, { immediate: true })
function changeLocationMode(): void {
  if (locationMode.value === 'new') {
    draft.locationId = null
    draft.newLocation = emptyLocation()
  } else {
    draft.newLocation = null
    if (locationMode.value === 'none') draft.locationId = null
  }
}
function toggleMood(mood: Mood): void { draft.moods = draft.moods.includes(mood) ? draft.moods.filter((item) => item !== mood) : [...draft.moods, mood] }
function addTag(): void { const value = tagInput.value.replace(/^#/, '').trim(); if (value && !draft.tags.includes(value)) draft.tags.push(value); tagInput.value = '' }
async function readFiles(files: File[]): Promise<void> { for (const file of files.slice(0, 8 - draft.images.length)) { if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) continue; draft.images.push(await fileToDataUrl(file)) } }
// Data URL 只用于即时预览；保存时由 API 层转换回文件并上传到 diary-file。
function fileToDataUrl(file: File): Promise<string> { return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(file) }) }
function onFiles(event: Event): void { const input = event.target as HTMLInputElement; void readFiles(Array.from(input.files ?? [])); input.value = '' }
function onDrop(event: DragEvent): void { dragging.value = false; void readFiles(Array.from(event.dataTransfer?.files ?? [])) }
function submit(): void {
  // reactive 会返回 Proxy，逐字段构造普通对象后再交给业务层保存。
  emit('save', {
    id: draft.id,
    title: draft.title,
    date: draft.date,
    content: draft.content,
    images: [...draft.images],
    location: locationMode.value === 'existing'
      ? props.locations.find((item) => item.id === draft.locationId)?.name ?? ''
      : draft.newLocation?.name ?? '',
    locationId: locationMode.value === 'existing' ? draft.locationId : null,
    newLocation: locationMode.value === 'new' && draft.newLocation ? { ...draft.newLocation } : null,
    moods: [...draft.moods],
    tags: [...draft.tags],
    category: draft.category,
    important: draft.important,
  })
}
</script>

<style scoped>
.form-drawer{position:relative;display:grid;grid-template-rows:72px minmax(0,1fr) 60px;height:100%;color:#4e3d3e;background:#fff;box-shadow:-18px 0 42px rgba(68,42,40,.13)}.form-drawer>header{display:flex;align-items:center;justify-content:space-between;padding:0 20px;border-bottom:1px solid #f0e5e0}.form-drawer>header p{margin:0 0 2px;color:#ff6b81;font-size:8px;font-weight:800;letter-spacing:.16em}.form-drawer>header h2{margin:0;font-size:17px}.form-drawer>header button{display:grid;place-items:center;width:32px;height:32px;border:0;border-radius:9px;color:#8f7c7a;background:#faf4f1;cursor:pointer}form{display:grid;align-content:start;gap:16px;min-height:0;padding:18px 20px;overflow-y:auto}label{display:grid;gap:7px}label>span,.field-title{color:#71605f;font-size:10px;font-weight:700}label>span b{color:#ff657d}.two-columns{display:grid;grid-template-columns:1fr 1fr;gap:10px}input,textarea,select{width:100%;padding:10px 11px;border:1px solid #eaded8;border-radius:9px;outline:0;color:#574546;background:#fdf9f7;font:10px inherit}textarea{resize:vertical;line-height:1.6}input:focus,textarea:focus,select:focus{border-color:#ff8998;box-shadow:0 0 0 3px rgba(255,107,129,.1)}.field-title{display:flex;justify-content:space-between;margin-bottom:7px}.field-title small{color:#b4a19e;font-size:8px}.location-editor{display:grid;gap:10px;padding:12px;border:1px solid #f0e3de;border-radius:11px;background:#fffaf8}.location-editor .field-title{margin-bottom:0}.new-location-fields{display:grid;gap:10px;padding-top:2px}.field-hint{color:#a5908d;font-size:8px}.upload-zone{position:relative;display:grid;place-items:center;gap:3px;padding:15px;border:1px dashed #dfcbc5;border-radius:10px;color:#a5908d;background:#fdf9f7}.upload-zone.dragging{border-color:#ff6b81;background:#fff0f0}.upload-zone>input{position:absolute;inset:0;opacity:0;pointer-events:none}.upload-zone>.material-symbols-outlined{color:#ff8b99}.upload-zone p{margin:2px 0;font-size:9px}.upload-zone p button{padding:0;border:0;color:#ff6179;background:transparent;cursor:pointer}.upload-zone>small{font-size:7px}.upload-thumbs{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}.upload-thumbs>div{position:relative;width:54px;height:47px}.upload-thumbs img{width:100%;height:100%;border-radius:7px;object-fit:cover}.upload-thumbs button{position:absolute;right:-4px;top:-4px;display:grid;place-items:center;width:17px;height:17px;border:0;border-radius:50%;color:#fff;background:#574446;cursor:pointer}.upload-thumbs .material-symbols-outlined{font-size:11px}.mood-options{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}.mood-options button{display:flex;align-items:center;justify-content:center;gap:4px;min-height:34px;border:1px solid #eaded8;border-radius:9px;color:#877573;background:#fff;cursor:pointer;font-size:9px}.mood-options button.active{color:#e6536b;border-color:#ff97a4;background:#fff0f0}.custom-tags{display:flex;flex-wrap:wrap;gap:5px;margin-top:-10px}.custom-tags button{padding:4px 7px;border:0;border-radius:999px;color:#e3586e;background:#ffebeb;font-size:8px;cursor:pointer}.switch-row{display:flex;align-items:center;justify-content:space-between;padding:12px;border-radius:10px;background:#fdf7f4}.switch-row>span{display:grid}.switch-row small{margin-top:2px;color:#a99592;font-size:8px;font-weight:400}.switch-row input{position:absolute;opacity:0}.switch-row i{position:relative;width:36px;height:20px;border-radius:99px;background:#d9cac7;cursor:pointer;transition:.2s}.switch-row i:after{content:'';position:absolute;left:3px;top:3px;width:14px;height:14px;border-radius:50%;background:#fff;transition:.2s}.switch-row input:checked+i{background:#ff6b81}.switch-row input:checked+i:after{transform:translateX(16px)}.form-drawer>footer{display:flex;justify-content:flex-end;align-items:center;gap:8px;padding:0 20px;border-top:1px solid #f0e5e0}.form-drawer>footer button{min-height:35px;padding:0 14px;border:1px solid #eadcd7;border-radius:9px;color:#8a7775;background:#fff;cursor:pointer;font-size:9px}.form-drawer>footer .save{display:flex;align-items:center;gap:5px;color:#fff;border-color:#ff6b81;background:#ff6b81;font-weight:700}.save .material-symbols-outlined{font-size:14px}
.form-drawer{min-height:0;max-height:100%;overflow:hidden}.form-drawer>form{min-height:0;max-height:100%;overflow-x:hidden;overflow-y:auto;padding-bottom:28px;overscroll-behavior:contain;scrollbar-gutter:stable;touch-action:pan-y}.form-drawer>footer{position:relative;z-index:2;min-height:60px;background:#fff;box-shadow:0 -8px 18px rgba(68,42,40,.04)}.switch-row{position:relative;flex:0 0 auto}.switch-row input{right:12px;bottom:12px;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}.switch-row i{flex:0 0 36px}
.switch-row{width:100%;border:0;color:inherit;font:inherit;text-align:left;cursor:pointer}.switch-row i.active{background:#ff6b81}.switch-row i.active:after{transform:translateX(16px)}
</style>
