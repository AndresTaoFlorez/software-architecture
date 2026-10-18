# Start a Design Conversation

A useful architecture request describes a user action and its constraints before asking for folders. This base prompt is shared by the [style additions](README.md#choose-a-starting-prompt); it avoids repeating the same evidence requirements in every style prompt.

**Contents**

- [Copyable request](#copyable-request)
- [Example product input](#example-product-input)
- [Expected response outline](#expected-response-outline)

## Copyable request

Replace every bracketed value. An explicit `none` or `unknown` is preferable to an invented project fact.

```text
Work in the consuming application [APPLICATION / WORKSPACE].
Read its instructions at [APPLICATION INSTRUCTION PATH].
The read-only architecture handbook is at [ACCESSIBLE PATH OR PINNED URL],
approved revision [FULL SHA / SUPPLIED-EXCERPT PROVENANCE]. Verify available
provenance and report mismatches or unavailable material.

Product: [COMPLETE REQUIREMENTS, ACTORS, RULES, OBSERVABLE OUTCOMES].
Excluded: [EXPLICIT NON-GOALS].
Existing source/ADRs/contracts: [LOCATIONS, OR NONE FOR A NEW APPLICATION].
Stack/versions/deployment constraints: [APPROVED CHOICES OR UNDECIDED].
Sides in scope: [BACKEND / FRONTEND / BOTH].
Style/pattern constraints: [NONE, OR APPEND ONE OF THE ADDITIONS].

Explicitly use the reviewed application-facing skills [INSTALLED NAMES AND
PATHS] when available; otherwise read the relevant handbook material and
report the absence of skill activation. Application instructions remain
authoritative. Read only the guides needed for the actual decision.

Return only a detailed architecture scheme. Do not create application code,
install dependencies, start servers or deploy. For an existing application,
inspect affected callers/contracts/source and preserve accepted decisions.
For a new one, state that no code or executed tests exist.

Follow architecture/foundations/architecture-design-review.md:
- State requirements, assumptions, exclusions and unresolved decisions.
- Map subfolders and important artifacts on each side in scope; give each
  responsibility, supported entry, contract and permitted consumer an owner.
  Justify omitted or combined roles and framework-specific directories.
- Keep source imports, runtime calls and startup composition distinct.
- Trace one meaningful operation, its failures and relevant UI state,
  identity/access, concurrency and retry behavior.
- For each consequential choice, cite the actual handbook path and section,
  explain how it supports the choice, and distinguish requirements,
  handbook conventions, framework requirements and design inferences.
- Compare a plausible alternative and show rule/integration/new-caller
  change impact. Propose observable positive/negative checks. Report any
  actual source/review checks separately from unexecuted application tests.

Prefer path/contract tables over decorative diagrams or a giant file list.
Explain mechanisms and trade-offs; do not add a layer, port, repository,
state library or pattern only to complete a taxonomy. If a requested
combination conflicts with requirements or approved policy, explain the
conflict and propose the smallest compatible alternative.
```

## Example product input

An expense application can supply: “Employees submit positive-amount expenses. Only designated reviewers can approve, and nobody can approve their own submission. Persist status with revision checks; conflicting or duplicate approval attempts must not corrupt state. Include a browser and backend. Exclude payments, payroll and multi-company administration. No code, stack or accepted ADR exists.”

This supplies one complete product boundary. It does not decide whether Layered, Clean or Onion is necessary; the requested constraints and actual change pressure decide that.

## Expected response outline

| Section | Expected content |
| --- | --- |
| Evidence and decision | Verified reference, observed project facts, assumptions and fit |
| Physical map and contracts | Exact proposed owners/files, inputs, outputs, failures and supported APIs |
| Relationships and operation | Separate imports/calls/assembly, one full interaction and rejection paths |
| Alternatives and change | Concrete dependency/state differences and affected owners |
| Proposed checks and limits | Inputs/expected outcomes, legal/illegal dependencies, unverified guarantees |

This is an outline, not an accepted solution. Full criteria belong to [Architecture Design Review](../foundations/architecture-design-review.md).

[Prompt selector](README.md)
