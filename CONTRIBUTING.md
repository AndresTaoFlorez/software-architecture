# Contributing to the Software Architecture Reference

This is a documentation-only handbook. Contributions must be accurate, source-backed and understandable to a programmer learning architecture.

**Contents**

- [Audience](#audience)
- [Required order for every architecture guide](#required-order-for-every-architecture-guide)
- [Progressive disclosure](#progressive-disclosure)
  - [TypeScript-first mechanisms](#typescript-first-mechanisms)
  - [Headings and navigation](#headings-and-navigation)
  - [Exercises and canonical explanations](#exercises-and-canonical-explanations)
- [Distinguish rule types](#distinguish-rule-types)
- [Diagrams](#diagrams)
- [Folder and code-placement explanations](#folder-and-code-placement-explanations)
- [Naming](#naming)
- [Glossary](#glossary)
- [Sources](#sources)
- [Examples](#examples)
- [Review checklist — three passes](#review-checklist--three-passes)
- [Canonical architecture-guide template](#canonical-architecture-guide-template)

<a id="1-audience"></a>

## Audience

Assume programming knowledge, but no architecture vocabulary. Explain the decision, its owner and its consequence in familiar language before naming the pattern.

<a id="2-required-order-for-every-architecture-guide"></a>

## Required order for every architecture guide

Use this sequence proportionately:

1. History and the motivating problem.
2. Strong and weak fit.
3. Mental model and responsibilities.
4. Physical placement, dependencies and naming.
5. One small feature or focused excerpt.
6. How a project would verify the boundary.
7. Trade-offs, learning route and sources.

Landing pages must explain enough to start a feature. Detailed mechanics belong to their canonical guide.

<a id="3-progressive-disclosure"></a>

## Progressive disclosure

Start with an actor and a concrete difficulty. Show the smallest mechanism, name the concept, then explain the consequence. A glossary link supports an explanation; it does not replace one.

Define positively first. Usually one relevant contrast suffices. Keep one idea per paragraph and remove sentences that restate a preceding table or diagram.


### TypeScript-first mechanisms

Show ordinary runtime checks before framework validation, constructor arguments before a DI container, and memory storage before database integration. Use established HTTP, authentication, database and cryptographic implementations.

Keep authoritative business validity with its owner when a framework takes over transport checks. The [backend route](architecture/backend/README.md) follows this sequence.

### Headings and navigation

Choose title depth from relationships, without a fixed H1 count. Group responsibilities under one section and give each role a subsection. Remove decorative heading numbers; retain filenames and exercise identifiers. Use a brief label instead of repeated generic headings.

After the introduction, include linked H2/H3 contents when there are three or more main sections. Short learning maps keep direct navigation and the glossary keeps its term index. Preserve previous anchors explicitly, link to current headings and maintain previous/next links on the reading route.

### Exercises and canonical explanations

Keep the common sequence in the repository README. Teach necessary vocabulary before an exercise. Intermediate and advanced activities show starting code, a requirement and observable results; separate solutions show concrete changed code and brief ownership reasoning.

Give general styles/patterns framework-independent homes. Technology chapters apply the explanation and link to it without copying complete examples.

<a id="4-distinguish-rule-types"></a>

## Distinguish rule types

| Type | Meaning |
| --- | --- |
| Architectural constraint | Required by the boundary being described |
| Recommended default | A useful choice with alternatives |
| Framework requirement | Required by the cited framework |
| Handbook convention | Chosen here for consistency |
| Example | Illustrates a decision without prescribing a universal design |

Architecture authors do not prescribe this handbook's exact TypeScript folders.

<a id="5-diagrams"></a>

## Diagrams

Use Mermaid or accessible SVG for relationships and folder maps. Avoid ASCII trees and prose arrow chains.

Label the connectors: dashed/light for source dependencies, solid/strong for runtime calls, distinct/secondary for startup wiring. A contract is a source requirement; the supplied implementation is the runtime object.

Keep concrete names first, nodes compact and colors muted. SVGs need editable vector content, a title/description and preferably a transparent background. Mermaid companions must preserve the same semantics.

Check actual rendering in GitHub, light/dark and desktop/narrow views. Shorten labels, wrap lines and adjust layout before adding SVG. Use an accessible SVG plus editable Mermaid when clipping persists. A parser establishes syntax, not complete visible text.

<a id="6-folder-and-code-placement-explanations"></a>

## Folder and code-placement explanations

Place code where its meaning belongs. Use [Code Placement](architecture/foundations/code-placement.md) for representations, parsers, mappers, formatters and helpers.

Explain an ambiguous placement once; other pages show their concrete paths and link to that explanation.

<a id="7-naming"></a>

## Naming

Follow [Naming and File Placement](architecture/conventions/naming-and-file-placement.md). Distinguish role names, language/framework requirements and handbook conventions.

<a id="8-glossary"></a>

## Glossary

Link a glossary term on its **first meaningful use in a section**, or where it would otherwise be ambiguous. Do not repeatedly link familiar words in the same explanation.

Entries are compact references: definition, purpose, one example, fuller explanation and source. Preserve meaningful anchors when rewriting them.

<a id="9-sources"></a>

## Sources

Prefer original architecture authors, official framework documentation and standards. Add established secondary sources when they clarify an interpretation.

Place a source beside the claim or in a short sources section. Label this handbook's choices explicitly.

<a id="10-examples"></a>

## Examples

Every recurring concept has **one canonical detailed explanation**. Other pages summarize and link. Use focused excerpts rather than copying a complete implementation across styles.

Name the business owner and the external input. Preserve runtime validation and failure handling needed to understand the example, while removing setup details that do not change the architectural conclusion.

Review three changes: a business rule, an integration and growth across capabilities. Identify the area that changes and what stays stable. More files do not establish maintainability.

A guide teaches its subject. Concurrency, distributed consistency and similar disciplines belong in [Extras](extras/README.md) when they have a rigorous independent guide.

<a id="11-review-checklist--three-passes"></a>

## Review checklist — three passes

1. **Pedagogy:** can the reader explain the decision, trace the example and choose a file's owner? Remove repetition, jargon chains and unnecessary caveats.
2. **Architecture:** do source dependencies follow the chosen boundaries? Is every rule/value set owned once? Are transport checks distinct from business validity?
3. **Consistency:** inspect names, paths, navigation, anchors, glossary links and diagram semantics. Check relative links and use a real Mermaid parser when revising diagrams.

Authors may validate snippets temporarily on their own machines. Describe exactly what was checked; do not imply the handbook runs tests or contains an executable application.

Do not add package managers, test runners, build scripts, generated mirrors or documentation tooling. A future change of repository mission requires an explicit decision.

<a id="12-canonical-architecture-guide-template"></a>

## Canonical architecture-guide template

Use the [guide template](architecture/conventions/architecture-guide-template.md) for new styles or presentation patterns. Adapt the scope, preserve the progression and avoid filling sections with unrelated material.
