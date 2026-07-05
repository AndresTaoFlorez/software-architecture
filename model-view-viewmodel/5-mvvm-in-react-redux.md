> **[Model-View-ViewModel](README.md)** › MVVM in React + Redux Toolkit. Full reference list: [References](references.md).

## 5. MVVM in React + Redux Toolkit

[MVVM on the Frontend](3-mvvm-on-the-frontend.md) places the roles generically: stores and hooks
are ViewModels, components are Views. This page pins that mapping to one concrete stack — React
with Redux Toolkit and RTK Query — because it is the stack where the pattern's seams are easiest
to miss: the store doubles as an HTTP client, and idiomatic Redux ships without the application
layer that [§3.3](3-mvvm-on-the-frontend.md#33-how-mvvm-sits-inside-onion-and-clean) tells
commands to call. Both are resolvable — but only deliberately.

---

### 5.1 The mapping, in RTK vocabulary

| MVVM role | RTK home |
|---|---|
| **Model** | framework-free domain modules — in a layered app, the inner rings, unchanged |
| **ViewModel — shared half** | slices holding cross-screen display state, plus memoized selectors |
| **ViewModel — local half** | one custom hook per screen (`useCartViewModel()`): local flags + commands |
| **Commands** | the functions that hook exposes — dispatches, and calls inward |
| **Binding** | `useSelector` subscriptions and React's re-render — the narrowed write path of [§2.3](2-the-binding.md#23-two-way-binding-one-way-flow--both-are-mvvm) |

Redux's own style guide pushes in this direction without using the word: logic out of components,
into reducers and selector functions [Redux Style Guide]. What MVVM adds is a *name* for where the
extracted logic lives — and the prohibitions of [§1.3](1-the-three-parts.md#13-viewmodel) that
keep it presentation-sized.

---

### 5.2 RTK Query sits at the infrastructure seam

RTK Query is "a powerful data fetching and caching tool" [Redux Toolkit, RTK Query] that lives
*inside the store* and is consumed through *generated hooks*. That makes it two things at once: a
reactive cache participating in binding — ViewModel territory — and an HTTP client, which the
third prohibition of [§3.3](3-mvvm-on-the-frontend.md#33-how-mvvm-sits-inside-onion-and-clean)
forbids the ViewModel to reach. The resolution is to split it along exactly that line:

- **Endpoint definitions are Infrastructure.** They encode transport — URLs, methods, payload
  shapes — ideally generated from the API contract. Wherever the folders live, they are an
  adapter and belong with the adapters.
- **The generated hooks are binding machinery.** Like `computed` or `useSelector`, they are the
  framework's code, not yours ([§4.3](4-testing-in-mvvm.md#43-commands-test-the-seam-fakes-fill-it)).
  A ViewModel hook may consume a **query** hook to obtain display state.
- **Mutations that carry business meaning are commands.** Inside Clean/Onion, a command body is a
  use-case call ([§3.3](3-mvvm-on-the-frontend.md#33-how-mvvm-sits-inside-onion-and-clean)) — not
  a bare `useSomeMutation()` fired from JSX.

One discipline makes the split hold: **components never import generated hooks.** The screen's
ViewModel hook wraps them and exposes one object — display state plus commands — so the View
binds to a ViewModel, never to the transport.

---

### 5.3 The use-case layer is added, not inherited

In standalone MVVM a command may manipulate the Model directly
([§3.3](3-mvvm-on-the-frontend.md#33-how-mvvm-sits-inside-onion-and-clean)), and standalone Redux
agrees: the style guide routes logic through reducers and thunks, and no application layer exists
unless you build one [Redux Style Guide]. Inside Clean or Onion, that layer is a **deliberate
addition** — plain use-case modules, framework-free, called by commands, defended by an
import-boundary lint. Nothing in RTK scaffolds it, and nothing in RTK objects when it erodes.
Skip it, and orchestration silts into thunks: a fat ViewModel
([§3.2](3-mvvm-on-the-frontend.md#32-the-failure-mode-the-fat-viewmodel)) distributed across the
store.

---

### 5.4 Selectors are where reshape lives

`createSelector` is the reshape instrument: formatting, filtering-for-display, deriving flags —
the style guide's "Use Selector Functions to Read from Store State", applied with MVVM's boundary
[Redux Style Guide]. It is also where domain rules leak most quietly, because a selector is
exactly as convenient as a `computed`. The
[§3.2](3-mvvm-on-the-frontend.md#32-the-failure-mode-the-fat-viewmodel) test applies per line:
*would this still be true if the app had no screens?* Price math — inward. "Format that price for
this locale" — selector, correctly placed.

---

### 5.5 The §3.1 example, restated

```js
// ViewModel, shared half — a slice for cross-screen display state, a selector for reshape.
const cartUi = createSlice({
  name: 'cartUi',
  initialState: { isAdding: false },
  reducers: {
    addStarted: s => { s.isAdding = true },
    addSettled: s => { s.isAdding = false },
  },
})

const selectFormattedTotal = createSelector(
  selectCartTotal,                                   // computed by the inner rings
  total => currency.format(total)                    // reshape only — no price math here
)
```

```js
// ViewModel, local half — the hook the screen binds to. No JSX, no DOM.
export function useCartViewModel() {
  const { addToCart } = useDeps()                    // use case, injected at composition
  const dispatch = useDispatch()
  const isAdding = useSelector(s => s.cartUi.isAdding)
  const formattedTotal = useSelector(selectFormattedTotal)

  async function addItem(productId) {                // command: one use-case call
    dispatch(cartUi.actions.addStarted())
    try { await addToCart({ productId, qty: 1 }) }
    finally { dispatch(cartUi.actions.addSettled()) }
  }

  return { isAdding, formattedTotal, addItem }
}
```

```jsx
// The View: consumes the ViewModel, contributes nothing but markup.
function CartTotal({ productId }) {
  const vm = useCartViewModel()
  return (
    <>
      <p className="total">{vm.formattedTotal}</p>
      <button disabled={vm.isAdding} onClick={() => vm.addItem(productId)}>Add</button>
    </>
  )
}
```

---

### 5.6 Testing: the RTK dividend, and one React tax

Slice reducers and selectors are plain functions — they test at the Model tier of
[the pyramid](4-testing-in-mvvm.md#45-the-pyramid-restated-for-mvvm), no harness at all. The
ViewModel hook carries one tax Vue composables did not: React hooks only run inside a component,
so the headless test needs `renderHook` — a minimal harness, not a rendered screen
[Testing Library]. The test still reads act-then-look, with a fake use case at the seam
([§4.3](4-testing-in-mvvm.md#43-commands-test-the-seam-fakes-fill-it)):

```js
test('addItem exposes a busy flag while the add is in flight', async () => {
  const addToCart = vi.fn(() => new Promise(r => setTimeout(r)))   // fake use case
  const { result } = renderHook(() => useCartViewModel(), {
    wrapper: makeWrapper({ store, deps: { addToCart } }),
  })

  let pending
  act(() => { pending = result.current.addItem('sku-1') })
  expect(result.current.isAdding).toBe(true)         // what the View would show now

  await act(() => pending)
  expect(result.current.isAdding).toBe(false)
  expect(addToCart).toHaveBeenCalledWith({ productId: 'sku-1', qty: 1 })
})
```

---

Back to the **[MVVM index](README.md)** · See the full **[References](references.md)**.
