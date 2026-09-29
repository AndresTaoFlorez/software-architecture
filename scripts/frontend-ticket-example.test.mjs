import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { test } from 'node:test'
import ts from 'typescript'

const guide = 'frontend/ports-and-adapters.md'
const modules = [
  ['src/domain/tickets/Ticket.ts', 'ts'],
  ['src/application/tickets/ports/TicketGateway.ts', 'ts'],
  ['src/application/tickets/use-cases/createTicket.ts', 'ts'],
  ['src/infrastructure/tickets/HttpTicketGateway.ts', 'ts'],
  ['src/presentation/features/tickets/model/useTickets.ts', 'tsx'],
]

function extractExample(document, filename, language) {
  const from = document.indexOf('## 3. Physical ownership')
  assert.ok(from >= 0, 'missing example section')
  const marker = '`' + filename + '`'
  const start = document.indexOf(marker, from)
  assert.ok(start >= 0, 'missing path: ' + filename)

  const open = '```' + language + '\n'
  const fence = document.indexOf(open, start)
  const nextSection = document.indexOf('\n### ', start)
  assert.ok(fence >= 0 && (nextSection < 0 || fence < nextSection), 'missing matching code fence: ' + filename)
  const first = fence + open.length
  const last = document.indexOf('\n```', first)
  assert.ok(last >= 0, 'missing closing fence: ' + filename)
  return document.slice(first, last) + '\n'
}

test('frontend ticket walkthrough typechecks and preserves the domain/DTO boundary', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ticket-guide-'))
  try {
    const content = fs.readFileSync(guide, 'utf8')
    const files = []
    const samples = new Map()
    fs.writeFileSync(path.join(root, 'package.json'), '{"type":"module"}')

    for (const [name, language] of modules) {
      const code = extractExample(content, name, language)
      const target = path.join(root, name)
      assert.ok(target.startsWith(root + path.sep))
      fs.mkdirSync(path.dirname(target), { recursive: true })
      fs.writeFileSync(target, code)
      files.push(target)
      samples.set(name, code)
    }

    // React is deliberately outside the documented application and domain
    // example. A minimal declaration lets us typecheck the illustrative hook
    // without adding the React runtime to this documentation-only repository.
    const reactTypes = path.join(root, 'react.d.ts')
    fs.writeFileSync(reactTypes, "declare module 'react' {\n" +
      '  export function useState<S>(initial: S | (() => S)): ' +
      '[S, (next: S | ((previous: S) => S)) => void]\n' +
      '}\n')
    // The guide also shows a status-to-label mapping that intentionally
    // stays in Presentation while deriving its keys from the Application result.
    const excerptMarker = '// Presentation excerpt, using the Application-owned CreateTicket type.'
    const excerptAt = content.indexOf(excerptMarker)
    assert.ok(excerptAt >= 0, 'missing exhaustive presentation status mapping')
    const opener = '```ts\n'
    const excerptOpen = content.lastIndexOf(opener, excerptAt)
    const excerptEnd = content.indexOf('\n```', excerptAt)
    assert.ok(excerptOpen >= 0 && excerptEnd > excerptAt, 'malformed status mapping snippet')
    const statusFile = path.join(root, 'src/presentation/tickets/status-labels.ts')
    fs.mkdirSync(path.dirname(statusFile), { recursive: true })
    fs.writeFileSync(statusFile,
      "import type { CreateTicket } from '../../application/tickets/use-cases/createTicket'\n" +
      content.slice(excerptOpen + opener.length, excerptEnd) + '\n')

    const compilerOptions = {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      strict: true,
      noEmit: true,
      types: [],
      skipLibCheck: true,
    }
    const inputs = [...files, reactTypes, statusFile]
    const program = ts.createProgram(inputs, compilerOptions)
    const diagnostics = ts.getPreEmitDiagnostics(program)
    assert.equal(diagnostics.length, 0, ts.formatDiagnostics(diagnostics, {
      getCanonicalFileName: name => name,
      getCurrentDirectory: () => root,
      getNewLine: () => '\n',
    }))

    // A plausible business change must force the UI to choose a label,
    // while the HTTP adapter retains the same domain-owned guard.
    const domainFile = path.join(root, 'src/domain/tickets/Ticket.ts')
    const originalDomain = fs.readFileSync(domainFile, 'utf8')
    const evolvedDomain = originalDomain.replace(
      "'resolved'] as const", "'resolved', 'reopened'] as const")
    assert.notEqual(evolvedDomain, originalDomain, 'fixture must add a genuine domain state')
    fs.writeFileSync(domainFile, evolvedDomain)
    try {
      const evolvedDiagnostics = ts.getPreEmitDiagnostics(ts.createProgram(inputs, compilerOptions))
      assert.ok(evolvedDiagnostics.some(d => d.file?.fileName === statusFile),
        'new domain status must require an intentional UI label')
    } finally {
      fs.writeFileSync(domainFile, originalDomain)
    }

    // Emit the documented TypeScript to JS for behavior checks. Relative
    // imports in the documentation are bundler-style, so append .js to the
    // emitted imports rather than modifying or weakening the original source.
    for (const [name, source] of samples) {
      const js = ts.transpileModule(source, {
        fileName: name,
        compilerOptions: {
          target: ts.ScriptTarget.ES2022,
          module: ts.ModuleKind.ESNext,
        },
      }).outputText.replace(/(from\s+['"])(\.[^'"]+)(['"])/g,
        (_full, before, imported, after) => before + imported + '.js' + after)
      fs.writeFileSync(path.join(root, name.replace(/\.ts$/, '.js')), js)
    }

    const load = name => import(pathToFileURL(path.join(root, name)).href)
    const domain = await load('src/domain/tickets/Ticket.js')
    const { makeCreateTicket } = await load('src/application/tickets/use-cases/createTicket.js')
    const { HttpTicketGateway } = await load('src/infrastructure/tickets/HttpTicketGateway.js')

    assert.deepEqual([...domain.TICKET_STATUSES], ['open', 'in_progress', 'resolved'])
    for (const valid of domain.TICKET_STATUSES) assert.equal(domain.isTicketStatus(valid), true)
    for (const invalid of ['queued', 23, null, false, ['open'], { toString: () => 'open' }]) {
      assert.equal(domain.isTicketStatus(invalid), false, 'status must not be coerced')
    }
    assert.equal(domain.isTicketSubject(' Valid '), true)
    assert.equal(domain.isTicketSubject('   '), false)
    assert.equal(domain.normalizeTicketSubject('  Valid subject  '), 'Valid subject')
    assert.throws(() => domain.normalizeTicketSubject('   '), /Subject is required/)

    const calls = []
    const http = new HttpTicketGateway(async (url, init) => {
      calls.push({ url, init })
      return {
        ok: true,
        json: async () => ({
          ticket_id: 'T-001',
          subject: '  Server subject  ',
          status: 'open',
        }),
      }
    })
    const createTicket = makeCreateTicket(http)
    const ticket = await createTicket({
      subject: '  Created subject  ',
      description: 'A problem',
    })
    assert.deepEqual(ticket, {
      id: 'T-001',
      subject: 'Server subject',
      status: 'open',
    })
    assert.equal(calls[0].url, '/api/tickets')
    assert.equal(calls[0].init.method, 'POST')
    assert.deepEqual(JSON.parse(calls[0].init.body), {
      subject: 'Created subject',
      description: 'A problem',
    })
    assert.throws(() => createTicket({ subject: '   ', description: 'A problem' }),
      /Subject is required/)
    assert.equal(calls.length, 1, 'invalid subject must not trigger HTTP')

    for (const status of domain.TICKET_STATUSES) {
      const gateway = new HttpTicketGateway(async () => ({
        ok: true,
        json: async () => ({ ticket_id: 'T-002', subject: 'Valid', status }),
      }))
      assert.equal((await gateway.create({ subject: 'Valid', description: '' })).status, status)
    }

    const invalidPayloads = [
      null, [], {},
      { ticket_id: 7, subject: 'Valid', status: 'open' },
      { ticket_id: 'T-002', subject: '   ', status: 'open' },
      { ticket_id: 'T-002', subject: 'Valid', status: 'queued' },
      { ticket_id: 'T-002', subject: 'Valid', status: 7 },
      { ticket_id: 'T-002', subject: 'Valid', status: { toString: () => 'open' } },
    ]
    for (const payload of invalidPayloads) {
      const gateway = new HttpTicketGateway(async () => ({
        ok: true,
        json: async () => payload,
      }))
      await assert.rejects(gateway.create({ subject: 'Valid', description: '' }),
        /Invalid ticket response/)
    }
    const unavailable = new HttpTicketGateway(async () => ({ ok: false }))
    await assert.rejects(unavailable.create({ subject: 'Valid', description: '' }),
      /Ticket creation unavailable/)

    // Only the domain declares values and their predicate; the adapter
    // imports the predicate instead of keeping a second list of statuses.
    assert.match(samples.get('src/domain/tickets/Ticket.ts'), /export const TICKET_STATUSES =/)
    assert.match(samples.get('src/infrastructure/tickets/HttpTicketGateway.ts'), /isTicketStatus\(dto\.status\)/)
    assert.doesNotMatch(samples.get('src/infrastructure/tickets/HttpTicketGateway.ts'),
      /status\s*!==\s*['"]open['"]|\[['"]open['"],\s*['"]in_progress['"]/)
  } finally {
    assert.equal(path.dirname(root), os.tmpdir())
    assert.ok(path.basename(root).startsWith('ticket-guide-'))
    fs.rmSync(root, { recursive: true, force: true })
  }
})
