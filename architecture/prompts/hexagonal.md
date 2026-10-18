# Discuss a Hexagonal Design

Hexagonal protects application interactions from caller and integration mechanisms. It fits an operation reached through HTTP and CLI or backed by replaceable integrations. Each useful boundary has a cost; an interface for every file is unnecessary. See [Ports & Adapters](../styles/hexagonal-architecture/README.md).

**Contents**

- [Copyable addition](#copyable-addition)
- [Illustrative response shape](#illustrative-response-shape)
- [Review questions](#review-questions)

## Copyable addition

Append this to the [base request](design-request.md#copyable-request):

```text
Evaluate Hexagonal / Ports & Adapters for the supplied product. Read
architecture/styles/hexagonal-architecture/README.md. Identify the offered
operation, required capabilities, inbound/outbound adapters and assembly.
An offered operation may itself be the supported interface; justify any
additional inbound interface.

Give concrete consumer-owned contracts and explain caller/integration
substitution. Apply the same questions separately to the browser if it is
in scope: its backend API is external to that browser application.
Distinguish a remote gateway, a projection reader and a Repository for
stored business objects. Compare a simpler arrangement and reject ports
that protect no meaningful interaction.
```

## Illustrative response shape

| Proposed expense artifact | Decision exposed |
| --- | --- |
| `application/expenses/ApproveExpense.ts` | Offered operation used by HTTP and an authorized CLI |
| `application/expenses/ports/ExpenseStore.ts` | Required scoped read/conditional-write capability; methods need actual consumers |
| `presentation/http/expenses/ApproveExpenseHandler.ts` | Inbound HTTP translation and trusted identity |
| `infrastructure/persistence/expenses/SqlExpenseStore.ts` | Outbound storage adapter implementing required semantics |
| `composition/expenses.ts` | Select and supply adapters |

A browser may separately use `ExpenseGateway` through an HTTP adapter. That does not make the gateway a Repository. Authoritative approval rules remain on the backend; the scheme must still explain concurrency, access and visible failure states.

## Review questions

Can a new caller invoke the operation without imitating HTTP? Can an application check use a controlled required-capability replacement without a database? Neither a fake nor an interface proves that a real adapter honors durability or transaction promises.

[Prompt selector](README.md) · [Pattern additions](pattern-options.md)
