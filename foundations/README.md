# Architecture Foundations

These documents contain reusable architectural rules that should not be duplicated inside every style guide.

Clean Architecture, Onion Architecture and Ports & Adapters differ in terminology and emphasis, but all can use the same engineering tools: explicit boundaries, dependency inversion, composition at the edge, narrow module APIs, proportional complexity and automated dependency checks.

## Contents

1. **[Dependency boundaries](./dependency-boundaries.md)** — policy vs. detail, allowed dependency direction, data crossing boundaries and when ports are justified.
2. **[Composition Root](./composition-root.md)** — where concrete implementations are assembled, why composition is not a business layer, and why a DI container is optional.
3. **[Module boundaries and public APIs](./module-boundaries-and-public-apis.md)** — feature ownership, internal vs. public modules, barrels, shared code and type ownership.
4. **[Executable architecture](./architecture-testing.md)** — architecture tests, lint rules, dependency graphs and CI enforcement.
5. **[Evolution and scaling](./evolution-and-scaling.md)** — evolve from observable forces rather than headcount, LOC or maturity-stage thresholds.

## Principle before folders

Architecture is not defined by directory names. A project can have folders called `domain`, `application`, `infrastructure` and `presentation` while violating every intended dependency boundary.

Conversely, a system may use different names and still implement the intended dependency structure.

Treat folders as a visible representation of decisions that are enforced by imports and contracts.

## Apply architecture proportionally

Architectural isolation has a cost: more boundaries, mapping, contracts and composition. Palermo explicitly framed Onion Architecture for long-lived business applications and applications with complex behavior, not small websites.

Use the minimum structure that protects meaningful volatility or business policy. Add a port because an external capability must be isolated, not because every class needs an interface.

## Separate semantic and deployment boundaries

A module, bounded context and deployable service are not synonyms.

Prefer discovering stable semantic boundaries before introducing network/process boundaries. Distribution adds failure modes and operational cost; it should be justified independently.
