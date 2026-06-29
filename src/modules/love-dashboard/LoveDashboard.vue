<template>
  <div class="dashboard">
    <SidebarNav v-model="active" :sections="sections" />

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

const currentLabel = computed(() => sections.find((x) => x.key === active.value)?.label ?? '')
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  display: flex;
  background: #fdf8f8;
  overflow-x: hidden;
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
