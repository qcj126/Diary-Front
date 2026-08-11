<template>
  <section class="review-view"><header><div><p>YEAR IN LOVE</p><h1>{{ selectedYear }} 年度回顾</h1></div><select v-model.number="selectedYear"><option v-for="year in years" :key="year" :value="year">{{ year }} 年</option></select></header><div class="stat-grid"><article><span class="material-symbols-outlined">favorite</span><strong>{{ yearRecords.length }}</strong><small>总记录数</small></article><article><span class="material-symbols-outlined">location_on</span><strong>{{ yearLocations.length }}</strong><small>去过的地点</small></article><article><span class="material-symbols-outlined">photo_library</span><strong>{{ yearPhotos }}</strong><small>留下的照片</small></article><article><span class="material-symbols-outlined">flight_takeoff</span><strong>{{ yearTrips }}</strong><small>一起的旅行</small></article></div><div class="review-grid"><article class="chart-card"><div class="card-heading"><div><p>MONTHLY TREND</p><h2>月度记录趋势</h2></div><span>共 {{ yearRecords.length }} 条</span></div><div v-if="chartLoading" class="chart-loading">正在生成趋势图…</div><div ref="chartElement" class="chart" /></article><article class="keyword-card"><div class="card-heading"><div><p>KEYWORDS</p><h2>年度关键词</h2></div></div><div class="tag-cloud"><span v-for="(item, index) in keywords" :key="item.tag" :style="{ fontSize: `${10 + Math.min(item.count * 2, 15)}px`, '--index': index }">#{{ item.tag }}<small>{{ item.count }}</small></span></div></article><article class="places-card"><div class="card-heading"><div><p>TOP PLACES</p><h2>最常去的地方</h2></div></div><ol><li v-for="(place, index) in topPlaces" :key="place.name"><span>{{ index + 1 }}</span><div><b>{{ place.name }}</b><small>最近 {{ place.latest }}</small></div><strong>{{ place.count }} 次</strong></li></ol></article><article v-if="bestRecord" class="best-card" @click="$emit('open', bestRecord.id)"><img :src="bestRecord.images[0]" :alt="bestRecord.title"><div class="best-overlay"><p>♥ 本年高光记录</p><h2>{{ bestRecord.title }}</h2><span>{{ bestRecord.date }} · {{ bestRecord.location }}</span></div></article></div></section>
</template>
<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { EChartsType } from 'echarts/core'
import type { LoveRecord } from '../types/records'
const props = defineProps<{ records: LoveRecord[]; locations: Array<{ name: string; count: number; latest: string }> }>()
defineEmits<{ open: [id: string] }>()
const years = computed(() => [...new Set(props.records.map((item) => Number(item.date.slice(0, 4))))].sort((a, b) => b - a))
const selectedYear = ref(years.value[0] ?? new Date().getFullYear())
const yearRecords = computed(() => props.records.filter((item) => item.date.startsWith(String(selectedYear.value))))
const yearLocations = computed(() => [...new Set(yearRecords.value.map((item) => item.location).filter(Boolean))])
const yearPhotos = computed(() => yearRecords.value.reduce((sum, item) => sum + item.images.length, 0))
const yearTrips = computed(() => yearRecords.value.filter((item) => item.category === '旅行').length)
const keywords = computed(() => { const counts = new Map<string, number>(); yearRecords.value.flatMap((item) => item.tags).forEach((tag) => counts.set(tag, (counts.get(tag) ?? 0) + 1)); return [...counts].map(([tag, count]) => ({ tag, count })).sort((a, b) => b.count - a.count).slice(0, 12) })
const topPlaces = computed(() => { const map = new Map<string, { name: string; count: number; latest: string }>(); yearRecords.value.forEach((item) => { const current = map.get(item.location); if (current) { current.count += 1; if (item.date > current.latest) current.latest = item.date } else if (item.location) map.set(item.location, { name: item.location, count: 1, latest: item.date }) }); return [...map.values()].sort((a, b) => b.count - a.count).slice(0, 3) })
const bestRecord = computed(() => [...yearRecords.value].sort((a, b) => (b.tags.length + b.moods.length + Number(b.important)) - (a.tags.length + a.moods.length + Number(a.important)))[0] ?? null)
const chartElement = ref<HTMLElement | null>(null)
const chartLoading = ref(true)
let chart: EChartsType | null = null

async function renderChart(): Promise<void> {
  chartLoading.value = true
  // ECharts 仅在用户进入年度回顾时动态加载，并只注册柱状图所需模块，避免阻塞时间线首屏。
  const [{ use, init }, { BarChart }, { GridComponent, TooltipComponent }, { CanvasRenderer }] = await Promise.all([
    import('echarts/core'), import('echarts/charts'), import('echarts/components'), import('echarts/renderers'),
  ])
  use([BarChart, GridComponent, TooltipComponent, CanvasRenderer])
  await nextTick()
  if (!chartElement.value) return
  chart ??= init(chartElement.value)
  const values = Array.from({ length: 12 }, (_, index) => yearRecords.value.filter((item) => Number(item.date.slice(5, 7)) === index + 1).length)
  chart.setOption({ animationDuration: 650, grid: { left: 32, right: 12, top: 18, bottom: 26 }, tooltip: { trigger: 'axis' }, xAxis: { type: 'category', data: values.map((_, i) => `${i + 1}月`), axisLine: { lineStyle: { color: '#eaded8' } }, axisTick: { show: false }, axisLabel: { color: '#a18f8c', fontSize: 10 } }, yAxis: { type: 'value', minInterval: 1, splitLine: { lineStyle: { color: '#f3ebe7' } }, axisLabel: { color: '#b3a19e', fontSize: 10 } }, series: [{ type: 'bar', data: values, barWidth: 16, itemStyle: { color: '#ff7a8d', borderRadius: [5, 5, 0, 0] } }] })
  chartLoading.value = false
}
function resizeChart(): void { chart?.resize() }
watch(selectedYear, () => { void renderChart() })
onMounted(() => { void renderChart(); window.addEventListener('resize', resizeChart) })
onBeforeUnmount(() => { window.removeEventListener('resize', resizeChart); chart?.dispose() })
</script>
<style scoped>
.review-view{padding:26px 28px 40px}.review-view>header{display:flex;align-items:flex-end;justify-content:space-between}.review-view header p,.card-heading p{margin:0 0 3px;color:#ff657d;font-size:8px;font-weight:800;letter-spacing:.15em}.review-view h1{margin:0;color:#4b393a;font-size:19px}.review-view>header select{padding:7px 26px 7px 9px;border:1px solid #eaded8;border-radius:8px;color:#665354;background:#fff;font:9px inherit}.stat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:18px}.stat-grid article{position:relative;display:grid;padding:15px;border:1px solid #f0e4df;border-radius:12px;background:#fff;box-shadow:0 4px 16px rgba(58,39,38,.05)}.stat-grid .material-symbols-outlined{position:absolute;right:13px;top:13px;color:#ff94a1;font-size:19px}.stat-grid strong{color:#4d3b3c;font:800 24px Manrope,sans-serif}.stat-grid small{margin-top:1px;color:#a99390;font-size:8px}.review-grid{display:grid;grid-template-columns:1.4fr .8fr;gap:12px;margin-top:12px}.chart-card,.keyword-card,.places-card,.best-card{overflow:hidden;border:1px solid #f0e4df;border-radius:12px;background:#fff;box-shadow:0 4px 16px rgba(58,39,38,.05)}.chart-card,.keyword-card,.places-card{padding:15px}.card-heading{display:flex;align-items:flex-start;justify-content:space-between}.card-heading h2{margin:0;color:#594748;font-size:12px}.card-heading>span{color:#ad9b98;font-size:8px}.chart{height:205px}.chart-loading{display:grid;place-items:center;height:205px;color:#b19e9b;font-size:9px}.chart:not(:empty)+.chart-loading{display:none}.tag-cloud{display:flex;align-content:center;align-items:center;justify-content:center;flex-wrap:wrap;gap:10px;height:205px;padding:8px}.tag-cloud span{color:hsl(calc(345 + var(--index) * 9),55%,55%);font-weight:700}.tag-cloud small{margin-left:3px;vertical-align:super;font-size:6px;opacity:.6}.places-card ol{display:grid;gap:7px;margin:12px 0 0;padding:0;list-style:none}.places-card li{display:grid;grid-template-columns:28px 1fr auto;align-items:center;gap:8px;padding:8px;border-radius:9px;background:#fdf8f5}.places-card li>span{display:grid;place-items:center;width:25px;height:25px;border-radius:8px;color:#ff647c;background:#ffe8e8;font:800 9px Manrope,sans-serif}.places-card li div{display:grid}.places-card b{font-size:9px}.places-card small{color:#aa9794;font-size:7px}.places-card li>strong{color:#ef5f76;font-size:8px}.best-card{position:relative;min-height:175px;cursor:pointer}.best-card img{width:100%;height:100%;object-fit:cover;position:absolute}.best-overlay{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:flex-end;padding:17px;color:#fff;background:linear-gradient(transparent,rgba(45,28,30,.82))}.best-overlay p{margin:0;color:#ffbcc4;font-size:8px;font-weight:700}.best-overlay h2{margin:4px 0 2px;font-size:17px}.best-overlay span{font-size:8px;opacity:.75}
.review-view header p,.card-heading p{font-size:10px}.review-view>header select{font-size:11px}.stat-grid small{font-size:11px}.card-heading>span{font-size:10px}.chart-loading{font-size:11px}.places-card b{font-size:11px}.places-card small{font-size:9px}.places-card li>strong{font-size:10px}.best-overlay p,.best-overlay span{font-size:10px}
</style>
