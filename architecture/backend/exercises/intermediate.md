# Intermediate backend Exercises

Change a small working example. Each exercise supplies starting code, a requirement and an observable result; use the separate solutions after making your own attempt.

**Contents**

- [B-I1 — Change one business rule](#b-i1--change-one-business-rule)
- [B-I2 — Create from a CLI](#b-i2--create-from-a-cli)
- [B-I3 — Read an agenda](#b-i3--read-an-agenda)

## B-I1 — Change one business rule

**What you already know.** Read Ticket's factory and architectural ownership.

**Situation.** Support reduces the subject limit from 160 to 100 string units and adds reopened to its vocabulary. New tickets still start open.

**Terms you need.** Business Rule, Architectural Ownership and runtime guard.

**Starting code.** Imports refer to the canonical guide modules; this excerpt deliberately shows the problem.

```ts
// Fragment from domain/tickets/Ticket.ts; the rest of Ticket stays as shown.
export const TICKET_STATUSES = ['open', 'in_progress', 'resolved'] as const
// normalizeTicketSubject rejects trimmed subjects longer than 160.
// INITIAL_TICKET_STATUS is explicitly 'open'.
```

**Task.** Implement the changes and relevant observations without copying the rule into delivery.

**Questions.** What should happen for 101 characters? Does adding a status define transitions? What if the list is reordered?

**Expected result.** A trimmed 100-unit subject is accepted; 101 is rejected. Adding or reordering status membership still creates an open ticket. No transition is introduced.

**Relevant handbook sections.** [Read the guide](../2-typescript-first-boundaries.md).

## B-I2 — Create from a CLI

**What you already know.** Read manual injection and HTTP translation.

**Situation.** An operator runs create-ticket --subject 'Broken PDF' --description 'Cannot download'.

**Terms you need.** CLI input translation and use-case result, introduced in the backend route.

**Starting code.** Imports refer to the canonical guide modules; this excerpt deliberately shows the problem.

```ts
import type { CreateTicket } from '@/application/tickets'

// The operation is supplied, but CLI syntax and feedback are missing.
export async function run(args: readonly string[], create: CreateTicket) {
  return create.execute({ subject: args[0] ?? '', description: args[1] ?? '' })
}
```

**Task.** Implement CLI argument parsing, operation invocation, message and exit-code mapping; identify composition changes.

**Questions.** Who owns missing-option errors? How do invalid-subject and unavailable become CLI feedback?

**Expected result.** --subject and --description create a ticket (exit 0). Missing/unknown options produce usage feedback (exit 2); invalid-subject produces exit 2; unavailable produces exit 1.

**Relevant handbook sections.** [Read the guide](../2-typescript-first-boundaries.md).

## B-I3 — Read an agenda

**What you already know.** Read the next-operation example in chapter 2 and HTTP folders in chapter 4.

**Situation.** A receptionist requests GET /agenda?day=2026-10-07.

**Terms you need.** GetAgenda coordinates a read; AgendaReader describes it; a query [Parser](../../../GLOSSARY.md#parser) checks HTTP query data.

**Starting code.** Imports refer to the canonical guide modules; this excerpt deliberately shows the problem.

```ts
// Current handler mixes HTTP data with persistence.
interface AgendaDb {
  list(day: unknown): Promise<readonly { appointment_id: string; start_time: Date }[]>
}
export async function agenda(query: { day?: unknown }, db: AgendaDb) {
  const rows = await db.list(query.day)
  return rows.map(row => ({ id: row.appointment_id, startsAt: row.start_time.toISOString() }))
}
```

**Task.** Implement the pieces, assign paths and trace query → operation → supplied reader → response.

**Questions.** Where do database fields and HTTP query strings stop? Who chooses the concrete reader?

**Expected result.** A valid ISO calendar day reaches the supplied reader. Missing or impossible dates return 400 without a read. Results use HTTP response fields; known reading failure returns 503.

**Relevant handbook sections.** [Read the guide](../2-typescript-first-boundaries.md#next-operation-reading-an-agenda).

[Exercise route](README.md) · [Solutions](solutions.md)
