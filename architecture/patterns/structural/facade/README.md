# Facade Pattern

A screen needs an appointment summary and the selected appointment. Its caller should not need to coordinate the data reader and selection state for that single task. Offer a small interface that performs that coordination.

**Contents**

- [Show the collaboration first](#show-the-collaboration-first)
- [Name the pattern](#name-the-pattern)
- [Distinguish nearby roles](#distinguish-nearby-roles)
- [Apply it selectively to frontend](#apply-it-selectively-to-frontend)
- [Change and verification](#change-and-verification)
- [Sources](#sources)

## Show the collaboration first

This complete plain-TypeScript example omits React and persistence because the collaboration is the subject:

```ts
// src/presentation/scheduling/AgendaFacade.ts
export interface AppointmentSummary {
  id: string
  label: string
}
export interface SummaryReader {
  read(day: string): Promise<readonly AppointmentSummary[]>
}
export interface AppointmentSelection {
  selectedId(): string | null
}
export interface AgendaView {
  rows: readonly AppointmentSummary[]
  selected: AppointmentSummary | null
}

export class AgendaFacade {
  constructor(
    private readonly summaries: SummaryReader,
    private readonly selection: AppointmentSelection,
  ) {}

  async show(day: string): Promise<AgendaView> {
    const rows = await this.summaries.read(day)
    const id = this.selection.selectedId()
    return { rows, selected: rows.find(row => row.id === id) ?? null }
  }
}
```

The caller invokes `show(day)` instead of coordinating both collaborators. If reading fails, the promise rejects and the caller translates feedback; the facade does not silently show an empty successful result.

## Name the pattern

A **Facade** offers a simpler interface to a subsystem. The collaborators retain their responsibilities and can still have other consumers. Here the facade belongs to [Presentation](../../../../GLOSSARY.md#presentation-layer) because it prepares a screen interaction.

Use it when several callers repeatedly need the same coordination or a simpler supported interface protects their dependency on subsystem details. One forwarding method over an already adequate operation may add no useful boundary.

## Distinguish nearby roles

| Role | Purpose |
| --- | --- |
| Facade | Simplify using collaborating pieces |
| Adapter | Translate between a specific mechanism/interface and an expected interaction |
| [ViewModel](../../../../GLOSSARY.md#viewmodel) | Prepare view state and commands for a View |

A piece can serve more than one purpose, but explain the actual behavior before applying each name. A React Hook is a language/framework mechanism; it is not automatically any of these patterns.

## Apply it selectively to frontend

A [public screen Hook](../../../frontend/presentation-architecture.md#screen-interaction-api) may expose state and operations conveniently. Call it a facade only when its implementation demonstrates the simplified subsystem collaboration. Use [ViewModel](../../../../GLOSSARY.md#viewmodel) terminology when its view-state/command role is actually established.

Keep business rules in their owner and use supported collaborator APIs. A facade must not become a shared container for unrelated policies.

## Change and verification

A selection-library change can remain behind `AppointmentSelection`. A business-rule change belongs to the relevant operation or model, not this facade. Other screens can consume the narrow entry without importing private selectors.

Verify matching selection, stale or absent selection and read failure. This example establishes coordination, not rendering behavior or external API correctness.

## Sources

- Gamma et al., *Design Patterns: Elements of Reusable Object-Oriented Software* (1994), Facade.
- [Microsoft Learn: Adapter and Facade](https://learn.microsoft.com/en-us/shows/visual-studio-toolbox/design-patterns-adapterfaade)
