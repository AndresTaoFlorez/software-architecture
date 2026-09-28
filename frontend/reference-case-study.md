# Reference Case Study: XXI Web UI

This case study records architectural lessons extracted from:

```mermaid
flowchart TD
    N0["AndresTaoFlorez/tyba-support-platform"]
    N1["experiments/xxi/web-ui"]
    N0 --> N1
```

The reviewed snapshot is a **reference implementation, not the specification**.

Its useful patterns are generalized here. Its accidental complexity and boundary leaks are documented explicitly so they are not copied into new projects.

---

## 1. What should be promoted

### 1.1 Explicit application boundaries

The project uses:

```mermaid
flowchart TD
    SRC["src/"] --> D["domain/"]
    SRC --> A["application/"]
    SRC --> I["infrastructure/"]
    SRC --> P["presentation/"]
    SRC --> C["composition/"]
```

with [architecture tests](../GLOSSARY.md#architecture-test) that verify import direction.

That is stronger than a folder diagram alone.

### 1.2 Explicit Composition Root

Concrete [Infrastructure](../GLOSSARY.md#infrastructure) is wired to [Application](../GLOSSARY.md#application-layer) and the UI [store](../GLOSSARY.md#store) in one outer composition module.

The pattern should be retained; the concrete classes are project-specific.

### 1.3 UI components grouped by capability

Examples such as:

```mermaid
flowchart TD
    N0["components/"]
    N1["auth/"]
    N2["closures/"]
    N3["profile/"]
    N4["token/"]
    N5["shared/"]
    N0 --> N1
    N0 --> N2
    N0 --> N3
    N0 --> N4
    N0 --> N5
```

are materially better than one flat component directory.

The generalized version in this repository goes further: when a feature becomes large, its hooks, [selectors](../GLOSSARY.md#selector), state and helpers should migrate under the same feature owner rather than remaining distributed across application-wide technical folders.

### 1.4 Complex component colocation

The pattern:

```mermaid
flowchart TD
    N0["Component/"]
    N1["Component.tsx"]
    N2["Component.styles.ts"]
    N3["Component.types.ts"]
    N4["index.ts"]
    N0 --> N1
    N0 --> N2
    N0 --> N3
    N0 --> N4
```

is a good default for non-trivial components.

Files remain optional. A component with no dedicated types file should not receive an empty one.

### 1.5 Public feature hooks

Hooks such as `useAuth`, `useClosures`, `useTheme`, `useToast` and `useUi` give React a semantic interface over state machinery.

That is a useful [Presentation Model](../GLOSSARY.md#presentation-model)/[ViewModel](../GLOSSARY.md#viewmodel)-style boundary.

### 1.6 Selectors separate derivation from mutation

Dedicated [selectors](../GLOSSARY.md#selector) keep derived state outside [reducers](../GLOSSARY.md#reducer) and components.

### 1.7 Architecture tests

The project checks import boundaries with the TypeScript [AST](../GLOSSARY.md#abstract-syntax-tree-ast), including relative and type-only imports. It also protects public hook boundaries and rejects direct Redux imports from selected UI surfaces.

This should become a first-class architectural practice.

### 1.8 Panda semantic tokens and slot recipes

The project has a mature direction:

```mermaid
flowchart LR
    T["Tokens"] --> S["Semantic tokens"] --> TS["Text / layer styles"] --> R["sva slot recipes"] --> C["Components"]
```

The local `sva` pattern for multipart components is worth preserving after duplicate [recipes](../GLOSSARY.md#recipe) are removed.

---

## 2. What should not be promoted unchanged

### 2.1 `SessionRepository` became a capability god-interface

At the reviewed snapshot, one interface owns authentication, environment switching, preferences, catalogs, office queries, account recovery, closure execution, upload, jobs and history.

That is no longer a session capability.

Refactor conceptually toward coherent [ports](../GLOSSARY.md#port):

```mermaid
flowchart TD
    N0["application/"]
    N1["auth/"]
    N2["ports/AuthGateway.ts"]
    N3["catalogs/"]
    N4["ports/JudicialCatalogGateway.ts"]
    N5["closures/"]
    N6["ports/ClosureGateway.ts"]
    N7["ports/ClosureFileGateway.ts"]
    N8["preferences/"]
    N9["ports/PreferencesStore.ts"]
    N0 --> N1
    N1 --> N2
    N0 --> N3
    N3 --> N4
    N0 --> N5
    N5 --> N6
    N5 --> N7
    N0 --> N8
    N8 --> N9
```

Do not mechanically create one interface per endpoint. [Port](../GLOSSARY.md#port) granularity follows cohesive external conversations.

### 2.2 `SessionUseCases` became an application god-service

The same capability sprawl appears in the use-case class.

Prefer use-case/capability ownership:

```mermaid
flowchart TD
    N0["application/closures/"]
    N1["execute-closure.ts"]
    N2["get-closure-history.ts"]
    N3["..."]
    N0 --> N1
    N0 --> N2
    N0 --> N3
```

A class containing several strongly cohesive [use cases](../GLOSSARY.md#use-case) may still be reasonable. The rule is cohesion, not "one class per method".

### 2.3 `domain/session.ts` mixes unrelated ownership

The reviewed [Domain](../GLOSSARY.md#domain) file contains session concepts alongside:

- `ClosureFormState`;
- `UploadQueueItem`;
- table/cache representations;
- closure execution transport/application shapes.

Names such as `FormState`, `UploadQueueItem` and `WebTable` indicate UI or boundary concerns, not stable domain meaning.

A normalized model would separate:

```mermaid
flowchart TD
    N0["domain/"]
    N1["auth/"]
    N2["closures/"]
    N3["Closure.ts"]
    N4["ClosurePeriod.ts"]
    N5["ClosureStatus.ts"]
    N6["judicial-office/"]
    N7["application/"]
    N8["closures/"]
    N9["ExecuteClosureCommand.ts"]
    N10["ports/"]
    N11["..."]
    N12["presentation/features/closures/model/"]
    N13["closure-form.types.ts"]
    N14["upload-queue.types.ts"]
    N15["infrastructure/"]
    N16["..."]
    N0 --> N1
    N0 --> N2
    N2 --> N3
    N2 --> N4
    N2 --> N5
    N0 --> N6
    N7 --> N8
    N8 --> N9
    N8 --> N10
    N7 --> N11
    N12 --> N13
    N12 --> N14
    N15 --> N16
```

### 2.4 Browser `File` leaks into Application

An [Application](../GLOSSARY.md#application-layer) [port](../GLOSSARY.md#port) currently receives the browser `File` type.

`File` belongs to the Web File API. The outer [adapter](../GLOSSARY.md#adapter) should translate it to an application-owned content/stream abstraction.

### 2.5 The application-wide `contract.ts` hides ownership

A large barrel re-exports [Domain](../GLOSSARY.md#domain) and [Application](../GLOSSARY.md#application-layer) types to [Presentation](../GLOSSARY.md#presentation-layer).

That can make imports look clean while preserving conceptual coupling.

Prefer explicit capability [public APIs](../GLOSSARY.md#public-api):

- `application/auth/index.ts`
- `application/closures/index.ts`
- `application/catalogs/index.ts`

with deliberate exports.

### 2.6 `useClosures` has become a God ViewModel

The public facade is a good idea, but it accumulates query logic, draft behavior, uploads, execution, history, validation and UI feedback.

Keep the facade while splitting internal concerns:

```mermaid
flowchart TD
    N0["presentation/features/closures/model/"]
    N1["useClosureQuery.ts"]
    N2["useClosureDraft.ts"]
    N3["useClosureUploads.ts"]
    N4["useClosureExecution.ts"]
    N5["useClosureHistory.ts"]
    N6["useClosures.ts"]
    N0 --> N1
    N0 --> N2
    N0 --> N3
    N0 --> N4
    N0 --> N5
    N0 --> N6
```

### 2.7 Redux Toolkit mechanics leak through the facade

The public hook inspects `queryOfficeClassesThunk.rejected.match(...)`.

A public feature hook should receive a semantic result from bindings:

```ts
type Result<T, E> =
  | { ok: true; value: T }
  | { ok: false; error: E }
```

The knowledge of `fulfilled` / `rejected` ends at the Redux [adapter](../GLOSSARY.md#adapter) boundary.

### 2.8 A slice owns too many mechanisms

The large closures slice contains or coordinates:

- Redux [reducers](../GLOSSARY.md#reducer)/state;
- async [thunks](../GLOSSARY.md#thunk);
- React bindings;
- [selectors](../GLOSSARY.md#selector) through imports;
- browser draft persistence.

As the feature grows, keep these responsibilities colocated under `features/closures/model`, but split them into meaningful files.

### 2.9 Browser persistence is mixed with React lifecycle/state

Draft persistence currently reaches `sessionStorage` from slice helpers and is triggered by a public hook effect.

Prefer a storage [adapter](../GLOSSARY.md#adapter) and, when Redux owns the state transition, a listener/[middleware](../GLOSSARY.md#middleware) workflow.

### 2.10 Panda recipes are duplicated

The project contains both:

```mermaid
flowchart LR
    LOCAL["Component.styles.ts"] --> SVA["sva(...)"]
    GLOBAL["presentation/recipes/*.recipes.ts"] --> SLOT["defineSlotRecipe(...)"]
```

for overlapping visual definitions.

The corrected rule is:

```mermaid
flowchart LR
    L["Local feature / component"] --> S["sva"]
    G["Shared config / design-system recipe"] --> R["defineRecipe / defineSlotRecipe"]
```

Never both for the same [recipe](../GLOSSARY.md#recipe).

### 2.11 `global.css` competes with Panda

A manual global stylesheet redefines theme variables that are also owned by `panda.config.ts`.

If Panda owns the [design system](../GLOSSARY.md#design-system), [semantic tokens](../GLOSSARY.md#semantic-token), global styles and keyframes should have one source of truth.

### 2.12 `common` and `shared` are ambiguous

Both categories exist.

Prefer:

- `shared/ui/`
- `shared/lib/`
- feature-local `lib/`

and remove a generic `common` bucket unless the project can define a non-overlapping responsibility for it.

---

## 3. Normalized target

The generalized structure is:

```mermaid
flowchart TD
    SRC["src/"] --> D["domain/"]
    SRC --> A["application/"]
    SRC --> I["infrastructure/"]
    SRC --> C["composition/"]
    SRC --> P["presentation/"]
    D --> DA["auth/"]
    D --> DC["closures/"]
    D --> DJ["judicial-office/"]
    A --> AA["auth/"]
    AA --> AAP["ports/"]
    AA --> AAU["use-cases/"]
    A --> ACAT["catalogs/"]
    A --> ACL["closures/"]
    ACL --> ACLP["ports/"]
    ACL --> ACLU["use-cases/"]
    I --> IA["auth/"]
    I --> ICAT["catalogs/"]
    I --> ICL["closures/"]
    I --> IS["storage/"]
    C --> CT["container.ts"]
    P --> APP["app/"]
    P --> PAGE["pages/"]
    P --> FTR["features/"]
    P --> SH["shared/"]
    FTR --> FA["auth/"]
    FA --> FAUI["ui/"]
    FA --> FAM["model/"]
    FA --> FAI["index.ts"]
    FTR --> FC["closures/"]
    FC --> FCUI["ui/"]
    FC --> FCM["model/"]
    FC --> FCL["lib/"]
    FC --> FCI["index.ts"]
    SH --> SHUI["ui/"]
    SH --> SHLIB["lib/"]
```

This structure is not a migration command for the XXI project. It is the **conceptual reference** extracted from it for future projects.

---

## 4. Canonical flow

For a policy-bearing closure operation:

```mermaid
flowchart TD
    PAGE["ClosuresPage"] --> VM["useClosures() — Presentation facade"] --> STATE["Closure bindings / state — Presentation adapter"] --> UC["ExecuteClosure — Application use case"] --> PORT["ClosureGateway — Application port"]
    HTTP["HttpClosureGateway — Infrastructure adapter"] --> PORT
    ROOT["Composition Root"] -. wires .-> HTTP
    ROOT -. wires .-> UC
    ROOT -. wires .-> STATE
```

For a purely local visual concern:

```mermaid
flowchart LR
    C["Component"] --> L["Local state"]
```

Do not route every checkbox through the entire onion.

---

## 5. Why this case study exists

A reference architecture becomes dangerous when example code is treated as scripture.

The XXI project is valuable because it demonstrates real growth pressure: state, uploads, persistence, feature UI, [design-system](../GLOSSARY.md#design-system) work and import enforcement. Those pressures expose both strong patterns and accidental coupling.

The documentation promotes the former and names the latter explicitly.
