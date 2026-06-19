// PRESENTATION composable — drag an element by a handle using pointer events
// (mouse + touch). It captures the pointer so moves/releases are never lost,
// auto-ends if the button is released off-element, and clamps the element so it
// can never be dragged off screen. Returns an offset to apply as a translate.

import { onBeforeUnmount, ref, type Ref } from 'vue'

export function useDraggable(targetEl?: Ref<HTMLElement | null>) {
  const offset = ref({ x: 0, y: 0 })
  const dragging = ref(false)

  let startX = 0
  let startY = 0
  let baseX = 0
  let baseY = 0
  let captureEl: HTMLElement | null = null
  let capturePointer = 0
  // The element's untranslated position + size, captured once per drag so the
  // clamp is deterministic (no fighting Vue's async DOM updates mid-drag).
  let frame: { left: number; top: number; w: number; h: number } | null = null

  function clampN(v: number, a: number, b: number) {
    const lo = Math.min(a, b)
    const hi = Math.max(a, b)
    return Math.min(Math.max(v, lo), hi)
  }

  // Keep the element within an 8px margin of the viewport.
  function clamp(o: { x: number; y: number }) {
    if (!frame) return o
    const m = 8
    return {
      x: clampN(o.x, m - frame.left, window.innerWidth - m - frame.w - frame.left),
      y: clampN(o.y, m - frame.top, window.innerHeight - m - frame.h - frame.top),
    }
  }

  function onMove(e: PointerEvent) {
    if (!dragging.value) return
    // If the button was released while we missed the up event, stop.
    if (e.buttons === 0) {
      end()
      return
    }
    offset.value = clamp({ x: baseX + (e.clientX - startX), y: baseY + (e.clientY - startY) })
  }

  function end() {
    if (!dragging.value) return
    dragging.value = false
    if (captureEl) {
      try {
        captureEl.releasePointerCapture(capturePointer)
      } catch {
        /* ignore */
      }
      captureEl = null
    }
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerup', end)
    window.removeEventListener('pointercancel', end)
  }

  function onPointerDown(e: PointerEvent) {
    // Don't start a drag from an interactive control (e.g. the close button).
    if ((e.target as HTMLElement).closest('button')) return
    dragging.value = true
    startX = e.clientX
    startY = e.clientY
    baseX = offset.value.x
    baseY = offset.value.y
    // Capture the element's untranslated frame once for clamping this drag.
    const tEl = targetEl?.value
    if (tEl) {
      const r = tEl.getBoundingClientRect()
      frame = { left: r.left - offset.value.x, top: r.top - offset.value.y, w: r.width, h: r.height }
    }
    const el = e.currentTarget as HTMLElement
    try {
      el.setPointerCapture(e.pointerId)
      captureEl = el
      capturePointer = e.pointerId
    } catch {
      /* ignore */
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', end)
    window.addEventListener('pointercancel', end)
  }

  function reset() {
    offset.value = { x: 0, y: 0 }
  }

  onBeforeUnmount(end)

  return { offset, dragging, onPointerDown, reset }
}
