# Software Architecture: Clean, Onion & MVC

Three ways to structure a maintainable frontend. Two of them — **Clean** and **Onion** — organize the whole application by the direction of its dependencies. The third — **MVC** — organizes the presentation tier and fits *inside* the other two. Pick the layering you think in, then use MVC to structure the screens within it.

---

## Quick Comparison

|  | **Clean Architecture** | **Onion Architecture** | **Model-View-Controller** |
|---|---|---|---|
| **Scope** | Whole application | Whole application | Presentation tier only |
| **Focus** | The Dependency Rule—entities, use cases, details | Concentric rings—visualizing inward dependencies | Separating data, display, and input handling |
| **Structure** | Entities → use cases → adapters → frameworks | Domain → Application → Infrastructure → Presentation | Model · View · Controller (and MVP, MVVM) |
| **Originator** | Robert C. Martin, 2012 | Jeffrey Palermo, 2008 | Trygve Reenskaug, 1979 |
| **Best for** | Understanding the principle and how layers interlock | Visualizing the architecture and feature organization | Structuring a single screen or component |

Clean and Onion are alternatives to each other. MVC is **not** an alternative to either — it is complementary, and lives in their outer ring.

---

## Choose Your Path

### [Clean Architecture](./clean-architecture)

Start here to understand the **Dependency Rule** and how it shapes code: how entities stay independent, how use cases orchestrate them, and why frameworks and databases are "details." Covers dependency injection, composition roots, and scaling.

### [Onion Architecture](./onion-architecture)

Start here if you think in **visualizations and rings**: why the four layers form an onion, how dependencies spiral inward, and how to organize code and teams around that structure. Covers advanced patterns (CRDT sync, optimistic updates), feature-based organization, styling, and scaling.

### [Model-View-Controller](./model-view-controller)

Start here to structure the **presentation tier**: separating what the app knows (Model) from what the user sees (View) and what turns input into change (Controller). Covers the classic cycle, the MVP and MVVM variants, why modern component frameworks are really MVVM, and how MVC sits inside a Clean or Onion app.

---

## How They Relate

- **Clean vs. Onion** — the same rule, two framings. Clean emphasizes *what each layer is*; Onion emphasizes *where each layer sits*. Inner layers depend on nothing; outer layers depend on inner ones. The resulting code is identical.
- **MVC vs. both** — a different category. MVC says nothing about repositories or transports; it organizes the screen. In a layered app, MVC's View and display state are pure Presentation, while the Model's *rules* belong to the inner layers — the Controller reaches them through a use case, not directly. See [MVC on the Frontend](./model-view-controller/3-mvc-on-the-frontend.md).

---

## Supplementary Resources

- **[Visual Testing Harness](./scraper)** — Playwright + TypeScript tool for verifying demo sites and capturing architecture snapshots
- **[GitHub](https://github.com/AndresTaoFlorez/onion-architecture)** — Live demos and implementations
