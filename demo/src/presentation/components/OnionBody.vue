<script setup lang="ts">
// PRESENTATION — the onion geometry. Two things make the cut read as a real
// sliced onion: (1) the curved partial-sphere shells give it volume, and
// (2) flat concentric "ring caps" fill the two cut faces, so you see solid
// rings of colour like an Earth-structure diagram. A glowing core sits at the
// centre. The flat rings double as the big, easy click targets.

import { computed, ref } from 'vue'
import { DoubleSide, Color, MathUtils, CanvasTexture, RepeatWrapping } from 'three'
import { useLoop } from '@tresjs/core'
import type { ArchitectureLayer, LayerId } from '../../domain/entities/ArchitectureLayer'

const props = defineProps<{
  layers: ArchitectureLayer[]
  spotlit: LayerId | null
  reduceMotion: boolean
}>()
const emit = defineEmits<{
  (e: 'select', id: LayerId): void
  (e: 'hover', id: LayerId | null): void
}>()

// Wedge cut into every shell: phiStart = PI, phiLength = 270deg leaves a
// 90deg gap facing the +X/+Z corner (the camera). The shell rims land exactly
// on the two cut planes (z = 0, x >= 0) and (x = 0, z >= 0) that the caps fill.
const PHI_START = Math.PI
const PHI_LENGTH = MathUtils.degToRad(270)
const CORE_R = 0.42

// Each layer becomes a colour band [outer -> inner]; the innermost band runs
// down to the core radius, then a centre disc finishes the core colour.
const bands = computed(() => {
  const ls = props.layers
  const out = ls.map((l, i) => ({
    id: l.id,
    color: l.color,
    outer: l.radius,
    inner: ls[i + 1]?.radius ?? CORE_R,
  }))
  const core = ls[ls.length - 1]
  out.push({ id: core.id, color: core.color, outer: CORE_R, inner: 0 })
  return out
})

const core = props.layers[props.layers.length - 1]
const coreColor = new Color(core.color)

// Half-annulus in the XY plane, the x >= 0 half (thetaStart -90deg, sweep 180).
function ringArgs(inner: number, outer: number): [number, number, number, number, number, number] {
  return [inner, outer, 64, 1, -Math.PI / 2, Math.PI]
}

// The two cut faces: cap B sits in the z = 0 plane (no rotation); cap A is
// rotated about Y so the same half-annulus lands in the x = 0 plane.
const capRotations: [number, number, number][] = [
  [0, 0, 0],
  [0, -Math.PI / 2, 0],
]

function ringEmissive(id: LayerId): number {
  if (props.spotlit === null) return 0.4
  return props.spotlit === id ? 0.95 : 0.22
}

function shellOpacity(id: LayerId): number {
  if (props.spotlit === null) return 0.5
  return props.spotlit === id ? 0.72 : 0.12
}
function shellEmissive(id: LayerId): number {
  return props.spotlit === id ? 0.6 : 0.14
}

// Procedural papery striations for the outer skin (no external asset).
function striationTexture(): CanvasTexture {
  const c = document.createElement('canvas')
  c.width = 256
  c.height = 256
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#808080'
  ctx.fillRect(0, 0, 256, 256)
  for (let i = 0; i < 60; i++) {
    const x = Math.random() * 256
    ctx.strokeStyle = `rgba(${Math.random() > 0.5 ? 255 : 40},${Math.random() > 0.5 ? 255 : 40},${Math.random() > 0.5 ? 255 : 40},0.18)`
    ctx.lineWidth = 0.6 + Math.random() * 1.2
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x + (Math.random() - 0.5) * 12, 256)
    ctx.stroke()
  }
  const tex = new CanvasTexture(c)
  tex.wrapS = tex.wrapT = RepeatWrapping
  tex.repeat.set(6, 3)
  return tex
}
const skin = striationTexture()

// Gentle breathing of the core so the glow feels alive.
const coreRef = ref<any>(null)
const { onBeforeRender } = useLoop()
onBeforeRender(({ elapsed }) => {
  if (props.reduceMotion || !coreRef.value) return
  const s = 1 + Math.sin(elapsed * 1.7) * 0.06
  coreRef.value.scale.setScalar(s)
})
</script>

<template>
  <TresGroup>
    <!-- Curved shells: rounded exterior + interior glow -->
    <TresMesh
      v-for="l in layers"
      :key="`shell-${l.id}`"
      @click="emit('select', l.id)"
      @pointer-enter="emit('hover', l.id)"
      @pointer-leave="emit('hover', null)"
    >
      <TresSphereGeometry :args="[l.radius, 96, 64, PHI_START, PHI_LENGTH]" />
      <TresMeshPhysicalMaterial
        :color="l.color"
        :emissive="l.color"
        :emissive-intensity="shellEmissive(l.id)"
        :roughness="0.42"
        :metalness="0.0"
        :clearcoat="0.6"
        :clearcoat-roughness="0.4"
        :sheen="1"
        :sheen-color="l.color"
        :bump-map="l.depth === 0 ? skin : null"
        :bump-scale="l.depth === 0 ? 0.015 : 0"
        :side="DoubleSide"
        :transparent="true"
        :opacity="shellOpacity(l.id)"
      />
    </TresMesh>

    <!-- Two solid ring caps fill the cut faces: the sliced-onion rings -->
    <TresGroup v-for="(rot, ci) in capRotations" :key="`cap-${ci}`" :rotation="rot">
      <TresMesh
        v-for="(b, bi) in bands"
        :key="`ring-${ci}-${bi}`"
        @click="emit('select', b.id)"
        @pointer-enter="emit('hover', b.id)"
        @pointer-leave="emit('hover', null)"
      >
        <TresRingGeometry :args="ringArgs(b.inner, b.outer)" />
        <TresMeshStandardMaterial
          :color="b.color"
          :emissive="b.color"
          :emissive-intensity="ringEmissive(b.id)"
          :roughness="0.55"
          :metalness="0.0"
          :side="DoubleSide"
        />
      </TresMesh>
    </TresGroup>

    <!-- Glowing core (full sphere, drives the bloom) -->
    <TresMesh ref="coreRef" :position="[0, 0, 0]">
      <TresSphereGeometry :args="[CORE_R, 48, 48]" />
      <TresMeshStandardMaterial
        :color="coreColor"
        :emissive="coreColor"
        :emissive-intensity="2.4"
        :roughness="0.25"
      />
    </TresMesh>
  </TresGroup>
</template>
