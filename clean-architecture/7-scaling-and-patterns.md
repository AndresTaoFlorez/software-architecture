> **[Clean Architecture](README.md)** › Scaling: Startup to Enterprise. Full reference list: [References](references.md).

## 7. Scaling: Startup to Enterprise

Everything up to this page describes an architecture that is correct at *any* size. This page is about what
changes as the codebase and the team around it grow. The reassuring thesis first:

> **The four circles never change. What changes is how dependencies are *wired* and how the code is
> *partitioned* — and both change in response to headcount and codebase size, not to taste.**

Entities, Use Cases, Interface Adapters, and Frameworks & Drivers stay exactly as defined in
[§2](2-the-four-layers.md) at every phase below. A 500-engineer org and a solo founder draw the same four
circles. The difference is mechanical: *how the adapter gets injected into the use case*, and *where the
folder boundaries fall*.

One idea governs the whole section — **Conway's Law**: "organizations design systems that mirror their own
communication structure" [Conway 1968]. As teams multiply, the architecture *will* come to mirror the org
chart whether you plan it or not. Each phase is about choosing those seams deliberately before the org forces
accidental ones.

---

### 7.1 The four growth phases

| Phase | Team | Wiring mechanism | Partitioning |
|-------|------|------------------|--------------|
| 1 · Startup | 1–10 | Manual DI in a Composition Root | Folders **by layer** |
| 2 · Scale-Up | 10–50 | DI container (declarative) | Folders **by layer** |
| 3 · Growth | 50–200 | Container per feature | Folders **by feature** (monorepo) |
| 4 · Enterprise | 200+ | Per-context composition | **Bounded contexts** / micro-frontends |

The thresholds are signals, not laws — a disciplined 30-person team may stay happily in Phase 1. Use the
decision tree in [§7.3](#73-the-scaling-decision-tree) and the red flags in [§7.4](#74-red-flags) to locate
yourself, not the headcount alone.

**Phase 1 — Startup.** This guide is written for Phase 1. Dependencies are assembled by hand in one
[Composition Root](6-composition-and-di.md), the only place that names both a concrete adapter and the use
case it feeds. Simple, explicit, sufficient until the wiring file itself becomes a bottleneck.

**Phase 2 — Scale-Up.** The circles and folders are unchanged; only the *wiring* becomes declarative — a DI
container (InversifyJS, tsyringe) resolves the graph instead of you hand-ordering it. It is still the
Composition Root, just automated. See [§6.3](6-composition-and-di.md#63-when-the-wiring-grows-a-di-container).

**Phase 3 — Growth.** The dominant axis of change is now the **feature**, not the layer. Partition by feature
first; let each feature own its own four-layer slice; reserve a `shared/` space for the genuinely
cross-cutting:

```
libs/
├── features/
│   ├── auth/
│   │   ├── entities/  ├── usecases/  ├── adapters/  └── frameworks/
│   └── orders/
│       ├── entities/  ├── usecases/  ├── adapters/  └── frameworks/
└── shared/
    ├── entities/     (cross-feature entities, value objects)
    └── http/         (the one HTTP client, interceptors)
apps/
├── web/    └── admin/
```

A monorepo tool (Nx, Turborepo) makes these boundaries *enforceable*: `auth` can be forbidden by lint rule
from importing `orders/adapters`, so the Dependency Rule of [§3.3](3-project-structure.md#33-imports-as-a-lint-target)
is checked by CI, not by reviewer goodwill. Each feature is a small Clean slice; the build graph guards the
seams.

**Phase 4 — Enterprise.** Past a couple hundred engineers the bottleneck is **coordination**, not code. Each
domain team owns a complete **bounded context** [Evans 2003] — its own four circles, its own deploy cadence,
its own data — communicating with other contexts only through explicit contracts (typed APIs or published
events), never shared internal state. On the frontend this often materializes as micro-frontends. The Onion
guide develops this phase — Team Topologies, micro-frontends, contracts as the only coupling — in full at
[§9.5](../onion-architecture/6-scaling.md#95-phase-4-enterprise-bounded-contexts-and-micro-frontends); the
analysis is identical under either name.

---

### 7.2 What does *not* change

At every phase, the inner two circles are untouched. Entities remain plain classes; use cases remain factories
that depend on ports. The backend guide in [§8](8-clean-on-the-backend.md) is really Phase-1 Clean applied to a
service — and a microservice architecture is Phase-4 Clean where each service is its own set of four circles
with hardened borders. **Scaling never dilutes the core; it only re-draws the outer seams.**

---

### 7.3 The scaling decision tree

```
Are you 1–10 engineers and is hand-wiring still painless?
  └─ YES → Phase 1. Keep the manual Composition Root. Do not add a container yet.
  └─ NO ↓
Are you 10–50 engineers, one shared codebase, wiring getting unwieldy?
  └─ YES → Phase 2. Introduce a DI container. Keep folders by layer.
  └─ NO ↓
Are you 50–200 engineers, teams owning features, layers fighting each other?
  └─ YES → Phase 3. Re-partition by feature in a monorepo with enforced boundaries.
  └─ NO ↓
Are you 200+ engineers where coordination, not code, is the bottleneck?
  └─ YES → Phase 4. Bounded contexts + micro-frontends/microservices, contracts as the only coupling.
```

Resist skipping ahead. A DI container in a three-person startup, or micro-frontends at fifty engineers, buys
coordination machinery you are not yet paying the cost that would justify — premature scaling is its own
failure mode.

---

### 7.4 Red flags

Concrete signals that you are operating in one phase but need the next phase's tools:

- **Leaving Phase 1:** the Composition Root is hundreds of lines; ordering dependencies by hand causes bugs;
  new hires can't find where things are wired.
- **Leaving Phase 2:** container config exceeds ~500 lines; one "god layer" (usually `entities/` or a shared
  `services/`) is many times larger than the rest; teams routinely break each other's tests in one `src/`.
- **Leaving Phase 3:** feature boundaries blur; features import each other's internals instead of contracts;
  the monorepo task graph is slow because nothing is truly isolated.
- **Leaving Phase 4 (the org, not the code):** coordination overhead exceeds ~30% of a sprint. The fix here is
  organizational design, not another architectural layer — the clearest sign you have reached the limit of
  what architecture alone can solve.

A pragmatic boundary leak that is invisible at ten engineers can be intolerable at two hundred; closing it
behind a port is exactly the kind of debt each phase transition pays down deliberately rather than all at once.

---

Next: **[Clean Architecture on the Backend](8-clean-on-the-backend.md)** — the same four circles on the server,
end-to-end.
