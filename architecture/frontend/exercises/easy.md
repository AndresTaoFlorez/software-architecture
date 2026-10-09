# Easy frontend Exercises

Identify the owners and relationships in the examples you have just read. Each exercise names its prerequisite guide; compare your answer with the separate solutions afterward.

**Contents**

- [F-E1 — Place agenda interaction](#f-e1--place-agenda-interaction)
- [F-E2 — State or business responsibility?](#f-e2--state-or-business-responsibility)
- [F-E3 — Receive an API response](#f-e3--receive-an-api-response)

## F-E1 — Place agenda interaction

**What you already know.** Read Frontend [Presentation](../../../GLOSSARY.md#presentation-layer) Architecture.

**Situation.** A receptionist opens the agenda and selects an appointment.

**Terms you need.** Page, Component, Hook, State and Formatter.

**Given code/files.** AgendaPage, AppointmentCard, useAgenda, agenda.state and formatAppointmentTime.

**Task.** Give their exact paths and explain one responsibility each.

**Questions.** Which composes the screen? Who chooses the visible time string?

**Success criteria.** Capability-owned folders; formatting stays outside business eligibility.

**Relevant handbook sections.** [Read the guide](../presentation-architecture.md).

## F-E2 — State or business responsibility?

**What you already know.** Read state responsibility, pure reducers and selectors in [State Management](../state-management.md).

**Situation.** The screen has an open history panel, selected day, loading error and an appointment-eligibility decision.

**Terms you need.** Local state, [Presentation](../../../GLOSSARY.md#presentation-layer) state, [Application](../../../GLOSSARY.md#application-layer) workflow and business rule.

**Given code/files.** isHistoryOpen; selectedDay; busy/error; GetAgenda; appointment eligibility.

**Task.** Assign each responsibility and explain its lifetime or reason to change.

**Questions.** Does closing a panel affect appointment validity? Who owns data loading?

**Success criteria.** Distinguish visible loading from the operation doing the loading.

**Relevant handbook sections.** [Read the guide](../state-management.md).

## F-E3 — Receive an API response

**What you already know.** Read Code Placement and the Ticket HTTP integration.

**Situation.** The agenda API returns wire fields that differ from the client's result.

**Terms you need.** [DTO](../../../GLOSSARY.md#data-transfer-object-dto), [Parser](../../../GLOSSARY.md#parser) and [Mapper](../../../GLOSSARY.md#mapper).

**Given code/files.** AgendaApiDto, parseAgendaApiResponse and mapAgendaApiDto.

**Task.** Give exact paths and order the unknown-input check and field translation.

**Questions.** Does an interface validate JSON? Can a mapper safely accept unchecked data?

**Success criteria.** Transport ownership and runtime checks before mapping.

**Relevant handbook sections.** [Read the guide](../ports-and-adapters.md).

[Exercise route](README.md) · [Solutions](solutions.md)
