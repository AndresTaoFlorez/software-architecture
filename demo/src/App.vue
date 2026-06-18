<script setup lang="ts">
import { computed, ref } from 'vue'
import OnionDiagram from './presentation/components/OnionCrossSection.vue'
import LayerDetails from './presentation/components/LayerDetails.vue'
import type { LayerId } from './presentation/data/layers'

const peeled = ref<LayerId | null>(null)
const selected = computed(() => peeled.value)

function onLayerClick(id: LayerId) {
  peeled.value = peeled.value === id ? null : id
}

const GUIDE = 'https://github.com/AndresTaoFlorez/onion-architecture'
</script>

<template>
  <div class="page">
    <header class="head">
      <div class="meta">
        <span class="kicker">Onion Architecture</span>
        <span class="rule" aria-hidden="true"></span>
        <span class="kicker subtle">An interactive field guide</span>
      </div>

      <h1 class="title">
        <span class="upright">Peel</span>
        <span class="italic">the</span>
        <span class="upright accent">onion.</span>
      </h1>

      <p class="lede">
        Frontend Onion Architecture, made tangible. Click a layer to peel it open and see what it
        does — from the skin of the view all the way down to the core of the domain. Companion
        to the
        <a :href="GUIDE" target="_blank" rel="noopener">architecture guide</a>.
      </p>
    </header>

    <section class="explore">
      <div class="onion-card">
        <OnionDiagram :peeled="peeled" @select="onLayerClick" />
      </div>
      <div class="details-card">
        <LayerDetails :selected="selected" />
      </div>
    </section>

    <footer class="foot">
      <span class="mono">Vue 3 + Pinia + Vite · Bundled by Bun</span>
      <a :href="GUIDE" target="_blank" rel="noopener">Read the full guide →</a>
    </footer>
  </div>
</template>

<style scoped>
.page {
  max-width: 1024px;
  margin: 0 auto;
  padding: 72px 40px 80px;
}

.head {
  margin-bottom: 56px;
  max-width: 820px;
}

.meta {
  display: flex;
  align-items: center;
  gap: 14px;
  font-family: var(--mono);
  font-size: 0.72rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--text-faint);
  margin-bottom: 32px;
}

.meta .rule {
  flex: 0 0 36px;
  height: 1px;
  background: var(--rule);
}

.meta .subtle { color: var(--text-faint); opacity: 0.75; }

.title {
  font-size: clamp(3rem, 7.4vw, 5.6rem);
  line-height: 0.95;
  margin: 0 0 28px;
  font-variation-settings: 'opsz' 144, 'SOFT' 30;
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.18em;
}

.title .italic {
  font-style: italic;
  font-weight: 300;
  color: var(--text-dim);
  font-variation-settings: 'opsz' 144, 'SOFT' 80;
}

.title .accent {
  color: var(--accent);
  font-style: italic;
  font-weight: 500;
  font-variation-settings: 'opsz' 144, 'SOFT' 60;
}

.lede {
  font-family: var(--sans);
  font-size: 1.18rem;
  line-height: 1.55;
  color: var(--text-dim);
  max-width: 600px;
  font-weight: 400;
}

.lede a { color: var(--text); }

.explore {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 64px;
  padding: 56px 0 64px;
}

.onion-card {
  display: flex;
  align-items: center;
  justify-content: center;
}

.details-card {
  width: 100%;
  max-width: 560px;
}

.foot {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 24px;
  flex-wrap: wrap;
  font-family: var(--mono);
  font-size: 0.74rem;
  letter-spacing: 0.08em;
  color: var(--text-faint);
  padding-top: 28px;
  margin-top: 16px;
  border-top: 1px solid var(--rule);
}

.foot a {
  font-family: var(--mono);
  font-size: 0.74rem;
  letter-spacing: 0.08em;
  color: var(--text);
}

@media (max-width: 900px) {
  .explore { gap: 40px; padding: 32px 0 48px; }
  .head { margin-bottom: 32px; }
  .page { padding: 48px 24px 56px; }
}
</style>
