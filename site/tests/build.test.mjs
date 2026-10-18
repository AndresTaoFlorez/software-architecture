import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { parse } from 'parse5';
import { pagePaths, route, base, rewriteLink } from '../src/handbook.mjs';

const dist = new URL('../dist/', import.meta.url);
function elements(node) {
  return [node, ...(node.childNodes ?? []).flatMap(elements)];
}
test('built reader routes, no duplicated title, unique IDs, local links and fragments', async () => {
  const pages = new Map();
  for (const source of await pagePaths()) {
    const path = route(source);
    const html = await readFile(new URL(`${path ? path + '/' : ''}index.html`, dist), 'utf8');
    const nodes = elements(parse(html));
    assert.equal(nodes.filter(n => n.tagName === 'h1').length, 1, `${source}: one visible H1`);
    const ids = nodes.flatMap(n => (n.attrs ?? []).filter(a => a.name === 'id').map(a => a.value));
    assert.equal(new Set(ids).size, ids.length, `${source}: unique HTML IDs`);
    const links = nodes.flatMap(n => (n.attrs ?? []).filter(a => a.name === 'href').map(a => a.value));
    pages.set(`${base}${path}${path ? '/' : ''}`, { links, ids: new Set(ids) });
  }
  let checked = 0;
  const failures = [];
  for (const [path, { links }] of pages) {
    for (const raw of links) {
      const url = new URL(raw, `https://andrestaoflorez.github.io${path}`);
      const repositoryPrefix = '/AndresTaoFlorez/software-architecture/blob/';
      if (url.origin === 'https://github.com' && url.pathname.startsWith(repositoryPrefix)) {
        assert.ok(url.pathname.startsWith(`${repositoryPrefix}main/`), `${path}: stable fallback branch`);
        const target = url.pathname.slice(`${repositoryPrefix}main/`.length);
        assert.doesNotThrow(() => rewriteLink(target, 'README.md'), `${path}: existing fallback ${raw}`);
        checked++;
        continue;
      }
      if (url.origin !== 'https://andrestaoflorez.github.io' || !url.pathname.startsWith(base)) continue;
      if (/\.(css|js|svg|png|ico|xml)$/.test(url.pathname)) continue;
      const target = pages.get(url.pathname);
      if (!target) failures.push(`${path} -> ${url.pathname}`);
      else if (url.hash && !target.ids.has(decodeURIComponent(url.hash.slice(1)))) failures.push(`${path} -> ${url.pathname}${url.hash}`);
      checked++;
    }
  }
  assert.deepEqual(failures, []);
  console.log(`Verified ${pages.size} reader pages and ${checked} local links/fragments`);
});
