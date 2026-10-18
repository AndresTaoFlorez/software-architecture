# Consumer Architecture Design Evaluation

The first documentation-site implementation needed corrective supervision before its architecture reflected the handbook. That is evidence of a failed delivery process, not enough evidence to attribute the failure entirely to the architecture chapters. This evaluation tests whether revised onboarding can elicit an inspectable design before implementation.

**Contents**

- [Diagnosed gaps and corrections](#diagnosed-gaps-and-corrections)
- [Frozen input and isolation](#frozen-input-and-isolation)
- [Review criteria](#review-criteria)
- [Observed result](#observed-result)
- [Verification limits](#verification-limits)

## Diagnosed gaps and corrections

The maintainer review found useful existing guidance on proportionality, authoritative rules and inward source dependencies. The demonstrated gaps were in the design workflow and its acceptance evidence:

| Location at the previous revision | Gap | Correction |
| --- | --- | --- |
| Assessment skill, Workflow step 5 | A design could end at an abstract recommendation or ADR | Require a concrete scheme through the canonical design review |
| Backend skill trigger and both implementation workflows | Design-only work was absent or unclear | Add an explicit design mode without implementation or invented execution results |
| Application instructions and start-prompt templates | Implementation/review reporting assumed existing code and checks | Add proposed artifacts and unexecuted checks for a new design |
| Onboarding's skill checks | Discovery, invocation and selection did not evaluate design quality | Add a bounded fresh-context design rehearsal and independent verdict |
| Frontend skill reference routing | Appearance/theme work did not route to the styling guide | Consult styling ownership when appearance/theme is in scope |

The correction was independently reviewed and published as [`ee5528ba07dec9d47c3e1fc3a82c3b34d7e5e0f5`](https://github.com/AndresTaoFlorez/software-architecture/commit/ee5528ba07dec9d47c3e1fc3a82c3b34d7e5e0f5). The canonical [Architecture Design Review](../architecture/foundations/architecture-design-review.md) owns the criteria; skills and templates route to it. No application implementation or private maintainer skill was added to the public handbook.

## Frozen input and isolation

Attempt 01 used the shop scenario in [Design Rehearsal](../agent-onboarding/design-rehearsal.md#request-only-a-design) and reference revision `ee5528ba07dec9d47c3e1fc3a82c3b34d7e5e0f5`. Requirements included public catalog search, authenticated persisted carts and order creation, authoritative server prices/stock/access, concurrent checkout and unknown-outcome retry safety, accessible responsive screens and light/dark/system appearance. Payment, shipping, tax, administration and multiple merchants were excluded. No stack, code or existing tests were supplied.

The controller started a Codex collaboration worker with `fork_turns=none`: no parent conversation, earlier design, previous correction or reviewer rubric was supplied. The consumer workspace was a new directory containing adapted application instructions and exact copies of only `architecture-assessment`, `backend-architecture` and `frontend-architecture`. The task explicitly requested reading those skills and returning a source-backed architecture scheme, limited to approximately 3,500 words. It prohibited code, package installation, servers, deployment and further agents.

A separate reference snapshot contained 108 committed files exported with `git archive` from the pinned revision: the handbook README, glossary, architecture guides and onboarding material. A controller-generated SHA256 manifest recorded the exported contents. There was no `.git` inside that snapshot. This establishes snapshot provenance/integrity through the controller receipt, rather than an independent Git revision lookup by the candidate.

This was a fresh conversation and consumer workspace, not a fresh machine, account or model process. Generic platform instructions and tools remained shared. No private Hermes profile or maintainer memory was supplied. The platform's exact model identifier/version was not independently exposed in the run receipt; no model comparison is claimed.

## Review criteria

An independent reviewer fixed the criteria before seeing the answer: scope/provenance; proportionate decisions and alternatives; exact owners/contracts; separate source/runtime/composition relationships; checkout concurrency; unknown-outcome retries; client/server agreement and browser ownership; and change simulations with proposed checks.

Significant defects in required behavior, contradictory contracts/dependency direction, implementation outside scope or fabricated execution results prevent acceptance. Familiar folder names and a long source list do not establish a pass. Justified absent layers are allowed. The reviewer inspects the pinned sources and mechanisms rather than comparing with a preferred shop solution.

## Observed result

**Attempt 01: accepted as a design-only response under its stated assumptions.** The independently reviewed [frozen answer](design-rehearsals/shop-attempt-01.md) was not coached or rewritten after submission. The reviewer reported no blocking defect or further guidance correction. The controller also inspected the answer, its source attributions and cross-boundary behavior. No second candidate was started: an additional correction round needs a demonstrated defect.

| Frozen criterion | Observed evidence in the candidate |
| --- | --- |
| Scope and provenance | Identifies the pinned archive, explicit copied skills and absent application; distinguishes archive hashing from resolving Git HEAD |
| Proportionate decisions | Labels requirements, conventions and inferences; proposes a modular backend, conditional stack and manual wiring with costs/alternatives |
| Owners and contracts | Gives both-side paths, subfolders and important contracts, public entries, parsers/mappers and authoritative server rules; justifies absent frontend Domain |
| Dependency, runtime and composition | Separates inward source imports from supplied adapter calls and startup construction; prohibits inner imports of concrete infrastructure |
| Concurrent checkout | Explains cart revision locking, deterministic product locks and atomic stock/order/cart/attempt writes; proposes real database contention/rollback checks |
| Unknown-outcome retry | Defines customer/operation/key scope and command fingerprint, serializes/replays before checking the consumed cart, preserves the original key and records terminal outcomes |
| Browser and shared contract | Defines matching interaction boundaries, local/URL/server state ownership, cancellation/order/recovery, focus/feedback and one theme authority |
| Change and verification | Simulates rule, integration and new-caller changes; proposes observable behavior, contract, structural and rendered-state checks without claiming execution |

The independent reviewer inspected the cited principles against the pinned snapshot: all 17 cited handbook file paths exist and the named sections are present. The reviewer found no unsupported attribution. The shop-specific paths and transaction algorithm are explicitly design inferences; the source material does not certify that algorithm or a particular database configuration.

The frozen private UTF-8 answer has SHA256 `671b9e25daa78e49482a71a9c268f3a4754f61959c1c14243eda015047f22b59` and 23,383 bytes. The public evidence preserves the answer except for one declared local-path redaction and an editorial preface. The candidate's later archival task authorized only saving that response and its separate self-reported read inventory; it supplied no corrections or preferred design.

After the candidate and archival task, the controller rechecked all 108 reference-file hashes, the exact three copied skill files and the consumer workspace inventory. The workspace still contained only its instructions and copied skills: no application implementation files. Self-reported tool problems included truncated reads and failed hash-check attempts; a successful Python hash check superseded the failed checks. Hashing files does not establish semantic reading of every file.

The guidance commit's [Site checks run](https://github.com/AndresTaoFlorez/software-architecture/actions/runs/39151590687) succeeded at exact head `ee5528ba07dec9d47c3e1fc3a82c3b34d7e5e0f5`. These checks validate handbook/site integration, not the fictional shop. Relative-link and whitespace checks cover the added evidence separately. No implementation acceptance is implied by the design verdict.

## Verification limits

This is an explicitly prompted design task. It does not test automatic skill discovery, automatic task-based selection, unprompted source attribution or the quality of implemented software. The candidate's read inventory is a self-report, not an independently captured full tool transcript; source claims require review against actual files.

No pre-change control trial was run. A successful response can demonstrate that the revised guidance was used coherently in this case; it cannot establish the causal improvement, a statistical success rate, provider equivalence or reliable behavior on different products. The original site failure remains a reason to require design review and subsequent implementation evidence, rather than treating this rehearsal as a universal certification.
