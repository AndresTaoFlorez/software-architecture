> **[Clean Architecture](README.md)** › Clean Architecture on the Backend. Full reference list: [References](references.md).

## 8. Clean Architecture on the Backend

Clean Architecture was born on the server, and it is where the payoff is most tangible: the database, the web
framework, and the ORM are *all* details, kept at the edge so the business rules outlive them. This page
takes the four circles you already know and shows their server-side form, then builds the **same
"create user" feature** end-to-end so you can see, side by side, that the core is literally identical — only
the outer circles change.

The examples are in Node/TypeScript with Express and an ORM (Prisma-style), matching this repository's stack.
As always, the framework is illustrative; the layering is not tied to it.

---

### 8.1 The four circles on the server

| Circle | Frontend form | Backend form |
|---|---|---|
| **1 · Entities** | Plain `User` class with getters | **The exact same class** — no change |
| **2 · Use Cases** | `createUser` interactor + a port | `createUser` interactor + **the same port** |
| **3 · Interface Adapters** | Gateway (HTTP → entity), store, presenter | **Controller** (HTTP request → use case), **repository over an ORM**, presenter (entity → response body) |
| **4 · Frameworks & Drivers** | Vue, browser HTTP client, `localStorage` | **Express/NestJS**, the **database**, the **ORM/driver** |

The headline: **Entities and Use Cases move to the server unchanged.** What was an HTTP *gateway* on the
client becomes a database *repository* on the server — but both implement the *same port shape*, so the use
case cannot tell them apart. The database is not a privileged foundation the use cases sit "on top of"; it is
an outermost driver that *implements* a contract the core declares [Martin 2017].

The folder tree is the one from [§3.1](3-project-structure.md#31-the-folder-layout), with the outer circles
holding server tools instead of browser ones:

```
src/
├── entities/                 # 1 — identical to the frontend's entities
│   ├── User.ts
│   └── errors/DomainErrors.ts
├── usecases/                 # 2 — identical shape; ports declared here
│   ├── ports/UserRepository.ts
│   └── CreateUser.ts
├── adapters/                 # 3 — controllers, ORM repositories, presenters
│   ├── controllers/UserController.ts
│   ├── repositories/PrismaUserRepository.ts
│   └── presenters/userPresenter.ts
├── frameworks/               # 4 — Express app, ORM client, config
│   ├── http/server.ts
│   └── db/prisma.ts
└── composition/container.ts  # the Composition Root (see §6)
```

---

### 8.2 Step 1 — the Entity (unchanged)

The same plain class, now in TypeScript. No import of Express, no import of the ORM.

```ts
// entities/User.ts
export class User {
  constructor(
    public readonly id: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly email: string,
    public readonly isActive: boolean = true,
  ) {}

  get fullName(): string {
    return [this.firstName, this.lastName].filter(Boolean).join(' ')
  }
}
```

---

### 8.3 Step 2 — the Port and the Use Case (unchanged shape)

The port is a real `interface` in TypeScript, and the use case is the same factory that depends on it. This
file could be copied between the frontend and backend codebases verbatim.

```ts
// usecases/ports/UserRepository.ts
import { User } from '@/entities/User'

export interface UserRepository {
  create(payload: { firstName: string; lastName: string; email: string }): Promise<User>
}
```

```ts
// usecases/CreateUser.ts
import { UserRepository } from '@/usecases/ports/UserRepository'
import { User } from '@/entities/User'

export function makeCreateUser({ userRepository }: { userRepository: UserRepository }) {
  return async function createUser(input: { firstName: string; lastName: string; email: string }): Promise<User> {
    if (!input.email) throw new Error('Email is required.')   // application rule, framework-free
    return userRepository.create(input)                       // delegate to the injected port
  }
}
```

The use case names neither Express nor the ORM. That is the whole discipline: swap Postgres for MongoDB, or
Express for NestJS, and this file does not move.

---

### 8.4 Step 3 — the Interface Adapters (controller + ORM repository)

On the server the layer splits into two familiar shapes. The **controller** turns an HTTP request into a
use-case call and a use-case result into an HTTP response — it decides nothing:

```ts
// adapters/controllers/UserController.ts
import { Request, Response } from 'express'
import { createUser } from '@/composition/container'
import { userPresenter } from '@/adapters/presenters/userPresenter'

export async function postUser(req: Request, res: Response) {
  const user = await createUser(req.body)      // call the use case
  res.status(201).json(userPresenter(user))    // present the entity as a response body
}
```

The **repository** implements the *same port* the frontend gateway did, but over the ORM instead of HTTP —
and it maps the raw ORM row into a `User` entity at the boundary, so nothing inward sees a database record:

```ts
// adapters/repositories/PrismaUserRepository.ts
import { PrismaClient } from '@prisma/client'
import { UserRepository } from '@/usecases/ports/UserRepository'
import { User } from '@/entities/User'

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly db: PrismaClient) {}

  async create(payload: { firstName: string; lastName: string; email: string }): Promise<User> {
    const row = await this.db.user.create({
      data: { first_name: payload.firstName, last_name: payload.lastName, email: payload.email },
    })
    return new User(row.id, row.first_name, row.last_name, row.email, row.is_active)  // map at the boundary
  }
}
```

This is the **Repository** pattern in its original setting — mediating between the domain and the data-mapping
layer, "acting like an in-memory collection of domain objects" [Fowler 2002]. Because it satisfies the port,
the use case is oblivious to the fact that a database exists at all.

---

### 8.5 Step 4 — Frameworks & Drivers + the Composition Root

The outermost circle is the Express app and the ORM client — pure detail. The Composition Root is the one
place that wires the concrete ORM repository into the use case and mounts the controller:

```ts
// composition/container.ts — names both the adapter and the use case
import { PrismaClient } from '@prisma/client'
import { PrismaUserRepository } from '@/adapters/repositories/PrismaUserRepository'
import { makeCreateUser } from '@/usecases/CreateUser'

const db = new PrismaClient()
const userRepository = new PrismaUserRepository(db)
export const createUser = makeCreateUser({ userRepository })
```

```ts
// frameworks/http/server.ts
import express from 'express'
import { postUser } from '@/adapters/controllers/UserController'

const app = express()
app.use(express.json())
app.post('/users', postUser)   // the framework knows only the controller
app.listen(3000)
```

---

### 8.6 The whole flow, in mirror image

Compare this to the frontend flow in [§4.5](4-building-a-feature.md#45-the-whole-flow). It is the *same line*,
reflected — the request enters from the outside and travels inward to the core, then the result travels back
out:

```
HTTP request → UserController → createUser (Use Case) → PrismaUserRepository (Adapter) → ORM → Database
   framework      translation        application rule          translation              driver   detail
```

The single, load-bearing observation: **`entities/User.ts`, `usecases/ports/UserRepository.ts`, and
`usecases/CreateUser.ts` are identical to their frontend counterparts.** The only files that differ between
the two applications are the adapters and the frameworks — the outer two circles. That is not a coincidence or
a nicety; it is the *definition* of the architecture working. When the business rules of a system are the same
whether you reach them through a browser store or an HTTP controller, you have protected what matters from the
technology that delivers it — on both sides of the wire [Martin 2017; Cockburn 2005].

---

Back to the **[Clean Architecture index](README.md)** · See the full **[References](references.md)**.
