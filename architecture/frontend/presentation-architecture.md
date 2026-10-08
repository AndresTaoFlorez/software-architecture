# Frontend Presentation Architecture

An agenda screen needs day navigation, appointment cards and loading feedback. Keep these interaction decisions together while its business rules and HTTP integration retain their own owners.

**Contents**

- [Presentation is a boundary](#presentation-is-a-boundary)
- [Organize by ownership, not only by technical type](#organize-by-ownership-not-only-by-technical-type)
  - [A small agenda operation](#a-small-agenda-operation)
- [Screen interaction and components](#screen-interaction-and-components)
  - [Pages compose; features own behavior](#pages-compose-features-own-behavior)
  - [Component colocation](#component-colocation)
  - [Screen interaction API](#screen-interaction-api)
- [Avoid the God ViewModel](#avoid-the-god-viewmodel)
- [Shared UI is earned](#shared-ui-is-earned)
- [Helpers follow their responsibility](#helpers-follow-their-responsibility)
- [Public APIs protect feature internals](#public-apis-protect-feature-internals)
- [Type placement inside Presentation](#type-placement-inside-presentation)
- [Enforce chosen boundaries](#enforce-chosen-boundaries)
- [Sources](#sources)

<a id="1-presentation-is-a-boundary"></a>

## Presentation is a boundary

[Presentation](../../GLOSSARY.md#presentation-layer) owns rendering and interaction. [Application](../../GLOSSARY.md#application-layer) offers operations; [Infrastructure](../../GLOSSARY.md#infrastructure) loads external data; [Domain](../../GLOSSARY.md#domain) owns the business decisions the client needs for feedback. The backend remains authoritative for persisted appointments.

<a id="2-organize-by-ownership-not-only-by-technical-type"></a>

## Organize by ownership, not only by technical type

Start with `presentation/scheduling/`, then use `pages/`, `components/`, `hooks/`, `state/` and `formatters/` as responsibilities appear.

| Branch and exact file | What belongs here and why |
| --- | --- |
| `domain/scheduling/Appointment.ts` | Valid business values used by the client, independent of React and HTTP |
| `domain/scheduling/availability/calculateAvailableSlots.ts` | Client-side business availability feedback; the backend makes the authoritative booking decision |
| `application/scheduling/use-cases/GetAgenda.ts` | Coordinates loading an agenda using the required reader contract |
| `application/scheduling/ports/AgendaReader.ts` | Describes the reading capability, without choosing HTTP |
| `application/scheduling/contracts/AgendaResult.ts` | Defines the operation's output, without wire-field or rendering assumptions |
| `infrastructure/http/scheduling/adapters/HttpAgendaReader.ts` | Sends the HTTP call and translates integration failures |
| `infrastructure/http/scheduling/dto/AgendaApiDto.ts` | Describes the backend API's external fields |
| `infrastructure/http/scheduling/parsers/parseAgendaApiResponse.ts` | Checks unknown API data before accepting that [DTO](../../GLOSSARY.md#data-transfer-object-dto) |
| `infrastructure/http/scheduling/mappers/mapAgendaApiDto.ts` | Translates checked DTO fields into the representation the internal contract needs |
| `presentation/scheduling/pages/AgendaPage.tsx` | Composes the routed agenda screen |
| `presentation/scheduling/components/AgendaCalendar/AgendaCalendar.tsx` | Renders the calendar; its props and tests live beside it |
| `presentation/scheduling/components/AppointmentCard/AppointmentCard.tsx` | Renders one appointment; its props live beside it |
| `presentation/scheduling/components/AgendaToolbar/AgendaToolbar.tsx` | Renders day/navigation controls |
| `presentation/scheduling/hooks/useAgenda.ts` | Connects the screen to the injected operation, loading state and feedback |
| `presentation/scheduling/hooks/useAppointmentSelection.ts` | Reuses appointment-selection interaction |
| `presentation/scheduling/state/agenda.state.ts` | Owns the selected day, selection and visible loading/error state |
| `presentation/scheduling/state/agenda.selectors.ts` | Reads/derives display data from that state |
| `presentation/scheduling/formatters/formatAppointmentTime.ts` | Chooses the visible time string, locale and display convention |
| `composition/scheduling/createSchedulingDependencies.ts` | Creates the chosen reader and operation and makes them available to [Presentation](../../GLOSSARY.md#presentation-layer) |

### A small agenda operation

These plain-TypeScript modules are the canonical core used by the frontend exercises. A read returns recorded appointment facts; it does not book an appointment. The minimum duration is a client rule for proposed new bookings, not a reason to reject or hide historical records. The backend remains authoritative for booking.

`src/domain/scheduling/Appointment.ts`:

```ts
export interface Appointment {
  readonly id: string
  readonly startsAt: string
  readonly durationMinutes: number
}

export function isAppointmentDuration(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 20
}
```

`src/application/scheduling/ports/AgendaReader.ts`:

```ts
import type { Appointment } from '@/domain/scheduling/Appointment'

export class AgendaUnavailable extends Error {}
export interface AgendaReader {
  read(day: string): Promise<readonly Appointment[]>
}
```

`src/application/scheduling/contracts/AgendaResult.ts`:

```ts
import type { Appointment } from '@/domain/scheduling/Appointment'

export type AgendaResult =
  | { ok: true; appointments: readonly Appointment[] }
  | { ok: false; reason: 'unavailable' }
```

`src/application/scheduling/use-cases/GetAgenda.ts`:

```ts
import { AgendaUnavailable, type AgendaReader } from '../ports/AgendaReader'
import type { AgendaResult } from '../contracts/AgendaResult'

export class GetAgenda {
  constructor(private readonly reader: AgendaReader) {}
  async execute(day: string): Promise<AgendaResult> {
    try {
      return { ok: true, appointments: await this.reader.read(day) }
    } catch (error) {
      if (error instanceof AgendaUnavailable) return { ok: false, reason: 'unavailable' }
      throw error
    }
  }
}
```

`src/application/scheduling/index.ts`:

```ts
export { GetAgenda } from './use-cases/GetAgenda'
export type { AgendaResult } from './contracts/AgendaResult'
```

Composition supplies a reader before the screen invokes `execute`. The operation translates a known integration failure, and unexpected defects propagate. Runtime validation of API fields belongs to its HTTP implementation.

## Screen interaction and components

<a id="3-pages-compose-features-own-behavior"></a>

### Pages compose; features own behavior

| Piece | Responsibility |
| --- | --- |
| Page | Compose a route or whole screen |
| Component | Render a narrower interaction unit |
| Hook | Reuse screen interaction and composition |
| State | Remember data used for rendering and interaction |
| Formatter | Choose a display representation |

In `presentation/scheduling/pages/AgendaPage.tsx`:

```tsx
// Composition excerpt; component props and Hook implementation are omitted.
import type { GetAgenda } from '@/application/scheduling'
import { useAgenda } from '../hooks/useAgenda'
import { AgendaToolbar } from '../components/AgendaToolbar/AgendaToolbar'
import { AgendaCalendar } from '../components/AgendaCalendar/AgendaCalendar'

export function AgendaPage({ getAgenda }: { getAgenda: GetAgenda }) {
  const agenda = useAgenda(getAgenda)
  return (
    <main>
      <AgendaToolbar selectedDay={agenda.selectedDay} busy={agenda.busy} onDayChange={agenda.selectDay} />
      <AgendaCalendar appointments={agenda.appointments} />
    </main>
  )
}
```

The Hook receives its [Application](../../GLOSSARY.md#application-layer) operation through composition. The [Ticket Hook](ports-and-adapters.md#presentation-and-composition-using-the-operation) shows explicit injection. A Page can keep a local panel-open flag; shared agenda selection belongs to the feature's state.

<a id="4-component-colocation"></a>

### Component colocation

Keep `AppointmentCard.types.ts`, styles and component tests beside `AppointmentCard.tsx` when needed. That makes the component's local contract easy to find and move.

<a id="5-public-hook-viewmodel-facade"></a>

<a id="5-public-hook--viewmodel-facade"></a>

### Screen interaction API

A screen-facing Hook can expose `appointments`, `busy` and `selectDay` through one useful interaction contract. Hide state-library details when that boundary protects an actual change. A Hook is not automatically a [ViewModel](../../GLOSSARY.md#viewmodel) or Facade. The [Facade guide](../patterns/structural/facade/README.md) demonstrates the collaboration required for that pattern.

<a id="6-avoid-the-god-viewmodel"></a>

## Avoid the God ViewModel

A **God Hook** mixes unrelated reasons to change: HTTP fields, business eligibility, selection and formatting. Move each decision to its owner rather than splitting solely by line count.

<a id="7-shared-ui-is-earned"></a>

## Shared UI is earned

Keep `AppointmentCard` local to Scheduling. Promote a visual primitive such as `Button` to `presentation/shared/components/` when unrelated consumers establish a stable visual contract.

<a id="8-feature-local-libraries-before-global-utils"></a>

<a id="8-helpers-follow-their-responsibility"></a>

## Helpers follow their responsibility

`formatAppointmentTime` belongs in `presentation/scheduling/formatters/`. `mapAgendaApiDto` belongs to the HTTP integration. The [canonical placement guide](../foundations/code-placement.md#where-does-a-helper-function-belong) explains why function size does not determine ownership.

<a id="9-public-apis-protect-feature-internals"></a>

## Public APIs protect feature internals

A consumer uses `@/presentation/scheduling` rather than deep-importing its private state. [Module Boundaries](../foundations/module-boundaries-and-public-apis.md) explains supported exports and enforcement.

<a id="10-type-placement-inside-presentation"></a>

## Type placement inside Presentation

Component props stay beside the component; feature view state stays in `state/`. [Application](../../GLOSSARY.md#application-layer) results and external DTOs stay with their respective owners.

<a id="11-enforce-chosen-boundaries"></a>

## Enforce chosen boundaries

Review layer direction and cross-capability imports separately. [Checking Architectural Boundaries](../foundations/architecture-testing.md) explains the evidence each check provides.

## Sources

- [React: Describing the UI](https://react.dev/learn/describing-the-ui)
- [React: Reusing Logic with Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [Redux: Code Structure](https://redux.js.org/faq/code-structure/)

[Previous: Frontend Architecture](README.md) · [Next: Ports & Adapters in a Frontend: Support Tickets](ports-and-adapters.md)
