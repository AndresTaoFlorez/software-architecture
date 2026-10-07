import fs from 'node:fs'
import path from 'node:path'
import { fromMarkdown } from 'mdast-util-from-markdown'
import GithubSlugger from 'github-slugger'

export function markdownFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    if (['.git', '.codex-remote-attachments', 'node_modules', 'dist', 'build'].includes(entry.name)) return []
    const full = path.join(dir, entry.name)
    return entry.isDirectory() ? markdownFiles(full) : entry.isFile() && entry.name.endsWith('.md') ? [full] : []
  })
}

export function visit(node, fn, parents = []) {
  fn(node, parents)
  for (const child of node.children ?? []) visit(child, fn, [...parents, node])
}

export const parseMarkdown = fromMarkdown
export const nodeText = node => node.value ?? (node.children ?? []).map(nodeText).join('')
export const sourceOf = (content, node) => content.slice(node.position.start.offset, node.position.end.offset)

export function headings(tree) {
  const result = []
  visit(tree, node => {
    if (node.type === 'heading') result.push({ text: nodeText(node).replace(/<[^>]*>/g, '').replace(/~/g, ''), depth: node.depth, node })
  })
  return result
}

export function anchors(tree) {
  const generated = new GithubSlugger()
  const result = new Set(headings(tree).map(heading => generated.slug(heading.text)))
  const explicit = []
  visit(tree, node => {
    if (node.type !== 'html') return
    for (const match of node.value.matchAll(/<a\b[^>]*\b(?:id|name)\s*=\s*["']([^"']+)["'][^>]*>/gi)) {
      explicit.push(match[1])
      result.add(match[1])
    }
  })
  return { all: result, explicit }
}

export function glossaryErrors(terms, content) {
  const errors = []
  if (!Array.isArray(terms) || !terms.length) return ['registry must be a non-empty array']
  const tree = parseMarkdown(content)
  const { explicit } = anchors(tree)
  const entries = headings(tree).filter(h => h.depth === 2 && h.text !== 'Index')
  const names = new Set()
  const ids = new Set()
  const aliases = []
  for (const term of terms) {
    if (!term.term?.trim() || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(term.anchor ?? '') || !Array.isArray(term.aliases) || !term.aliases.length) {
      errors.push('invalid registry entry: ' + JSON.stringify(term))
      continue
    }
    const name = term.term.toLowerCase()
    if (names.has(name)) errors.push('duplicate glossary term: ' + term.term)
    if (ids.has(term.anchor)) errors.push('duplicate glossary anchor: ' + term.anchor)
    names.add(name)
    ids.add(term.anchor)
    if (explicit.filter(id => id === term.anchor).length !== 1) errors.push('missing or duplicate explicit glossary anchor: ' + term.anchor)
    const entry = entries.find(h => h.text === term.term)
    if (!entry) errors.push('missing glossary entry heading: ' + term.term)
    else {
      const next = entries.find(h => h.node.position.start.offset > entry.node.position.start.offset)
      const body = content.slice(entry.node.position.end.offset, next?.node.position.start.offset ?? content.length)
      const definition = body.split('**Purpose.**')[0].replace(/---|<a\b[^>]*>.*?<\/a>/g, '').trim()
      if (!definition) errors.push(term.term + ': missing definition')
      for (const field of ['Purpose', 'Example', 'Sources']) {
        const value = body.split('**' + field + '.**')[1]?.split(/\*\*(?:Purpose|Example|Sources)\.\*\*|\n---|\n<a\b/)[0].trim()
        if (!value) errors.push(term.term + ': missing ' + field)
      }
    }
    const aliasKeys = new Set()
    for (const alias of term.aliases) {
      if (typeof alias.text !== 'string' || !alias.text.trim() || typeof alias.caseSensitive !== 'boolean') {
        errors.push('invalid alias for ' + term.term)
        continue
      }
      const key = alias.caseSensitive ? '+' + alias.text : '-' + alias.text.toLowerCase()
      if (aliasKeys.has(key)) errors.push('duplicate alias for ' + term.term + ': ' + alias.text)
      aliasKeys.add(key)
      for (const other of aliases) {
        const overlap = alias.caseSensitive && other.caseSensitive
          ? alias.text === other.text
          : alias.text.toLowerCase() === other.text.toLowerCase()
        if (overlap && term.anchor !== other.anchor) errors.push('incompatible alias: ' + alias.text)
      }
      aliases.push({ ...alias, anchor: term.anchor })
    }
  }
  for (const entry of entries) if (!names.has(entry.text.toLowerCase())) errors.push('unregistered glossary entry: ' + entry.text)
  for (const id of explicit) if (!ids.has(id)) errors.push('unregistered glossary anchor: ' + id)
  // The index is part of the registry contract too.
  const index = tree.children.find(n => n.type === 'list')
  const indexed = []
  if (index) visit(index, n => { if (n.type === 'link') indexed.push(n.url.slice(1)) })
  if (indexed.length !== terms.length || terms.some(t => !indexed.includes(t.anchor))) errors.push('glossary index is stale or contains duplicate entries')
  return errors
}
