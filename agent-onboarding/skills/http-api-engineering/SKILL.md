---
name: http-api-engineering
description: Design, implement, extend, refactor, or review HTTP APIs when public contracts, protocol semantics, security, compatibility, or a strict REST claim matter. Use for HTTP endpoint work; GraphQL, gRPC, and WebSocket implementation need their own workflows.
---

# HTTP API Engineering

Use this skill in a **consuming application**. Its instructions and approved architecture decisions govern the work. The software-architecture handbook is a read-only reference: find its checkout from the application's instructions, record the commit actually read, and consult only relevant pages under `architecture/api-design/`. Do not assume NestJS, Express, Fastify, Prisma, or any other stack.

## Understand the operation

1. Identify what the consumer must accomplish and the observable success, refusal, and failure behavior. For an existing API, inspect routes, callers, published descriptions, tests, and compatibility promises before changing a contract.
2. Read application instructions and ADRs. Inspect framework and versions, persistence and transaction boundaries, authorization policy, deployment constraints, and the code that owns the affected rule.
3. Select the interface approach: **HTTP API** for an HTTP contract, **resource-oriented HTTP API** when resource identities organize it, or **REST API** only when all applicable [REST constraints](https://ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm) are designed and evidenced. Do not select REST merely because an API uses JSON, CRUD, or clean URLs. Explain the extra media-type, link-control, and client responsibilities when REST is required.

GraphQL is a query language, type system, and execution model; gRPC is an RPC framework. Compare them when useful, but do not implement them through this HTTP workflow. **WebSocket: Coming soon — specialized implementation support is not yet available.** This skill may identify WebSocket as a separate protocol choice, but does not implement endpoints or validate persistent bidirectional connections. An application may pursue that work separately.

## Design the public contract

Define only what the operation needs: resource identity and relationships; methods; request and response representations; media types and content negotiation; headers; status and problem responses; authentication and object-level authorization. Add pagination, filtering, cache policy, validators, conditional requests, retry keys, versioning, or deprecation rules when the consumer and failure modes need them. Keep server-owned fields out of writable input and avoid exposing database schema as the public contract.

Check [HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110.html) for safe and idempotent methods, GET/HEAD/POST/PUT/DELETE, statuses, representations, and preconditions; [PATCH](https://www.rfc-editor.org/rfc/rfc5789.html) for patch behavior; [HTTP Caching](https://www.rfc-editor.org/rfc/rfc9111.html) for reuse; and [Problem Details](https://www.rfc-editor.org/rfc/rfc9457.html) for error representation. Distinguish those requirements from application conventions such as plural paths or a `/v1` prefix. Preserve existing consumers unless a breaking change is explicitly approved.

Use OpenAPI when a machine-readable HTTP contract helps review or tooling. Check the [latest published specification](https://spec.openapis.org/oas/latest.html) and the application's tool support; choose a supported version deliberately. Validate the description and compare it with running behavior. An OpenAPI file does not perform runtime validation or prove REST conformance.

### When REST is required

Evaluate **client–server separation, stateless interactions, explicit cache constraints, the uniform interface, layered system, and optional code-on-demand**. The uniform interface requires resource identification, manipulation through representations, self-descriptive messages, and **hypermedia-driven application state**. Code-on-demand is optional; hypermedia is not. [Fielding's clarification](https://roy.gbiv.com/untangled/2008/rest-apis-must-be-hypertext-driven) rules out calling a fixed-path CRUD client REST solely because it uses HTTP.

Choose a hypermedia media type whose links and actions the client can interpret. Start at a known entry URI; let representations advertise resource links and state-dependent actions. Use [registered link relations](https://www.rfc-editor.org/rfc/rfc8288.html) only in their defined context: for example, [`item` links from a collection to a member and `collection` links from a member to its collection](https://www.rfc-editor.org/rfc/rfc6573.html). Publish the meaning of application-specific relations or action controls. The client may know the entry URI and media type or profile, but must not need a hardcoded catalog of transition URLs. Arbitrary `_links` fields without defined semantics are insufficient. If the application cannot meet a required constraint, explain the conflict and offer an accurately named HTTP or resource-oriented HTTP API rather than silently weakening the REST request.

## Implement at the owned boundaries

Use the application's existing stack and approved organization. Place transport parsing and HTTP mapping at the delivery boundary; keep business invariants with their authoritative owner; coordinate the operation, permissions, transaction, and required integrations in their existing owners. Add a port, adapter, mapper, service, or layer only when this change needs that boundary. Preserve existing data, callers, and migration paths.

Address actual risks: authentication, function and object authorization, tenant scoping, property-level access, input and resource limits, sensitive data, concurrency, lost updates, idempotent retries, timeouts, and safe error/log output. Apply [OWASP API Security Top 10](https://api-security.owasp.org/editions/2023/en/0x11-t10/) to the relevant threat model; do not add unrelated mechanisms.

## Verify and report

Run meaningful checks at the boundaries changed: business-rule tests; HTTP contract tests for methods, status, headers, representations, errors, and authorization; integration tests for persistence or other real dependencies; and compatibility checks for known consumers. Check OpenAPI syntax and observed behavior when used. Exercise cache, retry, concurrency, or conditional-request behavior when the contract depends on it. A mocked repository cannot prove a database race guarantee.

For a REST claim, demonstrate or test a client that begins at the entry URI, follows advertised controls to a resource, sees a state-dependent action, performs it, and discovers the resulting state. Check that the client understands the published control semantics, authenticates each request, and does not forward credentials to an untrusted link or redirect. Test a stale action and a lost POST response when the transition changes state. This one transition is evidence of hypermedia use, not proof of every REST constraint. Also reject this negative case: JSON with GET/POST and clean resource URLs but **no hypermedia** is not strictly REST. For a WebSocket request, state this skill's support limit and the separate work needed; do not claim WebSocket is impossible in the application.

Report the required behavior, chosen interface approach and rationale, public contract and files changed, affected responsibilities, security and reliability decisions, checks actually run and their results, handbook commit consulted, and remaining limits. When REST is claimed, report evidence for each applicable constraint and the hypermedia transition. If a check could not run, say so.
