<template>
  <div class="diet-dashboard">
    <header class="diet-header">
      <div class="segment-buttons">
        <button v-for="seg in segments" :key="seg.key" :class="['seg-btn', {active: seg.key === activeSegment}]" @click="activeSegment = seg.key">
          {{ seg.label }}
        </button>
      </div>
      <div class="search-bar">
        <input type="text" v-model="search" placeholder="筛选记录..." />
      </div>
      <div class="action-btns">
        <button class="delete-btn">删除记录</button>
        <button class="add-btn">添加记录</button>
      </div>
    </header>
    <main class="diet-main">
      <section class="timeline-area">
        <DietTimeline :meals="filteredMeals" />
      </section>
      <section class="summary-area">
        <DietSummaryPanel :meals="filteredMeals" />
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import DietTimeline from './DietTimeline.vue'
import DietSummaryPanel from './DietSummaryPanel.vue'

const segments = [
  { key: 'today', label: '今日' },
  { key: 'week', label: '本周' },
  { key: 'month', label: '本月' },
  { key: 'year', label: '本年' },
]
const activeSegment = ref('today')
const search = ref('')

// 示例数据
const meals = ref([
  { id: 1, type: 'breakfast', time: '08:30', name: '全麦吐司配牛油果 & 溏心蛋', desc: '2片吐司, 1个中型牛油果', kcal: 420, protein: 18, carbs: 45, fat: 15, img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBNN3TRSKV2xVJGTEzlalIx2_PMf2zfqtxBJOAmOWK12LEuexeP1OySSFnv3tcD64jVajdcw-TXDE40RYPiH9nvQ3gt9vQvMTPfhyGJXEyX1egHym09FtLRcugpgLHFxntg9Kr2KFGWUgIAvQXI436_SWaLGyMg3vVYb_ZU2qEE6RXU8p_P2iyX1BND-7Vj5rrUmqtpS2xWC1zn5JQ68JVoWjh9U3hP0sUF83O8y8iXUc9AiXev_a2Va3CCX_eC0p-IXVpgm0zJ2w' },
  { id: 2, type: 'lunch', time: '12:15', name: '香煎三文鱼黎麦沙拉', desc: '150g三文鱼, 混合绿叶菜', kcal: 580, protein: 32, carbs: 50, fat: 20, img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBB68l_GljJISUE-9vFrOm9XagzUyB7HW6yte3UNjGNpqOBf2tZOO_NtwW9vMVZiFjz4NI8hkhf7p7BhoNkipsP4IKu3QxDzW-sfAFXyFfGLneigz-KhS0YzW0FOpZJoyQ0OoitHma4n362S0xkPWuFKKZFlj60KVPpA1cA9NWfMZ00zj_6hhkvaoQ-Lf6iAwh4st24VU1Q8aFSmx3IZNIWxP9Ro76O139BXQ5FvLIphbYKYt6rsh2wEbkRPFEUM6jQjZQldRkQsw' },
  { id: 3, type: 'snack', time: '15:45', name: '希腊酸奶配蓝莓', desc: '200g原味酸奶, 一把蓝莓', kcal: 150, protein: 8, carbs: 18, fat: 4, img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-NYvJ4shfg3rTsZiYhvcP5WbJaMS3zthpbPcl9MSgzFtwOcXpBHNELyYVkarDVbSj_gTdYJFEmhqNGN-DFfLZi3hWS6xC_c38c0yg29Voch4pp1IATJuTKqFMKcBXQMckJ0tanah3oVp029y17DE9SA9MPWx4isb_U6MAMMr1mLUoL3aYX9oQFF1uPul1210If7UTHrrFWDVCsEnDHnstGRJ_FJ_tq81PX_7ag_2QBqSP5FoAr2zgIcqzjyAluPIAuFq6WmigLA' },
  { id: 4, type: 'dinner', time: '19:20', name: '待记录...', desc: '点击开始记录你的晚餐', kcal: 0, protein: 0, carbs: 0, fat: 0, img: '' },
])

const filteredMeals = computed(() => {
  // 这里只做简单的搜索过滤，实际可按 segment 做日期过滤
  if (!search.value) return meals.value
  return meals.value.filter(m => m.name.includes(search.value) || m.desc.includes(search.value))
})
</script>

<style scoped>
.diet-dashboard {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8f9ff;
  height: calc(100vh - 64px);
}
.diet-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1rem 2rem 0.5rem 2rem;
  background: #fff;
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 10;
  flex-shrink: 0;
}
.segment-buttons {
  display: flex;
  gap: 0.5rem;
}
.seg-btn {
  padding: 0.5rem 1.2rem;
  border-radius: 8px;
  border: none;
  background: #f1f5f9;
  color: #006c49;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.seg-btn.active {
  background: #006c49;
  color: #fff;
}
.search-bar {
  flex: 1;
  display: flex;
  justify-content: center;
}
.search-bar input {
  width: 260px;
  padding: 0.5rem 1rem;
  border-radius: 999px;
  border: 1px solid #e2e8f0;
  background: #f8f9ff;
  font-size: 1rem;
}
.action-btns {
  display: flex;
  gap: 0.7rem;
}
.delete-btn, .add-btn {
  padding: 0.5rem 1.1rem;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
}
.delete-btn {
  background: #fff0f0;
  color: #ba1a1a;
  border: 1px solid #ffdada;
}
.add-btn {
  background: #006c49;
  color: #fff;
}
.diet-main {
  display: flex;
  gap: 2rem;
  padding: 2rem;
  overflow-y: auto;
  flex: 1;
}

/* Custom Scrollbar for Diet Main */
.diet-main::-webkit-scrollbar {
  width: 6px;
}

.diet-main::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.diet-main::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.diet-main::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.timeline-area {
  flex: 0 0 calc(66.67% - 150px);
  max-width: calc(66.67% - 150px);
}
.summary-area {
  flex: 0 0 calc(33.33% + 150px);
  max-width: calc(33.33% + 150px);
}
</style>
