# Initial Handbook Audit — Bounded Sample

**Baseline revision:** `39f338110451cc195201b2ac6d82df740a64ee50` (`origin/main`, verified 2026-10-16)<br>
**P1-01 assessment base:** `033c6616fb56c0f2a801e1127e681c7eb6b2ad64` (delivery branch)<br>
**Scope:** The initial three-page sample below was read in full and its reported findings checked against surrounding prose, examples and diagram semantics. P1-01 then examined editorial/source conventions and route discoverability in a bounded slice. The complete path-only inventory is in [`path-inventory.md`](path-inventory.md); path enumeration is not deep content review. This does not certify Phase I.

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
| `architecture/frontend/styling-and-design-system.md` | Token/style ownership and Panda CSS applications | Read in full | Review of reported concern D-01 below; no demonstrated defect. |
| `maintenance/path-inventory.md` | All 111 tracked Markdown paths and bounded-read status | Inventoried | Path-only coverage map; all unmarked files remain pending content review. |
| Remaining canonical chapters, exercises, diagrams, references and seven consumer skills | Not assessed or awaiting deeper review | Pending | The path inventory does not imply content verification. |

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
- **Status:** Corrected in the local candidate after explicit approval of the protected-file patch; final candidate review and publication remain pending.

### NAV-02 — Foundations handoff omits the framework-independent API route — LOW

- **Location:** `architecture/foundations/README.md`, `## Read in order` handoff.
- **Evidence and impact:** The handoff offered only backend/frontend, while `README.md` and `architecture/README.md` also expose API Design & Engineering as a canonical route. A reader following the foundations page could miss that framework-independent continuation.
- **Minimum correction:** Link `../api-design/README.md` and explain it as the framework-independent route before the backend/frontend implementation routes.
- **Validation:** Inspected the changed relative path, confirmed the API landing-page target and compared both repository maps. No heading, filename or legacy-anchor changes were made. The recovered onboarding contents correction was also checked against the unchanged `Use and test the available skills` heading and its preserved explicit legacy ID.
- **Status:** Corrected and manually checked in the local candidate; final candidate review and publication remain pending.

### POL-01 — Site-tooling policy conflict — CORRECTED IN CANDIDATE

- **Location:** `AGENTS.md`, `## Documentation-only repository`; `CONTRIBUTING.md`, examples/review guidance.
- **Evidence and impact at the assessment base:** The `AGENTS.md` prohibition on package managers, build scripts and documentation tooling conflicted with the assignment's explicit authorization for a minimal static Astro + Starlight site project and site-only CI. Without a narrowly scoped exception, site implementation would contradict the repository's governing instructions.
- **Minimum correction:** Clarify that only the authorized static site may use its minimal package/lockfile, build/test tooling and narrowly scoped GitHub Actions, while canonical Markdown/skills remain at their paths and no handbook example, backend, database, auth, analytics, CMS or SPA becomes executable.
- **Status:** The protected `AGENTS.md` patch was subsequently explicitly approved and applied. Its site-only exception and the recovered `CONTRIBUTING.md` clarification are present and were compared in the local candidate. The earlier approval timeout is historical, not a current permission request. Unrelated rules remain unchanged; final candidate review and publication remain pending.

## Confirmed findings in the initial three-page sample

None. This does not conflict with the later P1-01 findings above and is not evidence that unreviewed material is defect-free.

## Pending scope and limits

- P1-02 bounded foundations slice read in full: `code-placement.md`, `dependency-boundaries.md`, `composition-root.md`, `module-boundaries-and-public-apis.md`, `evolution-and-scaling.md`, and `architecture-testing.md`. The slice compared ownership rules, source/runtime/composition distinctions, public API guidance and growth criteria; no new demonstrated defect was found. This does not certify the remaining styles, patterns, examples or application guides.
- P1-02 style-map pass read in full: `architecture/styles/README.md` and the Layered, Hexagonal, Clean and Onion guide entry pages. Compared route wording, boundary terminology, implementation links and distinctions among the four styles; no new demonstrated defect was found in these entry-page/navigation slices. This is not a review of the numbered Clean and Onion chapters, the standalone Layered and Hexagonal guides, their references, or all diagrams/examples.
- A temporary local checker scanned 11 Markdown files (the four principal root/maps plus all seven foundation files) and resolved 249 local links/fragments with zero reported errors. It approximates GitHub heading slugs and checks file/anchor existence only; it does not test GitHub rendering, external URLs, Mermaid rendering, or links elsewhere in the repository. Re-run an authoritative site-wide check when the relevant content and site implementation exist.
- Review the inventoried paths and all required handbook areas, exercises, links/anchors, diagrams, sources, and seven consumer skills in bounded slices.
- Continue deeper requirement coverage beyond the recorded bounded reads, including architectural styles/patterns, frontend/backend/API and consumer integration.
- Reconciliation checks counted 111 tracked Markdown files and 111 inventory rows, including seven consumer skills; the inventory describes the assessment base, before adding the inventory file itself. Matching counts are not a programmatic set-equality check. The three changed navigation destinations were manually inspected; no headings or legacy IDs were changed.
- A separate coordinator check reported 111 Markdown files and 2,633 local links with no broken targets/anchors. That provisional result was not reproduced in this reconciliation run: script execution required unavailable interactive approval. It is not evidence of rendered-site, external-source, diagram, exercise, accessibility or transfer/comprehension verification.
- Before staging, default `git diff --check` flagged CRLF line endings in the supplied `AGENTS.md`; command-local CRLF-aware checking passed. Staging under the repository's existing Git behavior produced an LF-normalized index with only the two intended content changes. No Git configuration was changed and the protected working file was not edited again. Final checks apply to the staged candidate.
- The path inventory and P1-01 corrections remain an unpublished candidate for final independent review. The earlier audit/checklist increment remains on the same draft PR; neither this slice nor the provisional link check completes the audit or Phase I gate.
