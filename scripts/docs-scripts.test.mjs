import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { linkMarkdown, checkGlossary } from './glossary-links.mjs'
import { documentErrors, progressionErrors } from './docs-quality.mjs'
import { anchors, glossaryErrors, parseMarkdown } from './markdown.mjs'

const terms = [
  { term: 'MVVM', anchor: 'mvvm', aliases: [{ text: 'MVVM', caseSensitive: true }] },
  { term: 'Repository Pattern', anchor: 'repository', aliases: [{ text: 'Repository Pattern', caseSensitive: false }] },
]
const glossary = '# Glossary\n\n## Index\n\n- [MVVM](#mvvm)\n- [Repository Pattern](#repository)\n\n' + terms.map(t => '<a id="' + t.anchor + '"></a>\n\n## ' + t.term + '\n\nDefinition.\n\n**Purpose.** Explain the boundary.\n\n**Example.** Small example.\n\n**Sources.** https://example.com\n\n').join('')

test('linker preserves Markdown constructs and exact source formatting', () => {
  const protectedText = [
    '# MVVM', 'MVVM\n====', '[MVVM]', '[**MVVM**]',
    '[MVVM](https://example.com/a(b) "MVVM")', '![MVVM](image.png)',
    '[MVVM][ref]', '[ref]: https://example.com/MVVM "MVVM"',
    '`MVVM`', '``MVVM `code` ``',
    '````text\nMVVM\n```\nMVVM\n````', '~~~text\nMVVM\n```\nMVVM\n~~~',
    'https://example.com/MVVM', '<span>MVVM</span>', '<!-- MVVM -->',
    '<div>\nMVVM\n</div>', '\\[MVVM\\]',
  ].join('\n\n') + '\n'
  const file = path.resolve('guide.md')
  const target = path.resolve('GLOSSARY.md')
  assert.equal(linkMarkdown(protectedText, file, terms, target), protectedText)
  const input = protectedText + '\nMVVM and **MVVM**.\r\n'
  const output = linkMarkdown(input, file, terms, target)
  assert.ok(output.endsWith('[MVVM](./GLOSSARY.md#mvvm) and **[MVVM](./GLOSSARY.md#mvvm)**.\r\n'))
  assert.equal(linkMarkdown(output, file, terms, target), output)
  assert.equal(linkMarkdown(input, target, terms, target), input)
})

test('ambiguous source-repository wording stays unlinked', () => {
  const file = path.resolve('guide.md')
  const target = path.resolve('GLOSSARY.md')
  const input = 'This repository and Git Repository contain a Repository Pattern example.'
  const output = linkMarkdown(input, file, terms, target)
  assert.equal(output, 'This repository and Git Repository contain a [Repository Pattern](./GLOSSARY.md#repository) example.')
})

test('headings exclude code and GitHub slug collisions remain correct', () => {
  const tree = parseMarkdown('# Hello, *World*!\n\n# Hello, World!\n\n# Hello, World!-1\n\n```md\n# Ghost\n<a id="ghost"></a>\n```\n\n<a class="old" id="legacy"></a>\n')
  const ids = anchors(tree).all
  assert.ok(ids.has('hello-world') && ids.has('hello-world-1') && ids.has('hello-world-1-1') && ids.has('legacy'))
  assert.ok(!ids.has('ghost'))
})

test('quality check resolves real links and references, ignoring literal code', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'docs-audit-'))
  t.after(() => {
    assert.ok(path.dirname(path.resolve(root)) === path.resolve(os.tmpdir()) && path.basename(root).startsWith('docs-audit-'))
    fs.rmSync(root, { recursive: true })
  })
  fs.mkdirSync(path.join(root, 'chapter'))
  fs.writeFileSync(path.join(root, 'chapter', 'README.md'), '# A *real* heading\n\n<a id="old"></a>\n\n```md\n# Ghost\n```\n')
  fs.writeFileSync(path.join(root, 'with space.md'), '# Target\n')
  const file = path.join(root, 'guide.md')
  const check = text => documentErrors(text, file, root)
  assert.deepEqual(check('[chapter](chapter#a-real-heading)\n\n[old][ref]\n\n[ref]: chapter#old "Title"\n\n[space](<with space.md#target>)\n\n`[bad](missing.md)`\n\n```md\n[bad](missing.md)\n```\n'), [])
  for (const invalid of ['[x](chapter#ghost)', '[x][missing]', '[x](missing.md)', '[x]()', '[[MVVM](chapter)]', '[x](chapter', '<a id="same"></a>\n\n<a id="same"></a>']) {
    assert.ok(check(invalid).length, invalid)
  }
  assert.ok(check('[x][ref]\n\n[ref]: missing.md').some(e => e.includes('broken relative link')))
})

test('fence matching handles tilde, long and nested examples', () => {
  const file = path.resolve('guide.md')
  const root = process.cwd()
  const check = text => documentErrors(text, file, root)
  for (const valid of ['````md\n```ts\nconst x = 1\n```\n````', '~~~ts\nconst x = 1\n~~~', '```mermaid\n%% a comment\nflowchart LR\n A --> B\n```']) assert.deepEqual(check(valid), [])
  for (const invalid of ['~~~ts\nconst x = 1', '````ts\ncode\n```', '```mermaid\nunknownDiagram\n```', '```text\nA -> B\n```', '```text\n┌──┐\n```']) assert.ok(check(invalid).length, invalid)
})

test('guide progression rejects reversed sections and headings hidden in code', () => {
  const hs = ['History', 'problem', 'strong fit', 'weak fit', 'mental model', 'roles and responsibilities', 'physical structure', 'Where does code go', 'Naming', 'feature end to end', 'Testing', 'Trade-offs', 'learning path', 'Sources']
  const guide = list => list.map(h => '## ' + h + '\n\nExplanation.\n').join('\n')
  assert.deepEqual(progressionErrors(parseMarkdown(guide(hs))), [])
  const wrong = [...hs]
  ;[wrong[0], wrong[9]] = [wrong[9], wrong[0]]
  assert.ok(progressionErrors(parseMarkdown(guide(wrong))).length)
  assert.ok(progressionErrors(parseMarkdown('```md\n' + guide(hs) + '```')).length)
})

test('registry rejects duplicates, missing fields, stale index and conflicting aliases', () => {
  assert.deepEqual(glossaryErrors(terms, glossary), [])
  assert.ok(glossaryErrors([...terms, terms[0]], glossary).length)
  assert.ok(glossaryErrors(terms, glossary.replace('id="mvvm"', 'id="missing"')).length)
  assert.ok(glossaryErrors(terms, glossary.replace('**Purpose.**', '**Missing.**')).length)
  assert.ok(glossaryErrors(terms, glossary.replace('Definition.\n\n', '')).some(e => e.includes('missing definition')))
  assert.ok(glossaryErrors(terms, glossary.replace('**Example.** Small example.', '**Example.**')).some(e => e.includes('missing Example')))
  assert.ok(glossaryErrors(terms, glossary.replace('- [MVVM](#mvvm)\n', '')).length)
  const conflict = structuredClone(terms)
  conflict[1].aliases.push({ text: 'mvvm', caseSensitive: false })
  assert.ok(glossaryErrors(conflict, glossary).some(e => e.includes('incompatible alias')))
  const duplicateAlias = structuredClone(terms)
  duplicateAlias[0].aliases.push({ ...duplicateAlias[0].aliases[0] })
  assert.ok(glossaryErrors(duplicateAlias, glossary).some(e => e.includes('duplicate alias')))
})

test('--write refuses a bad registry before modifying any document', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'docs-audit-'))
  t.after(() => {
    assert.equal(path.dirname(path.resolve(root)), path.resolve(os.tmpdir()))
    assert.ok(path.basename(root).startsWith('docs-audit-'))
    fs.rmSync(root, { recursive: true })
  })
  fs.mkdirSync(path.join(root, 'glossary'))
  fs.writeFileSync(path.join(root, 'glossary', 'terms.json'), JSON.stringify([...terms, terms[0]]))
  fs.writeFileSync(path.join(root, 'GLOSSARY.md'), glossary)
  fs.writeFileSync(path.join(root, 'guide.md'), 'MVVM\n')
  assert.ok(checkGlossary(root, true).errors.length)
  assert.equal(fs.readFileSync(path.join(root, 'guide.md'), 'utf8'), 'MVVM\n')
})
