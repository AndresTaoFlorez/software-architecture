# Clean Architecture — Frontend & Backend

> Robert C. Martin's framing for separating policy from details through a single durable constraint: **source-code dependencies point inward**.

← [Architecture overview](../README.md) · [Foundations](../foundations/README.md) · [Frontend architecture](../frontend/README.md) · [Onion Architecture](../onion-architecture)

---

## What Clean Architecture specifies

Martin's canonical diagram uses four concentric circles:

1. **Entities** — enterprise/business rules.
2. **Use Cases** — application-specific policy.
3. **Interface Adapters** — translation between inner policy and external representations.
4. **Frameworks & Drivers** — volatile mechanisms such as UI frameworks, databases and web servers.

The four circles are **schematic, not a mandatory number of folders**. Martin explicitly notes that an application may need more than four circles. The rule that survives different decompositions is the Dependency Rule.

```text
Frameworks & Drivers
        |
        v
Interface Adapters
        |
        v
Use Cases
        |
        v
Entities
```

Source dependencies point toward higher-level policy.

## A practical project mapping

Many TypeScript projects use a vocabulary closer to:

```text
domain
application
infrastructure
presentation
composition
```

That mapping is useful, but it is a **project convention**, not a literal renaming mandated by Clean Architecture.

A typical dependency policy is:

| Area | Responsibility | Allowed inward dependencies |
| --- | --- | --- |
| Domain | business concepts/invariants | Domain |
| Application | use cases, application contracts, ports | Application + Domain |
| Infrastructure | concrete I/O adapters, DTO mapping, storage/SDKs | Infrastructure + Application + Domain |
| Presentation | rendering, interaction, view state and UI adapters | Presentation + Application |
| Composition | constructs the executable graph | may know all concrete outer details needed to assemble the app |

See **[Dependency Boundaries](../foundations/dependency-boundaries.md)** for the reusable rule.

## Frontend and backend are not required to share code

Clean Architecture does **not** require a frontend and backend to have identical Entities or Use Cases.

They may share domain concepts when:

- both truly participate in the same bounded context;
- the rules are valid on both sides;
- sharing does not create deployment or ownership coupling.

They may also have different models. A backend often owns authoritative invariants and transactional workflows; a frontend often owns view-oriented state, interaction workflows and application commands appropriate to that client.

The architectural requirement is dependency direction, not source-file identity.

## Clean vs. Onion

Clean and Onion strongly overlap:

- business/domain policy is protected at the center;
- infrastructure stays outside;
- dependencies point inward;
- dependency inversion is used at boundaries.

They are **related architectural framings, not synonyms**. Terminology, boundary emphasis and practical decomposition can differ.

## Learning path

1. **[The Dependency Rule](1-the-dependency-rule.md)**
2. **[The Four Layers](2-the-four-layers.md)**
3. **[Project Structure & Conventions](3-project-structure.md)**
4. **[Building a Feature End-to-End](4-building-a-feature.md)**
5. **[Testing in Clean Architecture](5-testing-in-clean.md)**
6. **[Composition & Dependency Injection](6-composition-and-di.md)**
7. **[Scaling & Patterns](7-scaling-and-patterns.md)**
8. **[Clean Architecture on the Backend](8-clean-on-the-backend.md)**
9. **[References](references.md)**

For modern frontend-internal organization — feature ownership, ViewModel/public hooks, Redux boundaries and Panda CSS — use **[frontend/](../frontend/README.md)**. Those practices can live inside Clean Architecture but are not part of Clean Architecture itself.

## Sources

- Robert C. Martin, "The Clean Architecture" (2012): https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html
- Robert C. Martin, *Clean Architecture* (2017)
