<script setup lang="ts">
// Editorial details panel. Mirrors the kicker + italic name + description
// style of the page header. No card, no border, no background — just type.

import { computed } from 'vue'
import { LAYERS, type LayerId } from '../data/layers'

const props = defineProps<{
  selected: LayerId | null
}>()

const layer = computed(() =>
  props.selected ? LAYERS.find((l) => l.id === props.selected) ?? null : null,
)
</script>

<template>
  <div class="details">
    <div v-if="layer" class="entry" :style="{ '--accent': layer.color }">
      <div class="meta">
        <span class="num">{{ layer.num }}</span>
        <span class="rule" aria-hidden="true"></span>
        <span class="kicker">{{ layer.kicker }}</span>
      </div>

      <h2 class="name">{{ layer.name }}</h2>

      <p class="desc">{{ layer.desc }}</p>
    </div>

    <div v-else class="placeholder">
      <div class="meta">
        <span class="num">—</span>
        <span class="rule" aria-hidden="true"></span>
        <span class="kicker">Pick a layer</span>
      </div>
      <h2 class="name">No layer selected.</h2>
      <p class="desc">Hover or click any ring of the onion to see what that layer does.</p>
    </div>
  </div>
</template>

<style scoped>
.details {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 340px;
}

.entry {
  --accent: var(--accent, #8a2350);
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.meta {
  display: flex;
  align-items: center;
  gap: 14px;
  font-family: var(--mono);
  font-size: 0.7rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--text-faint);
}

.num {
  color: var(--accent);
  font-weight: 500;
  font-size: 0.78rem;
  letter-spacing: 0.18em;
}

.rule {
  flex: 0 0 36px;
  height: 1px;
  background: var(--accent);
}

.kicker {
  color: var(--text-faint);
  font-size: 0.7rem;
  letter-spacing: 0.18em;
}

.name {
  font-family: var(--display);
  font-size: clamp(2.6rem, 4.6vw, 3.8rem);
  font-weight: 400;
  font-style: italic;
  line-height: 0.95;
  letter-spacing: -0.025em;
  color: var(--text);
  margin: 0;
  font-variation-settings: 'opsz' 144, 'SOFT' 50;
}

.desc {
  font-family: var(--sans);
  font-size: 1.1rem;
  line-height: 1.55;
  color: var(--text-dim);
  max-width: 480px;
  margin: 0;
  font-weight: 400;
}

.placeholder {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.placeholder .name {
  color: var(--text-faint);
  font-style: italic;
  font-weight: 300;
}
</style>
