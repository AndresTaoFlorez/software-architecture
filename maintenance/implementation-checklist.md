# Handbook Recovery and Website — Implementation Checklist

This checklist tracks specification §§0–5. `DONE` records candidate readiness with executed evidence and explicit limits; it does not certify live deployment. Phase I acceptance applies to `4ea5c57`. The site source candidate `bf4604b` was independently reviewed, published and verified on Windows, Linux and GitHub CI. [The verification matrix](../site/VERIFICATION.md) records browser scope and remaining release limits. PR #22 stays unmerged for human review.

| ID | Status | Owner | Evidence / next verifiable step |
| --- | --- | --- | --- |
| INIT-01 | DONE | active-building | Delivery checkout/branch preserved; fetched published base `4e1419b` matches HEAD before integration. No new worktree. |
| INIT-02 | DONE | active-building | PR #22 contains initial audit/checklist and exact 111-path historical inventory. `17030a0` had provisional 112-file / 2,635-link evidence, not rendering proof. |
| AUD-01 | DONE | active-building | Scoped assessments cover the historical inventory; exact path equality and final provisional link checks passed. Sources and runtime limits remain explicit in [the audit](handbook-audit.md) (§2). |
| P1-01 | DONE | active-building | Conventions retained after review; NAV-01/NAV-02/POL-01 and onboarding F2 published in `17030a0`, with integrated review accepted (§§3.1/3.3). |
| P1-02 | DONE | active-building | Foundations and all 22 styles reviewed; module/public-API distinctions retained. Three independent new-domain transfers assessed (§3.2). |
| P1-03 | DONE | active-building | Frontend/backend/domain/API/pattern/glossary assessments integrated. FLOW-01/F1 in `e32c7bc`, API-01–04 in `4e1419b`, MVVM correction in `4ea5c57`; extracted ViewModel execution passed (§3.2). |
| P1-04 | DONE | active-building | Panda ownership/source assessment and TextStyles label correction accepted. Mermaid diagnostic checked light/dark at 1440/390px; site rendering and generated CSS remain unverified (§3.2). |
| P1-05 | DONE | onboarding | Seven skills, five templates and onboarding README assessed; 21 static scenarios and focused corrections accepted. Consumer-client activation is explicitly unverified (§3.4). |
| P1-GATE | DONE | active-building | Codex accepted `4ea5c57`: reviewed corrections and independent transfer evidence; inventory exact111, provisional112 Markdown/2634 links resolved, whitespace clean, changed ViewModel executed. Explicit limits accepted for the handbook; site acceptance remains separate (§3.5). |
| P2-01 | DONE | active-building | Astro/Starlight ADR, one canonical Markdown source, supplied content resolver and domain route policy; 92 reader pages, 5,156 link/fragment checks and preserved title/repeated-heading anchors. |
| P2-02 | DONE | active-building / Codex | Native Light/Dark/System with persistence, capability-owned tokens/styles, navigation/search/TOC and diagram controls. Browser matrix: 128 page views/304 SVG renders at 1440/390 in both themes; no errors, duplicate IDs, clipped SVG text bounds or page overflow. Visual/contrast/keyboard sampling and limits are explicit in VERIFICATION. |
| P2-03 | DONE | active-building / Codex | [Actual case study](../site/ARCHITECTURE.md) maps all twelve frontend guides to modules/tests, dependency and delivery diagrams, three change scenarios and justified static-site scope. Typed renderer contracts and positive/negative architectural boundaries execute. |
| P2-04 | DONE | active-building / Codex | Locked clean installs, check/build/24 tests and six-route/ten-asset smoke passed on both OSes and [remote CI](https://github.com/AndresTaoFlorez/software-architecture/actions/runs/39108981500). Every main push selects Pages delivery; PRs cannot deploy. Pages workflow source confirmed read-only. [Human settings, release and rollback](../site/DEPLOYMENT.md) documented; no setting changed. |
| P2-GATE | DONE | Codex | Source candidate `bf4604b` accepted for human review with the VERIFICATION matrix's explicit limits and documented moderate build-time dependency risk. Live Pages remains pending human merge and a successful deployment run. |
| QA-01 | DONE | Codex | Independent pedagogy/technical handbook assessments consumed; actual site diff, ownership, public boundaries, browser rendering and deployment workflow reviewed. Author summaries were not used as acceptance alone. |
| QA-02 | DONE | active-building / Codex | Corrected API/MVVM/TextStyles plus missing link targets, repeated anchors, duplicated SVG identity, stale/unrelated-modal closure, Windows boundary paths/line endings and the mobile theme overlay. Affected checks passed. |
| OPS-01 | DONE | Codex | Same PR #22 and delivery branch; reviewed increments pushed through `bf4604b`, final evidence versioned separately. Latest publication/check receipts are in PR metadata. No merge or main push. |
| OPS-02 | DONE | Codex | One retained delivery checkout; no additional worktree created. Existing unrelated worktrees, fixtures, branches and histories preserved. Task-owned browser/dev/preview/smoke processes closed and native task results consumed; private diagnostics remain outside Git. |

## Findings disposition

- Published: NAV-01/NAV-02/POL-01/F2 (`17030a0`), FLOW-01/F1 (`e32c7bc`), API-01 HIGH and API-02–04 MEDIUM (`4e1419b`).
- Published in `4ea5c57` and independently accepted: MVVM MEDIUM, TextStyles LOW.
- Withdrawn: M-01/H-01/D-01. Panda's advice to avoid layout/color in text styles is source-supported; no attribution defect remains.
- Phase I runtime limits remain: consumer-client activation, PostgreSQL/HTTP races and generated Panda CSS were not executed; transfer evidence is conceptual. These limits do not imply executable handbook examples are required. Website execution is recorded separately in VERIFICATION.
- The handbook and site candidates are accepted for human review with explicit test/visual/type-check limits. The ten moderate dependency entries are documented in DEPLOYMENT; no forced downgrade or untested override was applied. Live publication still requires human merge and a successful main Pages run.
