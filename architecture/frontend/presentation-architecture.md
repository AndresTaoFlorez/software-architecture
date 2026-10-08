# Frontend Presentation Architecture

An agenda screen needs day navigation, appointment cards and loading feedback. Keep these interaction decisions together while its business rules and HTTP integration retain their own owners.

## 1. Presentation is a boundary

Presentation owns rendering and interaction. Application offers operations; Infrastructure loads external data; Domain owns the business decisions the client needs for feedback. The backend remains authoritative for persisted appointments.

## 2. Organize by ownership, not only by technical type

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

## 3. Pages compose; features own behavior

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
import { useAgenda } from '../hooks/useAgenda'
import { AgendaToolbar } from '../components/AgendaToolbar/AgendaToolbar'
import { AgendaCalendar } from '../components/AgendaCalendar/AgendaCalendar'

export function AgendaPage() {
  const agenda = useAgenda()
  return (
    <main>
      <AgendaToolbar selectedDay={agenda.selectedDay} onDayChange={agenda.selectDay} />
      <AgendaCalendar appointments={agenda.appointments} busy={agenda.busy} />
    </main>
  )
}
```

The Hook receives its Application operation through composition. The [Ticket Hook](ports-and-adapters.md#presentation-and-composition-using-the-operation) shows explicit injection. A Page can keep a local panel-open flag; shared agenda selection belongs to the feature's state.

## 4. Component colocation

Keep `AppointmentCard.types.ts`, styles and component tests beside `AppointmentCard.tsx` when needed. That makes the component's local contract easy to find and move.

<a id="5-public-hook-viewmodel-facade"></a>

## 5. Public hook / ViewModel facade

A screen-facing Hook can expose `appointments`, `busy` and `selectDay` while composing narrower operations. Such a facade gives consumers one useful interaction contract. Hide state-library details when replacing that library is a boundary worth protecting.

## 6. Avoid the God ViewModel

A **God Hook** mixes unrelated reasons to change: HTTP fields, business eligibility, selection and formatting. Move each decision to its owner rather than splitting solely by line count.

## 7. Shared UI is earned

Keep `AppointmentCard` local to Scheduling. Promote a visual primitive such as `Button` to `presentation/shared/components/` when unrelated consumers establish a stable visual contract.

<a id="8-feature-local-libraries-before-global-utils"></a>

## 8. Helpers follow their responsibility

`formatAppointmentTime` belongs in `presentation/scheduling/formatters/`. `mapAgendaApiDto` belongs to the HTTP integration. The [canonical placement guide](../foundations/code-placement.md#9-where-does-a-helper-function-belong) explains why function size does not determine ownership.

## 9. Public APIs protect feature internals

A consumer uses `@/presentation/scheduling` rather than deep-importing its private state. [Module Boundaries](../foundations/module-boundaries-and-public-apis.md) explains supported exports and enforcement.

## 10. Type placement inside Presentation

Component props stay beside the component; feature view state stays in `state/`. Application results and external DTOs stay with their respective owners.

## 11. Enforce chosen boundaries

Review layer direction and cross-capability imports separately. [Checking Architectural Boundaries](../foundations/architecture-testing.md) explains the evidence each check provides.

## Sources

- [React: Describing the UI](https://react.dev/learn/describing-the-ui)
- [React: Reusing Logic with Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [Redux: Code Structure](https://redux.js.org/faq/code-structure/)
