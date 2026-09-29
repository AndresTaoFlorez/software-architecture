# Software Architecture Glossary

This glossary defines the architecture and frontend-engineering concepts used throughout this repository.

Each entry contains a concise definition, a purpose, a repository-oriented example, and primary or authoritative references. Links from the rest of the repository point to the explicit anchors in this file.

> **Linking policy.** Prose occurrences are linked to this glossary. Headings, fenced/inline code, URLs, HTML, bracketed content, reference definitions and existing Markdown links are intentionally not rewritten because doing so would break anchors, code samples or nested links.

## Index

- [Abstract Syntax Tree (AST)](#abstract-syntax-tree-ast)
- [Adapter](#adapter)
- [Application Layer](#application-layer)
- [Application Service](#application-service)
- [Architectural Boundary](#architectural-boundary)
- [Architecture Test](#architecture-test)
- [Barrel File](#barrel-file)
- [Bounded Context](#bounded-context)
- [Clean Architecture](#clean-architecture)
- [Clean Entities Circle](#clean-entities-circle)
- [Colocation](#colocation)
- [Command Query Responsibility Segregation (CQRS)](#cqrs)
- [Composition Root](#composition-root)
- [Conflict-Free Replicated Data Type (CRDT)](#crdt)
- [Contract Test](#contract-test)
- [Controller](#controller)
- [Cross-Cutting Concern](#cross-cutting-concern)
- [CSS Selector](#css-selector)
- [Custom Hook](#custom-hook)
- [Data Binding](#data-binding)
- [Data Transfer Object (DTO)](#data-transfer-object-dto)
- [Dependency Graph](#dependency-graph)
- [Dependency Injection (DI)](#dependency-injection-di)
- [Dependency Inversion Principle (DIP)](#dependency-inversion-principle-dip)
- [Dependency Rule](#dependency-rule)
- [Design System](#design-system)
- [Design Token](#design-token)
- [DI Container](#di-container)
- [Domain](#domain)
- [Domain Entity](#domain-entity)
- [Domain Error](#domain-error)
- [Domain Event](#domain-event)
- [Domain Service](#domain-service)
- [Domain-Driven Design (DDD)](#domain-driven-design-ddd)
- [Event Sourcing](#event-sourcing)
- [Facade Pattern](#facade-pattern)
- [Factory Pattern](#factory-pattern)
- [Fake](#fake)
- [Feature Folder](#feature-folder)
- [Feature Slice](#feature-slice)
- [Frameworks & Drivers](#frameworks-and-drivers)
- [Gateway](#gateway)
- [Global State](#global-state)
- [Hexagonal Architecture / Ports and Adapters](#hexagonal-architecture-ports-and-adapters)
- [Idempotency](#idempotency)
- [Infrastructure](#infrastructure)
- [Interface Adapter](#interface-adapter)
- [Invariant](#invariant)
- [Last-Write-Wins (LWW)](#last-write-wins-lww)
- [Listener Middleware](#listener-middleware)
- [Local State](#local-state)
- [Mapper](#mapper)
- [Memoization](#memoization)
- [Microfrontend](#microfrontend)
- [Microservice](#microservice)
- [Middleware](#middleware)
- [Mock](#mock)
- [Model](#model)
- [Model-View-Controller (MVC)](#model-view-controller-mvc)
- [Model-View-Presenter (MVP)](#model-view-presenter-mvp)
- [Model-View-ViewModel (MVVM)](#model-view-viewmodel-mvvm)
- [Modular Monolith](#modular-monolith)
- [Monorepo](#monorepo)
- [Observer Pattern](#observer-pattern)
- [Observer Synchronization](#observer-synchronization)
- [Onion Architecture](#onion-architecture)
- [Optimistic Concurrency](#optimistic-concurrency)
- [Optimistic Update](#optimistic-update)
- [Passive View](#passive-view)
- [Port](#port)
- [Presentation Layer](#presentation-layer)
- [Presentation Model](#presentation-model)
- [Presenter](#presenter)
- [Public API](#public-api)
- [Recipe](#recipe)
- [Reducer](#reducer)
- [Repository Pattern](#repository)
- [RTK Query](#rtk-query)
- [Selector](#selector)
- [Semantic Token](#semantic-token)
- [Separated Presentation](#separated-presentation)
- [Server State](#server-state)
- [Service Locator](#service-locator)
- [Side Effect](#side-effect)
- [Slot Recipe](#slot-recipe)
- [Spy](#spy)
- [State Management](#state-management)
- [Store](#store)
- [Stub](#stub)
- [Supervising Controller](#supervising-controller)
- [Test Double](#test-double)
- [Test Pyramid](#test-pyramid)
- [Thunk](#thunk)
- [Type-only Import](#type-only-import)
- [Unit of Work](#unit-of-work)
- [Use Case](#use-case)
- [Value Object](#value-object)
- [View](#view)
- [ViewModel](#viewmodel)

---

<a id="abstract-syntax-tree-ast"></a>

## Abstract Syntax Tree (AST)

A tree representation of source code in which nodes represent language constructs such as imports, declarations and expressions. Architecture tooling can inspect the AST to enforce dependency rules more reliably than text-only regular expressions.

**Purpose.** Inspect source constructs without confusing code with comments or strings.

**Example.** An architecture test parses TypeScript imports and rejects any Application file that imports Infrastructure.

**Sources.** [TypeScript Wiki — Using the Compiler API](https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API)

---

<a id="adapter"></a>

## Adapter

Code that connects the application to a specific external input or technology without making the application's own operations depend on its details. In the ticket example, `HttpTicketGateway` takes a request to create a ticket, sends it through HTTP, and changes the server's `ticket_id` field into the application's `id`. This is an outbound adapter. An inbound adapter, such as a UI handler, instead calls an operation offered by the application.

**Purpose.** Translate between an external mechanism or actor and the interaction the application expects or offers. A given adapter is not necessarily an implementation of a TypeScript interface.

**Example.** `HttpOrderRepository` adapts an HTTP API to the `OrderRepository` port.

**Frontend example.** `HttpTicketGateway` translates `POST /api/tickets` and an API `ticket_id` into the `TicketGateway` contract and an application ticket. See [the ticket-support walkthrough](./frontend/ports-and-adapters.md).

**Sources.** [Cockburn — Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/) · [Martin — The Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

---

<a id="application-layer"></a>

## Application Layer

When an analyst selects **Create Ticket**, some code must check the supplied information and coordinate the request to create it. The Application layer owns operations like this: it decides the workflow and uses business rules, while other code handles screen controls, HTTP requests and database details. Its use cases may declare the capabilities they need rather than importing a particular technology.

**Purpose.** Keep workflow policy independent of delivery and persistence mechanisms.

**Example.** `CancelOrder` loads an order through a port, invokes the domain rule and persists the result.

**Sources.** [Martin — The Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html) · [Fowler — Service Layer](https://martinfowler.com/eaaCatalog/serviceLayer.html) · [Microsoft Learn — Tactical DDD](https://learn.microsoft.com/en-us/azure/architecture/microservices/model/tactical-ddd)

---

<a id="application-service"></a>

## Application Service

Code that coordinates one application operation. For example, `CreateTicketService` may validate the request, call the ticket-creation capability and return the result. It is usually stateless across calls; it coordinates domain behavior but should not invent or take ownership of the ticket's business rules.

**Purpose.** Coordinate one cohesive application operation without moving domain invariants into orchestration.

**Example.** `CheckoutService` coordinates inventory, payment and order persistence for the checkout workflow.

**Sources.** [Fowler — Service Layer](https://martinfowler.com/eaaCatalog/serviceLayer.html) · [Microsoft Learn — Tactical DDD](https://learn.microsoft.com/en-us/azure/architecture/microservices/model/tactical-ddd)

---

<a id="architectural-boundary"></a>

## Architectural Boundary

A deliberate rule about which parts of the code may know about each other. For example, ticket-validation code must not import the HTTP client's response type: when that API changes, the validation rule should not have to. The boundary separates responsibilities and, when data formats differ, code translates them on the way across.

**Purpose.** Make ownership and permitted coupling explicit across modules.

**Example.** The Application–Infrastructure boundary prevents an ORM row type from becoming the use case's model.

**Sources.** [Martin — The Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html) · [Cockburn — Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)

---

<a id="architecture-test"></a>

## Architecture Test

An automated test of structural rules rather than business behavior. It verifies properties such as allowed import directions, cycles or public-module access.

**Purpose.** Detect prohibited dependencies before a change is merged.

**Example.** CI fails when `src/domain` imports React or an HTTP client.

**Sources.** [dependency-cruiser — Rules Reference](https://github.com/sverweij/dependency-cruiser/blob/main/doc/rules-reference.md) · [Martin — The Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

---

<a id="bounded-context"></a>

## Bounded Context

A defined part of a business in which words and models have one agreed meaning. For example, a `Customer` in Billing may be the party responsible for payment, while a `Customer` in Support may be the person contacting the help desk. Each can have different data and rules without pretending they must be one universal object. DDD calls the scope of each model a bounded context.

**Purpose.** Give a model and its vocabulary an explicit scope of validity.

**Example.** A `Customer` in Billing may contain credit information that the Support context neither needs nor owns.

**Sources.** [Fowler — Bounded Context](https://martinfowler.com/bliki/BoundedContext.html) · [Microsoft Learn — Domain analysis and bounded contexts](https://learn.microsoft.com/en-us/azure/architecture/microservices/model/domain-analysis)

---

<a id="clean-architecture"></a>

## Clean Architecture

A way to keep the rules for a task separate from the tools used to display, store or transmit its data. For example, the rule “a shipped order cannot be cancelled” should not import React or a database client. Robert C. Martin's Clean Architecture expresses this through boundaries where source-code dependencies point toward higher-level policy, not the other way around.

**Purpose.** Protect general and application-specific business rules through inward source dependencies.

**Example.** A use case depends on a `PaymentGateway` abstraction while the Stripe implementation lives outside it.

**Sources.** [Martin — The Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

---

<a id="colocation"></a>

## Colocation

Placing code close to the thing that owns or changes with it instead of grouping everything only by technical type. Colocation improves discoverability and reduces change scatter.

**Purpose.** Keep files that change for the same reason close to their owner.

**Example.** `QueryFilters.tsx`, its styles, props and tests live in the same component folder.

**Sources.** [Kent C. Dodds — Colocation](https://kentcdodds.com/blog/colocation) · [Feature-Sliced Design — Slices and segments](https://feature-sliced.design/docs/reference/slices-segments)

---

<a id="composition-root"></a>

## Composition Root

The place at startup where the program creates its working objects and connects them. For example, it creates `HttpTicketGateway`, gives it to `makeCreateTicket`, and then passes the resulting operation to the UI. The operation receives what it needs rather than looking up or constructing the HTTP implementation itself.

**Purpose.** Select and assemble concrete dependencies at the executable edge.

**Example.** Bootstrap constructs `HttpOrderRepository`, injects it into `PlaceOrder`, then injects the resulting operation into the UI store.

**Sources.** [Seemann — Composition Root](https://blog.ploeh.dk/2011/07/28/CompositionRoot/)

---

<a id="contract-test"></a>

## Contract Test

A test that verifies that two sides of an integration agree on an externally visible contract. Contract tests are especially useful when several adapters or separately deployed systems must preserve the same semantics.

**Purpose.** Check that an implementation or integration respects an agreed boundary contract.

**Example.** Every `OrderRepository` implementation must satisfy the same save-then-load behavior.

**Sources.** [Fowler — Consumer-Driven Contracts](https://martinfowler.com/articles/consumerDrivenContracts.html)

---

<a id="controller"></a>

## Controller

In classic MVC, the component that interprets user input and turns it into operations on the Model. In layered applications a controller often translates transport/UI input into an application use case.

**Purpose.** Translate input into operations without owning rendering or authoritative business rules.

**Example.** An HTTP controller converts route parameters into a `DeactivateUser` command.

**Sources.** [Fowler — GUI Architectures](https://martinfowler.com/eaaDev/uiArchs.html)

---

<a id="crdt"></a>

## Conflict-Free Replicated Data Type (CRDT)

A replicated data type designed so independently updated replicas can converge without central conflict resolution when its merge rules are followed.

**Purpose.** Make replicated updates converge under the stated merge and delivery assumptions.

**Example.** A grow-only set can accept concurrent additions on multiple replicas and later merge deterministically.

**Sources.** [Shapiro et al. — Conflict-Free Replicated Data Types](https://inria.hal.science/inria-00609399/document)

---

<a id="cross-cutting-concern"></a>

## Cross-Cutting Concern

A concern that affects multiple features or layers, such as logging, authorization or observability. 'Cross-cutting' does not mean 'ownerless'; policy and mechanism should still have explicit homes.

**Purpose.** Identify a concern spanning several workflows while retaining explicit policy and mechanism owners.

**Example.** Authorization policy may live in Application while the HTTP bearer-token mechanism lives in Infrastructure.

**Sources.** [Martin — The Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html) · [Cockburn — Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)

---

<a id="data-transfer-object-dto"></a>

## Data Transfer Object (DTO)

Data shaped for sending between systems or program parts, not necessarily for expressing business rules. For example, an API may send `{ ticket_id: 'T-1', status: 'open' }`; the frontend can translate that transfer shape into its own ticket shape with an `id` field. The DTO is the boundary representation, not automatically the domain model.

**Purpose.** Define boundary data without exposing a mechanism’s internal object model.

**Example.** `ApiOrderDto` is mapped to an `Order` before Application/Domain code uses it.

**Sources.** [Martin — The Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html) · [Fowler — Repository](https://martinfowler.com/eaaCatalog/repository.html)

---

<a id="dependency-graph"></a>

## Dependency Graph

A picture or model of which pieces of code refer to which other pieces. If module A imports module B, the diagram shows a directed connection from A to B. Looking at all those connections reveals cycles, forbidden imports and how far a change might spread.

**Purpose.** Reveal permitted coupling, cycles and the impact of a change.

**Example.** A graph tool can reveal a cycle between `features/auth` and `features/profile`.

**Sources.** [dependency-cruiser — Rules Reference](https://github.com/sverweij/dependency-cruiser/blob/main/doc/rules-reference.md)

---

<a id="dependency-injection-di"></a>

## Dependency Injection (DI)

Giving code a required object or function from outside instead of making it create or search for that dependency itself. For example, `makeCreateTicket(gateway)` receives a ticket-saving object as an argument; startup code can supply an HTTP one, while a test supplies an in-memory one. This technique is called dependency injection; it does not require a container library.

**Purpose.** Supply collaborators explicitly so consumers need not locate or construct them.

**Example.** `makePlaceOrder({ orders, clock })` receives its repository and clock instead of importing concrete implementations.

**Sources.** [Seemann — Composition Root](https://blog.ploeh.dk/2011/07/28/CompositionRoot/) · [Martin — The Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

---

<a id="di-container"></a>

## DI Container

A framework/tool that registers dependency mappings and constructs object graphs automatically. It is optional; manual composition is often simpler when the graph is small.

**Purpose.** Automate object graph construction and lifetimes when that complexity warrants a tool.

**Example.** A container resolves `OrderService` by supplying the registered `OrderRepository` and `Clock` implementations.

**Sources.** [Seemann — Composition Root](https://blog.ploeh.dk/2011/07/28/CompositionRoot/)

---

<a id="dependency-inversion-principle-dip"></a>

## Dependency Inversion Principle (DIP)

The ticket-creation operation needs a way to save a ticket, but it should not have to import `HttpTicketGateway`. Instead it refers to an application-oriented requirement such as `TicketGateway`, and the HTTP implementation is written to meet that requirement. DIP is the design principle that high-level policy and low-level implementation should depend on abstractions rather than high-level policy depending directly on low-level details. It is related to, but not identical with, Clean Architecture's Dependency Rule.

**Purpose.** Keep higher-level policy independent of concrete lower-level mechanisms.

**Example.** `PlaceOrder` depends on `OrderRepository`; `SqlOrderRepository` also depends on that contract by implementing it.

**Sources.** [Martin — The Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html) · [Cockburn — Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)

---

<a id="dependency-rule"></a>

## Dependency Rule

Imagine ticket policy importing a React component or a database row type: changes to those tools can force changes to the rule. Clean Architecture's Dependency Rule prevents this at source-code level. Code near the technical edge may refer to the inner application/domain policy, but that inner policy must not import or name outer technical details. This governs source dependencies, not the direction in which functions may call at runtime.

**Purpose.** Prevent inner policy from naming types or mechanisms owned by outer circles.

**Example.** Application may define `FileStorage`; the S3 adapter implements it, but Application never imports the AWS SDK.

**Sources.** [Martin — The Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

---

<a id="design-system"></a>

## Design System

A governed set of reusable visual foundations, components and usage rules that creates consistency across product UI. In code it often owns tokens, shared recipes and shared primitives.

**Purpose.** Provide coherent reusable visual and interaction contracts.

**Example.** A design system defines the canonical Button variants instead of each feature inventing its own.

**Sources.** [GOV.UK Design System](https://design-system.service.gov.uk/) · [Panda CSS — Tokens](https://panda-css.com/docs/theming/tokens)

---

<a id="design-token"></a>

## Design Token

A named value that several UI components can reuse instead of repeating a raw style value. For example, `spacing.3` might resolve to `12px` in a design system. Changing the token updates the components that refer to it; tokens can describe spacing, color, typography and other design decisions.

**Purpose.** Represent reusable design decisions through named values.

**Example.** `spacing.3` can resolve to `12px`, while components reference the token instead of the literal number.

**Sources.** [Design Tokens Community Group](https://www.w3.org/community/design-tokens/) · [Panda CSS — Tokens](https://panda-css.com/docs/theming/tokens)

---

<a id="domain"></a>

## Domain

The subject matter and rules a piece of software is built to handle. In a ticket system, tickets, assignments, escalation and allowed status changes belong to the support domain. Domain code expresses those meanings without depending on how a screen looks or which database stores the records.

**Purpose.** Identify the subject matter and rules whose meaning outlives a particular UI or database.

**Example.** In an ordering domain, `Order`, `Money` and cancellation rules belong to the domain model.

**Sources.** [Microsoft Learn — Domain analysis and bounded contexts](https://learn.microsoft.com/en-us/azure/architecture/microservices/model/domain-analysis) · [Martin — The Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

---

<a id="domain-driven-design-ddd"></a>

## Domain-Driven Design (DDD)

An approach to software design in which developers and domain experts build a shared understanding of the business and reflect that understanding in models and code. For example, Support and Billing may use the word `Customer` differently and need different rules. DDD includes ways to define such model boundaries (strategic design) and ways to model behavior within them (tactical design); it is not a mandatory folder structure.

**Purpose.** Align software models with domain knowledge within explicit contexts.

**Example.** Billing and Shipping use separate bounded contexts because the word `Account` has different rules in each.

**Sources.** [Microsoft Learn — Domain analysis and bounded contexts](https://learn.microsoft.com/en-us/azure/architecture/microservices/model/domain-analysis) · [Fowler — Bounded Context](https://martinfowler.com/bliki/BoundedContext.html)

---

<a id="domain-entity"></a>

## Domain Entity

Something in the business that remains the same identifiable thing even while its details change. Ticket `T-123` is still the same ticket after its subject or status changes. In DDD, an entity is primarily distinguished by identity and continuity, not by whether two objects happen to have equal fields.

**Purpose.** Track a business concept whose identity persists as its attributes change.

**Example.** A user's email may change while the same `UserId` identifies the same User entity.

**Sources.** [Microsoft Learn — Design a microservice domain model](https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model) · [Microsoft Learn — Tactical DDD](https://learn.microsoft.com/en-us/azure/architecture/microservices/model/tactical-ddd)

---

<a id="domain-error"></a>

## Domain Error

A failure described in business terms. For example, `ResolvedTicketCannotBeAssigned` explains why an attempted assignment is invalid; `HTTP 503` describes a technical communication failure instead. The first belongs with business rules, while the second must be handled at the external boundary or translated into a suitable application result.

**Purpose.** Describe a violated business rule in domain language.

**Example.** `ShippedOrderCannotBeCancelled` is a domain error; `ECONNRESET` is not.

**Sources.** [Microsoft Learn — Design a microservice domain model](https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model) · [Martin — The Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

---

<a id="domain-event"></a>

## Domain Event

A record that something meaningful to the domain has occurred, usually named in past tense and emitted by domain behavior for other policies to react to.

**Purpose.** Communicate a meaningful business occurrence without prescribing its transport.

**Example.** `DeliveryCompleted` can trigger billing or notification workflows without those concerns living inside the Delivery entity.

**Sources.** [Microsoft Learn — Tactical DDD](https://learn.microsoft.com/en-us/azure/architecture/microservices/model/tactical-ddd)

---

<a id="domain-service"></a>

## Domain Service

A stateless domain operation containing business rules that do not naturally belong to one entity or value object.

**Purpose.** Own domain behavior that does not naturally belong to one entity or value object.

**Example.** A route scheduler that reasons about several drones and delivery windows can be a domain service.

**Sources.** [Microsoft Learn — Tactical DDD](https://learn.microsoft.com/en-us/azure/architecture/microservices/model/tactical-ddd)

---

<a id="fake"></a>

## Fake

A Test Double with a working but simplified implementation that is not suitable for production, such as an in-memory database.

**Purpose.** Exercise a boundary with a simplified working implementation.

**Example.** `InMemoryOrderRepository` stores orders in a Map during Application tests.

**Sources.** [Fowler — Test Double](https://martinfowler.com/bliki/TestDouble.html) · [Fowler — Mocks Aren't Stubs](https://martinfowler.com/articles/mocksArentStubs.html)

---

<a id="feature-folder"></a>

## Feature Folder

A code-organization convention that groups files by product capability/feature rather than only by technical type.

**Purpose.** Keep a capability’s code together so changes have an obvious owner.

**Example.** `features/closures/` owns its UI, model bindings and feature-local helpers.

**Sources.** [Redux — Style Guide](https://redux.js.org/style-guide/) · [Feature-Sliced Design — Slices and segments](https://feature-sliced.design/docs/reference/slices-segments)

---

<a id="feature-slice"></a>

## Feature Slice

A cohesive module organized around one feature or business capability with an explicit ownership boundary and usually a public API. It need not imply the full Feature-Sliced Design methodology.

**Purpose.** Organize frontend responsibilities around a bounded user-facing capability.

**Example.** The closures slice exposes `useClosures` and `ClosuresPanel` while hiding its internal selectors.

**Sources.** [Feature-Sliced Design — Slices and segments](https://feature-sliced.design/docs/reference/slices-segments) · [Feature-Sliced Design — Public API](https://feature-sliced.design/docs/reference/public-api)

---

<a id="frameworks-and-drivers"></a>

## Frameworks & Drivers

Clean Architecture's outermost mechanisms: UI frameworks, databases, web servers, devices and other replaceable technology details.

**Purpose.** Keep concrete technology replaceable without rewriting inner policy.

**Example.** React, Prisma and an HTTP server are Frameworks & Drivers around inner application policy.

**Sources.** [Martin — The Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

---

<a id="gateway"></a>

## Gateway

A purpose-named way for application code to interact with an external system without exposing its technology. For example, `TicketGateway.create()` describes ticket creation; one implementation might call HTTP, another might store tickets in memory for tests. The name is broader than `Repository`, which specifically models access to stored domain objects in collection-like terms.

**Purpose.** Express an external conversation through a contract owned by its consumer.

**Example.** `PaymentGateway.authorize()` wraps an external payment provider.

**Sources.** [Cockburn — Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/) · [Fowler — Repository](https://martinfowler.com/eaaCatalog/repository.html)

---

<a id="global-state"></a>

## Global State

Client state shared broadly across otherwise separate UI areas. Global state should be introduced only when multiple consumers or workflows genuinely require shared ownership.

**Purpose.** Share state across the consumers that truly require a common lifetime and owner.

**Example.** The authenticated user's session may be global; a single modal's open flag usually is not.

**Sources.** [Redux — Style Guide](https://redux.js.org/style-guide/) · [React — Built-in Hooks](https://react.dev/reference/react/hooks)

---

<a id="hexagonal-architecture-ports-and-adapters"></a>

## Hexagonal Architecture / Ports and Adapters

An application may need to create tickets regardless of whether requests arrive from React, a command-line tool or a test, and regardless of whether saving uses HTTP or another mechanism. Alistair Cockburn's Ports & Adapters describes the application's offered and required interactions as ports; adapters connect particular callers or technologies to them. The point is to separate application behavior from those external mechanisms, not to require six folders or a physical hexagon.

**Purpose.** Let multiple external actors and mechanisms interact with the same application through ports.

**Example.** The same application port can be driven by an HTTP controller in production and a test harness in tests.

**Sources.** [Cockburn — Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)

---

<a id="infrastructure"></a>

## Infrastructure

The part of a design that deals with specific external technologies: an HTTP request, a database client, browser storage or an SDK. For example, `HttpTicketGateway` knows the `/api/tickets` endpoint and converts the server reply; the ticket-creation rule does not need those details. In layered architectures, such implementations sit outside the protected application/domain policy.

**Purpose.** Isolate technical I/O, external representations and integration details.

**Example.** `PrismaOrderRepository` maps database rows to the model required by Application.

**Sources.** [Martin — The Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html) · [Palermo — The Onion Architecture](https://jeffreypalermo.com/2008/07/)

---

<a id="interface-adapter"></a>

## Interface Adapter

Code that translates data or calls between the application and the outside world. For example, an HTTP controller converts a request body to the input expected by a use case; an API-facing mapper converts the application's result back to an HTTP response. In Clean Architecture, this translation role is distinguished from the inner policy and the concrete framework/device mechanisms.

**Purpose.** Translate between inner-policy representations and external-facing ones.

**Example.** A controller turns an HTTP request into a use-case command and maps the result back to HTTP.

**Sources.** [Martin — The Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

---

<a id="invariant"></a>

## Invariant

A rule that must continue to hold for a business object to be valid. If a ticket is resolved and the business forbids assigning resolved tickets, an assignment operation must not leave that ticket both resolved and newly assigned. The rule is an invariant; a button's disabled appearance alone cannot enforce it.

**Purpose.** State a condition that valid business state or operations must preserve.

**Example.** An order's total cannot be negative.

**Sources.** [Microsoft Learn — Design a microservice domain model](https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model) · [Microsoft Learn — Tactical DDD](https://learn.microsoft.com/en-us/azure/architecture/microservices/model/tactical-ddd)

---

<a id="last-write-wins-lww"></a>

## Last-Write-Wins (LWW)

A conflict-resolution policy in which the value associated with the latest ordered write wins. It can be used in replicated systems, but a timestamp overwrite strategy should not be called a full CRDT unless its convergence assumptions are satisfied.

**Purpose.** Resolve competing values using an explicit ordering and tie-breaking policy.

**Example.** Two edits to a preference record are resolved by the later logical timestamp.

**Sources.** [Shapiro et al. — Conflict-Free Replicated Data Types](https://inria.hal.science/inria-00609399/document)

---

<a id="listener-middleware"></a>

## Listener Middleware

Redux Toolkit middleware for reactive workflows that respond to dispatched actions or state changes, with support for async effects and cancellation patterns.

**Purpose.** Run reactive side effects in response to state actions without putting effects in reducers.

**Example.** A listener persists a draft after closure-selection actions instead of writing storage from a reducer.

**Sources.** [Redux Toolkit — Listener Middleware](https://redux-toolkit.js.org/api/createListenerMiddleware) · [Redux — Side Effects Approaches](https://redux.js.org/usage/side-effects-approaches)

---

<a id="local-state"></a>

## Local State

UI state owned by a component or narrow subtree and not shared application-wide.

**Purpose.** Keep state with the smallest consumer and lifetime that needs it.

**Example.** Whether a tooltip is open belongs in local state.

**Sources.** [React — Built-in Hooks](https://react.dev/reference/react/hooks) · [Redux — Style Guide](https://redux.js.org/style-guide/)

---

<a id="mapper"></a>

## Mapper

Code that changes data from one representation to another. For example, the backend returns `ticket_id`, while our ticket model uses `id`; a mapper reads the former and produces the latter. It makes the difference explicit so external field names do not spread throughout the application.

**Purpose.** Translate data while making representation differences explicit.

**Example.** `mapOrderDto` converts an external API DTO into the application's Order representation.

**Sources.** [Martin — The Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

---

<a id="memoization"></a>

## Memoization

Caching the result of a computation based on its inputs so repeated calls can reuse prior work. In UI code it is a performance technique, not an architectural requirement.

**Purpose.** Avoid repeating a computation when its relevant inputs are unchanged.

**Example.** A selector memoizes an expensive filtered table only when its input collections change.

**Sources.** [React — useMemo](https://react.dev/reference/react/useMemo) · [Redux — Style Guide](https://redux.js.org/style-guide/)

---

<a id="microfrontend"></a>

## Microfrontend

An approach that decomposes a frontend into independently owned and often independently deployable slices, typically aligned with business capabilities.

**Purpose.** Allow frontend units to evolve and integrate through explicit boundaries.

**Example.** Checkout and Account are delivered by separate teams and composed into one web experience.

**Sources.** [Jackson — Micro Frontends](https://martinfowler.com/articles/micro-frontends.html)

---

<a id="microservice"></a>

## Microservice

A small independently deployable service organized around a business capability and communicating with other services over explicit boundaries. Distribution introduces operational and consistency costs and is not automatically a maturity upgrade.

**Purpose.** Give a service independent deployment and ownership where those benefits justify distributed-system costs.

**Example.** Billing owns its data and API and can be deployed independently from Shipping.

**Sources.** [Fowler/Lewis — Microservices](https://martinfowler.com/articles/microservices.html) · [Fowler — Monolith First](https://martinfowler.com/bliki/MonolithFirst.html)

---

<a id="middleware"></a>

## Middleware

Software inserted into a processing pipeline to intercept, transform or react to operations without placing that concern in each caller.

**Purpose.** Apply a pipeline concern at a defined interception boundary.

**Example.** Redux middleware observes dispatched actions to run async workflows.

**Sources.** [Redux — Side Effects Approaches](https://redux.js.org/usage/side-effects-approaches)

---

<a id="mock"></a>

## Mock

A Test Double pre-programmed with expected interactions and verified against those expectations.

**Purpose.** Verify an interaction contract through prearranged expectations.

**Example.** A mock email sender expects exactly one `send()` call with a specific recipient.

**Sources.** [Fowler — Test Double](https://martinfowler.com/bliki/TestDouble.html) · [Fowler — Mocks Aren't Stubs](https://martinfowler.com/articles/mocksArentStubs.html)

---

<a id="model"></a>

## Model

The information and behavior being represented by a screen, as opposed to the screen controls themselves. For example, an order's current status and cancellation operation may be part of what an MVC View represents. The exact Model role depends on the presentation pattern; it does not automatically mean a DDD entity or the entire Clean Architecture Domain layer.

**Purpose.** Separate represented state/behavior from concrete controls without assuming one whole-application layer.

**Example.** In an MVVM screen, the ViewModel may call Application use cases rather than directly manipulating one Model object.

**Sources.** [Fowler — GUI Architectures](https://martinfowler.com/eaaDev/uiArchs.html) · [Fowler — Presentation Model](https://martinfowler.com/eaaDev/PresentationModel.html)

---

<a id="model-view-controller-mvc"></a>

## Model-View-Controller (MVC)

A way to separate three jobs in an interactive screen: a Model represents relevant information/behavior, a View displays it, and a Controller interprets user actions. For example, clicking **Cancel** is understood by the Controller, the Model reflects the operation, and the View updates. This describes a family of presentation patterns, not one mandatory frontend/backend folder structure; server-side MVC uses the label differently.

**Purpose.** Separate represented behavior, rendering and input interpretation.

**Example.** The Controller interprets a click, updates the Model, and the View reflects the change.

**Sources.** [Fowler — GUI Architectures](https://martinfowler.com/eaaDev/uiArchs.html)

---

<a id="model-view-viewmodel-mvvm"></a>

## Model-View-ViewModel (MVVM)

A way to keep a screen's rendering separate from the state and operations prepared for that screen. An Orders View displays `isSaving` and calls `cancel()`; a ViewModel supplies those values and operations using the underlying Model/application behavior. Binding can synchronize the View and ViewModel. Merely using React, Vue or another reactive framework does not automatically implement MVVM.

**Purpose.** Expose screen-oriented state and commands independently of concrete view controls.

**Example.** A `useClosures()` facade exposes rows, busy state and commands while hiding Redux details from the React View.

**Sources.** [Fowler — Presentation Model](https://martinfowler.com/eaaDev/PresentationModel.html) · [Fowler — GUI Architectures](https://martinfowler.com/eaaDev/uiArchs.html) · [Smith — WPF Apps With MVVM](https://learn.microsoft.com/en-us/archive/msdn-magazine/2009/february/patterns-wpf-apps-with-the-model-view-viewmodel-design-pattern)

---

<a id="modular-monolith"></a>

## Modular Monolith

A single deployable application internally divided into strongly bounded modules with explicit contracts. It keeps process boundaries cheap while allowing domain/module boundaries to mature.

**Purpose.** Maintain module boundaries while retaining one deployment unit.

**Example.** Billing and Shipping are separate modules in one process and communicate only through public APIs.

**Sources.** [Fowler — Monolith First](https://martinfowler.com/bliki/MonolithFirst.html) · [Fowler — Bounded Context](https://martinfowler.com/bliki/BoundedContext.html)

---

<a id="monorepo"></a>

## Monorepo

A repository strategy in which multiple projects/packages live in one version-control repository, usually with tooling to manage dependency boundaries and affected builds.

**Purpose.** Coordinate related projects in one repository without implying shared architectural ownership.

**Example.** Frontend, backend and shared packages live in one repository but Nx rules forbid illegal imports.

**Sources.** [Nx — Why monorepos?](https://nx.dev/concepts/decisions/why-monorepos)

---

<a id="onion-architecture"></a>

## Onion Architecture

A way to keep business rules at the center of an application so replacing the UI, database or network library does not rewrite them. For example, the rule that a resolved ticket cannot be assigned sits inward, while HTTP and persistence code adapt to it from outside. Jeffrey Palermo's Onion Architecture describes this with inward source dependencies, not a required number of directories.

**Purpose.** Keep the domain model central and make infrastructure depend inward.

**Example.** Application depends on a repository interface; Infrastructure supplies the database implementation.

**Sources.** [Palermo — The Onion Architecture](https://jeffreypalermo.com/2008/07/)

---

<a id="optimistic-update"></a>

## Optimistic Update

Updating client-visible state before a remote mutation has been confirmed, then committing, reconciling or rolling back when the server responds.

**Purpose.** Provide immediate feedback before confirmation, with a defined rollback/reconciliation policy.

**Example.** A todo appears checked immediately while the API request is still pending.

**Sources.** [Redux Toolkit — Manual Cache Updates](https://redux-toolkit.js.org/rtk-query/usage/manual-cache-updates)

---

<a id="port"></a>

## Port

A description of an interaction that the application needs from other code, or offers to code that calls it. For example, `TicketGateway.create(input)` says: "Give me a way to create a ticket and return it." It does not say whether that work uses HTTP or an in-memory implementation. More precisely, a port is an application-facing contract for one coherent interaction, not one interface per endpoint or file.

**Purpose.** State what the application requires or exposes without forcing its rules to depend on a particular external mechanism.

**Example.** `Clock.now()` is a port when application policy must be independent of system time.

**Frontend example.** `application/tickets/ports/TicketGateway.ts` defines the operation needed by the ticket-creation use case, without depending on HTTP or React. See [the ticket-support walkthrough](./frontend/ports-and-adapters.md).

**Sources.** [Cockburn — Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)

---

<a id="presentation-layer"></a>

## Presentation Layer

The part of the software that handles what a user sees and does. In a ticket screen, it draws the form, tracks whether the submit button is busy, and displays errors. It can contain substantial screen logic, but it should not become the authoritative owner of rules such as whether a resolved ticket may be reassigned.

**Purpose.** Own interaction and view state while delegating authoritative policy inward.

**Example.** A feature hook derives loading and display state, then delegates business operations to Application.

**Sources.** [Fowler — Presentation Model](https://martinfowler.com/eaaDev/PresentationModel.html) · [Martin — The Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

---

<a id="presentation-model"></a>

## Presentation Model

A representation of what a particular screen needs to show and do without referring to concrete buttons or widgets. For example, it exposes `canSubmit`, `errorMessage` and `submit()`; a desktop or web view can use these values to render controls. Martin Fowler's Presentation Model separates screen-oriented behavior from the concrete UI.

**Purpose.** Represent screen state and behavior without concrete rendering controls.

**Example.** A Presentation Model exposes `canSubmit`, formatted totals and `submit()` for a checkout view.

**Sources.** [Fowler — Presentation Model](https://martinfowler.com/eaaDev/PresentationModel.html)

---

<a id="public-api"></a>

## Public API

The small, intentionally supported set of operations or types that other code may use from a module. For example, other features import `useTickets` from `features/tickets/index.ts` instead of reaching into its internal state files. This lets the feature reorganize its implementation without forcing every consumer to change.

**Purpose.** Expose an intentional module contract and hide implementation details.

**Example.** Other features import from `features/auth/index.ts`, not from `features/auth/model/auth.slice.ts`.

**Sources.** [Feature-Sliced Design — Public API](https://feature-sliced.design/docs/reference/public-api)

---

<a id="recipe"></a>

## Recipe

In Panda CSS, a reusable definition of base styles plus variants, compound variants and defaults, exposed through a type-safe runtime API.

**Purpose.** Reuse a component’s visual variants through one styling contract.

**Example.** A Button recipe defines `tone=primary|secondary` and `size=sm|md`.

**Sources.** [Panda CSS — Recipes](https://panda-css.com/docs/concepts/recipes)

---

<a id="reducer"></a>

## Reducer

A pure function that calculates next state from previous state and an action. Reducers should not perform I/O or other side effects.

**Purpose.** Compute the next state from the previous state and an action without side effects.

**Example.** `closuresReducer` marks a request as pending when `queryStarted` is dispatched.

**Sources.** [Redux — Style Guide](https://redux.js.org/style-guide/)

---

<a id="repository"></a>

## Repository Pattern

A way to let application/domain code work with stored business objects as though accessing a collection, without depending on the storage technology. For example, `OrderRepository.findById()` and `save()` might use SQL in production and memory in a test. Not every HTTP integration is a Repository; in this glossary the term means the design pattern, not a Git repository.

**Purpose.** Provide collection-like access to persisted domain objects while hiding persistence details.

**Example.** `OrderRepository.findById()` and `save()` hide whether orders are stored in SQL or memory.

**Sources.** [Fowler — Repository](https://martinfowler.com/eaaCatalog/repository.html)

---

<a id="rtk-query"></a>

## RTK Query

Redux Toolkit's data-fetching and caching solution for server state, including request deduplication, caching and invalidation.

**Purpose.** Manage data fetching, caching and invalidation within Redux Toolkit.

**Example.** A product-list screen uses RTK Query to cache GET results and refetch invalidated data.

**Sources.** [Redux Toolkit — RTK Query](https://redux-toolkit.js.org/rtk-query/overview) · [Redux — Style Guide](https://redux.js.org/style-guide/)

---

<a id="selector"></a>

## Selector

A function that reads and derives data from state, ideally without mutating it. Selectors keep derivation out of reducers and rendering code.

**Purpose.** Derive or read state without exposing its storage shape to every consumer.

**Example.** `selectVisibleOrders` derives filtered rows from source rows plus filters.

**Sources.** [Redux — Style Guide](https://redux.js.org/style-guide/)

---

<a id="semantic-token"></a>

## Semantic Token

A style name that describes what a value is for rather than what literal value it has. For example, `colors.danger` means “use the color for dangerous actions” and may refer to a different red in light and dark themes. It builds on ordinary design tokens and keeps components independent of raw color choices.

**Purpose.** Name the contextual role of a design value rather than a raw literal.

**Example.** `colors.danger` references a red primitive in light mode and another accessible red in dark mode.

**Sources.** [Panda CSS — Tokens](https://panda-css.com/docs/theming/tokens)

---

<a id="server-state"></a>

## Server State

Data the server is responsible for, even when the browser holds a copy. For example, the current ticket list fetched from `/api/tickets` may become stale after another analyst edits a ticket; fetching, caching and refreshing it matter. Whether a local dialog is open is client UI state, not server state.

**Purpose.** Represent remote-owned data with explicit freshness and synchronization behavior.

**Example.** The current list of orders fetched from an API is server state; the open/closed state of a modal is not.

**Sources.** [Redux Toolkit — RTK Query](https://redux-toolkit.js.org/rtk-query/overview) · [Redux — Style Guide](https://redux.js.org/style-guide/)

---

<a id="service-locator"></a>

## Service Locator

A pattern where consumers ask a global registry/container for dependencies. It hides required collaborators and is generally avoided in favor of explicit injection.

**Purpose.** Resolve collaborators through a locator; recognize that this hides dependencies from a consumer’s signature.

**Example.** Calling `container.resolve('orders')` inside a use case is service location.

**Sources.** [Seemann — Service Locator is an Anti-Pattern](https://blog.ploeh.dk/2010/02/03/ServiceLocatorisanAnti-Pattern/) · [Seemann — Composition Root](https://blog.ploeh.dk/2011/07/28/CompositionRoot/)

---

<a id="side-effect"></a>

## Side Effect

An operation that interacts with or changes something outside a pure calculation, such as I/O, timers, storage, logging or dispatching external work.

**Purpose.** Identify interactions observable outside a calculation so their ownership and timing stay explicit.

**Example.** Writing `sessionStorage` is a side effect and should not occur inside a Redux reducer.

**Sources.** [Redux — Style Guide](https://redux.js.org/style-guide/) · [React — Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects)

---

<a id="slot-recipe"></a>

## Slot Recipe

A Panda CSS recipe for styling coordinated parts (slots) of a multipart component. `sva` creates an atomic slot recipe; `defineSlotRecipe` creates a config slot recipe.

**Purpose.** Coordinate styles and variants across parts of one visual component.

**Example.** A Dialog slot recipe styles `backdrop`, `content`, `header`, `body` and `footer` together.

**Sources.** [Panda CSS — Slot Recipes](https://panda-css.com/docs/concepts/slot-recipes)

---

<a id="spy"></a>

## Spy

A Test Double that records how it was called so a test can inspect interactions after execution.

**Purpose.** Record interactions for assertions after exercising behavior.

**Example.** A spy notification sender records recipients without sending real messages.

**Sources.** [Fowler — Test Double](https://martinfowler.com/bliki/TestDouble.html) · [Fowler — Mocks Aren't Stubs](https://martinfowler.com/articles/mocksArentStubs.html)

---

<a id="state-management"></a>

## State Management

Deciding where changing values live, who may update them, and how the UI stays current. For example, one component can own its dialog's open/closed flag, several components may share the selected ticket, and a remote ticket list may need a cache. A particular library such as Redux is one possible tool, not the definition.

**Purpose.** Define state ownership, updates, derivation and lifetime.

**Example.** Local form input stays in React while shared closure selection lives in a feature store.

**Sources.** [Redux — Style Guide](https://redux.js.org/style-guide/) · [React — Built-in Hooks](https://react.dev/reference/react/hooks)

---

<a id="store"></a>

## Store

A state container that owns state and exposes mechanisms to read/update it. A store is a presentation mechanism, not automatically an Application or Domain layer.

**Purpose.** Provide a shared state container with a defined read/update/subscription API.

**Example.** A Redux store holds cross-screen closure state while use cases remain framework-independent.

**Sources.** [Redux — Style Guide](https://redux.js.org/style-guide/)

---

<a id="stub"></a>

## Stub

A Test Double that returns canned responses needed by a test without modeling full production behavior.

**Purpose.** Supply controlled responses to a test’s collaborator calls.

**Example.** An HTTP stub returns a fixed JSON response so a mapper can be integration-tested.

**Sources.** [Fowler — Test Double](https://martinfowler.com/bliki/TestDouble.html) · [Fowler — Mocks Aren't Stubs](https://martinfowler.com/articles/mocksArentStubs.html)

---

<a id="test-double"></a>

## Test Double

A generic replacement for a production collaborator during testing. Fakes, stubs, spies, mocks and dummies are different kinds of test doubles.

**Purpose.** Replace a collaborator for a specific testing purpose.

**Example.** An in-memory repository replaces the production SQL repository in a use-case test.

**Sources.** [Fowler — Test Double](https://martinfowler.com/bliki/TestDouble.html) · [Fowler — Mocks Aren't Stubs](https://martinfowler.com/articles/mocksArentStubs.html)

---

<a id="test-pyramid"></a>

## Test Pyramid

A heuristic favoring many fast, focused tests and fewer expensive broad integration/end-to-end tests. It is a shape/risk heuristic, not a fixed percentage quota.

**Purpose.** Balance fast focused feedback with integration coverage according to cost and risk.

**Example.** Domain invariants have many unit tests while only critical user journeys receive full end-to-end tests.

**Sources.** [Vocke — The Practical Test Pyramid](https://martinfowler.com/articles/practical-test-pyramid.html)

---

<a id="thunk"></a>

## Thunk

In Redux, a function dispatched through thunk middleware to run imperative logic with access to `dispatch` and `getState`; Redux Toolkit also supports injected extra dependencies.

**Purpose.** Defer work through a function; in Redux, access dispatch/state and injected dependencies for orchestration.

**Example.** `saveOrderThunk` invokes an injected Application operation and dispatches lifecycle actions.

**Sources.** [Redux Toolkit — createAsyncThunk](https://redux-toolkit.js.org/api/createAsyncThunk) · [Redux — Side Effects Approaches](https://redux.js.org/usage/side-effects-approaches)

---

<a id="unit-of-work"></a>

## Unit of Work

A pattern that tracks changes made during a business transaction and coordinates writing them as one logical unit.

**Purpose.** Coordinate persistence changes and a consistent commit boundary.

**Example.** A checkout use case changes an Order and Inventory reservation, then commits both through one transaction boundary.

**Sources.** [Fowler — Unit of Work](https://martinfowler.com/eaaCatalog/unitOfWork.html)

---

<a id="use-case"></a>

## Use Case

One task the application performs in response to an actor or workflow. For example, `createTicket(input)` checks the submitted subject and asks the supplied ticket-saving capability to create a ticket. It describes application behavior; a React button or an HTTP endpoint is merely one way to trigger it.

**Purpose.** Describe and implement an application operation in its own policy vocabulary.

**Example.** `CancelOrder` is a use case; `PUT /orders/:id/cancel` is one delivery mechanism for it.

**Sources.** [Martin — The Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html) · [Cockburn — Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)

---

<a id="value-object"></a>

## Value Object

A business value identified by *what it contains*, not by a continuing identity. Two values of `Money(10, 'USD')` represent the same amount even if created separately; a particular `Ticket` remains its own identifiable ticket when its subject changes. Value objects are typically immutable and replaced as a whole.

**Purpose.** Express a meaningful value through equality of attributes and its validity rules.

**Example.** Two `Money(10, 'USD')` values are equivalent regardless of which instance was created.

**Sources.** [Microsoft Learn — Design a microservice domain model](https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model) · [Microsoft Learn — Tactical DDD](https://learn.microsoft.com/en-us/azure/architecture/microservices/model/tactical-ddd)

---

<a id="view"></a>

## View

In MVC/MVVM, the rendering surface that presents state and captures user interaction. A View can own small rendering concerns without becoming the owner of business policy.

**Purpose.** Render values and capture gestures without taking over authoritative business policy.

**Example.** A React component renders rows exposed by `useClosures()` and forwards button clicks to its commands.

**Sources.** [Fowler — GUI Architectures](https://martinfowler.com/eaaDev/uiArchs.html) · [Fowler — Presentation Model](https://martinfowler.com/eaaDev/PresentationModel.html)

---

<a id="viewmodel"></a>

## ViewModel

The part of an MVVM-style screen that prepares values and operations for rendering without referring to concrete UI controls. For example, it offers `isSaving`, `errorMessage` and `cancel()` while the View decides how to display a button. In web applications a deliberately designed custom hook or state facade can play this role, but not every hook is a ViewModel.

**Purpose.** Own display-ready state and semantic commands for a view contract.

**Example.** `useAuth()` exposes `isAuthenticated`, `login()` and `logout()` while hiding Redux actions and HTTP details.

**Sources.** [Fowler — Presentation Model](https://martinfowler.com/eaaDev/PresentationModel.html) · [Fowler — GUI Architectures](https://martinfowler.com/eaaDev/uiArchs.html) · [Smith — WPF Apps With MVVM](https://learn.microsoft.com/en-us/archive/msdn-magazine/2009/february/patterns-wpf-apps-with-the-model-view-viewmodel-design-pattern)

---

<a id="barrel-file"></a>

## Barrel File

A module whose primary job is to re-export symbols from other modules so consumers can depend on one deliberate entry point. A barrel is useful when it defines a real public API; indiscriminate `export *` barrels can hide ownership and increase coupling.

**Purpose.** Expose an intentional entry point without exporting every implementation symbol.

**Example.** `features/orders/index.ts` exports `useOrders` and `OrdersPage` while keeping `orders.slice.ts` internal.

**Sources.** [TypeScript — Re-exporting](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-1-5.html) · [Feature-Sliced Design — Public API](https://feature-sliced.design/docs/reference/public-api)

---

<a id="cqrs"></a>

## Command Query Responsibility Segregation (CQRS)

A pattern that separates the model used to change state from the model used to read state. CQRS does not inherently require separate databases or services, and it adds enough complexity that it should be introduced only when the different read/write models solve a concrete problem.

**Purpose.** Separate command and query models when their different needs justify the extra coordination.

**Example.** Order updates use a task-oriented write model while a reporting dashboard reads from a separate projection optimized for queries.

**Sources.** [Martin Fowler — CQRS](https://martinfowler.com/bliki/CQRS.html)

---

<a id="event-sourcing"></a>

## Event Sourcing

A persistence approach in which application state changes are captured and stored as a sequence of events from which current or historical state can be reconstructed.

**Purpose.** Retain an event history as the source used to reconstruct state.

**Example.** Instead of storing only the current shipment status, the system stores events such as `ShipmentCreated`, `DepartedPort`, and `ArrivedPort` and derives state by replaying them.

**Sources.** [Martin Fowler — Event Sourcing](https://martinfowler.com/eaaDev/EventSourcing.html)

---

<a id="facade-pattern"></a>

## Facade Pattern

A design pattern that exposes a simpler, purpose-oriented interface over a larger or more complicated subsystem. A facade reduces what consumers need to know, but should not become a god object that owns unrelated policy.

**Purpose.** Give consumers a cohesive interface over several internal collaborators.

**Example.** `useOrders()` can expose `rows`, `busy`, and `cancel()` while hiding Redux selectors, dispatch and thunk lifecycle details.

**Sources.** [Microsoft Learn — Adapter and Facade patterns](https://learn.microsoft.com/en-us/shows/visual-studio-toolbox/design-patterns-adapterfaade)

---

<a id="factory-pattern"></a>

## Factory Pattern

A family of creational patterns that centralize or defer object-construction decisions instead of forcing callers to know concrete construction details. The exact variant—such as Factory Method or Abstract Factory—should be named when it matters.

**Purpose.** Centralize construction when creation has a real responsibility or varying implementation.

**Example.** `makeOrderRepository(config)` chooses the concrete persistence adapter from configuration while callers depend on the returned capability.

**Sources.** [Microsoft Learn — Factory patterns](https://learn.microsoft.com/en-us/shows/visual-studio-toolbox/design-patterns-factories) · Gamma et al., *Design Patterns: Elements of Reusable Object-Oriented Software* (1994)

---

<a id="model-view-presenter-mvp"></a>

## Model-View-Presenter (MVP)

A family of separated-presentation patterns in which a Presenter mediates between a View and the model/application behavior. Fowler later retired his single MVP pattern description and split the useful variants into patterns including Supervising Controller and Passive View.

**Purpose.** Separate presentation coordination from concrete rendering, with variant-specific View/Model relationships.

**Example.** A presenter receives a Save gesture, invokes the application operation, and updates an interface implemented by the View.

**Sources.** [Martin Fowler — Model View Presenter retirement note](https://martinfowler.com/eaaDev/ModelViewPresenter.html) · [Martin Fowler — GUI Architectures](https://martinfowler.com/eaaDev/uiArchs.html)

---

<a id="observer-pattern"></a>

## Observer Pattern

A design pattern in which a subject maintains dependent observers and notifies them when relevant state changes, allowing dependents to react without the subject naming each concrete reaction.

**Purpose.** Notify subscribed collaborators of changes without naming their concrete implementations.

**Example.** A model emits a change notification and several views refresh without those views calling each other.

**Sources.** [Microsoft Learn — Observer and Publish-Subscribe](https://learn.microsoft.com/en-us/shows/visual-studio-toolbox/design-patterns-observer-publish-subscribe) · Gamma et al., *Design Patterns* (1994)

---

<a id="observer-synchronization"></a>

## Observer Synchronization

A presentation synchronization style in which screens or views observe underlying model/state changes and refresh themselves when notified. Fowler describes it as a fundamental part of classic MVC-style synchronization.

**Purpose.** Keep views synchronized with changing represented state through observation.

**Example.** Two views subscribe to the same cart model; adding an item notifies both so each independently refreshes its displayed total.

**Sources.** [Martin Fowler — Organizing Presentation Logic](https://martinfowler.com/eaaDev/OrganizingPresentations.html) · [Martin Fowler — GUI Architectures](https://martinfowler.com/eaaDev/uiArchs.html)

---

<a id="passive-view"></a>

## Passive View

A presentation pattern in which the View has no Model access and a controller/presenter drives updates through a view interface, keeping application-specific coordination outside concrete controls. The main motivation is to move behavior out of difficult-to-test UI widgets.

**Purpose.** Make presentation coordination testable through an externally driven view interface.

**Example.** A presenter calculates which controls are enabled and calls methods on a thin View interface rather than letting the View derive that behavior itself.

**Sources.** [Martin Fowler — Passive View](https://martinfowler.com/eaaDev/PassiveScreen.html)

---

<a id="presenter"></a>

## Presenter

A presentation component that translates application/model state into a form suitable for a View and handles presentation-oriented interaction. The exact responsibility depends on the presentation pattern; in MVP it mediates between View and model/application behavior.

**Purpose.** Coordinate presentation updates through the chosen view/model contract.

**Example.** `CheckoutPresenter` invokes the checkout use case and converts its result into fields and messages exposed to a View.

**Sources.** [Martin Fowler — GUI Architectures](https://martinfowler.com/eaaDev/uiArchs.html) · [Robert C. Martin — The Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

---

<a id="separated-presentation"></a>

## Separated Presentation

The principle of keeping presentation concerns separate from domain/application logic so each can evolve and be tested for its own reasons.

**Purpose.** Keep represented behavior and concrete screen mechanics independently understandable.

**Example.** A web View and a CLI both invoke the same application operation without either UI owning the business invariant.

**Sources.** [Martin Fowler — Presentation Domain Separation](https://martinfowler.com/bliki/PresentationDomainSeparation.html) · [Martin Fowler — GUI Architectures](https://martinfowler.com/eaaDev/uiArchs.html)

---

<a id="clean-entities-circle"></a>

## Clean Entities Circle

Martin's innermost conceptual circle encapsulates general business rules. It can contain objects, value objects or functions; it is not identical to a DDD entity with persistent identity.

**Purpose.** Keep general business policy independent of application workflows and technical mechanisms.

**Example.** A pure cancellation policy or Money value object can belong to this circle.

**Sources.** [Martin — The Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

---

<a id="supervising-controller"></a>

## Supervising Controller

Fowler's presentation approach delegates simple display synchronization to binding while a controller handles input and more complex presentation behavior. It differs from Passive View, which removes the View's Model access.

**Purpose.** Balance automatic simple binding with explicit complex presentation coordination.

**Example.** A bound name field updates automatically; the controller coordinates a multi-field enablement rule.

**Sources.** [Fowler — Supervising Controller](https://martinfowler.com/eaaDev/SupervisingPresenter.html)

---

<a id="data-binding"></a>

## Data Binding

A connection between a value prepared for a screen and the control displaying it. When a ViewModel changes `isSaving` to `true`, binding can update a button's disabled state without repeating manual UI-update code. Some systems also send user edits back to the source (two-way binding), but that is optional.

**Purpose.** Connect a view to its presentation contract while keeping synchronization ownership and lifetime explicit.

**Example.** A button binds disabled state to `busy` and invokes a cancel command.

**Sources.** [Microsoft — WPF Data Binding](https://learn.microsoft.com/en-us/dotnet/desktop/wpf/data/)

---

<a id="css-selector"></a>

## CSS Selector

A CSS expression identifying elements to which a style rule applies. This is unrelated to a Redux state selector.

**Purpose.** Target document elements for styling.

**Example.** `button[disabled]` matches disabled buttons.

**Sources.** [W3C — Selectors](https://www.w3.org/TR/selectors-4/)

---

<a id="optimistic-concurrency"></a>

## Optimistic Concurrency

A write strategy that detects whether the state read earlier changed before a write commits. A version precondition must be checked atomically by the authoritative persistence boundary.

**Purpose.** Prevent a stale writer from silently overwriting newer state.

**Example.** An HTTP update carries a strong ETag in `If-Match`; a changed version produces a failed precondition.

**Sources.** [RFC 9110 — If-Match](https://www.rfc-editor.org/rfc/rfc9110.html#section-13.1.1)

---

<a id="idempotency"></a>

## Idempotency

A property whereby repeating an operation has the same intended effect as performing it once. HTTP method semantics and business-side effect guarantees must be considered separately.

**Purpose.** Make repeated delivery or retries safe for the intended effect.

**Example.** Setting status to cancelled twice can be idempotent; sending a new notification on every retry may not be.

**Sources.** [RFC 9110 — Idempotent Methods](https://www.rfc-editor.org/rfc/rfc9110.html#section-9.2.2)

---

<a id="custom-hook"></a>

## Custom Hook

A React function named `use` followed by a capitalized word that composes reusable stateful logic using Hooks. It is not automatically a ViewModel or an application use case.

**Purpose.** Reuse React behavior through a concrete, meaningful interface.

**Example.** `useOrders` exposes view state and commands when intentionally designed as a feature facade.

**Sources.** [React — Reusing Logic with Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)

---

<a id="type-only-import"></a>

## Type-only Import

A TypeScript import used only by the type system and erased from emitted JavaScript. It still creates source-level coupling to the imported contract.

**Purpose.** Use types without a runtime import while retaining explicit architectural ownership.

**Example.** An Application `import type` from Infrastructure still violates the documented inward source rule.

**Sources.** [TypeScript — Modules Reference](https://www.typescriptlang.org/docs/handbook/modules/reference.html#type-only-imports-and-exports)
