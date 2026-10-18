import { move, keyActions } from '../state/diagram.state.mjs';

const dialogs = new WeakMap();
export function closeDiagramFor(figure) {
  dialogs.get(figure)?.close();
}

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
  const svg = figure.querySelector('svg');
  const originalParent = svg.parentElement;
  const originalWidth = svg.getAttribute('width');
  const naturalWidth = svg.viewBox?.baseVal?.width;
  if (naturalWidth) svg.setAttribute('width', String(naturalWidth));
  canvas.append(svg);
  viewport.append(canvas);
  let view = move({ scale: 1, x: 0, y: 0 }, 'reset');
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
  dialog.addEventListener('close', () => {
    dialogs.delete(figure);
    if (originalWidth === null) svg.removeAttribute('width');
    else svg.setAttribute('width', originalWidth);
    // A theme change may already have rendered a replacement behind the modal.
    if (!originalParent.querySelector('svg')) originalParent.append(svg);
    dialog.remove();
    trigger.focus();
  }, { once: true });
  dialog.append(toolbar, help, viewport);
  document.body.append(dialog);
  dialogs.set(figure, dialog);
  dialog.showModal();
  viewport.focus();
}
