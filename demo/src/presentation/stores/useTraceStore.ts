// PRESENTATION — a small store that records the path a request takes through the
// layers, purely so the UI can visualise it. This is a teaching aid, not part of
// the architecture itself.

import { defineStore } from 'pinia'
import { ref } from 'vue'

export type LayerName = 'View' | 'Store' | 'UseCase' | 'Repository' | 'Domain'

export interface TraceStep {
  id: number
  layer: LayerName
  label: string
}

export const useTraceStore = defineStore('trace', () => {
  const steps = ref<TraceStep[]>([])
  let counter = 0

  function reset(): void {
    steps.value = []
    counter = 0
  }

  function push(layer: LayerName, label: string): void {
    steps.value.push({ id: ++counter, layer, label })
  }

  return { steps, reset, push }
})
