// @ts-check
/**
 * @param {import('../contracts').DiagramView} view
 * @param {string} action
 * @returns {import('../contracts').DiagramView}
 */
export function move(view, action) {
  const next = { ...view };
  if (action === 'in') next.scale = Math.min(4, view.scale * 1.25);
  if (action === 'out') next.scale = Math.max(0.25, view.scale / 1.25);
  if (action === 'left') next.x -= 40;
  if (action === 'right') next.x += 40;
  if (action === 'up') next.y -= 40;
  if (action === 'down') next.y += 40;
  return action === 'reset' ? { scale: 1, x: 0, y: 0 } : next;
}
export const keyActions = { '+': 'in', '=': 'in', '-': 'out', '0': 'reset', ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down' };
