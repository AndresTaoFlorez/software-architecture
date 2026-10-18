# Architecture Prompts

An agent needs a concrete requirement before a style name can help. These prompts connect application requirements to the handbook's ownership and dependency questions. They request a design scheme first, so its decisions can be reviewed before implementation.

**Contents**

- [Choose a starting prompt](#choose-a-starting-prompt)
- [Use the prompts](#use-the-prompts)
- [Recognize a useful response](#recognize-a-useful-response)
- [Repeat the architecture checks](#repeat-the-architecture-checks)

## Choose a starting prompt

| Current problem | Starting point | Fit and cost to examine |
| --- | --- | --- |
| The style is undecided | [Design request](design-request.md), with no style addition | Compare only plausible options; a simple operation may need few boundaries |
| Separate delivery, business behavior and data access | [Layered](layered.md) | Declare allowed layer interactions; Dependency Inversion is an additional choice |
| The same operation must survive caller or integration changes | [Hexagonal](hexagonal.md) | Identify purposeful interactions and substitutes; avoid one interface per file |
| Protect business policy and operations from translation/framework details | [Clean](clean.md) | Trace policy levels and boundary representations; avoid pass-through ceremonies |
| A meaningful, long-lived domain model needs an independent center | [Onion](onion.md) | Identify actual domain behavior; empty domain folders do not justify the cost |
| Screen interaction or a collaboration needs more structure | [Pattern additions](pattern-options.md) | Choose MVC/MVVM, Repository or Facade for its mechanism, not its name |

The styles can overlap. Different processes or frontend/backend applications may use different constraints. A browser without independent business policy may reasonably omit a Domain layer even when its backend is domain-centered. The [style catalog](../styles/README.md) and [presentation pattern map](../patterns/presentation/README.md) explain the distinctions.

## Use the prompts

1. Adapt the application's own instructions using [agent onboarding](../../agent-onboarding/README.md). Supply an accessible handbook location and a reviewed revision.
2. Copy the [base request](design-request.md#copyable-request), replace every bracketed value and provide complete product requirements and exclusions.
3. Append one style addition only when a style is an actual constraint or comparison target. Append only relevant [pattern additions](pattern-options.md); explain the pressure that motivates them.
4. Review the response with [Architecture Design Review](../foundations/architecture-design-review.md). Implementation requires its own authorized task after the affected design decisions are resolved.

Prompts supplement the application's instructions and selected consumer skills. They neither install a skill nor override accepted application decisions. For existing software, inspect the affected source before proposing a new boundary.

## Recognize a useful response

The style pages show small illustrative response shapes. These are author-written orientation examples, not executed test results or mandatory folder trees. A complete response must also explain contracts, dependencies, runtime behavior, startup assembly, failures and verification limits.

| Part of the response | Useful evidence |
| --- | --- |
| Requirement | The observable behavior and authoritative decision owner |
| Proposed map | Exact paths, subfolders, important artifacts, public entry and allowed consumers |
| Decision | Specific source section, how it applies, alternative/cost and inference label |
| Operation | Concrete success/failure trace across the parts in scope |
| Change | Files/contracts affected by a rule, integration or caller change |
| Verification | Observable proposed checks, with executed evidence reported separately |

The [frozen rehearsal responses](../../maintenance/architecture-combination-matrix.md#results-and-limits) are larger historical examples with actual verdicts. Pending or invalid attempts remain labeled; their existence does not establish acceptance.

## Repeat the architecture checks

Use the [design regression suite](regression.md) after changing guidance, skills or these prompts. It supplies self-contained cases, change-based selection, a separate reviewer prompt and a result template. Store new results at their exact input revision; do not overwrite earlier evidence.

[Architecture map](../README.md) · [Repository home](../../README.md)
