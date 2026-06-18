<script setup lang="ts">
// Panel to the right of the onion. Reads which layer is currently selected
// (pinned by click) and shows its kicker, name, description, and a small
// code snippet. When nothing is selected, falls back to a hint.

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
      <span class="num mono">{{ layer.num }}</span>
      <span class="kicker mono">{{ layer.kicker }}</span>
      <h2 class="name">{{ layer.name }}</h2>
      <p class="desc">{{ layer.desc }}</p>
      <pre class="code"><code>{{ layer.code }}</code></pre>
    </div>
    <div v-else class="placeholder">
      <span class="kicker mono">Pick a layer</span>
      <p>Hover or click any ring of the onion to see what that layer does.</p>
    </div>
  </div>
</template>

<style scoped>
.details {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 220px;
}

.entry {
  --accent: var(--domain);
  display: grid;
  grid-template-columns: auto 1fr;
  column-gap: 12px;
  row-gap: 8px;
  align-items: baseline;
}

.num {
  grid-row: 1;
  grid-column: 1;
  font-size: 0.78rem;
  letter-spacing: 0.12em;
  color: var(--accent);
  font-weight: 700;
  text-transform: uppercase;
  align-self: start;
  padding-top: 2px;
}

.kicker {
  grid-row: 1;
  grid-column: 2;
  font-size: 0.7rem;
  letter-spacing: 0.14em;
  color: var(--accent);
  text-transform: uppercase;
  opacity: 0.85;
}

.name {
  grid-row: 2;
  grid-column: 1 / -1;
  font-size: 1.6rem;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: var(--text);
  margin: 0;
  line-height: 1.1;
}

.desc {
  grid-row: 3;
  grid-column: 1 / -1;
  color: var(--text-dim);
  font-size: 0.96rem;
  margin: 0;
}

.code {
  grid-row: 4;
  grid-column: 1 / -1;
  margin: 0;
  padding: 14px 16px;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid var(--border);
  border-left: 3px solid var(--accent);
  border-radius: 8px;
  font-family: var(--mono);
  font-size: 0.82rem;
  color: var(--text);
  line-height: 1.55;
  white-space: pre-wrap;
  word-break: break-word;
  overflow-x: auto;
}

.placeholder {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.placeholder .kicker {
  font-size: 0.72rem;
  letter-spacing: 0.14em;
  color: var(--text-faint);
  text-transform: uppercase;
}

.placeholder p {
  color: var(--text-dim);
  font-size: 0.94rem;
  margin: 0;
}
</style>
