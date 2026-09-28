# Naming and File Placement Conventions

These are this documentation project's default conventions for TypeScript-heavy frontend/backend examples.

They are intentionally split into:

- **framework requirements**;
- **ecosystem-backed conventions**;
- **documentation conventions**.

There is no universal architecture-mandated file naming scheme.

## 1. Identifier naming

Recommended TypeScript defaults:

| Kind | Convention | Example |
| --- | --- | --- |
| class / interface / type / enum | PascalCase | `OrderRepository` |
| function / method / variable | camelCase | `cancelOrder` |
| global constant | CONSTANT_CASE when truly constant | `MAX_RETRIES` |
| boolean | meaningful predicate wording | `isSaving`, `hasAccess`, `canSubmit` |
| interface | semantic name, no automatic `I` prefix | `OrderRepository`, not `IOrderRepository` |

Google's TypeScript style guide recommends descriptive names, PascalCase for type-like declarations, camelCase for variables/functions, and avoiding interface names that merely encode "interface" in the name.

Source: https://google.github.io/styleguide/tsguide.html

The `@typescript-eslint/naming-convention` rule can enforce project conventions when the cost is justified:

https://typescript-eslint.io/rules/naming-convention/

## 2. React requirements

React component names must start with a capital letter.

```tsx
function QueryFilters() {
  return <section />
}
```

Custom Hook names must begin with `use` followed by a capitalized word:

```ts
function useClosures() {
  // ...
}
```

These are React rules, not documentation-project preferences.

Sources:

- https://react.dev/learn/your-first-component
- https://react.dev/learn/reusing-logic-with-custom-hooks

## 3. File naming — repository convention

This documentation project uses names that reveal architectural role.

| Role | Example |
| --- | --- |
| [domain entity](../GLOSSARY.md#domain-entity)/[value object](../GLOSSARY.md#value-object) | `Order.ts`, `Money.ts` |
| application [use case](../GLOSSARY.md#use-case) | `cancelOrder.ts` |
| application [port](../GLOSSARY.md#port) | `OrderRepository.ts`, `PaymentGateway.ts` |
| concrete [adapter](../GLOSSARY.md#adapter) | `HttpOrderRepository.ts`, `StripePaymentGateway.ts` |
| [mapper](../GLOSSARY.md#mapper) | `orderApi.mapper.ts` |
| [DTO](../GLOSSARY.md#data-transfer-object-dto) | `orderApi.dto.ts` |
| React component | `QueryFilters.tsx` |
| component styles | `QueryFilters.styles.ts` |
| component types | `QueryFilters.types.ts` |
| feature hook/facade | `useClosures.ts` |
| Redux slice | `closures.slice.ts` |
| [selectors](../GLOSSARY.md#selector) | `closures.selectors.ts` |
| [thunks](../GLOSSARY.md#thunk) | `closures.thunks.ts` |
| listeners | `closures.listeners.ts` |
| bindings | `closures.bindings.ts` |
| test | `cancelOrder.test.ts`, `QueryFilters.test.tsx` |

The exact suffixes are conventions. Their purpose is to make ownership discoverable and architecture-testable.

## 4. Folder naming

Use capability names for business/feature ownership:

- `orders/`
- `closures/`
- `billing/`
- `auth/`

Avoid vague buckets when a more precise owner exists:

- `helpers/`
- `misc/`
- `managers/`
- `common/`

`shared/` is allowed only for genuinely cross-feature code with a stable purpose.

## 5. Ports and adapters

Name a [port](../GLOSSARY.md#port) by the capability it represents.

Prefer:

- `PaymentGateway`
- `Clock`
- `FileStorage`
- `OrderRepository`

Avoid:

- `IDataService`
- `ApiService`
- `CommonRepository`
- `GenericManager`

Use `Repository` only when the abstraction is genuinely [repository](../GLOSSARY.md#repository)-like.

## 6. Use-case names

Use verbs that express actor/system intent:

- `cancelOrder`
- `createUser`
- `executeClosure`
- `getClosureHistory`

Avoid implementation names:

- `handleData`
- `processStuff`
- `runService`

## 7. UI components

Name components after what they represent, not how they are styled:

Prefer:

- `QueryFilters`
- `ClosureStatusBadge`
- `AccountMenu`

Avoid:

- `BlueBox`
- `BigCard`
- `LeftPanel2`

A reusable [design-system](../GLOSSARY.md#design-system) primitive can use generic visual vocabulary such as `Button`, `Dialog`, or `Stack` because that is its explicit purpose.

## 8. Placement is more important than suffix

A correctly named file in the wrong layer is still architecturally wrong.

`HttpOrderRepository.ts` does not belong in `domain/` merely because its name is descriptive.

Use the [Code Placement Guide](../foundations/code-placement.md) before creating a new file.
