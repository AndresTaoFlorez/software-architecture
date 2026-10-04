# Software Architecture Glossary

This glossary defines the architecture, frontend and backend concepts used throughout this repository.

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
- [Exception Filter (NestJS)](#nestjs-exception-filter)
- [Facade Pattern](#facade-pattern)
- [Factory Pattern](#factory-pattern)
- [Fake](#fake)
- [Feature Folder](#feature-folder)
- [Feature Slice](#feature-slice)
- [Frameworks & Drivers](#frameworks-and-drivers)
- [Gateway](#gateway)
- [Global State](#global-state)
- [Guard (NestJS)](#nestjs-guard)
- [Hexagonal Architecture / Ports and Adapters](#hexagonal-architecture-ports-and-adapters)
- [HTTP Endpoint](#http-endpoint)
- [HTTP Route](#http-route)
- [HTTP Router / Routing](#http-routing)
- [Idempotency](#idempotency)
- [Infrastructure](#infrastructure)
- [Interceptor (NestJS)](#nestjs-interceptor)
- [Interface Adapter](#interface-adapter)
- [Invariant](#invariant)
- [Last-Write-Wins (LWW)](#last-write-wins-lww)
- [Layered Architecture](#layered-architecture)
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
- [NestJS Module](#nestjs-module)
- [NestJS Provider](#nestjs-provider)
- [Object-Relational Mapper (ORM)](#orm)
- [Observer Pattern](#observer-pattern)
- [Observer Synchronization](#observer-synchronization)
- [Onion Architecture](#onion-architecture)
- [Optimistic Concurrency](#optimistic-concurrency)
- [Optimistic Update](#optimistic-update)
- [Passive View](#passive-view)
- [Pipe (NestJS)](#nestjs-pipe)
- [Port](#port)
- [Presentation Layer](#presentation-layer)
- [Presentation Model](#presentation-model)
- [Presenter](#presenter)
- [Public API](#public-api)
- [Recipe](#recipe)
- [Reducer](#reducer)
- [Repository Pattern](#repository)
- [Route Handler](#route-handler)
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

When a TypeScript tool reads source code, it can turn `import { save } from './tickets'` into structured pieces describing an import, its names, and its destination. This structure is an Abstract Syntax Tree (AST): a tree of language constructs. Architecture checks can inspect these nodes instead of guessing at imports with raw text searches.

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

An automated check that tests how code is organized rather than whether a ticket was created successfully. For example, it can fail when code in `domain/` imports a database client from `infrastructure/`. This makes an agreed structural rule executable.

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

Keeping files that belong to one change near each other. For example, a ticket form's component, styles and tests can live together instead of being scattered across unrelated global folders. This groups code by ownership rather than only by technical file type.

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

A test that checks whether two pieces of software agree about what they send and receive. For example, a frontend expects ticket creation to return an identifier and a status; a contract test checks that the provider's API satisfies that agreed response shape/behavior. It does not replace full integration or business-rule tests.

**Purpose.** Check that an implementation or integration respects an agreed boundary contract.

**Example.** Every `OrderRepository` implementation must satisfy the same save-then-load behavior.

**Sources.** [Fowler — Consumer-Driven Contracts](https://martinfowler.com/articles/consumerDrivenContracts.html)

---

<a id="controller"></a>

## Controller

The code that interprets an incoming user action and decides which operation it requests. In classic MVC, clicking a ticket's **Resolve** button reaches a Controller, which asks the Model to perform the relevant operation. In a backend framework, a controller may instead translate an HTTP request into an application-use-case call; sharing the name does not make both variants identical.

**Purpose.** Translate input into operations without owning rendering or authoritative business rules.

**Example.** Nest's `TicketsController` groups handlers; its `create()` handler translates `POST /tickets` into a `CreateTicket` command. The controller class is not itself an endpoint and may expose several operations.

**Sources.** [Fowler — GUI Architectures](https://martinfowler.com/eaaDev/uiArchs.html) · [Nest — Controllers](https://docs.nestjs.com/controllers)

---

<a id="crdt"></a>

## Conflict-Free Replicated Data Type (CRDT)

A data structure designed so copies can be edited independently and later merged to reach the same result under specified merge rules. For example, replicas of an add-only set can each receive different items and combine their additions regardless of message arrival order. Not every offline merge algorithm or timestamp overwrite is a CRDT.

**Purpose.** Make replicated updates converge under the stated merge and delivery assumptions.

**Example.** A grow-only set can accept concurrent additions on multiple replicas and later merge deterministically.

**Sources.** [Shapiro et al. — Conflict-Free Replicated Data Types](https://inria.hal.science/inria-00609399/document)

---

<a id="cross-cutting-concern"></a>

## Cross-Cutting Concern

A responsibility that appears in many otherwise separate operations. Logging a ticket creation and logging a billing update are two uses of logging, but this does not mean a single unowned global module should contain every logging rule. Shared mechanism and context-specific policy still need clear owners.

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

A library that helps create objects and supply the other objects they need. Instead of manually writing `new HttpTicketGateway()` and passing it to every constructor, code can register the required implementations and ask the container to assemble them. It is a tool for dependency injection, not a requirement for it; manual composition is often simpler for a small application.

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

A shared set of UI decisions and components that keeps a product's screens consistent. For example, all ticket and billing pages may reuse the same Button, spacing values and error-message colors instead of inventing versions independently. The system includes the reusable styles/components and guidance on how they should be used and maintained.

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

A record of a business fact that has already happened. For example, `TicketResolved` states that a particular ticket was resolved; other business behavior may react to that fact. Domain events are typically named in the past tense and describe business meaning rather than a specific HTTP request or button click.

**Purpose.** Communicate a meaningful business occurrence without prescribing its transport.

**Example.** `DeliveryCompleted` can trigger billing or notification workflows without those concerns living inside the Delivery entity.

**Sources.** [Microsoft Learn — Tactical DDD](https://learn.microsoft.com/en-us/azure/architecture/microservices/model/tactical-ddd)

---

<a id="domain-service"></a>

## Domain Service

Business behavior that does not belong naturally inside any one business object. For example, a policy for distributing a limited number of support slots across several ticket queues may require information from multiple objects; a domain service can express that rule. It is generally stateless and should not become a place for unrelated orchestration or HTTP code.

**Purpose.** Own domain behavior that does not naturally belong to one entity or value object.

**Example.** A route scheduler that reasons about several drones and delivery windows can be a domain service.

**Sources.** [Microsoft Learn — Tactical DDD](https://learn.microsoft.com/en-us/azure/architecture/microservices/model/tactical-ddd)

---

<a id="fake"></a>

## Fake

A stand-in used in a test that performs simplified real work. For example, an `InMemoryTicketGateway` stores created tickets in an array so tests can exercise creation without a backend; it is functional but not intended to replace the production persistence system. This is one kind of test double.

**Purpose.** Exercise a boundary with a simplified working implementation.

**Example.** `InMemoryOrderRepository` stores orders in a Map during Application tests.

**Sources.** [Fowler — Test Double](https://martinfowler.com/bliki/TestDouble.html) · [Fowler — Mocks Aren't Stubs](https://martinfowler.com/articles/mocksArentStubs.html)

---

<a id="feature-folder"></a>

## Feature Folder

A way of organizing code by what users can do rather than by file type alone. For example, `features/tickets/` keeps the ticket UI, state and feature-specific helpers together instead of spreading each kind across unrelated top-level directories. Folder names alone do not enforce architectural dependencies.

**Purpose.** Keep a capability’s code together so changes have an obvious owner.

**Example.** `features/closures/` owns its UI, model bindings and feature-local helpers.

**Sources.** [Redux — Style Guide](https://redux.js.org/style-guide/) · [Feature-Sliced Design — Slices and segments](https://feature-sliced.design/docs/reference/slices-segments)

---

<a id="feature-slice"></a>

## Feature Slice

A module that owns one recognizable feature and exposes a limited way for the rest of the UI to use it. For example, the Tickets slice keeps its components and state helpers private and exports selected operations from `features/tickets/index.ts`. This idea does not require adopting the full Feature-Sliced Design taxonomy.

**Purpose.** Organize frontend responsibilities around a bounded user-facing capability.

**Example.** The closures slice exposes `useClosures` and `ClosuresPanel` while hiding its internal selectors.

**Sources.** [Feature-Sliced Design — Slices and segments](https://feature-sliced.design/docs/reference/slices-segments) · [Feature-Sliced Design — Public API](https://feature-sliced.design/docs/reference/public-api)

---

<a id="frameworks-and-drivers"></a>

## Frameworks & Drivers

In Martin's Clean Architecture diagram, the outer area containing the particular tools used to run the application: React, an HTTP server, a database client or device I/O. For example, swapping an HTTP server should not require rewriting the rule for a ticket status change. These details depend toward inner policy rather than owning it.

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

Client-side data needed by multiple, otherwise separate parts of an interface. For example, if several unrelated pages must react to the currently selected support account, it may need shared ownership. A dialog's open flag, used by one component, normally does not become global just because Redux is available.

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

A conflict rule that keeps the value considered to come from the latest of several ordered edits. If two replicas change a ticket title, LWW chooses one according to its ordering rule; it does not combine both titles or guarantee that the most useful edit survives. Timestamp ordering also needs carefully defined clock/tie behavior, and a timestamp overwrite alone is not necessarily a full CRDT.

**Purpose.** Resolve competing values using an explicit ordering and tie-breaking policy.

**Example.** Two edits to a preference record are resolved by the later logical timestamp.

**Sources.** [Shapiro et al. — Conflict-Free Replicated Data Types](https://inria.hal.science/inria-00609399/document)

---

<a id="listener-middleware"></a>

## Listener Middleware

A Redux Toolkit mechanism that reacts when actions are dispatched or selected state changes. For example, after a ticket-save action it can start a follow-up async operation or coordinate persistence without placing that work in the reducer. Its listener APIs support cancellation and lifecycle handling; it is a state-library tool, not an application architectural layer.

**Purpose.** Run reactive side effects in response to state actions without putting effects in reducers.

**Example.** A listener persists a draft after closure-selection actions instead of writing storage from a reducer.

**Sources.** [Redux Toolkit — Listener Middleware](https://redux-toolkit.js.org/api/createListenerMiddleware) · [Redux — Side Effects Approaches](https://redux.js.org/usage/side-effects-approaches)

---

<a id="local-state"></a>

## Local State

A changing value that only one UI component or a small part of the screen needs to own. For example, `isTicketDialogOpen` can live in the dialog's parent component. It should not automatically be put in application-wide shared state.

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

Remembering a calculated result so the same inputs can reuse it instead of doing the work again. For example, filtering a large ticket list with unchanged list/filter inputs may reuse the previous output. Memoization is a performance technique; it does not decide where business rules belong and should be applied when there is a real benefit.

**Purpose.** Avoid repeating a computation when its relevant inputs are unchanged.

**Example.** A selector memoizes an expensive filtered table only when its input collections change.

**Sources.** [React — useMemo](https://react.dev/reference/react/useMemo) · [Redux — Style Guide](https://redux.js.org/style-guide/)

---

<a id="microfrontend"></a>

## Microfrontend

An approach in which different teams can own distinct parts of a larger user interface, such as Tickets and Billing, with explicit integration rules and sometimes independent builds or deployments. The goal is ownership/delivery independence; it adds cross-part coordination, shared UX and runtime integration costs.

**Purpose.** Allow frontend units to evolve and integrate through explicit boundaries.

**Example.** Checkout and Account are delivered by separate teams and composed into one web experience.

**Sources.** [Jackson — Micro Frontends](https://martinfowler.com/articles/micro-frontends.html)

---

<a id="microservice"></a>

## Microservice

A separately deployable application responsible for a focused capability and communicating with others through a defined interface. For example, a ticket service may expose an API to a billing service while owning its ticket data and rules. Separate deployment also brings network failures, versioned contracts and operational costs; a small folder is not a microservice.

**Purpose.** Give a service independent deployment and ownership where those benefits justify distributed-system costs.

**Example.** Billing owns its data and API and can be deployed independently from Shipping.

**Sources.** [Fowler/Lewis — Microservices](https://martinfowler.com/articles/microservices.html) · [Fowler — Monolith First](https://martinfowler.com/bliki/MonolithFirst.html)

---

<a id="middleware"></a>

## Middleware

Code that runs as part of a processing path before, after or around the next step. For example, an HTTP middleware can check authentication before a request reaches the ticket handler. It lets a repeated concern be handled centrally instead of copied into every caller; its exact capabilities depend on the framework.

**Purpose.** Apply a pipeline concern at a defined interception boundary.

**Example.** Redux middleware observes dispatched actions to run async workflows.

**Sources.** [Redux — Side Effects Approaches](https://redux.js.org/usage/side-effects-approaches)

---

<a id="mock"></a>

## Mock

A stand-in whose expected interactions are configured before a test and verified during or after it. For example, a test may require that `sendNotification()` is called exactly once with the correct ticket id. This differs from a stub that merely supplies a predetermined return value.

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

One application that is built and deployed as one unit but organized internally into deliberately separate modules. For example, Tickets and Billing run in the same deployed program yet expose clear interfaces and avoid reaching into each other's private files. Module boundaries do not require network calls between the parts.

**Purpose.** Maintain module boundaries while retaining one deployment unit.

**Example.** Billing and Shipping are separate modules in one process and communicate only through public APIs.

**Sources.** [Fowler — Monolith First](https://martinfowler.com/bliki/MonolithFirst.html) · [Fowler — Bounded Context](https://martinfowler.com/bliki/BoundedContext.html)

---

<a id="monorepo"></a>

## Monorepo

A single version-control repository containing multiple projects or packages. For example, a frontend, backend and shared API-contract package may live in one Git repository while remaining separate deployable applications. A monorepo is a repository organization choice, not by itself a software architecture or a requirement to share every type.

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

Showing a proposed result in the UI before the server has confirmed it. For example, after an analyst clicks **Resolve**, the ticket immediately appears resolved; if saving fails, the UI restores or reconciles the previous state. This improves perceived responsiveness but needs a failure/conflict strategy.

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

In Panda CSS, a reusable group of component styles with named choices. For example, a Button recipe can define common padding and a `variant` choice for primary or danger appearance rather than repeating styles in every Button instance. Recipes may include defaults and combinations of variants and expose typed styling APIs.

**Purpose.** Reuse a component’s visual variants through one styling contract.

**Example.** A Button recipe defines `tone=primary|secondary` and `size=sm|md`.

**Sources.** [Panda CSS — Recipes](https://panda-css.com/docs/concepts/recipes)

---

<a id="reducer"></a>

## Reducer

A function that receives the previous state and an action describing what happened, then calculates the next state. For example, given a selected-ticket id and `ticketDeselected`, it returns state with no selection. A reducer should be pure: it does not itself call an API, write storage or perform other side effects.

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

Redux Toolkit's tool for fetching and caching data owned by a server. For example, multiple ticket components can reuse a cached ticket list, and a successful edit can mark that list for re-fetching. Its caching and invalidation solve remote-data synchronization problems; it does not automatically own every business workflow.

**Purpose.** Manage data fetching, caching and invalidation within Redux Toolkit.

**Example.** A product-list screen uses RTK Query to cache GET results and refetch invalidated data.

**Sources.** [Redux Toolkit — RTK Query](https://redux-toolkit.js.org/rtk-query/overview) · [Redux — Style Guide](https://redux.js.org/style-guide/)

---

<a id="selector"></a>

## Selector

A function that reads state and returns the value a consumer needs, possibly calculating it from existing fields. For example, `selectOpenTickets(state)` returns tickets whose status is open without storing a second copy of the list. A selector should normally not mutate that state.

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

A design in which code searches a shared registry or container whenever it needs an object—for example, `container.resolve('ticketGateway')` inside `createTicket()`. The required dependency is then hidden from the function's parameters. Explicitly passing the needed object is generally easier to understand and test.

**Purpose.** Resolve collaborators through a locator; recognize that this hides dependencies from a consumer’s signature.

**Example.** Calling `container.resolve('orders')` inside a use case is service location.

**Sources.** [Seemann — Service Locator is an Anti-Pattern](https://blog.ploeh.dk/2010/02/03/ServiceLocatorisanAnti-Pattern/) · [Seemann — Composition Root](https://blog.ploeh.dk/2011/07/28/CompositionRoot/)

---

<a id="side-effect"></a>

## Side Effect

Work that affects or interacts with something beyond simply calculating a return value. Trimming a ticket subject from a string is a calculation; sending it to an API, writing browser storage or logging a message is a side effect. Such operations require deliberate ownership and testing.

**Purpose.** Identify interactions observable outside a calculation so their ownership and timing stay explicit.

**Example.** Writing `sessionStorage` is a side effect and should not occur inside a Redux reducer.

**Sources.** [Redux — Style Guide](https://redux.js.org/style-guide/) · [React — Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects)

---

<a id="slot-recipe"></a>

## Slot Recipe

A Panda CSS styling definition for several named parts of one component, such as a dialog's header, body and footer. A single variant like `compact` can change those parts together. Panda's `sva` makes an atomic slot recipe, while `defineSlotRecipe` registers a config slot recipe.

**Purpose.** Coordinate styles and variants across parts of one visual component.

**Example.** A Dialog slot recipe styles `backdrop`, `content`, `header`, `body` and `footer` together.

**Sources.** [Panda CSS — Slot Recipes](https://panda-css.com/docs/concepts/slot-recipes)

---

<a id="spy"></a>

## Spy

A test stand-in or wrapper that records calls for later inspection. For example, a notification spy records the ticket IDs passed to `send()` so the test can assert that the correct ticket was used. It does not necessarily check a pre-programmed expectation like a mock.

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

A place that holds changing application/UI state and provides ways to read and update it. For example, a Redux store might hold the selected ticket shared across screens. A store is a state-management mechanism; it is not automatically the application layer or the owner of business rules.

**Purpose.** Provide a shared state container with a defined read/update/subscription API.

**Example.** A Redux store holds cross-screen closure state while use cases remain framework-independent.

**Sources.** [Redux — Style Guide](https://redux.js.org/style-guide/)

---

<a id="stub"></a>

## Stub

A test stand-in that supplies a fixed answer the tested code needs. For example, `ticketGateway.create()` always returns ticket `T-001` so a presentation test can continue without calling a server. A stub does not need a complete working persistence implementation.

**Purpose.** Supply controlled responses to a test’s collaborator calls.

**Example.** An HTTP stub returns a fixed JSON response so a mapper can be integration-tested.

**Sources.** [Fowler — Test Double](https://martinfowler.com/bliki/TestDouble.html) · [Fowler — Mocks Aren't Stubs](https://martinfowler.com/articles/mocksArentStubs.html)

---

<a id="test-double"></a>

## Test Double

A replacement for a real collaborator while testing, like using a small in-memory ticket service instead of the production API. Different substitutes serve different purposes: fakes perform simplified work, stubs return prepared answers, spies record calls, and mocks verify expected interactions.

**Purpose.** Replace a collaborator for a specific testing purpose.

**Example.** An in-memory repository replaces the production SQL repository in a use-case test.

**Sources.** [Fowler — Test Double](https://martinfowler.com/bliki/TestDouble.html) · [Fowler — Mocks Aren't Stubs](https://martinfowler.com/articles/mocksArentStubs.html)

---

<a id="test-pyramid"></a>

## Test Pyramid

A guideline to use many fast, focused tests for small rules, with fewer broad tests that start the full UI, API or database. For example, ticket-status validation can be tested many times in isolation, while a smaller set checks the complete create-ticket journey. It is a cost/feedback heuristic, not a fixed test-percentage quota.

**Purpose.** Balance fast focused feedback with integration coverage according to cost and risk.

**Example.** Domain invariants have many unit tests while only critical user journeys receive full end-to-end tests.

**Sources.** [Vocke — The Practical Test Pyramid](https://martinfowler.com/articles/practical-test-pyramid.html)

---

<a id="thunk"></a>

## Thunk

In Redux, a function supplied to dispatch so it can run additional logic with access to `dispatch` and `getState`. For example, a ticket-save thunk may call an injected application operation and then dispatch success/failure actions. It is a Redux mechanism for orchestration, not automatically the business use case itself.

**Purpose.** Defer work through a function; in Redux, access dispatch/state and injected dependencies for orchestration.

**Example.** `saveOrderThunk` invokes an injected Application operation and dispatches lifecycle actions.

**Sources.** [Redux Toolkit — createAsyncThunk](https://redux-toolkit.js.org/api/createAsyncThunk) · [Redux — Side Effects Approaches](https://redux.js.org/usage/side-effects-approaches)

---

<a id="unit-of-work"></a>

## Unit of Work

A pattern that coordinates several changes so they are written as one logical business transaction. For example, transferring an order reservation might update the order and inventory together; the unit of work tracks the changes and coordinates commit. It is distinct from an arbitrary collection of unrelated API requests.

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

The part of a presentation pattern that shows information to a user and receives their interaction. For example, an order View renders the current status and a **Cancel** button; it may forward the click to another role. Its exact responsibilities differ across MVC/MVVM variants, and rendering does not make it the owner of the order's business rules.

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

A file that exports selected names from neighboring modules so other code can import from one deliberate entry point. For example, `features/tickets/index.ts` exposes `useTickets` without exposing every internal helper. An unrestricted list of `export *` statements may hide which names the module actually supports.

**Purpose.** Expose an intentional entry point without exporting every implementation symbol.

**Example.** `features/orders/index.ts` exports `useOrders` and `OrdersPage` while keeping `orders.slice.ts` internal.

**Sources.** [TypeScript — Re-exporting](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-1-5.html) · [Feature-Sliced Design — Public API](https://feature-sliced.design/docs/reference/public-api)

---

<a id="cqrs"></a>

## Command Query Responsibility Segregation (CQRS)

Using different models for changing data and reading it when those tasks genuinely need different shapes. For example, resolving a ticket may use a small command with a ticket id and reason, while a dashboard uses a read model with counts and summaries. CQRS does not require separate databases, services or event sourcing.

**Purpose.** Separate command and query models when their different needs justify the extra coordination.

**Example.** Order updates use a task-oriented write model while a reporting dashboard reads from a separate projection optimized for queries.

**Sources.** [Martin Fowler — CQRS](https://martinfowler.com/bliki/CQRS.html)

---

<a id="event-sourcing"></a>

## Event Sourcing

Storing the sequence of business events as the authoritative record from which current state is rebuilt. For example, `TicketCreated`, `TicketAssigned` and `TicketResolved` can be replayed to determine a ticket's status. Merely keeping an audit log alongside a separately authoritative current-state record is not necessarily event sourcing.

**Purpose.** Retain an event history as the source used to reconstruct state.

**Example.** Instead of storing only the current shipment status, the system stores events such as `ShipmentCreated`, `DepartedPort`, and `ArrivedPort` and derives state by replaying them.

**Sources.** [Martin Fowler — Event Sourcing](https://martinfowler.com/eaaDev/EventSourcing.html)

---

<a id="facade-pattern"></a>

## Facade Pattern

A simpler entry point that hides several internal operations a caller does not need to know. For example, `useTickets()` can expose `tickets`, `busy` and `create()` while internally coordinating state selectors and async actions. The facade simplifies access; it should not become the owner of unrelated business rules.

**Purpose.** Give consumers a cohesive interface over several internal collaborators.

**Example.** `useOrders()` can expose `rows`, `busy`, and `cancel()` while hiding Redux selectors, dispatch and thunk lifecycle details.

**Sources.** [Microsoft Learn — Adapter and Facade patterns](https://learn.microsoft.com/en-us/shows/visual-studio-toolbox/design-patterns-adapterfaade)

---

<a id="factory-pattern"></a>

## Factory Pattern

A way to put object-creation decisions in a named function or mechanism rather than repeating construction details at every caller. For example, `makeTicketGateway(config)` may choose an HTTP or in-memory implementation based on the supplied configuration. Factory Method and Abstract Factory are specific variants; not every helper function is one of those GoF patterns.

**Purpose.** Centralize construction when creation has a real responsibility or varying implementation.

**Example.** `makeOrderRepository(config)` chooses the concrete persistence adapter from configuration while callers depend on the returned capability.

**Sources.** [Microsoft Learn — Factory patterns](https://learn.microsoft.com/en-us/shows/visual-studio-toolbox/design-patterns-factories) · Gamma et al., *Design Patterns: Elements of Reusable Object-Oriented Software* (1994)

---

<a id="model-view-presenter-mvp"></a>

## Model-View-Presenter (MVP)

A family of presentation patterns in which a Presenter sits between the represented information/behavior and the concrete screen. For example, it interprets a click and supplies the View with display-ready values rather than making the UI compute them all. Martin Fowler later retired a single broad MVP description in favor of more precise variants, including Supervising Controller and Passive View.

**Purpose.** Separate presentation coordination from concrete rendering, with variant-specific View/Model relationships.

**Example.** A presenter receives a Save gesture, invokes the application operation, and updates an interface implemented by the View.

**Sources.** [Martin Fowler — Model View Presenter retirement note](https://martinfowler.com/eaaDev/ModelViewPresenter.html) · [Martin Fowler — GUI Architectures](https://martinfowler.com/eaaDev/uiArchs.html)

---

<a id="observer-pattern"></a>

## Observer Pattern

A way for interested code to subscribe to changes without the source hard-coding each reaction. For example, a ticket model announces that its state changed and any subscribed screens can refresh. The source maintains or uses a notification mechanism; observers need a way to subscribe and unsubscribe.

**Purpose.** Notify subscribed collaborators of changes without naming their concrete implementations.

**Example.** A model emits a change notification and several views refresh without those views calling each other.

**Sources.** [Microsoft Learn — Observer and Publish-Subscribe](https://learn.microsoft.com/en-us/shows/visual-studio-toolbox/design-patterns-observer-publish-subscribe) · Gamma et al., *Design Patterns* (1994)

---

<a id="observer-synchronization"></a>

## Observer Synchronization

Keeping displayed information current by having screens react to notifications from the information they observe. For example, two views of a ticket refresh after its status changes rather than one view directly calling the other. Classic MVC used observation for this relationship; subscriptions and cleanup still need an owner.

**Purpose.** Keep views synchronized with changing represented state through observation.

**Example.** Two views subscribe to the same cart model; adding an item notifies both so each independently refreshes its displayed total.

**Sources.** [Martin Fowler — Organizing Presentation Logic](https://martinfowler.com/eaaDev/OrganizingPresentations.html) · [Martin Fowler — GUI Architectures](https://martinfowler.com/eaaDev/uiArchs.html)

---

<a id="passive-view"></a>

## Passive View

A presentation approach in which a separate controller or presenter tells a simple View exactly what to display. For example, a presenter supplies the error text and button-enabled flag instead of having the UI widget derive those values from a domain object. This makes non-rendering behavior easier to test independently of UI controls.

**Purpose.** Make presentation coordination testable through an externally driven view interface.

**Example.** A presenter calculates which controls are enabled and calls methods on a thin View interface rather than letting the View derive that behavior itself.

**Sources.** [Martin Fowler — Passive View](https://martinfowler.com/eaaDev/PassiveScreen.html)

---

<a id="presenter"></a>

## Presenter

Code that prepares application/model information for display and handles presentation-specific interactions. For example, it converts a failed ticket save into `errorMessage` and `canRetry` values used by the screen. In MVP it mediates between the View and underlying behavior; it should not become the authoritative owner of ticket business rules.

**Purpose.** Coordinate presentation updates through the chosen view/model contract.

**Example.** `CheckoutPresenter` invokes the checkout use case and converts its result into fields and messages exposed to a View.

**Sources.** [Martin Fowler — GUI Architectures](https://martinfowler.com/eaaDev/uiArchs.html) · [Robert C. Martin — The Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

---

<a id="separated-presentation"></a>

## Separated Presentation

Keeping what a program means and does separate from how its screen displays it. For example, the rule forbidding cancellation after shipping should not be buried in an onClick handler; the UI can invoke that behavior and display the result. This separation makes the business behavior and rendering easier to change/test independently.

**Purpose.** Keep represented behavior and concrete screen mechanics independently understandable.

**Example.** A web View and a CLI both invoke the same application operation without either UI owning the business invariant.

**Sources.** [Martin Fowler — Presentation Domain Separation](https://martinfowler.com/bliki/PresentationDomainSeparation.html) · [Martin Fowler — GUI Architectures](https://martinfowler.com/eaaDev/uiArchs.html)

---

<a id="clean-entities-circle"></a>

## Clean Entities Circle

The innermost circle in Martin's Clean Architecture diagram, representing general business rules that should remain meaningful without a particular UI or database. For example, “a shipped order cannot be cancelled” can live here as a function or object method. The circle is not identical to a DDD entity with persistent identity.

**Purpose.** Keep general business policy independent of application workflows and technical mechanisms.

**Example.** A pure cancellation policy or Money value object can belong to this circle.

**Sources.** [Martin — The Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

---

<a id="supervising-controller"></a>

## Supervising Controller

A presentation approach where straightforward values are synchronized through binding, while a separate controller handles more complex interaction logic. For example, a name field displays a bound value automatically, but the controller decides how to handle a multi-step save. Fowler distinguishes this from Passive View, which gives the View less direct model access.

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

A CSS rule's way of choosing which page elements to style. For example, `button[disabled]` matches disabled button elements so they can receive a particular appearance. This is unrelated to a Redux selector, which reads data from application state.

**Purpose.** Target document elements for styling.

**Example.** `button[disabled]` matches disabled buttons.

**Sources.** [W3C — Selectors](https://www.w3.org/TR/selectors-4/)

---

<a id="optimistic-concurrency"></a>

## Optimistic Concurrency

A way to avoid silently overwriting someone else's newer change. Suppose two analysts open ticket version `v3`: when one saves, the ticket becomes `v4`; the second save must check that its expected version is still current and reject/reconcile the stale update. The server or authoritative storage must check that condition atomically.

**Purpose.** Prevent a stale writer from silently overwriting newer state.

**Example.** An HTTP update carries a strong ETag in `If-Match`; a changed version produces a failed precondition.

**Sources.** [RFC 9110 — If-Match](https://www.rfc-editor.org/rfc/rfc9110.html#section-13.1.1)

---

<a id="idempotency"></a>

## Idempotency

A property of an operation for which repeating the same request does not create an additional intended effect. For example, repeatedly setting a ticket's status to `resolved` may leave it resolved once, but sending a new notification every retry can still cause repeated side effects. HTTP method labels alone do not guarantee business idempotency.

**Purpose.** Make repeated delivery or retries safe for the intended effect.

**Example.** Setting status to cancelled twice can be idempotent; sending a new notification on every retry may not be.

**Sources.** [RFC 9110 — Idempotent Methods](https://www.rfc-editor.org/rfc/rfc9110.html#section-9.2.2)

---

<a id="custom-hook"></a>

## Custom Hook

A React function whose name starts with `use` followed by a capitalized word and which reuses logic built from React Hooks. For example, `useTickets()` can combine state and functions needed by a ticket UI. A custom hook is a React code-reuse mechanism; it does not automatically become a ViewModel or an application use case.

**Purpose.** Reuse React behavior through a concrete, meaningful interface.

**Example.** `useOrders` exposes view state and commands when intentionally designed as a feature facade.

**Sources.** [React — Reusing Logic with Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)

---

<a id="type-only-import"></a>

## Type-only Import

A TypeScript import used to name a type without importing its runtime value. For example, `import type { Ticket } from './Ticket'` tells TypeScript the expected shape but is removed from emitted JavaScript. The source file still depends on that type's definition, so architectural import rules must account for it.

**Purpose.** Use types without a runtime import while retaining explicit architectural ownership.

**Example.** An Application `import type` from Infrastructure still violates the documented inward source rule.

**Sources.** [TypeScript — Modules Reference](https://www.typescriptlang.org/docs/handbook/modules/reference.html#type-only-imports-and-exports)

---

<a id="http-endpoint"></a>

## HTTP Endpoint

A callable HTTP operation offered by an API. For the analyst, `POST /tickets` means submit ticket data for creation; `GET /tickets` would be another operation even with the same path. Here endpoint identifies the public method/path operation and its contract, while a route describes the server's matching rule. Industry usage sometimes means only the URL, so clarify the intended meaning.

**Purpose.** Identify an externally callable operation without confusing it with its implementation.

**Example.** `POST /tickets` is an endpoint; `TicketsController` is a class that may group several endpoint handlers, not itself an endpoint.

**Sources.** [Nest — Controllers and routing](https://docs.nestjs.com/controllers) · [RFC 9110 — HTTP methods](https://www.rfc-editor.org/rfc/rfc9110.html#section-9)

---

<a id="http-route"></a>

## HTTP Route

The server's matching rule that associates an HTTP method and path or path pattern with code to execute. The ticket server matches `POST` plus `/tickets` to `TicketsController.create()`. The rule is configuration, not a business operation or controller object; a parameterized rule can match many concrete URLs. Teams often use route and endpoint loosely as synonyms.

**Purpose.** Select the intended handler from a request's method and target path.

**Example.** A separate `GET /tickets/:id` rule may select a different handler in the same controller. Changing that route does not change the rule for valid ticket subjects.

**Sources.** [Nest — Controller routing](https://docs.nestjs.com/controllers#routing)

---

<a id="route-handler"></a>

## Route Handler

The function selected to execute for a matched request. After ticket routing selects `TicketsController.create()`, that method receives parsed arguments, invokes ticket creation and returns the chosen response data. A handler is callable code, distinct from the public HTTP operation or its matching rule.

**Purpose.** Connect a matched request to application behavior and transport output.

**Example.** `create()` is the handler for `POST /tickets`; `TicketsController` groups it with other methods. The name `create` alone does not register an HTTP route or own ticket validity.

**Sources.** [Nest — Controllers](https://docs.nestjs.com/controllers)

---

<a id="http-routing"></a>

## HTTP Router / Routing

The server must choose different code for `POST /tickets` and `GET /tickets`. Routing is that selection using registered method/path rules; the router is the mechanism performing it. It does not decide whether a ticket subject is valid.

**Purpose.** Direct an incoming HTTP request to the configured handler.

**Example.** Nest builds routing metadata from `@Controller('tickets')` and `@Post()` so the platform dispatches creation requests to `create()`. A router is not an application use case or DI container.

**Sources.** [Nest — Controllers](https://docs.nestjs.com/controllers)

---

<a id="nestjs-provider"></a>

## NestJS Provider

Instead of repeating object construction, the program can register a dependency for Nest to create or supply. That managed dependency is a provider: a class instance, value or factory result identified by a runtime token. The concept describes container registration, not architectural responsibility.

**Purpose.** Supply collaborators and manage their lifetimes through Nest's DI system.

**Example.** A factory registers plain `CreateTicket` and supplies its repository; a Symbol token selects the memory or database implementation. Both are providers, but they own different responsibilities. A provider is not a business layer, and `@Injectable()` alone does not register it.

**Sources.** [Nest — Providers](https://docs.nestjs.com/providers) · [Nest — Custom providers](https://docs.nestjs.com/fundamentals/custom-providers)

---

<a id="nestjs-module"></a>

## NestJS Module

The framework needs to know which controllers and dependencies belong together and which dependencies other groups may use. A class decorated with `@Module()` records those registrations, imports and exports. This is Nest's module system for framework organization and container visibility.

**Purpose.** Organize registrations and their availability in the framework graph.

**Example.** `TicketsModule` registers `TicketsController`, binds the repository and exports `CreateTicket`. It is not automatically an architectural layer, business model boundary or feature boundary; source-code imports need their own rules.

**Sources.** [Nest — Modules](https://docs.nestjs.com/modules)

---

<a id="nestjs-pipe"></a>

## Pipe (NestJS)

Before the ticket handler receives its body argument, code can check or transform that value. A Nest pipe performs this work through `transform(value, metadata)` before handler execution; it can return a parsed value or reject it with an exception.

**Purpose.** Integrate argument parsing, validation or transformation into Nest's request processing.

**Example.** `CreateTicketPipe` invokes the manual parser for an unknown body and maps bad shapes to `400`. It does not persist tickets or become the owner of subject and initial-state rules. TypeScript annotations alone are not pipes or runtime validation.

**Sources.** [Nest — Pipes](https://docs.nestjs.com/pipes) · [Nest — Validation](https://docs.nestjs.com/techniques/validation)

---

<a id="nestjs-guard"></a>

## Guard (NestJS)

Before creation executes, the server may need to decide whether an authenticated caller may enter the operation. A Nest guard makes an access decision using an execution context identifying the selected handler. It can permit, reject or throw an appropriate failure.

**Purpose.** Apply access policy at a known framework invocation boundary.

**Example.** A ticket guard requires a principal previously verified by established authentication code. It does not make arbitrary request data a verified identity, validate ticket subject rules or enforce permissions for non-HTTP callers automatically.

**Sources.** [Nest — Guards](https://docs.nestjs.com/guards)

---

<a id="nestjs-interceptor"></a>

## Interceptor (NestJS)

Timing ticket creation requires code before execution and when it completes or fails. A Nest interceptor wraps the remaining execution using `next.handle()` and can observe or transform its Observable result, a stream of completion/data/failure notifications.

**Purpose.** Apply behavior around handler execution and its result without duplicating it in every handler.

**Example.** A timing interceptor records elapsed handler time with `finalize`. It is not the early raw-request middleware, a persistence port, or authority over ticket state. Output transformations must respect the agreed API contract.

**Sources.** [Nest — Interceptors](https://docs.nestjs.com/interceptors) · [Nest — Request lifecycle](https://docs.nestjs.com/faq/request-lifecycle)

---

<a id="nestjs-exception-filter"></a>

## Exception Filter (NestJS)

An uncaught failure during a ticket request needs an HTTP representation rather than a database stack trace. A Nest exception filter handles matching uncaught exceptions and writes the transport response. Catching an error inside the operation instead prevents it from reaching that filter.

**Purpose.** Translate exceptional failures at the transport edge.

**Example.** A filter can map an application-owned storage failure to `503` if that failure escapes. The canonical operation returns an `unavailable` result instead, so its controller maps the result through Nest HTTP exceptions. A filter is not a mandatory success-path step or an owner of business invariants.

**Sources.** [Nest — Exception filters](https://docs.nestjs.com/exception-filters) · [Nest — Request lifecycle](https://docs.nestjs.com/faq/request-lifecycle)

---

<a id="orm"></a>

## Object-Relational Mapper (ORM)

To store tickets in relational tables, a tool can map programming-language records/objects to database data and offer query operations. Such a tool is an object-relational mapper (ORM). Prisma generates a typed client from its database model; these generated records describe storage rather than automatically enforcing ticket behavior.

**Purpose.** Implement relational data interaction with mapping/query conveniences.

**Example.** `PrismaTicketRepository` maps `Ticket.status` to stored `state` and calls `db.ticket.create()`. Prisma's client or an ORM-specific repository API is not automatically the application-owned Repository Pattern contract, and a generated row is not automatically a domain entity.

**Sources.** [Prisma ORM 7 — Client introduction](https://www.prisma.io/docs/orm/v7/prisma-client/setup-and-configuration/introduction) · [Fowler — Repository](https://martinfowler.com/eaaCatalog/repository.html)

---

<a id="layered-architecture"></a>

## Layered Architecture

Ticket input handling, business decisions and storage can be grouped by the different work they do. A layered architecture organizes those responsibility groups and defines which may depend on or call others. Conventional presentation/business/data arrangements often permit downward source dependencies; inward inversion is a separate design choice.

**Purpose.** Separate kinds of work and constrain interactions between responsibility groups.

**Example.** HTTP code invokes creation behavior, and persistence code stores the ticket. Naming files Controller, Service and Repository does not alone establish good layers or protect domain policy. Open versus closed layers and dependency rules must be specified; layers are not necessarily separately deployed services.

**Sources.** [Fowler — Presentation Domain Data Layering](https://martinfowler.com/bliki/PresentationDomainDataLayering.html) · [Backend style comparison](./backend/5-architectural-styles-with-nestjs.md)
