<script setup lang="ts">
import { ref } from 'vue'
import OnionDiagram from './presentation/components/OnionCrossSection.vue'
import LayerDetails from './presentation/components/LayerDetails.vue'
import type { LayerId } from './presentation/data/layers'

const selected = ref<LayerId | null>('domain')

const GUIDE = 'https://github.com/AndresTaoFlorez/onion-architecture'
</script>

<template>
  <div class="page">
    <header class="head">
      <div class="badge mono">Onion Architecture · interactive</div>
      <h1>Peel the onion.</h1>
      <p class="lede">
        Frontend Onion Architecture, made tangible. Click a layer to learn what it does.
        Built straight from the
        <a :href="GUIDE" target="_blank" rel="noopener">architecture guide</a>.
      </p>
    </header>

    <section class="explore">
      <div class="card onion-card">
        <OnionDiagram :active="selected" @select="selected = $event" />
      </div>
      <div class="card details-card">
        <LayerDetails :selected="selected" />
      </div>
    </section>

    <footer class="foot">
      <span>Vue 3 + Pinia + Vite, bundled by Bun.</span>
      <a :href="GUIDE" target="_blank" rel="noopener">Read the architecture guide →</a>
    </footer>
  </div>
</template>

<style scoped>
.page { max-width: 1100px; margin: 0 auto; padding: 48px 22px 64px; }

.head { margin-bottom: 32px; max-width: 730px; }
.badge {
  display: inline-block; font-size: 0.7rem; letter-spacing: 0.08em; text-transform: uppercase;
  color: var(--domain); border: 1px solid rgba(255,212,121,0.3); border-radius: 999px;
  padding: 5px 13px; margin-bottom: 18px; background: rgba(255,212,121,0.05);
}
h1 { font-size: clamp(2rem, 5vw, 3.1rem); font-weight: 800; letter-spacing: -0.02em; color: #fff; line-height: 1.08; }
.lede { margin-top: 14px; color: var(--text-dim); font-size: 1.02rem; }

.explore { display: grid; grid-template-columns: 0.85fr 1fr; gap: 18px; align-items: stretch; }
.onion-card { display: flex; align-items: center; justify-content: center; min-height: 540px; }

.card {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 24px;
  backdrop-filter: blur(8px);
}

.foot {
  margin-top: 38px; padding-top: 20px; border-top: 1px solid var(--border);
  display: flex; justify-content: space-between; gap: 14px; flex-wrap: wrap;
  font-size: 0.82rem; color: var(--text-faint);
}

@media (max-width: 820px) {
  .explore { grid-template-columns: 1fr; }
  .onion-card { min-height: 420px; }
}
</style>
