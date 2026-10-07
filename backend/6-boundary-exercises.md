# 6. Boundary Exercises: Change the Same Ticket Capability

← [Style comparison](5-architectural-styles-with-nestjs.md) · [Backend path](README.md) · [Clean backend](../clean-architecture/8-clean-on-the-backend.md) · [Onion backend](../onion-architecture/7-onion-on-the-backend.md)

An analyst still creates the support ticket. Now the support team changes a rule, an operator invokes creation from a terminal, and two callers compete for the last free place in a pilot workspace. Each exercise asks which code should change and which should keep working.

Use the [canonical chapter 2 modules](2-typescript-first-boundaries.md). Complete extension modules below are extracted alongside those modules by [the same executable test](../scripts/backend-ticket-example.test.mjs). They require no Nest, [ORM](../GLOSSARY.md#orm) or database installation. Paths are illustrative files under `src/`; unchanged policy is imported, not copied. Source imports point inward; constructing the objects is startup wiring; the calls after construction are runtime behavior.

## 1. Change a rule without changing its owner

**Situation and failure.** Support reduces the subject limit from 160 to 80 string units and recognizes `reopened` as another stored state. If parsers, controllers and database [adapters](../GLOSSARY.md#adapter) each contain their own rules, changing only one leaves other callers accepting a different ticket.

**Smallest mechanism.** Change the canonical `normalizeTicketSubject` condition to `subject.length > 80`. Extend/reorder the domain vocabulary to `['reopened', 'resolved', 'in_progress', 'open']`. Keep `INITIAL_TICKET_STATUS` explicitly `open`. The list recognizes states; it does not implement reopening or make the first element an initial-state rule.

**Predict the observations.** A trimmed subject of 80 units succeeds; 81 fails without an insert. The unchanged HTTP parser still accepts the shape, and the unchanged operation reports the domain rejection. New tickets still start `open`, and `isTicketStatus('reopened')` recognizes the new value. Any outward exhaustive status-label mapping must intentionally add a label; it is not another business allowlist.

**Who changes?** [Domain](../GLOSSARY.md#domain) owns the limit and vocabulary. Update requirement-specific tests; do not edit the HTTP parser, `CreateTicket` or field mapping merely to repeat the new values. A genuinely new required command field would justify changing those contracts. At many-feature scale, Billing's invoice vocabulary remains unrelated.

**Checked scope.** The test changes a temporary copy of the canonical domain module, recompiles the unchanged callers, checks the new boundary and verifies `open`. It leaves this handbook's initial 160-unit rule unchanged. This checks source coupling and behavior, not independently deployed client compatibility or a future transition policy.

## 2. Add a command-line caller

**Situation and failure.** An operator imports a ticket through a terminal. Reusing the HTTP parser from the CLI would make this caller depend on another delivery mechanism's accepted fields and error policy. Duplicating the subject rule would create another business owner.

**Smallest mechanism.** Accept exactly two positional strings, build the application command, call the public operation and map its result to text and an exit code. A **CLI**, command-line interface, is simply another external way of invoking creation. Its [adapter](../GLOSSARY.md#adapter) owns argument shape, not ticket validity.

`src/presentation/cli/tickets/createTicketCli.ts`:

```ts
import type { CreateTicket } from '../../../application/tickets'

export async function createTicketCli(
  args: readonly unknown[], createTicket: CreateTicket,
): Promise<{ exitCode: number; output: string }> {
  if (args.length !== 2 || typeof args[0] !== 'string' || typeof args[1] !== 'string') {
    return { exitCode: 1, output: 'Usage: create-ticket <subject> <description>' }
  }
  const result = await createTicket.execute({ subject: args[0], description: args[1] })
  if (!result.ok) {
    return result.reason === 'invalid-subject'
      ? { exitCode: 2, output: 'Invalid ticket subject' }
      : { exitCode: 3, output: 'Ticket storage unavailable; outcome may be unknown' }
  }
  return { exitCode: 0, output: 'Created ticket ' + result.ticket.id }
}
```

These codes/messages are our CLI contract, not HTTP statuses or domain rules. An actual executable supplies `process.argv.slice(2)`, assembles the operation with a real repository and established UUID generator, prints the returned message and sets `process.exitCode`. Unexpected defects propagate to that executable's safe logging/exit handling; they are not disguised as invalid subjects.

**Who changes?** Only CLI delivery under `presentation/cli/tickets/` and its executable assembly are new. Creation, the status vocabulary and storage contract stay the same. Another caller uses `application/tickets`, not the HTTP parser or Prisma internals.

**Trust and tests.** Treat arguments as external input. Test wrong argument count/types, blank subject, valid creation, unavailable persistence and unexpected defects. The CLI needs its own verified identity/access policy in a deployed support platform; running in a terminal is not authorization. This shape/behavior exercise does not implement authentication, shell parsing or access to another tenant's tickets.

## 3. Compete for a shared quota

**Situation and failure.** For this pilot workspace, Support permits at most two stored tickets. One already exists; two analysts submit new tickets concurrently. Both can read a count of one before either saves, each decide that a place exists, and leave three tickets. That is a **race**: the result depends on overlapping work against changing shared state.

The support capability is authoritative for the capacity policy. Callers cannot choose the limit. In this exercise the workspace is fixed, records are never deleted, and the count is nonnegative because it comes from the store. It is a cumulative stored-ticket limit, not an active-ticket or per-day policy. These limits keep the failure understandable without pretending to implement production tenancy or billing.

### Own the rule, then require a combined operation

The first mechanism is a pure capacity decision. [Domain](../GLOSSARY.md#domain) owns it; both simulated storage implementations call it rather than repeat its number:

`src/domain/tickets/ticketQuota.ts`:

```ts
export const TICKET_CREATION_LIMIT = 2
export function canAddTicket(storedCount: number): boolean {
  return storedCount < TICKET_CREATION_LIMIT
}
```

A valid decision on an old count is insufficient. [Application](../GLOSSARY.md#application-layer) therefore requires one operation that checks the **current** capacity and inserts together. **Atomic** means the required change completes as a whole or leaves no partial change. This quota contract also requires protection from competing callers: none may invalidate the capacity decision before its insert. Databases distinguish that concurrency protection, called **isolation**, from atomicity. The implementation must either insert within the limit or report full capacity without writing. The contract expresses both requirements without exposing a SQL transaction object.

Keep the guarantee and its expected rejection in an application-owned [port](../GLOSSARY.md#port) module, beside the original persistence contract. The [adapter](../GLOSSARY.md#adapter) can implement this contract without importing the operation that uses it:

`src/application/tickets/ports/TicketQuotaStore.ts`:

```ts
import type { Ticket } from '../../../domain/tickets/Ticket'

export class TicketQuotaExceeded extends Error {}
export interface TicketQuotaStore {
  // Check current capacity and insert atomically; no write on quota rejection.
  // Other storage failures follow TicketRepository's semantics, including uncertain outcomes.
  insertWithinQuota(ticket: Ticket): Promise<void>
}
```

`src/application/tickets/createTicketWithinQuota.ts`:

```ts
import { CreateTicket, type CreateTicketCommand, type CreateTicketResult } from './CreateTicket'
import { TicketQuotaExceeded, type TicketQuotaStore } from './ports/TicketQuotaStore'

export type QuotaCreationResult = CreateTicketResult | { ok: false; reason: 'quota-full' }

export function makeCreateTicketWithinQuota(store: TicketQuotaStore, makeId: () => string) {
  const createTicket = new CreateTicket({ insert: ticket => store.insertWithinQuota(ticket) }, makeId)
  return async (command: CreateTicketCommand): Promise<QuotaCreationResult> => {
    try { return await createTicket.execute(command) }
    catch (error) {
      if (error instanceof TicketQuotaExceeded) return { ok: false, reason: 'quota-full' }
      throw error
    }
  }
}
```

The small wrapper reuses the creation factory and normal error mapping. It adds one application result for the new requirement. The inline `insert` binding forwards to the supplied object; there is no new runtime service represented by the [port](../GLOSSARY.md#port). The deployed quota-enabled caller must use this operation and store binding; continuing to use the unrestricted memory repository would bypass the guarantee.

This is a deliberate extension, not a generic [Unit of Work](../GLOSSARY.md#unit-of-work) for every feature. A real database implementation may use a transaction with a conditional counter update and the insert, or another proven equivalent. A transaction around an ordinary read/write alone may still race at its selected isolation level. [Infrastructure](../GLOSSARY.md#infrastructure) must test the actual storage guarantee.

### Reproduce the broken implementation and compare it with a safe simulation

The first class below **intentionally violates** the contract. `afterRead` pauses both callers after they read the count, making the race repeatable. The second performs the check and write without an `await` between them. In one JavaScript execution agent, another call cannot interleave in that synchronous segment. That is enough for this memory simulation, not for multiple processes or a database.

`src/infrastructure/persistence/tickets/InMemoryQuotaStores.ts`:

```ts
import type { Ticket, TicketData } from '../../../domain/tickets/Ticket'
import { canAddTicket } from '../../../domain/tickets/ticketQuota'
import { TicketQuotaExceeded, type TicketQuotaStore } from '../../../application/tickets/ports/TicketQuotaStore'

// Counterexample only: do not deploy this read-then-write implementation.
export class ReadThenWriteTicketStore implements TicketQuotaStore {
  readonly records = new Map<string, TicketData>()
  constructor(private readonly afterRead: () => Promise<void>) {}
  async insertWithinQuota(ticket: Ticket): Promise<void> {
    const used = this.records.size
    await this.afterRead()
    if (!canAddTicket(used)) throw new TicketQuotaExceeded()
    const data = ticket.snapshot()
    if (this.records.has(data.id)) throw new Error('Duplicate generated identity')
    this.records.set(data.id, data)
  }
}

// Simulation limit: one JS execution agent; use tested database isolation across processes.
export class AtomicMemoryTicketStore implements TicketQuotaStore {
  readonly records = new Map<string, TicketData>()
  async insertWithinQuota(ticket: Ticket): Promise<void> {
    const data = ticket.snapshot()
    if (this.records.has(data.id)) throw new Error('Duplicate generated identity')
    if (!canAddTicket(this.records.size)) throw new TicketQuotaExceeded()
    this.records.set(data.id, data) // no asynchronous gap after the capacity check
  }
}
```

The public maps are fixture/observation access for this teaching simulation. Production must encapsulate its authoritative writes; letting callers mutate the map would defeat the capacity check. Neither class is durable or coordinates other processes.

Now assemble both versions with the same policy and inputs. The promise below releases only when **both** reads have happened; no timeout or lucky scheduling is involved:

`src/composition/compareQuotaStores.ts`:

```ts
import { Ticket } from '../domain/tickets/Ticket'
import { makeCreateTicketWithinQuota } from '../application/tickets/createTicketWithinQuota'
import type { TicketQuotaStore } from '../application/tickets/ports/TicketQuotaStore'
import { AtomicMemoryTicketStore, ReadThenWriteTicketStore } from '../infrastructure/persistence/tickets/InMemoryQuotaStores'

export async function compareQuotaStores() {
  let reads = 0
  let release!: () => void
  const bothRead = new Promise<void>(resolve => { release = resolve })
  const unsafe = new ReadThenWriteTicketStore(() => {
    if (++reads === 2) release()
    return bothRead
  })
  const atomic = new AtomicMemoryTicketStore()
  for (const store of [unsafe, atomic]) {
    store.records.set('existing', Ticket.create('existing', 'Existing ticket', '').snapshot())
  }
  let sequence = 0
  const input = { subject: 'Invoice download fails', description: 'PDF fails for INV-42.' }
  const run = (store: TicketQuotaStore) => {
    const create = makeCreateTicketWithinQuota(store, () => 'race-' + ++sequence)
    return Promise.all([create(input), create(input)])
  }
  const unsafeResults = await run(unsafe)
  const atomicResults = await run(atomic)
  return {
    unsafe: { results: unsafeResults, count: unsafe.records.size },
    atomic: { results: atomicResults, count: atomic.records.size },
  }
}
```

**Expected observation.** The unsafe store returns two successes and count three. The atomic simulation returns one success and one `quota-full`, with count two. Also test that an invalid subject consumes no place, duplicate identity does not overwrite, and recognized outages/unknown defects retain the original creation semantics.

**Who changes?** [Domain](../GLOSSARY.md#domain) owns the capacity predicate. [Application](../GLOSSARY.md#application-layer) extends the required guarantee/result. [Infrastructure](../GLOSSARY.md#infrastructure) implements the combined operation. Delivery maps `quota-full` for its own protocol; composition chooses the binding. Billing or another workspace model should not acquire this ticket-specific limit through a generic shared policy bucket.

**Meaningful failures and limits.** These snippets do not prove PostgreSQL isolation, rollback, durable counters, tenant permission checks, fairness or retry deduplication. A database may commit and lose the acknowledgement. Test those at the actual integration boundary before deploying; adding a contract or a transaction does not by itself resolve an uncertain outcome.

## 4. Explain the result before naming the style

For each exercise, name the actor, trusted owner, external input, possible failure and changed files. Then explain what still works when the rule, caller or storage changes. Only after tracing that behavior, describe the design as inward policy protection in Clean or a domain-centered core in Onion. A larger folder tree is not the successful outcome.

The checks compile the documented modules, run the CLI and compare both quota implementations. They do not run Nest or Prisma. Preserve that distinction when presenting the exercises as evidence.

## Sources

- [Martin — Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html): policy ownership and inward boundaries.
- [Palermo — Onion, part 3](https://jeffreypalermo.com/2008/08/the-onion-architecture-part-3/): independently executable core and outward implementation.
- [PostgreSQL — Transaction isolation](https://www.postgresql.org/docs/current/transaction-iso.html): storage isolation must support the actual concurrent guarantee.
- [MDN — JavaScript execution model](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Execution_model): run-to-completion within an agent, not distributed atomicity.
