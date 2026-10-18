import { createHandbookMarkdown, titleOf } from '../presentation/content/index.mjs';
import { sourcePath, resolveTarget, handbookLoader as createLoader } from '../infrastructure/handbook/astroHandbook.mjs';
export { root, pagePaths, isPage, route, routeMap } from '../infrastructure/handbook/astroHandbook.mjs';
export { titleOf };
export const base = '/software-architecture/';
export const { rewriteLink, handbookMarkdown } = createHandbookMarkdown({
  sourcePath, resolveTarget, base,
  github: 'https://github.com/AndresTaoFlorez/software-architecture/blob/main/',
});
export const handbookLoader = () => createLoader({ titleOf });
