# Model-View-Controller (MVC)

> A presentation pattern with a long history and many incompatible modern interpretations.

← [Repository home](../README.md) · [Glossary](../GLOSSARY.md) · [Naming](../conventions/naming-and-file-placement.md)

## 1. History

Trygve Reenskaug developed the original MVC ideas while visiting Xerox PARC in **1978–1979**. His December 1979 note *Models–Views–Controllers* defined Model, View and Controller in the context of interactive user interfaces.

Original report: https://doi.org/10.5281/zenodo.3676092

The term later evolved across Smalltalk, desktop frameworks, server-side web frameworks and JavaScript libraries. Therefore "MVC" must always be interpreted in context.

## 2. What problem does MVC solve?

MVC separates:

- the information/behavior being represented;
- how it is presented;
- how user input is interpreted.

```mermaid
flowchart LR
    USER["User"] --> CONTROLLER["Controller"]
    CONTROLLER --> MODEL["Model"]
    MODEL --> VIEW["View"]
    VIEW --> USER
    MODEL -. "change notification / observation" .-> VIEW
```

## 3. When it fits

MVC is useful when:

- one Model can have multiple Views;
- input interpretation deserves separation from rendering;
- a framework explicitly follows an MVC-style interaction model;
- presentation responsibilities are becoming entangled.

## 4. When it is a poor label

Avoid forcing "MVC" onto every component framework.

Modern React/Vue/Svelte component architectures combine responsibilities differently from classic Smalltalk MVC. Server-side "MVC" frameworks also use the term differently.

If the mapping requires redefining every role, use the actual framework architecture instead of preserving the acronym.

## 5. The three roles

| Role | Owns | Should not own |
| --- | --- | --- |
| Model | represented data/behavior | concrete View/Controller mechanics |
| View | presentation of Model/state | business/application policy |
| Controller | interpretation of user input | rendering or persistent business state |

In a Clean/Onion system, the MVC Model does **not** automatically equal the Domain layer. Presentation patterns and whole-application architectures operate at different scales.

## 6. A practical layered mapping

```mermaid
flowchart TD
    PRES["Presentation"]
    PRES --> V["View / component"]
    PRES --> C["Controller / event adapter"]
    C --> APP["Application use case"]
    APP --> DOMAIN["Domain"]
```

A controller can translate user intent into an Application command rather than directly embedding business policy.

## 7. File placement example

| Artifact | Example path | Reason |
| --- | --- | --- |
| route/page View | `presentation/pages/orders/OrdersPage.tsx` | route rendering |
| feature controller/event adapter | `presentation/features/orders/model/useOrderActions.ts` | interprets UI intent |
| business operation | `application/orders/use-cases/cancelOrder.ts` | application policy |
| business invariant | `domain/orders/Order.ts` | domain truth |

Use [Code Placement](../foundations/code-placement.md) for cross-layer placement.

## 8. Where does a new function go?

MVC only classifies **presentation roles**. In a layered application, decide the architectural owner first and the MVC role second.

```mermaid
flowchart TD
    Q{"Why does this code exist?"}
    Q -->|"Renders state"| V["View"]
    Q -->|"Interprets a UI gesture"| C["Controller / presentation action"]
    Q -->|"Business/application rule"| INNER["Application or Domain — not MVC Presentation"]
    Q -->|"HTTP / DB / SDK detail"| OUTER["Infrastructure — not the MVC Model"]
```

Examples:

| Code | Owner |
| --- | --- |
| render an order row | View |
| turn a click into `cancelOrder(id)` | Controller/presentation action |
| reject cancellation after shipment | Domain/Application |
| perform the HTTP request | Infrastructure |

## 9. Naming

Before creating a file, use **[Naming and File Placement Conventions](../conventions/naming-and-file-placement.md)**.

Important distinction:

- `OrdersPage.tsx` describes a View;
- `useOrderActions.ts` can act as a presentation controller/action facade;
- `cancelOrder.ts` is an application use case, not a Controller merely because a button invokes it.

## 10. Learning path

1. [The Three Parts](./1-the-three-parts.md)
2. [The Flow](./2-the-flow.md)
3. [MVC on the Frontend](./3-mvc-on-the-frontend.md)
4. [Testing](./4-testing-in-mvc.md)

## Sources

- Trygve Reenskaug, *Models–Views–Controllers* (1979): https://doi.org/10.5281/zenodo.3676092
- Martin Fowler, *GUI Architectures*: https://martinfowler.com/eaaDev/uiArchs.html
