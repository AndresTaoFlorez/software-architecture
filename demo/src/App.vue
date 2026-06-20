<script setup lang="ts">
import { computed, ref } from 'vue'
import OnionRings from './presentation/components/OnionRings.vue'
import TeachingPanel from './presentation/components/TeachingPanel.vue'
import { container } from './presentation/composition/container'
import type { LayerId } from './domain/entities/ArchitectureLayer'

const layers = container.getLayers()

const active = ref<LayerId | null>(null)
const hovered = ref<LayerId | null>(null)
const spotlit = computed(() => active.value ?? hovered.value)
const activeLayer = computed(() => layers.find((l) => l.id === active.value) ?? null)

function select(id: LayerId) {
  active.value = active.value === id ? null : id
}

const GUIDE = 'https://github.com/AndresTaoFlorez/onion-architecture'
</script>

<template>
  <div class="app">
    <header class="head">
      <span class="kicker">Onion Architecture</span>
      <h1 class="title">Inside a clean app.</h1>
    </header>

    <main class="main">
      <div class="diagram">
        <OnionRings
          :layers="layers"
          :spotlit="spotlit"
          @select="select"
          @hover="(id) => (hovered = id)"
        />
        <p class="caption">Dependencies point inward →</p>
      </div>

      <div class="lesson">
        <TeachingPanel :layer="activeLayer" />
      </div>
    </main>

    <footer class="foot">
      <p class="rule"><strong>The one rule:</strong> nothing inner ever knows anything outer.</p>
      <a :href="GUIDE" target="_blank" rel="noopener">Read the full guide →</a>
    </footer>
  </div>
</template>

<style scoped>
.app {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  padding: clamp(20px, 3.5vw, 40px) clamp(20px, 4vw, 56px);
  gap: clamp(16px, 3vh, 32px);
}

.head {
  flex: 0 0 auto;
}
.kicker {
  font-family: var(--mono);
  font-size: 0.7rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--text-faint);
}
.title {
  font-family: var(--display);
  font-size: clamp(1.8rem, 4.2vw, 2.8rem);
  font-weight: 600;
  letter-spacing: -0.035em;
  line-height: 1;
  margin: 8px 0 0;
  color: var(--text);
}

/* Main fills the remaining height and centres the composition */
.main {
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(28px, 5vw, 72px);
  min-height: 0;
}

.diagram {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 0;
}
.diagram :deep(svg) {
  height: min(64vh, 560px);
  width: auto;
  max-width: 100%;
}
.caption {
  font-family: var(--mono);
  font-size: 0.72rem;
  letter-spacing: 0.06em;
  color: var(--text-faint);
  margin: 18px 0 0;
}

.lesson {
  flex: 0 1 420px;
  min-width: 0;
  max-height: 78vh;
  overflow-y: auto;
}

.foot {
  flex: 0 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 20px;
  flex-wrap: wrap;
  padding-top: 16px;
  border-top: 1px solid var(--rule);
}
.foot .rule {
  font-family: var(--sans);
  font-size: 0.9rem;
  color: var(--text-dim);
  margin: 0;
}
.foot .rule strong { color: var(--text); }
.foot a {
  font-family: var(--mono);
  font-size: 0.76rem;
  letter-spacing: 0.05em;
  color: var(--text);
  white-space: nowrap;
}

/* Tablet / mobile: stack, onion on top, lesson below */
@media (max-width: 820px) {
  .app { gap: 18px; }
  .main {
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
    gap: 24px;
  }
  .diagram :deep(svg) { height: auto; width: min(78vw, 380px); }
  .lesson {
    flex: 1 1 auto;
    max-height: none;
    overflow: visible;
  }
}
</style>
