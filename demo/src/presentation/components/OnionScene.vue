<script setup lang="ts">
// PRESENTATION — the 3D onion. Nested spheres are carved open with two
// clipping planes (a quarter wedge removed, facing the camera). DoubleSide
// materials let you look into the concave shells, and an emissive core lights
// the interior. Orbit to rotate, scroll to zoom, click a shell to study it.

import { computed, ref } from 'vue'
import { DoubleSide, Color, MathUtils } from 'three'
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import { container } from '../composition/container'
import type { LayerId } from '../../domain/entities/ArchitectureLayer'

const props = defineProps<{ active: LayerId | null }>()
const emit = defineEmits<{
  (e: 'select', id: LayerId): void
  (e: 'hover', id: LayerId | null): void
}>()

const layers = container.getLayers()

const controlsRef = ref<any>(null)
function resetView() {
  const c = controlsRef.value?.instance ?? controlsRef.value?.value ?? controlsRef.value
  c?.reset?.()
}
defineExpose({ resetView })

const hovered = ref<LayerId | null>(null)
const spotlit = computed<LayerId | null>(() => props.active ?? hovered.value)

// Each shell is a partial sphere with a quarter wedge missing, baked straight
// into the geometry (no renderer clipping needed). phiStart = PI, phiLength =
// 1.5*PI leaves a 90-degree gap facing the +X/+Z corner, i.e. the camera, so
// you look straight into the nested, concave shells.
const PHI_START = Math.PI
const PHI_LENGTH = MathUtils.degToRad(270)

const reduceMotion =
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

function opacityFor(id: LayerId): number {
  if (spotlit.value === null) return 0.96
  return spotlit.value === id ? 1 : 0.16
}

function emissiveFor(id: LayerId): number {
  if (spotlit.value === id) return 0.55
  return 0.12
}

function enter(id: LayerId) {
  hovered.value = id
  emit('hover', id)
}
function leave(id: LayerId) {
  if (hovered.value === id) {
    hovered.value = null
    emit('hover', null)
  }
}

const core = layers.find((l) => l.isCore)!
const coreColor = new Color(core.color)
</script>

<template>
  <TresCanvas clear-color="#0a070c" :alpha="false" :window-size="true">
    <TresPerspectiveCamera :position="[4.4, 3.2, 5.8]" :fov="42" :look-at="[0, 0, 0]" />
    <OrbitControls
      ref="controlsRef"
      :enable-pan="false"
      :enable-damping="true"
      :min-distance="3"
      :max-distance="11"
      :auto-rotate="!reduceMotion"
      :auto-rotate-speed="0.45"
      :target="[0, 0, 0]"
    />

    <!-- Lighting: soft fill + a warm glow radiating from the core -->
    <TresAmbientLight :intensity="0.55" />
    <TresDirectionalLight :position="[5, 6, 4]" :intensity="1.1" />
    <TresPointLight :position="[0, 0, 0]" :color="coreColor" :intensity="14" :distance="6" :decay="2" />

    <!-- The four nested shells, outer skin to inner -->
    <TresMesh
      v-for="l in layers"
      :key="l.id"
      @click="emit('select', l.id)"
      @pointer-enter="enter(l.id)"
      @pointer-leave="leave(l.id)"
    >
      <TresSphereGeometry :args="[l.radius, 96, 64, PHI_START, PHI_LENGTH]" />
      <TresMeshStandardMaterial
        :color="l.color"
        :emissive="l.color"
        :emissive-intensity="emissiveFor(l.id)"
        :roughness="0.5"
        :metalness="0.05"
        :side="DoubleSide"
        :transparent="true"
        :opacity="opacityFor(l.id)"
      />
    </TresMesh>

    <!-- Glowing domain core (never clipped) -->
    <TresMesh :position="[0, 0, 0]">
      <TresSphereGeometry :args="[0.42, 48, 48]" />
      <TresMeshStandardMaterial
        :color="coreColor"
        :emissive="coreColor"
        :emissive-intensity="1.4"
        :roughness="0.3"
      />
    </TresMesh>
  </TresCanvas>
</template>
