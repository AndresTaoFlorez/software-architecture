import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { test } from 'node:test'
import ts from 'typescript'
import { parseMarkdown, visit } from './markdown.mjs'

const documents = [
  'clean-architecture/4-building-a-feature.md',
  ...['clean-architecture', 'onion-architecture', 'model-view-controller', 'model-view-viewmodel'].map(dir => dir + '/README.md'),
]

for (const document of documents) test(document + ': complete feature compiles and enforces cancellation outcomes', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'architecture-feature-'))
  try {
    const files = []
    const content = fs.readFileSync(document, 'utf8')
    const feature = document.endsWith('/README.md') ? content.slice(content.indexOf('### Complete')) : content
    visit(parseMarkdown(feature), node => {
      if (node.type !== 'code' || node.lang !== 'ts') return
      const filename = node.value.match(/^\/\/ ((?:domain|application|infrastructure|presentation|composition)\/[\w/]+\.ts)\n/)?.[1]
      if (!filename) return
      const target = path.join(root, filename)
      assert.ok(target.startsWith(root + path.sep))
      // Node's native TS loader needs explicit extensions; source docs target a bundler.
      const source = node.value.replace(/(from\s+['"])(\.[^'"]+)(['"])/g, '$1$2.ts$3')
      fs.mkdirSync(path.dirname(target), { recursive: true })
      fs.writeFileSync(target, source)
      files.push(target)
    })
    assert.ok(files.length >= 5, 'feature must include policy, port/operation, adapter, UI and wiring')
    assert.equal(new Set(files).size, files.length, 'duplicate feature filenames')
    fs.writeFileSync(path.join(root, 'package.json'), '{"type":"module"}')
    const program = ts.createProgram(files, {
      target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      strict: true, noEmit: true, allowImportingTsExtensions: true,
      types: [], skipLibCheck: true,
    })
    const diagnostics = ts.getPreEmitDiagnostics(program)
    assert.equal(diagnostics.length, 0, ts.formatDiagnostics(diagnostics, {
      getCanonicalFileName: f => f, getCurrentDirectory: () => root, getNewLine: () => '\n',
    }))
    const load = name => import(pathToFileURL(path.join(root, name)).href)
    const { Order, ShippedOrderCannotBeCancelled, ORDER_STATUSES, isOrderStatus } = await load('domain/orders/Order.ts')
    assert.deepEqual([...ORDER_STATUSES], ['pending', 'shipped', 'cancelled'])
    for (const status of ORDER_STATUSES) assert.equal(isOrderStatus(status), true)
    for (const invalid of [null, 9, {}, 'unknown', { toString: () => 'pending' }]) {
      assert.equal(isOrderStatus(invalid), false, 'Domain must not coerce unknown values')
    }
    const { makeCancelOrder, PersistenceFailure } = await load('application/orders/cancelOrder.ts')
    const { HttpOrderRepository } = await load('infrastructure/orders/HttpOrderRepository.ts')
    const shipped = new Order('1', 'shipped')
    assert.throws(() => shipped.cancel(), ShippedOrderCannotBeCancelled)
    assert.equal(shipped.status, 'shipped')
    const cancelled = new Order('1', 'cancelled')
    cancelled.cancel()
    assert.equal(cancelled.status, 'cancelled')
    let saved
    const orders = {
      async findById(id) { return { order: new Order(id, 'pending'), version: 'v1' } },
      async save(order, version) { saved = { id: order.id, status: order.status, version } },
    }
    assert.deepEqual(await makeCancelOrder(orders)('1'), { ok: true, status: 'cancelled' })
    assert.deepEqual(saved, { id: '1', status: 'cancelled', version: 'v1' })
    assert.deepEqual(await makeCancelOrder({ ...orders, findById: async () => null })('1'), { ok: false, reason: 'not-found' })
    saved = undefined
    assert.deepEqual(await makeCancelOrder({ ...orders, findById: async () => ({ order: shipped, version: 'v1' }) })('1'), { ok: false, reason: 'shipped' })
    assert.equal(saved, undefined)
    for (const reason of ['conflict', 'unavailable']) {
      assert.deepEqual(await makeCancelOrder({ ...orders, save: async () => { throw new PersistenceFailure(reason) } })('1'), { ok: false, reason })
    }
    await assert.rejects(makeCancelOrder({ ...orders, save: async () => { throw new Error('defect') } })('1'), /defect/)
    let requested, written
    const transport = {
      async get(url) { requested = url; return { data: { id: 'a/b', status: 'pending' }, version: 'v1' } },
      async put(...args) { written = args },
    }
    const repository = new HttpOrderRepository(transport)
    const loaded = await repository.findById('a/b')
    assert.equal(requested, '/orders/a%2Fb')
    loaded.order.cancel()
    await repository.save(loaded.order, loaded.version)
    assert.deepEqual(written, ['/orders/a%2Fb', { id: 'a/b', status: 'cancelled' }, 'v1'])
    for (const data of [
      null, {}, { id: 'a/b', status: 'unknown' },
      { id: 'a/b', status: 42 }, { id: 'a/b', status: { toString: () => 'pending' } },
      { id: 'other', status: 'pending' },
    ]) {
      await assert.rejects(new HttpOrderRepository({ ...transport, get: async () => ({ data, version: 'v1' }) }).findById('a/b'), PersistenceFailure)
    }
    const vmFile = files.find(f => f.endsWith('CancelOrderViewModel.ts') || f.endsWith('CancellationModel.ts'))
    if (vmFile) {
      const module = await import(pathToFileURL(vmFile).href)
      const Model = module.CancelOrderViewModel ?? module.CancellationModel
      let complete
      const promise = new Promise(resolve => { complete = resolve })
      const model = new Model(() => promise)
      let notifications = 0
      const unsubscribe = model.subscribe(() => { notifications++ })
      const operation = model.cancel('1')
      assert.equal(model.busy, true)
      await model.cancel('1') // duplicate command is ignored while pending
      complete({ ok: false, reason: 'shipped' })
      await operation
      assert.equal(model.busy, false)
      assert.equal(model.message, 'Cannot cancel: shipped')
      assert.equal(notifications, 2)
      unsubscribe()
    }
  } finally {
    assert.equal(path.dirname(root), os.tmpdir())
    assert.ok(path.basename(root).startsWith('architecture-feature-'))
    fs.rmSync(root, { recursive: true, force: true })
  }
})
