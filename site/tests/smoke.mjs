import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { parse } from 'parse5';
import { base } from '../src/handbook.mjs';

const origin = 'http://127.0.0.1:4322';
const server = spawn(process.execPath, ['node_modules/astro/bin/astro.mjs', 'preview', '--host', '127.0.0.1', '--port', '4322', '--ignore-lock'], { stdio: 'pipe' });
let logs = '';
server.stdout.on('data', chunk => { logs += chunk; });
server.stderr.on('data', chunk => { logs += chunk; });
const exited = new Promise(resolve => server.once('exit', resolve));
function elements(node) {
  return [node, ...(node.childNodes ?? []).flatMap(elements)];
}
async function get(path) {
  const response = await fetch(`${origin}${path}`, { signal: AbortSignal.timeout(5000), redirect: 'error' });
  assert.equal(response.status, 200, path);
  return response;
}
try {
  let ready = false;
  for (let attempt = 0; attempt < 60; attempt++) {
    assert.equal(server.exitCode, null, `Preview exited: ${logs}`);
    try { await get(base); ready = true; break; } catch { await delay(250); }
  }
  assert.ok(ready, `Preview did not start: ${logs}`);
  const paths = [base, `${base}glossary/`, `${base}architecture/frontend/presentation-architecture/`, `${base}architecture/backend/4-create-ticket-with-nestjs/`, `${base}architecture/styles/hexagonal-architecture/`, `${base}architecture/api-design/exercises/solutions/`];
  const assets = new Set([`${base}pagefind/pagefind.js`]);
  for (const path of paths) {
    const response = await get(path);
    assert.match(response.headers.get('content-type'), /text\/html/);
    const nodes = elements(parse(await response.text()));
    assert.equal(nodes.filter(node => node.tagName === 'h1').length, 1, path);
    for (const node of nodes) {
      for (const attr of node.attrs ?? []) {
        if (!['href', 'src'].includes(attr.name)) continue;
        const url = new URL(attr.value, `${origin}${path}`);
        if (url.origin !== origin || !url.pathname.includes('/_astro/')) continue;
        assert.ok(url.pathname.startsWith(base), `Asset escaped production base: ${url.pathname}`);
        assets.add(url.pathname);
      }
    }
  }
  assert.ok(assets.size > 1, 'Expected generated CSS or JavaScript');
  for (const path of assets) {
    const response = await get(path);
    assert.doesNotMatch(response.headers.get('content-type') ?? '', /text\/html/, path);
    assert.ok((await response.arrayBuffer()).byteLength > 0, path);
  }
  console.log(`HTTP smoke passed: ${paths.length} representative pages and ${assets.size} assets under ${base}`);
} finally {
  server.kill('SIGTERM');
  await exited;
}
