# Frontend Architecture

This section is the canonical frontend guidance for this repository.

Clean Architecture and Onion Architecture define **dependency direction across application boundaries**. They do not prescribe how a large React/Vue/Svelte Presentation layer must be organized internally. This section fills that gap without pretending framework conventions are part of Clean or Onion.

The examples use React, Redux Toolkit and Panda CSS because they make the boundaries concrete. The underlying rules are framework-independent.

---

## Core model

A serious frontend commonly has two architectural scales:

```mermaid
flowchart TD
    subgraph ApplicationScale["Application scale"]
        PRES["Presentation"] --> APP["Application"] --> DOMAIN["Domain"]
        INFRA["Infrastructure"] --> APP
        COMP["Composition"] -. wires .-> PRES
        COMP -. wires .-> INFRA
        COMP -. wires .-> APP
    end
    subgraph PresentationScale["Presentation scale"]
        PAGE["App / pages"] --> API["Feature public API"] --> VM["Feature model / ViewModel"] --> STATE["State mechanism + application operations"]
        API --> UI["Feature UI"]
    end
```

The first scale protects business policy from technology. The second keeps the UI itself cohesive as it grows.

## Recommended source layout

```mermaid
flowchart TD
    N0["src/"]
    N1["domain/"]
    N2["application/"]
    N3["infrastructure/"]
    N4["composition/"]
    N5["presentation/"]
    N6["app/"]
    N7["providers/"]
    N8["routes/"]
    N9["store/"]
    N10["pages/"]
    N11["features/"]
    N12["auth/"]
    N13["closures/"]
    N14["shared/"]
    N15["ui/"]
    N16["lib/"]
    N0 --> N1
    N0 --> N2
    N0 --> N3
    N0 --> N4
    N0 --> N5
    N5 --> N6
    N6 --> N7
    N6 --> N8
    N6 --> N9
    N5 --> N10
    N5 --> N11
    N11 --> N12
    N11 --> N13
    N5 --> N14
    N14 --> N15
    N14 --> N16
```

This is a recommended default, not a law. Folder names may change. Ownership and dependency direction matter more than the spelling.

## Feature ownership

A feature owns the Presentation code that changes with that capability:

```mermaid
flowchart TD
    N0["presentation/features/closures/"]
    N1["ui/"]
    N2["model/"]
    N3["lib/"]
    N4["index.ts"]
    N0 --> N1
    N0 --> N2
    N0 --> N3
    N0 --> N4
```

This keeps `closures` UI, state, selectors, bindings and feature-specific helpers close together instead of scattering them across global `components/`, `hooks/`, `state/`, `types/` and `utils/` trees.

This repository borrows the **high-cohesion feature slice** and **public API** ideas found in Redux's feature-folder guidance and Feature-Sliced Design. It does **not** require the complete FSD taxonomy; in particular, using a second unrelated meaning of `entities` beside Domain-Driven Design often creates needless vocabulary collisions.

## Public Presentation facade

A useful strict boundary for complex applications is:

```mermaid
flowchart TD
    UI["Page / Layout / Feature UI"] --> VM["Public hook / ViewModel"] --> B["Bindings"] --> S["State library / selectors / effects"] --> A["Application use cases"]
```

This makes the rendering surface depend on semantic operations such as `saveClosure()` instead of Redux actions, HTTP clients or framework internals.

It is deliberately stricter than what React Redux itself requires. A smaller application may legitimately let components call typed Redux hooks directly. When a project chooses the facade boundary, enforce it consistently.

## Read next

1. **[Presentation architecture](./presentation-architecture.md)** — pages, features, shared UI, public hooks/ViewModels and feature APIs.
2. **[State management](./state-management.md)** — local state, Redux, selectors, thunks, listeners, server state and persistence.
3. **[Styling and design systems](./styling-and-design-system.md)** — token hierarchy, Panda CSS, `sva`, config recipes and component ownership.
4. **[Reference case study](./reference-case-study.md)** — lessons extracted from the XXI web UI: what to promote and what to correct.
5. **[References](./references.md)** — primary and framework sources.

For cross-layer rules, read **[Architecture Foundations](../foundations/README.md)** first.
