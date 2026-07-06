> **[Clean Architecture](README.md)** › The Four Layers. Full reference list: [References](references.md).

## 2. The Four Layers

Each of the four circles is described below with the same template:
**Responsibility · What lives here · What it must not do · Dependency direction · Generic example ·
Justification.**

The two inner circles — **Entities** and **Use Cases** — hold everything worth protecting, so they get the
most space. The two outer circles — **Interface Adapters** and **Frameworks & Drivers** — are deliberately
thin: they carry no business rules, only translation and transport. But all four are defined to the same
standard here so the boundaries between them are unambiguous.

The examples are framework-agnostic; where a concrete stack helps, they lean on a Vue 3 frontend. The same
four definitions on the server are in [Clean Architecture on the Backend](8-clean-on-the-backend.md).

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

**Dependency direction.** Depends on nothing.

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

**Dependency direction.** Depends inward on Entities (and on the ports it declares).

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
real adapter lives in the [Composition Root](6-composition-and-di.md).

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

### 2.3 Interface Adapters

**Responsibility.** Convert data between the form the use cases like and the form the outside world speaks.
This is the layer that provides the concrete **adapters** for the **ports** the inner circles declare, and
that translates external shapes into entities on the way in and into display or wire formats on the way out.

**What lives here.**
- **Gateways / repositories**: adapters that fetch raw data and **map it into entities**, never returning
  raw JSON.
- **Controllers**: take an input event (a UI gesture, an HTTP request) and call the right use case.
- **Presenters**: shape a use case's output into the form a view or a response body wants.
- **Mappers**: pure functions that translate between an external shape and an entity.

**What it must not do.** Contain business rules, or make a decision that belongs to a use case. An adapter
*translates and transports; it does not decide.* It may depend on Entities (to construct them) but must not
depend on Frameworks & Drivers' concrete APIs beyond the client it wraps.

**Dependency direction.** Depends inward on Use Cases and Entities, and implements the ports they declare.

**Generic example.** A repository adapter that hides the transport and returns entities, never raw JSON:

```js
// adapters/gateways/HttpUserRepository.js
import client from '@/frameworks/http/client'
import { User } from '@/entities/User'

/** @implements {import('@/usecases/ports/UserRepository').UserRepository} */
export const HttpUserRepository = {
  async fetchAll() {
    const { data } = await client.get('/users')
    return data.map((raw) => new User(raw))   // map at the boundary — callers see entities, not JSON
  },
  async create(payload) {
    const { data } = await client.post('/users', payload)
    return new User(data)
  },
}
```

The adapter satisfies the `UserRepository` **port** declared by the use case in [§2.2](#22-use-cases). A
**presenter** is the mirror image on the way out — it turns a use-case result into a view-ready shape:

```js
// adapters/presenters/userListPresenter.js
export function userListPresenter(users) {
  return users.map((u) => ({ id: u.id, label: u.fullName, status: u.statusLabel }))
}
```

Neither the mapping nor the presentation makes a business decision; both only translate. That is what keeps
this circle thin.

**Justification.** The **Repository** mediates between the domain and the data source, "acting like an
in-memory collection of domain objects" [Fowler 2002]. Isolating transport behind a port implemented by an
adapter is the essence of Ports & Adapters [Cockburn 2005]. Mapping external shapes into entities *at the
boundary* keeps everything inward of this line speaking the domain's language, not the API's.

---

### 2.4 Frameworks & Drivers (outermost)

**Responsibility.** Be the volatile technical details — and nothing more. This circle holds the tools the
application happens to run on today, kept at arm's length so any of them can be swapped without touching the
core.

**What lives here.**
- **The UI framework / web framework**: Vue, React, Svelte on the client; Express, NestJS, Fastify on the
  server.
- **The transport**: the configured HTTP client, a WebSocket/SSE connection, a message-queue client.
- **Persistence drivers**: browser storage on the client; a database driver or ORM on the server.
- **Third-party SDKs**: analytics, payments, auth providers.

**What it must not do.** Be depended on by any inner circle. Nothing in Entities, Use Cases, or the ports
may name anything in here. "The web is a detail. The database is a detail. Keep these things at arm's
length" [Martin 2017].

**Dependency direction.** Depends inward (it is used *by* adapters and configured *at* the Composition
Root); nothing inner depends on it.

**Generic example.** A configured HTTP client — a driver the adapters wrap, unaware of any entity or use
case:

```js
// frameworks/http/client.js
import axios from 'axios'

const client = axios.create({ baseURL: import.meta.env.VITE_API_URL })
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default client
```

Cross-cutting transport concerns (auth headers, token refresh, retries) live here, in one place, so that no
use case and no component ever handles them.

**Justification.** Frameworks belong in the outermost circle as a "detail" [Martin 2017]. Because both outer
circles depend inward and the outermost is reached only through adapters, either can be replaced — a new UI
framework, a migration from REST to GraphQL, Axios to Fetch, one database to another — by rewriting the edge,
while Entities and Use Cases survive untouched. That substitutability is the entire payoff of the style.

On a frontend this circle also holds the Presentation UI — views, components, stores, styles — which is
where most of the file count lives. Clean Architecture treats all of it as detail; how to organize that
detail (components grouped by feature, where styles and animations belong) is covered in
[§3.4](3-project-structure.md#34-structuring-the-outermost-circle-the-presentation-ui) and
[§3.5](3-project-structure.md#35-styles--animation-keep-them-out-of-the-markup).

---

Next: **[Project Structure & Conventions](3-project-structure.md)** — how these four layers map onto folders,
naming, and import rules you can enforce in CI.
