# Discuss a Layered Design

Layered separates kinds of work and declares how they may interact. It is useful when delivery, business behavior and data access have distinct reasons to change. A tiny read may not justify several forwarding operations. The [Layered guide](../styles/layered-architecture/README.md) owns the explanation.

**Contents**

- [Copyable addition](#copyable-addition)
- [Illustrative response shape](#illustrative-response-shape)
- [Review questions](#review-questions)

## Copyable addition

Append this to the [base request](design-request.md#copyable-request):

```text
Evaluate Layered for the supplied product. The requested arrangement is
[CLOSED / OPEN / COMPARE BOTH], with [DIP REQUIRED / DIP OPTIONAL]. Read
architecture/styles/layered-architecture/README.md before mapping files.

Declare allowed source imports and runtime calls. Explain any bypass in
an open arrangement. If using Dependency Inversion, identify who owns the
required contract and which concrete adapter implements it. Compare with
the non-inverted layered alternative; do not assume every layered design
already satisfies Clean's Dependency Rule.

Place delivery, business behavior and data access by their responsibilities.
Split Domain and Application only where justified. Keep the frontend's
chosen interaction pattern explicit rather than calling every server
controller a complete MVC implementation.
```

## Illustrative response shape

For expense approval under a **closed, non-inverted** arrangement:

| Proposed artifact | Decision exposed |
| --- | --- |
| `presentation/expenses/ApproveExpenseHandler.ts` | Parse transport input and call Business; no direct data access |
| `business/expenses/ApproveExpense.ts` | Coordinate access, self-approval rule and conditional status change |
| `data-access/expenses/SqlExpenseStore.ts` | Persist through a version-aware operation; Business may import this concrete data-access API in the chosen non-inverted arrangement |
| `composition/bootstrap.ts` | Supply store, workflow and handler |

An inverted alternative moves the required storage contract to its consumer and makes the adapter depend on it. The runtime may still call the same store object. Exact transaction guarantees and frontend contracts need the full design; the table alone does not establish them.

## Review questions

Can the response name the permitted lower-layer dependency and forbidden bypass? Does changing to DIP actually change contract ownership/imports? A Repository per table or a Facade that only forwards one call needs justification, not automatic acceptance.

[Prompt selector](README.md) · [Pattern additions](pattern-options.md)
