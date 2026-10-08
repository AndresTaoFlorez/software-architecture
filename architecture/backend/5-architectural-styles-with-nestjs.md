<a id="5-architectural-styles-with-nestjs"></a>

# Architectural Styles with NestJS

[Ticket wiring](4-create-ticket-with-nestjs.md) · [Backend route](README.md)

You have followed one ticket through working responsibilities. Now compare the general design choices it illustrates, and see what each architectural style emphasizes.

**Contents**

- [Origins: several answers to related problems](#origins-several-answers-to-related-problems)
- [The shared problem, and what styles leave open](#the-shared-problem-and-what-styles-leave-open)
- [Does NestJS impose an architecture?](#does-nestjs-impose-an-architecture)
- [Read the ticket through each style](#read-the-ticket-through-each-style)
  - [Layered: separate kinds of work](#layered-separate-kinds-of-work)
  - [Hexagonal: separate the application from its devices](#hexagonal-separate-the-application-from-its-devices)
  - [Clean: protect different levels of policy](#clean-protect-different-levels-of-policy)
  - [Onion: keep the domain model central](#onion-keep-the-domain-model-central)
- [Compare without renaming everything into synonyms](#compare-without-renaming-everything-into-synonyms)
- [Trade-offs, tests and the next decision](#trade-offs-tests-and-the-next-decision)
- [Sources](#sources)

<a id="1-origins-several-answers-to-related-problems"></a>

## Origins: several answers to related problems

The same Ticket design can satisfy several architectural constraints. Each style emphasizes a different question:

| Style | Main emphasis | Primary source |
| --- | --- | --- |
| Layered | Separate presentation, business and data responsibilities | [Fowler](https://martinfowler.com/bliki/PresentationDomainDataLayering.html) |
| Hexagonal | [Application](../../GLOSSARY.md#application-layer) interactions and replaceable devices | [Cockburn, 2005](https://alistair.cockburn.us/hexagonal-architecture/) |
| Onion | Independent domain model at the center | [Palermo, 2008](https://jeffreypalermo.com/2008/07/the-onion-architecture-part-1/) |
| Clean | Business/application policy protected by inward dependencies | [Martin, 2012](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html) |

<a id="2-the-shared-problem-and-what-styles-leave-open"></a>

## The shared problem, and what styles leave open

When HTTP parsing, ticket rules and database queries share one method, changing storage can disturb business behavior. The previous chapters separated those decisions.

That cost is worthwhile when they change independently. A small disposable utility may need less separation.

<a id="3-does-nestjs-impose-an-architecture"></a>

## Does NestJS impose an architecture?

Nest supplies an Angular-inspired framework organization: modules, controllers, providers and request hooks. Its [introduction](https://docs.nestjs.com/) describes this as an out-of-the-box architecture.

Those mechanisms organize execution and registrations. They leave business ownership and inward source rules to the application design. The handbook's exact folders are conventions.

## Read the ticket through each style

<a id="4-layered-separate-kinds-of-work"></a>

### Layered: separate kinds of work

HTTP, creation workflow and persistence form distinct responsibility groups. Conventional layered designs often permit business code to import data access. Our Ticket operation instead requires an inward-owned persistence contract.

Layering and dependency inversion are separate decisions. [Layered Architecture](../styles/layered-architecture/README.md) explains the general model and permitted layer interactions.

<a id="5-hexagonal-separate-the-application-from-its-devices"></a>
<a id="where-are-the-ports-and-adapters-in-this-example"></a>

### Hexagonal: separate the application from its devices

Creation can be called through HTTP or a CLI, and storage can use memory or a database. A **port** describes an interaction; an **adapter** connects an external mechanism to it. [Hexagonal Architecture](../styles/hexagonal-architecture/README.md) owns the general explanation; the table below maps this backend example.

**Where are the Ports and Adapters in this example?.**

Paths are relative to `src/`:

| Artifact | Generic role | Hexagonal reading |
| --- | --- | --- |
| `presentation/http/tickets/controllers/TicketsController.ts` | HTTP Controller | Inbound adapter |
| `application/tickets/use-cases/CreateTicket.ts` — `execute(command)` | Offered operation | Inbound application API |
| `application/tickets/ports/TicketRepository.ts` | Persistence contract | Outbound port |
| `infrastructure/persistence/tickets/adapters/InMemoryTicketRepository.ts` | Memory implementation | Outbound adapter |
| `infrastructure/persistence/tickets/adapters/PrismaTicketRepository.ts` | Prisma implementation | Outbound adapter |

`CreateTicket.execute()` already provides the inbound application operation; another interface file is unnecessary merely to label it a port.

Solid arrows show calls; dashed arrows show source relationships:

```mermaid
%%{init: {"htmlLabels": false, "flowchart": {"htmlLabels": false, "nodeSpacing": 28, "rankSpacing": 48, "diagramPadding": 20, "wrappingWidth": 280}, "sequence": {"wrap": true, "diagramMarginX": 20, "diagramMarginY": 20}}}%%
flowchart TB
    H["TicketsController<br/>inbound adapter"] --> U["CreateTicket<br/>application"]
    CLI["CLI<br/>inbound adapter"] --> U
    U -->|"insert"| I["PrismaTicketRepository<br/>outbound adapter"]
    U -. "requires" .-> P["TicketRepository<br/>outbound port"]
    I -. "implements" .-> P
    I --> DB["Database<br/>external"]
```

<a id="6-clean-protect-different-levels-of-policy"></a>

### Clean: protect different levels of policy

| Clean responsibility | Ticket example |
| --- | --- |
| Entities | Subject and initial-state rules |
| Use Cases | Creation workflow and required persistence |
| Interface Adapters | HTTP and storage-field translation |
| Frameworks & Drivers | Nest, Prisma and database mechanisms |

The [combined outer-module explanation](../foundations/dependency-boundaries.md#combined-outer-modules) describes why translation and framework glue can share an outer file. Inner policy remains independent.

Continue with [Clean on the backend](../styles/clean-architecture/8-clean-on-the-backend.md).

<a id="7-onion-keep-the-domain-model-central"></a>

### Onion: keep the domain model central

Onion starts with `Ticket` as an independent model and places infrastructure outside it. `CreateTicket` surrounds the model with workflow and required interactions.

Here [Application](../../GLOSSARY.md#application-layer) owns `TicketRepository` because creation needs it. Palermo places repository interfaces around the domain model; the essential constraint is that concrete storage depends inward. [Onion on the backend](../styles/onion-architecture/7-onion-on-the-backend.md) develops that interpretation.

<a id="8-compare-without-renaming-everything-into-synonyms"></a>

## Compare without renaming everything into synonyms

Layered groups work, Hexagonal separates devices, Clean distinguishes policy levels, and Onion centers the domain model. Their constraints overlap without making the styles interchangeable.

<a id="9-trade-offs-tests-and-the-next-decision"></a>

## Trade-offs, tests and the next decision

Change a subject rule, replace storage or add a caller. The [Ticket change table](4-create-ticket-with-nestjs.md#review-changes-and-failures-before-calling-it-maintainable) identifies the affected owner.

Use [the exercises](exercises/README.md) to explain those boundaries. Add an abstraction when it protects a real responsibility.

## Sources

[Backend references](references.md) collect the primary architecture and official framework sources used here.

[Previous: Advanced backend Exercises](exercises/advanced.md) · [Next: Architectural Styles](../styles/README.md)
