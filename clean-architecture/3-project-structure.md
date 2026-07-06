> **[Clean Architecture](README.md)** › Project Structure & Conventions. Full reference list: [References](references.md).

## 3. Project Structure & Conventions

The [Dependency Rule](1-the-dependency-rule.md) is a rule about `import` statements, and the
[four layers](2-the-four-layers.md) are the things those imports may cross between. This page makes both
*visible on disk*: a folder layout where the layer of any file is obvious from its path, a small set of
naming conventions, and an import-boundary table you can hand to a linter so the rule is enforced in CI
rather than in code review.

These are portable defaults, not laws — but adopting the same layout across projects keeps every codebase
recognizable, and that recognizability is itself part of the payoff.

---

### 3.1 The folder layout

One top-level folder per layer. The innermost two name *what the application does*; the outer two name *how
it is delivered*. A reader scanning `src/` sees the business first and the technology last — the
"screaming architecture" idea [Martin 2017].

```
src/
├── entities/                 # Layer 1 — the core. No imports out of this folder.
│   ├── User.js               #   PascalCase: entities with identity and behavior
│   ├── Order.js
│   └── errors/
│       └── DomainErrors.js   #   named business-rule violations
│
├── usecases/                 # Layer 2 — application rules. Imports entities + its own ports.
│   ├── ports/                #   interfaces (contracts) the use cases depend on
│   │   └── UserRepository.js #     a PORT: JSDoc @typedef in JS, `interface` in TS
│   ├── CreateUser.js         #   camelCase factory: makeCreateUser({ userRepository })
│   └── FetchUsers.js
│
├── adapters/                 # Layer 3 — translation. Imports usecases + entities. Implements ports.
│   ├── gateways/             #   PascalCase: HttpUserRepository.js (maps JSON → entities)
│   ├── controllers/          #   take an input event, call a use case
│   └── presenters/           #   shape use-case output for display
│
├── frameworks/               # Layer 4 — details. Depended on by nobody inner.
│   ├── http/                 #   client.js, ApiError.js
│   ├── storage/              #   localStorage / IndexedDB wrappers
│   └── ui/                   #   Vue/React components, router (Presentation)
│
└── composition/              # The one place allowed to name both a port and its adapter (see §6)
    └── container.js
```

> **Naming the layers.** This guide uses Martin's circle names (`entities/`, `usecases/`, `adapters/`,
> `frameworks/`). Many teams prefer the Onion/DDD names (`domain/`, `application/`, `infrastructure/`,
> `presentation/`) — the [Onion guide](../onion-architecture/README.md#7-naming--conventions-portable-defaults)
> uses those. **Pick one vocabulary and use it everywhere;** the rule and the resulting code are identical
> under either set of names. The [backend guide](8-clean-on-the-backend.md) shows the same tree on the server.

---

### 3.2 Conventions

- **Path alias.** Map `@` to `src/` so every import is absolute and the layer is always visible in the path
  (`@/entities/...`, `@/usecases/...`). Relative `../../../` chains hide layer crossings — the very thing you
  want to see.
- **File naming.** **PascalCase** for entities, repositories/gateways, and components; **camelCase** for use
  cases, stores, and composables. The case tells you what kind of thing a file is before you open it.
- **Ports live with the use cases that need them,** in `usecases/ports/` — not with the adapters that
  implement them. A port is owned by the layer that *declares the need*, which is what keeps the dependency
  arrow pointing inward.
- **Test placement.** Co-locate tests in `__tests__/` siblings, named `<Unit>.test.js`, mirroring the layer
  they cover (see [§5.5](5-testing-in-clean.md)).
- **One thing per file at the core.** An entity, a use case, or a port per file. Small files at the center
  keep the import graph legible and the boundaries sharp.

---

### 3.3 Imports as a lint target

The whole architecture reduces to a table of which folder may import which. Treat it as the specification a
linter enforces — this is what turns the Dependency Rule from a guideline into a guarantee.

```
✅ adapters/controllers/UserController     imports  usecases/CreateUser        (outer → inner)
✅ usecases/CreateUser                     imports  usecases/ports/UserRepository
✅ usecases/CreateUser                     imports  entities/User
✅ adapters/gateways/HttpUserRepository     imports  entities/User
✅ adapters/gateways/HttpUserRepository     implements usecases/ports/UserRepository

❌ entities/User                            imports  axios                      (core → detail)
❌ usecases/CreateUser                      imports  react / vue / pinia        (use case → framework)
❌ usecases/CreateUser                      imports  adapters/gateways/...      (inner → concrete adapter)
❌ frameworks/ui/LoginView                  imports  frameworks/http/client     (skips the core)
```

A useful heuristic: **the deeper a file sits, the fewer things it is allowed to import.** An entity should
import almost nothing; a framework driver may import anything it likes but must be imported only by adapters
and the Composition Root.

**Make the machine check it.** In a monorepo, Nx and Turborepo enforce module boundaries between projects; in
a single package, an ESLint boundaries rule (`eslint-plugin-boundaries` or `import/no-restricted-paths`) tags
each folder with a layer and forbids the illegal edges above. Wire it into CI and an inward-pointing arrow
that someone reverses by accident fails the build instead of shipping [Nx & Turborepo docs].

```jsonc
// .eslintrc — sketch: entities may not import from any other layer
"import/no-restricted-paths": ["error", { "zones": [
  { "target": "src/entities",  "from": ["src/usecases", "src/adapters", "src/frameworks"] },
  { "target": "src/usecases",  "from": ["src/adapters", "src/frameworks"] },
  { "target": "src/adapters",  "from": ["src/frameworks/ui"] }
]}]
```

---

Next: **[Building a Feature End-to-End](4-building-a-feature.md)** — with the structure in place, build one
feature from the core outward and watch the four layers snap together.
