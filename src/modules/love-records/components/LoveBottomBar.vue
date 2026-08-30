<template>
  <footer class="love-footer"><span>{{ year }}年</span><i /><span>共 <b>{{ stats.records }}</b> 条记录</span><i /><span>去过 <b>{{ stats.locations }}</b> 个地方</span><i /><span>拍了 <b>{{ stats.photos }}</b> 张照片</span><i /><span>最常去 <b>{{ stats.favoriteLocation }}</b></span><span class="sync"><span class="material-symbols-outlined">cloud_done</span>服务端数据已同步</span></footer>
</template>
<script setup lang="ts">
defineProps<{ year: number; stats: { records: number; locations: number; photos: number; favoriteLocation: string } }>()
</script>
<style scoped>
.love-footer{grid-area:foot;z-index:30;display:flex;align-items:center;gap:12px;height:36px;padding:0 22px;border-top:1px solid #f0e5df;color:#a28f8d;background:#fff;font-size:9px;letter-spacing:.03em}.love-footer b{color:#665354}.love-footer i{width:2px;height:2px;border-radius:50%;background:#d7c6c2}.sync{display:flex;align-items:center;gap:5px;margin-left:auto;color:#b09e9b}.sync .material-symbols-outlined{color:#70ab8e;font-size:14px}
</style>
