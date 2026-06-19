<script setup lang="ts">
// PRESENTATION — a render-less child of the canvas. It configures the controls
// for a Google-Earth feel and hands a small camera API up to the scene.

import { onMounted, watchEffect } from 'vue'
import { useTresContext } from '@tresjs/core'
import { useCameraFocus } from '../composables/useCameraFocus'

const emit = defineEmits<{
  (e: 'ready', api: { reset: () => void; zoomBy: (f: number) => void }): void
}>()

const ctx = useTresContext()

// Drag to look around, scroll to zoom toward the cursor, drag with the right
// button / two fingers to pan. No auto-rotation.
watchEffect(() => {
  const c = (ctx.controls as any)?.value
  if (!c) return
  c.enablePan = true
  c.screenSpacePanning = true
  c.zoomToCursor = true
  c.panSpeed = 0.9
  c.zoomSpeed = 1.15
  c.rotateSpeed = 0.7
  c.autoRotate = false
  c.minDistance = 1.8
  c.maxDistance = 22
  c.dampingFactor = 0.12
  c.update?.()
})

const narrow = typeof window !== 'undefined' && window.innerWidth < 640
const api = useCameraFocus({
  getCamera: () => (ctx.camera as any)?.value,
  getControls: () => (ctx.controls as any)?.value,
  home: narrow ? [6.2, 4.5, 8.2] : [4.4, 3.2, 5.8],
})

onMounted(() => emit('ready', api))
</script>

<template>
  <!-- nothing to render -->
</template>
