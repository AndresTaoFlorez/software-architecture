# Onion Architecture for the Frontend — A Four-Layer Guide

> A reusable blueprint for structuring frontend applications around stable business rules.
> Written to be applied to any new project, and to be defensible: every prescriptive claim is
> tied to a verifiable source listed in [§9 References](#9-references).

---

## Table of Contents

1. [Introduction & Purpose](#1-introduction--purpose)
2. [Core Principle: The Dependency Rule](#2-core-principle-the-dependency-rule)
3. [The Four Layers](#3-the-four-layers)
4. [Dependency Direction in Practice](#4-dependency-direction-in-practice)
5. [Testing the Layers](#5-testing-the-layers)
6. [Why This Architecture](#6-why-this-architecture)
7. [Naming & Conventions](#7-naming--conventions-portable-defaults)
8. [Appendix — Advanced Patterns](#8-appendix--advanced-patterns-bonus)
9. [Scaling: From Startup to Enterprise](#9-scaling-from-startup-to-enterprise)
10. [References](#10-references)

---

## 1. Introduction & Purpose

This document describes a frontend architecture organized into **four concentric layers** —
**Domain**, **Application**, **Infrastructure**, and **Presentation**. Its purpose is to be a single
authoritative reference: a blueprint that can be reproduced across projects regardless of the specific
framework in use, and a rationale that explains *why* each rule exists.

The central goal is one idea: **protect business rules from volatile details.** User interfaces, HTTP
clients, state-management libraries, and storage mechanisms change frequently; the meaning of the
business does not. An architecture earns its keep when the parts that change often cannot force changes
on the parts that should stay stable.

The model presented here is not new. It synthesizes four well-established bodies of work and adapts them
to the frontend:

- **Onion Architecture** — concentric layers with dependencies pointing inward [Palermo 2008].
- **Clean Architecture** — the Dependency Rule and the separation of entities, use cases, and details
  [Martin 2012; Martin 2017].
- **Hexagonal Architecture (Ports & Adapters)** — isolating the core behind explicit interfaces
  [Cockburn 2005].
- **Domain-Driven Design** — entities and a domain model as the heart of the system [Evans 2003].

What follows treats the frontend as a first-class application with its own domain, not merely a "view" of
a backend. The same layering that protects server-side business rules protects client-side ones.

---

## 2. Core Principle: The Dependency Rule

### 2.1 The concentric model

The four layers are best visualized as concentric rings. The innermost ring is the most abstract and the
most stable; the outermost rings are the most concrete and the most volatile.

![Clean Architecture Diagram by Robert C. Martin (Uncle Bob)](https://blog.cleancoder.com/uncle-bob/images/2012-08-13-the-clean-architecture/CleanArchitecture.jpg)

*Image source: "The Clean Code Blog" by Robert C. Martin (Uncle Bob), August 13, 2012.*  
*This is the canonical Clean Architecture model diagram that inspired the frontend adaptation in this document.*  
*Original article: [The Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)*

**Dependencies flow inward:** Domain → Application → Infrastructure & Presentation. Nothing in an inner layer may know about an outer layer.

---

A clarification on placement: in the canonical model, **Infrastructure and Presentation are both *outer
details***. Infrastructure does not sit "above" the Application layer as a privileged middle tier — it is
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
an inner layer. This is the single rule from which most of the benefits in [§6](#6-why-this-architecture)
follow.

### 2.3 Dependency Inversion: the mechanism

The Dependency Rule raises an obvious tension. A use case must, eventually, fetch data over HTTP — yet
HTTP is an outer detail the use case is forbidden to depend on. The resolution is the **Dependency
Inversion Principle**: high-level modules should not depend on low-level modules; both should depend on
abstractions [Martin 2003 (SOLID); Martin 2017].

The Application layer declares an **interface (a "port")** describing the data operations it needs. The
Infrastructure layer provides a concrete implementation (an "adapter") of that port. At runtime the
adapter is injected into the use case. The arrow of *source-code dependency* now points inward — the
adapter depends on the port, not the other way around — even though the *flow of control* at runtime
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
depend only on ports, a change of framework or transport becomes a change of *adapters* — not a rewrite
of the application's meaning. The most stable asset (what the product *does*) is insulated from the least
stable asset (the technology it currently *runs on*).

---

## 3. The Four Layers

Each layer below is described with the same template:
**Responsibility · What lives here · What it must not do · Dependency direction · Generic example ·
Real example · Justification.**

The real examples are drawn from a production Vue 3 application that follows this structure. They are
illustrative; the layering itself is framework-agnostic.

---

### 3.1 Domain (innermost)

**Responsibility.** Express the business concepts and rules of the application in their purest form,
independent of any framework, transport, or storage. This is the layer that would remain meaningful if
every technical choice around it were replaced.

**What lives here.**
- **Entities** — objects with identity and behavior (a `User`, an `Order`, an `Application`).
- **Value objects** — objects defined solely by their attributes (a `Money`, a `DateRange`).
- **Domain errors** — named violations of business rules.
- **Invariants** — rules that must always hold, enforced inside the entity.

**What it must not do.** Import a framework, perform I/O, reference HTTP, touch `localStorage`, or know
that a UI exists. It must not import from any other layer.

**Dependency direction.** Depends on nothing.

**Generic example.** A plain entity that owns its derived state and its rules:

```js
// domain/entities/Order.js
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

**Real example.** `src/domain/entities/User.js` is a plain class with no framework imports. It exposes
derived state through getters and keeps normalization logic in one place:

```js
// src/domain/entities/User.js (excerpt)
export class User {
  constructor({ id, first_name, first_surname, is_active = true, /* … */ }) {
    this.id = id
    this.firstName = first_name
    this.firstSurname = first_surname
    this.isActive = is_active
    // … normalizes nested vs. legacy API shapes into a single flat structure …
  }

  get fullName() {
    const names = [this.firstName, this.secondName, this.firstSurname, this.secondSurname]
    return names.filter(Boolean).join(' ')
  }

  get statusLabel() {
    return this.isActive ? 'ACTIVO' : 'INACTIVO'
  }
}
```

**Spotlight: a richer entity.** Not every entity is a flat bag of getters. `src/domain/entities/WorkWindow.js`
shows what *enterprise-critical business knowledge* [Martin 2017] looks like when it lives at the center —
its rules about when a scheduling window may still be edited are expressed entirely as derived state, with no
framework and no I/O:

```js
// src/domain/entities/WorkWindow.js (excerpt — business rules as getters)
// Two-tier "seal": the start freezes once it passes; the whole window freezes once it ends.
// "Timeline" is the SERVER clock, synced via GET /work-windows/timeline — never the browser's.
get isSealed() {                         // starts_at <= timeline → start is frozen
  if (!this.startsAt) return false
  return WorkWindow.timelineNow() >= new Date(this.startsAt).getTime()
}
get isEnded() {                          // ends_at < timeline → fully immutable
  if (!this.endsAt) return false
  return WorkWindow.timelineNow() > new Date(this.endsAt).getTime()
}
get canEditStart() { return this.isFuture }   // can move the start? only before it begins
get canEditEnd()   { return !this.isEnded }    // can extend the end? until the window ends
get canToggle()    { return !this.isEnded }    // can activate/deactivate? until it ends
```

Those `canEdit*` getters *are* the business rules. A component that disables a drag handle, a use case that
rejects an illegal reschedule, and a test that asserts the rule all read the same single source of truth —
the entity — instead of re-deriving it. That is the payoff of a rich domain model [Evans 2003].

A note on **value objects**: §"What lives here" lists them, but this codebase models that behavior directly
on entities (getters and small static helpers such as `WorkWindow.toTimestampTz`) rather than introducing
standalone `Money`/`DateRange` classes. That is a legitimate choice — the point is that the *behavior* lives
in the Domain, whatever shape holds it.

**Domain errors** live alongside entities in `src/domain/errors/DomainErrors.js`, giving business-rule
violations explicit, catchable types rather than anonymous strings:

```js
// src/domain/errors/DomainErrors.js
export class DomainError extends Error {
  constructor(message) {
    super(message)
    this.name = 'DomainError'
  }
}

export class UserInactiveError extends DomainError {
  constructor(message = 'Tu cuenta está inactiva. Contacta al soporte.') {
    super(message)
    this.name = 'UserInactiveError'
  }
}
```

Because these are real types, an outer layer can `catch (e) { if (e instanceof UserInactiveError) … }` and
react precisely — exactly what the Presentation store does in [§3.4](#34-presentation-outermost). The richer
`WorkWindowError` (which maps backend failures back to domain language) is shown at the boundary in
[§3.3](#33-infrastructure).

**Justification.** Entities are "the least likely to change when something external changes" and should
contain "enterprise-wide critical business rules" [Martin 2017]. A rich domain model placed at the center
of the system is the core recommendation of Domain-Driven Design [Evans 2003]. Keeping this layer free of
I/O is what allows it to be unit-tested with no mocks and reused unchanged across transports — the
mechanism is detailed in [§5.4](#54-per-layer-testing).

---

### 3.2 Application

**Responsibility.** Orchestrate the steps of a single business operation — a *use case*. The Application
layer coordinates entities and the ports it needs, but contains no UI logic and no knowledge of how data
physically travels.

**What lives here.**
- **Use cases** — one operation per unit (log in, create user, fetch orders).
- **Ports** — interfaces describing the capabilities the use cases require (e.g. a repository contract).
- **Application-level mapping** — translating input shapes into the form entities and ports expect.

**What it must not do.** Render anything, read framework-reactive state, call an HTTP client directly, or
depend on a concrete Infrastructure class. It depends on the Domain and on *ports*, not on adapters.

**Dependency direction.** Depends inward on the Domain (and on ports it declares).

**Generic example — prescribed, port-based form.** The use case receives its dependency through a port,
so it never names a concrete adapter:

A port is a *contract*, not an implementation. In TypeScript it is an `interface`; in plain JavaScript the
honest equivalent is a JSDoc `@typedef` — a description the use case is typed against, with no runtime stub
pretending to be the real thing:

```js
// application/ports/UserRepository.js
/**
 * A PORT: the contract the application needs. Infrastructure must satisfy it.
 * @typedef {Object} UserRepository
 * @property {() => Promise<import('@/domain/entities/User').User[]>} fetchAll
 * @property {(payload: object) => Promise<import('@/domain/entities/User').User>} create
 */

// application/use-cases/CreateUserUseCase.js
/** @param {{ userRepository: UserRepository }} deps */
export function makeCreateUserUseCase({ userRepository }) {
  return async function createUser(form) {
    const payload = toCreatePayload(form)   // map input → entity-friendly shape
    return userRepository.create(payload)   // delegate to the injected port
  }
}
```

The use case is now testable with a fake `userRepository` and is unaware of HTTP entirely.

**Real example.** `src/application/use-cases/users/CreateUserUseCase.js` performs exactly the orchestration
role — it maps a form into the API payload and delegates persistence to a repository:

```js
// src/application/use-cases/users/CreateUserUseCase.js
import { UserRepository } from '@/infrastructure/repositories/UserRepository'
import { buildSpecialistProfile } from './buildSpecialistProfile'

export async function createUserUseCase({ firstName, firstSurname, email, password, roleNames, /* … */ }) {
  const payload = {
    first_name: firstName,
    first_surname: firstSurname,
    email,
    password,
    role_names: Array.isArray(roleNames) ? roleNames : [],
  }

  const specialistProfile = buildSpecialistProfile(applicationLevels, categoryAssignments)
  if (specialistProfile) payload.specialist_profile = specialistProfile

  return UserRepository.create(payload)
}
```

Note the first line: the use case currently imports a *concrete* repository. That is the one deviation
from the canonical model, addressed deliberately in [§4.3](#43-the-inversion-gap) — and, as
[§5.4](#54-per-layer-testing) shows, it has a measurable cost the moment you try to test this file.

**Orchestration is more than delegation.** `CreateUserUseCase` is deliberately thin, but a use case is also
where *application-level* validation lives and where infrastructure failures are translated back into the
domain's language before they can leak outward. `src/application/use-cases/work-windows/CreateWorkWindowUseCase.js`
makes both moves explicit:

```js
// src/application/use-cases/work-windows/CreateWorkWindowUseCase.js (excerpt)
import { WorkWindowRepository } from '@/infrastructure/repositories/WorkWindowRepository'
import { WorkWindowError } from '@/domain/errors/WorkWindowError'

// 1. Validate application-level rules — fail with a DOMAIN error, not a generic one:
if (!item.startTime) throw new WorkWindowError(`Hora de inicio requerida${label}.`)
if (date < today)    throw new WorkWindowError(`No se pueden crear ventanas en fechas pasadas${label}.`)

// 2. Delegate persistence, mapping any transport failure back into the domain at the edge:
try {
  return await WorkWindowRepository.create(normalized)
} catch (e) {
  throw WorkWindowError.fromHttp(e, 'Error al crear la ventana de trabajo.')
}
```

Presentation never sees a raw Axios error or an HTTP status — only a `WorkWindowError` it can show to the
user. The mapping function itself lives at the Infrastructure boundary, shown in [§3.3](#33-infrastructure).

**Justification.** Use cases hold "application-specific business rules" and orchestrate the flow of data
to and from entities [Martin 2017]. The pattern of a thin coordinating layer above the domain is Fowler's
*Service Layer* [Fowler 2002]. Depending on a port rather than a concrete class is the direct application
of the Dependency Inversion Principle [Martin 2003].

---

### 3.3 Infrastructure

**Responsibility.** Provide concrete implementations — *adapters* — for the ports the inner layers
declare. This is where the application meets the outside world: HTTP, WebSocket, browser storage, and
third-party SDKs. It is the layer most expected to change.

**What lives here.**
- **HTTP client** — a configured transport with interceptors and cross-cutting concerns.
- **Repositories** — adapters that fetch raw data and **map it into Domain entities**.
- **Realtime / messaging clients** — WebSocket or SSE adapters.
- **Storage** — caches and persistence over `localStorage`, IndexedDB, etc.

**What it must not do.** Contain business rules. An adapter translates and transports; it does not decide.
It may depend on the Domain (to construct entities) but must not depend on Presentation.

**Dependency direction.** Depends inward (on the Domain, and on the ports it implements).

**Generic example.** A repository adapter that hides the transport and returns entities, never raw JSON:

```js
// infrastructure/repositories/HttpOrderRepository.js
import client from '@/infrastructure/http/client'
import { Order } from '@/domain/entities/Order'

export const HttpOrderRepository = {
  async fetchAll() {
    const { data } = await client.get('/orders')
    return data.map((raw) => new Order(raw))   // map at the boundary
  },
}
```

**Real example.** `src/infrastructure/repositories/UserRepository.js` is a textbook repository adapter:
every method calls the HTTP client and returns hydrated `User` entities, so no caller ever sees raw API
JSON:

```js
// src/infrastructure/repositories/UserRepository.js (excerpt)
import client from '@/infrastructure/http/client'
import { User } from '@/domain/entities/User'

export const UserRepository = {
  async fetchAll() {
    const { data } = await client.get('/users')
    const items = Array.isArray(data) ? data : data.data ?? data.items ?? []
    return items.map((item) => new User(item))
  },

  async create(userData) {
    const { data } = await client.post('/users', userData)
    return new User(data)
  },
}
```

The cross-cutting concerns of transport live in one adapter, `src/infrastructure/http/client.js`: a single
Axios instance with a request interceptor that attaches the bearer token and a response interceptor that
transparently refreshes an expired token and retries the original request:

```js
// src/infrastructure/http/client.js (excerpt)
client.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true
      if (await tryRefreshToken()) {
        error.config.headers.Authorization = `Bearer ${localStorage.getItem(TOKEN_KEY)}`
        return client(error.config)   // retry transparently
      }
    }
    return Promise.reject(ApiError.fromResponse(error.response?.status, error.response?.data))
  },
)
```

Because this concern is isolated in Infrastructure, no use case and no component ever handles token
refresh; they are unaware it happens.

The same boundary is the right place to translate *errors* back into the domain's vocabulary. The
`WorkWindowError.fromHttp(error)` helper used by the use case in [§3.2](#32-application) lives here, in
Infrastructure terms: it inspects the raw HTTP failure and returns a domain `WorkWindowError` with a
human-readable message, so that everything inward of this line speaks the domain's language, never the API's.

**Justification.** The **Repository** mediates between the domain and data-mapping layers, "acting like an
in-memory collection of domain objects" [Fowler 2002]. Treating HTTP, storage, and SDKs as replaceable
adapters behind a port is the essence of Hexagonal Architecture [Cockburn 2005]. Mapping external shapes
into entities *at the boundary* keeps the rest of the system speaking the domain's language rather than the
API's.

---

### 3.4 Presentation (outermost)

**Responsibility.** Render the interface, capture user intent, and hold UI state. The Presentation layer
turns user actions into use-case calls and turns the resulting domain data into pixels.

**What lives here.**
- **Views / pages** — route-level components.
- **Components** — reusable UI building blocks.
- **Stores** — reactive UI state that calls use cases and exposes results to components.
- **Router** — navigation and route guards.
- **Styles** — design tokens and component styles.

**What it must not do.** Call the HTTP client directly, embed business rules, or construct entities from
raw API data. It speaks to inner layers only through use cases.

**Dependency direction.** Depends inward on the Application layer (and, through it, on the Domain).

**Generic example.** A store that delegates to a use case and exposes reactive state — it knows nothing of
HTTP:

```js
// presentation/stores/useOrderStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchOrdersUseCase } from '@/application/use-cases/orders/FetchOrdersUseCase'

export const useOrderStore = defineStore('orders', () => {
  const orders = ref([])
  async function load() {
    orders.value = await fetchOrdersUseCase()   // delegate inward
  }
  return { orders, load }
})
```

**Real example.** `src/presentation/stores/useAuthStore.js` is a Pinia store that exposes reactive auth state
and *only* ever calls use cases. It never imports the HTTP client, never constructs a `User` from raw JSON,
and catches the domain error raised inward to react precisely:

```js
// src/presentation/stores/useAuthStore.js (excerpt)
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { loginUseCase } from '@/application/use-cases/auth/LoginUseCase'
import { fetchMeUseCase } from '@/application/use-cases/users/FetchMeUseCase'
import { UserInactiveError } from '@/domain/errors/DomainErrors'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const profile = ref(null)

  // Derived UI state — memoized by Vue, recomputed only when dependencies change:
  const isAuthenticated = computed(() => !!user.value && !!localStorage.getItem(TOKEN_KEY))
  const isAdmin = computed(() =>
    (profile.value?.roleNames || []).map(r => r.toLowerCase()).includes('admin'))

  async function login(email, password) {
    user.value = await loginUseCase(email, password)   // delegate inward — no HTTP here
    await fetchProfile()
  }

  async function fetchProfile() {
    const me = await fetchMeUseCase()
    if (!me.isActive) { logout(); throw new UserInactiveError() }   // catch the domain rule
    profile.value = me
  }

  return { user, profile, isAuthenticated, isAdmin, login, fetchProfile, logout }
})
```

A view such as `LoginView.vue` calls `authStore.login(...)` and renders `isAuthenticated` / `isAdmin`; it
has no idea a network exists. The canonical flow is a straight line inward:

```
View  →  Store  →  UseCase  →  Repository  →  HTTP Client  →  API
```

Route guards in `src/router/` enforce authentication and authorization at the Presentation boundary,
reading derived state (such as `isAuthenticated`) rather than implementing auth logic themselves.

**An honest boundary note.** The real store also imports two Infrastructure symbols directly — `TOKEN_KEY`
(to read the token from `localStorage`) and `wsClient` (to open/close the realtime connection on login and
logout). That is a small, deliberate leak of the Dependency Rule: a store reaching into Infrastructure rather
than going through a port. It is tolerated because both are *cross-cutting session concerns* with no business
logic, and isolating them behind ports would add ceremony for little gain at this project's size. Naming the
leak is the point — it is the same kind of pragmatic deviation catalogued in [§4.3](#43-the-inversion-gap),
and [§9](#9-scaling-from-startup-to-enterprise) revisits when a growing codebase should pay to close it.

**Justification.** Frameworks belong in the outermost ring as a "detail" [Martin 2017]. Keeping data
access out of components and behind a store/use-case boundary is consistent with the official guidance to
treat stores as the place that coordinates state and side-effect-bearing actions [Vue/Pinia docs]. The
benefit is concrete: the entire UI can be replaced without touching a single business rule, because the UI
only ever consumes use cases. Conventions for organizing components by feature are covered in
[§8.5](#85-feature-based-component-organization--presentation); placing their styles and animations is covered
in the companion document [styling-and-animation.md](styling-and-animation.md).

---

## 4. Dependency Direction in Practice

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

1. **Domain** — model the concept as an entity or value object; encode its rules and invariants.
2. **Application (port)** — declare the interface describing the data operation the feature needs.
3. **Application (use case)** — write the orchestration that uses entities and the port.
4. **Infrastructure (adapter)** — implement the port against the real transport; map responses to
   entities.
5. **Presentation (store)** — call the use case and expose reactive state.
6. **Presentation (view/component)** — bind the store's state and actions to the interface.

Following this order guarantees that, at every step, code only ever reaches inward. The same inside-out
order is the cheapest way to test a feature — see [§5.3](#53-the-test-pyramid-mapped-onto-the-onion).

### 4.3 The inversion gap

In the present codebase, the Application layer imports concrete Infrastructure classes directly — for
example, `CreateUserUseCase.js` begins with
`import { UserRepository } from '@/infrastructure/repositories/UserRepository'`. This produces a working
*linear* layering (`Presentation → Application → Infrastructure → Domain`), but it lets a use case depend
on a detail, which the canonical model forbids [Martin 2017].

The prescribed evolution is to invert that single dependency. The Application layer should declare a port,
and the use case should receive an implementation rather than importing one:

```js
// BEFORE — use case depends on a concrete adapter (a detail)
import { UserRepository } from '@/infrastructure/repositories/UserRepository'

export async function createUserUseCase(form) {
  const payload = toPayload(form)
  return UserRepository.create(payload)        // hard-wired to Infrastructure
}
```

```js
// AFTER — use case depends on an injected port (an abstraction)
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
layered stack and a true onion [Palermo 2008; Cockburn 2005]. The gain is not abstract — it is the
difference between injecting a fake in one line and intercepting a module path, shown side by side in
[§5.4](#54-per-layer-testing).

---

## 5. Testing the Layers

The previous sections build the case that this architecture *can* be tested cheaply; this section shows
*how*, and why the how falls directly out of the Dependency Rule. Testability is not a separate discipline
bolted onto the design — it is the design's most immediate dividend. The same rule that forbids an inner
layer from naming an outer one is what guarantees that, in a test, every outer collaborator can be
replaced by a substitute under the test's control [Cockburn 2005; Martin 2017].

### 5.1 Tests are an outer ring

Martin places automated tests in the outermost ring, as another kind of *detail* that consumes the
application through the same boundaries the UI does — the "Test Boundary" [Martin 2017, ch. 28]. The
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

- **Stub** — returns canned answers the code under test reads. It supplies input. ("`fetchAll` resolves to
  these two rows.")
- **Mock** — additionally *verifies* that it was called the way you expected. It asserts an interaction.
  ("`create` was called once, with this payload.")
- **Fake** — a real but lightweight implementation, e.g. an in-memory repository that actually stores and
  returns objects. It behaves, it just doesn't touch the network.

This architecture makes **fakes unusually cheap**, because a port is a small interface — an in-memory
adapter satisfying it is a few lines. Prefer fakes and stubs over mocks wherever you can. Leaning on mocks
couples a test to *how* a use case calls its collaborators rather than *what* it produces, which is the
classic origin of brittle tests that break on every refactor even though behavior is unchanged
[Khorikov 2020; Fowler 2007].

### 5.3 The test pyramid, mapped onto the onion

The Test Pyramid prescribes many fast unit tests at the base, fewer integration tests in the middle, and a
thin layer of end-to-end tests at the top — because the higher you go, the slower, more brittle, and more
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
it buys the most coverage per second — at the base.

### 5.4 Per-layer testing

Each layer below follows a compact template parallel to [§3](#3-the-four-layers):
**What to test · What to substitute · Example · Justification.**

#### Domain — substitute nothing

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
fastest and most stable in the suite — they should also be the most numerous.

#### Application — substitute the port

**What to test.** The orchestration: that the use case maps its input correctly and delegates to the port.

**What to substitute.** The repository port — with a fake or a stub.

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
repository today — it `import`s the concrete `UserRepository` directly ([§4.3](#43-the-inversion-gap)).
There is therefore no seam to inject a fake, so the test must reach up into an outer ring and replace the
whole module:

```js
// Today, without the inversion: substitute the module by its path
vi.mock('@/infrastructure/repositories/UserRepository', () => ({
  UserRepository: { create: vi.fn().mockResolvedValue({}) },
}))
```

This works, but it couples the test to an Infrastructure *file path* — the precise coupling the Dependency
Rule exists to prevent, now surfacing in the test's setup. The discomfort in the test is the design smell
of §4.3 speaking out loud. **The test you have to write is feedback on the design you chose.**

**Justification.** Use cases hold "application-specific business rules" and should be verifiable without
the network [Martin 2017]; depending on a port rather than a concrete class is what makes the clean form
above possible [Cockburn 2005; Martin 2003].

#### Infrastructure — substitute the transport, keep the mapping real

**What to test.** The adapter's one job: turn raw API shapes into Domain entities, including the defensive
handling of inconsistent payloads.

**What to substitute.** The HTTP client. Everything else — the mapping, the entity construction — stays
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

**Justification.** A repository "acts like an in-memory collection of domain objects" — its value is the
boundary mapping, so the boundary mapping is what a test must pin down [Fowler 2002]. Substituting only
the transport keeps the test honest: it exercises the real translation rather than asserting against a
mock of it.

#### Presentation — substitute the use case

**What to test.** That the store calls inward and exposes the result as reactive state; that a component
renders entity-derived data. Not business rules — those are already covered deeper in.

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
Utils — `mount` the view, stub the store's actions, and assert on rendered output rather than on internals
[Vue/Pinia docs; Vue Test Utils docs].

**Justification.** Stores are the place that "coordinates state and side-effect-bearing actions"
[Vue/Pinia docs]; a Presentation test should verify that coordination and the rendering, leaving the rules
to the layers that own them. Because the UI consumes only use cases, faking the use case isolates the UI
test completely from transport and from business logic.

### 5.5 What each layer's tests substitute

Just as [§4.1](#41-allowed-and-forbidden-imports) reduces the Dependency Rule to a check on `import`
statements, the test strategy reduces to a check on *what each layer's tests are allowed to replace*:

```
Domain tests          substitute: nothing                         (the layer is pure)
Application tests     substitute: the port            (a fake / stub repository)
Infrastructure tests  substitute: the HTTP client     (the transport, never the mapping)
Presentation tests    substitute: the use case        (a fake), or the store for components
```

The mirror of §4.1's heuristic: **a test substitutes exactly one ring outward — the boundary the layer
under test owns — and nothing deeper.** When a Presentation test reaches all the way down to mock the HTTP
client, it has skipped the use case and recoupled itself to a detail the Presentation layer is supposed to
be ignorant of. Over-deep mocking in a test is the same violation as a skip-the-core import, just expressed
in the test suite [Khorikov 2020].

### 5.6 Where tests live

Co-locate each test with the code it covers, in a sibling `__tests__/` folder, mirroring the naming
conventions of [§7](#7-naming--conventions-portable-defaults):

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
contract one directory away. The alternative — a separate `tests/` root that re-creates the `src/` tree —
keeps production code visually uncluttered and suits teams that run unit and end-to-end suites through
different tooling; the trade-off is that tests and code drift apart more easily. Either way, the *layout
mirrors the architecture*, so the test tree screams the same intent as the source tree [Martin 2017].

**Tools.** In a Vue 3 codebase the conventional stack is **Vitest** as the runner (fast, Vite-native),
**Vue Test Utils** for mounting components, the **Pinia testing** helpers for stores, and
**Playwright or Cypress** for the thin end-to-end tier [Vitest docs; Vue Test Utils docs; Pinia docs].

### 5.7 Justification

The strategy above is not a matter of taste; each rule traces to a source. Tests as an outer ring that
consumes the core through its boundaries is Martin's Test Boundary [Martin 2017]. The pyramid's shape —
many cheap tests low, few expensive tests high — is Cohn's and Vocke's [Cohn 2009; Vocke 2018]. The
distinction between stubs, mocks, and fakes, and the warning against over-mocking, is Meszaros's and
Fowler's [Meszaros 2007; Fowler 2007], reinforced by Khorikov's account of what makes a test valuable
rather than brittle [Khorikov 2020]. And the reason any of it is *cheap* on this architecture — that every
collaborator sits behind a substitutable port — is Cockburn's Ports & Adapters [Cockburn 2005]. The
architecture and its test strategy are the same idea read twice.

---

## 6. Why This Architecture

Each benefit below is a direct consequence of the Dependency Rule and dependency inversion.

- **Testability without infrastructure.** Because inner layers depend only on abstractions, use cases and
  entities can be tested with fakes and with no network, framework, or DOM — the mechanism is laid out in
  full in [§5](#5-testing-the-layers). Independence from frameworks and from the UI is an explicit, stated
  goal of Clean Architecture [Martin 2017].
- **Replaceable details.** Transport, storage, and UI sit in outer rings behind ports, so they can be
  swapped — REST to GraphQL, Axios to Fetch, one UI framework to another — by rewriting adapters, not the
  core. This substitutability is the defining promise of Ports & Adapters [Cockburn 2005].
- **Independent evolution.** The domain can grow without waiting on UI decisions, and the UI can be
  redesigned without risking business rules, because neither names the other [Palermo 2008].
- **Intent-revealing structure.** Top-level folders name *what the application does* (its domain and use
  cases) before *how it is delivered*, so the structure communicates purpose — the "screaming
  architecture" idea [Martin 2017].
- **A model worth talking about.** A rich, isolated domain model gives the whole team a shared, precise
  vocabulary, which is the central payoff of Domain-Driven Design [Evans 2003].

**Frontend-specific payoff.** On the client these benefits compound, because the frontend is where
technology churns fastest. A new rendering framework, a migration from polling to WebSocket, or an
offline/optimistic strategy can all be introduced as outer-ring changes. The business meaning — encoded in
entities and use cases — survives untouched. In a field where the average tool's lifespan is short, placing
the durable asset at the protected center is the architecture's highest-value property.

---

## 7. Naming & Conventions (portable defaults)

These defaults make the rules above visible in the file system. They are recommendations, not laws, but
adopting them across projects keeps the structure recognizable.

**Folder layout.**

```
src/
├── domain/
│   ├── entities/          # PascalCase: User.js, Order.js
│   └── errors/            # DomainErrors.js
├── application/
│   ├── ports/             # interfaces the use cases depend on
│   └── use-cases/         # camelCase: createUserUseCase.js, grouped by concept
├── infrastructure/
│   ├── http/              # client.js, ApiError.js
│   ├── repositories/      # PascalCase adapters: UserRepository.js
│   └── realtime/          # wsClient.js
└── presentation/
    ├── views/             # PascalCase: LoginView.vue
    ├── components/        # grouped by feature + a shared/ folder (see §8.5)
    ├── stores/            # camelCase: useUserStore.js
    ├── router/            # route definitions + guards
    └── styles/            # design tokens + component styles (see styling-and-animation.md)
```

**Conventions.**
- **Path alias.** Map `@` to `src/` so imports are absolute and the layer is always visible in the path
  (`@/domain/...`, `@/application/...`). Relative `../../..` chains hide layer crossings.
- **File naming.** PascalCase for entities, repositories, and components; camelCase for use cases, stores,
  and composables.
- **Test placement.** Co-locate tests in `__tests__/` siblings, named `<Unit>.test.js`, mirroring the
  layer they cover — see [§5.6](#56-where-tests-live).
- **Import boundaries.** Treat the allowed/forbidden table in [§4.1](#41-allowed-and-forbidden-imports) as
  a lint target; an automated import-boundary check turns the Dependency Rule into a guarantee rather than
  a guideline.
- **Styles out of components.** Keep structural styles in dedicated files rather than inside component
  markup, reserving inline styles for genuinely runtime-driven values (positions, computed sizes, per-entity
  colors). This keeps the Presentation layer's components focused on structure and behavior. Two layouts for
  those dedicated style and animation files — a mirrored `styles/` tree or colocation in the feature folder —
  are described in the companion document [styling-and-animation.md](styling-and-animation.md).
- **Components by feature.** Group components into feature folders (`components/auth/`, `components/orders/`)
  with a `shared/` folder for cross-feature primitives, rather than a flat `components/` directory — see
  [§8.5](#85-feature-based-component-organization--presentation).

---

## 8. Appendix — Advanced Patterns (Bonus)

The patterns below are **not part of the core four-layer model**. They are concrete techniques and
recommended conventions used by production applications built on this architecture, included to show how
non-trivial concerns find a natural home in a specific layer without disturbing the others. They are
optional.

### 8.1 Offline-first synchronization with CRDT / Last-Write-Wins — *Infrastructure*

A `SyncEngine` loads cached data from `localStorage` instantly, then reconciles it with the server in the
background. Each entity may carry a `_localUpdatedAt` timestamp; on merge, a recent local edit wins over
stale server data within a short window, otherwise the server is authoritative. This is a deliberate
**Last-Write-Wins register**, the simplest member of the family of Conflict-free Replicated Data Types
[Shapiro et al. 2011]. It lives entirely in Infrastructure, behind the repository boundary, so use cases
and components remain unaware that caching or conflict resolution occur.

### 8.2 Optimistic updates — *Presentation + Infrastructure*

A store applies a mutation to local state immediately (so the UI responds without waiting for the network),
then confirms it against the server in the background and reconciles via the sync engine. The optimistic
write is a Presentation concern; the reconciliation rules live in Infrastructure. The use case in between
stays a plain orchestration step.

### 8.3 Transparent token refresh & request deduplication — *Infrastructure*

The HTTP client refreshes an expired access token on a `401` and retries the original request. Concurrent
`401`s share a single in-flight refresh promise (`_refreshPromise`) so the refresh endpoint is called once,
not once per failed request. Because this is confined to `client.js`, authentication lifetime is invisible
to every layer above it.

### 8.4 Shell "boards" pattern — *Presentation*

A fixed application shell (top bar + sidebar) exposes named outlets into which individual views publish
contextual controls (filters, toolbars) via Vue's `Teleport`. This keeps the chrome stable while letting
each page contribute its own controls, and it is purely a Presentation-layer composition technique.

### 8.5 Feature-based component organization — *Presentation*

As a Presentation layer grows, a flat `presentation/components/` directory degrades into a bag of unrelated
files where `LoginForm.vue` sits beside `OrderCard.vue` and a generic `Button.vue`. The remedy is to group
components by the **feature** (or domain area) they serve, with a `shared/` folder reserved for genuinely
cross-feature primitives:

```
presentation/
└── components/
    ├── shared/              # cross-feature primitives: BaseButton, BaseModal, Badge
    │   ├── BaseButton.vue
    │   └── BaseModal.vue
    ├── auth/                # everything the auth feature renders
    │   ├── LoginForm.vue
    │   ├── SignupForm.vue
    │   └── UserMenu.vue
    └── orders/
        ├── OrderList.vue
        ├── OrderCard.vue
        └── OrderFilters.vue
```

The rule of thumb: a component lives in a feature folder when it is meaningful only to that feature; it
graduates to `shared/` only once a *second* feature genuinely needs it. Resist promoting early — a premature
`shared/` becomes its own junk drawer, the very problem feature folders exist to solve.

This is the same "screaming architecture" instinct the top-level layer folders already express
[Martin 2017], applied one level down: the folder names announce *what the UI is about* (auth, orders)
before *what the pieces are* (forms, cards). It also follows the colocation principle — code that changes
together should live together, so a change to the auth screens touches one folder instead of ranging across
a flat tree [Dodds 2019]. Modern frontend methodologies such as Feature-Sliced Design formalize exactly this
feature-first slicing [Feature-Sliced Design].

A route-level component in `presentation/views/` then *composes* feature components: the feature folder is
the home of the pieces, the view is the assembly point.

### 8.6 Styling & animation architecture — *Presentation*

Where a component's styles and imperative animations (GSAP timelines, scroll triggers) should live — the
mirrored `styles/` tree vs. colocation in the feature folder, and when to choose each — is covered in its own
companion document: **[styling-and-animation.md](styling-and-animation.md)**. It is a Presentation-layer
detail, kept separate so this guide stays focused on the four core layers.

---

## 9. Scaling: From Startup to Enterprise

The preceding sections describe an architecture that is correct at *any* size. This section is about what
changes as the organization around the code grows from one founder to a Figma- or Anthropic-sized engineering
org. The reassuring thesis first:

> **The four layers never change. What changes is how dependencies are *wired* and how the code is
> *partitioned* — and both change in response to headcount and codebase size, not to taste.**

Domain, Application, Infrastructure, and Presentation remain exactly as defined in [§3](#3-the-four-layers) at
every phase below. A 500-engineer company and a solo founder draw the same four rings. The difference is
purely mechanical: how the adapter gets injected into the use case, and where the folder boundaries fall.

A second idea governs the whole section — **Conway's Law**: "organizations design systems that mirror their
own communication structure" [Conway 1968]. As teams multiply, the architecture *will* come to mirror the org
chart whether you plan it or not. Each phase below is really about choosing those seams deliberately before
the org forces accidental ones.

### 9.1 The four growth phases

| Phase | Team | Codebase | Wiring mechanism | Partitioning |
|-------|------|----------|------------------|--------------|
| 1 · Startup | 1–10 | <50k LOC | Manual DI in a bootstrap file | Folders by layer |
| 2 · Scale-Up | 10–50 | 50k–500k | DI container | Folders by layer |
| 3 · Growth | 50–200 | 500k–2M | DI container per feature | Folders by **feature** (monorepo) |
| 4 · Enterprise | 200+ | 2M+ | Per-context composition | **Bounded contexts** / micro-frontends |

The boundaries are signals, not thresholds — a disciplined 30-person team may stay happily in Phase 1. Use
the decision tree in [§9.6](#96-the-scaling-decision-tree) and the red flags in
[§9.7](#97-red-flags-youve-outgrown-your-phase) to locate yourself, not the headcount alone.

### 9.2 Phase 1 — Startup: manual dependency injection

**This document is written for Phase 1.** Dependencies are assembled by hand in a single composition file —
the only place in the system that names both a concrete adapter and the use case it feeds:

```js
// presentation/bootstrap.js — the one place Infrastructure meets Application
import { HttpUserRepository } from '@/infrastructure/repositories/HttpUserRepository'
import { makeCreateUserUseCase } from '@/application/use-cases/CreateUserUseCase'

const userRepository = new HttpUserRepository()
export const createUser = makeCreateUserUseCase({ userRepository })
```

Everything inward of `bootstrap.js` depends only on ports; everything is testable with fakes. This is the
**Composition Root** pattern — wire the object graph once, at the outermost edge [Martin 2017]. It is simple,
explicit, and entirely sufficient until the wiring file itself becomes a bottleneck.

**Graduate when:** the team passes ~10 engineers; `bootstrap.js` grows past ~100 dependencies and manual
ordering becomes error-prone; or "where does this go?" starts costing real minutes per feature.

### 9.3 Phase 2 — Scale-Up: a dependency-injection container

The layers and folders are unchanged. The only thing that changes is that wiring becomes *declarative* — a
container resolves the graph instead of you hand-assembling it in order:

```js
// composition/container.js
const container = new Container()
container.register('UserRepository', () => new HttpUserRepository())
container.register('createUser', (c) =>
  makeCreateUserUseCase({ userRepository: c.resolve('UserRepository') }))

// anywhere in Presentation:
const createUser = container.resolve('createUser')
```

Mature ecosystems formalize this with libraries (InversifyJS, tsyringe in TypeScript), but the principle is
identical to the hand-written version above — it is still the Composition Root, just automated. The win is
that a hundred bindings no longer need a human to topologically sort them, and swapping an adapter for a test
double becomes a one-line container override.

**Graduate when:** multiple teams start colliding inside one `src/` tree; the container config itself grows
unwieldy (>500 lines); or one layer balloons to many times the size of the others — the sign that "by layer"
is no longer the right primary partition.

### 9.4 Phase 3 — Growth: feature slices in a monorepo

At this size the dominant axis of change is the **feature**, not the layer. Partition by feature first; let
each feature own its own four-layer slice; reserve a `shared/` space for the genuinely cross-cutting:

```
libs/
├── features/
│   ├── auth/
│   │   ├── domain/  ├── application/  ├── infrastructure/  └── presentation/
│   └── work-windows/
│       ├── domain/  ├── application/  ├── infrastructure/  └── presentation/
└── shared/
    ├── domain/        (cross-feature entities, value objects)
    └── http/          (the one Axios client, interceptors)
apps/
├── web/    └── admin/
```

A monorepo tool (Nx, Turborepo) makes the boundaries *enforceable*: `auth` can be forbidden by lint rule from
importing `work-windows/infrastructure`, so the Dependency Rule is checked by CI rather than by reviewer
goodwill. This is the Feature-Sliced Design methodology [Feature-Sliced Design] applied on top of the same
onion — each slice is a small onion, and the build graph guards the seams.

**Graduate when:** teams own whole features end-to-end rather than horizontal layers; feature boundaries start
to blur; or inter-feature communication degrades into reaching directly into each other's stores instead of
going through explicit contracts.

### 9.5 Phase 4 — Enterprise: bounded contexts and micro-frontends

Past a couple hundred engineers the bottleneck is no longer code — it is **coordination**. The architecture's
job becomes minimizing how often teams must synchronize. Each domain team owns a complete **bounded context**
[Evans 2003]: its own onion, its own deploy cadence, its own data, communicating with other contexts only
through explicit contracts — typed APIs or published events, never shared internal state.

```
┌─ Scheduling context ─┐   events / typed API   ┌─ Billing context ─┐
│  (own 4-layer onion) │ ─────────────────────► │ (own 4-layer onion)│
│  team-owned, deployed│ ◄───────────────────── │  team-owned        │
└──────────────────────┘                        └───────────────────┘
```

On the frontend this often materializes as **micro-frontends**: independently built and deployed UIs composed
at runtime, each owned by the team that owns its domain [Geers 2020]. This is exactly how large product orgs
organize — Spotify around squads-per-domain, Figma and Netflix around domain-owned surfaces. The matching
organizational design is **Team Topologies**: stream-aligned teams own a context end-to-end, with platform
teams providing the shared `http`/design-system substrate [Skelton & Pais 2019].

The critical discipline: contracts between contexts are the *only* coupling. Inside a context, the four onion
layers still apply unchanged — the enterprise is, recursively, a collection of Phase-1 onions with hardened
borders.

### 9.6 The scaling decision tree

```
Are you 1–10 engineers with <50k LOC, and is hand-wiring still painless?
  └─ YES → Phase 1. Keep the manual Composition Root. Do not add a container yet.
  └─ NO ↓
Are you 10–50 engineers, one shared codebase, wiring getting unwieldy?
  └─ YES → Phase 2. Introduce a DI container. Keep folders by layer.
  └─ NO ↓
Are you 50–200 engineers, teams owning features, layers fighting each other?
  └─ YES → Phase 3. Re-partition by feature in a monorepo with enforced boundaries.
  └─ NO ↓
Are you 200+ engineers where coordination — not code — is the bottleneck?
  └─ YES → Phase 4. Bounded contexts + micro-frontends, contracts as the only coupling.
```

Resist skipping ahead. A DI container in a three-person startup, or micro-frontends at fifty engineers, buys
coordination machinery you are not yet paying the cost that would justify — premature scaling is its own
failure mode.

### 9.7 Red flags: you've outgrown your phase

Concrete signals that you are operating in one phase but need the next phase's tools:

- **Leaving Phase 1:** the bootstrap/wiring file is hundreds of lines; ordering dependencies by hand causes
  bugs; new hires can't find where things are wired.
- **Leaving Phase 2:** container config exceeds ~500 lines; one "god layer" (usually `domain/` or a shared
  `services/`) is many times larger than the rest; teams routinely break each other's tests in one `src/`.
- **Leaving Phase 3:** feature boundaries are blurry; features import each other's internals instead of
  contracts; the monorepo's task graph is slow because nothing is truly isolated.
- **Leaving Phase 4 (the org, not the code):** coordination overhead exceeds ~30% of a sprint; shipping slows
  as headcount rises. The fix here is organizational design, not another architectural layer — the clearest
  sign that you have reached the limit of what architecture alone can solve.

The honest boundary leak named in [§3.4](#34-presentation-outermost) — a store importing `TOKEN_KEY` and
`wsClient` straight from Infrastructure — is a Phase-1 trade-off. It is invisible at ten engineers and
intolerable at two hundred; closing it behind a port is precisely the kind of debt each phase transition pays
down deliberately rather than all at once.

---

## 10. References

- **Beck, K.** (2002). *Test-Driven Development: By Example*. Addison-Wesley. (Tests as a design tool.)
- **Cockburn, A.** (2005). *Hexagonal Architecture (Ports and Adapters)*.
  https://alistair.cockburn.us/hexagonal-architecture/
- **Cohn, M.** (2009). *Succeeding with Agile: Software Development Using Scrum*. Addison-Wesley.
  (The Test Pyramid.)
- **Conway, M. E.** (1968). *How Do Committees Invent?* Datamation. (Conway's Law: systems mirror the
  communication structure of the organizations that build them.)
  https://www.melconway.com/Home/Committees_Paper.html
- **Dodds, K. C.** (2019). *Colocation*. (Place code as close as possible to where it is relevant.)
  https://kentcdodds.com/blog/colocation
- **Evans, E.** (2003). *Domain-Driven Design: Tackling Complexity in the Heart of Software*.
  Addison-Wesley. (Entities; the domain model as the core.)
- **Feature-Sliced Design.** *Architectural methodology for frontend projects.* (Feature-first slicing of
  the UI.) https://feature-sliced.design/
- **Fowler, M.** (2002). *Patterns of Enterprise Application Architecture*. Addison-Wesley.
  (Repository; Service Layer.) https://martinfowler.com/eaaCatalog/repository.html
- **Fowler, M.** (2007). *Mocks Aren't Stubs*. (Stubs vs. mocks; classicist vs. mockist testing.)
  https://martinfowler.com/articles/mocksArentStubs.html
- **Geers, M.** (2020). *Micro Frontends in Action*. Manning. (Independently built and deployed UIs composed
  at runtime, each owned by the team that owns its domain.) https://www.microfrontends.com/
- **GreenSock (GSAP).** *GSAP Documentation.* (Imperative, timeline-based animation.)
  https://gsap.com/docs/
- **Khorikov, V.** (2020). *Unit Testing Principles, Practices, and Patterns*. Manning. (What makes a test
  valuable; the cost of over-mocking.)
- **Martin, R. C.** (2003). *Agile Software Development, Principles, Patterns, and Practices*. Prentice
  Hall. (The Dependency Inversion Principle, part of SOLID.)
  https://web.archive.org/web/20110714224327/http://www.objectmentor.com/resources/articles/dip.pdf
- **Martin, R. C.** (2012). *The Clean Architecture*. The Clean Code Blog. (The Dependency Rule.)
  https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html
- **Martin, R. C.** (2017). *Clean Architecture: A Craftsman's Guide to Software Structure and Design*.
  Prentice Hall. (Entities, use cases, frameworks as details; "screaming architecture"; the Test Boundary,
  ch. 28.)
- **Meszaros, G.** (2007). *xUnit Test Patterns: Refactoring Test Code*. Addison-Wesley. (The Test Double
  taxonomy: dummy, stub, spy, mock, fake.)
- **Nx & Turborepo documentation.** *Monorepo build systems with enforced project boundaries.* (Module-
  boundary lint rules that make the Dependency Rule checkable in CI.) https://nx.dev/ · https://turborepo.com/
- **Palermo, J.** (2008). *The Onion Architecture* (Parts 1–4).
  https://jeffreypalermo.com/2008/07/the-onion-architecture-part-1/
- **Shapiro, M., Preguiça, N., Baquero, C., & Zawirski, M.** (2011). *Conflict-free Replicated Data Types*.
  INRIA Research Report RR-7687. https://hal.inria.fr/inria-00609399
- **Skelton, M. & Pais, M.** (2019). *Team Topologies: Organizing Business and Technology Teams for Fast
  Flow*. IT Revolution. (Stream-aligned vs. platform teams; org structure as an architectural force.)
  https://teamtopologies.com/book
- **Vocke, H.** (2018). *The Practical Test Pyramid*. martinfowler.com.
  https://martinfowler.com/articles/practical-test-pyramid.html
- **Vue.js, Pinia & Vue Test Utils documentation.** https://vuejs.org/ · https://pinia.vuejs.org/ ·
  https://pinia.vuejs.org/cookbook/testing.html · https://test-utils.vuejs.org/ · https://vitest.dev/ ·
  https://vuejs.org/api/sfc-css-features.html (Framework-specific guidance for components, reactivity,
  stores, testing, and single-file-component scoped styles / CSS Modules.)
