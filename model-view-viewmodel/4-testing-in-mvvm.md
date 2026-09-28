> **[Model-View-ViewModel](README.md)** › Testing. Full reference list: [References](references.md).

## 4. Testing in MVVM

Testability is not a side benefit of [MVVM](../GLOSSARY.md#model-view-viewmodel-mvvm); it is the pattern's founding motivation, in its authors'
own words. Gossman: "the [ViewModel](../GLOSSARY.md#viewmodel) is easier to unit test than code-behind or event driven code …
you can test it without awkward UI automation and interaction" [Gossman 2006]. Smith: "the ease
with which you can create unit tests for [ViewModel](../GLOSSARY.md#viewmodel) classes is a huge selling point of the [MVVM](../GLOSSARY.md#model-view-viewmodel-mvvm)
pattern," and — the sharpest formulation of the idea — "[Views](../GLOSSARY.md#view) and unit tests are just two different
types of [ViewModel](../GLOSSARY.md#viewmodel) consumers" [Smith 2009]. If the tests described below are hard to write, the
pattern has not been applied — only its vocabulary.

---

### 4.1 The ViewModel tests headless

The [ViewModel](../GLOSSARY.md#viewmodel) holds display state and commands, and references no [View](../GLOSSARY.md#view). So the test is: construct
it with a [Model](../GLOSSARY.md#model) (real or [fake](../GLOSSARY.md#fake)), invoke a command the way a binding would, and assert on the exposed
state — the same state the [View](../GLOSSARY.md#view) would have rendered:

```js
test('addItem exposes a busy flag while the add is in flight', async () => {
  const cart = new Cart()                       // real Model: cheap and honest
  const catalog = { find: () => ({ price: 10, qty: 1 }) }
  const vm = useCartViewModel({ cart, catalog })

  const pending = vm.addItem('sku-1')
  expect(vm.isAdding.value).toBe(true)          // what the View would show now

  await pending
  expect(vm.isAdding.value).toBe(false)
  expect(vm.formattedTotal.value).toBe('$10.00')
})
```

No DOM, no mounting, no snapshot. The test reads like a user story — act, then look — because the
[ViewModel](../GLOSSARY.md#viewmodel) *is* the screen, minus the pixels. This is where most of a screen's tests should live: the
display logic (formatting, filtering, flags, sequencing) is the part that carries screen-specific
meaning, and here it is testable at unit-test speed.

---

### 4.2 The Model tests like a pure object

Unchanged from [MVC](../model-view-controller/4-testing-in-mvc.md#41-the-model-tests-like-a-pure-object),
and even simpler: in [MVVM](../GLOSSARY.md#model-view-viewmodel-mvvm) the [Model](../GLOSSARY.md#model) does not carry change-notification machinery, so it is construction
and assertion, nothing else:

```js
test('cart total sums price times quantity', () => {
  const cart = new Cart()
  cart.add({ price: 10, qty: 2 })
  expect(cart.total).toBe(20)
})
```

In a layered app these are the [Domain](../GLOSSARY.md#domain) and use-case tests of the
[Clean Test Boundary](../clean-architecture/5-testing-in-clean.md) — the same tests, claimed by the
inner rings.

---

### 4.3 Commands test the seam, fakes fill it

A command's job is translation: gesture in, the right inward call out. When the [ViewModel](../GLOSSARY.md#viewmodel) sits
inside a Clean/Onion app and its commands call [use cases](../GLOSSARY.md#use-case)
([§3.3](3-mvvm-on-the-frontend.md#33-how-mvvm-sits-inside-onion-and-clean)), the test substitutes a
[fake](../GLOSSARY.md#fake) at exactly that seam:

```js
test('addItem forwards to the use case with the selected product', async () => {
  const addToCart = vi.fn().mockResolvedValue(undefined)   // fake use case
  const vm = useCartViewModel({ addToCart })

  await vm.addItem('sku-1')

  expect(addToCart).toHaveBeenCalledWith({ productId: 'sku-1', qty: 1 })
})
```

This is the [port](../GLOSSARY.md#port)-and-[fake](../GLOSSARY.md#fake) substitution every guide here converges on — a test is a collaborator
plugged into a known seam. The binding layer never appears in these tests, because the binding layer
is the framework's code, not yours.

---

### 4.4 The View is the part you test least

A [View](../GLOSSARY.md#view) reduced to bindings has almost nothing left to get wrong: the framework guarantees that bound
state renders and that bound events fire. Keep a *few* component tests for what genuinely lives in
the [View](../GLOSSARY.md#view) — conditional markup structure, accessibility attributes, that gestures reach the right
command — and resist re-testing [ViewModel](../GLOSSARY.md#viewmodel) logic through the DOM at 100× the cost.

The familiar diagnostic applies: a component that is hard to test is a component hoarding logic that
belongs in the [ViewModel](../GLOSSARY.md#viewmodel) or further inward. Test difficulty is feedback on the separation
[Fowler].

---

### 4.5 The pyramid, restated for MVVM

| Part | What you test | Setup cost |
|---|---|---|
| **[Model](../GLOSSARY.md#model)** | rules, derived state | none — pure objects |
| **[ViewModel](../GLOSSARY.md#viewmodel)** | display state, command sequencing, use-case calls | a [fake](../GLOSSARY.md#fake) [Model](../GLOSSARY.md#model) or [use case](../GLOSSARY.md#use-case) |
| **[View](../GLOSSARY.md#view)** | bindings reach the right state and commands; a11y | a render harness; keep these few |

The shape matches every other guide here: most tests at the stable center, few at the volatile edge.
[MVVM](../GLOSSARY.md#model-view-viewmodel-mvvm)'s contribution is moving the *screen's own logic* into the cheap tier — which is, historically,
exactly what it was invented to do [Gossman 2005].

---

Next: **[MVVM in React + Redux Toolkit](5-mvvm-in-react-redux.md)** — the mapping pinned to one
stack: slices, [selectors](../GLOSSARY.md#selector), [RTK Query](../GLOSSARY.md#rtk-query) at the infrastructure seam, and the use-case layer as a
deliberate addition.
