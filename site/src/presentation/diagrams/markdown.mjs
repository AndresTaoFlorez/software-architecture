import { visit } from 'unist-util-visit';
import { toString } from 'mdast-util-to-string';

const escape = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

// Markdown AST identifies fences; Mermaid owns the grammar inside each fence.
export function diagramMarkdown() {
  return tree => {
    let heading = 'Architecture';
    let count = 0;
    visit(tree, node => {
      if (node.type === 'heading') heading = toString(node);
      if (node.type !== 'code' || node.lang !== 'mermaid') return;
      const name = `${heading} — diagram ${++count}`;
      const id = `reader-diagram-${count}`;
      node.type = 'html';
      node.value = `<figure class="reader-diagram" aria-labelledby="${id}">
<figcaption id="${id}">${escape(name)}</figcaption>
<div class="diagram-preview" role="img" aria-label="${escape(name)}" hidden></div>
<button type="button" class="diagram-expand" hidden>Expand diagram</button>
<p class="diagram-status" role="status">Diagram source available below. Rendering requires JavaScript.</p>
<details class="diagram-source"><summary>Diagram source (Mermaid)</summary><pre data-pagefind-ignore><code>${escape(node.value)}</code></pre></details>
</figure>`;
      delete node.lang;
      delete node.meta;
    });
  };
}