# Design Exercises

Read [Resources and Operations](../resources-and-operations.md) first. For each exercise, give the public meaning before choosing a path or implementation file.

**Contents**

- [A-D1 — Correct the resource model](#a-d1--correct-the-resource-model)
- [A-D2 — Reschedule an appointment safely](#a-d2--reschedule-an-appointment-safely)
- [A-D3 — Page a growing history](#a-d3--page-a-growing-history)
- [A-D4 — Interpret a clinic day](#a-d4--interpret-a-clinic-day)

## A-D1 — Correct the resource model

**Prerequisites.** [Resources and relationships](../resources-and-operations.md#resources-and-relationships).

**Starting situation.** A draft contract has `GET /v1/getDentist?id=den_42`, `GET /v1/dentists/den_42/appointments?date=2026-11-12` for the whole clinic agenda, and `GET /v1/availability?dentistId=den_42&date=2026-11-12` for one dentist's slots.

**Task.** Give a coherent item URL and a clinic-wide agenda URL. Decide whether the one-dentist availability URL should remain a top-level query or be nested. Defend the decision using the consumer's question, not a rule about pretty URLs.

**Expected behavior.** The whole-clinic agenda is not falsely scoped to one dentist; all reads remain inside the authenticated clinic.

**Verification.** Write three GET requests and one sentence explaining when the alternative availability shape would become useful. Compare [A-D1](solutions.md#a-d1--correct-the-resource-model).

## A-D2 — Reschedule an appointment safely

**Prerequisites.** [Create and change appointments](../resources-and-operations.md#create-and-change-appointments) and [method properties](../http-and-identifiers.md#method-properties).

**Starting situation.** The draft handler treats `PUT /v1/appointments/apt_71` with `{"startsAt":"2026-11-12T15:00:00Z"}` as a partial update. The appointment has server-owned identity, status, audit data and an end time. The draft handler silently leaves omitted fields unchanged.

**Task.** Choose a method and media type for rescheduling, include the new end time, and state how `null` and omitted fields are handled. Explain when a true PUT would be suitable.

**Expected behavior.** One atomic update checks the resulting interval and does not erase server-owned fields.

**Verification.** Write the corrected HTTP request and identify the success and occupied-slot outcomes. After [optimistic concurrency](../reliability-and-operations.md#optimistic-concurrency), add the precondition and stale-version outcome. Compare [A-D2](solutions.md#a-d2--reschedule-an-appointment-safely).

## A-D3 — Page a growing history

**Prerequisites.** [Collections and time](../resources-and-operations.md#collections-and-time).

**Starting situation.** The server returns every appointment in one response. A draft change adds `?offset=20&limit=20`, sorted only by `startsAt DESC`. New appointments are inserted while a user moves between pages.

**Task.** Design the history request and response for this growing collection. Choose a stable sort, page-size cap, continuation field and tenant/filter behavior. State one limitation you still cannot eliminate without snapshot semantics.

**Expected behavior.** The client can continue without parsing cursor internals; a cursor from one clinic cannot expose another clinic's history.

**Verification.** Show page-one and page-two request shapes plus a small JSON response shape. Explain why an ID tie-breaker matters. Compare [A-D3](solutions.md#a-d3--page-a-growing-history).

## A-D4 — Interpret a clinic day

**Prerequisites.** [Collections and time](../resources-and-operations.md#collections-and-time).

**Starting situation.** A handler interprets `date=2026-11-12` as `2026-11-12T00:00:00Z` through `2026-11-13T00:00:00Z`, regardless of the clinic's zone.

**Task.** Explain how to select the clinic's calendar day and which time values the public representation returns. Name the interval boundary convention.

**Expected behavior.** An appointment shortly after local midnight appears on the intended clinic day, including near daylight saving changes.

**Verification.** State the order of conversion and why adding exactly 24 UTC hours can be wrong. Compare [A-D4](solutions.md#a-d4--interpret-a-clinic-day).

[Previous: Foundations](foundations.md) · [Exercises](README.md) · [Solutions](solutions.md) · [Next: Engineering](engineering.md)
