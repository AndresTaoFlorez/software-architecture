# Handbook Recovery and Website — Implementation Checklist

This checklist tracks the authorized two-phase assignment. `DONE` requires recorded artifact/check/commit evidence; a review sample is not full-topic coverage. Status reflects reconciliation of the local P1-01 candidate; final candidate review and publication remain pending. Historical bounded-review evidence is distinguished from checks reproduced in this reconciliation.

| ID | Status | Owner | Evidence / next verifiable step |
| --- | --- | --- | --- |
| INIT-01 | IN PROGRESS | active-building | Local HEAD and the fetched delivery-branch head match assessment base `033c661`; recovered edits are preserved. Earlier records report an isolated delivery worktree and an accepted guarded specialist run; those environment/gate claims were not reproduced in this reconciliation. Verify remaining environment/ownership evidence before marking this group done or dispatching further work. |
| INIT-02 | IN PROGRESS | active-building | Initial three-page audit and existing draft PR #22 are recorded. [`path-inventory.md`](path-inventory.md) lists the 111 Markdown paths tracked at assessment base `033c661`; reconciliation counted 111 tracked files and 111 inventory rows, not programmatic set equality. Final review, commit/publication verification and complete initialization evidence remain. |
| AUD-01 | IN PROGRESS | active-building | Progressive coverage, withdrawn initial concerns and two low-severity P1-01 navigation findings are recorded in [`handbook-audit.md`](handbook-audit.md); remaining bounded audits are pending. |
| P1-01 | IN PROGRESS | active-building | NAV-01/NAV-02 corrections, recovered onboarding contents fix and aligned site-only exceptions in `AGENTS.md`/`CONTRIBUTING.md` are present. The protected patch was explicitly approved and applied; no new edit of that file was attempted here. Changed navigation was manually checked. Staging with existing Git behavior normalized supplied CRLF in the index without changing configuration; final whitespace checks apply to that candidate. Exact candidate review and publication remain; broader editorial/organization requirements are not certified. |
| P1-02 | IN PROGRESS | active-building | Coordinator read six foundation chapters in full and recorded the bounded findings/limits in [`handbook-audit.md`](handbook-audit.md); no defect was demonstrated in that slice. A temporary checker resolved 249 local links/fragments across 11 root/map/foundation files. Continue with styles, patterns and deeper module-growth evidence; independent review remains required before publication. |
| P1-03 | TODO | active-building | Review frontend/backend/API/pattern/domain-modeling coverage, flows, validation, examples and exercises. |
| P1-04 | TODO | active-building | Review design-system/Panda theory, framework behavior and actual file ownership. |
| P1-05 | TODO | onboarding | Assess all seven consumer skills and their triggers, boundaries, procedures and verification; report runtime-test limits. |
| P1-GATE | TODO | active-building | Require evidence for transfer tests, independent review, consistency checks and unresolved high-severity findings per specification §3.5. |
| P2-01 | TODO | active-building | After Phase I gate, record supported Astro/Starlight ADR and prove canonical-source loader, routes, links, anchors, assets, diagrams and compatibility. |
| P2-02 | TODO | active-building | Verify responsive accessible reader navigation, search, TOC, theme and diagram interactions; document styling choice. |
| P2-03 | TODO | active-building | Document and test the site's actual modules, responsibilities, flows and architectural case study. |
| P2-04 | TODO | active-building | Verify lockfile-based CI/build and main-only Pages workflow, permissions, base path and human settings prerequisites. |
| P2-GATE | TODO | active-building | Complete section 4.6 test matrix with evidence/limits; verify PR checks. Deployment remains pending merge and a successful post-merge run. |
| QA-01 | TODO | editorial-review | Independently review exact candidate artifacts for pedagogy, technical architecture and site/accessibility/deployment scopes; state expertise/tool limits. |
| QA-02 | TODO | active-building | Resolve actionable reviewed findings and revalidate changed scope; reassess after two substantive unresolved correction rounds. |
| OPS-01 | IN PROGRESS | active-building | The initial audit/checklist increment is on the existing draft PR #22. Keep all authorized work on that PR; local P1-01 candidates are not yet published, and no merge is authorized. |
| OPS-02 | TODO | active-building | Verify task-owned volatile processes/outcomes and preserve existing profiles, sessions, tasks, memory and worktrees; make no merge/live-deployment claim. |

## Findings disposition

- **Corrected in the candidate:** NAV-01 (AGENTS contents omitted Progress publication), NAV-02 (foundations handoff omitted API Design & Engineering), and POL-01 (site-only toolchain policy conflict). Protected-file approval is no longer pending. See [`handbook-audit.md`](handbook-audit.md) for checks and remaining review/publication limits.
- **Withdrawn:** M-01 (module application-vs-composition API distinction stated in context); H-01 (Hexagonal source requirement edge exists and is explained); D-01 (design-token arrows are consistent with the stated dependency graph and token-reference example). Evidence and exact locations are in `maintenance/handbook-audit.md`.
- **Pending:** deeper audit coverage beyond path enumeration, initialization evidence reconciliation, Phase I gate, Phase II, final independent candidate review, publication/PR checks and post-merge deployment verification. A coordinator-reported provisional local-link scan is not a completed site or audit gate.
