<template>
  <section class="panel">
    <h2 class="title">{{ title }}</h2>
    <p class="desc">该板块已预留模块目录与导航入口，后续可在此独立开发功能页面。</p>
  </section>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
})
</script>

<style scoped>
.panel {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  padding: 1rem;
}

.title {
  margin: 0 0 0.5rem;
  font-size: 1.1rem;
  color: #0f172a;
}

.desc {
  margin: 0;
  color: #64748b;
}
</style>
