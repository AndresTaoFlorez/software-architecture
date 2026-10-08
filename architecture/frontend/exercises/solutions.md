# Frontend Exercise Solutions

Source paths below are relative to an application's `src/`. These are design answers, with alternatives judged by the stated requirement.

## F-E1 — Place agenda interaction

**Answer.** The Page composes the screen, the Card renders one appointment, the Hook coordinates interaction, State remembers selection/loading, and Formatter chooses time display.

**Why / exact owner.** Scheduling Presentation owns all five interaction artifacts.

**Exact files.** presentation/scheduling/pages/AgendaPage.tsx; presentation/scheduling/components/AppointmentCard/AppointmentCard.tsx; presentation/scheduling/hooks/useAgenda.ts; presentation/scheduling/state/agenda.state.ts; presentation/scheduling/formatters/formatAppointmentTime.ts.

**Dependency direction.** Page → local components/Hook; Hook → supplied Application operation.

**What remains unchanged.** Agenda retrieval contract and external response fields.

**Why a tempting alternative is wrong.** Global components/, hooks/ and utils/ scatter one capability's ownership.

**References.** [Relevant guide](../presentation-architecture.md) · [Exercise](easy.md#f-e1--place-agenda-interaction).

## F-E2 — State or business responsibility?

**Answer.** Panel visibility is local UI state. Selected day and visible busy/error belong to Scheduling Presentation. GetAgenda coordinates retrieval; appointment eligibility belongs to Domain. The backend independently owns authoritative booking.

**Why / exact owner.** Interaction versus workflow versus business meaning.

**Exact files.** presentation/scheduling/pages/AgendaPage.tsx; presentation/scheduling/state/agenda.state.ts; application/scheduling/use-cases/GetAgenda.ts; domain/scheduling/availability/calculateAvailableSlots.ts.

**Dependency direction.** Presentation invokes Application; Application uses its contracts and Domain as needed.

**What remains unchanged.** Eligibility when the history panel changes.

**Why a tempting alternative is wrong.** Putting eligibility in a reducer makes a UI mechanism its rule owner.

**References.** [Relevant guide](../state-management.md) · [Exercise](easy.md#f-e2--state-or-business-responsibility).

## F-E3 — Receive an API response

**Answer.** The integration DTO describes wire fields, its Parser validates unknown data and its Mapper translates accepted data into the inward representation.

**Why / exact owner.** The Scheduling HTTP integration owns all three representations/translation pieces.

**Exact files.** infrastructure/http/scheduling/dto/AgendaApiDto.ts; infrastructure/http/scheduling/parsers/parseAgendaApiResponse.ts; infrastructure/http/scheduling/mappers/mapAgendaApiDto.ts.

**Dependency direction.** Integration → Application result and deliberately reused Domain values.

**What remains unchanged.** Page, Hook and GetAgenda when wire field names alone change.

**Why a tempting alternative is wrong.** Casting response.json() to a DTO changes TypeScript's assumption without checking received data.

**References.** [Relevant guide](../ports-and-adapters.md) · [Exercise](easy.md#f-e3--receive-an-api-response).

## F-I1 — Compose a screen

**Answer.** The Page obtains its screen contract from useAgenda and passes display values/callbacks to the toolbar/calendar. Calendar composes cards. The Hook coordinates selected day/loading around GetAgenda, supplied by Composition.

**Why / exact owner.** Scheduling Presentation owns screen composition and interaction; Composition owns concrete construction.

**Exact files.** presentation/scheduling/pages/AgendaPage.tsx; presentation/scheduling/components/AgendaToolbar/AgendaToolbar.tsx; presentation/scheduling/components/AgendaCalendar/AgendaCalendar.tsx; presentation/scheduling/components/AppointmentCard/AppointmentCard.tsx; presentation/scheduling/hooks/useAgenda.ts; presentation/scheduling/state/agenda.state.ts; composition/scheduling/createSchedulingDependencies.ts.

**Dependency direction.** Page/components → screen-facing contract; Hook → Application.

**What remains unchanged.** GetAgenda's policy and API response parsing.

**Why a tempting alternative is wrong.** Constructing HttpAgendaReader inside the Page makes screen composition choose the transport.

**References.** [Relevant guide](../presentation-architecture.md#3-pages-compose-features-own-behavior) · [Exercise](intermediate.md#f-i1--compose-a-screen).

## F-I2 — Move a rule out of React

**Answer.** Put the client eligibility calculation in domain/scheduling/availability/calculateAvailableSlots.ts (or a cohesive appointment value behavior when that is the actual decision). Application exposes required eligibility/result to both UI consumers.

**Why / exact owner.** Client Domain owns the business feedback; the backend owns persisted booking validity.

**Exact files.** domain/scheduling/availability/calculateAvailableSlots.ts; application/scheduling/use-cases/GetAgenda.ts; application/scheduling/contracts/AgendaResult.ts as needed; presentation/scheduling/components/AppointmentCard/AppointmentCard.tsx; the second form's owned module.

**Dependency direction.** Presentation → Application → Domain, rather than Domain → React.

**What remains unchanged.** HTTP integration and visual component layout for an unchanged result shape.

**Why a tempting alternative is wrong.** Moving the comparison to presentation/shared/utils.ts shares code while preserving the wrong rule owner.

**References.** [Relevant guide](../../foundations/code-placement.md) · [Exercise](intermediate.md#f-i2--move-a-rule-out-of-react).

## F-I3 — Replace the reader

**Answer.** Implement the existing AgendaReader contract with supplied in-memory records and inject it into GetAgenda during composition. Preserve the operation's result semantics, including absence/failure behavior agreed by that contract.

**Why / exact owner.** Application owns the interaction; Infrastructure owns the implementation choice's behavior; Composition selects it.

**Exact files.** application/scheduling/ports/AgendaReader.ts (existing); infrastructure/memory/scheduling/adapters/InMemoryAgendaReader.ts; composition/scheduling/createSchedulingDependencies.ts.

**Dependency direction.** Memory reader → Application contract; no Presentation import of the reader.

**What remains unchanged.** GetAgenda, Page, Hook and result contract.

**Why a tempting alternative is wrong.** A training-mode flag inside the Hook spreads a technical choice into interaction logic.

**References.** [Relevant guide](../presentation-architecture.md#2-organize-by-ownership-not-only-by-technical-type) · [Exercise](intermediate.md#f-i3--replace-the-reader).

## F-A1 — Remove a capability deep import

**Answer.** Scheduling exposes a summary component or screen-facing summary operation through presentation/scheduling/index.ts, according to the consumer's actual need. Tickets consumes that contract.

**Why / exact owner.** Scheduling owns summary meaning and internal state; Tickets owns where it uses the summary.

**Exact files.** presentation/scheduling/index.ts; presentation/scheduling/components/AgendaSummary/AgendaSummary.tsx if a visual summary is needed; presentation/tickets/pages/TicketPage.tsx.

**Dependency direction.** Tickets → supported Scheduling entry.

**What remains unchanged.** Scheduling's state-library choice and private selector organization.

**Why a tempting alternative is wrong.** Exporting all selectors binds consumers to the implementation that the API should protect.

**References.** [Relevant guide](../../foundations/module-boundaries-and-public-apis.md) · [Exercise](advanced.md#f-a1--remove-a-capability-deep-import).

## F-A2 — Split a God Hook

**Answer.** Move HTTP execution and DTO parsing/mapping into the Scheduling integration, retrieval workflow to GetAgenda, business calculation to Domain, visible-time formatting to Presentation formatters, and keep selected-day/loading interaction in the Hook/state.

**Why / exact owner.** Independent protocol, workflow, rule, interaction and display decisions.

**Exact files.** infrastructure/http/scheduling/adapters/HttpAgendaReader.ts; infrastructure/http/scheduling/dto/AgendaApiDto.ts; infrastructure/http/scheduling/parsers/parseAgendaApiResponse.ts; infrastructure/http/scheduling/mappers/mapAgendaApiDto.ts; application/scheduling/use-cases/GetAgenda.ts; domain/scheduling/availability/calculateAvailableSlots.ts; presentation/scheduling/hooks/useAgenda.ts; presentation/scheduling/state/agenda.state.ts; presentation/scheduling/formatters/formatAppointmentTime.ts.

**Dependency direction.** Hook → Application; integration → inward contract; Application → Domain.

**What remains unchanged.** Page's supported screen contract when the internal responsibilities move.

**Why a tempting alternative is wrong.** Extracting everything into useAgendaHelpers keeps unrelated ownership coupled behind a new filename.

**References.** [Relevant guide](../presentation-architecture.md#6-avoid-the-god-viewmodel) · [Exercise](advanced.md#f-a2--split-a-god-hook).

## F-A3 — Recover a browser draft

**Answer.** SaveAgendaDraft invokes an Application-owned AgendaDraftStorage. A browser implementation performs I/O and checks stored data through its parser. Composition supplies it; UI invokes the operation and handles its outcome outside pure transitions.

**Why / exact owner.** Application owns recovery workflow/contract; Infrastructure owns browser format/I/O; Presentation owns feedback.

**Exact files.** application/scheduling/ports/AgendaDraftStorage.ts; application/scheduling/use-cases/SaveAgendaDraft.ts; infrastructure/browser/scheduling/adapters/SessionStorageAgendaDraftStorage.ts; infrastructure/browser/scheduling/parsers/parseAgendaDraftRecord.ts; composition/scheduling/createSchedulingDependencies.ts; presentation/scheduling/hooks/useAgendaDraft.ts.

**Dependency direction.** Application → its port; browser implementation → port; UI → operation.

**What remains unchanged.** The operation when memory replaces sessionStorage.

**Why a tempting alternative is wrong.** A reducer calling window.sessionStorage combines pure state transition with external work and hides the required substitute.

**References.** [Relevant guide](../state-management.md#7-browser-persistence-is-an-external-detail) · [Exercise](advanced.md#f-a3--recover-a-browser-draft).
