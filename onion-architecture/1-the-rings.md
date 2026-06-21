> **[Onion Architecture](README.md)** › The Rings. Full reference list: [References](references.md).

## 3. The Rings: The Four Layers
<a id="3-the-four-layers"></a>

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
- **Entities**: objects with identity and behavior (a `User`, an `Order`, an `Application`).
- **Value objects**: objects defined solely by their attributes (a `Money`, a `DateRange`).
- **Domain errors**: named violations of business rules.
- **Invariants**: rules that must always hold, enforced inside the entity.

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
shows what *enterprise-critical business knowledge* [Martin 2017] looks like when it lives at the center,
its rules about when a scheduling window may still be edited are expressed entirely as derived state, with no
framework and no I/O:

```js
// src/domain/entities/WorkWindow.js (excerpt: business rules as getters)
// Two-tier "seal": the start freezes once it passes; the whole window freezes once it ends.
// "Timeline" is the SERVER clock, synced via GET /work-windows/timeline, never the browser's.
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
rejects an illegal reschedule, and a test that asserts the rule all read the same single source of truth,
the entity, instead of re-deriving it. That is the payoff of a rich domain model [Evans 2003].

A note on **value objects**: §"What lives here" lists them, but this codebase models that behavior directly
on entities (getters and small static helpers such as `WorkWindow.toTimestampTz`) rather than introducing
standalone `Money`/`DateRange` classes. That is a legitimate choice, the point is that the *behavior* lives
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
react precisely, exactly what the Presentation store does in [§3.4](#34-presentation-outermost). The richer
`WorkWindowError` (which maps backend failures back to domain language) is shown at the boundary in
[§3.3](#33-infrastructure).

**Justification.** Entities are "the least likely to change when something external changes" and should
contain "enterprise-wide critical business rules" [Martin 2017]. A rich domain model placed at the center
of the system is the core recommendation of Domain-Driven Design [Evans 2003]. Keeping this layer free of
I/O is what allows it to be unit-tested with no mocks and reused unchanged across transports, the
mechanism is detailed in [§5.4](3-testing-in-onion.md#54-per-layer-testing).

---

### 3.2 Application

**Responsibility.** Orchestrate the steps of a single business operation, a *use case*. The Application
layer coordinates entities and the ports it needs, but contains no UI logic and no knowledge of how data
physically travels.

**What lives here.**
- **Use cases**: one operation per unit (log in, create user, fetch orders).
- **Ports**: interfaces describing the capabilities the use cases require (e.g. a repository contract).
- **Application-level mapping**: translating input shapes into the form entities and ports expect.

**What it must not do.** Render anything, read framework-reactive state, call an HTTP client directly, or
depend on a concrete Infrastructure class. It depends on the Domain and on *ports*, not on adapters.

**Dependency direction.** Depends inward on the Domain (and on ports it declares).

**Generic example, prescribed, port-based form.** The use case receives its dependency through a port,
so it never names a concrete adapter:

A port is a *contract*, not an implementation. In TypeScript it is an `interface`; in plain JavaScript the
honest equivalent is a JSDoc `@typedef`, a description the use case is typed against, with no runtime stub
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
role, it maps a form into the API payload and delegates persistence to a repository:

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
from the canonical model, addressed deliberately in [§4.3](2-inward-dependencies.md#43-the-inversion-gap), and, as
[§5.4](3-testing-in-onion.md#54-per-layer-testing) shows, it has a measurable cost the moment you try to test this file.

**Orchestration is more than delegation.** `CreateUserUseCase` is deliberately thin, but a use case is also
where *application-level* validation lives and where infrastructure failures are translated back into the
domain's language before they can leak outward. `src/application/use-cases/work-windows/CreateWorkWindowUseCase.js`
makes both moves explicit:

```js
// src/application/use-cases/work-windows/CreateWorkWindowUseCase.js (excerpt)
import { WorkWindowRepository } from '@/infrastructure/repositories/WorkWindowRepository'
import { WorkWindowError } from '@/domain/errors/WorkWindowError'

// 1. Validate application-level rules, fail with a DOMAIN error, not a generic one:
if (!item.startTime) throw new WorkWindowError(`Hora de inicio requerida${label}.`)
if (date < today)    throw new WorkWindowError(`No se pueden crear ventanas en fechas pasadas${label}.`)

// 2. Delegate persistence, mapping any transport failure back into the domain at the edge:
try {
  return await WorkWindowRepository.create(normalized)
} catch (e) {
  throw WorkWindowError.fromHttp(e, 'Error al crear la ventana de trabajo.')
}
```

Presentation never sees a raw Axios error or an HTTP status, only a `WorkWindowError` it can show to the
user. The mapping function itself lives at the Infrastructure boundary, shown in [§3.3](#33-infrastructure).

**Justification.** Use cases hold "application-specific business rules" and orchestrate the flow of data
to and from entities [Martin 2017]. The pattern of a thin coordinating layer above the domain is Fowler's
*Service Layer* [Fowler 2002]. Depending on a port rather than a concrete class is the direct application
of the Dependency Inversion Principle [Martin 2003].

---

### 3.3 Infrastructure

**Responsibility.** Provide concrete implementations, *adapters*, for the ports the inner layers
declare. This is where the application meets the outside world: HTTP, WebSocket, browser storage, and
third-party SDKs. It is the layer most expected to change.

**What lives here.**
- **HTTP client**: a configured transport with interceptors and cross-cutting concerns.
- **Repositories**: adapters that fetch raw data and **map it into Domain entities**.
- **Realtime / messaging clients**: WebSocket or SSE adapters.
- **Storage**: caches and persistence over `localStorage`, IndexedDB, etc.

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
- **Views / pages**: route-level components.
- **Components**: reusable UI building blocks.
- **Stores**: reactive UI state that calls use cases and exposes results to components.
- **Router**: navigation and route guards.
- **Styles**: design tokens and component styles.

**What it must not do.** Call the HTTP client directly, embed business rules, or construct entities from
raw API data. It speaks to inner layers only through use cases.

**Dependency direction.** Depends inward on the Application layer (and, through it, on the Domain).

**Generic example.** A store that delegates to a use case and exposes reactive state, it knows nothing of
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

  // Derived UI state, memoized by Vue, recomputed only when dependencies change:
  const isAuthenticated = computed(() => !!user.value && !!localStorage.getItem(TOKEN_KEY))
  const isAdmin = computed(() =>
    (profile.value?.roleNames || []).map(r => r.toLowerCase()).includes('admin'))

  async function login(email, password) {
    user.value = await loginUseCase(email, password)   // delegate inward, no HTTP here
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

**An honest boundary note.** The real store also imports two Infrastructure symbols directly, `TOKEN_KEY`
(to read the token from `localStorage`) and `wsClient` (to open/close the realtime connection on login and
logout). That is a small, deliberate leak of the Dependency Rule: a store reaching into Infrastructure rather
than going through a port. It is tolerated because both are *cross-cutting session concerns* with no business
logic, and isolating them behind ports would add ceremony for little gain at this project's size. Naming the
leak is the point, it is the same kind of pragmatic deviation catalogued in [§4.3](2-inward-dependencies.md#43-the-inversion-gap),
and [§9](6-scaling.md#9-scaling-from-startup-to-enterprise) revisits when a growing codebase should pay to close it.

**Justification.** Frameworks belong in the outermost ring as a "detail" [Martin 2017]. Keeping data
access out of components and behind a store/use-case boundary is consistent with the official guidance to
treat stores as the place that coordinates state and side-effect-bearing actions [Vue/Pinia docs]. The
benefit is concrete: the entire UI can be replaced without touching a single business rule, because the UI
only ever consumes use cases. Conventions for organizing components by feature are covered in
[§8.5](4-advanced-patterns.md#85-feature-based-component-organization-presentation); placing their styles and animations is covered
in the companion document [styling-and-animation.md](5-styling-and-animation.md).

