<template>
  <article
    class="event-card"
    :class="{ selected }"
    :style="cardStyle"
    role="button"
    tabindex="0"
    @click="$emit('select', event)"
    @keydown.enter.prevent="$emit('select', event)"
    @keydown.space.prevent="$emit('select', event)"
  >
    <div class="card-layout">
      <div class="card-main">
        <div class="card-header">
          <span class="event-icon">{{ eventIcon }}</span>
        </div>

        <div class="card-body">
          <h3 class="event-title">{{ event.title }}</h3>
          <p class="event-content">{{ event.content }}</p>
        </div>

        <div class="card-footer">
          <span class="category-tag" :style="tagStyle">{{ categoryLabel }}</span>
        </div>
      </div>

      <aside class="card-side">
        <span class="event-date">{{ event.date }}</span>
        <div class="event-image-frame">
          <img v-if="event.imageUrl" :src="event.imageUrl" :alt="event.title" />
          <span v-else>照片</span>
        </div>
      </aside>
    </div>

    <label class="card-check" aria-label="选择记录卡片" @click.stop>
      <input
        type="checkbox"
        :checked="selected"
        @change="$emit('toggle-selection', event.id)"
      />
    </label>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import { COLOR_MAP } from '../constants/eventCategories.js'

const props = defineProps({
  event: {
    type: Object,
    required: true
  },
  categoryLabel: {
    type: String,
    default: ''
  },
  eventIcon: {
    type: String,
    default: '📝'
  },
  selected: {
    type: Boolean,
    default: false
  }
})

defineEmits(['select', 'toggle-selection'])

const colorScheme = computed(() => {
  return COLOR_MAP[props.event.color] || COLOR_MAP.blue
})

const cardStyle = computed(() => ({
  borderLeft: `4px solid ${colorScheme.value.primary}`
}))

const tagStyle = computed(() => ({
  background: colorScheme.value.light,
  color: colorScheme.value.primary
}))
</script>

<style scoped>
.event-card {
  position: relative;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.16), rgba(255, 255, 255, 0.07)),
    rgba(22, 20, 31, 0.54);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 10px;
  padding: 1rem;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.18),
    0 10px 28px rgba(0, 0, 0, 0.24);
  backdrop-filter: blur(16px) saturate(135%);
  -webkit-backdrop-filter: blur(16px) saturate(135%);
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  outline: none;
  height: 100%;
  min-height: 0;
}

.event-card.selected {
  border-color: rgba(125, 244, 255, 0.72);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.24),
    0 0 0 2px rgba(125, 244, 255, 0.18),
    0 16px 34px rgba(0, 0, 0, 0.32);
}

.card-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(104px, 34%);
  gap: 0.8rem;
  height: 100%;
  min-height: 0;
}

.card-main {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  min-width: 0;
  min-height: 0;
}

.card-side {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.55rem;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.event-card:hover {
  border-color: rgba(209, 188, 255, 0.36);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.24),
    0 16px 34px rgba(0, 0, 0, 0.32),
    0 0 22px rgba(125, 244, 255, 0.1);
  transform: translateY(-2px);
}

.event-card:focus-visible {
  box-shadow:
    0 0 0 3px rgba(125, 244, 255, 0.24),
    inset 0 1px 0 rgba(255, 255, 255, 0.22),
    0 16px 34px rgba(0, 0, 0, 0.32);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  min-height: 1.5rem;
}

.event-icon {
  font-size: 1.5rem;
}

.event-date {
  font-size: 0.8rem;
  color: #b8c7d9;
  font-weight: 500;
  text-align: right;
  white-space: nowrap;
}

.event-image-frame {
  width: 82%;
  max-width: 132px;
  max-height: calc(100% - 1.75rem);
  aspect-ratio: 4 / 3;
  flex-shrink: 1;
  overflow: hidden;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.18);
  display: grid;
  place-items: center;
  color: #b8c7d9;
  font-size: 0.78rem;
}

.event-image-frame img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.card-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-right: 0.35rem;
}

.event-title {
  margin: 0 0 0.5rem;
  font-size: 1rem;
  color: #f8fbff;
  font-weight: 600;
}

.event-content {
  margin: 0;
  font-size: 0.9rem;
  color: #c9d3df;
  line-height: 1.5;
}

.card-body::-webkit-scrollbar {
  width: 4px;
}

.card-body::-webkit-scrollbar-track {
  background: transparent;
}

.card-body::-webkit-scrollbar-thumb {
  background: rgba(203, 213, 225, 0.5);
  border-radius: 999px;
}

.card-body::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.8);
}

.card-footer {
  display: flex;
  justify-content: flex-start;
  flex-shrink: 0;
}

.category-tag {
  display: inline-block;
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  backdrop-filter: blur(8px);
}

.card-check {
  position: absolute;
  right: 0.72rem;
  bottom: 0.64rem;
  display: inline-grid;
  width: 1.05rem;
  height: 1.05rem;
  place-items: center;
  border-radius: 4px;
  background: rgba(10, 14, 20, 0.62);
  cursor: pointer;
}

.card-check input {
  width: 0.78rem;
  height: 0.78rem;
  margin: 0;
  accent-color: #7df4ff;
  cursor: pointer;
}
</style>
