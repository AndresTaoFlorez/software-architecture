<script setup lang="ts">
// PRESENTATION — a render-less child of the canvas whose only job is to host
// the camera-focus loop inside the TresJS context. It pulls the live camera
// and controls from the context and hands them to useCameraFocus.

import { onMounted, toRef, watchEffect } from 'vue'
import { useTresContext } from '@tresjs/core'
import { useCameraFocus } from '../composables/useCameraFocus'
import type { ArchitectureLayer, LayerId } from '../../domain/entities/ArchitectureLayer'

const props = defineProps<{
  active: LayerId | null
  layers: ArchitectureLayer[]
  reduceMotion: boolean
}>()

const emit = defineEmits<{
  (e: 'ready', api: { reset: () => void; zoomBy: (f: number) => void }): void
}>()

const ctx = useTresContext()

// Google-Maps-style feel: drag to look around, scroll to zoom toward the
// cursor, drag with right button / two fingers to pan. No auto-rotation.
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
  c.maxDistance = 20
  c.dampingFactor = 0.1
  c.update?.()
})

const api = useCameraFocus({
  active: toRef(props, 'active'),
  layers: props.layers,
  reduceMotion: props.reduceMotion,
  getCamera: () => (ctx.camera as any)?.value,
  getControls: () => (ctx.controls as any)?.value,
})

// Hand the camera API up to the scene (closures fetch controls lazily, so this
// is safe to emit before the controls instance exists).
onMounted(() => emit('ready', api))
</script>

<template>
  <!-- nothing to render -->
</template>
