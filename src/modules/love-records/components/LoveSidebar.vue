<template>
  <aside class="love-sidebar">
    <nav class="main-nav" aria-label="主导航">
      <button v-for="item in navItems" :key="item.key" type="button" :class="{ active: activeView === item.key }" @click="$emit('view', item.key)"><span class="material-symbols-outlined">{{ item.icon }}</span><span>{{ item.label }}</span></button>
    </nav>
    <section class="sidebar-section">
      <p class="section-label"><span>快速筛选</span><small>{{ filter === '全部' ? 'ALL' : filter }}</small></p>
      <div class="filter-list">
        <button v-for="item in filters" :key="item.label" type="button" :class="{ active: filter === item.label }" @click="$emit('filter', item.label)"><span>{{ item.emoji }}</span>{{ item.label }}<small>{{ countFor(item.label) }}</small></button>
      </div>
    </section>
    <section class="sidebar-section anniversaries">
      <p class="section-label"><span>置顶纪念日</span><small>UPCOMING</small></p>
      <button v-for="item in anniversaries.slice(0, 3)" :key="item.id" type="button" @click="$emit('settings')"><span class="pin-dot" /><span><b>{{ item.name }}</b><small>{{ item.daysLeft === 0 ? '就是今天' : `${item.daysLeft} 天后` }}</small></span></button>
    </section>
    <div class="sidebar-spacer" />
    <button class="new-record" type="button" @click="$emit('create')"><span class="material-symbols-outlined">add</span>新记录</button>
  </aside>
</template>

<script setup lang="ts">
import type { LoveRecord, RecordCategory, ViewKey } from '../types/records'

const props = defineProps<{
  activeView: ViewKey
  filter: '全部' | RecordCategory
  records: LoveRecord[]
  anniversaries: Array<{ id: string; name: string; daysLeft: number }>
}>()
defineEmits<{ view: [value: ViewKey]; filter: [value: '全部' | RecordCategory]; create: []; settings: [] }>()

const navItems: Array<{ key: ViewKey; label: string; icon: string }> = [
  { key: 'timeline', label: '时间线', icon: 'calendar_month' }, { key: 'album', label: '相册墙', icon: 'photo_library' },
  { key: 'map', label: '足迹地图', icon: 'map' }, { key: 'review', label: '年度回顾', icon: 'monitoring' }, { key: 'settings', label: '设置', icon: 'settings' },
]
const filters: Array<{ label: '全部' | RecordCategory; emoji: string }> = [
  { label: '全部', emoji: '♥' }, { label: '约会', emoji: '😍' }, { label: '日常', emoji: '☕' }, { label: '旅行', emoji: '✈' }, { label: '纪念日', emoji: '🎂' },
]
function countFor(value: '全部' | RecordCategory): number { return value === '全部' ? props.records.length : props.records.filter((item) => item.category === value || item.tags.includes(value)).length }
</script>

<style scoped>
.love-sidebar{grid-area:side;display:flex;flex-direction:column;width:240px;min-height:0;padding:18px 14px 14px;border-right:1px solid #f0e3dd;background:linear-gradient(180deg,rgba(255,247,244,.95),rgba(253,246,240,.9));overflow-y:auto}.main-nav{display:grid;gap:4px}.main-nav button,.filter-list button,.anniversaries button{display:flex;align-items:center;border:0;font:inherit;cursor:pointer}.main-nav button{gap:13px;min-height:44px;padding:0 14px;border-radius:10px;color:#796a69;background:transparent;font-size:15px;font-weight:650;transition:.2s}.main-nav button:hover{background:rgba(255,255,255,.8)}.main-nav button.active{color:#ff5d76;background:#fff;box-shadow:0 5px 18px rgba(103,72,68,.07)}.main-nav .material-symbols-outlined{font-size:22px}.sidebar-section{margin-top:20px;padding-top:17px;border-top:1px solid #efdfd8}.section-label{display:flex;justify-content:space-between;margin:0 10px 10px;color:#9f8b89;font-size:12px;font-weight:800;letter-spacing:.07em}.section-label small{font-size:9px}.filter-list{display:grid;gap:2px}.filter-list button{gap:10px;min-height:36px;padding:0 11px;border-radius:8px;color:#715f5e;background:transparent;font-size:13px;text-align:left}.filter-list button.active{color:#e9546d;background:#ffe9e8;font-weight:700}.filter-list button>span{width:21px;text-align:center;font-size:14px}.filter-list button small{margin-left:auto;color:#ad9996;font-size:11px}.anniversaries{display:grid;gap:3px}.anniversaries .section-label{margin-bottom:7px}.anniversaries button{gap:10px;padding:8px 10px;border-radius:9px;color:#665657;background:transparent;text-align:left}.anniversaries button:hover{background:rgba(255,255,255,.78)}.pin-dot{width:7px;height:7px;border-radius:50%;background:#ff6b81;box-shadow:0 0 0 4px rgba(255,107,129,.1)}.anniversaries button>span:last-child{display:grid}.anniversaries b{font-size:12px;line-height:1.35}.anniversaries small{margin-top:3px;color:#a7928f;font-size:10px}.sidebar-spacer{flex:1;min-height:14px}.new-record{position:sticky;bottom:0;display:flex;align-items:center;justify-content:center;gap:8px;min-height:46px;flex:0 0 46px;border:0;border-radius:12px;color:#fff;background:linear-gradient(135deg,#ff6b81,#ff847c);font:700 14px inherit;cursor:pointer;box-shadow:0 10px 24px rgba(255,107,129,.25);transition:.2s}.new-record:hover{transform:translateY(-2px);box-shadow:0 14px 28px rgba(255,107,129,.32)}.new-record .material-symbols-outlined{font-size:21px}
</style>
