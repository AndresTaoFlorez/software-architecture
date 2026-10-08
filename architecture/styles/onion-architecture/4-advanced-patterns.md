> [Onion Architecture](README.md) › Extension decisions.

<a id="8-appendix-advanced-patterns-bonus"></a>
<a id="8-advanced-patterns"></a>

<a id="4-extending-an-onion-design"></a>

# Extending an Onion Design

The ticket feature grows: another delivery channel, more screen interactions and more capabilities. Assign each change to its owner while keeping dependencies inward.

**Contents**

- [Another integration](#another-integration)
- [Another delivery channel](#another-delivery-channel)
- [Technical translation](#technical-translation)
- [Feature ownership in Presentation](#feature-ownership-in-presentation)
- [State libraries](#state-libraries)
- [Design systems](#design-systems)
- [Multiple capabilities](#multiple-capabilities)
- [Choose boundaries by change pressure](#choose-boundaries-by-change-pressure)
- [Sources](#sources)

<a id="41-another-integration"></a>

## Another integration

A new storage implementation implements the existing required contract. Composition selects it. [Domain](../../../GLOSSARY.md#domain) changes only when ticket meaning changes.

<a id="42-another-delivery-channel"></a>

## Another delivery channel

A CLI translates arguments and results around the same creation operation. Its parser belongs to CLI delivery; it shares business rules through the operation.

<a id="43-technical-translation"></a>

## Technical translation

An external library's errors and data shapes belong to its integration. Translate what [Application](../../../GLOSSARY.md#application-layer) needs into an inward-owned representation.

<a id="84-shell-boards-pattern-presentation"></a>
<a id="85-feature-based-component-organization-presentation"></a>
<a id="84-feature-ownership-in-presentation"></a>

<a id="44-feature-ownership-in-presentation"></a>

## Feature ownership in Presentation

Keep the generic Onion map at `presentation/`. Use the [frontend route](../../frontend/presentation-architecture.md) for screens or the [backend route](../../backend/README.md) for HTTP and CLI delivery.

<a id="85-state-libraries"></a>

<a id="45-state-libraries"></a>

## State libraries

Redux and similar libraries manage interaction state in [Presentation](../../../GLOSSARY.md#presentation-layer). A workflow receives its needed operation instead of constructing an HTTP integration. See [State Management](../../frontend/state-management.md).

<a id="86-design-systems"></a>
<a id="86-styling--animation-architecture-presentation"></a>

<a id="46-design-systems"></a>

## Design systems

Visual tokens and reusable components have a [Presentation](../../../GLOSSARY.md#presentation-layer) owner. Follow the [styling guide](../../frontend/styling-and-design-system.md).

<a id="47-multiple-capabilities"></a>

## Multiple capabilities

A supported public operation lets one capability use another without depending on private files. See [Module Boundaries](../../foundations/module-boundaries-and-public-apis.md).

<a id="88-do-not-add-patterns-by-fashion"></a>

<a id="48-choose-boundaries-by-change-pressure"></a>

## Choose boundaries by change pressure

Add a boundary when it protects an independent decision or substitution. More interfaces alone do not improve maintainability. Adjacent disciplines need their own complete teaching under [extras](../../../extras/README.md).

## Sources

- [Palermo: Onion Architecture](https://jeffreypalermo.com/2008/07/the-onion-architecture-part-1/)
