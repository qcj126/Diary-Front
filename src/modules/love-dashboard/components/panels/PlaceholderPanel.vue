<template>
  <section class="panel">
    <header class="title-header">
      <h2 class="title">{{ title }}</h2>
    </header>
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
  min-height: 100vh;
  background: #fff;
  padding: 1rem;
}

.title-header {
  display: flex;
  align-items: center;
  height: 72px;
  min-height: 72px;
  margin: -1rem -1rem 0;
  padding: 0 2.5rem;
  background-color: #fff8f6;
  border-bottom: 1px solid rgba(220, 193, 185, 0.72);
}

.title {
  margin: 0;
  font-size: 1.75rem;
  line-height: 1.2;
  color: #1d1b1a;
}
</style>
