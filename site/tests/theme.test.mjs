import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';
import ts from 'typescript';
const vendor = 'node_modules/@astrojs/starlight/dist/components/';
test('native provider owns persistence, Light/Dark/System and synchronized pickers', async () => {
  const provider = await readFile(vendor + 'ThemeProvider.astro', 'utf8');
  const select = await readFile(vendor + 'ThemeSelect.astro', 'utf8');
  const markup = '<starlight-theme-select><select aria-label="Color scheme"><option value="light">Light</option><option value="dark">Dark</option><option value="auto">System</option></select></starlight-theme-select>';
  const dom = new JSDOM(markup.repeat(2), { url: 'https://example.org', runScripts: 'outside-only' });
  let systemLight = true;
  let systemChanged;
  dom.window.matchMedia = () => ({ get matches() { return systemLight; }, addEventListener(event, fn) { assert.equal(event, 'change'); systemChanged = fn; } });
  dom.window.localStorage.setItem('starlight-theme', 'dark');
  dom.window.eval(provider.match(/<script is:inline>([\s\S]*?)<\/script>/)[1]);
  dom.window.eval(ts.transpile(select.match(/<script>([\s\S]*?)<\/script>/)[1], { target: ts.ScriptTarget.ES2022 }));
  const pickers = [...dom.window.document.querySelectorAll('select')];
  assert.equal(dom.window.document.documentElement.dataset.theme, 'dark');
  assert.ok(pickers.every(p => p.value === 'dark'));
  function choose(value) { pickers[1].value = value; pickers[1].dispatchEvent(new dom.window.Event('change')); }
  choose('light');
  assert.equal(dom.window.localStorage.getItem('starlight-theme'), 'light');
  assert.ok(pickers.every(p => p.value === 'light'));
  choose('auto');
  assert.equal(dom.window.localStorage.getItem('starlight-theme'), '');
  assert.equal(dom.window.document.documentElement.dataset.theme, 'light');
  systemLight = false;
  systemChanged();
  assert.equal(dom.window.document.documentElement.dataset.theme, 'dark');
  choose('light');
  systemChanged();
  assert.equal(dom.window.document.documentElement.dataset.theme, 'light');
  dom.window.close();
});

test('built header includes native desktop and mobile System controls', async () => {
  const dom = new JSDOM(await readFile('dist/index.html', 'utf8'));
  const pickers = [...dom.window.document.querySelectorAll('starlight-theme-select select')];
  assert.ok(pickers.length >= 2);
  assert.ok(dom.window.document.querySelector('.mobile-theme starlight-theme-select'));
  for (const picker of pickers) {
    assert.equal(picker.querySelector('option[value="auto"]').textContent.trim(), 'System');
    assert.ok(picker.querySelector('option[value="dark"]'));
    assert.ok(picker.querySelector('option[value="light"]'));
  }
  dom.window.close();
});
