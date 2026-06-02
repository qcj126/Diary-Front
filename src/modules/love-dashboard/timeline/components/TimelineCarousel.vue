<template>
  <div class="carousel-shell" @mouseenter="pause" @mouseleave="resume">
    <div ref="viewportRef" class="carousel-viewport">
      <div class="carousel-track" :style="trackStyle">
        <article
          v-for="(event, index) in renderEvents"
          :key="`${event.id}-${index}`"
          class="timeline-card group"
        >
          <div class="card-aura" aria-hidden="true" />
          <img :src="event.imageUrl" :alt="event.title" class="card-image" />
          <div class="card-overlay">
            <span class="card-date">{{ formatDate(event.date) }}</span>
            <h3 class="card-title">{{ event.title }}</h3>
            <p class="card-content">{{ event.content }}</p>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps({
  events: {
    type: Array,
    required: true,
  },
})

const viewportRef = ref(null)
const cardStep = ref(352)
const offset = ref(0)
const isReady = ref(false)
const isPlaying = ref(true)

let animationId = null
let resizeHandler = null
let lastTimestamp = 0

const gap = 32
const desktopCardWidth = 320
const tabletCardWidth = 280
const mobileCardWidth = 240
const speedPxPerSecond = 118
const manualStepCount = 1

const normalizedEvents = computed(() => {
  if (!props.events.length) return []

  const source = props.events.length >= 20 ? props.events.slice(0, 20) : props.events
  const filled = []
  const minimumItems = Math.max(20, source.length)

  for (let i = 0; i < minimumItems; i += 1) {
    filled.push(source[i % source.length])
  }

  return filled
})

const renderEvents = computed(() => [...normalizedEvents.value, ...normalizedEvents.value])
const loopWidth = computed(() => normalizedEvents.value.length * cardStep.value)

const trackStyle = computed(() => ({
  transform: `translate3d(-${offset.value}px, 0, 0)`,
  opacity: isReady.value ? 1 : 0,
}))

function updateMetrics() {
  const width = viewportRef.value?.clientWidth ?? 0
  if (!width) return

  let currentCardWidth = desktopCardWidth
  if (width < 640) {
    currentCardWidth = mobileCardWidth
  } else if (width < 1080) {
    currentCardWidth = tabletCardWidth
  }

  cardStep.value = currentCardWidth + gap

  if (loopWidth.value > 0) {
    offset.value %= loopWidth.value
  }

  isReady.value = true
}

function tick(timestamp) {
  if (!isPlaying.value) return
  if (!lastTimestamp) lastTimestamp = timestamp

  const delta = timestamp - lastTimestamp
  lastTimestamp = timestamp

  offset.value += (speedPxPerSecond * delta) / 1000

  if (loopWidth.value > 0 && offset.value >= loopWidth.value) {
    offset.value -= loopWidth.value
  }

  animationId = requestAnimationFrame(tick)
}

function start() {
  if (animationId || !renderEvents.value.length) return
  lastTimestamp = 0
  animationId = requestAnimationFrame(tick)
}

function stop() {
  if (animationId) {
    cancelAnimationFrame(animationId)
    animationId = null
  }
}

function pause() {
  isPlaying.value = false
  stop()
}

function resume() {
  if (!renderEvents.value.length) return
  isPlaying.value = true
  start()
}

function move(direction = 1) {
  if (!loopWidth.value) return
  offset.value += cardStep.value * manualStepCount * direction

  while (offset.value < 0) {
    offset.value += loopWidth.value
  }

  while (offset.value >= loopWidth.value) {
    offset.value -= loopWidth.value
  }
}

function formatDate(date) {
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return date

  const year = parsed.getFullYear()
  const month = String(parsed.getMonth() + 1).padStart(2, '0')
  const day = String(parsed.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

onMounted(() => {
  updateMetrics()
  resizeHandler = () => updateMetrics()
  window.addEventListener('resize', resizeHandler)
  start()
})

onBeforeUnmount(() => {
  stop()
  if (resizeHandler) {
    window.removeEventListener('resize', resizeHandler)
  }
})

defineExpose({
  next: () => move(1),
  prev: () => move(-1),
  pause,
  resume,
})
</script>

<style scoped>
.carousel-shell {
  width: 100%;
  height: 100%;
  position: relative;
  isolation: isolate;
}

.carousel-shell::before,
.carousel-shell::after {
  content: '';
  position: absolute;
  top: -1rem;
  bottom: -1rem;
  width: min(9rem, 18vw);
  z-index: 2;
  pointer-events: none;
}

.carousel-shell::before {
  left: 0;
  background: linear-gradient(90deg, #131315 0%, rgba(19, 19, 21, 0.78) 38%, transparent 100%);
}

.carousel-shell::after {
  right: 0;
  background: linear-gradient(270deg, #131315 0%, rgba(19, 19, 21, 0.78) 38%, transparent 100%);
}

.carousel-viewport {
  width: 100%;
  height: 100%;
  overflow: hidden;
  padding: 0 1.5rem 1.25rem;
}

.carousel-track {
  display: flex;
  gap: 2rem;
  width: max-content;
  height: 100%;
  will-change: transform;
  transition: opacity 0.2s ease;
}

.timeline-card {
  position: relative;
  width: 320px;
  aspect-ratio: 4 / 5;
  border-radius: 2rem;
  overflow: hidden;
  flex-shrink: 0;
  cursor: pointer;
  transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
  background:
    linear-gradient(145deg, rgba(38, 22, 60, 0.78), rgba(14, 14, 16, 0.64)),
    rgba(38, 22, 60, 0.6);
  backdrop-filter: blur(12px);
  border: 0.5px solid rgba(255, 255, 255, 0.12);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    0 18px 44px rgba(0, 0, 0, 0.28);
}

.timeline-card:hover {
  transform: scale(1.04) translateY(-8px);
  border-color: #d1bcff;
  box-shadow:
    0 0 30px rgba(209, 188, 255, 0.2),
    0 26px 62px rgba(0, 0, 0, 0.42);
  z-index: 10;
}

.timeline-card::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  background:
    linear-gradient(120deg, transparent 0%, rgba(255, 255, 255, 0.18) 18%, transparent 36%),
    radial-gradient(circle at 30% 20%, rgba(0, 240, 255, 0.22), transparent 34%);
  opacity: 0;
  transform: translateX(-35%);
  transition: opacity 0.45s ease, transform 0.7s cubic-bezier(0.23, 1, 0.32, 1);
}

.timeline-card:hover::before {
  opacity: 1;
  transform: translateX(35%);
}

.card-aura {
  position: absolute;
  inset: -40%;
  z-index: 0;
  background:
    radial-gradient(circle at 25% 25%, rgba(0, 240, 255, 0.34), transparent 28%),
    radial-gradient(circle at 72% 76%, rgba(112, 0, 255, 0.36), transparent 28%);
  filter: blur(34px);
  opacity: 0.48;
  transition: opacity 0.5s ease;
}

.timeline-card:hover .card-aura {
  opacity: 0.8;
}

.card-image {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  filter: grayscale(0.2);
  transition: all 0.7s ease;
}

.timeline-card:hover .card-image {
  filter: grayscale(0);
}

.card-overlay {
  position: absolute;
  inset: 0;
  z-index: 3;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 2rem;
  background:
    linear-gradient(180deg, transparent 0%, rgba(19, 19, 21, 0.2) 35%, #131315 100%),
    linear-gradient(35deg, rgba(0, 240, 255, 0.08), transparent 38%, rgba(209, 188, 255, 0.12));
}

.card-date {
  width: fit-content;
  margin-bottom: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  background: rgba(0, 240, 255, 0.1);
  color: #00f0ff;
  border: 1px solid rgba(0, 240, 255, 0.18);
  box-shadow: 0 0 18px rgba(0, 240, 255, 0.16);
  font-family: Inter, sans-serif;
  font-size: 14px;
  line-height: 1.2;
  letter-spacing: 0.05em;
  font-weight: 600;
}

.card-title {
  margin: 0 0 0.75rem;
  color: #fff;
  font-family: Manrope, Inter, sans-serif;
  font-size: 32px;
  line-height: 1.2;
  font-weight: 700;
  letter-spacing: -0.01em;
  text-shadow: 0 2px 18px rgba(0, 0, 0, 0.5);
}

.card-content {
  margin: 0;
  color: #b9cacb;
  font-family: Inter, sans-serif;
  font-size: 16px;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

@media (max-width: 1080px) {
  .timeline-card {
    width: 280px;
  }

  .card-title {
    font-size: 26px;
  }
}

@media (max-width: 640px) {
  .carousel-viewport {
    padding: 0 1rem;
  }

  .timeline-card {
    width: 240px;
    border-radius: 1.5rem;
  }

  .card-overlay {
    padding: 1.25rem;
  }

  .card-title {
    font-size: 22px;
  }

  .card-content {
    font-size: 14px;
  }
}
</style>
