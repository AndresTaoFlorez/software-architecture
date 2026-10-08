# 3. NestJS Building Blocks

[TypeScript boundaries](2-typescript-first-boundaries.md) · [Backend route](README.md) · Next: [Ticket wiring](4-create-ticket-with-nestjs.md)

## 1. Register the functions we already understand

The [HTTP vocabulary](1-http-request-to-business-operation.md#2-which-function-receives-it) is already established. Nest registers related handlers through decorators. Routing excerpt; application calls and response bodies are omitted:

```ts
import { Controller, Get, Post } from '@nestjs/common'

@Controller('tickets')
export class TicketsController {
  @Post()
  create() { /* invoke creation and translate its result */ }

  @Get(':id')
  findOne() { /* invoke retrieval and translate its result */ }
}
```

The controller prefix combines with each method decorator. Nest serializes returned objects; [chapter 4](4-create-ticket-with-nestjs.md) supplies the creation handler.

## 2. Replace repetitive construction, not business ownership

A **Provider** is a dependency registered for Nest to create or supply. Providers can serve different architectural responsibilities. The container assembles them; it does not choose where ticket rules belong.

Interfaces disappear from JavaScript. Nest therefore needs a runtime lookup key, an **injection token**:

```ts
// src/composition/tokens/ticket.tokens.ts
export const TICKET_REPOSITORY = Symbol('TICKET_REPOSITORY')
```

Registrations import the same Symbol value. These entries replace manual construction:

```ts
const providers = [
  { provide: TICKET_REPOSITORY, useClass: InMemoryTicketRepository },
  {
    provide: CreateTicket,
    inject: [TICKET_REPOSITORY],
    useFactory: (tickets: TicketRepository) => new CreateTicket(tickets, randomUUID),
  },
]
```

Nest resolves the keys and passes the objects to the factory. `CreateTicket` stays plain TypeScript; `@Injectable()` is a metadata convenience for container construction, not proof of an architecture. See [Providers](https://docs.nestjs.com/providers) and [Custom providers](https://docs.nestjs.com/fundamentals/custom-providers).

## 3. “Service” does not tell you its responsibility

A `TicketsService` that validates subjects, queries rows and formats HTTP responses combines decisions that change independently. Such a class is often called a **God Service**; a Controller mixing the same work is a **God Controller**.

| Responsibility | Example |
| --- | --- |
| Entity behavior | `Ticket` checks its own valid subject/state |
| Domain Service | An assignment policy involving ticket and analyst facts |
| Application Service | `CreateTicket` coordinates rules and saving |
| Technical implementation | Prisma persistence or an email client |

An assignment decision belongs to a Domain Service when it is business behavior spanning facts that do not fit one entity. The Application Service loads those facts, asks for the decision and saves the result. Dependencies still point inward. [Fowler — Service Layer](https://martinfowler.com/eaaCatalog/serviceLayer.html).

## 4. Organize the framework graph with modules

`@Module()` provides registration metadata:

| Field | Registers or exposes |
| --- | --- |
| `controllers` | HTTP controllers |
| `providers` | Dependencies available locally |
| `imports` | Modules providing required dependencies |
| `exports` | Providers available to importing modules |

A Nest Module organizes container visibility. Source privacy is a separate [public API concern](../foundations/module-boundaries-and-public-apis.md#9-backend-apis-across-layer-first-capabilities). [Nest — Modules](https://docs.nestjs.com/modules).

## 5. Put each repeated request concern at its actual hook

### Guard and Pipe answer different questions

A caller may be authenticated and still send invalid data. Access and argument processing therefore require separate decisions:

| Piece | Question |
| --- | --- |
| Parser | Can this unknown value become the expected request data? |
| Pipe | How does Nest apply parsing/validation/transformation before the handler? |
| Guard | May this caller reach the handler? |
| Domain | Is the resulting business state valid? |

Solid arrows show simplified execution order, with the Parser called by the Pipe:

```mermaid
flowchart LR
    R["Selected request"] --> G["AuthenticatedGuard / access"]
    G -->|"allowed"| P["CreateTicketPipe / argument"]
    P -->|"calls"| V["parseCreateTicketRequest / Parser"]
    V -->|"checked value via Pipe"| H["TicketsController.create / handler"]
    H --> A["CreateTicket / workflow"]
    A --> D["Ticket / validity"]
    classDef step fill:#25313b,stroke:#82909e,color:#e2e8ef
    class R,G,P,V,H,A,D step
```

### Guard: decide whether the caller may enter

This optional example requires identity **already verified by authentication code**. It implements an access check, not credential verification.

`src/presentation/http/tickets/guards/AuthenticatedGuard.ts`:

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

Bind it with `@UseGuards(AuthenticatedGuard)` and register the provider. [Nest — Guards](https://docs.nestjs.com/guards).

### Pipe: parse a handler argument

The Pipe applies the [plain Parser](2-typescript-first-boundaries.md#1-check-what-arrived-before-trusting-its-type) and translates its known failure to HTTP:

`src/presentation/http/tickets/pipes/CreateTicketPipe.ts`:

```ts
import { BadRequestException } from '@nestjs/common'
import type { PipeTransform } from '@nestjs/common'
import { InvalidTicketRequest, parseCreateTicketRequest } from '../parsers/parseCreateTicketRequest'
import type { CreateTicketRequestDto } from '../dto/CreateTicketRequestDto'

export class CreateTicketPipe implements PipeTransform {
  transform(value: unknown): CreateTicketRequestDto {
    try { return parseCreateTicketRequest(value) }
    catch (error) {
      if (error instanceof InvalidTicketRequest) throw new BadRequestException('invalid-request')
      throw error
    }
  }
}
```

Bind with `@Body(new CreateTicketPipe())`. Nest calls `transform` before the handler. Its optional built-in [ValidationPipe](https://docs.nestjs.com/techniques/validation) supports larger schemas; business validity remains with Domain.

### Other hooks

| Hook | Purpose and official documentation |
| --- | --- |
| [Middleware](https://docs.nestjs.com/middleware) | Processes platform request/response data early |
| [Interceptor](https://docs.nestjs.com/interceptors) | Wraps execution and its result |
| [Exception Filter](https://docs.nestjs.com/exception-filters) | Maps uncaught failures to transport responses |

For ordering details, use the [official lifecycle](https://docs.nestjs.com/faq/request-lifecycle).

## 6. Framework hooks versus architecture

Hooks manage delivery. `Ticket` owns validity, `CreateTicket` owns workflow, persistence implements storage, and Composition selects objects. Continue with [the file map and wiring](4-create-ticket-with-nestjs.md).

[References](references.md)
