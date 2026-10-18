import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, access } from 'node:fs/promises';
import { resolve, relative, dirname } from 'node:path';
import { importsOf, assertBoundary } from './sourceBoundaries.mjs';
import { JSDOM } from 'jsdom';
import { mountDiagrams } from '../src/presentation/diagrams/index.mjs';
import { createMermaidRenderer } from '../src/infrastructure/mermaid/createMermaidRenderer.mjs';
import { move } from '../src/presentation/diagrams/state/diagram.state.mjs';
const src = resolve('src');
async function sources(dir) {
  const result = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = resolve(dir, entry.name);
    if (entry.isDirectory()) result.push(...await sources(path));
    else if (/\.(mjs|ts|astro)$/.test(path)) result.push(path);
  }
  return result;
}
test('source boundaries include reexports and dynamic imports', async () => {
  for (const path of await sources(src)) {
    const owner = relative(src, path).split(/[\\/]/);
    const text = await readFile(path, 'utf8');
    for (const specifier of await importsOf(path, text)) {
      if (specifier.startsWith('.')) await access(resolve(dirname(path), specifier));
      assertBoundary(path, specifier, src);
    }
    if (owner.includes('state')) assert.doesNotMatch(text, /\b(document|window|localStorage|sessionStorage)\b/);
  }
});
test('visual transitions are immutable and unknown actions preserve values', () => {
  const initial = Object.freeze({ scale: 1, x: 0, y: 0 });
  assert.deepEqual(move(initial, 'right'), { scale: 1, x: 40, y: 0 });
  assert.deepEqual(move(initial, 'unknown'), initial);
  assert.deepEqual(initial, { scale: 1, x: 0, y: 0 });
});
test('Mermaid adapter serializes initialization and recovers after renderer failure', async () => {
  const calls = [];
  const renderer = createMermaidRenderer(async () => ({ default: {
    initialize(options) { calls.push(options.theme); assert.equal(options.securityLevel, 'strict'); },
    async render(id, source) { if (source === 'bad') throw Error('invalid'); return { svg: id }; },
  } }));
  const first = renderer.render('bad', 'first', 'dark');
  const second = renderer.render('valid', 'second', 'light');
  await assert.rejects(first);
  assert.equal(await second, 'second');
  assert.deepEqual(calls, ['dark', 'default']);
});
test('injected renderer rejects stale theme results and preserves source on failure', async () => {
  const dom = new JSDOM('<figure class="reader-diagram"><figcaption>Owner</figcaption><div class="diagram-preview" hidden></div><button hidden>Expand</button><p class="diagram-status"></p><details><code>flowchart LR; A--&gt;B</code></details></figure>');
  const figure = dom.window.document.querySelector('figure');
  let changed;
  let finish;
  let dark = false;
  let unsubscribed = false;
  let count = 0;
  const cleanup = mountDiagrams([figure], {
    theme: () => dark ? 'dark' : 'light',
    subscribe(fn) { changed = fn; return () => { unsubscribed = true; }; },
    renderer: { render(source, id, theme) {
      assert.match(id, /^mermaid-/);
      assert.match(source, /flowchart/);
      if (++count === 1) return new Promise(resolve => { finish = resolve; });
      assert.equal(theme, 'dark');
      return Promise.reject(Error('unavailable'));
    } },
  });
  dark = true;
  changed();
  finish('<svg id="stale"></svg>');
  await new Promise(resolve => setTimeout(resolve, 150));
  assert.equal(figure.querySelector('svg'), null);
  assert.equal(figure.querySelector('button').hidden, true);
  assert.equal(figure.querySelector('details').open, true);
  assert.match(figure.querySelector('.diagram-status').textContent, /failed/);
  cleanup();
  assert.ok(unsubscribed);
  dom.window.close();
});

test('a later diagram finishing does not close another figure modal', { timeout: 10000 }, async () => {
  const markup = n => `<figure><figcaption>Diagram ${n}</figcaption><div class="diagram-preview"></div><button hidden>Expand</button><p class="diagram-status"></p><details><code>flowchart LR; A--&gt;B</code></details></figure>`;
  const dom = new JSDOM(markup(1) + markup(2));
  const previousDocument = globalThis.document;
  globalThis.document = dom.window.document;
  dom.window.HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  dom.window.HTMLDialogElement.prototype.close = function () { this.open = false; this.dispatchEvent(new dom.window.Event('close')); };
  const figures = [...document.querySelectorAll('figure')];
  let releaseSecond, secondStarted, changed, calls = 0;
  const started = new Promise(resolve => { secondStarted = resolve; });
  const cleanup = mountDiagrams(figures, {
    theme: () => 'light',
    subscribe(fn) { changed = fn; return () => {}; },
    renderer: { render(_source, id) {
      if (++calls === 2) return new Promise(resolve => { releaseSecond = resolve; secondStarted(); });
      return Promise.resolve(`<svg id="${id}"></svg>`);
    } },
  });
  try {
    await started;
    figures[0].querySelector('button').click();
    const dialog = document.querySelector('.diagram-dialog');
    assert.ok(dialog.open);
    releaseSecond('<svg id="second"></svg>');
    await Promise.resolve();
    assert.ok(dialog.open, 'Another figure must not own this modal');
    const closed = new Promise(resolve => dialog.addEventListener('close', resolve, { once: true }));
    changed();
    await closed;
    assert.equal(document.activeElement, figures[0].querySelector('button'));
  } finally {
    cleanup();
    dom.window.close();
    globalThis.document = previousDocument;
  }
});
