---
name: frontend-architecture
description: Design or change browser application screens, interaction state, navigation, asynchronous data flows, component ownership, or UI integrations. Use api-design when the public HTTP contract itself must change.
---

# Frontend Architecture

Use in a consuming application for user-facing behavior and its integrations. The application's instructions, accepted decisions, accessibility and security requirements, and real stack are authoritative. The handbook is a versioned, read-only reference; check its approved revision and do not edit it from the application. Do not assume React, Redux, or a prescribed folder tree.

## Applicability and boundaries

Use when screen composition, state ownership, asynchronous UI behavior, or frontend integration needs a decision. Keep a local, simple interaction local if no wider boundary is needed. Do not impose Redux, MVVM, Clean Architecture, ports, or a folder scheme. The backend remains authoritative for persisted business invariants; client checks may support feedback but cannot replace server enforcement. `api-design` owns public HTTP semantics/contracts; this skill owns client integration and UI behavior.

## Workflow

1. **Inspect:** Read application instructions/ADRs and trace the route, components, state, data-fetching mechanism, callers, tests, runtime/framework versions, accessibility conventions, and existing contracts. Identify user-visible behavior and the owner of each value.
2. **Classify:** Separate screen/presentation state (selection, open panels, feedback), server-owned data and freshness, reusable application behavior, and external API representation. Keep state with the smallest suitable owner and lifetime. Use a separate screen facade or state library only when it protects real reuse, coordination, or change.
3. **Implement:** Map actual project files and public interfaces. Handle loading, empty, error, stale-response, cancellation/unmount and retry behavior as relevant to the actual flow. Keep API parsing/mapping with the integration and presentation formatting with the screen. Preserve keyboard use, semantic markup, focus, and accessible feedback. Do not duplicate an authoritative backend decision as a trusted client rule.
4. **Verify:** Run project tests and checks for interaction, accessibility-relevant states, async races/cancellation, and integration mapping as applicable. Verify changed behavior in the project's supported runtime when available. A component test does not establish backend enforcement or API compatibility.
5. **Report:** State behavior, actual owners/files, rationale, user-visible and accessibility impact, checks actually run, handbook revision, uncertainties, and limits.

## References and handoffs

Read relevant sections of [Frontend](../../../architecture/frontend/README.md), [Presentation Architecture](../../../architecture/frontend/presentation-architecture.md), [Frontend Integration](../../../architecture/frontend/ports-and-adapters.md), [State Management](../../../architecture/frontend/state-management.md), and [presentation patterns](../../../architecture/patterns/presentation/README.md). Use [Hexagonal Architecture](../../../architecture/styles/hexagonal-architecture/README.md) only if replaceable integrations matter. These are guidance, not framework or application mandates. Work with `api-design` only for a public contract decision and `backend-architecture` for server implementation; avoid duplicate contract design.
