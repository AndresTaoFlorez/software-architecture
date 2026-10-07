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

[Custom Hook](../GLOSSARY.md#custom-hook) names must begin with `use` followed by a capitalized word:

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
| feature hook/[facade](../GLOSSARY.md#facade-pattern) | `useClosures.ts` |
| Redux slice | `closures.slice.ts` |
| [selectors](../GLOSSARY.md#selector) | `closures.selectors.ts` |
| [thunks](../GLOSSARY.md#thunk) | `closures.thunks.ts` |
| listeners | `closures.listeners.ts` |
| bindings | `closures.bindings.ts` |
| test | `cancelOrder.test.ts`, `QueryFilters.test.tsx` |

The exact suffixes are conventions. Their purpose is to make ownership discoverable and architecture-testable.

### Backend names

When an operation needs to save tickets, name its abstraction after that required capability. When several implementations exist, prefix a concrete [adapter](../GLOSSARY.md#adapter) with its technology or mechanism. The [backend walkthrough](../backend/README.md#how-to-read-backend-file-names) explains the actual behavior behind these names.

| Name | Meaning | Where the terminology comes from |
| --- | --- | --- |
| `Ticket.ts` | business concept | domain modeling |
| `CreateTicket.ts` | application operation, implemented as a class | use-case responsibility; PascalCase is our class/file convention |
| `TicketRepository.ts` | required persistence capability | Repository design pattern; contract placement follows its owner |
| `InMemoryTicketRepository.ts` | storage in process memory | mechanism prefix, our naming convention |
| `PrismaTicketRepository.ts` | database [adapter](../GLOSSARY.md#adapter) using Prisma | technology name plus contract role |
| `TicketsController.ts` | group of [HTTP route](../GLOSSARY.md#http-route) handlers | Nest terminology; suffix/file casing is our convention |
| `CreateTicketPipe.ts` | handler argument parser/validator | Nest terminology |
| `TicketsModule.ts` | framework registration and composition | Nest terminology, not an architectural layer |
| `createTicketRequest.ts` | input shape and parsing functions | camelCase for function-oriented files; types inside use PascalCase |
| `ticket.tokens.ts` | runtime dependency lookup keys | Nest injection mechanism; suffix is our convention |

An exported function uses camelCase (`createTicket`), while a class uses PascalCase (`CreateTicket`). `Repository` is justified for stored business objects; use `PaymentGateway`, `Clock`, `FileStorage` or `AgendaReader` when those better express the conversation. Nest/Prisma do not require our filenames or suffixes.

## 4. Folder naming

The canonical hierarchy is **layer first**, then capability: `domain/tickets/`, `application/tickets/`, `infrastructure/persistence/tickets/`, `presentation/http/tickets/` and outer `composition/`. This is a handbook convention, independent of the architectural [dependency rule](../GLOSSARY.md#dependency-rule). Grow sub-capabilities inside their layer, as [Scheduling illustrates](../foundations/code-placement.md#12-grow-capabilities-inside-each-layer).

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
