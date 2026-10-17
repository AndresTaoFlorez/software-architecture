# Handbook Recovery and Website — Implementation Checklist

This checklist tracks the authorized two-phase assignment. `DONE` requires artifact/check/commit evidence; full reading is not full-topic certification. Published baseline: `17030a0`; the current bounded audit is a local candidate awaiting independent review and publication.

| ID | Status | Owner | Evidence / next verifiable step |
| --- | --- | --- | --- |
| INIT-01 | DONE | active-building | Initialization gate, accepted task execution and independent review are recorded. Delivery-branch HEAD and published `17030a0` match; initialization no longer blocks bounded audits. |
| INIT-02 | DONE | active-building | Existing draft PR #22 contains the initial audit and inventory. Independent verification established exact equality with the 111 tracked Markdown paths at `033c661`, without duplicate, missing or extra rows. Published `17030a0` passed a provisional 112-file / 2,635-link check. This does not close Phase I. |
| AUD-01 | IN PROGRESS | active-building | Findings, withdrawn concerns and bounded frontend/backend/domain plus consumer-skill evidence are recorded in [the audit](handbook-audit.md). Pending paths remain explicit in [the inventory](path-inventory.md). |
| P1-01 | IN PROGRESS | active-building | NAV-01/NAV-02, onboarding navigation and the site-only tooling clarification were independently reviewed and published in `17030a0`. Broader editorial/organization coverage remains incomplete. |
| P1-02 | IN PROGRESS | active-building | Six foundation chapters have bounded full-read evidence; no defect was demonstrated there. Continue styles, patterns and deeper module-growth assessment; retain independent-review requirements. |
| P1-03 | IN PROGRESS | active-building | All 12 frontend pages, 12 backend pages and domain-modeling README read in full at `17030a0`. Static traces cover ownership, validation, source/runtime/startup, failures, rule/integration/growth changes and exercise answers. FLOW-01 corrects a contradictory diagram legend in this candidate. API/pattern coverage, transfer tests and independent candidate review remain. |
| P1-04 | IN PROGRESS | active-building | Panda tokens, recipes, slot recipes and text styles compared with handbook excerpts/path ownership; correct material preserved. Framework sources support the assessed semantics. Documentation-only examples need no physical application files. Runtime/generated-CSS and rendered visual checks were not performed; no site implementation is certified. |
| P1-05 | IN PROGRESS | onboarding | Independent static full-read assessment of seven skills and 21 hypothetical scenarios integrated into the audit/inventory. F1 corrected only in the API skill's REST verification sentence; F2 is already published. Consumer activation and transfer/runtime evidence remain pending. |
| P1-GATE | TODO | active-building | Require transfer tests, independent review, consistency evidence and resolution of high-severity findings. No complete Phase I claim follows from this slice. |
| P2-01 | TODO | active-building | After Phase I gate, record supported Astro/Starlight ADR and prove canonical-source loader, routes, links, anchors, assets, diagrams and compatibility. |
| P2-02 | TODO | active-building | Verify responsive accessible reader navigation, search, TOC, theme and diagram interactions; document styling choice. |
| P2-03 | TODO | active-building | Document and test the site's actual modules, responsibilities, flows and architectural case study. |
| P2-04 | TODO | active-building | Verify lockfile-based CI/build and main-only Pages workflow, permissions, base path and human settings prerequisites. |
| P2-GATE | TODO | active-building | Complete section 4.6 test matrix with evidence/limits; verify PR checks. Deployment remains pending merge and a successful post-merge run. |
| QA-01 | TODO | editorial-review | Independently review exact candidate artifacts for pedagogy, technical architecture and site/accessibility/deployment scopes; state expertise/tool limits. |
| QA-02 | TODO | active-building | Resolve actionable reviewed findings and revalidate changed scope; reassess after two substantive unresolved correction rounds. |
| OPS-01 | IN PROGRESS | active-building | Baseline `17030a0` is published on draft PR #22. This audit candidate requires independent review/publication on that branch; no merge is authorized. |
| OPS-02 | TODO | active-building | Verify task-owned volatile processes/outcomes and preserve existing profiles, sessions, tasks, memory and worktrees; make no merge/live-deployment claim. |

## Findings disposition

- Corrected and published in `17030a0`: NAV-01, NAV-02, POL-01 and onboarding F2.
- Corrected in this candidate: FLOW-01 (case-study legend) and onboarding F1 (protected authentication with permitted anonymity).
- Withdrawn: M-01, H-01 and D-01; context and diagram semantics do not support the reported concerns.
- Pending: unreviewed content, transfer/runtime/visual evidence, independent candidate review, Phase I gate, Phase II, publication/PR checks and post-merge deployment verification. Initialization is not a current blocker.
