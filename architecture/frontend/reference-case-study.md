# Reference Case Study: XXI Web UI

Reviewed source: `AndresTaoFlorez/tyba-support-platform`, `experiments/xxi/web-ui`, **commit `982d861d442024331c84041c5a08c147ce2a01ec`**. Evidence below comes from that committed snapshot, not local uncommitted work. This is a reference implementation, not the architecture specification or an instruction to migrate that repository.

A screen interface may also act as a Facade when it deliberately simplifies collaboration among several subsystem objects. The Hook name alone establishes neither pattern; compare the [independent Facade example](../patterns/structural/facade/README.md).

**Contents**

- [What should be promoted](#what-should-be-promoted)
  - [Explicit application boundaries](#explicit-application-boundaries)
  - [Explicit Composition Root](#explicit-composition-root)
  - [UI components grouped by capability](#ui-components-grouped-by-capability)
  - [Complex component colocation](#complex-component-colocation)
  - [Public feature hooks](#public-feature-hooks)
  - [Selectors separate derivation from mutation](#selectors-separate-derivation-from-mutation)
  - [Architecture tests](#architecture-tests)
  - [Panda semantic tokens and slot recipes](#panda-semantic-tokens-and-slot-recipes)
- [What should not be promoted unchanged](#what-should-not-be-promoted-unchanged)
  - [Port cohesion still needs review](#port-cohesion-still-needs-review)
  - [Use-case cohesion follows capabilities](#use-case-cohesion-follows-capabilities)
  - [domain/session.ts mixes unrelated ownership](#domainsessionts-mixes-unrelated-ownership)
  - [Browser File leaks into Application](#browser-file-leaks-into-application)
  - [The application-wide contract.ts hides ownership](#the-application-wide-contractts-hides-ownership)
  - [The public facade coordinates many concerns](#the-public-facade-coordinates-many-concerns)
  - [Redux result translation is already inside bindings](#redux-result-translation-is-already-inside-bindings)
  - [A slice file owns several mechanisms](#a-slice-file-owns-several-mechanisms)
  - [Browser persistence has an explicit utility, but hook-owned orchestration](#browser-persistence-has-an-explicit-utility-but-hook-owned-orchestration)
  - [DataTable recipes have overlapping owners](#datatable-recipes-have-overlapping-owners)
  - [global.css also owns theme variables](#globalcss-also-owns-theme-variables)
  - [common and shared need distinct meanings](#common-and-shared-need-distinct-meanings)
- [Normalized target](#normalized-target)
- [Canonical flow](#canonical-flow)
- [Why this case study exists](#why-this-case-study-exists)

<a id="1-what-should-be-promoted"></a>

## What should be promoted

<a id="11-explicit-application-boundaries"></a>

### Explicit application boundaries

The snapshot has [Domain](../../GLOSSARY.md#domain), [Application](../../GLOSSARY.md#application-layer), [Infrastructure](../../GLOSSARY.md#infrastructure), [Presentation](../../GLOSSARY.md#presentation-layer) and Composition areas. Its [architecture tests](https://github.com/AndresTaoFlorez/tyba-support-platform/blob/982d861d442024331c84041c5a08c147ce2a01ec/experiments/xxi/web-ui/tests/architecture.test.ts) inspect TypeScript import/export declarations and dynamic imports, resolve local references, and protect selected UI/hook boundaries. These checks establish the rules they implement, not every possible conceptual leak.

<a id="12-explicit-composition-root"></a>

### Explicit Composition Root

[The composition module](https://github.com/AndresTaoFlorez/tyba-support-platform/blob/982d861d442024331c84041c5a08c147ce2a01ec/experiments/xxi/web-ui/src/composition/container.ts) assembles concrete [adapters](../../GLOSSARY.md#adapter), [use cases](../../GLOSSARY.md#use-case) and presentation state. Retain injection into consumers rather than importing that module as a [service locator](../../GLOSSARY.md#service-locator).

<a id="13-ui-components-grouped-by-capability"></a>

### UI components grouped by capability

Auth, closures, profile and token components have recognizable owners. When a capability grows, its state, bindings and helpers can move under the same feature owner. This is a recommended evolution, not a required folder count.

<a id="14-complex-component-colocation"></a>

### Complex component colocation

DataTable keeps its rendering and style definitions together. Component-only types and tests can also be colocated when needed; empty files are unnecessary.

<a id="15-public-feature-hooks"></a>

### Public feature hooks

[`useClosures`](https://github.com/AndresTaoFlorez/tyba-support-platform/blob/982d861d442024331c84041c5a08c147ce2a01ec/experiments/xxi/web-ui/src/presentation/hooks/useClosures.ts) offers screen-oriented state and operations. This is an intentional [ViewModel](../../GLOSSARY.md#viewmodel)-like [facade](../../GLOSSARY.md#facade-pattern), not a role inferred from the `use` prefix.

<a id="16-selectors-separate-derivation-from-mutation"></a>

### Selectors separate derivation from mutation

The presentation state area separates derived values from update logic. Derivation remains a presentation concern unless it owns an authoritative business rule.

<a id="17-architecture-tests"></a>

### Architecture tests

[AST](../../GLOSSARY.md#abstract-syntax-tree-ast)-based checks cover more than a folder drawing or a search for `import`. Type-only references also create coupling. A complete check must still account for the language constructs, resolution and package policy of its project.

<a id="18-panda-semantic-tokens-and-slot-recipes"></a>

### Panda semantic tokens and slot recipes

Panda tokens and multipart [recipes](../../GLOSSARY.md#recipe) provide reusable visual contracts. Keep one owner for each decision. Local atomic recipes and registered config recipes are both valid mechanisms; ownership determines which this guide recommends.

<a id="2-what-should-not-be-promoted-unchanged"></a>

## What should not be promoted unchanged

<a id="21-sessionrepository-became-a-capability-god-interface"></a>

<a id="21-port-cohesion-still-needs-review"></a>

### Port cohesion still needs review

The snapshot already has **AuthRepository, ClosuresRepository and PreferencesRepository**. It does not have the previously claimed all-purpose `SessionRepository`. [`ClosuresRepository`](https://github.com/AndresTaoFlorez/tyba-support-platform/blob/982d861d442024331c84041c5a08c147ce2a01ec/experiments/xxi/web-ui/src/application/ports/ClosuresRepository.ts) still combines catalogs, office lookup, search, execution, upload, jobs and history. Consider splitting conversations that have independently meaningful consumers or lifetimes; do not create a [port](../../GLOSSARY.md#port) per endpoint mechanically.

<a id="22-sessionusecases-became-an-application-god-service"></a>

<a id="22-use-case-cohesion-follows-capabilities"></a>

### Use-case cohesion follows capabilities

[`closuresUseCases.ts`](https://github.com/AndresTaoFlorez/tyba-support-platform/blob/982d861d442024331c84041c5a08c147ce2a01ec/experiments/xxi/web-ui/src/application/use-cases/closuresUseCases.ts) contains several closure operations and draft validation. Auth and Preferences are already separate. Further separation should follow independently understandable policy, not a claim that `SessionUseCases` still exists or a one-class-per-method rule.

<a id="23-domainsessionts-mixes-unrelated-ownership"></a>

### `domain/session.ts` mixes unrelated ownership

[`domain/session.ts`](https://github.com/AndresTaoFlorez/tyba-support-platform/blob/982d861d442024331c84041c5a08c147ce2a01ec/experiments/xxi/web-ui/src/domain/session.ts) declares `ClosureFormState`, `UploadQueueItem`, `WebTable`, catalogs and execution shapes alongside session concepts. Review each by meaning: form/upload display state belongs in [Presentation](../../GLOSSARY.md#presentation-layer); wire data belongs with [Infrastructure](../../GLOSSARY.md#infrastructure); operation contracts belong in [Application](../../GLOSSARY.md#application-layer); stable business meaning belongs in [Domain](../../GLOSSARY.md#domain). Names alone are clues, not proof of ownership.

<a id="24-browser-file-leaks-into-application"></a>

### Browser `File` leaks into Application

`ClosuresRepository.uploadClosureFile` receives `File` and a progress callback. That conflicts with this guide's platform-independent [Application](../../GLOSSARY.md#application-layer) default. A browser-specific application can intentionally choose otherwise, but must document the coupling. Translate to application-owned content metadata/bytes or a suitable stream contract when platform independence is required.

<a id="25-the-application-wide-contractts-hides-ownership"></a>

### The application-wide `contract.ts` hides ownership

[`application/contract.ts`](https://github.com/AndresTaoFlorez/tyba-support-platform/blob/982d861d442024331c84041c5a08c147ce2a01ec/experiments/xxi/web-ui/src/application/contract.ts) re-exports many `domain/session` types. An inward-looking import path does not correct mixed semantic ownership. Prefer deliberate capability APIs with the representations the consumer needs.

<a id="26-useclosures-has-become-a-god-viewmodel"></a>

<a id="26-the-public-facade-coordinates-many-concerns"></a>

### The public facade coordinates many concerns

`useClosures` coordinates query inputs, catalogs, drafts, uploads, execution monitoring, history, previews and feedback. It may retain one public surface while separating internals by independently changing responsibilities. This is a cohesion judgment, not a line-count threshold.

<a id="27-redux-toolkit-mechanics-leak-through-the-facade"></a>

<a id="27-redux-result-translation-is-already-inside-bindings"></a>

### Redux result translation is already inside bindings

[`closuresSlice.ts`](https://github.com/AndresTaoFlorez/tyba-support-platform/blob/982d861d442024331c84041c5a08c147ce2a01ec/experiments/xxi/web-ui/src/presentation/state/slices/closuresSlice.ts) performs `queryOfficeClassesThunk.rejected.match(...)` inside `useClosuresActions`, returning semantic `ok` outcomes. The public hook uses those outcomes; the previous claim that this matcher leaked into `useClosures` was stale. Preserve this boundary and examine other exported action results individually.

<a id="28-a-slice-owns-too-many-mechanisms"></a>

<a id="28-a-slice-file-owns-several-mechanisms"></a>

### A slice file owns several mechanisms

The same file contains [reducers](../../GLOSSARY.md#reducer), async [thunks](../../GLOSSARY.md#thunk) and React bindings. They can stay colocated under the feature while being separated into focused files when that improves understanding. A reducer itself should remain free of I/O.

<a id="29-browser-persistence-is-mixed-with-react-lifecyclestate"></a>

<a id="29-browser-persistence-has-an-explicit-utility-but-hook-owned-orchestration"></a>

### Browser persistence has an explicit utility, but hook-owned orchestration

[`closureWorkspaceStorage.ts`](https://github.com/AndresTaoFlorez/tyba-support-platform/blob/982d861d442024331c84041c5a08c147ce2a01ec/experiments/xxi/web-ui/src/presentation/utils/closureWorkspaceStorage.ts) reads/writes `sessionStorage`; `useClosures` triggers it through effects. The snapshot does not put those storage calls in [reducers](../../GLOSSARY.md#reducer). For a UI-only workspace, keeping this in [Presentation](../../GLOSSARY.md#presentation-layer) can be deliberate. Isolate storage and consider [listener middleware](../../GLOSSARY.md#listener-middleware) only when state-driven persistence warrants it; business persistence needs its own application boundary.

<a id="210-panda-recipes-are-duplicated"></a>

<a id="210-datatable-recipes-have-overlapping-owners"></a>

### DataTable recipes have overlapping owners

[`DataTable.styles.ts`](https://github.com/AndresTaoFlorez/tyba-support-platform/blob/982d861d442024331c84041c5a08c147ce2a01ec/experiments/xxi/web-ui/src/presentation/components/shared/DataTable/DataTable.styles.ts) defines an atomic `dataTableRecipe`; [`shared.recipes.ts`](https://github.com/AndresTaoFlorez/tyba-support-platform/blob/982d861d442024331c84041c5a08c147ce2a01ec/experiments/xxi/web-ui/src/presentation/recipes/shared.recipes.ts) defines another config `dataTableRecipe`. Consolidate overlapping contracts rather than copying fixes between them. This is an ownership finding, not a Panda prohibition on sharing atomic [recipes](../../GLOSSARY.md#recipe).

<a id="211-globalcss-competes-with-panda"></a>

<a id="211-globalcss-also-owns-theme-variables"></a>

### `global.css` also owns theme variables

[`global.css`](https://github.com/AndresTaoFlorez/tyba-support-platform/blob/982d861d442024331c84041c5a08c147ce2a01ec/experiments/xxi/web-ui/src/presentation/global.css) overrides theme colors such as `--colors-canvas`. Consolidate overlapping theme decisions with Panda configuration. CSS resets, fonts and vendor integration remain legitimate CSS owners.

<a id="212-common-and-shared-are-ambiguous"></a>

<a id="212-common-and-shared-need-distinct-meanings"></a>

### `common` and `shared` need distinct meanings

Both component categories exist. Either document distinct contracts or consolidate them. Shared visual primitives should be feature-independent; domain-specific components stay with their capability.

<a id="3-normalized-target"></a>

## Normalized target

Keep the five `src/` layers. The recommended [Presentation](../../GLOSSARY.md#presentation-layer) target is capability-owned `presentation/closures/{pages,components,hooks,state}/`, with local `formatters/` when needed and established `presentation/shared/components/` for independent visual primitives. Follow the [canonical frontend layout](README.md) rather than copying historical paths from the snapshot.

This is a conceptual target for future projects. It is not a migration command for the referenced snapshot.

<a id="4-canonical-flow"></a>

## Canonical flow

Source-contract dependencies are solid arrows; executable assembly is dashed. These are **not** runtime calls:

```mermaid
%%{init: {"htmlLabels": false, "flowchart": {"htmlLabels": false, "nodeSpacing": 28, "rankSpacing": 48, "diagramPadding": 20, "wrappingWidth": 280}, "sequence": {"wrap": true, "diagramMarginX": 20, "diagramMarginY": 20}}}%%
flowchart TB
    PAGE["ClosuresPage"] -->|"calls"| VM["screen interface"]
    VM -->|"reads / invokes"| B["Presentation bindings"]
    B -->|"calls"| UC["Application operation"]
    UC -. "requires" .-> PORT["Application-owned port"]
    HTTP["Infrastructure adapter"] -. "implements" .-> PORT
    ROOT["Composition"] -. "constructs" .-> HTTP
    ROOT -. "supplies" .-> UC
    ROOT -. "supplies" .-> B
    linkStyle 3,4 stroke-width:1px,stroke-dasharray:6 4
    linkStyle 5,6,7 stroke-width:1px,stroke-dasharray:2 5
```

At runtime the operation invokes the injected [adapter](../../GLOSSARY.md#adapter) object. The [port](../../GLOSSARY.md#port) is its source contract, not an extra runtime intermediary. A local checkbox may simply update local visual state.

<a id="5-why-this-case-study-exists"></a>

## Why this case study exists

Real growth pressure reveals both useful boundaries and accidental coupling. Promote demonstrated patterns, distinguish review judgments from facts, and pin evidence so later refactors do not silently change what a finding means.
