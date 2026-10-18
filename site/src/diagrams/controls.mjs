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

export function openDiagram(figure, trigger) {
  const dialog = document.createElement('dialog');
  dialog.className = 'diagram-dialog';
  dialog.setAttribute('aria-label', figure.querySelector('figcaption').textContent);
  const toolbar = document.createElement('div');
  toolbar.className = 'diagram-toolbar';
  const help = document.createElement('p');
  help.id = 'diagram-key-help';
  help.textContent = 'Arrow keys pan; + and − zoom; 0 resets. Escape closes.';
  const viewport = document.createElement('div');
  viewport.className = 'diagram-viewport';
  viewport.tabIndex = 0;
  viewport.setAttribute('role', 'region');
  viewport.setAttribute('aria-label', 'Diagram zoom and pan');
  viewport.setAttribute('aria-describedby', help.id);
  const canvas = document.createElement('div');
  canvas.className = 'diagram-canvas';
  const svg = figure.querySelector('svg').cloneNode(true);
  const naturalWidth = svg.viewBox?.baseVal?.width;
  if (naturalWidth) svg.setAttribute('width', String(naturalWidth));
  canvas.append(svg);
  viewport.append(canvas);
  let view = move({}, 'reset');
  const update = action => {
    view = move(view, action);
    canvas.style.transform = `translate(${view.x}px, ${view.y}px) scale(${view.scale})`;
  };
  for (const [label, action] of [['Zoom in', 'in'], ['Zoom out', 'out'], ['Reset', 'reset'], ['Pan left', 'left'], ['Pan right', 'right'], ['Pan up', 'up'], ['Pan down', 'down'], ['Close', 'close']]) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.addEventListener('click', () => action === 'close' ? dialog.close() : update(action));
    toolbar.append(button);
  }
  viewport.addEventListener('keydown', event => {
    const action = keyActions[event.key];
    if (!action) return;
    event.preventDefault();
    update(action);
  });
  dialog.addEventListener('close', () => { dialog.remove(); trigger.focus(); }, { once: true });
  dialog.append(toolbar, help, viewport);
  document.body.append(dialog);
  dialog.showModal();
  viewport.focus();
}