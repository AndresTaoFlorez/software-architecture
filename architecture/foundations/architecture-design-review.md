# Review an Architecture Before Implementation

A shop proposal can name Domain, Application and Infrastructure while leaving checkout rules inside a controller. A folder map cannot reveal that mistake unless it also identifies the rule, its owner and the interaction that uses it. A design review makes these decisions inspectable before code is written.

This is a handbook review convention for consequential designs. Application requirements and accepted decisions remain authoritative. A small change can use a few rows; a new frontend and backend need enough detail to trace both sides. The review does not require unused layers, a particular framework or a new application.

**Contents**

- [Establish the decision and evidence](#establish-the-decision-and-evidence)
- [Describe owners and supported interactions](#describe-owners-and-supported-interactions)
- [Trace behavior across boundaries](#trace-behavior-across-boundaries)
- [Challenge the design before accepting it](#challenge-the-design-before-accepting-it)

## Establish the decision and evidence

Record the application instructions, handbook revision, requirements, constraints and unresolved assumptions. In a new application, there may be no source, tests or accepted decisions to inspect; state that explicitly. A missing fact remains a question or a conditional choice, rather than an invented requirement.

For each consequential decision, record:

| Field | Evidence needed |
| --- | --- |
| Requirement or change pressure | The behavior or constraint that needs an owner |
| Choice and location | The responsible module, exact proposed path and supported interaction |
| Reason and cost | Why it fits, a plausible alternative, its trade-off and a condition for reconsideration |
| Basis | Application requirement, architectural constraint, handbook convention, framework requirement or design inference |
| Source and application | A handbook path and section, or a verified primary source, plus how it supports this particular choice |
| Verification | The observable case that would challenge the decision; label it proposed until executed |

A citation supports a stated principle; it does not automatically support the chosen shop filenames, stack or transaction algorithm. Mark those choices as inferences and explain them. An unread reference is not evidence. Resolve copied skills' handbook paths against the verified reference checkout, not against the application.

## Describe owners and supported interactions

Use [Code Placement](code-placement.md), [Dependency Boundaries](dependency-boundaries.md), [Composition](composition-root.md) and [Module Boundaries](module-boundaries-and-public-apis.md) as the common model. Apply the [backend](../backend/README.md) and [frontend](../frontend/README.md) routes to the respective delivery environments.

Show the proposed physical map using a path table or a diagram with explicit containment semantics. For every proposed branch and important artifact, identify its responsibility, public entry, permitted consumers and relevant forbidden dependency. Name the capability inside each chosen layer. Separate framework-required directories, generated files and assets from architectural owners; a directory called `content` is not automatically another layer.

Account for Domain, Application, Infrastructure, Presentation and startup composition on each side in scope. A responsibility may be absent, combined or supplied by a framework when the actual behavior justifies it. State where its work goes and why that does not conceal policy. Omit an empty layer instead of fabricating operations. A workflow that coordinates rules and I/O needs an explicit owner even when it occupies one function.

List the important contracts with their inputs, outputs, meaningful failures and ownership. Distinguish an external DTO from an application command/result, a domain value and component props. A Repository or another port needs a concrete consumer and substitution or boundary pressure; a database table alone does not justify it. Shared code needs actual consumers and one authoritative owner.

Frontend designs also identify:

- Pages, capability components, colocated props/styles, screen interactions and public capability APIs.
- The owner and lifetime of local UI state, URL state, server-owned data and reusable application workflows. Explain any cache or state-library choice.
- Loading, empty, error and retry behavior, plus stale responses, cancellation and mutation ordering where the interaction permits them.
- API response parsing/mapping, presentation formatting and the backend's authority over persisted rules.
- Keyboard/focus and accessible feedback; when appearance/theme is in scope, styling ownership, semantic tokens, theme authority and responsive behavior. Apply [Styling and Design Systems](../frontend/styling-and-design-system.md) without assuming Panda or duplicating a framework's theme provider.

Backend designs identify delivery parsing, trusted identity and resource authorization, application coordination, authoritative business invariants, persistence/integration adapters and composition. Describe transaction ownership, concurrent changes and retries when they affect the requirement. An interface or in-memory test does not establish a database guarantee. Use [API Design](../api-design/README.md) for public contract and protocol decisions; keep one contract shared by the client and server descriptions.

## Trace behavior across boundaries

Trace one meaningful operation through the participating parts in scope. For a combined frontend/backend task, follow user intent through the frontend, transport, backend operation and rule, integration and visible outcome. Add the failure branches that could invalidate the requirement. Name the actual proposed artifacts at each step.

Keep three relationships distinct:

| Relationship | Question answered |
| --- | --- |
| Source dependency | Which module imports which supported contract or implementation? |
| Runtime call | Which supplied object invokes which operation with what data/result? |
| Startup composition | Where are implementations created and supplied to their consumers? |

For example, an application operation can import its own required persistence contract while calling the supplied database adapter at runtime. Startup imports both to connect them. Drawing the runtime call toward the database does not authorize an Application import from Infrastructure.

Trace malformed input, forbidden resource access, invalid business transitions and relevant external failures separately. A client error message cannot establish server enforcement. A retryable request needs defined behavior when the first outcome is unknown; merely naming an idempotency key does not explain its scope or repeated/concurrent use.

## Challenge the design before accepting it

Simulate three changes: one business rule, one integration and one additional capability or caller. Name the files and contracts that change and explain the effect on consumers. If a supposedly private change spreads across unrelated screens, revisit the boundary.

Propose checks with input, expected result and the boundary exercised. Include at least one permitted and one forbidden dependency example when structural constraints are part of the design. Follow [Architecture Testing](architecture-testing.md); keep behavioral, contract, structural and visual evidence distinct.

A reviewer checks the actual paths, contracts and traces against the cited sections. Unsupported choices, conflicting client/server contracts, missing owners and an invalid success/failure trace remain findings even when the folder map looks familiar. Resolve them before implementation of the affected slice. Record the inspected revision, finding, correction and remaining uncertainty.

A design-only verdict means that the inspected plan is coherent within its stated assumptions. It does not establish compiling code, runtime security, database isolation, accessible rendering or successful deployment. A [fresh-session rehearsal](../../agent-onboarding/design-rehearsal.md) can test whether the onboarding material elicits this evidence without constructing another application.

[Foundations](README.md) · [Agent onboarding](../../agent-onboarding/README.md)
