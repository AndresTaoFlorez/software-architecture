<script setup lang="ts">
// PRESENTATION — floating labels anchored to each ring, in the spirit of an
// "Earth structure" diagram (a dot on the layer, a leader line, a name). Built
// with cientos <Html> so the text stays crisp and styleable. Clicking a label
// selects its layer; non-spotlit labels dim.

import { computed } from 'vue'
import { Html } from '@tresjs/cientos'
import type { ArchitectureLayer, LayerId } from '../../domain/entities/ArchitectureLayer'

const props = defineProps<{
  layers: ArchitectureLayer[]
  spotlit: LayerId | null
}>()
const emit = defineEmits<{ (e: 'select', id: LayerId): void }>()

const CORE_R = 0.42

// Anchor each label on the front cut face (z = 0) at the band's mid radius,
// fanned across the open wedge so they do not overlap.
const points = computed(() =>
  props.layers.map((l, i) => {
    const inner = props.layers[i + 1]?.radius ?? CORE_R
    const midR = (l.radius + inner) / 2
    const deg = 64 - i * 32 // 64, 32, 0, -32 degrees
    const a = (deg * Math.PI) / 180
    return {
      id: l.id,
      name: l.name,
      icon: l.icon,
      color: l.color,
      pos: [midR * Math.cos(a), midR * Math.sin(a), 0.04] as [number, number, number],
    }
  }),
)
</script>

<template>
  <Html
    v-for="p in points"
    :key="p.id"
    :position="p.pos"
    center
    :distance-factor="8"
  >
    <button
      class="lbl3d"
      :class="{ dim: spotlit !== null && spotlit !== p.id }"
      :style="{ '--c': p.color }"
      @click="emit('select', p.id)"
    >
      <span class="dot" />
      <span class="line" />
      <span class="box"><span class="ic">{{ p.icon }}</span>{{ p.name }}</span>
    </button>
  </Html>
</template>

<style scoped>
.lbl3d {
  display: flex;
  align-items: center;
  background: none;
  border: 0;
  padding: 0;
  cursor: pointer;
  white-space: nowrap;
  transform: translateX(40px);
  transition: opacity 0.25s ease;
}
.lbl3d.dim { opacity: 0.32; }
.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--c);
  box-shadow: 0 0 10px var(--c);
  flex: 0 0 auto;
}
.line {
  width: 30px;
  height: 1px;
  background: linear-gradient(to right, var(--c), color-mix(in srgb, var(--c) 30%, transparent));
  flex: 0 0 auto;
}
.box {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: 'Geist', system-ui, sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: #f3ebf0;
  background: rgba(20, 12, 22, 0.82);
  border: 1px solid color-mix(in srgb, var(--c) 50%, transparent);
  border-radius: 999px;
  padding: 4px 11px;
  backdrop-filter: blur(6px);
}
.ic { font-size: 13px; }
</style>
