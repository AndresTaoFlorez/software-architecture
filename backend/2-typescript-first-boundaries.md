# 2. TypeScript-First Boundaries

← [HTTP path](1-http-request-to-business-operation.md) · [Backend path](README.md) · Next: [Nest building blocks](3-nestjs-building-blocks.md)

## 1. Check what arrived before trusting its type

The analyst sends `subject` and `description`. Another caller might send `null`, an array or `{ subject: 17 }`. A JavaScript value can have any of those shapes even if a TypeScript annotation says otherwise. Treat decoded external data as `unknown`: code must establish its shape before accessing it. A **parser** checks data and produces the accepted representation; **type narrowing** is TypeScript recognizing the more specific type established by those checks.

The request's transfer representation is a **[DTO](../GLOSSARY.md#data-transfer-object-dto)** ([data transfer object](../GLOSSARY.md#data-transfer-object-dto)). It carries information across a boundary, rather than ticket methods or authoritative state. A type assertion such as `body as CreateTicketRequestDto` changes what the compiler assumes and performs **no runtime validation**. The types disappear from emitted JavaScript. See [TypeScript narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html) and [type assertions](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#type-assertions).

First name the HTTP request shape separately from the [Application](../GLOSSARY.md#application-layer) command. They currently have matching string fields, so TypeScript permits passing the parsed request to the [use case](../GLOSSARY.md#use-case); that compatibility does not give the two contracts the same owner. An HTTP-only field would stay outside [Application](../GLOSSARY.md#application-layer). File paths below are relative to an illustrative application's `src/`; `@/` means that source root, as [the import convention explains](../conventions/naming-and-file-placement.md#9-source-imports-and-runtime-resolution). These complete plain modules are extracted and tested, not installed as a backend application.

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

`typeof`, the null/array checks and `in` checks are the runtime mechanism. Returning a new object is also **boundary mapping**: it selects the accepted fields instead of forwarding arbitrary client properties inward. Other extra fields are ignored in this API; server-owned `id` and `status` are explicitly forbidden. That is a transport contract choice, not a second status allowlist. The module has no HTTP server dependency and no business subject-length check.

## 2. Decide what a valid ticket means in one place

The support team requires a nonblank subject of at most 160 JavaScript string units after trimming, and a new ticket always starts open. These are illustrative product rules; the limit is not a framework requirement. If the business instead counts grapheme clusters, the owning rule must change deliberately.

These conditions must hold when tickets are created through HTTP, a CLI or a worker. A condition required for valid business state is an **[invariant](../GLOSSARY.md#invariant)**. The owning **[domain entity](../GLOSSARY.md#domain-entity)**, `Ticket`, has a continuing identity and enforces creation rules. Its finite status vocabulary has one source: `TICKET_STATUSES` supplies both the type and the runtime guard. The list records allowed states, not valid transitions; adding `reopened` alone would not implement reopening.

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

The HTTP parser answers “are these fields strings?”; the factory answers “is this a valid ticket subject, and what initial state does creation assign?” A blank string passes the first question and fails the second. The factory owns the rule; a [DTO](../GLOSSARY.md#data-transfer-object-dto) validator, controller or application operation must call it rather than maintain another check. `TicketData` is a plain snapshot, not a database record or transport [DTO](../GLOSSARY.md#data-transfer-object-dto), and the private data prevents changing status by mutating a returned snapshot.

The initial state is named explicitly inside the same domain owner. Reordering `TICKET_STATUSES`, or adding `reopened`, must not change creation to another state. The list defines membership; `INITIAL_TICKET_STATUS` defines creation; future transition methods would define which changes are allowed. These are different decisions, not reasons to duplicate the vocabulary across layers.

This first entity supports creation only. Loading existing tickets would need a separate domain-owned restoration factory using `isTicketStatus` and validity rules; calling `create()` on a resolved database row would incorrectly reset it to open. Do not add that operation until retrieval is needed.

## 3. Save without naming a database in the operation

Creation must not report success before saving. Hard-coding a database client inside `CreateTicket` would make its tests and policy depend on a database installation. Instead the [use case](../GLOSSARY.md#use-case) requires just `insert(ticket)`. `TicketRepository` is this **[Application](../GLOSSARY.md#application-layer)-owned persistence contract**: it specifies what the [use case](../GLOSSARY.md#use-case) needs, without specifying how storage works. Because it adds business objects to stored collection-like state, it is a narrow write side of the **[Repository Pattern](../GLOSSARY.md#repository)**; retrieval methods can follow real requirements.

| Artifact | Exact role | Layer |
| --- | --- | --- |
| `TicketRepository` | **what** `CreateTicket` requires: persistence contract | [Application](../GLOSSARY.md#application-layer) |
| `InMemoryTicketRepository` | **how** memory implements that contract | [Infrastructure](../GLOSSARY.md#infrastructure) |
| `PrismaTicketRepository` | **how** Prisma/database access implements that contract | [Infrastructure](../GLOSSARY.md#infrastructure) |

`src/application/tickets/ports/TicketRepository.ts`:

```ts
import type { Ticket } from '@/domain/tickets/Ticket'

export class TicketPersistenceUnavailable extends Error {}

export interface TicketRepository {
  // Resolve only after accepting the insert. No upsert/overwrite.
  // A rejected call can have an unknown commit outcome.
  insert(ticket: Ticket): Promise<void>
}
```

Both implementation classes promise to provide the methods required by `TicketRepository`. TypeScript expresses that promise with `implements`, and checks that the class satisfies the interface; it does not supply the implementation or prove its runtime guarantees. Relationship excerpt, **class bodies omitted** (the memory body follows in section 4; Prisma follows in chapter 4):

```ts
export class InMemoryTicketRepository implements TicketRepository { /* body omitted */ }
export class PrismaTicketRepository implements TicketRepository { /* body omitted */ }
```

All three names contain `TicketRepository` because the two concrete classes implement the same persistence contract. **Repository** names the design pattern/persistence role; **InMemory** names a storage mechanism; **Prisma** names a technology. These are not three layers or three Nest mechanisms. [TypeScript's implements guidance](https://www.typescriptlang.org/docs/handbook/2/classes.html#implements-clauses) explains the compile-time check. The existing `ports/` path is our contract-folder convention; [chapter 5 explains its Hexagonal interpretation](5-architectural-styles-with-nestjs.md#where-are-the-ports-and-adapters-in-this-example).

`CreateTicket` creates, awaits the insert and returns plain data. That coordination is the **[Application](../GLOSSARY.md#application-layer) [use case](../GLOSSARY.md#use-case)**. It delegates validity to [Domain](../GLOSSARY.md#domain) and translates a recognized storage failure into a result that callers can interpret without knowing SQL or HTTP.

Put the [use case](../GLOSSARY.md#use-case)'s own input and result under [Application](../GLOSSARY.md#application-layer)'s `contracts/`, not HTTP's `dto/`. A command describes what the operation accepts; a result describes what it reports. Neither describes an HTTP envelope.

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

The injected ID function is justified because the backend must allocate identity before building the ticket and tests need deterministic identities. A function suffices; a new `IdGenerator` hierarchy or clock is unnecessary. Production composition uses Node's established UUID generator. No crypto is reimplemented.

`TicketRepository` has a real replacement pressure: memory in tests, durable storage in the deployed process. Its contract does not offer arbitrary queries, [ORM](../GLOSSARY.md#orm) transactions or generic methods for all product features. It does not solve duplicate requests.

Another capability needs a supported entry point rather than an import into ticket internals. A **[public API](../GLOSSARY.md#public-api)** states which operations and types the Tickets owner promises to maintain. This plain entry point deliberately exposes creation and its input/result; storage and HTTP parsing remain private:

`src/application/tickets/index.ts`:

```ts
export { CreateTicket } from './use-cases/CreateTicket'
export type { CreateTicketCommand } from './contracts/CreateTicketCommand'
export type { CreateTicketResult } from './contracts/CreateTicketResult'
```

An external consumer imports from `application/tickets`, resolved through its `index.ts`; code implementing Tickets can use local modules within the permitted layers. The result intentionally includes a plain domain snapshot through its application contract. Exposing that type does not change its owner or expose entity methods/database rows. Chapter 4 provides the separate outer entry `composition/modules` for Nest assembly. A TypeScript export makes names available, not private: capability import rules must enforce supported paths separately from layer rules.

## 4. Start with memory and explicit construction

An object can satisfy `insert` by keeping a map. `InMemoryTicketRepository` is the memory implementation of `TicketRepository`, providing working teaching/test storage without a database. It belongs to [Infrastructure](../GLOSSARY.md#infrastructure) and loses all data when the process ends.

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

Now the caller needs a plain handler that parses input, invokes the [use case](../GLOSSARY.md#use-case) and maps the result into an HTTP-shaped reply. `TicketHttpHandler` belongs to [Presentation](../GLOSSARY.md#presentation-layer). It does not register a route or implement HTTP itself; a server platform binds its invocation to `POST /tickets`.

The response has its own HTTP representation. Its status type comes from the successful [Application](../GLOSSARY.md#application-layer) result, preserving the single domain-owned vocabulary. TypeScript's `Extract` selects the success member of that result union; it performs no runtime check.

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

The plain handler and Nest [Controller](../GLOSSARY.md#controller) both need the same successful field translation. Give that translation one owner instead of repeating it in both callers:

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

Composition excerpt, with imports from the modules above:

```ts
const repository = new InMemoryTicketRepository()
const createTicket = new CreateTicket(repository, () => 'T-42')
const httpHandler = new TicketHttpHandler(createTicket)
const response = await httpHandler.handle({
  subject: 'Invoice download fails',
  description: 'PDF download returns an error for INV-42.',
})
```

Giving the repository to the constructor is already **[Dependency Injection](../GLOSSARY.md#dependency-injection-di) ([DI](../GLOSSARY.md#dependency-injection-di))**: the consumer receives its collaborator from outside. The connected objects form an **object graph**. The code assembling them is the [composition root](../GLOSSARY.md#composition-root). The fixed ID is for one demonstration call only; repeated calls need fresh IDs. No container is needed here, and no consumer reaches into composition to find an object (which would be a [service locator](../GLOSSARY.md#service-locator)).

**[DI](../GLOSSARY.md#dependency-injection-di) differs from the [Dependency Inversion Principle](../GLOSSARY.md#dependency-inversion-principle-dip) ([DIP](../GLOSSARY.md#dependency-inversion-principle-dip)).** Injecting a concrete `PrismaTicketRepository` into a class that imports it would be [DI](../GLOSSARY.md#dependency-injection-di), while still depending on the database detail. Depending on `TicketRepository`, the [Application](../GLOSSARY.md#application-layer)-owned persistence contract, lets the implementation depend toward the application's requirement. That source dependency design expresses [DIP](../GLOSSARY.md#dependency-inversion-principle-dip); the manual construction supplies the runtime object. See [composition](../foundations/composition-root.md) and [dependency boundaries](../foundations/dependency-boundaries.md).

### Register the route with Node.js

The handler is callable, but a network request still needs to reach it. Node's standard `createServer` supplies request/response objects; we can compare the method and path ourselves. This **routing excerpt** uses the assembled `httpHandler` above. `readJsonBody(req)` is intentionally out of scope: a body decoder must enforce size/content limits and handle malformed JSON before passing decoded `unknown` data onward. This excerpt isolates routing and response serialization, not a complete HTTP server:

```ts
import { createServer } from 'node:http'

const createTicketHandler = (body: unknown) => httpHandler.handle(body)

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost')
  if (req.method === 'POST' && url.pathname === '/tickets') {
    try {
      const body = await readJsonBody(req)
      const response = await createTicketHandler(body)
      res.writeHead(response.status, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(response.body))
    } catch {
      res.writeHead(500)
      res.end() // safe fallback; internal diagnostics are outside this excerpt
    }
    return
  }
  res.writeHead(404)
  res.end()
})
```

The `if` is the manual **route**: match POST and `/tickets` to `createTicketHandler`, the selected **[route handler](../GLOSSARY.md#route-handler)**. The endpoint remains the public `POST /tickets` operation with its request/response contract. `url.pathname` keeps a query string out of path matching. `writeHead` sets response status/headers; `end` sends serialized output and completes the response. Starting/stopping the server and decoder-specific `400` handling are omitted; the broad catch above only illustrates a safe fallback. [Node's HTTP API](https://nodejs.org/api/http.html) documents these standard mechanisms.

Nest's `@Controller('tickets')` plus `@Post()` registers this same relationship through metadata, and its body decoding/response machinery removes the repeated plumbing. Chapter 3 shows that convenience after this mechanism. Neither manual routing nor decorators create the `CreateTicket` [use case](../GLOSSARY.md#use-case).

### Check access before processing the argument

Suppose the support team now restricts HTTP creation to authenticated callers. First an established authentication integration must verify identity and supply a trusted context; an arbitrary body/header object is not that context. The following optional [Presentation](../GLOSSARY.md#presentation-layer) wrapper assumes that verification has already happened. It adds the access decision and reuses `TicketHttpHandler` for parsing, invocation and response mapping:

`src/presentation/http/tickets/handlers/handleAuthenticatedCreateTicket.ts`:

```ts
import type { TicketHttpHandler } from './TicketHttpHandler'

export interface RequestContext {
  user?: { id: string }
}

export async function handleAuthenticatedCreateTicket(
  context: RequestContext,
  body: unknown,
  httpHandler: TicketHttpHandler,
): Promise<{ status: number; body: unknown }> {
  if (!context.user) {
    return { status: 401, body: { error: 'unauthorized' } }
  }
  return httpHandler.handle(body)
}
```

The `if` asks **may this caller invoke the selected operation?** It returns before parsing or calling the [use case](../GLOSSARY.md#use-case) when identity is absent. After permission to continue, `TicketHttpHandler.handle` calls the existing `parseCreateTicketRequest(body)` to check object/string arguments, invokes `CreateTicket.execute(command)`, then maps its result to HTTP. `Ticket.create()` alone checks the subject rule and assigns initial state.

The parsing function remains a **[Parser](../GLOSSARY.md#parser)**: ordinary TypeScript logic that converts unknown transport data into `CreateTicketRequestDto`. Nest provides a **Guard** for the access decision and a **Pipe** to run argument parsing/validation/transformation in its lifecycle. The Pipe calls this [Parser](../GLOSSARY.md#parser); it is not another name for it. A valid body does not authenticate a caller; an authenticated caller can still send invalid input. This wrapper implements only the presence check for a previously verified user, not token verification, tenant membership or permissions beyond authentication. It is optional and not bound into the basic server excerpt or chapter 4's creation-only module. [Chapter 3 compares the three responsibilities](3-nestjs-building-blocks.md#guard-and-pipe-answer-different-questions).

## 5. What a library will remove

The small parser exposes the mechanism clearly. Complex nested bodies, multiple formats and consistent error messages can make manual checks repetitive. A schema library can centralize those **transport** checks, while still calling domain-owned factories for business validity. A [Nest pipe](../GLOSSARY.md#nestjs-pipe) will place the same parser before a handler. A container will replace repetitive object construction with registered bindings. An [ORM](../GLOSSARY.md#orm) will handle database interaction and generated query types. None moves ownership of ticket rules to a framework.

An **ORM**, an object-relational mapper, relates programming-language records/objects to relational tables and helps query them. Prisma's generated client and TypeORM's `Repository<T>` are technology APIs; neither is automatically the application's `TicketRepository`. Generated rows describe storage, not the behavior or protected construction of `Ticket`. We will introduce Prisma only when memory's lack of durability becomes the problem.

Use established HTTP, database, authentication and cryptographic implementations. The TypeScript-first rule teaches a small safe mechanism; it does not ask readers to implement drivers, connection pools, password hashing or token signing.

## 6. Check the boundary

The [executable check](../scripts/backend-ticket-example.test.mjs) extracts the complete canonical modules, compiles them using the existing TypeScript dependency and runs creation and rejection cases. It checks bad shapes, forbidden client state, blank/long subjects, domain status guards, no save on invalid business input, persistence failure, safe response mapping and propagation of unexpected defects. It also proves that the optional access wrapper stops before body processing or use-case execution, while permitted callers still receive transport and business validation. Nest and a database are unnecessary for those checks. The incomplete Node routing excerpt is source-reviewed, not compiled/executed by that module check.

Memory cannot prove database durability, network error translation or HTTP hook ordering. Chapter 4 separates those integration tests from policy tests. Follow [Repository](https://martinfowler.com/eaaCatalog/repository.html), [Service Layer](https://martinfowler.com/eaaCatalog/serviceLayer.html), [Composition Root](https://blog.ploeh.dk/2011/07/28/CompositionRoot/) and [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html) for the architectural sources.
