<template>
  <section class="category-insight" aria-label="分类消费洞察">
    <header>
      <div><span>分类洞察</span><strong>{{ headline }}</strong></div>
      <span class="concentration">TOP 3 · {{ concentration }}%</span>
    </header>
    <div class="insight-bars">
      <div v-for="item in topCategories" :key="item.name" class="insight-row">
        <span>{{ item.name }}</span>
        <i><b :style="{ width: `${percentage(item.value)}%`, background: item.itemStyle?.color }"></b></i>
        <strong>{{ percentage(item.value).toFixed(0) }}%</strong>
      </div>
    </div>
    <p>{{ suggestion }}</p>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: { type: Array, default: () => [] },
  total: { type: Number, default: 0 },
})

// 补充环形图难以表达的排名、集中度和一句话分类洞察。
const topCategories = computed(() => props.data.slice(0, 3))
const concentration = computed(() => props.total
  ? Math.round(topCategories.value.reduce((sum, item) => sum + item.value, 0) / props.total * 100)
  : 0)
const headline = computed(() => props.data[0]
  ? `${props.data[0].name}是本期消费主角`
  : '等待第一笔消费记录')
const suggestion = computed(() => {
  if (!props.data.length) return '记录支出后，这里会自动生成分类洞察。'
  if (concentration.value >= 80) return '支出较集中，可以重点关注头部分类的预算变化。'
  if (props.data.length >= 4) return '支出分布较均衡，生活投入呈现多样化。'
  return '分类结构清晰，继续保持有意识的消费记录。'
})

function percentage(value) {
  return props.total ? value / props.total * 100 : 0
}
</script>

<style scoped>
.category-insight{height:190px;margin-top:auto;padding:14px;border:1px solid #eee5e0;border-radius:14px;background:linear-gradient(145deg,#fffaf7,#fff)}
header{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}header div>span,header div>strong{display:block}header div>span{color:#96776e;font-size:9px;font-weight:900;letter-spacing:.08em}header div>strong{margin-top:3px;font-size:12px}.concentration{padding:4px 8px;border-radius:99px;color:#b55c48;background:#ffede7;font-size:8px;font-weight:900}.insight-bars{display:grid;gap:6px;margin:11px 0}.insight-row{display:grid;grid-template-columns:48px 1fr 30px;align-items:center;gap:8px;font-size:9px}.insight-row>span{color:#625853}.insight-row>i{height:5px;overflow:hidden;border-radius:99px;background:#eee8e5}.insight-row>i b{display:block;height:100%;border-radius:inherit}.insight-row>strong{text-align:right;font-size:9px}p{margin:0;color:#817671;font-size:9px;line-height:1.5}
header div>span{font-size:11px}header div>strong{font-size:14px}.concentration{font-size:10px}.insight-row{font-size:11px}.insight-row>strong{font-size:11px}p{font-size:11px}
</style>
