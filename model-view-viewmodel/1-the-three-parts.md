> **[Model-View-ViewModel](README.md)** › The Three Parts. Full reference list: [References](references.md).

## 1. The Three Parts

[MVVM](../GLOSSARY.md#model-view-viewmodel-mvvm) was introduced by John Gossman in 2005 for WPF, as a specialization of Martin Fowler's
**[Presentation Model](../GLOSSARY.md#presentation-model)** pattern tailored to platforms with a declarative binding system
[Gossman 2005; Fowler 2004]. Its goal is the same separated presentation [MVC](../GLOSSARY.md#model-view-controller-mvc) pursued since 1979 —
domain state isolated from how it is displayed — plus one more, stated by Gossman himself: "the
[ViewModel](../GLOSSARY.md#viewmodel) is easier to unit test than code-behind or event driven code … you can test it without
awkward UI automation and interaction" [Gossman 2006]. The three parts divide that responsibility.

---

### 1.1 Model

**Responsibility.** Represent the non-[ViewModel](../GLOSSARY.md#viewmodel) state/behavior that the [ViewModel](../GLOSSARY.md#viewmodel) works with. In the
original pattern this is independent of the concrete [View](../GLOSSARY.md#view), but in a layered application it should not be
blindly equated with one architecture layer.

**What lives here.**
- The data being worked on (a `Cart`, a `User`, a list of orders).
- The rules and derived state over that data (a cart's total, whether an order can be cancelled).

**What it must not do.** Reference a [View](../GLOSSARY.md#view) or a [ViewModel](../GLOSSARY.md#viewmodel), format itself for display, or know that
binding exists. In [MVVM](../GLOSSARY.md#model-view-viewmodel-mvvm) the [Model](../GLOSSARY.md#model) does not even need the change-notification machinery classic [MVC](../GLOSSARY.md#model-view-controller-mvc)
required of it — announcing changes to the screen is the [ViewModel](../GLOSSARY.md#viewmodel)'s job now.

```js
class Cart {
  #items = []

  add(item) { this.#items.push(item) }

  get total() {
    return this.#items.reduce((sum, i) => sum + i.price * i.qty, 0)
  }
}
```

The [MVVM](../GLOSSARY.md#model-view-viewmodel-mvvm) **[Model](../GLOSSARY.md#model)** can be backed by [Application services](../GLOSSARY.md#application-service)/[use cases](../GLOSSARY.md#use-case), [Domain](../GLOSSARY.md#domain) objects, data sources, or a
combination of them. It is a presentation-pattern role, not a synonym for `domain/` or Clean [Entities](../GLOSSARY.md#domain-entity).
See [MVVM on the Frontend §3.3](3-mvvm-on-the-frontend.md#33-how-mvvm-sits-inside-onion-and-clean).

---

### 1.2 View

**Responsibility.** Present the [ViewModel](../GLOSSARY.md#viewmodel) to the user. The [View](../GLOSSARY.md#view) is a declarative template: it binds
to the [ViewModel](../GLOSSARY.md#viewmodel)'s state and renders it; when that state changes, the binding re-renders the [View](../GLOSSARY.md#view)
without anyone writing subscription code.

**What lives here.**
- The markup/template and purely visual concerns (layout, styling, animation triggers).
- Bindings: which [ViewModel](../GLOSSARY.md#viewmodel) value feeds which element, which gesture invokes which command.

**What it must not do.** Hold business rules, hold display state of its own, or reach past the
[ViewModel](../GLOSSARY.md#viewmodel) into the [Model](../GLOSSARY.md#model) or the network. A [View](../GLOSSARY.md#view) that computes a discount or calls `fetch` has
collapsed the pattern. The ideal [MVVM](../GLOSSARY.md#model-view-viewmodel-mvvm) [View](../GLOSSARY.md#view) is thin by construction — "the [View](../GLOSSARY.md#view) is almost always
defined declaratively, very often with a tool" [Gossman 2005] — the closest practical thing to
Fowler's **Passive [View](../GLOSSARY.md#view)** [Fowler].

```html
<!-- The View: bindings only. No logic worth testing. -->
<p class="total">{{ cart.formattedTotal }}</p>
<button @click="cart.addItem(product.id)">Add</button>
```

The [View](../GLOSSARY.md#view) knows *where* the total goes on screen; it does not know how the total is computed, nor what
"Add" means. Both of those live one step inward.

---

### 1.3 ViewModel

**Responsibility.** In Gossman's definition: "The term means '[Model](../GLOSSARY.md#model) of a [View](../GLOSSARY.md#view)', and can be thought
of as abstraction of the view, but it also provides a specialization of the [Model](../GLOSSARY.md#model) that the [View](../GLOSSARY.md#view) can
use for data-binding" [Gossman 2005]. Fowler's ancestor pattern states the same shape more sharply:
"a fully self-contained class that represents all the data and behavior of the UI window, but
without any of the controls used to render that UI on the screen" [Fowler 2004]. The [ViewModel](../GLOSSARY.md#viewmodel)
exposes exactly what the [View](../GLOSSARY.md#view) needs to render (display-ready values) and exactly what the user can do
(commands), and keeps both correct as the underlying [Model](../GLOSSARY.md#model) changes.

**What lives here.**
- **Display state**: the [Model](../GLOSSARY.md#model)'s data reshaped for presentation — formatted amounts, filtered and
  sorted lists, `isLoading` / `isSaving` flags, which panel is open, what the user has typed so far.
- **Commands**: methods the [View](../GLOSSARY.md#view)'s bindings invoke on user gestures (`addItem`, `submit`,
  `dismiss`). This is where [MVC](../GLOSSARY.md#model-view-controller-mvc)'s [Controller](../GLOSSARY.md#controller) went — gesture interpretation, absorbed into the
  [ViewModel](../GLOSSARY.md#viewmodel) [Fowler, GUI Architectures].
- **Change notification**: the reactive machinery (observables, signals, [store](../GLOSSARY.md#store) subscriptions) the
  binding layer uses to know when to re-render.

**What it must not do.** Two prohibitions define the pattern:

1. **Do not depend on concrete [View](../GLOSSARY.md#view) instances/controls.** A classic WPF-style [ViewModel](../GLOSSARY.md#viewmodel) is UI-toolkit
   agnostic and can be tested without a [View](../GLOSSARY.md#view) [Gossman 2006; Smith 2009]. A modern framework-specific
   [Presentation](../GLOSSARY.md#presentation-layer) facade such as a React custom Hook may legitimately import React; in that case it is
   playing a [ViewModel](../GLOSSARY.md#viewmodel)-like role rather than being a framework-free historical [ViewModel](../GLOSSARY.md#viewmodel) implementation.
2. **Never absorb the [Model](../GLOSSARY.md#model)'s rules.** The [ViewModel](../GLOSSARY.md#viewmodel) *reshapes and coordinates*; it does not decide
   domain outcomes. A [ViewModel](../GLOSSARY.md#viewmodel) that computes prices or validates business [invariants](../GLOSSARY.md#invariant) has become a
   "fat [ViewModel](../GLOSSARY.md#viewmodel)" — [MVVM](../GLOSSARY.md#model-view-viewmodel-mvvm)'s own decay mode, examined in
   [§3.2](3-mvvm-on-the-frontend.md#32-the-failure-mode-the-fat-viewmodel).

```js
class CartViewModel {
  isAdding = false

  constructor(cart, catalog) {
    this.cart = cart            // the Model — held, never re-implemented
    this.catalog = catalog
  }

  get formattedTotal() {
    return currency.format(this.cart.total)   // reshape for display
  }

  addItem(productId) {                          // a command: what the gesture means
    const product = this.catalog.find(productId)
    this.cart.add({ price: product.price, qty: 1 })
  }
}
```

Note what is absent: no markup, no DOM, no framework import. This class runs — and tests — anywhere.

---

### 1.4 Where did the Controller go?

Nowhere mysterious. Classic [MVC](../GLOSSARY.md#model-view-controller-mvc)'s [Controller](../GLOSSARY.md#controller) had two jobs: own the input devices and translate
gestures into [Model](../GLOSSARY.md#model) operations. Modern toolkits took the first job — in Gossman's account, the
controls themselves now "manage the interaction with the input devices that is the responsibility
of [Controller](../GLOSSARY.md#controller) in [MVC](../GLOSSARY.md#model-view-controller-mvc)," and as for the [Controller](../GLOSSARY.md#controller), "I tend to think it just faded into the
background" [Gossman 2005]. The [ViewModel](../GLOSSARY.md#viewmodel)'s commands took the second job. The triad did not lose a
member; one member was renamed to reflect that its center of gravity moved from *interpreting
input* to *owning display state* [Fowler, GUI Architectures].

---

### 1.5 The one rule that holds it together

Strip away the binding machinery and [MVVM](../GLOSSARY.md#model-view-viewmodel-mvvm) reduces to the same principle as its ancestor:
**separated presentation** [Fowler]. The [Model](../GLOSSARY.md#model) side is independent of the concrete [View](../GLOSSARY.md#view); the [ViewModel](../GLOSSARY.md#viewmodel)
shapes state/behavior for presentation; the [View](../GLOSSARY.md#view) renders and captures interaction. A separate
Clean/[Onion architecture](../GLOSSARY.md#onion-architecture) may place authoritative application/domain policy further inward. Everything in
[The Binding](2-the-binding.md) is a consequence of deciding that a framework, not a programmer,
keeps the first two in sync with the third.

---

Next: **[The Binding](2-the-binding.md)** — the cycle that replaces [MVC](../GLOSSARY.md#model-view-controller-mvc)'s observer loop, and the
trade-offs that come with letting the framework do the wiring.
