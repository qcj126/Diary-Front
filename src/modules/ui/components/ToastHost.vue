<template>
  <Teleport to="body">
    <div class="toast-wrap" aria-live="polite" aria-atomic="true">
      <TransitionGroup name="toast">
        <div
          v-for="item in state.items"
          :key="item.id"
          class="toast"
          :class="item.type"
          role="status"
        >
          <span class="text">{{ item.message }}</span>
          <button class="close" type="button" @click="removeToast(item.id)">×</button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { removeToast, useToastState } from '../toast.js'

const state = useToastState()
</script>

<style scoped>
.toast-wrap {
  position: fixed;
  right: 1rem;
  top: 1rem;
  z-index: 3000;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  width: min(88vw, 360px);
}

.toast {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  border-radius: 12px;
  padding: 0.72rem 0.78rem;
  color: #fff;
  backdrop-filter: blur(6px);
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.22);
}

.toast.error {
  background: rgba(239, 68, 68, 0.92);
}

.toast.success {
  background: rgba(22, 163, 74, 0.92);
}

.toast.info {
  background: rgba(79, 70, 229, 0.92);
}

.text {
  flex: 1;
  font-size: 0.86rem;
  line-height: 1.35;
}

.close {
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
  line-height: 1;
  cursor: pointer;
  padding: 0.1rem;
}

.close:hover {
  color: #fff;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.22s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>

