const excluded = new Set([
  'architecture/conventions/architecture-guide-template.md',
  'architecture/conventions/editorial-review.md',
]);
export function isPage(path) {
  return /^(README\.md|GLOSSARY\.md|(?:architecture|extras)\/.+\.md)$/.test(path) && !excluded.has(path);
}
export function route(path) {
  if (!isPage(path)) throw new Error(`Not a reader page: ${path}`);
  return path.replace(/(^|\/)README\.md$/, '$1').replace(/\.md$/, '').toLowerCase().replace(/\/$/, '');
}
export function routeMap(paths) {
  const seen = new Map();
  for (const path of paths) {
    const id = route(path);
    if (seen.has(id)) throw new Error(`Route collision: ${seen.get(id)} and ${path}`);
    seen.set(id, path);
  }
  return seen;
}
