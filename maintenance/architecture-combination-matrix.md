# Architecture Combination Design Rehearsals

The first [shop rehearsal](agent-design-evaluation.md) inspected one coherent design. It did not test whether an agent distinguishes the documented styles or can change a presentation pattern without moving business rules. This matrix expands that design-only evaluation across the canonical [style catalog](../architecture/styles/README.md) and [pattern catalog](../architecture/patterns/README.md).

**Contents**

- [Frozen cases](#frozen-cases)
- [Candidate request](#candidate-request)
- [Independent review](#independent-review)
- [Results and limits](#results-and-limits)

## Frozen cases

Each pair keeps the product requirements stable while changing explicit design constraints. Style names and pattern choices are intentionally prompted in this test; this does not measure spontaneous style selection. Repository, reader, gateway and Facade decisions require a concrete reason. A justified rejection of a requested combination is valid when the requirements do not support it.

The table uses “same product” to keep the public overview compact. Candidate inputs must expand that shorthand into the complete paired baseline and exclusions; a fresh conversation cannot inherit the preceding row. Missing baseline information invalidates the comparison and requires a corrected fresh input, rather than being scored as a consumer-guidance defect.

| Case | Product and architecture constraints | Alternative and challenge |
| --- | --- | --- |
| L1 | Reporting: closed Layered backend, server-rendered web MVC. Public read-only product sales totals; date/category filters, pagination and empty/error states. One maintained SQL report store; no editable business objects, authentication or checkout. | Compare an open-layer variant. Evaluate a Repository per report table and a pass-through Facade. |
| L2 | Same reporting product, Layered backend with Dependency Inversion and an interactive MVVM browser. Browser owns filter drafts, URL-applied filters and asynchronous results; responsive, keyboard accessible, light/dark/system. | Show the MVC alternative and changes required to remove the inward-owned read contract. Explain whether a report reader is a Repository. |
| H1 | Support tickets: Hexagonal backend and classic interactive MVC browser. Authenticated analysts create and resolve tickets; subject must be nonblank and resolved tickets cannot resolve again. HTTP and trusted operator CLI must use the same rules; persistence is replaceable. Browser handles selection, refresh and mutations. | Replace MVC with MVVM without changing ticket rules. Evaluate adding one interface named Port for every file and calling the browser HTTP gateway a Repository. |
| H2 | Same ticket product, Hexagonal backend and MVVM browser. Assess Onion as an additional frontend constraint rather than assuming it fits. Use or decline a screen Facade based on actual collaboration. | Explain what would change under Onion and what would merely be renamed. Evaluate adding a client domain model only to fill an empty folder. |
| C1 | Expenses: Clean backend and classic interactive MVC browser. Employees submit positive-amount expenses; only designated reviewers can approve; a submitter cannot approve their own expense. Persist status with revision checks. Duplicate/conflicting approval attempts must not corrupt state. | Compare a return-result use case with an application-owned output port and presenter. Evaluate an inner operation importing a concrete presenter. |
| C2 | Same expense product, Clean backend and MVVM browser with a Layered frontend arrangement. Decide whether an approval summary coordinating selection and loading merits a Facade. | Alternate to MVC and identify binding/state changes. Evaluate exposing ORM records as use-case outputs and requiring a server ViewModel because the browser uses MVVM. |
| O1 | Library: Onion backend and classic interactive MVC browser. A member may hold at most three active loans; a copy cannot have two active loans; renewal is refused when another member has a hold. Persist loans and support authorized librarian input plus a browser. | Compare entity behavior and a domain service for renewal, identifying needed facts. Evaluate a domain model importing ORM types to restore stored loans. |
| O2 | Same library product, Onion backend and Hexagonal MVVM browser. Assess a Repository for stored loans, a read projection for availability and a Facade for selected-loan details/renewal. | Show a Clean-backend alternative with actual ownership changes or an explicit justified overlap. Evaluate stacking complete layer trees inside every table and treating the Facade as all application policy. |

All products are fictional and new. There is no existing implementation, schema, approved stack or executed application check. No payments, distributed services or additional product areas are implied. For state-changing products, the design must account for trusted identity, resource access, concurrent changes and unknown outcomes in proportion to its operation. Technology and framework behavior remain conditional unless verified against a primary source.

## Candidate request

Each candidate receives a separate empty consumer workspace, adapted application instructions, exactly the relevant copied consumer skills and a pinned reference snapshot. The controller starts a new conversation with no parent history, previous answer, correction feedback or reviewer rubric. One candidate runs at a time, while independent review may overlap preparation of the next case. Shared generic tools/platform instructions remain an explicit isolation limit.

The request is design-only:

> Read the supplied application instructions and copied assessment/backend/frontend skills. Design only the assigned case. Produce a detailed backend/frontend scheme with subfolders, important artifacts and public contracts, ownership and permitted source dependencies. Separate runtime behavior and startup wiring. Justify consequential decisions and omissions with actual source paths and sections, distinguishing requirements, conventions and inferences. Explain the requested alternative and evaluate the challenged proposal. Trace one operation, its meaningful failures and its browser state. Give rule/integration/new-caller change impact and observable proposed checks, including legal/illegal dependency cases. Do not implement, install, run or deploy an application; do not report proposed checks as passed.

Candidates save the frozen Markdown scheme as their response artifact outside the consumer workspace, with a short read inventory and provenance/activation limits. This avoids reproducing the same large answer in both chat and an archival follow-up. No other writes are authorized. A compact scheme should concentrate detail on the assigned distinctions rather than repeat an entire handbook; a soft target of 1,500–2,000 words does not excuse missing a consequential mechanism.

The [design review](../architecture/foundations/architecture-design-review.md) remains the common acceptance method. The reference snapshot excludes maintenance evidence, private maintainer roles and previous candidate responses. Exact input revisions, frozen response hashes, findings and corrections are recorded per attempt.

## Independent review

The reviewer fixes acceptance criteria before receiving a candidate answer. Review includes the distinguishing style constraint, actual pattern collaboration, ownership/contracts, source/runtime/composition relationships, behavior/failure mechanisms and source/verification honesty. A familiar folder tree or a new filename is insufficient.

The closed Layered case must not be rejected merely for allowing Business to depend on Data Access. That is a documented variant, distinct from the separate Dependency Inversion choice. Similarly, MVC and MVVM describe interaction roles; a React hook, server template-data object, gateway or barrel does not establish a pattern by its name. Overlapping constraints may coexist when their scope is explicit; four duplicated architecture stacks do not demonstrate a coherent combination.

Inspect the actual sources and frozen answer. If a substantive defect appears, retain that failed attempt, identify whether its owner is guidance or candidate behavior, correct the smallest demonstrated guidance defect, publish and repeat that case in another fresh context. Do not feed reviewer fixes back into the same candidate and count that as a clean retest. Follow the bounded correction policy in [Design Rehearsal](../agent-onboarding/design-rehearsal.md#review-and-repeat).

## Results and limits

The following results refer to frozen responses, independently reviewed against the six criteria before publication. All attempts use input revision `1c9deb1558b9d50737d6979dabab308350468c67` unless a row states otherwise. The controller additionally checks reference hashes, exact skill copies and an unchanged four-file consumer workspace. Read inventories are candidate self-reports, not independently captured full tool transcripts.

| Case | Frozen response | Independent verdict and decisive evidence |
| --- | --- | --- |
| L1 | [Attempt 01](design-rehearsals/l1-attempt-01.md) | PASS, design-only: preserves closed Business-to-Data-Access dependency, request/response MVC and pure reporting projection; rejects per-table Repositories and a forwarding Facade. Source, browser and failure traces agree. |
| L2 | [Attempt 01, invalid input](design-rehearsals/l2-attempt-01.md); [Attempt 02](design-rehearsals/l2-attempt-02.md) | PASS, design-only: Complete public reporting scope, inward-owned reader and separate MVVM state/commands/binding. Explains the concrete dependency changes when removing DIP and rejects Repository semantics for a projection reader. Corrected fresh input at `d9a861cc7189ac988ed03e133ce6c765047afaf6`; attempt 01 remains invalid, not a pass. |
| H1 | [Attempt 01](design-rehearsals/h1-attempt-01.md) | PASS, design-only: Identifies offered operations and required adapters, shares HTTP and CLI rules, and implements classic Model notifications with View subscriptions. Distinguishes gateway from Repository and rejects interface-per-file ceremony. |
| H2 | Pending | Not yet evaluated |
| C1 | Pending | Not yet evaluated |
| C2 | Pending | Not yet evaluated |
| O1 | Pending | Not yet evaluated |
| O2 | Pending | Not yet evaluated |

No substantive consumer-guidance defect was demonstrated by L1 or the invalid L2 input. L1's unresolved accounting/calendar definitions are explicit assumptions to resolve before implementing aggregation. L2 exposed a controller preparation error; the preparation procedure now explicitly requires a self-contained baseline, and unstarted paired inputs are expanded before launch. The invalid response remains frozen as evidence. A design verdict does not verify a database or rendered page; later attempts remain pending until their actual answers are reviewed.

This is a deliberately selected coverage matrix, not every Cartesian combination of all patterns, all technologies or all requirements. It includes style/pattern combinations, alternatives, mixed frontend/backend constraints and rejection challenges. It does not establish implementation quality, automatic skill selection, model comparisons, statistical reliability or causal improvement over earlier guidance.
