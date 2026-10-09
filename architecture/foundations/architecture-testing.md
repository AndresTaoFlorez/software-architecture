# Checking Architectural Boundaries

A ticket operation can behave correctly while importing Prisma directly. A behavior check would miss the dependency that makes storage replacement expensive. An architectural check asks whether source relationships follow the chosen rules.

This guide describes checks an application project can adopt. The handbook contains no validation runtime.

**Contents**

- [What to enforce](#what-to-enforce)
- [AST-based tests](#ast-based-tests)
- [Dependency graph tools](#dependency-graph-tools)
- [Public API tests](#public-api-tests)
- [Framework-boundary tests](#framework-boundary-tests)
- [Test behavior and boundaries separately](#test-behavior-and-boundaries-separately)
- [Keep the rules small and explainable](#keep-the-rules-small-and-explainable)
- [Sources](#sources)

<a id="1-what-to-enforce"></a>

## What to enforce

| Rule | Legal example | Violation |
| --- | --- | --- |
| [Domain](../../GLOSSARY.md#domain) stays independent | `Ticket` imports its domain values | `Ticket` imports Nest |
| [Application](../../GLOSSARY.md#application-layer) depends inward | `CreateTicket` imports `TicketRepository` | It imports `PrismaTicketRepository` |
| Consumers use supported entries | Billing imports `@/application/tickets` | Billing imports a private Tickets helper |
| Composition assembles | Startup constructs the repository | Domain reads the DI container |

<a id="2-ast-based-tests"></a>

## AST-based tests

An abstract syntax tree represents parsed source structure. An import checker can inspect imports, reexports and dynamic imports rather than searching only for lines beginning with `import`.

Include negative examples: an outward type-only import, an outward reexport and a literal dynamic import. Computed module paths require a stated policy because static inspection cannot always resolve them.

<a id="3-dependency-graph-tools"></a>

## Dependency graph tools

A dependency graph tool resolves module references and applies project rules. Configure aliases such as `@/` consistently with the project's TypeScript setup; otherwise the graph can miss edges.

<a id="4-public-api-tests"></a>

## Public API tests

Layer direction and capability privacy are separate. Two [Application](../../GLOSSARY.md#application-layer) files can obey layer rules while one deep-imports another capability's private helper.

<a id="5-framework-boundary-tests"></a>

## Framework-boundary tests

If a feature deliberately hides its state library behind a supported hook, check imports at that boundary. Enforce the boundary actually chosen rather than a universal prohibition.

<a id="6-test-behavior-and-boundaries-separately"></a>

## Test behavior and boundaries separately

Business tests establish decisions; integration tests establish external behavior; dependency checks establish source direction. Each supplies different evidence.

<a id="7-keep-the-rules-small-and-explainable"></a>

## Keep the rules small and explainable

Give each rule a rationale, legal and illegal examples, and an owner. Review exceptions against the change the boundary protects.

## Sources

- [dependency-cruiser: rules reference](https://github.com/sverweij/dependency-cruiser/blob/main/doc/rules-reference.md)
- [Martin: Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
