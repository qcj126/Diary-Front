<template>
  <div class="diet-dashboard">
    <section class="hero-card">
      <div class="hero-copy">
        <h1 class="page-title">饮食记录</h1>
      </div>
    </section>

    <section class="toolbar">
      <div class="actions">
        <button type="button" class="primary">
          <span class="material-symbols-outlined">add</span>
          增
        </button>
        <button type="button">
          <span class="material-symbols-outlined">delete</span>
          删
        </button>
        <button type="button">
          <span class="material-symbols-outlined">edit</span>
          改
        </button>
        <button type="button" @click="queryPanelOpen = !queryPanelOpen">
          <span class="material-symbols-outlined">search</span>
          查
        </button>
        <button type="button">
          <span class="material-symbols-outlined">ios_share</span>
          导出
        </button>
      </div>

      <form v-if="queryPanelOpen" class="query-panel" @submit.prevent>
        <div class="segment-buttons" aria-label="饮食记录时间范围">
          <button
            v-for="seg in segments"
            :key="seg.key"
            :class="['seg-btn', { active: seg.key === activeSegment }]"
            type="button"
            @click="activeSegment = seg.key"
          >
            {{ seg.label }}
          </button>
        </div>

        <label class="search-bar">
          <span class="material-symbols-outlined">search</span>
          <input v-model="search" type="text" placeholder="筛选餐次、菜名或备注" />
        </label>
        <button type="submit">查询</button>
        <button type="button" @click="resetQuery">重置</button>
      </form>
    </section>

    <main class="diet-main">
      <section class="timeline-area">
        <div class="section-heading">
          <div>
            <p class="section-kicker">Timeline</p>
            <h2>餐食轨迹</h2>
          </div>
          <span class="section-note">按在家和在外分组查看记录点</span>
        </div>
        <DietTimeline :meals="filteredMeals" />
      </section>

      <section class="summary-area">
        <DietSummaryPanel :meals="filteredMeals" />
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import DietTimeline from './DietTimeline.vue'
import DietSummaryPanel from './DietSummaryPanel.vue'

const segments = [
  { key: 'all', label: '全部' },
  { key: 'today', label: '今日' },
  { key: 'week', label: '本周' },
  { key: 'month', label: '本月' },
  { key: 'habit', label: '习惯' },
]

const activeSegment = ref('all')
const search = ref('')
const queryPanelOpen = ref(false)

const meals = ref([
  {
    id: 1,
    type: 'breakfast',
    period: '早餐',
    time: '08:30',
    recordedAt: '2026-08-07 08:30:16',
    place: 'home',
    name: '牛油果吐司与温泉蛋',
    desc: '全麦吐司、牛油果泥、水波蛋与少量黑胡椒，清爽但有满足感。',
    kcal: 420,
    protein: 18,
    carbs: 45,
    fat: 15,
    sodium: 420,
    img: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 2,
    type: 'lunch',
    period: '午餐',
    time: '12:15',
    recordedAt: '2026-08-07 12:15:42',
    place: 'outside',
    name: '香煎三文鱼藜麦能量碗',
    desc: '三文鱼、藜麦、羽衣甘蓝与南瓜，蛋白和纤维都很充足。',
    kcal: 580,
    protein: 32,
    carbs: 50,
    fat: 20,
    sodium: 610,
    img: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 3,
    type: 'snack',
    period: '加餐',
    time: '15:45',
    recordedAt: '2026-08-07 15:45:08',
    place: 'home',
    name: '希腊酸奶配蓝莓',
    desc: '无糖酸奶加蓝莓和少量坚果，控制嘴馋也补一点蛋白。',
    kcal: 150,
    protein: 8,
    carbs: 18,
    fat: 4,
    sodium: 70,
    img: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 4,
    type: 'dinner',
    period: '晚餐',
    time: '19:20',
    recordedAt: '2026-08-07 19:20:33',
    place: 'outside',
    name: '香草鸡胸与烤时蔬',
    desc: '迷迭香鸡胸、烤胡萝卜、西兰花和土豆，热量控制得比较均衡。',
    kcal: 460,
    protein: 36,
    carbs: 34,
    fat: 14,
    sodium: 520,
    img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80',
  },
])

const filteredMeals = computed(() => {
  const keyword = search.value.trim().toLowerCase()
  if (!keyword) return meals.value

  return meals.value.filter((meal) =>
    [meal.period, meal.name, meal.desc]
      .join(' ')
      .toLowerCase()
      .includes(keyword),
  )
})

function resetQuery() {
  activeSegment.value = 'all'
  search.value = ''
}

</script>

<style scoped>
.diet-dashboard {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: hidden;
  padding: 12px;
  background:
    radial-gradient(circle at top left, rgba(212, 233, 197, 0.55), transparent 28%),
    radial-gradient(circle at top right, rgba(255, 219, 209, 0.65), transparent 32%),
    linear-gradient(180deg, #fff8f6 0%, #f9f2f0 100%);
  color: #1d1b1a;
}

.material-symbols-outlined {
  font-family: 'Material Symbols Outlined';
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  font-size: 20px;
  line-height: 1;
}

.diet-dashboard > .hero-card {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  height: 56px;
  min-height: 56px;
  margin: -12px -12px 4px;
  padding: 0 2.5rem;
  background-color: #fff8f6;
  border: 0;
  border-bottom: 1px solid rgba(220, 193, 185, 0.72);
  box-shadow: none;
}

.hero-copy {
  max-width: min(760px, 100%);
}

.eyebrow,
.section-kicker,
.meta-label {
  margin: 0 0 10px;
  font-size: 12px;
  line-height: 16px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #7e2c11;
  font-weight: 700;
}

.page-title {
  margin: 0;
  font-size: 1.5rem;
  line-height: 1.2;
  letter-spacing: 0;
  color: #1d1b1a;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  padding: 16px;
  border-radius: 18px;
  background: rgba(255, 248, 246, 0.88);
  border: 1px solid rgba(220, 193, 185, 0.72);
  box-shadow: 0 18px 40px rgba(50, 47, 46, 0.06);
  backdrop-filter: blur(16px);
}

.actions,
.query-panel {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

button {
  border: 0;
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
}

button:hover {
  transform: translateY(-1px);
}

.actions button,
.query-panel button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 38px;
  border-radius: 12px;
  padding: 0 14px;
  background: #f1edec;
  color: #444748;
  font-size: 14px;
  font-weight: 800;
  white-space: nowrap;
}

.actions .primary {
  background: #1c1b1b;
  color: #ffffff;
}

.query-panel {
  justify-content: flex-end;
  align-items: center;
  flex: 1 1 520px;
  margin-left: auto;
}

.segment-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.seg-btn {
  min-width: 64px;
  min-height: 38px;
  padding: 0 14px;
  border-radius: 12px;
  border: 1px solid transparent;
  background: #f3ecea;
  color: #56423d;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.seg-btn.active {
  background: #1c1b1b;
  color: #fff;
  box-shadow: 0 10px 18px rgba(28, 27, 27, 0.14);
}

.search-bar {
  flex: 0 0 226px;
  width: 226px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 16px;
  min-height: 38px;
  border-radius: 12px;
  background: #ffffff;
  border: 1px solid rgba(220, 193, 185, 0.72);
  color: #89726c;
}

.search-bar input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  font-size: 15px;
  color: #1d1b1a;
}

.diet-main {
  display: grid;
  grid-template-columns: minmax(0, 1.65fr) minmax(300px, 0.95fr);
  flex: 1 1 auto;
  gap: 16px;
  min-height: 0;
  overflow: hidden;
}

.section-heading {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: end;
  margin-bottom: 10px;
}

.section-heading h2 {
  margin: 0;
  font-family: 'Playfair Display', 'Times New Roman', serif;
  font-size: clamp(20px, 1.8vw, 26px);
  line-height: 1.1;
  color: #1d1b1a;
}

.section-note {
  color: #89726c;
  font-size: 14px;
}

.timeline-area,
.summary-area {
  min-width: 0;
  min-height: 0;
}

.timeline-area {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.summary-area {
  overflow: hidden;
}

@media (max-width: 1280px) {
  .diet-main {
    grid-template-columns: minmax(0, 1.35fr) minmax(280px, 0.9fr);
  }
}

@media (max-width: 1100px) {
  .section-heading {
    flex-direction: column;
    align-items: stretch;
  }

  .diet-main {
    grid-template-columns: 1fr;
  }

  .hero-meta {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .diet-dashboard {
    padding: 12px;
  }

  .diet-dashboard > .hero-card {
    margin: -12px -12px 1rem;
    padding: 0 1rem;
    border-radius: 0;
  }

  .hero-meta {
    grid-template-columns: 1fr;
  }

  .actions,
  .query-panel,
  .segment-buttons {
    width: 100%;
  }

  .query-panel {
    margin-left: 0;
  }

  .search-bar {
    flex: 1 1 100%;
    width: 100%;
  }

  .actions button,
  .query-panel button,
  .seg-btn {
    flex: 1 1 auto;
  }
}
</style>
