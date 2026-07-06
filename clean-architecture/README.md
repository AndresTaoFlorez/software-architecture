# Clean Architecture — Frontend & Backend

> The same goal as every good architecture — protect business rules from volatile details — expressed
> through Robert C. Martin's **Dependency Rule** and his four concentric circles: Entities, Use Cases,
> Interface Adapters, and Frameworks & Drivers. This guide takes you from the one rule that defines the
> style, through the folder structure and a feature built end-to-end, to testing, wiring, scaling, and the
> same architecture on the **backend**. Every prescriptive claim is tied to a source in
> [References](references.md).

← Back to [architecture overview](../README.md) · Compare with the [Onion Architecture guide](../onion-architecture)

---

## The four layers, defined

Clean Architecture divides a system into four circles. Each has one responsibility and one thing it is
forbidden to do. The whole style is these four definitions plus a single rule about the arrows between them.

| Layer | Responsibility | Must **not** | Frontend form | Backend form |
|---|---|---|---|---|
| **1 · Entities** (core) | Enterprise-wide business rules and invariants — true with or without this app | Import a framework, do I/O, know a UI or DB exists | Plain `User` / `Order` classes with getters | *Identical* — the same plain classes |
| **2 · Use Cases** | Application-specific rules; orchestrate one operation via ports | Render, call HTTP/SQL directly, name a concrete adapter | `createUser` interactor | `CreateUserService` interactor |
| **3 · Interface Adapters** | Translate between the core's shapes and the outside world | Contain business rules | Gateways/repositories, presenters, stores | Controllers, repositories over an ORM, presenters |
| **4 · Frameworks & Drivers** | The volatile details, kept at the edge | Be depended on by any inner layer | Vue/React, HTTP client, browser storage | Express/NestJS, Postgres, Prisma/TypeORM |

The two inner layers (**Entities** + **Use Cases**) are where the design effort belongs — they hold the
business. The two outer layers (**Interface Adapters** + **Frameworks & Drivers**) are deliberately thin:
they only translate and transport. **Entities are literally the same code on the frontend and the backend;**
only the outer layers differ, which is the whole point of the style — see
[Clean Architecture on the Backend](8-clean-on-the-backend.md).

---

## The Idea in One Picture

Source-code dependencies may point in **one direction only — inward** [Martin 2012].

```
        ┌─────────────────────────────────────────┐
        │  Frameworks & Drivers                    │   the web, the DB, the UI toolkit — details
        │   ┌─────────────────────────────────┐    │
        │   │  Interface Adapters             │    │   controllers, presenters, gateways
        │   │   ┌─────────────────────────┐   │    │
        │   │   │  Use Cases              │   │    │   application-specific business rules
        │   │   │   ┌─────────────────┐   │   │    │
        │   │   │   │  Entities       │   │   │    │   enterprise-wide business rules
        │   │   │   └─────────────────┘   │   │    │
        │   │   └─────────────────────────┘   │    │
        │   └─────────────────────────────────┘    │
        └─────────────────────────────────────────┘
                    dependencies point inward  ►
```

The outer two circles map onto a frontend's **Infrastructure** and **Presentation**, and onto a backend's
**Interface** and **Infrastructure**; the inner two map onto **Domain** and **Application** on both. The
names differ from the [Onion guide](../onion-architecture); the rule and the resulting code are identical.

---

## Learning path

Read the guide in order — each page is a consequence of the one before it.

1. **[The Dependency Rule](1-the-dependency-rule.md)** — the one law that makes the architecture clean.
   *Start here; everything else follows from it.*
2. **[The Four Layers](2-the-four-layers.md)** — each circle in depth: responsibility, what lives there,
   what it must not do, and a worked example.
3. **[Project Structure & Conventions](3-project-structure.md)** — the folder layout, naming, and import
   boundaries that make the rule visible on disk and enforceable in CI — plus how to structure the
   Presentation UI itself: components grouped by feature, and where styles and animations live.
4. **[Building a Feature End-to-End](4-building-a-feature.md)** — a getting-started walkthrough: create
   "create user" from the core outward, wiring all four layers into a working flow.
5. **[Testing in Clean Architecture](5-testing-in-clean.md)** — the Test Boundary; a test is just another
   adapter, and why the inner layers are trivial to test.
6. **[Composition & Dependency Injection](6-composition-and-di.md)** — the Composition Root, the one place
   allowed to name both a port and its concrete adapter.
7. **[Scaling: Startup to Enterprise](7-scaling-and-patterns.md)** — how partitioning and wiring evolve as
   the codebase and team grow, plus the red flags that say it's time.
8. **[Clean Architecture on the Backend](8-clean-on-the-backend.md)** — the same four layers on the server:
   controllers, application services, repositories over an ORM, and a backend feature end-to-end.
- **[References](references.md)** — every cited source.

**Just want the shortest path to building?** Read §1 → §2 → §3 → §4. That is enough to structure a robust
project. §5–§8 deepen it once the core is in place.
