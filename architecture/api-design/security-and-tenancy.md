# Security and Tenant Isolation

A clinic user can retrieve `apt_71`. Changing the ID to another clinic's appointment must not reveal its patient, even when that other ID exists. Verifying who sent a request is only the first step; every operation also needs a decision about what that person may do to this object.

Read [Contracts and Implementation Boundaries](contracts-and-boundaries.md) first. This chapter owns API access and tenant-boundary reasoning. It is a design guide, not a substitute for a threat review of a deployed system.

**Contents**

- [Identity and permission](#identity-and-permission)
- [Scope every object](#scope-every-object)
- [Database defense in depth](#database-defense-in-depth)
- [Other request threats](#other-request-threats)
- [Verify the boundary](#verify-the-boundary)

## Identity and permission

**[Authentication](../../GLOSSARY.md#authentication)** establishes a principal from a credential. **[Authorization](../../GLOSSARY.md#authorization)** decides whether that principal may perform an operation on a specific resource. The clinic's server verifies a credential, resolves the user's clinic memberships and permissions, and passes a trusted `clinicId` into the application command. A body field such as `clinicId: "another-clinic"` is ignored or rejected; it cannot override verified context.

Several credential mechanisms fit different clients:

| Mechanism | Useful when | Boundary to remember |
| --- | --- | --- |
| Server session cookie | Browser UI with server-managed login | Cookie is an opaque handle to server state; protect state-changing requests from CSRF |
| Bearer access token | An authorized mobile or service client calls the API | Anyone holding the token can use it until it expires or is revoked; use TLS and validate issuer, audience, expiry and scopes, plus a JWT signature or opaque-token introspection as appropriate |
| JWT | A compact signed claims format for a token | A JWT is a format, not an authorization decision or automatic revocation scheme |
| OAuth 2.0 | Delegated access or service-to-service authorization | Choose a current, suitable flow and validate access tokens; OAuth alone does not specify user login |
| OpenID Connect | A client needs interoperable user authentication on top of OAuth | Verify the ID token for the client; do not treat it as a generic API access token |
| API key | Identifying a server integration or metered caller | A key is often insufficient to identify a human or authorize a specific patient record |

[OAuth 2.0](https://www.rfc-editor.org/rfc/rfc6749.html) defines the authorization framework; [RFC 9700](https://www.rfc-editor.org/rfc/rfc9700.html) updates its security guidance. [OpenID Connect Core](https://openid.net/specs/openid-connect-core-1_0-errata2.html) defines an identity layer. [RFC 7519](https://www.rfc-editor.org/rfc/rfc7519.html) defines JWT. The clinic's choice of a trusted identity provider and token validation library is an integration decision; do not implement cryptography in a Controller.

Roles such as `receptionist` and `dentist` are a starting point for role-based access control. Attributes such as clinic membership, appointment ownership, assigned dentist and operation time can refine the decision. A receptionist may create appointments for their clinic, while a dentist may view their own agenda. A broad role check cannot replace object-level authorization. Keep the policy with the capability that owns the business meaning; an HTTP guard can reject obviously unauthenticated requests, while the Application checks the resource-specific decision using verified context. [OWASP API1:2023](https://api-security.owasp.org/editions/2023/en/0xa1-broken-object-level-authorization/) calls out broken object-level authorization.

## Scope every object

Every data access path must include the verified clinic scope: item reads, collections, joins, updates, deletes, exports and background jobs. The application should ask for `findAppointment({ clinicId, appointmentId })`, not load globally by ID and hope a later Controller check catches the mismatch. Check that both `patientId` and `dentistId` belong to the same clinic before a booking is committed. A cached response and cursor must carry an equivalent tenant boundary; a cursor from clinic A is invalid for clinic B.

The response mapper exposes only public fields needed by this consumer. A receptionist's agenda may need patient display name and time; it need not include diagnosis notes or identity documents. Field-level permission can differ from object-level permission. [OWASP API3:2023](https://api-security.owasp.org/editions/2023/en/0xa3-broken-object-property-level-authorization/) describes the risk of exposing or accepting unauthorized properties. Reject a `status`, `clinicId` or `createdBy` field in the create body when the server owns it; do not mass-assign unknown JSON into a persistence model.

For a hidden cross-clinic item, this contract returns `404` to avoid confirming existence. That response policy must be consistent, including timing and error detail where practical. An authorized clinic user who lacks a separate operation permission may receive `403`. This is a contextual disclosure decision within [HTTP status semantics](http-and-identifiers.md#status-and-cache-meaning), not a universal rule.

## Database defense in depth

PostgreSQL Row-Level Security (RLS) can make missing tenant predicates less likely to expose rows. It is a second boundary beneath application authorization. [PostgreSQL's RLS documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html) explains policies, default-deny behavior when RLS is enabled without policies, and roles that bypass it.

An illustrative policy for a UUID `clinic_id` column is:

```sql
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY clinic_appointments ON appointments
  USING (clinic_id = nullif(current_setting('app.clinic_id', true), '')::uuid)
  WITH CHECK (clinic_id = nullif(current_setting('app.clinic_id', true), '')::uuid);
```

The application starts a transaction, sets `app.clinic_id` from verified context with parameterized `select set_config('app.clinic_id', $1, true)`, then performs all tenant-scoped reads and writes on that same transaction connection. The final `true` makes the setting transaction-local. Commit or rollback clears the local context before a pooled connection is reused. If the setting is absent, the expression does not match a clinic row. Apply equivalent policies to other tenant tables that this role can access. This is a deployment-specific PostgreSQL mechanism, not an HTTP or architecture requirement.

Use an application database role without `BYPASSRLS`; table owners normally bypass RLS unless `FORCE ROW LEVEL SECURITY` is used. Migration roles can be more privileged and must not serve requests. Test any `SECURITY DEFINER` functions and privileged maintenance paths separately. RLS does not know that a receptionist may book but a patient may only read, and constraints can reveal information through errors. Application authorization and careful error mapping remain necessary. Tenant context must not be set outside the transaction and trusted to survive arbitrary pool checkout.

## Other request threats

The server accepts unknown input. Bound body size and collection page size before expensive work. Use parameterized SQL or an established query builder; transport validation alone does not stop injection. An outbound URL supplied by a caller needs an allowlist or constrained destination to avoid server-side request forgery. Keep credentials and patient details out of URLs, logs, traces and problem details. [OWASP's REST Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html) and [API Security Top 10](https://api-security.owasp.org/editions/2023/en/0x10-api-security-risks/) identify these failure modes.

Rate limits reduce request floods; quotas control sustained use and expensive operations. They are operational policies with identities, windows, headers and `429` behavior that clients can understand. A gateway can enforce coarse limits, but the application still protects expensive clinic operations and authorization. A limit does not replace capacity planning or per-resource cost bounds.

TLS protects traffic in transit. CORS tells a browser which origins may read cross-origin responses; it does not authorize non-browser clients. The [Fetch Standard's CORS protocol](https://fetch.spec.whatwg.org/#http-cors-protocol) defines that browser behavior. CSRF matters when browsers automatically send credentials such as cookies on state-changing requests. `SameSite`, CSRF tokens and origin checks are possible defenses chosen for the deployment. A bearer token explicitly attached by a client has a different CSRF exposure, but token theft and XSS remain relevant. [OWASP's CSRF Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html) explains the browser threat model.

## Verify the boundary

| Check | Expected result |
| --- | --- |
| No or invalid credential | Request fails before reading clinic data |
| Clinic A principal requests clinic B appointment ID | No appointment data is exposed |
| Clinic A principal submits clinic B patient or dentist ID | Creation is refused and no row is written |
| Receptionist submits server-owned `clinicId`, `status` or `createdBy` | The body is rejected or those fields are ignored by a documented policy |
| Cursor or cache entry from clinic A reused by clinic B | No clinic A data is returned |
| Database query omits tenant predicate with RLS enabled | App role still cannot read another clinic's row |
| App role has no tenant setting | Tenant table access fails closed |

Test these through the real HTTP boundary and a database role matching production, not only through a mocked use case. Also verify allowed access, or an over-restrictive policy can look secure while breaking the product. [OWASP API5:2023](https://api-security.owasp.org/editions/2023/en/0xa5-broken-function-level-authorization/) distinguishes function access from object access.

[Previous: Contracts and Boundaries](contracts-and-boundaries.md) · [Next: Reliability and Operations](reliability-and-operations.md) · [Sources](references.md)
