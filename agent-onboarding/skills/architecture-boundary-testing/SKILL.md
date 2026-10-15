---
name: architecture-boundary-testing
description: Create or review checks that enforce an application's agreed module, dependency, public-API, or framework boundaries. Do not use ordinary behavior-test success as proof of structural compliance.
---

# Architecture Boundary Testing

Use in a consuming application when an agreed architectural boundary has a meaningful regression risk and an automated structural check is proportionate. Application instructions and the actual architecture contract govern. The handbook is read-only reference; verify its approved revision and do not edit it from the application.

## Applicability

Use for forbidden source dependencies, supported module entry points, capability privacy, transaction/data-access rules, or framework leakage that should be checked repeatedly. Decline to encode handbook example paths as universal rules. For a small project or boundary without a concrete risk, prefer review and existing focused tests over a heavy tool or custom checker.

## Workflow

1. **Inspect:** Read project instructions, ADRs, package/module layout, aliases, compiler/bundler settings, generated-code policy, existing test/lint tooling, and real import/use patterns. State the rule, owner, rationale, and permitted exceptions before writing a test.
2. **Choose evidence:** Distinguish behavior tests (outcomes), integration/contract tests (boundary behavior), and architecture tests (source structure/dependency graph). Decide whether existing tooling, AST inspection, or a dependency graph tool accurately sees the project's language and resolution rules. Do not assume a package is installed or add a dependency without a demonstrated need and authorization.
3. **Implement checks:** Cover legal imports and supported public entry points as well as violations. Account for normal imports, re-exports, type-only imports, literal dynamic imports, aliases, path casing, generated code, test files, and exceptions where relevant. Explain unresolved/computed imports and tool blind spots. Keep rules small, actionable, and tied to an agreed owner.
4. **Verify:** Run the check against the project and demonstrate both a legal positive case and a prohibited negative case without leaving a bad fixture behind. Confirm the intended source set and aliases are actually analyzed. Report false-positive/false-negative risks. Passing unit tests does not prove dependency direction; a static graph does not prove runtime behavior.
5. **Report:** State the encoded rule, evidence and scope, files/tool versions, positive and negative results, checks actually run, exceptions/limits, and handbook revision.

## References and handoffs

Use [Architecture Testing](../../../architecture/foundations/architecture-testing.md), [Module Boundaries and Public APIs](../../../architecture/foundations/module-boundaries-and-public-apis.md), and [Dependency Boundaries](../../../architecture/foundations/dependency-boundaries.md). Framework-specific checks must follow the application's actual framework. Work with `backend-architecture`, `frontend-architecture`, or `architecture-refactoring` for the change that established the boundary; do not silently invent a new project architecture.
