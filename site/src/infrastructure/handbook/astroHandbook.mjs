import { posix, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { readFile, readdir } from 'node:fs/promises';
import { existsSync, realpathSync, statSync } from 'node:fs';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { toString } from 'mdast-util-to-string';
import { visit } from 'unist-util-visit';
import GithubSlugger from 'github-slugger';

export const root = fileURLToPath(new URL('../../../../', import.meta.url));
export const base = '/software-architecture/';
const github = 'https://github.com/AndresTaoFlorez/software-architecture/blob/main/';
import { isPage, route, routeMap } from '../../domain/handbook/pages.mjs';
export { isPage, route, routeMap } from '../../domain/handbook/pages.mjs';
export function titleOf(source) {
  const tree = unified().use(remarkParse).parse(source);
  const heading = tree.children.find(node => node.type === 'heading' && node.depth === 1);
  if (!heading || !toString(heading).trim()) throw new Error('A nonempty H1 title is required');
  return toString(heading);
}
export function rewriteLink(url, source) {
  if (/^(?:[a-z][a-z0-9+.-]*:|\/\/|#|\/)/i.test(url)) return url;
  const match = url.match(/^([^?#]*)(\?[^#]*)?(#.*)?$/);
  const [, pathname, query = '', fragment = ''] = match;
  let target = pathname ? posix.normalize(posix.join(posix.dirname(source), decodeURIComponent(pathname))) : source;
  if (target === '..' || target.startsWith('../') || posix.isAbsolute(target)) throw new Error(`Link escapes repository: ${url}`);
  const targetPath = resolve(root, target);
  if (!existsSync(targetPath)) throw new Error(`Missing link target: ${source} -> ${url}`);
  if (statSync(targetPath).isDirectory() && existsSync(resolve(targetPath, 'README.md'))) {
    target = posix.join(target, 'README.md');
  }
  const realTarget = relative(realpathSync(root), realpathSync(resolve(root, target)));
  if (realTarget === '..' || realTarget.startsWith('..\\') || realTarget.startsWith('../')) throw new Error(`Link escapes repository: ${url}`);
  if (isPage(target)) return `${base}${route(target)}${route(target) ? '/' : ''}${query}${fragment}`;
  return github + target.split('/').map(encodeURIComponent).join('/') + query + fragment;
}
export function handbookMarkdown() {
  return (tree, file) => {
    const source = relative(root, file.path).split('\\').join('/');
    if (!isPage(source)) return;
    // Allocate IDs before removing H1: repeated headings must retain source slugs.
    const slugger = new GithubSlugger();
    const headingIds = new Set();
    visit(tree, 'heading', node => {
      const id = slugger.slug(toString(node));
      node.data ??= {};
      node.data.hProperties = { ...node.data.hProperties, id };
      headingIds.add(id);
    });
    // GitHub permits redundant explicit anchors; HTML requires unique IDs.
    // Keep the heading target and remove only an identical, empty alias.
    visit(tree, 'html', node => {
      node.value = node.value.replace(/<a id="([^"]+)">/g, (anchor, id) => headingIds.has(id) ? '<a>' : anchor);
    });
    let removed = false;
    // Preserve links to the source title while Starlight supplies the visible H1.
    tree.children = tree.children.map(node => {
      if (!removed && node.type === 'heading' && node.depth === 1) {
        removed = true;
        return { type: 'html', value: `<a id="${node.data.hProperties.id}"></a>` };
      }
      return node;
    });
    visit(tree, node => {
      if (node.type === 'link' || node.type === 'definition' || node.type === 'image') {
        node.url = rewriteLink(node.url, source);
      }
    });
  };
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
export function handbookLoader() {
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
          if (!isPage(relative(root, path).split('\\').join('/'))) return;
          queue = queue.then(sync).catch(error => logger.error(error.message));
        };
        watcher.on('add', update).on('change', update).on('unlink', update);
      }
    },
  };
}
