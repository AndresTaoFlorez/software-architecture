import { posix, relative, resolve, isAbsolute } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { readFile, readdir } from 'node:fs/promises';
import { existsSync, realpathSync, statSync } from 'node:fs';
import { isPage, route, routeMap } from '../../domain/handbook/pages.mjs';
export { isPage, route, routeMap } from '../../domain/handbook/pages.mjs';

export const root = fileURLToPath(new URL('../../../../', import.meta.url));
export const sourcePath = path => relative(root, path).split('\\').join('/');

export function resolveTarget(target, source, url) {
  const targetPath = resolve(root, target);
  if (!existsSync(targetPath)) throw new Error(`Missing link target: ${source} -> ${url}`);
  if (statSync(targetPath).isDirectory() && existsSync(resolve(targetPath, 'README.md'))) target = posix.join(target, 'README.md');
  const realTarget = relative(realpathSync(root), realpathSync(resolve(root, target)));
  if (isAbsolute(realTarget) || realTarget === '..' || realTarget.startsWith('..\\') || realTarget.startsWith('../')) throw new Error(`Link escapes repository: ${url}`);
  return target;
}
export async function pagePaths() {
  const files = ['README.md', 'GLOSSARY.md'];
  for (const directory of ['architecture', 'extras']) {
    for (const path of await readdir(resolve(root, directory), { recursive: true })) {
      const source = `${directory}/${path.split('\\').join('/')}`;
      if (isPage(source)) files.push(source);
    }
  }
  return files.sort();
}
/** @returns {import('astro/loaders').Loader} */
export function handbookLoader({ titleOf }) {
  return {
    name: 'canonical-handbook',
    async load({ store, parseData, renderMarkdown, generateDigest, watcher, logger }) {
      async function sync() {
        const paths = await pagePaths();
        routeMap(paths);
        const entries = [];
        for (const path of paths) {
          const filePath = resolve(root, path);
          const body = await readFile(filePath, 'utf8');
          const id = route(path) || 'index';
          const data = await parseData({ id, filePath, data: {
            title: titleOf(body),
            editUrl: 'https://github.com/AndresTaoFlorez/software-architecture/edit/main/' + path,
          } });
          const rendered = await renderMarkdown(body, { fileURL: pathToFileURL(filePath) });
          entries.push({ id, data, body, filePath: relative(resolve(root, 'site'), filePath), rendered, digest: generateDigest(body) });
        }
        // Commit a complete snapshot only after all entries validate and render.
        store.clear();
        for (const entry of entries) store.set(entry);
      }
      await sync();
      if (watcher) {
        watcher.add([resolve(root, 'README.md'), resolve(root, 'GLOSSARY.md'), resolve(root, 'architecture'), resolve(root, 'extras')]);
        let queue = Promise.resolve();
        const update = path => {
          if (!isPage(sourcePath(path))) return;
          queue = queue.then(sync).catch(error => logger.error(error.message));
        };
        watcher.on('add', update).on('change', update).on('unlink', update);
      }
    },
  };
}
