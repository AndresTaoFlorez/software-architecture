# Contracts and Implementation Boundaries

A mobile client and a web client both book appointments. They need one published meaning for the request, even if the server changes its framework or database. The server also needs one place to reject malformed input and one authoritative place to enforce scheduling rules.

Read [Resources and Operations](resources-and-operations.md) and [Code Placement](../foundations/code-placement.md) first. This chapter owns the API-specific contract and an end-to-end implementation map. The existing foundation guides own the general layer and dependency rules.

**Contents**

- [Describe the agreement](#describe-the-agreement)
- [Validate at the boundary](#validate-at-the-boundary)
- [Trace one booking](#trace-one-booking)
- [Place the files](#place-the-files)
- [Keep contract and implementation aligned](#keep-contract-and-implementation-aligned)

## Describe the agreement

An API contract states the target and method, authentication, accepted fields, response representations, errors and change policy. **Contract-first** starts by reviewing that observable behavior with consumers, then implements it. **Code-first** derives a description from implemented route declarations and types. Either can work if review, runtime checks and published documentation stay in agreement. Contract-first helps when clients and servers are developed independently; code-first can be efficient for a small internal API with tight ownership. Generated output is evidence of what annotations say, not proof that the handler enforces them.

[OpenAPI 3.1](https://spec.openapis.org/oas/v3.1.2.html) is a machine-readable description format for HTTP APIs. This complete small description covers one clinic read operation; a production contract would add the remaining paths, responses and reusable schemas. The `openapi` value selects the 3.1 family, whose Schema Objects use the OpenAPI JSON Schema dialect based on [JSON Schema Draft 2020-12](https://json-schema.org/draft/2020-12). Schema syntax checks shapes; it cannot decide whether a dentist belongs to the caller's clinic. A `format` such as `date-time` needs deliberate validator configuration because JSON Schema treats format primarily as an annotation by default.

```yaml
openapi: 3.1.0
info:
  title: Clinic Scheduling API
  version: 1.0.0
paths:
  /v1/dentists/{dentistId}:
    get:
      operationId: getDentist
      security:
        - bearerAuth: []
      parameters:
        - name: dentistId
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Dentist visible to the authenticated clinic
          content:
            application/json:
              schema:
                type: object
                required: [id, displayName]
                properties:
                  id: { type: string }
                  displayName: { type: string }
        '404':
          description: No dentist is visible at this target
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
```

The description is a contract artifact, not a framework configuration. It does not choose how the bearer token is verified, how tenant membership is resolved or where data is stored. A generated client can provide typed calls for `getDentist`, but its types cannot validate an untrusted response at runtime. Generated SDKs also couple consumers to generator versions and may require regeneration for contract changes; publish a stable SDK only when maintenance and release ownership are clear.

## Validate at the boundary

The HTTP adapter receives unknown JSON. TypeScript types disappear at runtime, so the request parser checks required strings and RFC 3339 date-time syntax before the [Application](../../GLOSSARY.md#application-layer) operation receives a command. Use a maintained schema validator where it helps; do not write an HTTP parser or duplicate a full validation framework. A focused plain TypeScript guard can teach the mechanism first:

```ts
type CreateAppointmentRequest = {
  dentistId: string
  patientId: string
  startsAt: string
  endsAt: string
}

function parseCreateAppointmentRequest(value: unknown): CreateAppointmentRequest {
  if (typeof value !== 'object' || value === null) throw new Error('Invalid request')
  const body = value as Record<string, unknown>
  const { dentistId, patientId, startsAt, endsAt } = body
  if (typeof dentistId !== 'string' || !dentistId.trim() ||
      typeof patientId !== 'string' || !patientId.trim() ||
      typeof startsAt !== 'string' || !startsAt.trim() ||
      typeof endsAt !== 'string' || !endsAt.trim()) throw new Error('Invalid request')
  return { dentistId, patientId, startsAt, endsAt }
}
```

This teaching excerpt checks presence and type only. A real parser must also reject or define unknown fields, enforce size limits and validate timestamp format and ranges. A schema library can implement those transport checks. It must not become the only owner of the no-overlap rule. The [Domain](../../GLOSSARY.md#domain) checks `startsAt < endsAt` and scheduling eligibility; the [Application](../../GLOSSARY.md#application-layer) coordinates membership, persistence and transaction scope. Parsing a well-formed timestamp into an instant is boundary translation. Authoritative business validity must hold when a CLI or message consumer invokes the same operation.

A request [DTO](../../GLOSSARY.md#data-transfer-object-dto) represents the HTTP wire shape. An application command represents an operation's accepted input. A domain appointment represents business state and rules. A database record reflects storage. A [mapper](../../GLOSSARY.md#mapper) translates between accepted shapes; a [parser](../../GLOSSARY.md#parser) decides whether an unknown shape is accepted. The [Code Placement guide](../foundations/code-placement.md#8-where-does-a-type-belong) is the canonical owner of these distinctions.

## Trace one booking

The client sends `POST /v1/appointments` over the network. The router selects a handler. Authentication verifies the credential and yields a principal; authorization checks the principal's clinic membership and whether this actor may book. The parser validates the request shape, then the Controller maps it to `CreateAppointment`. The Application checks that the referenced patient and dentist belong to the verified clinic, asks Domain to evaluate the interval and calls the supplied persistence object inside one transaction. The adapter writes to PostgreSQL. A database exclusion constraint closes the race between concurrent bookings. The returned appointment is mapped to a public response, and the Controller sends `201` with `Location` to the client.

This is a **runtime** flow, not a mandatory list of objects. A simple read may need no Domain operation and no transaction. Authentication may be performed before the route handler or by a framework guard. The network call ends at the server; the database call is a separate connection. A port/interface does not receive a runtime call of its own: the supplied adapter object does. A transaction begins after parsing and authorization, encompasses the membership and write decisions that must be consistent, and commits before `201` is emitted. [Nest's request lifecycle](https://docs.nestjs.com/faq/request-lifecycle) has its own middleware, guard, interceptor and pipe order; do not infer that order from the conceptual paragraph.

For **source dependencies**, the Controller imports the Application operation and HTTP types; Application imports Domain and its required port; the PostgreSQL adapter imports the port it implements and the database client. Domain imports neither HTTP nor PostgreSQL. At **startup**, composition constructs the adapter and supplies it to the operation and Controller. [Dependency Boundaries](../foundations/dependency-boundaries.md) and [Composition](../foundations/composition-root.md) explain those relationships in detail.

## Place the files

The table identifies the files a Nest and PostgreSQL implementation of this one operation would need. All `src/` paths follow the handbook's layer-first convention; they are not mandated by Nest. A real application's package manifest, TypeScript configuration and deployment settings are also required to execute it. This repository contains illustrative excerpts, not that complete application.

| File | Responsibility and source imports | Runtime caller or collaborator | Status |
| --- | --- | --- | --- |
| `src/main.ts` | Bootstrap Nest; imports `AppModule` and `loadConfig` | Starts HTTP server | Required |
| `src/composition/AppModule.ts` | Registers Controller, authentication, use case, database and adapter provider; imports their public symbols | Nest startup constructs providers | Required |
| `src/composition/config/loadConfig.ts` | Checks database URL, issuer, audience and port from environment | `main.ts`/providers | Required |
| `src/presentation/http/appointments/controllers/AppointmentsController.ts` | Route declaration, command/response mapping; imports use case, parser and mapper | Nest router | Required |
| `src/presentation/http/appointments/dto/CreateAppointmentRequestDto.ts` | Accepted HTTP body type/schema; imports no Domain entity | Parser | Required |
| `src/presentation/http/appointments/parsers/parseCreateAppointmentRequest.ts` | Checks unknown body; imports request schema | Controller or Nest pipe | Required |
| `src/presentation/http/appointments/mappers/mapAppointmentResponse.ts` | Maps result to public fields; imports application result | Controller | Required |
| `src/presentation/http/auth/guards/ClinicAccessGuard.ts` | Verifies identity and route access using the supplied verifier | Nest before Controller | Required |
| `src/infrastructure/auth/OidcTokenVerifier.ts` | Applies the selected established identity library and configured issuer/audience | Guard calls supplied instance | Required for this deployment choice |
| `src/presentation/http/errors/ProblemFilter.ts` | Maps uncaught failures to safe RFC 9457 responses; Controller maps expected results | Nest on failures | Required |
| `src/application/appointments/use-cases/CreateAppointment.ts` | Coordinates membership, Domain decision and persistence; imports Domain and required port | Controller | Required |
| `src/application/appointments/contracts/CreateAppointmentCommand.ts` | Operation input with verified clinic ID and parsed instants | Controller/use case | Required |
| `src/application/appointments/contracts/CreateAppointmentResult.ts` | Success or known refusal, including unavailable slot | Use case/Controller | Required |
| `src/application/appointments/ports/AppointmentRepository.ts` | Required clinic-scoped reads and writes inside a transaction callback; no PostgreSQL imports | Use case; implemented by adapter | Required |
| `src/domain/appointments/Appointment.ts` | Valid interval and state transitions; no outer imports | Use case | Required |
| `src/domain/appointments/BookingPolicy.ts` | Working-hours and unavailable-period eligibility from supplied facts | Use case | Required |
| `src/infrastructure/persistence/appointments/PostgresAppointmentRepository.ts` | Implements port, maps rows and SQL errors | Use case calls supplied instance | Required |
| `src/infrastructure/persistence/postgres/Database.ts` | Database pool and transaction helper | Repository | Required |
| `db/migrations/001_appointments.sql` | Clinic-scoped keys and non-overlap constraint | Migration runner before serving traffic | Required |
| `db/migrate.ts` | Applies versioned migrations using a chosen migration library | Deployment before startup | Required for this deployment choice |
| `tests/appointments/createAppointment.test.ts` | Tests rule and operation through a fake port | Test runner | Required for this example's verification |
| `tests/appointments/appointmentApi.test.ts` | Tests HTTP parsing, authorization and response with a test server | Test runner | Required for this example's verification |
| `openapi/clinic.yaml` | Published public contract reviewed with consumers | Documentation/client tooling | Required for contract-first delivery |
| `src/presentation/http/appointments/pipes/CreateAppointmentPipe.ts` | Adapts parser to Nest's pipe mechanism | Nest before Controller | Optional |
| `src/infrastructure/persistence/appointments/AppointmentRow.ts` | Explicit stored-row type if generated database types do not suffice | Repository | Optional |
| `src/generated/database-types.ts` | Tool-produced types from the chosen database tooling | Repository | Generated, if that tooling is used |
| `package.json` and `tsconfig.json` | Dependencies, scripts and TypeScript/runtime resolution | Build and deployment tooling | Required for a runnable application, omitted here |

`AppModule` registration and the Nest guard are framework application details. The same Application and Domain can be reached by a plain Node handler. [Nest controllers](https://docs.nestjs.com/controllers), [providers](https://docs.nestjs.com/providers), [modules](https://docs.nestjs.com/modules) and [pipes](https://docs.nestjs.com/pipes) define the framework mechanisms; [Node's HTTP module](https://nodejs.org/api/http.html) is lower level and does not supply this architecture. The [backend Ticket walkthrough](../backend/4-create-ticket-with-nestjs.md) shows the repository's existing Nest example rather than repeating it here.

## Keep contract and implementation aligned

Review a change against all consumers. Adding an optional response field is often compatible for tolerant JSON clients, but generated models with strict deserialization can still break. Removing a field, changing its meaning, narrowing accepted input or making a formerly optional field required is usually breaking. A new error type can also break clients that assumed only one outcome. The [evolution chapter](reliability-and-operations.md#contract-evolution-and-governance) gives a review sequence.

Contract tests send representative requests against the running HTTP boundary and assert method, status, headers, body shape and negative cases, independently of the Controller's internal classes. OpenAPI linting and schema validation catch description defects; they do not prove authorization or business behavior. The API's human documentation should use the same published contract and include examples, error meanings, authentication setup and deprecation notices. A drift check compares the published description with observed behavior at release time.

[Previous: Resources and Operations](resources-and-operations.md) · [Next: Security and Tenant Isolation](security-and-tenancy.md) · [Sources](references.md)
