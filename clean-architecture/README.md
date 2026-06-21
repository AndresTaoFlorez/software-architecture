# Clean Architecture for the Frontend

> The same goal as every good architecture — protect business rules from volatile details — expressed
> through Robert C. Martin's **Dependency Rule** and his four concentric circles: Entities, Use Cases,
> Interface Adapters, and Frameworks & Drivers. Every prescriptive claim is tied to a source in
> [References](references.md).

← Back to [Clean & Onion overview](../README.md) · Compare with the [Onion Architecture guide](../onion-architecture)

---

## Contents

- **[1 · The Dependency Rule](1-the-dependency-rule.md)** — the one law that makes the architecture clean
- **[2 · Entities & Use Cases](2-entities-and-use-cases.md)** — the two inner circles where the business lives
- **[3 · Testing in Clean Architecture](3-testing-in-clean.md)** — the Test Boundary; a test is just another adapter
- **[4 · Composition & Dependency Injection](4-composition-and-di.md)** — the Composition Root and how wiring scales
- **[References](references.md)** — every cited source

---

## The Idea in One Picture

Clean Architecture draws the system as four concentric circles. Source code dependencies may point in
**one direction only — inward** [Martin 2012].

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

- **Entities** — the most general and most stable business rules. They would be true with no application
  around them at all.
- **Use Cases** — application-specific rules that orchestrate entities to carry out one operation.
- **Interface Adapters** — controllers, presenters, and gateways that convert data between the form the
  use cases like and the form the outside world speaks.
- **Frameworks & Drivers** — the web framework, the database, the UI library: pure detail, kept at arm's
  length so they can be swapped without touching the core.

The outer two circles map onto a frontend's **Infrastructure** and **Presentation**; the inner two map
onto its **Domain** and **Application**. The names differ from the [Onion guide](../onion-architecture);
the rule and the resulting code are identical.

---

## Where to Start

Read **[The Dependency Rule](1-the-dependency-rule.md)** first — everything else is a consequence of it.
Then **[Entities & Use Cases](2-entities-and-use-cases.md)** shows what belongs in the protected center,
**[Testing](3-testing-in-clean.md)** shows the dividend the rule pays back, and
**[Composition & DI](4-composition-and-di.md)** shows the one place allowed to break the rule on purpose.
