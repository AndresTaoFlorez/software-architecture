# Advanced frontend Exercises

Refactor code whose responsibilities have become mixed. Start with the supplied excerpt, preserve the requested behavior and compare your changes with the separate concrete solutions.

**Contents**

- [F-A1 — Remove a capability deep import](#f-a1--remove-a-capability-deep-import)
- [F-A2 — Split a God Hook](#f-a2--split-a-god-hook)
- [F-A3 — Recover a browser draft](#f-a3--recover-a-browser-draft)

## F-A1 — Remove a capability deep import

**What you already know.** Read Module Boundaries.

**Situation.** A Tickets Page imports Scheduling's private agenda selector.

**Terms you need.** Public API, deep import and capability ownership.

**Starting code.** Imports refer to the canonical guide modules; this excerpt deliberately shows the problem.

```ts
// Tickets depends on Scheduling's private state layout.
import { selectAgendaInternal } from '@/presentation/scheduling/state/internalSelectors'
export function ticketAppointments() { return selectAgendaInternal() }
```

**Task.** Define or reuse the narrow supported Scheduling contract and replace the deep import.

**Questions.** Should all state be exported? Does a type-only import make private ownership irrelevant?

**Expected result.** Tickets imports a purpose-specific public Scheduling reader. Scheduling can change internal state or operation wiring without exposing every selector or appointment field.

**Relevant handbook sections.** [Read the guide](../../foundations/module-boundaries-and-public-apis.md).

## F-A2 — Split a God Hook

**What you already know.** Read [mixed Hook responsibilities](../presentation-architecture.md#avoid-the-god-viewmodel) and the HTTP integration.

**Situation.** useAgenda fetches JSON, casts its [DTO](../../../GLOSSARY.md#data-transfer-object-dto), checks business eligibility, selects appointments and formats dates.

**Terms you need.** God Hook, [Parser](../../../GLOSSARY.md#parser), [Mapper](../../../GLOSSARY.md#mapper), [Domain](../../../GLOSSARY.md#domain) rule and Formatter.

**Starting code.** Imports refer to the canonical guide modules; this excerpt deliberately shows the problem.

```tsx
import { useState } from 'react'
interface ApiAppointment { appointment_id: string; start_time: string; minutes: number }
export function useAgenda(day: string) {
  const [labels, setLabels] = useState<string[]>([])
  async function load() {
    const rows = await (await fetch('/agenda?day=' + day)).json() as ApiAppointment[]
    setLabels(rows.filter(row => row.minutes >= 20)
      .map(row => new Date(row.start_time).toLocaleTimeString()))
  }
  return { labels, load }
}
```

**Task.** Refactor the code, assign exact owners and keep the Hook's useful screen contract.

**Questions.** Which changes with the wire protocol? Which changes with locale? Which changes with business policy?

**Expected result.** Unknown API data is checked before mapping. The Hook uses the supplied operation, selection stays in screen state and time formatting belongs to [Presentation](../../../GLOSSARY.md#presentation-layer). No copied duration rule or fetch call remains in the Hook.

**Relevant handbook sections.** [Read the guide](../presentation-architecture.md#avoid-the-god-viewmodel).

## F-A3 — Recover a browser draft

**What you already know.** Read [browser persistence](../state-management.md#browser-persistence-is-an-external-detail).

**Situation.** An analyst must recover an unfinished agenda draft after leaving the screen. A reducer currently writes JSON directly to sessionStorage.

**Terms you need.** [Application](../../../GLOSSARY.md#application-layer)-owned storage port, side effect and browser implementation.

**Starting code.** Imports refer to the canonical guide modules; this excerpt deliberately shows the problem.

```ts
// The reducer performs browser I/O while calculating state.
interface Draft { day: string; note: string }
export function reduceDraft(state: Draft, next: Draft) {
  sessionStorage.setItem('agenda-draft', JSON.stringify(next))
  return next
}
```

**Task.** Place the contract, operation, implementation, stored-data parser and startup wiring. Explain delivery failure feedback.

**Questions.** Why is recovery an Application capability here? Who interprets malformed saved JSON?

**Expected result.** Saving/recovering works through an injected storage contract. A missing saved draft returns null; malformed JSON and denied reads/writes produce safe failure feedback. The reducer performs no browser calls.

**Relevant handbook sections.** [Read the guide](../state-management.md#browser-persistence-is-an-external-detail).

[Exercise route](README.md) · [Solutions](solutions.md)
