#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { glossaryErrors, markdownFiles, parseMarkdown, visit } from './markdown.mjs'

export function linkMarkdown(content, file, terms, glossaryPath) {
  if (path.resolve(file) === path.resolve(glossaryPath)) return content
  const tree = parseMarkdown(content)
  const protectedRanges = []
  const protectedTypes = new Set(['heading', 'link', 'linkReference', 'image', 'imageReference', 'definition', 'inlineCode', 'code', 'html'])
  visit(tree, node => {
    if (protectedTypes.has(node.type)) protectedRanges.push([node.position.start.offset, node.position.end.offset])
  })
  // Bracketed citations and bare URLs are text in CommonMark. Inline HTML lines
  // are protected conservatively, including formatting inside their contents.
  for (const match of content.matchAll(/\\?\[[^\]]*\]|\b(?:https?|ftp):\/\/[^\s<>]+|\bmailto:[^\s<>]+|^.*<\/?[A-Za-z!][^>]*>.*$/gm)) {
    protectedRanges.push([match.index, match.index + match[0].length])
  }
  const aliases = terms.flatMap(term => term.aliases.map(alias => ({ ...alias, anchor: term.anchor })))
    .sort((a, b) => b.text.length - a.text.length)
  const escape = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const pattern = new RegExp('(?<![\\p{L}\\p{N}_])(?:' + aliases.map(alias => escape(alias.text)).join('|') + ')(?![\\p{L}\\p{N}_])', 'giu')
  let target = path.relative(path.dirname(file), glossaryPath).replaceAll('\\', '/')
  if (!target.startsWith('.')) target = './' + target
  const edits = []
  visit(tree, (node, parents) => {
    if (node.type !== 'text' || parents.some(parent => protectedTypes.has(parent.type))) return
    const start = node.position.start.offset
    const raw = content.slice(start, node.position.end.offset)
    for (const match of raw.matchAll(pattern)) {
      const offset = start + match.index
      if (protectedRanges.some(([a, b]) => offset < b && offset + match[0].length > a)) continue
      const hit = aliases.find(alias => alias.caseSensitive ? alias.text === match[0] : alias.text.toLowerCase() === match[0].toLowerCase())
      if (hit) edits.push({ start: offset, end: offset + match[0].length, value: '[' + match[0] + '](' + target + '#' + hit.anchor + ')' })
    }
  })
  // Edit source offsets instead of serializing the tree: formatting stays intact.
  for (const edit of edits.reverse()) content = content.slice(0, edit.start) + edit.value + content.slice(edit.end)
  return content
}

export function checkGlossary(root, write = false) {
  const glossaryPath = path.join(root, 'GLOSSARY.md')
  const terms = JSON.parse(fs.readFileSync(path.join(root, 'glossary', 'terms.json'), 'utf8'))
  const errors = glossaryErrors(terms, fs.readFileSync(glossaryPath, 'utf8'))
  if (errors.length) return { errors, changed: [] }
  const changed = []
  for (const file of markdownFiles(root)) {
    const before = fs.readFileSync(file, 'utf8')
    const after = linkMarkdown(before, file, terms, glossaryPath)
    if (before === after) continue
    changed.push(path.relative(root, file).replaceAll('\\', '/'))
    if (write) fs.writeFileSync(file, after)
  }
  if (!write && changed.length) errors.push('missing glossary links in: ' + changed.join(', '))
  return { errors, changed }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const write = process.argv.includes('--write')
  const { errors, changed } = checkGlossary(process.cwd(), write)
  if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1 }
  else console.log(write ? 'Glossary links updated in ' + changed.length + ' Markdown files.' : 'Glossary registry and links are up to date.')
}
