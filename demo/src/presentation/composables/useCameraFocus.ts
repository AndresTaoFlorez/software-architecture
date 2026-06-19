// PRESENTATION composable — animates the camera to "fly into" a chosen layer
// and back to the default framing, without fighting OrbitControls. While a
// move is running the controls are disabled; once it settles, free orbit
// resumes. Must be used inside the TresCanvas context (it calls useLoop).

import { watch, type Ref } from 'vue'
import { Vector3 } from 'three'
import { useLoop } from '@tresjs/core'
import type { ArchitectureLayer, LayerId } from '../../domain/entities/ArchitectureLayer'

interface Options {
  active: Ref<LayerId | null>
  layers: ArchitectureLayer[]
  reduceMotion: boolean
  getCamera: () => any
  getControls: () => any
}

// Default framing (matches the camera's initial position).
const DEFAULT_POS = new Vector3(4.4, 3.2, 5.8)
const DEFAULT_TARGET = new Vector3(0, 0, 0)
// Camera looks along this direction; focusing changes distance + target, not
// the viewing angle, so the onion never flips disorientingly.
const DIR = new Vector3(4.4, 3.2, 5.8).normalize()
// A point in the middle of the open wedge (+X/+Z), used to aim at a ring.
const WEDGE = new Vector3(1, 0.18, 1).normalize()

export function useCameraFocus(opts: Options) {
  const desiredPos = DEFAULT_POS.clone()
  const desiredTarget = DEFAULT_TARGET.clone()
  let animating = false

  function computeFor(id: LayerId | null) {
    if (id === null) {
      desiredPos.copy(DEFAULT_POS)
      desiredTarget.copy(DEFAULT_TARGET)
      return
    }
    const layer = opts.layers.find((l) => l.id === id)
    const depth = layer ? layer.depth : 0
    const midR = layer ? (layer.radius + (opts.layers[depth + 1]?.radius ?? 0.42)) / 2 : 1
    // Aim a little way into the wedge at the layer's mid radius.
    desiredTarget.copy(WEDGE).multiplyScalar(midR * 0.7)
    // Closer for inner layers (depth 0..3 -> 6.0..3.2).
    const dist = 6.0 - depth * 0.95
    desiredPos.copy(desiredTarget).addScaledVector(DIR, dist)
  }

  function start() {
    const ctr = opts.getControls()
    const cam = opts.getCamera()
    if (opts.reduceMotion) {
      // Jump instantly when motion is reduced.
      cam?.position.copy(desiredPos)
      if (ctr) {
        ctr.target.copy(desiredTarget)
        ctr.update?.()
      }
      animating = false
      return
    }
    if (ctr) ctr.enabled = false
    animating = true
  }

  const { onBeforeRender } = useLoop()
  onBeforeRender(() => {
    if (!animating) return
    const cam = opts.getCamera()
    const ctr = opts.getControls()
    if (!cam || !ctr) return
    cam.position.lerp(desiredPos, 0.09)
    ctr.target.lerp(desiredTarget, 0.09)
    ctr.update?.()
    if (cam.position.distanceTo(desiredPos) < 0.03) {
      cam.position.copy(desiredPos)
      ctr.target.copy(desiredTarget)
      ctr.enabled = true
      ctr.update?.()
      animating = false
    }
  })

  watch(
    () => opts.active.value,
    (id) => {
      computeFor(id)
      start()
    },
  )

  // Recenter to the default framing.
  function reset() {
    computeFor(null)
    start()
  }

  // Dolly the camera toward (factor < 1) or away from (factor > 1) the target,
  // clamped to the controls' distance limits. Powers the +/- zoom buttons.
  function zoomBy(factor: number) {
    const cam = opts.getCamera()
    const ctr = opts.getControls()
    if (!cam || !ctr) return
    const offset = cam.position.clone().sub(ctr.target)
    const min = ctr.minDistance ?? 1.8
    const max = ctr.maxDistance ?? 20
    const len = Math.min(Math.max(offset.length() * factor, min), max)
    cam.position.copy(ctr.target).addScaledVector(offset.normalize(), len)
    ctr.update?.()
  }

  return { reset, zoomBy }
}
