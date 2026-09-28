import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { test } from 'node:test'
import ts from 'typescript'
import { ArchitectureLayer } from '../src/domain/entities/ArchitectureLayer.ts'

const allowed = {
  domain: ['domain'], application: ['application', 'domain'],
  infrastructure: ['infrastructure', 'application', 'domain'],
  presentation: ['presentation', 'application'],
  composition: ['composition', 'infrastructure', 'presentation', 'application', 'domain'],
}
test('dependency policy uses ownership, not visual depth', () => {
  const layer = id => new ArchitectureLayer({ id, depth: 0, name: id, tagline: '', role: '', analogy: '', rule: '', livesHere: [], code: '' })
  for (const from of Object.keys(allowed).filter(id => id !== 'composition')) {
    for (const to of Object.keys(allowed).filter(id => id !== 'composition')) {
      assert.equal(layer(from).canDependOn(layer(to)), allowed[from].includes(to), `${from} depends on ${to}`)
    }
  }
})

test('demo source dependencies follow the documented matrix', () => {
  const root = path.resolve('src')
  const files = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name)
    return entry.isDirectory() ? files(full) : /\.(ts|vue)$/.test(full) ? [full] : []
  })
  const owner = file => {
    const relative = path.relative(root, file).replaceAll('\\', '/')
    return relative === 'main.ts' ? 'composition' : ['App.vue', 'style.css'].includes(relative) ? 'presentation' : relative.split('/')[0]
  }
  for (const file of files(root)) {
    let content = fs.readFileSync(file, 'utf8')
    if (file.endsWith('.vue')) content = content.match(/<script[^>]*>([\s\S]*?)<\/script>/)?.[1] ?? ''
    const source = ts.createSourceFile(file, content, ts.ScriptTarget.Latest, true)
    function visit(node) {
      let specifier
      if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) specifier = node.moduleSpecifier
      if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) specifier = node.arguments[0]
      if (specifier && ts.isStringLiteral(specifier)) {
        if (specifier.text.startsWith('.')) {
          const target = path.resolve(path.dirname(file), specifier.text)
          assert.ok(allowed[owner(file)]?.includes(owner(target)), `${file} imports ${specifier.text}`)
        } else if (['domain', 'application'].includes(owner(file))) {
          assert.fail(`${file} imports external package ${specifier.text}`)
        }
      }
      ts.forEachChild(node, visit)
    }
    visit(source)
  }
})
