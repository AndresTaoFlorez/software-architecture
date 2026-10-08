# Contributing to the Software Architecture Reference

This is a documentation-only handbook. Contributions must be accurate, source-backed and understandable to a programmer learning architecture.

## 1. Audience

Assume programming knowledge, but no architecture vocabulary. Explain the decision, its owner and its consequence in familiar language before naming the pattern.

## 2. Required order for every architecture guide

Use this sequence proportionately:

1. History and the motivating problem.
2. Strong and weak fit.
3. Mental model and responsibilities.
4. Physical placement, dependencies and naming.
5. One small feature or focused excerpt.
6. How a project would verify the boundary.
7. Trade-offs, learning route and sources.

Landing pages must explain enough to start a feature. Detailed mechanics belong to their canonical guide.

## 3. Progressive disclosure

Start with an actor and a concrete difficulty. Show the smallest mechanism, name the concept, then explain the consequence. A glossary link supports an explanation; it does not replace one.

Define positively first. Usually one relevant contrast suffices. Keep one idea per paragraph and remove sentences that restate a preceding table or diagram.

<a id="typescript-first-mechanisms"></a>

### TypeScript-first mechanisms

Show ordinary runtime checks before framework validation, constructor arguments before a DI container, and memory storage before database integration. Use established HTTP, authentication, database and cryptographic implementations.

Keep authoritative business validity with its owner when a framework takes over transport checks. The [backend route](architecture/backend/README.md) follows this sequence.

## 4. Distinguish rule types

| Type | Meaning |
| --- | --- |
| Architectural constraint | Required by the boundary being described |
| Recommended default | A useful choice with alternatives |
| Framework requirement | Required by the cited framework |
| Handbook convention | Chosen here for consistency |
| Example | Illustrates a decision without prescribing a universal design |

Architecture authors do not prescribe this handbook's exact TypeScript folders.

## 5. Diagrams

Use Mermaid or accessible SVG for relationships and folder maps. Avoid ASCII trees and prose arrow chains.

Label the connectors: dashed/light for source dependencies, solid/strong for runtime calls, distinct/secondary for startup wiring. A contract is a source requirement; the supplied implementation is the runtime object.

Keep concrete names first, nodes compact and colors muted. SVGs need editable vector content, a title/description and preferably a transparent background. Mermaid companions must preserve the same semantics.

## 6. Folder and code-placement explanations

Place code where its meaning belongs. Use [Code Placement](architecture/foundations/code-placement.md) for representations, parsers, mappers, formatters and helpers.

Explain an ambiguous placement once; other pages show their concrete paths and link to that explanation.

## 7. Naming

Follow [Naming and File Placement](architecture/conventions/naming-and-file-placement.md). Distinguish role names, language/framework requirements and handbook conventions.

## 8. Glossary

Link a glossary term on its **first meaningful use in a section**, or where it would otherwise be ambiguous. Do not repeatedly link familiar words in the same explanation.

Entries are compact references: definition, purpose, one example, fuller explanation and source. Preserve meaningful anchors when rewriting them.

## 9. Sources

Prefer original architecture authors, official framework documentation and standards. Add established secondary sources when they clarify an interpretation.

Place a source beside the claim or in a short sources section. Label this handbook's choices explicitly.

## 10. Examples

Every recurring concept has **one canonical detailed explanation**. Other pages summarize and link. Use focused excerpts rather than copying a complete implementation across styles.

Name the business owner and the external input. Preserve runtime validation and failure handling needed to understand the example, while removing setup details that do not change the architectural conclusion.

Review three changes: a business rule, an integration and growth across capabilities. Identify the area that changes and what stays stable. More files do not establish maintainability.

A guide teaches its subject. Concurrency, distributed consistency and similar disciplines belong in [Extras](extras/README.md) when they have a rigorous independent guide.

## 11. Review checklist — three passes

1. **Pedagogy:** can the reader explain the decision, trace the example and choose a file's owner? Remove repetition, jargon chains and unnecessary caveats.
2. **Architecture:** do source dependencies follow the chosen boundaries? Is every rule/value set owned once? Are transport checks distinct from business validity?
3. **Consistency:** inspect names, paths, navigation, anchors, glossary links and diagram semantics. Check relative links and use a real Mermaid parser when revising diagrams.

Authors may validate snippets temporarily on their own machines. Describe exactly what was checked; do not imply the handbook runs tests or contains an executable application.

Do not add package managers, test runners, build scripts, generated mirrors or documentation tooling. A future change of repository mission requires an explicit decision.

## 12. Canonical architecture-guide template

Use the [guide template](architecture/conventions/architecture-guide-template.md) for new styles or presentation patterns. Adapt the scope, preserve the progression and avoid filling sections with unrelated material.
