# Architectural Styles

After tracing the [TypeScript ticket](../backend/2-typescript-first-boundaries.md), compare the questions these styles ask:

- [Layered](layered-architecture/README.md): which kinds of work should be separated, and which layers may use others?
- [Hexagonal / Ports & Adapters](hexagonal-architecture/README.md): which interactions connect the application to replaceable external mechanisms?
- [Clean](clean-architecture/README.md): which levels of policy should remain independent of technical details?
- [Onion](onion-architecture/README.md): how does an independent domain model stay central?

Their constraints can overlap. They do not prescribe identical models or this handbook's exact folders.

The [backend comparison](../backend/5-architectural-styles-with-nestjs.md) applies all four to one design. The [frontend integration](../frontend/ports-and-adapters.md) applies Hexagonal to a browser client.

[Architecture](../README.md)
