<template>
  <section class="rhythm-panel" aria-label="每周消费节奏">
    <header><div><span>消费节奏</span><strong>{{ rhythmTitle }}</strong></div><span class="status">{{ statusLabel }}</span></header>
    <div class="rhythm-stats">
      <article><span>活跃消费</span><strong>{{ activeDays }}<small>/7 天</small></strong></article>
      <article><span>峰值日</span><strong>{{ peakDay?.label || '—' }}<small> ¥{{ money(peakDay?.value) }}</small></strong></article>
      <article><span>周末占比</span><strong>{{ weekendShare.toFixed(0) }}%</strong></article>
    </div>
    <div class="rhythm-meter"><span>节奏稳定性</span><i><b :style="{ width: `${stability}%` }"></b></i><strong>{{ stability }}%</strong></div>
    <p>{{ rhythmSuggestion }}</p>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({ data: { type: Array, default: () => [] }, average: { type: Number, default: 0 } })

// 将柱状图进一步归纳为消费活跃度、峰值、周末倾向和稳定性。
const activeDays = computed(() => props.data.filter((item) => item.value > 0).length)
const peakDay = computed(() => props.data.reduce((peak, item) => !peak || item.value > peak.value ? item : peak, null))
const total = computed(() => props.data.reduce((sum, item) => sum + item.value, 0))
const weekendShare = computed(() => total.value ? props.data.slice(5).reduce((sum, item) => sum + item.value, 0) / total.value * 100 : 0)
const deviation = computed(() => props.data.reduce((sum, item) => sum + Math.abs(item.value - props.average), 0) / Math.max(props.data.length, 1))
const stability = computed(() => Math.round(Math.max(0, Math.min(100, 100 - deviation.value / Math.max(props.average, 1) * 35))))
const statusLabel = computed(() => stability.value >= 75 ? '平稳' : stability.value >= 45 ? '有波动' : '波动明显')
const rhythmTitle = computed(() => activeDays.value >= 5 ? '高频、轻量的日常节奏' : activeDays.value >= 3 ? '消费集中在少数日期' : '本周消费较为克制')
const rhythmSuggestion = computed(() => peakDay.value?.value > props.average * 2 && props.average > 0
  ? `${peakDay.value.label}明显高于日均，适合回看当天是否存在计划外支出。`
  : '每日支出接近日均水平，消费节奏处于可控状态。')

function money(value) { return Number(value || 0).toFixed(2) }
</script>

<style scoped>
.rhythm-panel{height:190px;margin-top:auto;padding:14px;border:1px solid #e5eee9;border-radius:14px;background:linear-gradient(145deg,#f7fffb,#fff)}header{display:flex;justify-content:space-between;gap:12px}header div>span,header div>strong{display:block}header div>span{color:#588873;font-size:9px;font-weight:900;letter-spacing:.08em}header div>strong{margin-top:3px;font-size:12px}.status{padding:4px 8px;border-radius:99px;color:#338564;background:#e4f4ec;font-size:8px;font-weight:900}.rhythm-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:11px 0}.rhythm-stats article{padding:8px;border-radius:9px;background:rgba(255,255,255,.85)}.rhythm-stats span,.rhythm-stats strong{display:block}.rhythm-stats span{color:#7a716d;font-size:8px}.rhythm-stats strong{margin-top:3px;font-size:12px}.rhythm-stats small{font-size:8px;font-weight:700}.rhythm-meter{display:grid;grid-template-columns:62px 1fr 30px;align-items:center;gap:8px;color:#6d6460;font-size:8px}.rhythm-meter i{height:5px;overflow:hidden;border-radius:99px;background:#e6ede9}.rhythm-meter i b{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,#7bc7a4,#4eaa83)}.rhythm-meter strong{text-align:right;font-size:9px}p{margin:9px 0 0;color:#817671;font-size:9px;line-height:1.5}
header div>span{font-size:11px}header div>strong{font-size:14px}.status{display:inline-flex;min-width:54px;min-height:24px;align-items:center;justify-content:center;align-self:flex-start;padding:0 9px;font-size:10px;line-height:1}.rhythm-stats span{font-size:10px}.rhythm-stats strong{font-size:14px}.rhythm-stats small{font-size:10px}.rhythm-meter{grid-template-columns:74px 1fr 34px;font-size:10px}.rhythm-meter strong{font-size:11px}p{font-size:11px}
</style>
