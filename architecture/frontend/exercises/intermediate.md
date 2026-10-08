# Intermediate frontend Exercises

## F-I1 — Compose a screen

**What you already know.** Read the Agenda Page excerpt and state guide.

**Situation.** AgendaPage needs a toolbar, calendar, cards, selected day and loading feedback.

**Terms you need.** Composition of Page/components, interaction Hook and feature State.

**Given code/files.** AgendaPage, AgendaToolbar, AgendaCalendar, AppointmentCard, useAgenda and agenda.state.

**Task.** Describe each connection, including how the Hook receives GetAgenda.

**Questions.** Where should selected-day behavior live? Who creates HttpAgendaReader?

**Success criteria.** Page composes; Hook uses the supplied operation; Composition chooses the reader.

**Relevant handbook sections.** [Read the guide](../presentation-architecture.md#3-pages-compose-features-own-behavior).

## F-I2 — Move a rule out of React

**What you already know.** Read Code Placement's Domain example.

**Situation.** AppointmentCard decides that appointment duration must be at least 20 minutes, and another form copies that decision.

**Terms you need.** Business Rule and Architectural Ownership.

**Given code/files.** Two React functions compare durationMinutes >= 20; the business requirement defines that same client feedback in both places.

**Task.** Give the rule one Domain owner and show how UI uses it through the relevant operation/result.

**Questions.** Which file changes for a 30-minute rule? Does client validation establish authoritative booking?

**Success criteria.** One client rule implementation, no React imports in Domain and explicit backend authority.

**Relevant handbook sections.** [Read the guide](../../foundations/code-placement.md).

## F-I3 — Replace the reader

**What you already know.** Read required contracts and Composition.

**Situation.** A training screen needs agendas from process memory while the production screen uses HTTP.

**Terms you need.** AgendaReader, implementation and manual dependency injection.

**Given code/files.** GetAgenda requires AgendaReader; HttpAgendaReader implements it.

**Task.** Design InMemoryAgendaReader and the composition change without editing GetAgenda or Presentation.

**Questions.** What contract behavior must both readers fulfill? What does memory fail to establish about the real API?

**Success criteria.** Same input/result meaning; substitution at startup only.

**Relevant handbook sections.** [Read the guide](../presentation-architecture.md#2-organize-by-ownership-not-only-by-technical-type).

[Exercise route](README.md) · [Solutions](solutions.md)
