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

The [canonical agenda core](../presentation-architecture.md#a-small-agenda-operation) supplies `GetAgenda` and `Appointment`. Each listing is a separate owned file. The Hook keeps this screen's selected day and feedback in React state; no state library is required.

```ts
// src/presentation/scheduling/hooks/useAgenda.ts
import { useState } from 'react'
import type { GetAgenda } from '@/application/scheduling'
import type { Appointment } from '@/domain/scheduling/Appointment'

// The default day is fixture data for the exercise, not a production date policy.
export function useAgenda(getAgenda: GetAgenda, initialDay = '2026-10-07') {
  const [selectedDay, setDay] = useState(initialDay)
  const [appointments, setAppointments] = useState<readonly Appointment[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function selectDay(day: string) {
    setDay(day)
    setAppointments([])
    setError(null)
    if (!day) { setError('Choose a day'); return }
    setBusy(true)
    try {
      const result = await getAgenda.execute(day)
      if (result.ok) setAppointments(result.appointments)
      else setError('Agenda unavailable')
    } catch {
      setError('Agenda could not be loaded')
    } finally {
      setBusy(false)
    }
  }
  return { selectedDay, appointments, busy, error, selectDay }
}
```

```tsx
// src/presentation/scheduling/components/AgendaToolbar/AgendaToolbar.tsx
export function AgendaToolbar(props: {
  selectedDay: string
  busy: boolean
  onDayChange: (day: string) => void
}) {
  return <label>Day <input type="date" value={props.selectedDay} disabled={props.busy}
    onChange={event => props.onDayChange(event.target.value)} /></label>
}
```

```tsx
// src/presentation/scheduling/components/AppointmentCard/AppointmentCard.tsx
import type { Appointment } from '@/domain/scheduling/Appointment'

export function AppointmentCard({ appointment }: { appointment: Appointment }) {
  return <li>{appointment.id}</li>
}
```

```tsx
// src/presentation/scheduling/components/AgendaCalendar/AgendaCalendar.tsx
import type { Appointment } from '@/domain/scheduling/Appointment'
import { AppointmentCard } from '../AppointmentCard/AppointmentCard'

export function AgendaCalendar({ appointments }: { appointments: readonly Appointment[] }) {
  return <ul>{appointments.map(appointment =>
    <AppointmentCard key={appointment.id} appointment={appointment} />)}</ul>
}
```

```tsx
// src/presentation/scheduling/pages/AgendaPage.tsx
import type { GetAgenda } from '@/application/scheduling'
import { useAgenda } from '../hooks/useAgenda'
import { AgendaToolbar } from '../components/AgendaToolbar/AgendaToolbar'
import { AgendaCalendar } from '../components/AgendaCalendar/AgendaCalendar'

export function AgendaPage({ getAgenda }: { getAgenda: GetAgenda }) {
  const agenda = useAgenda(getAgenda)
  return <main>
    <AgendaToolbar selectedDay={agenda.selectedDay} busy={agenda.busy}
      onDayChange={day => { void agenda.selectDay(day) }} />
    <button disabled={agenda.busy}
      onClick={() => { void agenda.selectDay(agenda.selectedDay) }}>Load</button>
    {agenda.busy && <p role="status">Loading</p>}
    {agenda.error && <p role="alert">{agenda.error}</p>}
    <AgendaCalendar appointments={agenda.appointments} />
  </main>
}
```

Composition supplies `GetAgenda` with a reader and passes it to the Page; [F-I3](#f-i3--replace-the-reader) shows that assembly. The initial screen waits for Load or a day change. Its controls pause while loading, keeping this exercise to one user-triggered read at a time. Clearing the date shows feedback without a read. Coordinating overlapping requests is outside this composition exercise.

**Exercise.** [F-I1](intermediate.md#f-i1--compose-a-screen)

## F-I2 — Move a rule out of React

The [canonical Appointment module](../presentation-architecture.md#a-small-agenda-operation) owns `isProposedAppointmentDuration`: the client's minimum duration for a **new** appointment. It is not a rule for whether historical API rows may be displayed.

Both UI consumers call the same Domain decision. No Application use case or result wrapper is needed for this pure check:

```ts
// src/presentation/scheduling/components/AppointmentCard/durationFeedback.ts
import { isProposedAppointmentDuration } from '@/domain/scheduling/Appointment'

export function appointmentCardFeedback(minutes: number): string {
  return isProposedAppointmentDuration(minutes) ? 'Meets new-booking minimum' : 'Below new-booking minimum'
}
```

```ts
// src/presentation/scheduling/components/AppointmentForm/durationFeedback.ts
import { isProposedAppointmentDuration } from '@/domain/scheduling/Appointment'

export function appointmentFormFeedback(value: unknown): string {
  return isProposedAppointmentDuration(value) ? 'Meets new-booking minimum' : 'Choose a duration for a new booking'
}
```

These messages describe whether a duration would qualify for a new booking; they do not decide whether a recorded appointment is displayed. Their wording belongs to Presentation, not to another business rule. Changing the minimum from 20 to 30 changes only the Domain predicate; neither UI consumer hardcodes it. The backend independently enforces authoritative booking policy. This direct inward dependency is permitted by the [dependency-boundary convention](../../foundations/dependency-boundaries.md#a-practical-four-area-mapping); introduce an Application operation when there is a workflow to coordinate, not just to forward one predicate.

**Exercise.** [F-I2](intermediate.md#f-i2--move-a-rule-out-of-react)

## F-I3 — Replace the reader

Implement the [canonical AgendaReader contract](../presentation-architecture.md#a-small-agenda-operation). Its values are already accepted internal appointment facts, not unknown HTTP responses.

```ts
// src/infrastructure/memory/scheduling/adapters/InMemoryAgendaReader.ts
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
// src/composition/scheduling/trainingAgenda.ts
import { GetAgenda } from '@/application/scheduling'
import { InMemoryAgendaReader } from '@/infrastructure/memory/scheduling/adapters/InMemoryAgendaReader'

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
// src/presentation/scheduling/contracts/AppointmentSummary.ts
export interface AppointmentSummary { id: string; startsAt: string }
export type SummaryResult =
  | { ok: true; appointments: readonly AppointmentSummary[] }
  | { ok: false; reason: 'unavailable' }
```

```ts
// src/presentation/scheduling/ports/AppointmentSummaryReader.ts
import type { SummaryResult } from '../contracts/AppointmentSummary'

export interface AppointmentSummaryReader { read(day: string): Promise<SummaryResult> }
```

```ts
// src/presentation/scheduling/mappers/mapAppointmentSummary.ts
import type { Appointment } from '@/domain/scheduling/Appointment'
import type { AppointmentSummary } from '../contracts/AppointmentSummary'

export function mapAppointmentSummary(item: Appointment): AppointmentSummary {
  return { id: item.id, startsAt: item.startsAt }
}
```

```ts
// src/presentation/scheduling/readers/createAppointmentSummaryReader.ts
import type { GetAgenda } from '@/application/scheduling'
import type { AppointmentSummaryReader } from '../ports/AppointmentSummaryReader'
import { mapAppointmentSummary } from '../mappers/mapAppointmentSummary'

export function createAppointmentSummaryReader(getAgenda: GetAgenda): AppointmentSummaryReader {
  return {
    async read(day) {
      const result = await getAgenda.execute(day)
      if (!result.ok) return result
      return { ok: true, appointments: result.appointments.map(mapAppointmentSummary) }
    },
  }
}
```

```ts
// src/presentation/scheduling/index.ts
export { createAppointmentSummaryReader } from './readers/createAppointmentSummaryReader'
export type { AppointmentSummary, SummaryResult } from './contracts/AppointmentSummary'
export type { AppointmentSummaryReader } from './ports/AppointmentSummaryReader'
```

```ts
// src/presentation/tickets/readers/readAppointmentSummary.ts
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

Reuse the [canonical agenda core](../presentation-architecture.md#a-small-agenda-operation) and the [F-I1 Hook](#f-i1--compose-a-screen). The integration's [DTO](../../../GLOSSARY.md#data-transfer-object-dto), [Parser](../../../GLOSSARY.md#parser), [Mapper](../../../GLOSSARY.md#mapper) and adapter occupy the responsibility folders from the start.

```ts
// src/infrastructure/http/scheduling/dto/AgendaApiDto.ts
export interface AgendaApiDto {
  appointment_id: string
  start_time: string
  minutes: number
}
```

```ts
// src/infrastructure/http/scheduling/parsers/parseAgendaApiResponse.ts
import type { AgendaApiDto } from '../dto/AgendaApiDto'

export function parseAgendaApiResponse(value: unknown): readonly AgendaApiDto[] {
  if (!Array.isArray(value)) throw new Error('Invalid agenda response')
  return value.map((row: unknown) => {
    // First check the external representation.
    if (typeof row !== 'object' || row === null || Array.isArray(row) ||
        !('appointment_id' in row) || typeof row.appointment_id !== 'string' || !row.appointment_id ||
        !('start_time' in row) || typeof row.start_time !== 'string' ||
        !Number.isFinite(Date.parse(row.start_time)) ||
        !('minutes' in row) || typeof row.minutes !== 'number' ||
        !Number.isFinite(row.minutes) || row.minutes <= 0) {
      throw new Error('Invalid agenda response')
    }
    return { appointment_id: row.appointment_id, start_time: row.start_time, minutes: row.minutes }
  })
}
```

```ts
// src/infrastructure/http/scheduling/mappers/mapAgendaApiDto.ts
import type { Appointment } from '@/domain/scheduling/Appointment'
import type { AgendaApiDto } from '../dto/AgendaApiDto'

export function mapAgendaApiDto(row: AgendaApiDto): Appointment {
  return { id: row.appointment_id, startsAt: row.start_time, durationMinutes: row.minutes }
}
```

```ts
// src/infrastructure/http/scheduling/adapters/HttpAgendaReader.ts
import type { Appointment } from '@/domain/scheduling/Appointment'
import { AgendaUnavailable, type AgendaReader } from '@/application/scheduling/ports/AgendaReader'
import { parseAgendaApiResponse } from '../parsers/parseAgendaApiResponse'
import { mapAgendaApiDto } from '../mappers/mapAgendaApiDto'

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
// src/presentation/scheduling/formatters/formatAppointmentTime.ts
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
// src/composition/scheduling/httpAgenda.ts
import { GetAgenda } from '@/application/scheduling'
import { HttpAgendaReader } from '@/infrastructure/http/scheduling/adapters/HttpAgendaReader'

export function httpAgenda(request: typeof fetch = fetch) {
  return new GetAgenda(new HttpAgendaReader(request))
}
```

The Page and Hook keep their F-I1 files. To display times, change only `presentation/scheduling/components/AppointmentCard/AppointmentCard.tsx`:

```tsx
// src/presentation/scheduling/components/AppointmentCard/AppointmentCard.tsx
import type { Appointment } from '@/domain/scheduling/Appointment'
import { formatAppointmentTime } from '../../formatters/formatAppointmentTime'

export function AppointmentCard({ appointment }: { appointment: Appointment }) {
  return <li>{appointment.id} — {formatAppointmentTime(appointment, 'en-GB', 'UTC')}</li>
}
```

The `en-GB` locale and `UTC` time zone in the Card are illustrative display settings; a real screen should receive the user's chosen locale and the scheduling time zone from its configuration.

The Parser checks unknown wire fields, including a finite positive duration; the Mapper renames accepted fields. A historical 15-minute appointment remains readable. The separate [Domain](../../../GLOSSARY.md#domain) minimum applies when evaluating a **new** appointment (F-I2), not when decoding existing records. Malformed representations reject the read rather than disappearing silently. The adapter retains the cause for internal diagnostics; `GetAgenda` and the Hook return safe feedback. HTTP mocks verify these translations, not agreement with a real backend.

**Exercise.** [F-A2](advanced.md#f-a2--split-a-god-hook)

## F-A3 — Recover a browser draft

Reuse `AgendaDraft` and `AgendaDraftStorage` from the [canonical state guide](../state-management.md#browser-persistence-is-an-external-detail).

```ts
// src/application/scheduling/errors/DraftStorageUnavailable.ts
export class DraftStorageUnavailable extends Error {}
```

```ts
// src/application/scheduling/contracts/DraftLoadResult.ts
import type { AgendaDraft } from '../ports/AgendaDraftStorage'

export type DraftLoadResult =
  | { ok: true; draft: AgendaDraft | null }
  | { ok: false; reason: 'draft-unavailable' }
```

```ts
// src/application/scheduling/use-cases/AgendaDraftOperations.ts
import type { AgendaDraft, AgendaDraftStorage } from '../ports/AgendaDraftStorage'

import { DraftStorageUnavailable } from '../errors/DraftStorageUnavailable'
import type { DraftLoadResult } from '../contracts/DraftLoadResult'

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
// src/infrastructure/browser/scheduling/parsers/parseStoredDraft.ts
import type { AgendaDraft } from '@/application/scheduling/ports/AgendaDraftStorage'

export function parseStoredDraft(value: unknown): AgendaDraft {
  if (typeof value !== 'object' || value === null || Array.isArray(value) ||
      !('day' in value) || typeof value.day !== 'string' ||
      !('note' in value) || typeof value.note !== 'string') {
    throw new Error('Invalid stored draft')
  }
  return { day: value.day, note: value.note }
}
```

```ts
// src/infrastructure/browser/scheduling/adapters/SessionStorageAgendaDraftStorage.ts
import type { AgendaDraft, AgendaDraftStorage } from '@/application/scheduling/ports/AgendaDraftStorage'
import { DraftStorageUnavailable } from '@/application/scheduling/errors/DraftStorageUnavailable'

import { parseStoredDraft } from '../parsers/parseStoredDraft'

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
// src/presentation/scheduling/formatters/draftFeedback.ts
import type { DraftLoadResult } from '@/application/scheduling/contracts/DraftLoadResult'

export function draftFeedback(result: DraftLoadResult) {
  return result.ok
    ? { draft: result.draft, message: result.draft ? 'Draft recovered' : 'No saved draft' }
    : { draft: null, message: 'Draft could not be recovered' }
}
```

```ts
// src/presentation/scheduling/state/agendaDraft.state.ts
import type { AgendaDraft } from '@/application/scheduling/ports/AgendaDraftStorage'

export function reduceDraft(_state: AgendaDraft, next: AgendaDraft): AgendaDraft {
  return { ...next }
}
```

```ts
// src/composition/scheduling/browserDraft.ts
import { AgendaDraftOperations } from '@/application/scheduling/use-cases/AgendaDraftOperations'
import { SessionStorageAgendaDraftStorage } from '@/infrastructure/browser/scheduling/adapters/SessionStorageAgendaDraftStorage'

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
