# Discuss a Clean Design

Clean protects policy from technical details. It helps when business decisions, operations, boundary translation and frameworks need independent evolution. It can add ceremony when operations only forward calls. The [Clean guide](../styles/clean-architecture/README.md) explains its conceptual circles and practical mapping.

**Contents**

- [Copyable addition](#copyable-addition)
- [Illustrative response shape](#illustrative-response-shape)
- [Review questions](#review-questions)

## Copyable addition

Append this to the [base request](design-request.md#copyable-request):

```text
Evaluate Clean for the supplied product. Read the Clean guide and relevant
dependency/composition sections. Identify business policy, application
workflow, interface translation and external mechanisms; map conceptual
circles to concrete owners without requiring four rigid folder names.

Show inward source dependencies, including type imports and reexports.
Explain how external representations become operation inputs/results.
Compare a returned result with an application-owned output port implemented
by an outer presenter. Choose proportionately; neither approach authorizes
the operation to import the concrete presenter or ORM record.

If MVC or MVVM is requested, locate its interaction roles inside the
surrounding design. Do not equate MVC Model with the entire Domain layer
or require browser patterns to appear identically in the backend.
```

## Illustrative response shape

| Proposed expense artifact | Decision exposed |
| --- | --- |
| `domain/expenses/Expense.ts` | Authoritative positive-amount and valid-transition behavior |
| `application/expenses/ApproveExpense.ts` | Obtain trusted facts, apply reviewer/self-approval policy and coordinate conditional persistence |
| `application/expenses/contracts/ApproveExpenseResult.ts` | Returned outcome owned independently of HTTP and screen fields |
| `presentation/http/expenses/mapApprovalResponse.ts` | Translate the outcome to the public representation |
| `infrastructure/persistence/expenses/SqlExpenseStore.ts` | Implement the required persistence capability |

If an output port is selected instead, its contract belongs inward and an outer presenter implements it. Adding that contract does not introduce an extra runtime forwarding object by itself. MVC/MVVM mapping and startup assembly remain separate decisions.

## Review questions

Does the scheme protect actual policies rather than only rename folders? Can it explain both source direction and the outward runtime call? Do outputs expose inward-owned values rather than database/framework representations?

[Prompt selector](README.md) · [Pattern additions](pattern-options.md)
