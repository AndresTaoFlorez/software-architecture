<a id="learning-order"></a>

# Architecture Foundations

An analyst sends “The invoice PDF will not download.” The program checks the incoming data, decides whether the ticket is valid and saves it. If the subject rule sits inside the HTTP handler, another caller can bypass it.

**Contents**

- [Give the decisions owners](#give-the-decisions-owners)
- [Read in order](#read-in-order)
- [Names you will meet](#names-you-will-meet)
- [Read later](#read-later)

<a id="architecture-is-not-folder-names"></a>

## Give the decisions owners

One piece checks whether the request contains strings. Another decides whether a subject is valid. Another stores the resulting ticket. A **responsibility** is the work a piece owns; its owner is the first place to inspect when that decision changes.

A **dependency** means code needs another piece to do its work. For example, creation needs the ticket model. A **boundary** separates responsibilities and defines the supported interaction across them.

Before adding folders, ask what changes when the subject rule changes, when storage changes and when a CLI becomes another caller.

## Read in order

1. [Code Placement](code-placement.md): place each decision.
2. [Dependency Boundaries](dependency-boundaries.md): distinguish source use from runtime calls.
3. [Composition](composition-root.md): supply concrete implementations.
4. [Module Boundaries and Public APIs](module-boundaries-and-public-apis.md): let another capability use a supported entry.
5. [HTTP Request to Business Operation](../backend/1-http-request-to-business-operation.md).
6. [TypeScript-First Boundaries](../backend/2-typescript-first-boundaries.md).

Then choose the [backend](../backend/README.md) or [frontend](../frontend/README.md) route.

<a id="mental-model"></a>

## Names you will meet

| Name | Work in the ticket example |
| --- | --- |
| [Domain](../../GLOSSARY.md#domain) | Decide valid subject and initial state |
| [Application](../../GLOSSARY.md#application-layer) | Coordinate creating and saving |
| [Presentation](../../GLOSSARY.md#presentation-layer) | Interpret caller input and translate the result |
| [Infrastructure](../../GLOSSARY.md#infrastructure) | Implement storage or another external interaction |
| Composition | Choose objects and connect them at startup |

These names help locate owners. They do not require five calls for every request.

<a id="use-architecture-proportionally"></a>

## Read later

[Business decisions and workflows](domain-modeling/README.md) explains entity behavior and services after the ticket example. [Architectural checks](architecture-testing.md) and [evolution](evolution-and-scaling.md) explain how to protect and change established boundaries.

Use separation when it protects independently changing decisions. More folders alone do not establish maintainability.

[Previous: repository introduction](../../README.md) · [Next: Code Placement](code-placement.md)
