<template>
  <div class="diet-dashboard">
    <section class="hero-card">
      <div class="hero-copy">
        <h1 class="page-title">饮食记录</h1>
      </div>
    </section>

    <header class="diet-header">
      <div class="segment-buttons">
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

      <div class="action-btns">
        <button class="secondary-btn" type="button">导出记录</button>
        <button class="primary-btn" type="button">添加记录</button>
      </div>
    </header>

    <main class="diet-main">
      <section class="timeline-area">
        <div class="section-heading">
          <div>
            <p class="section-kicker">Timeline</p>
            <h2>今日餐食轨迹</h2>
          </div>
          <span class="section-note">从清晨到夜晚，按时间查看饮食节奏</span>
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
  { key: 'today', label: '今日' },
  { key: 'week', label: '本周' },
  { key: 'month', label: '本月' },
  { key: 'habit', label: '习惯' },
]

const activeSegment = ref('today')
const search = ref('')

const meals = ref([
  {
    id: 1,
    type: 'breakfast',
    period: '早餐',
    time: '08:30',
    name: '牛油果吐司与温泉蛋',
    desc: '全麦吐司、牛油果泥、水波蛋与少量黑胡椒，清爽但有满足感。',
    comment: '状态很稳，上午不容易饿。',
    kcal: 420,
    protein: 18,
    carbs: 45,
    fat: 15,
    mood: '轻盈开场',
    img: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 2,
    type: 'lunch',
    period: '午餐',
    time: '12:15',
    name: '香煎三文鱼藜麦能量碗',
    desc: '三文鱼、藜麦、羽衣甘蓝与南瓜，蛋白和纤维都很充足。',
    comment: '下午工作效率很好，饱腹感持续得久。',
    kcal: 580,
    protein: 32,
    carbs: 50,
    fat: 20,
    mood: '能量峰值',
    img: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 3,
    type: 'snack',
    period: '加餐',
    time: '15:45',
    name: '希腊酸奶配蓝莓',
    desc: '无糖酸奶加蓝莓和少量坚果，控制嘴馋也补一点蛋白。',
    comment: '甜度刚好，作为下午加餐很舒服。',
    kcal: 150,
    protein: 8,
    carbs: 18,
    fat: 4,
    mood: '平稳续航',
    img: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 4,
    type: 'dinner',
    period: '晚餐',
    time: '19:20',
    name: '香草鸡胸与烤时蔬',
    desc: '迷迭香鸡胸、烤胡萝卜、西兰花和土豆，热量控制得比较均衡。',
    comment: '今天晚餐收得很干净，没有额外宵夜。',
    kcal: 460,
    protein: 36,
    carbs: 34,
    fat: 14,
    mood: '温柔收尾',
    img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80',
  },
])

const filteredMeals = computed(() => {
  const keyword = search.value.trim().toLowerCase()
  if (!keyword) return meals.value

  return meals.value.filter((meal) =>
    [meal.period, meal.name, meal.desc, meal.comment, meal.mood]
      .join(' ')
      .toLowerCase()
      .includes(keyword),
  )
})

</script>

<style scoped>
.diet-dashboard {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  gap: clamp(16px, 2vw, 24px);
  padding: 1rem;
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

.hero-card {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  min-height: 56px;
  padding: 0 1.5rem;
  background: transparent;
  border: 0;
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
  font-size: 1.75rem;
  line-height: 1.2;
  letter-spacing: 0;
  color: #1d1b1a;
}

.diet-header {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  padding: 18px 20px;
  border-radius: 24px;
  background: rgba(255, 248, 246, 0.88);
  border: 1px solid #dcc1b9;
  box-shadow: 0 14px 30px rgba(50, 47, 46, 0.05);
  backdrop-filter: blur(10px);
}

.segment-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.seg-btn {
  min-width: 76px;
  padding: 11px 16px;
  border-radius: 999px;
  border: 1px solid transparent;
  background: #f3ecea;
  color: #56423d;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.seg-btn.active {
  background: #9a4024;
  color: #fff;
  box-shadow: 0 10px 18px rgba(154, 64, 36, 0.2);
}

.search-bar {
  flex: 1 1 260px;
  min-width: min(100%, 240px);
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 16px;
  height: 48px;
  border-radius: 999px;
  background: #f9f2f0;
  border: 1px solid #dcc1b9;
  color: #89726c;
}

.search-bar input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 15px;
  color: #1d1b1a;
}

.action-btns {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.primary-btn,
.secondary-btn {
  height: 48px;
  padding: 0 18px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}

.primary-btn {
  border: none;
  background: #9a4024;
  color: #fff;
}

.secondary-btn {
  border: 1px solid #b9cdaa;
  background: #d4e9c5;
  color: #3a4c31;
}

.diet-main {
  display: grid;
  grid-template-columns: minmax(0, 1.65fr) minmax(300px, 0.95fr);
  gap: 24px;
  min-height: 0;
}

.section-heading {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: end;
  margin-bottom: 20px;
}

.section-heading h2 {
  margin: 0;
  font-family: 'Playfair Display', 'Times New Roman', serif;
  font-size: clamp(24px, 2.2vw, 32px);
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
}

@media (max-width: 1280px) {
  .diet-main {
    grid-template-columns: minmax(0, 1.35fr) minmax(280px, 0.9fr);
  }
}

@media (max-width: 1100px) {
  .hero-card,
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

  .hero-card {
    padding: 24px 20px;
    border-radius: 24px;
  }

  .hero-meta {
    grid-template-columns: 1fr;
  }

  .segment-buttons,
  .action-btns {
    width: 100%;
  }

  .seg-btn,
  .primary-btn,
  .secondary-btn {
    flex: 1 1 auto;
  }
}
</style>
