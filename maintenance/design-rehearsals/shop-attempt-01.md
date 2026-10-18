# Shop Design Rehearsal — Attempt 01

This is the frozen candidate response to the design-only scenario at handbook revision `ee5528ba07dec9d47c3e1fc3a82c3b34d7e5e0f5`. It is evaluation evidence, not a canonical shop implementation or evidence of implementation acceptance. The separate [evaluation](../agent-design-evaluation.md) records the method, reviewer findings and design-only verdict.

The local Windows reference-root path was replaced once with `<read-only-handbook-snapshot>`. Apart from this declared redaction and this editorial preface, the candidate response is preserved. Original UTF-8 artifact: 23,383 bytes, SHA256 `671b9e25daa78e49482a71a9c268f3a4754f61959c1c14243eda015047f22b59`. No credentials or private maintainer context are included.

The candidate uses bold section labels and path tables as returned; they have not been rewritten to follow the handbook's guide template.

---

Propose one backend deployable, one browser application, and one transactional database. Checkout remains a single local transaction; the browser never decides persisted prices, stock availability, or resource access.

**Evidence and scope.** This is a new application: no implementation, migrations, tests, runtime, or accepted decisions exist. I read the shop’s `AGENTS.md` and all three copied consumer skills: `.agents/skills/{architecture-assessment,backend-architecture,frontend-architecture}/SKILL.md`.

Reference root **H** is `<read-only-handbook-snapshot>`. The adjacent `reference-receipt.json` identifies commit `ee5528ba07dec9d47c3e1fc3a82c3b34d7e5e0f5`. All 108 exported files matched their SHA256 receipts. This verifies snapshot integrity against the receipt; the snapshot has no `.git`, so I did not independently resolve a Git revision.

Below, **R** means application requirement, **C** means consulted handbook convention/principle, and **I** means proposed design inference. Source paths beginning **H/** resolve exactly against that root. All application paths are proposed, relative to this shop workspace.

| Decision | Basis, justification, cost and reconsideration |
|---|---|
| Modular backend with inward dependencies | **I**, protecting checkout rules and database substitution. **H/architecture/foundations/dependency-boundaries.md**, “A practical four-area mapping”; **H/architecture/foundations/evolution-and-scaling.md**, “Modular monolith before distribution by default”. Compared with simple database-aware handlers, this adds contracts but protects consequential workflows. Distributed services add consistency and operational costs without a demonstrated need. Reconsider only with measured deployment/scaling pressures. |
| Layer-first folders containing capabilities | **C**, adopted as an **I**, rather than a product requirement. **H/architecture/foundations/code-placement.md**, “Grow capabilities inside each layer”. Ownership and import rules matter more than the names. |
| TypeScript backend, React browser, PostgreSQL database | **I**, proposed technology candidates, with versions and libraries unapproved. SQL transactions suit checkout’s consistency boundary; React is an optional delivery choice. No claim about a particular framework release is assumed. Database guarantees require verification with the selected version, driver and isolation configuration. |
| Small required capabilities and manual composition | **I**, avoiding a generic repository/container framework. **H/architecture/foundations/dependency-boundaries.md**, “Ports model capabilities, not files” and “Avoid ceremonial boundaries”; **H/architecture/foundations/composition-root.md**, “A DI container is optional”. |
| Browser hooks and components, without mandatory MVVM or global store | **I**, matching the bounded screen coordination. **H/architecture/frontend/state-management.md**, “Start with capability-owned state”; **H/architecture/patterns/presentation/README.md**, “Context matters”. A hook alone does not establish MVVM. |

**Proposed physical map.** Paths express containment. Each nontrivial capability has an explicit `index.ts` exposing only supported operations, contracts or components—not private parsers and state. This follows **H/architecture/foundations/module-boundaries-and-public-apis.md**, “Public API per non-trivial module” and “Barrels are contracts, not export dumpsters”.

| Backend path | Responsibility, entry and consumers |
|---|---|
| `backend/src/domain/commerce/{Quantity,Money,Cart,Order,CheckoutPolicy}.ts` | Pure quantity, monetary arithmetic, cart/order validity and checkout decisions from supplied facts. Entry `domain/commerce/index.ts`; consumed by commerce application operations. Imports no transport, database or startup modules. Proposed single configured shop currency; integer minor units with checked arithmetic. |
| `backend/src/application/catalog/{SearchCatalog.ts,contracts.ts,CatalogReader.ts}` | Search coordination and bounded query/result contract. HTTP handlers consume its public entry; persistence implements its reader. No artificial catalog entity lifecycle. |
| `backend/src/application/commerce/{GetCart,SetCartQuantity,Checkout,GetOrder}.ts` | Own workflows, customer-scoped access decisions, expected cart revision and transaction coordination. `contracts.ts` owns commands/results; `CommerceStore.ts` owns required transactional interactions. |
| `backend/src/application/identity/{Principal,SessionVerifier}.ts` | Trusted customer identity and required session verification contract. HTTP authentication consumes verifier; authentication integration implements it. No credential fields enter commerce commands. |
| `backend/src/infrastructure/persistence/{PostgresCatalogReader,PostgresCommerceStore,Database}.ts` | Parameterized SQL, transaction connection, row mapping, locking and database-error translation. Implements application contracts; exposes constructors to composition only. |
| `backend/src/infrastructure/auth/SessionVerifierAdapter.ts` | Integrates an established authentication/session solution. Exact provider and login mechanism remain conditional. Does not invent cryptography. |
| `backend/src/presentation/http/{catalog,cart,orders}/` | Each contains `routes.ts`, `schemas.ts`, `responses.ts`: routing, unknown-input parsing and public-output mapping. Imports application public entries; never database adapters. |
| `backend/src/presentation/http/auth/requireCustomer.ts` | Uses injected verifier; supplies trusted principal. Cookie deployment requires CSRF protection on mutations. |
| `backend/src/presentation/http/errors/problemResponse.ts` | Maps expected outcomes and unexpected failures to safe public problems; excludes SQL details and credentials. |
| `backend/src/composition/{bootstrap,config}.ts` | Checks configuration, constructs adapters, supplies operations and handlers, starts the selected HTTP framework. Imports the required outer and inner modules. |
| `backend/db/migrations/001_shop.sql` | Products/current prices/stock; customer carts and lines; immutable order snapshots; checkout-attempt ledger. Constraints and indexes described below. Migration tooling owns execution before serving traffic. |
| `contracts/shop-api.yaml` | One proposed HTTP agreement, reviewed jointly for browser and backend. Neither side imports the other side’s internal domain model. |
| `backend/tests/{domain,application,database,http}/` | Proposed checks by evidence boundary, not executed tests. |

`CommerceStore` is deliberately a transactional capability, not four generic repositories. Checkout needs stock, cart, order and deduplication to commit together. Splitting them into independently committing repositories would obscure that requirement. Its callback exposes scoped methods such as `lockCart(customerId)`, `claimAttempt(...)`, `lockProducts(ids)`, `saveOrder(...)`, `consumeCart(...)` and `completeAttempt(...)`; no SQL client escapes inward.

This ownership follows **H/architecture/backend/README.md**, “Place your first feature”, and **H/architecture/foundations/code-placement.md**, “Responsibilities” and “Parsing and mapping follow the boundary”. The exact files and transaction capability are **I**, not handbook prescriptions.

| Frontend path | Responsibility, supported interaction and consumers |
|---|---|
| `frontend/src/application/catalog/{CatalogReader,contracts}.ts` | Framework-neutral search query/result and required read operation. No pass-through use-case class. |
| `frontend/src/application/cart/{CartGateway,contracts}.ts` | Read cart and conditional quantity replacement contracts. Server data remains authoritative. |
| `frontend/src/application/checkout/{CheckoutFlow,CheckoutGateway,PendingAttemptStore,contracts}.ts` | Coordinates persisted attempt identity, submission, outcome reconciliation and recovery. Public entry supplies `start`, `resume`, and resolved/unknown/refused results. |
| `frontend/src/infrastructure/http/{catalog,cart,checkout,orders}/` | Adapter and wire schema/parser/map functions per capability. Checks unknown responses, maps public errors and supplies internal representations. No React imports. |
| `frontend/src/infrastructure/browser/checkout/PendingAttemptStorage.ts` | Stores customer-scoped key and exact checkout command before sending. Validates stored data; never stores credentials or treats storage as server truth. |
| `frontend/src/presentation/catalog/{pages/CatalogPage.tsx,hooks/useCatalog.ts,components/ProductCard/}` | Search form, results, loading/empty/failure feedback and add-to-cart intent. Card props/styles remain colocated. |
| `frontend/src/presentation/cart/{pages/CartPage.tsx,hooks/useCart.ts,components/CartLine/,components/CheckoutSummary/}` | Quantity drafts, serialized mutations, cart feedback and checkout interaction. Does not calculate an authoritative payable order. |
| `frontend/src/presentation/orders/{pages/OrderPage.tsx,components/OrderSummary/}` | Displays the server’s immutable order snapshot; refreshes through the order reader. |
| `frontend/src/presentation/session/SessionBoundary.tsx` | Signed-in/loading/expired-session states and sign-in handoff. Clears customer-scoped cached data when identity changes. |
| `frontend/src/presentation/shared/{components/Feedback.tsx,formatters/formatMoney.ts}` | Actual shared consumers: catalog, cart and order screens. Formatting consumes currency and minor units, without price policy. |
| `frontend/src/presentation/appearance/{tokens.css,global.css,ThemeProvider.tsx}` | Single semantic-token/theme authority; application-wide reset and responsive foundations. Component layout remains colocated in `*.module.css`. |
| `frontend/src/composition/{bootstrap.tsx,routes.tsx}` | Constructs HTTP/storage adapters and checkout flow, injects supported dependencies, composes pages and session/appearance providers. |
| `frontend/tests/{interaction,integration,visual}/` | Proposed UI, adapter and rendered-state checks. |

Frontend Domain is intentionally absent: this scope supplies no independent client business policy. Application contracts describe remote facts; server domain rules are not duplicated as trusted browser rules. There is also no frontend ORM-style repository, global Redux store, DI container or generated SDK requirement. These omissions apply **H/architecture/frontend/README.md**, “Core model”; **H/architecture/frontend/ports-and-adapters.md**, “Physical ownership”; and **H/architecture/foundations/dependency-boundaries.md**, “Avoid ceremonial boundaries”.

**One public contract, with distinct internal representations.** These endpoint shapes are **I**. They constitute a resource-oriented HTTP interface; no broader REST-conformance claim is made. See **H/architecture/api-design/README.md**, “Classify the design choice”, and **H/architecture/api-design/contracts-and-boundaries.md**, “Describe the agreement” and “Validate at the boundary”.

| Interaction | Input → output and significant failures |
|---|---|
| `GET /api/products?q=&cursor=&limit=` | Public bounded search → `{items:[{id,name,price:{minorUnits,currency},availability}],nextCursor}`. Stable ID tie-breaker; cursor bound to search. Reject malformed/beyond-limit input; an empty result is successful. Availability is informational. |
| `GET /api/cart` | Verified customer → `{revision,lines,currentTotal}`. Cart revision covers cart contents; displayed current prices may change independently. Private response uses `Cache-Control: no-store`. |
| `PUT /api/cart/lines/{productId}` | `{quantity,expectedRevision}` → updated cart. Zero removes a line; positive integers set absolute quantity. Unknown product, invalid quantity, revision conflict or unauthenticated request are explicit failures. Cart membership does not reserve stock. |
| `POST /api/orders` | `Idempotency-Key` plus `{cartRevision}` → `201`, `Location`, immutable order snapshot. Checkout uses current server prices. Cart changed, empty cart, insufficient stock and key reuse with different command have distinct `409` problem codes. |
| `GET /api/orders/{orderId}` | Verified customer → owned order; nonexistent or another customer’s order returns the same `404` representation. |
| `GET /api/checkout-attempts/{key}` | Verified customer → resolved order/refusal, or no committed result. A missing result does not prove rollback; retry the original POST with the same key. |

Every error has a stable machine code and safe human description; malformed shape is `400`, unauthenticated is `401`, invalid accepted business quantity is `422`, and transient unavailability is `503` where an HTTP response can be delivered.

HTTP DTOs contain no trusted customer ID, price, total, stock or order status input. `CheckoutCommand` instead contains the verified customer ID, attempt key and expected cart revision. `CheckoutResult` is an application union, not an HTTP response. `Order` is a domain value; `OrderSummaryProps` is a presentation contract. Wire parsers, database mapping and display formatting remain separate owners.

Authentication provider, account onboarding and credential recovery are unresolved integration choices. The scheme requires a verified customer session and a sign-in handoff, rather than silently inventing an account product. Resource access is customer-scoped even though there is only one merchant. This applies **H/architecture/api-design/security-and-tenancy.md**, “Identity and permission”, “Scope every object” and “Other request threats”, without importing its example’s multitenant model.

**Checkout trace and failure ownership.**

1. `useCart.ts` finishes or rejects queued quantity changes before checkout. `CheckoutFlow.ts` creates a high-entropy attempt key and persists `{customerId,key,cartRevision}` before the first submission. If persistence fails, it reports failure before submitting.
2. The HTTP checkout adapter sends the immutable command. `orders/routes.ts` authenticates, parses and calls `Checkout.ts`; it never trusts a request customer ID or price.
3. `Checkout.ts` enters `CommerceStore`’s transaction. The adapter claims a unique ledger key scoped to **customer + checkout operation + key**, storing a fingerprint of the immutable command.
4. Existing completed attempt with identical fingerprint returns its recorded result **before** consulting the now-changed cart. Different fingerprint is refused. Concurrent same-key requests serialize on the unique claim; a bounded wait returns `checkout-in-progress` if unresolved.
5. For a new attempt, lock the customer cart. All quantity writes and checkout use that lock and increment/check its revision. A stale revision or empty cart produces a recorded refusal.
6. Lock affected product rows in deterministic ID order. Read current prices and stock under those locks. `CheckoutPolicy.ts` evaluates supplied facts, and `Order.ts` creates immutable line-price and total snapshots.
7. Guarded stock decrements, order/lines insertion, cart consumption and completed ledger result commit together. Proposed database backstops include nonnegative stock, valid quantities, unique cart/product lines, unique customer cart, and **unique order per consumed `(customerId,cartRevision)`**. The last constraint also protects competing checkout keys for the same cart state.
8. Commit precedes `201`. The browser validates the response, clears its pending attempt, refreshes cart and navigates to the order. Refresh failure cannot turn a confirmed order into a failed checkout.

Domain owns the no-overselling rule; the database adapter implements atomic enforcement. Two transactions purchasing the final unit cannot both decrement it successfully. Multiple-line checkout rolls back all deductions if any line fails. The selected database implementation must demonstrate this with real concurrent transactions.

A business refusal records its terminal result without changing stock/cart; deliberate retry after correction uses a new key. Unexpected SQL failures roll back the whole transaction. Deadlock/serialization retries are bounded and rerun the whole operation with the original key. Network loss or a commit acknowledgment failure is **unknown**, not “order failed”: retain the attempt and reconcile/retry unchanged. Never generate a replacement key automatically.

Ledger results remain retained for the application’s lifetime in this initial design; keys are not silently expired and reused. This costs storage, but no product retention window is specified. A later retention policy must preserve replay safety or explicitly restrict the supported retry horizon. A resolved order remains accessible only to its owner.

These are **I** algorithms applying **R** consistency requirements. Their principles come from **H/architecture/api-design/reliability-and-operations.md**, “Two bookings for one slot”, “Retries and duplicate requests” and “Timeouts and partial failure”; that appointment example does not prove this stock algorithm.

**Source, runtime and startup relationships stay distinct.**

| Relationship | Concrete example |
|---|---|
| Source dependency | `Checkout.ts` imports commerce Domain and its own `CommerceStore` contract. `PostgresCommerceStore.ts` imports that contract and its SQL driver. `useCart.ts` imports the checkout public application API, never the HTTP adapter. |
| Runtime call | Hook → supplied `CheckoutFlow` → supplied HTTP adapter → network → order handler → supplied `Checkout` → supplied PostgreSQL adapter → database. Interfaces are not runtime forwarding objects. |
| Composition | Backend bootstrap constructs database/store/verifier, injects operations, then handlers. Browser bootstrap constructs HTTP/storage adapters, checkout flow and screen dependencies. Neither inner application resolves a global container. |

Basis: **H/architecture/foundations/dependency-boundaries.md**, “Do not confuse runtime flow with source dependency”; **H/architecture/foundations/composition-root.md**, “Keep composition out of inner modules”.

**Browser ownership and behavior.**

Search query/cursor live in the URL; the search input draft is local. Catalog results belong to the current query, with cancellation plus request-generation checks so late responses cannot replace newer results. Cart/order snapshots are customer-scoped server state. Quantity drafts and visible errors live in their feature hooks. Mutations use a queue and expected revisions; conflicts reload the cart and ask the user to reapply intent. No optimistic stock or checkout-success claims.

Pending checkout recovery outlives a route/reload through its storage adapter. An unknown attempt remains visibly “Checking order outcome”; checkout cannot silently start another attempt. Expired authentication preserves the attempt but reveals no previous customer data to a newly signed-in customer.

Each page has initial loading, successful empty, retriable error and refresh states. Preserve last successful data during refresh with a stale indicator. Quantity controls have labels, keyboard-operable native controls and associated validation. Announce async status; move focus to an error summary after failed submission and the order heading after navigation. Responsive cart lines stack without losing labels.

`tokens.css` owns primitive scales and semantic `canvas`, `surface`, `text`, `border`, `action`, `danger` and `focus` roles. One `ThemeProvider` resolves explicit light/dark preference or system appearance; system changes apply only in system mode. Storage failure falls back to a usable in-memory preference. Global styles own defaults/reduced motion; components own layout and consume tokens. No Panda or second theme engine is required.

Basis: **H/architecture/frontend/presentation-architecture.md**, “Screen interaction and components”; **H/architecture/frontend/state-management.md**, “Assign state by responsibility”, “Browser persistence is an external detail” and “Server state vs. application policy”; **H/architecture/frontend/styling-and-design-system.md**, “Use a layered design-system pipeline”, “Global styles have one owner” and “Responsive design”.

**Change impact and proposed checks.**

| Challenge | Expected impact and observable check |
|---|---|
| Business change: maximum quantity per product | Change commerce Domain policy, operation tests and aligned database constraints. UI translates the existing refusal or a reviewed new code; catalog layout and HTTP adapter internals remain unaffected. |
| Integration change: persistence provider/driver | Change `PostgresCommerceStore`, database startup and migrations. Preserve application contract; rerun concurrency/rollback checks. A substitute lacking required atomicity is incompatible, despite implementing the TypeScript interface. |
| Additional caller: mobile client | Consume `contracts/shop-api.yaml`; review authentication for that caller. Reuse backend operations and enforcement. No dependency on browser hooks or private backend SQL. |
| Valid checkout | Real HTTP/database test creates one order, correct snapshots, decremented stock, consumed cart and replayable result. |
| Last-unit race and multi-line failure | Two customers contend for one unit: one success, one stock conflict, no negative stock. A later unavailable line rolls back earlier deductions. |
| Retry ambiguity | Drop response after commit; repeat same key and assert identical public result and one order. Exercise concurrent same key, changed fingerprint, different keys for one revision and transaction interruption. |
| Authorization and parsing | Other customer’s order/attempt is hidden; forged customer/price fields rejected; malformed/oversized input refused; permitted customer access still succeeds. |
| Browser races and accessibility | Delay older search responses, reorder mutation completions, reload during unknown checkout, change customer and deny browser storage. Check focus, keyboard operation, feedback, narrow layouts and all appearance modes. |
| Structural rules | Permit `Checkout → application CommerceStore`; reject `Checkout → PostgresCommerceStore`. Permit pages importing another capability’s public entry; reject deep imports of its hook state. Include type-only imports, reexports and dynamic imports in checks. |

These checks are proposed and unexecuted. Their separation follows **H/architecture/foundations/architecture-testing.md**, “What to enforce” and “Test behavior and boundaries separately”.

Payment, shipping, tax, administration and multiple merchants are excluded by **R**. No stock reservations, search service, events/outbox, worker, microservices or microfrontends are proposed: no scoped requirement justifies their additional failure modes. Catalog search begins as a bounded database query; indexing and a separate search integration remain conditional on measured needs.

This scheme is coherent under its stated assumptions. It does not establish compiling code, database isolation, deployed security or accessible rendering; those require the proposed implementation-level evidence. No application files were written.
