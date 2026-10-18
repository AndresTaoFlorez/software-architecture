import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { visit } from 'unist-util-visit';
import { JSDOM } from 'jsdom';
import { diagramMarkdown } from '../src/diagrams/markdown.mjs';
import { move, keyActions, openDiagram } from '../src/diagrams/controls.mjs';
import { pagePaths, root } from '../src/handbook.mjs';

test('diagram transformation escapes source and excludes only raw code from search', () => {
  const tree = unified().use(remarkParse).parse('# Owner\n\n```mermaid\nflowchart LR\n A["<script>&"] --> B\n```');
  diagramMarkdown()(tree);
  const html = tree.children[1].value;
  assert.ok(html.includes('Owner — diagram 1'));
  assert.ok(html.includes('<pre data-pagefind-ignore>'));
  assert.ok(html.includes('&lt;script&gt;&amp;'));
  assert.ok(html.includes('hidden>Expand diagram'));
});

test('all canonical Mermaid fences parse using the installed renderer', async () => {
  const dom = new JSDOM('');
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  const { default: mermaid } = await import('mermaid');
  mermaid.initialize({ startOnLoad: false, securityLevel: 'strict' });
  let count = 0;
  for (const path of await pagePaths()) {
    const tree = unified().use(remarkParse).parse(await readFile(`${root}/${path}`, 'utf8'));
    const sources = [];
    visit(tree, 'code', node => { if (node.lang === 'mermaid') sources.push(node.value); });
    for (const source of sources) {
      await assert.doesNotReject(() => mermaid.parse(source), path);
      count++;
    }
  }
  assert.ok(count > 0);
  console.log(`Parsed ${count} canonical Mermaid diagrams`);
  dom.window.close();
});

test('keyboard controls, bounded zoom, modal close and focus restore', () => {
  const dom = new JSDOM('<figure><figcaption>Ownership</figcaption><svg></svg><button>Expand</button></figure>');
  globalThis.document = dom.window.document;
  const figure = document.querySelector('figure');
  const trigger = document.querySelector('button');
  dom.window.HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  dom.window.HTMLDialogElement.prototype.close = function () { this.dispatchEvent(new dom.window.Event('close')); };
  openDiagram(figure, trigger);
  const viewport = document.querySelector('.diagram-viewport');
  assert.equal(document.activeElement, viewport);
  viewport.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
  assert.ok(document.querySelector('.diagram-canvas').style.transform.includes('40px'));
  document.querySelector('.diagram-toolbar button:last-child').click();
  assert.equal(document.querySelector('dialog'), null);
  assert.equal(document.activeElement, trigger);
  assert.equal(move({ scale: 4, x: 0, y: 0 }, 'in').scale, 4);
  assert.equal(move({ scale: .25, x: 0, y: 0 }, 'out').scale, .25);
  assert.deepEqual(move({}, 'reset'), { scale: 1, x: 0, y: 0 });
  assert.equal(keyActions['0'], 'reset');
  dom.window.close();
});