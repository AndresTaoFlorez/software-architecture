/** Observe Starlight's resolved theme; never persist or duplicate its preference. */
export function observeTheme(root, changed) {
  const observer = new MutationObserver(changed);
  observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  return () => observer.disconnect();
}
export const resolvedTheme = root => root.dataset.theme === 'dark' ? 'dark' : 'light';
