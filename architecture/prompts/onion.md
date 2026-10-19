# Discuss an Onion Design

Onion keeps a meaningful domain model independent at the center, surrounded by application coordination and external mechanisms. It fits long-lived, rule-rich software. A small content page or simple read projection may have little domain behavior to protect. See the [Onion guide](../styles/onion-architecture/README.md).

**Contents**

- [Copyable addition](#copyable-addition)
- [Illustrative response shape](#illustrative-response-shape)
- [Review questions](#review-questions)

## Copyable addition

Append this to the [base request](design-request.md#copyable-request):

```text
Evaluate Onion for the supplied product. Read the Onion guide, relevant
ring/dependency sections and the canonical placement guide. Identify actual
domain behavior and its required facts before proposing a domain model.
Show how Application coordinates work and how external mechanisms depend
inward. Distinguish domain services from application orchestration and I/O.

Place required persistence contracts with the policy needing them and
justify that ownership; do not impose one universal interface folder.
Explain restoration of stored state without resetting it through a creation
factory. Compare an overlapping Clean or Hexagonal arrangement using actual
constraints, not a second duplicate architecture stack.

If the frontend has no independent business policy, explain a smaller
client design instead of adding an empty Domain solely to match the backend.
```

## Illustrative response shape

| Proposed expense artifact | Decision exposed |
| --- | --- |
| `domain/expenses/Expense.ts` | Business state and valid transitions, independent of ORM/UI |
| `domain/expenses/ApprovalPolicy.ts` | Pure policy when the rule needs facts beyond one entity; no database lookup hidden inside it |
| `application/expenses/ApproveExpense.ts` | Load facts, authorize, apply policy and coordinate persistence |
| `application/expenses/ports/ExpenseRepository.ts` | Required stored-object access owned here because the workflow consumes it |
| `infrastructure/persistence/expenses/mapExpenseRecord.ts` | Restore supported domain state from checked stored fields |

A different justified contract owner can be compatible with Onion. The complete response still needs public APIs, transactional behavior, startup wiring and browser interactions; a domain-centered diagram does not supply these automatically.

## Review questions

Is the domain independent and behavior meaningful? Does the application coordinate rather than become a second invariant owner? Does the client avoid copying trusted server decisions? Do compared styles overlap coherently instead of multiplying folders?

[Prompt selector](README.md) · [Pattern additions](pattern-options.md)
