> **[Clean Architecture](README.md)** › References.

# References

The sources most central to [Clean Architecture](../../../GLOSSARY.md#clean-architecture) are marked ★.

- ★ **Martin, R. C.** (2012). *The Clean Architecture*. The Clean Code Blog. (The [Dependency Rule](../../../GLOSSARY.md#dependency-rule); the four
  circles.) https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html
- ★ **Martin, R. C.** (2017). *Clean Architecture: A Craftsman's Guide to Software Structure and Design*.
  Prentice Hall. ([Entities](../../../GLOSSARY.md#clean-entities-circle), [use cases](../../../GLOSSARY.md#use-case), frameworks as details; "screaming architecture"; the Test Boundary,
  ch. 28.)
- ★ **Martin, R. C.** (2003). *Agile Software Development, Principles, Patterns, and Practices*. Prentice
  Hall. (The [Dependency Inversion Principle](../../../GLOSSARY.md#dependency-inversion-principle-dip), part of SOLID.)
  https://web.archive.org/web/20110714224327/http://www.objectmentor.com/resources/articles/dip.pdf
- **Cockburn, A.** (2005). *[Hexagonal Architecture](../../../GLOSSARY.md#hexagonal-architecture-ports-and-adapters) (Ports and Adapters)*. (How every boundary is crossed.)
  https://alistair.cockburn.us/hexagonal-architecture/
- **Evans, E.** (2003). *[Domain-Driven Design](../../../GLOSSARY.md#domain-driven-design-ddd): Tackling Complexity in the Heart of Software*.
  Addison-Wesley. ([Domain entities](../../../GLOSSARY.md#domain-entity); the domain model as the core.)
- **Fowler, M.** (2002). *Patterns of Enterprise [Application](../../../GLOSSARY.md#application-layer) Architecture*. Addison-Wesley.
  ([Repository](../../../GLOSSARY.md#repository); Service Layer.) https://martinfowler.com/eaaCatalog/repository.html
- **Fowler, M.** (2007). *[Mocks](../../../GLOSSARY.md#mock) Aren't [Stubs](../../../GLOSSARY.md#stub)*. (Stubs vs. mocks; classicist vs. mockist testing.)
  https://martinfowler.com/articles/mocksArentStubs.html
- **Beck, K.** (2002). *Test-Driven Development: By Example*. Addison-Wesley. (Tests as a design tool.)
- **Cohn, M.** (2009). *Succeeding with Agile: Software Development Using Scrum*. Addison-Wesley.
  (The [Test Pyramid](../../../GLOSSARY.md#test-pyramid).)
- **Vocke, H.** (2018). *The Practical Test Pyramid*. martinfowler.com.
  https://martinfowler.com/articles/practical-test-pyramid.html
- **Meszaros, G.** (2007). *xUnit Test Patterns: Refactoring Test Code*. Addison-Wesley. (The [Test Double](../../../GLOSSARY.md#test-double)
  taxonomy: dummy, stub, [spy](../../../GLOSSARY.md#spy), mock, [fake](../../../GLOSSARY.md#fake).)
- **Khorikov, V.** (2020). *Unit Testing Principles, Practices, and Patterns*. Manning. (What makes a test
  valuable; the cost of over-mocking.)
- **Conway, M. E.** (1968). *How Do Committees Invent?* Datamation. (Conway's Law: systems mirror the
  communication structure of the organizations that build them.)
  https://www.melconway.com/Home/Committees_Paper.html
- **Nx.** [Enforce Module Boundaries](https://nx.dev/docs/features/enforce-module-boundaries). Import constraints must be configured for the project's intended boundaries.
- **Turborepo.** [Boundaries](https://turborepo.dev/docs/reference/boundaries). Experimental workspace and tag constraints, rather than automatic enforcement of Clean circles.
- **Dodds, K. C.** (2019). *[Colocation](../../../GLOSSARY.md#colocation).* (Place code as close as possible to where it is relevant; the basis
  for [feature folders](../../../GLOSSARY.md#feature-folder) and colocated styles.) https://kentcdodds.com/blog/colocation
- **Feature-Sliced Design.** Alternative frontend architectural methodology with its own layers, slices and dependency rules. It is not the canonical five-layer structure used here. https://feature-sliced.design/docs/get-started/overview
- **Vue.js.** *SFC CSS Features.* (`<style scoped>` and `<style module>` for intrinsic component styles.)
  https://vuejs.org/api/sfc-css-features.html

For a related approach with its own vocabulary and boundary choices, see the companion **[Onion Architecture guide](../onion-architecture)**.
