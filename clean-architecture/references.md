> **[Clean Architecture](README.md)** › References.

## References

The sources most central to Clean Architecture are marked ★.

- ★ **Martin, R. C.** (2012). *The Clean Architecture*. The Clean Code Blog. (The Dependency Rule; the four
  circles.) https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html
- ★ **Martin, R. C.** (2017). *Clean Architecture: A Craftsman's Guide to Software Structure and Design*.
  Prentice Hall. (Entities, use cases, frameworks as details; "screaming architecture"; the Test Boundary,
  ch. 28.)
- ★ **Martin, R. C.** (2003). *Agile Software Development, Principles, Patterns, and Practices*. Prentice
  Hall. (The Dependency Inversion Principle, part of SOLID.)
  https://web.archive.org/web/20110714224327/http://www.objectmentor.com/resources/articles/dip.pdf
- **Cockburn, A.** (2005). *Hexagonal Architecture (Ports and Adapters)*. (How every boundary is crossed.)
  https://alistair.cockburn.us/hexagonal-architecture/
- **Evans, E.** (2003). *Domain-Driven Design: Tackling Complexity in the Heart of Software*.
  Addison-Wesley. (Entities; the domain model as the core.)
- **Fowler, M.** (2002). *Patterns of Enterprise Application Architecture*. Addison-Wesley.
  (Repository; Service Layer.) https://martinfowler.com/eaaCatalog/repository.html
- **Fowler, M.** (2007). *Mocks Aren't Stubs*. (Stubs vs. mocks; classicist vs. mockist testing.)
  https://martinfowler.com/articles/mocksArentStubs.html
- **Beck, K.** (2002). *Test-Driven Development: By Example*. Addison-Wesley. (Tests as a design tool.)
- **Cohn, M.** (2009). *Succeeding with Agile: Software Development Using Scrum*. Addison-Wesley.
  (The Test Pyramid.)
- **Vocke, H.** (2018). *The Practical Test Pyramid*. martinfowler.com.
  https://martinfowler.com/articles/practical-test-pyramid.html
- **Meszaros, G.** (2007). *xUnit Test Patterns: Refactoring Test Code*. Addison-Wesley. (The Test Double
  taxonomy: dummy, stub, spy, mock, fake.)
- **Khorikov, V.** (2020). *Unit Testing Principles, Practices, and Patterns*. Manning. (What makes a test
  valuable; the cost of over-mocking.)
- **Conway, M. E.** (1968). *How Do Committees Invent?* Datamation. (Conway's Law: systems mirror the
  communication structure of the organizations that build them.)
  https://www.melconway.com/Home/Committees_Paper.html
- **Nx & Turborepo documentation.** *Monorepo build systems with enforced project boundaries.* (Module-
  boundary lint rules that make the Dependency Rule checkable in CI.) https://nx.dev/ · https://turborepo.com/

For the same model expressed as concentric rings — plus advanced patterns, styling, and scaling — see the
companion **[Onion Architecture guide](../onion-architecture)**.
