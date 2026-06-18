<script setup lang="ts">
import { useTraceStore, type LayerName } from '../stores/useTraceStore'

const trace = useTraceStore()

const colors: Record<LayerName, string> = {
  View: 'var(--presentation)',
  Store: 'var(--presentation)',
  UseCase: 'var(--application)',
  Repository: 'var(--infrastructure)',
  Domain: 'var(--domain)',
}
</script>

<template>
  <div class="tracer">
    <h3>Data flow</h3>
    <p v-if="trace.steps.length === 0" class="empty">
      Interact with the panel and watch a request travel inward through the layers.
    </p>
    <TransitionGroup name="step" tag="ol" class="steps">
      <li v-for="s in trace.steps" :key="s.id" class="step">
        <span class="badge" :style="{ color: colors[s.layer], borderColor: colors[s.layer] }">{{ s.layer }}</span>
        <span class="label">{{ s.label }}</span>
      </li>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.tracer { display: flex; flex-direction: column; gap: 12px; }
h3 { font-size: 0.95rem; font-weight: 700; color: var(--text); }
.empty { color: var(--text-faint); font-size: 0.84rem; }

.steps { list-style: none; display: flex; flex-direction: column; gap: 7px; }
.step {
  display: flex; align-items: flex-start; gap: 10px;
  font-size: 0.82rem; color: var(--text-dim);
  padding: 7px 10px; border-radius: 8px;
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid var(--border);
}
.badge {
  font-family: var(--mono); font-size: 0.66rem; font-weight: 600;
  text-transform: uppercase; letter-spacing: 0.04em;
  border: 1px solid; border-radius: 6px; padding: 2px 7px;
  flex-shrink: 0; min-width: 84px; text-align: center;
}
.label { padding-top: 1px; }

.step-enter-active { transition: all 0.32s cubic-bezier(0.2, 0.8, 0.2, 1); }
.step-enter-from { opacity: 0; transform: translateX(-12px); }
</style>
