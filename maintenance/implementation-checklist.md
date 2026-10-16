# Handbook Recovery and Website — Implementation Checklist

This checklist tracks the authorized two-phase assignment. `DONE` requires recorded artifact/check/commit evidence; a review sample is not full-topic coverage. Status reflects the verified state as of the initial increment on 2026-10-16.

| ID | Status | Owner | Evidence / next verifiable step |
| --- | --- | --- | --- |
| INIT-01 | BLOCKED | active-building | Repository and base verified; authorized branch/worktree created and the separate dirty primary checkout preserved. The required guarded-dispatch helper was located but `handbook_state.py gate --home C:/Users/Mothius/.hermes` could not run because its Python environment lacks `yaml` (`ModuleNotFoundError`). No dispatch was attempted. Recovery: use the helper's verified supported environment/dependencies, rerun the gate before any specialist dispatch, and then update this status with the result. |
| INIT-02 | IN PROGRESS | active-building | Bounded three-page audit saved at [`handbook-audit.md`](handbook-audit.md); three reported concerns checked and withdrawn. Complete path inventory, first commit/push and the single PR remain; no broader content review is claimed. |
| AUD-01 | TODO | active-building | Build progressive file/topic coverage, demonstrated severity-ranked findings, exceptions and explicit read-vs-sampled limits in `maintenance/handbook-audit.md`. |
| P1-01 | TODO | active-building | Review and update editorial/source/organization conventions; preserve Markdown routes and legacy anchors. |
| P1-02 | TODO | active-building | Review foundations, responsibility/module/file nesting, public APIs, dependency direction, styles and tradeoffs. |
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
| OPS-01 | IN PROGRESS | active-building | One PR required; no open PR was found. Commit and push this audit/checklist increment to the authorized feature branch, open the draft PR, then verify its remote head and changed files and maintain the description. |
| OPS-02 | TODO | active-building | Verify task-owned volatile processes/outcomes and preserve existing profiles, sessions, tasks, memory and worktrees; make no merge/live-deployment claim. |

## Explicit findings disposition in the initial sample

- **Confirmed:** none.
- **Withdrawn:** M-01 (module application-vs-composition API distinction stated in context); H-01 (Hexagonal source requirement edge exists and is explained); D-01 (design-token arrows are consistent with the stated dependency graph and token-reference example). Evidence and exact locations are in `maintenance/handbook-audit.md`.
- **Pending:** all other audit scope and acceptance requirements, including complete inventory, Phase I gate, Phase II, independent review, PR checks and post-merge deployment verification.
