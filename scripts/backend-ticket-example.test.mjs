import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { createRequire } from 'node:module'
import { test } from 'node:test'
import ts from 'typescript'

const guide = 'backend/2-typescript-first-boundaries.md'
const names = [
  'tickets/domain/Ticket.ts',
  'tickets/application/TicketRepository.ts',
  'tickets/application/CreateTicket.ts',
  'tickets/infrastructure/InMemoryTicketRepository.ts',
  'tickets/interface/http/createTicketRequest.ts',
  'tickets/interface/http/TicketHttpHandler.ts',
]

function extract(document, name) {
  const marker = '`src/' + name + '`:'
  const start = document.indexOf(marker)
  assert.ok(start >= 0, 'Missing canonical module: ' + name)
  const opener = document.indexOf('```ts\n', start)
  const end = document.indexOf('\n```', opener + 6)
  assert.ok(opener > start && end > opener, 'Missing complete fence: ' + name)
  return document.slice(opener + 6, end) + '\n'
}

test('backend ticket modules compile and preserve validation, persistence and delivery boundaries', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'backend-ticket-guide-'))
  try {
    fs.writeFileSync(path.join(root, 'package.json'), '{"type":"commonjs"}')
    const document = fs.readFileSync(guide, 'utf8').replaceAll('\r\n', '\n')
    const files = names.map(name => {
      const code = extract(document, name)
      const file = path.join(root, 'src', name)
      fs.mkdirSync(path.dirname(file), { recursive: true })
      fs.writeFileSync(file, code)
      // The actual documented inner imports must stay within their owners.
      if (name.startsWith('tickets/domain/') || name.startsWith('tickets/application/')) {
        const tree = ts.createSourceFile(name, code, ts.ScriptTarget.Latest, true)
        for (const statement of tree.statements) {
          if (!ts.isImportDeclaration(statement)) continue
          const imported = statement.moduleSpecifier.text
          const target = path.posix.normalize(path.posix.join(path.posix.dirname(name), imported))
          const allowed = name.startsWith('tickets/domain/')
            ? target.startsWith('tickets/domain/')
            : target.startsWith('tickets/domain/') || target.startsWith('tickets/application/')
          assert.ok(imported.startsWith('.') && allowed, 'Outward inner dependency: ' + imported)
        }
      }
      return file
    })
    const program = ts.createProgram(files, {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.NodeNext,
      moduleResolution: ts.ModuleResolutionKind.NodeNext,
      strict: true,
      types: [],
      rootDir: path.join(root, 'src'),
      outDir: path.join(root, 'out'),
      noEmitOnError: true,
    })
    const diagnostics = ts.getPreEmitDiagnostics(program)
    assert.equal(diagnostics.length, 0, ts.formatDiagnostics(diagnostics, {
      getCanonicalFileName: name => name,
      getCurrentDirectory: () => root,
      getNewLine: () => '\n',
    }))
    assert.equal(program.emit().emitSkipped, false)
    const require = createRequire(path.join(root, 'package.json'))
    const load = name => require(path.join(root, 'out', name))
    const domain = load('tickets/domain/Ticket.js')
    const { CreateTicket } = load('tickets/application/CreateTicket.js')
    const { TicketPersistenceUnavailable } = load('tickets/application/TicketRepository.js')
    const { InMemoryTicketRepository } = load('tickets/infrastructure/InMemoryTicketRepository.js')
    const { TicketHttpHandler } = load('tickets/interface/http/TicketHttpHandler.js')
    const { parseCreateTicketRequest, InvalidTicketRequest } = load('tickets/interface/http/createTicketRequest.js')
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
      status: domain.INITIAL_TICKET_STATUS,
    })
    assert.equal(repository.records.size, 1)
    assert.equal(repository.records.get('T-1').status, domain.INITIAL_TICKET_STATUS)
    const ticket = domain.Ticket.create('immutable', 'Valid', '')
    const snapshot = ticket.snapshot()
    snapshot.status = 'resolved'
    assert.equal(ticket.snapshot().status, domain.INITIAL_TICKET_STATUS)

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
  } finally {
    const resolved = path.resolve(root)
    assert.equal(path.dirname(resolved), path.resolve(os.tmpdir()))
    assert.ok(path.basename(resolved).startsWith('backend-ticket-guide-'))
    fs.rmSync(resolved, { recursive: true, force: true })
  }
})
