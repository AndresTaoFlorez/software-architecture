> **[Clean Architecture](README.md)** › The Dependency Rule. Full reference list: [References](references.md).

## 1. The Dependency Rule

Clean Architecture is, at heart, a single rule with a set of consequences. Everything else — the circles,
the ports, the testability — falls out of it.

### 1.1 The four circles

The system is drawn as four concentric circles. The innermost is the most abstract and the most stable;
the outermost is the most concrete and the most volatile [Martin 2017].

![Clean Architecture Diagram by Robert C. Martin (Uncle Bob)](https://blog.cleancoder.com/uncle-bob/images/2012-08-13-the-clean-architecture/CleanArchitecture.jpg)

*Image source: "The Clean Code Blog" by Robert C. Martin (Uncle Bob), August 13, 2012. Original article:
[The Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html).*

From the center outward: **Entities → Use Cases → Interface Adapters → Frameworks & Drivers.** A crucial
point of placement: the database and the web framework are **both outer details**. The database is not a
privileged middle tier the use cases are built "on top of"; it is an outermost driver that *implements*
what the inner circles declare. The use cases sit closer to the core than any technical detail [Martin 2017].

### 1.2 The rule itself

> Source-code dependencies must point only inward, toward higher-level policies. Nothing in an inner
> circle can know anything at all about something in an outer circle [Martin 2012].

Concretely:

- **Entities** depend on nothing.
- **Use Cases** depend only on Entities.
- **Interface Adapters** and **Frameworks & Drivers** depend on the inner circles, never the reverse.

The name of anything declared in an outer circle — a class, a function, a variable, a database table —
must never be mentioned by code in an inner circle. This is the single rule from which every benefit
follows.

### 1.3 Crossing the boundary: Dependency Inversion

The rule raises an obvious tension. A use case must, eventually, read from a database, yet the database
is an outer detail the use case is forbidden to name. The resolution is the **Dependency Inversion
Principle**: high-level modules must not depend on low-level modules; both depend on abstractions
[Martin 2003 (SOLID); Martin 2017].

The use case declares an **interface (a "port")** describing the operation it needs. An outer circle
provides a concrete **implementation (an "adapter")**. At runtime the adapter is injected into the use
case. The *source-code* dependency now points inward — the adapter depends on the port — even though the
*flow of control* moves outward at runtime. This is the ports-and-adapters arrangement of Hexagonal
Architecture, and it is how every boundary in Clean Architecture is crossed [Cockburn 2005].

```
   Use Case defines the port           Interface Adapter implements it
   ─────────────────────────────      ──────────────────────────────
   interface UserRepository  ◄───────  class HttpUserRepository
     fetchAll(): User[]                   (uses the HTTP client, maps JSON → User)

           ▲                                       │
           │ depends on (inward)                   │ implements
           └───────────────────────────────────────┘
```

### 1.4 The rule as a check on imports

The Dependency Rule reduces to a small set of mechanical checks on `import` statements:

```
✅ adapters/controllers/UserController     imports  usecases/CreateUser        (outer → inner)
✅ usecases/CreateUser                     imports  usecases/ports/UserRepository
✅ adapters/gateways/HttpUserRepository     imports  entities/User
✅ adapters/gateways/HttpUserRepository     implements usecases/ports/UserRepository

❌ frameworks/web/LoginView                 imports  frameworks/http/client     (skips the core)
❌ entities/User                            imports  axios                      (entity → detail)
❌ usecases/CreateUser                      imports  react / vue / pinia        (use case → framework)
```

A useful heuristic: **the deeper a file sits, the fewer things it is allowed to import.** An Entity should
import almost nothing. Treat this table as a lint target — an automated import-boundary check (Nx,
Turborepo, or an ESLint boundaries rule) turns the Dependency Rule into a guarantee rather than a
guideline.

### 1.5 Why this matters on the frontend

Frontend stacks are unusually volatile. UI frameworks rise and fall, HTTP clients are replaced, state
libraries are swapped, transports migrate from REST to GraphQL, from polling to WebSocket. Each of these
lives in an outer circle. When business rules are confined to Entities and Use Cases and depend only on
ports, a change of framework or transport becomes a change of *adapters* — not a rewrite of what the
application means. The most stable asset (what the product *does*) is insulated from the least stable one
(the technology it currently *runs on*). That is the entire payoff, and it is largest exactly where churn
is fastest.

---

Next: **[Entities & Use Cases](2-entities-and-use-cases.md)** — what belongs in the two protected inner
circles, and how to keep them pure.
