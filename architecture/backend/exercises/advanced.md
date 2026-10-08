# Advanced backend Exercises

## B-A1 — Split a God Controller

**What you already know.** Read the Service responsibility comparison in chapter 3.

**Situation.** TicketsController checks access, parses JSON, enforces subject length, generates IDs, queries Prisma and formats the response.

**Terms you need.** God Controller combines decisions with independent reasons to change.

**Given code/files.** One create() method with all six jobs and a broad TicketsService that repeats the subject check.

**Task.** Refactor by responsibility using the canonical Ticket map; name the necessary pieces and source relationships.

**Questions.** Which rule has one authoritative owner? Which work can remain a plain function?

**Success criteria.** No Nest/Prisma inside policy; no duplicated subject validation; no ceremonial mapper class.

**Relevant handbook sections.** [Read the guide](../3-nestjs-building-blocks.md#3-service-does-not-tell-you-its-responsibility).

## B-A2 — Remove a deep import

**What you already know.** Read Module Boundaries and Public APIs.

**Situation.** Billing imports a private Tickets helper to create support tickets.

**Terms you need.** Supported public API, deep import, TypeScript exports and Nest provider visibility.

**Given code/files.** import { internalCreate } from '@/application/tickets/internal/createWithDefaults'; application/tickets/index.ts exports CreateTicket, command and result.

**Task.** Replace the deep import with the supported operation and explain source entry versus container registration.

**Questions.** Can exports metadata prevent a TypeScript deep import? Which capability owns defaults?

**Success criteria.** Billing knows creation's contract while Tickets keeps its private decisions.

**Relevant handbook sections.** [Read the guide](../../foundations/module-boundaries-and-public-apis.md).

## B-A3 — Assignment and escalation

**What you already know.** Read Entity, Domain Service and Application Service in chapter 3.

**Situation.** Resolved tickets cannot be assigned. Assignment requires an analyst with the ticket's required skill. Escalation needs a supervisor; the workflow loads the analyst, applies the decision and saves the ticket.

**Terms you need.** Entity behavior, Domain Service and Application Service.

**Given code/files.** Ticket state/required skill, Analyst skills/supervisor flag, an assignment policy and loaded facts.

**Task.** Assign each decision, name files and trace loading, business decision and saving.

**Questions.** Which rule fits Ticket alone? Which combines Ticket and Analyst? Who queries persistence?

**Success criteria.** Business decisions stay independent of database and HTTP; orchestration supplies facts.

**Relevant handbook sections.** [Read the guide](../3-nestjs-building-blocks.md#3-service-does-not-tell-you-its-responsibility).

[Exercise route](README.md) · [Solutions](solutions.md)
