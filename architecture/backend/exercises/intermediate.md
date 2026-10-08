# Intermediate backend Exercises

## B-I1 — Change one business rule

**What you already know.** Read Ticket's factory and architectural ownership.

**Situation.** Support reduces the subject limit from 160 to 100 string units and adds reopened to its vocabulary. New tickets still start open.

**Terms you need.** Business Rule, Architectural Ownership and runtime guard.

**Given code/files.** Ticket.ts, TICKET_STATUSES, INITIAL_TICKET_STATUS, normalizeTicketSubject and the HTTP Parser.

**Task.** Describe the changes and relevant observations without copying the rule into delivery.

**Questions.** What should happen for 101 characters? Does adding a status define transitions? What if the list is reordered?

**Success criteria.** One subject-rule owner; explicit open initial state; transition behavior remains a separate decision.

**Relevant handbook sections.** [Read the guide](../2-typescript-first-boundaries.md).

## B-I2 — Create from a CLI

**What you already know.** Read manual injection and HTTP translation.

**Situation.** An operator runs create-ticket --subject 'Broken PDF' --description 'Cannot download'.

**Terms you need.** CLI input translation and use-case result, introduced in the backend route.

**Given code/files.** The supported application/tickets entry exports CreateTicket, command and result.

**Task.** Design CLI argument parsing, operation invocation, message and exit-code mapping; identify composition changes.

**Questions.** Who owns missing-option errors? How do invalid-subject and unavailable become CLI feedback?

**Success criteria.** Reuse CreateTicket; no HTTP parser import or duplicated subject rule.

**Relevant handbook sections.** [Read the guide](../2-typescript-first-boundaries.md).

## B-I3 — Read an agenda

**What you already know.** Read the next-operation example in chapter 2 and HTTP folders in chapter 4.

**Situation.** A receptionist requests GET /agenda?day=2026-10-07.

**Terms you need.** GetAgenda coordinates a read; AgendaReader describes it; a query Parser checks HTTP query data.

**Given code/files.** AgendaController, GetAgenda, AgendaReader, PrismaAgendaReader, parseAgendaQuery, AgendaQueryDto, AgendaResponseDto and mapAgendaResponse.

**Task.** Assign full paths and trace query → operation → supplied reader → response.

**Questions.** Where do database fields and HTTP query strings stop? Who chooses the concrete reader?

**Success criteria.** An inward-owned reading contract and separately owned query/response representations.

**Relevant handbook sections.** [Read the guide](../2-typescript-first-boundaries.md#next-operation-reading-an-agenda).

[Exercise route](README.md) · [Solutions](solutions.md)
