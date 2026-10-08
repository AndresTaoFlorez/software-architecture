# Frontend Exercise Solutions

Source paths below are relative to an application's `src/`. Imports reuse canonical guide modules. The intermediate and advanced answers show concrete changed code; framework bindings are identified where omitted.

**Contents**

- [F-E1 — Place agenda interaction](#f-e1--place-agenda-interaction)
- [F-E2 — State or business responsibility?](#f-e2--state-or-business-responsibility)
- [F-E3 — Receive an API response](#f-e3--receive-an-api-response)
- [F-I1 — Compose a screen](#f-i1--compose-a-screen)
- [F-I2 — Move a rule out of React](#f-i2--move-a-rule-out-of-react)
- [F-I3 — Replace the reader](#f-i3--replace-the-reader)
- [F-A1 — Remove a capability deep import](#f-a1--remove-a-capability-deep-import)
- [F-A2 — Split a God Hook](#f-a2--split-a-god-hook)
- [F-A3 — Recover a browser draft](#f-a3--recover-a-browser-draft)

## F-E1 — Place agenda interaction

**Answer.** The Page composes the screen, the Card renders one appointment, the Hook coordinates interaction, State remembers selection/loading, and Formatter chooses time display.

**Why / exact owner.** Scheduling [Presentation](../../../GLOSSARY.md#presentation-layer) owns all five interaction artifacts.

**Exact files.** presentation/scheduling/pages/AgendaPage.tsx; presentation/scheduling/components/AppointmentCard/AppointmentCard.tsx; presentation/scheduling/hooks/useAgenda.ts; presentation/scheduling/state/agenda.state.ts; presentation/scheduling/formatters/formatAppointmentTime.ts.

**References.** [Relevant guide](../presentation-architecture.md) · [Exercise](easy.md#f-e1--place-agenda-interaction).

## F-E2 — State or business responsibility?

**Answer.** Panel visibility is local UI state. Selected day and visible busy/error belong to Scheduling [Presentation](../../../GLOSSARY.md#presentation-layer). GetAgenda coordinates retrieval; appointment eligibility belongs to [Domain](../../../GLOSSARY.md#domain). The backend independently owns authoritative booking.

**Why / exact owner.** Interaction versus workflow versus business meaning.

**Exact files.** presentation/scheduling/pages/AgendaPage.tsx; presentation/scheduling/state/agenda.state.ts; application/scheduling/use-cases/GetAgenda.ts; domain/scheduling/availability/calculateAvailableSlots.ts.

**References.** [Relevant guide](../state-management.md) · [Exercise](easy.md#f-e2--state-or-business-responsibility).

## F-E3 — Receive an API response

**Answer.** The integration [DTO](../../../GLOSSARY.md#data-transfer-object-dto) describes wire fields, its [Parser](../../../GLOSSARY.md#parser) validates unknown data and its [Mapper](../../../GLOSSARY.md#mapper) translates accepted data into the inward representation.

**Why / exact owner.** The Scheduling HTTP integration owns all three representations/translation pieces.

**Exact files.** infrastructure/http/scheduling/dto/AgendaApiDto.ts; infrastructure/http/scheduling/parsers/parseAgendaApiResponse.ts; infrastructure/http/scheduling/mappers/mapAgendaApiDto.ts.

**References.** [Relevant guide](../ports-and-adapters.md) · [Exercise](easy.md#f-e3--receive-an-api-response).

## F-I1 — Compose a screen

The [canonical agenda core](../presentation-architecture.md#a-small-agenda-operation) supplies `GetAgenda` and `Appointment`. This screen uses local state; a state library is unnecessary for this requirement.

```tsx
// src/presentation/scheduling/AgendaPage.tsx
import { useRef, useState } from 'react'
import type { GetAgenda } from '@/application/scheduling'
import type { Appointment } from '@/domain/scheduling/Appointment'

export function useAgenda(getAgenda: GetAgenda, initialDay: string) {
  const [selectedDay, setDay] = useState(initialDay)
  const [appointments, setAppointments] = useState<readonly Appointment[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const request = useRef(0)

  async function selectDay(day: string) {
    const current = ++request.current
    setDay(day)
    setAppointments([])
    setBusy(true)
    setError(null)
    if (!day) {
      setError('Choose a day')
      setBusy(false)
      return
    }
    try {
      const result = await getAgenda.execute(day)
      if (current !== request.current) return
      if (result.ok) setAppointments(result.appointments)
      else setError('Agenda unavailable')
    } catch {
      if (current === request.current) setError('Agenda could not be loaded')
    } finally {
      if (current === request.current) setBusy(false)
    }
  }
  return { selectedDay, appointments, busy, error, selectDay }
}

export function AgendaToolbar(props: {
  selectedDay: string
  onDayChange: (day: string) => void
}) {
  return <label>Day <input type="date" value={props.selectedDay}
    onChange={event => props.onDayChange(event.target.value)} /></label>
}
export function AppointmentCard({ appointment }: { appointment: Appointment }) {
  return <li>{appointment.id}</li>
}
export function AgendaCalendar({ appointments }: { appointments: readonly Appointment[] }) {
  return <ul>{appointments.map(appointment =>
    <AppointmentCard key={appointment.id} appointment={appointment} />)}</ul>
}
export function AgendaPage({ getAgenda }: { getAgenda: GetAgenda }) {
  const agenda = useAgenda(getAgenda, '2026-10-07')
  return <main>
    <AgendaToolbar selectedDay={agenda.selectedDay}
      onDayChange={day => { void agenda.selectDay(day) }} />
    <button onClick={() => { void agenda.selectDay(agenda.selectedDay) }}>Load</button>
    {agenda.busy && <p role="status">Loading</p>}
    {agenda.error && <p role="alert">{agenda.error}</p>}
    <AgendaCalendar appointments={agenda.appointments} />
  </main>
}
```

The files are combined here so the excerpt is complete. In the handbook's placement convention, keep Page, Hook and each component in their corresponding Scheduling folders. The request counter belongs to screen interaction; it prevents stale feedback and is not a transport implementation.

Composition supplies `GetAgenda` with a reader, then passes it to `AgendaPage`. The initial screen waits for Load or a day change. Clearing the native date control shows feedback without calling the reader. This is control-input handling; it defines no booking rule.

**Exercise.** [F-I1](intermediate.md#f-i1--compose-a-screen)

## F-I2 — Move a rule out of React

Reuse `isAppointmentDuration` from the [canonical Appointment module](../presentation-architecture.md#a-small-agenda-operation).

```ts
// src/application/scheduling/CheckAppointmentDuration.ts
import { isAppointmentDuration } from '@/domain/scheduling/Appointment'

export type DurationResult =
  | { ok: true; minutes: number }
  | { ok: false; reason: 'invalid-duration' }

export function checkAppointmentDuration(value: unknown): DurationResult {
  return isAppointmentDuration(value)
    ? { ok: true, minutes: value }
    : { ok: false, reason: 'invalid-duration' }
}
```

```ts
// src/presentation/scheduling/durationFeedback.ts
import { checkAppointmentDuration, type DurationResult } from '@/application/scheduling/CheckAppointmentDuration'

function message(result: DurationResult): string {
  return result.ok ? 'Duration accepted' : 'Choose a valid duration'
}
export function appointmentCardFeedback(minutes: number) {
  return message(checkAppointmentDuration(minutes))
}
export function appointmentFormFeedback(value: unknown) {
  return message(checkAppointmentDuration(value))
}
```

React components render these messages rather than comparing the minimum again. [Domain](../../../GLOSSARY.md#domain) owns the client rule, [Application](../../../GLOSSARY.md#application-layer) offers the check and [Presentation](../../../GLOSSARY.md#presentation-layer) chooses words. The API server must independently enforce authoritative booking rules; client acceptance proves no booking permission.

**Exercise.** [F-I2](intermediate.md#f-i2--move-a-rule-out-of-react)

## F-I3 — Replace the reader

Implement the [canonical AgendaReader contract](../presentation-architecture.md#a-small-agenda-operation). Its values are already accepted internal appointment facts, not unknown HTTP responses.

```ts
// src/infrastructure/memory/scheduling/InMemoryAgendaReader.ts
import type { Appointment } from '@/domain/scheduling/Appointment'
import type { AgendaReader } from '@/application/scheduling/ports/AgendaReader'

export class InMemoryAgendaReader implements AgendaReader {
  private readonly days: Readonly<Record<string, readonly Appointment[]>>
  constructor(days: Readonly<Record<string, readonly Appointment[]>>) {
    this.days = Object.fromEntries(Object.entries(days).map(([day, rows]) =>
      [day, rows.map(row => ({ ...row }))]))
  }
  async read(day: string): Promise<readonly Appointment[]> {
    return (this.days[day] ?? []).map(row => ({ ...row }))
  }
}
```

```ts
// src/composition/trainingAgenda.ts
import { GetAgenda } from '@/application/scheduling'
import { InMemoryAgendaReader } from '@/infrastructure/memory/scheduling/InMemoryAgendaReader'

export function trainingAgenda() {
  return new GetAgenda(new InMemoryAgendaReader({
    '2026-10-07': [{ id: 'A-1', startsAt: '2026-10-07T09:00:00Z', durationMinutes: 30 }],
  }))
}
```

Production assembly supplies its HTTP implementation of the same contract. Copies stop consumers from modifying the stored training records. An unknown day yields an empty successful list. Memory does not establish API shape, authorization, time-zone agreement or network-failure handling.

**Exercise.** [F-I3](intermediate.md#f-i3--replace-the-reader)

## F-A1 — Remove a capability deep import

Expose an appointment summary, then supply its reader to the consumer. No state-library type crosses this supported entry.

```ts
// src/presentation/scheduling/appointmentSummary.ts
import type { GetAgenda } from '@/application/scheduling'

export interface AppointmentSummary { id: string; startsAt: string }
export type SummaryResult =
  | { ok: true; appointments: readonly AppointmentSummary[] }
  | { ok: false; reason: 'unavailable' }
export interface AppointmentSummaryReader { read(day: string): Promise<SummaryResult> }

export function createAppointmentSummaryReader(getAgenda: GetAgenda): AppointmentSummaryReader {
  return {
    async read(day) {
      const result = await getAgenda.execute(day)
      if (!result.ok) return result
      return {
        ok: true,
        appointments: result.appointments.map(item => ({ id: item.id, startsAt: item.startsAt })),
      }
    },
  }
}
```

```ts
// src/presentation/scheduling/index.ts
export { createAppointmentSummaryReader } from './appointmentSummary'
export type { AppointmentSummary, AppointmentSummaryReader, SummaryResult } from './appointmentSummary'
```

```ts
// src/presentation/tickets/readAppointmentSummary.ts
import type { AppointmentSummaryReader } from '@/presentation/scheduling'

export async function readAppointmentSummary(reader: AppointmentSummaryReader, day: string) {
  const result = await reader.read(day)
  return result.ok
    ? { message: result.appointments.length + ' appointments', appointments: result.appointments }
    : { message: 'Agenda unavailable', appointments: [] }
}
```

Composition calls Scheduling's public factory with the operation and supplies the resulting reader to Tickets. Scheduling owns the projection and entry; Tickets owns its visible message. This is a supported cross-capability API, not permission to import private selectors.

**Exercise.** [F-A1](advanced.md#f-a1--remove-a-capability-deep-import)

## F-A2 — Split a God Hook

Use the [canonical agenda core](../presentation-architecture.md#a-small-agenda-operation) and the [F-I1 Hook](#f-i1--compose-a-screen). Add only the HTTP implementation and display formatter.

```ts
// src/infrastructure/http/scheduling/HttpAgendaReader.ts
import { isAppointmentDuration, type Appointment } from '@/domain/scheduling/Appointment'
import { AgendaUnavailable, type AgendaReader } from '@/application/scheduling/ports/AgendaReader'

export interface AgendaApiDto { appointment_id: string; start_time: string; minutes: number }
export function parseAgendaApiResponse(value: unknown): readonly AgendaApiDto[] {
  if (!Array.isArray(value)) throw new Error('Invalid agenda response')
  return value.map((row: unknown) => {
    if (typeof row !== 'object' || row === null ||
        !('appointment_id' in row) || typeof row.appointment_id !== 'string' || !row.appointment_id ||
        !('start_time' in row) || typeof row.start_time !== 'string' ||
        !Number.isFinite(Date.parse(row.start_time)) ||
        !('minutes' in row) || !isAppointmentDuration(row.minutes)) {
      throw new Error('Invalid agenda response')
    }
    return { appointment_id: row.appointment_id, start_time: row.start_time, minutes: row.minutes }
  })
}
export function mapAgendaApiDto(row: AgendaApiDto): Appointment {
  return { id: row.appointment_id, startsAt: row.start_time, durationMinutes: row.minutes }
}
export class HttpAgendaReader implements AgendaReader {
  constructor(private readonly request: typeof fetch = fetch) {}
  async read(day: string): Promise<readonly Appointment[]> {
    try {
      const response = await this.request('/agenda?day=' + encodeURIComponent(day))
      if (!response.ok) throw new Error('Agenda HTTP failure')
      const payload: unknown = await response.json()
      return parseAgendaApiResponse(payload).map(mapAgendaApiDto)
    } catch (cause) {
      throw new AgendaUnavailable('Agenda integration failed', { cause })
    }
  }
}
```

```ts
// src/presentation/scheduling/formatAppointmentTime.ts
import type { Appointment } from '@/domain/scheduling/Appointment'

export function formatAppointmentTime(
  appointment: Appointment,
  locale: string,
  timeZone: string,
): string {
  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit', minute: '2-digit', timeZone,
  }).format(new Date(appointment.startsAt))
}
```

```ts
// src/composition/httpAgenda.ts
import { GetAgenda } from '@/application/scheduling'
import { HttpAgendaReader } from '@/infrastructure/http/scheduling/HttpAgendaReader'

export function httpAgenda(request: typeof fetch = fetch) {
  return new GetAgenda(new HttpAgendaReader(request))
}
```

The Hook retains selected day, loading and feedback from F-I1; a component calls the formatter when rendering each accepted appointment. The adapter rejects malformed rows instead of silently filtering them out. Its schema reuses [Domain](../../../GLOSSARY.md#domain)'s duration guard.

The API row shape, parser and mapper share a file here for a complete focused module; split them into the documented dto/parsers/mappers folders when their change needs justify it. The retained cause is internal; `GetAgenda` and the Hook expose safe feedback. HTTP mocks establish mapping and failure translation, not agreement with a real backend.

**Exercise.** [F-A2](advanced.md#f-a2--split-a-god-hook)

## F-A3 — Recover a browser draft

Reuse `AgendaDraft` and `AgendaDraftStorage` from the [canonical state guide](../state-management.md#browser-persistence-is-an-external-detail).

```ts
// src/application/scheduling/AgendaDraftOperations.ts
import type { AgendaDraft, AgendaDraftStorage } from './ports/AgendaDraftStorage'

export class DraftStorageUnavailable extends Error {}
export type DraftLoadResult =
  | { ok: true; draft: AgendaDraft | null }
  | { ok: false; reason: 'draft-unavailable' }

export class AgendaDraftOperations {
  constructor(private readonly storage: AgendaDraftStorage) {}
  async load(): Promise<DraftLoadResult> {
    try { return { ok: true, draft: await this.storage.load() } }
    catch (error) {
      if (error instanceof DraftStorageUnavailable) return { ok: false, reason: 'draft-unavailable' }
      throw error
    }
  }
  async save(draft: AgendaDraft): Promise<{ ok: true } | { ok: false; reason: 'draft-unavailable' }> {
    try { await this.storage.save(draft); return { ok: true } }
    catch (error) {
      if (error instanceof DraftStorageUnavailable) return { ok: false, reason: 'draft-unavailable' }
      throw error
    }
  }
}
```

```ts
// src/infrastructure/browser/scheduling/SessionStorageAgendaDraftStorage.ts
import type { AgendaDraft, AgendaDraftStorage } from '@/application/scheduling/ports/AgendaDraftStorage'
import { DraftStorageUnavailable } from '@/application/scheduling/AgendaDraftOperations'

export function parseStoredDraft(value: unknown): AgendaDraft {
  if (typeof value !== 'object' || value === null || Array.isArray(value) ||
      !('day' in value) || typeof value.day !== 'string' ||
      !('note' in value) || typeof value.note !== 'string') {
    throw new Error('Invalid stored draft')
  }
  return { day: value.day, note: value.note }
}
export class SessionStorageAgendaDraftStorage implements AgendaDraftStorage {
  constructor(private readonly storage: Pick<Storage, 'getItem' | 'setItem'>) {}
  async load(): Promise<AgendaDraft | null> {
    try {
      const raw = this.storage.getItem('agenda-draft')
      return raw === null ? null : parseStoredDraft(JSON.parse(raw))
    } catch (cause) {
      throw new DraftStorageUnavailable('Draft recovery failed', { cause })
    }
  }
  async save(draft: AgendaDraft): Promise<void> {
    try { this.storage.setItem('agenda-draft', JSON.stringify(draft)) }
    catch (cause) { throw new DraftStorageUnavailable('Draft save failed', { cause }) }
  }
}
```

```ts
// src/presentation/scheduling/draftFeedback.ts
import type { AgendaDraft } from '@/application/scheduling/ports/AgendaDraftStorage'
import type { DraftLoadResult } from '@/application/scheduling/AgendaDraftOperations'

export function draftFeedback(result: DraftLoadResult) {
  return result.ok
    ? { draft: result.draft, message: result.draft ? 'Draft recovered' : 'No saved draft' }
    : { draft: null, message: 'Draft could not be recovered' }
}
export function reduceDraft(_state: AgendaDraft, next: AgendaDraft): AgendaDraft {
  return { ...next }
}
```

```ts
// src/composition/browserDraft.ts
import { AgendaDraftOperations } from '@/application/scheduling/AgendaDraftOperations'
import { SessionStorageAgendaDraftStorage } from '@/infrastructure/browser/scheduling/SessionStorageAgendaDraftStorage'

export function browserDraft(acquire: () => Storage = () => window.sessionStorage) {
  // Even acquiring sessionStorage may throw; defer it into the checked operation.
  const storage: Pick<Storage, 'getItem' | 'setItem'> = {
    getItem: key => acquire().getItem(key),
    setItem: (key, value) => acquire().setItem(key, value),
  }
  return new AgendaDraftOperations(new SessionStorageAgendaDraftStorage(storage))
}
```

The screen invokes `save` outside the reducer and maps rejected saving to “Draft could not be saved”. The [Parser](../../../GLOSSARY.md#parser) checks stored shape; unfinished draft strings do not imply a valid booking. Storage is scoped to the browser session and does not promise cross-device recovery.

**Exercise.** [F-A3](advanced.md#f-a3--recover-a-browser-draft)

[Exercise route](README.md)
