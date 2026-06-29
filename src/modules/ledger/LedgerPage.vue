<template>
  <div class="ledger-page">
    <section class="ledger-hero">
      <div class="hero-copy">
        <span class="eyebrow">生活账本</span>
        <h1>把每一笔烟火气，都放进可回看的秩序里</h1>
        <p>覆盖日常消费、固定账单、共同账户、储蓄目标与生活预算，适合两个人一起复盘本月的花钱节奏。</p>
      </div>
      <div class="hero-panel">
        <span>本月结余</span>
        <strong>{{ formatMoney(balance) }}</strong>
        <div class="hero-meter">
          <i :style="{ width: `${savingRate}%` }"></i>
        </div>
        <small>储蓄率 {{ savingRate }}% · 比上月多攒 {{ formatMoney(1260) }}</small>
      </div>
    </section>

    <section class="toolbar">
      <div class="segments">
        <button
          v-for="period in periods"
          :key="period.key"
          type="button"
          :class="{ active: activePeriod === period.key }"
          @click="activePeriod = period.key"
        >
          {{ period.label }}
        </button>
      </div>
      <label class="search-box">
        <span class="text-icon">搜</span>
        <input v-model="keyword" type="search" placeholder="搜索餐饮、房租、礼物、交通..." />
      </label>
    </section>

    <section class="metric-grid">
      <article v-for="metric in metrics" :key="metric.label" class="metric-card">
        <span class="metric-icon">{{ metric.icon }}</span>
        <div>
          <small>{{ metric.label }}</small>
          <strong>{{ metric.value }}</strong>
          <em>{{ metric.note }}</em>
        </div>
      </article>
    </section>

    <main class="ledger-layout">
      <section class="panel category-panel">
        <div class="section-heading">
          <div>
            <h2>生活分类预算</h2>
            <p>从吃住行到学习娱乐，观察哪些地方正在悄悄变贵。</p>
          </div>
          <span>{{ budgetUsage }}%</span>
        </div>

        <div class="category-list">
          <article v-for="item in categories" :key="item.name" class="category-row">
            <div class="category-top">
              <span class="category-icon">{{ item.icon }}</span>
              <div>
                <strong>{{ item.name }}</strong>
                <small>{{ item.note }}</small>
              </div>
              <b>{{ formatMoney(item.spent) }}</b>
            </div>
            <div class="progress-track">
              <i :class="{ warn: item.spent / item.budget > 0.88 }" :style="{ width: `${categoryPercent(item)}%` }"></i>
            </div>
            <div class="category-meta">
              <span>预算 {{ formatMoney(item.budget) }}</span>
              <span>剩余 {{ formatMoney(item.budget - item.spent) }}</span>
            </div>
          </article>
        </div>
      </section>

      <section class="panel flow-panel">
        <div class="section-heading compact">
          <div>
            <h2>最近流水</h2>
            <p>{{ filteredRecords.length }} 笔记录</p>
          </div>
          <button type="button" class="soft-btn">导出</button>
        </div>

        <div class="record-list">
          <article v-for="record in filteredRecords" :key="record.id" class="record-row">
            <span class="record-icon">{{ record.icon }}</span>
            <div class="record-main">
              <strong>{{ record.title }}</strong>
              <small>{{ record.date }} · {{ record.category }} · {{ record.owner }}</small>
            </div>
            <b :class="record.type">{{ record.type === 'income' ? '+' : '-' }}{{ formatMoney(record.amount) }}</b>
          </article>
        </div>
      </section>
    </main>

    <section class="bottom-grid">
      <article class="panel calendar-panel">
        <div class="section-heading compact">
          <div>
            <h2>固定账单</h2>
            <p>提前安排，不让自动扣款突然袭击钱包。</p>
          </div>
        </div>
        <div class="bill-list">
          <div v-for="bill in bills" :key="bill.name" class="bill-item">
            <span>{{ bill.day }}</span>
            <div>
              <strong>{{ bill.name }}</strong>
              <small>{{ bill.note }}</small>
            </div>
            <b>{{ formatMoney(bill.amount) }}</b>
          </div>
        </div>
      </article>

      <article class="panel account-panel">
        <div class="section-heading compact">
          <div>
            <h2>共同账户</h2>
            <p>生活费、旅行金、备用金分开放，心里更有底。</p>
          </div>
        </div>
        <div class="account-stack">
          <div v-for="account in accounts" :key="account.name" class="account-card">
            <div>
              <strong>{{ account.name }}</strong>
              <small>{{ account.note }}</small>
            </div>
            <span>{{ formatMoney(account.amount) }}</span>
          </div>
        </div>
      </article>

      <article class="panel goal-panel">
        <div class="section-heading compact">
          <div>
            <h2>储蓄目标</h2>
            <p>把想去的地方、想买的东西慢慢攒出来。</p>
          </div>
        </div>
        <div class="saving-goals">
          <div v-for="goal in savingGoals" :key="goal.name" class="saving-item">
            <div class="saving-title">
              <strong>{{ goal.name }}</strong>
              <span>{{ goalProgress(goal) }}%</span>
            </div>
            <div class="progress-track">
              <i :style="{ width: `${goalProgress(goal)}%` }"></i>
            </div>
            <small>{{ formatMoney(goal.saved) }} / {{ formatMoney(goal.target) }}</small>
          </div>
        </div>
      </article>
    </section>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const activePeriod = ref('month')
const keyword = ref('')

const periods = [
  { key: 'week', label: '本周' },
  { key: 'month', label: '本月' },
  { key: 'quarter', label: '本季' },
  { key: 'year', label: '全年' },
]

const categories = [
  { name: '餐饮食材', icon: '食', spent: 2860, budget: 3600, note: '外食、买菜、咖啡与零食' },
  { name: '住房水电', icon: '住', spent: 5120, budget: 5600, note: '房租、物业、水电燃气' },
  { name: '交通通勤', icon: '行', spent: 760, budget: 1000, note: '地铁、打车、停车与油费' },
  { name: '健康护理', icon: '康', spent: 1180, budget: 1600, note: '体检、药品、运动与护理' },
  { name: '学习成长', icon: '学', spent: 940, budget: 1500, note: '课程、书籍、工具订阅' },
  { name: '娱乐旅行', icon: '游', spent: 2210, budget: 2600, note: '电影、短途游、约会体验' },
  { name: '人情礼物', icon: '礼', spent: 680, budget: 1200, note: '节日礼物、聚会红包' },
  { name: '宠物家居', icon: '家', spent: 520, budget: 900, note: '家居清洁、小物件添置' },
]

const records = [
  { id: 1, title: '周末火锅与饮料', category: '餐饮食材', owner: '共同', amount: 286, type: 'expense', date: '06-28', icon: '餐' },
  { id: 2, title: '6 月工资入账', category: '工资收入', owner: '小加', amount: 13800, type: 'income', date: '06-27', icon: '收' },
  { id: 3, title: '房租与物业', category: '住房水电', owner: '共同', amount: 4200, type: 'expense', date: '06-25', icon: '房' },
  { id: 4, title: '后端安全课程订阅', category: '学习成长', owner: '小加', amount: 399, type: 'expense', date: '06-22', icon: '课' },
  { id: 5, title: '体检复查', category: '健康护理', owner: '小媛', amount: 560, type: 'expense', date: '06-20', icon: '医' },
  { id: 6, title: '端午短途车票', category: '娱乐旅行', owner: '共同', amount: 612, type: 'expense', date: '06-18', icon: '票' },
  { id: 7, title: '父亲节礼物', category: '人情礼物', owner: '共同', amount: 468, type: 'expense', date: '06-15', icon: '礼' },
]

const bills = [
  { day: '01', name: '房租', note: '自动转账至房东账户', amount: 4200 },
  { day: '08', name: '水电燃气', note: '按月合并缴费', amount: 420 },
  { day: '12', name: '影音会员', note: '家庭共享订阅', amount: 58 },
  { day: '20', name: '保险', note: '健康险与意外险', amount: 680 },
]

const accounts = [
  { name: '生活费账户', note: '餐饮、日用品、交通', amount: 6840 },
  { name: '旅行基金', note: '秋天去海边', amount: 12600 },
  { name: '备用金', note: '至少覆盖 3 个月支出', amount: 38600 },
]

const savingGoals = [
  { name: '厦门旅行', saved: 5600, target: 9000 },
  { name: '新相机', saved: 4200, target: 12800 },
  { name: '年度体检基金', saved: 1800, target: 3000 },
]

const totalIncome = computed(() => records.filter((item) => item.type === 'income').reduce((sum, item) => sum + item.amount, 0))
const totalExpense = computed(() => categories.reduce((sum, item) => sum + item.spent, 0))
const totalBudget = computed(() => categories.reduce((sum, item) => sum + item.budget, 0))
const balance = computed(() => totalIncome.value - totalExpense.value)
const savingRate = computed(() => Math.max(Math.round((balance.value / totalIncome.value) * 100), 0))
const budgetUsage = computed(() => Math.round((totalExpense.value / totalBudget.value) * 100))

const metrics = computed(() => [
  { label: '本月收入', value: formatMoney(totalIncome.value), note: '工资与副业收入', icon: '入' },
  { label: '本月支出', value: formatMoney(totalExpense.value), note: `预算使用 ${budgetUsage.value}%`, icon: '出' },
  { label: '日均消费', value: formatMoney(Math.round(totalExpense.value / 30)), note: '较上月下降 8%', icon: '日' },
  { label: '待缴账单', value: formatMoney(1358), note: '未来 14 天 3 项', icon: '账' },
])

const filteredRecords = computed(() => {
  const text = keyword.value.trim().toLowerCase()
  if (!text) return records
  return records.filter((record) => [record.title, record.category, record.owner].join(' ').toLowerCase().includes(text))
})

function categoryPercent(item) {
  return Math.min(Math.round((item.spent / item.budget) * 100), 100)
}

function goalProgress(goal) {
  return Math.min(Math.round((goal.saved / goal.target) * 100), 100)
}

function formatMoney(value) {
  return `¥${Number(value).toLocaleString('zh-CN')}`
}
</script>

<style scoped>
.ledger-page {
  min-height: 100vh;
  padding: 28px;
  color: #3d2f35;
  background:
    radial-gradient(circle at 16% 8%, rgba(255, 214, 224, 0.7), transparent 28%),
    linear-gradient(135deg, #fff7f8 0%, #f8fbff 54%, #fffaf2 100%);
}

.ledger-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 20px;
  align-items: stretch;
  margin-bottom: 18px;
}

.hero-copy,
.hero-panel,
.panel,
.metric-card,
.toolbar {
  border: 1px solid rgba(255, 149, 170, 0.2);
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 18px 44px rgba(202, 111, 134, 0.12);
  backdrop-filter: blur(18px);
}

.hero-copy {
  min-height: 220px;
  padding: 34px;
  border-radius: 24px;
}

.eyebrow {
  display: inline-flex;
  padding: 6px 12px;
  border-radius: 999px;
  color: #b84d6b;
  background: #ffe7ee;
  font-size: 13px;
  font-weight: 700;
}

.hero-copy h1 {
  max-width: 760px;
  margin: 18px 0 12px;
  font-size: 36px;
  line-height: 1.18;
  letter-spacing: 0;
}

.hero-copy p {
  max-width: 660px;
  margin: 0;
  color: #7b6870;
  line-height: 1.8;
}

.hero-panel {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 28px;
  border-radius: 24px;
}

.hero-panel span,
.metric-card small,
.category-meta,
.record-row small,
.bill-item small,
.account-card small,
.saving-item small,
.section-heading p {
  color: #8c7880;
}

.hero-panel strong {
  margin: 10px 0;
  color: #c94f6d;
  font-size: 42px;
}

.hero-meter,
.progress-track {
  height: 9px;
  overflow: hidden;
  border-radius: 999px;
  background: #f2e6ea;
}

.hero-meter i,
.progress-track i {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #ff7b9a, #ffc15f);
}

.toolbar {
  display: flex;
  gap: 14px;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
  padding: 12px;
  border-radius: 18px;
}

.segments {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

button {
  border: 0;
  cursor: pointer;
  font: inherit;
}

.segments button,
.soft-btn {
  min-height: 38px;
  padding: 0 16px;
  border-radius: 999px;
  color: #7c5f69;
  background: #fff2f5;
  font-weight: 700;
}

.segments button.active,
.soft-btn {
  color: #fff;
  background: linear-gradient(135deg, #f36f90, #ffac64);
}

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  width: min(360px, 100%);
  padding: 0 14px;
  border-radius: 999px;
  background: #fff;
}

.search-box input {
  width: 100%;
  height: 42px;
  border: 0;
  outline: 0;
  color: #4e3d43;
  background: transparent;
}

.text-icon {
  display: inline-grid;
  place-items: center;
  width: 24px;
  height: 24px;
  color: #d45775;
  font-size: 14px;
  font-weight: 800;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 18px;
}

.metric-card {
  display: flex;
  gap: 14px;
  align-items: center;
  padding: 18px;
  border-radius: 20px;
}

.metric-icon,
.category-icon,
.record-icon {
  display: inline-grid;
  place-items: center;
  flex: 0 0 auto;
  width: 42px;
  height: 42px;
  border-radius: 14px;
  color: #d45775;
  background: #ffe8ee;
  font-size: 16px;
  font-weight: 800;
}

.metric-card strong {
  display: block;
  margin: 4px 0;
  font-size: 24px;
}

.metric-card em {
  color: #c06b7e;
  font-size: 12px;
  font-style: normal;
}

.ledger-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.12fr) minmax(360px, 0.88fr);
  gap: 18px;
  margin-bottom: 18px;
}

.panel {
  padding: 22px;
  border-radius: 22px;
}

.section-heading {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
  margin-bottom: 18px;
}

.section-heading h2 {
  margin: 0 0 6px;
  font-size: 21px;
}

.section-heading p {
  margin: 0;
  line-height: 1.6;
}

.section-heading > span {
  color: #c94f6d;
  font-size: 28px;
  font-weight: 800;
}

.category-list,
.record-list,
.bill-list,
.account-stack,
.saving-goals {
  display: grid;
  gap: 12px;
}

.category-row,
.record-row,
.bill-item,
.account-card {
  border-radius: 16px;
  background: rgba(255, 248, 250, 0.86);
}

.category-row {
  padding: 14px;
}

.category-top,
.record-row,
.bill-item,
.account-card,
.saving-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.category-top b,
.record-row b,
.bill-item b,
.account-card span,
.saving-title span {
  margin-left: auto;
  white-space: nowrap;
}

.category-top strong,
.record-main strong,
.bill-item strong,
.account-card strong,
.saving-title strong {
  display: block;
  margin-bottom: 4px;
}

.category-meta {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 12px;
}

.category-row .progress-track {
  margin-top: 12px;
}

.progress-track i.warn {
  background: linear-gradient(90deg, #ff9b5f, #ef5d75);
}

.record-row,
.bill-item,
.account-card {
  padding: 14px;
}

.record-main {
  min-width: 0;
}

.record-row b.expense {
  color: #d85c73;
}

.record-row b.income {
  color: #3a9b72;
}

.bottom-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.bill-item > span {
  display: inline-grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 14px;
  color: #b84d6b;
  background: #ffe7ee;
  font-weight: 800;
}

.account-card {
  justify-content: space-between;
  background: linear-gradient(135deg, rgba(255, 241, 245, 0.95), rgba(248, 252, 255, 0.95));
}

.account-card span {
  color: #c94f6d;
  font-weight: 800;
}

.saving-item {
  padding: 12px 0;
}

.saving-item + .saving-item {
  border-top: 1px solid rgba(214, 133, 151, 0.16);
}

@media (max-width: 1180px) {
  .metric-grid,
  .bottom-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .ledger-layout,
  .ledger-hero {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .ledger-page {
    padding: 18px;
  }

  .hero-copy {
    min-height: auto;
    padding: 24px;
  }

  .hero-copy h1 {
    font-size: 28px;
  }

  .toolbar,
  .section-heading {
    flex-direction: column;
    align-items: stretch;
  }

  .metric-grid,
  .bottom-grid {
    grid-template-columns: 1fr;
  }

  .record-row,
  .bill-item {
    align-items: flex-start;
  }
}
</style>
