<template>
  <article class="record-card" tabindex="0" @click="$emit('open', record.id)" @keydown.enter="$emit('open', record.id)">
    <div class="cover">
      <img v-if="record.images[0]" :src="record.images[0]" :alt="record.title">
      <span v-else class="empty-cover material-symbols-outlined">favorite</span>
      <button
        class="ai-analysis-button"
        type="button"
        :disabled="analysisInProgress"
        :title="analysisButtonLabel"
        :aria-label="analysisButtonLabel"
        @click.stop="$emit('analyze', record.id)"
        @keydown.enter.stop
      >
        <img :src="aiIconUrl" alt="">
      </button>
      <span v-if="record.important" class="important"><span class="material-symbols-outlined">favorite</span></span>
      <span v-if="record.images.length > 1" class="photo-count"><span class="material-symbols-outlined">photo_library</span>{{ record.images.length }}</span>
    </div>
    <div class="card-body">
      <div class="card-title"><h3>{{ record.title }}</h3><time>{{ formatDate(record.date) }}</time></div>
      <p>{{ record.content }}</p>
      <div class="card-meta">
        <div v-if="record.location" class="location"><span class="material-symbols-outlined">location_on</span><span>{{ record.location }}</span></div>
        <div class="tags"><span v-for="mood in record.moods.slice(0, 1)" :key="mood" class="mood">{{ moodEmoji[mood] }} {{ mood }}</span><span v-for="tag in record.tags.slice(0, 2)" :key="tag">#{{ tag }}</span></div>
      </div>
    </div>
  </article>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import type { LoveRecord, Mood } from '../types/records'
import { formatDate } from '../utils/date'
const props = defineProps<{ record: LoveRecord; analysisStatus?: string }>()
defineEmits<{ open: [id: string]; analyze: [id: string] }>()
const moodEmoji: Record<Mood, string> = { 心动: '♥', 开心: '😊', 治愈: '🌿', 感动: '🥹', 平静: '☁️', 爆笑: '😆' }
const aiIconUrl = new URL('../../../../icon/AI.png', import.meta.url).href
const analysisInProgress = computed(() => ['SUBMITTING', 'PENDING', 'QUEUED', 'RUNNING', 'RETRY_WAIT'].includes(String(props.analysisStatus ?? '').toUpperCase()))
const analysisButtonLabel = computed(() => analysisInProgress.value ? 'AI 正在分析这条记录' : 'AI 情感分析')
</script>
<style scoped>
.record-card{display:grid;grid-template-rows:auto 1fr;overflow:hidden;border:1px solid #f1e6e0;border-radius:12px;background:#fff;box-shadow:0 2px 12px rgba(66,43,40,.055);cursor:pointer;outline:0;transition:transform .2s ease,box-shadow .2s ease,border-color .2s}.record-card:hover,.record-card:focus-visible{transform:translateY(-4px);border-color:#ffd5d7;box-shadow:0 15px 32px rgba(89,53,52,.13)}.cover{position:relative;aspect-ratio:16/9;overflow:hidden;background:#f2e9e4}.cover>img{width:100%;height:100%;object-fit:cover;transition:transform .35s}.record-card:hover .cover>img{transform:scale(1.035)}.ai-analysis-button{position:absolute;z-index:1;top:9px;right:9px;display:grid;width:32px;height:32px;place-items:center;padding:0;border:1px solid rgba(255,255,255,.68);border-radius:50%;background:rgba(255,255,255,.88);box-shadow:0 4px 12px rgba(45,31,32,.2);cursor:pointer;backdrop-filter:blur(7px);transition:transform .18s ease,opacity .18s ease,box-shadow .18s ease}.ai-analysis-button:hover:not(:disabled){transform:scale(1.08);box-shadow:0 6px 16px rgba(45,31,32,.28)}.ai-analysis-button:disabled{cursor:wait;opacity:.62}.ai-analysis-button img{width:20px;height:20px;object-fit:contain}.important,.photo-count{position:absolute;display:flex;align-items:center;border-radius:999px;color:#fff;background:rgba(45,31,32,.6);backdrop-filter:blur(7px)}.important{top:10px;left:10px;padding:6px}.important .material-symbols-outlined{color:#ff8392;font-size:16px;font-variation-settings:'FILL' 1}.photo-count{right:10px;bottom:9px;gap:4px;padding:5px 8px;font-size:10px}.photo-count .material-symbols-outlined{font-size:14px}.card-body{display:flex;flex-direction:column;padding:16px 16px 17px}.card-title{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.card-title h3{margin:0;color:#443536;font-size:17px;line-height:1.35}.card-title time{flex:0 0 auto;padding-top:3px;color:#a99491;font-size:11px}.card-body p{display:-webkit-box;flex:1;margin:12px 0 13px;overflow:hidden;color:#796666;font-size:12px;line-height:1.7;-webkit-box-orient:vertical;-webkit-line-clamp:2}.card-meta{display:flex;align-items:flex-end;justify-content:space-between;gap:8px;min-width:0}.location{display:flex;align-items:center;min-width:0;gap:4px;color:#9f8a88;font-size:11px}.location>span:last-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.location .material-symbols-outlined{flex:0 0 auto;color:#ff7d8e;font-size:15px}.tags{display:flex;flex:0 1 auto;flex-wrap:wrap;justify-content:flex-end;gap:5px}.tags span{padding:4px 7px;border-radius:999px;color:#917d7b;background:#faf4f1;font-size:10px;line-height:1.25;white-space:nowrap}.tags .mood{color:#e25870;background:#fff0f0;font-weight:600}
.empty-cover{display:grid;place-items:center;width:100%;height:100%;color:#e3aaa9;font-size:38px;font-variation-settings:'FILL' 1}
</style>
