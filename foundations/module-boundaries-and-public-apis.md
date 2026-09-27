# Module Boundaries and Public APIs

Layer boundaries protect policy from technology. Module boundaries protect one capability from another.

A large codebase needs both.

## 1. Optimize for high cohesion and low coupling

Code that changes for the same reason should be easy to find together. Code owned by different capabilities should interact through narrow contracts.

A common frontend failure mode is technically neat but behaviorally scattered:

```text
components/closures/
hooks/useClosures.ts
state/slices/closuresSlice.ts
state/selectors/closuresSelectors.ts
types/closures.types.ts
utils/closureHelpers.ts
```

Every file belongs to the same capability, but changing that capability requires jumping across the entire Presentation tree.

Prefer a feature-owned module:

```text
features/
└── closures/
    ├── ui/
    ├── model/
    ├── lib/
    └── index.ts
```

The exact segment names are conventions. The invariant is ownership.

Redux's official style guide independently recommends feature folders because colocating feature logic makes it easier to maintain. Feature-Sliced Design formalizes the same high-cohesion idea with slices and public APIs; this repository borrows that principle without requiring the full FSD layer taxonomy.

## 2. Public API per non-trivial module

External consumers should import through a module entry point:

```ts
// features/closures/index.ts
export { ClosuresPanel } from './ui/ClosuresPanel'
export { useClosures } from './model/useClosures'
export type { ClosureViewModel } from './model/closure.types'
```

Consumer:

```ts
import { ClosuresPanel, useClosures } from '@/presentation/features/closures'
```

Avoid deep imports:

```ts
import { executeClosureThunk } from '@/presentation/features/closures/model/closures.thunks'
```

A public API makes internal refactors local.

## 3. Barrels are contracts, not export dumpsters

An `index.ts` should intentionally expose supported API.

Avoid:

```ts
export * from './slice'
export * from './selectors'
export * from './internalHelpers'
export * from './types'
```

This erases the difference between public and private implementation.

Prefer explicit exports:

```ts
export { useClosures } from './model/useClosures'
export type { ClosureViewModel } from './model/closure.types'
```

A single application-wide "contract.ts" that re-exports unrelated domain, application and presentation types can hide ownership rather than improve it.

## 4. Shared is earned

Default ownership is local.

Move code to `shared` only when it is genuinely independent of the originating feature and has a stable cross-feature purpose.

Good:

```text
shared/ui/Button
shared/ui/DataTable
shared/lib/date
shared/lib/format-bytes
```

Suspicious:

```text
shared/helpers.ts
shared/common.ts
shared/misc.ts
shared/utils.ts
```

A shared library should be nameable by purpose. If its purpose is "things used in many places", it is not a coherent module.

## 5. `common` vs. `shared`

Do not maintain both categories without a written distinction.

Recommended default:

- `shared/ui` — framework-level or application-wide UI primitives;
- `shared/lib` — focused reusable libraries;
- feature-local `lib` — helpers that still belong to one capability.

Avoid a generic `common` folder. It tends to become a second shared dump.

## 6. Type ownership follows meaning

Do not centralize every TypeScript interface into `types/`.

Prefer:

```text
features/closures/
├── ui/QueryFilters/QueryFilters.types.ts   # component contract
├── model/closure-state.types.ts            # feature presentation state
└── index.ts

application/closures/
└── execute-closure.types.ts                # use-case contract

infrastructure/closures/
└── closure-api.dto.ts                      # transport shape
```

Types erased at runtime still create source-level coupling.

## 7. Avoid horizontal feature coupling

Feature A should not casually reach into Feature B's internals.

When two capabilities repeatedly depend on each other, consider:

- moving shared domain meaning inward;
- composing them at a page/widget/application level;
- defining an explicit public contract;
- revisiting whether the original feature boundary is wrong.

Do not solve coupling by adding more barrels.

## 8. Naming should reveal purpose

Prefer:

```text
closure-validation.ts
judicial-date-range.ts
catalog-normalization.ts
```

over:

```text
helpers.ts
utils2.ts
common.ts
manager.ts
service.ts
```

Role suffixes are useful when they add information: `*.mapper.ts`, `*.selector.ts`, `*.adapter.ts`, `*.recipe.ts`.

## Sources

- Redux Style Guide — feature folders and state organization: https://redux.js.org/style-guide/
- Redux FAQ — code structure: https://redux.js.org/faq/code-structure/
- Feature-Sliced Design — slices and public APIs: https://feature-sliced.design/docs/reference/slices-segments
- Feature-Sliced Design — public API: https://feature-sliced.design/docs/reference/public-api
