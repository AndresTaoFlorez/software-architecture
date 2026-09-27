# Clean Architecture

> A progressive guide to Robert C. Martin's policy-centered architecture.

← [Repository home](../README.md) · [Glossary](../GLOSSARY.md) · [Code placement](../foundations/code-placement.md) · [Naming](../conventions/naming-and-file-placement.md)

## 1. History and origin

Robert C. Martin published **"The Clean Architecture"** in 2012 as a synthesis of related ideas from Hexagonal Architecture, Onion Architecture, Boundary-Control-Entity and other approaches. He later expanded the subject in the 2017 book *Clean Architecture*.

The recurring problem is older than the name:

> How do we keep business/application policy from becoming inseparable from databases, web frameworks, UI frameworks, devices and other replaceable mechanisms?

Primary source: https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html

## 2. What problem does it solve?

Without explicit boundaries, code often evolves toward this:

```mermaid
flowchart LR
    UI["UI component"] --> HTTP["HTTP client"]
    UI --> STORE["State store"]
    HTTP --> DTO["API DTO"]
    STORE --> RULE["Business rule"]
    DTO --> RULE
```

The consequences are familiar:

- business behavior is duplicated in UI/controllers;
- tests need frameworks/databases unnecessarily;
- transport/database shapes become the application's internal model;
- changing a framework changes unrelated policy;
- dependencies become cyclic and difficult to reason about.

Clean Architecture protects the policy from those mechanisms.

## 3. When Clean Architecture is a strong fit

Good candidates:

- long-lived business applications;
- systems with meaningful domain/application policy;
- multiple delivery mechanisms (HTTP, UI, CLI, jobs);
- replaceable infrastructure/integrations;
- codebases where independent testing of policy matters;
- teams that need enforceable module boundaries.

## 4. When it can be too much

It may be excessive when:

- the application is a tiny prototype;
- almost all behavior is straightforward data display/transport;
- no meaningful policy exists to isolate;
- extra interfaces/mappers create more complexity than the external technology itself.

Clean Architecture is not a score for "seriousness". Use it where boundaries protect something valuable.

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

The essential rule is not "exactly four folders". It is:

> Source-code dependencies cross boundaries toward higher-level policy.

## 6. What each circle means

| Clean concept | Responsibility | Typical examples | Must not depend on |
| --- | --- | --- | --- |
| Entities | core business rules | `Order`, `Money`, invariants | use cases, UI, DB/frameworks |
| Use Cases | application-specific operations | `cancelOrder`, input/output contracts | concrete adapters/frameworks |
| Interface Adapters | translate representations | controller, presenter, mapper, gateway adapter | outer framework details leaking inward |
| Frameworks & Drivers | replaceable mechanisms | React, database driver, HTTP server, SDK | — |

A real TypeScript project commonly maps those ideas into `domain/`, `application/`, `infrastructure/`, `presentation/`, plus `composition/`.

## 7. Recommended physical structure

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

| Path | Why it exists |
| --- | --- |
| `domain/` | protects business meaning from technology |
| `application/` | owns application operations and the capabilities they require |
| `infrastructure/` | contains concrete I/O adapters and external representations |
| `presentation/` | owns rendering, interaction and view state |
| `composition/` | selects and connects concrete implementations |

For exact placement decisions, use **[Code Placement](../foundations/code-placement.md)**.

## 8. Where does a new function go?

```mermaid
flowchart TD
    START{"What does the function do?"}
    START -->|"Enforces business invariant"| D["domain/"]
    START -->|"Coordinates a use case"| A["application/"]
    START -->|"Calls DB / HTTP / storage / SDK"| I["infrastructure/"]
    START -->|"Formats / renders / handles UI state"| P["presentation/"]
    START -->|"Constructs concrete dependencies"| C["composition/"]
```

Examples:

- `order.cancel()` → Domain.
- `cancelOrder(id)` → Application.
- `HttpOrderRepository.save()` → Infrastructure.
- `useOrders()` → Presentation.
- constructing `HttpOrderRepository` → Composition.

## 9. Dependency isolation

```mermaid
flowchart LR
    PRES["Presentation"] --> APP["Application"]
    INFRA["Infrastructure"] --> APP
    APP --> DOMAIN["Domain"]
    ROOT["Composition"] -. "constructs" .-> PRES
    ROOT -. "constructs" .-> INFRA
    ROOT -. "constructs" .-> APP
```

Runtime calls may go outward through an injected port. Source dependencies still remain inward.

That distinction is explained in **[The Dependency Rule](./1-the-dependency-rule.md)**.

## 10. Naming before implementation

Use **[Naming and File Placement Conventions](../conventions/naming-and-file-placement.md)**.

Typical names:

| Role | Example |
| --- | --- |
| entity/value object | `Order.ts`, `Money.ts` |
| use case | `cancelOrder.ts` |
| port | `OrderRepository.ts` |
| adapter | `HttpOrderRepository.ts` |
| React component | `CancelOrderButton.tsx` |
| feature hook | `useOrders.ts` |

## 11. Progressive learning path

1. **[Dependency Rule](./1-the-dependency-rule.md)**
2. **[Four Circles](./2-the-four-layers.md)**
3. **[Project Structure](./3-project-structure.md)**
4. **[Build a Feature End-to-End](./4-building-a-feature.md)**
5. **[Testing](./5-testing-in-clean.md)**
6. **[Composition & DI](./6-composition-and-di.md)**
7. **[Evolution & Scaling](./7-scaling-and-patterns.md)**
8. **[Backend](./8-clean-on-the-backend.md)**

Advanced topics come after the structure and dependency rules, not before them.

## 12. What Clean Architecture does not require

It does not require:

- frontend/backend source files to be identical;
- a class for every use case;
- a Repository for every endpoint;
- a DI container;
- a specific framework;
- a fixed folder count;
- microservices.

Those are separate design decisions.

## Sources

- Robert C. Martin, "The Clean Architecture" (2012): https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html
- Robert C. Martin, *Clean Architecture: A Craftsman's Guide to Software Structure and Design* (2017)
- Alistair Cockburn, "Hexagonal Architecture": https://alistair.cockburn.us/hexagonal-architecture/
- Jeffrey Palermo, Onion Architecture series: https://jeffreypalermo.com/2008/07/
