<script setup lang="ts">
import type { LayerId } from '../data/layers'

const props = defineProps<{ active: LayerId | null }>()
const emit = defineEmits<{ (e: 'hover', id: LayerId | null): void; (e: 'select', id: LayerId): void }>()

// Exact almond paths + radial gradients lifted from the approved design.
const almonds: { id: LayerId; d: string; grad: string; glow: string }[] = [
  { id: 'presentation', d: 'M520 212 C710 318 685 566 520 664 C355 566 330 318 520 212 Z', grad: 'gL0', glow: '#c2477a' },
  { id: 'infrastructure', d: 'M520 220 C666 322 648 558 520 660 C392 558 374 322 520 220 Z', grad: 'gL1', glow: '#c272a0' },
  { id: 'application', d: 'M520 252 C624 340 612 548 520 654 C428 548 416 340 520 252 Z', grad: 'gL2', glow: '#deb0cc' },
  { id: 'domain', d: 'M520 316 C586 376 578 532 520 648 C462 532 454 376 520 316 Z', grad: 'gL3', glow: '#ffe6a6' },
]

function opacity(id: LayerId): number {
  if (props.active === null) return 0.6
  return props.active === id ? 1 : 0.18
}
</script>

<template>
  <svg viewBox="0 0 1040 940" class="onion" :class="{ focused: active !== null }"
       xmlns="http://www.w3.org/2000/svg" aria-label="Onion cross-section">
    <defs>
      <radialGradient id="gBack" cx="42%" cy="34%" r="60%">
        <stop offset="0%" stop-color="#3a1430" />
        <stop offset="70%" stop-color="#150812" />
        <stop offset="100%" stop-color="#0a070c" />
      </radialGradient>
      <radialGradient id="gSkin" cx="40%" cy="28%" r="80%">
        <stop offset="0%" stop-color="#8a2350" />
        <stop offset="100%" stop-color="#42102a" />
      </radialGradient>
      <radialGradient id="gL0" cx="38%" cy="26%" r="82%">
        <stop offset="0%" stop-color="#c2477a" />
        <stop offset="48%" stop-color="#9d2b5c" />
        <stop offset="100%" stop-color="#5a1634" />
      </radialGradient>
      <radialGradient id="gL1" cx="40%" cy="30%" r="78%">
        <stop offset="0%" stop-color="#c272a0" />
        <stop offset="100%" stop-color="#6e2b54" />
      </radialGradient>
      <radialGradient id="gL2" cx="44%" cy="34%" r="76%">
        <stop offset="0%" stop-color="#f0d3e2" />
        <stop offset="60%" stop-color="#deb0cc" />
        <stop offset="100%" stop-color="#b07e9e" />
      </radialGradient>
      <radialGradient id="gL3" cx="48%" cy="42%" r="74%">
        <stop offset="0%" stop-color="#fffaee" />
        <stop offset="46%" stop-color="#fff0c8" />
        <stop offset="100%" stop-color="#f3c878" />
      </radialGradient>
      <radialGradient id="gCore" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="rgba(255,246,210,0.95)" />
        <stop offset="52%" stop-color="rgba(255,224,150,0.35)" />
        <stop offset="100%" stop-color="rgba(255,224,150,0)" />
      </radialGradient>
      <linearGradient id="gHi" x1="0" y1="0" x2="0.7" y2="1">
        <stop offset="0%" stop-color="rgba(255,255,255,0.5)" />
        <stop offset="100%" stop-color="rgba(255,255,255,0)" />
      </linearGradient>
      <filter id="soft" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="7" />
      </filter>
    </defs>

    <!-- ambient backdrop glow -->
    <ellipse cx="520" cy="430" rx="430" ry="470" fill="url(#gBack)" />

    <!-- papery neck wisps (top) -->
    <g class="wisps" stroke="#b06a4f" stroke-width="2.4" fill="none" opacity="0.5" stroke-linecap="round">
      <path d="M520 214 C512 150 500 110 470 70" />
      <path d="M520 214 C520 150 522 104 520 60" />
      <path d="M520 214 C530 150 548 112 582 74" />
      <path d="M520 214 C516 156 508 128 494 96" />
      <path d="M520 214 C526 156 540 130 560 100" />
    </g>

    <!-- faint roots (bottom) -->
    <g class="roots" stroke="#d8b58c" stroke-width="1.6" fill="none" opacity="0.32" stroke-linecap="round">
      <path d="M520 668 C516 706 506 736 486 766" />
      <path d="M520 668 C520 708 521 742 520 778" />
      <path d="M520 668 C525 706 538 738 560 768" />
      <path d="M520 668 C512 700 500 724 482 742" />
    </g>

    <!-- papery skin behind the layers -->
    <path d="M520 210 C724 320 698 576 520 672 C342 576 316 320 520 210 Z"
          fill="url(#gSkin)" :opacity="active === null ? 0.55 : 0.22" class="band skin" />

    <!-- the four layers -->
    <g class="layers">
      <path v-for="a in almonds" :key="a.id"
            :d="a.d" :fill="`url(#${a.grad})`"
            class="band layer"
            :class="{ on: active === a.id }"
            :style="{ opacity: opacity(a.id), '--glow': a.glow }"
            @mouseenter="emit('hover', a.id)"
            @mouseleave="emit('hover', null)"
            @click="emit('select', a.id)" />
    </g>

    <!-- vertical striations -->
    <g class="striae" stroke="rgba(255,255,255,0.06)" stroke-width="1.5" fill="none">
      <path d="M520 220 C470 330 470 540 520 656" />
      <path d="M520 220 C570 330 570 540 520 656" />
    </g>

    <!-- core glow -->
    <circle cx="520" cy="498" r="120" fill="url(#gCore)" class="core" filter="url(#soft)" />
    <circle cx="520" cy="498" r="13" fill="#fff7df" class="core-dot" />

    <!-- top-left gloss -->
    <ellipse cx="452" cy="330" rx="120" ry="190" fill="url(#gHi)" opacity="0.22"
             transform="rotate(-18 452 330)" pointer-events="none" />
  </svg>
</template>

<style scoped>
.onion { width: 100%; height: auto; display: block; overflow: visible; }

.band { cursor: pointer; transition: opacity 0.5s ease, filter 0.5s ease; transform-box: view-box; transform-origin: 520px 440px; }
.layer.on { filter: drop-shadow(0 0 22px var(--glow)); transition: opacity 0.4s ease, filter 0.4s ease, transform 0.4s ease; transform: scale(1.035); }
.skin { pointer-events: none; transition: opacity 0.5s ease; }
.striae, .wisps, .roots { pointer-events: none; }

.core { animation: breathe 4.6s ease-in-out infinite; }
.core-dot { animation: pulse 4.6s ease-in-out infinite; }

@keyframes breathe {
  0%, 100% { opacity: 0.7; transform: scale(1); transform-box: view-box; transform-origin: 520px 498px; }
  50% { opacity: 1; transform: scale(1.08); transform-box: view-box; transform-origin: 520px 498px; }
}
@keyframes pulse {
  0%, 100% { opacity: 0.85; }
  50% { opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
  .band, .layer.on { transition: opacity 0.2s ease; transform: none; }
  .core, .core-dot { animation: none; }
}
</style>
