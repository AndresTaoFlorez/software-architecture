> **[Clean Architecture](README.md)** › Testing. Full reference list: [References](references.md).

## 3. Testing in Clean Architecture

Testability is not a separate discipline bolted onto Clean Architecture — it is the design's most
immediate dividend. The same rule that forbids an inner circle from naming an outer one is what guarantees
that, in a test, every outer collaborator can be replaced by a substitute under the test's control
[Cockburn 2005; Martin 2017].

### 3.1 A test is just another adapter

Martin places automated tests in the outermost circle, as another kind of *detail* that consumes the
application through the same boundaries the UI does — the **Test Boundary** [Martin 2017, ch. 28]. The
consequence is liberating: **a test is just another adapter.** Where production plugs an HTTP gateway into
a port, a test plugs a fake into the same port. Nothing in the Entities or Use Cases changes between the
two configurations — which is the entire point of having a port there.

```
   Production wiring                     Test wiring
   ────────────────                      ───────────
   createUser ── port ── HttpUserGateway   createUser ── port ── FakeUserRepository
                          (real network)                         (in-memory, instant)
```

From this follows the rule of thumb that prevents fragile tests: **tests should depend on the stable inner
circles, not on the volatile outer details.** A test that drives the UI to assert a business rule is
coupled to two things that change for unrelated reasons — the rule and the markup. A test that calls the
use case directly is coupled only to the rule.

### 3.2 The test pyramid mapped onto the circles

The classic test pyramid [Cohn 2009; Vocke 2018] maps cleanly onto the four circles. Cost rises and
desired quantity falls as you move outward:

| Circle | What you test | Test double needed | Cost |
|---|---|---|---|
| **Entities** | invariants, derived state, rules | none | trivial — pure functions |
| **Use Cases** | orchestration, validation, error mapping | a fake for each port | cheap — one fake, no network |
| **Interface Adapters** | mapping JSON ↔ entities, controller wiring | a stubbed transport | moderate |
| **Frameworks & Drivers** | that the framework is wired correctly | the real thing, or a harness | expensive — keep few |

Most of your tests should sit in the bottom two rows, because that is where most of the *meaning* lives and
where tests are cheapest to write and slowest to rot.

### 3.3 Why the inner circles are cheap to test

An Entity test needs no setup at all — construct the object, assert a getter:

```js
test('a pending order can be cancelled', () => {
  const order = new Order({ id: '1', lines: [], status: 'pending' })
  expect(order.canBeCancelled()).toBe(true)
})
```

A Use Case test supplies a fake for each port and asserts the orchestration — still no network, no
framework, no DOM:

```js
test('createUser delegates to the repository', async () => {
  const fake = { create: vi.fn().mockResolvedValue(new User({ id: '1' })) }
  const createUser = makeCreateUser({ userRepository: fake })

  await createUser({ firstName: 'Ada' })

  expect(fake.create).toHaveBeenCalledOnce()
})
```

The fake is injected in **one line** because the use case depends on a port. The moment a use case instead
imports a concrete adapter, this test can no longer inject a fake cleanly — it must intercept a module path
at the bundler level, which is exactly the kind of brittle, implementation-coupled test the architecture
exists to avoid. **The test you have to write is feedback on the design you chose** — if a unit is hard to
test, it is usually depending outward.

### 3.4 Test doubles, named

Use the precise vocabulary [Meszaros 2007; Fowler 2007] rather than calling everything a "mock":

- **Fake** — a working but simplified implementation (an in-memory repository). The default for ports.
- **Stub** — returns canned answers to calls made during the test.
- **Spy** — a stub that also records how it was called.
- **Mock** — a double pre-programmed with expectations that it verifies.
- **Dummy** — passed to fill a parameter list but never used.

Prefer **fakes and stubs over mocks** for port boundaries: assert the observable outcome, not the exact
sequence of internal calls. Over-mocking couples a test to *how* a unit works rather than *what* it does,
and that is the most common cause of tests that break on every refactor [Khorikov 2020].

### 3.5 Where tests live

Co-locate tests in `__tests__/` siblings, named `<Unit>.test.js`, mirroring the circle they cover. A test
substitutes exactly one circle outward — the boundary the unit under test depends on — and no further.

---

Next: **[Composition & Dependency Injection](4-composition-and-di.md)** — the one place allowed to name
both a port and its concrete adapter.
