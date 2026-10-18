import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { open, unlink } from 'node:fs/promises';
import { createServer } from 'node:net';
import { fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';
import { base } from '../src/handbook.mjs';

const site = fileURLToPath(new URL('../', import.meta.url));
const token = randomUUID();
const name = `watcher-probe-${token}`;
const source = new URL(`../../architecture/${name}.md`, import.meta.url);
const requestedPort = Number(process.env.WATCHER_PORT ?? 0);
assert.ok(Number.isInteger(requestedPort) && requestedPort >= 0 && requestedPort <= 65535, 'Invalid WATCHER_PORT');

// Reserve an OS-selected port, or fail explicitly if the requested port is occupied.
const reservation = createServer();
await new Promise((resolve, reject) => {
  reservation.once('error', error => reject(new Error(`Watcher port unavailable: ${error.message}`)));
  reservation.listen(requestedPort, '127.0.0.1', resolve);
});
const port = reservation.address().port;
await new Promise((resolve, reject) => reservation.close(error => error ? reject(error) : resolve()));
const origin = `http://127.0.0.1:${port}`;
const url = `${origin}${base}architecture/${name}/`;
const server = spawn(process.execPath, [fileURLToPath(new URL('../node_modules/astro/bin/astro.mjs', import.meta.url)), 'dev', '--host', '127.0.0.1', '--port', String(port), '--ignore-lock'], {
  cwd: site, stdio: ['ignore', 'pipe', 'pipe'],
});
let logs = '';
let spawnError;
let closed = false;
server.on('error', error => { spawnError = error; });
for (const stream of [server.stdout, server.stderr]) stream.on('data', chunk => {
  logs = (logs + chunk.toString().replace(/\x1b\[[0-9;]*m/g, '')).slice(-64000);
});
const exited = new Promise(resolve => server.once('close', () => { closed = true; resolve(); }));
function assertAlive() {
  if (spawnError) throw spawnError;
  assert.ok(!closed && server.exitCode === null && server.signalCode === null, `Owned Astro process exited: ${logs}`);
  // Astro can choose another port after the reservation is released. Never poll a different owner's server.
  assert.doesNotMatch(logs, /port .*in use|trying (?:another|the next)/i, `Astro could not own port ${port}: ${logs}`);
}
async function until(label, condition, timeout = 45000) {
  const deadline = Date.now() + timeout;
  let last = 'condition not met';
  while (Date.now() < deadline) {
    assertAlive();
    try { if (await condition()) { assertAlive(); return; } }
    catch (error) { last = error.message; }
    await delay(150);
  }
  throw new Error(`${label} timed out: ${last}\n${logs}`);
}
async function expectPage(label, status, present, absent) {
  await until(label, async () => {
    const response = await fetch(url, { redirect: 'error', cache: 'no-store', signal: AbortSignal.timeout(3000) });
    const html = await response.text();
    return response.status === status && (!present || html.includes(present)) && (!absent || !html.includes(absent));
  });
  console.log(`Watcher HTTP: ${label} (${status})`);
}
let ownsFile = false;
try {
  // A successful HTTP response alone cannot prove ownership: require the child's exact listen announcement first.
  await until('Owned Astro startup', () => logs.includes(`http://127.0.0.1:${port}/`));
  await expectPage('absent before creation', 404);
  const file = await open(source, 'wx');
  ownsFile = true;
  try { await file.writeFile(`# Watcher probe\n\nInitial-${token}\n`); } finally { await file.close(); }
  await expectPage('filesystem add reaches reader', 200, `Initial-${token}`);
  const changed = await open(source, 'r+');
  try {
    await changed.truncate(0);
    await changed.writeFile(`# Watcher probe\n\nUpdated-${token}\n`);
  } finally { await changed.close(); }
  await expectPage('filesystem change replaces content', 200, `Updated-${token}`, `Initial-${token}`);
  await unlink(source);
  ownsFile = false;
  await expectPage('filesystem unlink removes reader', 404, undefined, `Updated-${token}`);
  console.log('Real Astro filesystem watcher passed: add, change, unlink. Browser HMR not tested.');
} finally {
  try {
    // Delete only the unique file exclusively created by this invocation.
    if (ownsFile) await unlink(source).catch(error => { if (error.code !== 'ENOENT') throw error; });
  } finally {
    if (!closed) {
      server.kill('SIGTERM');
      const force = setTimeout(() => server.kill('SIGKILL'), 5000);
      try { await exited; } finally { clearTimeout(force); }
    }
  }
}
