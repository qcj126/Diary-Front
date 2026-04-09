<template>
  <div class="carousel" @mouseenter="pause" @mouseleave="resume">
    <div class="carousel-track" :style="trackStyle">
      <!-- 复制一份实现无缝循环 -->
      <template v-for="(event, index) in duplicatedEvents" :key="`${event.id}-${index}`">
        <div class="carousel-slide">
          <div class="slide-image">
            <img :src="event.imageUrl" :alt="event.title" />
          </div>
          <div class="slide-info">
            <h3>{{ event.title }}</h3>
            <p class="slide-date">{{ event.date }}</p>
            <p class="slide-content">{{ event.content }}</p>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  events: {
    type: Array,
    required: true
  }
})

const offset = ref(0)
const isPlaying = ref(true)
let animationId = null

// 复制一份事件列表实现无缝循环
const duplicatedEvents = computed(() => {
  return [...props.events, ...props.events]
})

// 每张卡片的宽度(10% = 展示10张)
const slideWidth = 10

// 动画速度(每秒移动的百分比)
const speed = 2 // 每秒移动2%的宽度

const trackStyle = computed(() => ({
  transform: `translateX(-${offset.value}%)`,
  transition: 'none'
}))

function animate() {
  if (!isPlaying.value) return
  
  offset.value += speed / 60 // 每帧移动的距离
  
  // 当移动到一半时(即原始20张的位置),重置到0,实现无缝循环
  if (offset.value >= 50) {
    offset.value = 0
  }
  
  animationId = requestAnimationFrame(animate)
}

function pause() {
  isPlaying.value = false
  if (animationId) {
    cancelAnimationFrame(animationId)
    animationId = null
  }
}

function resume() {
  isPlaying.value = true
  animate()
}

onMounted(() => {
  animate()
})

onBeforeUnmount(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
    animationId = null
  }
})
</script>

<style scoped>
.carousel {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #fff;
}

.carousel-track {
  display: flex;
  height: 100%;
  will-change: transform;
}

.carousel-slide {
  width: 10%; /* 展示10张图 */
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0 0.3rem;
}

.slide-image {
  width: 100%;
  height: 65%;
  flex-shrink: 0;
  overflow: hidden;
  position: relative;
  border-radius: 8px 8px 0 0;
}

.slide-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.slide-info {
  width: 100%;
  height: 35%;
  padding: 0.6rem 0.5rem;
  background: #fff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.25rem;
  border-radius: 0 0 8px 8px;
}

.slide-info h3 {
  margin: 0;
  font-size: 0.9rem;
  color: #0f172a;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.slide-date {
  margin: 0;
  font-size: 0.75rem;
  color: #6366f1;
  font-weight: 500;
}

.slide-content {
  margin: 0;
  font-size: 0.8rem;
  color: #475569;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
