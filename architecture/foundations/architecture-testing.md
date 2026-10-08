# Checking Architectural Boundaries

A ticket operation can behave correctly while importing Prisma directly. A behavior check would miss the dependency that makes storage replacement expensive. An architectural check asks whether source relationships follow the chosen rules.

This guide describes checks an application project can adopt. The handbook contains no validation runtime.

## 1. What to enforce

| Rule | Legal example | Violation |
| --- | --- | --- |
| Domain stays independent | `Ticket` imports its domain values | `Ticket` imports Nest |
| Application depends inward | `CreateTicket` imports `TicketRepository` | It imports `PrismaTicketRepository` |
| Consumers use supported entries | Billing imports `@/application/tickets` | Billing imports a private Tickets helper |
| Composition assembles | Startup constructs the repository | Domain reads the DI container |

## 2. AST-based tests

An abstract syntax tree represents parsed source structure. An import checker can inspect imports, reexports and dynamic imports rather than searching only for lines beginning with `import`.

Include negative examples: an outward type-only import, an outward reexport and a literal dynamic import. Computed module paths require a stated policy because static inspection cannot always resolve them.

## 3. Dependency graph tools

A dependency graph tool resolves module references and applies project rules. Configure aliases such as `@/` consistently with the project's TypeScript setup; otherwise the graph can miss edges.

## 4. Public API tests

Layer direction and capability privacy are separate. Two Application files can obey layer rules while one deep-imports another capability's private helper.

## 5. Framework-boundary tests

If a feature deliberately hides its state library behind a supported hook, check imports at that boundary. Enforce the boundary actually chosen rather than a universal prohibition.

## 6. Test behavior and boundaries separately

Business tests establish decisions; integration tests establish external behavior; dependency checks establish source direction. Each supplies different evidence.

## 7. Keep the rules small and explainable

Give each rule a rationale, legal and illegal examples, and an owner. Review exceptions against the change the boundary protects.

## Sources

- [dependency-cruiser: rules reference](https://github.com/sverweij/dependency-cruiser/blob/main/doc/rules-reference.md)
- [Martin: Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
