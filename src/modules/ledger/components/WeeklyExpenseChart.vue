<template><div ref="chartEl" class="echart" role="img" aria-label="本周每日支出柱状图"></div></template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { echarts } from './echarts.js'

const props = defineProps({ data: { type: Array, default: () => [] }, average: { type: Number, default: 0 } })
const emit = defineEmits(['select-date'])
const chartEl = ref(null)
let chart
let observer

// 模块二：每日支出柱状图；超过日均两倍的柱子自动标红，并绘制日均参考线。
function render() {
  if (!chart) return
  chart.setOption({
    tooltip: { trigger: 'axis', formatter: (items) => `${items[0].name}<br/>支出 ¥${Number(items[0].value).toFixed(2)}` },
    grid: { left: 44, right: 64, top: 42, bottom: 34 },
    xAxis: { type: 'category', data: props.data.map((item) => item.label), axisTick: { show: false }, axisLine: { lineStyle: { color: '#ddd5d1' } }, axisLabel: { color: '#756d69', fontSize: 13 } },
    yAxis: { type: 'value', splitLine: { lineStyle: { type: 'dashed', color: '#eee8e5' } }, axisLabel: { color: '#918783', fontSize: 12, formatter: (value) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value } },
    series: [{
      type: 'bar', barMaxWidth: 38,
      data: props.data.map((item) => ({
        value: item.value,
        itemStyle: { color: item.value > props.average * 2 && props.average > 0 ? '#E74C3C' : '#FF8C69', borderRadius: [6, 6, 0, 0] },
      })),
      label: { show: true, position: 'top', color: '#5f5652', fontSize: 12, formatter: ({ value }) => value ? `¥${Number(value).toFixed(0)}` : '' },
      markLine: { silent: true, symbol: 'none', label: { show: true, position: 'insideEndTop', distance: 5, align: 'right', formatter: `日均 ¥${props.average.toFixed(2)}`, color: '#278f83', fontSize: 12, padding: [3, 5], backgroundColor: 'rgba(255,255,255,.88)', borderRadius: 4 }, lineStyle: { color: '#4ECDC4', type: 'dashed', width: 2 }, data: [{ yAxis: props.average }] },
    }],
  }, true)
}

onMounted(() => {
  chart = echarts.init(chartEl.value)
  chart.on('click', ({ dataIndex }) => emit('select-date', props.data[dataIndex]?.date))
  observer = new ResizeObserver(() => chart.resize())
  observer.observe(chartEl.value)
  render()
})
watch([() => props.data, () => props.average], render, { deep: true })
onBeforeUnmount(() => { observer?.disconnect(); chart?.dispose() })
</script>

<style scoped>.echart{width:100%;height:300px;}</style>
