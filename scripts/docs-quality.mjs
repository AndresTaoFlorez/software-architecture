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

const architectureGuides = {
  'clean-architecture/README.md': [/History/i,/problem/i,/fit|too much/i,/model/i,/circle|layer/i,/physical structure/i,/Where does a new function go/i,/Naming/i,/learning path/i,/Sources/i],
  'onion-architecture/README.md': [/History/i,/problem/i,/fit/i,/model/i,/ring|responsibilit/i,/physical structure/i,/Where does code go/i,/Naming/i,/learning path/i,/Sources/i],
  'model-view-controller/README.md': [/History/i,/problem/i,/fit/i,/poor label/i,/role|three/i,/File placement/i,/Where does a new function go/i,/Naming/i,/Learning path/i,/Sources/i],
  'model-view-viewmodel/README.md': [/History/i,/problem/i,/useful|fit/i,/unnecessary|weak/i,/Roles/i,/mapping/i,/Where files go/i,/Naming/i,/Learning path/i,/Sources/i],
}

for (const [guide, required] of Object.entries(architectureGuides)) {
  const file = path.join(root, guide)
  if (!fs.existsSync(file)) {
    fail(guide, 'missing architecture landing page')
    continue
  }
  const content = fs.readFileSync(file, 'utf8')
  const hs = headings(content)
  for (const pattern of required) {
    if (!hs.some(h => pattern.test(h))) fail(guide, 'missing required section matching ' + pattern)
  }
  if (!content.includes('```mermaid')) fail(guide, 'must contain at least one Mermaid diagram')
  if (!/^## Sources\s*$/m.test(content)) fail(guide, 'must contain an explicit Sources section')
}

const boxDrawing = /[┌┐└┘├┤┬┴┼│─▶▼▲◀]/
const arrowDiagram = /(^|\s)([A-Za-z0-9_./()[\]"'& -]+)\s*(?:-->|<--|->|<-|↓|↑|=>)\s*([A-Za-z0-9_./()[\]"'& -]+)/m

for (const file of walk(root)) {
  const fileRel = relative(file)
  const content = fs.readFileSync(file, 'utf8')

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
        if (language === 'mermaid' && boxDrawing.test(value)) {
          fail(fileRel, 'Mermaid block near line ' + start + ' embeds box-drawing glyphs')
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
    let target = match[1].trim()
    if (!target || target.startsWith('#') || /^(https?:|mailto:)/.test(target)) continue
    target = target.split('#')[0].split('?')[0]
    if (!target) continue
    if (!fs.existsSync(path.resolve(base, target))) fail(fileRel, 'broken relative link: ' + match[1])
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
