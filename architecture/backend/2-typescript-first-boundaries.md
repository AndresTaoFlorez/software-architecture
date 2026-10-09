<a id="2-typescript-first-boundaries"></a>

# TypeScript-First Boundaries

[HTTP path](1-http-request-to-business-operation.md) · [Backend route](README.md) · Next: [Nest building blocks](3-nestjs-building-blocks.md)

The server must reject malformed input, apply the ticket rule and wait for saving. Build those steps with ordinary TypeScript so you can see their responsibilities before adding a framework.

**Contents**

- [Check what arrived before trusting its type](#check-what-arrived-before-trusting-its-type)
- [Decide what a valid ticket means in one place](#decide-what-a-valid-ticket-means-in-one-place)
- [Save without naming a database in the operation](#save-without-naming-a-database-in-the-operation)
- [Start with memory and explicit construction](#start-with-memory-and-explicit-construction)
- [What a library will remove](#what-a-library-will-remove)
  - [Next operation: reading an agenda](#next-operation-reading-an-agenda)
- [Check the boundary](#check-the-boundary)
- [Sources](#sources)

<a id="1-check-what-arrived-before-trusting-its-type"></a>

## Check what arrived before trusting its type

Another caller can send `null`, an array or `{ subject: 17 }`. Treat decoded input as `unknown` and check it before accessing fields. A plain **[Parser](../../GLOSSARY.md#parser)** returns an accepted representation or reports failure.

The HTTP representation is a **[DTO](../../GLOSSARY.md#data-transfer-object-dto)**, a data transfer object. A type assertion such as `body as CreateTicketRequestDto` changes the compiler's assumption and performs no runtime validation.


`src/presentation/http/tickets/dto/CreateTicketRequestDto.ts`:

```ts
export interface CreateTicketRequestDto {
  subject: string
  description: string
}
```


`src/presentation/http/tickets/parsers/parseCreateTicketRequest.ts`:

```ts
import type { CreateTicketRequestDto } from '../dto/CreateTicketRequestDto'

export class InvalidTicketRequest extends Error {}
export function parseCreateTicketRequest(body: unknown): CreateTicketRequestDto {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    throw new InvalidTicketRequest('Expected an object')
  }
  if (!('subject' in body) || typeof body.subject !== 'string' ||
      !('description' in body) || typeof body.description !== 'string') {
    throw new InvalidTicketRequest('Expected subject and description strings')
  }
  if ('id' in body || 'status' in body) {
    throw new InvalidTicketRequest('Identity and initial state are server-owned')
  }
  return { subject: body.subject, description: body.description }
}
```

The checks establish the object/string shape. Returning a new object selects accepted fields; this API forbids client-controlled identity/state and ignores other extras. The parser leaves subject validity to [Domain](../../GLOSSARY.md#domain).

<a id="2-decide-what-a-valid-ticket-means-in-one-place"></a>

## Decide what a valid ticket means in one place

Support requires a trimmed nonblank subject of at most 160 JavaScript string units, and new tickets start `open`. These are **[business rules](../../GLOSSARY.md#business-rule)**. `Ticket` enforces them regardless of the caller.


`src/domain/tickets/Ticket.ts`:

```ts
export const TICKET_STATUSES = ['open', 'in_progress', 'resolved'] as const
export type TicketStatus = (typeof TICKET_STATUSES)[number]
export const INITIAL_TICKET_STATUS: TicketStatus = 'open'

export function isTicketStatus(value: unknown): value is TicketStatus {
  return TICKET_STATUSES.some(status => status === value)
}

export class InvalidTicketSubject extends Error {}

export function normalizeTicketSubject(value: unknown): string {
  if (typeof value !== 'string') throw new InvalidTicketSubject()
  const subject = value.trim()
  if (subject.length === 0 || subject.length > 160) {
    throw new InvalidTicketSubject()
  }
  return subject
}

export interface TicketData {
  readonly id: string
  readonly subject: string
  readonly description: string
  readonly status: TicketStatus
}

export class Ticket {
  readonly #data: TicketData
  private constructor(data: TicketData) { this.#data = Object.freeze(data) }

  static create(id: string, subject: string, description: string): Ticket {
    if (id.trim().length === 0) throw new Error('Expected a generated identity')
    return new Ticket({
      id,
      subject: normalizeTicketSubject(subject),
      description,
      status: INITIAL_TICKET_STATUS,
    })
  }

  snapshot(): TicketData { return { ...this.#data } }
}
```

`TICKET_STATUSES` defines membership; `INITIAL_TICKET_STATUS` defines creation. Reordering the list must not change the initial state. A future transition needs its own behavior, rather than another vocabulary list.

The private data protects the entity from changes to a returned snapshot. Future loading needs a restoration operation preserving stored status; this creation example does not implement retrieval.

<a id="3-save-without-naming-a-database-in-the-operation"></a>

## Save without naming a database in the operation

Creation needs `insert(ticket)` to complete before reporting success. `TicketRepository` defines that persistence requirement; the supplied implementation decides how to fulfill it.

A **[Repository](../patterns/persistence/repository/README.md)** presents stored business objects in collection-like terms. This narrow write contract belongs to [Application](../../GLOSSARY.md#application-layer) because creation requires it. The general guide distinguishes the pattern from a database client or another required interaction.


`src/application/tickets/ports/TicketRepository.ts`:

```ts
import type { Ticket } from '@/domain/tickets/Ticket'

export class TicketPersistenceUnavailable extends Error {}

export interface TicketRepository {
  // Resolve only after accepting the insert. No upsert/overwrite.
  insert(ticket: Ticket): Promise<void>
}
```

The command/result describe the operation independently of HTTP:


`src/application/tickets/contracts/CreateTicketCommand.ts`:

```ts
export interface CreateTicketCommand {
  subject: string
  description: string
}
```


`src/application/tickets/contracts/CreateTicketResult.ts`:

```ts
import type { TicketData } from '@/domain/tickets/Ticket'

export type CreateTicketResult =
  | { ok: true; ticket: TicketData }
  | { ok: false; reason: 'invalid-subject' | 'unavailable' }
```


`src/application/tickets/use-cases/CreateTicket.ts`:

```ts
import { Ticket, InvalidTicketSubject } from '@/domain/tickets/Ticket'
import { TicketPersistenceUnavailable, type TicketRepository } from '../ports/TicketRepository'
import type { CreateTicketCommand } from '../contracts/CreateTicketCommand'
import type { CreateTicketResult } from '../contracts/CreateTicketResult'

export class CreateTicket {
  constructor(
    private readonly tickets: TicketRepository,
    private readonly makeId: () => string,
  ) {}

  async execute(command: CreateTicketCommand): Promise<CreateTicketResult> {
    try {
      const ticket = Ticket.create(this.makeId(), command.subject, command.description)
      await this.tickets.insert(ticket)
      return { ok: true, ticket: ticket.snapshot() }
    } catch (error) {
      if (error instanceof InvalidTicketSubject) return { ok: false, reason: 'invalid-subject' }
      if (error instanceof TicketPersistenceUnavailable) return { ok: false, reason: 'unavailable' }
      throw error // unknown defects are not normal business outcomes
    }
  }
}
```

The operation delegates validity to `Ticket`, awaits persistence and translates recognized failure. Unexpected errors propagate. The ID function permits deterministic examples; production assembly can supply an established UUID generator.

Tickets exposes its supported operation through one entry:


`src/application/tickets/index.ts`:

```ts
export { CreateTicket } from './use-cases/CreateTicket'
export type { CreateTicketCommand } from './contracts/CreateTicketCommand'
export type { CreateTicketResult } from './contracts/CreateTicketResult'
```

[Module Boundaries and Public APIs](../foundations/module-boundaries-and-public-apis.md) explains source exports and capability privacy.

<a id="4-start-with-memory-and-explicit-construction"></a>

## Start with memory and explicit construction

`InMemoryTicketRepository` implements the same contract using process memory. It supports learning and isolated application checks; its records disappear when the process ends.


`src/infrastructure/persistence/tickets/adapters/InMemoryTicketRepository.ts`:

```ts
import type { Ticket, TicketData } from '@/domain/tickets/Ticket'
import type { TicketRepository } from '@/application/tickets/ports/TicketRepository'

export class InMemoryTicketRepository implements TicketRepository {
  readonly records = new Map<string, TicketData>()
  async insert(ticket: Ticket): Promise<void> {
    const data = ticket.snapshot()
    if (this.records.has(data.id)) throw new Error('Duplicate generated identity')
    this.records.set(data.id, data)
  }
}
```

HTTP selects response fields and invokes the operation:


`src/presentation/http/tickets/dto/TicketResponseDto.ts`:

```ts
import type { CreateTicketResult } from '@/application/tickets'

type CreatedTicket = Extract<CreateTicketResult, { ok: true }>['ticket']
export interface TicketResponseDto {
  ticket_id: string
  subject: string
  description: string
  status: CreatedTicket['status']
}
```


`src/presentation/http/tickets/mappers/mapCreateTicketResponse.ts`:

```ts
import type { CreateTicketResult } from '@/application/tickets'
import type { TicketResponseDto } from '../dto/TicketResponseDto'

export function mapCreateTicketResponse(
  ticket: Extract<CreateTicketResult, { ok: true }>['ticket'],
): TicketResponseDto {
  return {
    ticket_id: ticket.id, subject: ticket.subject,
    description: ticket.description, status: ticket.status,
  }
}
```


`src/presentation/http/tickets/handlers/TicketHttpHandler.ts`:

```ts
import type { CreateTicket } from '@/application/tickets'
import { InvalidTicketRequest, parseCreateTicketRequest } from '../parsers/parseCreateTicketRequest'
import { mapCreateTicketResponse } from '../mappers/mapCreateTicketResponse'

export class TicketHttpHandler {
  constructor(private readonly createTicket: CreateTicket) {}

  async handle(body: unknown): Promise<{ status: number; body: unknown }> {
    try {
      const result = await this.createTicket.execute(parseCreateTicketRequest(body))
      if (!result.ok) {
        return {
          status: result.reason === 'invalid-subject' ? 400 : 503,
          body: { error: result.reason },
        }
      }
      return { status: 201, body: mapCreateTicketResponse(result.ticket) }
    } catch (error) {
      if (error instanceof InvalidTicketRequest) {
        return { status: 400, body: { error: 'invalid-request' } }
      }
      throw error // server glue supplies safe 500 handling and internal logging
    }
  }
}
```

Assembly excerpt, using the modules above:

```ts
const repository = new InMemoryTicketRepository()
const createTicket = new CreateTicket(repository, () => 'T-42')
const httpHandler = new TicketHttpHandler(createTicket)
const response = await httpHandler.handle({
  subject: 'Invoice download fails',
  description: 'The PDF button returns an error.',
})
```

**DI** answers how an object receives a dependency: here, a constructor argument. **DIP** constrains which direction its source code depends. Injecting a Prisma object would still be DI if `CreateTicket` imported Prisma directly, but would violate the intended inward boundary.

Composition selects concrete objects. The fixed ID serves this one demonstration call; repeated creation requires fresh IDs.

<a id="register-the-route-with-nodejs"></a>
<a id="check-access-before-processing-the-argument"></a>

<a id="5-what-a-library-will-remove"></a>

## What a library will remove

A server framework registers handlers, a Pipe applies argument parsing, and a container replaces repeated construction. [Chapter 3](3-nestjs-building-blocks.md) owns those Nest mechanisms.


### Next operation: reading an agenda

For this small boundary exercise, a receptionist requests `GET /agenda?day=2026-10-07`. It is a teaching-only route, **not** the public dental clinic contract defined in [API Design](../api-design/resources-and-operations.md#resources-and-relationships), which uses `GET /v1/appointments?date=...`. A **query [Parser](../../GLOSSARY.md#parser)** checks unknown HTTP query data and produces `AgendaQueryDto`. `GetAgenda` coordinates reading that day through an application-owned `AgendaReader` contract.

`PrismaAgendaReader` implements the read and translates records into `AgendaItem` values. The HTTP handler maps them into `AgendaResponseDto`. The [B-I3 solution](exercises/solutions.md#b-i3--read-an-agenda) shows each owned file. The same ownership rules apply to a read; no business entity is required solely to return a list.

A CLI instead checks command-line options in its own Parser, invokes an existing operation, and maps its result into messages and exit codes. Sharing the operation keeps delivery syntax separate.

<a id="6-check-the-boundary"></a>

## Check the boundary

In an application, check invalid input, initial state, no save after business rejection, awaited persistence and result translation. Memory isolates the workflow; an actual database integration checks persistence behavior.

[Exercises](exercises/README.md) ask you to change the rule and add another caller.

## Sources

- [TypeScript — Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- [TypeScript — Assertions](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#type-assertions)
- [Fowler — Repository](https://martinfowler.com/eaaCatalog/repository.html)
- [Seemann — Composition Root](https://blog.ploeh.dk/2011/07/28/CompositionRoot/)

[Previous: HTTP Request to Business Operation](1-http-request-to-business-operation.md) · [Next: Backend: From a Request to a Ticket](README.md)
