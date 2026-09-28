<a id="model-view-viewmodel-for-the-frontend"></a>
<a id="read-this-first-mvvm-is-mvcs-direct-descendant"></a>

# Model-View-ViewModel (MVVM)

> A presentation pattern that separates rendering from view-oriented state and behavior.

← [Repository home](../README.md) · [Glossary](../GLOSSARY.md) · [Code placement](../foundations/code-placement.md) · [Naming](../conventions/naming-and-file-placement.md) · [Frontend architecture](../frontend/README.md)

## 1. History and origin

Martin Fowler described **[Presentation Model](../GLOSSARY.md#presentation-model)** in 2004: an abstraction that contains a [View](../GLOSSARY.md#view)'s state and behavior while remaining independent of concrete UI controls.

In **2005**, John Gossman introduced the [MVVM](../GLOSSARY.md#model-view-viewmodel-mvvm) name in the WPF ecosystem, describing a variation of [MVC](../GLOSSARY.md#model-view-controller-mvc) tailored to declarative UI and binding.

Sources:

- https://martinfowler.com/eaaDev/PresentationModel.html
- https://learn.microsoft.com/en-us/archive/msdn-magazine/2009/february/patterns-wpf-apps-with-the-model-view-viewmodel-design-pattern

## 2. What problem does MVVM solve?

Stateful UI code easily mixes:

- rendering;
- loading/error state;
- formatting;
- commands;
- presentation validation;
- subscriptions;
- application/business rules;
- transport calls.

[MVVM](../GLOSSARY.md#model-view-viewmodel-mvvm) separates the rendering surface from the state and behavior needed by that rendering surface.

```mermaid
flowchart LR
    VIEW["View"] -->|"user intent"| VM["ViewModel"]
    VM -->|"view state"| VIEW
    VM --> MODEL["Application / Model"]
```

[MVVM](../GLOSSARY.md#model-view-viewmodel-mvvm) does not define persistence architecture, domain boundaries, transport [adapters](../GLOSSARY.md#adapter) or deployment.

## 3. When MVVM is a strong fit

It is useful for:

- rich stateful screens;
- UI behavior that benefits from headless tests;
- several UI elements sharing one view-oriented state holder;
- declarative/reactive frameworks where rendering can bind to a stable view contract;
- complex forms/workflows where rendering should stay comparatively simple.

## 4. When MVVM is weak or unnecessary

A dedicated [ViewModel](../GLOSSARY.md#viewmodel) can be overhead when:

- the screen is tiny;
- UI state is trivial and local component state is clearer;
- the [ViewModel](../GLOSSARY.md#viewmodel) only forwards values without adding a boundary;
- the [ViewModel](../GLOSSARY.md#viewmodel) becomes a generic service containing unrelated features.

React, Vue and Svelte do **not** become [MVVM](../GLOSSARY.md#model-view-viewmodel-mvvm) merely because they are reactive.

<a id="the-triad-in-one-picture"></a>

## 5. Mental model and roles

```mermaid
flowchart LR
    USER["User"] --> VIEW["View"]
    VIEW -->|"intent / command"| VM["ViewModel"]
    VM -->|"display-ready state"| VIEW
    VM --> MODEL["Model / Application capabilities"]
```

| Role | Owns | Put here | Do not put here |
| --- | --- | --- | --- |
| [View](../GLOSSARY.md#view) | rendering and user gestures | component/template, local visual state | authoritative business rules, transport clients |
| [ViewModel](../GLOSSARY.md#viewmodel) | view-oriented state and behavior | loading flags, display derivation, commands/[facade](../GLOSSARY.md#facade-pattern), UI-specific orchestration | database/HTTP implementations, business [invariants](../GLOSSARY.md#invariant) |
| [Model](../GLOSSARY.md#model) | non-[View](../GLOSSARY.md#view) application/domain capabilities | domain/application state and operations according to the wider architecture | concrete [View](../GLOSSARY.md#view) controls |

"[Model](../GLOSSARY.md#model)" is overloaded. In a Clean/Onion application it is not automatically identical to `domain/`.

<a id="a-warning-about-the-word-viewmodel"></a>

## 6. Isolation in a layered React application

This repository uses a [ViewModel](../GLOSSARY.md#viewmodel)-like **public feature [facade](../GLOSSARY.md#facade-pattern)** when a screen is complex enough to justify it:

```mermaid
flowchart TD
    VIEW["React component (View)"]
    VM["useOrders() (ViewModel / Presentation facade)"]
    BIND["Presentation state bindings"]
    APP["Application use case"]
    DOMAIN["Domain"]
    INFRA["Infrastructure adapter"]

    VIEW --> VM
    VM --> BIND
    VM --> APP
    APP --> DOMAIN
    INFRA --> APP
```

Why isolate it?

- React components can change without rewriting application policy;
- Redux/Zustand/other [store](../GLOSSARY.md#store) mechanics can stay behind a semantic feature API;
- UI-specific derived state can be tested without DOM rendering;
- [Application](../GLOSSARY.md#application-layer)/[Domain](../GLOSSARY.md#domain) never need to know React.

A hook is a [ViewModel](../GLOSSARY.md#viewmodel) only when it intentionally exposes a view contract. The `use` prefix alone does not create the architectural role.

## 7. Physical structure

A feature-oriented [Presentation](../GLOSSARY.md#presentation-layer) structure:

```mermaid
flowchart TD
    P["presentation/"]
    P --> PAGES["pages/orders/"]
    P --> FEATURES["features/orders/"]
    FEATURES --> UI["ui/"]
    FEATURES --> MODEL["model/"]
    FEATURES --> LIB["lib/"]
    FEATURES --> API["index.ts"]

    UI --> VIEW["OrderList.tsx"]
    MODEL --> VM["useOrders.ts"]
    MODEL --> SEL["orders.selectors.ts"]
    MODEL --> BIND["orders.bindings.ts"]
    LIB --> FORMAT["order-display.ts"]

    APP["application/orders/"] --> UC["use-cases/cancelOrder.ts"]
    DOMAIN["domain/orders/"] --> ENTITY["Order.ts"]
```

| Path | Owns | Why | Must not contain |
| --- | --- | --- | --- |
| `features/orders/ui/` | [Views](../GLOSSARY.md#view)/components | rendering belongs to feature | business [invariants](../GLOSSARY.md#invariant), HTTP clients |
| `features/orders/model/` | [ViewModel](../GLOSSARY.md#viewmodel)/state/[selectors](../GLOSSARY.md#selector)/bindings | view-oriented behavior stays together | concrete [Infrastructure](../GLOSSARY.md#infrastructure) |
| `features/orders/lib/` | helpers still owned by Orders [Presentation](../GLOSSARY.md#presentation-layer) | prevents generic util dumping | unrelated cross-feature code |
| `features/orders/index.ts` | public feature API | hides internal state implementation | automatic `export *` of every internal |
| `application/orders/` | application operations | [ViewModel](../GLOSSARY.md#viewmodel) delegates policy-bearing work inward | React/Redux mechanisms |
| `domain/orders/` | business meaning | survives UI redesign | view state |

Not every feature needs all of these files. Split only when each responsibility becomes meaningful.


## 8. Where does a new function go?

```mermaid
flowchart TD
    Q{"Why does this function exist?"}
    Q -->|"Renders / handles local visual gesture"| V["View / ui/"]
    Q -->|"Creates display state or view command"| VM["ViewModel / model/"]
    Q -->|"Business/application workflow"| APP["Application / Domain"]
    Q -->|"Calls HTTP / DB / SDK"| I["Infrastructure"]
```

Examples:

| Function/type | Owner |
| --- | --- |
| `formatTotalForScreen()` | [ViewModel](../GLOSSARY.md#viewmodel)/[Presentation](../GLOSSARY.md#presentation-layer) helper |
| `isSaving` derived flag | [ViewModel](../GLOSSARY.md#viewmodel)/[selector](../GLOSSARY.md#selector) |
| `cancel()` command exposed to the [View](../GLOSSARY.md#view) | [ViewModel](../GLOSSARY.md#viewmodel) [facade](../GLOSSARY.md#facade-pattern) |
| `cancelOrder(id)` workflow | [Application](../GLOSSARY.md#application-layer) |
| `Order.cancel()` [invariant](../GLOSSARY.md#invariant) | [Domain](../GLOSSARY.md#domain) |
| HTTP request implementation | [Infrastructure](../GLOSSARY.md#infrastructure) |

Do not move business rules into the [ViewModel](../GLOSSARY.md#viewmodel) merely because they are easy to express as a computed/[selector](../GLOSSARY.md#selector).

Types and helpers follow the same ownership rule:

| Artifact | Owner | Reason |
| --- | --- | --- |
| component props, focus helper | [Presentation](../GLOSSARY.md#presentation-layer) UI | concrete control needs |
| view state, display formatter, [facade](../GLOSSARY.md#facade-pattern) hook | [Presentation model](../GLOSSARY.md#presentation-model)/controller boundary | screen-oriented behavior |
| command/result and [port](../GLOSSARY.md#port) | [Application](../GLOSSARY.md#application-layer) | operation contract |
| business value and [invariant](../GLOSSARY.md#invariant) helper | [Domain](../GLOSSARY.md#domain) | authoritative business meaning |
| API [DTO](../GLOSSARY.md#data-transfer-object-dto) and [DTO](../GLOSSARY.md#data-transfer-object-dto) [mapper](../GLOSSARY.md#mapper) | [Infrastructure](../GLOSSARY.md#infrastructure) | external representation |
| concrete construction | Composition | executable assembly |

Source references may point from [View](../GLOSSARY.md#view)/[Controller](../GLOSSARY.md#controller) or [ViewModel](../GLOSSARY.md#viewmodel) to their inward model/application contract. The represented [Model](../GLOSSARY.md#model) must not name concrete controls. In the strict layering convention here, [Presentation](../GLOSSARY.md#presentation-layer) cannot import [Infrastructure](../GLOSSARY.md#infrastructure) or a container; [type-only imports](../GLOSSARY.md#type-only-import) count. Runtime state notifications are distinct from these source references.

## 9. Naming

Use **[Naming and File Placement Conventions](../conventions/naming-and-file-placement.md)**.

For React specifically, official React guidance requires:

- component names to start with a capital letter;
- [custom Hook](../GLOSSARY.md#custom-hook) names to start with `use` followed by a capitalized word.

Recommended examples:

| Role | Example |
| --- | --- |
| [View](../GLOSSARY.md#view) | `OrdersPage.tsx`, `OrderRow.tsx` |
| public [ViewModel](../GLOSSARY.md#viewmodel) hook | `useOrders.ts` |
| [selector](../GLOSSARY.md#selector) | `orders.selectors.ts` |
| state binding | `orders.bindings.ts` |
| application operation | `cancelOrder.ts` |

The suffixes such as `.selectors.ts` are documentation conventions, not React or [MVVM](../GLOSSARY.md#model-view-viewmodel-mvvm) requirements.

## 10. First feature end to end

Requirement:

> The Orders screen lets a user cancel an order and displays pending/error state. Shipped orders must not be cancelled.

| Artifact | File | Owner | Why |
| --- | --- | --- | --- |
| button/row rendering | `presentation/features/orders/ui/OrderRow.tsx` | [View](../GLOSSARY.md#view) | renders and forwards intent |
| `busy`, error and `cancel()` command | `presentation/features/orders/model/useOrders.ts` | [ViewModel](../GLOSSARY.md#viewmodel) | state/behavior exists for the [View](../GLOSSARY.md#view) |
| shared [store](../GLOSSARY.md#store) [selector](../GLOSSARY.md#selector) if needed | `presentation/features/orders/model/orders.selectors.ts` | [Presentation](../GLOSSARY.md#presentation-layer) | derives client view state |
| cancellation workflow | `application/orders/use-cases/cancelOrder.ts` | [Application](../GLOSSARY.md#application-layer) | policy-bearing operation |
| cancellation [invariant](../GLOSSARY.md#invariant) | `domain/orders/Order.ts` | [Domain](../GLOSSARY.md#domain) | business truth |
| HTTP persistence | `infrastructure/orders/HttpOrderRepository.ts` | [Infrastructure](../GLOSSARY.md#infrastructure) | technical I/O |

```mermaid
sequenceDiagram
    actor User
    participant View as OrderRow
    participant VM as useOrders
    participant UC as cancelOrder
    participant Domain as Order
    participant Repo as HttpOrderRepository

    User->>View: click Cancel
    View->>VM: cancel(orderId)
    VM->>VM: set pending view state
    VM->>UC: cancelOrder(orderId)
    UC->>Repo: findById(id)
    Repo-->>UC: Order and version
    UC->>Domain: cancel()
    UC->>Repo: save(order, version)
    UC-->>VM: result
    VM-->>View: updated view state
```

If the screen is tiny and no reusable/headless presentation behavior exists, using local component state directly can be simpler than inventing a [ViewModel](../GLOSSARY.md#viewmodel).

The table above gives a possible React adaptation. The implementation below uses a framework-neutral class and DOM binding; no hook is implied.

### Complete implementation with an explicit ViewModel

This framework-neutral example uses a class plus an explicit DOM binding, so no React Hook is implied. React equivalents can expose the same contract through an intentionally designed hook.

The business rule belongs in `domain/orders/Order.ts`; the operation, result, persistence failure and [port](../GLOSSARY.md#port) belong in `application/orders/cancelOrder.ts`. [DTO](../GLOSSARY.md#data-transfer-object-dto) validation/mapping and the concrete repository belong in `infrastructure/orders/HttpOrderRepository.ts`. [Presentation](../GLOSSARY.md#presentation-layer) owns gestures and feedback; `composition/bootstrap.ts` selects implementations. These are documentation conventions. A small file may contain cohesive contracts and functions; split them when ownership or change pressure requires it.

```ts
// domain/orders/Order.ts
export type OrderStatus = 'pending' | 'shipped' | 'cancelled'
export class ShippedOrderCannotBeCancelled extends Error {}
export class Order {
  readonly id: string
  #status: OrderStatus
  constructor(id: string, status: OrderStatus) { this.id = id; this.#status = status }
  get status(): OrderStatus { return this.#status }
  cancel(): void {
    if (this.#status === 'shipped') throw new ShippedOrderCannotBeCancelled()
    this.#status = 'cancelled'
  }
}
```

```ts
// application/orders/cancelOrder.ts
import { Order, ShippedOrderCannotBeCancelled } from '../../domain/orders/Order'

export interface OrderRepository {
  findById(id: string): Promise<{ order: Order; version: string } | null>
  save(order: Order, expectedVersion: string): Promise<void>
}
export type CancelResult =
  | { ok: true; status: 'cancelled' }
  | { ok: false; reason: 'not-found' | 'shipped' | 'conflict' | 'unavailable' }
export type CancelOrder = (id: string) => Promise<CancelResult>
export class PersistenceFailure extends Error {
  readonly reason: 'conflict' | 'unavailable'
  constructor(reason: 'conflict' | 'unavailable') { super(reason); this.reason = reason }
}
export function makeCancelOrder(orders: OrderRepository): CancelOrder {
  return async id => {
    try {
      const loaded = await orders.findById(id)
      if (!loaded) return { ok: false, reason: 'not-found' }
      loaded.order.cancel()
      await orders.save(loaded.order, loaded.version)
      return { ok: true, status: 'cancelled' }
    } catch (error) {
      if (error instanceof ShippedOrderCannotBeCancelled) return { ok: false, reason: 'shipped' }
      if (error instanceof PersistenceFailure) return { ok: false, reason: error.reason }
      throw error // programming defects are not normal business outcomes
    }
  }
}
```

```ts
// infrastructure/orders/HttpOrderRepository.ts
import { Order, type OrderStatus } from '../../domain/orders/Order'
import { PersistenceFailure, type OrderRepository } from '../../application/orders/cancelOrder'

// Adapter-owned transport contract. A concrete fetch driver implements it.
export interface OrderTransport {
  get(path: string): Promise<{ data: unknown; version: string } | null>
  put(path: string, data: unknown, version: string): Promise<void>
}
type ApiOrderDto = { id: string; status: OrderStatus }
function parseOrderDto(data: unknown): ApiOrderDto {
  if (typeof data !== 'object' || data === null) throw new PersistenceFailure('unavailable')
  const dto = data as Record<string, unknown>
  if (typeof dto.id !== 'string' || !['pending', 'shipped', 'cancelled'].includes(String(dto.status))) {
    throw new PersistenceFailure('unavailable')
  }
  return { id: dto.id, status: dto.status as OrderStatus }
}
function toOrderDto(order: Order): ApiOrderDto { return { id: order.id, status: order.status } }

export class HttpOrderRepository implements OrderRepository {
  readonly #transport: OrderTransport
  constructor(transport: OrderTransport) { this.#transport = transport }
  async findById(id: string) {
    const response = await this.#transport.get('/orders/' + encodeURIComponent(id))
    if (!response) return null
    const dto = parseOrderDto(response.data)
    if (dto.id !== id) throw new PersistenceFailure('unavailable')
    return { order: new Order(dto.id, dto.status), version: response.version }
  }
  async save(order: Order, expectedVersion: string): Promise<void> {
    await this.#transport.put('/orders/' + encodeURIComponent(order.id), toOrderDto(order), expectedVersion)
  }
}
```

```ts
// presentation/orders/CancelOrderViewModel.ts
import type { CancelOrder } from '../../application/orders/cancelOrder'
export class CancelOrderViewModel {
  busy = false
  message = ''
  readonly #cancelOrder: CancelOrder
  readonly #listeners = new Set<() => void>()
  constructor(cancelOrder: CancelOrder) { this.#cancelOrder = cancelOrder }
  subscribe(listener: () => void) {
    this.#listeners.add(listener)
    return () => { this.#listeners.delete(listener) }
  }
  #changed() { for (const listener of this.#listeners) listener() }
  async cancel(id: string) {
    if (this.busy) return
    this.busy = true; this.message = ''; this.#changed()
    try {
      const result = await this.#cancelOrder(id)
      this.message = result.ok ? 'Cancelled' : 'Cannot cancel: ' + result.reason
    } catch { this.message = 'Unexpected failure' }
    finally { this.busy = false; this.#changed() }
  }
}
```

```ts
// presentation/orders/OrderView.ts
import type { CancelOrderViewModel } from './CancelOrderViewModel'
export function mountOrderView(root: HTMLElement, id: string, vm: CancelOrderViewModel) {
  const button = document.createElement('button')
  button.textContent = 'Cancel order'
  const feedback = document.createElement('p')
  feedback.setAttribute('role', 'status')
  root.append(button, feedback)
  const render = () => {
    button.disabled = vm.busy
    feedback.textContent = vm.busy ? 'Cancelling…' : vm.message
  }
  const onClick = () => { void vm.cancel(id) }
  const unsubscribe = vm.subscribe(render)
  button.addEventListener('click', onClick)
  render()
  return () => {
    unsubscribe(); button.removeEventListener('click', onClick)
    button.remove(); feedback.remove()
  }
}
```

```ts
// composition/bootstrap.ts
import { makeCancelOrder, PersistenceFailure } from '../application/orders/cancelOrder'
import { HttpOrderRepository, type OrderTransport } from '../infrastructure/orders/HttpOrderRepository'
import { CancelOrderViewModel } from '../presentation/orders/CancelOrderViewModel'
import { mountOrderView } from '../presentation/orders/OrderView'

async function request(path: string, init?: RequestInit): Promise<Response> {
  try { return await fetch(path, init) }
  catch { throw new PersistenceFailure('unavailable') }
}
const transport: OrderTransport = {
  async get(path) {
    const response = await request(path)
    if (response.status === 404) return null
    const version = response.headers.get('ETag')
    if (!response.ok || !version) throw new PersistenceFailure('unavailable')
    try { return { data: await response.json(), version } }
    catch { throw new PersistenceFailure('unavailable') }
  },
  async put(path, data, version) {
    const response = await request(path, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'If-Match': version },
      body: JSON.stringify(data),
    })
    if (response.status === 409 || response.status === 412) throw new PersistenceFailure('conflict')
    if (!response.ok) throw new PersistenceFailure('unavailable')
  },
}
export function startOrders(root: HTMLElement, orderId: string) {
  const cancelOrder = makeCancelOrder(new HttpOrderRepository(transport))
  return mountOrderView(root, orderId, new CancelOrderViewModel(cancelOrder))
}
```

Call `startOrders(root, 'order-1')`; dispose the returned binding when the screen is removed.

The API must return a strong ETag on GET and atomically enforce `If-Match` on PUT. It must authorize cancellation and reject shipped orders using authoritative current state; client validation alone cannot guarantee this under concurrent writes. This is a complete client feature, not a backend implementation. See [the expanded walkthrough](../clean-architecture/4-building-a-feature.md) for boundary explanations and limits.

## 11. Testing

| Scope | What to test |
| --- | --- |
| [ViewModel](../GLOSSARY.md#viewmodel) | view state derivation, commands, result mapping without DOM where possible |
| [View](../GLOSSARY.md#view) | rendering and gesture forwarding |
| [Application](../GLOSSARY.md#application-layer)/[Domain](../GLOSSARY.md#domain) | policy independently of [MVVM](../GLOSSARY.md#model-view-viewmodel-mvvm) |
| [Infrastructure](../GLOSSARY.md#infrastructure) | transport/persistence independently of [MVVM](../GLOSSARY.md#model-view-viewmodel-mvvm) |
| End-to-end | critical user journey |

The point of a [ViewModel](../GLOSSARY.md#viewmodel) boundary is that presentation behavior can be tested without needing concrete UI controls.

See **[Testing in MVVM](./4-testing-in-mvvm.md)**.

## 12. Trade-offs and failure modes

Costs:

- another abstraction between [View](../GLOSSARY.md#view) and application/model;
- possible duplication between local component state and [ViewModel](../GLOSSARY.md#viewmodel) state;
- temptation to move every operation into one [facade](../GLOSSARY.md#facade-pattern).

Common failures:

- **God [ViewModel](../GLOSSARY.md#viewmodel)** — unrelated workflows accumulate in one hook/class;
- **domain leakage** — business [invariants](../GLOSSARY.md#invariant) move into [selectors](../GLOSSARY.md#selector)/computed values;
- **transport leakage** — HTTP/SDK status codes become the [ViewModel](../GLOSSARY.md#viewmodel)'s public language;
- **[store](../GLOSSARY.md#store) leakage** — components must understand Redux actions/[thunk](../GLOSSARY.md#thunk) lifecycle even though the [ViewModel](../GLOSSARY.md#viewmodel) is supposed to hide them;
- **pass-through [ViewModel](../GLOSSARY.md#viewmodel)** — an abstraction exists but adds no useful ownership boundary;
- **framework relabeling** — every React hook is called a [ViewModel](../GLOSSARY.md#viewmodel) regardless of responsibility.

<a id="contents"></a>

<a id="where-to-start"></a>

## 13. Learning path

1. **[The Three Parts](./1-the-three-parts.md)**
2. **[Binding](./2-the-binding.md)**
3. **[MVVM on the Frontend](./3-mvvm-on-the-frontend.md)**
4. **[Testing](./4-testing-in-mvvm.md)**
5. **[React + Redux Toolkit](./5-mvvm-in-react-redux.md)**

For broader frontend feature/state organization, continue with **[Frontend Architecture](../frontend/README.md)**.

## Sources

- Martin Fowler, *[Presentation Model](../GLOSSARY.md#presentation-model)*: https://martinfowler.com/eaaDev/PresentationModel.html
- Martin Fowler, *GUI Architectures*: https://martinfowler.com/eaaDev/uiArchs.html
- Microsoft, *WPF Apps With The [Model-View-ViewModel](../GLOSSARY.md#model-view-viewmodel-mvvm) Design Pattern*: https://learn.microsoft.com/en-us/archive/msdn-magazine/2009/february/patterns-wpf-apps-with-the-model-view-viewmodel-design-pattern
- React, [custom Hook](../GLOSSARY.md#custom-hook) naming: https://react.dev/learn/reusing-logic-with-custom-hooks
