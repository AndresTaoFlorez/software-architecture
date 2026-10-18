import { openDiagram, closeDiagramFor } from './components/DiagramDialog.mjs';
/**
 * Renderer is supplied by composition; this capability knows no Mermaid API.
 * @param {HTMLElement[]} figures
 * @param {import('./contracts').DiagramOptions} options
 * @returns {() => void}
 */
export function mountDiagrams(figures, { renderer, theme, subscribe }) {
  let revision = 0;
  let timer;
  async function render() {
    const current = ++revision;
    for (const [index, figure] of figures.entries()) {
      const preview = figure.querySelector('.diagram-preview');
      const status = figure.querySelector('.diagram-status');
      const button = figure.querySelector('button');
      try {
        const svg = await renderer.render(figure.querySelector('code').textContent, 'mermaid-' + current + '-' + index, theme());
        if (current !== revision) return;
        // Close before replacing the SVG, preserving native focus/identity behavior.
        closeDiagramFor(figure);
        preview.innerHTML = svg;
        preview.hidden = false;
        button.hidden = false;
        button.onclick = () => openDiagram(figure, button);
        status.textContent = 'Use Expand diagram for full-size labels and keyboard zoom/pan.';
      } catch {
        if (current !== revision) return;
        preview.hidden = true;
        button.hidden = true;
        status.textContent = 'Diagram rendering failed. The complete source remains available below.';
        figure.querySelector('details').open = true;
      }
    }
  }
  const unsubscribe = subscribe(() => {
    ++revision;
    clearTimeout(timer);
    timer = setTimeout(() => void render(), 100);
  });
  void render();
  return () => { ++revision; clearTimeout(timer); unsubscribe(); };
}
