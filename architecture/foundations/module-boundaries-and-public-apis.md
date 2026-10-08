# Module Boundaries and Public APIs

Billing needs to create a support ticket. Importing Tickets' private HTTP parser would tie Billing to a representation it does not use. Instead, Tickets offers its creation operation through a supported entry point.

A **module boundary** groups code for a capability and specifies what consumers may use. A layer boundary separately controls whether policy depends on technologies.

## 1. Optimize for high cohesion and low coupling

Keep files that serve one capability together within each layer. **Cohesion** describes how closely their responsibilities belong together; **coupling** describes how much they know about other modules.

`presentation/scheduling/` groups the agenda's screen code. Its rules and operations remain under `domain/scheduling/` and `application/scheduling/`. See the [frontend map](../frontend/presentation-architecture.md).

## 2. Public API per non-trivial module

A [public API](../../GLOSSARY.md#public-api) is the supported set of operations and representations a module offers its consumers.

```ts
// src/application/tickets/index.ts
export { CreateTicket } from './use-cases/CreateTicket'
export type { CreateTicketCommand } from './contracts/CreateTicketCommand'
export type { CreateTicketResult } from './contracts/CreateTicketResult'

// Consumer in another capability:
import { CreateTicket } from '@/application/tickets'
```

The entry exposes the conversation Billing needs while Tickets can reorganize private files.

## 3. Barrels are contracts, not export dumpsters

An `index.ts` with explicit exports makes that support visible. Exporting every helper with `export *` accidentally expands the contract.

| Mechanism | What it exposes |
| --- | --- |
| TypeScript `export` | Source names another file can import |
| Nest module `exports` | Providers available to importing Nest modules |
| Architectural public API | The operations and representations consumers are supported in using |

Neither language exports nor Nest metadata prevents a deep import. A project enforces its supported entry points through review, import rules or package boundaries.

## 4. Shared is earned

Tickets and Billing can share a visual `Badge` with one design-system owner. Their `TicketStatus` and `InvoiceStatus` still have different business meanings.

Share a capability when its meaning, consumers and owner are stable. A bucket called `shared/helpers.ts` conceals those decisions.

## 5. `common` vs. `shared`

Use `presentation/shared/components/` for reusable visual primitives and `presentation/shared/formatters/` for display conventions with unrelated consumers. Capability-specific code stays with that capability. A second generic `common/` bucket adds no useful ownership.

## 6. Type ownership follows meaning

| Type | Owner |
| --- | --- |
| Appointment-card props | Beside `AppointmentCard.tsx` |
| Selected day and loading state | `presentation/scheduling/state/` |
| Agenda operation result | `application/scheduling/contracts/` |
| API wire fields | `infrastructure/http/scheduling/dto/` |

Type-only imports still create source dependencies. [Code Placement](code-placement.md) explains representation ownership.

## 7. Avoid horizontal feature coupling

Replace a cross-capability deep import with a supported operation. If two capabilities repeatedly need each other's private decisions, revisit their boundary or compose them through an application workflow.

`import { privateParser } from '@/presentation/tickets/http/parsers/privateParser'` makes another capability depend on Tickets' implementation.

## 8. Naming should reveal purpose

`formatAppointmentTime`, `GetAgenda` and `AgendaReader` identify different responsibilities. Follow the [naming convention](../conventions/naming-and-file-placement.md).

## 9. Backend APIs across layer-first capabilities

`application/tickets/index.ts` offers Tickets' operation, command and result. `composition/modules/index.ts` separately offers the Nest module needed at startup. The [backend wiring](../backend/4-create-ticket-with-nestjs.md#4-wire-memory-first) applies both entries.

Billing importing Tickets' private application helper violates capability ownership. Application importing a Prisma implementation violates layer direction. Check both boundaries.

## Sources

- [Redux: code structure](https://redux.js.org/faq/code-structure/)
- [TypeScript: modules](https://www.typescriptlang.org/docs/handbook/2/modules.html)
- [Nest: modules](https://docs.nestjs.com/modules)
