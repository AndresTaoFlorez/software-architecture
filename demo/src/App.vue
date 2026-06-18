<script setup lang="ts">
import { computed, ref } from 'vue'
import OnionScene from './presentation/components/OnionScene.vue'
import TeachingPanel from './presentation/components/TeachingPanel.vue'
import { container } from './presentation/composition/container'
import type { LayerId } from './domain/entities/ArchitectureLayer'

const layers = container.getLayers()

const active = ref<LayerId | null>(null)
const hovered = ref<LayerId | null>(null)
const spotlit = computed(() => active.value ?? hovered.value)

const activeLayer = computed(() => layers.find((l) => l.id === active.value) ?? null)

const scene = ref<InstanceType<typeof OnionScene> | null>(null)

function select(id: LayerId) {
  active.value = active.value === id ? null : id
}

function resetView() {
  scene.value?.resetView()
  active.value = null
}

const GUIDE = 'https://github.com/AndresTaoFlorez/onion-architecture'
</script>

<template>
  <div class="app">
    <!-- 3D stage (full-bleed background) -->
    <div class="stage">
      <OnionScene ref="scene" :active="active" @select="select" @hover="(id) => (hovered = id)" />
    </div>

    <!-- Recenter the camera to its default framing -->
    <button class="reset-btn" type="button" @click="resetView" title="Recenter the onion">
      <span class="reset-ico" aria-hidden="true">⟲</span> Reset view
    </button>

    <!-- Floating UI -->
    <div class="overlay">
      <header class="masthead">
        <span class="kicker">Onion Architecture</span>
        <h1 class="title">Inside a clean app.</h1>
        <p class="sub">A 3D onion you can take apart, layer by layer.</p>
      </header>

      <!-- Layer legend / table of contents -->
      <nav class="legend" aria-label="Architecture layers">
        <button
          v-for="l in layers"
          :key="l.id"
          class="chip"
          :class="{ on: spotlit === l.id, active: active === l.id }"
          :style="{ '--c': l.color }"
          @click="select(l.id)"
          @mouseenter="hovered = l.id"
          @mouseleave="hovered = null"
        >
          <span class="swatch" />
          <span class="chip-text">
            <span class="chip-name">{{ l.name }}</span>
            <span class="chip-tag">{{ l.tagline }}</span>
          </span>
          <span class="chip-num">{{ l.depth + 1 }}</span>
        </button>
      </nav>

      <!-- Lesson card -->
      <div class="panel-slot">
        <TeachingPanel :layer="activeLayer" />
      </div>

      <!-- The one rule -->
      <footer class="footrule">
        <p class="rule">
          <strong>The one rule:</strong> dependencies point inward. Nothing inner ever
          knows anything outer.
        </p>
        <a :href="GUIDE" target="_blank" rel="noopener">Read the full guide →</a>
      </footer>
    </div>
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

.reset-btn {
  position: absolute;
  right: 24px;
  bottom: 22px;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 15px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(20, 12, 22, 0.7);
  backdrop-filter: blur(10px);
  color: var(--text);
  font-family: var(--mono);
  font-size: 0.74rem;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: border-color 0.2s ease, background 0.2s ease, transform 0.2s ease;
}
.reset-btn:hover {
  border-color: rgba(255, 255, 255, 0.3);
  background: rgba(32, 20, 34, 0.82);
  transform: translateY(-1px);
}
.reset-ico { font-size: 1rem; }

.overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(220px, 320px) 1fr minmax(320px, 400px);
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    'mast  .     panel'
    'legend .    panel'
    'foot  foot  panel';
  gap: 24px;
  padding: 32px 32px 28px;
  pointer-events: none;
}
.overlay > * { pointer-events: auto; }

.masthead { grid-area: mast; max-width: 360px; }
.kicker {
  font-family: var(--mono);
  font-size: 0.68rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--text-faint);
}
.title {
  font-family: var(--display);
  font-size: clamp(2rem, 3.4vw, 3rem);
  font-weight: 600;
  letter-spacing: -0.035em;
  line-height: 1;
  margin: 10px 0 8px;
  color: var(--text);
}
.sub {
  font-family: var(--sans);
  font-size: 1rem;
  color: var(--text-dim);
  margin: 0;
  max-width: 280px;
}

.legend {
  grid-area: legend;
  align-self: start;
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: min(320px, 100%);
}
.chip {
  display: flex;
  align-items: center;
  gap: 12px;
  text-align: left;
  padding: 11px 14px;
  border-radius: 13px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(20, 12, 22, 0.6);
  backdrop-filter: blur(10px);
  color: var(--text);
  cursor: pointer;
  transition: border-color 0.2s ease, background 0.2s ease, transform 0.2s ease;
}
.chip:hover { transform: translateX(3px); }
.chip.on { border-color: color-mix(in srgb, var(--c) 70%, transparent); }
.chip.active { background: color-mix(in srgb, var(--c) 16%, rgba(20, 12, 22, 0.7)); }
.swatch {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--c);
  box-shadow: 0 0 12px var(--c);
  flex: 0 0 auto;
}
.chip-text { display: flex; flex-direction: column; flex: 1; min-width: 0; }
.chip-name { font-family: var(--sans); font-weight: 500; font-size: 0.95rem; }
.chip-tag {
  font-family: var(--sans);
  font-size: 0.78rem;
  color: var(--text-dim);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.chip-num {
  font-family: var(--mono);
  font-size: 0.72rem;
  color: var(--text-faint);
}

.panel-slot {
  grid-area: panel;
  align-self: center;
  justify-self: end;
  max-height: 100%;
  overflow-y: auto;
}

.footrule {
  grid-area: foot;
  align-self: end;
  display: flex;
  align-items: baseline;
  gap: 20px;
  flex-wrap: wrap;
}
.footrule .rule {
  font-family: var(--sans);
  font-size: 0.92rem;
  color: var(--text-dim);
  margin: 0;
  max-width: 520px;
}
.footrule .rule strong { color: var(--text); }
.footrule a {
  font-family: var(--mono);
  font-size: 0.74rem;
  letter-spacing: 0.06em;
  color: var(--text);
  white-space: nowrap;
}

@media (max-width: 980px) {
  .overlay {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto 1fr auto;
    grid-template-areas:
      'mast'
      'legend'
      'panel'
      'foot';
    overflow-y: auto;
  }
  .panel-slot { justify-self: stretch; align-self: start; }
  .legend { width: 100%; }
}
</style>
