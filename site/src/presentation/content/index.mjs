import { posix } from 'node:path';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { toString } from 'mdast-util-to-string';
import { visit } from 'unist-util-visit';
import GithubSlugger from 'github-slugger';
import { isPage, route } from '../../domain/handbook/pages.mjs';

export function titleOf(source) {
  const tree = unified().use(remarkParse).parse(source);
  const heading = tree.children.find(node => node.type === 'heading' && node.depth === 1);
  if (!heading || !toString(heading).trim()) throw new Error('A nonempty H1 title is required');
  return toString(heading);
}

// Composition supplies file identity and an existence/containment resolver.
export function createHandbookMarkdown({ sourcePath, resolveTarget, base, github }) {
  function rewriteLink(url, source) {
    if (/^(?:[a-z][a-z0-9+.-]*:|\/\/|#|\/)/i.test(url)) return url;
    const [, pathname, query = '', fragment = ''] = url.match(/^([^?#]*)(\?[^#]*)?(#.*)?$/);
    const candidate = pathname ? posix.normalize(posix.join(posix.dirname(source), decodeURIComponent(pathname))) : source;
    if (candidate === '..' || candidate.startsWith('../') || posix.isAbsolute(candidate)) throw new Error(`Link escapes repository: ${url}`);
    const target = resolveTarget(candidate, source, url);
    if (isPage(target)) return `${base}${route(target)}${route(target) ? '/' : ''}${query}${fragment}`;
    return github + target.split('/').map(encodeURIComponent).join('/') + query + fragment;
  }
  function handbookMarkdown() {
    return (tree, file) => {
      const source = sourcePath(file.path);
      if (!isPage(source)) return;
      // Allocate IDs before removing H1: repeated headings retain source slugs.
      const slugger = new GithubSlugger();
      const headingIds = new Set();
      visit(tree, 'heading', node => {
        const id = slugger.slug(toString(node));
        node.data ??= {};
        node.data.hProperties = { ...node.data.hProperties, id };
        headingIds.add(id);
      });
      visit(tree, 'html', node => {
        node.value = node.value.replace(/<a id="([^"]+)">/g, (anchor, id) => headingIds.has(id) ? '<a>' : anchor);
      });
      let removed = false;
      tree.children = tree.children.map(node => {
        if (!removed && node.type === 'heading' && node.depth === 1) {
          removed = true;
          return { type: 'html', value: `<a id="${node.data.hProperties.id}"></a>` };
        }
        return node;
      });
      visit(tree, node => {
        if (node.type === 'link' || node.type === 'definition' || node.type === 'image') node.url = rewriteLink(node.url, source);
      });
    };
  }
  return { rewriteLink, handbookMarkdown };
}
