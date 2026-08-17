<template>
  <section class="timeline-view">
    <div v-if="groups.length" class="month-group-list">
      <section v-for="group in groups" :key="group.key" class="month-group">
        <header><div><span>{{ group.monthNumber }}</span><div><h2>{{ group.label }}</h2></div></div><span>共 {{ group.records.length }} 条</span></header>
        <div class="record-grid"><RecordCard v-for="record in group.records" :key="record.id" :record="record" @open="$emit('open', $event)" /></div>
      </section>
    </div>
    <div v-else class="empty"><span class="material-symbols-outlined">favorite</span><h2>这个分类还没有记录</h2><p>下一次心动，就从这里开始保存。</p><button type="button" @click="$emit('create')">写下第一条</button></div>
  </section>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import RecordCard from '../components/RecordCard.vue'
import type { LoveRecord } from '../types/records'
import { parseLocalDate } from '../utils/date'
const props = defineProps<{ records: LoveRecord[] }>()
defineEmits<{ open: [id: string]; create: [] }>()
const groups = computed(() => {
  const map = new Map<string, LoveRecord[]>()
  props.records.forEach((item) => {
    const date = parseLocalDate(item.date)
    const weekOfMonth = Math.ceil(date.getDate() / 7)
    const key = `${item.date.slice(0, 7)}-W${weekOfMonth}`
    map.set(key, [...(map.get(key) ?? []), item])
  })
  return [...map].map(([key, records]) => {
    const date = parseLocalDate(records[0].date)
    const weekOfMonth = Math.ceil(date.getDate() / 7)
    return {
      key,
      records,
      label: `${date.getFullYear()}年${date.getMonth() + 1}月第${weekOfMonth}周`,
      monthNumber: String(date.getMonth() + 1).padStart(2, '0'),
    }
  })
})
</script>
<style scoped>
.timeline-view{padding:24px 28px 40px}.month-group-list{display:grid;gap:30px}.month-group>header{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}.month-group>header>div{display:flex;align-items:center;gap:10px}.month-group>header>div>span{color:#ff6b81;font:800 27px/1 Manrope,sans-serif;letter-spacing:-.06em}.month-group h2{margin:0;color:#4b393a;font-size:14px}.month-group>header>span{padding:4px 8px;border-radius:999px;color:#a58f8c;background:#fff7f3;font-size:10px}.record-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px;animation:fade-in .32s ease both}.empty{display:grid;justify-items:center;padding:100px 20px;text-align:center}.empty>.material-symbols-outlined{font-size:40px;color:#ffc1c8}.empty h2{margin:15px 0 5px;color:#665253}.empty p{margin:0;color:#a99491;font-size:13px}.empty button{margin-top:16px;padding:9px 14px;border:0;border-radius:9px;color:#fff;background:#ff6b81;cursor:pointer;font-size:12px}@keyframes fade-in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
</style>
