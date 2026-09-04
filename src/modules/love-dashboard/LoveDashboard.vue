<template>
  <div class="dashboard" :class="transitionClass" :data-theme="theme">
    <SidebarNav
      v-model="active"
      :sections="sections"
      :is-night-mode="isNightMode"
      :user-name="userName"
      @toggle-theme="toggleTheme"
    />

    <main class="content">
      <HomeOverview
        v-if="active === 'home'"
        @navigate="active = $event"
      />
      <TimelinePage v-else-if="active === 'timeline'" />
      <LoveRecordsPage v-else-if="active === 'dates'" @back="active = 'home'" />
      <DietPage v-else-if="active === 'diet'" />
      <RecipePage v-else-if="active === 'diary'" @preview-ai-result="openAiResultPreview" />
      <GoalsPage v-else-if="active === 'wishlist'" />
      <LifeThoughtsPage v-else-if="active === 'board'" />
      <LedgerPage v-else-if="active === 'ledger'" />
      <AiResultsPage
        v-else-if="active === 'ai-results'"
        :initial-task-id="aiResultTaskId"
      />
      <SystemDatabasePage v-else-if="active === 'system-database'" />
    </main>
  </div>
</template>

<script setup>
import { computed, defineAsyncComponent, onBeforeUnmount, ref } from 'vue'
import { DEFAULT_MENU_KEY, MENU_ITEMS } from '../../constants/navigation.js'
import { THEME_STORAGE_KEY, THEME_TRANSITION_MS } from '../../constants/dashboard.js'
import { getAuthSession } from '../auth/session.js'
import SidebarNav from './components/SidebarNav.vue'

const HomeOverview = defineAsyncComponent(() => import('../homepage/index.js').then((module) => module.HomePage))
const TimelinePage = defineAsyncComponent(() => import('../timeline/index.js').then((module) => module.TimelinePage))
const LoveRecordsPage = defineAsyncComponent(() => import('../love-records/index.js').then((module) => module.LoveRecordsPage))
const DietPage = defineAsyncComponent(() => import('../diet/index.js').then((module) => module.DietPage))
const RecipePage = defineAsyncComponent(() => import('../recipe/index.js').then((module) => module.RecipePage))
const GoalsPage = defineAsyncComponent(() => import('../goals/index.js').then((module) => module.GoalsPage))
const LedgerPage = defineAsyncComponent(() => import('../ledger/index.js').then((module) => module.LedgerPage))
const AiResultsPage = defineAsyncComponent(() => import('../ai-results/index.js').then((module) => module.AiResultsPage))
const LifeThoughtsPage = defineAsyncComponent(() => import('../life-thoughts/index.js').then((module) => module.LifeThoughtsPage))
const SystemDatabasePage = defineAsyncComponent(() => import('../system-database/index.js').then((module) => module.SystemDatabasePage))

const active = ref(DEFAULT_MENU_KEY)
const aiResultTaskId = ref('')
const sections = MENU_ITEMS
const session = getAuthSession()
const userName = String(session?.username || session?.email || session?.phone || `用户 ${session?.userId ?? ''}`).trim()
const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
const theme = ref(savedTheme === 'night' ? 'night' : 'day')
const transitionClass = ref('')
let transitionTimer = 0

const isNightMode = computed(() => theme.value === 'night')

function openAiResultPreview(taskId) {
  aiResultTaskId.value = String(taskId ?? '').trim()
  if (aiResultTaskId.value) active.value = 'ai-results'
}

function toggleTheme() {
  const nextTheme = isNightMode.value ? 'day' : 'night'
  window.clearTimeout(transitionTimer)
  transitionClass.value = nextTheme === 'night' ? 'theme-fade-to-night' : 'theme-fade-to-day'
  theme.value = nextTheme
  window.localStorage.setItem(THEME_STORAGE_KEY, theme.value)
  transitionTimer = window.setTimeout(() => {
    transitionClass.value = ''
  }, THEME_TRANSITION_MS)
}

onBeforeUnmount(() => window.clearTimeout(transitionTimer))
</script>

<style scoped>
.dashboard {
  --dashboard-bg: #fdf8f8;
  --dashboard-surface: #ffffff;
  --dashboard-surface-soft: #f7f3f2;
  --dashboard-surface-muted: #f1edec;
  --dashboard-border: #c4c7c7;
  --dashboard-border-soft: rgba(196, 199, 199, 0.56);
  --dashboard-text: #1c1b1b;
  --dashboard-text-strong: #000000;
  --dashboard-text-muted: #5c5f61;
  --dashboard-accent: #1c1b1a;
  --dashboard-accent-contrast: #ffffff;
  --dashboard-hover: #e0e3e5;
  --dashboard-shadow: 0 18px 50px rgba(28, 27, 27, 0.08);
  min-height: 100vh;
  display: flex;
  background: var(--dashboard-bg);
  color: var(--dashboard-text);
  overflow-x: hidden;
  transition: background 2s ease, color 2s ease;
}

.dashboard::after {
  position: fixed;
  inset: 0;
  z-index: 999;
  pointer-events: none;
  content: '';
  opacity: 0;
}

.dashboard.theme-fade-to-day::after {
  background: #ffffff;
  animation: theme-fade-flash 2s ease both;
}

.dashboard.theme-fade-to-night::after {
  background: #000000;
  animation: theme-fade-flash 2s ease both;
}

.dashboard[data-theme='night'] {
  --dashboard-bg: #111318;
  --dashboard-surface: #1a1d24;
  --dashboard-surface-soft: #151820;
  --dashboard-surface-muted: #20242d;
  --dashboard-border: #303640;
  --dashboard-border-soft: rgba(109, 119, 136, 0.3);
  --dashboard-text: #e6e8ec;
  --dashboard-text-strong: #ffffff;
  --dashboard-text-muted: #a7afbc;
  --dashboard-accent: #f6c85f;
  --dashboard-accent-contrast: #19140b;
  --dashboard-hover: #242a34;
  --dashboard-shadow: 0 18px 60px rgba(0, 0, 0, 0.34);
}

@keyframes theme-fade-flash {
  0% {
    opacity: 0;
  }

  45% {
    opacity: 0.38;
  }

  100% {
    opacity: 0;
  }
}

.content {
  flex: 1;
  min-width: 0;
  margin-left: 256px;
  padding: 0;
  min-height: 100vh;
}

@media (max-width: 900px) {
  .dashboard {
    flex-direction: column;
  }

  .content {
    margin-left: 0;
  }
}
</style>
