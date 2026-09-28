#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const errors = []

function fail(file, message) {
  errors.push(file + ': ' + message)
}

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

function relative(file) {
  return path.relative(root, file).replaceAll('\\', '/')
}

function headings(content) {
  return content.split('\n')
    .filter(line => /^#{1,6}\s+/.test(line))
    .map(line => line.replace(/^#{1,6}\s+/, ''))
}

function normalizeHeadingText(value) {
  return value
    .replace(/<[^>]+>/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/[\*_~]/g, '')
    .trim()
}

function githubSlug(value) {
  return normalizeHeadingText(value)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s_-]/gu, '')
    .trim()
    .replace(/\s+/g, '-')
}

const anchorCache = new Map()

function anchorsFor(file) {
  const key = path.resolve(file)
  if (anchorCache.has(key)) return anchorCache.get(key)

  const content = fs.readFileSync(key, 'utf8')
  const anchors = new Set()
  const explicit = /<a\s+(?:id|name)=["']([^"']+)["'][^>]*>/gi
  let match

  while ((match = explicit.exec(content))) anchors.add(match[1])

  const counts = new Map()
  for (const heading of headings(content)) {
    const base = githubSlug(heading)
    if (!base) continue
    const count = counts.get(base) ?? 0
    counts.set(base, count + 1)
    anchors.add(count === 0 ? base : base + '-' + count)
  }

  anchorCache.set(key, anchors)
  return anchors
}

function decodeFragment(value) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

const architectureGuides = {
  'clean-architecture/README.md': [
    /History/i,
    /problem/i,
    /strong fit|fit/i,
    /too much|weak/i,
    /fundamental model|mental model/i,
    /circle|layer/i,
    /physical structure/i,
    /Where does a new function|Where does.*code/i,
    /Naming/i,
    /feature end to end/i,
    /Testing/i,
    /Trade-offs|failure modes/i,
    /learning path/i,
    /Sources/i,
  ],
  'onion-architecture/README.md': [
    /History/i,
    /problem/i,
    /strong-fit|strong fit|fit/i,
    /weak-fit|weak fit/i,
    /mental model/i,
    /ring|responsibilit/i,
    /physical structure/i,
    /Where does code go/i,
    /Naming/i,
    /feature end to end/i,
    /Testing/i,
    /Trade-offs|failure modes/i,
    /learning path/i,
    /Sources/i,
  ],
  'model-view-controller/README.md': [
    /History/i,
    /problem/i,
    /strong fit|fit/i,
    /weak fit|poor label/i,
    /mental model|role/i,
    /physical structure/i,
    /Where does a new function go/i,
    /Naming/i,
    /feature end to end/i,
    /Testing/i,
    /Trade-offs|failure modes/i,
    /Learning path/i,
    /Sources/i,
  ],
  'model-view-viewmodel/README.md': [
    /History/i,
    /problem/i,
    /strong fit|useful|fit/i,
    /weak|unnecessary/i,
    /mental model|role/i,
    /physical structure/i,
    /Where does a new function go/i,
    /Naming/i,
    /feature end to end/i,
    /Testing/i,
    /Trade-offs|failure modes/i,
    /Learning path/i,
    /Sources/i,
  ],
}

for (const [guide, required] of Object.entries(architectureGuides)) {
  const file = path.join(root, guide)
  if (!fs.existsSync(file)) {
    fail(guide, 'missing architecture landing page')
    continue
  }

  const content = fs.readFileSync(file, 'utf8')
  const hs = headings(content)
  let cursor = -1

  for (const pattern of required) {
    const index = hs.findIndex((heading, i) => i > cursor && pattern.test(heading))
    if (index === -1) {
      fail(guide, 'missing or out-of-order required section matching ' + pattern)
      break
    }
    cursor = index
  }

  if (!content.includes('```mermaid')) fail(guide, 'must contain at least one Mermaid diagram')
  if (!/^## Sources\s*$/m.test(content)) fail(guide, 'must contain an explicit Sources section')
}

const boxDrawing = /[┌┐└┘├┤┬┴┼│─▶▼▲◀]/
const arrowDiagram = /(^|\s)([A-Za-z0-9_./()[\]"'& -]+)\s*(?:-->|<--|->|<-|↓|↑|=>)\s*([A-Za-z0-9_./()[\]"'& -]+)/m

for (const file of walk(root)) {
  const fileRel = relative(file)
  const content = fs.readFileSync(file, 'utf8')

  if (/\[\[[^\]\n]+\]\([^)]+\)\]/.test(content)) {
    fail(fileRel, 'contains a malformed nested Markdown link such as [[text](target)]')
  }
  if (/\[[^\]\n]*\]\(\s*\)/.test(content)) {
    fail(fileRel, 'contains an empty Markdown link target')
  }
  if (boxDrawing.test(content)) fail(fileRel, 'contains box-drawing diagram glyphs; use Mermaid')

  const lines = content.split('\n')
  let inFence = false
  let language = ''
  let start = 0
  let body = []
  const outside = []

  for (let i = 0; i < lines.length; i++) {
    const marker = lines[i].match(/^\s*```([^\s`]*)\s*$/)
    if (marker) {
      if (!inFence) {
        inFence = true
        language = marker[1] || ''
        start = i + 1
        body = []
      } else {
        const value = body.join('\n')
        if ((language === '' || language === 'text') && (boxDrawing.test(value) || arrowDiagram.test(value))) {
          fail(fileRel, 'diagram-like fenced block near line ' + start + ' must use Mermaid')
        }
        if (language === 'mermaid') {
          if (boxDrawing.test(value)) {
            fail(fileRel, 'Mermaid block near line ' + start + ' embeds box-drawing glyphs')
          }
          const first = body.find(line => line.trim())?.trim() ?? ''
          const supported = /^(?:flowchart|graph|sequenceDiagram|classDiagram|stateDiagram(?:-v2)?|erDiagram|mindmap|timeline|gitGraph|quadrantChart|journey|pie|xychart-beta|block-beta|architecture-beta)\b/
          if (!supported.test(first)) {
            fail(fileRel, 'Mermaid block near line ' + start + ' has an unknown or missing diagram declaration: ' + first)
          }
        }
        inFence = false
        language = ''
        body = []
      }
      continue
    }
    if (inFence) body.push(lines[i])
    else outside.push(lines[i])
  }

  if (inFence) fail(fileRel, 'unclosed fenced code block near line ' + start)

  const withoutInlineCode = outside.join('\n').replace(new RegExp('`[^`]*`', 'g'), '')
  if (arrowDiagram.test(withoutInlineCode)) {
    fail(fileRel, 'contains prose used as an arrow diagram; use Mermaid or a sentence/table')
  }

  const base = path.dirname(file)
  const linkRe = /\[[^\]]*\]\(([^)]+)\)/g
  let match

  while ((match = linkRe.exec(content))) {
    const rawTarget = match[1].trim()
    if (!rawTarget || /^(https?:|mailto:)/.test(rawTarget)) continue

    const hashIndex = rawTarget.indexOf('#')
    const pathPart = (hashIndex === -1 ? rawTarget : rawTarget.slice(0, hashIndex)).split('?')[0]
    const fragment = hashIndex === -1 ? '' : decodeFragment(rawTarget.slice(hashIndex + 1))
    const resolved = pathPart ? path.resolve(base, pathPart) : path.resolve(file)

    if (!fs.existsSync(resolved)) {
      fail(fileRel, 'broken relative link: ' + rawTarget)
      continue
    }

    if (fragment && fs.statSync(resolved).isFile() && resolved.endsWith('.md')) {
      if (!anchorsFor(resolved).has(fragment)) {
        fail(fileRel, 'broken Markdown anchor: ' + rawTarget)
      }
    }
  }
}

for (const required of [
  'CONTRIBUTING.md',
  'AGENTS.md',
  'GLOSSARY.md',
  'foundations/code-placement.md',
  'conventions/naming-and-file-placement.md',
  'docs/architecture-guide-template.md',
]) {
  if (!fs.existsSync(path.join(root, required))) fail(required, 'required documentation governance file is missing')
}

if (errors.length) {
  console.error('Documentation quality checks failed:')
  errors.forEach(error => console.error(' - ' + error))
  process.exit(1)
}

console.log('Documentation quality checks passed.')
