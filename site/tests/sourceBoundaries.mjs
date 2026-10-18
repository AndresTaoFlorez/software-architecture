import ts from 'typescript';
import { parse } from '@astrojs/compiler-rs';
import { posix } from 'node:path';
import assert from 'node:assert/strict';
const normalize = path => path.replaceAll('\\', '/');

export async function importsOf(path, text) {
  const chunks = [];
  if (path.endsWith('.astro')) {
    const { ast, diagnostics } = parse(text);
    assert.ok(!diagnostics.some(d => d.severity === 1), `${path}: invalid Astro syntax`);
    const imports = [];
    function extract(node) {
      if (!node || typeof node !== 'object') return;
      if (['ImportDeclaration', 'ExportNamedDeclaration', 'ExportAllDeclaration'].includes(node.type) && node.source) imports.push(node.source.value);
      if (node.type === 'ImportExpression') {
        assert.equal(node.source.type, 'Literal', 'Dynamic import must be statically resolvable');
        assert.equal(typeof node.source.value, 'string');
        imports.push(node.source.value);
      }
      if (node.type === 'JSXOpeningElement' && node.name.name === 'script') {
        for (const attr of node.attributes) if (attr.name?.name === 'src') {
          assert.equal(attr.value?.type, 'Literal', 'Script src must be statically resolvable');
          imports.push(attr.value.value);
        }
      }
      for (const [key, value] of Object.entries(node)) {
        if (key === 'comments') continue;
        if (Array.isArray(value)) value.forEach(extract);
        else if (value && typeof value === 'object') extract(value);
      }
    }
    extract(ast);
    return imports;
  } else chunks.push(text);
  const imports = [];
  for (const chunk of chunks) {
    const ast = ts.createSourceFile(path + '.ts', chunk, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    assert.equal(ast.parseDiagnostics.length, 0, `${path}: invalid script syntax`);
    function walk(node) {
      if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier) imports.push(node.moduleSpecifier.text);
      if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
        assert.ok(ts.isStringLiteral(node.arguments[0]), 'Dynamic import must be statically resolvable');
        imports.push(node.arguments[0].text);
      }
      ts.forEachChild(node, walk);
    }
    walk(ast);
  }
  return imports;
}
export function assertBoundary(path, specifier, src) {
  path = normalize(path); src = normalize(src); specifier = normalize(specifier);
  const owner = posix.relative(src, path).split('/');
  const target = specifier.startsWith('.') ? posix.relative(src, posix.resolve(posix.dirname(path), specifier)).split('/') : [];
  if (owner[0] === 'domain') assert.equal(target[0], 'domain', `${path}: external dependency ${specifier}`);
  if (owner[0] === 'presentation') {
    assert.ok(!['infrastructure', 'composition'].includes(target[0]), `${path}: outward coupling ${specifier}`);
    assert.notEqual(specifier, 'mermaid');
    assert.ok(!/^node:(fs|child_process)(\/|$)/.test(specifier), `${path}: presentation must receive I/O collaborators`);
    if (target[0] === 'presentation' && target[1] !== owner[1]) {
      assert.ok(target.at(-1) === 'index.mjs' || (target[1] === 'theme' && target.at(-1) === 'ThemeSelect.astro'), `Private capability import: ${specifier}`);
    }
  }
  if (owner.includes('state')) assert.fail('State must not import effects');
  if (path.endsWith('/infrastructure/mermaid/createMermaidRenderer.mjs')) assert.ok(!target.includes('state'), 'Renderer must not import UI state');
}
