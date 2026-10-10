---
name: architecture-aware-implementation
description: Implement a focused application feature or refactor while preserving its approved architecture, public contracts and tests. Use when a coding task crosses modules, HTTP boundaries, domain rules or persistence.
---

# Architecture-aware Implementation

This skill runs in a **consuming application**. The handbook is a read-only design reference, not an instruction to reorganize the application. Read application instructions and approved ADRs before consulting it.

## Before writing code

1. State the requested observable behavior and how to verify it. Identify callers, public contracts, data migrations and failure cases.
2. Read the relevant implementation, tests and application instructions. Do not infer ownership from a folder name alone.
3. Confirm the handbook checkout is accessible and record the exact commit read. Consult its README and only the pages needed for the change. If unavailable, state that.
4. Distinguish framework requirements, standards, application decisions and handbook recommendations. Preserve accepted design decisions unless the task authorizes changing them.
5. Choose the smallest complete change. Describe affected files, responsibilities, dependencies and any compatibility risks. Avoid introducing speculative abstractions.

## Implement

- Keep transport parsing at the transport boundary and business validity with its authoritative owner.
- Keep source dependencies consistent with the application's chosen boundaries; do not mechanically copy handbook file paths.
- Treat security, authorization, tenant isolation, transaction scope and data integrity as explicit requirements when relevant.
- Handle known errors at the correct boundary. Do not leak sensitive information.
- Preserve existing API consumers, data and migration paths, or document an explicitly approved breaking change.
- Add tests for behavior, meaningful failures and previously identified regressions.

## Verify and report

1. Run relevant project tests, type checks and static checks; exercise a real integration boundary when the change requires it.
2. Check the final diff for unrelated edits, leaked secrets, broken contracts, missing migrations and unnecessary dependencies.
3. Revisit the handbook only if a design claim needs checking; it is not a substitute for running tests.
4. Report files changed, decisions and trade-offs, handbook commit used, commands actually executed, results and remaining limitations.

Do not create commits, new branches or PRs unless authorized by the application task or its established workflow. Do not claim a code excerpt or test was executed unless it was.
