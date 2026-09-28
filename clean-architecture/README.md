# Clean Architecture

> A progressive guide to Robert C. Martin's policy-centered architecture.

← [Repository home](../README.md) · [Glossary](../GLOSSARY.md) · [Code placement](../foundations/code-placement.md) · [Naming](../conventions/naming-and-file-placement.md)

## 1. History and origin

Robert C. Martin published **"The [Clean Architecture](../GLOSSARY.md#clean-architecture)"** in 2012 as a synthesis of related approaches including [Hexagonal Architecture](../GLOSSARY.md#hexagonal-architecture-ports-and-adapters), [Onion Architecture](../GLOSSARY.md#onion-architecture), Boundary-Control-[Entity](../GLOSSARY.md#domain-entity) and other boundary-oriented designs. He expanded the subject in the 2017 book *[Clean Architecture](../GLOSSARY.md#clean-architecture)*.

The recurring problem is older than the name:

> How do we keep business and application policy from becoming inseparable from databases, web frameworks, UI frameworks, devices and other replaceable mechanisms?

Primary source: https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html

## 2. What problem does it solve?

Without explicit boundaries, code often grows around the framework or database:

```mermaid
flowchart LR
    UI["UI component"] --> HTTP["HTTP client"]
    UI --> STORE["State store"]
    HTTP --> DTO["API DTO"]
    STORE --> RULE["Business rule"]
    DTO --> RULE
```

That produces predictable costs:

- business behavior is duplicated in controllers/components;
- tests need frameworks or databases unnecessarily;
- transport/database schemas become the application's internal model;
- changing technology changes unrelated policy;
- dependency cycles make ownership hard to reason about.

[Clean Architecture](../GLOSSARY.md#clean-architecture) protects policy by making outer mechanisms depend toward inner policy.

It does **not** automatically solve domain modeling, distributed-system reliability, UI composition, team ownership, performance, or deployment topology. Those require separate decisions.

## 3. When Clean Architecture is a strong fit

Good candidates include:

- long-lived business applications;
- systems with meaningful domain/application policy;
- multiple delivery mechanisms such as HTTP, UI, CLI or jobs;
- replaceable or volatile infrastructure/integrations;
- systems where independent testing of policy matters;
- codebases that benefit from enforceable module boundaries.

## 4. When it can be too much

It can be excessive when:

- the application is a tiny prototype;
- almost all behavior is straightforward data display/transport;
- there is no meaningful policy to isolate;
- added [ports](../GLOSSARY.md#port), mapping and indirection cost more than the change they protect against.

[Clean Architecture](../GLOSSARY.md#clean-architecture) is not a score for engineering maturity. Use boundaries where they protect something real.

## 5. The fundamental model

Martin's canonical diagram uses four conceptual circles:

```mermaid
flowchart BT
    F["Frameworks & Drivers"]
    IA["Interface Adapters"]
    UC["Use Cases"]
    E["Entities"]

    F --> IA
    IA --> UC
    UC --> E
```

The essential rule is not "exactly four folders". It is the [Dependency Rule](../GLOSSARY.md#dependency-rule):

> Source-code dependencies cross [architectural boundaries](../GLOSSARY.md#architectural-boundary) toward higher-level policy.

The arrow means **source dependency**, not runtime call direction.

## 6. What each circle owns

The canonical circles are conceptual. A real codebase can split one circle across multiple modules or place several outer mechanisms in one physical area.

Do not confuse the canonical circles with this repository's physical `infrastructure/` folder. A concrete HTTP/database [adapter](../GLOSSARY.md#adapter) may contain both translation behavior and framework/driver glue in one physical module. That pragmatic module is still outer code; it does **not** justify making a canonical [Interface Adapter](../GLOSSARY.md#interface-adapter) depend outward on [Frameworks & Drivers](../GLOSSARY.md#frameworks-and-drivers).

| Clean concept | Owns | Put here | Do not put here | May depend on |
| --- | --- | --- | --- | --- |
| [Entities](../GLOSSARY.md#domain-entity) | enterprise/domain rules that survive delivery changes | entities, [value objects](../GLOSSARY.md#value-object), [invariants](../GLOSSARY.md#invariant), domain policies | React, Redux, HTTP, ORM, API [DTOs](../GLOSSARY.md#data-transfer-object-dto), use-case orchestration | other inner domain concepts |
| [Use Cases](../GLOSSARY.md#use-case) | application-specific operations | commands/results, [application services](../GLOSSARY.md#application-service), required [ports](../GLOSSARY.md#port) | concrete DB/HTTP/UI implementations | entities/domain policy |
| [Interface Adapters](../GLOSSARY.md#interface-adapter) | translation across boundaries | controllers, [presenters](../GLOSSARY.md#presenter), [mappers](../GLOSSARY.md#mapper), boundary-facing [adapters](../GLOSSARY.md#adapter) | authoritative business rules or framework/driver dependencies that would reverse the canonical circle direction | [use cases](../GLOSSARY.md#use-case)/entities and [adapter](../GLOSSARY.md#adapter)-owned translation code |
| [Frameworks & Drivers](../GLOSSARY.md#frameworks-and-drivers) | replaceable technology mechanisms | React, routers, HTTP servers, DB drivers, SDKs, CSS systems | inner policy that only exists because the framework made it convenient | inward abstractions/[adapters](../GLOSSARY.md#adapter) as needed |

### Why isolate them?

Isolation protects **reasons to change**.

- A tax rule changes because the business changes.
- An HTTP [mapper](../GLOSSARY.md#mapper) changes because an API contract changes.
- A component changes because the UI changes.
- A database [adapter](../GLOSSARY.md#adapter) changes because persistence changes.

Putting all four reasons in one file couples unrelated changes and makes replacement/testing more expensive.

## 7. Recommended physical structure

This repository uses a pragmatic mapping that is easier to operate in TypeScript projects:

```mermaid
flowchart TD
    SRC["src/"]
    SRC --> D["domain/"]
    SRC --> A["application/"]
    SRC --> I["infrastructure/"]
    SRC --> P["presentation/"]
    SRC --> C["composition/"]

    D --> DO["orders/"]
    A --> AO["orders/"]
    AO --> AU["use-cases/"]
    AO --> AP["ports/"]
    I --> IO["orders/"]
    P --> PF["features/orders/"]
    C --> CB["bootstrap.ts"]
```

| Path | Owns | Why it exists | Must not contain |
| --- | --- | --- | --- |
| `domain/` | business meaning and [invariants](../GLOSSARY.md#invariant) | policy should survive UI/DB replacement | framework state, HTTP clients, [DTOs](../GLOSSARY.md#data-transfer-object-dto), ORM records |
| `application/` | application operations and required capabilities | orchestration stays independent from concrete mechanisms | React components, SQL/ORM clients, concrete HTTP [adapters](../GLOSSARY.md#adapter) |
| `infrastructure/` | concrete I/O [adapters](../GLOSSARY.md#adapter) and external representations | volatile technology is translated at the boundary | presentation components or authoritative domain policy |
| `presentation/` | rendering, interaction and view-oriented state | UI concerns need their own owner | database/HTTP implementations when the strict boundary is used |
| `composition/` | concrete assembly/bootstrap | one outer place selects implementations | business decisions and use-case branching |

These folder names are a **documentation convention**, not part of Martin's canonical four-circle definition.

For exact placement rules, use **[Code Placement](../foundations/code-placement.md)**.

## 8. Where does a new function, type or helper go?

Start with meaning, not syntax:

```mermaid
flowchart TD
    START{"Why does this code exist?"}
    START -->|"Enforces business truth"| D["domain/"]
    START -->|"Coordinates an application operation"| A["application/"]
    START -->|"Calls DB / HTTP / storage / SDK"| I["infrastructure/"]
    START -->|"Renders / formats / manages UI interaction"| P["presentation/"]
    START -->|"Constructs concrete dependencies"| C["composition/"]
```

Examples:

| Code | Owner | Why | Why not another layer |
| --- | --- | --- | --- |
| `order.cancel()` | [Domain](../GLOSSARY.md#domain) | enforces an order [invariant](../GLOSSARY.md#invariant) | a component/controller would duplicate business truth |
| `cancelOrder(id)` | [Application](../GLOSSARY.md#application-layer) | coordinates loading, domain behavior and persistence | [Domain](../GLOSSARY.md#domain) should not orchestrate external capabilities |
| `HttpOrderRepository.save()` | [Infrastructure](../GLOSSARY.md#infrastructure) | speaks HTTP | [Application](../GLOSSARY.md#application-layer) should not know transport |
| `useOrders()` | [Presentation](../GLOSSARY.md#presentation-layer) | exposes view-oriented state/actions | [Application](../GLOSSARY.md#application-layer) should not know React hooks |
| `ApiOrderDto` | [Infrastructure](../GLOSSARY.md#infrastructure) | describes wire representation | [Domain](../GLOSSARY.md#domain) should not inherit API schema |
| `OrderRowViewModel` | [Presentation](../GLOSSARY.md#presentation-layer) | shapes data for rendering | [Domain](../GLOSSARY.md#domain) should not encode table/display concerns |
| `formatClosureMessage()` | feature-local [Presentation](../GLOSSARY.md#presentation-layer) `lib/` when UI-specific | meaning belongs to one UI capability | generic `utils/` would erase ownership |
| object construction in `bootstrap.ts` | Composition | selects concrete implementations | consumers should not locate dependencies globally |

### A simple rule for helper functions

Do **not** ask "is this a utility?". Ask "who owns its meaning?".

If a helper maps an API [DTO](../GLOSSARY.md#data-transfer-object-dto), it is an [Infrastructure](../GLOSSARY.md#infrastructure) [mapper](../GLOSSARY.md#mapper). If it validates an [invariant](../GLOSSARY.md#invariant), it is [Domain](../GLOSSARY.md#domain). If it formats one feature's UI message, it stays with that feature. Only genuinely cross-feature, stable helpers earn a shared location.

## 9. Dependency isolation

The recommended source [dependency graph](../GLOSSARY.md#dependency-graph) is:

```mermaid
flowchart LR
    PRES["Presentation"] --> APP["Application"]
    INFRA["Infrastructure"] --> APP
    APP --> DOMAIN["Domain"]

    ROOT["Composition"] -. "constructs" .-> PRES
    ROOT -. "constructs" .-> INFRA
    ROOT -. "constructs" .-> APP
```

A [use case](../GLOSSARY.md#use-case) may call outward at runtime through an injected [port](../GLOSSARY.md#port), but the source code still depends inward.

Example:

```ts
// application/orders/ports/OrderRepository.ts
export interface OrderRepository {
  findById(id: OrderId): Promise<Order | null>
  save(order: Order): Promise<void>
}
```

```ts
// infrastructure/orders/HttpOrderRepository.ts
export class HttpOrderRepository implements OrderRepository {
  // HTTP-specific implementation
}
```

[Application](../GLOSSARY.md#application-layer) owns the capability it needs; [Infrastructure](../GLOSSARY.md#infrastructure) adapts to it.

Read **[The Dependency Rule](./1-the-dependency-rule.md)** for the deeper explanation.

## 10. Naming before implementation

Use **[Naming and File Placement Conventions](../conventions/naming-and-file-placement.md)** before adding a file.

| Role | Recommended example |
| --- | --- |
| entity / [value object](../GLOSSARY.md#value-object) | `Order.ts`, `Money.ts` |
| [use case](../GLOSSARY.md#use-case) | `cancelOrder.ts` |
| application [port](../GLOSSARY.md#port) | `OrderRepository.ts`, `PaymentGateway.ts` |
| concrete [adapter](../GLOSSARY.md#adapter) | `HttpOrderRepository.ts` |
| [DTO](../GLOSSARY.md#data-transfer-object-dto) | `orderApi.dto.ts` |
| [mapper](../GLOSSARY.md#mapper) | `orderApi.mapper.ts` |
| React component | `CancelOrderButton.tsx` |
| feature hook/[facade](../GLOSSARY.md#facade-pattern) | `useOrders.ts` |

The architecture does not mandate these suffixes. They are repository conventions chosen to make role and ownership visible.

## 11. First feature end to end

Requirement:

> A user cancels an order. Shipped orders cannot be cancelled. A successful cancellation must be persisted through an HTTP API.

Place each artifact deliberately:

| Artifact | File | Owner | Why here | Why not elsewhere |
| --- | --- | --- | --- | --- |
| cancellation [invariant](../GLOSSARY.md#invariant) | `domain/orders/Order.ts` | [Domain](../GLOSSARY.md#domain) | business truth | UI/API/database changes must not alter it |
| persistence capability | `application/orders/ports/OrderRepository.ts` | [Application](../GLOSSARY.md#application-layer) | [use case](../GLOSSARY.md#use-case) requires load/save | concrete HTTP does not belong inward |
| operation | `application/orders/use-cases/cancelOrder.ts` | [Application](../GLOSSARY.md#application-layer) | coordinates the workflow | [Domain](../GLOSSARY.md#domain) should not perform I/O |
| HTTP implementation | `infrastructure/orders/HttpOrderRepository.ts` | [Infrastructure](../GLOSSARY.md#infrastructure) | translates transport | [Presentation](../GLOSSARY.md#presentation-layer)/[Application](../GLOSSARY.md#application-layer) must not own HTTP details |
| UI [facade](../GLOSSARY.md#facade-pattern) | `presentation/features/orders/model/useOrders.ts` | [Presentation](../GLOSSARY.md#presentation-layer) | exposes view-oriented operation/state | [Domain](../GLOSSARY.md#domain)/[Application](../GLOSSARY.md#application-layer) should not know React |
| button | `presentation/features/orders/ui/CancelOrderButton.tsx` | [Presentation](../GLOSSARY.md#presentation-layer) | rendering + user gesture | business rule does not belong in JSX |
| wiring | `composition/bootstrap.ts` | Composition | connects concrete objects | inner modules must not resolve the container |

Runtime behavior:

```mermaid
sequenceDiagram
    actor User
    participant View as CancelOrderButton
    participant VM as useOrders
    participant UC as cancelOrder
    participant Order as Order
    participant Adapter as HttpOrderRepository

    User->>View: click Cancel
    View->>VM: cancel(orderId)
    VM->>UC: execute(orderId)
    UC->>Adapter: findById(orderId) through OrderRepository contract
    Adapter-->>UC: Order
    UC->>Order: cancel()
    UC->>Adapter: save(order) through OrderRepository contract
```

Source dependencies remain inward even though runtime control reaches the outer [adapter](../GLOSSARY.md#adapter).

For the full build, continue to **[Building a Feature End-to-End](./4-building-a-feature.md)**.

## 12. Testing the boundaries

| Test scope | What it proves | Typical dependency strategy |
| --- | --- | --- |
| [Domain](../GLOSSARY.md#domain) unit test | [invariant](../GLOSSARY.md#invariant)/business behavior | no UI/DB/framework |
| [Application](../GLOSSARY.md#application-layer) use-case test | orchestration | [fake](../GLOSSARY.md#fake)/[stub](../GLOSSARY.md#stub) required [ports](../GLOSSARY.md#port) |
| [Infrastructure](../GLOSSARY.md#infrastructure) integration test | mapping and real technical behavior | real or controlled external dependency |
| [Presentation](../GLOSSARY.md#presentation-layer) test | rendering/view behavior | [fake](../GLOSSARY.md#fake) application operation or configured presentation [store](../GLOSSARY.md#store) |
| [Architecture test](../GLOSSARY.md#architecture-test) | [dependency graph](../GLOSSARY.md#dependency-graph) remains legal | inspect imports/modules |
| End-to-end test | critical executable journey | complete graph |

Do not use percentages as architectural quotas. Put tests where the relevant risk can be observed cheaply and reliably.

See **[Testing in Clean Architecture](./5-testing-in-clean.md)**.

## 13. Trade-offs and common failure modes

The cost of stronger boundaries is more explicit code: contracts, mapping, modules and composition.

Common failures:

- **folder-only architecture** — files have correct folder names but imports violate dependency direction;
- **ceremonial interfaces** — one interface is created for every class/endpoint without a boundary reason;
- **god [application service](../GLOSSARY.md#application-service)** — unrelated [use cases](../GLOSSARY.md#use-case) accumulate under one generic service;
- **[service locator](../GLOSSARY.md#service-locator)** — consumers import the container instead of receiving dependencies;
- **[DTO](../GLOSSARY.md#data-transfer-object-dto) leakage** — transport/ORM/browser types become inner models;
- **framework leakage** — React/Redux/ORM APIs appear in [Application](../GLOSSARY.md#application-layer)/[Domain](../GLOSSARY.md#domain);
- **anemic ceremony** — layers are added to a trivial CRUD screen without policy worth protecting.

## 14. Progressive learning path

Read in this order:

1. **[Dependency Rule](./1-the-dependency-rule.md)**
2. **[Four Circles](./2-the-four-layers.md)**
3. **[Project Structure](./3-project-structure.md)**
4. **[Build a Feature End-to-End](./4-building-a-feature.md)**
5. **[Testing](./5-testing-in-clean.md)**
6. **[Composition & DI](./6-composition-and-di.md)**
7. **[Evolution & Scaling](./7-scaling-and-patterns.md)**
8. **[Backend](./8-clean-on-the-backend.md)**

The first three chapters deepen concepts already introduced here. Advanced mechanisms come only after placement and dependencies are clear.

## 15. What Clean Architecture does not require

It does not require:

- frontend/backend source files to be identical;
- a class for every [use case](../GLOSSARY.md#use-case);
- a [Repository pattern](../GLOSSARY.md#repository) for every endpoint;
- a [DI container](../GLOSSARY.md#di-container);
- a specific framework;
- exactly four physical folders;
- [microservices](../GLOSSARY.md#microservice).

Those are separate design decisions.

## Sources

- Robert C. Martin, "The [Clean Architecture](../GLOSSARY.md#clean-architecture)" (2012): https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html
- Robert C. Martin, *[Clean Architecture](../GLOSSARY.md#clean-architecture): A Craftsman's Guide to Software Structure and Design* (2017)
- Alistair Cockburn, "[Hexagonal Architecture](../GLOSSARY.md#hexagonal-architecture-ports-and-adapters)": https://alistair.cockburn.us/hexagonal-architecture/
- Jeffrey Palermo, "The [Onion Architecture](../GLOSSARY.md#onion-architecture)" series: https://jeffreypalermo.com/2008/07/
- Martin Fowler, "[Presentation Model](../GLOSSARY.md#presentation-model)": https://martinfowler.com/eaaDev/PresentationModel.html
- Mark Seemann, "[Composition Root](../GLOSSARY.md#composition-root)": https://blog.ploeh.dk/2011/07/28/CompositionRoot/
