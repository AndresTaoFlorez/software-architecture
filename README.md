# Software Architecture

A practical, source-backed reference for designing serious software systems.

This repository separates four things that are often mixed together:

1. **Foundations** — dependency direction, boundaries, dependency inversion, composition, module APIs and architecture enforcement.
2. **Architectural styles** — Clean Architecture, Onion Architecture, MVC and MVVM.
3. **Delivery-specific architecture** — how the same principles are applied on frontend and backend systems.
4. **Framework and implementation patterns** — React hooks, Redux Toolkit, Panda CSS, repositories, adapters, selectors and similar mechanisms.

The goal is not to force every project into the same folder tree. The goal is to make the architectural decisions explicit, defensible and mechanically enforceable.

---

## Start here

### Foundations

Read **[Architecture Foundations](./foundations/README.md)** before choosing an architectural style.

- [Dependency boundaries](./foundations/dependency-boundaries.md)
- [Composition Root and dependency injection](./foundations/composition-root.md)
- [Module boundaries and public APIs](./foundations/module-boundaries-and-public-apis.md)
- [Executable architecture](./foundations/architecture-testing.md)

These rules are reusable across Clean, Onion, Hexagonal, frontend and backend systems.

### Frontend architecture

The canonical frontend guidance now lives under **[frontend/](./frontend/README.md)** rather than being duplicated inside Clean and Onion:

- [Presentation architecture](./frontend/presentation-architecture.md)
- [State management and side effects](./frontend/state-management.md)
- [Styling and design systems](./frontend/styling-and-design-system.md)
- [Reference case study](./frontend/reference-case-study.md)
- [Frontend references](./frontend/references.md)

The frontend guide uses React, Redux Toolkit and Panda CSS for concrete examples, but the architectural rules are framework-independent.

---

## Architectural styles

### [Clean Architecture](./clean-architecture)

Robert C. Martin's framing around Entities, Use Cases, Interface Adapters and Frameworks & Drivers. Its durable rule is that source dependencies point toward higher-level policy. The four circles are schematic, not a mandatory folder count.

### [Onion Architecture](./onion-architecture)

Jeffrey Palermo's framing around a domain model at the center and infrastructure pushed outward. It is especially useful for long-lived business applications with meaningful domain behavior; it is not automatically justified for every small application.

### [Model-View-Controller](./model-view-controller)

A family of presentation patterns for separating domain/model concerns, rendering and user input. MVC is not a substitute for Clean or Onion: it operates at a different scope.

### [Model-View-ViewModel](./model-view-viewmodel)

A presentation pattern in which a ViewModel/Presentation Model exposes view-oriented state and behavior while the rendering layer stays comparatively humble.

---

## How the styles relate

Clean, Onion and Ports & Adapters overlap heavily in goals: isolate application policy from volatile technology and direct dependencies toward stable abstractions. They are **related, not identical**. Their vocabulary, boundary placement and emphasis differ, and real systems may combine ideas from more than one.

MVC and MVVM are presentation patterns. They can be used inside a Clean/Onion application, but neither pattern determines persistence, transport or application-layer boundaries.

A framework is not an architecture. React, Vue, Redux, Pinia, Panda CSS, NestJS, Spring or an ORM are implementation mechanisms that must be placed behind the boundaries chosen for the system.

---

## Repository rules

Documentation in this repository should distinguish:

- **architectural invariant** — a rule whose violation changes the architecture;
- **recommended default** — a strong practice that works for many projects but may be replaced deliberately;
- **framework convention** — guidance specific to a tool;
- **project convention** — a local choice, not a universal rule.

Whenever a rule can be checked mechanically, prefer enforcing it in CI instead of relying only on code review.

---

## Primary sources

The architectural guides cite their own detailed references. The common starting points are:

- Robert C. Martin, *The Clean Architecture* (2012)
- Jeffrey Palermo, *The Onion Architecture* series (2008)
- Alistair Cockburn, *Hexagonal Architecture / Ports and Adapters* (2005)
- Martin Fowler, *Presentation Model* and GUI architecture writings
- Official React, Redux Toolkit and Panda CSS documentation for framework-specific guidance
