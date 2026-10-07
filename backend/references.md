# Backend References

← [Backend learning path](README.md)

Official framework/library pages were reviewed on **2026-10-03**. Nest's supplied framework organization and our architectural interpretations are distinguished in [chapter 5](5-architectural-styles-with-nestjs.md#3-does-nestjs-impose-an-architecture). Prisma code deliberately targets the versioned **[ORM](../GLOSSARY.md#orm) 7** API; a different major version needs its own setup/error review.

The layer-first and naming revision was reviewed on **2026-10-07** against the official Nest controller/provider/module/custom-provider and request-hook documentation, TypeScript narrowing/assertion/module guidance, Prisma 7 generation/insert/error documentation, and the original Clean/Onion and Repository sources. Those sources explain mechanisms and responsibilities; the physical hierarchy and filename conventions remain this handbook's choices. Source review does not establish that Nest/Prisma integrations execute correctly.

The terminology follow-up on **2026-10-07** checks Node's standard [HTTP routing](../GLOSSARY.md#http-routing)/response mechanisms, TypeScript `implements`, Nest route registration and Guard-before-Pipe ordering, and Cockburn's interaction/device distinction. The plain access wrapper compiles and runs with the canonical ticket modules; the incomplete Node routing excerpt illustrates platform plumbing and is source-reviewed, not an executed server integration.

## HTTP and TypeScript mechanisms

- [RFC 9110 — HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110.html): request/response, methods, representations, status codes and retry semantics.
- [TypeScript — Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html): runtime checks refine static types.
- [TypeScript — Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#type-assertions): assertions do not validate values at runtime.
- [TypeScript — More on Functions](https://www.typescriptlang.org/docs/handbook/2/functions.html#unknown): unknown input requires checks before use.
- [TypeScript — Modules](https://www.typescriptlang.org/docs/handbook/2/modules.html): source imports/exports and type-only names; an exported entry point is not automatic privacy for other source files.
- [TypeScript — Implements clauses](https://www.typescriptlang.org/docs/handbook/2/classes.html#implements-clauses): compile-time conformance to an interface, not supplied behavior or runtime guarantees.
- [Node.js — HTTP](https://nodejs.org/api/http.html): `createServer`, request method/URL and response `writeHead`/`end`; the example compares paths and serializes JSON without a router library.
- [Node.js — `crypto.randomUUID`](https://nodejs.org/api/crypto.html#cryptorandomuuidoptions): established ID generation at composition.
- [Node.js — Error causes](https://nodejs.org/api/errors.html#errorcause): preserve a technical cause inside an error without exposing it through a plain application result; reviewed 2026-10-04.
- [MDN — JavaScript execution model](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Execution_model): synchronous run-to-completion within one execution agent, the quota simulation's scope; reviewed 2026-10-04.
- [PostgreSQL — Transaction isolation](https://www.postgresql.org/docs/current/transaction-iso.html): a transaction must use concurrency protection appropriate to the required guarantee; reviewed 2026-10-04.

## NestJS mechanisms

| Source | Claim/mechanism used |
| --- | --- |
| [Introduction](https://docs.nestjs.com/) | supplied Angular-inspired framework organization |
| [Controllers](https://docs.nestjs.com/controllers) | route registration, handlers, body arguments and standard responses |
| [Providers](https://docs.nestjs.com/providers) | managed dependencies and registration |
| [Custom providers](https://docs.nestjs.com/fundamentals/custom-providers) | runtime tokens, class/value/factory bindings |
| [Modules](https://docs.nestjs.com/modules) | imports, providers, controllers, exports and visibility |
| [Middleware](https://docs.nestjs.com/middleware) | request/response/next and platform-specific signatures |
| [Guards](https://docs.nestjs.com/guards) | execution context and access decisions |
| [Pipes](https://docs.nestjs.com/pipes) | argument validation/transformation |
| [Interceptors](https://docs.nestjs.com/interceptors) | wrapping Observable execution and result processing |
| [Exception filters](https://docs.nestjs.com/exception-filters) | exception-to-transport handling |
| [Request lifecycle](https://docs.nestjs.com/faq/request-lifecycle) | hook ordering, return unwinding and failure paths |
| [Validation](https://docs.nestjs.com/techniques/validation) | ValidationPipe and class-validator/class-transformer dependencies |
| [Lifecycle events](https://docs.nestjs.com/fundamentals/lifecycle-events) | resource teardown and shutdown hooks |

## Durable persistence illustration

- [Prisma ORM 7 — Client setup](https://www.prisma.io/docs/orm/v7/prisma-client/setup-and-configuration/introduction): PostgreSQL driver [adapter](../GLOSSARY.md#adapter) and configured client.
- [Prisma ORM 7 — Generation](https://www.prisma.io/docs/orm/v7/prisma-client/setup-and-configuration/generating-prisma-client): explicit output location and generated imports.
- [Prisma ORM 7 — CRUD](https://www.prisma.io/docs/orm/v7/prisma-client/queries/crud): record insertion through the client.
- [Prisma ORM 7 — Errors](https://www.prisma.io/docs/orm/v7/reference/error-reference): technical error classification; integration tests must verify deployment-specific behavior.

## Architectural ideas

- [Alistair Cockburn — Hexagonal Architecture (2005)](https://alistair.cockburn.us/hexagonal-architecture/): application inside, device [adapters](../GLOSSARY.md#adapter) outside, purpose-oriented interactions.
- [Robert C. Martin — The Clean Architecture (2012)](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html): inward source dependencies and business/application policy versus mechanisms.
- [Jeffrey Palermo — Onion Architecture, part 1 (2008)](https://jeffreypalermo.com/2008/07/the-onion-architecture-part-1/): domain center and outer infrastructure; links to the original series.
- [Martin Fowler — Presentation Domain Data Layering](https://martinfowler.com/bliki/PresentationDomainDataLayering.html): responsibility separation in a layered system.
- [Martin Fowler — Repository](https://martinfowler.com/eaaCatalog/repository.html): collection-like business-object persistence abstraction.
- [Martin Fowler — Service Layer](https://martinfowler.com/eaaCatalog/serviceLayer.html): application operation boundary and coordination.
- [Mark Seemann — Composition Root (2011)](https://blog.ploeh.dk/2011/07/28/CompositionRoot/): explicit assembly close to the executable entry point.

The subject-length rule, command/result shapes, chosen HTTP failure mapping, Symbol location and folder layout are illustrative product choices or documentation conventions. These sources explain principles and framework behavior, not those exact choices.
