# Repository Pattern

Ticket creation must save a valid ticket. It should not need to know database columns or construct a query. Give the operation a purpose-specific way to add the object to storage.

**Contents**

- [The interaction](#the-interaction)
- [Contract and implementation](#contract-and-implementation)
- [Who owns what?](#who-owns-what)
- [Repository, reader and gateway](#repository-reader-and-gateway)
- [Change and verification](#change-and-verification)
- [Sources](#sources)

## The interaction

A [Repository](../../../../GLOSSARY.md#repository) presents access to stored business objects in collection-like terms. Fowler describes it as a boundary between domain objects and data mapping. It can offer adding or retrieving objects without exposing the query mechanism.

The canonical example begins with a narrow `insert(ticket)` contract. Add retrieval only when a real operation needs it; do not generate a CRUD interface for every table.

## Contract and implementation

The [canonical Ticket guide](../../../backend/2-typescript-first-boundaries.md) owns `TicketRepository`, `CreateTicket` and the memory implementation. Its insert promises acceptance before resolving and does not overwrite another ticket with the same identity.

```ts
import { CreateTicket } from '@/application/tickets'
import { InMemoryTicketRepository } from '@/infrastructure/persistence/tickets/adapters/InMemoryTicketRepository'

const tickets = new InMemoryTicketRepository()
const create = new CreateTicket(tickets, () => 'T-1')
const result = await create.execute({ subject: 'Broken PDF', description: '' })
```

The [Prisma excerpt](../../../backend/4-create-ticket-with-nestjs.md) maps the ticket's fields and calls the client. The client is a technical mechanism; it is not automatically the application's [Repository Pattern](../../../../GLOSSARY.md#repository).

## Who owns what?

| Piece | Owner in this example |
| --- | --- |
| Valid ticket | [Domain](../../../../GLOSSARY.md#domain) |
| Required insertion and known persistence failure | [Application](../../../../GLOSSARY.md#application-layer) |
| Stored fields, mapping and database calls | [Infrastructure](../../../../GLOSSARY.md#infrastructure) |
| Concrete implementation selection | Composition |

Application owns this contract because its creation workflow requires it. Other domain-centered designs place repository interfaces near the domain model. Choose by the policy needing the capability; concrete persistence still depends inward.

## Repository, reader and gateway

A `TicketRepository` describes stored ticket objects. An `AgendaReader` can return a purpose-specific read projection rather than reconstructing entities. A `TicketGateway` can request remote ticket creation without promising collection-like access.

These names describe different interactions. An interface, an HTTP endpoint or an ORM method alone does not make something a Repository.

## Change and verification

Change a subject rule in [Domain](../../../../GLOSSARY.md#domain), stored field names in the adapter and the selected implementation in Composition. Another capability uses the supported operation rather than private storage helpers.

Verify promised insertion behavior, rejection of duplicate identities and completion before success. Run separate integration checks for a real database. A memory Map proves neither durability nor database transactions.

Use a repository when it protects meaningful object/persistence separation. A simple reporting query may need only a reader.

## Sources

- [Fowler: Repository](https://martinfowler.com/eaaCatalog/repository.html)
- [Evans: Domain-Driven Design Reference, Repositories](https://www.domainlanguage.com/wp-content/uploads/2016/05/DDD_Reference_2015-03.pdf)
