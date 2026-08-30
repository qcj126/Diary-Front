<template>
  <section class="database-page">
    <header class="database-header">
      <div>
        <p class="database-kicker">System Data Hub</p>
        <h1>系统数据库</h1>
        <p>集中维护图标、食材与其他系统级基础数据。</p>
      </div>
      <div class="database-summary" aria-label="已接入的数据类型">
        <span><strong>2</strong> 个数据模块</span>
        <span><strong>9</strong> 个接口已接入</span>
      </div>
    </header>

    <nav class="database-tabs" aria-label="系统数据库模块">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        type="button"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        <span class="material-symbols-outlined">{{ tab.icon }}</span>
        <span>
          <strong>{{ tab.label }}</strong>
          <small>{{ tab.description }}</small>
        </span>
      </button>
    </nav>

    <IconLibraryPage v-if="activeTab === 'icons'" embedded />
    <IngredientLibraryPage v-else />
  </section>
</template>

<script setup>
import { ref } from 'vue'
import IconLibraryPage from '../icons/IconLibraryPage.vue'
import IngredientLibraryPage from './IngredientLibraryPage.vue'

const tabs = [
  { key: 'icons', label: '图标库', description: '查询、新增、修改与删除', icon: 'category' },
  { key: 'ingredients', label: '食材库', description: '分类查询、新增与烹饪方式', icon: 'grocery' },
]

const activeTab = ref('icons')
</script>

<style scoped>
.database-page {
  display: flex;
  min-width: 0;
  min-height: 100%;
  padding: 34px clamp(20px, 3vw, 46px) 46px;
  flex-direction: column;
  gap: 24px;
}

.database-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
}

.database-kicker {
  margin: 0;
  color: var(--dashboard-primary, #b85a62);
  font-size: 11px;
  font-weight: 850;
  letter-spacing: .17em;
  text-transform: uppercase;
}

.database-header h1 {
  margin: 5px 0 7px;
  color: var(--dashboard-text-strong, #201b1b);
  font-size: clamp(30px, 4vw, 42px);
  letter-spacing: -.035em;
}

.database-header p:last-child {
  margin: 0;
  color: var(--dashboard-text-muted, #7d7474);
  font-size: 14px;
}

.database-summary {
  display: flex;
  gap: 8px;
}

.database-summary span {
  padding: 9px 12px;
  border: 1px solid var(--dashboard-border-soft, #e6dede);
  border-radius: 999px;
  color: var(--dashboard-text-muted, #7d7474);
  background: var(--dashboard-surface, #fff);
  font-size: 11px;
}

.database-summary strong {
  color: var(--dashboard-primary, #b85a62);
  font-size: 13px;
}

.database-tabs {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 240px));
  gap: 10px;
  padding-bottom: 18px;
  border-bottom: 1px solid var(--dashboard-border-soft, #e6dede);
}

.database-tabs button {
  display: grid;
  grid-template-columns: 38px minmax(0, 1fr);
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border: 1px solid var(--dashboard-border-soft, #e6dede);
  border-radius: 14px;
  color: var(--dashboard-text, #453e3e);
  background: var(--dashboard-surface, #fff);
  cursor: pointer;
  text-align: left;
  transition: border-color .18s ease, transform .18s ease, box-shadow .18s ease;
}

.database-tabs button:hover {
  transform: translateY(-1px);
  border-color: color-mix(in srgb, var(--dashboard-primary, #b85a62) 45%, transparent);
}

.database-tabs button.active {
  border-color: var(--dashboard-primary, #b85a62);
  box-shadow: 0 8px 22px rgba(105, 58, 58, .1);
}

.database-tabs .material-symbols-outlined {
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  border-radius: 11px;
  color: var(--dashboard-primary, #b85a62);
  background: color-mix(in srgb, var(--dashboard-primary, #b85a62) 10%, transparent);
}

.database-tabs button > span:last-child {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 3px;
}

.database-tabs strong {
  font-size: 14px;
}

.database-tabs small {
  overflow: hidden;
  color: var(--dashboard-text-muted, #817777);
  font-size: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 720px) {
  .database-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .database-summary {
    flex-wrap: wrap;
  }

  .database-tabs {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 480px) {
  .database-page {
    padding-inline: 14px;
  }

  .database-tabs {
    grid-template-columns: 1fr;
  }
}
</style>
