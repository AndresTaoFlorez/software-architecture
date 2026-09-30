# Ports & Adapters in a Frontend: Support Tickets

← [Frontend Architecture](./README.md) · [Dependency Boundaries](../foundations/dependency-boundaries.md) · [Glossary](../GLOSSARY.md)

## 1. The problem

An analyst fills out a ticket form in our React application and clicks **Create Ticket**. The frontend needs to check that the subject is not empty and then ask the backend to create the ticket.

These are two different jobs: deciding which information is required to create a ticket, and handling the technical details of communicating with the server. If the endpoint, HTTP client, or server response format changes, we should not need to rewrite the rule that checks the subject.

Our ticket-creation operation therefore needs an object with a method named `create(input)` that returns the created ticket. We record this requirement as the TypeScript interface `TicketGateway`. Here, a *contract* simply means the method that must be available, the input it accepts, and the result it returns. The interface does not perform any network request.

This requirement is an **outbound [port](../GLOSSARY.md#port)**: it says what the application needs without deciding how it will be done. `HttpTicketGateway` is an **[adapter](../GLOSSARY.md#adapter)** that meets that requirement. It uses `fetch` to call the backend and translates the response—for example, turning the API field `ticket_id` into the application's `id`.

When we assemble the frontend, we give the ticket-creation operation an `HttpTicketGateway` object. The operation calls its `create` method; the interface is not a separate object that forwards calls at runtime. A test could instead supply an object that creates tickets in memory, without changing the operation.

This is the outbound side of **[Ports & Adapters](../GLOSSARY.md#hexagonal-architecture-ports-and-adapters)** *from the frontend's point of view*: we are designing this frontend's separation from the technologies and systems it uses. Its backend is external to that frontend, even if both belong to the same product.

## 2. Visual model

![Unified dark-mode diagram of ticket creation: the solid runtime path goes from the screen through createTicket and HttpTicketGateway to the external backend; dashed links show source-code contracts and a separate connector shows startup injection.](./assets/ticket-port-adapter.svg)

**Figure 1. One system, three relationship types.** The strongest horizontal path is the actual runtime flow: `Screen → createTicket() → HttpTicketGateway → POST /api/tickets → Backend API`. The backend is outside the frontend boundary.

The lighter dashed relationships above that path describe **source-code structure**, not extra runtime hops: `createTicket()` depends on the application-owned `TicketGateway` [port](../GLOSSARY.md#port), and `HttpTicketGateway` implements that contract. The startup connector below shows **composition**: [the Composition Root](../GLOSSARY.md#composition-root) creates the concrete adapter and passes it to `makeCreateTicket(gateway)` before the UI uses the resulting operation.

The [port](../GLOSSARY.md#port) is a TypeScript contract, **not a separate runtime forwarding object**. Once composition is complete, `createTicket()` holds the injected [adapter](../GLOSSARY.md#adapter) object and calls it directly. On the way back, that HTTP adapter validates the server response and translates transport details such as `ticket_id` into the application's `id`.

<details>
<summary>Editable Mermaid source corresponding to the figure</summary>

The Mermaid version is the editable **semantic companion** to the SVG. It preserves the same dependency, startup-wiring and runtime meanings; it is not intended to reproduce the SVG pixel for pixel.

```mermaid
flowchart LR
    subgraph FRONTEND["Frontend"]
        UI["Screen<br/>UI"]
        USECASE["createTicket()<br/>Use case"]
        ADAPTER["HttpTicketGateway<br/>HTTP adapter"]
        PORT["TicketGateway<br/>Port / contract"]

        UI ==>|"runtime call"| USECASE
        USECASE ==>|"runtime call"| ADAPTER

        USECASE -.->|"depends on"| PORT
        ADAPTER -.->|"implements"| PORT
        ADAPTER -->|"injected at startup<br/>makeCreateTicket(gateway)"| USECASE
    end

    API["Backend API<br/>External system"]
    ADAPTER ==>|"POST /api/tickets"| API

    classDef ui fill:#20252c,stroke:#738091,color:#e6e9ee
    classDef application fill:#1d2632,stroke:#7089ad,color:#e6e9ee
    classDef port fill:#272431,stroke:#9489b2,color:#e6e9ee
    classDef adapter fill:#1f2b28,stroke:#719d8d,color:#e6e9ee
    classDef external fill:#2b261e,stroke:#ad8e5b,color:#e6e9ee

    class UI ui
    class USECASE application
    class PORT port
    class ADAPTER adapter
    class API external

    linkStyle 0,1 stroke:#e6e9ee,stroke-width:2.4px
    linkStyle 2,3 stroke:#a69dc4,stroke-width:1.4px,stroke-dasharray:5 4
    linkStyle 4 stroke:#7fae9d,stroke-width:1.6px
    linkStyle 5 stroke:#c9a66b,stroke-width:2.4px
```

</details>

## 3. Physical ownership

| File | Owns | Why it belongs there |
| --- | --- | --- |
| `domain/tickets/Ticket.ts` | Ticket shape, valid status vocabulary/check and subject rule | Business meaning has one owner, independent of server field names and React |
| `application/tickets/ports/TicketGateway.ts` | **Outbound [port](../GLOSSARY.md#port)** and command | The [use case](../GLOSSARY.md#use-case) defines what capability it needs |
| `application/tickets/use-cases/createTicket.ts` | Use-case orchestration | No HTTP or React imports |
| `infrastructure/tickets/HttpTicketGateway.ts` | **Outbound [adapter](../GLOSSARY.md#adapter)**, structural [DTO](../GLOSSARY.md#data-transfer-object-dto) validation and mapping | Only this boundary knows `fetch`/`ticket_id`; it reuses [Domain](../GLOSSARY.md#domain) for valid ticket values |
| `presentation/features/tickets/model/useTickets.ts` | React-facing state/operations | Loading/error feedback belongs to the UI |
| `composition/bootstrap.tsx` | Dependency construction and injection | Chooses the concrete [adapter](../GLOSSARY.md#adapter) without becoming a [Service Locator](../GLOSSARY.md#service-locator) |

These names are **repository conventions**, not universal requirements of Cockburn's architecture. `Gateway` expresses interaction with an external service. Use `Repository` when the abstraction genuinely models retrieval/persistence of domain objects as a collection, not simply because an HTTP endpoint exists.

### Domain: ticket vocabulary and rules

`src/domain/tickets/Ticket.ts`:

```ts
export const TICKET_STATUSES = ['open', 'in_progress', 'resolved'] as const
export type TicketStatus = (typeof TICKET_STATUSES)[number]

// TypeScript types disappear at runtime; this also checks API data.
export function isTicketStatus(value: unknown): value is TicketStatus {
  return TICKET_STATUSES.some(status => status === value)
}

export function isTicketSubject(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

export function normalizeTicketSubject(value: string): string {
  if (!isTicketSubject(value)) throw new Error('Subject is required')
  return value.trim()
}

export interface Ticket {
  readonly id: string
  readonly subject: string
  readonly status: TicketStatus
}
```

The list of valid ticket statuses is declared **once** and drives both the TypeScript union and its runtime checker. The required, non-blank ticket subject is also checked here because it is a rule about a valid ticket, not a feature of React or HTTP. These domain functions contain no transport field names or UI code.

### Port: what the Application needs

`src/application/tickets/ports/TicketGateway.ts`:

```ts
import type { Ticket } from '../../../domain/tickets/Ticket'

export interface CreateTicketInput {
  subject: string
  description: string
}

export interface TicketGateway {
  create(input: CreateTicketInput): Promise<Ticket>
}
```

Notice what is *absent*: HTTP verbs, endpoint paths, `Response`, Axios, React and API-specific `ticket_id`.

### Use case: what the Application does

`src/application/tickets/use-cases/createTicket.ts`:

```ts
import { normalizeTicketSubject } from '../../../domain/tickets/Ticket'
import type {
  CreateTicketInput,
  TicketGateway,
} from '../ports/TicketGateway'

export function makeCreateTicket(gateway: TicketGateway) {
  return (input: CreateTicketInput) => gateway.create({
    ...input,
    subject: normalizeTicketSubject(input.subject),
  })
}

export type CreateTicket = ReturnType<typeof makeCreateTicket>
```

The [use case](../GLOSSARY.md#use-case) coordinates the operation and delegates the subject rule to [Domain](../GLOSSARY.md#domain) instead of defining its own separate validation. It uses a small function factory for explicit **[dependency injection](../GLOSSARY.md#dependency-injection-di)**; no [DI container](../GLOSSARY.md#di-container) is required. The backend must independently enforce authorization and ticket constraints; frontend checks are not a security boundary.

### Adapter: how the Application reaches the backend

`src/infrastructure/tickets/HttpTicketGateway.ts`:

```ts
import { z } from 'zod'
import {
  TICKET_STATUSES,
  isTicketSubject,
  normalizeTicketSubject,
  type Ticket,
} from '../../domain/tickets/Ticket'
import type {
  CreateTicketInput,
  TicketGateway,
} from '../../application/tickets/ports/TicketGateway'

// This schema owns the *external wire shape*, not ticket business rules.
// Status values and the subject rule come from Domain.
const TicketResponseSchema = z.object({
  ticket_id: z.string().min(1),
  subject: z.string().refine(isTicketSubject, 'Subject is required'),
  status: z.enum(TICKET_STATUSES),
})

type TicketDto = z.infer<typeof TicketResponseSchema>

function toTicket(dto: TicketDto): Ticket {
  return {
    id: dto.ticket_id,
    subject: normalizeTicketSubject(dto.subject),
    status: dto.status,
  }
}

function parseTicketDto(value: unknown): Ticket {
  const parsed = TicketResponseSchema.safeParse(value)
  if (!parsed.success) throw new Error('Invalid ticket response')
  return toTicket(parsed.data)
}

export class HttpTicketGateway implements TicketGateway {
  constructor(private readonly request: typeof fetch = fetch) {}

  async create(input: CreateTicketInput): Promise<Ticket> {
    const response = await this.request('/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })

    if (!response.ok) throw new Error('Ticket creation unavailable')

    let payload: unknown
    try {
      payload = await response.json()
    } catch {
      throw new Error('Invalid ticket response')
    }
    return parseTicketDto(payload)
  }
}
```

This example uses **[Zod](https://zod.dev/basics)** (a runtime schema-validation library) rather than an unchecked type assertion and a hand-written object parser. `TicketResponseSchema.safeParse(value)` accepts `unknown`, checks the HTTP response, and returns typed data only on success; `TicketDto` is **inferred from that same schema** instead of declared separately. `status: z.enum(TICKET_STATUSES)` reads the one list owned by [Domain](../GLOSSARY.md#domain); `subject` delegates to the domain-owned `isTicketSubject`. The [adapter](../GLOSSARY.md#adapter) alone knows `ticket_id` and maps it to `Ticket.id`. A malformed JSON body and an incompatible response both become an integration error, not a fabricated domain object. Zod's `z.object` normally strips additional response fields, allowing additive protocol changes while checking all required fields.

If another API represents statuses differently (for example, `IN_PROGRESS`), the [adapter](../GLOSSARY.md#adapter) translates that external value **into** a domain-owned status; that implementation must not quietly add new domain states. In a larger project, put a **reused external protocol schema** in the owning integration's `contracts/` area rather than copying a parser into each [gateway](../GLOSSARY.md#gateway); use generated OpenAPI/JSON Schema definitions if the API contract is already machine-readable. `TICKET_STATUSES` and protocol `ticket_id` still have **different owners**, so do not force a universal schema package across independently deployed services. The backend independently enforces its authoritative rules, and API [contract tests](../GLOSSARY.md#contract-test) should detect frontend/backend vocabulary drift. In a larger application, also translate transport failures into an application-owned error/result instead of exposing raw HTTP mechanics through the public feature API.

### Presentation and Composition: using the operation

`src/presentation/features/tickets/model/useTickets.ts` (React-facing excerpt):

```tsx
import { useState } from 'react'
import type { CreateTicket } from '../../../../application/tickets/use-cases/createTicket'

export function useTickets(createTicket: CreateTicket) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(input: Parameters<CreateTicket>[0]) {
    setBusy(true)
    setError(null)
    try {
      return await createTicket(input)
    } catch {
      setError('The ticket could not be created')
      return null
    } finally {
      setBusy(false)
    }
  }

  return { submit, busy, error }
}
```

`src/composition/bootstrap.tsx` (assembly excerpt):

```tsx
const ticketGateway = new HttpTicketGateway()
const createTicket = makeCreateTicket(ticketGateway)

// Pass createTicket to the root/page via props or context.
// A TicketPage can then call useTickets(createTicket).
```

Composition imports the concrete [adapter](../GLOSSARY.md#adapter) and application factory. The [use case](../GLOSSARY.md#use-case) and the hook **do not import the [Composition Root](../GLOSSARY.md#composition-root)** to locate their dependencies.

## 4. Why this separation matters

A test may replace `HttpTicketGateway` without network access:

```ts
const fakeGateway: TicketGateway = {
  async create(input) {
    return { id: 'T-001', subject: input.subject, status: 'open' }
  },
}

const createTicket = makeCreateTicket(fakeGateway)
```

The [executable walkthrough test](../scripts/frontend-ticket-example.test.mjs) typechecks the documented [Domain](../GLOSSARY.md#domain), [port](../GLOSSARY.md#port), [use case](../GLOSSARY.md#use-case), [adapter](../GLOSSARY.md#adapter) and React-facing hook, then exercises the injected HTTP implementation with valid statuses, malformed payloads, unexpected statuses and blank subjects. That check rejects the dangerous shortcut of coercing untrusted values into a valid string and verifies the schema-based parser, including malformed JSON. It is a regression test for the *documented example*, not a substitute for the backend's own tests.

A GraphQL or offline [adapter](../GLOSSARY.md#adapter) could also implement the same [port](../GLOSSARY.md#port) if the product needs it. **Do not introduce extra [ports](../GLOSSARY.md#port) solely to reproduce a diagram**: a simple read-only remote-data screen may be better served by a [server-state](../GLOSSARY.md#server-state)/query solution.

### Inbound vs. outbound, without extra ceremony

- **Inbound/driving side:** the React page (UI [adapter](../GLOSSARY.md#adapter)) invokes the [Application](../GLOSSARY.md#application-layer)'s `createTicket` operation. A plain function can be the entry contract; an extra interface is not automatically required.
- **Outbound/driven side:** `createTicket` requires `TicketGateway`; `HttpTicketGateway` implements it and communicates with the backend.

The frontend/backend are independently bounded systems. Calling the backend's API from a browser does **not** make that API a frontend [Application layer](../GLOSSARY.md#application-layer).

### If the support platform grows to many features

The point of this example is not that each feature needs six new folders or one interface for every endpoint. Its boundaries must survive ordinary product changes without turning `shared/` into a collection of unrelated business rules.

| Real change | Intended owner and impact | Should remain unchanged |
| --- | --- | --- |
| Support introduces `reopened` | The ticket model owner updates `TICKET_STATUSES` and any valid transition rules; change the relevant ticket-specific display and behavior tests. Verify that the backend version and API contract support the state. | `HttpTicketGateway` does not acquire a second hard-coded status list; unrelated Billing and Notifications policies do not change. |
| The API returns `ticketId` instead of `ticket_id` | Update the transport [DTO](../GLOSSARY.md#data-transfer-object-dto)/parser in the HTTP implementation and its [contract tests](../GLOSSARY.md#contract-test), considering client/server deployment compatibility. | `Ticket`, `TicketGateway`, `makeCreateTicket` and the component do not need that wire field name. |
| Another entry point creates tickets | Compose the existing operation for that entry point (a different page, accessible interaction, or supported job). Introduce another [adapter](../GLOSSARY.md#adapter) only if a real integration requires it. | Do not fork the subject rule or create a generic `BaseTicketService` merely for a second caller. |
| Several teams modify ticket state concurrently | The backend must authorize and validate against **current authoritative state** and define concurrency/[idempotency](../GLOSSARY.md#idempotency) behavior. Contract/integration and conflict tests must cover it. | Frontend validation is useful immediate feedback, not a guarantee about [server state](../GLOSSARY.md#server-state) or a substitute for atomic backend enforcement. |

In a larger codebase, give the Tickets capability a narrow [public API](../GLOSSARY.md#public-api) so other screens do not deep-import its internal hook, HTTP parser or status constants. Do not treat frontend and backend as one shared in-process domain merely because they both mention a ticket: each independently deployed boundary can own its own model. Coordinate the external protocol through explicit versioning, schema generation when beneficial, and [contract tests](../GLOSSARY.md#contract-test).

**Exhaustive UI translation is not a second business rule.** A ticket-facing screen can derive its display contract from the [Application](../GLOSSARY.md#application-layer) operation and let TypeScript require a label for every possible status:

```ts
// Presentation excerpt, using the Application-owned CreateTicket type.
type CreatedTicket = Awaited<ReturnType<CreateTicket>>

const statusLabels = {
  open: 'Open',
  in_progress: 'In progress',
  resolved: 'Resolved',
} satisfies Record<CreatedTicket['status'], string>
```

Adding `reopened` to the ticket model makes the UI label map fail typechecking until the appropriate presentation text is added; it does **not** create another allowlist in the transport [adapter](../GLOSSARY.md#adapter). The [Application](../GLOSSARY.md#application-layer)-facing contract is intentionally the type imported by the UI, rather than a deep import of [Domain](../GLOSSARY.md#domain) internals.

**Deliberate limits of this introductory example:** authentication, authorization, retries, telemetry, duplicate submissions across devices and backend transactions are not implemented in the client snippets. Those require product-level decisions; none can be solved by adding a TypeScript [port](../GLOSSARY.md#port) alone. Measure performance or deployment scaling needs before introducing additional runtime services.

## 5. Terminology and references

- **[Port](../GLOSSARY.md#port):** application-owned, purpose-oriented contract.
- **[Adapter](../GLOSSARY.md#adapter):** technology-facing implementation/translation.
- **[Use case](../GLOSSARY.md#use-case):** application-specific operation coordinating behavior.
- **[Composition Root](../GLOSSARY.md#composition-root):** outer assembly where the concrete [adapter](../GLOSSARY.md#adapter) is selected and injected.
- **[DTO](../GLOSSARY.md#data-transfer-object-dto)/[Mapper](../GLOSSARY.md#mapper):** external representation and the translation that stops it leaking inward.
- **Public feature hook:** UI-facing [facade](../GLOSSARY.md#facade-pattern); it is not an [Infrastructure](../GLOSSARY.md#infrastructure) [adapter](../GLOSSARY.md#adapter) merely because it invokes the [use case](../GLOSSARY.md#use-case).

**Primary source:** Alistair Cockburn, *[Hexagonal Architecture](../GLOSSARY.md#hexagonal-architecture-ports-and-adapters)* (2005): https://alistair.cockburn.us/hexagonal-architecture/

**Runtime schema reference:** Zod, [Defining schemas and `safeParse`](https://zod.dev/basics) · [Enums from `as const` values](https://zod.dev/api#enums). In an application, install Zod as a runtime dependency; it is a dev dependency only in this documentation/test repository.

**Related sources:** Robert C. Martin, *The [Clean Architecture](../GLOSSARY.md#clean-architecture)*: https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html · Mark Seemann, *[Composition Root](../GLOSSARY.md#composition-root)*: https://blog.ploeh.dk/2011/07/28/CompositionRoot/ · React, *Reusing Logic with [Custom Hooks](../GLOSSARY.md#custom-hook)*: https://react.dev/learn/reusing-logic-with-custom-hooks
