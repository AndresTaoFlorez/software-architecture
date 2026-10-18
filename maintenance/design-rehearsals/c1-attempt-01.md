# C1 Architecture Rehearsal — Attempt 01

Frozen design-only candidate answer against `1c9deb1558b9d50737d6979dabab308350468c67`. See the [matrix and independent verdict](../architecture-combination-matrix.md). This is evaluation evidence, not a canonical implementation. The editorial preface is added and terminal blank lines are normalized for Markdown whitespace consistency; the response otherwise remains unchanged, without correction or redaction. Raw artifact SHA256 `c214490106255cfd3311307a1c3247fdfe4986fb660d9a39375eeaed070e45d5`, 16633 bytes. Proposed checks remain unexecuted.

---

# Expenses: Clean backend and classic interactive MVC browser

## Decision and evidence

**Requirements:** employees submit positive expenses; designated reviewers alone approve; nobody approves their own expense; status changes persist with revision checks; duplicate and conflicting approvals cannot corrupt state. Clean backend and classic interactive browser MVC are assigned constraints. There is no application, schema, approved stack, runtime or test suite to inspect.

Reference H is the controller-exported snapshot at **1c9deb1558b9d50737d6979dabab308350468c67**. Its provenance is the controller receipt, not an independently resolved Git HEAD. The three copied consumer skills were read and applied. Paths below are proposed, not existing implementation. **Conventions** concern layout and boundaries; **inferences** concern the particular contracts, transaction design and UI choices. Nothing here establishes runtime security or database guarantees.

Choose one synchronous application and transactional datastore, conditionally a relational database with conditional updates and atomic receipts. No distributed workflow is needed. Clean protects actual expense policy from HTTP and persistence changes; it costs explicit mapping and contracts. Source basis: `architecture/styles/clean-architecture/README.md`, “Fit and cost,” “The fundamental model,” and “Recommended physical structure.” MVC governs browser presentation, not the entire backend: `architecture/patterns/presentation/model-view-controller/README.md`, “MVC across client and server” and “Important scope rule.”

## Proposed physical owners

All paths below start at the indicated side's `src/`. Extensions illustrate plain TypeScript; no framework choice is implied.

| Backend path/artifact | Responsibility and supported consumers |
| --- | --- |
| `domain/expenses/Expense.ts`, `PositiveAmount.ts` | Authoritative positive amount, submitted/approved transitions and self-approval prohibition. Pure domain imports only. Rehydration preserves recorded status/revision rather than invoking submission again. |
| `application/expenses/use-cases/{SubmitExpense,ApproveExpense,GetExpense}.ts` | Coordinate identity-dependent resource permission, domain decisions, receipts and transactions. Delivery and future callers use these through `application/expenses/index.ts`. |
| `application/expenses/contracts/{Commands,Results}.ts` | Framework-free actor, commands, snapshots and tagged outcomes; no request objects or SQL rows. |
| `application/expenses/ports/ExpenseTransactions.ts` | Narrow atomic expense/receipt capability required by mutation operations; transaction-scoped loading, reviewer designation, insertion and conditional save. |
| `presentation/http/expenses/{ExpensesController,parseExpenseRequest,mapExpenseResponse}.ts` | Parse unknown input, translate commands/results and HTTP representation. `dto/ExpenseDto.ts` owns wire fields. No database imports. |
| `infrastructure/auth/VerifiedSession.ts` | Verify credentials and resolve trusted employee identity. Delivery receives its result through startup wiring. |
| `infrastructure/persistence/expenses/SqlExpenseTransactions.ts`, `migrations/` | Transaction implementation, row mapping, constraints, revision predicates and receipt uniqueness; implements inward contracts. Driver glue and mapping can share this module. |
| `composition/bootstrap.ts` | Construct datastore/auth adapters, operations, controller and routing; establish connection/request lifetimes. Owns no approval decision. |

This is an inferred application map using the ownership convention in `architecture/foundations/code-placement.md`, “Responsibilities,” “Where does a type belong?” and “Parsing and mapping follow the boundary.” Combining driver and translation is supported by `architecture/foundations/dependency-boundaries.md`, “Combined outer modules.” The transaction port protects a genuine database/fake substitution and atomic workflow; it is deliberately not a generic Repository per table (“Ports model capabilities, not files” and “A port is not automatically a Repository”).

| Browser path/artifact | Responsibility and supported consumers |
| --- | --- |
| `application/expenses/contracts/{ExpenseSnapshot,ExpenseActions}.ts` | Client-owned internal snapshot and asynchronous read/submit/approve contracts; typed known failures including unknown outcome. |
| `infrastructure/http/expenses/{HttpExpenseActions,parseExpenseResponse,mapExpenseDto}.ts`, `dto/` | HTTP, credential/CSRF attachment, unknown-response validation and translation into client contracts. |
| `presentation/expenses/state/ExpensesModel.ts` | Observable MVC Model: current snapshot, draft, busy/error/unknown state, request sequencing and semantic methods. Receives ExpenseActions; never names a concrete View. |
| `presentation/expenses/controllers/ExpensesController.ts` | Convert form/click gestures into Model.submit/approve/reload; no HTTP or approval policy. |
| `presentation/expenses/pages/ExpensesPage.ts` | Compose form, list/detail and feedback Views. |
| `presentation/expenses/components/{ExpenseForm,ExpenseDetail,ExpenseList}/` | Views subscribe to the Model, read its snapshot and render; colocated props/styles. Forward gestures to Controller. |
| `presentation/expenses/formatters/formatAmount.ts`, `index.ts` | Display formatting; supported mount/unmount entry hides state internals. |
| `composition/bootstrap.ts` | Construct HTTP adapter, Model, Controller and Views; connect events/subscriptions and dispose them. |

**Inference:** no separate browser domain rules or pass-through use-case classes: the client has presentation coordination and a remote-action contract, while authoritative rules remain server-side. Browser Application holds the contract, Infrastructure implements it, and the MVC Model coordinates display around calls. Add a protected client workflow only if client policy/reuse appears. No empty domain directory, global store, shared utility bucket, offline persistence or design-system package. These omissions follow `architecture/foundations/dependency-boundaries.md`, “Avoid ceremonial boundaries”; `architecture/frontend/README.md`, “Core model”; and `architecture/frontend/state-management.md`, “Assign state by responsibility,” “Forms are not global state by default.” Appearance/theming is outside this scheme; local component styling suffices.

## Concrete contracts and atomicity

**Inference:** amount is an exact positive decimal string, parsed into an exact decimal value; precision/maximum size must be agreed before implementation. Reject zero, negative, malformed and nonfinite representations. No currency conversion, reimbursement or payment is introduced.

Submit command: `{actor, requestId, amount}`; server creates expense ID, submitter, status `submitted`, revision 1. Approve command: `{actor, requestId, expenseId, expectedRevision}`. Actor comes exclusively from verified server context. Domain approval checks submitted state and actor differs from submitter; Application checks current persisted reviewer designation for this expense. Reviewer designation provisioning is unspecified: assume trusted persisted assignment, no new administration UI. Changes to assignment must serialize with approval and increment expense revision, so stale authorization cannot win a race. Read access is provisionally limited to submitter/designated reviewers; product owners must settle broader visibility.

Results distinguish `submitted/approved/replayed`, invalid amount/input, unauthenticated, forbidden, not found, revision conflict, invalid transition, request-ID mismatch, unavailable and unknown outcome. Expense snapshot contains ID, amount, submitter ID, status, revision and approval actor/request ID when approved. Business values, application results and wire DTOs remain separate representations.

`ExpenseTransactions.run` supplies a transaction-scoped capability to the operation. Load designation and expense on that transaction; domain computes next state; save compares expected revision and submitted status atomically. Exactly one affected row is success; increment revision and persist approval metadata. Lock/serialize designation updates consistently. Database checks backstop positive amount and legal status vocabulary. A transaction rollback removes both mutation and receipt.

Request receipts are scoped to trusted employee + operation + requestId, with a canonical fingerprint including expense ID/expected revision or submitted amount. Unique scope prevents concurrent duplicate execution. The transaction claims/loads the receipt before mutation and atomically records the resulting snapshot. Same fingerprint replays the recorded result; a different fingerprint is rejected. A concurrent duplicate waits within a bounded deadline or receives “in progress”; it must not run a second mutation. Different request IDs still compete through revision/status checks. Proposed retention is seven days, with matching client retry limits; beyond retention clients reconcile instead of automatically resubmitting. Approval metadata survives receipt expiry, so lookup still reveals an existing approval. These are design choices requiring real adapter verification, not properties of an interface.

This applies `architecture/api-design/reliability-and-operations.md`, “Retries and duplicate requests,” “Optimistic concurrency,” and “Timeouts and partial failure.” No outbox, event bus or distributed lock is justified because there is no external side effect.

One provisional HTTP contract serves both descriptions: submit and approve use POST operations; approval body carries expectedRevision, deliberately avoiding strong-ETag claims. Success returns the snapshot; known revision/transition conflicts map to 409, bad shape to 400, invalid amount to 422, unauthenticated to 401, forbidden to 403 and absent authorized resources to 404. Temporary storage failure maps to 503 with an explicit outcome classification. GET expense and a scoped request-receipt lookup support reconciliation. Receipt lookup returns in-progress/completed/absent; absent alone is not permission to mint a new request ID. Public protocol details remain a contract-review item, not a REST conformance claim. Session cookies are conditional, with CSRF protection for mutations. Identity/resource permission and rejecting client-supplied submitter/status/reviewer fields apply `architecture/api-design/security-and-tenancy.md`, “Identity and permission,” “Scope every object,” and “Other request threats.”

## Source, runtime and failure trace

**Imports:** ApproveExpense imports domain and application-owned contracts; SqlExpenseTransactions imports those contracts. HTTP presentation imports the supported application entry. Browser Controller/View import the Model API; Model imports client action contracts; HTTP adapter implements them. Neither backend operation nor browser Model imports concrete adapters/presenters. Composition imports the concrete pieces. Type-only imports count. Basis: `architecture/foundations/dependency-boundaries.md`, “The rule” and “Do not confuse runtime flow with source dependency.”

**Startup:** backend root supplies transaction adapter to operations and operations to controller; browser root supplies HTTP actions to Model and Model to Controller/Views. Manual injection is enough (`architecture/foundations/composition-root.md`, “A DI container is optional”).

**Runtime:** reviewer clicks Approve → Controller extracts selected ID/revision → Model marks that expense pending and notifies → subscribed Views read/render → HTTP adapter sends command → authentication verifies actor → parser checks shape → ApproveExpense loads current authorized resource inside transaction → Expense validates transition → adapter commits conditional save plus receipt → returned result becomes HTTP DTO → browser validates/maps → Model installs returned revision and notifies → Views redraw approved status. The Controller never selects or directly redraws the View. This matches MVC guide “First feature end to end.”

Malformed input stops before operation; a forged identity field is rejected; nonreviewer/self-approval leaves state unchanged. Stale revision and concurrent winner produce conflict, then reload without silently reapplying intent. Known rollback permits retry with the same request ID. Timeout/disconnect after possible commit leaves Model in **outcome unknown**, never success or assumed rollback; query receipt/current expense, retry the identical request within retention, and keep a new approval disabled while unresolved. Invalid response data becomes integration failure, not an approved screen.

Draft/filter/selection live for the mounted screen; persisted facts are only a server snapshot. No optimistic approval. Empty lists, loading, retryable reads and retained stale data have distinct labels. Per-resource mutation guards stop double clicks; sequence tokens discard late reads and lower revisions after mutations. Abort reads/unsubscribe on unmount; aborting a mutation does not establish rollback. Semantic buttons/forms, keyboard submission, focus retention and live feedback require browser checks. Sources: `architecture/frontend/presentation-architecture.md`, “Presentation is a boundary,” “Component colocation”; state guide, “Server state vs. application policy”; MVC guide, “Mental model and roles.”

## Alternative, challenge and proposed verification

Return-result is preferred: ApproveExpense.execute returns one plain outcome, and HTTP/CLI callers map it independently. An application-owned `ApprovalOutput.present(result)` with a supplied HTTP presenter is also legal: operation imports only its own port; presenter implements it; composition supplies a request-scoped instance. It costs another collaborator and requires clear presenter-failure handling after commit. Consider it for substantial output interaction, not merely a single response. A presenter failure cannot roll back an already committed approval. Basis: `architecture/styles/clean-architecture/8-clean-on-the-backend.md`, “Application.”

Reject an inner operation importing `HttpApprovalPresenter`, even via type-only import: it couples policy to delivery and breaks inward source direction. Replace that import with the result or inward-owned output port. Runtime invocation of the supplied presenter would be legal and does not authorize the concrete import.

All following checks are **proposed, unexecuted**:

| Pressure/check | Observable expected evidence |
| --- | --- |
| Rule change: new maximum amount | Change PositiveAmount and rule tests; HTTP shape/client format stay stable. Positive accepted amount persists; zero/negative/over-limit never writes. |
| Integration change: replace database | Change SqlExpenseTransactions/migrations/composition; keep operation contracts. Real-database concurrent approvals yield one revision increment; loser cannot overwrite. Inject rollback: no receipt or approval remains. |
| New caller: CLI approval | Add CLI parser/formatter and composition, use application entry. Valid reviewer succeeds; forged/nonreviewer/self approval fails identically without HTTP. |
| Unknown/duplicate outcomes | Drop success response after commit; identical request returns recorded snapshot and one approval. Concurrent identical IDs execute once; changed fingerprint rejects. |
| Browser MVC/races | Two subscribed Views redraw from one Model notification; older read cannot undo approved revision. Unmount removes listeners; timeout shows unknown and reconciliation restores facts. Keyboard action and live feedback work. |
| Structural positive/negative | Permit application→own transaction port and composition→SQL adapter. Reject operation→concrete presenter, outward type imports/reexports/dynamic imports, browser View→HTTP adapter and cross-capability private imports. |

Boundary checks must resolve aliases and public entries, while transaction/security tests exercise real integrations. A fake port cannot prove serialization. Basis: `architecture/foundations/module-boundaries-and-public-apis.md`, “Public API per non-trivial module”; `architecture/foundations/architecture-testing.md`, “AST-based tests” and “Test behavior and boundaries separately.” This is a reviewable design with remaining stack, identity-provider, designation-provisioning and amount-policy decisions, not an implemented or validated application.
