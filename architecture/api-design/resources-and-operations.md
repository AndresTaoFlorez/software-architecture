# Resources and Operations

A scheduling coordinator can see a physician, but now needs a free time and an appointment. The API must identify what the client is reading or changing, then give each operation a stable meaning. URL shape alone cannot supply that meaning.

Read [HTTP and Identifiers](http-and-identifiers.md) first. This chapter owns the organization's resource and request conventions; HTTP's normative method meanings remain in the preceding chapter.

**Contents**

- [REST and resource meaning](#rest-and-resource-meaning)
- [Resources and relationships](#resources-and-relationships)
- [Create and change appointments](#create-and-change-appointments)
- [Collections and time](#collections-and-time)
- [Error contract](#error-contract)
- [Bulk and long-running work](#bulk-and-long-running-work)

## REST and resource meaning

REST is an [architectural style](https://ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm) for networked hypermedia systems. Fielding derives client-server separation, stateless interactions, cache constraints, a uniform interface, layered systems and optional code on demand. The uniform interface includes resource identification, manipulation through representations, self-descriptive messages and hypermedia that lets a client discover valid state transitions. A JSON API with tidy nouns and HTTP verbs can be useful while implementing only some of those constraints. Call it an HTTP API or a REST-style API when hypermedia is absent; do not imply that plural paths alone establish REST.

A **[resource](../../GLOSSARY.md#resource)** is whatever the API identifies: a physician, an appointment collection or a computed availability view. Its **[representation](../../GLOSSARY.md#representation)** is the transferable description returned now. A database table is an implementation detail, so one resource can assemble data from several tables. The organization's public appointment model need not expose internal row columns. [Google AIP-121](https://google.aip.dev/121) recommends resource-oriented design for Google's RPC APIs and explicitly notes that it does not mirror database schema; it is guidance, not a rule imposed by HTTP.

## Resources and relationships

For this EPS, a physician and a care site have stable identities, and the authorized organization owns the visible collections:

| Target | Meaning |
| --- | --- |
| `/v1/physicians` | The organization's physician collection |
| `/v1/physicians/phy_42` | One physician within the authorized organization |
| `/v1/sites/site_7` | One care site in the provider network |
| `/v1/appointments` | The organization's appointment collection, optionally filtered |
| `/v1/appointments/apt_71` | One appointment within the authorized organization |

Plural nouns and lower-case path segments are handbook conventions. They make similar operations easy to find; [RFC 3986](https://www.rfc-editor.org/rfc/rfc3986.html) does not demand them. Identifiers are opaque to clients. An organization identifier in the path may be useful for an administrator who can act across organizations, but this user contract derives the tenant from verified identity. The server still scopes every lookup by that identity.

Availability is a computed view of a physician's site assignment, working hours, unavailable periods and active appointments. `GET /v1/physicians/{physicianId}/availability?siteId=site_7&date=2026-11-12` fits a consumer asking for one physician at one site: the parent identifies the physician, while `siteId` and `date` select the view. `GET /v1/availability?siteId=site_7&physicianId=phy_42&date=2026-11-12` is equally valid URI syntax and may be a better collection when consumers need availability across physicians or specialties. Neither shape grants authorization or follows a REST-mandated path pattern. Keep the first for the single-physician workflow; add a cross-physician query only after it has a consumer and defined result contract.

The site's agenda is a cross-physician view: `GET /v1/appointments?siteId=site_7&date=2026-11-12`. Nesting appointments under every physician would make this query awkward and could suggest false ownership. The site filter also selects the time zone used for `date`. A nested URI is useful when the parent is part of the resource's stable identity or narrows a common operation; avoid repeating the same mutable relationship in multiple canonical paths. [Azure's API design guidance](https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design) treats collections, items and navigation as design choices.

## Create and change appointments

The EPS chooses this public contract. Each request is authenticated and scoped to the caller's organization. The application verifies that `pat_18` is affiliated, `site_7` belongs to the network, `phy_42` works at that site and the caller may schedule there. A successful create returns `201 Created`, `Location: /v1/appointments/apt_71` and an appointment representation.

```http
POST /v1/appointments HTTP/1.1
Content-Type: application/json

{"physicianId":"phy_42","patientId":"pat_18","siteId":"site_7","startsAt":"2026-11-12T14:00:00Z","endsAt":"2026-11-12T14:30:00Z"}
```

The Domain owns `startsAt < endsAt` and the no-overlap rule. The Application coordinates affiliation, site access, physician assignment, a transaction and persistence. The HTTP adapter checks that the fields are present and timestamps parse. This organization returns `422` for a well-formed interval whose end does not follow its start. Two requests can pass an availability read before either commits, so the database must also enforce the booking conflict; the [reliability chapter](reliability-and-operations.md#two-bookings-for-one-slot) shows how. `POST` is appropriate because the server assigns `apt_71` under the collection. [RFC 9110 §9.3.3](https://www.rfc-editor.org/rfc/rfc9110.html#section-9.3.3) gives POST processing semantics.

Rescheduling changes two fields together. The organization accepts a JSON Merge Patch document and applies it atomically to the appointment before checking the resulting interval:

```http
PATCH /v1/appointments/apt_71 HTTP/1.1
Content-Type: application/merge-patch+json
If-Match: "apt-71-v3"

{"startsAt":"2026-11-12T15:00:00Z","endsAt":"2026-11-12T15:30:00Z"}
```

`PATCH` means apply a patch; the media type defines how the document changes state. Under [JSON Merge Patch](https://www.rfc-editor.org/rfc/rfc7396.html), omitted fields remain unchanged and `null` removes a member. Removing required appointment fields is invalid. The server checks the complete result and returns the updated representation and a new ETag. A failed `If-Match` yields `412`; a current-version interval that overlaps another booking yields `409`. [RFC 5789](https://www.rfc-editor.org/rfc/rfc5789.html) defines PATCH and its atomic application requirement. The [reliability chapter](reliability-and-operations.md#optimistic-concurrency) owns ETag mechanics.

`PUT` replaces the target resource state. It works when the client can send a complete replacement to a known URI. An appointment has server-owned identity, audit and status fields, so this organization does not expose a full-replacement PUT. Treating PUT as an informal partial update would make retry behavior and missing-field meaning unclear. `PATCH` can be idempotent for a specific patch such as replacing both timestamps with fixed values, but PATCH is not idempotent by definition.

Cancellation is a business transition, not physical deletion. The organization accepts `PATCH /v1/appointments/apt_71` with `{"status":"cancelled"}` and `If-Match`; Domain allows only the defined transition from an active appointment. The endpoint does not permit arbitrary status edits. A successful cancellation returns the updated appointment. `DELETE` would be appropriate for a genuinely deletable resource, such as a temporary draft that the service removes; it would hide the retained appointment history here. An alternative explicit cancellation subresource can make sense when cancellation has its own identity, reason and lifecycle. Document one contract rather than exposing both casually.

## Collections and time

For small, stable collections, `?limit=20&offset=40` is simple and supports direct page jumps. A growing appointment history can shift between offset requests, causing duplicates or gaps. This organization instead returns `items` and an opaque `nextCursor` for history, sorted by `(startsAt DESC, id DESC)`. The cursor carries or resolves the last sort position and is bound to the authorized tenant, filter and sort order. The server caps page size; a client must not parse or edit the cursor. This is a contextual design choice. [Google AIP-158](https://google.aip.dev/158) describes pagination for Google APIs; [Zalando's guidelines](https://opensource.zalando.com/restful-api-guidelines/) compare pagination options.

`GET /v1/appointments?siteId=site_7&date=2026-11-12` interprets `date` in that site's IANA time zone. Build the local day's `[00:00 next day)` interval in that zone, then convert its boundaries to instants for storage queries. A day can be 23 or 25 hours near daylight saving transitions. Appointment `startsAt` and `endsAt` are RFC 3339 date-times with offsets; a UTC `Z` value is used in the examples. Keep the site zone as a separate field when a future local recurrence or scheduling decision needs it. [RFC 3339](https://www.rfc-editor.org/rfc/rfc3339.html) specifies the timestamp format; it does not choose the site's interval policy.

Filtering (`status=active`), sorting (`sort=-startsAt`) and searching (`q=ruiz`) need documented allowed fields, defaults and limits. Do not promise arbitrary SQL-like expressions through query parameters. A query that spans several resource types may deserve its own read model. The client must treat a cursor as an opaque continuation, and the server must state whether pages are a consistent snapshot or a moving view; this organization promises a moving view and stable order, not a snapshot across requests.

## Error contract

The organization uses `application/problem+json` for errors. [RFC 9457](https://www.rfc-editor.org/rfc/rfc9457.html) defines Problem Details and its standard members. The example type is an organization-defined URI identifier; a deployed API should host documentation at its real type URI. The RFC does not prescribe this particular problem or its HTTP status.

```http
HTTP/1.1 409 Conflict
Content-Type: application/problem+json

{"type":"https://api.example.test/problems/slot-unavailable","title":"Slot unavailable","status":409,"detail":"The physician has another appointment in this interval."}
```

`type` is a stable machine-readable category. `detail` is human-oriented and may change or be localized. The server must not expose another patient's identity in a conflict explanation. Malformed JSON or an invalid timestamp yields `400` with a different problem type; an authenticated caller denied access gets `403` or a deliberate `404`. Use the [status definitions](http-and-identifiers.md#status-and-cache-meaning) rather than returning `200` with an error flag.

## Bulk and long-running work

One appointment creation is a short synchronous operation. Importing an organization's historical appointments may take minutes and produce row-level failures. For that distinct need, `POST /v1/import-jobs` can create a job and return `202 Accepted` with a job URI; the client polls `GET /v1/import-jobs/{jobId}` for state and results. Define cancellation, expiry, partial failure and idempotency before exposing it. [RFC 9110 §15.3.3](https://www.rfc-editor.org/rfc/rfc9110.html#section-15.3.3) defines `202` as noncommittal acceptance, not eventual success. A bulk endpoint also needs an explicit atomicity policy: all items in one transaction, or per-item outcomes. Do not turn ordinary bookings into background jobs without a latency or workflow reason.

Try the [design exercises](exercises/design.md). The [contracts chapter](contracts-and-boundaries.md) turns this public meaning into owned TypeScript boundaries.

[Previous: HTTP and Identifiers](http-and-identifiers.md) · [Next: Contracts and Boundaries](contracts-and-boundaries.md) · [Sources](references.md)
