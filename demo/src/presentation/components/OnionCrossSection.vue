<script setup lang="ts">
// 3D-style onion cutaway. A full sphere is rendered with a strong radial
// gradient (light from top-left, dark at the rim and bottom-right) so it
// reads as a real rounded object. The right wedge is "cut": on top of the
// sphere, concentric half-discs paint the cross-section, each with its
// own gradient to give depth.

import { computed, ref } from 'vue'
import { LAYERS, type LayerId } from '../data/layers'

const props = defineProps<{
  active: LayerId | null
}>()

const emit = defineEmits<{
  (e: 'select', id: LayerId): void
}>()

// The selected layer is whatever the parent passed (live-traced or pinned).
const hovered = ref<LayerId | null>(null)
const spotlit = computed<LayerId | null>(() => props.active ?? hovered.value)

function onEnter(id: LayerId) {
  hovered.value = id
}
function onLeave(id: LayerId) {
  if (hovered.value === id) hovered.value = null
}
function onClick(id: LayerId) {
  emit('select', id)
}

// Concentric radii for the cross-section (skin is the outermost disc, not
// a model layer). Each subsequent layer is a smaller disc inside.
const layerR = [215, 175, 130, 80] // presentation, infrastructure, application, domain

// Build the half-disc path for a given radius. Right side of the sphere.
function halfDisc(r: number): string {
  return `M 300 ${300 - r} A ${r} ${r} 0 0 1 300 ${300 + r} Z`
}

const colorOf = Object.fromEntries(LAYERS.map((l) => [l.id, l.color])) as Record<LayerId, string>
</script>

<template>
  <div class="onion-wrap">
    <svg
      class="onion"
      viewBox="0 0 600 600"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Onion architecture cutaway"
    >
      <defs>
        <!-- 3D sphere: bright at top-left, dark elsewhere -->
        <radialGradient id="g-skin" cx="32%" cy="28%" r="78%">
          <stop offset="0%" stop-color="#c46a92" />
          <stop offset="35%" stop-color="#8a2350" />
          <stop offset="80%" stop-color="#3a0e22" />
          <stop offset="100%" stop-color="#1a0612" />
        </radialGradient>

        <!-- Each layer's cross-section: lighter on the right (the lit face
             of the cut), darker near the centre line of the sphere. -->
        <radialGradient id="g-presentation" cx="80%" cy="50%" r="80%">
          <stop offset="0%" stop-color="#d9689a" />
          <stop offset="55%" stop-color="#9d2b5c" />
          <stop offset="100%" stop-color="#5a1634" />
        </radialGradient>

        <radialGradient id="g-infrastructure" cx="80%" cy="50%" r="80%">
          <stop offset="0%" stop-color="#d59bbf" />
          <stop offset="55%" stop-color="#7e3661" />
          <stop offset="100%" stop-color="#3e182e" />
        </radialGradient>

        <radialGradient id="g-application" cx="80%" cy="50%" r="80%">
          <stop offset="0%" stop-color="#fae3ee" />
          <stop offset="55%" stop-color="#deb0cc" />
          <stop offset="100%" stop-color="#7a4a64" />
        </radialGradient>

        <radialGradient id="g-domain" cx="80%" cy="50%" r="80%">
          <stop offset="0%" stop-color="#fffbe6" />
          <stop offset="50%" stop-color="#fff0c8" />
          <stop offset="100%" stop-color="#c7923a" />
        </radialGradient>

        <!-- Soft glow at the very centre of the cut -->
        <radialGradient id="g-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95" />
          <stop offset="55%" stop-color="#fff0c8" stop-opacity="0.45" />
          <stop offset="100%" stop-color="#fff0c8" stop-opacity="0" />
        </radialGradient>

        <!-- Outer sphere rim shadow, drawn on top of the sphere -->
        <radialGradient id="g-rim" cx="50%" cy="50%" r="50%">
          <stop offset="78%" stop-color="#000" stop-opacity="0" />
          <stop offset="100%" stop-color="#000" stop-opacity="0.55" />
        </radialGradient>

        <!-- Specular highlight on the top-left of the sphere -->
        <radialGradient id="g-spec" cx="28%" cy="22%" r="22%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.45" />
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
        </radialGradient>

        <!-- Drop shadow on the ground -->
        <radialGradient id="g-ground" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#000" stop-opacity="0.55" />
          <stop offset="100%" stop-color="#000" stop-opacity="0" />
        </radialGradient>

        <!-- Soft blur for the wisp tendrils -->
        <filter id="blur" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2.5" />
        </filter>
      </defs>

      <!-- Ground shadow under the onion -->
      <ellipse cx="300" cy="568" rx="200" ry="14" fill="url(#g-ground)" />

      <!-- 3D sphere (the outside of the onion, lit from top-left) -->
      <circle cx="300" cy="300" r="240" fill="url(#g-skin)" />

      <!-- The four model layers, drawn as half-discs on the right (the cut).
           Each gets hover/click/focus; CSS dims siblings of the spotlit one. -->
      <path
        v-for="(l, i) in LAYERS"
        :key="l.id"
        :d="halfDisc(layerR[i])"
        :fill="`url(#g-${l.id})`"
        class="layer"
        :class="{
          dim: spotlit !== null && spotlit !== l.id,
          spot: spotlit === l.id,
        }"
        :style="{ '--layer-color': colorOf[l.id] }"
        :data-layer="l.id"
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

      <!-- Soft top-left specular on the sphere -->
      <ellipse
        cx="200"
        cy="180"
        rx="80"
        ry="50"
        fill="url(#g-spec)"
        pointer-events="none"
        transform="rotate(-22 200 180)"
      />

      <!-- Rim shadow on the sphere edges -->
      <circle cx="300" cy="300" r="240" fill="url(#g-rim)" pointer-events="none" />

      <!-- Core glow on the cut -->
      <circle cx="300" cy="300" r="55" fill="url(#g-core)" pointer-events="none" />
      <circle cx="300" cy="300" r="6" fill="#fff7df" pointer-events="none" />

      <!-- Top wisps (a few soft tendrils above the onion) -->
      <g class="wisps" stroke="#8a2350" stroke-width="2" fill="none" opacity="0.5"
         stroke-linecap="round" filter="url(#blur)">
        <path d="M 300 60 C 290 30 282 14 268 0" />
        <path d="M 300 60 C 305 28 312 12 322 0" />
        <path d="M 300 60 C 296 32 286 16 274 6" />
        <path d="M 300 60 C 308 32 322 18 332 8" />
      </g>

      <!-- Bottom roots -->
      <g class="roots" stroke="#5a1634" stroke-width="1.4" fill="none" opacity="0.45"
         stroke-linecap="round" filter="url(#blur)">
        <path d="M 300 540 C 296 558 288 572 276 582" />
        <path d="M 300 540 C 304 558 312 572 322 582" />
        <path d="M 300 540 C 300 562 300 576 300 590" />
      </g>
    </svg>
  </div>
</template>

<style scoped>
.onion-wrap {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.onion {
  width: 100%;
  max-width: 460px;
  height: auto;
  display: block;
  overflow: visible;
}

.layer {
  transform-origin: 300px 300px;
  transform-box: view-box;
  transition:
    opacity 280ms ease,
    filter 280ms ease,
    transform 280ms ease;
  cursor: pointer;
  outline: none;
}

.layer.dim {
  opacity: 0.32;
  filter: saturate(0.55) brightness(0.85);
}

.layer.spot {
  opacity: 1;
  filter: brightness(1.18) drop-shadow(0 0 22px var(--layer-color, #fff));
  transform: scale(1.04);
}

.wisps,
.roots {
  pointer-events: none;
  transition: opacity 280ms ease;
}

.layer:focus-visible {
  outline: 2px solid var(--domain, #f3c878);
  outline-offset: 4px;
  border-radius: 4px;
}

@media (prefers-reduced-motion: reduce) {
  .layer { transition: none; }
  .wisps, .roots { transition: none; }
}
</style>
