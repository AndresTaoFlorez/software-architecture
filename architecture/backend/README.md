# Backend: From a Request to a Ticket

An analyst submits a support ticket. This route follows that request through plain TypeScript, HTTP delivery, persistence and Nest assembly. You need basic TypeScript; architecture and Nest vocabulary are introduced as needed.

## Place your first feature

| Layer | Responsibility in this example |
| --- | --- |
| Domain | `Ticket` owns subject validity and initial state |
| Application | `CreateTicket` creates and saves through its required contract |
| Presentation | HTTP/CLI code interprets input and represents the result |
| Infrastructure | Memory or Prisma implements persistence |
| Composition | Startup selects and supplies concrete objects |

The handbook puts layers first, then capabilities. The complete [Ticket file map](4-create-ticket-with-nestjs.md#physical-structure) gives exact paths; [Code Placement](../foundations/code-placement.md) explains ownership decisions.

## How to read backend file names

| Name | Role |
| --- | --- |
| `Ticket` | Business entity |
| `CreateTicket` | Application operation |
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

1. [HTTP request to business operation](1-http-request-to-business-operation.md)
2. [TypeScript-first boundaries](2-typescript-first-boundaries.md)
3. [Nest building blocks](3-nestjs-building-blocks.md)
4. [Create Ticket with Nest](4-create-ticket-with-nestjs.md)
5. [Architectural styles with Nest](5-architectural-styles-with-nestjs.md)
6. [Exercises](exercises/README.md), with separate solutions

Then compare [Clean on the backend](../styles/clean-architecture/8-clean-on-the-backend.md) and [Onion on the backend](../styles/onion-architecture/7-onion-on-the-backend.md).

[References](references.md) · [Frontend route](../frontend/README.md) · [Architecture](../README.md) · [Glossary](../../GLOSSARY.md)
