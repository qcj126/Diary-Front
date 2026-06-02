<template>
  <div class="timeline-page">
    <header class="timeline-header">
      <h1>恋爱时光轴</h1>
    </header>

    <section class="hero-copy">
      <span class="hero-kicker">Love Timeline · Neon Glow</span>
      <h2>岁月如歌，瞬间永恒</h2>
      <p>
        沿着记忆的轨迹，回望我们一起发光的节点。时间不再只是数字，而是被照片、心动和陪伴点亮的故事。
      </p>
    </section>

    <div class="carousel-section">
      <TimelineCarousel ref="carouselRef" :events="recentEvents" />
    </div>

    <div class="carousel-actions">
      <button class="action-btn" type="button" aria-label="上一张" @click="goPrev">
        <span class="material-symbols-outlined">chevron_left</span>
      </button>
      <div class="action-dots">
        <span class="dot active" />
        <span class="dot" />
        <span class="dot" />
        <span class="dot" />
      </div>
      <button class="action-btn" type="button" aria-label="下一张" @click="goNext">
        <span class="material-symbols-outlined">chevron_right</span>
      </button>
    </div>

    <div class="events-section">
      <div class="category-nav-area">
        <TimelineCategoryNav
          :categories="categories"
          :selected-category="selectedCategory"
          :selected-subcategory="selectedSubcategory"
          @update:category="selectCategory"
          @update:subcategory="selectSubcategory"
        />
      </div>

      <div class="event-list-area">
        <TimelineEventList
          :currentPageEvents="currentPageEvents"
          :currentPage="currentPage"
          :totalPages="totalPages"
          :hasMore="hasMore"
          :totalEventsCount="totalEventsCount"
          @load-more="loadMore"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { EVENT_CATEGORIES } from './constants/eventCategories.js'
import TimelineCarousel from './components/TimelineCarousel.vue'
import TimelineCategoryNav from './components/TimelineCategoryNav.vue'
import TimelineEventList from './components/TimelineEventList.vue'
import { useTimelineEvents } from './composables/useTimelineEvents.js'

const categories = EVENT_CATEGORIES
const carouselRef = ref(null)

const {
  selectedCategory,
  selectedSubcategory,
  currentPage,
  recentEvents,
  currentPageEvents,
  totalPages,
  hasMore,
  loadMore,
  selectCategory,
  selectSubcategory,
  totalEventsCount,
} = useTimelineEvents()

function goPrev() {
  carouselRef.value?.prev()
}

function goNext() {
  carouselRef.value?.next()
}
</script>

<style scoped>
.timeline-page {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  color: #e5e1e4;
  background:
    radial-gradient(circle at 12% 8%, rgba(0, 240, 255, 0.2) 0, transparent 34%),
    radial-gradient(circle at 84% 18%, rgba(255, 172, 232, 0.15) 0, transparent 28%),
    radial-gradient(circle at 86% 86%, rgba(112, 0, 255, 0.22) 0, transparent 34%),
    linear-gradient(135deg, #0e0e10 0%, #1a0b2e 50%, #2d1052 100%),
    #131315;
  overflow: hidden;
}

.timeline-page::before {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
  background-size: 42px 42px;
  mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.7), transparent 70%);
}

.material-symbols-outlined {
  font-family: 'Material Symbols Outlined';
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  font-size: 28px;
  line-height: 1;
}

.timeline-header {
  display: flex;
  align-items: center;
  min-height: 68px;
  padding: 0 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(14, 14, 16, 0.46);
  backdrop-filter: blur(18px);
  border-radius: 1rem;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.timeline-header h1 {
  margin: 0;
  color: #dbfcff;
  font-family: Manrope, Inter, sans-serif;
  font-size: 1.75rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  text-shadow: 0 0 18px rgba(0, 240, 255, 0.32);
}

.hero-copy {
  padding: 0.5rem 1rem 0;
}

.hero-kicker {
  display: inline-flex;
  margin-bottom: 0.6rem;
  padding: 0.35rem 0.85rem;
  border: 1px solid rgba(0, 240, 255, 0.2);
  border-radius: 999px;
  background: rgba(0, 240, 255, 0.08);
  color: #7df4ff;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  box-shadow: 0 0 20px rgba(0, 240, 255, 0.14);
}

.hero-copy h2 {
  margin: 0 0 0.6rem;
  color: #e5e1e4;
  font-family: Manrope, Inter, sans-serif;
  font-size: clamp(2rem, 4vw, 3rem);
  line-height: 1.1;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.hero-copy p {
  margin: 0;
  max-width: 48rem;
  color: #b9cacb;
  font-size: 0.95rem;
  line-height: 1.6;
}

.carousel-section {
  height: 340px;
  margin-inline: -1rem;
  overflow: hidden;
}

.carousel-actions {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  margin-top: -0.5rem;
}

.action-btn {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  border: 1px solid #00f0ff;
  background: transparent;
  color: #00f0ff;
  box-shadow: 0 0 15px rgba(0, 240, 255, 0.2);
  cursor: pointer;
  transition: background 0.25s ease, box-shadow 0.25s ease, color 0.25s ease, transform 0.25s ease;
}

.action-btn:hover {
  background: #00f0ff;
  color: #131315;
  box-shadow: 0 0 28px rgba(0, 240, 255, 0.42);
  transform: translateY(-2px);
}

.action-btn:active {
  transform: translateY(0) scale(0.97);
}

.action-dots {
  display: flex;
  gap: 0.75rem;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 999px;
  background: #353437;
}

.dot.active {
  background: #00f0ff;
  box-shadow: 0 0 8px #00f0ff;
}

.events-section {
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 1rem;
  flex: 1;
  min-height: 0;
  margin-top: -0.5rem;
}

.category-nav-area {
  height: calc(100vh - 560px);
  overflow-y: auto;
  padding: 0.75rem;
  border: 0.5px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  background: rgba(32, 31, 33, 0.6);
  backdrop-filter: blur(12px);
}

.event-list-area {
  height: calc(100vh - 560px);
  overflow-y: auto;
  border-radius: 1rem;
}

.event-list-area::-webkit-scrollbar,
.category-nav-area::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

.event-list-area::-webkit-scrollbar-track,
.category-nav-area::-webkit-scrollbar-track {
  background: transparent;
}

.event-list-area::-webkit-scrollbar-thumb,
.category-nav-area::-webkit-scrollbar-thumb {
  background: rgba(0, 240, 255, 0.3);
  border-radius: 2px;
}

@media (max-width: 900px) {
  .timeline-page {
    padding: 0.75rem;
  }

  .carousel-section {
    height: 300px;
  }

  .events-section {
    grid-template-columns: 1fr;
  }

  .category-nav-area,
  .event-list-area {
    height: auto;
    max-height: none;
  }
}
</style>
