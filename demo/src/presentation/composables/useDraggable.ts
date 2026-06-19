// PRESENTATION composable — makes an element draggable by a handle, using
// pointer events (works for mouse + touch). Returns an offset that the caller
// applies as a CSS translate, plus a pointerdown handler to wire to the handle.

import { onBeforeUnmount, ref } from 'vue'

export function useDraggable() {
  const offset = ref({ x: 0, y: 0 })
  const dragging = ref(false)

  let startX = 0
  let startY = 0
  let baseX = 0
  let baseY = 0

  function onMove(e: PointerEvent) {
    if (!dragging.value) return
    offset.value = { x: baseX + (e.clientX - startX), y: baseY + (e.clientY - startY) }
  }

  function onUp() {
    dragging.value = false
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerup', onUp)
  }

  function onPointerDown(e: PointerEvent) {
    // Ignore drags that start on a button (e.g. the close control).
    if ((e.target as HTMLElement).closest('button')) return
    dragging.value = true
    startX = e.clientX
    startY = e.clientY
    baseX = offset.value.x
    baseY = offset.value.y
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  function reset() {
    offset.value = { x: 0, y: 0 }
  }

  onBeforeUnmount(onUp)

  return { offset, dragging, onPointerDown, reset }
}
