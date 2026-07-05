> **[Model-View-Controller](README.md)** › MVC on the Frontend. Full reference list: [References](references.md).

## 3. MVC on the Frontend

Modern component frameworks are routinely called "MVC," but that label is imprecise. This page names what
they actually are, then shows how to apply MVC's real value — separated presentation — inside a component
app, and inside an Onion or Clean architecture. The pattern this page concludes frameworks really use has
a dedicated guide of its own: **[Model-View-ViewModel](../model-view-viewmodel)**.

---

### 3.1 A component is closer to MVVM than to classic MVC

In Vue, React, or Svelte you rarely write an Observer by hand to sync a View with a Model. You declare
reactive state, bind it into the template, and the framework re-renders when the state changes. That
automatic synchronization is the defining trait of **MVVM**, not classic MVC [Fowler's Presentation Model;
Gossman 2005].

```
        Classic MVC                         Modern component framework
   ─────────────────────────          ──────────────────────────────────
   View  ── observes ──►  Model        template ── binds ──►  reactive state (ViewModel)
   (you wire the observer)             (the framework wires the binding)
```

So when a tutorial labels a component "the View" and a store "the Model," the missing piece — the manual
Controller-and-Observer plumbing — has been absorbed by the framework's reactivity. The honest mapping is:

| MVC / MVVM role | Typical frontend home |
|---|---|
| **Model** | a domain entity or a plain data module, framework-free |
| **ViewModel** | a store (Pinia/Redux/signals) or a composable holding display state |
| **View** | the component template + its render |
| **Controller** | event handlers / actions that interpret input and call the Model |

The Controller has not vanished; it has shrunk into the event handlers and store actions that translate a
gesture into a state change.

---

### 3.2 The failure mode: the fat component

MVC's discipline matters most where frameworks make it easy to ignore. The dominant anti-pattern on the
frontend is the **fat component** — a single file that renders markup, holds business rules, *and* calls
the network. It has collapsed all three parts into one, losing every benefit of separation:

- the rules cannot be tested without mounting the UI;
- the same rule gets re-implemented in the next component that needs it;
- a design change risks breaking business behavior, because they share a file.

The fix is the same separation MVC has prescribed since 1979: move the rules into a framework-free Model,
keep display state in a store/ViewModel, and let the component render and forward gestures. A component
that only reads state and emits events is a **Passive View**, the most testable arrangement there is
[Fowler].

---

### 3.3 How MVC sits inside Onion and Clean

MVC organizes the presentation tier; Onion and Clean organize the whole app. They compose cleanly:

```
   Onion / Clean outer ring (Presentation)
   ├── View         →  component template
   ├── ViewModel    →  store / composable (display state)
   └── Controller   →  event handlers that call a USE CASE, not the Model directly

   …inner rings (Application, Domain) — unchanged, framework-free
```

The one adjustment when MVC lives inside a layered architecture: the Controller should call an
**application use case**, not reach into the domain Model itself. In a standalone MVC screen the Controller
talks straight to the Model; in an Onion/Clean app that conversation is routed through the Application
layer, so the dependency rule still holds and the business orchestration stays in one place. The View and
the display-state ViewModel are pure Presentation; the Model's *rules* belong to the inner rings, even
though MVC's vocabulary draws them as one box.

Put plainly: **use MVVM-style separation to structure each screen, and Onion/Clean to structure the system
those screens live in.** They answer different questions and were never meant to be chosen between.

---

Next: **[Testing in MVC](4-testing-in-mvc.md)** — why separated presentation is, above all, a testability
decision.
