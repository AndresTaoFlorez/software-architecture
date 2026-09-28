> **[Onion Architecture](README.md)** › Evolution & Scaling.

# 9. Evolution and Scaling

[Onion Architecture](../GLOSSARY.md#onion-architecture) does not imply a fixed sequence from folders to [DI containers](../GLOSSARY.md#di-container) to [monorepos](../GLOSSARY.md#monorepo) to [microfrontends](../GLOSSARY.md#microfrontend).

The original Onion guidance is about protecting a domain model and externalizing infrastructure. Scaling decisions should respond to actual coupling, ownership, deployment and runtime forces.

The canonical [repository](../GLOSSARY.md#repository) guidance is:

**[Architecture Evolution and Scaling](../foundations/evolution-and-scaling.md)**

## Onion-specific notes

### Preserve inward dependencies as modules evolve

A [Domain](../GLOSSARY.md#domain)/[Application](../GLOSSARY.md#application-layer) boundary can remain stable while [Infrastructure](../GLOSSARY.md#infrastructure) or [Presentation](../GLOSSARY.md#presentation-layer) is reorganized.

### Do not equate organization size with architecture

A 200-person organization can have several simple systems; a small team can operate one highly complex distributed system.

Headcount is context, not an architecture [selector](../GLOSSARY.md#selector).

### Bounded contexts are not a "phase four"

A [bounded context](../GLOSSARY.md#bounded-context) is a semantic/model boundary. It may exist inside a [modular monolith](../GLOSSARY.md#modular-monolith) and does not imply [microservices](../GLOSSARY.md#microservice).

### Microfrontends are not the enterprise form of Onion

They are a delivery/ownership technique for frontend systems. Use them only when independent ownership/deployment benefits justify the runtime and UX integration costs.

### Close boundary leaks because of risk, not age

If [Presentation](../GLOSSARY.md#presentation-layer) reaches directly into [Infrastructure](../GLOSSARY.md#infrastructure), decide whether to close that boundary based on:

- volatility;
- testability;
- coupling;
- security;
- reuse;
- change frequency.

Do not tolerate or remove a leak merely because the project is in a supposed "phase".

## Sources

- Jeffrey Palermo, [Onion Architecture](../GLOSSARY.md#onion-architecture) series: https://jeffreypalermo.com/2008/07/
- Martin Fowler, "Monolith First": https://martinfowler.com/bliki/MonolithFirst.html
- Team Topologies, Key Concepts: https://teamtopologies.com/key-concepts
- Cam Jackson, "Micro Frontends": https://martinfowler.com/articles/micro-frontends.html
