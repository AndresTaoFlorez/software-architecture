> **[Onion Architecture for the Frontend](README.md)** › Appendix — Advanced Patterns. Full reference list: [§10 References](README.md#10-references).

## 8. Appendix — Advanced Patterns (Bonus)

The patterns below are **not part of the core four-layer model**. They are concrete techniques and
recommended conventions used by production applications built on this architecture, included to show how
non-trivial concerns find a natural home in a specific layer without disturbing the others. They are
optional.

### 8.1 Offline-first synchronization with CRDT / Last-Write-Wins — *Infrastructure*

A `SyncEngine` loads cached data from `localStorage` instantly, then reconciles it with the server in the
background. Each entity may carry a `_localUpdatedAt` timestamp; on merge, a recent local edit wins over
stale server data within a short window, otherwise the server is authoritative. This is a deliberate
**Last-Write-Wins register**, the simplest member of the family of Conflict-free Replicated Data Types
[Shapiro et al. 2011]. It lives entirely in Infrastructure, behind the repository boundary, so use cases
and components remain unaware that caching or conflict resolution occur.

### 8.2 Optimistic updates — *Presentation + Infrastructure*

A store applies a mutation to local state immediately (so the UI responds without waiting for the network),
then confirms it against the server in the background and reconciles via the sync engine. The optimistic
write is a Presentation concern; the reconciliation rules live in Infrastructure. The use case in between
stays a plain orchestration step.

### 8.3 Transparent token refresh & request deduplication — *Infrastructure*

The HTTP client refreshes an expired access token on a `401` and retries the original request. Concurrent
`401`s share a single in-flight refresh promise (`_refreshPromise`) so the refresh endpoint is called once,
not once per failed request. Because this is confined to `client.js`, authentication lifetime is invisible
to every layer above it.

### 8.4 Shell "boards" pattern — *Presentation*

A fixed application shell (top bar + sidebar) exposes named outlets into which individual views publish
contextual controls (filters, toolbars) via Vue's `Teleport`. This keeps the chrome stable while letting
each page contribute its own controls, and it is purely a Presentation-layer composition technique.

### 8.5 Feature-based component organization — *Presentation*

As a Presentation layer grows, a flat `presentation/components/` directory degrades into a bag of unrelated
files where `LoginForm.vue` sits beside `OrderCard.vue` and a generic `Button.vue`. The remedy is to group
components by the **feature** (or domain area) they serve, with a `shared/` folder reserved for genuinely
cross-feature primitives:

```
presentation/
└── components/
    ├── shared/              # cross-feature primitives: BaseButton, BaseModal, Badge
    │   ├── BaseButton.vue
    │   └── BaseModal.vue
    ├── auth/                # everything the auth feature renders
    │   ├── LoginForm.vue
    │   ├── SignupForm.vue
    │   └── UserMenu.vue
    └── orders/
        ├── OrderList.vue
        ├── OrderCard.vue
        └── OrderFilters.vue
```

The rule of thumb: a component lives in a feature folder when it is meaningful only to that feature; it
graduates to `shared/` only once a *second* feature genuinely needs it. Resist promoting early — a premature
`shared/` becomes its own junk drawer, the very problem feature folders exist to solve.

This is the same "screaming architecture" instinct the top-level layer folders already express
[Martin 2017], applied one level down: the folder names announce *what the UI is about* (auth, orders)
before *what the pieces are* (forms, cards). It also follows the colocation principle — code that changes
together should live together, so a change to the auth screens touches one folder instead of ranging across
a flat tree [Dodds 2019]. Modern frontend methodologies such as Feature-Sliced Design formalize exactly this
feature-first slicing [Feature-Sliced Design].

A route-level component in `presentation/views/` then *composes* feature components: the feature folder is
the home of the pieces, the view is the assembly point.

### 8.6 Styling & animation architecture — *Presentation*

Where a component's styles and imperative animations (GSAP timelines, scroll triggers) should live — the
mirrored `styles/` tree vs. colocation in the feature folder, and when to choose each — is covered in its own
companion document: **[styling-and-animation.md](5-styling-and-animation.md)**. It is a Presentation-layer
detail, kept separate so this guide stays focused on the four core layers.

