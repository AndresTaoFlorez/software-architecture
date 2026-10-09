# API Design & Engineering

A scheduling coordinator needs to read a care site's agenda, find a physician's free time, book an appointment and know whether the booking succeeded. A useful API gives that client a stable way to ask, a precise meaning for each response and a safe path through later changes. This route teaches those decisions without requiring Nest, React or a particular database.

You need basic TypeScript and HTTP curiosity. The shared [Code Placement](../foundations/code-placement.md) and [Dependency Boundaries](../foundations/dependency-boundaries.md) guides help with the implementation chapter. Read this route from top to bottom, or enter at a chapter whose prerequisites you already know.

## The health network and its contract

The running example is scheduling for a fictional Colombian *Entidad Promotora de Salud* (EPS). The EPS coordinates appointments for affiliated patients across a provider network; *Instituciones Prestadoras de Servicios de Salud* (IPS), such as clinics and hospitals, provide the care. [Colombia's Ministry of Health](https://www2.minsalud.gov.co/salud/Documents/Contenidos/aseguramiento-salud.aspx) distinguishes these responsibilities. Each [tenant](../../GLOSSARY.md#tenant) is one EPS organization with patients, physicians, care sites, working hours, unavailable periods and appointments. This example covers scheduling; coverage decisions and clinical records would need their own contracts.

An appointment occupies a half-open interval, `[start, end)`, for one physician at one site. Two active appointments for the same physician cannot overlap, even at different sites. In this case, one EPS tenant owns each physician's schedule; a physician scheduled by several independent organizations would need a shared scheduling authority. A site has an IANA time zone such as `America/Bogota`; stored appointment instants use UTC. Organization users see only their organization's data and only sites their role permits. These rules stay consistent throughout the route.

The examples use `/v1` as this handbook's illustrative public contract. It is a versioning choice, not an HTTP requirement. A signed-in user obtains the organization identity and permitted sites from verified server-side context; a caller cannot choose another tenant by changing a request field. A booking also checks the patient's affiliation and the physician's assignment to the selected site.

| Operation | Example | First taught |
| --- | --- | --- |
| List and retrieve physicians | `GET /v1/physicians`, `GET /v1/physicians/{physicianId}` | [HTTP and identifiers](http-and-identifiers.md) |
| Read a site's agenda and availability | `GET /v1/appointments?siteId=site_7&date=2026-11-12`, `GET /v1/physicians/{physicianId}/availability?siteId=site_7&date=2026-11-12` | [Resources and operations](resources-and-operations.md) |
| Create, reschedule and cancel | `POST /v1/appointments`, `PATCH /v1/appointments/{appointmentId}` | [Resources and operations](resources-and-operations.md) |
| Prevent overlapping bookings | one transaction and a database constraint | [Reliability and operations](reliability-and-operations.md) |

The dates above are examples. A `date` filter names a calendar day in the selected site's time zone. The API returns appointment times as RFC 3339 timestamps with an offset and exposes the site's IANA zone when a local scheduling decision depends on it.

## Read in order

1. [HTTP and identifiers](http-and-identifiers.md) — distinguish an API, endpoint, route and handler; read messages, URI components, methods and status codes. Then try [A-F1 and A-F2](exercises/foundations.md).
2. [Resources and operations](resources-and-operations.md) — model collections, relationships, REST constraints, updates, pagination, errors and time. Then finish [A-F3](exercises/foundations.md#a-f3--classify-two-failures) and try [design exercises](exercises/design.md).
3. [Contracts and implementation boundaries](contracts-and-boundaries.md) — describe the contract, validate unknown data and trace one request through owned files. Read [Code Placement](../foundations/code-placement.md) first.
4. [Security and tenant isolation](security-and-tenancy.md) — verify identity, authorize an object and keep tenant context within a transaction. Read the contracts chapter first.
5. [Reliability, evolution and operations](reliability-and-operations.md) — handle concurrent writes, retries, conditional requests, caching, testing and lifecycle changes. Then try [engineering exercises](exercises/engineering.md).
6. [Other interface styles and asynchronous delivery](interface-styles-and-events.md) — choose when GraphQL, gRPC, events, webhooks or an API gateway solve a real consumer problem. Read the HTTP route first; the reliability chapter supplies the failure vocabulary.

[Exercises and separate solutions](exercises/README.md) form a second route through the same case. Each exercise states its prerequisites, starting situation and observable result.

## How to read the rules

This route separates three kinds of statement:

- **Standard:** a cited specification defines protocol behavior, such as GET's safe semantics or `If-Match` evaluation.
- **Convention:** a published guideline or this handbook recommends a consistent shape, such as plural collection names.
- **Decision:** the organization chooses a contract after considering its consumers and failure modes, such as cursor pagination for an expanding history.

The [backend route](../backend/README.md) shows how Nest delivers HTTP and composes dependencies. The [frontend integration guide](../frontend/ports-and-adapters.md) shows a client consuming an external API. Both apply the general contract decisions here. The [glossary](../../GLOSSARY.md) gives short reminders, while these chapters own the detailed API explanations.

[Architecture map](../README.md) · [Repository home](../../README.md) · [Sources](references.md)
