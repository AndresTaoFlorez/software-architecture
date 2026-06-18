<script setup lang="ts">
// PRESENTATION — the lesson card. Pure display: it receives a layer and shows
// it in plain language, with small graphics (emoji + a mini onion locator) to
// make each layer scannable. No 3D, no data access; it just renders its input.

import type { ArchitectureLayer } from '../../domain/entities/ArchitectureLayer'

defineProps<{ layer: ArchitectureLayer | null }>()

// Concentric radii for the little locator onion (outer -> core).
const ringR = [27, 20, 13, 6]
</script>

<template>
  <aside class="panel" :class="{ empty: !layer }">
    <template v-if="layer">
      <div class="head" :style="{ '--c': layer.color }">
        <span class="layer-icon">{{ layer.icon }}</span>
        <div class="head-text">
          <span class="role-tag">Layer {{ layer.depth + 1 }} of 4</span>
          <h2 class="name" :style="{ color: layer.color }">{{ layer.name }}</h2>
        </div>
        <!-- Mini onion: shows where this layer sits -->
        <svg class="locator" viewBox="0 0 64 64" aria-hidden="true">
          <circle
            v-for="(r, i) in ringR"
            :key="i"
            cx="32"
            cy="32"
            :r="r"
            fill="none"
            :stroke="i === layer.depth ? layer.color : 'rgba(255,255,255,0.16)'"
            :stroke-width="i === layer.depth ? 3.5 : 1.5"
            :style="i === layer.depth ? { filter: `drop-shadow(0 0 5px ${layer.color})` } : {}"
          />
          <circle cx="32" cy="32" r="3.4" :fill="layer.depth === 3 ? layer.color : 'rgba(255,255,255,0.28)'" />
        </svg>
      </div>

      <p class="tagline">{{ layer.tagline }}</p>
      <p class="role">{{ layer.role }}</p>

      <p class="analogy">
        <span class="analogy-icon">{{ layer.analogyIcon }}</span>
        <span><span class="lbl">Think of it as</span> {{ layer.analogy }}</span>
      </p>

      <div class="lives">
        <span class="lbl">What lives here</span>
        <ul>
          <li v-for="item in layer.livesHere" :key="item.label" :style="{ '--c': layer.color }">
            <span class="li-icon">{{ item.icon }}</span>{{ item.label }}
          </li>
        </ul>
      </div>

      <p class="rule"><span class="lbl">The rule</span> {{ layer.rule }}</p>

      <pre class="code"><code>{{ layer.code }}</code></pre>
    </template>

    <template v-else>
      <div class="head"><span class="layer-icon">🧅</span>
        <div class="head-text">
          <span class="role-tag">Start here</span>
          <h2 class="name idle">Explore the onion</h2>
        </div>
      </div>
      <p class="role">
        This is your app, sliced open. Each glowing shell is one layer of its
        architecture. <strong>Drag</strong> to spin it, <strong>scroll</strong> to zoom,
        and <strong>click any shell</strong> (or a name on the left) to learn what it does.
      </p>
      <p class="analogy">
        <span class="analogy-icon">🎯</span>
        <span><span class="lbl">The big idea</span> the outside can use the inside, but the
        inside never depends on the outside. Everything points toward the core.</span>
      </p>
    </template>
  </aside>
</template>

<style scoped>
.panel {
  background: rgba(20, 12, 22, 0.72);
  backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  padding: 26px 28px 24px;
  width: min(380px, calc(100vw - 32px));
  color: var(--text);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
}

.head {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
}
.layer-icon {
  font-size: 1.9rem;
  line-height: 1;
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.4));
}
.head-text { flex: 1; min-width: 0; }
.locator { width: 46px; height: 46px; flex: 0 0 auto; }
.role-tag {
  font-family: var(--mono);
  font-size: 0.64rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--text-faint);
}

.name {
  font-family: var(--display);
  font-size: 1.85rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  line-height: 1.05;
  margin: 2px 0 0;
}
.name.idle { color: var(--text); }

.tagline {
  font-family: var(--sans);
  font-size: 1rem;
  color: var(--text-dim);
  margin: 0 0 16px;
}

.role {
  font-family: var(--sans);
  font-size: 0.95rem;
  line-height: 1.55;
  color: var(--text);
  margin: 0 0 16px;
  letter-spacing: -0.005em;
}

.analogy {
  display: flex;
  gap: 11px;
  align-items: flex-start;
  font-family: var(--sans);
  font-size: 0.9rem;
  line-height: 1.5;
  color: var(--text-dim);
  margin: 0 0 18px;
  padding: 12px 14px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
}
.analogy-icon { font-size: 1.25rem; line-height: 1.2; flex: 0 0 auto; }

.lbl {
  display: block;
  font-family: var(--mono);
  font-size: 0.58rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--text-faint);
  margin-bottom: 4px;
}
.analogy .lbl, .rule .lbl { display: inline; margin-right: 6px; }

.lives { margin: 0 0 18px; }
.lives ul {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin: 6px 0 0;
  padding: 0;
}
.lives li {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--mono);
  font-size: 0.72rem;
  padding: 5px 11px;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--c) 45%, transparent);
  color: var(--text);
  background: color-mix(in srgb, var(--c) 12%, transparent);
}
.li-icon { font-size: 0.85rem; }

.rule {
  font-family: var(--sans);
  font-size: 0.9rem;
  line-height: 1.5;
  color: var(--text);
  margin: 0 0 18px;
}

.code {
  margin: 0;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 10px;
  padding: 14px 16px;
  overflow-x: auto;
}
.code code {
  font-family: var(--mono);
  font-size: 0.76rem;
  line-height: 1.55;
  color: #e9d6e2;
  white-space: pre;
}
</style>
