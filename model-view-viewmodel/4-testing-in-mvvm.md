> **[Model-View-ViewModel](README.md)** › Testing. Full reference list: [References](references.md).

## 4. Testing in MVVM

Testability is not a side benefit of MVVM; it is the pattern's founding motivation, in its authors'
own words. Gossman: "the ViewModel is easier to unit test than code-behind or event driven code …
you can test it without awkward UI automation and interaction" [Gossman 2006]. Smith: "the ease
with which you can create unit tests for ViewModel classes is a huge selling point of the MVVM
pattern," and — the sharpest formulation of the idea — "Views and unit tests are just two different
types of ViewModel consumers" [Smith 2009]. If the tests described below are hard to write, the
pattern has not been applied — only its vocabulary.

---

### 4.1 The ViewModel tests headless

The ViewModel holds display state and commands, and references no View. So the test is: construct
it with a Model (real or fake), invoke a command the way a binding would, and assert on the exposed
state — the same state the View would have rendered:

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
ViewModel *is* the screen, minus the pixels. This is where most of a screen's tests should live: the
display logic (formatting, filtering, flags, sequencing) is the part that carries screen-specific
meaning, and here it is testable at unit-test speed.

---

### 4.2 The Model tests like a pure object

Unchanged from [MVC](../model-view-controller/4-testing-in-mvc.md#41-the-model-tests-like-a-pure-object),
and even simpler: in MVVM the Model does not carry change-notification machinery, so it is construction
and assertion, nothing else:

```js
test('cart total sums price times quantity', () => {
  const cart = new Cart()
  cart.add({ price: 10, qty: 2 })
  expect(cart.total).toBe(20)
})
```

In a layered app these are the Domain and use-case tests of the
[Clean Test Boundary](../clean-architecture/3-testing-in-clean.md) — the same tests, claimed by the
inner rings.

---

### 4.3 Commands test the seam, fakes fill it

A command's job is translation: gesture in, the right inward call out. When the ViewModel sits
inside a Clean/Onion app and its commands call use cases
([§3.3](3-mvvm-on-the-frontend.md#33-how-mvvm-sits-inside-onion-and-clean)), the test substitutes a
fake at exactly that seam:

```js
test('addItem forwards to the use case with the selected product', async () => {
  const addToCart = vi.fn().mockResolvedValue(undefined)   // fake use case
  const vm = useCartViewModel({ addToCart })

  await vm.addItem('sku-1')

  expect(addToCart).toHaveBeenCalledWith({ productId: 'sku-1', qty: 1 })
})
```

This is the port-and-fake substitution every guide here converges on — a test is a collaborator
plugged into a known seam. The binding layer never appears in these tests, because the binding layer
is the framework's code, not yours.

---

### 4.4 The View is the part you test least

A View reduced to bindings has almost nothing left to get wrong: the framework guarantees that bound
state renders and that bound events fire. Keep a *few* component tests for what genuinely lives in
the View — conditional markup structure, accessibility attributes, that gestures reach the right
command — and resist re-testing ViewModel logic through the DOM at 100× the cost.

The familiar diagnostic applies: a component that is hard to test is a component hoarding logic that
belongs in the ViewModel or further inward. Test difficulty is feedback on the separation
[Fowler].

---

### 4.5 The pyramid, restated for MVVM

| Part | What you test | Setup cost |
|---|---|---|
| **Model** | rules, derived state | none — pure objects |
| **ViewModel** | display state, command sequencing, use-case calls | a fake Model or use case |
| **View** | bindings reach the right state and commands; a11y | a render harness; keep these few |

The shape matches every other guide here: most tests at the stable center, few at the volatile edge.
MVVM's contribution is moving the *screen's own logic* into the cheap tier — which is, historically,
exactly what it was invented to do [Gossman 2005].

---

Back to the **[MVVM index](README.md)** · See the full **[References](references.md)**.
