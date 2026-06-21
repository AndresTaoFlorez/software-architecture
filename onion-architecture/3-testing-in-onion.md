> **[Onion Architecture](README.md)** › Testing the Layers. Full reference list: [References](references.md).

## 5. Testing the Layers

The previous sections build the case that this architecture *can* be tested cheaply; this section shows
*how*, and why the how falls directly out of the Dependency Rule. Testability is not a separate discipline
bolted onto the design, it is the design's most immediate dividend. The same rule that forbids an inner
layer from naming an outer one is what guarantees that, in a test, every outer collaborator can be
replaced by a substitute under the test's control [Cockburn 2005; Martin 2017].

### 5.1 Tests are an outer ring

Martin places automated tests in the outermost ring, as another kind of *detail* that consumes the
application through the same boundaries the UI does, the "Test Boundary" [Martin 2017, ch. 28]. The
consequence is liberating: **a test is just another adapter.** Where the production system plugs an HTTP
adapter into a port, a test plugs a fake into the same port. Nothing in the Domain or Application layer
changes between the two configurations, which is the entire point of having a port there.

From this follows the rule of thumb that prevents fragile tests: tests should depend on the *stable* inner
rings, not on the *volatile* outer details. A test that drives the UI to assert a business rule is coupled
to the UI and shatters whenever a button moves; a test that calls the use case directly is coupled only to
the rule it verifies, and survives every cosmetic change to the screen [Martin 2017]. The architecture
tells you, mechanically, where to point a test so it stays cheap to keep.

### 5.2 A vocabulary for substitutes

The literature on test doubles is precise, and the precision matters here because each layer wants a
*different* kind of double [Meszaros 2007; Fowler 2007]:

- **Stub**: returns canned answers the code under test reads. It supplies input. ("`fetchAll` resolves to
  these two rows.")
- **Mock**: additionally *verifies* that it was called the way you expected. It asserts an interaction.
  ("`create` was called once, with this payload.")
- **Fake**: a real but lightweight implementation, e.g. an in-memory repository that actually stores and
  returns objects. It behaves, it just doesn't touch the network.

This architecture makes **fakes unusually cheap**, because a port is a small interface, an in-memory
adapter satisfying it is a few lines. Prefer fakes and stubs over mocks wherever you can. Leaning on mocks
couples a test to *how* a use case calls its collaborators rather than *what* it produces, which is the
classic origin of brittle tests that break on every refactor even though behavior is unchanged
[Khorikov 2020; Fowler 2007].

### 5.3 The test pyramid, mapped onto the onion

The Test Pyramid prescribes many fast unit tests at the base, fewer integration tests in the middle, and a
thin layer of end-to-end tests at the top, because the higher you go, the slower, more brittle, and more
expensive each test becomes [Cohn 2009; Vocke 2018]. The onion's rings map almost one-to-one onto the
pyramid's tiers, which is a happy accident worth exploiting:

```
              ╱╲
             ╱  ╲        e2e          Presentation + real transport      (few, slow)
            ╱────╲                    a real browser drives the whole stack
           ╱      ╲
          ╱        ╲     integration  Infrastructure adapters            (some)
         ╱──────────╲                 verify mapping & contracts at the boundary
        ╱            ╲
       ╱              ╲   unit        Application (with fakes)            (many, fast)
      ╱                ╲              Domain (no doubles at all)
     ╱──────────────────╲
```

The deeper the ring, the more tests you should have and the cheaper each one is to write and run: a Domain
test needs no setup at all, an Application test needs one fake, an Infrastructure test needs a stubbed
transport, and an end-to-end test needs the whole application standing up. Spend your test budget where
it buys the most coverage per second, at the base.

### 5.4 Per-layer testing

Each layer below follows a compact template parallel to [§3](1-the-rings.md#3-the-four-layers):
**What to test · What to substitute · Example · Justification.**

#### Domain: substitute nothing

**What to test.** Derived state, invariants, and the normalization an entity performs. These are pure
functions of their inputs.

**What to substitute.** Nothing. A Domain test that needs a mock is a signal that I/O has leaked into the
entity.

**Example.**

```js
// src/domain/entities/__tests__/User.test.js
import { describe, it, expect } from 'vitest'
import { User } from '@/domain/entities/User'

describe('User', () => {
  it('joins the present name parts into a full name', () => {
    const u = new User({ id: 1, first_name: 'Ada', first_surname: 'Lovelace' })
    expect(u.fullName).toBe('Ada Lovelace')      // no double, no I/O, no async
  })

  it('derives a status label from the active flag', () => {
    expect(new User({ id: 1, is_active: false }).statusLabel).toBe('INACTIVO')
  })
})
```

**Justification.** Entities contain the rules "least likely to change," and keeping them free of I/O is
exactly what lets them be "unit-tested with no mocks" [Martin 2017; Evans 2003]. These tests are the
fastest and most stable in the suite, they should also be the most numerous.

#### Application: substitute the port

**What to test.** The orchestration: that the use case maps its input correctly and delegates to the port.

**What to substitute.** The repository port, with a fake or a stub.

**Example (the inverted, prescribed form).**

```js
// src/application/use-cases/users/__tests__/CreateUserUseCase.test.js
import { describe, it, expect, vi } from 'vitest'
import { makeCreateUserUseCase } from '@/application/use-cases/users/CreateUserUseCase'

it('maps the form to the API payload and delegates to the port', async () => {
  const userRepository = { create: vi.fn().mockResolvedValue(/* a User */ {}) }   // a fake port
  const createUser = makeCreateUserUseCase({ userRepository })

  await createUser({ firstName: 'Ada', firstSurname: 'Lovelace', email: 'a@l.io', roleNames: ['admin'] })

  expect(userRepository.create).toHaveBeenCalledWith(
    expect.objectContaining({ first_name: 'Ada', role_names: ['admin'] }),
  )
})
```

**The inversion gap, made visible.** The real `createUserUseCase` does *not* accept an injected
repository today, it `import`s the concrete `UserRepository` directly ([§4.3](2-inward-dependencies.md#43-the-inversion-gap)).
There is therefore no seam to inject a fake, so the test must reach up into an outer ring and replace the
whole module:

```js
// Today, without the inversion: substitute the module by its path
vi.mock('@/infrastructure/repositories/UserRepository', () => ({
  UserRepository: { create: vi.fn().mockResolvedValue({}) },
}))
```

This works, but it couples the test to an Infrastructure *file path*, the precise coupling the Dependency
Rule exists to prevent, now surfacing in the test's setup. The discomfort in the test is the design smell
of §4.3 speaking out loud. **The test you have to write is feedback on the design you chose.**

**Justification.** Use cases hold "application-specific business rules" and should be verifiable without
the network [Martin 2017]; depending on a port rather than a concrete class is what makes the clean form
above possible [Cockburn 2005; Martin 2003].

#### Infrastructure: substitute the transport, keep the mapping real

**What to test.** The adapter's one job: turn raw API shapes into Domain entities, including the defensive
handling of inconsistent payloads.

**What to substitute.** The HTTP client. Everything else, the mapping, the entity construction, stays
real, because that is what you are verifying.

**Example.**

```js
// src/infrastructure/repositories/__tests__/UserRepository.test.js
import { describe, it, expect, vi } from 'vitest'
import client from '@/infrastructure/http/client'
import { UserRepository } from '@/infrastructure/repositories/UserRepository'
import { User } from '@/domain/entities/User'

vi.mock('@/infrastructure/http/client')          // substitute the transport only

it('hydrates raw API rows into User entities', async () => {
  client.get.mockResolvedValue({ data: [{ id: 1, first_name: 'Ada' }] })

  const users = await UserRepository.fetchAll()

  expect(users[0]).toBeInstanceOf(User)          // the contract: JSON in, entities out
  expect(users[0].firstName).toBe('Ada')
})

it('tolerates the alternate { data: { items } } envelope', async () => {
  client.get.mockResolvedValue({ data: { items: [{ id: 2, first_name: 'Grace' }] } })
  const users = await UserRepository.fetchAll()
  expect(users).toHaveLength(1)                   // the array/.data/.items branch is covered
})
```

**Justification.** A repository "acts like an in-memory collection of domain objects", its value is the
boundary mapping, so the boundary mapping is what a test must pin down [Fowler 2002]. Substituting only
the transport keeps the test honest: it exercises the real translation rather than asserting against a
mock of it.

#### Presentation: substitute the use case

**What to test.** That the store calls inward and exposes the result as reactive state; that a component
renders entity-derived data. Not business rules, those are already covered deeper in.

**What to substitute.** The use case (for store tests) or the store (for component tests).

**Example (store).**

```js
// src/presentation/stores/__tests__/useOrderStore.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useOrderStore } from '@/presentation/stores/useOrderStore'
import * as fetchOrders from '@/application/use-cases/orders/FetchOrdersUseCase'

beforeEach(() => setActivePinia(createPinia()))   // a fresh, isolated store per test

it('loads orders by delegating to the use case', async () => {
  vi.spyOn(fetchOrders, 'fetchOrdersUseCase').mockResolvedValue([{ id: 1 }])  // fake the use case

  const store = useOrderStore()
  await store.load()

  expect(store.orders).toEqual([{ id: 1 }])       // the store's whole job: call inward, expose result
})
```

The `setActivePinia(createPinia())` line is the single most common omission in Pinia tests: without it the
store has no active instance and the test throws. Component tests follow the same shape with Vue Test
Utils, `mount` the view, stub the store's actions, and assert on rendered output rather than on internals
[Vue/Pinia docs; Vue Test Utils docs].

**Justification.** Stores are the place that "coordinates state and side-effect-bearing actions"
[Vue/Pinia docs]; a Presentation test should verify that coordination and the rendering, leaving the rules
to the layers that own them. Because the UI consumes only use cases, faking the use case isolates the UI
test completely from transport and from business logic.

### 5.5 What each layer's tests substitute

Just as [§4.1](2-inward-dependencies.md#41-allowed-and-forbidden-imports) reduces the Dependency Rule to a check on `import`
statements, the test strategy reduces to a check on *what each layer's tests are allowed to replace*:

```
Domain tests          substitute: nothing                         (the layer is pure)
Application tests     substitute: the port            (a fake / stub repository)
Infrastructure tests  substitute: the HTTP client     (the transport, never the mapping)
Presentation tests    substitute: the use case        (a fake), or the store for components
```

The mirror of §4.1's heuristic: **a test substitutes exactly one ring outward, the boundary the layer
under test owns, and nothing deeper.** When a Presentation test reaches all the way down to mock the HTTP
client, it has skipped the use case and recoupled itself to a detail the Presentation layer is supposed to
be ignorant of. Over-deep mocking in a test is the same violation as a skip-the-core import, just expressed
in the test suite [Khorikov 2020].

### 5.6 Where tests live

Co-locate each test with the code it covers, in a sibling `__tests__/` folder, mirroring the naming
conventions of [§7](README.md#naming--conventions):

```
src/
├── domain/entities/
│   ├── User.js
│   └── __tests__/User.test.js
├── application/use-cases/users/
│   ├── CreateUserUseCase.js
│   └── __tests__/CreateUserUseCase.test.js
├── infrastructure/repositories/
│   ├── UserRepository.js
│   └── __tests__/UserRepository.test.js
└── presentation/stores/
    ├── useOrderStore.js
    └── __tests__/useOrderStore.test.js
```

Co-location keeps a unit and its test physically together: the test moves when the file is moved, a missing
`__tests__/` folder makes a coverage gap visible in the tree, and a reader opening any file finds its
contract one directory away. The alternative, a separate `tests/` root that re-creates the `src/` tree,
keeps production code visually uncluttered and suits teams that run unit and end-to-end suites through
different tooling; the trade-off is that tests and code drift apart more easily. Either way, the *layout
mirrors the architecture*, so the test tree screams the same intent as the source tree [Martin 2017].

**Tools.** In a Vue 3 codebase the conventional stack is **Vitest** as the runner (fast, Vite-native),
**Vue Test Utils** for mounting components, the **Pinia testing** helpers for stores, and
**Playwright or Cypress** for the thin end-to-end tier [Vitest docs; Vue Test Utils docs; Pinia docs].

### 5.7 Justification

The strategy above is not a matter of taste; each rule traces to a source. Tests as an outer ring that
consumes the core through its boundaries is Martin's Test Boundary [Martin 2017]. The pyramid's shape,
many cheap tests low, few expensive tests high, is Cohn's and Vocke's [Cohn 2009; Vocke 2018]. The
distinction between stubs, mocks, and fakes, and the warning against over-mocking, is Meszaros's and
Fowler's [Meszaros 2007; Fowler 2007], reinforced by Khorikov's account of what makes a test valuable
rather than brittle [Khorikov 2020]. And the reason any of it is *cheap* on this architecture, that every
collaborator sits behind a substitutable port, is Cockburn's Ports & Adapters [Cockburn 2005]. The
architecture and its test strategy are the same idea read twice.

