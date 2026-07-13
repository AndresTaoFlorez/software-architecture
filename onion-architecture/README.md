# Onion Architecture for the Frontend

> A reusable blueprint for structuring frontend applications around stable business rules, drawn as
> four concentric rings. Written to be applied to any new project, and to be defensible: every
> prescriptive claim is tied to a verifiable source in [References](references.md).

← Back to [architecture overview](../README.md) · Compare with the [Clean Architecture guide](../clean-architecture)

---

## Contents

This guide is split across several files. Each keeps its original **§ number as a stable identifier**, so
a reference to "§5.4" always means the same thing, wherever it is read.

- **[1 · The Rings](1-the-rings.md)** — *§3: Domain · Application · Infrastructure · Presentation*
- **[2 · Inward Dependencies](2-inward-dependencies.md)** — *§2 + §4: the Dependency Rule and how it plays out in imports*
- **[3 · Testing the Rings](3-testing-in-onion.md)** — *§5: per-layer test doubles, the test pyramid on the onion*
- **[4 · Advanced Patterns](4-advanced-patterns.md)** — *§8: CRDT sync, optimistic updates, token refresh, feature folders*
- **[5 · Styling & Animation](5-styling-and-animation.md)** — *Presentation-ring styling layout*
- **[6 · Scaling: Startup to Enterprise](6-scaling.md)** — *§9: the four growth phases, decision tree, red flags*
- **[7 · Type Placement](#type-placement-in-onion-architecture)** — *where TypeScript types live by ownership*
- **[8 · Naming & Conventions](#naming--conventions)** — *portable defaults for files and folders*
- **[References](references.md)** — *§10: every cited source*

The interactive demo lives in [Onion Architecture.html](Onion%20Architecture.html).

---

## 1. Introduction & Purpose

This document describes a frontend architecture organized into **four concentric rings**,
**Domain**, **Application**, **Infrastructure**, and **Presentation**. Its purpose is to be a single
authoritative reference: a blueprint that can be reproduced across projects regardless of the specific
framework in use, and a rationale that explains *why* each ring exists.

The central goal is one idea: **protect business rules from volatile details.** User interfaces, HTTP
clients, state-management libraries, and storage mechanisms change frequently; the meaning of the
business does not. An architecture earns its keep when the parts that change often cannot force changes
on the parts that should stay stable.

The model presented here is not new. It synthesizes four well-established bodies of work and adapts them
to the frontend:

- **Onion Architecture**: concentric layers with dependencies pointing inward [Palermo 2008].
- **Clean Architecture**: the Dependency Rule and the separation of entities, use cases, and details
  [Martin 2012; Martin 2017]. *(See the [Clean Architecture guide](../clean-architecture) for that framing.)*
- **Hexagonal Architecture (Ports & Adapters)**: isolating the core behind explicit interfaces
  [Cockburn 2005].
- **Domain-Driven Design**: entities and a domain model as the heart of the system [Evans 2003].

What follows treats the frontend as a first-class application with its own domain, not merely a "view" of
a backend. The same layering that protects server-side business rules protects client-side ones.

The single rule that holds the whole model together — *dependencies point inward* — is detailed in
[Inward Dependencies](2-inward-dependencies.md). The four rings themselves are in [The Rings](1-the-rings.md).

---

## 6. Why This Architecture
<a id="why-this-architecture"></a>

Each benefit below is a direct consequence of the Dependency Rule and dependency inversion.

- **Testability without infrastructure.** Because inner rings depend only on abstractions, use cases and
  entities can be tested with fakes and with no network, framework, or DOM, the mechanism is laid out in
  full in [§5](3-testing-in-onion.md#5-testing-the-layers). Independence from frameworks and from the UI is an explicit, stated
  goal of Clean Architecture [Martin 2017].
- **Replaceable details.** Transport, storage, and UI sit in outer rings behind ports, so they can be
  swapped, REST to GraphQL, Axios to Fetch, one UI framework to another, by rewriting adapters, not the
  core. This substitutability is the defining promise of Ports & Adapters [Cockburn 2005].
- **Independent evolution.** The domain can grow without waiting on UI decisions, and the UI can be
  redesigned without risking business rules, because neither names the other [Palermo 2008].
- **Intent-revealing structure.** Top-level folders name *what the application does* (its domain and use
  cases) before *how it is delivered*, so the structure communicates purpose, the "screaming
  architecture" idea [Martin 2017].
- **A model worth talking about.** A rich, isolated domain model gives the whole team a shared, precise
  vocabulary, which is the central payoff of Domain-Driven Design [Evans 2003].

**Frontend-specific payoff.** On the client these benefits compound, because the frontend is where
technology churns fastest. A new rendering framework, a migration from polling to WebSocket, or an
offline/optimistic strategy can all be introduced as outer-ring changes. The business meaning, encoded in
entities and use cases, survives untouched. In a field where the average tool's lifespan is short, placing
the durable asset at the protected center is the architecture's highest-value property.

---

## 7. Type placement in Onion Architecture
<a id="type-placement-in-onion-architecture"></a>

In a TypeScript project using Onion Architecture, types should live in the layer
that owns their meaning.

Avoid using a generic `src/types/` folder as the default place for all types. It
usually becomes a dumping ground and makes architectural boundaries unclear.

Rule:

> A type belongs to the innermost layer that owns its meaning.

### Domain

Use `domain/` for product concepts that would still exist without React, Redux,
HTTP, storage, or any external framework.

Examples:

```text
SupportCase
CaseStatus
KnowledgeDocument
ResponseProposal
WorkflowNodeStatus
CurrentUser
Permission
```

Suggested location:

```text
domain/<feature>/entities/
domain/<feature>/value-objects/
domain/<feature>/errors/
domain/shared/
```

### Application

Use `application/` for use case inputs, outputs, commands, queries, and ports.

Examples:

```text
GetCaseDetailInput
GetCaseDetailResult
SearchKnowledgeCommand
CaseRepository
SessionRepository
WorkflowEventsPort
```

Suggested location:

```text
application/use-cases/<feature>/
application/ports/<feature>/
application/shared/
```

### Infrastructure

Use `infrastructure/` for external shapes and adapter-specific types: API DTOs,
generated OpenAPI types, SSE payloads, persistence records, storage records, and
mapper inputs.

Examples:

```text
ApiCaseResponseDto
OpenApiCaseSchema
SseWorkflowEventPayload
LocalStorageThemeRecord
```

Suggested location:

```text
infrastructure/api/generated/
infrastructure/api/dtos/
infrastructure/api/mappers/
infrastructure/events/
infrastructure/storage/
```

Generated API types should not leak into `domain/` or `presentation/`. Map them
at the infrastructure boundary.

### Presentation

Use `presentation/` for visual types: component props, view models, view state,
UI commands, table columns, form state, and visual variants.

Examples:

```text
CaseHeaderProps
CaseReviewViewModel
TableColumnDefinition
ButtonVariant
ToastState
```

Suggested location:

```text
presentation/components/<feature>/<Component>.types.ts
presentation/view-models/<feature>/
presentation/store/
presentation/shared/
```

Component-specific props should stay colocated with the component:

```text
presentation/components/case-review/
├── CaseHeader.tsx
├── CaseHeader.types.ts
├── CaseHeader.module.css
└── CaseHeader.gsap.ts
```

### Decision rules

Ask:

```text
Would this type still exist if there were no React components?
```

If yes, it probably does not belong in `components/`.

Ask:

```text
Does this type describe the external API shape?
```

If yes, it belongs in `infrastructure/`, not in `domain/`.

Ask:

```text
Does this type describe how a screen renders something?
```

If yes, it belongs in `presentation/`.

### Import rule

TypeScript `type` imports also count as architectural dependencies. Even if they
are erased at runtime, they still create source-level coupling.

Allowed direction:

```text
presentation / infrastructure / composition
        ↓
application
        ↓
domain
```

Allowed:

```ts
import type { SupportCase } from '@/domain/cases/entities/SupportCase'
```

Not allowed from `domain/`:

```ts
import type { ApiCaseResponseDto } from '@/infrastructure/api/generated'
import type { CaseHeaderProps } from '@/presentation/components/case-review/CaseHeader.types'
```

### Quick reference

| Type kind              | Layer                       | Example                                       |
| ---------------------- | --------------------------- | --------------------------------------------- |
| Product concept        | `domain/`                   | `SupportCase`, `CaseStatus`                   |
| Value object           | `domain/`                   | `Confidence`, `Permission`                    |
| Use case input/output  | `application/`              | `GetCaseDetailInput`, `SearchKnowledgeResult` |
| Port/interface         | `application/ports/`        | `CaseRepository`, `SessionRepository`         |
| API DTO/generated type | `infrastructure/`           | `ApiCaseResponseDto`, `OpenApiWorkflowEvent`  |
| Mapper type            | `infrastructure/`           | `CaseDtoMapperInput`                          |
| View model             | `presentation/view-models/` | `CaseReviewViewModel`                         |
| Component props        | `presentation/components/`  | `CaseHeaderProps`                             |
| Visual variant         | `presentation/`             | `ButtonVariant`, `BadgeTone`                  |

### Avoid

Avoid this as the default structure:

```text
src/types/
├── cases.ts
├── users.ts
├── api.ts
├── ui.ts
└── common.ts
```

Small shared folders are acceptable only inside the layer that owns the meaning:

```text
domain/shared/
application/shared/
presentation/shared/
```

Do not use shared folders as a shortcut for unclear ownership.

## 8. Naming & Conventions (portable defaults)
<a id="naming--conventions"></a>

These defaults make the rules above visible in the file system. They are recommendations, not laws, but
adopting them across projects keeps the structure recognizable.

**Folder layout.**

```
src/
├── domain/
│   ├── entities/          # PascalCase: User.js, Order.js
│   └── errors/            # DomainErrors.js
├── application/
│   ├── ports/             # interfaces the use cases depend on
│   └── use-cases/         # camelCase: createUserUseCase.js, grouped by concept
├── infrastructure/
│   ├── http/              # client.js, ApiError.js
│   ├── repositories/      # PascalCase adapters: UserRepository.js
│   └── realtime/          # wsClient.js
└── presentation/
    ├── views/             # PascalCase: LoginView.vue
    ├── components/        # grouped by feature + a shared/ folder (see §8.5)
    ├── stores/            # camelCase: useUserStore.js
    ├── router/            # route definitions + guards
    └── styles/            # design tokens + component styles (see 5-styling-and-animation.md)
```

**Conventions.**
- **Path alias.** Map `@` to `src/` so imports are absolute and the layer is always visible in the path
  (`@/domain/...`, `@/application/...`). Relative `../../..` chains hide layer crossings.
- **File naming.** PascalCase for entities, repositories, and components; camelCase for use cases, stores,
  and composables.
- **Test placement.** Co-locate tests in `__tests__/` siblings, named `<Unit>.test.js`, mirroring the
  layer they cover, see [§5.6](3-testing-in-onion.md#56-where-tests-live).
- **Import boundaries.** Treat the allowed/forbidden table in [§4.1](2-inward-dependencies.md#41-allowed-and-forbidden-imports) as
  a lint target; an automated import-boundary check turns the Dependency Rule into a guarantee rather than
  a guideline.
- **Styles out of components.** Keep structural styles in dedicated files rather than inside component
  markup, reserving inline styles for genuinely runtime-driven values (positions, computed sizes, per-entity
  colors). This keeps the Presentation layer's components focused on structure and behavior. Two layouts for
  those dedicated style and animation files, a mirrored `styles/` tree or colocation in the feature folder,
  are described in the companion document [5-styling-and-animation.md](5-styling-and-animation.md).
- **Components by feature.** Group components into feature folders (`components/auth/`, `components/orders/`)
  with a `shared/` folder for cross-feature primitives, rather than a flat `components/` directory, see
  [§8.5](4-advanced-patterns.md#85-feature-based-component-organization-presentation).
