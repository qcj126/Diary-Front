<template>
  <section class="ledger-page">
    <header class="ledger-header"><h1>账目</h1></header>

    <section class="toolbar">
      <div class="actions">
        <button type="button" class="primary" @click="openCreate"><span class="material-symbols-outlined">add</span>增</button>
        <button type="button" @click="handleDelete"><span class="material-symbols-outlined">delete</span>删</button>
        <button type="button" @click="openEdit"><span class="material-symbols-outlined">edit</span>改</button>
        <button type="button" @click="queryPanelOpen = !queryPanelOpen"><span class="material-symbols-outlined">search</span>查</button>
        <button type="button" @click="exportOpen = true"><span class="material-symbols-outlined">ios_share</span>导出</button>
      </div>
      <form v-if="queryPanelOpen" class="query-panel" @submit.prevent>
        <input v-model.trim="filters.keyword" type="search" placeholder="账目/分类" />
        <select v-model="filters.type"><option value="all">全部类型</option><option value="expense">支出</option><option value="income">收入</option></select>
        <select v-model="filters.category"><option value="all">全部分类</option><option v-for="item in allCategories" :key="item.name" :value="item.name">{{ item.name }}</option></select>
        <input v-model.number="filters.recentDays" type="number" min="0" placeholder="最近X天" />
        <input v-model="filters.exactDate" type="date" aria-label="精确日期" />
        <button type="button" @click="queryPanelOpen = false">查询</button><button type="button" @click="resetFilters">重置</button>
      </form>
    </section>

    <!-- 模块四：随周期、分类和日期下钻实时联动的顶部概览。 -->
    <section class="summary-panel">
      <label class="period-select"><span class="material-symbols-outlined">calendar_month</span><select v-model="activePeriod" aria-label="统计周期"><option v-for="period in periods" :key="period.key" :value="period.key">{{ period.label }}</option></select><span class="material-symbols-outlined">expand_more</span></label>
      <div class="summary-metrics">
        <article><span>本{{ activePeriodShort }}结余</span><strong>{{ money(balance) }}</strong></article>
        <article><span>本{{ activePeriodShort }}收入（{{ incomeCount }}笔）</span><strong class="income">{{ money(totalIncome) }}</strong></article>
        <article><span>本{{ activePeriodShort }}支出（{{ expenseCount }}笔）</span><strong class="expense">{{ money(totalExpense) }}</strong></article>
        <article><span>日均支出</span><strong>{{ money(dailyAverage) }}</strong></article>
        <article><span>支出笔数</span><strong>{{ expenseCount }}<small>笔</small></strong></article>
        <article><span>最大支出分类</span><strong class="compact">{{ largestCategory?.name || '暂无' }}</strong><small>¥{{ money(largestCategory?.value) }}</small></article>
        <article class="saving-card"><span>储蓄率</span><strong>{{ savingRate.toFixed(1) }}%</strong><i><b :style="{ width: `${Math.max(0, Math.min(100, savingRate))}%` }"></b></i></article>
        <article><span>最高单日支出</span><strong class="compact">¥{{ money(highestDay?.value) }}</strong><small>{{ shortDate(highestDay?.date) }}</small></article>
      </div>
    </section>

    <main class="ledger-content">
      <!-- 模块一、二：同一分析页上下排列，无分页。 -->
      <section v-if="activeView === 'analytics'" class="analytics-view">
        <div class="analytics-toolbar">
          <button type="button" class="soft-action" @click="activeView = 'records'"><span class="material-symbols-outlined">arrow_back</span>返回账单明细</button>
          <button type="button" class="primary-action" @click="monthlyOpen = true"><span class="material-symbols-outlined">show_chart</span>查看月度趋势</button>
        </div>
        <section class="panel chart-panel">
          <div class="panel-heading"><div><h2>支出构成</h2><p>本{{ activePeriodShort }}按一级分类聚合 · 点击扇区下钻</p></div><span>¥{{ money(totalExpense) }}</span></div>
          <ExpenseDonutChart :data="categoryData" @select-category="drillByCategory" />
          <CategoryInsightPanel :data="categoryData" :total="totalExpense" />
        </section>
        <section class="panel chart-panel">
          <div class="panel-heading"><div><h2>每日支出</h2><p>周一至周日 · 红色代表超过日均 2 倍</p></div><span>日均 ¥{{ money(weeklyAverage) }}</span></div>
          <WeeklyExpenseChart :data="weeklyDailyData" :average="weeklyAverage" @select-date="drillByDate" />
          <WeeklyRhythmPanel :data="weeklyDailyData" :average="weeklyAverage" />
        </section>
      </section>

      <!-- 模块三、六：快捷筛选、下钻面包屑、最大笔高亮和单笔占比。 -->
      <section v-else class="panel records-panel">
        <div class="records-heading">
          <div class="records-title"><h2>账单明细</h2><p>共 {{ filteredRecords.length }} 笔记录</p></div>
          <button type="button" class="primary-action" @click="activeView = 'analytics'"><span class="material-symbols-outlined">monitoring</span>收支分布趋势</button>
        </div>

        <div class="record-controls">
          <div class="category-pills" aria-label="分类快捷筛选">
            <button v-for="name in quickCategories" :key="name" type="button" :class="{ active: (drillCategory || '全部') === name }" @click="setQuickCategory(name)">{{ name }}</button>
          </div>
          <div v-if="drillCategory || drillDate" class="breadcrumbs" aria-label="下钻路径">
            <button type="button" @click="clearDrill">全部</button><template v-if="drillCategory"><span>›</span><button type="button" @click="drillDate = ''">{{ drillCategory }}</button></template><template v-if="drillDate"><span>›</span><strong>{{ shortDate(drillDate) }}</strong></template>
          </div>
          <div class="subtotal">共 {{ subtotal.count }} 笔，合计 <strong>¥{{ money(subtotal.amount) }}</strong></div>
        </div>

        <div class="insight-strip"><span>💬 {{ personality }}</span><span>下周预测日均 <strong>¥{{ money(predictedDailyExpense) }}</strong></span></div>

        <div class="record-list">
          <div class="record-list-head" aria-hidden="true"><span></span><span>账目</span><span>一级分类</span><span>二级分类</span><span>日期</span><span>类型</span><span>金额 / 占比</span></div>
          <label v-for="record in filteredRecords" :key="record.id" class="record-row" :class="{ selected: selectedIds.includes(record.id), largest: record.id === largestExpense?.id }">
            <input v-model="selectedIds" type="checkbox" :value="record.id" />
            <span class="record-title-cell"><span class="record-icon">{{ categoryIcon(record.primary) }}</span><span><strong>{{ record.note || record.secondary }}</strong><em v-if="record.id === largestExpense?.id">👑 本周最大笔</em></span></span>
            <span class="record-category">{{ record.primary }}</span><span class="record-secondary">{{ record.secondary }}</span>
            <span class="record-date"><strong>{{ formatDate(record.date) }}</strong><small>{{ record.date }}</small></span>
            <span class="record-type" :class="record.type">{{ record.type === 'income' ? '收入' : '支出' }}</span>
            <span class="record-amount" :class="record.type"><strong>{{ record.type === 'income' ? '+' : '-' }}¥{{ money(record.amount) }}</strong><i v-if="record.type === 'expense'"><b :style="{ width: `${expenseShare(record.amount)}%` }"></b></i><small v-if="record.type === 'expense'">占支出 {{ expenseShare(record.amount).toFixed(1) }}%</small></span>
          </label>
          <div v-if="!filteredRecords.length" class="empty-state"><span class="material-symbols-outlined">receipt_long</span><strong>没有找到相关账目</strong><p>请调整筛选条件或返回上层。</p></div>
        </div>
      </section>
    </main>

    <MonthlyTrendModal v-if="monthlyOpen" :data="monthlyCumulative" @close="monthlyOpen = false" />
    <div v-if="toast.visible" class="toast" :class="{ leaving: toast.leaving }">{{ toast.message }}</div>

    <div v-if="confirmDeleteOpen" class="modal-backdrop" @click.self="confirmDeleteOpen = false"><section class="confirm-modal"><h2>确定执行删除吗？</h2><p>将删除已选中的 {{ selectedIds.length }} 条账目记录。</p><footer><button type="button" @click="confirmDeleteOpen = false">取消</button><button type="button" class="danger" @click="confirmDelete">确定删除</button></footer></section></div>
    <div v-if="exportOpen" class="modal-backdrop" @click.self="exportOpen = false"><form class="export-modal" @submit.prevent="confirmExport"><h2>导出账单</h2><div class="export-fields"><label><span>文件格式</span><select v-model="exportForm.format"><option value="pdf">PDF</option><option value="image">图片</option><option value="excel">Excel</option></select></label><label><span>过去天数</span><select v-model.number="exportForm.lastDays"><option :value="0">全部</option><option v-for="day in exportDayOptions" :key="day" :value="day">{{ day }} 天</option></select></label><label><span>导出目标条数</span><select v-model.number="exportForm.size"><option v-for="size in exportSizeOptions" :key="size" :value="size">{{ size }} 条</option></select></label></div><footer><button type="button" @click="exportOpen = false">取消导出</button><button type="submit" class="primary">确认导出</button></footer></form></div>
    <div v-if="editorOpen" class="modal-backdrop" @click.self="closeEditor"><form class="editor-modal" @submit.prevent="saveRecord"><header><div><span class="eyebrow">{{ editorMode === 'create' ? 'Create' : 'Update' }}</span><h2>{{ editorMode === 'create' ? '记一笔' : '修改账目' }}</h2><p>记录今天发生的每一笔收支</p></div><button type="button" aria-label="关闭" @click="closeEditor"><span class="material-symbols-outlined">close</span></button></header><div class="entry-form"><div class="type-toggle"><button type="button" :class="{ active: draft.type === 'expense' }" @click="setDraftType('expense')">支出</button><button type="button" :class="{ active: draft.type === 'income' }" @click="setDraftType('income')">收入</button></div><label class="amount-field"><span>金额</span><div><b>¥</b><input v-model.number="draft.amount" min="0.01" step="0.01" type="number" placeholder="0.00" required /></div></label><div class="field-row"><label><span>一级分类</span><select v-model="draft.primary" @change="draft.secondary = availableSecondary[0]"><option v-for="category in availableCategories" :key="category.name" :value="category.name">{{ category.icon }} {{ category.name }}</option></select></label><label><span>二级分类</span><select v-model="draft.secondary"><option v-for="item in availableSecondary" :key="item" :value="item">{{ item }}</option></select></label></div><div class="field-row"><label><span>日期</span><input v-model="draft.date" type="date" required /></label><label><span>备注</span><input v-model.trim="draft.note" type="text" placeholder="如：午餐外卖" /></label></div></div><footer><button type="button" @click="closeEditor">取消</button><button type="submit" class="primary">{{ editorMode === 'create' ? '保存这笔账' : '保存修改' }}</button></footer></form></div>
  </section>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import CategoryInsightPanel from './components/CategoryInsightPanel.vue'
import ExpenseDonutChart from './components/ExpenseDonutChart.vue'
import MonthlyTrendModal from './components/MonthlyTrendModal.vue'
import WeeklyExpenseChart from './components/WeeklyExpenseChart.vue'
import WeeklyRhythmPanel from './components/WeeklyRhythmPanel.vue'
import { useLedgerAnalytics } from './composables/useLedgerAnalytics.js'
import { expenseCategories, incomeCategories, ledgerMockRecords, LEDGER_TODAY, LEDGER_TODAY_ISO } from './mock/ledgerRecords.js'

const periods = [{ key: 'today', label: '今日', short: '日' }, { key: 'week', label: '本周', short: '周' }, { key: 'month', label: '本月', short: '月' }, { key: 'quarter', label: '本季', short: '季' }, { key: 'year', label: '今年', short: '年' }]
const allCategories = [...expenseCategories, ...incomeCategories]
const quickCategories = ['全部', '饮食', '交通', '居住', '购物', '娱乐']
const records = ref(ledgerMockRecords.map((item) => ({ ...item })))
const activePeriod = ref('week')
const activeView = ref('records')
const drillCategory = ref('')
const drillDate = ref('')
const selectedIds = ref([])
const queryPanelOpen = ref(false)
const editorOpen = ref(false)
const editorMode = ref('create')
const editingId = ref(null)
const confirmDeleteOpen = ref(false)
const exportOpen = ref(false)
const monthlyOpen = ref(false)
const filters = reactive({ keyword: '', type: 'all', category: 'all', recentDays: null, exactDate: '' })
const exportDayOptions = [1, 3, 5, 7, 10, 15, 30]
const exportSizeOptions = [10, 20, 30, 40, 50, 100]
const exportForm = reactive({ format: 'pdf', lastDays: 0, size: 10 })
const toast = reactive({ visible: false, leaving: false, message: '' })
let toastTimer = 0
let toastLeaveTimer = 0
const emptyDraft = () => ({ type: 'expense', amount: null, primary: '饮食', secondary: '日常餐饮', date: LEDGER_TODAY_ISO, note: '' })
const draft = reactive(emptyDraft())

const analytics = useLedgerAnalytics(records, activePeriod, filters, drillCategory, drillDate)
const { filteredRecords, totalExpense, totalIncome, balance, expenseCount, incomeCount, dailyAverage, savingRate, largestExpense, categoryData, largestCategory, weeklyDailyData, weeklyAverage, highestDay, monthlyCumulative, subtotal, personality, predictedDailyExpense } = analytics
const activePeriodShort = computed(() => periods.find((item) => item.key === activePeriod.value)?.short || '周')
const availableCategories = computed(() => draft.type === 'expense' ? expenseCategories : incomeCategories)
const availableSecondary = computed(() => availableCategories.value.find((item) => item.name === draft.primary)?.secondary || [])

function drillByCategory(name) { drillCategory.value = name; drillDate.value = ''; activeView.value = 'records' }
function drillByDate(date) { drillDate.value = date || ''; activeView.value = 'records' }
function setQuickCategory(name) { drillCategory.value = name === '全部' ? '' : name; drillDate.value = '' }
function clearDrill() { drillCategory.value = ''; drillDate.value = '' }
function resetFilters() { Object.assign(filters, { keyword: '', type: 'all', category: 'all', recentDays: null, exactDate: '' }); clearDrill() }
function expenseShare(amount) { return totalExpense.value ? Math.min(100, Number(amount) / totalExpense.value * 100) : 0 }
function money(value) { return Number(value || 0).toFixed(2) }
function formatDate(date) { if (!date) return '—'; const [, month, day] = date.split('-'); return `${month}月${day}日` }
function shortDate(date) { return date ? formatDate(date) : '—' }
function categoryIcon(name) { return allCategories.find((item) => item.name === name)?.icon || '🧾' }

function setDraftType(type) { draft.type = type; const first = type === 'expense' ? expenseCategories[2] : incomeCategories[0]; draft.primary = first.name; draft.secondary = first.secondary[0] }
function openCreate() { editorMode.value = 'create'; editingId.value = null; Object.assign(draft, emptyDraft()); editorOpen.value = true }
function openEdit() { if (!selectedIds.value.length) return showToast('请选择数据记录'); if (selectedIds.value.length > 1) return showToast('修改时请选择一条数据'); const item = records.value.find((record) => record.id === selectedIds.value[0]); if (!item) return; editorMode.value = 'edit'; editingId.value = item.id; Object.assign(draft, { ...item }); editorOpen.value = true }
function closeEditor() { editorOpen.value = false }
function saveRecord() { if (!draft.amount || draft.amount <= 0) return; if (editorMode.value === 'create') records.value.push({ id: Date.now(), ...draft, amount: Number(draft.amount) }); else { const index = records.value.findIndex((item) => item.id === editingId.value); if (index >= 0) records.value[index] = { id: editingId.value, ...draft, amount: Number(draft.amount) } } closeEditor(); showToast(editorMode.value === 'create' ? '新增成功' : '修改成功') }
function handleDelete() { if (!selectedIds.value.length) return showToast('请选择数据记录'); confirmDeleteOpen.value = true }
function confirmDelete() { records.value = records.value.filter((item) => !selectedIds.value.includes(item.id)); selectedIds.value = []; confirmDeleteOpen.value = false; showToast('删除成功') }
function showToast(message) { window.clearTimeout(toastTimer); window.clearTimeout(toastLeaveTimer); Object.assign(toast, { message, visible: true, leaving: false }); toastTimer = window.setTimeout(() => { toast.leaving = true; toastLeaveTimer = window.setTimeout(() => { toast.visible = false }, 400) }, 1800) }

function confirmExport() { const start = exportForm.lastDays ? new Date(LEDGER_TODAY.getFullYear(), LEDGER_TODAY.getMonth(), LEDGER_TODAY.getDate() - exportForm.lastDays + 1) : null; const items = records.value.filter((item) => !start || new Date(`${item.date}T00:00:00`) >= start).sort((a, b) => b.date.localeCompare(a.date)).slice(0, exportForm.size); if (exportForm.format === 'excel') exportExcel(items); if (exportForm.format === 'image') exportImage(items); if (exportForm.format === 'pdf') exportPdf(items); exportOpen.value = false }
function exportExcel(items) { const rows = items.map((item) => `<tr><td>${item.date}</td><td>${item.note || item.secondary}</td><td>${item.primary}</td><td>${item.secondary}</td><td>${item.type === 'income' ? '收入' : '支出'}</td><td>${item.amount}</td></tr>`).join(''); downloadBlob(new Blob([`<html><head><meta charset="utf-8"></head><body><table><tr><th>日期</th><th>账目</th><th>一级分类</th><th>二级分类</th><th>类型</th><th>金额</th></tr>${rows}</table></body></html>`], { type: 'application/vnd.ms-excel;charset=utf-8' }), `时光账本-${LEDGER_TODAY_ISO}.xls`) }
function exportImage(items) { const canvas = document.createElement('canvas'); canvas.width = 1100; canvas.height = 190 + items.length * 55; const ctx = canvas.getContext('2d'); ctx.fillStyle = '#fffaf7'; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.fillStyle = '#24201f'; ctx.font = 'bold 38px sans-serif'; ctx.fillText('时光账本', 60, 64); items.forEach((item, index) => { const y = 130 + index * 55; ctx.fillStyle = '#272321'; ctx.font = '20px sans-serif'; ctx.fillText(`${item.date}  ${item.note || item.secondary}`, 60, y); ctx.fillStyle = item.type === 'income' ? '#2f9a70' : '#dc684f'; ctx.textAlign = 'right'; ctx.fillText(`${item.type === 'income' ? '+' : '-'}¥${money(item.amount)}`, 1040, y); ctx.textAlign = 'left' }); const link = document.createElement('a'); link.href = canvas.toDataURL('image/png'); link.download = `时光账本-${LEDGER_TODAY_ISO}.png`; link.click() }
function exportPdf(items) { const popup = window.open('', '_blank', 'width=920,height=720'); if (!popup) return; const rows = items.map((item) => `<tr><td>${item.date}</td><td>${item.note || item.secondary}</td><td>${item.primary}/${item.secondary}</td><td>${item.type === 'income' ? '收入' : '支出'}</td><td>${item.type === 'income' ? '+' : '-'}¥${money(item.amount)}</td></tr>`).join(''); popup.document.write(`<html><head><title>时光账本</title><style>body{font-family:Arial,"Microsoft YaHei";padding:40px}table{width:100%;border-collapse:collapse;margin-top:24px}th,td{text-align:left;padding:12px;border-bottom:1px solid #ddd}</style></head><body><h1>时光账本</h1><table><tr><th>日期</th><th>账目</th><th>分类</th><th>类型</th><th>金额</th></tr>${rows}</table><script>window.onload=()=>window.print()<\/script></body></html>`); popup.document.close() }
function downloadBlob(blob, filename) { const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = filename; link.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000) }
</script>

<style scoped>
.ledger-page{display:flex;height:100vh;min-height:0;flex-direction:column;overflow:hidden;padding:1rem;color:#1c1b1b;background:radial-gradient(circle at 14% 10%,rgba(255,152,0,.08),transparent 28%),linear-gradient(135deg,#fdf8f8,#f7f9fb);font-family:Inter,system-ui,sans-serif}.ledger-header{display:flex;align-items:center;flex:0 0 72px;height:72px;margin:-1rem -1rem 18px;padding:0 2.5rem;border-bottom:1px solid rgba(220,193,185,.72);background:#fff8f6}.ledger-header h1{margin:0;font-size:1.75rem}.toolbar,.summary-panel,.panel{border:1px solid rgba(196,199,199,.4);border-radius:18px;background:rgba(255,255,255,.88);box-shadow:0 12px 32px rgba(28,27,27,.055);backdrop-filter:blur(16px)}
.toolbar{display:flex;align-items:center;justify-content:space-between;flex:0 0 auto;gap:14px;margin-bottom:12px;padding:12px 14px}.actions,.query-panel{display:flex;flex-wrap:wrap;gap:8px}.actions button,.query-panel button,.modal-backdrop button{display:inline-flex;align-items:center;justify-content:center;gap:5px;min-height:36px;padding:0 13px;border:0;border-radius:10px;color:#444748;background:#f1edec;cursor:pointer;font-weight:800}.actions span{font-size:17px}.actions .primary,.modal-backdrop .primary,.primary-action{color:#fff;background:#1c1b1b}.query-panel{justify-content:flex-end}.query-panel input,.query-panel select{width:105px;height:36px;padding:0 9px;border:1px solid rgba(196,199,199,.58);border-radius:10px;outline:0;background:#fff;font:700 11px Inter,sans-serif}.query-panel input[type=date]{width:128px}
.summary-panel{display:flex;align-items:stretch;flex:0 0 auto;margin-bottom:12px;padding:12px 16px}.period-select{display:flex;align-items:center;flex:0 0 132px;gap:6px;padding:0 10px;border-right:1px solid #e7dfdb}.period-select span{color:#766c68;font-size:18px}.period-select select{flex:1;border:0;outline:0;appearance:none;background:transparent;font:800 13px Inter,sans-serif}.summary-metrics{display:grid;flex:1;grid-template-columns:repeat(8,minmax(0,1fr))}.summary-metrics article{min-width:0;padding:2px 13px}.summary-metrics article+article{border-left:1px solid #e7dfdb}.summary-metrics span,.summary-metrics strong,.summary-metrics small{display:block}.summary-metrics span{color:#756d69;font-size:9px;white-space:nowrap}.summary-metrics strong{margin-top:3px;font-size:clamp(15px,1.55vw,21px);white-space:nowrap}.summary-metrics strong small{display:inline;margin-left:2px;font-size:9px}.summary-metrics>article>small{margin-top:2px;color:#827874;font-size:9px}.summary-metrics .compact{overflow:hidden;text-overflow:ellipsis;font-size:15px}.summary-metrics .income{color:#348969}.summary-metrics .expense{color:#d45f49}.saving-card i{display:block;height:4px;margin-top:5px;overflow:hidden;border-radius:99px;background:#eee8e5}.saving-card i b{display:block;height:100%;border-radius:inherit;background:#65b594}
.ledger-content{flex:1 1 auto;min-height:0;overflow:hidden}.analytics-view{display:grid;height:100%;grid-template-columns:minmax(320px,.85fr) minmax(420px,1.15fr);grid-template-rows:auto minmax(0,1fr);gap:12px;overflow-y:auto;padding-right:4px}.analytics-toolbar{display:flex;grid-column:1 / -1;justify-content:space-between}.soft-action,.primary-action{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:36px;padding:0 13px;border:0;border-radius:10px;cursor:pointer;font:800 11px Inter,sans-serif}.soft-action{color:#444748;background:#eee9e6}.soft-action span,.primary-action span{font-size:17px}.chart-panel{display:flex;min-height:540px;flex-direction:column;padding:20px}.panel-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.panel-heading h2{margin:0 0 3px;font-size:18px}.panel-heading p,.panel-heading>span{margin:0;color:#7f7773;font-size:11px}
.records-panel{display:flex;width:100%;height:100%;min-height:0;flex-direction:column;overflow:hidden;padding:20px}.records-heading{display:flex;align-items:center;justify-content:space-between;gap:12px;padding-bottom:12px;border-bottom:1px solid #e9e2de}.records-title{display:flex;align-items:baseline;gap:12px}.records-title h2{margin:0;font-size:18px}.records-title p{margin:0;color:#7f7773;font-size:11px}.record-controls{display:flex;align-items:center;flex-wrap:wrap;gap:10px;padding:11px 0}.category-pills{display:flex;gap:6px;flex-wrap:wrap}.category-pills button,.breadcrumbs button{border:0;cursor:pointer}.category-pills button{height:28px;padding:0 12px;border-radius:99px;color:#6d6460;background:#f1edec;font-size:10px;font-weight:800}.category-pills button.active{color:#fff;background:#1c1b1b}.breadcrumbs{display:flex;align-items:center;gap:5px;color:#9b7064;font-size:10px}.breadcrumbs button{padding:0;color:#9b7064;background:transparent;font-weight:800}.subtotal{margin-left:auto;color:#756d69;font-size:10px}.subtotal strong{color:#1c1b1b}.insight-strip{display:flex;justify-content:space-between;gap:14px;margin-bottom:8px;padding:8px 11px;border-radius:10px;color:#685d58;background:#fff6f1;font-size:10px}.record-list{display:grid;flex:1 1 auto;min-height:0;align-content:start;overflow:auto;scrollbar-gutter:stable}.record-list-head,.record-row{display:grid;grid-template-columns:28px minmax(200px,1.5fr) minmax(90px,.65fr) minmax(115px,.8fr) minmax(105px,.75fr) 72px minmax(125px,.8fr);column-gap:16px;align-items:center;min-width:860px}.record-list-head{position:sticky;top:0;z-index:2;padding:10px;border-bottom:1px solid #e9e2de;color:#8a817d;background:rgba(255,255,255,.98);font-size:9px;font-weight:800}.record-list-head span:nth-child(2){padding-left:47px}.record-list-head span:nth-child(6){padding-left:9px}.record-list-head span:last-child{text-align:right}.record-row{padding:10px;border-bottom:1px solid #eee8e5;cursor:pointer}.record-row:hover,.record-row.selected{background:#fff9f6}.record-row.largest{background:#fff1ef;box-shadow:inset 3px 0 #e74c3c}.record-row input{accent-color:#1c1b1b}.record-title-cell{display:flex;align-items:center;gap:11px;min-width:0}.record-title-cell>span:last-child{display:flex;min-width:0;flex-direction:column;align-items:flex-start}.record-title-cell strong{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px}.record-title-cell em{margin-top:2px;color:#d74f43;font-size:8px;font-style:normal;font-weight:900}.record-icon{display:grid;flex:0 0 36px;width:36px;height:36px;place-items:center;border-radius:10px;background:#f4efec}.record-category,.record-secondary{color:#504946;font-size:10px}.record-category{font-weight:800}.record-date{display:flex;flex-direction:column;align-items:flex-start}.record-date strong{font-size:10px}.record-date small{margin-top:2px;color:#8a817d;font-size:8px}.record-type{display:inline-flex;width:fit-content;padding:4px 9px;border-radius:99px;font-size:9px;font-weight:800}.record-type.expense{color:#c45b47;background:#fff0eb}.record-type.income{color:#328563;background:#e7f5ee}.record-amount{display:flex;flex-direction:column;align-items:flex-end;text-align:right}.record-amount strong{font-size:11px}.record-amount.expense strong{color:#cf604a}.record-amount.income strong{color:#338b68}.record-amount i{display:block;width:82px;height:4px;margin-top:4px;overflow:hidden;border-radius:99px;background:#eee8e5}.record-amount i b{display:block;height:100%;border-radius:inherit;background:#ff8060}.record-amount small{margin-top:2px;color:#8a817d;font-size:7px}.empty-state{padding:60px 20px;color:#7f7773;text-align:center}.empty-state>span{display:block;font-size:36px}.empty-state strong{color:#1c1b1b}.empty-state p{margin:5px 0;font-size:11px}
.modal-backdrop{position:fixed;inset:0;z-index:60;display:grid;place-items:center;padding:24px;background:rgba(28,27,27,.28);backdrop-filter:blur(8px)}.confirm-modal,.export-modal,.editor-modal{width:min(100%,680px);padding:24px;border-radius:22px;background:#fff;box-shadow:0 24px 80px rgba(28,27,27,.22)}.confirm-modal{max-width:420px}.confirm-modal h2,.export-modal h2,.editor-modal h2{margin:0}.confirm-modal p{margin:10px 0;color:#5c5f61}.modal-backdrop footer{display:flex;justify-content:flex-end;gap:10px;margin-top:20px}.danger{color:#fff!important;background:#ba1a1a!important}.export-modal{display:grid;gap:20px}.export-fields{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.export-fields label{display:grid;gap:8px;color:#444748;font-size:11px;font-weight:900}.export-fields select{height:42px;padding:0 12px;border:1px solid #d8d1cd;border-radius:11px;background:#fff;font-weight:800}.editor-modal{width:min(100%,620px)}.editor-modal header{display:flex;justify-content:space-between}.editor-modal header p{margin:4px 0 0;color:#7f7773;font-size:11px}.editor-modal header>button{width:38px;padding:0}.eyebrow{color:#9a6558;font-size:10px;font-weight:900;letter-spacing:.12em}.entry-form{margin-top:20px}.type-toggle{display:grid;grid-template-columns:1fr 1fr;gap:4px;padding:4px;border-radius:10px;background:#f3efec}.type-toggle button{min-height:36px;border:0;border-radius:7px;color:#7d7470;background:transparent;cursor:pointer;font-weight:800}.type-toggle button.active{color:#fff;background:#1c1b1b}.entry-form label>span{display:block;margin-bottom:6px;color:#6d6561;font-size:11px;font-weight:800}.amount-field{display:block;margin:16px 0}.amount-field>div{display:flex;align-items:center;height:54px;padding:0 14px;border:1px solid #ddd4cf;border-radius:11px}.amount-field b{margin-right:9px;font-size:20px}.amount-field input{width:100%;border:0;outline:0;font-size:24px;font-weight:800}.field-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px}.field-row input,.field-row select{width:100%;height:42px;padding:0 11px;border:1px solid #ddd4cf;border-radius:10px;outline:0;background:#fff;font:700 12px Inter,sans-serif}.toast{position:fixed;top:50%;left:50%;z-index:80;min-width:180px;padding:14px 20px;border-radius:12px;color:#fff;background:rgba(28,27,27,.94);text-align:center;font-size:13px;font-weight:800;transform:translate(-50%,-50%)}
:global(.dashboard[data-theme=night]) .ledger-page{color:var(--dashboard-text);background:var(--dashboard-bg)}:global(.dashboard[data-theme=night]) .ledger-header,:global(.dashboard[data-theme=night]) .toolbar,:global(.dashboard[data-theme=night]) .summary-panel,:global(.dashboard[data-theme=night]) .panel,:global(.dashboard[data-theme=night]) .confirm-modal,:global(.dashboard[data-theme=night]) .export-modal,:global(.dashboard[data-theme=night]) .editor-modal{border-color:var(--dashboard-border-soft);background:var(--dashboard-surface);color:var(--dashboard-text)}:global(.dashboard[data-theme=night]) .record-list-head{background:var(--dashboard-surface)}
@media(max-width:1200px){.summary-metrics{grid-template-columns:repeat(4,1fr);gap:12px 0}.summary-metrics article:nth-child(5){border-left:0}.toolbar{align-items:flex-start;flex-direction:column}.query-panel{justify-content:flex-start}.analytics-view{grid-template-columns:1fr;grid-template-rows:auto auto auto}.analytics-toolbar{grid-column:1}.chart-panel{min-height:380px}}
@media(max-width:760px){.ledger-header{padding:0 1.25rem}.summary-panel{align-items:stretch;flex-direction:column;overflow-y:auto}.period-select{height:42px;border-right:0;border-bottom:1px solid #e7dfdb}.summary-metrics{grid-template-columns:1fr 1fr}.summary-metrics article:nth-child(odd){border-left:0}.records-heading,.insight-strip{align-items:flex-start;flex-direction:column}.subtotal{margin-left:0}.export-fields,.field-row{grid-template-columns:1fr}.query-panel input,.query-panel select,.query-panel input[type=date]{width:100%}}

/* 统一提高账目页字体可读性，保留原有信息层级。 */
.ledger-page{font-size:15px}.actions button,.query-panel button{font-size:13px}.query-panel input,.query-panel select{font-size:12px}.period-select select{font-size:15px}.summary-metrics span{font-size:11px}.summary-metrics strong{font-size:clamp(18px,1.7vw,24px)}.summary-metrics strong small,.summary-metrics>article>small{font-size:11px}.summary-metrics .compact{font-size:17px}.panel-heading h2,.records-title h2{font-size:20px}.panel-heading p,.panel-heading>span,.records-title p{font-size:13px}.soft-action,.primary-action{font-size:13px}.category-pills button{font-size:12px}.breadcrumbs,.subtotal,.insight-strip{font-size:12px}.record-list-head{font-size:11px}.record-title-cell strong{font-size:13px}.record-title-cell em{font-size:10px}.record-category,.record-secondary{font-size:12px}.record-date strong{font-size:12px}.record-date small{font-size:10px}.record-type{font-size:11px}.record-amount strong{font-size:13px}.record-amount small{font-size:9px}.export-fields label,.entry-form label>span,.editor-modal header p{font-size:13px}.field-row input,.field-row select{font-size:14px}
</style>
