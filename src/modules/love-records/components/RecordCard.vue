<template>
  <article class="record-card" tabindex="0" @click="$emit('open', record.id)" @keydown.enter="$emit('open', record.id)">
    <div class="cover"><img :src="record.images[0]" :alt="record.title"><span v-if="record.important" class="important"><span class="material-symbols-outlined">favorite</span></span><span v-if="record.images.length > 1" class="photo-count"><span class="material-symbols-outlined">photo_library</span>{{ record.images.length }}</span></div>
    <div class="card-body"><div class="card-title"><h3>{{ record.title }}</h3><time>{{ formatDate(record.date) }}</time></div><div class="tags"><span v-for="mood in record.moods" :key="mood" class="mood">{{ moodEmoji[mood] }} {{ mood }}</span><span v-for="tag in record.tags.slice(0, 2)" :key="tag">#{{ tag }}</span></div><p>{{ record.content }}</p><div v-if="record.location" class="location"><span class="material-symbols-outlined">location_on</span>{{ record.location }}</div></div>
  </article>
</template>
<script setup lang="ts">
import type { LoveRecord, Mood } from '../types/records'
import { formatDate } from '../utils/date'
defineProps<{ record: LoveRecord }>()
defineEmits<{ open: [id: string] }>()
const moodEmoji: Record<Mood, string> = { 心动: '♥', 开心: '😊', 治愈: '🌿', 感动: '🥹', 平静: '☁️', 爆笑: '😆' }
</script>
<style scoped>
.record-card{overflow:hidden;border:1px solid #f1e6e0;border-radius:12px;background:#fff;box-shadow:0 2px 12px rgba(66,43,40,.055);cursor:pointer;outline:0;transition:transform .2s ease,box-shadow .2s ease,border-color .2s}.record-card:hover,.record-card:focus-visible{transform:translateY(-4px);border-color:#ffd5d7;box-shadow:0 15px 32px rgba(89,53,52,.13)}.cover{position:relative;aspect-ratio:16/9;overflow:hidden;background:#f2e9e4}.cover img{width:100%;height:100%;object-fit:cover;transition:transform .35s}.record-card:hover img{transform:scale(1.035)}.important,.photo-count{position:absolute;display:flex;align-items:center;border-radius:999px;color:#fff;background:rgba(45,31,32,.6);backdrop-filter:blur(7px)}.important{top:10px;left:10px;padding:6px}.important .material-symbols-outlined{color:#ff8392;font-size:16px;font-variation-settings:'FILL' 1}.photo-count{right:10px;bottom:9px;gap:4px;padding:5px 8px;font-size:10px}.photo-count .material-symbols-outlined{font-size:14px}.card-body{padding:16px 16px 17px}.card-title{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.card-title h3{margin:0;color:#443536;font-size:17px;line-height:1.35}.card-title time{flex:0 0 auto;padding-top:3px;color:#a99491;font-size:11px}.tags{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}.tags span{padding:4px 8px;border-radius:999px;color:#917d7b;background:#faf4f1;font-size:10px;line-height:1.25}.tags .mood{color:#e25870;background:#fff0f0;font-weight:600}.card-body p{display:-webkit-box;margin:12px 0 13px;overflow:hidden;color:#796666;font-size:12px;line-height:1.7;-webkit-box-orient:vertical;-webkit-line-clamp:2}.location{display:flex;align-items:center;gap:4px;color:#9f8a88;font-size:11px}.location .material-symbols-outlined{color:#ff7d8e;font-size:15px}
</style>
