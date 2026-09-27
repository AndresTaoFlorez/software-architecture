# Model-View-ViewModel for the Frontend

> MVVM is a presentation pattern that separates a View from a ViewModel containing view-oriented state and behavior. Modern reactive frameworks can implement this separation naturally, but using React, Vue or Svelte does **not** make an application MVVM automatically.

← Back to [architecture overview](../README.md) · See also the [MVC](../model-view-controller), [Frontend Architecture](../frontend), [Clean](../clean-architecture) and [Onion](../onion-architecture) guides

---

## Read This First: MVVM Is a Presentation Pattern, Not a Framework Default

MVVM originated in Microsoft's UI ecosystem and is closely related to earlier separated-presentation patterns such as Presentation Model.

Its useful idea is architectural:

```text
View
  |
  v
ViewModel / Presentation Model
  |
  v
application/domain capabilities
```

The ViewModel exposes state and operations shaped for a view without needing references to concrete UI controls.

Reactive rendering, subscriptions, signals and data binding make this style convenient, but they are **mechanisms**, not proof that the application follows MVVM.

A component with HTTP calls, domain rules, persistence and rendering all in one file is not made MVVM by automatic re-rendering.

---

## Contents

- **[1 · The Three Parts](1-the-three-parts.md)** — Model, View and ViewModel responsibilities
- **[2 · The Binding](2-the-binding.md)** — reactive synchronization and one-way/two-way binding
- **[3 · MVVM on the Frontend](3-mvvm-on-the-frontend.md)** — hooks/stores as possible ViewModels, failure modes and layered applications
- **[4 · Testing in MVVM](4-testing-in-mvvm.md)** — testing ViewModels/Presentation Models independently of rendering
- **[5 · MVVM in React + Redux Toolkit](5-mvvm-in-react-redux.md)** — one possible mapping, with explicit caveats about Redux and server state
- **[References](references.md)**

---

## The roles

```text
┌──────────────┐       observes / renders       ┌─────────────────┐
│     View     │ <---------------------------- │    ViewModel    │
│ UI controls  │ ----------------------------> │ view state +    │
│ / template   │       user intent             │ operations      │
└──────────────┘                                └────────┬────────┘
                                                       │
                                                       v
                                               application/model
```

### View

Renders and captures interaction. It may own strictly local rendering concerns; "thin View" does not mean "zero conditionals".

### ViewModel

Owns state and behavior that exist because this View/use flow exists:

- loading/pending state;
- display-ready derived values;
- commands/intent handlers;
- coordination of Presentation state;
- mapping application results to view-oriented state.

It should not accumulate business invariants simply because it is convenient.

### Model

"Model" is overloaded. In classic MVVM it means the non-ViewModel state/business side of the application.

In a Clean/Onion application there is **no required one-to-one mapping** such as:

```text
MVVM Model == Clean Entity == Onion Domain
```

The ViewModel may call Application use cases, which in turn coordinate Domain objects and ports.

---

## Binding is not necessarily two-way

WPF popularized rich declarative data binding. Modern web frameworks often use different mechanisms:

- React commonly uses one-way rendering plus event callbacks;
- Vue supports reactive rendering and optional two-way form conveniences;
- state libraries provide subscription mechanisms.

All can support a View/ViewModel separation. The exact binding mechanism is secondary to responsibility and dependency direction.

---

## MVVM inside a layered architecture

A strict layered frontend may use:

```text
React component (View)
        |
        v
useClosures() (ViewModel/Presentation facade)
        |
        v
Presentation state adapter
        |
        v
Application use case
        |
        v
Domain / ports
```

That is **one valid interpretation**, not a universal rule of MVVM.

See **[Frontend Presentation Architecture](../frontend/presentation-architecture.md)** for the repository's current recommended frontend structure.

## Sources

- John Gossman, "Introduction to Model/View/ViewModel pattern for building WPF apps" (2005), archived/source references listed in [References](references.md)
- Martin Fowler, "Presentation Model": https://martinfowler.com/eaaDev/PresentationModel.html
- Martin Fowler, "GUI Architectures": https://martinfowler.com/eaaDev/uiArchs.html
- Vue documentation explicitly notes that Vue was inspired by MVVM but is not strictly associated with it: https://v2.vuejs.org/v2/guide/instance.html
