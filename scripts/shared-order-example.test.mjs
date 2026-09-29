import assert from 'node:assert/strict'
import fs from 'node:fs'
import { test } from 'node:test'
import { findSharedBlock, sharedFiles, synchronizeLanding } from './shared-order-example.mjs'

const canonical = fs.readFileSync('clean-architecture/4-building-a-feature.md', 'utf8')
const landingPages = [
  'clean-architecture/README.md',
  'onion-architecture/README.md',
  'model-view-controller/README.md',
  'model-view-viewmodel/README.md',
]

test('shared executable modules have one canonical editorial source', () => {
  for (const page of landingPages) {
    const landing = fs.readFileSync(page, 'utf8')
    const checked = synchronizeLanding(canonical, landing)
    assert.deepEqual(checked.drifted, [], page + ': run npm run sync:examples')
    assert.equal(checked.content, landing)
    for (const filename of sharedFiles) {
      assert.equal(findSharedBlock(landing, filename, true).code,
        findSharedBlock(canonical, filename).code)
    }
  }
})

test('sync detects and repairs changed business logic without rewriting pattern-specific code', () => {
  const landing = fs.readFileSync('model-view-controller/README.md', 'utf8')
  const original = findSharedBlock(landing, 'domain/orders/Order.ts', true).code
  const modified = original.replace("this.#status = 'cancelled'", "this.#status = 'pending'")
  assert.notEqual(modified, original, 'fixture must change canonical business behavior')
  const driftedDocument = landing.replace(original, modified)
  const checked = synchronizeLanding(canonical, driftedDocument)
  assert.deepEqual(checked.drifted, ['domain/orders/Order.ts'])
  assert.equal(checked.content, landing, 'only mirrored block is restored')
})
