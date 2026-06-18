<script setup lang="ts">
// 3D onion cutaway, in the spirit of a classic "Earth structure" diagram:
// a shaded sphere with a wedge bitten out of the top. Through the bite you
// look into nested 3D shells — each layer is a scooped disc whose inner
// surface is an elliptical "bowl", so the cut reads as real depth rather
// than a flat pie chart. The glowing domain core sits at the centre.
//
// Interaction: hover/click a layer to spotlight it (others dim). Clicking
// holds the spotlight (the "peeled" prop, owned by the parent).

import { computed, ref } from 'vue'
import { LAYERS, type LayerId } from '../data/layers'

const props = defineProps<{ peeled: LayerId | null }>()
const emit = defineEmits<{ (e: 'select', id: LayerId): void }>()

const hovered = ref<LayerId | null>(null)
const spotlit = computed<LayerId | null>(() => props.peeled ?? hovered.value)

function onEnter(id: LayerId) { hovered.value = id }
function onLeave(id: LayerId) { if (hovered.value === id) hovered.value = null }
function onClick(id: LayerId) { emit('select', id) }

// --- Geometry -------------------------------------------------------------
const CX = 300
const CY = 312
const SPHERE_R = 240
// Notch edges, in degrees (screen space, y grows downward). The bite opens
// symmetrically at the top, spanning A2 - A1 = 130 degrees.
const A1 = 205
const A2 = 335
// Concentric radii, outer to inner: presentation, infrastructure, application, domain.
const layerR = [240, 187, 136, 86]

const rad = (d: number) => (d * Math.PI) / 180
const px = (r: number, a: number) => CX + r * Math.cos(rad(a))
const py = (r: number, a: number) => CY + r * Math.sin(rad(a))

// A "scooped disc": the full disc of radius r, kept the long way round the
// bottom, then an elliptical arc carves a concave bowl out of the top so the
// shell behind it shows through.
function scoopPath(r: number): string {
  const x1 = px(r, A1), y1 = py(r, A1) // left lip
  const x2 = px(r, A2), y2 = py(r, A2) // right lip
  const rx = (x2 - x1) / 2 // half the lip-to-lip chord
  const ry = r * 0.46 // bowl depth
  // Outer rim: from left lip the long way (through the bottom) to right lip.
  const rim = `M ${x1.toFixed(1)} ${y1.toFixed(1)} A ${r} ${r} 0 1 0 ${x2.toFixed(1)} ${y2.toFixed(1)}`
  // Bowl: from right lip back to left lip, bulging downward into the disc.
  const bowl = `A ${rx.toFixed(1)} ${ry.toFixed(1)} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`
  return `${rim} ${bowl} Z`
}

// Just the bowl arc, as its own open path, for a subtle inner-surface highlight.
function bowlArc(r: number): string {
  const x1 = px(r, A1), y1 = py(r, A1)
  const x2 = px(r, A2), y2 = py(r, A2)
  const rx = (x2 - x1) / 2
  const ry = r * 0.40
  return `M ${x2.toFixed(1)} ${y2.toFixed(1)} A ${rx.toFixed(1)} ${ry.toFixed(1)} 0 0 0 ${x1.toFixed(1)} ${y1.toFixed(1)}`
}

const colorOf = Object.fromEntries(LAYERS.map((l) => [l.id, l.color])) as Record<LayerId, string>
</script>

<template>
  <div class="onion-wrap">
    <svg class="onion" viewBox="0 0 600 612" xmlns="http://www.w3.org/2000/svg"
         role="img" aria-label="Onion architecture cutaway">
      <defs>
        <!-- 3D sphere body: lit from top-left, dark at the rim -->
        <radialGradient id="g-skin" cx="34%" cy="28%" r="80%">
          <stop offset="0%" stop-color="#c46a92" />
          <stop offset="36%" stop-color="#8a2350" />
          <stop offset="82%" stop-color="#3a0e22" />
          <stop offset="100%" stop-color="#190611" />
        </radialGradient>

        <!-- Layer shells: lit at the top (toward the open bite), dark at the floor -->
        <radialGradient id="g-presentation" cx="50%" cy="22%" r="86%">
          <stop offset="0%" stop-color="#e487ad" />
          <stop offset="52%" stop-color="#b0356a" />
          <stop offset="100%" stop-color="#5a1634" />
        </radialGradient>
        <radialGradient id="g-infrastructure" cx="50%" cy="24%" r="86%">
          <stop offset="0%" stop-color="#e3acca" />
          <stop offset="52%" stop-color="#9c4f7b" />
          <stop offset="100%" stop-color="#46203a" />
        </radialGradient>
        <radialGradient id="g-application" cx="50%" cy="26%" r="86%">
          <stop offset="0%" stop-color="#fbe7f0" />
          <stop offset="52%" stop-color="#e0b3cf" />
          <stop offset="100%" stop-color="#8a5a74" />
        </radialGradient>
        <radialGradient id="g-domain" cx="50%" cy="30%" r="86%">
          <stop offset="0%" stop-color="#fffbe9" />
          <stop offset="48%" stop-color="#ffe9b0" />
          <stop offset="100%" stop-color="#c98f33" />
        </radialGradient>

        <!-- Hot core glow -->
        <radialGradient id="g-core" cx="50%" cy="42%" r="60%">
          <stop offset="0%" stop-color="#fff7df" />
          <stop offset="40%" stop-color="#ff9d57" />
          <stop offset="100%" stop-color="#d83a2a" />
        </radialGradient>
        <radialGradient id="g-coreGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#ffd98a" stop-opacity="0.85" />
          <stop offset="100%" stop-color="#ffd98a" stop-opacity="0" />
        </radialGradient>

        <!-- Sphere finish: rim shadow + top-left specular + ground shadow -->
        <radialGradient id="g-rim" cx="50%" cy="50%" r="50%">
          <stop offset="78%" stop-color="#000" stop-opacity="0" />
          <stop offset="100%" stop-color="#000" stop-opacity="0.3" />
        </radialGradient>
        <radialGradient id="g-spec" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#fff" stop-opacity="0.45" />
          <stop offset="100%" stop-color="#fff" stop-opacity="0" />
        </radialGradient>
        <radialGradient id="g-ground" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#000" stop-opacity="0.28" />
          <stop offset="100%" stop-color="#000" stop-opacity="0" />
        </radialGradient>

        <filter id="blur" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.4" />
        </filter>
      </defs>

      <!-- Ground shadow -->
      <ellipse cx="300" cy="582" rx="196" ry="14" fill="url(#g-ground)" />

      <!-- Top wisps -->
      <g class="wisps" stroke="#8a2350" stroke-width="2" fill="none" opacity="0.5"
         stroke-linecap="round" filter="url(#blur)">
        <path d="M 300 74 C 290 42 282 24 268 10" />
        <path d="M 300 74 C 305 40 312 22 322 10" />
        <path d="M 300 74 C 296 44 286 26 274 16" />
      </g>

      <!-- Sphere body (the un-cut outside of the onion) -->
      <circle :cx="CX" :cy="CY" :r="SPHERE_R" fill="url(#g-skin)" />

      <!-- Nested shells, outer to inner. Each scooped disc reveals the one behind. -->
      <g class="shells">
        <template v-for="(l, i) in LAYERS" :key="l.id">
          <path
            :d="scoopPath(layerR[i])"
            :fill="`url(#g-${l.id})`"
            class="layer"
            :class="{
              dim: spotlit !== null && spotlit !== l.id,
              spot: spotlit === l.id,
              hold: peeled === l.id,
            }"
            :style="{ '--layer-color': colorOf[l.id] }"
            role="button"
            :tabindex="0"
            :aria-label="l.name"
            @mouseenter="onEnter(l.id)"
            @mouseleave="onLeave(l.id)"
            @focus="onEnter(l.id)"
            @blur="onLeave(l.id)"
            @click="onClick(l.id)"
            @keydown.enter="onClick(l.id)"
            @keydown.space.prevent="onClick(l.id)"
          />
          <!-- inner-surface highlight along the bowl lip -->
          <path :d="bowlArc(layerR[i])" fill="none" stroke="#fff"
                stroke-opacity="0.28" stroke-width="1.5" pointer-events="none"
                :class="{ faded: spotlit !== null && spotlit !== l.id }" />
        </template>
      </g>

      <!-- Glowing domain core at the centre of the bite -->
      <circle :cx="CX" :cy="CY - 6" r="42" fill="url(#g-coreGlow)" pointer-events="none" />
      <circle :cx="CX" :cy="CY - 4" r="22" fill="url(#g-core)" class="core" pointer-events="none" />

      <!-- Specular highlight on the sphere -->
      <ellipse cx="214" cy="196" rx="86" ry="58" fill="url(#g-spec)"
               pointer-events="none" transform="rotate(-24 214 196)" />
      <!-- Rim shadow -->
      <circle :cx="CX" :cy="CY" :r="SPHERE_R" fill="url(#g-rim)" pointer-events="none" />

      <!-- Bottom roots -->
      <g class="roots" stroke="#5a1634" stroke-width="1.4" fill="none" opacity="0.45"
         stroke-linecap="round" filter="url(#blur)">
        <path d="M 300 552 C 296 570 288 582 276 592" />
        <path d="M 300 552 C 304 570 312 582 322 592" />
        <path d="M 300 552 C 300 574 300 586 300 598" />
      </g>
    </svg>
  </div>
</template>

<style scoped>
.onion-wrap { width: 100%; display: flex; align-items: center; justify-content: center; }
.onion { width: 100%; max-width: 720px; height: auto; display: block; overflow: visible; }

.layer {
  transform-origin: 300px 312px;
  transform-box: view-box;
  transition: opacity 280ms ease, filter 280ms ease;
  cursor: pointer;
  outline: none;
}
.layer.dim { opacity: 0.55; filter: saturate(0.65) brightness(0.82); }
.layer.spot { opacity: 1; filter: brightness(1.16) drop-shadow(0 0 20px var(--layer-color, #fff)); }
.layer.hold { filter: brightness(1.2) drop-shadow(0 0 26px var(--layer-color, #fff)); }

path.faded { opacity: 0.25; transition: opacity 280ms ease; }

.core { animation: pulse 4.4s ease-in-out infinite; transform-origin: 300px 306px; transform-box: view-box; }
@keyframes pulse {
  0%, 100% { opacity: 0.92; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.07); }
}

.wisps, .roots { pointer-events: none; transition: opacity 280ms ease; }
.layer:focus-visible { outline: 2px solid #f3c878; outline-offset: 4px; }

@media (prefers-reduced-motion: reduce) {
  .layer { transition: none; }
  .core { animation: none; }
}
</style>
