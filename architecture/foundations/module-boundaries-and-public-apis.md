# Module Boundaries and Public APIs

Billing needs to create a support ticket. Importing Tickets' private HTTP parser would tie Billing to a representation it does not use. Instead, Tickets offers its creation operation through a supported entry point.

A **module boundary** groups code for a capability and specifies what consumers may use. A layer boundary separately controls whether policy depends on technologies.

**Contents**

- [Optimize for high cohesion and low coupling](#optimize-for-high-cohesion-and-low-coupling)
- [Public API per non-trivial module](#public-api-per-non-trivial-module)
- [Barrels are contracts, not export dumpsters](#barrels-are-contracts-not-export-dumpsters)
- [Shared is earned](#shared-is-earned)
- [common vs. shared](#common-vs-shared)
- [Type ownership follows meaning](#type-ownership-follows-meaning)
- [Avoid horizontal feature coupling](#avoid-horizontal-feature-coupling)
- [Naming should reveal purpose](#naming-should-reveal-purpose)
- [Backend APIs across layer-first capabilities](#backend-apis-across-layer-first-capabilities)
- [Sources](#sources)

<a id="1-optimize-for-high-cohesion-and-low-coupling"></a>

## Optimize for high cohesion and low coupling

Keep files that serve one capability together within each layer. **Cohesion** describes how closely their responsibilities belong together; **coupling** describes how much they know about other modules.

`presentation/scheduling/` groups the agenda's screen code. Its rules and operations remain under `domain/scheduling/` and `application/scheduling/`. See the [frontend map](../frontend/presentation-architecture.md).

<a id="2-public-api-per-non-trivial-module"></a>

## Public API per non-trivial module

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

<a id="3-barrels-are-contracts-not-export-dumpsters"></a>

## Barrels are contracts, not export dumpsters

An `index.ts` with explicit exports makes that support visible. Exporting every helper with `export *` accidentally expands the contract.

| Mechanism | What it exposes |
| --- | --- |
| TypeScript `export` | Source names another file can import |
| Nest module `exports` | Providers available to importing Nest modules |
| Architectural public API | The operations and representations consumers are supported in using |

Neither language exports nor Nest metadata prevents a deep import. A project enforces its supported entry points through review, import rules or package boundaries.

<a id="4-shared-is-earned"></a>

## Shared is earned

Tickets and Billing can share a visual `Badge` with one design-system owner. Their `TicketStatus` and `InvoiceStatus` still have different business meanings.

Share a capability when its meaning, consumers and owner are stable. A bucket called `shared/helpers.ts` conceals those decisions.

<a id="5-common-vs-shared"></a>

## `common` vs. `shared`

Use `presentation/shared/components/` for reusable visual primitives and `presentation/shared/formatters/` for display conventions with unrelated consumers. Capability-specific code stays with that capability. A second generic `common/` bucket adds no useful ownership.

<a id="6-type-ownership-follows-meaning"></a>

## Type ownership follows meaning

| Type | Owner |
| --- | --- |
| Appointment-card props | Beside `AppointmentCard.tsx` |
| Selected day and loading state | `presentation/scheduling/state/` |
| Agenda operation result | `application/scheduling/contracts/` |
| API wire fields | `infrastructure/http/scheduling/dto/` |

Type-only imports still create source dependencies. [Code Placement](code-placement.md) explains representation ownership.

<a id="7-avoid-horizontal-feature-coupling"></a>

## Avoid horizontal feature coupling

Replace a cross-capability deep import with a supported operation. If two capabilities repeatedly need each other's private decisions, revisit their boundary or compose them through an application workflow.

`import { privateParser } from '@/presentation/tickets/http/parsers/privateParser'` makes another capability depend on Tickets' implementation.

<a id="8-naming-should-reveal-purpose"></a>

## Naming should reveal purpose

`formatAppointmentTime`, `GetAgenda` and `AgendaReader` identify different responsibilities. Follow the [naming convention](../conventions/naming-and-file-placement.md).

<a id="9-backend-apis-across-layer-first-capabilities"></a>

## Backend APIs across layer-first capabilities

`application/tickets/index.ts` offers Tickets' operation, command and result. `composition/modules/index.ts` separately offers the Nest module needed at startup. The [backend wiring](../backend/4-create-ticket-with-nestjs.md#wire-memory-first) applies both entries.

Billing importing Tickets' private application helper violates capability ownership. [Application](../../GLOSSARY.md#application-layer) importing a Prisma implementation violates layer direction. Check both boundaries.

## Sources

- [Redux: code structure](https://redux.js.org/faq/code-structure/)
- [TypeScript: modules](https://www.typescriptlang.org/docs/handbook/2/modules.html)
- [Nest: modules](https://docs.nestjs.com/modules)

[Previous: Composition Root and Dependency Injection](composition-root.md) · [Next: choose frontend or backend](../../README.md#choose-your-next-route)
