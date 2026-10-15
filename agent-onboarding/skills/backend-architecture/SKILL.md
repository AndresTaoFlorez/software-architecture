---
name: backend-architecture
description: Implement or refactor server-side application behavior across delivery, workflows, business rules, persistence, integrations, modules, or startup composition. Use api-design for HTTP semantics and public contract decisions.
---

# Backend Architecture

Use in a consuming application's backend, service, worker, or CLI-facing server. Application instructions, contracts, security rules, and accepted ADRs take precedence. The handbook is a versioned, read-only reference; check its approved revision and do not edit it from the application. Do not assume a framework, database, or folder scheme.

## Applicability and boundaries

Use when behavior crosses meaningful server responsibilities or a backend boundary needs protection. For a small handler with no demonstrated boundary, keep the change simple. Do not add layers, DTOs, Repository interfaces, services, or containers by ritual. `api-design` owns HTTP semantics, REST claims, public contract, compatibility, and protocol choice; this skill owns implementation placement. Hand off public contract decisions rather than duplicating them.

## Workflow

1. **Inspect:** Read application instructions and ADRs; trace callers, existing behavior, runtime stack and versions, tests, data/transaction boundaries, integrations, authorization, tenancy, and compatibility promises. Identify the authoritative owner of the changed rule.
2. **Map:** Trace the actual path: caller → delivery/transport → application operation (if needed) → domain decision (if needed) → required capability/port (if needed) → infrastructure → startup composition. Map those roles to existing project files; do not impose handbook paths. Distinguish source dependencies, runtime calls, and composition.
3. **Decide and implement:** Keep unknown external shapes checked at their boundary; keep business invariants with their authoritative owner; keep coordination with the operation and external I/O with its integration. Add an abstraction only when it protects a real change or substitute. Preserve public module APIs. Address authentication, authorization, tenant scope, transactionality, external failures, timeouts, and sensitive error/log output in proportion to actual risk. Use framework hooks only if the application uses that framework.
4. **Verify:** Run existing focused tests for the business decision, workflow, integration/transaction behavior, authorization, and changed boundary. Add negative cases for rejected inputs, forbidden access, and relevant failure/concurrency paths. A unit test or mock does not prove database guarantees or runtime security. Use the application's actual commands and versions.
5. **Report:** State observed behavior, owners/files changed, rationale and alternatives, contract/security/compatibility effects, checks actually executed and results, handbook revision, and unresolved risks. Separate execution from review and assumptions.

## References and cooperation

Select pages from [Backend](../../../architecture/backend/README.md), [Code Placement](../../../architecture/foundations/code-placement.md), [Dependency Boundaries](../../../architecture/foundations/dependency-boundaries.md), [Module Boundaries](../../../architecture/foundations/module-boundaries-and-public-apis.md), [Composition Root](../../../architecture/foundations/composition-root.md), and [Architecture Testing](../../../architecture/foundations/architecture-testing.md). Consult [Repository](../../../architecture/patterns/persistence/repository/README.md) only when stored domain objects and collection-like persistence justify it. Handbook file paths are examples/conventions, not requirements.

For an HTTP contract change, pair with `api-design`; use `frontend-architecture` for a coordinated client implementation and `domain-modeling` when meaningful invariants are central. Do not invoke every skill for ordinary work.