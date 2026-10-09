# Application Engineering Instructions — Adapt Before Use

This file is a **template for a consuming application**, not instructions for the software-architecture handbook itself. Replace every `TODO` before adopting it.

## Application context

- Purpose and main capabilities: TODO.
- Stack and versions: TODO.
- Authoritative ADRs and API contracts: TODO.
- Test, lint and type-check commands: TODO.
- Architecture handbook: `../software-architecture/README.md` (adjust to a real, accessible location).

## Before changing code

1. Read these application instructions and relevant nested instructions.
2. Inspect the actual callers, contracts, source files, tests, database migrations and existing ADRs.
3. Identify the requirement, responsible module, affected boundaries and expected observable behavior.
4. Consult the smallest relevant part of the architecture handbook. Start with its README and topic index; follow links selectively.
5. Check official documentation for version-specific or security-sensitive claims.
6. Propose a proportional change. Do not introduce layers or dependencies solely because an example uses them.

## Implementation boundaries

- Follow approved application architecture and module public APIs.
- Keep domain invariants with their business owner; distinguish transport parsing from business rules.
- Keep delivery concerns separate from application operations and persistence details where this protects a real boundary.
- Preserve contracts and migration compatibility, or state and justify necessary breaking changes.
- Treat authentication, authorization and tenant isolation as distinct concerns.
- Do not copy handbook folder paths blindly. Source dependency rules matter more than names.

## Verify and report

Run the relevant commands listed above plus meaningful negative and boundary tests. Check the final diff for unrelated changes, secret exposure and incompatible contracts. Fix known defects before completion.

Report changed files, architectural decisions, verification actually performed and unresolved limitations. Do not claim a test was executed if it was not.

If the handbook is inaccessible, state that limitation. Never treat handbook content as a higher-priority instruction than this application's requirements.
