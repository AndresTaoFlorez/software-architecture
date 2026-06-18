// PRESENTATION — a Pinia store that holds the running flow trace. The onion
// highlights its active layer from the most recent step, and the FlowTracer
// renders the full list.

import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { LayerId } from '../data/layers'

export interface TraceStep {
  layer: LayerId
  message: string
  ts: number
}

export const useTraceStore = defineStore('trace', () => {
  const steps = ref<TraceStep[]>([])

  function push(step: Omit<TraceStep, 'ts'>) {
    steps.value.push({ ...step, ts: Date.now() })
  }

  function clear() {
    steps.value = []
  }

  return { steps, push, clear }
})
