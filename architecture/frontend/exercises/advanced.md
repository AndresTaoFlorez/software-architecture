# Advanced frontend Exercises

## F-A1 — Remove a capability deep import

**What you already know.** Read Module Boundaries.

**Situation.** A Tickets Page imports Scheduling's private agenda selector.

**Terms you need.** Public API, deep import and capability ownership.

**Given code/files.** import { selectAgendaInternal } from '@/presentation/scheduling/state/internalSelectors'; Tickets only needs a public appointment summary.

**Task.** Define or reuse the narrow supported Scheduling contract and replace the deep import.

**Questions.** Should all state be exported? Does a type-only import make private ownership irrelevant?

**Success criteria.** A supported purpose-specific entry; private selectors remain private.

**Relevant handbook sections.** [Read the guide](../../foundations/module-boundaries-and-public-apis.md).

## F-A2 — Split a God Hook

**What you already know.** Read Presentation section 6 and the HTTP integration.

**Situation.** useAgenda fetches JSON, casts its DTO, checks business eligibility, selects appointments and formats dates.

**Terms you need.** God Hook, Parser, Mapper, Domain rule and Formatter.

**Given code/files.** One useAgenda function contains all five responsibilities.

**Task.** Assign exact owners and keep the Hook's useful screen contract.

**Questions.** Which changes with the wire protocol? Which changes with locale? Which changes with business policy?

**Success criteria.** No HTTP parsing or copied rule in the Hook; useful minimal separation.

**Relevant handbook sections.** [Read the guide](../presentation-architecture.md#6-avoid-the-god-viewmodel).

## F-A3 — Recover a browser draft

**What you already know.** Read State Management section 7.

**Situation.** An analyst must recover an unfinished agenda draft after leaving the screen. A reducer currently writes JSON directly to sessionStorage.

**Terms you need.** Application-owned storage port, side effect and browser implementation.

**Given code/files.** AgendaDraftStorage requires load/save; SessionStorageAgendaDraftStorage is the proposed implementation.

**Task.** Place the contract, operation, implementation, stored-data parser and startup wiring. Explain delivery failure feedback.

**Questions.** Why is recovery an Application capability here? Who interprets malformed saved JSON?

**Success criteria.** No browser API in Application or reducer; parsed external storage; supplied implementation.

**Relevant handbook sections.** [Read the guide](../state-management.md#7-browser-persistence-is-an-external-detail).

[Exercise route](README.md) · [Solutions](solutions.md)
