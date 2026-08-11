<template>
  <aside class="detail-drawer">
    <header><button type="button" aria-label="关闭详情" @click="$emit('close')"><span class="material-symbols-outlined">close</span></button><span>回忆详情</span><div><button type="button" aria-label="上一条" @click="$emit('navigate', -1)"><span class="material-symbols-outlined">arrow_back</span></button><button type="button" aria-label="下一条" @click="$emit('navigate', 1)"><span class="material-symbols-outlined">arrow_forward</span></button></div></header>
    <div class="drawer-scroll">
      <section class="gallery">
        <img :src="record.images[imageIndex]" :alt="record.title">
        <button v-if="record.images.length > 1" class="gallery-prev" type="button" aria-label="上一张图片" @click="moveImage(-1)"><span class="material-symbols-outlined">chevron_left</span></button>
        <button v-if="record.images.length > 1" class="gallery-next" type="button" aria-label="下一张图片" @click="moveImage(1)"><span class="material-symbols-outlined">chevron_right</span></button>
        <span class="gallery-count">{{ imageIndex + 1 }} / {{ record.images.length }}</span>
      </section>
      <div v-if="record.images.length > 1" class="thumbnails"><button v-for="(image, index) in record.images" :key="image" type="button" :class="{ active: imageIndex === index }" @click="imageIndex = index"><img :src="image" alt=""></button></div>
      <section class="detail-copy">
        <div class="title-line"><h2>{{ record.title }}</h2><button type="button" :class="{ active: record.important }" :title="record.important ? '取消重要标记' : '标记重要'" @click="$emit('important', record.id)"><span class="material-symbols-outlined">favorite</span></button></div>
        <time>{{ formatDate(record.date, true) }}</time>
        <div class="detail-tags"><span v-for="mood in record.moods" :key="mood" class="mood">{{ mood }}心情</span><span v-for="tag in record.tags" :key="tag">#{{ tag }}</span></div>
        <p class="content">{{ record.content }}</p>
        <div class="place"><span class="material-symbols-outlined">location_on</span><span><small>记录地点</small><b>{{ record.location || '未记录地点' }}</b></span><button v-if="record.location" type="button" @click="$emit('map')">在地图中查看</button></div>
      </section>
      <section v-if="related.length" class="related"><div class="section-heading"><span>关联记录</span><i /></div><button v-for="item in related" :key="item.id" type="button" @click="$emit('open', item.id)"><img :src="item.images[0]" alt=""><span><b>{{ item.title }}</b><small>{{ item.date }} · {{ item.location }}</small></span><span class="material-symbols-outlined">chevron_right</span></button></section>
    </div>
    <footer><button class="edit" type="button" @click="$emit('edit', record.id)"><span class="material-symbols-outlined">edit</span>编辑</button><button type="button" @click="confirmDelete"><span class="material-symbols-outlined">delete</span>删除</button><span>ESC 关闭 · ← → 切换</span></footer>
  </aside>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { LoveRecord } from '../types/records'
import { formatDate } from '../utils/date'
const props = defineProps<{ record: LoveRecord; related: LoveRecord[] }>()
const emit = defineEmits<{ close: []; navigate: [direction: -1 | 1]; edit: [id: string]; delete: [id: string]; important: [id: string]; map: []; open: [id: string] }>()
const imageIndex = ref(0)
watch(() => props.record.id, () => { imageIndex.value = 0 })
function moveImage(direction: -1 | 1): void { imageIndex.value = (imageIndex.value + direction + props.record.images.length) % props.record.images.length }
function confirmDelete(): void { if (window.confirm(`确定删除「${props.record.title}」吗？删除后无法恢复。`)) emit('delete', props.record.id) }
</script>

<style scoped>
.detail-drawer{display:grid;grid-template-rows:52px minmax(0,1fr) 56px;height:100%;color:#4a393a;background:#fff;box-shadow:-18px 0 42px rgba(68,42,40,.13)}header{display:flex;align-items:center;gap:9px;padding:0 14px;border-bottom:1px solid #f1e7e2;font-size:11px;font-weight:700}button{font:inherit}header button{display:grid;place-items:center;width:30px;height:30px;border:0;border-radius:8px;color:#927f7e;background:#faf5f2;cursor:pointer}header>div{display:flex;gap:4px;margin-left:auto}header .material-symbols-outlined{font-size:17px}.drawer-scroll{min-height:0;overflow-y:auto}.gallery{position:relative;aspect-ratio:4/3;overflow:hidden;background:#eee5e1}.gallery>img{width:100%;height:100%;object-fit:cover}.gallery button{position:absolute;top:50%;display:grid;place-items:center;width:31px;height:31px;border:0;border-radius:50%;color:#fff;background:rgba(38,27,28,.46);cursor:pointer;transform:translateY(-50%)}.gallery-prev{left:10px}.gallery-next{right:10px}.gallery-count{position:absolute;right:11px;bottom:10px;padding:4px 8px;border-radius:999px;color:#fff;background:rgba(37,26,27,.55);font-size:9px}.thumbnails{display:flex;gap:6px;padding:9px 14px;border-bottom:1px solid #f2e8e3}.thumbnails button{width:46px;height:38px;padding:0;overflow:hidden;border:2px solid transparent;border-radius:6px;background:none;cursor:pointer}.thumbnails button.active{border-color:#ff7086}.thumbnails img{width:100%;height:100%;object-fit:cover}.detail-copy{padding:18px}.title-line{display:flex;align-items:center;justify-content:space-between;gap:12px}.title-line h2{margin:0;font-size:21px}.title-line button{display:grid;place-items:center;width:33px;height:33px;border:0;border-radius:50%;color:#c4afad;background:#faf3f0;cursor:pointer}.title-line button.active{color:#ff6079}.title-line button.active .material-symbols-outlined{font-variation-settings:'FILL' 1}.detail-copy>time{display:block;margin-top:5px;color:#ac9997;font-size:10px}.detail-tags{display:flex;flex-wrap:wrap;gap:6px;margin:14px 0}.detail-tags span{padding:5px 8px;border-radius:999px;color:#9f8987;background:#f8f2ef;font-size:9px}.detail-tags .mood{color:#df536a;background:#ffeded}.content{margin:0;color:#695657;font-size:12px;line-height:1.9;white-space:pre-wrap}.place{display:grid;grid-template-columns:32px 1fr auto;align-items:center;gap:8px;margin-top:18px;padding:12px;border-radius:10px;background:#fdf7f3}.place>.material-symbols-outlined{display:grid;place-items:center;width:32px;height:32px;border-radius:9px;color:#ff6b81;background:#ffe5e5;font-size:18px}.place span:nth-child(2){display:grid}.place small{color:#ad9a98;font-size:8px}.place b{margin-top:2px;font-size:10px}.place button{border:0;color:#ef5d75;background:transparent;font-size:9px;cursor:pointer}.related{padding:0 18px 18px}.section-heading{display:flex;align-items:center;gap:10px;margin-bottom:7px;color:#a18e8c;font-size:9px}.section-heading i{flex:1;height:1px;background:#f0e6e1}.related>button{display:grid;grid-template-columns:43px 1fr auto;align-items:center;gap:9px;width:100%;padding:7px 0;border:0;border-bottom:1px solid #f4ebe7;background:transparent;text-align:left;cursor:pointer}.related img{width:43px;height:36px;border-radius:7px;object-fit:cover}.related button>span:nth-child(2){display:grid}.related b{color:#655354;font-size:10px}.related small{margin-top:2px;color:#b09e9c;font-size:8px}.related button>.material-symbols-outlined{color:#c9b7b4;font-size:16px}footer{display:flex;align-items:center;gap:5px;padding:0 14px;border-top:1px solid #f0e5e0;background:#fff}footer button{display:flex;align-items:center;gap:4px;min-height:32px;padding:0 10px;border:1px solid #eadbd5;border-radius:8px;color:#927e7c;background:#fff;cursor:pointer;font-size:9px}footer button.edit{color:#fff;border-color:#ff6b81;background:#ff6b81}footer .material-symbols-outlined{font-size:15px}footer>span{margin-left:auto;color:#c1afac;font-size:7px}
</style>
