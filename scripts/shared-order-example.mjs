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
  'application/orders/cancelOrder.ts',
  'infrastructure/orders/HttpOrderRepository.ts',
]

// Each landing page is self-contained for readers, but these three identical
// implementation blocks have ONE editorial owner: the canonical Clean feature.
// Presentation and composition deliberately remain page-specific.
export function findSharedBlock(document, filename, isLanding = false) {
  const section = isLanding ? document.indexOf('### Complete client implementation') : 0
  if (section < 0) throw new Error('missing complete example section')
  const prefix = '```ts\n// ' + filename + '\n'
  const begin = document.indexOf(prefix, section)
  if (begin < 0) throw new Error('missing shared example block: ' + filename)
  const close = document.indexOf('\n```', begin + prefix.length)
  if (close < 0) throw new Error('unclosed shared example block: ' + filename)
  // Ambiguous duplicate complete snippets make synchronization unsafe.
  const again = document.indexOf(prefix, close + 4)
  if (again >= 0) throw new Error('duplicate shared example block: ' + filename)
  return { begin, end: close + 4, code: document.slice(begin, close + 4) }
}

export function synchronizeLanding(canonical, landing) {
  let result = landing
  const drifted = []
  for (const filename of sharedFiles) {
    const source = findSharedBlock(canonical, filename).code
    const mirror = findSharedBlock(result, filename, true)
    if (source !== mirror.code) {
      result = result.slice(0, mirror.begin) + source + result.slice(mirror.end)
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
