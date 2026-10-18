import test from 'node:test';
import assert from 'node:assert/strict';
import { importsOf, assertBoundary } from './sourceBoundaries.mjs';

for (const windows of [false, true]) {
  const path = value => windows ? ('C:' + value).replaceAll('/', '\\') : value;
  test(`negative boundary fixtures: ${windows ? 'Windows' : 'POSIX'}`, async () => {
    const src = path('/project/src');
    for (const statement of [
      "import { readFile } from 'node:fs/promises';",
      "import x from '../../infrastructure/x.mjs';",
      "export { x } from '../../infrastructure/x.mjs';",
      "export * from '../../infrastructure/x.mjs';",
      "const x = import('../../infrastructure/x.mjs');",
      "import x from '../theme/private.mjs';",
    ]) {
      for (const [extension, text] of [
        ['mjs', statement],
        ['astro', `---\n${statement}\n---\n<p>Content</p>`],
        ['astro', `<p>Content</p><script>${statement}</script>`],
      ]) {
        const file = path(`/project/src/presentation/reader/Fixture.${extension}`);
        const imports = await importsOf(file, text);
        assert.equal(imports.length, 1, text);
        assert.throws(() => assertBoundary(file, imports[0], src));
      }
    }
    assert.throws(() => assertBoundary(path('/project/src/domain/handbook/a.mjs'), 'node:fs', src));
    assert.throws(() => assertBoundary(path('/project/src/infrastructure/mermaid/createMermaidRenderer.mjs'), '../../presentation/diagrams/state/diagram.state.mjs', src));
    assert.doesNotThrow(() => assertBoundary(path('/project/src/presentation/reader/a.mjs'), '../theme/index.mjs', src));
    await assert.rejects(importsOf('Fixture.astro', '<script>import(destination)</script>'), /statically resolvable/);
    assert.deepEqual(await importsOf('Fixture.astro', `<p>import('ignored')</p><script type="application/json">{"import":"ignored"}</script>`), []);
    assert.deepEqual(await importsOf('Fixture.astro', '<script src="../theme/private.mjs"></script>'), ['../theme/private.mjs']);
  });
}
