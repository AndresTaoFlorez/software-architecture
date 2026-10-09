# API Design Exercise Solutions

These are concrete solutions for the [exercise route](README.md). They use the fictional EPS scheduling contract from [API Design](../README.md). Code is a focused excerpt: dependency wiring, imports and database setup live in a real project's files, as mapped in [Contracts and Implementation Boundaries](../contracts-and-boundaries.md#place-the-files). A different answer is valid when its public behavior and ownership are equally clear.

**Contents**

- [Foundation solutions](#foundation-solutions)
- [Design solutions](#design-solutions)
- [Engineering solutions](#engineering-solutions)

## Foundation solutions

### A-F1 — Name the boundary

The API is the supported organization scheduling interface, including authentication, representations, errors and change promises. `GET /v1/physicians/{physicianId}` is one endpoint. The Nest route declaration matches the method and target; `PhysiciansController.getOne` is the handler inside the Controller; `GetPhysician.execute` is an Application operation. The client may rely on the endpoint's documented observable behavior, not on internal class or method names. Renaming the Controller is an internal refactor if the public contract stays the same.

### A-F2 — Select method and outcome

```http
POST /v1/appointments HTTP/1.1
Content-Type: application/json

{"physicianId":"phy_42","patientId":"pat_18","siteId":"site_7","startsAt":"2026-11-12T14:00:00Z","endsAt":"2026-11-12T14:30:00Z"}
```

Success: `HTTP/1.1 201 Created` with `Location: /v1/appointments/apt_71` and the created representation. Conflict: `HTTP/1.1 409 Conflict` with the documented `slot-unavailable` problem type. GET is safe and cannot request booking. POST is not inherently idempotent; a client retry needs the documented idempotency-key contract in [A-E4](#a-e4--retry-and-reject-a-stale-edit).

### A-F3 — Classify two failures

`startsAt: 12` fails at HTTP request parsing because the field is not a string timestamp: `400` with `https://api.example.test/problems/invalid-request`. Valid times that overlap an active booking reach the scheduling decision and database backstop: `409` with `https://api.example.test/problems/slot-unavailable`. Neither writes a new appointment. The transport parser owns the first refusal; Domain's booking rule and the persistence constraint own the second, while HTTP maps it to a status and problem representation.

## Design solutions

### A-D1 — Correct the resource model

```http
GET /v1/physicians/phy_42 HTTP/1.1
GET /v1/appointments?siteId=site_7&date=2026-11-12 HTTP/1.1
GET /v1/physicians/phy_42/availability?siteId=site_7&date=2026-11-12 HTTP/1.1
```

The last request asks for one physician's computed availability at one site, so nesting makes the physician scope visible. A top-level `/v1/availability?siteId=...&physicianId=...` would be useful if the product needs a collection query across physicians. The authenticated organization and permitted site still scope all three requests; the path alone does not authorize them.

### A-D2 — Reschedule an appointment safely

```http
PATCH /v1/appointments/apt_71 HTTP/1.1
Content-Type: application/merge-patch+json

{"startsAt":"2026-11-12T15:00:00Z","endsAt":"2026-11-12T15:30:00Z"}
```

The server keeps omitted fields, rejects `null` for required timestamps and checks the complete resulting interval atomically. It returns the updated representation on success or `409` for a booked interval. PUT would fit a resource whose full replaceable state the client can send to a known URI. After learning preconditions, add `If-Match: "apt-71-v3"`; a stale tag yields `412` before changing state.

### A-D3 — Page a growing history

```http
GET /v1/appointments?siteId=site_7&limit=20&sort=-startsAt HTTP/1.1
GET /v1/appointments?siteId=site_7&limit=20&sort=-startsAt&cursor=opaque-next-token HTTP/1.1
```

```json
{"items":[{"id":"apt_71","startsAt":"2026-11-12T14:00:00Z"}],"nextCursor":"opaque-next-token"}
```

The server caps `limit`, sorts by `(startsAt DESC, id DESC)` and binds the cursor to the verified organization, site filter and sort. IDs break ties when appointments share a start time. A moving collection can still change between page requests; this contract does not promise a snapshot. The client treats the cursor as opaque.

### A-D4 — Interpret a site's day

Resolve `site_7`'s local `2026-11-12T00:00` and the next local midnight in its IANA zone. Convert each boundary separately to an instant, then query `[start, end)`. Return appointment instants as RFC 3339 timestamps with offsets, plus the site zone when future local-time interpretation depends on it. Adding 24 hours to the first UTC boundary can miss or include an hour on a daylight saving change.

## Engineering solutions

### A-E1 — Move a booking rule out of the Controller

The Controller calls `parseCreateAppointmentRequest`, obtains verified `organizationId` and site permissions, invokes `CreateAppointment.execute` and maps the result to `201`, `400`, `422` or `409`. The Domain's `Appointment` and `BookingPolicy` check a valid interval and scheduling eligibility. Application uses the organization-scoped repository port for affiliation, site and assignment facts, then attempts an atomic booking. PostgreSQL implements that port and retains the exclusion constraint from [the race solution](#a-e3--resolve-a-simultaneous-booking).

```ts
// src/application/appointments/use-cases/CreateAppointment.ts — focused excerpt
export class CreateAppointment {
  constructor(private readonly repository: AppointmentRepository) {}

  async execute(command: CreateAppointmentCommand): Promise<CreateAppointmentResult> {
    const interval = Appointment.validInterval(command.startsAt, command.endsAt)
    if (!interval) return { ok: false, reason: 'invalid-interval' }
    if (!command.permittedSiteIds.includes(command.siteId)) return { ok: false, reason: 'not-found' }
    return this.repository.withTransaction(command.organizationId, async tx => {
      const facts = await tx.bookingFacts(command.siteId, command.physicianId, command.patientId, interval)
      if (!facts.patientAffiliated || !facts.siteInOrganization || !facts.physicianAtSite) {
        return { ok: false, reason: 'not-found' }
      }
      if (!BookingPolicy.allows(interval, facts)) {
        return { ok: false, reason: 'slot-unavailable' }
      }
      return tx.insert({ siteId: command.siteId, physicianId: command.physicianId, patientId: command.patientId, interval })
    })
  }
}
```

The Application owns the sequence inside the transaction. The PostgreSQL adapter supplies `bookingFacts` and `insert`, then translates an exclusion failure to `slot-unavailable` if another transaction wins the race. The request parser in `src/presentation/http/appointments/parsers/parseCreateAppointmentRequest.ts` rejects unknown shapes; `src/presentation/http/appointments/controllers/AppointmentsController.ts` maps only accepted data. `CreateAppointment` imports Domain and its Application port; the adapter imports the port, not the Controller. Test the interval in Domain, affiliation and site checks with a fake port, and the exclusion constraint with PostgreSQL. The sketch omits concrete port types and wiring deliberately.

### A-E2 — Block cross-organization access

```ts
// src/application/appointments/ports/AppointmentRepository.ts
export interface AppointmentRepository {
  findInOrganization(organizationId: string, appointmentId: string): Promise<Appointment | null>
}

// src/application/appointments/use-cases/GetAppointment.ts — focused excerpt
export class GetAppointment {
  constructor(private readonly repository: AppointmentRepository) {}

  async execute(principal: VerifiedPrincipal, appointmentId: string) {
    const appointment = await this.repository.findInOrganization(principal.organizationId, appointmentId)
    return appointment && principal.permittedSiteIds.includes(appointment.siteId) ? appointment : null
  }
}
```

The Controller never accepts `organizationId` from the query string. The repository queries by both IDs; its transaction sets local `app.organization_id` from `principal.organizationId` before querying, so RLS is a second boundary. An Organization A item at a permitted site succeeds. Organization B's ID or an unauthorized site returns the contract's `404` with no patient data. An app-role query without tenant context reads no organization rows. Test those outcomes through HTTP and with the production-like database role.

### A-E3 — Resolve a simultaneous booking

Keep `starts_at < ends_at` and the `(organization_id, physician_id, tstzrange(starts_at, ends_at, '[)'))` exclusion constraint for active rows from [the migration excerpt](../reliability-and-operations.md#two-bookings-for-one-slot). `14:00–14:30` and `14:30–15:00` can coexist; two `14:00–14:30` rows for the physician cannot, even at different sites. Cancellation sets status to `cancelled`, removing that row from the partial constraint; a reschedule re-enters the same check.

```ts
// src/infrastructure/persistence/appointments/PostgresAppointmentRepository.ts
async function insertBooking(transaction: Transaction, scopedInput: ScopedInput) {
  try {
    return await transaction.insertAppointment(scopedInput)
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === '23P01') {
      return { ok: false, reason: 'slot-unavailable' }
    }
    throw error
  }
}
```

The HTTP mapper returns `409` with a `slot-unavailable` problem and no competing patient's details. In an integration test, synchronize two create attempts on separate database connections, start them together and assert one committed active row and one `409`. A fake port has no PostgreSQL exclusion behavior and cannot prove the race outcome.

### A-E4 — Retry and reject a stale edit

On create, store `(organization_id, caller_id, operation, key)` as a unique retry identity with a canonical fingerprint of the request, including `siteId`. The booking and recorded public result commit in one transaction. The same key and fingerprint replays the `201` body and `Location`; the same key with different input is rejected. An in-progress duplicate waits or receives a documented retryable response. Set a retention period long enough for the client retry window.

On read, return `ETag: "apt-71-v3"`. On PATCH, require `If-Match: "apt-71-v3"` and compare that revision in the write transaction. After another edit advances the revision, the old tag returns `412` and leaves the row unchanged. The key deduplicates one create attempt; the ETag protects a later modification from stale state.

Verify a lost-response retry leaves exactly one row and returns the same public result. Verify an old ETag causes `412`, no row change and no new revision. An occupied slot with a current tag remains `409`.

### A-E5 — Find a breaking change

| Proposal | Existing-client impact | Safe next step |
| --- | --- | --- |
| Require `notes` | Breaks callers that omit it | Keep optional in v1; require only in a reviewed new contract if necessary |
| Rename `startsAt` to `startUtc` | Breaks serializers and generated clients | Add an explicit new version or operation; do not silently rename v1 |
| Add optional response `roomName` | Usually additive, but strict clients may fail | Test known consumers and document optionality |
| Interpret `date` as a UTC day | Silently changes results for sites outside UTC | Preserve site-local v1 meaning; use a new, explicitly named filter or version |

Publish a change guide, maintain both contracts for an agreed window, track which clients call each version and announce deprecation and sunset dates. A consumer test that queries a local-day boundary catches the time-meaning break; a generated-client integration test catches the renamed field. Do not retire v1 until the agreed migration criteria are met.

### A-E6 — Test the contract from outside

```ts
// tests/appointments/appointmentApi.test.ts — test pseudocode
const created = await organizationA.post('/v1/appointments', validBooking, { 'Idempotency-Key': 'attempt-1' })
expect(created.status).toBe(201)
expect(created.headers.location).toMatch(/^\/v1\/appointments\//)
expect(schemaFor('createAppointment', 201).accepts(created.body)).toBe(true)

const conflict = await organizationA.post('/v1/appointments', sameSlotOtherPatient)
expect(conflict.status).toBe(409)
expect(conflict.headers['content-type']).toContain('application/problem+json')
expect(conflict.body.type).toBe('https://api.example.test/problems/slot-unavailable')

const hidden = await organizationB.get(created.headers.location)
expect(hidden.status).toBe(404)
expect(JSON.stringify(hidden.body)).not.toContain('pat_18')
```

`organizationA` and `organizationB` are authenticated test clients; `validBooking` and `sameSlotOtherPatient` include an authorized `siteId`, and `schemaFor` loads the published OpenAPI response schema. The HTTP test verifies public behavior independently of Controller method names. A separate PostgreSQL integration test must exercise concurrent inserts across sites and the production-like RLS role. The pseudocode names required fixtures but is not presented as executable without them.

[Exercises](README.md) · [API Design route](../README.md)
