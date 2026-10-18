# Instructions for AI Agents

Before editing, read:

1. [Contributing](CONTRIBUTING.md)
2. [Glossary](GLOSSARY.md)
3. [Naming and File Placement](architecture/conventions/naming-and-file-placement.md)
4. [Code Placement](architecture/foundations/code-placement.md)
5. [Guide Template](architecture/conventions/architecture-guide-template.md)

**Contents**

- [Editorial rules](#editorial-rules)
- [Heading and reading structure](#heading-and-reading-structure)
- [Architecture and structure](#architecture-and-structure)
- [Diagrams and review](#diagrams-and-review)
- [Documentation-only repository](#documentation-only-repository)
- [Progress publication](#progress-publication)

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
- Write in plain, direct, impersonal English. Explain like an experienced engineer: start with the concrete problem, make the decision clear, and state its consequence. Prefer short natural sentences, not conversational address, promotional claims, rhetorical questions or repetitive summaries.
- Be concise without omitting necessary assumptions, failure cases or trade-offs. Keep a calm teaching voice; do not use jargon to sound authoritative.
- Use the [Editorial Review Standard](architecture/conventions/editorial-review.md) to diagnose unclear or misleading passages before rewriting. Preserve meaning, useful qualifications and source-backed examples; review each revision in context.

## Heading and reading structure

- Choose heading depth by the actual relationship; do not impose a fixed number of H1 headings.
- Group related responsibilities under a shared H2 and use H3 for their explanations.
- Remove decorative title numbering; preserve filenames and exercise identifiers.
- Add an H2/H3 contents list after the introduction when a document has three or more main sections. Short route maps and the glossary retain their own navigation.
- Preserve previous anchors with explicit identifiers and link internally to current headings.
- Keep the common reading route and previous/next navigation aligned with the repository README.
- Intermediate/advanced exercises need starting code, an observable requirement and a concrete separate solution.
- General concepts have canonical framework-independent explanations; frontend/backend pages apply them.

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
- Temporary local snippet and Mermaid validation is allowed. Report type checking, execution, framework review and visual inspection separately.
- Inspect all diagrams in light/dark and narrow/desktop views. [Parser](GLOSSARY.md#parser) success does not establish readability; labels must be complete when opened or enlarged.

## Documentation-only repository

The handbook contains illustrative source code, not a runnable sample application. The authorized Astro + Starlight documentation site may have a dedicated `site/` project with its package manifest, lockfile, build and test tooling, plus narrowly scoped GitHub Actions for PR checks and deployment from `main`. Canonical Markdown and consumer skills remain at their existing paths; generated site content must not become a second editable source. This exception does not authorize a runtime backend, database, authentication, analytics service, CMS, SPA or general-purpose tooling.

## Progress publication

GitHub is the source of truth for task progress. For every coherent, persistent change, run the relevant checks, commit it, and push it to the active task PR branch before starting another change. Do not accumulate unpublished local changes across stages or wait until the entire task is finished. Temporary diagnostics may remain outside the repository; version any relevant findings, verified results, or decisions that are part of the deliverable. At the end of each stage, report the published commit SHA and PR link. If a stage made no persistent change, say so and do not create an empty commit. A stage is not complete until its deliverable commit is present on GitHub.

The coordinator must independently verify that each specialist's claimed change is committed and pushed to the intended PR branch, and inspect the published commit or PR diff; a progress report alone is not evidence of publication. User authorization to implement includes committing and pushing within the active PR's scope, but never authorizes merging. Do not force-push, rewrite history, or publish outside the authorized branch; stop and report a concrete blocker if safe publication is not possible.
