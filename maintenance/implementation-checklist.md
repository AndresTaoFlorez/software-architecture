# Handbook Recovery and Website — Implementation Checklist

This checklist tracks specification §§0–5. `DONE` requires artifact/check/commit evidence; full reading is not certification. Phase I acceptance applies to published `4ea5c57` on PR #22, with the explicit limits in the audit. Phase II is in progress; local site evidence does not certify deployment or reader UX.

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
| P2-01 | TODO | active-building | After P1 verdict: supported-version ADR, canonical-source adapter and route/link/anchor tests (§§4.1–4.2). |
| P2-02 | TODO | active-building | Reader UX, styling choice, responsive/a11y/search/diagram evidence (§§4.3/4.6). |
| P2-03 | TODO | active-building | Minimal site modules, actual flows and tested architectural case study (§4.4). |
| P2-04 | IN PROGRESS | active-building | `site/package-lock.json`, `.github/workflows/site.yml` and [delivery instructions](../site/DEPLOYMENT.md) implemented. Node 22.22.1/npm 10.8.2 clean install, Astro check, 93-page build, nine tests (92 pages/4,686 links) and HTTP smoke (six pages/nine assets) passed locally. Main unprotected/rulesets empty confirmed read-only; Pages source comes from task handoff, local unauthenticated API returned 404. Independent review/push, remote PR check and post-merge deploy remain pending (§4.5). |
| P2-GATE | TODO | active-building | Complete §4.6 matrix; deployment pending human merge and successful deployment run. |
| QA-01 | IN PROGRESS | editorial-review | Independent scoped assessments integrated; exact integration commit and later site review still required. |
| QA-02 | IN PROGRESS | active-building | Focused API/MVVM/TextStyles corrections recorded; candidate revalidation/verdict pending. |
| OPS-01 | IN PROGRESS | active-building | One PR/branch; candidate committed without push for Codex review/publication. No merge (§§1/6). |
| OPS-02 | IN PROGRESS | active-building | Existing checkout/resources preserved; no task-owned background process launched. Final project inventory remains (§§1/7). |

## Findings disposition

- Published: NAV-01/NAV-02/POL-01/F2 (`17030a0`), FLOW-01/F1 (`e32c7bc`), API-01 HIGH and API-02–04 MEDIUM (`4e1419b`).
- Published in `4ea5c57` and independently accepted: MVVM MEDIUM, TextStyles LOW.
- Withdrawn: M-01/H-01/D-01. Panda's advice to avoid layout/color in text styles is source-supported; no attribution defect remains.
- Not executed: consumer activation, PostgreSQL/HTTP races, generated Panda CSS or website checks. Transfer is one independent agent's conceptual evidence, not human/runtime proof. Approval-blocked scripts await Codex; no bypass. These limits do not imply executable handbook examples are required.
- The Phase I handbook gate is accepted with the explicit limits above. Phase II, final PR checks and post-merge deployment remain outstanding.
