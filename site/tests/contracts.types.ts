import { createMermaidRenderer } from '../src/infrastructure/mermaid/createMermaidRenderer.mjs';
import { mountDiagrams } from '../src/presentation/diagrams/index.mjs';
import { move } from '../src/presentation/diagrams/state/diagram.state.mjs';
import type { DiagramRenderer, DiagramView } from '../src/presentation/diagrams/contracts';
const renderer: DiagramRenderer = createMermaidRenderer();
const view: DiagramView = move({ scale: 1, x: 0, y: 0 }, 'right');
mountDiagrams([], { renderer, theme: () => 'dark', subscribe: () => () => {} });
// These must fail, otherwise tsc reports an unused @ts-expect-error.
// @ts-expect-error A renderer must return asynchronously produced SVG text.
const invalid: DiagramRenderer = { render: () => 12 };
// @ts-expect-error UI state requires numeric scale.
move({ scale: 'large', x: 0, y: 0 }, 'in');
// @ts-expect-error The consumer must enforce the renderer contract too.
mountDiagrams([], { renderer: invalid, theme: () => 'auto', subscribe: () => () => {} });
// @ts-expect-error The mount consumer rejects a synchronous non-SVG renderer.
mountDiagrams([], { renderer: { render: () => 12 }, theme: () => 'light', subscribe: () => () => {} });
void view;
