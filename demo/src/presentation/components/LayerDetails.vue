<script setup lang="ts">
import { computed } from 'vue'
import { LAYERS, type LayerId } from '../data/layers'

const props = defineProps<{ selected: LayerId | null }>()
const info = computed(() => (props.selected ? LAYERS[props.selected] : null))
</script>

<template>
  <div class="details">
    <div v-if="!info" class="empty">
      <h3>Explore the onion</h3>
      <p>Pick a ring on the left to see what lives there, what it must never do, and the code that
        proves it in this very app.</p>
    </div>

    <div v-else class="content" :key="info.id" :style="{ '--accent': `var(--${info.id})` }">
      <header>
        <span class="dot"></span>
        <h3>{{ info.name }}</h3>
      </header>
      <p class="one-liner">{{ info.oneLiner }}</p>

      <div class="row">
        <span class="key">Depends on</span>
        <span class="val">{{ info.dependsOn }}</span>
      </div>

      <div class="row">
        <span class="key">What lives here</span>
        <span class="chips">
          <span v-for="item in info.lives" :key="item" class="chip">{{ item }}</span>
        </span>
      </div>

      <div class="row">
        <span class="key">Must not</span>
        <span class="val">{{ info.mustNot }}</span>
      </div>

      <pre class="code"><code>{{ info.example }}</code></pre>

      <p class="in-demo"><strong>In this demo:</strong> {{ info.inThisDemo }}</p>
    </div>
  </div>
</template>

<style scoped>
.details { min-height: 320px; }
.empty h3 { font-size: 1rem; margin-bottom: 8px; }
.empty p { color: var(--text-faint); font-size: 0.88rem; }

.content { animation: fade 0.3s ease; }
@keyframes fade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }

header { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.dot { width: 12px; height: 12px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 12px var(--accent); }
header h3 { font-size: 1.15rem; font-weight: 800; color: #fff; }

.one-liner { color: var(--text-dim); font-size: 0.92rem; margin-bottom: 16px; }

.row { display: flex; gap: 12px; padding: 9px 0; border-top: 1px solid var(--border); font-size: 0.85rem; }
.key { font-family: var(--mono); font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-faint); flex: 0 0 110px; padding-top: 2px; }
.val { color: var(--text-dim); }

.chips { display: flex; flex-wrap: wrap; gap: 6px; }
.chip { font-family: var(--mono); font-size: 0.72rem; padding: 3px 9px; border-radius: 999px; border: 1px solid var(--accent); color: var(--accent); background: color-mix(in srgb, var(--accent) 10%, transparent); }

.code {
  margin-top: 14px;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid var(--border);
  border-left: 2px solid var(--accent);
  border-radius: 8px;
  padding: 12px 14px;
  overflow-x: auto;
}
.code code { font-family: var(--mono); font-size: 0.76rem; color: #cdd4e0; line-height: 1.55; white-space: pre; }

.in-demo { margin-top: 14px; font-size: 0.82rem; color: var(--text-dim); }
.in-demo strong { color: var(--accent); }
</style>
