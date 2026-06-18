# Onion Architecture for the Frontend — A Four-Layer Guide

> A reusable blueprint for structuring frontend applications around stable business rules.
> Written to be applied to any new project, and to be defensible: every prescriptive claim is
> tied to a verifiable source listed in [§10 References](#10-references).

---

## Table of Contents

This guide is split across several files. The **core model lives here**; the larger, self-contained
sections live in their own companion documents. Files are numbered by reading order, but each section keeps
its original **§ number as a stable identifier** — so a reference to "§5.4" always means the same thing,
wherever it is read.

**In this document**

- §1 · [Introduction & Purpose](#1-introduction--purpose)
- §2 · [Core Principle: The Dependency Rule](#2-core-principle-the-dependency-rule)
- §4 · [Dependency Direction in Practice](#4-dependency-direction-in-practice)
- §6 · [Why This Architecture](#6-why-this-architecture)
- §7 · [Naming & Conventions](#7-naming--conventions-portable-defaults)
- §10 · [References](#10-references)

**Companion documents**

- [1 · The Four Layers](1-the-four-layers.md) — *§3: Domain · Application · Infrastructure · Presentation*
- [2 · Testing the Layers](2-testing.md) — *§5: per-layer test doubles, the test pyramid on the onion*
- [3 · Advanced Patterns](3-advanced-patterns.md) — *§8: CRDT sync, optimistic updates, token refresh, feature folders*
- [4 · Scaling: From Startup to Enterprise](4-scaling.md) — *§9: the four growth phases, decision tree, red flags*
- [5 · Styling & Animation Architecture](5-styling-and-animation.md) — *Presentation-layer styling layout*

---

## 1. Introduction & Purpose

This document describes a frontend architecture organized into **four concentric layers** —
**Domain**, **Application**, **Infrastructure**, and **Presentation**. Its purpose is to be a single
authoritative reference: a blueprint that can be reproduced across projects regardless of the specific
framework in use, and a rationale that explains *why* each rule exists.

The central goal is one idea: **protect business rules from volatile details.** User interfaces, HTTP
clients, state-management libraries, and storage mechanisms change frequently; the meaning of the
business does not. An architecture earns its keep when the parts that change often cannot force changes
on the parts that should stay stable.

The model presented here is not new. It synthesizes four well-established bodies of work and adapts them
to the frontend:

- **Onion Architecture** — concentric layers with dependencies pointing inward [Palermo 2008].
- **Clean Architecture** — the Dependency Rule and the separation of entities, use cases, and details
  [Martin 2012; Martin 2017].
- **Hexagonal Architecture (Ports & Adapters)** — isolating the core behind explicit interfaces
  [Cockburn 2005].
- **Domain-Driven Design** — entities and a domain model as the heart of the system [Evans 2003].

What follows treats the frontend as a first-class application with its own domain, not merely a "view" of
a backend. The same layering that protects server-side business rules protects client-side ones.

---

## 2. Core Principle: The Dependency Rule

### 2.1 The concentric model

The four layers are best visualized as concentric rings. The innermost ring is the most abstract and the
most stable; the outermost rings are the most concrete and the most volatile.

![Clean Architecture Diagram by Robert C. Martin (Uncle Bob)](https://blog.cleancoder.com/uncle-bob/images/2012-08-13-the-clean-architecture/CleanArchitecture.jpg)

*Image source: "The Clean Code Blog" by Robert C. Martin (Uncle Bob), August 13, 2012.*  
*This is the canonical Clean Architecture model diagram that inspired the frontend adaptation in this document.*  
*Original article: [The Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)*

**Dependencies flow inward:** Domain → Application → Infrastructure & Presentation. Nothing in an inner layer may know about an outer layer.

---

A clarification on placement: in the canonical model, **Infrastructure and Presentation are both *outer
details***. Infrastructure does not sit "above" the Application layer as a privileged middle tier — it is
an outer ring that *implements* what the inner rings declare. The Application layer is closer to the core
than any technical detail. This positioning is what makes the architecture an *onion* rather than a plain
top-down stack [Palermo 2008; Martin 2017].

### 2.2 The Dependency Rule

> Source-code dependencies must point only inward. Nothing in an inner layer may know anything about an
> outer layer [Martin 2012].

Concretely:

- The **Domain** layer depends on nothing.
- The **Application** layer depends only on the Domain.
- **Infrastructure** and **Presentation** depend on the inner layers, never the reverse.

The name of a class, function, or variable declared in an outer layer must never be mentioned by code in
an inner layer. This is the single rule from which most of the benefits in [§6](#6-why-this-architecture)
follow.

### 2.3 Dependency Inversion: the mechanism

The Dependency Rule raises an obvious tension. A use case must, eventually, fetch data over HTTP — yet
HTTP is an outer detail the use case is forbidden to depend on. The resolution is the **Dependency
Inversion Principle**: high-level modules should not depend on low-level modules; both should depend on
abstractions [Martin 2003 (SOLID); Martin 2017].

The Application layer declares an **interface (a "port")** describing the data operations it needs. The
Infrastructure layer provides a concrete implementation (an "adapter") of that port. At runtime the
adapter is injected into the use case. The arrow of *source-code dependency* now points inward — the
adapter depends on the port, not the other way around — even though the *flow of control* at runtime
moves outward into Infrastructure. This is precisely the ports-and-adapters arrangement of Hexagonal
Architecture [Cockburn 2005].

```
   Application defines the port        Infrastructure implements it
   ─────────────────────────────      ──────────────────────────────
   interface UserRepository  ◄───────  class HttpUserRepository
     fetchAll(): User[]                   (uses axios, maps JSON → User)

           ▲                                       │
           │ depends on (inward)                   │ implements
           └───────────────────────────────────────┘
```

### 2.4 Why this matters specifically on the frontend

Frontend stacks are unusually volatile. UI frameworks rise and fall, HTTP clients are replaced, state
libraries are swapped, and transport mechanisms migrate (REST to GraphQL, polling to WebSocket). Each of
these lives in an outer ring. When business rules are confined to the Domain and Application layers and
depend only on ports, a change of framework or transport becomes a change of *adapters* — not a rewrite
of the application's meaning. The most stable asset (what the product *does*) is insulated from the least
stable asset (the technology it currently *runs on*).

---

## 4. Dependency Direction in Practice

### 4.1 Allowed and forbidden imports

The Dependency Rule becomes a small set of mechanical checks on `import` statements:

```
✅ presentation/stores/useUserStore.js   imports  application/use-cases/...   (outer → inner)
✅ application/use-cases/CreateUser.js    imports  application/ports/UserRepository
✅ infrastructure/repositories/User.js    imports  domain/entities/User
✅ infrastructure/repositories/User.js    implements application/ports/UserRepository

❌ presentation/views/LoginView.vue       imports  infrastructure/http/client   (skips the core)
❌ domain/entities/User.js                imports  axios                        (core → detail)
❌ application/use-cases/CreateUser.js     imports  vue / pinia                  (core → framework)
```

A useful heuristic: **the deeper a file sits, the fewer things it is allowed to import.** A Domain file
should import almost nothing.

### 4.2 Adding a feature across the four layers

A repeatable checklist for any new capability, working from the inside out:

1. **Domain** — model the concept as an entity or value object; encode its rules and invariants.
2. **Application (port)** — declare the interface describing the data operation the feature needs.
3. **Application (use case)** — write the orchestration that uses entities and the port.
4. **Infrastructure (adapter)** — implement the port against the real transport; map responses to
   entities.
5. **Presentation (store)** — call the use case and expose reactive state.
6. **Presentation (view/component)** — bind the store's state and actions to the interface.

Following this order guarantees that, at every step, code only ever reaches inward. The same inside-out
order is the cheapest way to test a feature — see [§5.3](2-testing.md#53-the-test-pyramid-mapped-onto-the-onion).

### 4.3 The inversion gap

In the present codebase, the Application layer imports concrete Infrastructure classes directly — for
example, `CreateUserUseCase.js` begins with
`import { UserRepository } from '@/infrastructure/repositories/UserRepository'`. This produces a working
*linear* layering (`Presentation → Application → Infrastructure → Domain`), but it lets a use case depend
on a detail, which the canonical model forbids [Martin 2017].

The prescribed evolution is to invert that single dependency. The Application layer should declare a port,
and the use case should receive an implementation rather than importing one:

```js
// BEFORE — use case depends on a concrete adapter (a detail)
import { UserRepository } from '@/infrastructure/repositories/UserRepository'

export async function createUserUseCase(form) {
  const payload = toPayload(form)
  return UserRepository.create(payload)        // hard-wired to Infrastructure
}
```

```js
// AFTER — use case depends on an injected port (an abstraction)
export function makeCreateUserUseCase({ userRepository }) {
  return async function createUserUseCase(form) {
    const payload = toPayload(form)
    return userRepository.create(payload)      // any adapter satisfying the port
  }
}

// composition root (e.g. a small factory wired once at startup)
import { HttpUserRepository } from '@/infrastructure/repositories/UserRepository'
export const createUserUseCase = makeCreateUserUseCase({ userRepository: HttpUserRepository })
```

The cost is one factory and a place to wire dependencies (a *composition root*). The gain is that the
Application layer no longer names any detail: it can be tested with a fake repository, and the HTTP adapter
can be swapped for a GraphQL or in-memory one without editing a use case. This is the difference between a
layered stack and a true onion [Palermo 2008; Cockburn 2005]. The gain is not abstract — it is the
difference between injecting a fake in one line and intercepting a module path, shown side by side in
[§5.4](2-testing.md#54-per-layer-testing).

---

## 6. Why This Architecture

Each benefit below is a direct consequence of the Dependency Rule and dependency inversion.

- **Testability without infrastructure.** Because inner layers depend only on abstractions, use cases and
  entities can be tested with fakes and with no network, framework, or DOM — the mechanism is laid out in
  full in [§5](2-testing.md#5-testing-the-layers). Independence from frameworks and from the UI is an explicit, stated
  goal of Clean Architecture [Martin 2017].
- **Replaceable details.** Transport, storage, and UI sit in outer rings behind ports, so they can be
  swapped — REST to GraphQL, Axios to Fetch, one UI framework to another — by rewriting adapters, not the
  core. This substitutability is the defining promise of Ports & Adapters [Cockburn 2005].
- **Independent evolution.** The domain can grow without waiting on UI decisions, and the UI can be
  redesigned without risking business rules, because neither names the other [Palermo 2008].
- **Intent-revealing structure.** Top-level folders name *what the application does* (its domain and use
  cases) before *how it is delivered*, so the structure communicates purpose — the "screaming
  architecture" idea [Martin 2017].
- **A model worth talking about.** A rich, isolated domain model gives the whole team a shared, precise
  vocabulary, which is the central payoff of Domain-Driven Design [Evans 2003].

**Frontend-specific payoff.** On the client these benefits compound, because the frontend is where
technology churns fastest. A new rendering framework, a migration from polling to WebSocket, or an
offline/optimistic strategy can all be introduced as outer-ring changes. The business meaning — encoded in
entities and use cases — survives untouched. In a field where the average tool's lifespan is short, placing
the durable asset at the protected center is the architecture's highest-value property.

---

## 7. Naming & Conventions (portable defaults)

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
    └── styles/            # design tokens + component styles (see styling-and-animation.md)
```

**Conventions.**
- **Path alias.** Map `@` to `src/` so imports are absolute and the layer is always visible in the path
  (`@/domain/...`, `@/application/...`). Relative `../../..` chains hide layer crossings.
- **File naming.** PascalCase for entities, repositories, and components; camelCase for use cases, stores,
  and composables.
- **Test placement.** Co-locate tests in `__tests__/` siblings, named `<Unit>.test.js`, mirroring the
  layer they cover — see [§5.6](2-testing.md#56-where-tests-live).
- **Import boundaries.** Treat the allowed/forbidden table in [§4.1](#41-allowed-and-forbidden-imports) as
  a lint target; an automated import-boundary check turns the Dependency Rule into a guarantee rather than
  a guideline.
- **Styles out of components.** Keep structural styles in dedicated files rather than inside component
  markup, reserving inline styles for genuinely runtime-driven values (positions, computed sizes, per-entity
  colors). This keeps the Presentation layer's components focused on structure and behavior. Two layouts for
  those dedicated style and animation files — a mirrored `styles/` tree or colocation in the feature folder —
  are described in the companion document [styling-and-animation.md](5-styling-and-animation.md).
- **Components by feature.** Group components into feature folders (`components/auth/`, `components/orders/`)
  with a `shared/` folder for cross-feature primitives, rather than a flat `components/` directory — see
  [§8.5](3-advanced-patterns.md#85-feature-based-component-organization--presentation).

---

## 10. References

- **Beck, K.** (2002). *Test-Driven Development: By Example*. Addison-Wesley. (Tests as a design tool.)
- **Cockburn, A.** (2005). *Hexagonal Architecture (Ports and Adapters)*.
  https://alistair.cockburn.us/hexagonal-architecture/
- **Cohn, M.** (2009). *Succeeding with Agile: Software Development Using Scrum*. Addison-Wesley.
  (The Test Pyramid.)
- **Conway, M. E.** (1968). *How Do Committees Invent?* Datamation. (Conway's Law: systems mirror the
  communication structure of the organizations that build them.)
  https://www.melconway.com/Home/Committees_Paper.html
- **Dodds, K. C.** (2019). *Colocation*. (Place code as close as possible to where it is relevant.)
  https://kentcdodds.com/blog/colocation
- **Evans, E.** (2003). *Domain-Driven Design: Tackling Complexity in the Heart of Software*.
  Addison-Wesley. (Entities; the domain model as the core.)
- **Feature-Sliced Design.** *Architectural methodology for frontend projects.* (Feature-first slicing of
  the UI.) https://feature-sliced.design/
- **Fowler, M.** (2002). *Patterns of Enterprise Application Architecture*. Addison-Wesley.
  (Repository; Service Layer.) https://martinfowler.com/eaaCatalog/repository.html
- **Fowler, M.** (2007). *Mocks Aren't Stubs*. (Stubs vs. mocks; classicist vs. mockist testing.)
  https://martinfowler.com/articles/mocksArentStubs.html
- **Geers, M.** (2020). *Micro Frontends in Action*. Manning. (Independently built and deployed UIs composed
  at runtime, each owned by the team that owns its domain.) https://www.microfrontends.com/
- **GreenSock (GSAP).** *GSAP Documentation.* (Imperative, timeline-based animation.)
  https://gsap.com/docs/
- **Khorikov, V.** (2020). *Unit Testing Principles, Practices, and Patterns*. Manning. (What makes a test
  valuable; the cost of over-mocking.)
- **Martin, R. C.** (2003). *Agile Software Development, Principles, Patterns, and Practices*. Prentice
  Hall. (The Dependency Inversion Principle, part of SOLID.)
  https://web.archive.org/web/20110714224327/http://www.objectmentor.com/resources/articles/dip.pdf
- **Martin, R. C.** (2012). *The Clean Architecture*. The Clean Code Blog. (The Dependency Rule.)
  https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html
- **Martin, R. C.** (2017). *Clean Architecture: A Craftsman's Guide to Software Structure and Design*.
  Prentice Hall. (Entities, use cases, frameworks as details; "screaming architecture"; the Test Boundary,
  ch. 28.)
- **Meszaros, G.** (2007). *xUnit Test Patterns: Refactoring Test Code*. Addison-Wesley. (The Test Double
  taxonomy: dummy, stub, spy, mock, fake.)
- **Nx & Turborepo documentation.** *Monorepo build systems with enforced project boundaries.* (Module-
  boundary lint rules that make the Dependency Rule checkable in CI.) https://nx.dev/ · https://turborepo.com/
- **Palermo, J.** (2008). *The Onion Architecture* (Parts 1–4).
  https://jeffreypalermo.com/2008/07/the-onion-architecture-part-1/
- **Shapiro, M., Preguiça, N., Baquero, C., & Zawirski, M.** (2011). *Conflict-free Replicated Data Types*.
  INRIA Research Report RR-7687. https://hal.inria.fr/inria-00609399
- **Skelton, M. & Pais, M.** (2019). *Team Topologies: Organizing Business and Technology Teams for Fast
  Flow*. IT Revolution. (Stream-aligned vs. platform teams; org structure as an architectural force.)
  https://teamtopologies.com/book
- **Vocke, H.** (2018). *The Practical Test Pyramid*. martinfowler.com.
  https://martinfowler.com/articles/practical-test-pyramid.html
- **Vue.js, Pinia & Vue Test Utils documentation.** https://vuejs.org/ · https://pinia.vuejs.org/ ·
  https://pinia.vuejs.org/cookbook/testing.html · https://test-utils.vuejs.org/ · https://vitest.dev/ ·
  https://vuejs.org/api/sfc-css-features.html (Framework-specific guidance for components, reactivity,
  stores, testing, and single-file-component scoped styles / CSS Modules.)
