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

A component that translates between an external technology or actor and an interface understood by the application. In Ports and Adapters, adapters let the same application interact with different UIs, databases, transports or test harnesses.

**Purpose.** Translate a mechanism or actor into the contract its consumer understands.

**Example.** `HttpOrderRepository` adapts an HTTP API to the `OrderRepository` port.

**Frontend example.** `HttpTicketGateway` translates `POST /api/tickets` and an API `ticket_id` into the `TicketGateway` contract and an application ticket. See [the ticket-support walkthrough](./frontend/ports-and-adapters.md).

**Sources.** [Cockburn — Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/) · [Martin — The Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

---

<a id="application-layer"></a>

## Application Layer

The area that owns application-specific orchestration: use cases, commands/results and the ports those use cases require. It coordinates domain behavior without depending on concrete UI, persistence or transport technology.

**Purpose.** Keep workflow policy independent of delivery and persistence mechanisms.

**Example.** `CancelOrder` loads an order through a port, invokes the domain rule and persists the result.

**Sources.** [Martin — The Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html) · [Fowler — Service Layer](https://martinfowler.com/eaaCatalog/serviceLayer.html) · [Microsoft Learn — Tactical DDD](https://learn.microsoft.com/en-us/azure/architecture/microservices/model/tactical-ddd)

---

<a id="application-service"></a>

## Application Service

A stateless coordinator for an application use case. It sequences domain objects and external capabilities but should not become the owner of domain invariants.

**Purpose.** Coordinate one cohesive application operation without moving domain invariants into orchestration.

**Example.** `CheckoutService` coordinates inventory, payment and order persistence for the checkout workflow.

**Sources.** [Fowler — Service Layer](https://martinfowler.com/eaaCatalog/serviceLayer.html) · [Microsoft Learn — Tactical DDD](https://learn.microsoft.com/en-us/azure/architecture/microservices/model/tactical-ddd)

---

<a id="architectural-boundary"></a>

## Architectural Boundary

A deliberately protected separation between parts of a system with different responsibilities or volatility. Crossing it normally requires an explicit contract and, where representations differ, translation.

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

A DDD boundary inside which a particular domain model and vocabulary are consistent. The same real-world thing can legitimately have different models in different bounded contexts.

**Purpose.** Give a model and its vocabulary an explicit scope of validity.

**Example.** A `Customer` in Billing may contain credit information that the Support context neither needs nor owns.

**Sources.** [Fowler — Bounded Context](https://martinfowler.com/bliki/BoundedContext.html) · [Microsoft Learn — Domain analysis and bounded contexts](https://learn.microsoft.com/en-us/azure/architecture/microservices/model/domain-analysis)

---

<a id="clean-architecture"></a>

## Clean Architecture

Robert C. Martin's architecture framing that separates higher-level policies from lower-level mechanisms and requires source dependencies to point inward across boundaries.

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

The outermost place where concrete implementations are constructed and connected to abstractions. Consumers receive dependencies from the root; they do not reach back into it to resolve services.

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

A data structure shaped for transfer across a boundary, commonly an API or process boundary. A DTO should not automatically become the domain model just because fields look similar.

**Purpose.** Define boundary data without exposing a mechanism’s internal object model.

**Example.** `ApiOrderDto` is mapped to an `Order` before Application/Domain code uses it.

**Sources.** [Martin — The Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html) · [Fowler — Repository](https://martinfowler.com/eaaCatalog/repository.html)

---

<a id="dependency-graph"></a>

## Dependency Graph

A directed graph whose nodes are modules/packages/components and whose edges represent dependencies. Architectural layering is ultimately a constraint on this graph.

**Purpose.** Reveal permitted coupling, cycles and the impact of a change.

**Example.** A graph tool can reveal a cycle between `features/auth` and `features/profile`.

**Sources.** [dependency-cruiser — Rules Reference](https://github.com/sverweij/dependency-cruiser/blob/main/doc/rules-reference.md)

---

<a id="dependency-injection-di"></a>

## Dependency Injection (DI)

Supplying an object's collaborators from outside rather than having the object construct or locate them itself. DI is the mechanism commonly used to keep inner policy dependent on abstractions.

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

The SOLID principle that high-level policy should not depend directly on low-level details; both should depend on abstractions. In layered architecture this enables runtime calls outward while source dependencies remain inward.

**Purpose.** Keep higher-level policy independent of concrete lower-level mechanisms.

**Example.** `PlaceOrder` depends on `OrderRepository`; `SqlOrderRepository` also depends on that contract by implementing it.

**Sources.** [Martin — The Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html) · [Cockburn — Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)

---

<a id="dependency-rule"></a>

## Dependency Rule

Clean Architecture's rule that source dependencies across architectural boundaries point toward higher-level policy. Outer details may know inner policy; inner policy must not name outer mechanisms.

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

A named design decision represented as data, such as a color, spacing step, radius or typography value. Tokens decouple semantic usage from raw values.

**Purpose.** Represent reusable design decisions through named values.

**Example.** `spacing.3` can resolve to `12px`, while components reference the token instead of the literal number.

**Sources.** [Design Tokens Community Group](https://www.w3.org/community/design-tokens/) · [Panda CSS — Tokens](https://panda-css.com/docs/theming/tokens)

---

<a id="domain"></a>

## Domain

The business/problem space whose concepts and rules the software models. In layered architecture, Domain code expresses stable business meaning without depending on delivery or infrastructure mechanisms.

**Purpose.** Identify the subject matter and rules whose meaning outlives a particular UI or database.

**Example.** In an ordering domain, `Order`, `Money` and cancellation rules belong to the domain model.

**Sources.** [Microsoft Learn — Domain analysis and bounded contexts](https://learn.microsoft.com/en-us/azure/architecture/microservices/model/domain-analysis) · [Martin — The Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

---

<a id="domain-driven-design-ddd"></a>

## Domain-Driven Design (DDD)

An approach to software design that aligns models and code with business concepts, using strategic patterns such as bounded contexts and tactical patterns such as entities, value objects and domain services.

**Purpose.** Align software models with domain knowledge within explicit contexts.

**Example.** Billing and Shipping use separate bounded contexts because the word `Account` has different rules in each.

**Sources.** [Microsoft Learn — Domain analysis and bounded contexts](https://learn.microsoft.com/en-us/azure/architecture/microservices/model/domain-analysis) · [Fowler — Bounded Context](https://martinfowler.com/bliki/BoundedContext.html)

---

<a id="domain-entity"></a>

## Domain Entity

A domain object defined primarily by identity and continuity over time rather than only by its attribute values.

**Purpose.** Track a business concept whose identity persists as its attributes change.

**Example.** A user's email may change while the same `UserId` identifies the same User entity.

**Sources.** [Microsoft Learn — Design a microservice domain model](https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model) · [Microsoft Learn — Tactical DDD](https://learn.microsoft.com/en-us/azure/architecture/microservices/model/tactical-ddd)

---

<a id="domain-error"></a>

## Domain Error

An error/result that represents a violation or impossible condition in domain language rather than a transport or framework failure.

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

An abstraction/adapter that encapsulates interaction with an external system or subsystem in application-oriented terms. It is broader than a Repository because the capability need not resemble persistence of domain objects.

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

Alistair Cockburn's architecture pattern that isolates the application behind purpose-oriented ports and connects external actors/technologies through adapters.

**Purpose.** Let multiple external actors and mechanisms interact with the same application through ports.

**Example.** The same application port can be driven by an HTTP controller in production and a test harness in tests.

**Sources.** [Cockburn — Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)

---

<a id="infrastructure"></a>

## Infrastructure

The outer area that implements technical details such as HTTP, databases, browser storage, SDKs and message transports, adapting them to inner contracts.

**Purpose.** Isolate technical I/O, external representations and integration details.

**Example.** `PrismaOrderRepository` maps database rows to the model required by Application.

**Sources.** [Martin — The Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html) · [Palermo — The Onion Architecture](https://jeffreypalermo.com/2008/07/)

---

<a id="interface-adapter"></a>

## Interface Adapter

Clean Architecture's translation layer between inner policy and outer representations. Controllers, presenters, gateways and mappers commonly play this role.

**Purpose.** Translate between inner-policy representations and external-facing ones.

**Example.** A controller turns an HTTP request into a use-case command and maps the result back to HTTP.

**Sources.** [Martin — The Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

---

<a id="invariant"></a>

## Invariant

A condition that must remain true for a domain concept to be valid. Domain behavior should prevent transitions that would violate its invariants.

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

Code that converts one representation into another at a boundary while keeping ownership explicit.

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

In MVC/MVVM, the non-view side containing application/domain data and behavior. The term is overloaded; it is not automatically identical to a Clean Entity or a DDD domain model.

**Purpose.** Separate represented state/behavior from concrete controls without assuming one whole-application layer.

**Example.** In an MVVM screen, the ViewModel may call Application use cases rather than directly manipulating one Model object.

**Sources.** [Fowler — GUI Architectures](https://martinfowler.com/eaaDev/uiArchs.html) · [Fowler — Presentation Model](https://martinfowler.com/eaaDev/PresentationModel.html)

---

<a id="model-view-controller-mvc"></a>

## Model-View-Controller (MVC)

A family of presentation patterns separating Model, View and Controller responsibilities. Classic client-side MVC differs from server-side frameworks that also use the MVC label.

**Purpose.** Separate represented behavior, rendering and input interpretation.

**Example.** The Controller interprets a click, updates the Model, and the View reflects the change.

**Sources.** [Fowler — GUI Architectures](https://martinfowler.com/eaaDev/uiArchs.html)

---

<a id="model-view-viewmodel-mvvm"></a>

## Model-View-ViewModel (MVVM)

A presentation pattern that separates a View from a ViewModel exposing view-oriented state and operations. Reactive frameworks can implement this separation, but using such a framework does not make an application MVVM automatically.

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

Jeffrey Palermo's domain-centered architecture style that places the domain model at the center and directs dependencies inward while infrastructure remains outside.

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

A purpose-oriented interface through which the application communicates with an external actor or capability. A port models a conversation/capability, not a file or endpoint count.

**Purpose.** Specify a cohesive conversation needed or offered by application policy.

**Example.** `Clock.now()` is a port when application policy must be independent of system time.

**Frontend example.** `application/tickets/ports/TicketGateway.ts` defines the operation needed by the ticket-creation use case, without depending on HTTP or React. See [the ticket-support walkthrough](./frontend/ports-and-adapters.md).

**Sources.** [Cockburn — Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)

---

<a id="presentation-layer"></a>

## Presentation Layer

The outer area responsible for rendering, user interaction and view-oriented state/behavior. It may contain substantial UI logic without owning domain invariants.

**Purpose.** Own interaction and view state while delegating authoritative policy inward.

**Example.** A feature hook derives loading and display state, then delegates business operations to Application.

**Sources.** [Fowler — Presentation Model](https://martinfowler.com/eaaDev/PresentationModel.html) · [Martin — The Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

---

<a id="presentation-model"></a>

## Presentation Model

A UI-independent representation of a view's state and behavior. It lets rendering remain comparatively simple and makes presentation logic testable without concrete widgets.

**Purpose.** Represent screen state and behavior without concrete rendering controls.

**Example.** A Presentation Model exposes `canSubmit`, formatted totals and `submit()` for a checkout view.

**Sources.** [Fowler — Presentation Model](https://martinfowler.com/eaaDev/PresentationModel.html)

---

<a id="public-api"></a>

## Public API

The intentionally supported surface through which other modules consume a module/feature, hiding internal files and allowing internal refactoring.

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

A pattern that mediates between domain/application code and data access using collection-like domain terms. Not every external integration should be named Repository. In this glossary, **Repository** means the software design pattern—not a Git/source-code repository.

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

A design token named for contextual meaning rather than a raw value, often referencing primitive tokens and changing by theme/condition.

**Purpose.** Name the contextual role of a design value rather than a raw literal.

**Example.** `colors.danger` references a red primitive in light mode and another accessible red in dark mode.

**Sources.** [Panda CSS — Tokens](https://panda-css.com/docs/theming/tokens)

---

<a id="server-state"></a>

## Server State

Data whose authoritative source lives on a remote server and therefore requires fetching, caching, invalidation and synchronization concerns distinct from purely local client state.

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

The discipline and mechanisms used to own, update, derive and synchronize state across a UI/application. The key architectural question is ownership before library choice.

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

An application-specific operation that expresses what the system does for an actor or workflow, coordinating domain rules and required ports while avoiding concrete delivery/infrastructure details.

**Purpose.** Describe and implement an application operation in its own policy vocabulary.

**Example.** `CancelOrder` is a use case; `PUT /orders/:id/cancel` is one delivery mechanism for it.

**Sources.** [Martin — The Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html) · [Cockburn — Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)

---

<a id="value-object"></a>

## Value Object

A domain object defined by its attributes/value rather than identity, typically immutable and replaceable as a whole.

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

In MVVM, a view-oriented state/behavior holder that does not reference concrete View controls. In web apps, a custom hook, composable or state facade can play this role when it intentionally exposes a view contract.

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

A mechanism that synchronizes displayed values with a source contract and, in selected modes, propagates edits back. Binding can use notifications or subscriptions underneath; two-way updates are not mandatory for MVVM.

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
