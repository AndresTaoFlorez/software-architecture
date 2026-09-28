> **[Model-View-ViewModel](README.md)** › [MVVM](../GLOSSARY.md#model-view-viewmodel-mvvm) in React + Redux Toolkit. Full reference list: [References](references.md).

# 5. MVVM in React + Redux Toolkit

React and Redux Toolkit do not prescribe [MVVM](../GLOSSARY.md#model-view-viewmodel-mvvm). This chapter demonstrates **one optional mapping** when a project intentionally uses a [ViewModel](../GLOSSARY.md#viewmodel)/[Presentation](../GLOSSARY.md#presentation-layer) facade boundary.

For the repository's current Redux guidance, also read **[State Management and Side Effects](../frontend/state-management.md)**.

---

## 5.1 The mapping, in RTK vocabulary

A possible mapping:

| [MVVM](../GLOSSARY.md#model-view-viewmodel-mvvm) role | React/Redux owner |
| --- | --- |
| [View](../GLOSSARY.md#view) | React component rendering + local rendering concerns |
| [ViewModel](../GLOSSARY.md#viewmodel) facade | feature hook such as `useClosures()` |
| shared view state | Redux slice + [selectors](../GLOSSARY.md#selector) |
| binding | React Redux subscriptions/hooks, hidden or exposed according to project policy |
| [Model](../GLOSSARY.md#model)/[Application](../GLOSSARY.md#application-layer) | inner application/domain modules where the chosen architecture defines them |

This is not the only valid Redux architecture.

Redux's official guidance commonly allows components to use typed Redux hooks directly. Hiding Redux behind a feature facade is a **stricter project boundary** that can be valuable when framework replaceability/test seams justify it.

---

<a id="52-rtk-query-sits-at-the-infrastructure-seam"></a>

## 5.2 RTK Query and the infrastructure seam

[RTK Query](../GLOSSARY.md#rtk-query) is Redux Toolkit's [server-state](../GLOSSARY.md#server-state) fetching/caching solution.

Its architectural placement depends on what the operation means.

### Server-state dominant query

If a [View](../GLOSSARY.md#view) mainly needs cached remote data, invalidation and re-fetching:

```mermaid
flowchart LR
    V["View / feature"] --> Q["RTK Query"] --> S["Server"]
```

may be entirely appropriate.

### Policy-bearing operation

If the operation contains application policy or must remain transport-independent:

```mermaid
flowchart LR
    V["View"] --> VM["ViewModel / Presentation adapter"] --> A["Application use case"] --> P["Port"]
    I["Infrastructure adapter"] --> P
```

Do not label [RTK Query](../GLOSSARY.md#rtk-query) universally "[Infrastructure](../GLOSSARY.md#infrastructure)" merely because it performs HTTP. Its generated hooks and cache participate directly in Redux/[Presentation](../GLOSSARY.md#presentation-layer), while endpoint definitions contain transport knowledge. In a strict layered system you may wrap or isolate that transport knowledge; in a simpler application you may intentionally keep the query mechanism in [Presentation](../GLOSSARY.md#presentation-layer).

Document the chosen boundary.

---

## 5.3 The use-case layer is added by Clean/Onion, not Redux or MVVM

Redux Toolkit does not require an [Application layer](../GLOSSARY.md#application-layer). [MVVM](../GLOSSARY.md#model-view-viewmodel-mvvm) does not require one either.

A Clean/Onion project may deliberately add:

```mermaid
flowchart LR
    R["Redux thunk / binding"] --> U["Application use case"] --> P["Application port"]
    I["Infrastructure adapter"] --> P
```

because application policy deserves an independent boundary.

For a simple UI-only state transition, Redux can handle it directly without inventing a [use case](../GLOSSARY.md#use-case).

The rule is proportionality.

---

## 5.4 Selectors reshape Presentation state

[Selectors](../GLOSSARY.md#selector) are appropriate for derived state:

```ts
export const selectVisibleOrders = createSelector(
  [selectOrders, selectFilters],
  (orders, filters) => filterOrders(orders, filters),
)
```

Keep business [invariants](../GLOSSARY.md#invariant) out of [selectors](../GLOSSARY.md#selector).

Good [selector](../GLOSSARY.md#selector) logic:

- filtering for display;
- sorting for display;
- aggregate counts for a dashboard;
- UI flags derived from stored state.

Move authoritative business rules inward when they must be consistent across interfaces.

---

## 5.5 Public facade example

A strict [ViewModel](../GLOSSARY.md#viewmodel)-style boundary:

```ts
export function useOrders() {
  const state = useOrdersState()
  const actions = useOrdersActions()

  return {
    rows: state.visibleRows,
    busy: state.busy,
    cancel: actions.cancel,
  }
}
```

`useOrdersActions()` can convert Redux-specific action outcomes into semantic results:

```ts
type Result<T, E> =
  | { ok: true; value: T }
  | { ok: false; error: E }
```

The [View](../GLOSSARY.md#view) should not need `cancelOrderThunk.fulfilled.match(...)` if the facade's purpose is to hide Redux.

---

## 5.6 Do not force everything through Redux

Local component state remains appropriate for:

- modal open/closed;
- hover/focus;
- temporary text input;
- state used by one component subtree.

Redux recommends keeping [global state](../GLOSSARY.md#global-state) minimal and deriving values where possible.

A [ViewModel](../GLOSSARY.md#viewmodel) facade may compose local React state and Redux-backed feature state without pretending they are the same ownership scope.

## Sources

- Redux Style Guide: https://redux.js.org/style-guide/
- Redux Toolkit, [RTK Query](../GLOSSARY.md#rtk-query): https://redux-toolkit.js.org/rtk-query/overview
- React Redux hooks: https://react-redux.js.org/api/hooks
- Martin Fowler, [Presentation Model](../GLOSSARY.md#presentation-model): https://martinfowler.com/eaaDev/PresentationModel.html
