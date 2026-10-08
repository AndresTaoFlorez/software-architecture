# Easy backend Exercises

## B-E1 — Trace the request

**What you already know.** Read backend chapters 1–3.

**Situation.** An analyst submits POST /tickets; creation succeeds.

**Terms you need.** Endpoint, route, Controller, handler, Guard, Pipe, Parser, use case and entity are introduced in chapters 1–3.

**Given code/files.** POST /tickets; TicketsController.create; AuthenticatedGuard; CreateTicketPipe; parseCreateTicketRequest; CreateTicket.execute; Ticket.create.

**Task.** Label each item and trace execution from the selected request to its business decision.

**Questions.** Which checks access? Which checks the request shape? Where is initial state decided?

**Success criteria.** Distinguish the endpoint from its route and handler; show the Parser called by the Pipe.

**Relevant handbook sections.** [Read the guide](../3-nestjs-building-blocks.md).

## B-E2 — Contract and implementations

**What you already know.** Read the persistence example in chapter 2.

**Situation.** Storage changes from process memory to Prisma.

**Terms you need.** Repository contract, implementation and composition.

**Given code/files.** TicketRepository, InMemoryTicketRepository and PrismaTicketRepository.

**Task.** Explain each responsibility, allowed imports and what selects the replacement.

**Questions.** Which artifact writes? Which describes the required interaction? What lasts beyond process restart?

**Success criteria.** Keep the contract independent of Prisma and assign selection to Composition.

**Relevant handbook sections.** [Read the guide](../2-typescript-first-boundaries.md).

## B-E3 — Place HTTP files

**What you already know.** Read the exact Ticket map in chapter 4.

**Situation.** A new maintainer needs to locate HTTP translation.

**Terms you need.** Controller, Guard, Pipe, Parser, DTO and Mapper.

**Given code/files.** TicketsController.ts, AuthenticatedGuard.ts, CreateTicketPipe.ts, parseCreateTicketRequest.ts, CreateTicketRequestDto.ts, TicketResponseDto.ts, mapCreateTicketResponse.ts.

**Task.** Place every file under its exact responsibility folder inside presentation/http/tickets/.

**Questions.** Which input and output representations belong to HTTP? Does a small function lose its owner?

**Success criteria.** Give seven full source paths without a generic helpers/ bucket.

**Relevant handbook sections.** [Read the guide](../4-create-ticket-with-nestjs.md).

[Exercise route](README.md) · [Solutions](solutions.md)
