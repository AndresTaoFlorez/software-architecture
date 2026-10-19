# Add a Pattern for a Concrete Collaboration

Styles constrain an application's structure; patterns describe narrower collaborations. These additions belong after the [base request](design-request.md#copyable-request) and any relevant style constraint. Select only additions that answer an actual requirement.

**Contents**

- [MVC](#mvc)
- [MVVM](#mvvm)
- [Repository or a smaller read interaction](#repository-or-a-smaller-read-interaction)
- [Facade](#facade)
- [Compare or combine](#compare-or-combine)

## MVC

```text
Assess MVC for [SCREEN / DELIVERY FLOW]. Distinguish classic interactive
MVC from server-rendered request/response MVC using the canonical MVC guide.
Name Model, View and Controller responsibilities, state owner and actual
update mechanism. Explain subscriptions/cleanup if interactive; explain
controller-selected rendering if server-side. A JSON controller or a React
component alone does not establish all three roles. Show an MVVM alternative
and the changed relationships without moving authoritative business rules.
```

An interactive response should show gesture interpretation, Model operations/notifications and a View reading/redrawing from that state. A server response instead identifies controller-supplied template data and HTML rendering. These are alternative mechanisms, not mandatory parts of one combined triad. See [MVC across client and server](../patterns/presentation/model-view-controller/README.md#mvc-across-client-and-server).

## MVVM

```text
Assess MVVM for [SCREEN]. Name ViewModel state, commands and binding/update
mechanism. Show how the View renders state and forwards intent, how the
ViewModel invokes model/application capabilities, and who owns cancellation,
stale responses and disposal where relevant. Keep concrete controls and
authoritative business policy outside the ViewModel. Compare MVC without
claiming that renaming a hook establishes either pattern.
```

An illustrative response might expose `selectedId`, `busy`, `error`, `approve()` and `reload()` through one screen contract, with an explicit subscription or framework binding. The underlying approval operation remains separate. See [MVVM roles](../patterns/presentation/model-view-viewmodel/README.md#mental-model-and-roles).

## Repository or a smaller read interaction

```text
For [PERSISTENCE / REMOTE INTERACTION], decide whether the contract represents
stored business objects, a purpose-specific projection or a remote command.
Use Repository, reader or gateway terminology accordingly. Give the real
consumer, required methods, completion/failure guarantees and implementation
owner. Do not generate CRUD per table. Explain what a real database/adapter
check must establish beyond a fake.
```

`ExpenseRepository.find/save` can represent stored expenses; `ApprovalSummaryReader.read` can return a projection; `ExpenseGateway.approve` can request remote work. Similar field shapes do not make those interactions identical. See [Repository, reader and gateway](../patterns/persistence/repository/README.md#repository-reader-and-gateway).

## Facade

```text
Assess a Facade for [CALLERS REPEATING A SPECIFIC COORDINATION]. Name the
collaborators and show the simpler supported interaction. Keep each
collaborator's policy with its owner. Distinguish interface translation
(Adapter), view state/commands (ViewModel) and subsystem simplification
(Facade). Reject a forwarding wrapper if it protects no meaningful boundary.
```

A selected-expense summary may combine a reader and selection state. If one ViewModel also acts as a Facade, the response must demonstrate both collaborations; neither label follows from its filename. See [Facade roles](../patterns/structural/facade/README.md#distinguish-nearby-roles).

## Compare or combine

```text
Compare [CURRENT STYLE/PATTERN] with [ALTERNATIVE] for the same complete
requirements. Identify changed source dependencies, contracts, runtime
interactions and composition. Separate meaningful differences from naming
or overlapping constraints. For a proposed combination, state its scope
and cost, reject contradictory rules and avoid duplicate policy owners.
Retain application requirements while changing the design constraint.
```

[Prompt selector](README.md) · [Regression suite](regression.md)
