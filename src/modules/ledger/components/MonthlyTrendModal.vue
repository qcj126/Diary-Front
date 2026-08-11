<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <section class="trend-modal">
      <header>
        <div><span>MONTHLY TREND</span><h2>本月累计支出</h2><p>每日累计金额随时间变化</p></div>
        <button type="button" aria-label="关闭" @click="$emit('close')"><span class="material-symbols-outlined">close</span></button>
      </header>
      <div ref="chartEl" class="monthly-chart" role="img" aria-label="本月累计支出折线图"></div>
    </section>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { echarts } from './echarts.js'

const props = defineProps({ data: { type: Array, default: () => [] } })
defineEmits(['close'])
const chartEl = ref(null)
let chart
let observer

// 模块五：本月每日累计支出折线，使用面积渐变强调累计趋势。
onMounted(() => {
  chart = echarts.init(chartEl.value)
  chart.setOption({
    tooltip: { trigger: 'axis', formatter: (items) => `${props.data[items[0].dataIndex]?.date}<br/>累计 ¥${Number(items[0].value).toFixed(2)}` },
    grid: { left: 55, right: 28, top: 40, bottom: 40 },
    xAxis: { type: 'category', boundaryGap: false, data: props.data.map((item) => item.label), axisLine: { lineStyle: { color: '#ddd5d1' } }, axisLabel: { color: '#756d69', fontSize: 12 } },
    yAxis: { type: 'value', splitLine: { lineStyle: { type: 'dashed', color: '#eee8e5' } }, axisLabel: { color: '#756d69', fontSize: 12 } },
    series: [{
      type: 'line', smooth: true, symbolSize: 7, data: props.data.map((item) => item.value),
      lineStyle: { width: 3, color: '#FF7B64' }, itemStyle: { color: '#FF7B64' },
      label: { show: true, position: 'top', color: '#756d69', fontSize: 11, formatter: ({ value }) => value ? Number(value).toFixed(0) : '' },
      areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(255,123,100,.38)' }, { offset: 1, color: 'rgba(255,123,100,.02)' }]) },
    }],
  })
  observer = new ResizeObserver(() => chart.resize())
  observer.observe(chartEl.value)
})
onBeforeUnmount(() => { observer?.disconnect(); chart?.dispose() })
</script>

<style scoped>
.modal-backdrop{position:fixed;inset:0;z-index:70;display:grid;place-items:center;padding:24px;background:rgba(28,27,27,.3);backdrop-filter:blur(8px)}
.trend-modal{width:min(920px,100%);padding:24px;border-radius:22px;background:#fff;box-shadow:0 24px 80px rgba(28,27,27,.25)}
header{display:flex;justify-content:space-between;align-items:flex-start}header span{color:#a16050;font-size:10px;font-weight:900;letter-spacing:.14em}h2{margin:3px 0;font-size:22px}p{margin:0;color:#7d7470;font-size:12px}button{display:grid;width:38px;height:38px;place-items:center;border:0;border-radius:10px;background:#f1edec;cursor:pointer}.monthly-chart{width:100%;height:430px;margin-top:16px}
@media(max-width:600px){.monthly-chart{height:340px}.trend-modal{padding:18px}}
</style>
