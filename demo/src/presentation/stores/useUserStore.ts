// PRESENTATION — a Pinia store. It holds reactive UI state and calls use cases.
// It never imports an HTTP client, never builds a User from raw JSON, and catches
// domain errors to turn them into friendly messages.

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '../../domain/entities/User'
import { DomainError } from '../../domain/errors/DomainErrors'
import { useCases, setAdapter, activeAdapter, type AdapterName } from '../composition/container'
import { useTraceStore } from './useTraceStore'

const tick = (ms = 200) => new Promise((r) => setTimeout(r, ms))

export const useUserStore = defineStore('users', () => {
  const users = ref<User[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const adapter = ref<AdapterName>(activeAdapter())

  const activeCount = computed(() => users.value.filter((u) => u.isActive).length)
  const total = computed(() => users.value.length)

  function fail(e: unknown): void {
    // Domain errors carry a meaningful message; anything else is unexpected.
    error.value = e instanceof DomainError ? e.message : 'Something went wrong.'
  }

  async function load(): Promise<void> {
    const trace = useTraceStore()
    trace.reset()
    trace.push('View', 'User opens the panel')
    await tick()
    loading.value = true
    error.value = null
    try {
      trace.push('Store', 'Calls the listUsers use case — no HTTP here')
      await tick()
      trace.push('UseCase', 'Delegates to the injected UserRepository port')
      await tick()
      trace.push('Repository', `The "${adapter.value}" adapter maps raw data into User entities`)
      users.value = await useCases.listUsers()
      trace.push('Store', 'Reactive state updated, the UI re-renders')
    } catch (e) {
      fail(e)
    } finally {
      loading.value = false
    }
  }

  async function create(form: { firstName: string; lastName: string; email: string }): Promise<boolean> {
    const trace = useTraceStore()
    trace.reset()
    trace.push('View', `Form submitted: ${form.firstName} ${form.lastName}`)
    await tick()
    error.value = null
    try {
      trace.push('Store', 'Calls the createUser use case')
      await tick()
      trace.push('UseCase', 'Validates application rules, may raise a domain error')
      await tick()
      trace.push('Repository', `Persists through the "${adapter.value}" adapter`)
      await useCases.createUser(form)
      trace.push('Store', 'Reloads the list from the source of truth')
      users.value = await useCases.listUsers()
      return true
    } catch (e) {
      trace.push('Domain', 'A domain error was raised and caught here')
      fail(e)
      return false
    }
  }

  async function toggle(id: string): Promise<void> {
    const trace = useTraceStore()
    trace.reset()
    trace.push('View', 'Clicked the status toggle')
    await tick()
    error.value = null
    try {
      trace.push('Store', 'Calls the toggleUserStatus use case')
      await tick()
      trace.push('UseCase', 'Flips status via the entity rule, then saves through the port')
      await tick()
      trace.push('Repository', `Saved through the "${adapter.value}" adapter`)
      await useCases.toggleStatus(id)
      users.value = await useCases.listUsers()
      trace.push('Store', 'State updated')
    } catch (e) {
      fail(e)
    }
  }

  // Swap the Infrastructure adapter at runtime. Application and the rest of
  // Presentation are untouched — only the composition root changes.
  async function swapAdapter(name: AdapterName): Promise<void> {
    setAdapter(name)
    adapter.value = name
    await load()
  }

  return { users, loading, error, adapter, activeCount, total, load, create, toggle, swapAdapter }
})
