import { selectedHash } from './selection.mjs';

/** One owner synchronizes both renderings; navigation and scrolling stay native. */
export function mountTableOfContents(document, window) {
  const roots = [...document.querySelectorAll('[data-reader-toc]')];
  const links = roots.flatMap(root => [...root.querySelectorAll('a')]);
  const hashes = [...new Set(links.map(link => link.hash))];
  const details = document.querySelector('[data-reader-toc] details');
  const summary = details?.querySelector('summary');
  const label = details?.querySelector('[data-current-heading]');
  const render = hash => {
    const selected = selectedHash(hash, hashes);
    for (const link of links) {
      if (selected !== null && link.hash === selected) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    }
    if (label) label.textContent = links.find(link => link.hash === selected)?.textContent ?? '';
  };
  const sync = () => render(window.location.hash);
  const click = event => {
    const anchor = event.target.closest?.('a[href]');
    if (anchor && !event.defaultPrevented && event.button === 0 && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey && !anchor.hasAttribute('download') && (!anchor.target || anchor.target === '_self')) {
      const target = new URL(anchor.href, window.location.href);
      if (target.origin === window.location.origin && target.pathname === window.location.pathname && target.search === window.location.search) {
        render(target.hash);
      }
    }
    if (details && (anchor && details.contains(anchor) || !details.contains(event.target))) details.open = false;
  };
  const keydown = event => {
    if (event.key !== 'Escape' || !details?.open) return;
    const restoreFocus = details.contains(document.activeElement);
    details.open = false;
    if (restoreFocus) summary?.focus();
  };
  document.addEventListener('click', click);
  window.addEventListener('keydown', keydown);
  window.addEventListener('hashchange', sync);
  window.addEventListener('popstate', sync);
  sync();
  return () => {
    document.removeEventListener('click', click);
    window.removeEventListener('keydown', keydown);
    window.removeEventListener('hashchange', sync);
    window.removeEventListener('popstate', sync);
  };
}
