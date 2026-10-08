# Intermediate frontend Exercises

Change a small working example. Each exercise supplies starting code, a requirement and an observable result; use the separate solutions after making your own attempt.

**Contents**

- [F-I1 — Compose a screen](#f-i1--compose-a-screen)
- [F-I2 — Move a rule out of React](#f-i2--move-a-rule-out-of-react)
- [F-I3 — Replace the reader](#f-i3--replace-the-reader)

## F-I1 — Compose a screen

**What you already know.** Read the Agenda Page excerpt and state guide.

**Situation.** AgendaPage needs a toolbar, calendar, cards, selected day and loading feedback.

**Terms you need.** Composition of Page/components, interaction Hook and feature State.

**Starting code.** Imports refer to the canonical guide modules; this excerpt deliberately shows the problem.

```tsx
// Starting excerpt: the screen constructs integration code and owns every job.
import { useState } from 'react'
export function AgendaPage() {
  const [day, setDay] = useState('2026-10-07')
  const [rows, setRows] = useState<unknown[]>([])
  async function load() {
    const response = await fetch('/agenda?day=' + day)
    setRows(await response.json())
  }
  return <button onClick={() => { setDay('2026-10-08'); void load() }}>
    Load {rows.length} appointments
  </button>
}
```

**Task.** Implement each connection, including how the Hook receives GetAgenda.

**Questions.** Where should selected-day behavior live? Who creates HttpAgendaReader?

**Expected result.** The Page receives GetAgenda, composes controls/calendar and shows loading/error feedback. Changing day loads that day; a slower previous request cannot replace the newest selection.

**Relevant handbook sections.** [Read the guide](../presentation-architecture.md#pages-compose-features-own-behavior).

## F-I2 — Move a rule out of React

**What you already know.** Read Code Placement's [Domain](../../../GLOSSARY.md#domain) example.

**Situation.** AppointmentCard decides that appointment duration must be at least 20 minutes, and another form copies that decision.

**Terms you need.** Business Rule and Architectural Ownership.

**Starting code.** Imports refer to the canonical guide modules; this excerpt deliberately shows the problem.

```ts
// Two callers repeat the same business requirement.
export function cardAllows(durationMinutes: number) {
  return durationMinutes >= 20
}
export function formAllows(durationMinutes: number) {
  return durationMinutes >= 20
}
```

**Task.** Give the rule one Domain owner and show how UI uses it through the relevant operation/result.

**Questions.** Which file changes for a 30-minute rule? Does client validation establish authoritative booking?

**Expected result.** 19 minutes is rejected and 20 accepted through the same domain guard. Both UI consumers receive the same result; changing the minimum to 30 requires one client rule edit.

**Relevant handbook sections.** [Read the guide](../../foundations/code-placement.md).

## F-I3 — Replace the reader

**What you already know.** Read required contracts and Composition.

**Situation.** A training screen needs agendas from process memory while the production screen uses HTTP.

**Terms you need.** AgendaReader, implementation and manual dependency injection.

**Starting code.** Imports refer to the canonical guide modules; this excerpt deliberately shows the problem.

```ts
import { GetAgenda } from '@/application/scheduling'
import type { AgendaReader } from '@/application/scheduling/ports/AgendaReader'

// Current composition accepts only the production reader.
export function productionAgenda(http: AgendaReader) {
  return new GetAgenda(http)
}
```

**Task.** Implement InMemoryAgendaReader and the composition change without editing GetAgenda or [Presentation](../../../GLOSSARY.md#presentation-layer).

**Questions.** What contract behavior must both readers fulfill? What does memory fail to establish about the real API?

**Expected result.** Training composition reads known process-memory appointments through the same operation. The screen and GetAgenda need no implementation-specific changes.

**Relevant handbook sections.** [Read the guide](../presentation-architecture.md#organize-by-ownership-not-only-by-technical-type).

[Exercise route](README.md) · [Solutions](solutions.md)
