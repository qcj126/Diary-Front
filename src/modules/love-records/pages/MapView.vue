<template>
  <section class="map-view">
    <div ref="mapElement" class="map-canvas" :class="{ fallback: mapFailed }">
      <template v-if="mapFailed">
        <div class="fallback-roads" />
        <button v-for="place in locations" :key="place.name" type="button" class="fallback-marker" :style="{ left: `${place.point.x}%`, top: `${place.point.y}%` }" @click="selectPlace(place)"><span>♥</span><b>{{ place.count }}</b><label>{{ place.name }}</label></button>
      </template>
    </div>
    <div v-if="loading" class="map-loading"><span class="material-symbols-outlined">explore</span><p>正在展开我们的足迹…</p></div>
    <aside class="place-list">
      <header><p>OUR FOOTPRINTS</p><h1>我们的足迹</h1><span>{{ locations.length }} 个地点</span></header>
      <div><button v-for="(place, index) in locations" :key="place.name" type="button" :class="{ active: activePlace === place.name }" @click="selectPlace(place)"><span>{{ String(index + 1).padStart(2, '0') }}</span><span><b>{{ place.name }}</b><small>到访 {{ place.count }} 次 · 最近 {{ place.latest.slice(5).replace('-', '/') }}</small></span><span class="material-symbols-outlined">near_me</span></button></div>
      <footer v-if="mapFailed"><span class="material-symbols-outlined">info</span>在线地图暂不可用，已切换为足迹概览。</footer>
    </aside>
    <div class="map-legend"><span><i class="heart">♥</i>共同足迹</span><span><i />城市道路</span></div>
  </section>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import type { Map as LeafletMap, Marker } from 'leaflet'
import type { LoveRecord } from '../types/records'

type Place = { name: string; count: number; latest: string; point: LoveRecord['point']; recordIds: string[] }
const props = defineProps<{ locations: Place[] }>()
const emit = defineEmits<{ open: [id: string] }>()
const mapElement = ref<HTMLElement | null>(null)
const loading = ref(true)
const mapFailed = ref(false)
const activePlace = ref('')
let map: LeafletMap | null = null
const markers = new Map<string, Marker>()

onMounted(() => { void initializeMap() })
onBeforeUnmount(() => { map?.remove(); map = null })

async function initializeMap(): Promise<void> {
  try {
    // Leaflet 与样式按视图延迟加载；地图服务不可达时 catch 会启用内置静态足迹图。
    await import('leaflet/dist/leaflet.css')
    const L = await import('leaflet')
    await nextTick()
    if (!mapElement.value) return
    map = L.map(mapElement.value, { zoomControl: false, attributionControl: true })
    L.control.zoom({ position: 'bottomright' }).addTo(map)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map)
    const bounds: Array<[number, number]> = []
    props.locations.forEach((place) => {
      const position: [number, number] = [place.point.lat, place.point.lng]
      bounds.push(position)
      const icon = L.divIcon({
        className: 'love-map-marker-wrap',
        html: `<span class="love-map-marker">♥<b>${place.count}</b></span>`,
        iconSize: [38, 38], iconAnchor: [19, 19], popupAnchor: [0, -18],
      })
      const marker = L.marker(position, { icon }).addTo(map!)
      marker.bindPopup(`<div class="love-map-popup"><strong>${place.name}</strong><span>一起到访 ${place.count} 次</span><small>最近 ${place.latest}</small></div>`)
      marker.on('click', () => { activePlace.value = place.name })
      marker.on('dblclick', () => emit('open', place.recordIds[0]))
      markers.set(place.name, marker)
    })
    // 根据所有爱心标记自动调整可视范围，确保首次打开即可看到全部足迹。
    if (bounds.length) map.fitBounds(bounds, { padding: [70, 70], maxZoom: 12 })
    else map.setView([29.56, 106.57], 11)
    window.setTimeout(() => map?.invalidateSize(), 80)
  } catch {
    mapFailed.value = true
  } finally {
    loading.value = false
  }
}

function selectPlace(place: Place): void {
  activePlace.value = place.name
  if (map) {
    map.flyTo([place.point.lat, place.point.lng], Math.max(map.getZoom(), 13), { duration: 0.7 })
    markers.get(place.name)?.openPopup()
  } else if (mapFailed.value) {
    emit('open', place.recordIds[0])
  }
}
</script>

<style scoped>
.map-view{position:relative;height:100%;min-height:560px;overflow:hidden;background:#e7ebe1}.map-canvas{position:absolute;inset:0;z-index:1}.map-canvas.fallback{background:radial-gradient(circle at 75% 70%,rgba(186,214,181,.8),transparent 22%),radial-gradient(circle at 20% 25%,rgba(202,220,191,.7),transparent 25%),linear-gradient(140deg,#f3e7d3,#d9e6da)}.fallback-roads{position:absolute;inset:-20%;opacity:.85;background:linear-gradient(27deg,transparent 48%,rgba(255,255,255,.9) 49% 51%,transparent 52%),linear-gradient(-15deg,transparent 48%,rgba(255,255,255,.75) 49% 51%,transparent 52%);background-size:280px 220px,340px 270px}.map-loading{position:absolute;inset:0;z-index:10;display:grid;place-content:center;justify-items:center;color:#8d9c87;background:rgba(244,239,227,.85);backdrop-filter:blur(3px)}.map-loading .material-symbols-outlined{font-size:36px;animation:spin 1.5s linear infinite}.map-loading p{font-size:10px}.fallback-marker{position:absolute;z-index:2;display:grid;place-items:center;width:36px;height:36px;border:3px solid #fff;border-radius:50%;color:#fff;background:#ff6b81;box-shadow:0 7px 18px rgba(82,53,52,.25);cursor:pointer;transform:translate(-50%,-50%)}.fallback-marker>b{position:absolute;right:-5px;top:-5px;display:grid;place-items:center;min-width:15px;height:15px;border-radius:99px;color:#ff5d75;background:#fff;font-size:7px}.fallback-marker label{position:absolute;top:40px;width:max-content;padding:3px 6px;border-radius:5px;color:#6f5d5c;background:rgba(255,255,255,.9);font-size:8px}.place-list{position:absolute;z-index:7;left:20px;top:20px;bottom:20px;display:grid;grid-template-rows:auto 1fr auto;width:225px;padding:14px;border:1px solid rgba(255,255,255,.75);border-radius:14px;background:rgba(255,255,255,.88);box-shadow:0 15px 34px rgba(63,51,45,.12);backdrop-filter:blur(13px)}.place-list header{position:relative;padding:3px 4px 12px;border-bottom:1px solid #eee5df}.place-list header p{margin:0;color:#ff667e;font-size:7px;font-weight:800;letter-spacing:.15em}.place-list h1{margin:2px 0 0;color:#4c3b3c;font-size:16px}.place-list header>span{position:absolute;right:4px;bottom:14px;color:#a18e8b;font-size:8px}.place-list>div{min-height:0;overflow-y:auto;padding-top:7px}.place-list>div button{display:grid;grid-template-columns:24px 1fr auto;align-items:center;gap:7px;width:100%;padding:8px 5px;border:0;border-radius:8px;color:#776563;background:transparent;text-align:left;cursor:pointer}.place-list>div button:hover,.place-list>div button.active{background:#fff0ef}.place-list>div button>span:first-child{color:#c3afac;font:700 9px Manrope,sans-serif}.place-list>div button>span:nth-child(2){display:grid}.place-list b{font-size:9px}.place-list small{margin-top:2px;color:#ad9a97;font-size:7px}.place-list .material-symbols-outlined{color:#ff6b81;font-size:14px}.place-list footer{display:flex;gap:5px;padding-top:8px;color:#9f8d8b;font-size:7px}.map-legend{position:absolute;right:16px;bottom:14px;z-index:4;display:flex;gap:12px;padding:6px 9px;border-radius:7px;color:#897875;background:rgba(255,255,255,.86);font-size:7px}.map-legend span{display:flex;align-items:center;gap:4px}.map-legend i{width:11px;height:3px;background:#fff;border-top:1px solid #d4d9cf}.map-legend .heart{height:auto;color:#ff6b81;border:0;background:none;font-style:normal}@keyframes spin{to{transform:rotate(360deg)}}
:global(.love-map-marker-wrap){background:transparent!important;border:0!important}:global(.love-map-marker){position:relative;display:grid;place-items:center;width:38px;height:38px;border:3px solid #fff;border-radius:50%;color:#fff;background:#ff6b81;box-shadow:0 7px 18px rgba(82,53,52,.28);font-size:17px}:global(.love-map-marker b){position:absolute;right:-5px;top:-5px;display:grid;place-items:center;min-width:16px;height:16px;padding:0 3px;border-radius:99px;color:#ff5d75;background:#fff;font:700 8px system-ui}:global(.love-map-popup){display:grid;min-width:120px;padding:2px}:global(.love-map-popup strong){color:#554344;font-size:11px}:global(.love-map-popup span),:global(.love-map-popup small){margin-top:3px;color:#9c8886;font-size:8px}
.place-list header p{font-size:9px}.place-list header>span{font-size:10px}.place-list>div button>span:first-child{font-size:11px}.place-list b{font-size:12px}.place-list small{font-size:10px}.place-list footer,.map-legend{font-size:9px}.fallback-marker label{font-size:10px}.fallback-marker>b{font-size:9px}:global(.love-map-popup span),:global(.love-map-popup small){font-size:10px}
</style>
