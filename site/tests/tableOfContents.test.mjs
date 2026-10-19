import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';
import { mountTableOfContents } from '../src/presentation/table-of-contents/index.mjs';
import { selectedHash } from '../src/presentation/table-of-contents/selection.mjs';

function fixture(hash = '') {
  const links = '<a href="#_top">Overview</a><a href="#shape">Illustrative response shape</a><a href="#review-questions"><span>Review questions</span></a>';
  const dom = new JSDOM(`<nav data-reader-toc>${links}</nav><nav data-reader-toc><details><summary>On this page <span data-current-heading></span></summary>${links}</details></nav><main><h1 id="_top">Title</h1><h2 id="shape">Shape</h2><p>Short</p><h2 id="review-questions">Review questions</h2><p>Final short section</p><a id="permalink" href="#shape">Permalink</a><a id="other" href="/other/#shape">Other page</a></main>`, { url: `https://example.test/guide/${hash}` });
  const { window } = dom;
  const { document } = window;
  const cleanup = mountTableOfContents(document, window);
  const active = () => [...document.querySelectorAll('[aria-current="true"]')].map(a => a.hash);
  const click = (node, options = {}) => node.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true, button: 0, ...options }));
  // Suppress jsdom's asynchronous navigation only AFTER the real handler runs.
  document.addEventListener('click', event => event.preventDefault());
  return { dom, window, document, cleanup, active, click };
}

test('clicked final short section stays selected across scrolling and resizing, both TOCs', () => {
  const f = fixture();
  assert.deepEqual(f.active(), ['#_top', '#_top']);
  const last = f.document.querySelector('a[href="#review-questions"]');
  f.click(last.querySelector('span'));
  assert.deepEqual(f.active(), ['#review-questions', '#review-questions']);
  assert.equal(f.document.querySelector('[data-current-heading]').textContent, 'Review questions');
  for (const event of ['scroll', 'resize', 'scroll']) f.window.dispatchEvent(new f.window.Event(event));
  assert.deepEqual(f.active(), ['#review-questions', '#review-questions']);
  assert.equal(last.getAttribute('href'), '#review-questions');
  f.cleanup(); f.dom.window.close();
});

test('initial fragment, article permalink, hashchange and browser history restore selection', () => {
  const f = fixture('#review-questions');
  assert.deepEqual(f.active(), ['#review-questions', '#review-questions']);
  f.click(f.document.querySelector('#permalink'));
  assert.deepEqual(f.active(), ['#shape', '#shape']);
  for (const [hash, event, expected] of [['#review-questions', 'hashchange', '#review-questions'], ['#shape', 'popstate', '#shape'], ['', 'popstate', '#_top']]) {
    f.window.history.replaceState(null, '', `/guide/${hash}`);
    f.window.dispatchEvent(new f.window.Event(event));
    assert.deepEqual(f.active(), [expected, expected]);
  }
  f.window.history.replaceState(null, '', '#unknown');
  f.window.dispatchEvent(new f.window.Event('hashchange'));
  assert.deepEqual(f.active(), []);
  assert.equal(f.document.querySelector('[data-current-heading]').textContent, '');
  f.cleanup(); f.dom.window.close();
});

test('modified, prevented and other-page clicks do not change current selection', () => {
  const f = fixture();
  const last = f.document.querySelector('a[href="#review-questions"]');
  for (const options of [{ ctrlKey: true }, { metaKey: true }, { shiftKey: true }, { altKey: true }, { button: 1 }]) f.click(last, options);
  f.click(f.document.querySelector('#other'));
  last.addEventListener('click', event => event.preventDefault(), { once: true });
  f.click(last);
  last.target = '_blank'; f.click(last); last.target = '';
  last.setAttribute('download', ''); f.click(last);
  assert.deepEqual(f.active(), ['#_top', '#_top']);
  f.cleanup(); f.dom.window.close();
});

test('mobile click, outside click and Escape dismiss; cleanup detaches all selection listeners', () => {
  const f = fixture();
  const details = f.document.querySelector('details');
  const link = details.querySelector('a[href="#review-questions"]');
  details.open = true;
  link.focus();
  f.window.dispatchEvent(new f.window.KeyboardEvent('keydown', { key: 'Escape' }));
  assert.equal(details.open, false);
  assert.equal(f.document.activeElement, details.querySelector('summary'));
  details.open = true; f.click(link);
  assert.equal(details.open, false);
  details.open = true; f.click(f.document.querySelector('h1'));
  assert.equal(details.open, false);
  f.cleanup();
  details.open = true;
  f.window.dispatchEvent(new f.window.KeyboardEvent('keydown', { key: 'Escape' }));
  f.window.history.replaceState(null, '', '#shape');
  f.window.dispatchEvent(new f.window.Event('hashchange'));
  f.window.dispatchEvent(new f.window.Event('popstate'));
  f.click(f.document.querySelector('a[href="#shape"]'));
  assert.deepEqual(f.active(), ['#review-questions', '#review-questions']);
  assert.equal(details.open, true);
  f.dom.window.close();
});

test('built layered prompt renders both overrides and restores real Back/Forward history', async () => {
  const html = await readFile(new URL('../dist/architecture/prompts/layered/index.html', import.meta.url), 'utf8');
  const dom = new JSDOM(html, { url: 'https://example.test/software-architecture/architecture/prompts/layered/#review-questions' });
  const { document } = dom.window;
  assert.equal(document.querySelectorAll('[data-reader-toc]').length, 2);
  assert.equal(document.querySelectorAll('starlight-toc, mobile-starlight-toc').length, 0);
  const cleanup = mountTableOfContents(document, dom.window);
  const active = () => [...document.querySelectorAll('[data-reader-toc] a[aria-current="true"]')].map(a => a.hash);
  assert.deepEqual(active(), ['#review-questions', '#review-questions']);
  const desktop = document.querySelector('[data-reader-toc]');
  const next = [...desktop.querySelectorAll('a')].find(a => a.hash !== '#review-questions' && a.hash !== '#_top');
  dom.window.location.hash = next.hash;
  await new Promise(resolve => dom.window.addEventListener('hashchange', resolve, { once: true }));
  assert.deepEqual(active(), [next.hash, next.hash]);
  const back = new Promise(resolve => dom.window.addEventListener('popstate', resolve, { once: true }));
  dom.window.history.back(); await back;
  assert.deepEqual(active(), ['#review-questions', '#review-questions']);
  const forward = new Promise(resolve => dom.window.addEventListener('popstate', resolve, { once: true }));
  dom.window.history.forward(); await forward;
  assert.deepEqual(active(), [next.hash, next.hash]);
  cleanup(); dom.window.close();
});

test('fragment policy decodes Unicode and rejects unknown or malformed fragments', () => {
  assert.equal(selectedHash('#caf%C3%A9', ['#café']), '#café');
  assert.equal(selectedHash('#unknown', ['#_top']), null);
  assert.equal(selectedHash('#%ZZ', ['#_top']), null);
});
