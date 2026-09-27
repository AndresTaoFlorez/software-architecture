> **[Clean Architecture](README.md)** › The Four Circles.

# 2. The Four Circles

The canonical Clean Architecture diagram contains four concentric circles. They are conceptual boundaries, not mandatory directory names.

---

## 2.1 Entities

### Responsibility

Martin describes Entities as encapsulating enterprise-wide critical business rules.

In modern domain-oriented systems, interpret that carefully: the relevant policy may be scoped to a product or bounded context rather than literally one enterprise-wide class shared by every application.

Typical contents:

- entities with identity;
- value objects;
- business invariants;
- domain policies;
- domain errors/events where appropriate.

Example:

```ts
export class Money {
  private constructor(
    readonly amount: bigint,
    readonly currency: Currency,
  ) {}

  static of(amount: bigint, currency: Currency) {
    if (amount < 0n) throw new NegativeMoney()
    return new Money(amount, currency)
  }
}
```

Entities should not know delivery, persistence or framework details.

They do **not** have to be classes. Functional/immutable domain models can satisfy the same boundary.

---

## 2.2 Use Cases

### Responsibility

Use Cases contain application-specific business rules and orchestrate an operation.

Typical contents:

- application services/interactors;
- commands/queries;
- required ports/boundaries;
- application-level validation and orchestration;
- application results/errors.

Example:

```ts
export interface OrderRepository {
  findById(id: OrderId): Promise<Order | null>
  save(order: Order): Promise<void>
}

export function makeCancelOrder(deps: {
  orders: OrderRepository
}) {
  return async function cancelOrder(id: OrderId) {
    const order = await deps.orders.findById(id)

    if (!order) throw new OrderNotFound(id)

    order.cancel()
    await deps.orders.save(order)
  }
}
```

The use case does not import the database, HTTP client, UI framework or concrete repository.

### Error ownership

Do not map every external failure into a Domain error.

Use meaning:

```text
business invariant violation -> Domain error
use case cannot complete     -> Application error/result
HTTP/SQL/SDK detail          -> translated outer detail
```

---

## 2.3 Interface Adapters

### Responsibility

Translate between representations convenient to inner policy and representations convenient to external mechanisms.

Examples:

- controllers;
- presenters;
- gateways/repository adapters;
- mappers;
- framework-facing state adapters.

An adapter can implement an inner port:

```ts
export class HttpOrderRepository implements OrderRepository {
  constructor(private readonly http: HttpClient) {}

  async findById(id: OrderId): Promise<Order | null> {
    const dto = await this.http.get('/orders/' + id.value)
    return dto ? mapOrderDto(dto) : null
  }
}
```

### Repository is not a synonym for adapter

Use `Repository` when the abstraction is actually repository-like. Other ports may be better named:

```text
PaymentGateway
FileStorage
Clock
IdGenerator
NotificationSender
ClosureExecutor
```

The name should expose purpose.

---

## 2.4 Frameworks & Drivers

### Responsibility

Hold replaceable mechanisms:

- React/Vue/Svelte;
- Express/NestJS/Spring;
- SQL/ORM drivers;
- browser storage;
- message brokers;
- HTTP clients;
- third-party SDKs;
- UI styling systems.

"The web is a detail" does not mean web code is unimportant. It means inner policy should not depend on the web mechanism.

---

## 2.5 The circles are not a linear runtime stack

Do not read:

```text
Frameworks -> Adapters -> UseCases -> Entities
```

as "every request must call exactly one thing in each circle".

It is a source dependency model.

A UI component can call a Presentation adapter that calls a use case. An Infrastructure adapter can be invoked by that use case through a port. Runtime calls can move both directions across boundaries while source dependencies remain inward.

---

## 2.6 Mapping to common project folders

This repository often uses:

| Clean concept | Practical area |
| --- | --- |
| Entities | Domain |
| Use Cases | Application |
| Interface Adapters | parts of Presentation + Infrastructure |
| Frameworks & Drivers | concrete UI/HTTP/DB/storage/framework code |

The mapping is not one-to-one.

For example, "Presentation" in a project may contain both Interface Adapter behavior (ViewModels/presenters) and Framework/Driver behavior (React components).

Therefore, do not insist that every project folder corresponds to exactly one canonical circle.

---

## 2.7 Frontend organization is a second scale

A real frontend can contain hundreds of files inside the outer UI area.

Clean Architecture does not define:

- page hierarchy;
- feature folders;
- hooks;
- Redux slices;
- selectors;
- design tokens;
- CSS recipes.

Those are documented in **[Frontend Architecture](../frontend/README.md)**.

They should preserve the cross-layer boundary but are not themselves Clean Architecture circles.

---

## 2.8 Backend organization is similarly concrete

Controllers, transport DTOs, ORM mappings, transactions and messaging adapters are outer concerns.

See **[Clean Architecture on the Backend](8-clean-on-the-backend.md)**.

## Sources

- Robert C. Martin, "The Clean Architecture" (2012): https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html
- Robert C. Martin, *Clean Architecture* (2017)
- Martin Fowler, Repository: https://martinfowler.com/eaaCatalog/repository.html
