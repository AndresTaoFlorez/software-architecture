# Instructions for AI Agents

Before editing, read:

1. [Contributing](CONTRIBUTING.md)
2. [Glossary](GLOSSARY.md)
3. [Naming and File Placement](architecture/conventions/naming-and-file-placement.md)
4. [Code Placement](architecture/foundations/code-placement.md)
5. [Guide Template](architecture/conventions/architecture-guide-template.md)

## Editorial rules

- Start with a familiar problem, show the mechanism, name the concept and explain its consequence.
- Assume programming knowledge and no prior architecture vocabulary. Explain indispensable words in place.
- Give each recurring concept one canonical detailed explanation; other pages summarize and link.
- Define positively first. Add one contrast or caveat only when it changes the reader's decision.
- Prose after a table or diagram explains a non-obvious consequence rather than repeating its mapping.
- Link glossary terms on first meaningful use in a section, or to resolve ambiguity.
- Keep each guide within its subject. Adjacent disciplines require their own rigorous guide under Extras.
- Use the TypeScript-first teaching sequence before framework conveniences. Use established infrastructure implementations.
- Remove example details that do not affect the architectural conclusion.

## Architecture and structure

- Preserve the layer-first convention and capability ownership inside each layer.
- Keep each business rule and vocabulary with one authoritative owner. Outer checks validate unknown shapes and reuse business guards/factories.
- Distinguish source dependencies, runtime calls and startup composition.
- Explain placement by meaning rather than file size, reuse or a suffix.
- Prefer narrow supported public APIs over cross-capability deep imports or generic shared buckets.
- Review changes to a rule, an integration and capability growth before claiming maintainability.
- Distinguish architecture constraints, framework requirements and handbook conventions.
- Keep frontend and backend responsibilities explicit; use their canonical placement pages.
- Cite primary sources for architecture and official sources for framework behavior.

## Diagrams and review

- Use Mermaid or editable, accessible SVG; no ASCII/Unicode trees.
- Use compact concrete nodes, muted colors and explicit connector semantics: source dependencies dashed/light, calls solid/strong, composition distinct/secondary.
- Preserve stable anchors and inspect every changed relative link after moves.
- Review substantial changes in three passes: pedagogy, architectural rigor and mechanical consistency.
- Temporary local snippet and Mermaid validation is allowed. Report its scope accurately.

## Documentation-only repository

Do not add package managers, test runners, build scripts, generated-document tooling or mirrored complete examples. The handbook contains illustrative source code, not a runnable project.
