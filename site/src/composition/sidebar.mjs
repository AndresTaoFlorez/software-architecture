import { route } from '../domain/handbook/pages.mjs';

export function sidebarItems(directory, paths) {
  const prefix = `${directory}/`;
  const descendants = paths.filter(path => path.startsWith(prefix));
  const directories = new Set(descendants
    .map(path => path.slice(prefix.length).split('/'))
    .filter(parts => parts.length > 1)
    .map(parts => parts[0]));
  return [
    ...descendants.filter(path => !path.slice(prefix.length).includes('/'))
      .map(path => ({ slug: route(path) })),
    ...[...directories].map(name => ({
      label: name,
      items: sidebarItems(`${directory}/${name}`, paths),
    })),
  ];
}
