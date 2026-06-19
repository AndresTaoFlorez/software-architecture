<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import OnionScene from './presentation/components/OnionScene.vue'
import TeachingPanel from './presentation/components/TeachingPanel.vue'
import { useDraggable } from './presentation/composables/useDraggable'
import { container } from './presentation/composition/container'
import type { LayerId } from './domain/entities/ArchitectureLayer'

const layers = container.getLayers()

const active = ref<LayerId | null>(null)
const hovered = ref<LayerId | null>(null)
const spotlit = computed(() => active.value ?? hovered.value)
const activeLayer = computed(() => layers.find((l) => l.id === active.value) ?? null)

const scene = ref<InstanceType<typeof OnionScene> | null>(null)

// Splash while the 3D bundle + scene initialise (avoids a blank first paint).
const loading = ref(true)
function onSceneReady() {
  loading.value = false
}
onMounted(() => {
  // Safety net: never let the splash get stuck if 'ready' is missed.
  window.setTimeout(() => (loading.value = false), 7000)
})

// Guided tour: step skin -> core on a timer.
const touring = ref(false)
let tourTimer = 0
function stopTour() {
  touring.value = false
  if (tourTimer) {
    clearInterval(tourTimer)
    tourTimer = 0
  }
}
function startTour() {
  stopTour()
  touring.value = true
  const ids = layers.map((l) => l.id)
  let i = 0
  active.value = ids[0]
  tourTimer = window.setInterval(() => {
    i++
    if (i >= ids.length) {
      stopTour()
      return
    }
    active.value = ids[i]
  }, 3400)
}
function toggleTour() {
  touring.value ? stopTour() : startTour()
}

function select(id: LayerId) {
  stopTour()
  active.value = active.value === id ? null : id
}
function resetView() {
  stopTour()
  scene.value?.resetView()
  active.value = null
}
function closePanel() {
  stopTour()
  active.value = null
}
function zoomIn() {
  scene.value?.zoomBy(0.8)
}
function zoomOut() {
  scene.value?.zoomBy(1.25)
}

// Drag for the floating lesson window; re-anchor each time it opens.
const windowEl = ref<HTMLElement | null>(null)
const { offset: dragOffset, dragging: isDragging, onPointerDown: onDragStart, reset: resetDrag } =
  useDraggable(windowEl)
watch(active, (v) => {
  if (v) resetDrag()
})

const GUIDE = 'https://github.com/AndresTaoFlorez/onion-architecture'
</script>

<template>
  <div class="app">
    <!-- 3D stage -->
    <div class="stage">
      <OnionScene
        ref="scene"
        :active="active"
        @select="select"
        @hover="(id) => (hovered = id)"
        @ready="onSceneReady"
      />
    </div>

    <!-- Loading splash -->
    <transition name="splash">
      <div v-if="loading" class="splash">
        <div class="splash-onion">
          <span class="splash-ring r1" />
          <span class="splash-ring r2" />
          <span class="splash-core" />
        </div>
        <p class="splash-text">Peeling the onion…</p>
      </div>
    </transition>

    <!-- Minimal chrome over the scene -->
    <div class="ui">
      <header class="masthead">
        <span class="kicker">Onion Architecture</span>
        <h1 class="title">Inside a clean app</h1>
        <p class="hint">Drag to orbit · scroll to zoom · tap a layer</p>
      </header>

      <a class="guide" :href="GUIDE" target="_blank" rel="noopener">Guide ↗</a>

      <p class="one-rule">
        <strong>The one rule:</strong> dependencies point inward.
      </p>

      <!-- Bottom dock of layers -->
      <nav class="dock" aria-label="Architecture layers">
        <button
          v-for="l in layers"
          :key="l.id"
          class="dchip"
          :class="{ active: active === l.id, on: spotlit === l.id }"
          :style="{ '--c': l.color }"
          @click="select(l.id)"
          @mouseenter="hovered = l.id"
          @mouseleave="hovered = null"
        >
          <span class="dswatch" />
          <span class="dname">{{ l.name }}</span>
        </button>
      </nav>

      <!-- Map-style control cluster -->
      <div class="controls">
        <button class="ctl" @click="zoomIn" title="Zoom in" aria-label="Zoom in">+</button>
        <button class="ctl" @click="zoomOut" title="Zoom out" aria-label="Zoom out">−</button>
        <span class="ctl-div" />
        <button class="ctl" @click="resetView" title="Recenter" aria-label="Recenter">⌂</button>
        <button
          class="ctl tour"
          :class="{ on: touring }"
          @click="toggleTour"
          :title="touring ? 'Stop tour' : 'Take the tour'"
          aria-label="Toggle tour"
        >{{ touring ? '■' : '▶' }}</button>
      </div>
    </div>

    <!-- Draggable lesson window (bottom sheet on mobile) -->
    <transition name="card">
      <div
        ref="windowEl"
        v-if="activeLayer"
        class="window"
        :class="{ dragging: isDragging }"
        :style="{ transform: `translate(${dragOffset.x}px, ${dragOffset.y}px)` }"
      >
        <div class="winbar" @pointerdown="onDragStart">
          <span class="grab" aria-hidden="true" />
          <button class="winclose" type="button" @click="closePanel" aria-label="Close">×</button>
        </div>
        <div class="winbody">
          <TeachingPanel :layer="activeLayer" />
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.app {
  position: fixed;
  inset: 0;
  overflow: hidden;
}
.stage {
  position: absolute;
  inset: 0;
  z-index: 0;
}

/* Loading splash */
.splash {
  position: absolute;
  inset: 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 22px;
  background: radial-gradient(circle at 50% 42%, #1a0c18, var(--bg) 70%);
}
.splash-onion {
  position: relative;
  width: 84px;
  height: 84px;
}
.splash-ring {
  position: absolute;
  inset: 0;
  margin: auto;
  border-radius: 50%;
  border: 2px solid transparent;
}
.splash-ring.r1 {
  width: 84px;
  height: 84px;
  border-top-color: #e2618f;
  border-right-color: #b56aa6;
  animation: spin 1.1s linear infinite;
}
.splash-ring.r2 {
  width: 54px;
  height: 54px;
  border-bottom-color: #e7b2d0;
  border-left-color: #f4c95f;
  animation: spin 0.8s linear infinite reverse;
}
.splash-core {
  position: absolute;
  inset: 0;
  margin: auto;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #f4c95f;
  box-shadow: 0 0 22px 4px rgba(244, 201, 95, 0.7);
  animation: pulse 1.6s ease-in-out infinite;
}
.splash-text {
  font-family: var(--mono);
  font-size: 0.78rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--text-faint);
  margin: 0;
}
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes pulse {
  0%, 100% { opacity: 0.75; transform: scale(0.92); }
  50% { opacity: 1; transform: scale(1.08); }
}
.splash-leave-active { transition: opacity 0.5s ease; }
.splash-leave-to { opacity: 0; }

/* Chrome layer: transparent to pointer except its widgets */
.ui {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
}
.ui > * {
  pointer-events: auto;
}
/* Non-interactive text must not block orbiting the scene underneath. */
.masthead,
.one-rule {
  pointer-events: none;
}

/* Masthead, top-left */
.masthead {
  position: absolute;
  top: 26px;
  left: 28px;
  max-width: 60vw;
}
.kicker {
  font-family: var(--mono);
  font-size: 0.64rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--text-faint);
}
.title {
  font-family: var(--display);
  font-size: clamp(1.5rem, 2.6vw, 2.1rem);
  font-weight: 600;
  letter-spacing: -0.03em;
  line-height: 1.05;
  margin: 6px 0 6px;
  color: var(--text);
}
.hint {
  font-family: var(--mono);
  font-size: 0.7rem;
  letter-spacing: 0.02em;
  color: var(--text-faint);
  margin: 0;
}

.guide {
  position: absolute;
  top: 28px;
  right: 28px;
  font-family: var(--mono);
  font-size: 0.74rem;
  letter-spacing: 0.04em;
  color: var(--text);
  padding: 7px 13px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(20, 12, 22, 0.5);
  backdrop-filter: blur(8px);
}
.guide:hover {
  text-decoration: none;
  border-color: rgba(255, 255, 255, 0.3);
}

.one-rule {
  position: absolute;
  left: 28px;
  bottom: 24px;
  margin: 0;
  max-width: 40vw;
  font-family: var(--sans);
  font-size: 0.82rem;
  color: var(--text-faint);
}
.one-rule strong {
  color: var(--text-dim);
}

/* Bottom dock */
.dock {
  position: absolute;
  bottom: 22px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  padding: 7px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(16, 10, 18, 0.62);
  backdrop-filter: blur(14px);
  max-width: calc(100vw - 200px);
  overflow-x: auto;
  scrollbar-width: none;
}
.dock::-webkit-scrollbar { display: none; }
.dchip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 11px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--text-dim);
  white-space: nowrap;
  cursor: pointer;
  transition: background 0.18s ease, color 0.18s ease, border-color 0.18s ease;
}
.dchip:hover { color: var(--text); background: rgba(255, 255, 255, 0.05); }
.dchip.on { color: var(--text); }
.dchip.active {
  color: var(--text);
  border-color: color-mix(in srgb, var(--c) 60%, transparent);
  background: color-mix(in srgb, var(--c) 16%, transparent);
}
.dswatch {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: var(--c);
  box-shadow: 0 0 10px var(--c);
  flex: 0 0 auto;
}
.dname {
  font-family: var(--sans);
  font-size: 0.85rem;
  font-weight: 500;
}

/* Control cluster, bottom-right */
.controls {
  position: absolute;
  right: 24px;
  bottom: 22px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 5px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(16, 10, 18, 0.62);
  backdrop-filter: blur(14px);
}
.ctl {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  border: 0;
  background: transparent;
  color: var(--text);
  font-size: 1.15rem;
  line-height: 1;
  cursor: pointer;
  transition: background 0.16s ease, color 0.16s ease;
}
.ctl:hover { background: rgba(255, 255, 255, 0.09); }
.ctl:active { background: rgba(255, 255, 255, 0.16); }
.ctl-div {
  height: 1px;
  margin: 2px 6px;
  background: rgba(255, 255, 255, 0.12);
}
.ctl.tour.on {
  color: #fff;
  background: color-mix(in srgb, var(--accent) 36%, transparent);
}

/* Draggable lesson window */
.window {
  position: absolute;
  top: 72px;
  right: 24px;
  z-index: 3;
  width: min(358px, calc(100vw - 32px));
  max-height: min(560px, calc(100dvh - 120px));
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(18, 11, 20, 0.86);
  backdrop-filter: blur(16px);
  box-shadow: 0 26px 64px rgba(0, 0, 0, 0.5);
  overflow: hidden;
}
.window.dragging { box-shadow: 0 32px 80px rgba(0, 0, 0, 0.6); }
.winbar {
  position: relative;
  flex: 0 0 auto;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  touch-action: none;
}
.winbar:active { cursor: grabbing; }
.grab {
  width: 38px;
  height: 4px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.22);
}
.winclose {
  position: absolute;
  top: 4px;
  right: 8px;
  width: 26px;
  height: 26px;
  border-radius: 8px;
  border: 0;
  background: transparent;
  color: var(--text-dim);
  font-size: 1.15rem;
  line-height: 1;
  cursor: pointer;
}
.winclose:hover { color: var(--text); background: rgba(255, 255, 255, 0.08); }
.winbody {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
}
/* Merge the teaching panel into the window chrome */
.winbody :deep(.panel) {
  background: transparent;
  border: 0;
  border-radius: 0;
  box-shadow: none;
  padding: 20px 22px 22px;
  width: auto;
  backdrop-filter: none;
}

.card-enter-active,
.card-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}
.card-enter-from,
.card-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

/* Mobile: dock to the top, controls to the right edge, lesson as a scrollable
   bottom sheet that never buries the dock or controls. */
@media (max-width: 760px) {
  .masthead { top: 14px; left: 14px; max-width: 64vw; }
  .masthead .hint { display: none; }
  .title { font-size: 1.4rem; margin: 4px 0; }
  .guide { top: 14px; right: 14px; padding: 6px 11px; }
  .one-rule { display: none; }

  .dock {
    top: 68px;
    bottom: auto;
    left: 12px;
    right: 12px;
    transform: none;
    max-width: none;
    justify-content: flex-start;
  }

  .controls {
    right: 12px;
    top: auto;
    bottom: calc(48dvh + 14px);
    transform: none;
    flex-direction: column;
  }

  .window {
    top: auto;
    left: 0;
    right: 0;
    bottom: 0;
    width: auto;
    max-height: 48dvh;
    border-radius: 18px 18px 0 0;
    transform: none !important;
  }
  .winbar { cursor: default; }
}
</style>
