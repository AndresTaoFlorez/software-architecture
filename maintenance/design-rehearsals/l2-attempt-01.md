# L2 Architecture Rehearsal — Attempt 01

Frozen design-only candidate answer against `1c9deb1558b9d50737d6979dabab308350468c67`. See the [matrix and independent verdict](../architecture-combination-matrix.md). This is evaluation evidence, not a canonical implementation. The editorial preface is added and one trailing blank line is removed for Markdown whitespace consistency; the response otherwise remains unchanged, without correction or redaction. Raw artifact SHA256 `1db32ae8758f5501cff1093abaa1b5e19fadfdb987e2629e47ace74aa1fed5d4`, 18461 bytes. Proposed checks remain unexecuted.

---

# Reporting architecture scheme — L2, attempt 01

The proposed system uses a Layered backend with Dependency Inversion and an interactive MVVM browser. These are **requirements**, not interchangeable labels: Layered separates responsibilities; inversion determines source ownership of the report-reading contract; MVVM separates rendering from screen state and commands. Logical layers do not imply separate deployments.

Evidence is the consumer instructions, three explicitly loaded copied skills, and handbook H at pinned revision `1c9deb1558b9d50737d6979dabab308350468c67`. H is an exported snapshot without Git metadata; revision provenance is the supplied controller receipt, not an independently resolved HEAD. No application, schema, stack, tests or accepted ADR exists. “Same reporting product” supplies no report fields or mutation requirement in this workspace. This scheme therefore covers reading reports and changing browser filters/theme; report-specific fields, calculation semantics, data classification and volume remain decisions before implementation. No unrelated write workflow is invented.

The path layout is a **handbook convention**; filenames, contracts and mechanisms below are **design inferences**. Sources support their stated principles, not those invented names. This follows `architecture/foundations/architecture-design-review.md`, “Establish the decision and evidence” and “Describe owners and supported interactions.”

## Owners and physical map

All paths below are proposed relative to each side’s `src/`. Braces identify listed artifacts within a branch.

| Backend path | Authoritative responsibility, entry and consumers |
| --- | --- |
| `domain/reporting/ReportPolicy.ts` | Pure report-query meaning: supported selection combinations and any confirmed business limits. Application calls it; no HTTP, SQL or UI imports. Do not invent an entity merely to hold projected rows. |
| `application/reporting/contracts/{ReadReportQuery,ReportResult}.ts` | Caller-neutral query/result and named failures. Neither SQL rows nor HTTP DTOs. |
| `application/reporting/ports/{ReportReader,ReportAccess}.ts` | Required scoped projection read and resource-permission lookup; concrete integrations implement these. |
| `application/reporting/use-cases/ReadReport.ts` | Coordinates trusted actor, report access, policy and reader. Public `application/reporting/index.ts` exposes execution and caller contracts; private workflow helpers stay private. |
| `presentation/http/reporting/{ReportController,parseReportQuery,mapReportResponse}.ts` | Incoming shape checks, invocation and protocol mapping. Its `dto/ReportResponseDto.ts` owns wire fields. It cannot bypass the operation to query storage. |
| `presentation/http/security/requireIdentity.ts` | Rejects missing/unverified credentials; obtains verified principal through a supplied verifier. Never accepts actor/scope claims from query fields. |
| `infrastructure/security/{SessionVerifier,DatabaseReportAccess}.ts` | Conditional identity mechanism and current permissions lookup. No custom cryptography. |
| `infrastructure/persistence/reporting/SqlReportReader.ts` | Conditional SQL implementation, parameter binding, scope predicates, projection mapping, timeout and driver-error translation. No response formatting. |
| `composition/{bootstrap,reportingDependencies}.ts` | Creates verifier/access reader/data reader and operation, then controller/router; owns implementation choice and lifetimes. |

A single backend domain policy is justified only for meaningful report rules. If discovery finds only a fixed read projection with syntactic filters, omit `domain/reporting/` and keep orchestration/query constraints in Application rather than fabricating domain behavior. **Requirement:** any real report calculation/selection rule has one server authority. The reader implements query mechanics; a SQL aggregate can implement a documented calculation without becoming a second policy definition.

| Browser path | Authoritative responsibility, entry and consumers |
| --- | --- |
| `application/reporting/contracts/{ReportQuery,ReportResult}.ts` and `ports/ReportReader.ts` | Internal query/result and required remote read capability; no browser, HTTP or controls. |
| `application/reporting/use-cases/LoadReport.ts` | Invokes injected reader and classifies known failures. Exists to protect the API-independent result/failure contract; no duplicate server authorization. |
| `infrastructure/http/reporting/{HttpReportReader,parseReportResponse,mapReportDto}.ts`, `dto/ReportApiDto.ts` | Performs GET, checks unknown payload and maps wire data into browser operation result. Owns HTTP status/transport failures. |
| `presentation/reporting/pages/ReportsPage.ts` | Route composition; renders capability components through the ViewModel. File extension follows the eventual UI framework. |
| `presentation/reporting/components/{FilterForm,ReportTable,ReportFeedback}/` | View rendering, semantic controls, gesture forwarding; each contains its component, props and local styles. Props are display values/callbacks, never database records. |
| `presentation/reporting/viewmodel/{ReportsViewModel,reportsState,reportUrl}.ts` | Screen-facing commands, state machine and pure URL codec. Public `presentation/reporting/index.ts` offers page and supported view contract. |
| `presentation/reporting/formatters/formatReportValue.ts` | Display locale/number/date choices, conditional on confirmed field meanings. |
| `presentation/theme/{ThemeState,themeTokens,globalStyles}.ts` | Theme preference/effective-theme authority, semantic visual tokens and global/reset ownership. |
| `composition/bootstrap.ts` | Creates HTTP reader, LoadReport, router binding and ViewModel; binds View state/commands and supplies browser integrations. |

Browser Domain is omitted: no independent client business invariant is established. Result values stay in Application; server policy is authoritative. URL encoding and theme are Presentation concerns; history/media-query/storage effects are supplied by bootstrap bindings. There is no global store, durable draft recovery, second cache, generic shared folder or DI container without demonstrated consumers.

These decisions apply `architecture/foundations/code-placement.md`, “Application,” “Where does a type belong?” and “Parsing and mapping follow the boundary”; `architecture/frontend/presentation-architecture.md`, “Organize by ownership, not only by technical type,” “Component colocation” and “Avoid the God ViewModel”; and `architecture/foundations/composition-root.md`, “A DI container is optional.” The frontend integration boundary follows `architecture/frontend/ports-and-adapters.md`, “Physical ownership.”

## Contracts and relationships

**Proposed single public HTTP agreement:** `GET /api/reports/{reportId}?<documented-filter-fields>`. A successful response carries `reportId`, canonical applied filters, projected rows and `generatedAt`; empty rows are success. Exact columns/filter vocabulary and maximum result size must be fixed in the contract before coding. Request–response is sufficient; no evidence justifies streaming, export jobs or distributed services. This is an HTTP interface proposal, not a claim of REST conformance (`architecture/api-design/README.md`, “Classify the design choice”).

Backend `ReadReport.execute({actor, reportId, filters})` returns a discriminated success or `invalidQuery | forbidden | notFound | unavailable`. An actor is verified identity plus server-resolved scope, not a DTO supplied by the browser. `ReportAccess.authorizeRead(actor,reportId)` yields an authorized scope or denial; `ReportReader.read({authorizedScope,reportId,filters}, cancellation)` returns a projected report or known unavailability. Its scope includes allowed data/fields, preventing an authorized report identifier from implying unrestricted row visibility. Cancellation is a neutral capability, not a driver request type.

Browser `LoadReport.execute(query,cancellation)` returns the internal report or `invalidQuery | unauthenticated | forbidden | notFound | unavailable | invalidResponse | cancelled`. The adapter checks identity of the returned report, accepted filter representation and row schema before mapping; it never silently turns malformed data into an empty report. Public error codes are stable; technical exceptions/log details are not user messages. HTTP mapping proposes 400, 401, 403, 404 and 503 respectively, with consistent concealment policy where resource existence is sensitive.

**Permitted source imports:** server Presentation → Application public entry; Application → its contracts/ports and Domain; Infrastructure → inward contracts/Domain; Composition → all pieces needed for assembly. Browser View → ViewModel public contract; ViewModel → Application and local state/formatters; HTTP adapter → Application contract. Type imports count. Neither Application imports SQL/HTTP drivers, nor ViewModel imports HttpReportReader, nor policy imports bootstrap. Cross-capability consumers use explicit public entries.

**Runtime:** ReadReport calls the supplied SqlReportReader object, although its source names only ReportReader. The interface does not forward the call. **Startup:** backend bootstrap constructs both and supplies the reader; browser bootstrap constructs HttpReportReader → LoadReport → ReportsViewModel and connects the View. No inner module resolves a container.

This distinction is grounded in `architecture/styles/layered-architecture/README.md`, “Ticket variation with Dependency Inversion”; `architecture/foundations/dependency-boundaries.md`, “Do not confuse runtime flow with source dependency” and “External technology types stop at the boundary”; and `architecture/foundations/module-boundaries-and-public-apis.md`, “Public API per non-trivial module.”

## Operation, state and failure trace

1. Route entry parses URL-applied filters into a canonical query. Unsupported/malformed URL values produce visible correction feedback, not an unrestricted default query. The ViewModel copies valid applied values into an editable draft. Draft changes remain local until Apply; they do not fetch or rewrite the URL.
2. Apply validates presentation shape, writes the canonical applied query through the router, and initiates exactly one load from the route transition. Draft validation focuses the first invalid field and leaves applied/results unchanged. Back/forward rehydrates draft/applied values and loads that historical query.
3. The View invokes `apply()`/`retry()`; bindings deliver immutable ViewModel snapshots. LoadReport invokes its supplied HTTP reader. The server verifies credentials, parses fields, resolves report-specific access and applies ReportPolicy before any projection query. Forged identity/scope fields cannot override trusted context.
4. SqlReportReader includes authorized scope in all joins/aggregations and only returns permitted fields. A single consistent statement is the proposed read boundary; if calculation needs multiple queries, the adapter must use a read transaction/snapshot with a real database guarantee. No write transaction, version-conflict workflow or idempotency key is needed for this read.
5. Server results are mapped to the agreed DTO; browser parser accepts unknown JSON, mapper builds the internal result, formatter prepares display values and bindings redraw the View.

State is route-scoped: draft, applied query, phase, error, rows plus their query key, and monotonically increasing request generation. Each new query cancels the predecessor and increments generation. Only a result matching current generation/query can commit, including failures and final loading cleanup; cancellation alone cannot guarantee this. Unmount unsubscribes history/theme listeners, cancels and invalidates outstanding work. Retry repeats the applied query, never an unsaved draft.

Initial loading has no fabricated rows; empty success is explicit. Same-query refresh may retain clearly marked stale rows. A changed-query request clears old rows so they cannot appear under new filter labels. Forbidden/unauthenticated results clear sensitive rows. Expected transport failures offer Retry; validation/permission failures require correction or access resolution. A timed-out GET has an unknown completion but no product mutation to reconcile: safe repeat may read newer source facts. Concurrent source edits are represented by the response’s freshness/snapshot semantics, not a promise that a report reserves data. No persisted server state-changing operation is specified.

This is MVVM because the View consumes prepared state and invokes commands while the ViewModel uses Model capabilities without naming concrete controls; a hook name alone would not establish it (`architecture/patterns/presentation/model-view-viewmodel/README.md`, “Mental model and roles” and “Isolation in a layered React application”). State lifetimes follow `architecture/frontend/state-management.md`, “Assign state by responsibility” and “Forms are not global state by default.” Trusted identity and scoped reads follow `architecture/api-design/security-and-tenancy.md`, “Identity and permission” and “Scope every object”; timeout/freshness reasoning follows `architecture/api-design/reliability-and-operations.md`, “Timeouts and partial failure” and “Caching, performance and visibility.”

Responsive layout stacks filters at narrow widths and allows a labelled table scroll region. Native form labels, table headers, visible keyboard focus, logical tab order, restrained status announcements and keyboard Retry are View responsibilities. Async results preserve focus; theme controls have accessible names. ThemeState owns `light | dark | system`; system mode follows media changes, explicit modes override them, invalid/unavailable stored preference falls back to system. One token map owns canvas, surface, text, border, focus and status colors in both themes; component styles consume it. Actual breakpoints and contrast require visual verification. These inferences apply `architecture/frontend/styling-and-design-system.md`, “Use a layered design-system pipeline,” “Global styles have one owner,” “Responsive design” and “Keyframes and reduced motion.”

## Challenges, impacts and proposed evidence

**MVC alternative:** for the same interactive browser, introduce `presentation/reporting/controllers/ReportsController.ts` and `state/ReportsModel.ts`. The controller interprets gestures and invokes model behavior; the observable model coordinates LoadReport and state; the View subscribes, reads state and redraws, unsubscribing on removal. URL/draft/request-generation rules remain necessary. Source dependencies are View/Controller → Model API, Model → Application; runtime model notification reaches registered listeners without naming concrete controls. This costs another role/subscription boundary; reconsider if several Views need one represented model. A server-rendered variant instead lets HTTP controller invoke ReadReport and supply template data, but preserving interactive browser drafts and async results would require additional client behavior. A JSON controller alone is not the MVC triad (`architecture/patterns/presentation/model-view-controller/README.md`, “MVC across client and server”).

**Remove the inward-owned reader:** delete Application’s ReportReader contract, make ReadReport import a data-access-owned API/result/error contract, update constructor types, tests and composition, and relax the import rule. Runtime can remain ReadReport → reader; responsibility layers survive, Dependency Inversion does not. SQL/driver type leakage would further couple policy to storage. Reject this under the assigned requirement; reconsider only with an explicit architecture change accepting that cost. See Layered guide, “Specify how layers may interact.”

**Is it a Repository?** No: ReportReader returns projections/aggregates, not collection-like stored domain objects. Read-only alone does not disqualify a Repository; interaction semantics do. Do not generate CRUD or an entity repository per report table (`architecture/patterns/persistence/repository/README.md`, “The interaction” and “Repository, reader and gateway”).

All checks below are **proposed, unexecuted**:

| Change or boundary | Observable positive and negative evidence |
| --- | --- |
| Confirmed selection-rule change | Change ReportPolicy and its cases; accepted combination reaches reader, rejected combination returns invalidQuery without I/O. HTTP and direct operation callers get the same decision; client hints cannot bypass it. |
| SQL schema/provider replacement | Change SqlReportReader and composition; run reader contract and real scoped-projection checks. Renamed columns preserve results; cross-scope rows/fields never enter aggregates. A fake proves no database isolation. |
| Additional CLI caller | Add CLI parser/formatter and root invoking public ReadReport with verified identity. Valid actor gets identical result; untrusted scope/denied actor fails. No HTTP parser or private SQL import required. |
| API contract | Valid payload maps identically on both sides; malformed rows, wrong report identity and undocumented failure shapes are rejected, not rendered as success. |
| Async/browser | Delayed A after B cannot replace B or clear its loading flag; draft edits do not load; Back restores query; unmount blocks completion; zero rows, retry and permission clearing render distinctly. |
| Structural | Permit adapter → application reader and bootstrap → adapter; reject application → SQL even as type import/reexport/dynamic import, ViewModel → HTTP adapter and unrelated capability → private helper. |
| Visual/accessibility | Keyboard-only Apply/Retry/theme work at narrow/wide widths in all themes; status is announced without focus theft. Hidden focus, unreadable contrast or clipped controls fail review. |

Separate behavioral, integration, structural and visual evidence as required by `architecture/foundations/architecture-testing.md`, “AST-based tests,” “Public API tests” and “Test behavior and boundaries separately.” The scheme is reviewable within its stated assumptions; it establishes no executed application or runtime guarantee.
