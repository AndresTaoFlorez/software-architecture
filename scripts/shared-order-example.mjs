import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const canonicalPath = 'clean-architecture/4-building-a-feature.md'
const landingPages = [
  'clean-architecture/README.md',
  'onion-architecture/README.md',
  'model-view-controller/README.md',
  'model-view-viewmodel/README.md',
]

export const sharedFiles = [
  'domain/orders/Order.ts',
  'application/orders/use-cases/cancelOrder.ts',
  'infrastructure/http/orders/adapters/HttpOrderRepository.ts',
]

// Each landing page is self-contained for readers, but these three identical
// implementation blocks have ONE editorial owner: the canonical Clean feature.
// Presentation and composition deliberately remain page-specific.
export function findSharedBlock(document, filename, isLanding = false) {
  const section = isLanding ? document.indexOf('### Complete') : 0
  if (section < 0) throw new Error('missing complete example section')
  const opening = new RegExp('```ts\\r?\\n// ' + filename.replaceAll('.', '\\.') + '\\r?\\n', 'g')
  opening.lastIndex = section
  const match = opening.exec(document)
  if (!match) throw new Error('missing shared example block: ' + filename)
  const begin = match.index
  const closing = /\r?\n```/g
  closing.lastIndex = opening.lastIndex
  const close = closing.exec(document)
  if (!close) throw new Error('unclosed shared example block: ' + filename)
  const end = close.index + close[0].length
  // Ambiguous duplicate complete snippets make synchronization unsafe.
  opening.lastIndex = end
  if (opening.exec(document)) throw new Error('duplicate shared example block: ' + filename)
  return { begin, end, code: document.slice(begin, end) }
}

export function synchronizeLanding(canonical, landing) {
  let result = landing
  const drifted = []
  for (const filename of sharedFiles) {
    const source = findSharedBlock(canonical, filename).code
    const mirror = findSharedBlock(result, filename, true)
    const normalized = source.replaceAll('\r\n', '\n')
    if (normalized !== mirror.code.replaceAll('\r\n', '\n')) {
      const replacement = mirror.code.includes('\r\n') ? normalized.replaceAll('\n', '\r\n') : normalized
      result = result.slice(0, mirror.begin) + replacement + result.slice(mirror.end)
      drifted.push(filename)
    }
  }
  return { content: result, drifted }
}

function main(args) {
  if (args.length !== 1 || !['--check', '--write'].includes(args[0])) {
    throw new Error('Usage: node scripts/shared-order-example.mjs --check|--write')
  }
  const mode = args[0]
  const canonical = fs.readFileSync(canonicalPath, 'utf8')
  const differences = []
  for (const page of landingPages) {
    const original = fs.readFileSync(page, 'utf8')
    const result = synchronizeLanding(canonical, original)
    if (result.drifted.length === 0) continue
    differences.push(page + ': ' + result.drifted.join(', '))
    if (mode === '--write') fs.writeFileSync(page, result.content)
  }
  if (differences.length && mode === '--check') {
    console.error('Shared example drift. Edit ' + canonicalPath +
      ', then run npm run sync:examples.\n' + differences.join('\n'))
    process.exitCode = 1
  } else {
    console.log(mode === '--write' && differences.length
      ? 'Synchronized shared example blocks:\n' + differences.join('\n')
      : 'Shared order-cancellation blocks match the canonical guide.')
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2))
}
