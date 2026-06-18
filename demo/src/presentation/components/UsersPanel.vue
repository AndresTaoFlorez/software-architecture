<script setup lang="ts">
import { reactive } from 'vue'
import { useUserStore } from '../stores/useUserStore'
import type { AdapterName } from '../composition/container'

const store = useUserStore()

const form = reactive({ firstName: '', lastName: '', email: '' })

async function submit() {
  const ok = await store.create({ ...form })
  if (ok) {
    form.firstName = ''
    form.lastName = ''
    form.email = ''
  }
}

const adapters: { name: AdapterName; label: string }[] = [
  { name: 'in-memory', label: 'In-memory' },
  { name: 'localStorage', label: 'localStorage' },
]
</script>

<template>
  <div class="panel">
    <!-- Adapter swap: the demo's thesis -->
    <div class="adapter-row">
      <span class="adapter-label">Infrastructure adapter</span>
      <div class="switch">
        <button
          v-for="a in adapters"
          :key="a.name"
          :class="{ on: store.adapter === a.name }"
          @click="store.swapAdapter(a.name)"
        >{{ a.label }}</button>
      </div>
    </div>
    <p class="hint">
      Swap the adapter and the list reloads from a different source — yet the store,
      use cases and components never change. That is the port doing its job.
    </p>

    <!-- Add form -->
    <form class="form" @submit.prevent="submit">
      <div class="fields">
        <input v-model="form.firstName" placeholder="First name" aria-label="First name" />
        <input v-model="form.lastName" placeholder="Last name" aria-label="Last name" />
        <input v-model="form.email" placeholder="email@domain.com" aria-label="Email" />
      </div>
      <button type="submit">Add user</button>
    </form>
    <p v-if="store.error" class="error">{{ store.error }}</p>

    <!-- List -->
    <div class="meta">
      <span>{{ store.total }} users</span>
      <span>{{ store.activeCount }} active</span>
      <button class="ghost" :disabled="store.loading" @click="store.load()">
        {{ store.loading ? 'Loading…' : 'Refresh' }}
      </button>
    </div>

    <ul class="users">
      <li v-for="u in store.users" :key="u.id" class="user">
        <span class="avatar">{{ u.initials }}</span>
        <span class="who">
          <strong>{{ u.fullName }}</strong>
          <small>{{ u.email }}</small>
        </span>
        <button
          class="status"
          :class="u.isActive ? 'active' : 'inactive'"
          @click="store.toggle(u.id)"
        >{{ u.statusLabel }}</button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.panel { display: flex; flex-direction: column; gap: 14px; }

.adapter-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.adapter-label { font-family: var(--mono); font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--infrastructure); }
.switch { display: flex; gap: 6px; background: rgba(0,0,0,0.3); padding: 4px; border-radius: 11px; }
.switch button { border: none; background: transparent; padding: 7px 14px; }
.switch button.on { background: var(--infrastructure); color: #1a0d12; }

.hint { font-size: 0.8rem; color: var(--text-faint); }

.form { display: flex; gap: 10px; align-items: stretch; flex-wrap: wrap; }
.fields { display: grid; grid-template-columns: 1fr 1fr 1.3fr; gap: 8px; flex: 1; min-width: 260px; }
.form > button { background: var(--presentation); color: #06121e; border-color: transparent; }

.error { color: var(--bad); font-size: 0.83rem; font-weight: 600; }

.meta { display: flex; align-items: center; gap: 16px; font-size: 0.8rem; color: var(--text-dim); border-top: 1px solid var(--border); padding-top: 12px; }
.meta .ghost { margin-left: auto; padding: 6px 12px; font-size: 0.78rem; }

.users { list-style: none; display: flex; flex-direction: column; gap: 8px; }
.user { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 10px; background: rgba(255,255,255,0.03); border: 1px solid var(--border); }
.avatar { width: 36px; height: 36px; border-radius: 50%; display: grid; place-items: center; font-family: var(--mono); font-size: 0.78rem; font-weight: 600; background: rgba(110,168,216,0.16); color: var(--presentation); flex-shrink: 0; }
.who { display: flex; flex-direction: column; line-height: 1.3; }
.who strong { font-size: 0.9rem; }
.who small { color: var(--text-faint); font-size: 0.76rem; font-family: var(--mono); }
.status { margin-left: auto; font-family: var(--mono); font-size: 0.66rem; padding: 4px 10px; }
.status.active { color: var(--good); border-color: rgba(94,211,160,0.5); }
.status.inactive { color: var(--text-faint); border-color: var(--border); }
</style>
