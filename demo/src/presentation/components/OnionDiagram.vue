<script setup lang="ts">
import { ref, computed } from 'vue'
import type { LayerName } from '../stores/useTraceStore'
import type { LayerId } from '../data/layers'

const props = defineProps<{ active: LayerName | null; selected: LayerId | null }>()
const emit = defineEmits<{ (e: 'select', id: LayerId): void }>()

const hover = ref<LayerId | null>(null)

// The flow tracer's layer maps onto a ring.
const activeRing = computed<LayerId | null>(() => {
  switch (props.active) {
    case 'View':
    case 'Store': return 'presentation'
    case 'UseCase': return 'application'
    case 'Repository': return 'infrastructure'
    case 'Domain': return 'domain'
    default: return null
  }
})

const CX = 210
const CY = 210

// Outer to inner. Drawn in this order so inner disks sit on top and each ring
// band captures its own clicks.
const rings = [
  { id: 'presentation' as LayerId, r: 200, label: 'Presentation', labelY: CY - 200 + 24 },
  { id: 'infrastructure' as LayerId, r: 152, label: 'Infrastructure', labelY: CY - 152 + 23 },
  { id: 'application' as LayerId, r: 104, label: 'Application', labelY: CY - 104 + 22 },
  { id: 'domain' as LayerId, r: 58, label: 'Domain', labelY: CY + 4 },
]

function fillOpacity(id: LayerId): number {
  if (activeRing.value === id) return 0.42
  if (props.selected === id) return 0.32
  if (hover.value === id) return 0.24
  return 0.1
}
</script>

<template>
  <div class="diagram">
    <svg viewBox="0 0 420 420" role="group" aria-label="Interactive onion architecture diagram">
      <g v-for="ring in rings" :key="ring.id"
         class="ring"
         :class="{ 'is-active': activeRing === ring.id, 'is-selected': selected === ring.id }"
         @click="emit('select', ring.id)"
         @mouseenter="hover = ring.id"
         @mouseleave="hover = null">
        <circle
          :cx="CX" :cy="CY" :r="ring.r"
          :fill="`var(--${ring.id})`"
          :fill-opacity="fillOpacity(ring.id)"
          :stroke="`var(--${ring.id})`"
          :stroke-width="selected === ring.id ? 3.5 : 2" />
        <text :x="CX" :y="ring.labelY" :fill="`var(--${ring.id})`" class="ring-label">
          {{ ring.label }}
        </text>
      </g>
    </svg>
    <p class="caption">Click a layer to explore it · dependencies point inward &rarr;</p>
  </div>
</template>

<style scoped>
.diagram { display: flex; flex-direction: column; align-items: center; gap: 10px; }
svg { width: 100%; max-width: 340px; height: auto; }

.ring { cursor: pointer; }
.ring circle { transition: fill-opacity 0.3s ease, stroke-width 0.2s ease; }
.ring-label {
  font-family: var(--mono);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-anchor: middle;
  pointer-events: none;
  opacity: 0.92;
}

.ring.is-selected circle { filter: drop-shadow(0 0 6px currentColor); }
.ring.is-active circle { animation: pulse 1.1s ease-in-out infinite; }

@keyframes pulse {
  0%, 100% { filter: drop-shadow(0 0 3px currentColor); }
  50% { filter: drop-shadow(0 0 16px currentColor); }
}

.caption {
  font-family: var(--mono);
  font-size: 0.7rem;
  color: var(--text-faint);
  letter-spacing: 0.03em;
  text-align: center;
}
</style>
