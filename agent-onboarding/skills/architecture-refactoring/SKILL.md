---
name: architecture-refactoring
description: Safely change existing module responsibilities, dependencies, integrations, or architecture when observed coupling or boundary problems impede real work. Do not use for aesthetic folder changes or automatic rewrites.
---

# Architecture Refactoring

Use in a consuming application when demonstrated coupling, responsibility drift, unstable public modules, untestable workflows, brittle integration, or a violated agreed boundary impedes a real change. Application instructions, approved decisions, contracts, and data policies remain authoritative. The handbook is versioned, read-only guidance; verify the approved revision and do not edit it from the application.

## Applicability

Require an observable problem and affected change boundary. Decline aesthetic renames, speculative “modernization,” and wholesale rewrites without evidence. Do not introduce a new style, layer, service, or deployment boundary automatically. Separate structural refactoring from deliberate behavior, data, or public-contract changes; ask for approval where application policy requires it.

## Workflow

1. **Inspect:** Read instructions/ADRs and trace actual callers, supported public APIs, runtime behavior, tests, data schemas/migrations, integrations, deployments, and consumers. Describe the pressure with examples (e.g. repeated cross-capability edits or an integration change that forces a business-rule edit). Establish current observable behavior and dependency edges.
2. **Plan:** Identify the smallest safe boundary and sequence. State invariants, compatibility requirements, rollback/migration needs, security implications, and risks. Add characterization or regression checks before risky moves. Keep the plan reversible where possible; do not mix unrelated cleanup or silent contract changes.
3. **Refactor incrementally:** Move/redirect one responsibility at a time, preserving existing behavior and consumer-facing APIs. Introduce a supported entry point or adapter only when it protects a real dependency. Update consumers deliberately; preserve data and migration paths. Avoid compatibility shims that become unsupported permanent APIs.
4. **Verify:** Run focused behavior and contract tests after each meaningful step, plus relevant integration, migration, security, and architecture checks. Compare before/after dependency relationships and confirm the observed pressure is reduced without creating new coupling. Tests that were not run remain unverified.
5. **Report:** Explain the evidence, before/after ownership and dependencies, actual files, compatibility and migration outcomes, tests/commands actually executed, remaining risks, handbook revision, and deviations from the plan.

## References and handoffs

Select from [Architecture Evolution](../../../architecture/foundations/evolution-and-scaling.md), [Architecture Testing](../../../architecture/foundations/architecture-testing.md), [Module Boundaries](../../../architecture/foundations/module-boundaries-and-public-apis.md), [Code Placement](../../../architecture/foundations/code-placement.md), [Styles](../../../architecture/styles/README.md), and relevant [backend](../../../architecture/backend/README.md) or [frontend](../../../architecture/frontend/README.md) pages. Treat style and filesystem examples as options. Use `api-design` when the refactor changes an HTTP/public contract; use the domain, backend, or frontend skill for the affected implementation when useful. Keep cross-skill handoffs bounded.