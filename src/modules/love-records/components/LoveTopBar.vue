<template>
  <header class="love-topbar">
    <div class="brand-area">
      <button class="back-button" type="button" aria-label="返回时光记主页" title="返回时光记主页" @click="$emit('back')"><span class="material-symbols-outlined">arrow_back</span></button>
      <button class="brand" type="button" aria-label="恋爱纪念册时间线" @click="$emit('home')"><span>♥</span><strong>恋爱纪念册</strong></button>
    </div>
    <div class="global-status">
      <button type="button" title="前往纪念日设置" @click="$emit('settings')"><b>在一起 {{ togetherDays }} 天</b></button>
      <i />
      <span>下一个纪念日：<b>{{ nextAnniversary.name }}</b> · {{ nextAnniversary.daysLeft === 0 ? '今天' : `${nextAnniversary.daysLeft} 天后` }}</span>
      <i />
      <time>{{ currentDate }}</time>
    </div>
    <button class="partner" type="button" title="编辑对方昵称" @click="$emit('settings')"><span class="avatar">{{ partnerName.slice(0, 1) }}</span><span><small>我的恋人</small><b>{{ partnerName }}</b></span><span class="material-symbols-outlined">edit</span></button>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'

defineProps<{ togetherDays: number; partnerName: string; nextAnniversary: { name: string; daysLeft: number } }>()
defineEmits<{ home: []; settings: []; back: [] }>()

const currentDate = computed(() => new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' }).format(new Date()))
</script>

<style scoped>
.love-topbar{grid-area:top;z-index:30;display:grid;grid-template-columns:240px 1fr 240px;align-items:center;height:70px;border-bottom:1px solid #f0e8e0;background:rgba(255,255,255,.94);backdrop-filter:blur(16px)}button{font:inherit}.brand-area{display:flex;align-items:center;height:100%;padding:0 10px}.back-button{display:grid;place-items:center;width:32px;height:32px;flex:0 0 32px;border:0;border-radius:9px;color:#8d7777;background:#fff5f1;cursor:pointer;transition:.2s}.back-button:hover{color:#fff;background:#ff6b81;transform:translateX(-2px)}.back-button .material-symbols-outlined{font-size:18px}.brand{display:flex;align-items:center;gap:.55rem;height:100%;padding:0 8px;border:0;color:#3b3031;background:transparent;cursor:pointer}.brand>span{display:grid;place-items:center;width:30px;height:30px;border-radius:10px;color:#fff;background:linear-gradient(145deg,#ff6b81,#ff8a80);font-size:16px;box-shadow:0 7px 18px rgba(255,107,129,.25)}.brand strong{font-size:15px;letter-spacing:.01em}.global-status{display:flex;align-items:center;justify-content:center;gap:14px;color:#8d7e7e;font-size:12px}.global-status button{border:0;color:#ff5f78;background:transparent;cursor:pointer}.global-status b{color:#5a4749}.global-status i{width:3px;height:3px;border-radius:50%;background:#d8c7c4}.partner{justify-self:end;display:flex;align-items:center;gap:9px;height:100%;padding:0 24px;border:0;color:#4d3d3e;background:transparent;cursor:pointer}.avatar{display:grid;place-items:center;width:34px;height:34px;border-radius:50%;color:#fff;background:#ff8a80;font-weight:700}.partner>span:nth-child(2){display:grid;text-align:left}.partner small{color:#a89795;font-size:9px}.partner b{font-size:12px}.partner .material-symbols-outlined{color:#c0adab;font-size:16px}.partner:hover{background:#fff7f4}
</style>
