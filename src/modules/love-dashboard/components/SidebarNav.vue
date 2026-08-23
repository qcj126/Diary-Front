<template>
  <aside class="sidebar">
    <div class="brand-block">
      <div class="brand-icon">
        <span class="material-symbols-outlined">auto_stories</span>
      </div>
      <div>
        <h2 class="brand">时光记</h2>
        <p>记录生活点滴</p>
      </div>
    </div>

    <nav class="nav">
      <button
        v-for="item in sections"
        :key="item.key"
        type="button"
        class="nav-item"
        :class="{ active: item.key === modelValue }"
        @click="$emit('update:modelValue', item.key)"
      >
        <span class="material-symbols-outlined">{{ item.icon }}</span>
        <span>{{ item.label }}</span>
      </button>
    </nav>

    <button class="quick-button" type="button">快速记录</button>

    <div class="profile">
      <div class="profile-row">
        <div class="avatar">陈</div>
        <div>
          <strong>陈子墨</strong>
          <span>普通用户</span>
        </div>
        <button
          class="theme-toggle"
          type="button"
          :aria-label="isNightMode ? 'Switch to day mode' : 'Switch to night mode'"
          :title="isNightMode ? 'Day mode' : 'Night mode'"
          @click="$emit('toggle-theme')"
        >
          <span class="material-symbols-outlined">{{ isNightMode ? 'dark_mode' : 'light_mode' }}</span>
        </button>
      </div>

      <a href="#" aria-label="版本信息">
        <span class="material-symbols-outlined">info</span>
        <span>版本信息 v2.4.0</span>
      </a>
    </div>
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
  isNightMode: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['update:modelValue', 'toggle-theme'])
</script>

<style scoped>
.sidebar {
  position: fixed;
  inset: 0 auto 0 0;
  z-index: 20;
  display: flex;
  flex-direction: column;
  width: 256px;
  padding: 24px;
  border-right: 1px solid var(--dashboard-border, #c4c7c7);
  background: var(--dashboard-surface-soft, #f7f3f2);
  color: var(--dashboard-text, #1c1b1b);
  font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.brand-block {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 40px;
}

.brand-icon {
  display: grid;
  width: 40px;
  height: 40px;
  place-items: center;
  border-radius: 8px;
  background: var(--dashboard-accent, #000000);
  color: var(--dashboard-accent-contrast, #ffffff);
}

.brand {
  margin: 0;
  color: var(--dashboard-text-strong, #000000);
  font-size: 24px;
  line-height: 1;
  font-weight: 600;
}

.brand-block p {
  margin: 4px 0 0;
  color: var(--dashboard-text-muted, rgba(68, 71, 72, 0.7));
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.05em;
}

.nav {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  gap: 4px;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 24px;
  text-align: left;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--dashboard-text-muted, #444748);
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  line-height: 16px;
  padding: 12px 24px;
  transition: background 0.2s, color 0.2s;
}

.nav-item:hover {
  background: var(--dashboard-hover, #e0e3e5);
  color: var(--dashboard-text, #1c1b1b);
}

.nav-item.active {
  background: var(--dashboard-accent, #000000);
  color: var(--dashboard-accent-contrast, #ffffff);
  font-weight: 700;
}

.quick-button {
  width: 100%;
  min-height: 48px;
  margin: 24px 0;
  border: 0;
  border-radius: 12px;
  background: var(--dashboard-accent, #1c1b1a);
  color: var(--dashboard-accent-contrast, #ffffff);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.quick-button:hover {
  opacity: 0.9;
}

.profile {
  margin-top: auto;
  padding-top: 24px;
  border-top: 1px solid var(--dashboard-border, #c4c7c7);
}

.profile-row {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 24px;
}

.avatar {
  display: grid;
  width: 40px;
  height: 40px;
  place-items: center;
  border-radius: 999px;
  background: linear-gradient(135deg, var(--dashboard-accent, #101828), var(--dashboard-text-muted, #77716f));
  color: var(--dashboard-accent-contrast, #ffffff);
  font-weight: 700;
}

.profile strong,
.profile span {
  display: block;
}

.profile strong {
  font-size: 14px;
}

.profile-row span {
  color: var(--dashboard-text-muted, #444748);
  font-size: 12px;
}

.theme-toggle {
  display: grid;
  width: 36px;
  height: 36px;
  margin-left: auto;
  place-items: center;
  border: 1px solid var(--dashboard-border, #c4c7c7);
  border-radius: 999px;
  background: var(--dashboard-surface, #ffffff);
  color: var(--dashboard-accent, #1c1b1a);
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, color 0.2s, transform 0.2s;
}

.theme-toggle:hover {
  border-color: var(--dashboard-accent, #1c1b1a);
  background: var(--dashboard-accent, #1c1b1a);
  color: var(--dashboard-accent-contrast, #ffffff);
  transform: translateY(-1px);
}

.theme-toggle .material-symbols-outlined {
  font-size: 20px;
}

.profile a {
  display: flex;
  align-items: center;
  gap: 24px;
  color: var(--dashboard-text-muted, #444748);
  text-decoration: none;
  font-size: 10px;
  font-weight: 600;
}

.profile a:hover {
  color: var(--dashboard-text-strong, #000000);
}

@media (max-width: 900px) {
  .sidebar {
    position: sticky;
    top: 0;
    width: 100%;
    min-height: 0;
    padding: 16px;
    border-right: none;
    border-bottom: 1px solid var(--dashboard-border, #c4c7c7);
  }

  .brand-block {
    margin-bottom: 16px;
  }

  .nav {
    flex-direction: row;
    flex: none;
    overflow-x: auto;
    overflow-y: hidden;
    padding-bottom: 4px;
  }

  .nav-item {
    flex: 0 0 auto;
    gap: 8px;
    padding: 10px 14px;
  }

  .quick-button,
  .profile {
    display: none;
  }
}
</style>
