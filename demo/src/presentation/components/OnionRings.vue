<script setup lang="ts">
// PRESENTATION — the onion as full concentric rings (a clean target diagram).
// Outer to inner: Presentation, Infrastructure, Application, Domain. Each ring
// is clickable and labelled with curved text along its top; the spotlit ring
// stays bright while the rest dim. The core (Domain) gets a centred label.

import { computed } from 'vue'
import type { ArchitectureLayer, LayerId } from '../../domain/entities/ArchitectureLayer'

const props = defineProps<{
  layers: ArchitectureLayer[]
  spotlit: LayerId | null
}>()
const emit = defineEmits<{
  (e: 'select', id: LayerId): void
  (e: 'hover', id: LayerId | null): void
}>()

const CX = 220
const CY = 220
const radii = [206, 158, 110, 62]

const bands = computed(() =>
  props.layers.map((l, i) => {
    const r = radii[i]
    const inner = radii[i + 1] ?? 0
    return {
      id: l.id,
      name: l.name,
      color: l.color,
      r,
      isCore: l.isCore,
      labelR: (r + inner) / 2,
    }
  }),
)

// Top semicircle arc (left -> right over the top) for upright curved labels.
function topArc(r: number): string {
  return `M ${CX - r} ${CY} A ${r} ${r} 0 0 1 ${CX + r} ${CY}`
}

function op(id: LayerId): number {
  return props.spotlit === null || props.spotlit === id ? 1 : 0.3
}
</script>

<template>
  <svg class="rings" viewBox="0 0 440 440" role="img" aria-label="Onion architecture layers">
    <defs>
      <path v-for="b in bands" :key="`${b.id}-arc`" :id="`arc-${b.id}`" :d="topArc(b.labelR)" />
      <filter id="lblShadow" x="-20%" y="-40%" width="140%" height="180%">
        <feDropShadow dx="0" dy="1" stdDeviation="1.1" flood-color="#000" flood-opacity="0.3" />
      </filter>
    </defs>

    <!-- rings, outer to inner so inner ones layer on top -->
    <circle
      v-for="b in bands"
      :key="b.id"
      :cx="CX"
      :cy="CY"
      :r="b.r"
      :fill="b.color"
      class="band"
      :style="{ opacity: op(b.id) }"
      @click="emit('select', b.id)"
      @pointerenter="emit('hover', b.id)"
      @pointerleave="emit('hover', null)"
    />

    <!-- labels -->
    <g filter="url(#lblShadow)">
      <template v-for="b in bands" :key="`${b.id}-label`">
        <text
          v-if="b.isCore"
          :x="CX"
          :y="CY"
          text-anchor="middle"
          dominant-baseline="central"
          class="label"
          :style="{ opacity: op(b.id) }"
        >{{ b.name }}</text>
        <text v-else class="label" :style="{ opacity: op(b.id) }">
          <textPath :href="`#arc-${b.id}`" startOffset="50%" text-anchor="middle">{{ b.name }}</textPath>
        </text>
      </template>
    </g>
  </svg>
</template>

<style scoped>
.rings {
  width: 100%;
  height: auto;
  display: block;
  overflow: visible;
}
.band {
  cursor: pointer;
  transition: opacity 0.25s ease, filter 0.2s ease;
}
.band:hover {
  filter: brightness(1.07);
}
.label {
  fill: #fff;
  font-family: var(--sans);
  font-weight: 600;
  font-size: 17px;
  letter-spacing: 0.2px;
  pointer-events: none;
  transition: opacity 0.25s ease;
}
</style>
