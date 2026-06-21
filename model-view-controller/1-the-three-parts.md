> **[Model-View-Controller](README.md)** › The Three Parts. Full reference list: [References](references.md).

## 1. The Three Parts

MVC was first described by Trygve Reenskaug at Xerox PARC in 1979 and codified for Smalltalk-80 by Krasner
and Pope in 1988 [Reenskaug 1979; Krasner & Pope 1988]. Its goal was narrow and durable: keep the *domain*
(what the program is about) separate from the *presentation* (how it appears on a screen). The three parts
divide that responsibility.

---

### 1.1 Model

**Responsibility.** Hold the application's data and the rules that govern it, independent of any screen.
The Model is the part that would still make sense if the UI were deleted.

**What lives here.**
- The data being worked on (a `Cart`, a `User`, a list of orders).
- The rules and derived state over that data (a cart's total, whether an order can be cancelled).
- A way to **announce that it changed** — classically, the observer/subject mechanism.

**What it must not do.** Reference a View or a Controller, format itself for display, or reach into the
DOM. In classic MVC the Model does not know who is observing it; it broadcasts "I changed" and lets
observers react [Krasner & Pope 1988].

**Generic example.** A model that owns its state and notifies on change:

```js
class CartModel {
  #items = []
  #listeners = new Set()

  add(item) {
    this.#items.push(item)
    this.#emit()                 // announce — but to no one in particular
  }

  get total() {
    return this.#items.reduce((sum, i) => sum + i.price * i.qty, 0)
  }

  subscribe(fn) { this.#listeners.add(fn); return () => this.#listeners.delete(fn) }
  #emit() { this.#listeners.forEach((fn) => fn()) }
}
```

The Model contains the business meaning. If this looks like the **Domain** of an Onion app or the
**Entities** of a Clean app, that is not a coincidence — MVC's Model is the same idea seen from the
presentation tier. The difference is that MVC's Model usually also carries the change-notification needed
to drive a UI, a concern the inner rings of Clean/Onion push outward.

---

### 1.2 View

**Responsibility.** Present the Model to the user. The View reads from the Model and renders it; when the
Model announces a change, the View redraws.

**What lives here.**
- The markup/templates and the code that maps Model state onto pixels.
- Observation of the Model: the View subscribes and re-reads on notification.
- Forwarding of raw user gestures to the Controller (a click handler that calls a controller method).

**What it must not do.** Hold business rules or decide what a user action *means*. A View that computes a
discount, validates an order, or talks to a server has absorbed responsibilities that belong to the Model
and the Controller. The strictest form of this rule is Fowler's **Passive View**: the View holds no logic
at all and is driven entirely from outside [Fowler].

**Generic example.** A view that observes and redraws, and delegates intent:

```js
class CartView {
  constructor(model, controller, root) {
    this.model = model
    this.controller = controller
    this.root = root
    model.subscribe(() => this.render())          // redraw on Model change
    root.addEventListener('click', (e) => {
      if (e.target.matches('.add')) this.controller.onAdd(e.target.dataset.id)  // forward intent
    })
  }

  render() {
    this.root.querySelector('.total').textContent = format(this.model.total)
  }
}
```

The View knows *how* to draw the total; it does not know *how* the total is computed, nor *what* a click
should accomplish. It only reads state and forwards gestures.

---

### 1.3 Controller

**Responsibility.** Interpret user input and translate it into operations on the Model. The Controller is
the part that decides what a gesture *means*.

**What lives here.**
- Input handling logic: what to do when the user clicks "add", submits a form, or navigates.
- Coordination of Model updates in response to that input.
- In classic Smalltalk MVC, the Controller also owned the input devices (mouse, keyboard) for its View.

**What it must not do.** Render, or hold domain rules. The Controller orchestrates; it asks the Model to
do the work and lets the View observe the result. A "fat controller" that accumulates business logic is
the most common way MVC decays — that logic belongs in the Model [Fowler].

**Generic example.** A controller that turns a gesture into a Model operation:

```js
class CartController {
  constructor(model, catalog) {
    this.model = model
    this.catalog = catalog
  }

  onAdd(productId) {
    const product = this.catalog.find(productId)   // decide what the click means
    this.model.add({ price: product.price, qty: 1 })  // delegate the change to the Model
  }
}
```

Note what is absent: no rendering, and no rule about *how* a total is formed. The Controller is thin by
design — it is a translator between the user's intent and the Model's vocabulary.

---

### 1.4 The one rule that holds it together

Strip away the variants and MVC reduces to a single principle: **separated presentation** [Fowler]. The
Model is the domain, kept ignorant of the screen; the View and Controller are the presentation, kept free
of domain rules. Everything in [The Flow](2-the-flow.md) is a consequence of deciding *who notifies whom*
once that separation is in place.

---

Next: **[The Flow](2-the-flow.md)** — how input, update, and render form a cycle, and how the variants
(MVP, MVVM) differ only in how that cycle is wired.
