<template>
  <aside class="sidebar">
    <h2 class="brand">DiaryLove</h2>
    <nav class="nav">
      <button
        v-for="item in sections"
        :key="item.key"
        type="button"
        class="nav-item"
        :class="{ active: item.key === modelValue }"
        @click="$emit('update:modelValue', item.key)"
      >
        {{ item.label }}
      </button>
    </nav>
  </aside>
</template>

<script setup>
defineProps({
  modelValue: {
    type: String,
    required: true,
  },
  sections: {
    type: Array,
    required: true,
  },
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
.sidebar {
  width: 260px;
  min-width: 260px;
  background: #0f172a;
  color: #e2e8f0;
  padding: 1.25rem 0.8rem;
  border-right: 1px solid rgba(148, 163, 184, 0.15);
}

.brand {
  margin: 0 0 1rem;
  padding: 0 0.6rem;
  font-size: 1.2rem;
  color: #fff;
}

.nav {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.nav-item {
  text-align: left;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: #cbd5e1;
  cursor: pointer;
  font-size: 0.95rem;
  padding: 0.62rem 0.75rem;
  transition: background 0.2s, color 0.2s;
}

.nav-item:hover {
  background: rgba(99, 102, 241, 0.18);
  color: #fff;
}

.nav-item.active {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.35), rgba(14, 165, 233, 0.35));
  color: #fff;
}

@media (max-width: 900px) {
  .sidebar {
    width: 100%;
    min-width: 0;
    border-right: none;
    border-bottom: 1px solid rgba(148, 163, 184, 0.15);
  }
}
</style>
