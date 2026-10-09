# Advanced backend Exercises

Refactor code whose responsibilities have become mixed. Start with the supplied excerpt, preserve the requested behavior and compare your changes with the separate concrete solutions.

**Contents**

- [B-A1 — Split a God Controller](#b-a1--split-a-god-controller)
- [B-A2 — Remove a deep import](#b-a2--remove-a-deep-import)
- [B-A3 — Assignment and escalation](#b-a3--assignment-and-escalation)

## B-A1 — Split a God Controller

**What you already know.** Read the Service responsibility comparison in chapter 3.

**Situation.** TicketsController checks access, parses JSON, enforces subject length, generates IDs, queries Prisma and formats the response.

**Terms you need.** God Controller combines decisions with independent reasons to change.

**Starting code.** Imports refer to the canonical guide modules; this excerpt deliberately shows the problem.

```ts
// Responsibility excerpt: a broad service hides the same mixture.
export async function create(
  user: { id: string } | undefined,
  subject: string,
  description: string,
  writeRow: (row: { ticket_id: string; subject: string; description: string }) => Promise<void>,
  makeId: () => string,
) {
  if (!user) return { status: 401 }
  if (!subject.trim() || subject.trim().length > 160) return { status: 400 }
  const id = makeId()
  await writeRow({ ticket_id: id, subject: subject.trim(), description })
  return { status: 201, body: { id, subject: subject.trim(), status: 'open' } }
}
```

**Task.** Refactor by responsibility using the canonical Ticket map; name the necessary pieces and source relationships.

**Questions.** Which rule has one authoritative owner? Which work can remain a plain function?

**Expected result.** Access rejection performs no creation. Accepted input reaches the canonical factory and awaited repository; invalid shape/business input and unavailable storage keep their documented HTTP outcomes.

**Relevant handbook sections.** [Read the guide](../3-nestjs-building-blocks.md#service-does-not-tell-you-its-responsibility).

## B-A2 — Remove a deep import

**What you already know.** Read Module Boundaries and Public APIs.

**Situation.** Billing imports a private Tickets helper to create support tickets.

**Terms you need.** Supported public API, deep import, TypeScript exports and Nest provider visibility.

**Starting code.** Imports refer to the canonical guide modules; this excerpt deliberately shows the problem.

```ts
// Billing knows a private implementation detail.
import { internalCreate } from '@/application/tickets/internal/createWithDefaults'
export function requestBillingSupport(subject: string) {
  return internalCreate(subject)
}
```

**Task.** Replace the deep import with the supported operation and explain source entry versus container registration.

**Questions.** Can exports metadata prevent a TypeScript deep import? Which capability owns defaults?

**Expected result.** Billing uses only the supported Tickets entry and creation command/result. Ticket defaults remain owned by Tickets; changing its private file layout requires no Billing edit.

**Relevant handbook sections.** [Read the guide](../../foundations/module-boundaries-and-public-apis.md).

## B-A3 — Assignment and escalation

**What you already know.** Read [Business decisions and workflows](../../foundations/domain-modeling/README.md), then Nest registration.

**Situation.** Resolved tickets cannot be assigned. Assignment requires an analyst with the ticket's required skill. Escalation needs a supervisor; the workflow loads the analyst, applies the decision and saves the ticket.

**Terms you need.** Entity behavior, [Domain Service](../../../GLOSSARY.md#domain-service) and [Application Service](../../../GLOSSARY.md#application-service).

**Starting code.** Imports refer to the canonical guide modules; this excerpt deliberately shows the problem.

```ts
// Loaded facts are already supplied here; the workflow duplicates business decisions.
interface AssignmentInput {
  status: string
  requiredSkill: string
  escalation: boolean
  skills: readonly string[]
  supervisor: boolean
}
export async function assign(input: AssignmentInput, save: () => Promise<void>) {
  if (input.status === 'resolved') return false
  if (!input.skills.includes(input.requiredSkill)) return false
  if (input.escalation && !input.supervisor) return false
  await save()
  return true
}
```

**Task.** Implement and assign each decision, name files and trace loading, business decision and saving.

**Questions.** Which rule fits Ticket alone? Which combines Ticket and Analyst? Who queries persistence?

**Expected result.** Resolved assignment is rejected by the ticket model; missing skill and non-supervisor escalation by the policy. Rejections do not save. Allowed assignment records the analyst and saves once.

**Relevant handbook sections.** [Read the guide](../3-nestjs-building-blocks.md#service-does-not-tell-you-its-responsibility).

[Exercise route](README.md) · [Solutions](solutions.md)
