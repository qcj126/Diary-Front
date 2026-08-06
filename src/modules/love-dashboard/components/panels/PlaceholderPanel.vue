<template>
  <section class="panel">
    <h2 class="title">{{ title }}</h2>
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

.title {
  display: flex;
  align-items: center;
  min-height: 56px;
  margin: 0;
  padding: 0 1.5rem;
  font-size: 1.75rem;
  line-height: 1.2;
  color: #0f172a;
}
</style>
