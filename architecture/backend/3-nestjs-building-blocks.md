<a id="3-nestjs-building-blocks"></a>

# NestJS Building Blocks

[TypeScript boundaries](2-typescript-first-boundaries.md) · [Backend route](README.md) · Next: [Ticket wiring](4-create-ticket-with-nestjs.md)

**Contents**

- [Register the functions we already understand](#register-the-functions-we-already-understand)
- [Replace repetitive construction, not business ownership](#replace-repetitive-construction-not-business-ownership)
- [“Service” does not tell you its responsibility](#service-does-not-tell-you-its-responsibility)
- [Organize the framework graph with modules](#organize-the-framework-graph-with-modules)
- [Put each repeated request concern at its actual hook](#put-each-repeated-request-concern-at-its-actual-hook)
  - [Guard and Pipe answer different questions](#guard-and-pipe-answer-different-questions)
  - [Guard: decide whether the caller may enter](#guard-decide-whether-the-caller-may-enter)
  - [Pipe: parse a handler argument](#pipe-parse-a-handler-argument)
  - [Other hooks](#other-hooks)
- [Framework hooks versus architecture](#framework-hooks-versus-architecture)

<a id="1-register-the-functions-we-already-understand"></a>

## Register the functions we already understand

The [HTTP vocabulary](1-http-request-to-business-operation.md#which-function-receives-it) is already established. Nest registers related handlers through decorators. Routing excerpt; application calls and response bodies are omitted:

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

<a id="2-replace-repetitive-construction-not-business-ownership"></a>

## Replace repetitive construction, not business ownership

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

<a id="3-service-does-not-tell-you-its-responsibility"></a>

## “Service” does not tell you its responsibility

A `TicketsService` that validates subjects, queries rows and formats HTTP responses combines decisions that change independently. Such a class is often called a **God Service**; a Controller mixing the same work is a **God Controller**.

| Responsibility | Example |
| --- | --- |
| Entity behavior | `Ticket` checks its own valid subject/state |
| [Domain Service](../../GLOSSARY.md#domain-service) | An assignment policy involving ticket and analyst facts |
| [Application Service](../../GLOSSARY.md#application-service) | `CreateTicket` coordinates rules and saving |
| Technical implementation | Prisma persistence or an email client |

The [framework-independent explanation](../foundations/domain-modeling/README.md) shows the assignment decision and workflow. Nest can register these different pieces as providers; that registration does not choose their architectural responsibility.

<a id="4-organize-the-framework-graph-with-modules"></a>

## Organize the framework graph with modules

`@Module()` provides registration metadata:

| Field | Registers or exposes |
| --- | --- |
| `controllers` | HTTP controllers |
| `providers` | Dependencies available locally |
| `imports` | Modules providing required dependencies |
| `exports` | Providers available to importing modules |

A Nest Module organizes container visibility. Source privacy is a separate [public API concern](../foundations/module-boundaries-and-public-apis.md#backend-apis-across-layer-first-capabilities). [Nest — Modules](https://docs.nestjs.com/modules).

<a id="5-put-each-repeated-request-concern-at-its-actual-hook"></a>

## Put each repeated request concern at its actual hook

### Guard and Pipe answer different questions

A caller may be authenticated and still send invalid data. Access and argument processing therefore require separate decisions:

| Piece | Question |
| --- | --- |
| [Parser](../../GLOSSARY.md#parser) | Can this unknown value become the expected request data? |
| Pipe | How does Nest apply parsing/validation/transformation before the handler? |
| Guard | May this caller reach the handler? |
| [Domain](../../GLOSSARY.md#domain) | Is the resulting business state valid? |

Solid arrows show simplified execution order, with the Parser called by the Pipe:

```mermaid
%%{init: {"htmlLabels": false, "flowchart": {"htmlLabels": false, "nodeSpacing": 28, "rankSpacing": 48, "diagramPadding": 20, "wrappingWidth": 280}, "sequence": {"wrap": true, "diagramMarginX": 20, "diagramMarginY": 20}}}%%
flowchart TB
    R["Selected request"] --> G["AuthenticatedGuard<br/>access"]
    G -->|"allowed"| P["CreateTicketPipe<br/>argument"]
    P -->|"calls"| V["parseCreateTicketRequest<br/>Parser"]
    V -->|"checked value via Pipe"| H["TicketsController.create<br/>handler"]
    H --> A["CreateTicket<br/>workflow"]
    A --> D["Ticket<br/>validity"]
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

The Pipe applies the [plain Parser](2-typescript-first-boundaries.md#check-what-arrived-before-trusting-its-type) and translates its known failure to HTTP:

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

Bind with `@Body(new CreateTicketPipe())`. Nest calls `transform` before the handler. Its optional built-in [ValidationPipe](https://docs.nestjs.com/techniques/validation) supports larger schemas; business validity remains with [Domain](../../GLOSSARY.md#domain).

### Other hooks

| Hook | Purpose and official documentation |
| --- | --- |
| [Middleware](https://docs.nestjs.com/middleware) | Processes platform request/response data early |
| [Interceptor](https://docs.nestjs.com/interceptors) | Wraps execution and its result |
| [Exception Filter](https://docs.nestjs.com/exception-filters) | Maps uncaught failures to transport responses |

For ordering details, use the [official lifecycle](https://docs.nestjs.com/faq/request-lifecycle).

<a id="6-framework-hooks-versus-architecture"></a>

## Framework hooks versus architecture

Hooks manage delivery. `Ticket` owns validity, `CreateTicket` owns workflow, persistence implements storage, and Composition selects objects. Continue with [the file map and wiring](4-create-ticket-with-nestjs.md).

[References](references.md)

[Previous: TypeScript-First Boundaries](2-typescript-first-boundaries.md) · [Next: Create Ticket with NestJS](4-create-ticket-with-nestjs.md)
