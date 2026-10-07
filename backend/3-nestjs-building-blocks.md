# 3. NestJS Building Blocks

← [Plain TypeScript](2-typescript-first-boundaries.md) · [Backend path](README.md) · Next: [Complete Nest wiring](4-create-ticket-with-nestjs.md)

## 1. Register the functions we already understand

Our plain handler can parse and invoke creation. Chapter 2's Node example manually matches the method/path, invokes a [route handler](../GLOSSARY.md#route-handler) and serializes its response. Nest registers that relationship and supplies the repeated HTTP plumbing. A **decorator** such as `@Post()` attaches metadata that Nest reads to register framework behavior; it does not create ticket policy.

This routing excerpt assumes the creation operation, a hypothetical read function and the parser have been supplied. Imports, dependency registration and result/error mapping are omitted; chapter 4 provides the complete creation controller. Retrieval is **not implemented** in the canonical feature:

```ts
@Controller('tickets')
export class TicketsController {
  constructor(
    private readonly createTicket: CreateTicket,
    private readonly readTicket: (id: string) => Promise<unknown>,
  ) {}

  @Post()
  create(@Body() body: unknown) {
    return this.createTicket.execute(parseCreateTicketRequest(body))
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.readTicket(id)
  }
}
```

`@Controller('tickets')` contributes the `/tickets` path prefix. `@Post()` contributes POST with no further path, registering the route that selects `create()` for `POST /tickets`; `@Get(':id')` registers a different route to `findOne()`. Thus one [Controller](../GLOSSARY.md#controller) class groups two [route handlers](../GLOSSARY.md#route-handler) exposing two endpoints. The endpoint is the public method/path operation and its request/response contract, not a separate file. `CreateTicket` remains the separate [Application](../GLOSSARY.md#application-layer) [use case](../GLOSSARY.md#use-case), and `Ticket` the [Domain entity](../GLOSSARY.md#domain-entity). `@Body()` supplies decoded body data; it does not prove the shape. Nest serializes returned objects, and successful POST defaults to `201`. The raw application result above is explanatory, not the final API representation. [Controller source](https://docs.nestjs.com/controllers).

## 2. Replace repetitive construction, not business ownership

Previously we wrote `new CreateTicket(repository, makeId)`. When many objects need collaborators, Nest can assemble registered objects and manage their lifetimes. This assembler is its **[dependency injection container](../GLOSSARY.md#di-container)**. A registered dependency is a **[NestJS provider](../GLOSSARY.md#nestjs-provider)**: a class, value or factory result managed by that container. An [Application](../GLOSSARY.md#application-layer) [use case](../GLOSSARY.md#use-case), persistence implementation and technical helper can all be providers without becoming one architectural layer. [Provider source](https://docs.nestjs.com/providers).

An interface is erased by TypeScript, so Nest cannot look up a runtime value called `TicketRepository`. Give the binding an actual runtime key, an **injection token**. We use a Symbol:

```ts
// composition/tokens/ticket.tokens.ts
export const TICKET_REPOSITORY = Symbol('TICKET_REPOSITORY')
```

All registrations must import this **same Symbol value**; another `Symbol('TICKET_REPOSITORY')` has a different identity. A string is also supported but can collide. An abstract class can be a runtime token and a type together, at the cost of introducing a runtime class into the contract. A Symbol keeps the plain interface separate and the framework-facing name in composition.

Custom provider excerpts, importing the canonical plain classes/types:

```ts
{ provide: TICKET_REPOSITORY, useClass: InMemoryTicketRepository }
```

This tells Nest which class to instantiate for that key. The memory class has no dependencies, so it needs no decorator metadata. When construction needs explicit arguments, a **factory provider** supplies them:

```ts
{
  provide: CreateTicket,
  inject: [TICKET_REPOSITORY],
  useFactory: (tickets: TicketRepository) => new CreateTicket(tickets, randomUUID),
}
```

Nest resolves the `inject` keys and passes the objects to the factory in that order. `randomUUID` comes from `node:crypto`. `CreateTicket` itself is a runtime class token; the controller's explicit `@Inject(CreateTicket)` avoids relying on inferred constructor metadata. Chapter 4 puts these entries into a module. [Custom provider source](https://docs.nestjs.com/fundamentals/custom-providers).

`@Injectable()` makes a class participate in Nest's injection metadata conventions. Decorating [Application](../GLOSSARY.md#application-layer) can be convenient, but creates a source dependency on `@nestjs/common`. Our factories preserve plain [Domain](../GLOSSARY.md#domain)/[Application](../GLOSSARY.md#application-layer) classes. Neither approach makes `@Injectable()` an architecture, and registration is still needed. [DI](../GLOSSARY.md#dependency-injection-di) supplies objects; [DIP](../GLOSSARY.md#dependency-inversion-principle-dip) governs what the consumer's source code depends on, as chapter 2 demonstrated.

## 3. “Service” does not tell you its responsibility

Suppose `TicketsService` validates subjects, sends emails, reads database rows and formats HTTP errors. Its name gives no way to decide which rule belongs where. Nest can manage that class, but it cannot correct its mixed ownership.

| Meaning of service | Ticket example | Owns | Does not imply |
| --- | --- | --- | --- |
| Generic Nest class named `SomethingService` | `TicketsService` | whatever its author implemented | a business layer or a good boundary |
| [Application Service](../GLOSSARY.md#application-service) | `CreateTicket` | workflow using ticket rules and persistence | HTTP parsing or SQL ownership |
| [Domain Service](../GLOSSARY.md#domain-service) | a future assignment policy spanning ticket and analyst facts | business behavior that does not naturally belong to one entity | a database query or need for Nest |
| [Infrastructure](../GLOSSARY.md#infrastructure) service/client | a database client or email sender | technical communication | authority over valid ticket state |

The current subject rule fits `Ticket`; no [Domain Service](../GLOSSARY.md#domain-service) is needed. Prefer intent-specific operations like `CreateTicket`, `AssignTicket` or `EscalateTicket` when those requirements exist. “Service = business logic” and “Module + [Controller](../GLOSSARY.md#controller) + Service + Repository = architecture” both hide dependency and ownership decisions. [Fowler's Service Layer](https://martinfowler.com/eaaCatalog/serviceLayer.html) describes application operations, while [Nest providers](https://docs.nestjs.com/providers) describe container-managed dependencies.

## 4. Organize the framework graph with modules

The container needs to know which dependencies are visible to which consumers. A class decorated with `@Module()` supplies that registration metadata. A **[NestJS Module](../GLOSSARY.md#nestjs-module)** groups framework registrations:

| Metadata field | What it does for Tickets |
| --- | --- |
| `controllers` | registers `TicketsController` for incoming HTTP operations |
| `providers` | registers the repository binding, operation factory and other local dependencies |
| `imports` | brings in modules exposing dependencies this module needs |
| `exports` | exposes selected providers to importing modules |

The linked registrations form a **module graph**. Module encapsulation controls container visibility; it does not prevent a TypeScript file from importing another feature's internal file. Keep `exports` narrow and enforce source imports separately. A [Nest Module](../GLOSSARY.md#nestjs-module) is neither an architectural layer, automatically a [bounded context](../GLOSSARY.md#bounded-context) (an agreed business model scope), nor automatically a feature boundary. It can align with such boundaries by design. [Module source](https://docs.nestjs.com/modules).

## 5. Put each repeated request concern at its actual hook

Start with the problem, then use the smallest function, then bind it to Nest. These are optional **independent excerpts**, not additional requirements of the first create-ticket implementation. Imports and binding examples are provided where necessary; they are not a complete authentication or logging subsystem.

### Guard and Pipe answer different questions

Suppose ticket creation now requires an authenticated caller. Consider this one request; a Bearer header contains a credential that established authentication code must verify before supplying a trusted `user`:

```http
POST /tickets HTTP/1.1
Authorization: Bearer ...
Content-Type: application/json

{"subject":"Invoice download fails","description":"PDF download returns an error for INV-42."}
```

The [plain TypeScript access wrapper](2-typescript-first-boundaries.md#check-access-before-processing-the-argument) already shows the mechanism: `if (!context.user)` stops the call; otherwise the existing handler parses the argument, invokes the [use case](../GLOSSARY.md#use-case) and maps the result. Nest gives access and argument processing separate hooks:

| Code | Question / decision | Owner |
| --- | --- | --- |
| `AuthenticatedGuard` | **May this caller invoke this selected operation?** Here, require an already verified user. A different policy could check permissions or tenant membership. | [Presentation](../GLOSSARY.md#presentation-layer) access decision; verified identity comes from authentication integration |
| `CreateTicketPipe` / `parseCreateTicketRequest` | **Can this handler argument be parsed, validated or transformed into the expected transport input?** Here, require an object with subject/description strings. Other Pipes can convert route arguments. | [Presentation](../GLOSSARY.md#presentation-layer) argument processing |
| `TicketsController.create()` | Invoke `CreateTicket` with the parsed command and map its result to HTTP. | [Presentation](../GLOSSARY.md#presentation-layer) [route handler](../GLOSSARY.md#route-handler) |
| `CreateTicket.execute()` | Coordinate ticket creation, await persistence and return a plain result. | [Application](../GLOSSARY.md#application-layer) [use case](../GLOSSARY.md#use-case) |
| `Ticket.create()` | **Is this valid business state?** Normalize/check the subject and assign the authoritative initial status. Future transition rules would also belong here, but are not implemented. | [Domain entity](../GLOSSARY.md#domain-entity) |

A body with valid strings does not establish identity. An authenticated caller can submit `{ subject: 17 }` and fail the Pipe, or a blank subject string and fail [Domain](../GLOSSARY.md#domain) after the Pipe accepts its shape. Guard and Pipe are therefore separate decisions. Neither becomes the owner of ticket rules.

Solid arrows below show **simplified execution order**, not imports or claims that one hook directly calls the next. The server has already selected the route. This view omits [middleware](../GLOSSARY.md#middleware), interceptors, filters, persistence and the return path to focus on access, arguments and business validity:

```mermaid
flowchart LR
    R["POST /tickets / selected request"] -->|"check access"| G["AuthenticatedGuard / Guard"]
    G -->|"allowed"| P["CreateTicketPipe / Pipe"]
    P -->|"parsed argument"| H["TicketsController.create / handler"]
    H -->|"execute command"| A["CreateTicket.execute / use case"]
    A -->|"create valid state"| D["Ticket.create / entity"]
    classDef step fill:#25313b,stroke:#82909e,color:#e2e8ef
    class R,G,P,H,A,D step
```

Nest runs Guards before Pipes and calls the handler only after those checks permit it. The [official lifecycle](https://docs.nestjs.com/faq/request-lifecycle), [Guard](https://docs.nestjs.com/guards) and [Pipe](https://docs.nestjs.com/pipes) documentation explain the hooks; [chapter 1 shows the wider request lifecycle](1-http-request-to-business-operation.md#4-framework-lifecycle-is-a-different-view). The examples below bind these responsibilities to Nest without adding authentication protocol code.

### Middleware: attach request context early

Logs for one `POST /tickets` need a common identifier. The smallest mechanism is to generate an ID, attach it to request-local context, and continue. **[Middleware](../GLOSSARY.md#middleware)** sees platform request/response objects and `next`; it runs before handler selection. It can terminate a request or pass it on, but lacks the guard's selected-handler context.

```ts
import { randomUUID } from 'node:crypto'
import type { Request, Response, NextFunction } from 'express'

export function requestId(
  req: Request & { requestId?: string }, res: Response, next: NextFunction,
) {
  req.requestId = randomUUID()
  res.setHeader('X-Request-Id', req.requestId)
  next()
}
```

Composition can bind this Express-specific function using `app.use(requestId)` before listening. It generates its own ID rather than trusting an arbitrary client header. A Fastify integration needs its platform's signatures; do not copy Express types inward. This ID is diagnostic context, not ticket identity or authentication. [Middleware source](https://docs.nestjs.com/middleware).

### Guard: decide whether the caller may enter

An unauthenticated caller should not invoke creation. Authentication establishes who the caller is; authorization decides what that caller may do. A small decision could test whether an established authentication mechanism attached a verified identity, called a **principal**. A **[Guard](../GLOSSARY.md#nestjs-guard)** makes such an access decision with Nest's execution context, which identifies the target handler. Do not parse or sign tokens yourself.

```ts
import { Injectable, UnauthorizedException } from '@nestjs/common'
import type { CanActivate, ExecutionContext } from '@nestjs/common'

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<{ user?: { id: string } }>()
    if (!req.user) throw new UnauthorizedException()
    return true
  }
}
```

Bind with `@UseGuards(AuthenticatedGuard)` on the controller/handler and register dependencies in its module. This excerpt **assumes an established authentication integration populated `user` after verification**; it is not a complete security implementation. The generic type on `getRequest` is not validation. Returning false normally yields forbidden (`403`); the explicit exception above communicates unauthenticated (`401`). A tenant permission decision requires verified identity and current policy, not merely a present object. Ticket subject/initial-status [invariants](../GLOSSARY.md#invariant) still belong to [Domain](../GLOSSARY.md#domain); non-HTTP entry points must enforce relevant permissions too. [Guard source](https://docs.nestjs.com/guards).

### Pipe: parse a handler argument

We already have a function that rejects wrong body shapes. A **[Pipe](../GLOSSARY.md#nestjs-pipe)** integrates that parsing/validation/transformation into Nest's handler arguments:

`src/presentation/http/tickets/CreateTicketPipe.ts`:

```ts
import { BadRequestException } from '@nestjs/common'
import type { PipeTransform } from '@nestjs/common'
import { InvalidTicketRequest, parseCreateTicketRequest } from './createTicketRequest'

export class CreateTicketPipe implements PipeTransform {
  transform(value: unknown) {
    try { return parseCreateTicketRequest(value) }
    catch (error) {
      if (error instanceof InvalidTicketRequest) throw new BadRequestException('invalid-request')
      throw error
    }
  }
}
```

The complete handler in chapter 4 binds it with `@Body(new CreateTicketPipe())`. Nest invokes `transform` before that handler, and a rejection prevents the call. The pipe does not save anything or duplicate [Domain](../GLOSSARY.md#domain)'s rules. [Pipe source](https://docs.nestjs.com/pipes).

For a larger [DTO](../GLOSSARY.md#data-transfer-object-dto), Nest's built-in `ValidationPipe` can remove repeated property checks. Its official setup installs **`class-validator`** (checks decorator-declared constraints) and **`class-transformer`** (creates/transforms class instances); runtime class metadata matters because interfaces vanish. Options such as `whitelist`, `forbidNonWhitelisted` and `transform` change acceptance and conversion behavior. Conversion is not proof of business validity. The canonical track keeps the small parser/pipe rather than installing both libraries or stacking schemas. If adopting that convenience, retain the same domain factory and deliberately preserve or revise the documented unknown-field contract. [Verified Nest validation guidance](https://docs.nestjs.com/techniques/validation).

### Interceptor: wrap execution

We want elapsed time whether creation succeeds or fails. Plain TypeScript would record a start time, call the operation and record elapsed time in `finally`. A Nest **[Interceptor](../GLOSSARY.md#nestjs-interceptor)** wraps the remaining handler execution through `next.handle()`, which returns an RxJS Observable (a stream abstraction for results/completion/failure).

```ts
import { Injectable } from '@nestjs/common'
import type { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common'
import { finalize } from 'rxjs/operators'

@Injectable()
export class TimingInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler) {
    const started = performance.now()
    return next.handle().pipe(finalize(() => {
      console.log('Ticket handler elapsed ms:', performance.now() - started)
    }))
  }
}
```

Bind using `@UseInterceptors(TimingInterceptor)`. This measures the wrapped Nest execution, not client network latency or all early [middleware](../GLOSSARY.md#middleware). Logging is illustrative; do not log ticket bodies or sensitive data automatically. An interceptor can transform output, but an indiscriminate wrapper can break an agreed API contract. [Interceptor source](https://docs.nestjs.com/interceptors).

### Exception Filter: represent an uncaught failure

An exception is not intrinsically an HTTP response. A CLI could display it differently. An **[Exception Filter](../GLOSSARY.md#nestjs-exception-filter)** handles uncaught exceptions and maps them at the transport edge. For example, if an operation deliberately throws the application-owned storage error rather than returning our canonical `unavailable` result:

```ts
import { Catch } from '@nestjs/common'
import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common'
import type { Response } from 'express'
import { TicketPersistenceUnavailable } from '../../../application/tickets/ports/TicketRepository'

@Catch(TicketPersistenceUnavailable)
export class TicketStorageFilter implements ExceptionFilter {
  catch(_error: TicketPersistenceUnavailable, host: ArgumentsHost) {
    host.switchToHttp().getResponse<Response>()
      .status(503).json({ error: 'unavailable' })
  }
}
```

Bind with `@UseFilters(new TicketStorageFilter())`. This alternative is Express-specific and illustrates typed exception translation, not a second active error strategy: our canonical operation catches that error into a result, so this filter would **not** see it. Chapter 4 translates results into Nest HTTP exceptions and relies on Nest's built-in exception layer. An unrecognized exception receives a safe `500` through default handling; production needs internal diagnostics. [Filter source](https://docs.nestjs.com/exception-filters).

## 6. Framework hooks versus architecture

The request hooks above belong to [Presentation](../GLOSSARY.md#presentation-layer). `Ticket` still owns business validity, `CreateTicket` still coordinates the [use case](../GLOSSARY.md#use-case), the persistence implementation still talks to storage, and Composition still selects that implementation. Global/controller/handler bindings describe where a hook applies, not the layer it belongs to. Revisit [chapter 1's lifecycle](1-http-request-to-business-operation.md#4-framework-lifecycle-is-a-different-view) to trace ordering separately from application calls.

Next: [Wire these pieces into one ticket capability](4-create-ticket-with-nestjs.md). All official sources are also collected in [References](references.md).
