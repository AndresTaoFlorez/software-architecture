import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { createRequire } from 'node:module'
import { test } from 'node:test'
import ts from 'typescript'

const guide = 'backend/2-typescript-first-boundaries.md'
const names = [
  'domain/tickets/Ticket.ts',
  'application/tickets/ports/TicketRepository.ts',
  'application/tickets/CreateTicket.ts',
  'infrastructure/persistence/tickets/InMemoryTicketRepository.ts',
  'presentation/http/tickets/createTicketRequest.ts',
  'presentation/http/tickets/TicketHttpHandler.ts',
  'presentation/http/tickets/handleAuthenticatedCreateTicket.ts',
  'application/tickets/index.ts',
]
const exerciseNames = [
  'presentation/cli/tickets/createTicketCli.ts',
  'domain/tickets/ticketQuota.ts',
  'application/tickets/ports/TicketQuotaStore.ts',
  'application/tickets/createTicketWithinQuota.ts',
  'infrastructure/persistence/tickets/InMemoryQuotaStores.ts',
  'composition/compareQuotaStores.ts',
]

// Test-only: these fixtures use relative source paths, not a production module resolver.
// Capability API checks, aliases and third-party transitive dependencies are separate concerns.
const allowedLayers = {
  domain: ['domain'],
  application: ['application', 'domain'],
  infrastructure: ['infrastructure', 'application', 'domain'],
  presentation: ['presentation', 'application'],
  composition: ['composition', 'presentation', 'infrastructure', 'application', 'domain'],
}

function checkLayerDependencies(name, code) {
  const layer = name.split('/')[0]
  assert.ok(allowedLayers[layer], 'Unknown fixture layer: ' + name)
  const tree = ts.createSourceFile(name, code, ts.ScriptTarget.Latest, true)
  function check(specifier) {
    assert.ok(specifier && ts.isStringLiteralLike(specifier), 'Unresolved fixture dependency in ' + name)
    const imported = specifier.text
    if (!imported.startsWith('.')) {
      assert.ok(layer !== 'domain' && layer !== 'application', 'External dependency in ' + name + ': ' + imported)
      return // Outer fixtures can import framework/platform packages; no alias resolution here.
    }
    const target = path.posix.normalize(path.posix.join(path.posix.dirname(name), imported))
    assert.ok(allowedLayers[layer].includes(target.split('/')[0]), 'Forbidden layer dependency in ' + name + ': ' + imported)
  }
  function visit(node) {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
      if (node.moduleSpecifier) check(node.moduleSpecifier)
    } else if (ts.isImportEqualsDeclaration(node) && ts.isExternalModuleReference(node.moduleReference)) {
      check(node.moduleReference.expression)
    } else if (ts.isImportTypeNode(node)) {
      check(ts.isLiteralTypeNode(node.argument) ? node.argument.literal : undefined)
    } else if (ts.isCallExpression(node)
      && (node.expression.kind === ts.SyntaxKind.ImportKeyword
        || (ts.isIdentifier(node.expression) && node.expression.text === 'require'))) {
      check(node.arguments[0])
    }
    ts.forEachChild(node, visit)
  }
  visit(tree)
}

test('layer inspection rejects forbidden imports, reexports and indirect module syntax', () => {
  const outward = '../../infrastructure/persistence/tickets/PrismaTicketRepository'
  const forms = [
    `import { X } from '${outward}'`,
    `import type { X } from '${outward}'`,
    `export { X } from '${outward}'`,
    `export type { X } from '${outward}'`,
    `export * from '${outward}'`,
    `async function load() { return import('${outward}') }`,
    `type X = import('${outward}').X`,
    `function load() { return require('${outward}') }`,
    `import X = require('${outward}')`,
  ]
  for (const code of forms) {
    assert.throws(() => checkLayerDependencies('application/tickets/Test.ts', code), /Forbidden layer dependency/)
  }
  for (const code of ['import(target)', 'import(`../${target}`)', 'require(target)']) {
    assert.throws(() => checkLayerDependencies('application/tickets/Test.ts', code), /Unresolved fixture dependency/)
  }
  // Expectations are independent of allowedLayers so changing enforcement cannot change the test oracle.
  const forbidden = [
    ['domain', 'application'], ['domain', 'infrastructure'], ['domain', 'presentation'], ['domain', 'composition'],
    ['application', 'infrastructure'], ['application', 'presentation'], ['application', 'composition'],
    ['infrastructure', 'presentation'], ['infrastructure', 'composition'],
    ['presentation', 'domain'], ['presentation', 'infrastructure'], ['presentation', 'composition'],
  ]
  for (const [layer, target] of forbidden) {
    assert.throws(() => checkLayerDependencies(layer + '/tickets/Test.ts',
      `import type { X } from '../../${target}/tickets/X'`), /Forbidden layer dependency/)
  }
  const permitted = [
    ['domain', 'domain'], ['application', 'application'], ['application', 'domain'],
    ['infrastructure', 'infrastructure'], ['infrastructure', 'application'], ['infrastructure', 'domain'],
    ['presentation', 'presentation'], ['presentation', 'application'],
    ['composition', 'composition'], ['composition', 'presentation'], ['composition', 'infrastructure'],
    ['composition', 'application'], ['composition', 'domain'],
  ]
  for (const [layer, target] of permitted) {
    checkLayerDependencies(layer + '/tickets/Test.ts', `import type { X } from '../../${target}/tickets/X'`)
  }
  for (const layer of ['domain', 'application', 'infrastructure', 'presentation', 'composition']) {
    const external = "import { X } from '@nestjs/common'"
    if (layer === 'domain' || layer === 'application') {
      assert.throws(() => checkLayerDependencies(layer + '/tickets/Test.ts', external), /External dependency/)
    } else checkLayerDependencies(layer + '/tickets/Test.ts', external)
  }
  checkLayerDependencies('application/tickets/Test.ts', "export type { TicketData } from '../../domain/tickets/Ticket'")
  checkLayerDependencies('application/tickets/Test.ts', "async function load() { return import('../../domain/tickets/Ticket') }")
  checkLayerDependencies('domain/tickets/Test.ts', "import type { TicketData } from './Ticket'")
  checkLayerDependencies('application/tickets/Test.ts', "// import('prisma')\nconst text = \"require('prisma')\"")
  assert.throws(() => checkLayerDependencies('application/tickets/Test.ts', "export * from '../../../outside'"), /Forbidden/)
  // Same-layer imports are valid here; supported capability APIs require another policy.
  checkLayerDependencies('application/billing/Test.ts', "import { CreateTicket } from '../tickets'")
})

function compile(root, files, output = 'out') {
  const program = ts.createProgram(files, {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.NodeNext,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
    strict: true,
    types: [],
    rootDir: path.join(root, 'src'),
    outDir: path.join(root, output),
    noEmitOnError: true,
  })
  const diagnostics = ts.getPreEmitDiagnostics(program)
  assert.equal(diagnostics.length, 0, ts.formatDiagnostics(diagnostics, {
    getCanonicalFileName: name => name,
    getCurrentDirectory: () => root,
    getNewLine: () => '\n',
  }))
  assert.equal(program.emit().emitSkipped, false)
}

function extract(document, name) {
  const marker = '`src/' + name + '`'
  const start = document.indexOf(marker)
  assert.ok(start >= 0, 'Missing canonical module: ' + name)
  const opener = document.indexOf('```ts\n', start)
  const end = document.indexOf('\n```', opener + 6)
  assert.ok(opener > start && end > opener, 'Missing complete fence: ' + name)
  return document.slice(opener + 6, end) + '\n'
}

test('documented Nest and Prisma modules follow the layer policy without executing frameworks', () => {
  const blocks = {
    'backend/3-nestjs-building-blocks.md': ['presentation/http/tickets/CreateTicketPipe.ts'],
    'backend/4-create-ticket-with-nestjs.md': [
      'presentation/http/tickets/TicketsController.ts',
      'composition/tokens/ticket.tokens.ts',
      'composition/modules/TicketsModule.ts',
      'composition/main.ts',
      'composition/modules/index.ts',
      'infrastructure/persistence/tickets/PrismaTicketRepository.ts',
      'composition/modules/DatabaseModule.ts',
    ],
  }
  for (const [file, modules] of Object.entries(blocks)) {
    const document = fs.readFileSync(file, 'utf8').replaceAll('\r\n', '\n')
    for (const name of modules) checkLayerDependencies(name, extract(document, name))
  }
})

test('backend ticket modules compile and preserve validation, persistence and delivery boundaries', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'backend-ticket-guide-'))
  try {
    fs.writeFileSync(path.join(root, 'package.json'), '{"type":"commonjs"}')
    const document = fs.readFileSync(guide, 'utf8').replaceAll('\r\n', '\n')
    const exercises = fs.readFileSync('backend/6-boundary-exercises.md', 'utf8').replaceAll('\r\n', '\n')
    const files = [...names, ...exerciseNames].map(name => {
      const code = extract(names.includes(name) ? document : exercises, name)
      const file = path.join(root, 'src', name)
      fs.mkdirSync(path.dirname(file), { recursive: true })
      fs.writeFileSync(file, code)
      checkLayerDependencies(name, code)
      return file
    })
    compile(root, files)
    const require = createRequire(path.join(root, 'package.json'))
    const load = name => require(path.join(root, 'out', name))
    const domain = load('domain/tickets/Ticket.js')
    const { CreateTicket } = load('application/tickets/CreateTicket.js')
    const { TicketPersistenceUnavailable } = load('application/tickets/ports/TicketRepository.js')
    const { InMemoryTicketRepository } = load('infrastructure/persistence/tickets/InMemoryTicketRepository.js')
    const { TicketHttpHandler } = load('presentation/http/tickets/TicketHttpHandler.js')
    const { parseCreateTicketRequest, InvalidTicketRequest } = load('presentation/http/tickets/createTicketRequest.js')
    const { handleAuthenticatedCreateTicket } = load('presentation/http/tickets/handleAuthenticatedCreateTicket.js')
    const input = { subject: '  Invoice download fails  ', description: 'PDF download fails for INV-42.' }

    for (const status of domain.TICKET_STATUSES) assert.equal(domain.isTicketStatus(status), true)
    for (const value of [null, 1, [], 'queued', { toString: () => 'open' }]) {
      assert.equal(domain.isTicketStatus(value), false)
    }
    const repository = new InMemoryTicketRepository()
    let nextId = 0
    const operation = new CreateTicket(repository, () => 'T-' + ++nextId)
    const http = new TicketHttpHandler(operation)
    const response = await http.handle(input)
    assert.equal(response.status, 201)
    assert.deepEqual(response.body, {
      ticket_id: 'T-1', subject: 'Invoice download fails', description: input.description,
      status: 'open',
    })
    assert.equal(repository.records.size, 1)
    assert.equal(repository.records.get('T-1').status, 'open')
    const ticket = domain.Ticket.create('immutable', 'Valid', '')
    const snapshot = ticket.snapshot()
    snapshot.status = 'resolved'
    assert.equal(ticket.snapshot().status, 'open')

    for (const body of [null, [], {}, { subject: 1, description: '' },
      { subject: 'Valid', description: null }, { ...input, status: 'resolved' }, { ...input, id: 'client-id' }]) {
      assert.throws(() => parseCreateTicketRequest(body), InvalidTicketRequest)
      assert.deepEqual(await http.handle(body), { status: 400, body: { error: 'invalid-request' } })
    }
    assert.deepEqual(parseCreateTicketRequest({ ...input, extra: 9 }), input)
    for (const subject of ['  ', 'x'.repeat(161)]) {
      assert.deepEqual(await http.handle({ ...input, subject }), {
        status: 400, body: { error: 'invalid-subject' },
      })
    }
    assert.equal(repository.records.size, 1, 'Invalid request or subject must not save')
    assert.equal((await operation.execute({ ...input, subject: 'x'.repeat(160) })).ok, true)

    const accessRecords = new InMemoryTicketRepository()
    let accessId = 0
    const accessHttp = new TicketHttpHandler(new CreateTicket(accessRecords, () => 'access-' + ++accessId))
    const unreadableBody = Object.defineProperty({}, 'subject', {
      get() { throw new Error('Unauthenticated body must not be processed') },
    })
    for (const body of [input, unreadableBody]) {
      assert.deepEqual(await handleAuthenticatedCreateTicket({}, body, accessHttp), {
        status: 401, body: { error: 'unauthorized' },
      })
    }
    assert.equal(accessId, 0, 'Access rejection must not invoke the use case')
    assert.equal(accessRecords.records.size, 0, 'Access rejection must not persist')
    const verifiedContext = { user: { id: 'verified-user' } }
    assert.deepEqual(await handleAuthenticatedCreateTicket(verifiedContext, { ...input, subject: 17 }, accessHttp), {
      status: 400, body: { error: 'invalid-request' },
    })
    assert.equal(accessId, 0, 'Permitted callers still need transport validation before the use case')
    assert.deepEqual(await handleAuthenticatedCreateTicket(verifiedContext, { ...input, subject: '  ' }, accessHttp), {
      status: 400, body: { error: 'invalid-subject' },
    })
    assert.equal(accessId, 1, 'Business validation runs in the use case, after transport validation')
    assert.equal(accessRecords.records.size, 0, 'Business rejection must not persist')
    const permitted = await handleAuthenticatedCreateTicket(verifiedContext, input, accessHttp)
    assert.equal(permitted.status, 201)
    assert.equal(permitted.body.ticket_id, 'access-2')
    assert.equal(permitted.body.status, 'open')
    assert.equal(accessRecords.records.size, 1)

    let acceptInsert
    const waiting = new CreateTicket({ insert: () => new Promise(resolve => { acceptInsert = resolve }) }, () => 'waiting')
    let completed = false
    const pending = waiting.execute(input).then(result => { completed = true; return result })
    await Promise.resolve()
    assert.equal(completed, false, 'Success must await persistence')
    acceptInsert()
    assert.equal((await pending).ok, true)

    const outage = new CreateTicket({ async insert() { throw new TicketPersistenceUnavailable() } }, () => 'outage')
    assert.deepEqual(await outage.execute(input), { ok: false, reason: 'unavailable' })
    assert.deepEqual(await new TicketHttpHandler(outage).handle(input), {
      status: 503, body: { error: 'unavailable' },
    })
    const defect = new Error('Programming defect')
    const broken = new CreateTicket({ async insert() { throw defect } }, () => 'broken')
    await assert.rejects(new TicketHttpHandler(broken).handle(input), error => error === defect)
    await assert.rejects(repository.insert(domain.Ticket.create('T-1', 'Valid', '')), /Duplicate/)

    const { createTicketCli } = load('presentation/cli/tickets/createTicketCli.js')
    assert.equal(load('application/tickets/index.js').CreateTicket, CreateTicket, 'Public API must expose the same runtime token')
    const cliRecords = new InMemoryTicketRepository()
    let cliId = 0
    const cliOperation = new CreateTicket(cliRecords, () => 'CLI-' + ++cliId)
    for (const args of [[], ['subject'], ['subject', '', 'extra'], [1, ''], ['subject', null]]) {
      assert.deepEqual(await createTicketCli(args, cliOperation), {
        exitCode: 1, output: 'Usage: create-ticket <subject> <description>',
      })
    }
    assert.deepEqual(await createTicketCli(['  ', ''], cliOperation), { exitCode: 2, output: 'Invalid ticket subject' })
    assert.equal(cliRecords.records.size, 0, 'Invalid CLI inputs must not persist')
    assert.deepEqual(await createTicketCli(['  Valid  ', 'details'], cliOperation), { exitCode: 0, output: 'Created ticket CLI-2' })
    assert.equal(cliRecords.records.get('CLI-2').subject, 'Valid')
    assert.equal(cliRecords.records.get('CLI-2').status, 'open')
    assert.deepEqual(await createTicketCli(['Valid', ''], outage), {
      exitCode: 3, output: 'Ticket storage unavailable; outcome may be unknown',
    })
    await assert.rejects(createTicketCli(['Valid', ''], broken), error => error === defect)

    const { compareQuotaStores } = load('composition/compareQuotaStores.js')
    const comparison = await compareQuotaStores()
    assert.equal(comparison.unsafe.count, 3, 'Both stale reads accept the last free place')
    assert.ok(comparison.unsafe.results.every(result => result.ok))
    assert.equal(comparison.atomic.count, 2, 'Combined check/write must preserve capacity')
    assert.equal(comparison.atomic.results.filter(result => result.ok).length, 1)
    assert.deepEqual(comparison.atomic.results.filter(result => !result.ok), [{ ok: false, reason: 'quota-full' }])

    const { AtomicMemoryTicketStore } = load('infrastructure/persistence/tickets/InMemoryQuotaStores.js')
    const { makeCreateTicketWithinQuota } = load('application/tickets/createTicketWithinQuota.js')
    const quotaStore = new AtomicMemoryTicketStore()
    let quotaId = 0
    const quotaCreate = makeCreateTicketWithinQuota(quotaStore, () => 'quota-' + ++quotaId)
    assert.deepEqual(await quotaCreate({ ...input, subject: '' }), { ok: false, reason: 'invalid-subject' })
    assert.equal(quotaStore.records.size, 0, 'Domain rejection consumes no quota')
    assert.equal((await quotaCreate(input)).ok, true)
    assert.equal((await quotaCreate(input)).ok, true)
    assert.deepEqual(await quotaCreate(input), { ok: false, reason: 'quota-full' })
    const original = quotaStore.records.get('quota-2')
    await assert.rejects(quotaStore.insertWithinQuota(domain.Ticket.create('quota-2', 'Different', '')), /Duplicate/)
    assert.equal(quotaStore.records.get('quota-2'), original, 'Duplicate identity must not overwrite even at capacity')
    const quotaOutage = makeCreateTicketWithinQuota({
      async insertWithinQuota() { throw new TicketPersistenceUnavailable('Safe message', { cause: defect }) },
    }, () => 'quota-outage')
    assert.deepEqual(await quotaOutage(input), { ok: false, reason: 'unavailable' })
    const quotaDefect = makeCreateTicketWithinQuota({ async insertWithinQuota() { throw defect } }, () => 'quota-defect')
    await assert.rejects(quotaDefect(input), error => error === defect)

    // Compile the exercise's changed policy independently, with unchanged callers.
    const domainFile = path.join(root, 'src/domain/tickets/Ticket.ts')
    const originalDomain = fs.readFileSync(domainFile, 'utf8')
    assert.ok(originalDomain.includes("['open', 'in_progress', 'resolved'] as const"))
    assert.ok(originalDomain.includes('subject.length > 160'))
    fs.writeFileSync(domainFile, originalDomain
      .replace("['open', 'in_progress', 'resolved'] as const", "['reopened', 'resolved', 'in_progress', 'open'] as const")
      .replace('subject.length > 160', 'subject.length > 80'))
    compile(root, files, 'out-evolved')
    const evolvedLoad = name => require(path.join(root, 'out-evolved', name))
    const evolvedDomain = evolvedLoad('domain/tickets/Ticket.js')
    const EvolvedCreateTicket = evolvedLoad('application/tickets/CreateTicket.js').CreateTicket
    const evolvedRecords = new (evolvedLoad('infrastructure/persistence/tickets/InMemoryTicketRepository.js').InMemoryTicketRepository)()
    const evolved = new EvolvedCreateTicket(evolvedRecords, () => 'evolved')
    assert.equal(evolvedDomain.isTicketStatus('reopened'), true)
    assert.equal(evolvedDomain.TICKET_STATUSES[0], 'reopened')
    const accepted = await evolved.execute({ ...input, subject: ' ' + 'x'.repeat(80) + ' ' })
    assert.equal(accepted.ok, true)
    assert.equal(accepted.ticket.status, 'open', 'Reordering/adding vocabulary must not change initial state')
    assert.equal(accepted.ticket.subject.length, 80)
    assert.deepEqual(await evolved.execute({ ...input, subject: 'x'.repeat(81) }), { ok: false, reason: 'invalid-subject' })
    assert.equal(evolvedRecords.records.size, 1, 'Changed policy rejection must not insert')
  } finally {
    const resolved = path.resolve(root)
    assert.equal(path.dirname(resolved), path.resolve(os.tmpdir()))
    assert.ok(path.basename(resolved).startsWith('backend-ticket-guide-'))
    fs.rmSync(resolved, { recursive: true, force: true })
  }
})
