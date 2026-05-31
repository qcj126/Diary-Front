<template>
  <div class="dashboard">
    <SidebarNav v-model="active" :sections="sections" />

    <main class="content">
      <HomeOverview
        v-if="active === 'home'"
        :timeline="timeline"
        :messages="messages"
        :start-date="startDate"
      />
      <TimelinePage v-else-if="active === 'timeline'" />
      <DietPage v-else-if="active === 'diet'" />
      <RecipePage v-else-if="active === 'diary'" />
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
import HomeOverview from './components/panels/HomeOverview.vue'
import PlaceholderPanel from './components/panels/PlaceholderPanel.vue'
import TimelinePage from './timeline/TimelinePage.vue'
import DietPage from './diet/DietPage.vue'
import RecipePage from './recipe/RecipePage.vue'
import { LOVE_SECTIONS } from './constants/sections.js'
import { LOVE_START_DATE, MESSAGE_ITEMS, TIMELINE_ITEMS } from './mock/homeData.js'

const active = ref('home')
const sections = LOVE_SECTIONS
const timeline = TIMELINE_ITEMS
const messages = MESSAGE_ITEMS
const startDate = LOVE_START_DATE

const currentLabel = computed(() => sections.find((x) => x.key === active.value)?.label ?? '')
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  display: flex;
  background: #f1f5f9;
}

.content {
  flex: 1;
  min-width: 0;
  padding: 1rem;
}

@media (max-width: 900px) {
  .dashboard {
    flex-direction: column;
  }
}
</style>
