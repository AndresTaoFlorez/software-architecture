<script setup lang="ts">
// PRESENTATION — a render-less child of the canvas whose only job is to host
// the camera-focus loop inside the TresJS context. It pulls the live camera
// and controls from the context and hands them to useCameraFocus.

import { toRef } from 'vue'
import { useTresContext } from '@tresjs/core'
import { useCameraFocus } from '../composables/useCameraFocus'
import type { ArchitectureLayer, LayerId } from '../../domain/entities/ArchitectureLayer'

const props = defineProps<{
  active: LayerId | null
  resetSignal: number
  layers: ArchitectureLayer[]
  reduceMotion: boolean
}>()

const ctx = useTresContext()

useCameraFocus({
  active: toRef(props, 'active'),
  resetSignal: toRef(props, 'resetSignal'),
  layers: props.layers,
  reduceMotion: props.reduceMotion,
  getCamera: () => (ctx.camera as any)?.value,
  getControls: () => (ctx.controls as any)?.value,
})
</script>

<template>
  <!-- nothing to render -->
</template>
