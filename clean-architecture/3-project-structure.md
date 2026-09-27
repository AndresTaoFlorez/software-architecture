> **[Clean Architecture](README.md)** › Project Structure & Conventions.

# 3. Project Structure & Conventions

Clean Architecture constrains dependencies; it does not prescribe one filesystem tree.

A folder structure is useful when it makes architectural ownership visible and gives tooling something stable to enforce. It becomes harmful when developers mistake the folder names for the architecture itself.

---

## 3.1 The folder layout

A practical TypeScript mapping is:

```text
src/
├── domain/
├── application/
├── infrastructure/
├── presentation/
└── composition/
```

Equivalent projects may use Martin's vocabulary:

```text
entities/
usecases/
adapters/
frameworks/
```

or a package/module-based layout.

**Do not claim these layouts produce identical code.** They can implement the same inward-dependency principle while using different boundaries, ownership and module decomposition.

The canonical rules for those dependencies live in **[Architecture Foundations](../foundations/dependency-boundaries.md)**.

### Recommended import matrix

```text
domain
  -> domain

application
  -> application, domain

infrastructure
  -> infrastructure, application, domain

presentation
  -> presentation, application

composition
  -> application, infrastructure, presentation, domain as needed for wiring
```

Whether Presentation may import Domain types directly is a project decision. A stricter application-contract boundary may forbid it to reduce coupling between UI and domain representation.

---

## 3.2 Structure by capability inside a layer

Layer-first top-level folders are compatible with feature/capability ownership below them.

Example:

```text
domain/
├── orders/
└── users/

application/
├── orders/
│   ├── ports/
│   └── use-cases/
└── users/

infrastructure/
├── orders/
└── users/
```

Do not create global dumping grounds such as:

```text
services/
helpers/
managers/
common/
```

when the files have clear capability ownership.

---

## 3.3 Public module APIs

A feature/module should expose an intentional contract and hide internals.

```ts
// application/orders/index.ts
export { placeOrder } from './use-cases/placeOrder'
export type { PlaceOrderCommand, PlaceOrderResult } from './contracts'
```

Avoid giant barrels that re-export unrelated layers or `export *` every internal symbol.

See **[Module Boundaries and Public APIs](../foundations/module-boundaries-and-public-apis.md)**.

---

## 3.4 Structuring the outermost circle: the Presentation UI

Clean Architecture tells us that UI technology is an outer detail. It does **not** define how a large Presentation codebase should organize pages, components, hooks, state, selectors or design-system code.

The canonical repository guidance is therefore centralized in:

- **[Frontend Architecture](../frontend/README.md)**
- **[Presentation Architecture](../frontend/presentation-architecture.md)**
- **[State Management](../frontend/state-management.md)**

Recommended default:

```text
presentation/
├── app/
├── pages/
├── features/
│   └── orders/
│       ├── ui/
│       ├── model/
│       ├── lib/
│       └── index.ts
└── shared/
    ├── ui/
    └── lib/
```

This is a Presentation organization strategy, not a fifth Clean Architecture circle.

---

## 3.5 Styles and animation

Styling stays in Presentation, but the repository no longer prescribes generic CSS placement from the Clean guide.

Use the central **[Styling and Design-System Architecture](../frontend/styling-and-design-system.md)**.

The default principle is **ownership and colocation**:

```text
FeatureComponent/
├── FeatureComponent.tsx
├── FeatureComponent.styles.ts
├── FeatureComponent.types.ts
└── index.ts
```

Shared design-system recipes have a different owner from feature-local styles. Do not duplicate a recipe in both places.

---

## 3.6 Type ownership

Types belong to the layer/capability that owns their meaning.

```text
Money                         -> domain
PlaceOrderCommand             -> application
ApiOrderDto                   -> infrastructure
CheckoutFormState             -> presentation
```

Type-only imports still represent source-level coupling.

A top-level `src/types` directory is rarely a good default because it erases ownership.

---

## 3.7 Composition

Keep concrete wiring at an outer bootstrap boundary:

```text
composition/
└── container.ts
```

The Composition Root may import concrete Infrastructure plus Application contracts and Presentation bootstrap/store code as needed to assemble the executable.

It is not a business layer and it is not a service locator.

See **[Composition Root](../foundations/composition-root.md)**.

---

## 3.8 Enforce the graph

A dependency rule that can be automated should be automated.

Options include:

- AST-based architecture tests;
- dependency-cruiser;
- ESLint boundary plugins;
- Nx module-boundary rules;
- language/build-system equivalents.

The check must resolve:

- path aliases;
- relative imports;
- re-exports;
- dynamic imports;
- type-only imports.

See **[Executable Architecture](../foundations/architecture-testing.md)**.

---

## 3.9 What is architecture vs. convention?

### Architecture

```text
Domain cannot depend on Infrastructure.
Application cannot import an HTTP client.
A concrete adapter implements an inner contract.
```

### Recommended convention

```text
features/orders/model/
Component/Component.styles.ts
index.ts as public API
```

### Framework convention

```text
Redux Toolkit createSlice
Panda sva
React custom hooks
```

Treating all three as equally fundamental creates cargo-cult architecture.

## Sources

- Robert C. Martin, "The Clean Architecture": https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html
- Redux Style Guide: https://redux.js.org/style-guide/
- Feature-Sliced Design, slices/segments: https://feature-sliced.design/docs/reference/slices-segments
