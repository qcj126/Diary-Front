<template>
  <article
    class="event-card"
    :style="cardStyle"
    role="button"
    tabindex="0"
    @click="$emit('select', event)"
    @keydown.enter.prevent="$emit('select', event)"
    @keydown.space.prevent="$emit('select', event)"
  >
    <div class="card-header">
      <span class="event-icon">{{ eventIcon }}</span>
      <span class="event-date">{{ event.date }}</span>
    </div>
    
    <div class="card-body">
      <h3 class="event-title">{{ event.title }}</h3>
      <p class="event-content">{{ event.content }}</p>
    </div>
    
    <div class="card-footer">
      <span class="category-tag" :style="tagStyle">{{ categoryLabel }}</span>
    </div>
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
  }
})

defineEmits(['select'])

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
  background: #fff;
  border-radius: 10px;
  padding: 1rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  cursor: pointer;
  outline: none;
}

.event-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.event-card:focus-visible {
  box-shadow:
    0 0 0 3px rgba(99, 102, 241, 0.24),
    0 4px 12px rgba(0, 0, 0, 0.12);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.event-icon {
  font-size: 1.5rem;
}

.event-date {
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 500;
}

.card-body {
  flex: 1;
}

.event-title {
  margin: 0 0 0.5rem;
  font-size: 1rem;
  color: #0f172a;
  font-weight: 600;
}

.event-content {
  margin: 0;
  font-size: 0.9rem;
  color: #475569;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  display: flex;
  justify-content: flex-start;
}

.category-tag {
  display: inline-block;
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
}
</style>
