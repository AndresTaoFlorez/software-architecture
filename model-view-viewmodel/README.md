# Model-View-ViewModel (MVVM)

> A presentation pattern that separates rendering from view-oriented state and behavior.

← [Repository home](../README.md) · [Glossary](../GLOSSARY.md) · [Frontend architecture](../frontend/README.md)

## 1. History

Martin Fowler described **[Presentation Model](../GLOSSARY.md#presentation-model)** in 2004: an abstraction containing the state and behavior of a [View](../GLOSSARY.md#view) while remaining independent of concrete UI controls.

In **2005**, John Gossman introduced the [MVVM](../GLOSSARY.md#model-view-viewmodel-mvvm) name in the WPF ecosystem. Microsoft literature later described [MVVM](../GLOSSARY.md#model-view-viewmodel-mvvm) as closely related to/specialized from [Presentation Model](../GLOSSARY.md#presentation-model) for WPF-style binding.

References:

- https://martinfowler.com/eaaDev/PresentationModel.html
- https://learn.microsoft.com/en-us/archive/msdn-magazine/2009/february/patterns-wpf-apps-with-the-model-view-viewmodel-design-pattern

## 2. What problem does it solve?

UI components often accumulate:

- loading/error state;
- formatting;
- commands;
- validation for presentation;
- subscriptions;
- business rules;
- transport calls.

[MVVM](../GLOSSARY.md#model-view-viewmodel-mvvm) separates the rendering surface from the state/behavior needed by that rendering surface.

```mermaid
flowchart LR
    VIEW["View"] -->|"user intent"| VM["ViewModel"]
    VM -->|"view state"| VIEW
    VM --> MODEL["Application / Model"]
```

## 3. When MVVM is useful

Strong fit:

- rich stateful screens;
- UI logic that benefits from headless tests;
- multiple visual representations over the same presentation state;
- declarative binding/reactive UI frameworks;
- complex forms/workflows where rendering should stay simple.

## 4. When it is unnecessary

A dedicated [ViewModel](../GLOSSARY.md#viewmodel) can be overhead when:

- the screen is tiny;
- UI state is trivial;
- direct local component state is clearer;
- creating a [ViewModel](../GLOSSARY.md#viewmodel) only forwards values without adding a useful boundary.

Microsoft's own [MVVM](../GLOSSARY.md#model-view-viewmodel-mvvm) literature explicitly discusses the overhead for simple models/screens.

## 5. Roles

| Role | Owns | Does not automatically own |
| --- | --- | --- |
| [View](../GLOSSARY.md#view) | rendering + user gestures | domain/application rules |
| [ViewModel](../GLOSSARY.md#viewmodel) | view-oriented state, derived display values, commands | HTTP/DB details or authoritative business [invariants](../GLOSSARY.md#invariant) |
| [Model](../GLOSSARY.md#model) | non-view application/domain capabilities | concrete [View](../GLOSSARY.md#view) controls |

The word "[Model](../GLOSSARY.md#model)" is overloaded. In a Clean/Onion application it is not automatically identical to `domain/`.

## 6. React mapping used in this repository

React is **not [MVVM](../GLOSSARY.md#model-view-viewmodel-mvvm) by default**.

A feature may intentionally use this mapping:

```mermaid
flowchart TD
    VIEW["React component (View)"]
    VM["useClosures() (ViewModel / Presentation facade)"]
    BIND["Presentation state bindings"]
    APP["Application use case"]
    DOMAIN["Domain"]

    VIEW --> VM
    VM --> BIND
    VM --> APP
    APP --> DOMAIN
```

The hook is a [ViewModel](../GLOSSARY.md#viewmodel) only when it genuinely exposes a view-oriented contract and hides lower-level mechanisms.

## 7. Where files go

| Artifact | Example path |
| --- | --- |
| [View](../GLOSSARY.md#view) | `features/closures/ui/QueryFilters/QueryFilters.tsx` |
| public [ViewModel](../GLOSSARY.md#viewmodel) facade | `features/closures/model/useClosures.ts` |
| [selectors](../GLOSSARY.md#selector) | `features/closures/model/closures.selectors.ts` |
| Redux binding | `features/closures/model/closures.bindings.ts` |
| [use case](../GLOSSARY.md#use-case) | `application/closures/use-cases/executeClosure.ts` |

## 8. Naming

React requires:

- component names to begin with a capital letter;
- custom hooks to begin with `use`.

See [Naming and File Placement Conventions](../conventions/naming-and-file-placement.md).

## 9. Learning path

1. [The Three Parts](./1-the-three-parts.md)
2. [Binding](./2-the-binding.md)
3. [MVVM on the Frontend](./3-mvvm-on-the-frontend.md)
4. [Testing](./4-testing-in-mvvm.md)
5. [React + Redux Toolkit](./5-mvvm-in-react-redux.md)

## Sources

- Martin Fowler, *[Presentation Model](../GLOSSARY.md#presentation-model)*: https://martinfowler.com/eaaDev/PresentationModel.html
- Martin Fowler, *GUI Architectures*: https://martinfowler.com/eaaDev/uiArchs.html
- Microsoft, *WPF Apps With The [Model-View-ViewModel](../GLOSSARY.md#model-view-viewmodel-mvvm) Design Pattern*: https://learn.microsoft.com/en-us/archive/msdn-magazine/2009/february/patterns-wpf-apps-with-the-model-view-viewmodel-design-pattern
