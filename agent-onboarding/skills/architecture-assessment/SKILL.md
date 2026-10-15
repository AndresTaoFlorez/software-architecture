---
name: architecture-assessment
description: Assess or reconsider application boundaries, architectural styles, or consequential design choices when requirements, change pressures, or constraints are unclear. Do not load for routine fixes or established implementation decisions.
---

# Architecture Assessment

Use in a consuming application to decide whether a design boundary or style fits a concrete problem. The application's instructions, requirements, security rules, contracts, and accepted ADRs govern. Treat the handbook as a versioned, read-only reference; do not edit it from the application. If its revision is unavailable or mismatched, report that before relying on it.

## Applicability

Start when an application needs to choose or revisit responsibilities, dependency boundaries, an architectural style, or a consequential design decision. Decline routine bug fixes and straightforward work governed by an existing decision; use the smallest implementation workflow instead. Do not presume microservices, DDD, event sourcing, dependency injection, layers, or a particular folder layout.

## Workflow

1. **Inspect:** Read the application's instructions and relevant ADRs. Trace affected code, callers, tests, deployed/runtime context, consumers, operational constraints, and the observed change pressure. Separate evidence from assumptions.
2. **Frame:** State the decision, required outcomes, constraints, alternatives, and the consequences of leaving the current design unchanged. Distinguish architectural styles (system-wide constraints), design patterns (collaborating roles), and implementation techniques.
3. **Compare:** Consider only plausible alternatives. Compare Layered, Hexagonal / Ports & Adapters, Clean, or Onion when their distinct dependency and ownership constraints answer the problem. Name fit, costs, failure modes, and what each option does not solve. Prefer the least complex design that protects the demonstrated change.
4. **Decide:** Recommend one proportionate option, record evidence, trade-offs, compatibility/security implications, uncertainties, and conditions that would change the decision. Write or update a concise ADR only when the decision is consequential and durable; follow the application's format.
5. **Verify and report:** If implementation is authorized, inspect the resulting dependencies and behavior and run relevant project checks. Otherwise deliver the decision/ADR only. Report evidence, alternatives, affected owners, checks actually run, risks, and unresolved questions.

## References and handoffs

Read only relevant pages: [Foundations](../../../architecture/foundations/README.md), [Styles](../../../architecture/styles/README.md), [Code Placement](../../../architecture/foundations/code-placement.md), and [Architecture Evolution](../../../architecture/foundations/evolution-and-scaling.md). These describe options and handbook conventions, not application mandates. Use `backend-architecture`, `frontend-architecture`, or `domain-modeling` for implementation in those areas. Use `api-design` for HTTP/public-contract decisions. Avoid loading multiple skills when one bounded task suffices.

Do not claim a decision is validated by a diagram, citation, or plausible folder structure. Distinguish inspected source, executed checks, and unverified assumptions.
