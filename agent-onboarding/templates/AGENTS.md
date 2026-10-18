# Application Engineering Instructions — Adapt Before Use

This file is a **template for a consuming application**, not instructions for the software-architecture handbook itself. Merge it with existing project instructions. Replace every `TODO` and the example handbook path before adopting it.

## Application context

- Purpose and main capabilities: TODO.
- Stack and versions: TODO.
- Authoritative ADRs and API contracts: TODO.
- Test, lint and type-check commands: TODO.
- Architecture handbook: `../software-architecture/README.md` (replace with a location accessible to the agent running this application).
- Handbook reference policy and expected commit: TODO (a reviewed SHA pin, or how updates from `main` are reviewed and recorded).

## Before changing code

1. Read these application instructions and relevant nested instructions.
2. Inspect the actual callers, contracts, source files, tests, database migrations and existing ADRs.
3. Identify the requirement, responsible module, affected boundaries and expected observable behavior.
4. Confirm the handbook checkout's actual commit against the expected commit. If they differ, select the approved revision in a dedicated checkout or report the mismatch before relying on the guide. Start with the handbook README and topic index; follow links selectively. Never assume the checkout contains the latest `main` unless verified.
5. Check applicable specifications and official documentation for version-specific or security-sensitive claims. The handbook illustrates alternatives; approved application contracts and ADRs govern the implementation.
6. Propose a proportional change. Do not introduce layers or dependencies solely because an example uses them.

## Design-only work

When only an architecture scheme is requested, follow `architecture/foundations/architecture-design-review.md` in the verified handbook. Describe the relevant frontend/backend owners, proposed subfolders and important contracts; trace source dependencies, runtime calls and composition separately. Justify consequential choices and omissions with application requirements and specific source sections, marking conventions and design inferences. Include failure paths, change impact and proposed checks. Do not create application source, dependencies or infrastructure. A new project has no existing tests to run; a coherent plan does not prove runtime behavior.

## Implementation boundaries

- Follow approved application architecture and module public APIs.
- Keep domain invariants with their business owner; distinguish transport parsing from business rules.
- Keep delivery concerns separate from application operations and persistence details where this protects a real boundary.
- Preserve contracts and migration compatibility, or state and justify necessary breaking changes.
- Treat authentication, authorization and tenant isolation as distinct concerns.
- Do not copy handbook folder paths blindly. Source dependency rules matter more than names.

## Verify and report

For authorized implementation, run the concrete test, lint and type-check commands filled in above, plus meaningful negative and boundary tests. Check the final diff for unrelated changes, secret exposure and incompatible contracts. Fix known defects before completion. For design-only work, label checks as proposed and report only source/review verification actually performed.

Report the application instruction files and handbook pages actually read, changed files, architectural decisions, the handbook commit consulted, verification actually performed and unresolved limitations. Do not claim a test was executed if it was not.

If the handbook is inaccessible, state that limitation. Never treat handbook content as a higher-priority instruction than this application's requirements.
