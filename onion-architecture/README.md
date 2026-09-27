# Onion Architecture

> A domain-centered architecture in which dependencies point inward and technical infrastructure remains at the edge.

← [Architecture overview](../README.md) · [Foundations](../foundations/README.md) · [Frontend architecture](../frontend/README.md) · [Clean Architecture](../clean-architecture)

---

## 1. Scope

Jeffrey Palermo introduced Onion Architecture for applications with substantial domain behavior and long expected lifetimes. His original guidance explicitly contrasts that target with small websites where the additional abstraction may not pay for itself.

The model is therefore a tool for managing complexity, not a default folder template for every program.

Its central goals are:

- keep the domain model independent from infrastructure;
- place application behavior around the domain;
- depend on interfaces/contracts toward the center;
- push databases, UI frameworks, web services and other mechanisms outward.

## 2. Relationship to Clean and Hexagonal

Onion, Clean Architecture and Ports & Adapters share a family resemblance:

```text
volatile mechanisms
        |
        v
adapters / infrastructure / UI
        |
        v
application policy
        |
        v
domain
```

They should not be described as producing "identical code".

- **Onion** emphasizes a domain model at the center and inward dependencies.
- **Clean** emphasizes policies vs. mechanisms with Entities, Use Cases, Interface Adapters and Frameworks/Drivers.
- **Hexagonal** emphasizes ports as purposeful conversations and adapters connecting external actors to the application.

A real system can use ideas from all three while documenting which boundaries it actually enforces.

## 3. The rings

This guide uses four practical areas:

```text
Domain
Application
Infrastructure
Presentation
```

Infrastructure and Presentation are both outer concerns. Neither is a privileged middle layer that inner policy depends upon.

Detailed definitions remain in **[The Rings](1-the-rings.md)**.

## 4. Dependency rule

Recommended source dependency policy:

```text
domain
  -> domain

application
  -> application, domain

infrastructure
  -> infrastructure, application, domain

presentation
  -> presentation, application
```

Composition sits at the outer edge and assembles concrete implementations.

See:

- **[Inward Dependencies](2-inward-dependencies.md)**
- **[Dependency Boundaries](../foundations/dependency-boundaries.md)**
- **[Composition Root](../foundations/composition-root.md)**

## 5. Frontend application

Onion tells us where business/application policy should sit relative to technical UI mechanisms. It does not prescribe the internal layout of a large Presentation ring.

Canonical frontend guidance is centralized in:

- **[Presentation Architecture](../frontend/presentation-architecture.md)**
- **[State Management](../frontend/state-management.md)**
- **[Styling and Design Systems](../frontend/styling-and-design-system.md)**

This keeps React/Redux/Panda guidance out of the definition of Onion itself.

## 6. Why use Onion?

It is valuable when:

- the application has meaningful domain behavior;
- infrastructure is expected to change;
- business rules deserve isolated tests;
- multiple delivery mechanisms consume the same application policy;
- the project is expected to live long enough for boundary protection to repay its cost.

It may be unnecessary when:

- the application is tiny;
- most behavior is simple data transport;
- there is little policy worth protecting;
- the abstraction cost is greater than the expected change cost.

Architectural rigor includes knowing when **not** to add architecture.

## 7. Type placement in Onion Architecture
<a id="type-placement-in-onion-architecture"></a>

Type ownership follows meaning, not convenience:

| Type | Owner |
| --- | --- |
| domain concept / value object | Domain |
| use-case input/output / required port | Application |
| external DTO / storage record / SDK type | Infrastructure |
| component props / ViewModel / form state | Presentation |

Examples:

```text
ClosurePeriod            -> domain
ExecuteClosureCommand    -> application
ApiClosureResponseDto    -> infrastructure
ClosureFormState         -> presentation
UploadQueueItem          -> presentation
```

A `type` import still creates source coupling even though TypeScript erases it at runtime.

For the fuller rules, see **[Dependency Boundaries](../foundations/dependency-boundaries.md)**.

## 8. Naming & Conventions
<a id="naming--conventions"></a>

Naming is a project convention, not Onion Architecture.

A useful default:

```text
src/
├── domain/
├── application/
├── infrastructure/
├── presentation/
└── composition/
```

Within each area, prefer capability ownership:

```text
application/
├── auth/
├── closures/
└── orders/
```

rather than global buckets such as `services/` or `helpers/`.

Use path aliases only when they make ownership visible rather than obscure it.

Use explicit public APIs for non-trivial modules.

See **[Module Boundaries and Public APIs](../foundations/module-boundaries-and-public-apis.md)**.

## 9. Guide

- **[1 · The Rings](1-the-rings.md)**
- **[2 · Inward Dependencies](2-inward-dependencies.md)**
- **[3 · Testing the Rings](3-testing-in-onion.md)**
- **[4 · Advanced Patterns](4-advanced-patterns.md)**
- **[5 · Styling & Animation](5-styling-and-animation.md)** — now redirects to the central frontend design-system guidance while retaining Onion placement notes.
- **[6 · Scaling](6-scaling.md)**
- **[References](references.md)**

## Sources

- Jeffrey Palermo, "The Onion Architecture" series (2008): https://jeffreypalermo.com/2008/07/
- Robert C. Martin, "The Clean Architecture" (2012): https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html
- Alistair Cockburn, "Hexagonal Architecture" (2005): https://alistair.cockburn.us/hexagonal-architecture/
