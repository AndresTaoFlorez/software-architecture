> **[Clean Architecture](README.md)** › Composition & Dependency Injection. Full reference list: [References](references.md).

## 4. Composition & Dependency Injection

The Dependency Rule forbids a use case from naming a concrete adapter. But *something*, somewhere, must
connect the two — the real `HttpUserGateway` has to reach the `createUser` use case eventually. Clean
Architecture answers this with a single, deliberate exception: the **Composition Root**.

### 4.1 The inversion, concretely

A use case must never import the detail it uses. Compare:

```js
// BEFORE: the use case depends on a concrete adapter (a detail) — forbidden
import { UserRepository } from '@/adapters/gateways/UserRepository'

export async function createUser(form) {
  return UserRepository.create(toPayload(form))   // hard-wired to an outer circle
}
```

```js
// AFTER: the use case depends on an injected port (an abstraction)
export function makeCreateUser({ userRepository }) {
  return async function createUser(form) {
    return userRepository.create(toPayload(form))  // any adapter satisfying the port
  }
}
```

The "after" form names no detail. It can be tested with a fake repository, and its real adapter can be
swapped — HTTP for GraphQL, or for an in-memory double — without editing the use case. The cost is a single
factory plus a place to wire dependencies. That place is the Composition Root.

### 4.2 The Composition Root

The Composition Root is the **one place in the system allowed to name both a concrete adapter and the use
case it feeds** [Martin 2017]. It sits at the outermost edge — the application's entry point — and assembles
the object graph once, at startup:

```js
// composition/bootstrap.js — the only place an outer circle meets a use case
import { HttpUserGateway } from '@/adapters/gateways/HttpUserGateway'
import { makeCreateUser } from '@/usecases/CreateUser'

const userRepository = new HttpUserGateway()
export const createUser = makeCreateUser({ userRepository })
```

Everything inward of `bootstrap.js` depends only on ports; everything is testable with fakes. This is
simple, explicit, and entirely sufficient for most applications — wire the graph once, at the edge, and
hand the assembled use cases to the UI.

### 4.3 When the wiring grows: a DI container

The circles and the rule never change as a codebase scales — only *how the wiring is expressed* changes.
When a hand-assembled root passes roughly a hundred dependencies and manual ordering becomes error-prone,
the wiring becomes **declarative**: a container resolves the graph instead of you assembling it in order.

```js
// composition/container.js
const container = new Container()
container.register('UserRepository', () => new HttpUserGateway())
container.register('createUser', (c) =>
  makeCreateUser({ userRepository: c.resolve('UserRepository') }))

// anywhere in the outer circles:
const createUser = container.resolve('createUser')
```

Mature ecosystems formalize this with libraries (InversifyJS, tsyringe), but the principle is identical to
the hand-written version — it is **still the Composition Root, just automated**. The win is that a hundred
bindings no longer need a human to topologically sort them, and swapping an adapter for a test double
becomes a one-line container override.

**Introduce a container only when you feel the pain:** multiple teams colliding in one tree, or a wiring
file that has become a bottleneck. A DI container in a three-person project buys complexity it cannot yet
repay — the manual root is the right default.

### 4.4 Why this is Clean Architecture's signature

Dependency injection is not a framework feature here; it is the *mechanism that makes the Dependency Rule
physically true*. Without a Composition Root, every use case that needs data would have to import an
adapter, and the inward-only arrow would be a lie. With one, the entire inner system — Entities and Use
Cases — depends on nothing but abstractions, and the messy business of choosing concrete implementations is
confined to a single file at the edge. That confinement is what makes the core independent, testable, and
durable [Martin 2017].

> **The four circles never change. What changes is how dependencies are *wired* — and that changes in
> response to codebase size and headcount, not taste.**

For how partitioning (by layer, then by feature, then by bounded context) evolves alongside the wiring as
an organization grows, see the Onion guide's companion treatment of
[scaling](../onion-architecture/6-scaling.md) — the analysis is identical under either name.

---

Back to the **[Clean Architecture index](README.md)** · See the full **[References](references.md)**.
