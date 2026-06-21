> **[Model-View-Controller](README.md)** › Testing. Full reference list: [References](references.md).

## 4. Testing in MVC

Separated presentation is, in the end, a testability decision. The reason to keep the Model ignorant of the
View is the same reason to keep Entities ignorant of frameworks in Clean Architecture: it lets the part
that carries the meaning be tested with nothing else attached.

---

### 4.1 The Model tests like a pure object

Because the Model holds no reference to a View or the DOM, its rules are tested by construction and
assertion — no rendering, no mounting, no mocks:

```js
test('cart total sums price times quantity', () => {
  const cart = new CartModel()
  cart.add({ price: 10, qty: 2 })
  cart.add({ price: 5, qty: 1 })
  expect(cart.total).toBe(25)
})
```

This is where most MVC tests should live. The Model is the densest, most stable part — the rules change for
business reasons, not for UI reasons — so tests pinned to it are both valuable and durable.

---

### 4.2 The Controller tests against a fake Model

A Controller's job is to translate input into the right Model operation. Test it by giving it a Model (real
or a spy) and asserting the operation it triggers — still no UI:

```js
test('onAdd looks up the product and adds it to the cart', () => {
  const cart = { add: vi.fn() }
  const catalog = { find: () => ({ price: 10 }) }
  const controller = new CartController(cart, catalog)

  controller.onAdd('sku-1')

  expect(cart.add).toHaveBeenCalledWith({ price: 10, qty: 1 })
})
```

Note the seam: the Controller depends on the Model through its public methods, so a fake slots in exactly
where the real Model would. This is the same port-and-fake substitution that
[Clean Architecture's Test Boundary](../clean-architecture/3-testing-in-clean.md) describes — a test is just
another collaborator plugged into a known seam.

---

### 4.3 The View is the part you test least

A View that holds no logic — a **Passive View** — barely needs testing: there is little to get wrong beyond
"does it render the state it was given." That is by design. The more logic you pull out of the View and into
the Model and Controller, the smaller and cheaper the View's tests become, and the more your test effort
concentrates where the meaning is [Fowler].

If a View is hard to test, it is usually carrying logic that belongs elsewhere — the test difficulty is
feedback on the separation, exactly as it is in the layered architectures.

---

### 4.4 The pyramid, restated for MVC

| Part | What you test | Setup cost |
|---|---|---|
| **Model** | rules, derived state, change notification | none — pure objects |
| **Controller / Presenter** | input → correct Model operation | a fake Model |
| **View** | renders given state; forwards gestures | a render harness; keep these few |

The shape matches every other guide here: most tests at the stable center, few at the volatile edge. MVC
arrives at that shape from the presentation side; Clean and Onion arrive at it from the whole-system side.
Both are describing the same dividend of keeping the domain separate from its delivery.

---

Back to the **[MVC index](README.md)** · See the full **[References](references.md)**.
