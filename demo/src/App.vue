<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import OnionDiagram from './presentation/components/OnionDiagram.vue'
import LayerDetails from './presentation/components/LayerDetails.vue'
import FlowTracer from './presentation/components/FlowTracer.vue'
import UsersPanel from './presentation/components/UsersPanel.vue'
import { useTraceStore } from './presentation/stores/useTraceStore'
import { useUserStore } from './presentation/stores/useUserStore'
import type { LayerId } from './presentation/data/layers'

const trace = useTraceStore()
const users = useUserStore()

const selected = ref<LayerId | null>('domain')

// The ring that lights up follows the most recent step in the live flow.
const activeLayer = computed(() => trace.steps.at(-1)?.layer ?? null)

const GUIDE = 'https://github.com/AndresTaoFlorez/onion-architecture'

onMounted(() => users.load())
</script>

<template>
  <div class="page">
    <header class="head">
      <div class="badge mono">Onion Architecture · interactive</div>
      <h1>Peel the onion.</h1>
      <p class="lede">
        Frontend Onion Architecture, made tangible. Click a layer to learn what it does, then use the
        live app below and watch each request travel inward through the very same rings. Built straight
        from the <a :href="GUIDE" target="_blank" rel="noopener">architecture guide</a>.
      </p>
    </header>

    <!-- The interactive onion is the centrepiece -->
    <section class="explore">
      <div class="card onion-card">
        <OnionDiagram :active="activeLayer" :selected="selected" @select="selected = $event" />
      </div>
      <div class="card details-card">
        <LayerDetails :selected="selected" />
      </div>
    </section>

    <div class="divider"><span>See it run</span></div>
    <p class="run-hint">
      Every action below flows <code>View → Store → UseCase → Repository</code>. Watch the matching ring
      light up in the onion above, and try swapping the Infrastructure adapter mid-session.
    </p>

    <section class="run">
      <div class="card panel-card">
        <h2>Users</h2>
        <UsersPanel />
      </div>
      <div class="card flow-card">
        <FlowTracer />
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
.onion-card { display: flex; align-items: center; justify-content: center; }

.card {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 24px;
  backdrop-filter: blur(8px);
}

.divider { display: flex; align-items: center; gap: 14px; margin: 38px 0 14px; }
.divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: var(--border); }
.divider span { font-family: var(--mono); font-size: 0.74rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-faint); }
.run-hint { color: var(--text-dim); font-size: 0.9rem; margin-bottom: 18px; }
.run-hint code { font-size: 0.82rem; color: var(--text); background: rgba(0,0,0,0.3); padding: 2px 6px; border-radius: 5px; }

.run { display: grid; grid-template-columns: 1fr 0.8fr; gap: 18px; align-items: start; }
.panel-card h2 { font-size: 1.05rem; font-weight: 700; margin-bottom: 16px; }

.foot {
  margin-top: 38px; padding-top: 20px; border-top: 1px solid var(--border);
  display: flex; justify-content: space-between; gap: 14px; flex-wrap: wrap;
  font-size: 0.82rem; color: var(--text-faint);
}

@media (max-width: 820px) {
  .explore, .run { grid-template-columns: 1fr; }
}
</style>
