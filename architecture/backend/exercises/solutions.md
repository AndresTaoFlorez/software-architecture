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

CLI parsing and feedback belong to [Presentation](../../../GLOSSARY.md#presentation-layer). Reuse the existing creation operation and Ticket rule; do not import the HTTP parser.

```ts
// src/presentation/cli/tickets/parsers/parseCreateTicketArgs.ts
import { parseArgs } from 'node:util'
import type { CreateTicketCommand } from '@/application/tickets'

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
```

```ts
// src/presentation/cli/tickets/dto/CliFeedback.ts
export interface CliFeedback { code: 0 | 1 | 2; message: string }
```

```ts
// src/presentation/cli/tickets/handlers/createTicketCli.ts
import type { CreateTicket, CreateTicketCommand } from '@/application/tickets'
import { InvalidCliInput, parseCreateTicketArgs } from '../parsers/parseCreateTicketArgs'
import type { CliFeedback } from '../dto/CliFeedback'

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
import { createTicketCli } from '@/presentation/cli/tickets/handlers/createTicketCli'

export async function main(args: readonly string[]) {
  const create = new CreateTicket(new InMemoryTicketRepository(), randomUUID)
  return createTicketCli(args, create)
}
```

A Node entry invokes `main(process.argv.slice(2))`, prints the message and sets `process.exitCode`. Those process calls are omitted from this testable assembly. Memory lasts only for the process. Unexpected defects propagate to the entry's error handling.

**Exercise.** [B-I2](intermediate.md#b-i2--create-from-a-cli)

## B-I3 — Read an agenda

[Application](../../../GLOSSARY.md#application-layer) owns the read contract and operation. HTTP [Presentation](../../../GLOSSARY.md#presentation-layer) owns query syntax and the response representation. Each listing below names its physical file.

```ts
// src/application/scheduling/contracts/AgendaItem.ts
export interface AgendaItem { id: string; startsAt: string }
```

```ts
// src/application/scheduling/ports/AgendaReader.ts
import type { AgendaItem } from '../contracts/AgendaItem'

export class AgendaReadUnavailable extends Error {}
export interface AgendaReader {
  read(day: string): Promise<readonly AgendaItem[]>
}
```

The known read failure belongs to `application/scheduling/ports/AgendaReader.ts`: it is part of the interaction promised by that contract, not a database-specific error.

```ts
// src/application/scheduling/use-cases/GetAgenda.ts
import type { AgendaItem } from '../contracts/AgendaItem'
import type { AgendaReader } from '../ports/AgendaReader'

export class GetAgenda {
  constructor(private readonly reader: AgendaReader) {}
  execute(day: string): Promise<readonly AgendaItem[]> { return this.reader.read(day) }
}
```

```ts
// src/presentation/http/scheduling/dto/AgendaQueryDto.ts
export interface AgendaQueryDto { day: string }
```

```ts
// src/presentation/http/scheduling/dto/AgendaResponseDto.ts
export interface AgendaResponseDto {
  appointments: readonly { id: string; startsAt: string }[]
}
```

```ts
// src/presentation/http/scheduling/parsers/parseAgendaQuery.ts
import type { AgendaQueryDto } from '../dto/AgendaQueryDto'

export class InvalidAgendaQuery extends Error {}
export function parseAgendaQuery(value: unknown): AgendaQueryDto {
  if (typeof value !== 'object' || value === null || Array.isArray(value) || !('day' in value) ||
      typeof value.day !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value.day)) {
    throw new InvalidAgendaQuery()
  }
  const date = new Date(value.day + 'T00:00:00Z')
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value.day) {
    throw new InvalidAgendaQuery()
  }
  return { day: value.day }
}
```

```ts
// src/presentation/http/scheduling/mappers/mapAgendaResponse.ts
import type { AgendaItem } from '@/application/scheduling/contracts/AgendaItem'
import type { AgendaResponseDto } from '../dto/AgendaResponseDto'

export function mapAgendaResponse(items: readonly AgendaItem[]): AgendaResponseDto {
  return { appointments: items.map(item => ({ id: item.id, startsAt: item.startsAt })) }
}
```

```ts
// src/presentation/http/scheduling/handlers/agendaHttp.ts
import { AgendaReadUnavailable } from '@/application/scheduling/ports/AgendaReader'
import type { GetAgenda } from '@/application/scheduling/use-cases/GetAgenda'
import { InvalidAgendaQuery, parseAgendaQuery } from '../parsers/parseAgendaQuery'
import { mapAgendaResponse } from '../mappers/mapAgendaResponse'

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
// src/infrastructure/persistence/scheduling/adapters/PrismaAgendaReader.ts
import { AgendaReadUnavailable, type AgendaReader } from '@/application/scheduling/ports/AgendaReader'

// Driver-shaped abstraction for this excerpt, not a generated Prisma client.
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

Composition wires the modules above with a supplied database abstraction:

```ts
// src/composition/scheduling/createAgendaHttp.ts
import { GetAgenda } from '@/application/scheduling/use-cases/GetAgenda'
import { PrismaAgendaReader, type AgendaDatabase } from '@/infrastructure/persistence/scheduling/adapters/PrismaAgendaReader'
import { agendaHttp } from '@/presentation/http/scheduling/handlers/agendaHttp'

export function createAgendaHttp(db: AgendaDatabase) {
  const getAgenda = new GetAgenda(new PrismaAgendaReader(db))
  return (query: unknown) => agendaHttp(query, getAgenda)
}
```

The handler parses before calling the operation: invalid day returns 400 without querying; valid rows map to a 200 response; a known unavailable read becomes 503. Unknown defects propagate. The stored cause stays internal. The query implementation and Nest bindings are omitted; testing this abstraction does not establish a real Prisma integration or its day-filter meaning.

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
// src/application/billing/use-cases/BillingTickets.ts
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

Extend the existing `domain/tickets/Ticket.ts`, rather than introducing another Ticket entity. Replace its `TicketData` and `Ticket` declarations with the following; keep the [canonical status vocabulary, guards and subject normalizer](../2-typescript-first-boundaries.md#decide-what-a-valid-ticket-means-in-one-place) unchanged. This is the assignment exercise's extension of that module, not a second model alongside it.

```ts
// Replacement declarations in src/domain/tickets/Ticket.ts
export interface TicketData {
  readonly id: string
  readonly subject: string
  readonly description: string
  readonly status: TicketStatus
  readonly assignedTo: string | null
}

export class Ticket {
  #data: TicketData
  private constructor(data: TicketData) { this.#data = Object.freeze({ ...data }) }

  static create(id: string, subject: string, description: string): Ticket {
    if (!id.trim()) throw new Error('Expected a generated identity')
    return new Ticket({ id, subject: normalizeTicketSubject(subject), description,
      status: INITIAL_TICKET_STATUS, assignedTo: null })
  }

  static restore(data: TicketData): Ticket {
    if (!data.id.trim() || !isTicketStatus(data.status) ||
        (data.assignedTo !== null && !data.assignedTo.trim())) {
      throw new Error('Invalid stored ticket')
    }
    return new Ticket({ ...data, subject: normalizeTicketSubject(data.subject) })
  }

  assign(analystId: string): boolean {
    if (this.#data.status === 'resolved') return false
    if (!analystId.trim()) throw new Error('Invalid analyst identity')
    this.#data = Object.freeze({ ...this.#data, assignedTo: analystId })
    return true
  }

  snapshot(): TicketData { return { ...this.#data } }
}
```

The storage reader checks its external row shape and restores this same Ticket, preserving its saved status. The workflow also needs the required skill from Support's classification of that ticket and the analyst's facts. Those supplied facts feed the [canonical assignment policy](../../foundations/domain-modeling/README.md); they are not another entity representation.

```ts
// src/application/tickets/ports/AssignmentFactsReader.ts
import type { Ticket } from '@/domain/tickets/Ticket'
import type { AnalystFacts } from '@/domain/tickets/services/TicketAssignmentPolicy'

export interface AssignmentFactsReader {
  ticket(id: string): Promise<{ ticket: Ticket; requiredSkill: string } | null>
  analyst(id: string): Promise<AnalystFacts | null>
}
```

```ts
// src/application/tickets/ports/AssignmentWriter.ts
import type { Ticket } from '@/domain/tickets/Ticket'

export interface AssignmentWriter { save(ticket: Ticket): Promise<void> }
```

```ts
// src/application/tickets/contracts/AssignResult.ts
export type AssignResult =
  | { ok: true }
  | { ok: false; reason: 'not-found' | 'resolved' | 'missing-skill' | 'supervisor-required' }
```

```ts
// src/application/tickets/use-cases/AssignTicket.ts
import { decideAssignment } from '@/domain/tickets/services/TicketAssignmentPolicy'
import type { AssignmentFactsReader } from '../ports/AssignmentFactsReader'
import type { AssignmentWriter } from '../ports/AssignmentWriter'
import type { AssignResult } from '../contracts/AssignResult'

export class AssignTicket {
  constructor(
    private readonly facts: AssignmentFactsReader,
    private readonly writer: AssignmentWriter,
  ) {}
  async execute(ticketId: string, analystId: string, escalation: boolean): Promise<AssignResult> {
    const loaded = await this.facts.ticket(ticketId)
    const analyst = await this.facts.analyst(analystId)
    if (!loaded || !analyst) return { ok: false, reason: 'not-found' }
    const decision = decideAssignment({ requiredSkill: loaded.requiredSkill, escalation }, analyst)
    if (!decision.allowed) return { ok: false, reason: decision.reason }
    if (!loaded.ticket.assign(analystId)) return { ok: false, reason: 'resolved' }
    await this.writer.save(loaded.ticket)
    return { ok: true }
  }
}
```

Ticket rejects assignment after resolution; the [Domain](../../../GLOSSARY.md#domain) policy decides skill and supervisor eligibility; [Application](../../../GLOSSARY.md#application-layer) obtains facts and saves an accepted change. If several rules fail, this workflow reports the policy rejection first. The update writer remains separate from creation's insert-only `TicketRepository`. HTTP parsing and storage implementations are omitted.

**Exercise.** [B-A3](advanced.md#b-a3--assignment-and-escalation)

[Exercise route](README.md)
