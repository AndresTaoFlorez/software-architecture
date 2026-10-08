# Backend Exercise Solutions

Source paths below are relative to an application's `src/`. Imports reuse canonical guide modules. The intermediate and advanced answers show concrete changed code; framework bindings are identified where omitted.

**Contents**

- [B-E1 — Trace the request](#b-e1--trace-the-request)
- [B-E2 — Contract and implementations](#b-e2--contract-and-implementations)
- [B-E3 — Place HTTP files](#b-e3--place-http-files)
- [B-I1 — Change one business rule](#b-i1--change-one-business-rule)
- [B-I2 — Create from a CLI](#b-i2--create-from-a-cli)
- [B-I3 — Read an agenda](#b-i3--read-an-agenda)
- [B-A1 — Split a God Controller](#b-a1--split-a-god-controller)
- [B-A2 — Remove a deep import](#b-a2--remove-a-deep-import)
- [B-A3 — Assignment and escalation](#b-a3--assignment-and-escalation)

## B-E1 — Trace the request

**Answer.** POST /tickets is the endpoint; its route maps to TicketsController.create(), the handler grouped by the Controller. The Guard checks access, the Pipe invokes the [Parser](../../../GLOSSARY.md#parser), CreateTicket coordinates, and Ticket owns validity.

**Why / exact owner.** HTTP invocation: [Presentation](../../../GLOSSARY.md#presentation-layer). Workflow: [Application](../../../GLOSSARY.md#application-layer). Ticket rules: [Domain](../../../GLOSSARY.md#domain).

**Exact files.** presentation/http/tickets/controllers/TicketsController.ts; presentation/http/tickets/guards/AuthenticatedGuard.ts; presentation/http/tickets/pipes/CreateTicketPipe.ts; presentation/http/tickets/parsers/parseCreateTicketRequest.ts; application/tickets/use-cases/CreateTicket.ts; domain/tickets/Ticket.ts.

**References.** [Relevant guide](../3-nestjs-building-blocks.md) · [Exercise](easy.md#b-e1--trace-the-request).

## B-E2 — Contract and implementations

**Answer.** TicketRepository describes insert(ticket). The memory class stores snapshots in its process; the Prisma class maps fields and writes through its client. Composition chooses one implementation.

**Why / exact owner.** [Application](../../../GLOSSARY.md#application-layer) owns the requirement, [Infrastructure](../../../GLOSSARY.md#infrastructure) its fulfillment, Composition its selection.

**Exact files.** application/tickets/ports/TicketRepository.ts; infrastructure/persistence/tickets/adapters/InMemoryTicketRepository.ts; infrastructure/persistence/tickets/adapters/PrismaTicketRepository.ts; composition/modules/TicketsModule.ts.

**References.** [Relevant guide](../2-typescript-first-boundaries.md) · [Exercise](easy.md#b-e2--contract-and-implementations).

## B-E3 — Place HTTP files

**Answer.** Use controllers/, guards/, pipes/, parsers/, dto/ and mappers/ respectively; both request and response DTOs belong in dto/.

**Why / exact owner.** [Presentation](../../../GLOSSARY.md#presentation-layer) owns incoming HTTP representations and translation.

**Exact files.** presentation/http/tickets/controllers/TicketsController.ts; presentation/http/tickets/guards/AuthenticatedGuard.ts; presentation/http/tickets/pipes/CreateTicketPipe.ts; presentation/http/tickets/parsers/parseCreateTicketRequest.ts; presentation/http/tickets/dto/CreateTicketRequestDto.ts; presentation/http/tickets/dto/TicketResponseDto.ts; presentation/http/tickets/mappers/mapCreateTicketResponse.ts.

**References.** [Relevant guide](../4-create-ticket-with-nestjs.md) · [Exercise](easy.md#b-e3--place-http-files).

## B-I1 — Change one business rule

Change only these declarations and the existing bound in `domain/tickets/Ticket.ts`; keep the canonical `Ticket` class and guards. JavaScript string length measures UTF-16 code units.

```ts
// Replacement declarations in src/domain/tickets/Ticket.ts
export const TICKET_STATUSES = ['resolved', 'reopened', 'open', 'in_progress'] as const
export type TicketStatus = (typeof TICKET_STATUSES)[number]
export const INITIAL_TICKET_STATUS: TicketStatus = 'open'

// Keep the existing InvalidTicketSubject declaration.
export function normalizeTicketSubject(value: unknown): string {
  if (typeof value !== 'string') throw new InvalidTicketSubject()
  const subject = value.trim()
  if (subject.length === 0 || subject.length > 100) throw new InvalidTicketSubject()
  return subject
}
```

`Ticket.create` continues calling the existing normalizer and initial-state constant. Reordering demonstrates that vocabulary order owns no creation rule. HTTP/CLI retain their shape checks.

Verify 100 and 101 units, blank input, `isTicketStatus('reopened')` and the literal `open` result. The exercise changes this temporary variant, not the handbook's canonical 160-unit requirement.

**Exercise.** [B-I1](intermediate.md#b-i1--change-one-business-rule)

## B-I2 — Create from a CLI

CLI syntax and feedback belong to [Presentation](../../../GLOSSARY.md#presentation-layer). The same [Application](../../../GLOSSARY.md#application-layer) operation and [Domain](../../../GLOSSARY.md#domain) rule are reused.

```ts
// src/presentation/cli/tickets/createTicketCli.ts
import { parseArgs } from 'node:util'
import type { CreateTicket, CreateTicketCommand } from '@/application/tickets'

export class InvalidCliInput extends Error {}
export function parseCreateTicketArgs(args: readonly string[]): CreateTicketCommand {
  try {
    const { values } = parseArgs({
      args: [...args], strict: true, allowPositionals: false,
      options: { subject: { type: 'string' }, description: { type: 'string' } },
    })
    if (typeof values.subject !== 'string' || typeof values.description !== 'string') {
      throw new InvalidCliInput()
    }
    return { subject: values.subject, description: values.description }
  } catch {
    throw new InvalidCliInput('Use --subject <text> --description <text>')
  }
}
export interface CliFeedback { code: 0 | 1 | 2; message: string }
export async function createTicketCli(
  args: readonly string[],
  create: Pick<CreateTicket, 'execute'>,
): Promise<CliFeedback> {
  let command: CreateTicketCommand
  try { command = parseCreateTicketArgs(args) }
  catch (error) {
    if (error instanceof InvalidCliInput) return { code: 2, message: error.message }
    throw error
  }
  const result = await create.execute(command)
  if (result.ok) return { code: 0, message: 'Created ' + result.ticket.id }
  return result.reason === 'invalid-subject'
    ? { code: 2, message: 'Invalid ticket subject' }
    : { code: 1, message: 'Ticket creation unavailable' }
}
```

```ts
// src/composition/cli/main.ts
import { randomUUID } from 'node:crypto'
import { CreateTicket } from '@/application/tickets'
import { InMemoryTicketRepository } from '@/infrastructure/persistence/tickets/adapters/InMemoryTicketRepository'
import { createTicketCli } from '@/presentation/cli/tickets/createTicketCli'

export async function main(args: readonly string[]) {
  const create = new CreateTicket(new InMemoryTicketRepository(), randomUUID)
  return createTicketCli(args, create)
}
```

A Node entry invokes `main(process.argv.slice(2))`, prints its message and sets `process.exitCode`. Those process calls are omitted from this testable assembly. Memory lasts only for this process; production startup supplies durable storage when required. Unexpected operation defects propagate to the entry's error handling rather than becoming normal business rejection.

**Exercise.** [B-I2](intermediate.md#b-i2--create-from-a-cli)

## B-I3 — Read an agenda

[Application](../../../GLOSSARY.md#application-layer) owns the requested read and its representation; [Presentation](../../../GLOSSARY.md#presentation-layer) owns query syntax and HTTP output. These modules are complete plain TypeScript.

```ts
// src/application/scheduling/Agenda.ts
export interface AgendaItem { id: string; startsAt: string }
export class AgendaReadUnavailable extends Error {}
export interface AgendaReader {
  read(day: string): Promise<readonly AgendaItem[]>
}
export class GetAgenda {
  constructor(private readonly reader: AgendaReader) {}
  execute(day: string): Promise<readonly AgendaItem[]> { return this.reader.read(day) }
}
```

```ts
// src/presentation/http/scheduling/agendaHttp.ts
import { AgendaReadUnavailable, type GetAgenda, type AgendaItem } from '@/application/scheduling/Agenda'

export interface AgendaQueryDto { day: string }
export class InvalidAgendaQuery extends Error {}
export function parseAgendaQuery(value: unknown): AgendaQueryDto {
  if (typeof value !== 'object' || value === null || !('day' in value) ||
      typeof value.day !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value.day)) {
    throw new InvalidAgendaQuery()
  }
  const date = new Date(value.day + 'T00:00:00Z')
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value.day) {
    throw new InvalidAgendaQuery()
  }
  return { day: value.day }
}
export interface AgendaResponseDto { appointments: readonly AgendaItem[] }
export function mapAgendaResponse(items: readonly AgendaItem[]): AgendaResponseDto {
  return { appointments: items.map(item => ({ id: item.id, startsAt: item.startsAt })) }
}
export async function agendaHttp(query: unknown, getAgenda: GetAgenda) {
  let day: string
  try { day = parseAgendaQuery(query).day }
  catch (error) {
    if (error instanceof InvalidAgendaQuery) return { status: 400, body: { error: 'invalid-day' } }
    throw error
  }
  try { return { status: 200, body: mapAgendaResponse(await getAgenda.execute(day)) } }
  catch (error) {
    if (error instanceof AgendaReadUnavailable) return { status: 503, body: { error: 'unavailable' } }
    throw error
  }
}
```

```ts
// src/infrastructure/persistence/scheduling/PrismaAgendaReader.ts
import { AgendaReadUnavailable, type AgendaReader } from '@/application/scheduling/Agenda'

// Driver-shaped seam for the excerpt, not a generated Prisma client type.
export interface AgendaDatabase {
  list(day: string): Promise<readonly { appointment_id: string; start_time: Date }[]>
}
export class PrismaAgendaReader implements AgendaReader {
  constructor(private readonly db: AgendaDatabase) {}
  async read(day: string) {
    let rows: Awaited<ReturnType<AgendaDatabase['list']>>
    try { rows = await this.db.list(day) }
    catch (cause) { throw new AgendaReadUnavailable('Agenda read failed', { cause }) }
    return rows.map(row => ({ id: row.appointment_id, startsAt: row.start_time.toISOString() }))
  }
}
```

Startup constructs `new GetAgenda(new PrismaAgendaReader(db))` and supplies it to the handler. The driver query and Nest decorators are omitted; a real integration implements `list` and verifies its day-filter/time-zone meaning. This example's mapping assumes typed database rows. The stored cause is for internal diagnostics; HTTP returns only the stable failure code.

**Exercise.** [B-I3](intermediate.md#b-i3--read-an-agenda)

## B-A1 — Split a God Controller

Reuse the canonical [Parser](../../../GLOSSARY.md#parser), `Ticket`, `CreateTicket`, repository and `TicketHttpHandler` rather than creating another broad Service. This plain controller excerpt keeps only delivery access and invocation.

```ts
// src/presentation/http/tickets/controllers/RefactoredTicketsController.ts
import { TicketHttpHandler } from '../handlers/TicketHttpHandler'

export interface VerifiedRequest {
  user?: { id: string }
  body: unknown
}
export class RefactoredTicketsController {
  constructor(private readonly handler: TicketHttpHandler) {}
  async create(request: VerifiedRequest) {
    if (!request.user) return { status: 401, body: { error: 'unauthorized' } }
    return this.handler.handle(request.body)
  }
}
```

`user` must come from established authentication middleware; this presence check does not verify credentials. The [Nest Controller/Pipe/Guard](../3-nestjs-building-blocks.md) are the framework bindings for these delivery concerns.

```ts
// src/composition/createTicketDelivery.ts
import { CreateTicket } from '@/application/tickets'
import { InMemoryTicketRepository } from '@/infrastructure/persistence/tickets/adapters/InMemoryTicketRepository'
import { TicketHttpHandler } from '@/presentation/http/tickets/handlers/TicketHttpHandler'
import { RefactoredTicketsController } from '@/presentation/http/tickets/controllers/RefactoredTicketsController'

export function createTicketDelivery(makeId: () => string) {
  const operation = new CreateTicket(new InMemoryTicketRepository(), makeId)
  return new RefactoredTicketsController(new TicketHttpHandler(operation))
}
```

[Domain](../../../GLOSSARY.md#domain) owns subject validity; [Application](../../../GLOSSARY.md#application-layer) awaits saving; [Infrastructure](../../../GLOSSARY.md#infrastructure) owns row mapping; HTTP owns access/result translation; Composition creates objects. Retire the redundant `TicketsService` and copied subject check. The mapper remains the existing plain function.

**Exercise.** [B-A1](advanced.md#b-a1--split-a-god-controller)

## B-A2 — Remove a deep import

The [canonical application entry](../2-typescript-first-boundaries.md) already exports `CreateTicket`, its command and result. Billing consumes that entry and receives the operation:

```ts
// src/application/billing/BillingTickets.ts
import type { CreateTicket, CreateTicketCommand, CreateTicketResult } from '@/application/tickets'

export class BillingTickets {
  constructor(private readonly createTicket: Pick<CreateTicket, 'execute'>) {}
  requestSupport(command: CreateTicketCommand): Promise<CreateTicketResult> {
    return this.createTicket.execute(command)
  }
}
```

Composition supplies the existing operation. In Nest, `TicketsModule` exports the `CreateTicket` provider and a consumer module imports `TicketsModule` before registering its consumer. This container registration is separate from the TypeScript import above.

Do not export private helpers or all storage symbols to make the import pass. TypeScript exports define the supported source entry; Nest metadata controls provider visibility. Enforce private-import rules separately.

**Exercise.** [B-A2](advanced.md#b-a2--remove-a-deep-import)

## B-A3 — Assignment and escalation

The assignment extension reuses Ticket's status vocabulary. It is a focused model for this exercise; it does not copy creation's subject rule. Its stored state is supplied by a reader that checks external data.

```ts
// src/domain/tickets/AssignmentTicket.ts
import { isTicketStatus, type TicketStatus } from './Ticket'

export interface AssignmentTicketState {
  readonly id: string
  readonly status: TicketStatus
  readonly requiredSkill: string
  readonly assignedTo: string | null
}
export class AssignmentTicket {
  #state: AssignmentTicketState
  constructor(state: AssignmentTicketState) {
    if (!state.id.trim() || !state.requiredSkill.trim() || !isTicketStatus(state.status)) {
      throw new Error('Invalid assignment ticket')
    }
    this.#state = { ...state }
  }
  snapshot(): AssignmentTicketState { return { ...this.#state } }
  assign(analystId: string): boolean {
    if (this.#state.status === 'resolved') return false
    if (!analystId.trim()) throw new Error('Invalid analyst identity')
    this.#state = { ...this.#state, assignedTo: analystId }
    return true
  }
}
```

Import `decideAssignment` and `AnalystFacts` from the [canonical policy](../../foundations/domain-modeling/README.md). [Domain](../../../GLOSSARY.md#domain) combines the supplied skill/supervisor facts; [Application](../../../GLOSSARY.md#application-layer) obtains them.

```ts
// src/application/tickets/AssignTicket.ts
import { AssignmentTicket } from '@/domain/tickets/AssignmentTicket'
import { decideAssignment, type AnalystFacts } from '@/domain/tickets/services/TicketAssignmentPolicy'

export interface AssignmentFactsReader {
  ticket(id: string): Promise<AssignmentTicket | null>
  analyst(id: string): Promise<AnalystFacts | null>
}
export interface AssignmentWriter {
  save(ticket: AssignmentTicket): Promise<void>
}
export type AssignResult =
  | { ok: true }
  | { ok: false; reason: 'not-found' | 'resolved' | 'missing-skill' | 'supervisor-required' }

export class AssignTicket {
  constructor(
    private readonly facts: AssignmentFactsReader,
    private readonly writer: AssignmentWriter,
  ) {}
  async execute(ticketId: string, analystId: string, escalation: boolean): Promise<AssignResult> {
    const ticket = await this.facts.ticket(ticketId)
    const analyst = await this.facts.analyst(analystId)
    if (!ticket || !analyst) return { ok: false, reason: 'not-found' }
    const decision = decideAssignment(
      { requiredSkill: ticket.snapshot().requiredSkill, escalation }, analyst,
    )
    if (!decision.allowed) return { ok: false, reason: decision.reason }
    if (!ticket.assign(analystId)) return { ok: false, reason: 'resolved' }
    await this.writer.save(ticket)
    return { ok: true }
  }
}
```

The policy and entity can independently reject assignment; if several rules fail, this workflow reports policy rejection first. HTTP parsing and database implementations are omitted. The assignment writer is purpose-specific: it does not widen creation's insert-only contract to accept a different representation.

This read/decide/save example does not establish concurrent-assignment safety. A real operation requiring that guarantee must specify and implement suitable persistence control.

**Exercise.** [B-A3](advanced.md#b-a3--assignment-and-escalation)

[Exercise route](README.md)
