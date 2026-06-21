> **[Clean Architecture](README.md)** › Entities & Use Cases. Full reference list: [References](references.md).

## 2. Entities & Use Cases

The two inner circles hold everything worth protecting. The outer two — Interface Adapters and
Frameworks & Drivers — exist only to serve them. This page covers the inner two in depth and the outer
two briefly, because in Clean Architecture the inner circles are where the design effort belongs.

The examples are drawn from a production Vue 3 application, but the layering itself is framework-agnostic.

---

### 2.1 Entities (innermost)

**Responsibility.** Express the *enterprise-wide* business rules — the concepts and invariants that would
be true across the whole company, with or without this particular application. This is the circle that
would remain meaningful if every technical choice around it were replaced.

**What lives here.**
- **Entities**: objects with identity and behavior (a `User`, an `Order`).
- **Value objects**: objects defined solely by their attributes (a `Money`, a `DateRange`).
- **Domain errors**: named violations of business rules.
- **Invariants**: rules that must always hold, enforced inside the object.

**What it must not do.** Import a framework, perform I/O, reference HTTP, touch storage, or know that a UI
exists. It must not import from any outer circle.

**Generic example.** A plain entity that owns its derived state and its rules:

```js
// entities/Order.js
export class Order {
  constructor({ id, lines, status }) {
    this.id = id
    this.lines = lines
    this.status = status
  }

  get total() {
    return this.lines.reduce((sum, l) => sum + l.price * l.qty, 0)
  }

  canBeCancelled() {
    return this.status === 'pending'
  }
}
```

**A richer entity.** Not every entity is a flat bag of getters. Enterprise-critical rules — for example,
when a scheduling window may still be edited — are best expressed as derived state on the entity, with no
framework and no I/O:

```js
// entities/WorkWindow.js (excerpt: business rules as getters)
// Two-tier "seal": the start freezes once it passes; the whole window freezes once it ends.
get isSealed() {                         // starts_at <= now → start is frozen
  if (!this.startsAt) return false
  return WorkWindow.timelineNow() >= new Date(this.startsAt).getTime()
}
get canEditStart() { return this.isFuture }   // can move the start? only before it begins
get canEditEnd()   { return !this.isEnded }    // can extend the end? until the window ends
```

Those `canEdit*` getters *are* the business rules. A controller that disables a drag handle, a use case
that rejects an illegal reschedule, and a test that asserts the rule all read the same single source of
truth — the entity — instead of re-deriving it. That is the payoff of a rich domain model [Evans 2003].

**Domain errors** give business-rule violations explicit, catchable types rather than anonymous strings:

```js
// entities/errors/DomainErrors.js
export class DomainError extends Error {
  constructor(message) { super(message); this.name = 'DomainError' }
}
export class UserInactiveError extends DomainError {
  constructor(message = 'Your account is inactive. Contact support.') {
    super(message); this.name = 'UserInactiveError'
  }
}
```

Because these are real types, an outer circle can `catch (e) { if (e instanceof UserInactiveError) … }`
and react precisely.

**Justification.** Entities are "the least likely to change when something external changes" and should
contain "enterprise-wide critical business rules" [Martin 2017]. Placing a rich domain model at the center
is the core recommendation of Domain-Driven Design [Evans 2003]. Keeping this circle free of I/O is what
lets it be unit-tested with no mocks and reused unchanged across transports.

---

### 2.2 Use Cases

**Responsibility.** Hold the *application-specific* business rules. A use case orchestrates the steps of a
single operation — log in, create user, place order — by coordinating entities and the ports it needs. It
contains no UI logic and no knowledge of how data physically travels.

**What lives here.**
- **Use cases (interactors)**: one operation per unit.
- **Ports (boundaries)**: interfaces describing the capabilities a use case requires — e.g. a repository
  contract or a gateway.
- **Application-level mapping**: translating input shapes into the form entities and ports expect.

**What it must not do.** Render anything, read framework-reactive state, call an HTTP client directly, or
depend on a concrete adapter. It depends on Entities and on the *ports* it declares.

**Port-based form.** The use case receives its dependency through a port, so it never names a concrete
adapter. A port is a *contract*, not an implementation — an `interface` in TypeScript, a JSDoc `@typedef`
in plain JavaScript:

```js
// usecases/ports/UserRepository.js
/**
 * A PORT: the contract the use case needs. An outer-circle adapter must satisfy it.
 * @typedef {Object} UserRepository
 * @property {() => Promise<import('@/entities/User').User[]>} fetchAll
 * @property {(payload: object) => Promise<import('@/entities/User').User>} create
 */

// usecases/CreateUser.js
/** @param {{ userRepository: UserRepository }} deps */
export function makeCreateUser({ userRepository }) {
  return async function createUser(form) {
    const payload = toCreatePayload(form)   // map input → entity-friendly shape
    return userRepository.create(payload)   // delegate to the injected port
  }
}
```

The use case is testable with a fake `userRepository` and is unaware of HTTP entirely. This injection of
the port — rather than importing a concrete repository — is the Dependency Inversion Principle in action,
and it is what separates a true Clean boundary from a plain layered stack. The wiring that supplies the
real adapter lives in the [Composition Root](4-composition-and-di.md).

**Orchestration is more than delegation.** A use case is also where application-level validation lives and
where infrastructure failures are translated back into the domain's language before they can leak outward:

```js
// usecases/CreateWorkWindow.js (excerpt)
// 1. Validate application-level rules, failing with a DOMAIN error, not a generic one:
if (!item.startTime) throw new WorkWindowError('Start time is required.')
if (date < today)    throw new WorkWindowError('Cannot create windows in the past.')

// 2. Delegate persistence, mapping any transport failure back into the domain at the edge:
try {
  return await userRepository.create(normalized)
} catch (e) {
  throw WorkWindowError.fromTransport(e, 'Failed to create the work window.')
}
```

The outer circles never see a raw transport error or an HTTP status — only a `WorkWindowError` they can
show to the user.

**Justification.** Use cases hold "application-specific business rules" and orchestrate the flow of data to
and from entities [Martin 2017]. The pattern of a thin coordinating layer above the domain is Fowler's
*Service Layer* [Fowler 2002]. Depending on a port rather than a concrete class is the direct application
of the Dependency Inversion Principle [Martin 2003].

---

### 2.3 The outer two circles, briefly

The outer circles are deliberately thin — they carry no business rules, only translation and transport.

- **Interface Adapters** convert data between the form use cases like and the form the outside world
  speaks. On a frontend these are **gateways** (repository adapters that fetch raw data and map it into
  entities, never returning raw JSON), **controllers** (that take UI events and call a use case), and
  **presenters** (that shape use-case output for display). An adapter translates and transports; it does
  not decide.
- **Frameworks & Drivers** are the web framework, the UI library, the HTTP client, browser storage, and
  third-party SDKs. This is the circle most expected to change, so it is kept at the very edge behind the
  adapters. "The web is a detail. The database is a detail. Keep these things at arm's length" [Martin 2017].

Because both outer circles depend inward and implement ports the inner circles declare, either can be
replaced — a new UI framework, a migration from REST to GraphQL — by rewriting adapters, while Entities
and Use Cases survive untouched.

---

Next: **[Testing in Clean Architecture](3-testing-in-clean.md)** — why the Dependency Rule makes the inner
circles trivially testable.
