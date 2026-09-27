> **[Model-View-ViewModel](README.md)** › MVVM in React + Redux Toolkit. Full reference list: [References](references.md).

# 5. MVVM in React + Redux Toolkit

React and Redux Toolkit do not prescribe MVVM. This chapter demonstrates **one optional mapping** when a project intentionally uses a ViewModel/Presentation facade boundary.

For the repository's current Redux guidance, also read **[State Management and Side Effects](../frontend/state-management.md)**.

---

## 5.1 The mapping, in RTK vocabulary

A possible mapping:

| MVVM role | React/Redux owner |
| --- | --- |
| View | React component rendering + local rendering concerns |
| ViewModel facade | feature hook such as `useClosures()` |
| shared view state | Redux slice + selectors |
| binding | React Redux subscriptions/hooks, hidden or exposed according to project policy |
| Model/Application | inner application/domain modules where the chosen architecture defines them |

This is not the only valid Redux architecture.

Redux's official guidance commonly allows components to use typed Redux hooks directly. Hiding Redux behind a feature facade is a **stricter project boundary** that can be valuable when framework replaceability/test seams justify it.

---

<a id="52-rtk-query-sits-at-the-infrastructure-seam"></a>

## 5.2 RTK Query and the infrastructure seam

RTK Query is Redux Toolkit's server-state fetching/caching solution.

Its architectural placement depends on what the operation means.

### Server-state dominant query

If a View mainly needs cached remote data, invalidation and re-fetching:

```text
View / feature
-> RTK Query
-> server
```

may be entirely appropriate.

### Policy-bearing operation

If the operation contains application policy or must remain transport-independent:

```text
View
-> ViewModel/Presentation adapter
-> Application use case
-> port
-> Infrastructure adapter
```

Do not label RTK Query universally "Infrastructure" merely because it performs HTTP. Its generated hooks and cache participate directly in Redux/Presentation, while endpoint definitions contain transport knowledge. In a strict layered system you may wrap or isolate that transport knowledge; in a simpler application you may intentionally keep the query mechanism in Presentation.

Document the chosen boundary.

---

## 5.3 The use-case layer is added by Clean/Onion, not Redux or MVVM

Redux Toolkit does not require an Application layer. MVVM does not require one either.

A Clean/Onion project may deliberately add:

```text
Redux thunk/binding
-> application use case
-> application port
-> infrastructure adapter
```

because application policy deserves an independent boundary.

For a simple UI-only state transition, Redux can handle it directly without inventing a use case.

The rule is proportionality.

---

## 5.4 Selectors reshape Presentation state

Selectors are appropriate for derived state:

```ts
export const selectVisibleOrders = createSelector(
  [selectOrders, selectFilters],
  (orders, filters) => filterOrders(orders, filters),
)
```

Keep business invariants out of selectors.

Good selector logic:

- filtering for display;
- sorting for display;
- aggregate counts for a dashboard;
- UI flags derived from stored state.

Move authoritative business rules inward when they must be consistent across interfaces.

---

## 5.5 Public facade example

A strict ViewModel-style boundary:

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

The View should not need `cancelOrderThunk.fulfilled.match(...)` if the facade's purpose is to hide Redux.

---

## 5.6 Do not force everything through Redux

Local component state remains appropriate for:

- modal open/closed;
- hover/focus;
- temporary text input;
- state used by one component subtree.

Redux recommends keeping global state minimal and deriving values where possible.

A ViewModel facade may compose local React state and Redux-backed feature state without pretending they are the same ownership scope.

## Sources

- Redux Style Guide: https://redux.js.org/style-guide/
- Redux Toolkit, RTK Query: https://redux-toolkit.js.org/rtk-query/overview
- React Redux hooks: https://react-redux.js.org/api/hooks
- Martin Fowler, Presentation Model: https://martinfowler.com/eaaDev/PresentationModel.html
