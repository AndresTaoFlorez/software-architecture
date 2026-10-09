# Reliability, Evolution and Operations

Two receptionists see the same free slot. Both click Book. A useful API must give one a confirmed appointment and the other a clear conflict, even when requests arrive on different servers. Later, it must let clients retry, detect stale edits and survive contract changes without guessing.

Read [Resources and Operations](resources-and-operations.md), [Contracts and Implementation Boundaries](contracts-and-boundaries.md) and [Security and Tenant Isolation](security-and-tenancy.md) first. This chapter owns the API-facing decisions; deeper database and distributed-system design still requires its own review for a real deployment.

**Contents**

- [Two bookings for one slot](#two-bookings-for-one-slot)
- [Retries and duplicate requests](#retries-and-duplicate-requests)
- [Optimistic concurrency](#optimistic-concurrency)
- [Timeouts and partial failure](#timeouts-and-partial-failure)
- [Caching, performance and visibility](#caching-performance-and-visibility)
- [Contract evolution and governance](#contract-evolution-and-governance)
- [Verification and release readiness](#verification-and-release-readiness)

## Two bookings for one slot

An availability response is a snapshot, not a reservation. Checking for overlap and then inserting in separate transactions is unsafe: two callers can both observe no row. The application opens a transaction, rechecks membership and eligibility, attempts the insert and commits only when the database accepts it. The Domain still owns the rule that active appointments for the same clinic and dentist cannot overlap; the database constraint makes that rule hold under concurrent writes.

For PostgreSQL, this migration excerpt illustrates the database backstop. It assumes UUID clinic and dentist columns, `timestamptz` boundaries and a status vocabulary where only `active` occupies time. The domain and database vocabularies must agree; later status changes require a migration review.

```sql
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE appointments
  ADD CONSTRAINT appointment_positive_interval CHECK (starts_at < ends_at),
  ADD CONSTRAINT no_active_dentist_overlap EXCLUDE USING gist (
    clinic_id WITH =,
    dentist_id WITH =,
    tstzrange(starts_at, ends_at, '[)') WITH &&
  ) WHERE (status = 'active');
```

`[)` allows one appointment to end exactly when the next begins. The exclusion constraint prevents two overlapping active ranges for the same clinic and dentist. [PostgreSQL range documentation](https://www.postgresql.org/docs/current/rangetypes.html#RANGETYPES-CONSTRAINT) explains this pattern; [`btree_gist`](https://www.postgresql.org/docs/current/btree-gist.html) supplies equality operators for UUIDs in a GiST constraint. A losing insert raises exclusion violation `23P01`; the persistence adapter translates that known database outcome into an application `slot-unavailable` result, and HTTP maps it to `409`. A generic database exception is not exposed to the client. Rescheduling must use the same constraint, and cancellation changes status so the interval no longer participates.

Keep transaction boundaries short. Do not call an external notification service while holding the booking transaction. If a confirmation message is required reliably, record an outbox event in the same transaction and deliver it later with a worker. That adds operational cost and is justified by the delivery requirement, not by every booking. [PostgreSQL transaction documentation](https://www.postgresql.org/docs/current/tutorial-transactions.html) describes atomic commit and rollback.

## Retries and duplicate requests

A client can time out after the server commits. Repeating `POST /v1/appointments` without a deduplication contract can create another appointment or a confusing conflict. The clinic supports an [idempotency key](../../GLOSSARY.md#idempotency-key), sent as `Idempotency-Key`, on this create operation as an API convention. The server scopes the key to clinic, caller and operation, stores a fingerprint of the relevant request and atomically records the final status, response body and `Location` with the booking. A retry with the same key and same request receives the recorded result; reuse with a different request is rejected. Define retention and what happens while the first request is still in progress.

The key is not the HTTP method's idempotence property, and it is not a substitute for the no-overlap constraint. If the server cannot atomically bind the key record and booking, a crash can still create an ambiguous result. A client should use a new key for a genuinely new booking attempt and back off on transient failures. [RFC 9110 §9.2.2](https://www.rfc-editor.org/rfc/rfc9110.html#section-9.2.2) defines method idempotence and warns against blind retries of non-idempotent requests.

For a client-chosen URI, `PUT` can already provide repeatable replacement semantics, subject to authorization and preconditions. This clinic uses server-assigned appointment IDs, so POST plus a documented key is the better fit. A retry after a known `409` with a different interval is a new business attempt and uses a new key.

## Optimistic concurrency

Two authorized users can read `apt_71` and each reschedule it. The second must not silently overwrite the first. The server returns a strong [ETag](../../GLOSSARY.md#etag), such as `ETag: "apt-71-v3"`, with the appointment representation. A client sends `If-Match: "apt-71-v3"` with its PATCH. The server compares the tag to the current selected representation before applying the change. If it differs, respond `412 Precondition Failed`; the client reloads and decides whether to reapply its intent. The server returns a new ETag on success. [RFC 9110 §13.1.1](https://www.rfc-editor.org/rfc/rfc9110.html#section-13.1.1) defines `If-Match` and strong comparison.

The tag must change whenever the represented state relevant to the edit changes. A database revision can support it, but do not assume a particular hash or expose internal row metadata. The update must compare the expected revision and write atomically, for example in one conditional SQL update or transaction; checking the tag and later writing separately recreates the race. `412` means the supplied precondition failed; `409` means a current-version business conflict such as an occupied slot. Requiring `If-Match` for this endpoint is a clinic contract decision; `428 Precondition Required` can signal that policy under [RFC 6585 §3](https://www.rfc-editor.org/rfc/rfc6585.html#section-3).

For reads, `If-None-Match` can revalidate a cached dentist representation and return `304 Not Modified` without a response body. A read validator and a write precondition use related tags for different purposes. [RFC 9110 §13](https://www.rfc-editor.org/rfc/rfc9110.html#section-13) defines both.

## Timeouts and partial failure

Set a request deadline shorter than the caller's overall timeout budget, and make database and external calls respect the remaining budget. A client timeout is not evidence that the server rolled back. When the server cannot complete a synchronous booking, return a clear failure and let the client reconcile using its idempotency key or appointment lookup. Do not promise exactly-once delivery across network boundaries.

For an external service, use bounded retries only when the operation is safe to repeat, exponential backoff with jitter, and a circuit breaker only when observed failure patterns justify it. Limit concurrent expensive requests and queue depth so one clinic cannot exhaust capacity for others. A `503 Service Unavailable` with `Retry-After` can help clients handle temporary overload; `429` represents caller rate limiting. A partial import has explicit per-item results or a job status; it must not return `201` as if all items succeeded. [Azure's API implementation guidance](https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-implementation) covers responsiveness, failures and monitoring.

## Caching, performance and visibility

Dentist profiles change slowly, but an availability view can become stale immediately after a booking. Cache only with an explicit freshness and tenant policy. `Cache-Control: private, no-cache` allows a private store to retain a response while requiring validation before reuse; `no-store` disallows storage. A shared cache must not key only on a path for authenticated clinic data. A versioned ETag helps revalidation, but it does not make a stale availability result a reservation. [RFC 9111](https://www.rfc-editor.org/rfc/rfc9111.html) is normative for HTTP caching.

Measure latency by operation and status, request rate, conflict rate, timeouts, database time and queue depth. Structured logs should include a request or trace ID, operation name, clinic identifier in a protected form, outcome and duration, while excluding tokens and patient details. Propagate standard trace context across HTTP calls and spans; [W3C Trace Context](https://www.w3.org/TR/trace-context/) defines `traceparent` and `tracestate`. A trace helps locate delay but does not replace a business audit record for appointment changes. Alert on sustained error or latency changes, not every expected booking conflict.

## Contract evolution and governance

The `/v1` prefix is a handbook choice. A URI version, media-type version or unversioned additive contract can all work; choose based on consumers and deployment independence. Before any change, list active consumers and compare observed requests, responses, errors and SDK behavior. Adding an optional response field may be safe for tolerant clients but can break strict generated clients. Removing a field, changing units or time-zone meaning, making optional input required, or changing an existing error's meaning is breaking. Changing a database column without changing the public contract is internal.

Prefer an additive field or new operation when it preserves meaning. For a breaking change, run old and new contracts during a measured migration window, publish examples and a change guide, track consumer adoption and retire the old form only after the agreed notice. [RFC 9745](https://www.rfc-editor.org/rfc/rfc9745.html) defines a `Deprecation` response field and link relation; [RFC 8594](https://www.rfc-editor.org/rfc/rfc8594.html) defines `Sunset` for a URI expected to become unresponsive. These fields communicate timing; they do not migrate clients automatically. [Microsoft's REST API Guidelines](https://github.com/microsoft/api-guidelines) and [Zalando's guidelines](https://opensource.zalando.com/restful-api-guidelines/) provide organizational conventions, not universal HTTP requirements.

Review the public contract like a product interface: one owner, a changelog, design review for new fields and operations, and checks for accidental breaking changes in the OpenAPI description. Inventory exposed endpoints, including old versions and private administrative operations. Documentation should show authentication, example requests, problem types, pagination and retry behavior. An SDK release is versioned and tested against the running API, not just generated from a file.

## Verification and release readiness

| Check | What it establishes |
| --- | --- |
| Domain tests | Interval and transition rules on accepted values |
| Application tests with fake ports | Membership, failure mapping and transaction intent without HTTP |
| PostgreSQL integration tests | Constraint race, rollback, tenant role and RLS behavior |
| HTTP contract tests | Status, headers, schema, `Location`, ETags and Problem Details against a running boundary |
| Security negative tests | Cross-clinic object, function and property denial |
| End-to-end client test | A real client can book, reload, reschedule and handle a conflict |
| Load and failure tests | Deadline, rate limit, queue and database behavior at expected traffic |

For the race test, send two concurrent bookings for the same dentist and interval against a real test database; assert exactly one committed appointment and one documented conflict. For retry tests, lose the first response after commit, repeat the same key and assert one row and the same public result. For stale edits, fetch an ETag, change the appointment, then retry the old tag and assert `412` with no overwrite. These tests check different boundaries; a mocked repository cannot prove the database constraint.

Before release, confirm that the published OpenAPI description matches the deployed version, migrations have run, rollback and backup procedures exist, secrets are configured, dashboards and alerts are usable, and deprecation dates are communicated. The handbook does not supply an executable service, so these are checks for a real project rather than claims that this repository ran them.

Try the [engineering exercises](exercises/engineering.md), then compare [other interface styles](interface-styles-and-events.md).

[Previous: Security and Tenant Isolation](security-and-tenancy.md) · [Next: Interface Styles and Events](interface-styles-and-events.md) · [Sources](references.md)
