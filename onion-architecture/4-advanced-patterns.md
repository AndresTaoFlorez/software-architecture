> **[Onion Architecture](README.md)** › Advanced Patterns.

# 8. Advanced Patterns

These patterns are **not part of the definition of Onion Architecture**. They are examples of production concerns that should be assigned to an owner without reversing dependency direction.

---

## 8.1 Offline data and synchronization

Offline caching, conflict resolution and synchronization are not automatically Domain concerns.

Separate:

```text
business conflict rule
-> Domain/Application if it is product policy

storage mechanism
-> Infrastructure

UI optimistic feedback
-> Presentation
```

For example, "last write wins" is only a correct domain rule if the product actually accepts that conflict policy. Do not call a timestamp overwrite strategy a CRDT merely because it resolves conflicts.

A true CRDT has mathematical convergence properties; a simple LWW policy may be appropriate, but name it accurately.

---

## 8.2 Optimistic updates

Optimistic feedback usually spans concerns:

```text
Presentation
  -> display provisional state / pending state

Application
  -> owns operation policy when meaningful

Infrastructure
  -> performs remote mutation / retry / transport
```

Rollback/reconciliation semantics belong where their meaning lives.

A generic server-state library can own purely technical cache reconciliation when no application policy is being bypassed.

---

## 8.3 Token refresh and request deduplication

Transparent HTTP token refresh, request coalescing and transport retries are normally Infrastructure concerns.

```text
use case
-> application port
-> HTTP adapter
   -> token refresh
   -> retry
   -> deduplication
```

Inner policy should not receive raw `401`, Axios errors or retry counters unless those details have actual application meaning.

---

## 8.4 Feature ownership in Presentation

A growing Presentation layer benefits from feature ownership, but that is **frontend architecture inside the outer ring**, not an Onion ring.

The canonical guide is:

**[Frontend Presentation Architecture](../frontend/presentation-architecture.md)**

Recommended direction:

```text
presentation/
├── app/
├── pages/
├── features/
│   ├── auth/
│   └── orders/
└── shared/
```

Do not duplicate the full frontend folder specification inside the Onion guide.

---

## 8.5 State libraries

Redux, Pinia, Zustand and equivalent state libraries are Presentation mechanisms.

They can call Application use cases through injected dependencies/adapters without becoming a new Onion layer.

See **[State Management and Side Effects](../frontend/state-management.md)**.

---

## 8.6 Design systems

CSS, Panda CSS, Tailwind, CSS Modules and component recipes are Presentation mechanisms.

Token/recipe architecture is documented centrally in:

**[Styling and Design-System Architecture](../frontend/styling-and-design-system.md)**.

---

## 8.7 Background and realtime work

WebSocket/SSE clients, message subscriptions and browser workers are outer mechanisms.

A useful split:

```text
Infrastructure
-> connection/protocol/reconnect

Application
-> what events mean for the use case

Presentation
-> how current UI reacts/displays
```

If reconnect policy itself is a product requirement, elevate that policy appropriately instead of assuming every retry rule is merely Infrastructure.

---

## 8.8 Do not add patterns by fashion

Before introducing CQRS, event sourcing, CRDTs, a global state machine or a complex sync engine, identify the actual force:

- contention?
- offline editing?
- auditability?
- independent reads/writes?
- long-running workflows?
- distributed convergence?

A pattern without its motivating problem is architectural debt.

## Sources

- Jeffrey Palermo, Onion Architecture: https://jeffreypalermo.com/2008/07/
- Redux, Side Effects Approaches: https://redux.js.org/usage/side-effects-approaches
- Shapiro et al., "Conflict-Free Replicated Data Types" (2011): https://inria.hal.science/inria-00609399/document
