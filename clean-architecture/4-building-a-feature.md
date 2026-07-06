> **[Clean Architecture](README.md)** › Building a Feature End-to-End. Full reference list: [References](references.md).

## 4. Building a Feature End-to-End

Theory is easier to trust once you have built something with it. This page takes one small feature —
**"create a user"** — and builds it from the center outward, one layer at a time, until a form submission
reaches the API. It doubles as a getting-started guide: **the order the layers appear here is the order to
build them in** on any new feature.

The guiding principle is *build inside-out*. Start with what the feature *means* (the entity and the rule),
then what it *does* (the use case), then how it *reaches the world* (the adapter), and only last how it is
*delivered* (the framework and UI). Each step depends only on the ones before it, so at every stage you have
something testable.

---

### 4.1 Step 1 — the Entity (what the feature *is*)

Begin at the core. A `User` is a plain class with no imports out of the entities folder — identity, a little
derived state, and the rules that are true regardless of how the app is delivered.

```js
// entities/User.js
export class User {
  constructor({ id, firstName, lastName, email, isActive = true }) {
    this.id = id
    this.firstName = firstName
    this.lastName = lastName
    this.email = email
    this.isActive = isActive
  }

  get fullName() {
    return [this.firstName, this.lastName].filter(Boolean).join(' ')
  }

  get statusLabel() {
    return this.isActive ? 'ACTIVE' : 'INACTIVE'
  }
}
```

You can already unit-test this with no framework, no network, no mocks — construct one and assert `fullName`.
That is the dividend of starting at the center.

---

### 4.2 Step 2 — the Port and the Use Case (what the feature *does*)

The use case orchestrates the operation. It must not know how a user is persisted, so it declares a **port**
— the contract it needs — and receives an implementation by injection. In plain JS a port is an honest JSDoc
`@typedef`; in TypeScript it is an `interface`.

```js
// usecases/ports/UserRepository.js
/**
 * A PORT: the contract the use case needs. An adapter must satisfy it.
 * @typedef {Object} UserRepository
 * @property {(payload: object) => Promise<import('@/entities/User').User>} create
 */
```

```js
// usecases/CreateUser.js
import { User } from '@/entities/User'

/** @param {{ userRepository: UserRepository }} deps */
export function makeCreateUser({ userRepository }) {
  return async function createUser(form) {
    // 1. Application-level validation — fail in the domain's language, not a generic Error:
    if (!form.email) throw new Error('Email is required.')

    // 2. Map the input into the shape the port expects:
    const payload = {
      first_name: form.firstName,
      last_name: form.lastName,
      email: form.email,
    }

    // 3. Delegate persistence to the injected port — no HTTP named here:
    return userRepository.create(payload)
  }
}
```

`makeCreateUser` is a **factory**: it takes its dependencies and returns the function that does the work.
That is what lets a test inject a fake `userRepository` in one line, and what lets the
[Composition Root](6-composition-and-di.md) inject the real one. At this point the feature is fully testable
though nothing talks to a server yet.

---

### 4.3 Step 3 — the Adapter (how the feature *reaches the world*)

Now provide a concrete implementation of the port. The gateway is the only place that knows the API exists;
it maps the raw response into a `User` so nothing outward ever sees JSON.

```js
// adapters/gateways/HttpUserRepository.js
import client from '@/frameworks/http/client'
import { User } from '@/entities/User'

/** @implements {import('@/usecases/ports/UserRepository').UserRepository} */
export const HttpUserRepository = {
  async create(payload) {
    const { data } = await client.post('/users', payload)
    return new User(data)   // map at the boundary
  },
}
```

Swapping REST for GraphQL, or the real API for an in-memory fake, is a change to *this file only*. The use
case and the entity do not move.

---

### 4.4 Step 4 — the Framework & the UI (how the feature is *delivered*)

The outermost layer captures intent and renders results. A store (Presentation state) calls the use case and
never touches HTTP; the view calls the store. First, the wiring that hands the assembled use case to the UI:

```js
// composition/container.js — the one place that names both an adapter and a use case
import { HttpUserRepository } from '@/adapters/gateways/HttpUserRepository'
import { makeCreateUser } from '@/usecases/CreateUser'

export const createUser = makeCreateUser({ userRepository: HttpUserRepository })
```

```js
// frameworks/ui/stores/useUsersStore.js  (Vue + Pinia)
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { createUser } from '@/composition/container'

export const useUsersStore = defineStore('users', () => {
  const users = ref([])
  async function add(form) {
    const user = await createUser(form)   // delegate inward — no HTTP, no mapping here
    users.value.push(user)
  }
  return { users, add }
})
```

The view calls `usersStore.add(form)` and renders `user.fullName`; it has no idea a network exists.

---

### 4.5 The whole flow

Read from the outside in, a user submitting the form triggers a straight line inward — and every arrow points
toward the center, exactly as the Dependency Rule requires:

```
View  →  Store  →  createUser (Use Case)  →  HttpUserRepository (Adapter)  →  HTTP client  →  API
 UI       state        application rule            translation                  transport
└──────────── Frameworks & Drivers ───────────┘└─── Interface Adapters ───┘└─ Frameworks & Drivers ─┘
```

- Nothing inward of the store imports a framework.
- Nothing inward of the gateway imports HTTP.
- The entity imports nothing at all.

That is a complete, robust vertical slice. Every subsequent feature is the same four steps in the same order,
and the [next page](5-testing-in-clean.md) shows how cheaply each step can be tested because you built it this
way.

---

Next: **[Testing in Clean Architecture](5-testing-in-clean.md)** — why building inside-out makes each layer
trivial to test.
