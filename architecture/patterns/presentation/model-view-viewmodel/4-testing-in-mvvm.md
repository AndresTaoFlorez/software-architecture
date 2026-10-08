> **[Model-View-ViewModel](README.md)** › Testing.

## 4. Testing in MVVM

The [ViewModel](../../../../GLOSSARY.md#viewmodel) boundary lets tests exercise presentation behavior without concrete controls. Pure classes can be constructed directly; React Hooks must run inside a React harness.

### 4.1 The ViewModel tests headless

This Vitest test uses `CancelOrderViewModel` from [The Three Parts](1-the-three-parts.md). The controlled promise makes the pending state observable; a synchronous catalog lookup would not test that behavior.

```js
import { expect, test } from 'vitest'
import { CancelOrderViewModel } from './CancelOrderViewModel'

test('shows pending state and the application outcome', async () => {
  let complete
  const pending = new Promise(resolve => { complete = resolve })
  const vm = new CancelOrderViewModel(() => pending)
  const operation = vm.cancel('1')
  expect(vm.busy).toBe(true)
  complete({ ok: false, reason: 'shipped' })
  await operation
  expect(vm.busy).toBe(false)
  expect(vm.message).toBe('Cannot cancel: shipped')
})
```

Test duplicate command suppression, unexpected failure, notifications and disposal of listeners as separate requirements. There is no universal count or percentage of [ViewModel](../../../../GLOSSARY.md#viewmodel) tests.

### 4.2 The Model tests like a pure object

Test authoritative policy in its owner, independently of display text or framework rendering. See [Clean testing](../../../styles/clean-architecture/5-testing-in-clean.md) for the same cancellation rule and persistence precondition.

<a id="43-commands-test-the-seam-fakes-fill-it"></a>

### 4.3 Commands test the seam, substitutes fill it

A [stub](../../../../GLOSSARY.md#stub) supplies application outcomes; a [spy](../../../../GLOSSARY.md#spy) records command arguments; a [fake](../../../../GLOSSARY.md#fake) implements simplified application behavior. `vi.fn().mockResolvedValue(...)` is not automatically a fake.

For a React Hook, use `renderHook` and `act` from React Testing Library. Supply any required Provider and await async updates. Do not call `useOrders()` as an ordinary function or assert Vue-style `.value` on a React state value. Framework-neutral behavior can be extracted if that boundary improves clarity.

<a id="44-the-view-is-the-part-you-test-least"></a>

### 4.4 The View and binding need tests

Framework correctness does not prove that the feature binds the right property, forwards the right id, disables during a command, releases subscriptions or exposes accessible feedback. Test those behaviors through rendered controls. Also cover async completion after unmount and critical integrated journeys where applicable.

### 4.5 The pyramid, restated for MVVM

| Scope | What it establishes |
| --- | --- |
| [Model](../../../../GLOSSARY.md#model)/[Application](../../../../GLOSSARY.md#application-layer)/[Domain](../../../../GLOSSARY.md#domain) | business behavior independently of the screen |
| [ViewModel](../../../../GLOSSARY.md#viewmodel) | display derivation, commands, pending/error results |
| [View](../../../../GLOSSARY.md#view)/binding | rendered values, gestures, accessibility and lifetime |
| Integration/journey | concrete application/framework/transport wiring |

Use cost and risk to select coverage. Architecture checks complement behavior tests by enforcing the chosen source boundaries.

Next: **[MVVM in React + Redux Toolkit](5-mvvm-in-react-redux.md)**.

## Sources

- [Smith — WPF Apps With MVVM](https://learn.microsoft.com/en-us/archive/msdn-magazine/2009/february/patterns-wpf-apps-with-the-model-view-viewmodel-design-pattern)
- [Testing Library — renderHook](https://testing-library.com/docs/react-testing-library/api/#renderhook)
- [Fowler — Test Double](https://martinfowler.com/bliki/TestDouble.html)
