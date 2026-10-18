import { mountDiagrams } from '../presentation/diagrams/index.mjs';
import { observeTheme, resolvedTheme } from '../presentation/theme/index.mjs';
import { createMermaidRenderer } from '../infrastructure/mermaid/createMermaidRenderer.mjs';
export function startReader(document) {
  const figures = [...document.querySelectorAll('.reader-diagram')];
  if (!figures.length) return () => {};
  const root = document.documentElement;
  return mountDiagrams(figures, {
    renderer: createMermaidRenderer(),
    theme: () => resolvedTheme(root),
    subscribe: changed => observeTheme(root, changed),
  });
}
