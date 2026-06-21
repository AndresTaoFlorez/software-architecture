> **[Onion Architecture](README.md)** › Inward Dependencies. Full reference list: [References](references.md).

## 2. Core Principle: The Dependency Rule
<a id="2-core-principle-the-dependency-rule"></a>

### 2.1 The concentric model

The four layers are best visualized as concentric rings. The innermost ring is the most abstract and the
most stable; the outermost rings are the most concrete and the most volatile.

![Clean Architecture Diagram by Robert C. Martin (Uncle Bob)](https://blog.cleancoder.com/uncle-bob/images/2012-08-13-the-clean-architecture/CleanArchitecture.jpg)

*Image source: "The Clean Code Blog" by Robert C. Martin (Uncle Bob), August 13, 2012.*  
*This is the canonical Clean Architecture model diagram that inspired the frontend adaptation in this document.*  
*Original article: [The Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)*

**Dependencies flow inward:** Domain → Application → Infrastructure & Presentation. Nothing in an inner ring may know about an outer ring.

---

A clarification on placement: in the canonical model, **Infrastructure and Presentation are both *outer
details***. Infrastructure does not sit "above" the Application layer as a privileged middle tier, it is
an outer ring that *implements* what the inner rings declare. The Application layer is closer to the core
than any technical detail. This positioning is what makes the architecture an *onion* rather than a plain
top-down stack [Palermo 2008; Martin 2017].

### 2.2 The Dependency Rule

> Source-code dependencies must point only inward. Nothing in an inner layer may know anything about an
> outer layer [Martin 2012].

Concretely:

- The **Domain** layer depends on nothing.
- The **Application** layer depends only on the Domain.
- **Infrastructure** and **Presentation** depend on the inner layers, never the reverse.

The name of a class, function, or variable declared in an outer layer must never be mentioned by code in
an inner layer. This is the single rule from which most of the benefits in [Why This Architecture](README.md#why-this-architecture)
follow.

### 2.3 Dependency Inversion: the mechanism

The Dependency Rule raises an obvious tension. A use case must, eventually, fetch data over HTTP, yet
HTTP is an outer detail the use case is forbidden to depend on. The resolution is the **Dependency
Inversion Principle**: high-level modules should not depend on low-level modules; both should depend on
abstractions [Martin 2003 (SOLID); Martin 2017].

The Application layer declares an **interface (a "port")** describing the data operations it needs. The
Infrastructure layer provides a concrete implementation (an "adapter") of that port. At runtime the
adapter is injected into the use case. The arrow of *source-code dependency* now points inward, the
adapter depends on the port, not the other way around, even though the *flow of control* at runtime
moves outward into Infrastructure. This is precisely the ports-and-adapters arrangement of Hexagonal
Architecture [Cockburn 2005].

```
   Application defines the port        Infrastructure implements it
   ─────────────────────────────      ──────────────────────────────
   interface UserRepository  ◄───────  class HttpUserRepository
     fetchAll(): User[]                   (uses axios, maps JSON → User)

           ▲                                       │
           │ depends on (inward)                   │ implements
           └───────────────────────────────────────┘
```

### 2.4 Why this matters specifically on the frontend

Frontend stacks are unusually volatile. UI frameworks rise and fall, HTTP clients are replaced, state
libraries are swapped, and transport mechanisms migrate (REST to GraphQL, polling to WebSocket). Each of
these lives in an outer ring. When business rules are confined to the Domain and Application layers and
depend only on ports, a change of framework or transport becomes a change of *adapters*, not a rewrite
of the application's meaning. The most stable asset (what the product *does*) is insulated from the least
stable asset (the technology it currently *runs on*).

---

## 4. Dependency Direction in Practice
<a id="4-dependency-direction-in-practice"></a>

### 4.1 Allowed and forbidden imports

The Dependency Rule becomes a small set of mechanical checks on `import` statements:

```
✅ presentation/stores/useUserStore.js   imports  application/use-cases/...   (outer → inner)
✅ application/use-cases/CreateUser.js    imports  application/ports/UserRepository
✅ infrastructure/repositories/User.js    imports  domain/entities/User
✅ infrastructure/repositories/User.js    implements application/ports/UserRepository

❌ presentation/views/LoginView.vue       imports  infrastructure/http/client   (skips the core)
❌ domain/entities/User.js                imports  axios                        (core → detail)
❌ application/use-cases/CreateUser.js     imports  vue / pinia                  (core → framework)
```

A useful heuristic: **the deeper a file sits, the fewer things it is allowed to import.** A Domain file
should import almost nothing.

### 4.2 Adding a feature across the four layers

A repeatable checklist for any new capability, working from the inside out:

1. **Domain**, model the concept as an entity or value object; encode its rules and invariants.
2. **Application (port)**, declare the interface describing the data operation the feature needs.
3. **Application (use case)**, write the orchestration that uses entities and the port.
4. **Infrastructure (adapter)**, implement the port against the real transport; map responses to
   entities.
5. **Presentation (store)**, call the use case and expose reactive state.
6. **Presentation (view/component)**, bind the store's state and actions to the interface.

Following this order guarantees that, at every step, code only ever reaches inward. The same inside-out
order is the cheapest way to test a feature, see [§5.3](3-testing-in-onion.md#53-the-test-pyramid-mapped-onto-the-onion).

### 4.3 The inversion gap

In the present codebase, the Application layer imports concrete Infrastructure classes directly, for
example, `CreateUserUseCase.js` begins with
`import { UserRepository } from '@/infrastructure/repositories/UserRepository'`. This produces a working
*linear* layering (`Presentation → Application → Infrastructure → Domain`), but it lets a use case depend
on a detail, which the canonical model forbids [Martin 2017].

The prescribed evolution is to invert that single dependency. The Application layer should declare a port,
and the use case should receive an implementation rather than importing one:

```js
// BEFORE: use case depends on a concrete adapter (a detail)
import { UserRepository } from '@/infrastructure/repositories/UserRepository'

export async function createUserUseCase(form) {
  const payload = toPayload(form)
  return UserRepository.create(payload)        // hard-wired to Infrastructure
}
```

```js
// AFTER: use case depends on an injected port (an abstraction)
export function makeCreateUserUseCase({ userRepository }) {
  return async function createUserUseCase(form) {
    const payload = toPayload(form)
    return userRepository.create(payload)      // any adapter satisfying the port
  }
}

// composition root (e.g. a small factory wired once at startup)
import { HttpUserRepository } from '@/infrastructure/repositories/UserRepository'
export const createUserUseCase = makeCreateUserUseCase({ userRepository: HttpUserRepository })
```

The cost is one factory and a place to wire dependencies (a *composition root*). The gain is that the
Application layer no longer names any detail: it can be tested with a fake repository, and the HTTP adapter
can be swapped for a GraphQL or in-memory one without editing a use case. This is the difference between a
layered stack and a true onion [Palermo 2008; Cockburn 2005]. The gain is not abstract, it is the
difference between injecting a fake in one line and intercepting a module path, shown side by side in
[§5.4](3-testing-in-onion.md#54-per-layer-testing).
