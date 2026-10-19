import { mountTableOfContents } from '../presentation/table-of-contents/index.mjs';

let cleanup;
function mount() {
  cleanup?.();
  cleanup = mountTableOfContents(document, window);
}
mount();
document.addEventListener('astro:page-load', mount);
document.addEventListener('astro:before-swap', () => { cleanup?.(); cleanup = undefined; });
