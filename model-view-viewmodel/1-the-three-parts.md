> **[Model-View-ViewModel](README.md)** › The Three Parts. Full reference list: [References](references.md).

## 1. The Three Parts

MVVM was introduced by John Gossman in 2005 for WPF, as a specialization of Martin Fowler's
**Presentation Model** pattern tailored to platforms with a declarative binding system
[Gossman 2005; Fowler 2004]. Its goal is the same separated presentation MVC pursued since 1979 —
domain state isolated from how it is displayed — plus one more, stated by Gossman himself: "the
ViewModel is easier to unit test than code-behind or event driven code … you can test it without
awkward UI automation and interaction" [Gossman 2006]. The three parts divide that responsibility.

---

### 1.1 Model

**Responsibility.** Hold the application's data and the rules that govern it, independent of any
screen. Identical to MVC's Model: the part that would still make sense if the UI were deleted.

**What lives here.**
- The data being worked on (a `Cart`, a `User`, a list of orders).
- The rules and derived state over that data (a cart's total, whether an order can be cancelled).

**What it must not do.** Reference a View or a ViewModel, format itself for display, or know that
binding exists. In MVVM the Model does not even need the change-notification machinery classic MVC
required of it — announcing changes to the screen is the ViewModel's job now.

```js
class Cart {
  #items = []

  add(item) { this.#items.push(item) }

  get total() {
    return this.#items.reduce((sum, i) => sum + i.price * i.qty, 0)
  }
}
```

If this looks like the **Domain** of an Onion app or the **Entities** of a Clean app, that is not a
coincidence — it is the same idea seen from the presentation tier, and in a layered app it *is* those
inner rings (see [MVVM on the Frontend §3.3](3-mvvm-on-the-frontend.md#33-how-mvvm-sits-inside-onion-and-clean)).

---

### 1.2 View

**Responsibility.** Present the ViewModel to the user. The View is a declarative template: it binds
to the ViewModel's state and renders it; when that state changes, the binding re-renders the View
without anyone writing subscription code.

**What lives here.**
- The markup/template and purely visual concerns (layout, styling, animation triggers).
- Bindings: which ViewModel value feeds which element, which gesture invokes which command.

**What it must not do.** Hold business rules, hold display state of its own, or reach past the
ViewModel into the Model or the network. A View that computes a discount or calls `fetch` has
collapsed the pattern. The ideal MVVM View is thin by construction — "the View is almost always
defined declaratively, very often with a tool" [Gossman 2005] — the closest practical thing to
Fowler's **Passive View** [Fowler].

```html
<!-- The View: bindings only. No logic worth testing. -->
<p class="total">{{ cart.formattedTotal }}</p>
<button @click="cart.addItem(product.id)">Add</button>
```

The View knows *where* the total goes on screen; it does not know how the total is computed, nor what
"Add" means. Both of those live one step inward.

---

### 1.3 ViewModel

**Responsibility.** In Gossman's definition: "The term means 'Model of a View', and can be thought
of as abstraction of the view, but it also provides a specialization of the Model that the View can
use for data-binding" [Gossman 2005]. Fowler's ancestor pattern states the same shape more sharply:
"a fully self-contained class that represents all the data and behavior of the UI window, but
without any of the controls used to render that UI on the screen" [Fowler 2004]. The ViewModel
exposes exactly what the View needs to render (display-ready values) and exactly what the user can do
(commands), and keeps both correct as the underlying Model changes.

**What lives here.**
- **Display state**: the Model's data reshaped for presentation — formatted amounts, filtered and
  sorted lists, `isLoading` / `isSaving` flags, which panel is open, what the user has typed so far.
- **Commands**: methods the View's bindings invoke on user gestures (`addItem`, `submit`,
  `dismiss`). This is where MVC's Controller went — gesture interpretation, absorbed into the
  ViewModel [Fowler, GUI Architectures].
- **Change notification**: the reactive machinery (observables, signals, store subscriptions) the
  binding layer uses to know when to re-render.

**What it must not do.** Two prohibitions define the pattern:

1. **Never reference the View.** No DOM handles, no component instances, no toolkit imports. The
   ViewModel must be constructible and drivable in a test with no UI attached — that is the
   pattern's entire payoff [Gossman 2006; Smith 2009].
2. **Never absorb the Model's rules.** The ViewModel *reshapes and coordinates*; it does not decide
   domain outcomes. A ViewModel that computes prices or validates business invariants has become a
   "fat ViewModel" — MVVM's own decay mode, examined in
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

Nowhere mysterious. Classic MVC's Controller had two jobs: own the input devices and translate
gestures into Model operations. Modern toolkits took the first job — in Gossman's account, the
controls themselves now "manage the interaction with the input devices that is the responsibility
of Controller in MVC," and as for the Controller, "I tend to think it just faded into the
background" [Gossman 2005]. The ViewModel's commands took the second job. The triad did not lose a
member; one member was renamed to reflect that its center of gravity moved from *interpreting
input* to *owning display state* [Fowler, GUI Architectures].

---

### 1.5 The one rule that holds it together

Strip away the binding machinery and MVVM reduces to the same principle as its ancestor:
**separated presentation** [Fowler]. The Model is the domain, ignorant of screens; the ViewModel is
the screen's state, ignorant of pixels; the View is pixels, ignorant of meaning. Everything in
[The Binding](2-the-binding.md) is a consequence of deciding that a framework, not a programmer,
keeps the first two in sync with the third.

---

Next: **[The Binding](2-the-binding.md)** — the cycle that replaces MVC's observer loop, and the
trade-offs that come with letting the framework do the wiring.
