# Handbook Recovery and Website — Implementation Checklist

This checklist tracks specification §§0–5. `DONE` requires artifact/check/commit evidence; full reading is not certification. Published base: `4e1419b` on PR #22. The Phase I integration candidate awaits Codex's exact-commit verdict and publication; Phase II has not started.

| ID | Status | Owner | Evidence / next verifiable step |
| --- | --- | --- | --- |
| INIT-01 | DONE | active-building | Delivery checkout/branch preserved; fetched published base `4e1419b` matches HEAD before integration. No new worktree. |
| INIT-02 | DONE | active-building | PR #22 contains initial audit/checklist and exact 111-path historical inventory. `17030a0` had provisional 112-file / 2,635-link evidence, not rendering proof. |
| AUD-01 | IN PROGRESS | active-building | [Audit](handbook-audit.md) integrates all scoped assessments; [inventory](path-inventory.md) records paths/bases. Final consistency/verdict pending (§2). |
| P1-01 | IN PROGRESS | active-building | Conventions retained after review; NAV-01/NAV-02/POL-01 and onboarding F2 published in `17030a0`. Final integrated acceptance pending (§§3.1/3.3). |
| P1-02 | IN PROGRESS | active-building | Foundations and all 22 styles read; distinct constraints, module growth and public APIs retained. Independent transfer recorded; candidate gate pending (§3.2). |
| P1-03 | IN PROGRESS | active-building | Full-read frontend/backend/domain/API/pattern/glossary coverage integrated. FLOW-01 published in `e32c7bc`; API-01–04 in `4e1419b`. MVVM contract/tests corrected in candidate; independent recheck pending (§3.2). |
| P1-04 | IN PROGRESS | active-building | Panda source/ownership assessment retained; TextStyles label corrected only. Prior Mermaid diagnostic covers light/dark 1440/390px, not GitHub/site. Final recheck pending (§3.2). |
| P1-05 | IN PROGRESS | onboarding | Seven skills, five templates and onboarding README read; 21 static positive/negative/ambiguous scenarios. F1 published in `e32c7bc`, F2 in `17030a0`; no consumer runtime. Acceptance of explicit runtime limits pending (§3.4). |
| P1-GATE | IN PROGRESS | active-building | Three independent new-domain transfers recorded. Codex must inspect exact commit, check inventory/links/anchors and corrected snippets, resolve exceptions, then issue verdict. Not DONE (§3.5). |
| P2-01 | TODO | active-building | After P1 verdict: supported-version ADR, canonical-source adapter and route/link/anchor tests (§§4.1–4.2). |
| P2-02 | TODO | active-building | Reader UX, styling choice, responsive/a11y/search/diagram evidence (§§4.3/4.6). |
| P2-03 | TODO | active-building | Minimal site modules, actual flows and tested architectural case study (§4.4). |
| P2-04 | TODO | active-building | Lockfile, PR checks, main-only Pages workflow and human settings prerequisites (§4.5). |
| P2-GATE | TODO | active-building | Complete §4.6 matrix; deployment pending human merge and successful deployment run. |
| QA-01 | IN PROGRESS | editorial-review | Independent scoped assessments integrated; exact integration commit and later site review still required. |
| QA-02 | IN PROGRESS | active-building | Focused API/MVVM/TextStyles corrections recorded; candidate revalidation/verdict pending. |
| OPS-01 | IN PROGRESS | active-building | One PR/branch; candidate committed without push for Codex review/publication. No merge (§§1/6). |
| OPS-02 | IN PROGRESS | active-building | Existing checkout/resources preserved; no task-owned background process launched. Final project inventory remains (§§1/7). |

## Findings disposition

- Published: NAV-01/NAV-02/POL-01/F2 (`17030a0`), FLOW-01/F1 (`e32c7bc`), API-01 HIGH and API-02–04 MEDIUM (`4e1419b`).
- Candidate: MVVM MEDIUM, TextStyles LOW; independent verdict pending.
- Withdrawn: M-01/H-01/D-01. Panda's advice to avoid layout/color in text styles is source-supported; no attribution defect remains.
- Not executed: consumer activation, PostgreSQL/HTTP races, generated Panda CSS or website checks. Transfer is one independent agent's conceptual evidence, not human/runtime proof. Approval-blocked scripts await Codex; no bypass. These limits do not imply executable handbook examples are required.
- Phase I is not certified. Phase II, final PR checks and post-merge deployment remain outstanding.
