# Backend: From a Request to a Ticket

An analyst submits a support ticket. This route follows that request through plain TypeScript, HTTP delivery, persistence and Nest assembly. You need basic TypeScript; architecture and Nest vocabulary are introduced as needed.

**Contents**

- [Place your first feature](#place-your-first-feature)
- [How to read backend file names](#how-to-read-backend-file-names)
- [Read in order](#read-in-order)

For general API contract choices before Nest implementation, follow [API Design & Engineering](../api-design/README.md). Its dental-clinic example is separate from this route's Ticket implementation; the shared lesson is where HTTP translation and business decisions belong.

## Place your first feature

| Layer | Responsibility in this example |
| --- | --- |
| [Domain](../../GLOSSARY.md#domain) | `Ticket` owns subject validity and initial state |
| [Application](../../GLOSSARY.md#application-layer) | `CreateTicket` creates and saves through its required contract |
| [Presentation](../../GLOSSARY.md#presentation-layer) | HTTP/CLI code interprets input and represents the result |
| [Infrastructure](../../GLOSSARY.md#infrastructure) | Memory or Prisma implements persistence |
| Composition | Startup selects and supplies concrete objects |

The handbook puts layers first, then capabilities. The complete [Ticket file map](4-create-ticket-with-nestjs.md#physical-structure) gives exact paths; [Code Placement](../foundations/code-placement.md) explains ownership decisions.

## How to read backend file names

| Name | Role |
| --- | --- |
| `Ticket` | Business entity |
| `CreateTicket` | [Application](../../GLOSSARY.md#application-layer) operation |
| `TicketRepository` | Persistence operations that creation requires |
| `InMemoryTicketRepository` | Implements those operations in process memory |
| `PrismaTicketRepository` | Implements them with Prisma |
| `TicketsController` | Groups HTTP route handlers |
| `parseCreateTicketRequest` | Checks unknown request data |
| `CreateTicketPipe` | Applies that parser through Nest |
| `AuthenticatedGuard` | Decides access using a verified identity |
| `TicketsModule` | Registers and assembles dependencies |

Use [Naming](../conventions/naming-and-file-placement.md#backend-names) for the convention behind the names.

## Read in order

Complete the [shared foundations](../../README.md#read-first) first. This backend route then introduces incoming HTTP and its plain-TypeScript implementation:

1. [HTTP request to business operation](1-http-request-to-business-operation.md).
2. [TypeScript-first boundaries](2-typescript-first-boundaries.md).
3. Attempt [B-E2: contract and implementations](exercises/easy.md#b-e2--contract-and-implementations). Consult the linked Prisma excerpt for its mechanism.
4. Attempt [B-I1 and B-I2](exercises/intermediate.md) to change a rule and add CLI input.
5. [Nest building blocks](3-nestjs-building-blocks.md), then [B-E1: trace the request](exercises/easy.md#b-e1--trace-the-request).
6. [Create Ticket with Nest](4-create-ticket-with-nestjs.md), then [B-E3: place HTTP files](exercises/easy.md#b-e3--place-http-files) and [B-I3: read an agenda](exercises/intermediate.md#b-i3--read-an-agenda).
7. [Business decisions and workflows](../foundations/domain-modeling/README.md).
8. Attempt [advanced exercises](exercises/advanced.md).
9. [Architectural styles with Nest](5-architectural-styles-with-nestjs.md).

Then use the [styles map](../styles/README.md) for Layered, Hexagonal, Clean and Onion. The focused [Clean backend](../styles/clean-architecture/8-clean-on-the-backend.md) and [Onion backend](../styles/onion-architecture/7-onion-on-the-backend.md) readings reuse the Ticket example.

[References](references.md) · [API Design](../api-design/README.md) · [Frontend route](../frontend/README.md) · [Architecture](../README.md) · [Glossary](../../GLOSSARY.md)
