# Architecture Guide Template

Use this structure for a new style or presentation pattern. Start each explanation with a situation, show the smallest mechanism, then name it. Follow [CONTRIBUTING](../../CONTRIBUTING.md).

**Contents**

- [Heading structure and reading position](#heading-structure-and-reading-position)
- [History and origin](#history-and-origin)
- [What problem does it solve?](#what-problem-does-it-solve)
- [Fit and cost](#fit-and-cost)
  - [When it is a strong fit](#when-it-is-a-strong-fit)
  - [When it is a weak fit](#when-it-is-a-weak-fit)
- [Mental model](#mental-model)
- [Layers or roles](#layers-or-roles)
- [Placement and naming](#placement-and-naming)
  - [Physical project structure](#physical-project-structure)
  - [Where does this code go?](#where-does-this-code-go)
  - [Naming](#naming)
- [One feature end to end](#one-feature-end-to-end)
- [Testing](#testing)
- [Trade-offs and failure modes](#trade-offs-and-failure-modes)
- [Advanced topics](#advanced-topics)
- [Learning path](#learning-path)
- [Sources](#sources)

## Heading structure and reading position

Adapt title depth to real sections and subsections; do not require a fixed number of H1 headings. Group role explanations under a common H2 with an H3 per role. Use unnumbered titles, preserve earlier anchors and place linked H2/H3 contents after the introduction when there are three or more main sections.

Say what to read before the guide and what comes next. Explain indispensable words before the linked exercises. Design/refactoring exercises need initial code, an observable requirement and a separate concrete solution.

The sections below are topics to organize proportionately, not a fixed flat hierarchy.

<a id="1-history-and-origin"></a>

## History and origin

Identify the original design problem and author. Cite the primary source and distinguish later interpretations.

<a id="2-what-problem-does-it-solve"></a>

## What problem does it solve?

Describe an actor's requirement and the observable difficulty in a direct implementation.

## Fit and cost

<a id="3-when-it-is-a-strong-fit"></a>

### When it is a strong fit

Name the change pressures the architecture protects: business rules, integrations and ownership.

<a id="4-when-it-is-a-weak-fit"></a>

### When it is a weak fit

Show when those boundaries cost more than they protect.

<a id="5-mental-model"></a>

## Mental model

Use one compact diagram where relationships need it. Label source dependencies, runtime calls and startup wiring distinctly. Check complete labels in GitHub light/dark and narrow/desktop views, as well as parser validity.

<a id="6-layers-or-roles"></a>

## Layers or roles

For each role, explain its responsibility through the ongoing example. Include one concrete filename, permitted dependencies and a likely placement mistake.

## Placement and naming

<a id="7-physical-project-structure"></a>

### Physical project structure

Show the generic ownership map. Keep frontend and backend delivery details in their respective routes. Folder names are this handbook's conventions.

<a id="8-where-does-this-code-go"></a>

### Where does this code go?

Give beginners a usable decision rule. Link [Code Placement](../foundations/code-placement.md) for representation and helper ownership.

<a id="9-naming"></a>

### Naming

Apply the [naming convention](naming-and-file-placement.md). Distinguish architectural vocabulary from framework requirements.

<a id="10-one-feature-end-to-end"></a>

## One feature end to end

Give the actor, authoritative business owner, input trust boundary and meaningful failure. Show one rule, operation, justified contract, integration and delivery boundary. Link the canonical example rather than copying an entire stack.

Explain which files change for a new rule, another integration and a consumer in another capability.

<a id="11-testing"></a>

## Testing

Explain what domain, operation and integration checks establish. Identify excerpt limits. Temporary author checks are allowed; this repository contains documentation rather than an executable application.

<a id="12-trade-offs-and-failure-modes"></a>

## Trade-offs and failure modes

Describe actual pressure such as duplicated rules, deep imports or an overly broad service. Explain the smallest correction.

<a id="13-advanced-topics"></a>

## Advanced topics

Add depth only when the architecture question needs it. Adjacent disciplines belong in a complete guide under [extras](../../extras/README.md).

<a id="14-learning-path"></a>

## Learning path

Offer a progressive route. Basic placement and dependency guidance belongs before advanced chapters.

## Sources

Use primary architecture sources and official framework documentation. Mark recommendations and handbook conventions as such.
