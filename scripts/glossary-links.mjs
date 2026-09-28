#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const glossaryPath = path.join(root, 'GLOSSARY.md')
const registryPath = path.join(root, 'glossary', 'terms.json')
const mode = process.argv.includes('--write') ? 'write' : 'check'
const terms = JSON.parse(fs.readFileSync(registryPath, 'utf8'))

function walk(dir) {
  const out = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['.git', 'node_modules', 'dist', 'build'].includes(entry.name)) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walk(full))
    else if (entry.isFile() && entry.name.endsWith('.md')) out.push(full)
  }
  return out
}

function escapeRe(value) {
  return value.replace(/[.*+?^$()|[\]\\{}]/g, '\\$&')
}

const seenTerms = new Set()
const seenAnchors = new Set()
const seenAliases = new Map()

for (const term of terms) {
  if (seenTerms.has(term.term)) throw new Error('Duplicate glossary term: ' + term.term)
  if (seenAnchors.has(term.anchor)) throw new Error('Duplicate glossary anchor: ' + term.anchor)
  seenTerms.add(term.term)
  seenAnchors.add(term.anchor)

  for (const alias of term.aliases) {
    const key = alias.text.toLowerCase()
    const existing = seenAliases.get(key)
    if (existing && existing !== term.anchor) {
      throw new Error('Glossary alias "' + alias.text + '" maps to both ' + existing + ' and ' + term.anchor)
    }
    seenAliases.set(key, term.anchor)
  }
}

const aliases = terms
  .flatMap(term => term.aliases.map(alias => ({ ...alias, anchor: term.anchor })))
  .sort((a, b) => b.text.length - a.text.length)

const byLower = new Map()
for (const alias of aliases) {
  const key = alias.text.toLowerCase()
  const group = byLower.get(key) ?? []
  group.push(alias)
  byLower.set(key, group)
}

const aliasPattern = aliases.map(alias => escapeRe(alias.text)).join('|')
const aliasRe = new RegExp('(?<![A-Za-z0-9_])(' + aliasPattern + ')(?![A-Za-z0-9_])', 'gi')

function linkTarget(file, anchor) {
  let rel = path.relative(path.dirname(file), glossaryPath).replaceAll('\\', '/')
  if (!rel.startsWith('.')) rel = './' + rel
  return rel + '#' + anchor
}

function replaceAliases(segment, file) {
  if (!segment) return segment
  return segment.replace(aliasRe, matched => {
    const candidates = byLower.get(matched.toLowerCase()) ?? []
    const hit = candidates.find(alias => !alias.caseSensitive || alias.text === matched)
    if (!hit) return matched
    return '[' + matched + '](' + linkTarget(file, hit.anchor) + ')'
  })
}

function linkText(text, file) {
  const protectedRe = /(!?\[[^\]]*\]\([^)]*\)|!?\[[^\]]*\]\[[^\]]*\]|\[[^\]\n]+\]|\`[^\`]*\`|<[^>]+>|https?:\/\/[^\s)]+)/g
  const protectedParts = []
  let cursor = 0
  let result = ''
  let match

  while ((match = protectedRe.exec(text))) {
    result += replaceAliases(text.slice(cursor, match.index), file)
    const token = '__GLOSSARY_PROTECTED_' + protectedParts.length + '__'
    protectedParts.push(match[0])
    result += token
    cursor = match.index + match[0].length
  }

  result += replaceAliases(text.slice(cursor), file)

  protectedParts.forEach((value, index) => {
    result = result.replace('__GLOSSARY_PROTECTED_' + index + '__', value)
  })

  return result
}

function linkMarkdown(content, file) {
  const lines = content.split('\n')
  let inFence = false

  return lines.map(line => {
    if (/^\s*```/.test(line) || /^\s*~~~/.test(line)) {
      inFence = !inFence
      return line
    }
    if (inFence) return line
    if (/^#{1,6}\s/.test(line)) return line
    if (path.resolve(file) === path.resolve(glossaryPath)) return line
    return linkText(line, file)
  }).join('\n')
}

const changed = []
for (const file of walk(root)) {
  if (path.resolve(file) === path.resolve(glossaryPath)) continue
  const before = fs.readFileSync(file, 'utf8')
  const after = linkMarkdown(before, file)
  if (before !== after) {
    changed.push(path.relative(root, file).replaceAll('\\', '/'))
    if (mode === 'write') fs.writeFileSync(file, after)
  }
}

if (mode === 'write') {
  console.log('Glossary links updated in ' + changed.length + ' Markdown files.')
  process.exit(0)
}

if (changed.length) {
  console.error('Glossary links are missing or stale in:')
  changed.forEach(file => console.error(' - ' + file))
  console.error('\nRun: node scripts/glossary-links.mjs --write')
  process.exit(1)
}

const glossary = fs.readFileSync(glossaryPath, 'utf8')
for (const term of terms) {
  if (!glossary.includes('id="' + term.anchor + '"')) {
    console.error('Missing glossary anchor: ' + term.anchor)
    process.exit(1)
  }
}

console.log('Glossary links are up to date.')
