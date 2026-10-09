# API Design Sources

The chapters cite the source beside each technical claim. This page records the versions and authority of the main references used when designing the track. A standard defines its stated protocol behavior; a company guideline describes that organization's choices; a community skill is a research aid.

**Contents**

- [Protocol and description standards](#protocol-and-description-standards)
- [Security, implementation and other styles](#security-implementation-and-other-styles)
- [Published design guidance](#published-design-guidance)
- [Community skills inspected, not installed](#community-skills-inspected-not-installed)

## Protocol and description standards

- [RFC 3986 — URI Generic Syntax](https://www.rfc-editor.org/rfc/rfc3986.html): URI components and normalization, not plural resource names.
- [RFC 9110 — HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110.html), [RFC 9111 — HTTP Caching](https://www.rfc-editor.org/rfc/rfc9111.html) and [RFC 9112 — HTTP/1.1](https://www.rfc-editor.org/rfc/rfc9112.html): method, status, representation, cache and HTTP/1.1 message rules.
- [RFC 5789 — PATCH](https://www.rfc-editor.org/rfc/rfc5789.html), [RFC 7396 — JSON Merge Patch](https://www.rfc-editor.org/rfc/rfc7396.html) and [RFC 6902 — JSON Patch](https://www.rfc-editor.org/rfc/rfc6902.html): patch method and two distinct patch document formats.
- [RFC 9457 — Problem Details](https://www.rfc-editor.org/rfc/rfc9457.html): interoperable problem representation, not a clinic-specific status taxonomy.
- [RFC 3339 — Internet Timestamps](https://www.rfc-editor.org/rfc/rfc3339.html): date-time notation used in representations.
- [RFC 9745 — Deprecation](https://www.rfc-editor.org/rfc/rfc9745.html) and [RFC 8594 — Sunset](https://www.rfc-editor.org/rfc/rfc8594.html): response metadata for lifecycle communication.
- [OpenAPI Specification 3.1.2](https://spec.openapis.org/oas/v3.1.2.html) and [JSON Schema Draft 2020-12](https://json-schema.org/draft/2020-12): contract description and JSON shape vocabulary. [The OpenAPI version index](https://spec.openapis.org/oas/) also lists later releases; the teaching example deliberately uses the 3.1 family.
- [Fielding's REST dissertation, chapter 5](https://ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm): the original REST constraints and their rationale.

## Security, implementation and other styles

- [OWASP API Security Top 10, 2023](https://api-security.owasp.org/editions/2023/en/0x10-api-security-risks/) and [REST Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html): risk catalog and defensive guidance, not replacements for a deployment threat model.
- [OAuth 2.0, RFC 6749](https://www.rfc-editor.org/rfc/rfc6749.html), [OAuth Security BCP, RFC 9700](https://www.rfc-editor.org/rfc/rfc9700.html) and [OpenID Connect Core 1.0 with errata set 2](https://openid.net/specs/openid-connect-core-1_0-errata2.html): authorization framework, updated security guidance and identity layer.
- [PostgreSQL Row Security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html), [Range Types](https://www.postgresql.org/docs/current/rangetypes.html) and [`btree_gist`](https://www.postgresql.org/docs/current/btree-gist.html): database-specific tenant and overlap mechanisms.
- [Nest request lifecycle](https://docs.nestjs.com/faq/request-lifecycle) and [Node HTTP module](https://nodejs.org/api/http.html): framework and runtime mechanics, not general API architecture rules.
- [GraphQL specification](https://spec.graphql.org/), [gRPC documentation](https://grpc.io/docs/what-is-grpc/introduction/), [AsyncAPI 3.0](https://www.asyncapi.com/docs/reference/specification/v3.0.0) and [CloudEvents 1.0.2](https://github.com/cloudevents/spec/blob/v1.0.2/cloudevents/spec.md): distinct query, RPC, message-interface and event-format sources.

## Published design guidance

- [Google AIP-121](https://google.aip.dev/121) and [AIP-158](https://google.aip.dev/158): Google's resource-oriented and pagination rules for its APIs. They are not IETF requirements for every HTTP API.
- [Microsoft REST API Guidelines](https://github.com/microsoft/api-guidelines) and [Azure API design](https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design): organizational guidance and design trade-offs.
- [Zalando RESTful API Guidelines](https://opensource.zalando.com/restful-api-guidelines/): another public organizational convention set. It differs from some Microsoft and Google choices, especially in versioning and naming.

## Community skills inspected, not installed

- [WSO2 `api-design`](https://github.com/wso2/agent-skills/blob/main/plugins/api-platform/skills/api-design/SKILL.md) is present in WSO2's active `api-platform` repository. It guides OpenAPI creation and assessment against WSO2 conventions. Its WSO2-specific defaults and interactive checkpoints are useful prompts for contract review, not general standards.
- [joshmcadams `rest-api-design`](https://github.com/joshmcadams/agent-skills) is present in a public repository with multiple specialized skills. Its README says it adapts Zalando guidance and deliberately changes URL versioning and the `/api` base path. Those differences are explicit evidence that these are conventions, not universal rules.
- [magnus919 `api-design-and-evolution`](https://github.com/magnus919/agent-skills/blob/main/api-design-and-evolution/SKILL.md) is present in a public repository and covers consumer jobs, failure behavior and compatibility. Its broad workflow is useful as a review checklist; its recommendations are checked against the primary sources above.

The repositories were inspected for availability and scope during this change. No third-party skill was installed or executed. Maintenance activity and versions can change; the direct source links above are the authority for the claims made in this handbook.

[API Design route](README.md) · [Architecture map](../README.md)
