# State Management and Side Effects

State management is not a layer of Clean or Onion Architecture. It is a Presentation mechanism.

The first design question is not "which store?". It is **who owns this state and why does it need to live?**

---

## 1. Classify state before choosing a mechanism

A practical default:

| State | Typical owner |
| --- | --- |
| ephemeral component interaction | local component state |
| route/page-only transient state | Page or route state |
| shared client feature state | feature store/slice |
| derived values | selector / computed value |
| remote cache | server-state/query mechanism |
| application workflow policy | Application use case |
| durable browser persistence | storage adapter + controlled side effect |

Examples:

```text
Is a modal open?
-> local UI state

Which closure rows are selected across sibling components?
-> feature state

Filtered rows derived from filters + source rows?
-> selector; do not duplicate in state

Cached GET /cases response with invalidation/revalidation?
-> server-state mechanism when no application policy is bypassed

May this judicial closure execute?
-> Application/Domain policy, not a Redux reducer
```

Redux's official style guide recommends keeping global state minimal, deriving additional values, and keeping most form state local unless sharing it globally has a concrete benefit.

---

## 2. Keep a feature's state logic together

For a simple Redux Toolkit feature, one slice file may be enough:

```text
model/
└── auth.slice.ts
```

Redux Toolkit intentionally encourages colocating reducer logic and generated actions in `createSlice`.

As complexity grows, split by responsibility **inside the feature**, not back into application-wide technical folders:

```text
features/closures/model/
├── closures.slice.ts
├── closures.selectors.ts
├── closures.thunks.ts
├── closures.listeners.ts
├── closures.bindings.ts
└── useClosures.ts
```

This is a scaling technique, not a mandatory template. A five-line feature does not need six files.

---

## 3. Reducers are pure state transitions

Reducers should calculate next state from previous state + action.

They should not:

- perform HTTP calls;
- write to `localStorage` / `sessionStorage`;
- start timers;
- read random/global mutable state;
- manipulate the DOM.

Redux's style guide requires reducers to be free of side effects.

---

## 4. Selectors own derivation

Do not store data that can be reliably calculated from existing state.

Bad:

```ts
state.rows = rows
state.filteredRows = rows.filter(...)
state.filteredCount = state.filteredRows.length
```

Better:

```ts
export const selectFilteredRows = createSelector(
  [selectRows, selectFilters],
  (rows, filters) => applyFilters(rows, filters),
)

export const selectFilteredCount = createSelector(
  [selectFilteredRows],
  rows => rows.length,
)
```

Memoize selectors when derivation is expensive or referential stability matters. Do not use memoization as decoration.

---

## 5. Thunks: one-shot asynchronous orchestration

Redux recommends thunks for imperative async logic that needs `dispatch`/`getState`.

In a layered application, thunks are a useful Presentation adapter around Application operations:

```ts
export const executeClosureThunk = createAsyncThunk<
  ClosureResult,
  ExecuteClosureCommand,
  ThunkConfig
>(
  'closures/execute',
  async (command, { extra, rejectWithValue }) => {
    try {
      return await extra.executeClosure(command)
    } catch (error) {
      return rejectWithValue(toPresentationError(error))
    }
  },
)
```

The concrete infrastructure dependency is assembled at the Composition Root and injected through thunk `extraArgument`. Redux Toolkit supports this directly.

Do not import `HttpClosureGateway` from a thunk.

---

## 6. Listener middleware: reactive workflows and persistence

When behavior reacts to actions/state over time, Redux Toolkit's listener middleware is usually a better fit than putting store synchronization into a React effect.

Example:

```ts
startAppListening({
  matcher: isAnyOf(
    closureDraftChanged,
    closureSelectionChanged,
  ),
  effect: async (_, api) => {
    const draft = selectClosureDraft(api.getState())
    await api.extra.draftStorage.save(draft)
  },
})
```

Good listener use cases include:

- persistence after state changes;
- debounced workflows;
- reacting to multiple actions;
- timers/delays tied to store events;
- coordinating state-driven side effects.

A persistence adapter still owns browser storage details.

---

## 7. Browser persistence is an external detail

Do not let a slice become the browser storage adapter:

```ts
// Avoid inside the reducer/slice module as the persistence mechanism:
window.sessionStorage.setItem(KEY, JSON.stringify(state))
```

Prefer an explicit adapter:

```ts
export interface ClosureDraftStorage {
  load(): Promise<ClosureDraft | null>
  save(draft: ClosureDraft): Promise<void>
  clear(): Promise<void>
}
```

with a browser implementation:

```text
SessionStorageClosureDraftStorage
```

Depending on the application's boundary policy, the port can live in Application or the persistence contract can remain entirely inside Presentation if the draft itself is purely UI state. What matters is that browser I/O is not hidden inside a pure state transition.

---

## 8. Bindings isolate the state library when the project needs that boundary

A strict Presentation architecture can keep React Redux behind feature bindings:

```ts
export function useClosuresState() {
  return useAppSelector(selectClosuresViewState)
}

export function useClosuresActions() {
  const dispatch = useAppDispatch()

  return useMemo(() => ({
    async query(input: QueryInput): Promise<Result<QueryResult, UiError>> {
      const action = await dispatch(queryClosuresThunk(input))

      if (queryClosuresThunk.fulfilled.match(action)) {
        return { ok: true, value: action.payload }
      }

      return {
        ok: false,
        error: normalizeUiError(action.payload ?? action.error),
      }
    },
  }), [dispatch])
}
```

Then `useClosures()` consumes semantic operations, not `fulfilled.match`, `dispatch` or action creators.

This boundary is optional. For smaller applications, direct typed `useSelector`/`useDispatch` in components is a valid Redux style.

---

## 9. Server state vs. application policy

Redux Toolkit recommends RTK Query as the default Redux solution for data fetching/caching.

That does not mean every server call should bypass Application.

### Server-state dominant operation

If a screen only needs cached remote data, with invalidation/refetch but little application policy:

```text
View
-> query adapter
-> API
```

RTK Query, TanStack Query or another server-state library may be enough.

### Policy-bearing operation

If an operation validates business/application rules, coordinates multiple capabilities, has authorization policy or must stay independent of transport:

```text
View
-> Presentation adapter
-> Application use case
-> port
-> Infrastructure adapter
```

Use the architecture because it protects something meaningful, not to wrap every GET request in ceremony.

---

## 10. Forms are not global state by default

Redux recommends keeping most form state outside Redux.

Prefer local/form-library state when:

- only one form owns it;
- no other feature needs it;
- it can be discarded with the screen.

Promote state when there is a real requirement such as:

- multi-step cross-route workflow;
- draft recovery;
- collaborative editing;
- multiple distant consumers;
- navigation that must preserve progress.

---

## 11. React effects are synchronization tools

React describes Effects as a way to synchronize a component with an external system.

Do not use an Effect merely to derive one piece of React state from another. Calculate derived state during rendering or in selectors.

If a side effect belongs to the store rather than the component lifecycle, middleware/listeners may be a better owner.

---

## 12. Memoization is not an architectural rule

Do not standardize "every callback uses `useCallback`" or "every derived value uses `useMemo`".

Use memoization when:

- a calculation is actually expensive;
- a stable identity is required by an API or memoized child;
- profiling shows meaningful benefit;
- the framework/compiler cannot safely optimize the case.

Modern React Compiler can automatically memoize many values/functions in compiled code, so manual memoization should remain intentional.

## Sources

- Redux Style Guide: https://redux.js.org/style-guide/
- Redux, "Side Effects Approaches": https://redux.js.org/usage/side-effects-approaches
- Redux Toolkit, `createAsyncThunk`: https://redux-toolkit.js.org/api/createAsyncThunk
- Redux Toolkit, listener middleware: https://redux-toolkit.js.org/api/createListenerMiddleware
- Redux Toolkit, RTK Query overview: https://redux-toolkit.js.org/rtk-query/overview
- React, "You Might Not Need an Effect": https://react.dev/learn/you-might-not-need-an-effect
- React, "Synchronizing with Effects": https://react.dev/learn/synchronizing-with-effects
- React Compiler: https://react.dev/learn/react-compiler/introduction
