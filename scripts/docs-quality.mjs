#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { anchors, glossaryErrors, headings, markdownFiles, parseMarkdown, sourceOf, visit } from './markdown.mjs'

export const progression = [
  /History/i, /problem/i, /strong.?fit|strong fit/i, /weak|too much/i,
  /mental model|fundamental model/i, /(?:circle|ring|role).*responsibilit|each circle owns|isolation/i,
  /physical structure/i, /Where does.*(?:code|function)/i, /Naming/i,
  /feature end to end/i, /Testing/i, /Trade-offs|failure modes/i, /learning path/i, /^Sources$/i,
]

export function progressionErrors(tree) {
  const hs = headings(tree).filter(h => h.depth === 2).map(h => h.text)
  let cursor = -1
  const errors = []
  for (const pattern of progression) {
    const index = hs.findIndex((heading, i) => i > cursor && pattern.test(heading))
    if (index < 0) errors.push('missing or out-of-order section: ' + pattern)
    else cursor = index
  }
  return errors
}

const boxDrawing = /[\u2500-\u257f]/u
const arrows = /\b[\w./]+\s*(?:-->|<--|->|<-|↓|↑)\s*[\w./]+/m
const mermaidType = /^(?:flowchart|graph|sequenceDiagram|classDiagram|stateDiagram(?:-v2)?|erDiagram|mindmap|timeline|gitGraph|quadrantChart|journey|pie|xychart(?:-beta)?|block(?:-beta)?|architecture-beta|sankey-beta|packet(?:-beta)?|kanban|requirementDiagram|C4Context|C4Container|C4Component|C4Dynamic|C4Deployment|gantt|zenuml)\b/

export function documentErrors(content, file, root, loadAnchors = target => anchors(parseMarkdown(fs.readFileSync(target, 'utf8'))).all) {
  const errors = []
  const tree = parseMarkdown(content)
  const definitions = new Map()
  const explicit = anchors(tree).explicit
  for (const id of new Set(explicit)) if (explicit.filter(value => value === id).length > 1) errors.push('duplicate explicit anchor: ' + id)
  visit(tree, node => { if (node.type === 'definition') definitions.set(node.identifier, node.url) })
  function checkLink(url, line) {
    if (!url?.trim()) { errors.push('empty link target near line ' + line); return }
    if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(url)) return
    let pathname, fragment
    try {
      const [beforeHash, ...hash] = url.split('#')
      pathname = decodeURIComponent(beforeHash.split('?')[0])
      fragment = decodeURIComponent(hash.join('#'))
    } catch { errors.push('invalid URL encoding: ' + url); return }
    let target = pathname ? path.resolve(pathname.startsWith('/') ? root : path.dirname(file), pathname.replace(/^\//, '')) : file
    if (!fs.existsSync(target)) { errors.push('broken relative link: ' + url); return }
    if (fs.statSync(target).isDirectory()) {
      const readme = path.join(target, 'README.md')
      if (fs.existsSync(readme)) target = readme
      else if (fragment) { errors.push('directory fragment has no README.md: ' + url); return }
    }
    if (fragment && target.toLowerCase().endsWith('.md') && !loadAnchors(target).has(fragment)) errors.push('broken Markdown anchor: ' + url)
  }
  visit(tree, (node, parents) => {
    const line = node.position.start.line
    if (['link', 'image', 'definition'].includes(node.type)) checkLink(node.url, line)
    if (['linkReference', 'imageReference'].includes(node.type)) checkLink(definitions.get(node.identifier), line)
    if (node.type === 'code') {
      const raw = sourceOf(content, node)
      const fence = raw.match(/^(`{3,}|~{3,})/)
      if (fence) {
        const last = raw.trimEnd().split(/\r?\n/).at(-1).replace(/^\s*(?:>\s*)*/, '')
        if (raw.split('\n').length < 2 || !new RegExp('^' + fence[1][0] + '{' + fence[1].length + ',}\\s*$').test(last)) errors.push('unclosed fenced code block near line ' + line)
      }
      if (boxDrawing.test(node.value)) errors.push('box-drawing diagram near line ' + line + '; use Mermaid')
      if ((!node.lang || ['text', 'plaintext'].includes(node.lang)) && (arrows.test(node.value) || /^\s*[|v]\s*$/m.test(node.value))) errors.push('text arrow diagram near line ' + line + '; use Mermaid')
      if (node.lang === 'mermaid') {
        const declaration = node.value.replace(/%%\{[\s\S]*?\}%%/g, '').split('\n').find(s => s.trim() && !s.trim().startsWith('%%'))?.trim() ?? ''
        if (!mermaidType.test(declaration)) errors.push('unknown or missing Mermaid declaration near line ' + line)
      }
    }
    if (node.type === 'paragraph') {
      let raw = sourceOf(content, node)
      visit(node, child => {
        if (child.type === 'inlineCode' || child.type === 'html') raw = raw.replace(sourceOf(content, child), '')
      })
      if (/\[\[[\s\S]*?\]\([^\n]*\)\]|\[[^\]\n]*\[[^\]\n]*\]\([^\n]*\)\]/.test(raw)) errors.push('malformed nested Markdown link near line ' + line)
    }
    if (node.type === 'text' && !parents.some(p => ['link', 'image', 'heading'].includes(p.type))) {
      if (boxDrawing.test(node.value)) errors.push('box-drawing diagram near line ' + line)
      if (arrows.test(node.value)) errors.push('prose arrow diagram near line ' + line + '; use Mermaid')
      for (const match of node.value.matchAll(/\[([^\]\n]+)\]\[([^\]\n]*)\]/g)) {
        const id = (match[2] || match[1]).trim().replace(/\s+/g, ' ').toLowerCase()
        if (!definitions.has(id)) errors.push('undefined reference link near line ' + line + ': ' + match[0])
      }
      if (/\[[^\]\n]+\]\([^\)\n]*$/.test(node.value)) errors.push('malformed Markdown link near line ' + line)
    }
  })
  return errors
}

export function checkDocs(root) {
  const errors = []
  const registry = path.join(root, 'glossary/terms.json')
  const glossary = path.join(root, 'GLOSSARY.md')
  if (!fs.existsSync(registry)) errors.push('missing glossary registry')
  else if (fs.existsSync(glossary)) {
    try {
      for (const error of glossaryErrors(JSON.parse(fs.readFileSync(registry, 'utf8')), fs.readFileSync(glossary, 'utf8'))) errors.push('glossary: ' + error)
    } catch (error) { errors.push('invalid glossary registry: ' + error.message) }
  }
  const cache = new Map()
  const loadAnchors = target => {
    if (!cache.has(target)) cache.set(target, anchors(parseMarkdown(fs.readFileSync(target, 'utf8'))).all)
    return cache.get(target)
  }
  for (const file of markdownFiles(root)) {
    const rel = path.relative(root, file).replaceAll('\\', '/')
    const content = fs.readFileSync(file, 'utf8')
    for (const error of documentErrors(content, file, root, loadAnchors)) errors.push(rel + ': ' + error)
    if (['clean-architecture', 'onion-architecture', 'model-view-controller', 'model-view-viewmodel'].some(dir => rel === dir + '/README.md')) {
      for (const error of progressionErrors(parseMarkdown(content))) errors.push(rel + ': ' + error)
      if (!/```mermaid\b/.test(content)) errors.push(rel + ': requires a Mermaid mental model')
    }
  }
  for (const required of ['CONTRIBUTING.md', 'AGENTS.md', 'GLOSSARY.md', 'foundations/code-placement.md', 'conventions/naming-and-file-placement.md', 'docs/architecture-guide-template.md', ...['clean-architecture', 'onion-architecture', 'model-view-controller', 'model-view-viewmodel'].map(dir => dir + '/README.md')]) {
    if (!fs.existsSync(path.join(root, required))) errors.push('missing required document: ' + required)
  }
  return errors
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const errors = checkDocs(process.cwd())
  if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1 }
  else console.log('Documentation links, anchors, fences, diagram declarations and guide progression passed. Mermaid syntax and meaning require a separate review.')
}
