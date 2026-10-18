import test from 'node:test';
import assert from 'node:assert/strict';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { root, route, routeMap, pagePaths, titleOf, rewriteLink, handbookMarkdown } from '../src/handbook.mjs';

test('stable routes and collision rejection', () => {
  assert.equal(route('README.md'), '');
  assert.equal(route('GLOSSARY.md'), 'glossary');
  assert.equal(route('architecture/README.md'), 'architecture');
  assert.throws(() => routeMap(['architecture/README.md', 'architecture.md']));
  assert.throws(() => routeMap(['architecture/a.md', 'architecture/A.md']), /collision/);
  assert.throws(() => route('AGENTS.md'), /reader page/);
});
test('real H1, not code fences, supplies title; missing title fails', () => {
  assert.equal(titleOf('```md\n# False\n```\n# A **real** title'), 'A real title');
  assert.throws(() => titleOf('## No title'), /H1/);
});
test('links retain base and fragments, maintainers use GitHub', () => {
  assert.equal(rewriteLink('../../GLOSSARY.md#domain', 'architecture/backend/README.md'), '/software-architecture/glossary/#domain');
  assert.equal(rewriteLink('../README.md#old-anchor', 'architecture/backend/README.md'), '/software-architecture/architecture/#old-anchor');
  assert.match(rewriteLink('CONTRIBUTING.md', 'README.md'), /^https:\/\/github.com\//);
  assert.equal(rewriteLink('#legacy', 'README.md'), '#legacy');
  assert.equal(rewriteLink('https://example.com/a.md', 'README.md'), 'https://example.com/a.md');
  assert.throws(() => rewriteLink('../outside.md', 'README.md'), /escapes/);
});
test('one visible H1 removed, title anchor and explicit legacy anchor preserved', () => {
  const processor = unified().use(remarkParse).use(handbookMarkdown);
  const tree = processor.runSync(processor.parse('# Title\n\n<a id="legacy"></a>\n\n## Section\n\n[Term](GLOSSARY.md#domain)'), { path: `${root}/README.md` });
  assert.equal(tree.children.filter(n => n.type === 'heading' && n.depth === 1).length, 0);
  assert.equal(tree.children[0].value, '<a id="title"></a>');
  assert.ok(JSON.stringify(tree).includes('id=\\"legacy\\"'));
  assert.ok(JSON.stringify(tree).includes('/software-architecture/glossary/#domain'));
});
test('canonical corpus has unique routes and no maintainer pages', async () => {
  const paths = await pagePaths();
  assert.ok(paths.length > 80);
  assert.equal(routeMap(paths).size, paths.length);
  assert.ok(!paths.includes('architecture/conventions/editorial-review.md'));
});
test('watch registers canonical paths and serializes change events', async () => {
  const { EventEmitter } = await import('node:events');
  const { handbookLoader } = await import('../src/handbook.mjs');
  const watcher = new EventEmitter();
  let watched;
  watcher.add = paths => { watched = paths; };
  let snapshots = 0;
  const errors = [];
  await handbookLoader().load({
    store: { clear() { snapshots++; }, set() {} },
    parseData: async ({ data }) => data,
    renderMarkdown: async () => ({ html: '', metadata: {} }),
    generateDigest: body => String(body.length), watcher,
    logger: { error: message => errors.push(message) },
  });
  const { resolve } = await import('node:path');
  assert.ok(watched.includes(resolve(root, 'README.md')));
  for (const event of ['add', 'change', 'unlink']) watcher.emit(event, `${root}/README.md`);
  for (let tries = 0; snapshots < 4 && tries < 200; tries++) await new Promise(resolve => setTimeout(resolve, 10));
  assert.equal(snapshots, 4);
  assert.deepEqual(errors, []);
});
