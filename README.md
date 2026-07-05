# Software Architecture: Clean, Onion, MVC & MVVM

Four ways to structure a maintainable frontend. Two of them — **Clean** and **Onion** — organize the whole application by the direction of its dependencies. The other two — **MVC** and its descendant **MVVM** — organize the presentation tier and fit *inside* the first two. Pick the layering you think in, then use MVC/MVVM to structure the screens within it.

---

## Quick Comparison

|  | **Clean Architecture** | **Onion Architecture** | **Model-View-Controller** | **Model-View-ViewModel** |
|---|---|---|---|---|
| **Scope** | Whole application | Whole application | Presentation tier only | Presentation tier only |
| **Focus** | The Dependency Rule—entities, use cases, details | Concentric rings—visualizing inward dependencies | Separating data, display, and input handling | Binding a declarative View to a testable ViewModel |
| **Structure** | Entities → use cases → adapters → frameworks | Domain → Application → Infrastructure → Presentation | Model · View · Controller (and MVP, MVVM) | Model · View · ViewModel (synced by the framework) |
| **Originator** | Robert C. Martin, 2012 | Jeffrey Palermo, 2008 | Trygve Reenskaug, 1979 | John Gossman, 2005 |
| **Best for** | Understanding the principle and how layers interlock | Visualizing the architecture and feature organization | Understanding the classic cycle and its variants | Structuring screens in a reactive component framework |

Clean and Onion are alternatives to each other. MVC and MVVM are **not** alternatives to either — they are complementary, and live in their outer ring. Between themselves, MVVM is MVC with the observer wiring automated by a binding layer: in a modern component framework, MVVM is the pattern you are already using.

---

## Choose Your Path

### [Clean Architecture](./clean-architecture)

Start here to understand the **Dependency Rule** and how it shapes code: how entities stay independent, how use cases orchestrate them, and why frameworks and databases are "details." Covers dependency injection, composition roots, and scaling.

### [Onion Architecture](./onion-architecture)

Start here if you think in **visualizations and rings**: why the four layers form an onion, how dependencies spiral inward, and how to organize code and teams around that structure. Covers advanced patterns (CRDT sync, optimistic updates), feature-based organization, styling, and scaling.

### [Model-View-Controller](./model-view-controller)

Start here to structure the **presentation tier from first principles**: separating what the app knows (Model) from what the user sees (View) and what turns input into change (Controller). Covers the classic cycle, the MVP and MVVM variants, why modern component frameworks are really MVVM, and how MVC sits inside a Clean or Onion app.

### [Model-View-ViewModel](./model-view-viewmodel)

Start here if you build with a **reactive component framework** (Vue, React, Svelte): the ViewModel as the screen's state and commands with no reference to the View, the binding layer that replaces MVC's hand-written observer, stores and composables/hooks as ViewModels, the fat-ViewModel failure mode, and the headless ViewModel test the pattern was invented for.

---

## How They Relate

- **Clean vs. Onion** — the same rule, two framings. Clean emphasizes *what each layer is*; Onion emphasizes *where each layer sits*. Inner layers depend on nothing; outer layers depend on inner ones. The resulting code is identical.
- **MVC/MVVM vs. both** — a different category. MVC and MVVM say nothing about repositories or transports; they organize the screen. In a layered app, the View and display state are pure Presentation, while the Model's *rules* belong to the inner layers — the Controller (or the ViewModel's commands) reaches them through a use case, not directly. See [MVC on the Frontend](./model-view-controller/3-mvc-on-the-frontend.md) and [MVVM on the Frontend](./model-view-viewmodel/3-mvvm-on-the-frontend.md).
- **MVC vs. MVVM** — ancestor and descendant, one substitution apart. MVVM replaces MVC's hand-wired observer with the framework's declarative binding, and renames the Controller's surviving half (gesture interpretation) into the ViewModel's commands. Read MVC to understand *why* the parts are separated; read MVVM for the form that separation takes in today's frameworks. See [The Binding](./model-view-viewmodel/2-the-binding.md).

---

## Supplementary Resources

- **[Visual Testing Harness](./scraper)** — Playwright + TypeScript tool for verifying demo sites and capturing architecture snapshots
- **[GitHub](https://github.com/AndresTaoFlorez/onion-architecture)** — Live demos and implementations
