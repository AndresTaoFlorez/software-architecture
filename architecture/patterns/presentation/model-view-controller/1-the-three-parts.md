> **[Model-View-Controller](README.md)** › The Three Parts. Full reference list: [References](references.md).

## 1. The Three Parts

[MVC](../../../../GLOSSARY.md#model-view-controller-mvc) was first described by Trygve Reenskaug at Xerox PARC in 1979 and codified for Smalltalk-80 by Krasner
and Pope in 1988 [Reenskaug 1979; Krasner & Pope 1988].

Start with a screen showing an order and a **Cancel** button. It needs to display the order's current status, understand that the click means “request cancellation,” and show the updated information. Classic MVC gives these jobs distinct roles: the [Model](../../../../GLOSSARY.md#model) represents the relevant information and behavior, the [Controller](../../../../GLOSSARY.md#controller) interprets input, and the [View](../../../../GLOSSARY.md#view) displays it. The displayed screen can observe changes in the represented information to know when to redraw.

The durable goal is to keep the information/behavior being represented separate from concrete screen mechanics. These three roles do not by themselves determine the application's database layout or Clean/Onion layers.

---

### 1.1 Model

**Responsibility.** Hold the application's data and the rules that govern it, independent of any screen.
The [Model](../../../../GLOSSARY.md#model) is the part that would still make sense if the UI were deleted.

**What lives here.**
- The data being worked on (a `Cart`, a `User`, a list of orders).
- The rules and derived state over that data (a cart's total, whether an order can be cancelled).
- A way to **announce that it changed** — classically, the observer/subject mechanism.

**What it must not do.** Reference a [View](../../../../GLOSSARY.md#view) or a [Controller](../../../../GLOSSARY.md#controller), format itself for display, or reach into the
DOM. In classic [MVC](../../../../GLOSSARY.md#model-view-controller-mvc) the Model does not know who is observing it; it broadcasts "I changed" and lets
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

The word **Model** is intentionally broader than a Clean/Onion layer name. In classic MVC it is the
non-presentation state/behavior being presented. In a layered application that role may be backed by
[Domain](../../../../GLOSSARY.md#domain) objects, [Application](../../../../GLOSSARY.md#application-layer) results, a dedicated [presentation model](../../../../GLOSSARY.md#presentation-model), or a combination of them.

Do **not** conclude that `MVC Model === Domain` or `MVC Model === Clean Entities`. Those taxonomies
describe different scopes. If the Model carries UI change-notification machinery, that mechanism is a
presentation concern even when the represented business concepts ultimately come from Domain.

---

### 1.2 View

**Responsibility.** Present the [Model](../../../../GLOSSARY.md#model) to the user. The [View](../../../../GLOSSARY.md#view) reads from the Model and renders it; when the
Model announces a change, the View redraws.

**What lives here.**
- The markup/templates and the code that maps Model state onto pixels.
- Observation of the Model: the View subscribes and re-reads on notification.
- Forwarding of raw user gestures to the [Controller](../../../../GLOSSARY.md#controller) (a click handler that calls a controller method).

**What it must not do.** Hold business rules or decide what a user action *means*. A View that computes a
discount, validates an order, or talks to a server has absorbed responsibilities that belong to the Model
and application policy. Fowler's [Passive View](../../../../GLOSSARY.md#passive-view) is a distinct presentation variant: it has no Model access and is driven through a view interface. Classic [MVC](../../../../GLOSSARY.md#model-view-controller-mvc) instead permits the View to observe/read its Model.

The following fragment assumes an existing `.total` element and a `format` display helper; the [landing feature](README.md#10-first-feature-end-to-end) shows the Model observation and Controller interaction.

**Generic example.** A view that observes and redraws, and delegates intent:

```js
class CartView {
  constructor(model, controller, root) {
    this.model = model
    this.controller = controller
    this.root = root
    this.unsubscribe = model.subscribe(() => this.render())
    this.onClick = (e) => {
      if (!(e.target instanceof Element)) return
      const button = e.target.closest('.add')
      if (button && root.contains(button)) this.controller.onAdd(button.dataset.id)
    }
    root.addEventListener('click', this.onClick)
    this.render()          // initial render
  }

  dispose() {
    this.unsubscribe()
    this.root.removeEventListener('click', this.onClick)
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

**Responsibility.** Interpret user input and translate it into operations on the [Model](../../../../GLOSSARY.md#model). The [Controller](../../../../GLOSSARY.md#controller) is
the part that decides what a gesture *means*.

**What lives here.**
- Input handling logic: what to do when the user clicks "add", submits a form, or navigates.
- Coordination of Model updates in response to that input.
- In classic Smalltalk [MVC](../../../../GLOSSARY.md#model-view-controller-mvc), the Controller also owned the input devices (mouse, keyboard) for its [View](../../../../GLOSSARY.md#view).

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
    if (!product) return // no matching product; UI feedback policy can be added
    this.model.add({ price: product.price, qty: 1 })  // delegate the change to the Model
  }
}
```

Note what is absent: no rendering, and no rule about *how* a total is formed. The Controller is thin by
design — it is a translator between the user's intent and the Model's vocabulary.

---

### 1.4 The one rule that holds it together

Strip away the variants and [MVC](../../../../GLOSSARY.md#model-view-controller-mvc) reduces to a single principle: **[separated presentation](../../../../GLOSSARY.md#separated-presentation)** [Fowler]. The
[Model](../../../../GLOSSARY.md#model) side is kept independent of concrete rendering/input mechanics; the [View](../../../../GLOSSARY.md#view) and [Controller](../../../../GLOSSARY.md#controller) stay focused
on presentation responsibilities. In a Clean/Onion system, authoritative business rules normally live
further inward than the MVC presentation boundary. Everything in [The Flow](2-the-flow.md) is a consequence of deciding *who notifies whom*
once that separation is in place.

---

Next: **[The Flow](2-the-flow.md)** — input, update, observation and the distinct presentation variants.
