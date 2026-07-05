> **[Model-View-ViewModel](README.md)** › MVVM on the Frontend. Full reference list: [References](references.md).

## 3. MVVM on the Frontend

The [MVC guide](../model-view-controller/3-mvc-on-the-frontend.md) argues that a modern component is
closer to MVVM than to classic MVC. This page takes that conclusion as the starting point and answers
the practical question: **where, concretely, does each MVVM role live in a component codebase** — and
how does the triad sit inside a Clean or Onion application.

---

### 3.1 The honest mapping

| MVVM role | Typical frontend home |
|---|---|
| **Model** | domain entities / plain modules, framework-free — in a layered app, the inner rings |
| **ViewModel** | a store (Pinia/Redux/signals), a composable (`useCart()`), or a hook — display state + commands |
| **View** | the component template and its render output |

Two placements deserve emphasis:

- **The ViewModel is rarely one class.** In WPF it was; on the frontend it is usually *distributed*:
  a shared store holds cross-screen display state, while a composable or hook holds one screen's
  local state and commands. Both halves satisfy the definition — display-ready state plus commands,
  no reference to the rendering — and both test headless. What matters is the role, not the shape.
- **The component is only the View when it stays thin.** The moment a component body accumulates
  state derivations and request logic, it has silently become View *and* ViewModel *and* a slice of
  Model in one file — the fat component the MVC guide names
  [[MVC §3.2](../model-view-controller/3-mvc-on-the-frontend.md#32-the-failure-mode-the-fat-component)].
  Extracting that body into a composable/hook is, literally, extracting the ViewModel.

```js
// The ViewModel, extracted: display state + commands, no JSX, no DOM.
export function useCartViewModel({ cart, catalog }) {
  const isAdding = ref(false)
  const formattedTotal = computed(() => currency.format(cart.total))

  async function addItem(productId) {          // command
    isAdding.value = true
    try { cart.add(catalog.find(productId)) }
    finally { isAdding.value = false }
  }

  return { isAdding, formattedTotal, addItem }
}
```

```html
<!-- The View: consumes the ViewModel, contributes nothing but markup. -->
<script setup>
const vm = useCartViewModel(inject('cartDeps'))
</script>
<template>
  <p class="total">{{ vm.formattedTotal }}</p>
  <button :disabled="vm.isAdding" @click="vm.addItem(product.id)">Add</button>
</template>
```

---

### 3.2 The failure mode: the fat ViewModel

MVC decays into fat components; MVVM has its own decay, one step inward. Because the ViewModel is
the most convenient place in the codebase — reactive, injectable, already holding the data — domain
rules migrate into it: pricing logic in a `computed`, validation invariants in a command, a workflow
decision in a store action. The screen still works; the architecture is gone.

The damage is the same as every collapsed separation:

- the rules are now welded to one screen's ViewModel, and get re-implemented for the next screen;
- they can no longer be tested without constructing presentation state;
- a UI redesign risks changing business behavior, because they share a file.

The test is simple: **would this line still be true if the app had no screens?** If yes, it is Model
(domain) or use-case logic and belongs inward. The ViewModel keeps only what exists *because* this
screen exists: formatting, filtering-for-display, in-progress flags, pending input, and the commands
that forward intent [Fowler 2004; Smith 2009].

---

### 3.3 How MVVM sits inside Onion and Clean

MVVM organizes the presentation tier; Onion and Clean organize the whole app. They compose exactly
as MVC does [[MVC §3.3](../model-view-controller/3-mvc-on-the-frontend.md#33-how-mvc-sits-inside-onion-and-clean)],
with the roles now named honestly:

```
   Onion / Clean outer ring (Presentation)
   ├── View        →  component template (markup + bindings only)
   └── ViewModel   →  store / composable / hook
                       ├── display state          (pure Presentation)
                       └── commands ──────────────► call an APPLICATION USE CASE

   …inner rings (Application, Domain) — unchanged, framework-free
```

The one adjustment when MVVM lives inside a layered architecture: **a command calls an application
use case, not the Model directly.** In a standalone MVVM screen the command manipulates the Model
itself; in a Clean/Onion app that conversation is routed through the Application layer, so the
Dependency Rule still holds and business orchestration stays in one place. The ViewModel keeps its
two prohibitions — no View reference, no domain rules — and gains a third: no reaching past the use
cases into repositories or HTTP clients.

Put plainly: **the ViewModel is the last stop of Presentation, and the use case is the first stop of
everything else.** A codebase where every command body is one use-case call is a codebase where the
onion's outer ring is exactly as thin as it should be.

---

### 3.4 The pattern in the wild

MVVM is not a historical curiosity or a WPF-only convention; it is the documented house pattern of
the largest UI platforms and product companies. Four verifiable anchors:

- **Microsoft** keeps MVVM as the prescribed architecture for .NET MAUI enterprise apps, with the
  same discipline this guide describes: "the view model is unaware of the view," and — as an
  explicit tip — "don't reference view types, such as Button and ListView, from view models. …
  view models can be tested in isolation" [Microsoft, *Enterprise Application Patterns Using
  .NET MAUI*].
- **Google**'s official Android architecture guide is MVVM-shaped in all but name: the UI layer is
  split into "UI elements that render the data on the screen" and "state holders (such as
  `ViewModel`) that hold data, expose it to the UI, and handle logic," connected by unidirectional
  data flow — the narrowed write path of [§2.3](2-the-binding.md#23-two-way-binding-one-way-flow--both-are-mvvm)
  [Google, Guide to App Architecture].
- **Airbnb** built and open-sourced **Mavericks** (formerly MvRx), "the Android framework from
  Airbnb that we use for nearly all product development at Airbnb" — a `MavericksViewModel` owning
  an immutable state class that views render [Airbnb, Mavericks].
- **Vue** acknowledges the lineage in its own documentation: "Although not strictly associated with
  the MVVM pattern, Vue's design was partly inspired by it. As a convention, we often use the
  variable `vm` (short for ViewModel) to refer to our Vue instance" [Vue.js Guide].

The convergence is the point: platforms that never shared code arrived at the same shape — a
declarative View, a testable state-holder it binds to, and domain logic kept further in.

---

Next: **[Testing in MVVM](4-testing-in-mvvm.md)** — the headless ViewModel test, and why it was the
pattern's original selling point.
