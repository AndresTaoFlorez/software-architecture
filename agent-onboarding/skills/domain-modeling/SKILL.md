---
name: domain-modeling
description: Locate and test meaningful business rules, invariants, valid state transitions, and domain responsibilities when their consistency or placement matters. Do not use for passive CRUD data without business behavior.
---

# Domain Modeling

Use in a consuming application when business decisions have meaningful rules, state transitions, or language that must remain consistent across callers. Application requirements and accepted decisions govern. The handbook is a versioned, read-only reference; verify its approved revision and do not edit it from the application.

## Applicability and supported depth

Use when a rule's authoritative owner, meaning, or valid transition is unclear or at risk of duplication. For passive CRUD, keep the data model simple. Do not insist on rich objects, aggregate roots, domain events, bounded contexts, event sourcing, or a DDD folder structure. This skill supports concrete entity behavior, domain services where no single object naturally owns a decision, and separation from application workflow. It is not a complete DDD implementation guide: the handbook gives detailed entity-behavior, domain-service and application-workflow examples; value objects receive only glossary/reference treatment. `evolution-and-scaling.md` provides conceptual bounded-context guidance, but aggregates, context mapping and reliable domain-event delivery are not complete supported workflows. Consult the primary [Evans DDD Reference](https://www.domainlanguage.com/wp-content/uploads/2016/05/DDD_Reference_2015-03.pdf) or other suitable primary guidance for broader treatment. Apply value objects only when the domain and suitable external guidance support them.

## Workflow

1. **Inspect:** Read application instructions, ADRs, requirements, existing rules and tests. Talk to or use authoritative domain requirements when available. Record exact business terms, valid/invalid examples, state transitions, data authority, and current callers. Do not infer policy from field names.
2. **Assign ownership:** Separate external-data parsing, application coordination/fact gathering, domain decisions, persistence, and delivery presentation. Put each invariant with one authoritative owner. Model an entity when continuing identity and behavior matter; consider a value object only when domain meaning, equality and validity belong to the value and a suitable primary/domain reference supports that choice; use a plain function when it expresses a cross-object decision without natural single-object ownership. Avoid a class solely to label a layer.
3. **Implement:** Express accepted operations and failure reasons in business terms. Preserve existing behavior and supported module APIs. Keep framework, transport, database and UI types outside the domain rule unless the application has deliberately chosen otherwise. Consider transaction/consistency boundaries only when the actual operation requires them. Do not create duplicate entities or parallel domain vocabularies.
4. **Verify:** Test valid and invalid values, transitions, and relevant edge cases with plain values; test that application coordination does not persist rejected outcomes. Use integration/transaction tests where correctness depends on storage or concurrency. Report what each test proves and does not prove.
5. **Report:** Summarize the rule and evidence, authoritative owner and files, chosen model and rejected complexity, compatibility/security implications, checks actually run, reference revision, and unresolved domain questions.

## References and handoffs

Resolve these handbook-root-relative paths against the verified handbook checkout root specified in the consuming application's instructions, never against this copied skill directory or the application root. Read `architecture/foundations/domain-modeling/README.md`, `architecture/foundations/evolution-and-scaling.md`, relevant pages in `architecture/backend/README.md`, and `architecture/patterns/persistence/repository/README.md` only as needed. The glossary entries `GLOSSARY.md#domain-driven-design-ddd`, `GLOSSARY.md#bounded-context`, `GLOSSARY.md#value-object`, and `GLOSSARY.md#domain-event` are references, not proof of full implementation coverage. For broader guidance, use Eric Evans's [Domain-Driven Design Reference PDF](https://www.domainlanguage.com/wp-content/uploads/2016/05/DDD_Reference_2015-03.pdf). Use `backend-architecture` for server workflow/persistence implementation and `api-design` for HTTP/public-contract choices.
