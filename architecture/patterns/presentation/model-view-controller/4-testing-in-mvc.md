> **[Model-View-Controller](README.md)** › Testing.

## 4. Testing in MVC

Test the responsibilities you actually implemented. A presentation pattern creates useful seams; it does not prescribe a fixed distribution of tests or eliminate rendering risk.

### 4.1 The Model tests like a pure object

For the cart in [The Three Parts](1-the-three-parts.md), exercise pricing/quantity behavior without a DOM:

```js
// Vitest excerpt: CartModel is imported from the feature's model module.
test('total includes quantity', () => {
  const cart = new CartModel()
  cart.add({ price: 12, qty: 2 })
  expect(cart.total).toBe(24)
})
```

Also test change notifications if observation is part of that contract. In a layered system, authoritative policy tests belong with [Domain](../../../../GLOSSARY.md#domain)/[Application](../../../../GLOSSARY.md#application-layer), even if [MVC](../../../../GLOSSARY.md#model-view-controller-mvc) presents their results.

<a id="42-the-controller-tests-against-a-fake-model"></a>

### 4.2 The Controller tests against a controlled Model

```js
// CartController is the class from The Three Parts.
test('adding interprets the selected product', () => {
  const added = []
  const model = { add: item => added.push(item) }
  const catalog = { find: id => id === 'book' ? { price: 12 } : undefined }
  const controller = new CartController(model, catalog)
  controller.onAdd('book')
  expect(added).toEqual([{ price: 12, qty: 1 }])
})
```

This substitute records outcomes. A canned `vi.fn()` answer is a [stub](../../../../GLOSSARY.md#stub)/[spy](../../../../GLOSSARY.md#spy); a [fake](../../../../GLOSSARY.md#fake) implements simplified working behavior. Test missing input, errors and asynchronous operations when the real controller handles them.

<a id="43-the-view-is-the-part-you-test-least"></a>

### 4.3 The View needs its own tests

Even a [Passive View](../../../../GLOSSARY.md#passive-view) can bind the wrong value, forward the wrong id, leak subscriptions, mishandle pending state or produce inaccessible controls. Verify initial rendering, model-driven updates, gesture forwarding, cleanup and accessibility. Retain critical integrated journeys for the actual wiring; do not infer that a thin [View](../../../../GLOSSARY.md#view) “barely needs testing”.

### 4.4 The pyramid, restated for MVC

| Responsibility | Evidence |
| --- | --- |
| [Model](../../../../GLOSSARY.md#model)/policy | behavior and [invariant](../../../../GLOSSARY.md#invariant) outcomes |
| [Controller](../../../../GLOSSARY.md#controller)/[Presenter](../../../../GLOSSARY.md#presenter) | intent translation and error/result handling |
| [View](../../../../GLOSSARY.md#view) | rendering, event arguments, lifetime and accessibility |
| Integration | subscriptions, concrete bindings and critical journeys |

Use the [test pyramid](../../../../GLOSSARY.md#test-pyramid) as a feedback/cost heuristic, not a quota. Import-boundary tests complement these behavior tests.

## Sources

- [Fowler — Passive View](https://martinfowler.com/eaaDev/PassiveScreen.html)
- [Fowler — Test Double](https://martinfowler.com/bliki/TestDouble.html)
- [Testing Library — Guiding Principles](https://testing-library.com/docs/guiding-principles/)
