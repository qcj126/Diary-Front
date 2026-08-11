<template>
  <div class="donut-layout" aria-label="支出构成环形图">
    <div class="category-side left-side">
      <button v-for="item in leftCategories" :key="item.name" type="button" @click="emit('select-category', item.name)">
        <span class="color-dot" :style="{ background: item.itemStyle?.color }"></span>
        <span class="category-name">{{ item.name }}</span>
        <strong>{{ percentage(item.value) }}%</strong>
      </button>
    </div>
    <div ref="chartEl" class="echart" role="img" aria-label="支出构成甜甜圈"></div>
    <div class="category-side right-side">
      <button v-for="item in rightCategories" :key="item.name" type="button" @click="emit('select-category', item.name)">
        <span class="color-dot" :style="{ background: item.itemStyle?.color }"></span>
        <span class="category-name">{{ item.name }}</span>
        <strong>{{ percentage(item.value) }}%</strong>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { echarts } from './echarts.js'

const props = defineProps({ data: { type: Array, default: () => [] } })
const emit = defineEmits(['select-category'])
const chartEl = ref(null)
let chart
let observer
const total = computed(() => props.data.reduce((sum, item) => sum + Number(item.value), 0))
const leftCategories = computed(() => props.data.slice(0, 5))
const rightCategories = computed(() => props.data.slice(5, 9))

function percentage(value) {
  return total.value ? Math.round(Number(value) / total.value * 100) : 0
}

// 模块一：按一级分类展示支出占比，点击扇区向父组件触发下钻。
function render() {
  if (!chart) return
  chart.setOption({
    tooltip: { trigger: 'item', formatter: ({ name, value, percent }) => `${name}<br/>¥${Number(value).toFixed(2)} · ${percent}%` },
    series: [{
      type: 'pie', radius: ['48%', '76%'], center: ['50%', '50%'], minAngle: 3,
      avoidLabelOverlap: true, itemStyle: { borderColor: '#fff', borderWidth: 3, borderRadius: 5 },
      label: { show: false },
      labelLine: { show: false },
      data: props.data,
    }],
  }, true)
}

onMounted(() => {
  chart = echarts.init(chartEl.value)
  chart.on('click', ({ name }) => emit('select-category', name))
  observer = new ResizeObserver(() => chart.resize())
  observer.observe(chartEl.value)
  render()
})
watch(() => props.data, render, { deep: true })
onBeforeUnmount(() => { observer?.disconnect(); chart?.dispose() })
</script>

<style scoped>
.donut-layout{display:grid;width:100%;height:310px;grid-template-columns:minmax(86px,1fr) minmax(150px,1.45fr) minmax(86px,1fr);align-items:center;gap:8px}.echart{width:100%;height:100%;min-height:240px}.category-side{display:flex;height:78%;flex-direction:column;justify-content:space-around;gap:5px}.category-side button{display:grid;grid-template-columns:8px minmax(0,1fr) auto;align-items:center;gap:6px;width:100%;padding:5px 2px;border:0;color:#554c48;background:transparent;cursor:pointer;font:700 11px Inter,sans-serif;text-align:left}.category-side button:hover .category-name{color:#d45f49}.color-dot{width:8px;height:8px;border-radius:99px}.category-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.category-side strong{font-size:10px;text-align:right}.left-side,.right-side{text-align:left}
@media(max-width:520px){.donut-layout{grid-template-columns:minmax(72px,1fr) minmax(130px,1.35fr) minmax(72px,1fr);gap:3px}.category-side button{font-size:10px}.category-side strong{font-size:9px}}
</style>
