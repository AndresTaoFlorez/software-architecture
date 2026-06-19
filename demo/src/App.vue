<script setup lang="ts">
import { computed, ref, watch } from 'vue'
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
const { offset: dragOffset, dragging: isDragging, onPointerDown: onDragStart, reset: resetDrag } =
  useDraggable()
watch(active, (v) => {
  if (v) resetDrag()
})

const GUIDE = 'https://github.com/AndresTaoFlorez/onion-architecture'
</script>

<template>
  <div class="app">
    <!-- 3D stage -->
    <div class="stage">
      <OnionScene ref="scene" :active="active" @select="select" @hover="(id) => (hovered = id)" />
    </div>

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
        v-if="activeLayer"
        class="window"
        :class="{ dragging: isDragging }"
        :style="{ transform: `translate(${dragOffset.x}px, ${dragOffset.y}px)` }"
      >
        <div class="winbar" @pointerdown="onDragStart">
          <span class="grip" aria-hidden="true">⠿</span>
          <span class="winname" :style="{ color: activeLayer.color }">{{ activeLayer.name }}</span>
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
  top: 74px;
  right: 24px;
  z-index: 3;
  width: min(360px, calc(100vw - 32px));
  max-height: calc(100vh - 150px);
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(18, 11, 20, 0.82);
  backdrop-filter: blur(16px);
  box-shadow: 0 26px 64px rgba(0, 0, 0, 0.5);
  overflow: hidden;
}
.window.dragging { box-shadow: 0 32px 80px rgba(0, 0, 0, 0.6); }
.winbar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  cursor: grab;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  touch-action: none;
}
.winbar:active { cursor: grabbing; }
.grip { color: var(--text-faint); font-size: 0.9rem; letter-spacing: -2px; }
.winname {
  flex: 1;
  font-family: var(--display);
  font-weight: 600;
  font-size: 0.95rem;
  letter-spacing: -0.01em;
}
.winclose {
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
  overflow-y: auto;
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

/* Mobile: window becomes a bottom sheet, dock + controls compact */
@media (max-width: 760px) {
  .masthead { top: 18px; left: 18px; }
  .guide { top: 18px; right: 18px; }
  .one-rule { display: none; }
  .dock {
    left: 16px;
    right: 96px;
    transform: none;
    max-width: none;
    bottom: 18px;
  }
  .controls { right: 16px; bottom: 18px; flex-direction: row; }
  .ctl-div { width: 1px; height: auto; margin: 6px 2px; }
  .window {
    top: auto;
    left: 0;
    right: 0;
    bottom: 0;
    width: auto;
    max-height: 56vh;
    border-radius: 18px 18px 0 0;
    transform: none !important;
  }
  .winbar { cursor: default; }
}
</style>
