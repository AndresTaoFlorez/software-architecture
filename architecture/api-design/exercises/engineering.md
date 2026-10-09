# Engineering Exercises

Read [Contracts and Implementation Boundaries](../contracts-and-boundaries.md), [Security and Tenant Isolation](../security-and-tenancy.md) and [Reliability, Evolution and Operations](../reliability-and-operations.md) first. Each excerpt is a starting point for a focused change, not a complete runnable service.

**Contents**

- [A-E1 — Move a booking rule out of the Controller](#a-e1--move-a-booking-rule-out-of-the-controller)
- [A-E2 — Block cross-clinic access](#a-e2--block-cross-clinic-access)
- [A-E3 — Resolve a simultaneous booking](#a-e3--resolve-a-simultaneous-booking)
- [A-E4 — Retry and reject a stale edit](#a-e4--retry-and-reject-a-stale-edit)
- [A-E5 — Find a breaking change](#a-e5--find-a-breaking-change)
- [A-E6 — Test the contract from outside](#a-e6--test-the-contract-from-outside)

## A-E1 — Move a booking rule out of the Controller

**Prerequisites.** [Validate at the boundary](../contracts-and-boundaries.md#validate-at-the-boundary) and [trace one booking](../contracts-and-boundaries.md#trace-one-booking).

**Starting situation.** The HTTP handler mixes parsing, booking policy and persistence:

```ts
async function create(body: any, db: any) {
  if (new Date(body.endsAt) <= new Date(body.startsAt)) return { status: 400 }
  const overlap = await db.appointments.findOverlap(body.dentistId, body.startsAt, body.endsAt)
  if (overlap) return { status: 409 }
  return { status: 201, body: await db.appointments.insert(body) }
}
```

**Task.** Assign parsing, interval validity, clinic membership, transaction and persistence to their owners. Give exact layer-first file paths and a focused changed code sketch. Preserve a race-safe database backstop.

**Expected behavior.** Invalid shape fails before the use case; a valid conflicting booking returns `409`; a rule change does not require editing the Controller.

**Verification.** Identify each source import direction and one test per relevant boundary. Compare [A-E1](solutions.md#a-e1--move-a-booking-rule-out-of-the-controller).

## A-E2 — Block cross-clinic access

**Prerequisites.** [Scope every object](../security-and-tenancy.md#scope-every-object) and [database defense](../security-and-tenancy.md#database-defense-in-depth).

**Starting situation.** A verified Clinic A user calls `GET /v1/appointments/apt_b`, where `apt_b` belongs to Clinic B. The use case currently calls `repo.findById(appointmentId)` and the Controller later compares `appointment.clinicId` to a `clinicId` field from the query string.

**Task.** Change the input and repository contract so the lookup is scoped by verified clinic context. State how RLS is set for a transaction and what the HTTP response exposes.

**Expected behavior.** Changing the query string cannot reveal Clinic B data. The app role also fails closed if a tenant predicate is accidentally omitted.

**Verification.** Specify a positive Clinic A lookup, a cross-clinic lookup and a test with no RLS setting. Compare [A-E2](solutions.md#a-e2--block-cross-clinic-access).

## A-E3 — Resolve a simultaneous booking

**Prerequisites.** [Two bookings for one slot](../reliability-and-operations.md#two-bookings-for-one-slot).

**Starting situation.** Two HTTP workers both run `if (!await repo.overlaps(...)) await repo.insert(...)` for `den_42`, `14:00–14:30`. Both see no existing row before either inserts.

**Task.** Give the transaction and database constraint that ensure one active appointment, including half-open boundaries and cancellation behavior. Map the losing database outcome to the public response.

**Expected behavior.** Exactly one booking commits; the other receives a `409` Problem Details response without another patient's data.

**Verification.** Describe a concurrent integration test against PostgreSQL and why a fake repository cannot establish this guarantee. Compare [A-E3](solutions.md#a-e3--resolve-a-simultaneous-booking).

## A-E4 — Retry and reject a stale edit

**Prerequisites.** [Retries](../reliability-and-operations.md#retries-and-duplicate-requests) and [optimistic concurrency](../reliability-and-operations.md#optimistic-concurrency).

**Starting situation.** The client times out after `POST /v1/appointments` commits, then resends the same body. Another user reads `apt_71`, reschedules it and the first user later sends an edit based on the old view.

**Task.** Define the create retry key's scope, fingerprint and replay behavior. Define the read ETag, update precondition, atomic compare-and-write and stale response. Do not treat the key and ETag as the same mechanism.

**Expected behavior.** One create produces one row despite a lost response. The later stale edit does not overwrite the newer appointment.

**Verification.** State the database assertions for the retry and the HTTP status and row state for the stale update. Compare [A-E4](solutions.md#a-e4--retry-and-reject-a-stale-edit).

## A-E5 — Find a breaking change

**Prerequisites.** [Contract evolution](../reliability-and-operations.md#contract-evolution-and-governance) and [Describe the agreement](../contracts-and-boundaries.md#describe-the-agreement).

**Starting situation.** `/v1/appointments` has `startsAt` as an RFC 3339 timestamp and optional `notes`. A proposed release makes `notes` required, renames `startsAt` to `startUtc`, adds optional `roomName` to responses and changes the meaning of `date` from clinic-local day to UTC day.

**Task.** Classify each change for existing clients, then propose a compatible rollout or a new contract where necessary. Identify a consumer test that could catch one break.

**Expected behavior.** Existing clients keep their time and input meaning until they migrate deliberately.

**Verification.** Give a four-row impact table and a deprecation plan with observable adoption. Compare [A-E5](solutions.md#a-e5--find-a-breaking-change).

## A-E6 — Test the contract from outside

**Prerequisites.** [Verification and release readiness](../reliability-and-operations.md#verification-and-release-readiness) and [Problem Details](../resources-and-operations.md#error-contract).

**Starting situation.** A unit test calls `AppointmentsController.create()` directly and asserts that it returned an object. It does not send HTTP or load the published OpenAPI description.

**Task.** Specify a contract test that sends a real request to the server boundary for success and occupied-slot failure, validates status, headers and body, and compares the published schema. Add one negative security assertion.

**Expected behavior.** A changed Controller implementation can pass if public behavior stays the same; a response drift or cross-clinic leak fails.

**Verification.** Write executable-looking test pseudocode with clear setup and assertions, and name what still needs a PostgreSQL integration test. Compare [A-E6](solutions.md#a-e6--test-the-contract-from-outside).

[Previous: Design](design.md) · [Exercises](README.md) · [Solutions](solutions.md) · [API Design route](../README.md)
