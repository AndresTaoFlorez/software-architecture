# Initial Handbook Audit — Bounded Sample

**Baseline revision:** `39f338110451cc195201b2ac6d82df740a64ee50` (`origin/main`, verified 2026-10-16)<br>
**P1-01 assessment base:** `033c6616fb56c0f2a801e1127e681c7eb6b2ad64` (delivery branch)<br>
**Scope:** The initial three-page sample below was read in full and its reported findings checked against surrounding prose, examples and diagram semantics. P1-01 then examined editorial/source conventions and route discoverability in a bounded slice. Later bounded frontend/backend/domain and consumer-skill assessments are recorded below. [`path-inventory.md`](path-inventory.md) distinguishes full reads from pending content review. This does not certify Phase I.

## Coverage matrix

| Canonical file | Topic / inspected scope | Review status | Evidence / limits |
| --- | --- | --- | --- |
| `AGENTS.md` | Editorial, structure, architecture, diagrams and repository rules | Read in full for P1-01 | Initial sample also consulted the reference checkout at `9340a103`; P1-01 read the delivery base. The general editorial standard did not warrant a rewrite; a separate tooling-policy conflict is recorded below. |
| `CONTRIBUTING.md` | Audience, guide-writing requirements and tooling boundary | Read in full for P1-01 | Earlier initial-sample consultation covered only opening sections. |
| `README.md` | Canonical reader routes and API/backend/frontend destinations | Read in full for P1-01 | Route verification, not a full content audit. |
| `architecture/README.md` | Architecture map and route choices | Read in full for route verification | Confirms API Design & Engineering as a canonical route. |
| `architecture/foundations/README.md` | Foundations route and handoff | Read in full for route verification | Handoff listed backend/frontend but omitted the API route shown in both repository maps. |
| `architecture/foundations/code-placement.md` | Responsibility and code ownership | Read in full for P1-02 | Compared layer ownership, boundary types and capability growth; no defect demonstrated in this slice. |
| `architecture/foundations/dependency-boundaries.md` | Source/runtime boundaries and contracts | Read in full for P1-02 | Compared layer imports, ports, transport parsing and integration ownership; no defect demonstrated in this slice. |
| `architecture/foundations/composition-root.md` | Composition and dependency injection | Read in full for P1-02 | Compared source imports with startup wiring and framework examples; no defect demonstrated in this slice. |
| `architecture/conventions/README.md` | Index for naming/editorial conventions | Read in full for P1-01 | No demonstrated defect in the assessed navigation/conventions slice. |
| `architecture/conventions/editorial-review.md` | Editorial diagnosis and correction standard | Read in full for P1-01 | No rewrite justified by the sampled evidence. |
| `architecture/conventions/architecture-guide-template.md` | New-guide structure and pedagogy | Read in full for P1-01 | No rewrite justified by the sampled evidence. |
| `architecture/conventions/naming-and-file-placement.md` | File/path conventions | Read in full for P1-01 | No demonstrated source/placement-standard defect in this slice. |
| `architecture/foundations/module-boundaries-and-public-apis.md` | Cohesion, module APIs, exports, backend capability APIs | Read in full | Review of reported concern M-01 below; no demonstrated defect. |
| `architecture/foundations/evolution-and-scaling.md` | Evidence-led growth and deployment boundaries | Read in full for P1-02 | Compared growth signals, module ownership and distribution trade-offs; no defect demonstrated in this slice. |
| `architecture/foundations/architecture-testing.md` | Enforceable architectural checks | Read in full for P1-02 | Compared AST/graph/API checks and stated limits; no defect demonstrated in this slice. |
| `architecture/styles/hexagonal-architecture/README.md` | Ports/adapters and source/runtime/composition diagram | Read in full | Review of reported concern H-01 below; no demonstrated defect. |
| `architecture/frontend/styling-and-design-system.md` | Token/style ownership and Panda CSS applications | Read in full for P1-04 | D-01 withdrawn; official Panda semantics compared below; no generated-CSS check. |
| All 12 `architecture/frontend/` pages | Presentation, integrations, state, styling, case study, references and exercises | Read in full for P1-03/P1-04 | Per-path scope in inventory; FLOW-01 corrected; static reasoning only. |
| All 12 `architecture/backend/` pages | TypeScript boundaries, Nest mechanisms, creation, style choices, references and exercises | Read in full for P1-03 | Per-path scope in inventory; no Nest/database execution. |
| `architecture/foundations/domain-modeling/README.md` | Vocabulary, ownership and learning route | Read in full for P1-03 | Linked consumer skill assessed statically, not activated. |
| Seven consumer `SKILL.md` files | Triggers, responsibilities, procedures and verification limits | Independent full-read static assessment | P1-05 integration below; 21 hypothetical scenarios, no consumer runtime. |
| `maintenance/path-inventory.md` | All 111 tracked Markdown paths and bounded-read status | Inventoried | Path-only coverage map; all unmarked files remain pending content review. |
| Remaining canonical chapters, exercises, diagrams and references | Not assessed or awaiting deeper review | Pending | The path inventory identifies unreviewed files; full reads do not imply complete verification. |

## Reported concerns verified against the actual text

No confirmed defects were found in this bounded three-page review. The three incoming concerns are withdrawn as unsupported; they should not be carried as audit defects.

### M-01 — Module API distinction — WITHDRAWN

- **Location:** `architecture/foundations/module-boundaries-and-public-apis.md`, “Backend APIs across layer-first capabilities”.
- **Reported concern:** The `composition/modules/index.ts` link did not explain what that entry point exposes or how it differs from the application API.
- **Context checked:** The paragraph states that `application/tickets/index.ts` offers the operation, command, and result, while `composition/modules/index.ts` offers the Nest module needed at startup; it then links to “Wire memory first” for the concrete application. The earlier “Public API per non-trivial module” section demonstrates a supported application entry point and consumer import.
- **Decision:** Withdraw. The ownership distinction is stated locally. A further expansion may be useful in a future complete review, but this sample does not demonstrate a comprehension defect.
- **Classification / severity:** No finding; no demonstrated defect.

### H-01 — Hexagonal source-dependency edge — WITHDRAWN

- **Location:** `architecture/styles/hexagonal-architecture/README.md`, “One application, several mechanisms”.
- **Reported concern:** The diagram omitted the source dependency from the operation to its required repository interface.
- **Context checked:** The diagram contains `U -. requires .-> P` from `CreateTicket` to `TicketRepository`, and `MEM -. implements .-> P`. Its legend says long dashes are source requirements; solid lines are runtime calls, and short dots are startup wiring. The adjacent prose says the operation calls the supplied repository object and the interface is not another runtime hop.
- **Arrow semantics:** In this diagram the long-dashed `U → P` arrow means a source-level requirement/dependency; the solid `U → MEM` arrow means the runtime call through the supplied object; the short-dashed composition arrows mean startup wiring/supply.
- **Decision:** Withdraw. The alleged edge is present and its source/runtime distinction is explicitly explained.
- **Classification / severity:** No finding; no demonstrated defect.

### D-01 — Design-token dependency direction — WITHDRAWN

- **Location:** `architecture/frontend/styling-and-design-system.md`, “Use a layered design-system pipeline”.
- **Reported concern:** `Semantic tokens → Primitive tokens` appeared opposite to the text explaining that semantic tokens reference raw tokens.
- **Context checked:** The diagram is expressly described as a “dependency graph of style definitions.” The semantic-token example aliases `{colors.neutral.50}` / `{colors.neutral.900}`, and the text says semantic tokens reference raw tokens.
- **Arrow semantics:** The diagram is a dependency graph: semantic tokens reference primitive tokens; text styles, recipes, and component-local styles depend on semantic tokens; component-local styles also depend on text styles and recipes; the rendered component depends on its component-local styles. Each arrow points from the dependent definition to the definition it references. The `V → C` edge does not directly connect the rendered component to text styles or recipes.
- **Decision:** Withdraw. The direction is consistent with the prose and example under the diagram's dependency-graph interpretation. No contradictory convention in the checked passage demonstrates a reader-facing defect.
- **Classification / severity:** No finding; no demonstrated defect.

## P1-01 — Route and policy findings

The independent reviewer read seven assigned files in full and used context samples of `architecture/README.md`, `architecture/foundations/README.md` and this audit. A temporary read-only checker examined 112 relative links (64 fragment links) across the seven assigned files using provisional GitHub-style heading slugs plus explicit IDs; it reported no problems at the assessment base. This is not rendered-site, visual, remote-source or repository-wide verification. The reviewer found no general editorial/source-standard rewrite justified in the assessed sample.

### NAV-01 — Progress-publication section omitted from agent-instructions contents — LOW

- **Location:** `AGENTS.md`, `Contents` and `## Progress publication`.
- **Evidence and impact at the assessment base:** The contents list omitted the existing `Progress publication` H2, so readers could not navigate directly to the repository's required commit/push workflow.
- **Minimum correction:** Add `[Progress publication](#progress-publication)` without changing the heading or anchor.
- **Validation:** The candidate contents link and unchanged `## Progress publication` heading were inspected together; the fragment matches the heading slug.
- **Status:** Corrected, independently reviewed and published in `17030a0`.

### NAV-02 — Foundations handoff omits the framework-independent API route — LOW

- **Location:** `architecture/foundations/README.md`, `## Read in order` handoff.
- **Evidence and impact:** The handoff offered only backend/frontend, while `README.md` and `architecture/README.md` also expose API Design & Engineering as a canonical route. A reader following the foundations page could miss that framework-independent continuation.
- **Minimum correction:** Link `../api-design/README.md` and explain it as the framework-independent route before the backend/frontend implementation routes.
- **Validation:** Inspected the changed relative path, confirmed the API landing-page target and compared both repository maps. No heading, filename or legacy-anchor changes were made. The recovered onboarding contents correction was also checked against the unchanged `Use and test the available skills` heading and its preserved explicit legacy ID.
- **Status:** Corrected, independently reviewed and published in `17030a0`; the onboarding contents correction is included in that revision.

### POL-01 — Site-tooling policy conflict — CORRECTED

- **Location:** `AGENTS.md`, `## Documentation-only repository`; `CONTRIBUTING.md`, examples/review guidance.
- **Evidence and impact at the assessment base:** The `AGENTS.md` prohibition on package managers, build scripts and documentation tooling conflicted with the assignment's explicit authorization for a minimal static Astro + Starlight site project and site-only CI. Without a narrowly scoped exception, site implementation would contradict the repository's governing instructions.
- **Minimum correction:** Clarify that only the authorized static site may use its minimal package/lockfile, build/test tooling and narrowly scoped GitHub Actions, while canonical Markdown/skills remain at their paths and no handbook example, backend, database, auth, analytics, CMS or SPA becomes executable.
- **Status:** The site-only exception and matching `CONTRIBUTING.md` clarification were independently reviewed and published in `17030a0`. Canonical examples remain documentation, not executable applications.

## Confirmed findings in the initial three-page sample

None. This does not conflict with the later P1-01 findings above and is not evidence that unreviewed material is defect-free.

## Pending scope and limits

- P1-02 bounded foundations slice read in full: `code-placement.md`, `dependency-boundaries.md`, `composition-root.md`, `module-boundaries-and-public-apis.md`, `evolution-and-scaling.md`, and `architecture-testing.md`. The slice compared ownership rules, source/runtime/composition distinctions, public API guidance and growth criteria; no new demonstrated defect was found. This does not certify the remaining styles, patterns, examples or application guides.
- P1-02 style-map pass read in full: `architecture/styles/README.md` and the Layered, Hexagonal, Clean and Onion guide entry pages. Compared route wording, boundary terminology, implementation links and distinctions among the four styles; no new demonstrated defect was found in these entry-page/navigation slices. This is not a review of the numbered Clean and Onion chapters, the standalone Layered and Hexagonal guides, their references, or all diagrams/examples.
- A temporary local checker scanned 11 Markdown files (the four principal root/maps plus all seven foundation files) and resolved 249 local links/fragments with zero reported errors. It approximates GitHub heading slugs and checks file/anchor existence only; it does not test GitHub rendering, external URLs, Mermaid rendering, or links elsewhere in the repository. Re-run an authoritative site-wide check when the relevant content and site implementation exist.
- Review the inventoried paths and all required handbook areas, exercises, links/anchors, diagrams, sources, and seven consumer skills in bounded slices.
- Continue deeper requirement coverage beyond the recorded bounded reads, including architectural styles/patterns, frontend/backend/API and consumer integration.
- Independent verification established exact equality between the 111 historical tracked Markdown paths and inventory rows, including seven consumer skills, without duplicates, missing or extra rows. The inventory describes its base before adding itself. The three changed navigation destinations were manually inspected; no headings or legacy IDs were changed.
- Independent review of `033c661..17030a0` recorded a clean diff check and a provisional scan of 112 Markdown files / 2,635 local links. The fetched delivery-branch head matches published `17030a0`. File/fragment resolution does not establish rendering, external-source correctness, diagram readability, exercise execution, accessibility or transfer/comprehension.
- Initialization is no longer a blocker to bounded audits. The published corrections and inventory do not complete the audit or Phase I gate.

## P1-03 / P1-04 — Frontend, backend and domain slice

Assessment base: `17030a0fea5f357d7c846f060c01559eb728bd37`. All 12 frontend pages, all 12 backend pages and `architecture/foundations/domain-modeling/README.md` were read in full, including exercise prompts and separate solutions. Exact paths and read scope are in the inventory. This is static reasoning, not snippet execution or a complete patterns/API audit.

| Check | Evidence and consequence |
| --- | --- |
| Business rules versus input shape | Backend chapter 2 checks unknown request fields in the parser, subject validity in `Ticket`, and initial state through a separate constant. Frontend Ticket schema reuses its domain vocabulary; appointment decoding accepts historical positive durations rather than applying the new-booking minimum. Preserve these distinctions. |
| Frontend/backend equivalence | Incoming backend HTTP belongs to Presentation; outgoing frontend HTTP belongs to Infrastructure. Both operations receive a supplied contract implementation. The frontend Ticket example checks nonblank subjects; backend creation additionally enforces 160 UTF-16 units. These are teaching slices, not demonstrated identical contracts or a verified end-to-end pair. |
| Source, runtime and startup | Backend chapter 4 and frontend ports/adapters distinguish contract requirements, calls to supplied objects and construction. The case-study legend contradicted its edge labels and styles; see FLOW-01. |
| Failure behavior | Backend creation awaits insertion, maps recognized persistence failure and propagates defects. Its Prisma fragment explicitly omits outage classification; do not infer a tested 503 from that fragment. Frontend agenda/draft solutions translate integration failures and keep safe UI feedback; draft storage acquisition is deferred into checked calls. |
| Rule, integration and growth | Subject changes stay with Domain; renamed wire/storage fields stay in adapters/mappers; startup chooses replacements. Billing and Scheduling examples use supported entries rather than deep imports. Assignment extends the existing Ticket, separates eligibility from loading/saving, rejects without saving and states its concurrency assumption. |
| Exercises and limits | Both routes have three easy, three intermediate and three advanced activities with separate answers. Solutions identify concrete files and omitted bindings. F-I1 pauses controls during loading and explicitly excludes overlapping-request coordination; B-A3 does not establish database concurrency. Static tracing is not a learner transfer test. |

### FLOW-01 — Contradictory case-study diagram legend — LOW

`architecture/frontend/reference-case-study.md`, “Canonical flow”: the legend called solid edges source dependencies and denied runtime calls, although those edges say “calls” / “reads / invokes”; source-contract edges use `6 4` dashes and construction uses `2 5` dots. Correct only the legend to runtime calls/reads, source-contract relationships and startup supply. Nodes, edges and anchors stay unchanged. Static comparison with the adjacent runtime explanation and frontend/backend diagrams supports the correction; no rendered visual check was performed.

### Panda and framework source checks

- Official [Panda tokens](https://panda-css.com/docs/theming/tokens), [recipes](https://panda-css.com/docs/concepts/recipes), [slot recipes](https://panda-css.com/docs/concepts/slot-recipes) and [text styles](https://panda-css.com/docs/theming/text-styles) were consulted. They support token references/conditional semantic values, `sva` per-slot definitions, registered config recipes and typography without layout/color. Component-local versus shared ownership is handbook guidance, not a Panda restriction. No styling rewrite is justified by these checks.
- [Nest lifecycle](https://docs.nestjs.com/faq/request-lifecycle) confirms Guards before Pipes before the handler. The consulted portions of [custom providers](https://docs.nestjs.com/fundamentals/custom-providers) support tokens, registration and module visibility; the full page was not reviewed. The opening/summary portions of [React Effects](https://react.dev/learn/you-might-not-need-an-effect) support external synchronization rather than derived-state effects. [Fowler Service Layer](https://martinfowler.com/eaaCatalog/serviceLayer.html) supports operation coordination; the opening intent/motivation of [Cockburn](https://alistair.cockburn.us/hexagonal-architecture/) supports device-independent application interactions. No claim of complete external-source review is made.
- Case-study excerpts and path maps distinguish DataTable rendering and colocated `DataTable.styles.ts`, shared `shared.recipes.ts` contracts and tokens from screen composition. Their ownership was assessed against official Panda behavior, not the presence of physical application files: this repository intentionally contains illustrative Markdown rather than a runnable example. The cited snapshot `982d861d442024331c84041c5a08c147ce2a01ec`, generated CSS and runtime were not independently inspected. This limits empirical confirmation but is not itself a defect or a Phase I blocker. Rendered/implementation evidence belongs to the relevant later site checks.

## P1-05 — Consumer-skill static assessment

An independent static assessment at `033c661` read all seven consumer skills in full, plus onboarding instructions/templates. It evaluated triggers, exclusions, root/revision resolution, proportionality, responsibility ownership and verification limits. Three hypothetical scenarios per skill (positive, negative, ambiguous; 21 total) were reasoned through, not executed in consuming clients. Preserve the six unaffected skills and the existing supported-entry/revision safeguards.

- **F1 — LOW, corrected in this candidate:** `agent-onboarding/skills/api-design/SKILL.md`, REST verification, required authentication on every request, including contractually anonymous resources. Replace only that sentence: supply authentication independently for protected requests, preserve allowed anonymity and never forward credentials to untrusted links/redirects. Static acceptance: all three conditions remain explicit. No anonymous/protected HTTP flow was executed.
- **F2 — LOW, already published:** onboarding contents used singular `skill` against the plural heading. `17030a0` contains the corrected plural anchor; no second patch is needed.
- Format review was manual; no automatic discovery, explicit activation, client selection, adapter integration, database/security guarantee or runtime compatibility was demonstrated. P1-05's static assessment is recorded; consuming-application activation and transfer evidence remain pending. P1-GATE stays open.
