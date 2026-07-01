<template>
  <div class="dashboard" :class="transitionClass" :data-theme="theme">
    <SidebarNav
      v-model="active"
      :sections="sections"
      :is-night-mode="isNightMode"
      @toggle-theme="toggleTheme"
    />

    <main class="content">
      <HomeOverview
        v-if="active === 'home'"
      />
      <TimelinePage v-else-if="active === 'timeline'" />
      <DietPage v-else-if="active === 'diet'" />
      <RecipePage v-else-if="active === 'diary'" />
      <GoalsPage v-else-if="active === 'wishlist'" />
      <LedgerPage v-else-if="active === 'ledger'" />
      <PlaceholderPanel
        v-else
        :title="currentLabel"
      />
    </main>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import SidebarNav from './components/SidebarNav.vue'
import HomeOverview from '../homepage/HomePage.vue'
import PlaceholderPanel from './components/panels/PlaceholderPanel.vue'
import TimelinePage from '../timeline/TimelinePage.vue'
import DietPage from '../diet/DietPage.vue'
import RecipePage from '../recipe/RecipePage.vue'
import GoalsPage from '../goals/GoalsPage.vue'
import LedgerPage from '../ledger/LedgerPage.vue'
import { LOVE_SECTIONS } from './constants/sections.js'

const active = ref('home')
const sections = LOVE_SECTIONS
const THEME_STORAGE_KEY = 'diary-love-theme'
const THEME_TRANSITION_MS = 2000
const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
const theme = ref(savedTheme === 'night' ? 'night' : 'day')
const transitionClass = ref('')
let transitionTimer = 0

const currentLabel = computed(() => sections.find((x) => x.key === active.value)?.label ?? '')
const isNightMode = computed(() => theme.value === 'night')

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
