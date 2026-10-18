# O2 Architecture Rehearsal — Attempt 01

Frozen design-only candidate answer against `1c9deb1558b9d50737d6979dabab308350468c67`. See the [matrix and independent verdict](../architecture-combination-matrix.md). This is evaluation evidence, not a canonical implementation. The editorial preface is added and terminal blank lines are normalized for Markdown whitespace consistency; the response otherwise remains unchanged, without correction or redaction. Raw artifact SHA256 `764c738829fc364e54063be214e71604def1d480215f197a0ce1283c0613f700`, 17269 bytes. Proposed checks remain unexecuted.

---

# O2 — Library circulation scheme

**Decision and evidence.** Use an Onion backend and a Hexagonal browser with MVVM. These are assigned constraints, not conclusions inferred from folders. Requirements are persistent loans, at most three active loans per member, at most one active loan per copy, refusal of renewal when another member has a hold, authorized librarian input and browser interaction. No application, schema, approved technology or tests exist. Every check below is proposed and unexecuted.

The read-only handbook H is pinned to `1c9deb1558b9d50737d6979dabab308350468c67`. Provenance rests on the supplied controller export receipt; this snapshot has no Git metadata, so I did not independently resolve HEAD. The three copied consumer skills were read and applied. Handbook path/layout recommendations are **conventions**; paths, transaction protocol and contracts below are **design inferences**. Requirements remain authoritative.

Assumptions requiring product confirmation: authenticated members may renew their own loans; librarians may issue/renew for members within their assigned library; holds attach to a title, affecting its copies. A copy-scoped hold policy would change the facts lookup and lock scope. Loan duration and renewal extension are unresolved: `LoanTerms` must provide an approved policy before implementation; no duration, fee, renewal quota or new hold-management feature is invented.

## Owners and physical placement

Paths below are relative to the proposed `backend/src/` and `browser/src/`. Braces abbreviate individually named artifacts, not generated scaffolding.

| Backend path | Responsibility and supported consumer |
| --- | --- |
| `domain/circulation/Loan.ts`, `LoanPolicy.ts`, `LoanTerms.ts` | Loan state/rehydration, active transitions, limit/copy/hold decisions and approved term calculation; consumed by Application. No HTTP, SQL or startup imports. |
| `domain/circulation/LoanRepository.ts` | Business collection contract: `find(id)`, `add(loan)`, `save(loan, expectedVersion)`; purpose-specific persistence of stored Loans. No table CRUD or projection methods. |
| `application/circulation/use-cases/{IssueLoan,RenewLoan,GetLoanDetails,GetAvailability}.ts` | Authorize resources, obtain facts, invoke policy, coordinate transactions and return plain results. |
| `application/circulation/ports/{CirculationTransaction,CirculationFacts,AvailabilityReader,LoanDetailsReader}.ts` | Required atomic scope, authoritative decision facts and query projections; concrete persistence is replaceable. |
| `application/circulation/contracts/{Commands,Results,ActorContext}.ts`, `index.ts` | Commands/results and trusted actor contract; explicit public exports for delivery and additional callers. Transaction internals stay private to ordinary callers. |
| `infrastructure/persistence/circulation/{SqlLoanRepository,SqlCirculationTransaction,SqlCirculationFacts,SqlAvailabilityReader,SqlLoanDetailsReader}.ts` | Transaction-bound adapters, record mapping, locking, durable receipts and database error translation. |
| `infrastructure/persistence/circulation/migrations/` | Loan/version/receipt storage, active-copy uniqueness and lock-support records; exact SQL awaits engine selection. |
| `presentation/http/circulation/{LoansHandler,parseLoanRequest,mapLoanResponse}.ts`, `dto/LoanWire.ts` | Unknown-input parsing, transport outcomes and public wire shapes. Handler calls supported application operations. |
| `presentation/http/auth/requireActor.ts`, `infrastructure/identity/SessionVerifier.ts` | Reject missing/unverified credentials; verifier resolves current roles/library membership. Resource authorization remains in Application. |
| `composition/bootstrap.ts` | Select engine/session integration, construct adapters, inject operations into handlers; no eligibility decisions. |

Repository placement near the domain model is an intentional Onion choice: H `architecture/styles/onion-architecture/7-onion-on-the-backend.md`, **“Why does the storage contract belong inward?”** explicitly permits it. A reader serves availability because it returns counts/copy summaries rather than rehydrated Loans: H `architecture/patterns/persistence/repository/README.md`, **“Repository, reader and gateway”**. Query the same durable store initially; no separate projection database, event bus or eventual-consistency machinery is justified.

| Browser path | Responsibility and supported consumer |
| --- | --- |
| `domain/circulation/LoanSummary.ts` | Client loan/status vocabulary and value types; no duplicate authoritative eligibility rules. |
| `application/circulation/ports/LibraryGateway.ts`, `contracts/{Inputs,Results}.ts` | Required remote details, availability, issue and renewal interactions; internal result language excludes HTTP responses. |
| `application/circulation/operations/{loadLoanDetails,loadAvailability,issueLoan,renewLoan}.ts`, `index.ts` | Transport-independent offered operations and result/failure normalization; no extra inbound interface needed. |
| `infrastructure/http/circulation/{HttpLibraryGateway,parseLoanWire,mapLoanWire}.ts`, `dto/LoanWire.ts` | Credentialed HTTP, runtime checking of unknown JSON, mapping and integration failure classification. |
| `presentation/circulation/pages/LoansPage.tsx` | Route composition; consumes the capability's public API. |
| `presentation/circulation/components/{AvailabilityList,LoanDetails,IssueLoanForm}/` | Views with colocated component, props and styles; render values and forward gestures. Issue form is librarian-facing. |
| `presentation/circulation/state/LoanDetailsViewModel.ts`, `hooks/useLoanDetails.ts`, `index.ts` | Selected-loan Facade/ViewModel: coordinates selection, details operation, renewal operation and refresh; exposes state/commands through a binding. |
| `presentation/circulation/state/AvailabilityState.ts`, `formatters/formatDueDate.ts` | Independent availability interaction and display formatting; unrelated workflows do not accumulate in the details facade. |
| `composition/bootstrap.tsx` | Construct HTTP gateway and operations; supply them to screen bindings. |

MVVM's Model comprises underlying client values and application capabilities; the ViewModel prepares state and commands, and its binding updates Views. It never manipulates DOM controls. Here it also earns the Facade name by coordinating selection, loading, renewal and refresh through a narrow API. Sources: H `architecture/patterns/presentation/model-view-viewmodel/README.md`, **“Mental model and roles”**; `architecture/patterns/structural/facade/README.md`, **“Name the pattern”** and **“Distinguish nearby roles”**. No global state library, browser persistence, shared UI package or theme architecture is required by this scope; component styles suffice. Revisit those omissions when cross-route lifetimes or appearance requirements arise.

## Contracts and authoritative execution

One proposed HTTP contract lives conceptually with backend delivery and is consumed by the browser integration; these descriptions do not define competing APIs:

| Interaction | Accepted input → result / meaningful failure |
| --- | --- |
| `GET /availability?titleId=…` | Scoped title → `{titleId, availableCopyIds, observedAt}`; empty is valid. |
| `GET /loans/{id}` | Authorized loan → `{id,copyId,memberId,status,dueAt,version}`; private data minimized. |
| `POST /loans` | Librarian sends `{memberId,copyId}` plus `Idempotency-Key` → committed loan, `201` and `Location`. Actor/library are server-derived. |
| `POST /loans/{id}/renewals` | `{expectedVersion}` plus key → updated loan, `200`; no caller-chosen due date. |
| Application commands | Trusted actor plus validated IDs/version/command key → LoanResult or typed `forbidden`, `not-found`, `limit`, `copy-unavailable`, `hold`, `stale-version`, `key-reuse`, `unavailable`, `outcome-unknown`. |
| `CirculationTransaction.run(scope, work)` | Atomic callback receives scoped repository, facts (`activeCount(member)`, `activeLoan(copy)`, `hasOtherHold(title,member)`) and receipt access; returns after commit or reports rollback/unknown commit. No driver types escape. |
| `LibraryGateway` | Internal inputs → checked client models or typed remote/transport failure; never trusts a static DTO annotation. |

Delivery maps malformed shape to `400`, unauthenticated to `401`, denied operation to `403`, concealed inaccessible/missing loan to `404`, business/version/key conflicts to `409`, temporary inability to `503`. Application `expectedVersion` is an explicit command precondition, not an HTTP ETag claim. API choices are proposals; exact error bodies must preserve these distinctions. H `architecture/foundations/code-placement.md`, **“Where does a type belong?”** and **“Parsing and mapping follow the boundary”**, supports separate DTOs, commands, domain values and props.

`IssueLoan` verifies librarian permission and member/copy library relationships. `RenewLoan` authorizes the member owner or permitted librarian, then checks an active loan and other-member holds. Reads use equivalent scope. Credential verification alone never authorizes an arbitrary resource ID. Browser cookies require chosen CSRF/origin protections; identity fields in request bodies are rejected. H `architecture/api-design/security-and-tenancy.md`, **“Identity and permission”** and **“Scope every object”**, supplies the principle; library scope is this design's application, not an invented multitenant product.

Application owns the short transaction; Domain owns the rules. Proposed relational protocol locks stable member, copy, title and loan records in a canonical order, re-reads authoritative facts and compares the expected version before deciding/writing. Stable member locking serializes competing issues even for different copies; title locking serializes renewal against hold insertion. Every loan-status and hold writer must obey this protocol, including maintenance paths; an absent matching hold row is not a lock. Immutable loan relationships may be read for routing, then revalidated inside the transaction. A unique active-copy constraint supplies a separate backstop. Scope/version/receipt and Loan writes commit together; database privileges must prevent bypass writers. Engine selection must demonstrate these guarantees; otherwise choose proven serializable execution with bounded whole-transaction retries. H `architecture/api-design/reliability-and-operations.md`, **“Two bookings for one slot”**, supports atomic rechecking and persistence enforcement, not this unverified algorithm.

Keys are scoped to verified actor, library and operation; fingerprints include target, inputs and expected version. A unique receipt serializes concurrent identical keys: contenders await the first transaction within a deadline, then replay its stored result. Different fingerprints fail; rollback leaves no committed effect/receipt. Receipts remain for the loan's lifetime, an explicit storage cost requiring retention review. Replay rechecks current access. Lost commit acknowledgement becomes unknown, never claimed rollback; retry the same key/input to recover the recorded result before considering a new action. H reliability, **“Retries and duplicate requests”** and **“Timeouts and partial failure”**, motivates this mechanism.

## Trace, boundaries and browser failures

Runtime renewal: `LoanDetails` gesture → bound `LoanDetailsViewModel.renew()` → browser `renewLoan` → supplied `HttpLibraryGateway` → `LoansHandler`/verified actor → backend `RenewLoan` → supplied transaction/facts/repository → `LoanPolicy`/`Loan` → durable commit → mapped response → parser → ViewModel success and availability refresh. Interfaces are contracts, not extra runtime hops.

Source imports differ: Application imports Domain and inward ports; adapters implement those contracts; Presentation imports supported Application APIs and its own state. Neither ViewModel nor operation imports concrete HTTP/SQL. Startup alone imports implementations and consumers, supplying transaction-scoped instances and per-screen bindings. H `architecture/foundations/dependency-boundaries.md`, **“A practical four-area mapping”**, and `composition-root.md`, **“Composition is a boundary, not business policy”**, support this split.

Selection lives for the page session, issue form fields locally, server snapshots in capability state with timestamps; no URL selection is required initially. Selection changes increment a request generation and cancel superseded reads; late results cannot overwrite another loan. Details distinguish initial/loading/empty-selection/ready/error/stale; failed refresh preserves visibly stale data. Renewal tracks pending/success/rejected/unknown separately. Capture loan ID/version/key at submission; disable duplicate intent. Composition retains pending command handles for the browser session across route changes; completion cannot update another selection. Reload requires fresh server reads and explicit intent, never automatic mutation replay with a new key. Read retries are safe; unknown mutations reconcile by the same key. No optimistic renewal success. Unmount stops UI updates without claiming server cancellation. Backend hold/version rejection refreshes details; projection failure after successful commit reports “renewed; availability refresh failed.” Availability remains advisory, never a reservation. Keyboard-operable controls, semantic labels, focus continuity and announced progress/errors belong to Views/binding. Sources: H `architecture/frontend/state-management.md`, **“Assign state by responsibility”**; `presentation-architecture.md`, **“Screen interaction API”**; reliability, **“Caching, performance and visibility”**.

## Alternatives, challenge and proposed evidence

Clean alternative: move `domain/circulation/LoanRepository.ts` to `application/circulation/ports/LoanRepository.ts`; Use Cases now own required persistence semantics, Entities retain Loan/LoanPolicy rules. Repository adapter imports and transaction signatures change accordingly. HTTP translators and SQL mapping are Interface Adapters; drivers/bootstrap remain outer mechanisms. Plain returned results remain sufficient; no ceremonial presenter port. This is a real contract-owner change with considerable overlap, supported by H `architecture/styles/clean-architecture/8-clean-on-the-backend.md`, **“A backend mapping”**, **“Application”**, and **“Composition”**. Neither style solves races automatically. Prefer assigned Onion; reconsider repository ownership if only use-case-specific persistence needs remain.

Reject complete layer trees per table: member/copy/hold facts jointly serve circulation; table stacks fragment the invariant and encourage controller orchestration. Reject Facade as all application policy: it would allow CLI callers to bypass rules. H `architecture/foundations/code-placement.md`, **“Grow capabilities inside each layer”**, and Facade, **“Apply it selectively to frontend”**, support these challenges; layer-first naming itself remains a convention.

| Change/check boundary | Proposed positive and negative observation |
| --- | --- |
| Rule: three → four active loans | Change `LoanPolicy` and policy fixtures; third→fourth succeeds, fifth fails with no write. Under current rule, race two issues from count two: exactly one commits. |
| Copy/hold integration | Race different members for one copy: one active loan. Renewal without other-member hold succeeds; committed earlier hold blocks it. Race hold insertion/renewal follows a serial order; rollback leaves no partial update. |
| Replace SQL engine | Change adapters, migrations and bootstrap; preserve repository/transaction contracts. Real-engine checks prove durability after restart, lock protocol, duplicate IDs, rollback and receipt replay; fake ports cannot. |
| Add librarian CLI caller | Add `presentation/cli/IssueLoanCommand.ts` and CLI composition root; trusted credentials reach unchanged `IssueLoan`. Authorized issue succeeds; forged member/library/role fails. No ViewModel dependency. |
| Transport/security/uncertainty | Valid allowed request matches shared wire contract; malformed JSON, foreign loan and unauthorized issue fail without writes. Drop response after commit, replay same key: same result, one mutation. Same key/different payload fails. |
| Browser interaction | Select A then B, resolve A last: B remains shown. Renewal rejection is announced without success; timeout shows unknown and retries original key; keyboard selection/focus survives refresh. |
| Source boundaries | Allow `RenewLoan` → domain repository and bootstrap → SQL adapter. Reject Application → SQL, ViewModel → HTTP, outward type-only imports/reexports/dynamic imports, and cross-capability private imports. |

H `architecture/foundations/architecture-testing.md`, **“AST-based tests”**, **“Public API tests”**, and **“Test behavior and boundaries separately”**, explains why these establish different evidence. The scheme is reviewable under its assumptions; no compilation, database, security, rendering or deployment validation is claimed.
