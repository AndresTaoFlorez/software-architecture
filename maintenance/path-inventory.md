# Repository Path Inventory — Handbook Recovery

**Revision inventoried:** `033c6616fb56c0f2a801e1127e681c7eb6b2ad64` (2026-10-16; `git ls-files`).
**Coverage meaning:** every listed path is inventoried. “Full” means the named bounded slice was read; it does not certify every topic in that file. P1-03/P1-04 readings use `17030a0`; P1-05 coverage comes from the independent static assessment at `033c661`, with F1 checked again in the current candidate. No consumer skill was runtime-activated. All other paths remain pending content review.

**Total at the assessment base:** 111 tracked Markdown paths; seven consumer skills. Independent verification established exact set equality with the historical tracked paths, without duplicates, missing or extra rows. Published `17030a0` contains this inventory as one additional Markdown path; the historical scope remains unchanged.

## Repository root (4)

| Path | Coverage status |
| --- | --- |
| `AGENTS.md` | Full — P1-01 rules/navigation; site-only policy correction published in `17030a0` |
| `CONTRIBUTING.md` | Full — P1-01; tooling boundary |
| `GLOSSARY.md` | Inventory only; content review pending |
| `README.md` | Full — P1-01 route verification |

## Architecture map (1)

| Path | Coverage status |
| --- | --- |
| `architecture/README.md` | Full — route verification |

## Foundations (8)

| Path | Coverage status |
| --- | --- |
| `architecture/foundations/README.md` | Full — route verification |
| `architecture/foundations/architecture-testing.md` | Full — P1-02 bounded review |
| `architecture/foundations/code-placement.md` | Full — P1-02 bounded review |
| `architecture/foundations/composition-root.md` | Full — P1-02 bounded review |
| `architecture/foundations/dependency-boundaries.md` | Full — P1-02 bounded review |
| `architecture/foundations/domain-modeling/README.md` | Full — P1-03 ownership, vocabulary and learning route; linked skill not runtime-tested |
| `architecture/foundations/evolution-and-scaling.md` | Full — P1-02 bounded review |
| `architecture/foundations/module-boundaries-and-public-apis.md` | Full — initial sample; M-01 withdrawn |

## Styles (22)

| Path | Coverage status |
| --- | --- |
| `architecture/styles/README.md` | Full — P1-02 style-map navigation |
| `architecture/styles/clean-architecture/1-the-dependency-rule.md` | Inventory only; content review pending |
| `architecture/styles/clean-architecture/2-the-four-layers.md` | Inventory only; content review pending |
| `architecture/styles/clean-architecture/3-project-structure.md` | Inventory only; content review pending |
| `architecture/styles/clean-architecture/4-building-a-feature.md` | Inventory only; content review pending |
| `architecture/styles/clean-architecture/5-testing-in-clean.md` | Inventory only; content review pending |
| `architecture/styles/clean-architecture/6-composition-and-di.md` | Inventory only; content review pending |
| `architecture/styles/clean-architecture/7-scaling-and-patterns.md` | Inventory only; content review pending |
| `architecture/styles/clean-architecture/8-clean-on-the-backend.md` | Inventory only; content review pending |
| `architecture/styles/clean-architecture/README.md` | Full — P1-02 route/terminology comparison |
| `architecture/styles/clean-architecture/references.md` | Inventory only; content review pending |
| `architecture/styles/hexagonal-architecture/README.md` | Full — initial sample; H-01 withdrawn; P1-02 route/terminology comparison |
| `architecture/styles/layered-architecture/README.md` | Full — P1-02 route/terminology comparison |
| `architecture/styles/onion-architecture/1-the-rings.md` | Inventory only; content review pending |
| `architecture/styles/onion-architecture/2-inward-dependencies.md` | Inventory only; content review pending |
| `architecture/styles/onion-architecture/3-testing-in-onion.md` | Inventory only; content review pending |
| `architecture/styles/onion-architecture/4-advanced-patterns.md` | Inventory only; content review pending |
| `architecture/styles/onion-architecture/5-styling-and-animation.md` | Inventory only; content review pending |
| `architecture/styles/onion-architecture/6-scaling.md` | Inventory only; content review pending |
| `architecture/styles/onion-architecture/7-onion-on-the-backend.md` | Inventory only; content review pending |
| `architecture/styles/onion-architecture/README.md` | Full — P1-02 route/terminology comparison |
| `architecture/styles/onion-architecture/references.md` | Inventory only; content review pending |

## Patterns (19)

| Path | Coverage status |
| --- | --- |
| `architecture/patterns/README.md` | Inventory only; content review pending |
| `architecture/patterns/persistence/README.md` | Inventory only; content review pending |
| `architecture/patterns/persistence/repository/README.md` | Inventory only; content review pending |
| `architecture/patterns/presentation/README.md` | Inventory only; content review pending |
| `architecture/patterns/presentation/model-view-controller/1-the-three-parts.md` | Inventory only; content review pending |
| `architecture/patterns/presentation/model-view-controller/2-the-flow.md` | Inventory only; content review pending |
| `architecture/patterns/presentation/model-view-controller/3-mvc-on-the-frontend.md` | Inventory only; content review pending |
| `architecture/patterns/presentation/model-view-controller/4-testing-in-mvc.md` | Inventory only; content review pending |
| `architecture/patterns/presentation/model-view-controller/README.md` | Inventory only; content review pending |
| `architecture/patterns/presentation/model-view-controller/references.md` | Inventory only; content review pending |
| `architecture/patterns/presentation/model-view-viewmodel/1-the-three-parts.md` | Inventory only; content review pending |
| `architecture/patterns/presentation/model-view-viewmodel/2-the-binding.md` | Inventory only; content review pending |
| `architecture/patterns/presentation/model-view-viewmodel/3-mvvm-on-the-frontend.md` | Inventory only; content review pending |
| `architecture/patterns/presentation/model-view-viewmodel/4-testing-in-mvvm.md` | Inventory only; content review pending |
| `architecture/patterns/presentation/model-view-viewmodel/5-mvvm-in-react-redux.md` | Inventory only; content review pending |
| `architecture/patterns/presentation/model-view-viewmodel/README.md` | Inventory only; content review pending |
| `architecture/patterns/presentation/model-view-viewmodel/references.md` | Inventory only; content review pending |
| `architecture/patterns/structural/README.md` | Inventory only; content review pending |
| `architecture/patterns/structural/facade/README.md` | Inventory only; content review pending |

## Frontend (12)

| Path | Coverage status |
| --- | --- |
| `architecture/frontend/README.md` | Full — P1-03 route, ownership and backend distinction |
| `architecture/frontend/exercises/README.md` | Full — P1-03 exercise sequence |
| `architecture/frontend/exercises/advanced.md` | Full — P1-03 public entry, God Hook and draft requirements |
| `architecture/frontend/exercises/easy.md` | Full — P1-03 placement and representation requirements |
| `architecture/frontend/exercises/intermediate.md` | Full — P1-03 composition, domain rule and reader replacement |
| `architecture/frontend/exercises/solutions.md` | Full — P1-03 all nine answers; static tracing, no React/storage execution |
| `architecture/frontend/ports-and-adapters.md` | Full — P1-03 HTTP/parser/mapper, contracts and startup versus calls |
| `architecture/frontend/presentation-architecture.md` | Full — P1-03 presentation ownership and canonical agenda core |
| `architecture/frontend/reference-case-study.md` | Full — P1-03/P1-04 responsibility and excerpt ownership; FLOW-01 legend; no runtime/visual check |
| `architecture/frontend/references.md` | Full — P1-03 reference list; selected external sources only |
| `architecture/frontend/state-management.md` | Full — P1-03 state ownership and external persistence boundary |
| `architecture/frontend/styling-and-design-system.md` | Full — P1-04 Panda semantics and file ownership; D-01 withdrawn; no generated-CSS check |

## Backend (12)

| Path | Coverage status |
| --- | --- |
| `architecture/backend/1-http-request-to-business-operation.md` | Full — P1-03 request-to-operation ownership |
| `architecture/backend/2-typescript-first-boundaries.md` | Full — P1-03 parser/domain/constant separation and repository failures |
| `architecture/backend/3-nestjs-building-blocks.md` | Full — P1-03 lifecycle, provider tokens and module visibility |
| `architecture/backend/4-create-ticket-with-nestjs.md` | Full — P1-03 memory/Prisma wiring, failures and diagram semantics |
| `architecture/backend/5-architectural-styles-with-nestjs.md` | Full — P1-03 framework mechanisms versus architectural policies |
| `architecture/backend/README.md` | Full — P1-03 learning sequence and prerequisites |
| `architecture/backend/exercises/README.md` | Full — P1-03 exercise sequence |
| `architecture/backend/exercises/advanced.md` | Full — P1-03 capability API, integration and assignment requirements |
| `architecture/backend/exercises/easy.md` | Full — P1-03 responsibility and validation questions |
| `architecture/backend/exercises/intermediate.md` | Full — P1-03 endpoint composition and replacement requirements |
| `architecture/backend/exercises/solutions.md` | Full — P1-03 all nine answers; static tracing, no Nest/database execution |
| `architecture/backend/references.md` | Full — P1-03 reference list; selected external sources only |

## API design (13)

| Path | Coverage status |
| --- | --- |
| `architecture/api-design/README.md` | Inventory only; content review pending |
| `architecture/api-design/contracts-and-boundaries.md` | Inventory only; content review pending |
| `architecture/api-design/exercises/README.md` | Inventory only; content review pending |
| `architecture/api-design/exercises/design.md` | Inventory only; content review pending |
| `architecture/api-design/exercises/engineering.md` | Inventory only; content review pending |
| `architecture/api-design/exercises/foundations.md` | Inventory only; content review pending |
| `architecture/api-design/exercises/solutions.md` | Inventory only; content review pending |
| `architecture/api-design/http-and-identifiers.md` | Inventory only; content review pending |
| `architecture/api-design/interface-styles-and-events.md` | Inventory only; content review pending |
| `architecture/api-design/references.md` | Inventory only; content review pending |
| `architecture/api-design/reliability-and-operations.md` | Inventory only; content review pending |
| `architecture/api-design/resources-and-operations.md` | Inventory only; content review pending |
| `architecture/api-design/security-and-tenancy.md` | Inventory only; content review pending |

## Conventions (4)

| Path | Coverage status |
| --- | --- |
| `architecture/conventions/README.md` | Full — P1-01 |
| `architecture/conventions/architecture-guide-template.md` | Full — P1-01 |
| `architecture/conventions/editorial-review.md` | Full — P1-01 |
| `architecture/conventions/naming-and-file-placement.md` | Full — P1-01 |

## Consumer skills (7)

| Path | Coverage status |
| --- | --- |
| `agent-onboarding/skills/api-design/SKILL.md` | Full — P1-05 independent static assessment and three scenarios; F1 sentence corrected; no activation |
| `agent-onboarding/skills/architecture-assessment/SKILL.md` | Full — P1-05 independent static assessment and three scenarios; no activation |
| `agent-onboarding/skills/architecture-boundary-testing/SKILL.md` | Full — P1-05 independent static assessment and three scenarios; no activation |
| `agent-onboarding/skills/architecture-refactoring/SKILL.md` | Full — P1-05 independent static assessment and three scenarios; no activation |
| `agent-onboarding/skills/backend-architecture/SKILL.md` | Full — P1-05 independent static assessment and three scenarios; no activation |
| `agent-onboarding/skills/domain-modeling/SKILL.md` | Full — P1-05 independent static assessment and three scenarios; no activation |
| `agent-onboarding/skills/frontend-architecture/SKILL.md` | Full — P1-05 independent static assessment and three scenarios; no activation |

## Onboarding templates (5)

| Path | Coverage status |
| --- | --- |
| `agent-onboarding/templates/AGENTS.md` | Inventory only; content review pending |
| `agent-onboarding/templates/GEMINI.md` | Inventory only; content review pending |
| `agent-onboarding/templates/START-PROMPT.md` | Inventory only; content review pending |
| `agent-onboarding/templates/assistant-instructions.md` | Inventory only; content review pending |
| `agent-onboarding/templates/copilot-instructions.md` | Inventory only; content review pending |

## Onboarding index (1)

| Path | Coverage status |
| --- | --- |
| `agent-onboarding/README.md` | Inventory only; content review pending |

## Extras (1)

| Path | Coverage status |
| --- | --- |
| `extras/README.md` | Inventory only; content review pending |

## Maintenance (2)

| Path | Coverage status |
| --- | --- |
| `maintenance/handbook-audit.md` | Full — audit record |
| `maintenance/implementation-checklist.md` | Full — progress record |
