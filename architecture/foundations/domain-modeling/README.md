# Business Decisions and Application Workflows

A support ticket cannot be assigned after resolution. An analyst also needs the ticket's required skill; escalation requires a supervisor. Before choosing a Service class, separate the decisions from the work needed to obtain their facts.

**Contents**

- [Decisions owned by one object](#decisions-owned-by-one-object)
- [Decisions involving several facts](#decisions-involving-several-facts)
- [Obtaining facts and completing work](#obtaining-facts-and-completing-work)
- [Responsibility map](#responsibility-map)
- [Verification and limits](#verification-and-limits)
- [Continue reading](#continue-reading)
- [Sources](#sources)

## Decisions owned by one object

A ticket knows its own status. Its supported assignment behavior can reject assignment after resolution. This is **entity behavior**: a business object protects the rules that belong to it.

The [Ticket factory](../../backend/2-typescript-first-boundaries.md) already shows one object enforcing valid creation. The [assignment solution](../../backend/exercises/solutions.md#b-a3--assignment-and-escalation) extends the model for that separate requirement.

## Decisions involving several facts

Skill matching and supervisor eligibility involve both ticket and analyst facts. A function can evaluate those facts without querying a database:

```ts
// src/domain/tickets/services/TicketAssignmentPolicy.ts
export interface AssignmentFacts {
  requiredSkill: string
  escalation: boolean
}
export interface AnalystFacts {
  skills: readonly string[]
  supervisor: boolean
}
export type AssignmentDecision =
  | { allowed: true }
  | { allowed: false; reason: 'missing-skill' | 'supervisor-required' }

export function decideAssignment(
  ticket: AssignmentFacts,
  analyst: AnalystFacts,
): AssignmentDecision {
  if (!analyst.skills.includes(ticket.requiredSkill)) {
    return { allowed: false, reason: 'missing-skill' }
  }
  if (ticket.escalation && !analyst.supervisor) {
    return { allowed: false, reason: 'supervisor-required' }
  }
  return { allowed: true }
}
```

This is a **[Domain Service](../../../GLOSSARY.md#domain-service)** when the behavior has business meaning and fits no single entity naturally. It may be a plain function; the name does not require a class or a Nest decorator.

## Obtaining facts and completing work

An **[Application Service](../../../GLOSSARY.md#application-service)** coordinates an operation: load the ticket and analyst, ask for the business decision, invoke the ticket's assignment behavior, and save an accepted result. It owns the workflow rather than repeating the eligibility rule.

Required readers and persistence contracts describe the capabilities it needs. Their implementations perform external calls. See the [complete assignment solution](../../backend/exercises/solutions.md#b-a3--assignment-and-escalation).

## Responsibility map

| Change | First owner to inspect |
| --- | --- |
| Resolved tickets cannot be assigned | Ticket behavior |
| Analyst skill or supervisor requirement | Assignment policy |
| Which facts the assignment workflow loads | AssignTicket |
| Database fields or queries | Persistence adapter |
| HTTP rejection message | HTTP delivery |

An entity keeps its own rules; a domain service expresses a decision spanning supplied facts; an application service obtains those facts and completes the workflow. A broad class called `TicketsService` does not make that separation.

## Verification and limits

Check the decision with plain values: missing skill, escalation without a supervisor and allowed assignment. Check that the workflow does not save a rejected decision and that the entity rejects resolved assignment.

Loading and saving in this teaching example does not solve concurrent assignment. A production guarantee must be specified by the operation's contracts and implemented through suitable persistence control.

Keep this distinction independent of frameworks. Nest [providers](../../backend/3-nestjs-building-blocks.md) can register any of these pieces without deciding their architectural owner.

## Continue reading

Read this after the [TypeScript ticket](../../backend/2-typescript-first-boundaries.md), and before backend advanced exercises. For canonical persistence terminology, consult [Repository](../../patterns/persistence/repository/README.md).

## Sources

- [Evans: Domain-Driven Design Reference, Entities and Services](https://www.domainlanguage.com/wp-content/uploads/2016/05/DDD_Reference_2015-03.pdf)
- [Fowler: Service Layer](https://martinfowler.com/eaaCatalog/serviceLayer.html)

[Previous: Create Ticket with NestJS](../../backend/4-create-ticket-with-nestjs.md) · [Next: Advanced backend Exercises](../../backend/exercises/advanced.md)
