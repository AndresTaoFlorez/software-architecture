<script setup lang="ts">
// PRESENTATION — the scene orchestrator. Sets up the canvas, camera, lights,
// orbit controls and bloom, then composes the onion body, the ring labels, the
// inward dependency motes and the camera rig. Selection state comes from the
// parent; hover is local. Exposes resetView() to recentre the camera.

import { computed, ref } from 'vue'
import { Color } from 'three'
import { TresCanvas } from '@tresjs/core'
import { OrbitControls, ContactShadows } from '@tresjs/cientos'
import { EffectComposerPmndrs, BloomPmndrs, VignettePmndrs } from '@tresjs/post-processing'
import OnionBody from './OnionBody.vue'
import LayerLabels from './LayerLabels.vue'
import DependencyFlow from './DependencyFlow.vue'
import CameraRig from './CameraRig.vue'
import { container } from '../composition/container'
import type { LayerId } from '../../domain/entities/ArchitectureLayer'

const props = defineProps<{ active: LayerId | null }>()
const emit = defineEmits<{
  (e: 'select', id: LayerId): void
  (e: 'hover', id: LayerId | null): void
}>()

const layers = container.getLayers()

const hovered = ref<LayerId | null>(null)
const spotlit = computed<LayerId | null>(() => props.active ?? hovered.value)

const reduceMotion =
  typeof window !== 'undefined' &&
  !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// Bumping this signal tells the CameraRig to fly back to the default framing.
const resetSignal = ref(0)
function resetView() {
  resetSignal.value++
}
defineExpose({ resetView })

const core = layers.find((l) => l.isCore)!
const coreColor = new Color(core.color)

function onHover(id: LayerId | null) {
  hovered.value = id
  emit('hover', id)
}
</script>

<template>
  <TresCanvas clear-color="#0a070c" :alpha="false" :window-size="true">
    <TresPerspectiveCamera :position="[4.4, 3.2, 5.8]" :fov="42" :look-at="[0, 0, 0]" />
    <OrbitControls
      make-default
      :enable-pan="false"
      :enable-damping="true"
      :min-distance="3"
      :max-distance="11"
      :auto-rotate="!reduceMotion"
      :auto-rotate-speed="0.4"
      :target="[0, 0, 0]"
    />

    <!-- Lighting: soft fill + key light + warm glow from the core -->
    <TresAmbientLight :intensity="0.5" />
    <TresDirectionalLight :position="[5, 6, 4]" :intensity="1.05" />
    <TresPointLight :position="[0, 0, 0]" :color="coreColor" :intensity="16" :distance="6.5" :decay="2" />

    <OnionBody
      :layers="layers"
      :spotlit="spotlit"
      :reduce-motion="reduceMotion"
      @select="emit('select', $event)"
      @hover="onHover"
    />

    <LayerLabels :layers="layers" :spotlit="spotlit" @select="emit('select', $event)" />

    <DependencyFlow :reduce-motion="reduceMotion" />

    <CameraRig
      :active="active"
      :reset-signal="resetSignal"
      :layers="layers"
      :reduce-motion="reduceMotion"
    />

    <!-- Grounding shadow under the onion -->
    <ContactShadows
      :position="[0, -2.1, 0]"
      :opacity="0.55"
      :scale="9"
      :blur="2.6"
      :far="4"
      color="#000000"
    />

    <!-- Glow + vignette -->
    <EffectComposerPmndrs>
      <BloomPmndrs
        :intensity="0.85"
        :luminance-threshold="0.55"
        :luminance-smoothing="0.32"
        mipmap-blur
      />
      <VignettePmndrs :darkness="0.72" :offset="0.32" />
    </EffectComposerPmndrs>
  </TresCanvas>
</template>
