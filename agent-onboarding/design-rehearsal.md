# Test Architecture Guidance With a Fresh Design Session

An agent can discover a skill and still produce a design whose rules have no clear owners. A design-only rehearsal tests that next step without paying for an application implementation. It supplements the discovery, invocation and selection checks in [agent onboarding](README.md#use-and-test-the-available-skills).

**Contents**

- [Prepare a clean consumer context](#prepare-a-clean-consumer-context)
- [Request only a design](#request-only-a-design)
- [Review and repeat](#review-and-repeat)

## Prepare a clean consumer context

1. Freeze a handbook revision and keep its contents read-only for the candidate. Create a separate, empty consumer workspace outside the handbook. Adapt the application instructions with the reference path, exact revision, requirements and design-only scope. Make every case self-contained: expand shorthand such as “the same product” into the actual baseline requirements and exclusions before starting a fresh conversation. Check that the candidate can obtain every required fact from its permitted inputs.
2. Copy only relevant application skills into the runtime's supported discovery directory. For a combined new design, assessment, backend and frontend are a reasonable starting set; explicitly read the API guide if a public contract needs deciding. Record the copied files and activation method. Do not substitute the private handbook-maintainer roles.
3. Start a new conversation with no resumed history, previous answer, correction feedback or maintainer memory. State the isolation actually achieved: a new conversation is not necessarily a fresh model process, account or machine. Shared generic platform instructions may remain. Verify the application instructions and copied skills were actually read.
4. Keep the reviewer rubric and previous attempts outside the candidate's supplied context. Freeze requirements and review criteria before seeing the answer. Do not pass a preferred architecture or a sample answer as part of the scenario.

Use bounded reading and one candidate at a time. The handbook is available for targeted consultation; loading every guide is unnecessary. No server, package installation, implementation or deployment is needed.

## Request only a design

Use the same scenario for a correction round. This example is deliberately small enough to inspect in one response:

> Design a single-merchant shop with a public searchable catalog, an authenticated customer's persisted cart, quantity changes and checkout creating an order. The backend owns current prices, stock and resource access. Checkout must avoid overselling under concurrent requests and duplicate orders after a retry whose first outcome is unknown. Payment, shipping, tax, administration and multiple merchants are excluded. The browser needs usable loading/error/empty states, keyboard access, responsive layout and light/dark/system appearance. The application is new: there is no existing code, schema, test suite or accepted stack decision. Select proportionate technologies or mark conditional choices.
>
> Read the supplied application instructions and relevant installed skills. Return only an architecture scheme for backend and frontend, including subfolders, important artifacts and contracts. Justify each consequential decision and omission, give its actual source path and section, and distinguish requirements from handbook conventions and design inferences. Detail one end-to-end operation and its failure paths, dependency/composition relationships, change impact and proposed checks. Follow the handbook's architecture design review. Do not implement the shop or claim that proposed checks passed.

The request deliberately asks for reasoning. It tests explicit use of supplied skills and references; it does not establish automatic skill selection, unprompted citation behavior or general implementation competence. Different product constraints need their own scenario rather than silently expanding this one.

For broader coverage, a [style and pattern combination matrix](../maintenance/architecture-combination-matrix.md) records separate cases for each documented style, presentation-pattern alternatives and challenged combinations. In such a comparison, the assigned style is an explicit experiment constraint rather than an unprompted choice. Check its fit and actual mechanism; permit justified rejection and overlapping constraints instead of forcing identical architecture labels onto every product.

## Review and repeat

Review against [Architecture Design Review](../architecture/foundations/architecture-design-review.md). Check citations in the actual pinned files, then inspect ownership, contracts and the traced behavior. A general source list cannot replace decision-level reasoning. Accept justified omissions; reject hidden coordination, unsupported guarantees and architectural vocabulary without a mechanism.

Record the scenario, exact input revision, model/runtime when observable, session/attempt identifier, activation/read evidence, answer and findings. Distinguish the raw answer from the reviewer's corrections. Keep private execution traces and credentials outside public evidence; publish a sanitized design response and sufficient findings to assess the verdict. Redactions must be declared.

Fix the smallest demonstrated defect in the canonical guide or skill that owns it, review the change and publish it. Start another fresh session against that new revision, with the same task and without the previous answer or findings. A corrected response in the same conversation tests coaching rather than onboarding.

After two correction rounds with substantial unresolved defects, reassess the scenario, guidance or runtime instead of continuing an unbounded loop. Report partial results honestly. Passing one scenario shows that one design response met the inspected criteria; implementation quality, other agents and other requirements remain untested.

[Back to onboarding](README.md)
