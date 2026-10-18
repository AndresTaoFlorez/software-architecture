# Repeatable Design Regression Suite

A changed skill can still load while producing a weaker design. This manual semantic suite repeats design conversations and independently reviews their decisions. Site/link/build checks establish different evidence; they do not execute these model conversations or certify their answers.

**Contents**

- [Choose cases after a change](#choose-cases-after-a-change)
- [Prepare a run](#prepare-a-run)
- [Candidate prompt](#candidate-prompt)
- [Self-contained cases](#self-contained-cases)
    - [L1: closed Layered and server MVC](#l1-closed-layered-and-server-mvc)
    - [L2: Layered with DIP and MVVM](#l2-layered-with-dip-and-mvvm)
    - [H1: Hexagonal and classic MVC](#h1-hexagonal-and-classic-mvc)
    - [H2: Hexagonal and MVVM with Onion assessment](#h2-hexagonal-and-mvvm-with-onion-assessment)
    - [C1: Clean and classic MVC](#c1-clean-and-classic-mvc)
    - [C2: Clean and MVVM with Layered frontend](#c2-clean-and-mvvm-with-layered-frontend)
    - [O1: Onion and classic MVC](#o1-onion-and-classic-mvc)
    - [O2: Onion and Hexagonal MVVM frontend](#o2-onion-and-hexagonal-mvvm-frontend)
- [Independent reviewer prompt](#independent-reviewer-prompt)
- [Record and compare results](#record-and-compare-results)

## Choose cases after a change

| Changed meaning or behavior | Minimum relevant rerun |
| --- | --- |
| Foundations, selection, design-review contract, consumer skills or common candidate prompt | All eight cases |
| One style's guidance or prompt | Its pair plus one other style as a control |
| MVC responsibilities/update mechanism | L1, H1, C1, O1 |
| MVVM responsibilities/update mechanism | L2, H2, C2, O2 |
| Repository/reader/gateway or Facade guidance | All eight, including L1's negative use and L2's projection-reader/contract comparison |
| Browser state, asynchronous behavior or styling | Affected interactive cases; include L2 for appearance/theme |
| Scenario preparation, reference resolution or reviewer criteria | Recheck fixtures and all eight cases against the changed procedure |
| Typo/link fix without changed meaning | Mechanical checks; record why no model rerun is needed |

Freeze selected IDs and reasons before reading answers. A subset does not establish a full-suite pass. Run all cases before accepting a broad guidance release. Model/provider changes require separately labeled runs rather than attributing differences solely to handbook edits.

## Prepare a run

Follow [Design Rehearsal](../../agent-onboarding/design-rehearsal.md) for isolation and correction mechanics.

1. Record handbook and suite/prompt revisions, selected IDs, copied skill hashes and observable model/runtime/settings. Preserve earlier evidence.
2. Create a fresh empty consumer workspace for each case, adapt its [application instructions](../../agent-onboarding/templates/AGENTS.md) and copy relevant consumer skills. Supply a curated read-only export of the pinned README, glossary, canonical architecture guides and consumer skill sources, excluding `maintenance/` and `architecture/prompts/`. Those exclusions remove historical answers, orientation examples, case catalog and benchmark-specific reviewer prompt. Record the included paths/hashes and exclusions in a controller receipt; the subset has export provenance, not a complete Git checkout. Canonical design-review guidance remains available. Verify the actual supplied view, not merely its directory name. Maintainer roles and handbook-root instructions are not application instructions.
3. Fill the candidate prompt below and append one complete case block. Resolve every placeholder and check all product facts/exclusions are present. “Same product” without its baseline invalidates the input.
4. Start a new conversation without parent history, earlier answers, corrections or the benchmark reviewer rubric. Restrict read tools to the consumer workspace and curated reference when supported. Otherwise disclose prompt-scope-only isolation and inspect available read traces; do not claim that the shared machine makes excluded data physically inaccessible. A new chat is not necessarily a fresh process or machine. This suite uses explicit skill activation.
5. Freeze the answer before independent review. Supply the reviewer with the complete input, actual pinned sources and answer. Keep earlier results and orientation examples out of the candidate's supplied test context.

One candidate at a time and targeted reads keep cost bounded. A compact scheme around 1,500–2,000 words is a useful target, not an excuse for missing mechanisms. No application implementation or provider-specific runner is necessary. A missing response, provider limit or interrupted review remains incomplete.

## Candidate prompt

This filled block plus one case form a single request; no prior conversation is assumed.

```text
Work in the new fictional consuming application [WORKSPACE], governed by
[APPLICATION INSTRUCTION PATH]. Read-only handbook: [LOCATION], approved
revision [FULL SHA / DECLARED SNAPSHOT PROVENANCE]. No source, schema,
approved stack, deployed application or application tests exist.

Use only the complete case below. No additional product areas are implied.
Explicitly read the copied architecture-assessment, backend-architecture
and frontend-architecture skills at [INSTALLED PATHS]. Read the handbook
README, architecture/foundations/architecture-design-review.md and needed
style/pattern/frontend/backend sections. Report missing activation/sources
honestly; distinguish controller receipt provenance from resolved Git HEAD.
Do not read other case answers, reviews or maintainer memories.

Return only a detailed backend/frontend scheme: subfolders, important
artifacts, authoritative owners/public contracts, permitted imports,
runtime behavior and startup composition. Justify consequential choices
and omissions with actually read source paths/sections; label requirements,
conventions and inferences. Trace an operation, failures and browser state;
address identity/access/concurrency/unknown outcomes where relevant.
Explain the assigned alternative and evaluate the challenged proposal.
Give rule/integration/new-caller change impact and proposed observable
checks, including a legal and illegal dependency. No unverified framework,
database or security guarantees.

No code, packages, servers or deployment. Return Markdown in the response,
or save only response/read-inventory artifacts to [ALLOWED EVIDENCE PATHS].
Do not write elsewhere. Label read inventory as self-report and application
checks as proposed, not executed. State assumptions and remaining limits.
```

## Self-contained cases

These are inputs, not prescribed answers. Both sides are in scope; server-rendered HTML is the frontend in L1. Every block carries its product baseline. Changing a block requires a newly recorded suite revision.

### L1: closed Layered and server MVC

```text
Public read-only product sales totals; date/category filters, pagination,
empty/error states; one maintained SQL report store. Exclude authentication,
editable business objects and checkout. Use closed Layered backend and
server-rendered web MVC. Compare open layering by real calls/imports and
policy ownership. Evaluate Repository per report table and forwarding Facade.
```

### L2: Layered with DIP and MVVM

```text
Public read-only product sales totals; date/category filters, pagination,
empty/error states; one maintained SQL report store. Exclude authentication,
editable business objects and checkout. Use Layered backend with Dependency
Inversion and interactive MVVM browser: filter drafts, URL-applied filters,
async results, responsive layout, keyboard access, light/dark/system.
Compare MVC and removing the inward-owned read contract. Decide whether
the report reader is a Repository and explain actual dependency changes.
```

### H1: Hexagonal and classic MVC

```text
Authenticated analysts create and resolve tickets; subjects are nonblank;
resolved tickets cannot resolve again. HTTP and trusted operator CLI share
the rules; persistence is replaceable. Browser handles selection, refresh
and mutations. Exclude notifications, billing and unrelated workflows.
Use Hexagonal backend and classic interactive MVC browser. Compare MVVM
without changing rules. Evaluate Port interface per file and calling the
browser HTTP gateway a Repository.
```

### H2: Hexagonal and MVVM with Onion assessment

```text
Authenticated analysts create and resolve tickets; subjects are nonblank;
resolved tickets cannot resolve again. HTTP and trusted operator CLI share
the rules; persistence is replaceable. Browser handles selection, refresh
and mutations. Exclude notifications, billing and unrelated workflows.
Use Hexagonal backend and MVVM browser. Assess Onion as an additional client
constraint and a screen Facade based on collaboration. Explain actual Onion
changes versus naming. Evaluate a client domain model only to fill a folder.
```

### C1: Clean and classic MVC

```text
Employees submit positive-amount expenses; only designated reviewers approve;
nobody approves their own submission. Persist status with revision checks;
duplicate/conflicting approvals cannot corrupt state. Include browser and
backend; exclude payment, payroll and administration. Use Clean backend and
classic interactive MVC browser. Compare returned result with application-
owned output port/outer presenter. Evaluate inner import of concrete presenter.
```

### C2: Clean and MVVM with Layered frontend

```text
Employees submit positive-amount expenses; only designated reviewers approve;
nobody approves their own submission. Persist status with revision checks;
duplicate/conflicting approvals cannot corrupt state. Include browser and
backend; exclude payment, payroll and administration. Use Clean backend,
MVVM browser and explicit Layered frontend policy. Assess a selection/loading
approval-summary Facade. Compare MVC state/binding changes. Evaluate ORM
records as use-case output and requiring a server VM because the client has one.
```

### O1: Onion and classic MVC

```text
A library member may hold at most three active loans; a copy cannot have
two active loans; renewal is refused if another member has a hold. Persist
loans; include authorized librarian input and browser. Exclude fines,
payments, acquisitions and unrelated workflows. Use Onion backend and classic
interactive MVC browser. Compare entity behavior and domain service for
renewal, identifying needed facts. Evaluate Domain importing ORM types to
restore stored loans.
```

### O2: Onion and Hexagonal MVVM frontend

```text
A library member may hold at most three active loans; a copy cannot have
two active loans; renewal is refused if another member has a hold. Persist
loans; include authorized librarian input and browser. Exclude fines,
payments, acquisitions and unrelated workflows. Use Onion backend and
Hexagonal MVVM browser. Assess stored-loan Repository, availability read
projection and selected-loan detail/renewal Facade. Compare Clean backend
with actual changes or justified overlap. Evaluate full layer stacks per
table and moving all application policy into the Facade.
```

## Independent reviewer prompt

Freeze these criteria before opening an answer. Keep prior findings and this reviewer task outside the candidate's supplied context.

```text
Independently inspect [FROZEN ANSWER + HASH], [COMPLETE FILLED INPUT], suite
revision [SHA] and actual handbook [LOCATION + SHA]. Do not edit the answer.
Verify citations against the pinned sections and surrounding material:
1 Scope/authority: complete requirements, one rule owner, transport shape
  checks distinct from business validity and trusted resource access.
2 Style fidelity: actual constraints rather than uniform folders. Layered
  need not use DIP; Hex protects interactions; Clean protects policy;
  Onion needs meaningful independent domain behavior.
3 Relationships: imports (including types/reexports), runtime calls and
  construction are distinct, explicit and mutually consistent.
4 Presentation: actual MVC variant/update mechanism or MVVM state/commands/
  binding. A hook, server template DTO or controller name is insufficient.
5 Pattern meaning: stored-object Repository vs projection reader vs remote
  gateway; real Facade collaboration or justified rejection.
6 Counterfactual/evidence: concrete alternatives/change effects/failures,
  observable proposed checks and truthful provenance/verification limits.

PASS-DESIGN requires all relevant criteria. For substantive findings give
location/excerpt, violated requirement/source, impact and correction owner
(guidance, candidate or fixture). Do not invent defects to force a retry.
Use INVALID-INPUT for missing required facts; BLOCKED/NOT-RUN for incomplete
execution/review. A site CI pass cannot establish design acceptance.
State inspected scope and unverified implementation behavior.
```

## Record and compare results

Use this append-only report format. The [historical matrix](../../maintenance/architecture-combination-matrix.md#results-and-limits) stores executions; this suite is the editable home for future inputs.

```text
Run ID/date; handbook SHA; suite/prompt SHA; copied skill hashes:
Case IDs and selection reason:
Model/runtime/settings when observable (otherwise unknown):
Fresh setup, instruction provenance, activation and isolation limits:
Complete filled input artifact + hash:
Frozen response artifact + hash; self-reported reads:
Independent review artifact, inspected sources and six criterion verdicts:
Status: PASS-DESIGN | FAIL-DESIGN | INVALID-INPUT | BLOCKED | NOT-RUN
Findings: location, evidence, impact, owner and resolution:
Correction commit/new fresh attempt ID:
Mechanical checks executed; application checks only proposed:
Prior-run comparison, changed assumptions and outstanding limits:
```

Compare decisions and mechanisms rather than identical wording or folder count. Preserve failed/incomplete attempts. Correct the owning guide, skill or fixture, publish the reviewed change, and repeat affected cases in another fresh context without feedback from the previous attempt. After two correction rounds with substantive unresolved defects, reassess instead of looping indefinitely.

The [orientation examples](README.md) are not passing answers. Each verdict covers its inspected design assumptions only. The suite does not establish implemented software quality, automatic skill selection, statistical reliability or causal improvement. No model execution or semantic acceptance is automated by GitHub Actions.

[Prompt selector](README.md) · [Design review](../foundations/architecture-design-review.md)
