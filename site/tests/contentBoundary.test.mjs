import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, symlink, rm, readFile } from 'node:fs/promises';
import { relative, resolve } from 'node:path';
import { createHandbookMarkdown } from '../src/presentation/content/index.mjs';
import { resolveTarget, root } from '../src/infrastructure/handbook/astroHandbook.mjs';
import { JSDOM } from 'jsdom';

test('presentation transforms targets through the supplied resolver', () => {
  const calls = [];
  const { rewriteLink } = createHandbookMarkdown({
    sourcePath: path => path, base: '/reader/', github: 'https://example.test/',
    resolveTarget(candidate, source, url) { calls.push([candidate, source, url]); return 'GLOSSARY.md'; },
  });
  assert.equal(rewriteLink('../GLOSSARY.md?view=all#domain', 'architecture/README.md'), '/reader/glossary/?view=all#domain');
  assert.deepEqual(calls, [['GLOSSARY.md', 'architecture/README.md', '../GLOSSARY.md?view=all#domain']]);
  assert.throws(() => rewriteLink('../../escape.md', 'README.md'), /escapes/);
  assert.equal(calls.length, 1);
});

test('filesystem resolver rejects symlink escape', async () => {
  const directory = await mkdtemp(resolve(root, 'site/.containment-'));
  try {
    await symlink(resolve(root, '..'), resolve(directory, 'outside'), process.platform === 'win32' ? 'junction' : 'dir');
    const target = relative(root, resolve(directory, 'outside')).replaceAll('\\', '/');
    assert.throws(() => resolveTarget(target, 'README.md', target), /escapes repository/);
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test('site dependency and delivery diagrams parse', async () => {
  const dom = new JSDOM('');
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  try {
    const { default: mermaid } = await import('mermaid');
    mermaid.initialize({ startOnLoad: false, securityLevel: 'strict' });
    const text = await readFile(new URL('../ARCHITECTURE.md', import.meta.url), 'utf8');
    const diagrams = [...text.matchAll(/```mermaid\n([\s\S]*?)```/g)];
    assert.equal(diagrams.length, 2);
    for (const [, source] of diagrams) await mermaid.parse(source);
  } finally { dom.window.close(); }
});
