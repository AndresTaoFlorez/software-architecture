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
5. **Verify and report:** For a design-only task, follow `architecture/foundations/architecture-design-review.md` in the verified handbook: deliver proposed owners/files/contracts, separate source/runtime/composition traces, failure paths, change impact and decision-level sources. Cover only the requested sides; justify absent responsibilities. Keep the ADR optional and checks explicitly proposed. Do not implement. If implementation is authorized, review that design evidence before implementing the affected slice, inspect resulting dependencies and behavior, and run relevant project checks. Report evidence, alternatives, affected owners, checks actually run, risks, and unresolved questions.

## References and handoffs

Resolve the following handbook-root-relative paths against the verified handbook checkout root specified in the consuming application's instructions, never against this copied skill directory or the application root. Read only relevant pages: `architecture/foundations/README.md`, `architecture/styles/README.md`, `architecture/foundations/code-placement.md`, and `architecture/foundations/evolution-and-scaling.md`. These describe options and handbook conventions, not application mandates. Use `backend-architecture`, `frontend-architecture`, or `domain-modeling` for implementation in those areas. Use `api-design` for HTTP/public-contract decisions. Avoid loading multiple skills when one bounded task suffices.

Do not claim a decision is validated by a diagram, citation, or plausible folder structure. A source must support the specific principle applied; mark project choices and extrapolations as inferences. Distinguish inspected source, proposed checks, executed checks, and unverified assumptions.
