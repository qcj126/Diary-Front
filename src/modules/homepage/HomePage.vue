<template>
  <section class="home-page">
    <header class="home-header">
      <p>{{ monthLabel }} · {{ weekLabel }}</p>
      <h1>主页</h1>
    </header>

    <main class="home-content">
      <section class="today-panel">
        <div class="day-mark">
          <span>{{ dayNumber }}</span>
          <small>今日</small>
        </div>
        <div>
          <p class="kicker">生活空间</p>
          <h2>从这里开始记录今天</h2>
          <p>选择一个模块，查看服务端数据或继续添加新的生活记录。</p>
        </div>
      </section>

      <section class="module-map">
        <div class="section-head">
          <div>
            <p class="kicker">MODULES</p>
            <h2>全部模块</h2>
          </div>
          <span>{{ modules.length }} 个</span>
        </div>

        <div class="module-grid">
          <button
            v-for="module in modules"
            :key="module.key"
            type="button"
            class="module-card"
            :style="{ '--accent': module.color }"
            @click="go(module.key)"
          >
            <span class="material-symbols-outlined">{{ module.icon }}</span>
            <span>
              <strong>{{ module.label }}</strong>
              <small>{{ module.description }}</small>
            </span>
            <span class="material-symbols-outlined arrow">arrow_forward</span>
          </button>
        </div>
      </section>
    </main>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { HOME_MENU_ITEMS } from '../../constants/navigation.js'

const emit = defineEmits(['navigate'])
const modules = HOME_MENU_ITEMS
const now = new Date()
const dayNumber = computed(() => String(now.getDate()).padStart(2, '0'))
const weekLabel = computed(() => new Intl.DateTimeFormat('zh-CN', { weekday: 'long' }).format(now))
const monthLabel = computed(() => new Intl.DateTimeFormat('zh-CN', { month: 'long' }).format(now))

function go(key) {
  emit('navigate', key)
}
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  padding: 32px;
  color: var(--dashboard-text, #1c1b1b);
  background:
    radial-gradient(circle at 12% 10%, rgba(77, 147, 138, 0.14), transparent 26rem),
    radial-gradient(circle at 86% 14%, rgba(255, 152, 0, 0.12), transparent 24rem),
    var(--dashboard-bg, #fdf8f8);
  font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.home-header {
  max-width: 1180px;
  margin: 0 auto 24px;
}

.home-header p,
.kicker {
  margin: 0 0 6px;
  color: var(--dashboard-text-muted, #6b7280);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.home-header h1,
.today-panel h2,
.section-head h2 {
  margin: 0;
}

.home-header h1 {
  font-size: clamp(28px, 4vw, 42px);
}

.home-content {
  display: grid;
  max-width: 1180px;
  margin: 0 auto;
  gap: 20px;
}

.today-panel,
.module-map {
  border: 1px solid var(--dashboard-border-soft, rgba(196, 199, 199, 0.56));
  border-radius: 24px;
  background: var(--dashboard-surface, #fff);
  box-shadow: var(--dashboard-shadow, 0 18px 50px rgba(28, 27, 27, 0.08));
}

.today-panel {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 28px;
}

.today-panel > div:last-child > p:last-child {
  margin: 8px 0 0;
  color: var(--dashboard-text-muted, #6b7280);
}

.day-mark {
  display: grid;
  flex: 0 0 76px;
  height: 76px;
  place-items: center;
  border-radius: 20px;
  color: #fff;
  background: #4d938a;
}

.day-mark span {
  align-self: end;
  font-size: 30px;
  font-weight: 800;
  line-height: 1;
}

.day-mark small {
  align-self: start;
  font-size: 11px;
}

.module-map {
  padding: 28px;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.section-head > span {
  color: var(--dashboard-text-muted, #6b7280);
  font-size: 13px;
}

.module-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.module-card {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr) 24px;
  align-items: center;
  gap: 12px;
  min-height: 88px;
  padding: 16px;
  border: 1px solid var(--dashboard-border-soft, #e5e7eb);
  border-radius: 16px;
  color: var(--dashboard-text, #1c1b1b);
  background: var(--dashboard-surface-soft, #f8fafc);
  text-align: left;
  cursor: pointer;
  transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
}

.module-card:hover {
  border-color: var(--accent);
  box-shadow: 0 10px 24px color-mix(in srgb, var(--accent) 15%, transparent);
  transform: translateY(-2px);
}

.module-card > .material-symbols-outlined:first-child {
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border-radius: 12px;
  color: var(--accent);
  background: color-mix(in srgb, var(--accent) 12%, transparent);
}

.module-card > span:nth-child(2) {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.module-card strong,
.module-card small {
  display: block;
}

.module-card small {
  overflow: hidden;
  color: var(--dashboard-text-muted, #6b7280);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.module-card .arrow {
  color: var(--dashboard-text-muted, #94a3b8);
  font-size: 19px;
}

@media (max-width: 1100px) {
  .module-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 680px) {
  .home-page {
    padding: 20px 14px;
  }

  .today-panel,
  .module-map {
    padding: 20px;
  }

  .module-grid {
    grid-template-columns: 1fr;
  }
}
</style>
