# Software Architecture: Clean & Onion

Two architectural models for building maintainable applications. Both enforce the same core principle: **dependencies point inward, protecting business rules from volatile details.** Choose one, or understand both.

---

## Quick Comparison

|  | **Clean Architecture** | **Onion Architecture** |
|---|---|---|
| **Focus** | The Dependency Rule—entities, use cases, details | Concentric rings—visualizing inward dependencies |
| **Structure** | Three layers of increasing abstraction (entities → use cases → details) | Four concentric rings (Domain → Application → Infrastructure → Presentation) |
| **Originator** | Robert C. Martin, 2012 | Jeffrey Palermo, 2008 |
| **Best for** | Understanding the principle and how layers interlock | Visualizing the architecture and feature organization |

---

## Choose Your Path

### [Clean Architecture](./clean-architecture)

Start here if you want to understand the **Dependency Rule** and how it shapes code. Learn how entities stay independent, how use cases orchestrate them, and why frameworks and databases are "details." Includes dependency injection, composition roots, and scaling decisions.

**Sections:**
- The Dependency Rule
- Entities and Use Cases
- Testing strategies
- Composition and dependency injection
- References and further reading

### [Onion Architecture](./onion-architecture)

Start here if you think in **visualizations and rings**. Learn why the four layers form an onion, how dependencies spiral inward, and how to organize code and teams around that structure. Includes advanced patterns, CRDT sync, optimistic updates, and feature-based organization.

**Sections:**
- The Rings and Why They Matter
- Inward Dependencies
- Testing per ring
- Advanced patterns (CRDT, optimistic updates, feature org)
- Styling and animation in the Presentation ring
- References and further reading

---

## How They Relate

Both models enforce the same rule: inner layers depend on nothing, outer layers depend on inner ones. The only difference is framing: Clean Architecture emphasizes **what each layer is**, Onion Architecture emphasizes **where each layer sits**. The code looks identical either way.

---

## Supplementary Resources

- **[Visual Testing Harness](./scraper)** — Playwright + TypeScript tool for verifying demo sites and capturing architecture snapshots
- **[GitHub](https://github.com/AndresTaoFlorez/onion-architecture)** — Live demos and implementations
