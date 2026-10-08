# Naming and File Placement Conventions

A filename should tell a reader what the code does. `GetAgenda` names an operation; `HttpAgendaReader` names its technical implementation. Responsibility determines placement before spelling determines the filename.

**Contents**

- [Identifier naming](#identifier-naming)
- [React requirements](#react-requirements)
- [File naming — repository convention](#file-naming--repository-convention)
  - [Backend names](#backend-names)
- [Folder naming](#folder-naming)
- [Ports and adapters](#ports-and-adapters)
- [Use-case names](#use-case-names)
- [UI components](#ui-components)
- [Placement is more important than suffix](#placement-is-more-important-than-suffix)
  - [Exact owned paths](#exact-owned-paths)
- [Source imports and runtime resolution](#source-imports-and-runtime-resolution)
- [Sources](#sources)

<a id="1-identifier-naming"></a>

## Identifier naming

| Identifier | Convention | Example |
| --- | --- | --- |
| Class, interface, type | PascalCase | `TicketRepository` |
| Function, variable, method | camelCase | `parseCreateTicketRequest` |
| React component | PascalCase | `AgendaPage` |
| React Hook | `use` followed by a capital | `useAgenda` |

These are handbook conventions except where the framework imposes a requirement.

<a id="2-react-requirements"></a>

## React requirements

React component names start with a capital letter. Hooks use the `use` prefix and follow React's Rules of Hooks. A file's PascalCase spelling is our convention.

<a id="3-file-naming--repository-convention"></a>

## File naming — repository convention

Match a class/component file to its main identifier. Function-oriented files use camelCase. Related state artifacts use a capability prefix, such as `agenda.state.ts`.

### Backend names

| Name | Meaning |
| --- | --- |
| `Ticket.ts` | Business object and rules |
| `CreateTicket.ts` | Creation workflow |
| `TicketRepository.ts` | Required ticket persistence contract |
| `InMemoryTicketRepository.ts` | Process-memory implementation |
| `PrismaTicketRepository.ts` | Prisma implementation |
| `TicketsController.ts` | Related HTTP handlers |
| `CreateTicketPipe.ts` | Nest argument-processing hook |
| `AuthenticatedGuard.ts` | Nest access hook |
| `TicketsModule.ts` | Nest registration and assembly |
| `parseCreateTicketRequest.ts` | Plain request parser |
| `ticket.tokens.ts` | Runtime dependency lookup keys |

Repository describes the required persistence interaction; the mechanism prefix identifies its implementation. [Chapter 3](../backend/3-nestjs-building-blocks.md) explains Nest mechanisms.

<a id="4-folder-naming"></a>

## Folder naming

Use layers first, capabilities inside them: `domain/tickets/`, `application/tickets/` and the relevant integration or delivery area. [Code Placement](../foundations/code-placement.md) owns the dependency and representation rules.

<a id="5-ports-and-adapters"></a>

## Ports and adapters

Name a required interaction by purpose: `AgendaReader`, `Clock` or `TicketRepository`. Name its implementation with its mechanism when that adds useful information: `HttpAgendaReader` or `InMemoryTicketRepository`.

<a id="6-use-case-names"></a>

## Use-case names

Use actor intent: `CreateTicket`, `GetAgenda` or `CancelOrder` for classes; `createTicket` for an operation implemented as a function. `processStuff` and `GenericService` hide the intent.

<a id="7-ui-components"></a>

## UI components

`AppointmentCard` names the rendered unit. `AgendaPage` names the composed screen; `useAgenda` names its interaction Hook. Reusable primitives can use visual vocabulary such as `Button`.

<a id="8-placement-is-more-important-than-suffix"></a>

## Placement is more important than suffix

`PrismaTicketRepository` belongs to the persistence integration even when its name includes a business noun.

### Exact owned paths

Prefix paths below with `src/`.

| Artifact | Path |
| --- | --- |
| Controller | `presentation/http/tickets/controllers/TicketsController.ts` |
| Guard | `presentation/http/tickets/guards/AuthenticatedGuard.ts` |
| Pipe | `presentation/http/tickets/pipes/CreateTicketPipe.ts` |
| HTTP [Parser](../../GLOSSARY.md#parser) | `presentation/http/tickets/parsers/parseCreateTicketRequest.ts` |
| Request [DTO](../../GLOSSARY.md#data-transfer-object-dto) | `presentation/http/tickets/dto/CreateTicketRequestDto.ts` |
| Response DTO | `presentation/http/tickets/dto/TicketResponseDto.ts` |
| Response [Mapper](../../GLOSSARY.md#mapper) | `presentation/http/tickets/mappers/mapCreateTicketResponse.ts` |
| CLI handler | `presentation/cli/tickets/handlers/createTicketCli.ts` |
| Use case | `application/tickets/use-cases/CreateTicket.ts` |
| Command/result | `application/tickets/contracts/CreateTicketCommand.ts` and `CreateTicketResult.ts` |
| Persistence contract | `application/tickets/ports/TicketRepository.ts` |
| Prisma implementation | `infrastructure/persistence/tickets/adapters/PrismaTicketRepository.ts` |
| Frontend Page | `presentation/scheduling/pages/AgendaPage.tsx` |
| Component | `presentation/scheduling/components/AppointmentCard/AppointmentCard.tsx` |
| Hook | `presentation/scheduling/hooks/useAgenda.ts` |
| State | `presentation/scheduling/state/agenda.state.ts` |
| API DTO | `infrastructure/http/scheduling/dto/AgendaApiDto.ts` |
| API Parser | `infrastructure/http/scheduling/parsers/parseAgendaApiResponse.ts` |
| API Mapper | `infrastructure/http/scheduling/mappers/mapAgendaApiDto.ts` |
| Formatter | `presentation/scheduling/formatters/formatAppointmentTime.ts` |

Use the [backend map](../backend/4-create-ticket-with-nestjs.md) and [frontend map](../frontend/presentation-architecture.md) for their concrete relationships.

<a id="9-source-imports-and-runtime-resolution"></a>

## Source imports and runtime resolution

The canonical alias is `@/ = src/`. Use it across layers or distant owners; nearby files may use relative imports.

```json
{
  "compilerOptions": {
    "paths": { "@/*": ["./src/*"] }
  }
}
```

This compiler fragment tells TypeScript how to find source modules. It does not rewrite emitted imports. An application must configure its runtime or bundler to resolve the same alias. An alias changes lookup, not permitted dependency direction.

## Sources

- [React: Your First Component](https://react.dev/learn/your-first-component)
- [React: Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks)
- [TypeScript: paths](https://www.typescriptlang.org/docs/handbook/modules/reference.html#paths)
