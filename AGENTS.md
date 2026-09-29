# Instructions for AI Agents

Before editing this repository, read:

1. [CONTRIBUTING.md](./CONTRIBUTING.md)
2. [GLOSSARY.md](./GLOSSARY.md)
3. [Naming and File Placement Conventions](./conventions/naming-and-file-placement.md)
4. [Code Placement](./foundations/code-placement.md)
5. [Architecture Guide Template](./docs/architecture-guide-template.md)

Mandatory rules:

- Follow the documentation order and mandatory [first-principles explanation protocol](./CONTRIBUTING.md#3-progressive-disclosure) in `CONTRIBUTING.md`. Apply the protocol to new or revised guides, definitions, glossary entries, diagram explanations, and substantive examples.
- Assume the reader can program but has no prior architecture vocabulary. Begin with a familiar situation and a concrete problem; show what the code does before giving its formal name.
- Do not define one unfamiliar idea by chaining other unexplained technical terms. Explain essential new words in place; a glossary link supports but never substitutes for an understandable sentence.
- For each central concept, show a minimal realistic example, who does what, why the separation matters, and what it does **not** do. Distinguish source dependencies, runtime calls, and wiring when discussing relationships.
- Keep the precise terminology and necessary nuance **after** the simple explanation: accessible does not mean technically approximate.
- Reject pedagogically opaque text even if its architecture is correct. During review, check whether a reader could restate the idea and trace the example without consulting several other pages.
- Do not defer basic placement, dependency, naming, or first-feature guidance to an advanced chapter; every architecture landing page must be usable by a beginner on its own.
- Use Mermaid for every diagram; never add ASCII/Unicode text diagrams.
- If preserving a static Mermaid preview image, include its editable Mermaid source and clarify whether edges represent source dependencies, runtime calls or assembly relationships.
- Do not present folder layout as architecture without explaining responsibility and dependency direction.
- Distinguish architectural [invariants](./GLOSSARY.md#invariant), recommended defaults, framework requirements, and documentation conventions.
- Add sources for history, framework behavior, and non-obvious architectural claims.
- Add/update glossary entries and run the glossary linker whenever concepts change.
- Preserve stable anchors when rewriting sections referenced elsewhere.
- Review substantial changes in three passes: pedagogy, architectural rigor, mechanical consistency.
- Run `node scripts/docs-quality.mjs` and `node scripts/glossary-links.mjs --check` before considering documentation complete.
- Never copy a reference project's accidental complexity into the canonical documentation without first evaluating whether it is a reusable practice.
