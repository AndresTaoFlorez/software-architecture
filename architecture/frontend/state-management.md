# State Management and Side Effects

An agenda screen remembers the selected day and displays loading feedback. Those decisions belong to Presentation. Whether an appointment is eligible belongs to business policy, and loading its records belongs to an Application operation.

## 1. Assign state by responsibility

| Data or decision | Owner |
| --- | --- |
| Selected day, open panel, visible error | Presentation |
| Loading workflow and its result | Application |
| Appointment eligibility | Domain |
| HTTP response or browser storage format | Infrastructure |

**State** is data remembered between interactions. A store makes some state available to several consumers; local component state serves a narrower lifetime. Choose the smallest owner that satisfies the requirement.

## 2. Start with capability-owned state

`presentation/scheduling/state/agenda.state.ts` owns agenda interaction state. `presentation/scheduling/hooks/useAgenda.ts` connects it to the supplied operation. For a small screen, React local state can serve both without a state library.

Split selectors, actions or bindings inside that capability when they acquire independent responsibilities. See the [Presentation map](presentation-architecture.md).

## 3. Reducers are pure state transitions

A **reducer** calculates next state from previous state and an action. HTTP calls, browser storage writes and DOM changes are side effects: work observable outside that calculation. Keep those effects in a caller or effect mechanism.

## 4. Selectors own derivation

A **selector** reads or derives data from state. Calculate filtered appointments from records and the selected day rather than storing another independently updated copy.

Memoize a calculation when its cost or required reference stability justifies it.

## 5. Thunks: one-shot asynchronous orchestration

In Redux, a **thunk** can invoke the supplied Application operation and translate its result into loading/success/error actions. Composition injects the operation through the project's chosen mechanism.

The thunk owns UI orchestration; it does not construct an HTTP reader or duplicate business rules.

## 6. Listener middleware: reactive workflows and persistence

Redux Toolkit's listener middleware reacts to actions or state changes. Use it when an effect belongs to the store's workflow. It still calls an injected operation rather than becoming a storage implementation.

## 7. Browser persistence is an external detail

An analyst needs to recover an unfinished appointment draft after returning to the screen. Here draft recovery is an Application capability, so Application owns its required contract:

```ts
// src/application/scheduling/ports/AgendaDraftStorage.ts
export interface AgendaDraft {
  day: string
  note: string
}

export interface AgendaDraftStorage {
  load(): Promise<AgendaDraft | null>
  save(draft: AgendaDraft): Promise<void>
}
```

`application/scheduling/use-cases/SaveAgendaDraft.ts` coordinates saving. `infrastructure/browser/scheduling/adapters/SessionStorageAgendaDraftStorage.ts` implements the contract with browser storage. Its parser checks stored data; Composition supplies that implementation.

This design lets the operation use a memory implementation without importing `window`. A purely visual preference used only inside a component can instead stay in Presentation. A malformed saved draft or failed write is an integration failure that delivery must present appropriately.

## 8. Bindings isolate the state library when the project needs that boundary

A binding exposes semantic state/actions such as `appointments` and `selectDay`. Consumers then stay stable if the feature changes its state library. Direct typed Redux hooks are sufficient when this extra boundary protects no useful substitution.

## 9. Server state vs. application policy

**Server state** is remote data represented in the client. A query library can retrieve it for a simple display. When an operation coordinates business policy, keep that operation's protected contract and place HTTP translation outside it.

## 10. Forms are not global state by default

Keep a form local until another route or consumer needs its lifetime. Draft recovery can justify a longer-lived Application capability, as above.

## 11. React effects are synchronization tools

An Effect synchronizes a component with an external system. Derive display values during rendering or through selectors; use an Effect when external synchronization is required.

## 12. Memoization is not an architectural rule

Use `useMemo` or `useCallback` for a measured calculation or identity requirement. Their presence does not establish a responsibility boundary.

## Sources

- [Redux: style guide](https://redux.js.org/style-guide/)
- [Redux: side-effect approaches](https://redux.js.org/usage/side-effects-approaches)
- [Redux Toolkit: listener middleware](https://redux-toolkit.js.org/api/createListenerMiddleware)
- [React: You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)
