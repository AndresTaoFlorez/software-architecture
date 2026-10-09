# HTTP and Identifiers

A scheduling coordinator opens a list of physicians. The browser asks the server for that list and receives data it can display. Before designing appointment rules, we need to know what the two sides promised each other and what an HTTP message actually says.

Read [the route](README.md) first. No backend framework is needed. This chapter owns the basic HTTP vocabulary used throughout the track.

**Contents**

- [The public boundary](#the-public-boundary)
- [A request and a response](#a-request-and-a-response)
- [Identify the target](#identify-the-target)
- [Method properties](#method-properties)
- [Status and cache meaning](#status-and-cache-meaning)

## The public boundary

An **API** is a supported set of interactions a consumer can rely on. For the organization, the HTTP API includes paths, methods, accepted inputs, response shapes, errors, authorization rules and evolution promises. The **[API contract](../../GLOSSARY.md#api-contract)** is the observable part of that agreement. It is wider than a list of URLs.

An [endpoint](../../GLOSSARY.md#http-endpoint) is one exposed method and target, such as `GET /v1/physicians/{physicianId}`. A [route](../../GLOSSARY.md#http-route) is the server's matching rule for incoming requests. A [handler](../../GLOSSARY.md#route-handler) is the function selected by that rule. A [Controller](../../GLOSSARY.md#controller) may group handlers. These are implementation roles; a frontend consumer depends on the endpoint contract, not the Controller's filename.

The client sends a request across a network. HTTP defines the message semantics. The server may use a router and a Controller, call an application operation and consult a database, but those internal steps are not implied by HTTP. The [backend HTTP chapter](../backend/1-http-request-to-business-operation.md) applies these terms to a Ticket implementation.

## A request and a response

This HTTP/1.1 notation shows the parts without asking you to implement a protocol parser:

```http
GET /v1/physicians/phy_42 HTTP/1.1
Host: api.example.test
Accept: application/json
Authorization: Bearer <token>

```

```http
HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: private, no-cache

{"id":"phy_42","displayName":"Dr. Ana Ruiz"}
```

The request line identifies a method and target. Header fields carry metadata, such as the preferred response media type and a credential. After the blank line, a message can have a body. The response has a status, headers and, here, a JSON representation. `Accept` is a client preference; `Content-Type` identifies the representation actually sent. The request above has no body. In HTTP/2 and HTTP/3, the wire framing differs; the method, target, status and field meanings remain HTTP semantics. [RFC 9112 §2](https://www.rfc-editor.org/rfc/rfc9112.html#section-2) specifies the HTTP/1.1 text form; [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html) defines semantics across versions.

The response body is a **representation** of the physician resource, not the resource itself. Another representation could omit private fields, use another media type or reflect a later state. A request DTO, domain entity and stored row need not have the same shape; [Code Placement](../foundations/code-placement.md#8-where-does-a-type-belong) explains their owners.

## Identify the target

The full example URI is `https://api.example.test/v1/physicians/phy_42?include=workingHours#hours`. [RFC 3986 §3](https://www.rfc-editor.org/rfc/rfc3986.html#section-3) defines the generic syntax: `https` is the scheme, `api.example.test` the authority, `/v1/physicians/phy_42` the path, `include=workingHours` the query and `hours` the fragment. A URL is a URI that also provides a way to locate a resource. A fragment is interpreted by the client and is not part of the HTTP request target sent to the server.

`{physicianId}` is a route-template placeholder, not literal URI syntax. The client's `phy_42` fills one path segment. A query can select a view, filter or search, but RFC 3986 does not define query keys or require plural nouns. Those meanings belong to the API contract. `Authorization` is a header field; JSON appointment details belong in a body. Putting a credential or patient record in a URI risks exposure through logs, browser history and copied links.

Choose a stable resource identity before choosing a nested path. For this organization, `phy_42` is unique within the authorized organization, and the server always scopes lookup by that organization. A path that includes an organization identifier can make the hierarchy visible, but it cannot authorize the caller by itself. The [resource chapter](resources-and-operations.md#resources-and-relationships) works through nesting and cross-resource queries.

## Method properties

Methods tell generic HTTP components what the client intends. [RFC 9110 §9](https://www.rfc-editor.org/rfc/rfc9110.html#section-9) is normative for these meanings.

| Method | Defined intent | Typical organization use |
| --- | --- | --- |
| `GET` | Retrieve a current selected representation; safe and idempotent | Read a physician or a site's agenda |
| `HEAD` | Like GET without the response content; safe and idempotent | Read metadata when useful |
| `POST` | Ask the target resource to process the enclosed representation | Create an appointment in a collection |
| `PUT` | Create or replace the target resource's state; idempotent | Replace a client-addressed resource when the contract supports it |
| `PATCH` | Apply a patch document to the target | Reschedule an appointment using a documented patch format |
| `DELETE` | Remove the target resource's association; idempotent | Delete only if deletion matches business meaning |

**Safe** means the requested effect is read-only. Server logging does not make GET unsafe. **Idempotent** means repeating the same request has the same intended effect on server state; the responses may differ. POST is not generally idempotent. PATCH is not inherently idempotent either; its patch format and operation decide that. A booking operation must never hide behind GET, because link checkers and prefetchers can issue GET without user intent. [RFC 5789](https://www.rfc-editor.org/rfc/rfc5789.html) defines PATCH.

Transport failures can leave the client unsure whether a write happened. The [reliability chapter](reliability-and-operations.md#retries-and-duplicate-requests) distinguishes HTTP method idempotence from an application-level idempotency key.

## Status and cache meaning

HTTP status codes state the general outcome. The API's body explains specific errors. [RFC 9110 §15](https://www.rfc-editor.org/rfc/rfc9110.html#section-15) defines the main status classes and codes; [RFC 6585 §4](https://www.rfc-editor.org/rfc/rfc6585.html#section-4) defines `429`.

| Status | Use in the organization |
| --- | --- |
| `200 OK` | Return a physician, list or updated appointment representation |
| `201 Created` | A new appointment exists; return its URI in `Location` |
| `202 Accepted` | Work was accepted but has not finished |
| `204 No Content` | A completed operation has no response content |
| `400 Bad Request` | The request cannot be processed because its shape or syntax is invalid |
| `401 Unauthorized` | Authentication is required or credentials are invalid; an applicable challenge may be required |
| `403 Forbidden` | The verified caller lacks permission |
| `404 Not Found` | No resource is exposed at that target, including when policy deliberately hides existence |
| `409 Conflict` | A booking conflicts with current scheduling state |
| `412 Precondition Failed` | A supplied HTTP precondition, such as `If-Match`, failed |
| `422 Unprocessable Content` | The shape is understood but a supplied interval violates a documented semantic rule |
| `429 Too Many Requests` | The caller exceeded a request limit |

These mappings are organization decisions within the status definitions. A malformed timestamp is different from a well-formed appointment that overlaps a booked interval. The former fails transport parsing; the latter fails a business rule and is represented here as `409`. A client should branch on status and a documented machine-readable problem type, not parse English text. [Problem Details](resources-and-operations.md#error-contract) owns the error body.

A response to GET can be stored or reused only under HTTP cache rules and the server's policy. Organization data is user-specific, so this route uses `Cache-Control: private, no-cache`: a private cache may store it but must revalidate before reuse. `no-store` is the stronger choice when storing sensitive content is unacceptable. A shared cache must not reuse one organization's response for another. [RFC 9111](https://www.rfc-editor.org/rfc/rfc9111.html) defines cache behavior; the [operations chapter](reliability-and-operations.md#caching-performance-and-visibility) applies it.

Try the [foundation exercises](exercises/foundations.md) before designing the appointment resources.

[Previous: API Design route](README.md) · [Next: Resources and Operations](resources-and-operations.md) · [Sources](references.md)
