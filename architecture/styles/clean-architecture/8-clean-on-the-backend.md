# 8. Clean Architecture on the Backend

An analyst submits `POST /tickets`. Ticket validity should survive replacing Nest or Prisma. The [backend route](../../backend/README.md) builds that operation; this chapter reads its responsibilities through Clean's policy levels.

<a id="81-the-four-circles-on-the-server"></a>

## 8.1 A backend mapping

| Clean circle | Ticket responsibility | Handbook location |
| --- | --- | --- |
| Entities | Subject validity and initial state | `domain/tickets/Ticket.ts` |
| Use Cases | Create and save a ticket | `application/tickets/` |
| Interface Adapters | Translate request, response and persistence fields | HTTP delivery and persistence functions |
| Frameworks & Drivers | Nest and Prisma mechanisms | Outer integration and composition |

Clean's Entities circle describes general business policy, including rules that need no identity-bearing class. Folder names are handbook conventions.

<a id="82-step-1--the-entity-unchanged"></a>

## 8.2 Domain

`Ticket.create()` owns the nonblank bounded subject and initial `open` state. HTTP parsing checks the request shape before that factory evaluates business validity. [Chapter 2](../../backend/2-typescript-first-boundaries.md) owns both examples.

<a id="83-step-2--the-port-and-the-use-case-unchanged-shape"></a>

## 8.3 Application

`CreateTicket` imports the model and its required persistence contract. At runtime it calls the supplied repository object, then returns a plain result. HTTP and CLI callers choose their own output representation.

An **output port** is an application-owned contract for communicating an outcome to a supplied presenter. Martin's original boundary example uses one; it is an alternative when output interaction warrants that collaborator. Returning this operation's result already provides a sufficient boundary.

## 8.4 Infrastructure

`PrismaTicketRepository` maps ticket fields and writes through Prisma. Its imports point inward. The [Prisma excerpt](../../backend/4-create-ticket-with-nestjs.md#5-replace-memory-when-the-ticket-must-survive-restart) deliberately leaves generated-client setup and operational failure handling to a real integration.

<a id="84-step-3--the-interface-adapters-controller--orm-repository"></a>

## 8.5 Interface adapters / delivery

`TicketsController` invokes the operation and maps its result to HTTP. Translation and Nest glue can share an outer module; see the [canonical explanation](../../foundations/dependency-boundaries.md#combined-outer-modules).

## 8.7 Validation

The transport parser checks `subject` is a string. Domain decides whether its contents form a valid ticket. Repeating the subject-length policy in a decorator would create another owner.

## 8.8 Shared contracts with frontend

The backend response DTO is a wire representation. The [frontend reader](../../frontend/ports-and-adapters.md) validates and maps it into its own result. Shared terminology does not make the client's model authoritative over persisted tickets.

<a id="85-step-4--frameworks--drivers--the-composition-root"></a>

## 8.9 Composition

`TicketsModule` constructs the storage object and plain operation. Startup can import all pieces it assembles; inner policy remains independent of the container. Follow the [final wiring](../../backend/4-create-ticket-with-nestjs.md#4-wire-memory-first).

<a id="86-the-whole-flow-in-mirror-image"></a>

## 8.10 Frontend comparison

The browser owns interaction; the backend owns persisted ticket behavior. Both can protect policy from technical changes. Compare [Onion's reading](../onion-architecture/7-onion-on-the-backend.md), then try the [backend exercises](../../backend/exercises/README.md).

## Sources

- [Martin: Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Backend framework references](../../backend/references.md)
