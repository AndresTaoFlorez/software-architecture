import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';

test('installed viewport TOC reproduces final short-section selection defect', async () => {
  const dom = new JSDOM('<header></header><starlight-toc><a href="#_top">Overview</a><a href="#shape">Illustrative response shape</a><a href="#review-questions">Review questions</a></starlight-toc><main><h1 id="_top">Title</h1><div class="sl-markdown-content"><h2 id="shape">Illustrative response shape</h2><p>Short section</p><h2 id="review-questions">Review questions</h2><p>Final short section</p></div></main>', { url: 'https://example.test/guide/#review-questions', runScripts: 'outside-only' });
  let intersect;
  dom.window.requestIdleCallback = callback => callback();
  dom.window.IntersectionObserver = class {
    constructor(callback) { intersect = callback; }
    observe() {}
    disconnect() {}
  };
  const source = await readFile(new URL('../node_modules/@astrojs/starlight/dist/components-internals/TableOfContents/starlight-toc.js', import.meta.url), 'utf8');
  dom.window.eval(source.replace(/^import .*;$/m, 'const PAGE_TITLE_ID = "_top";').replace(/^export .*;$/m, ''));
  const selected = dom.window.document.querySelector('a[href="#review-questions"]');
  dom.window.document.querySelector('starlight-toc').current = selected;
  intersect([{ isIntersecting: true, target: dom.window.document.querySelector('#shape') }]);
  assert.equal(dom.window.location.hash, '#review-questions');
  assert.equal(dom.window.document.querySelector('a[href="#shape"]').getAttribute('aria-current'), 'true');
  assert.notEqual(dom.window.document.querySelector('a[aria-current="true"]').hash, dom.window.location.hash);
  dom.window.close();
});
