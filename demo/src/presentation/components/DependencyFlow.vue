<script setup lang="ts">
// PRESENTATION — small glowing motes that travel INWARD along the cut face,
// from the outer skin toward the core. They make the central rule visible:
// dependencies point inward. Bloom makes them read as little sparks. Disabled
// when the user prefers reduced motion.

import { ref } from 'vue'
import { AdditiveBlending } from 'three'
import { useLoop } from '@tresjs/core'

const props = defineProps<{ reduceMotion: boolean }>()

const OUTER = 2.0
const N = 12

// A handful of streams fanned across the open wedge, each mote offset in phase.
const motes = Array.from({ length: N }, (_, i) => {
  const deg = 58 - (116 * i) / (N - 1) // spread across the visible half
  return {
    angle: (deg * Math.PI) / 180,
    phase: (i * 0.137) % 1,
    speed: 0.1 + (i % 3) * 0.03,
  }
})

const meshes = ref<any[]>([])

const { onBeforeRender } = useLoop()
onBeforeRender(({ elapsed }) => {
  if (props.reduceMotion) return
  for (let i = 0; i < motes.length; i++) {
    const m = meshes.value[i]
    if (!m) continue
    const mo = motes[i]
    const t = (elapsed * mo.speed + mo.phase) % 1 // 0 at rim -> 1 at core
    const r = OUTER * (1 - t)
    m.position.set(r * Math.cos(mo.angle), r * Math.sin(mo.angle), 0.05)
    const s = 0.018 + 0.05 * (1 - t)
    m.scale.setScalar(s)
  }
})
</script>

<template>
  <TresGroup v-if="!reduceMotion">
    <TresMesh v-for="n in N" :key="n" :ref="(el) => (meshes[n - 1] = el)">
      <TresSphereGeometry :args="[1, 12, 12]" />
      <TresMeshBasicMaterial
        color="#fff2cf"
        :transparent="true"
        :opacity="0.9"
        :blending="AdditiveBlending"
        :depth-write="false"
      />
    </TresMesh>
  </TresGroup>
</template>
