> [Onion Architecture](README.md) › Extension decisions.

<a id="8-appendix-advanced-patterns-bonus"></a>
<a id="8-advanced-patterns"></a>

# 4. Extending an Onion Design

The ticket feature grows: another delivery channel, more screen interactions and more capabilities. Assign each change to its owner while keeping dependencies inward.

## 4.1 Another integration

A new storage implementation implements the existing required contract. Composition selects it. Domain changes only when ticket meaning changes.

## 4.2 Another delivery channel

A CLI translates arguments and results around the same creation operation. Its parser belongs to CLI delivery; it shares business rules through the operation.

## 4.3 Technical translation

An external library's errors and data shapes belong to its integration. Translate what Application needs into an inward-owned representation.

<a id="84-shell-boards-pattern-presentation"></a>
<a id="85-feature-based-component-organization-presentation"></a>
<a id="84-feature-ownership-in-presentation"></a>

## 4.4 Feature ownership in Presentation

Keep the generic Onion map at `presentation/`. Use the [frontend route](../../frontend/presentation-architecture.md) for screens or the [backend route](../../backend/README.md) for HTTP and CLI delivery.

<a id="85-state-libraries"></a>

## 4.5 State libraries

Redux and similar libraries manage interaction state in Presentation. A workflow receives its needed operation instead of constructing an HTTP integration. See [State Management](../../frontend/state-management.md).

<a id="86-design-systems"></a>
<a id="86-styling--animation-architecture-presentation"></a>

## 4.6 Design systems

Visual tokens and reusable components have a Presentation owner. Follow the [styling guide](../../frontend/styling-and-design-system.md).

## 4.7 Multiple capabilities

A supported public operation lets one capability use another without depending on private files. See [Module Boundaries](../../foundations/module-boundaries-and-public-apis.md).

<a id="88-do-not-add-patterns-by-fashion"></a>

## 4.8 Choose boundaries by change pressure

Add a boundary when it protects an independent decision or substitution. More interfaces alone do not improve maintainability. Adjacent disciplines need their own complete teaching under [extras](../../../extras/README.md).

## Sources

- [Palermo: Onion Architecture](https://jeffreypalermo.com/2008/07/the-onion-architecture-part-1/)
