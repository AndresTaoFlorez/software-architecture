// PRESENTATION composable — a tiny camera API for the on-screen controls.
// The user always drives the camera (orbit / zoom / pan via OrbitControls);
// these helpers only power the "recenter" and zoom-in/out buttons. Nothing
// here disables the controls, so the scene can never get stuck.

import { Vector3 } from 'three'

interface Options {
  getCamera: () => any
  getControls: () => any
  home?: [number, number, number]
}

export function useCameraFocus(opts: Options) {
  const home = new Vector3(...(opts.home ?? [4.4, 3.2, 5.8]))

  // Snap back to the default framing.
  function reset() {
    const cam = opts.getCamera()
    const ctr = opts.getControls()
    if (!cam || !ctr) return
    cam.position.copy(home)
    ctr.target.set(0, 0, 0)
    ctr.update?.()
  }

  // Dolly toward (factor < 1) or away from (factor > 1) the target, clamped to
  // the controls' distance limits.
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
