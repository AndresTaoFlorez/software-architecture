> **[Onion Architecture for the Frontend](README.md)** › Scaling: From Startup to Enterprise. Full reference list: [§10 References](README.md#10-references).

## 9. Scaling: From Startup to Enterprise

The preceding sections describe an architecture that is correct at *any* size. This section is about what
changes as the organization around the code grows from one founder to a Figma- or Anthropic-sized engineering
org. The reassuring thesis first:

> **The four layers never change. What changes is how dependencies are *wired* and how the code is
> *partitioned* — and both change in response to headcount and codebase size, not to taste.**

Domain, Application, Infrastructure, and Presentation remain exactly as defined in [§3](1-the-four-layers.md#3-the-four-layers) at
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

The honest boundary leak named in [§3.4](1-the-four-layers.md#34-presentation-outermost) — a store importing `TOKEN_KEY` and
`wsClient` straight from Infrastructure — is a Phase-1 trade-off. It is invisible at ten engineers and
intolerable at two hundred; closing it behind a port is precisely the kind of debt each phase transition pays
down deliberately rather than all at once.

