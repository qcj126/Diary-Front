<template>
  <section class="home-panel">
    <header class="top">
      <h1 class="name">小加爱小媛</h1>
    </header>

    <section class="timeline">
      <article v-for="item in nearestTimeline" :key="item.id" class="event">
        <p class="event-date">{{ formatDate(item.date) }}</p>
        <h3 class="event-title">{{ item.title }}</h3>
        <p class="event-content">{{ item.content }}</p>
      </article>
    </section>

    <section class="bottom">
      <article class="card anniversary">
        <h3>纪念日卡片</h3>
        <p>{{ startDate }} 开始相恋</p>
        <p>在一起 {{ milestone.daysTogether }} 天</p>
        <p>下一个 100 天节点（{{ milestone.nextMilestone }} 天）还有 {{ milestone.daysToNext }} 天</p>
      </article>

      <article class="card board">
        <h3>恋爱留言板（最新未读 2 条）</h3>
        <div v-if="unreadMessages.length" class="messages">
          <div v-for="msg in unreadMessages" :key="msg.id" class="message">
            <p class="meta">{{ msg.author }} · {{ msg.date }}</p>
            <p class="text">{{ msg.content }}</p>
          </div>
        </div>
        <p v-else class="empty">暂无未读留言</p>
      </article>
    </section>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { formatDate, milestoneInfo } from '../../../shared/utils/date.js'

const props = defineProps({
  timeline: {
    type: Array,
    required: true,
  },
  messages: {
    type: Array,
    required: true,
  },
  startDate: {
    type: String,
    required: true,
  },
})

const nearestTimeline = computed(() =>
  [...props.timeline]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4),
)

const unreadMessages = computed(() =>
  props.messages
    .filter((x) => !x.read)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 2),
)

const milestone = computed(() => milestoneInfo(props.startDate, 100))
</script>

<style scoped>
.home-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.name {
  margin: 0;
  font-size: clamp(1.35rem, 3vw, 1.9rem);
  color: #0f172a;
}

.timeline {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.8rem;
}

.event {
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 0.85rem;
  background: #fff;
}

.event-date {
  margin: 0 0 0.2rem;
  color: #6366f1;
  font-size: 0.8rem;
}

.event-title {
  margin: 0 0 0.3rem;
  font-size: 1rem;
  color: #0f172a;
}

.event-content {
  margin: 0;
  color: #475569;
  font-size: 0.9rem;
  line-height: 1.5;
}

.bottom {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.8rem;
}

.card {
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 0.85rem;
  background: #fff;
}

.card h3 {
  margin: 0 0 0.45rem;
  color: #0f172a;
}

.card p {
  margin: 0.2rem 0;
  color: #475569;
}

.messages {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.message {
  background: #f8fafc;
  border-radius: 10px;
  padding: 0.55rem 0.6rem;
}

.meta {
  margin: 0 0 0.15rem;
  color: #64748b;
  font-size: 0.75rem;
}

.text {
  margin: 0;
  font-size: 0.88rem;
}

.empty {
  margin: 0;
  color: #64748b;
}

@media (max-width: 960px) {
  .timeline,
  .bottom {
    grid-template-columns: 1fr;
  }
}
</style>
