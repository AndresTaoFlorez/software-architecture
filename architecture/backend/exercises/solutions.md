# Backend Exercise Solutions

Source paths below are relative to an application's `src/`. These are design answers, with alternatives judged by the stated requirement.

## B-E1 — Trace the request

**Answer.** POST /tickets is the endpoint; its route maps to TicketsController.create(), the handler grouped by the Controller. The Guard checks access, the Pipe invokes the Parser, CreateTicket coordinates, and Ticket owns validity.

**Why / exact owner.** HTTP invocation: Presentation. Workflow: Application. Ticket rules: Domain.

**Exact files.** presentation/http/tickets/controllers/TicketsController.ts; presentation/http/tickets/guards/AuthenticatedGuard.ts; presentation/http/tickets/pipes/CreateTicketPipe.ts; presentation/http/tickets/parsers/parseCreateTicketRequest.ts; application/tickets/use-cases/CreateTicket.ts; domain/tickets/Ticket.ts.

**Dependency direction.** HTTP Presentation → Application → Domain; the Pipe calls its local Parser.

**What remains unchanged.** Ticket validity when routing changes.

**Why a tempting alternative is wrong.** Putting subject validity in the Controller makes another caller bypass the authoritative rule.

**References.** [Relevant guide](../3-nestjs-building-blocks.md) · [Exercise](easy.md#b-e1--trace-the-request).

## B-E2 — Contract and implementations

**Answer.** TicketRepository describes insert(ticket). The memory class stores snapshots in its process; the Prisma class maps fields and writes through its client. Composition chooses one implementation.

**Why / exact owner.** Application owns the requirement, Infrastructure its fulfillment, Composition its selection.

**Exact files.** application/tickets/ports/TicketRepository.ts; infrastructure/persistence/tickets/adapters/InMemoryTicketRepository.ts; infrastructure/persistence/tickets/adapters/PrismaTicketRepository.ts; composition/modules/TicketsModule.ts.

**Dependency direction.** Both implementations → Application contract; CreateTicket → that contract.

**What remains unchanged.** CreateTicket, Ticket and HTTP representation for an unchanged contract.

**Why a tempting alternative is wrong.** Importing Prisma in the contract couples all callers to the selected technology.

**References.** [Relevant guide](../2-typescript-first-boundaries.md) · [Exercise](easy.md#b-e2--contract-and-implementations).

## B-E3 — Place HTTP files

**Answer.** Use controllers/, guards/, pipes/, parsers/, dto/ and mappers/ respectively; both request and response DTOs belong in dto/.

**Why / exact owner.** Presentation owns incoming HTTP representations and translation.

**Exact files.** presentation/http/tickets/controllers/TicketsController.ts; presentation/http/tickets/guards/AuthenticatedGuard.ts; presentation/http/tickets/pipes/CreateTicketPipe.ts; presentation/http/tickets/parsers/parseCreateTicketRequest.ts; presentation/http/tickets/dto/CreateTicketRequestDto.ts; presentation/http/tickets/dto/TicketResponseDto.ts; presentation/http/tickets/mappers/mapCreateTicketResponse.ts.

**Dependency direction.** HTTP files → supported Application API; local Pipe → Parser.

**What remains unchanged.** Domain and persistence implementation.

**Why a tempting alternative is wrong.** Putting every DTO under domain/types/ confuses wire fields with business meaning.

**References.** [Relevant guide](../4-create-ticket-with-nestjs.md) · [Exercise](easy.md#b-e3--place-http-files).

## B-I1 — Change one business rule

**Answer.** Change the bound and vocabulary in domain/tickets/Ticket.ts. Keep INITIAL_TICKET_STATUS = 'open'. Observe rejection above 100, accepted boundary input and open creation after list reordering. Adding membership does not implement a transition.

**Why / exact owner.** Domain owns subject validity, vocabulary and creation state.

**Exact files.** domain/tickets/Ticket.ts; domain/tickets/Ticket.test.ts in an application project.

**Dependency direction.** Existing callers reuse the factory and guard inward.

**What remains unchanged.** The request Parser's string-shape check and CreateTicket's orchestration.

**Why a tempting alternative is wrong.** Adding a second length decorator creates two business-rule owners.

**References.** [Relevant guide](../2-typescript-first-boundaries.md) · [Exercise](intermediate.md#b-i1--change-one-business-rule).

## B-I2 — Create from a CLI

**Answer.** A CLI parser accepts the two options and constructs the command. The CLI handler invokes the supplied CreateTicket and maps success/rejections into documented messages and exit codes. CLI startup supplies the operation.

**Why / exact owner.** CLI syntax and output: Presentation. Creation: existing Application/Domain.

**Exact files.** presentation/cli/tickets/parsers/parseCreateTicketArgs.ts; presentation/cli/tickets/handlers/createTicketCli.ts; composition/cli/main.ts.

**Dependency direction.** CLI → application/tickets; Composition → concrete dependencies.

**What remains unchanged.** CreateTicket, Ticket and persistence contract.

**Why a tempting alternative is wrong.** Reusing the HTTP Parser imports another delivery channel's representation instead of sharing the operation.

**References.** [Relevant guide](../2-typescript-first-boundaries.md) · [Exercise](intermediate.md#b-i2--create-from-a-cli).

## B-I3 — Read an agenda

**Answer.** The query Parser checks HTTP input, GetAgenda asks its AgendaReader for that day, PrismaAgendaReader translates persistence data, and HTTP maps the result to its response DTO.

**Why / exact owner.** HTTP: Presentation. Read workflow/contract: Application. Prisma query: Infrastructure.

**Exact files.** presentation/http/scheduling/controllers/AgendaController.ts; presentation/http/scheduling/parsers/parseAgendaQuery.ts; presentation/http/scheduling/dto/AgendaQueryDto.ts; presentation/http/scheduling/dto/AgendaResponseDto.ts; presentation/http/scheduling/mappers/mapAgendaResponse.ts; application/scheduling/use-cases/GetAgenda.ts; application/scheduling/ports/AgendaReader.ts; application/scheduling/contracts/AgendaResult.ts; infrastructure/persistence/scheduling/adapters/PrismaAgendaReader.ts; composition/modules/SchedulingModule.ts.

**Dependency direction.** Controller → Application; Prisma reader → Application contract; Composition assembles both.

**What remains unchanged.** HTTP result shape when only database column names change.

**Why a tempting alternative is wrong.** Returning a Prisma record from GetAgenda exposes the storage representation to all callers.

**References.** [Relevant guide](../2-typescript-first-boundaries.md#next-operation-reading-an-agenda) · [Exercise](intermediate.md#b-i3--read-an-agenda).

## B-A1 — Split a God Controller

**Answer.** Keep HTTP invocation/output in the Controller, access in the Guard, shape parsing behind the Pipe, validity in Ticket, orchestration in CreateTicket and database work in the Prisma implementation. Composition supplies ID generation and dependencies.

**Why / exact owner.** One owner for each decision rather than one class per line of code.

**Exact files.** domain/tickets/Ticket.ts; application/tickets/use-cases/CreateTicket.ts; application/tickets/ports/TicketRepository.ts; infrastructure/persistence/tickets/adapters/PrismaTicketRepository.ts; presentation/http/tickets/controllers/TicketsController.ts; presentation/http/tickets/guards/AuthenticatedGuard.ts; presentation/http/tickets/pipes/CreateTicketPipe.ts; presentation/http/tickets/parsers/parseCreateTicketRequest.ts; presentation/http/tickets/mappers/mapCreateTicketResponse.ts; composition/modules/TicketsModule.ts. Retire the broad TicketsService after moving its responsibilities.

**Dependency direction.** Presentation → Application → Domain; Infrastructure → inward contract; Composition imports selected concrete pieces.

**What remains unchanged.** The supported creation command/result and endpoint behavior.

**Why a tempting alternative is wrong.** Renaming the God Controller to Service moves the coupling without separating responsibilities.

**References.** [Relevant guide](../3-nestjs-building-blocks.md#3-service-does-not-tell-you-its-responsibility) · [Exercise](advanced.md#b-a1--split-a-god-controller).

## B-A2 — Remove a deep import

**Answer.** Billing imports the supported application/tickets entry and invokes the supplied operation. For Nest wiring, Composition imports TicketsModule through composition/modules and makes the exported provider available.

**Why / exact owner.** Tickets owns ticket creation/defaults; Billing owns when its workflow requests a ticket.

**Exact files.** application/billing/use-cases/CreateInvoiceSupportTicket.ts; application/tickets/index.ts; composition/modules/TicketsModule.ts; composition/modules/index.ts.

**Dependency direction.** Billing → supported Tickets Application API; no dependency on Tickets' delivery or persistence internals.

**What remains unchanged.** Private Tickets helper organization and creation implementation.

**Why a tempting alternative is wrong.** Exporting every private helper enlarges the supported surface instead of fixing the consumer.

**References.** [Relevant guide](../../foundations/module-boundaries-and-public-apis.md) · [Exercise](advanced.md#b-a2--remove-a-deep-import).

## B-A3 — Assignment and escalation

**Answer.** Ticket rejects assignment in its resolved state. A Domain assignment policy evaluates skill and escalation eligibility across Ticket/Analyst facts. AssignTicket loads the facts, requests the decision, invokes entity behavior and saves.

**Why / exact owner.** Ticket: its valid state. Policy: cross-object business eligibility. AssignTicket: workflow.

**Exact files.** domain/tickets/Ticket.ts; domain/tickets/services/TicketAssignmentPolicy.ts; application/tickets/use-cases/AssignTicket.ts; application/tickets/ports/TicketAssignmentReader.ts; application/tickets/ports/TicketRepository.ts (extend only for required saving).

**Dependency direction.** Application → Domain policy/entity and required contracts; implementations → inward contracts.

**What remains unchanged.** HTTP translation and storage mechanism when eligibility alone changes.

**Why a tempting alternative is wrong.** A Domain Service that queries Prisma mixes the business decision with how facts are loaded.

**References.** [Relevant guide](../3-nestjs-building-blocks.md#3-service-does-not-tell-you-its-responsibility) · [Exercise](advanced.md#b-a3--assignment-and-escalation).
