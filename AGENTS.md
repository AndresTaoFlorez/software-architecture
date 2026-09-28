# Instructions for AI Agents

Before editing this repository, read:

1. [CONTRIBUTING.md](./CONTRIBUTING.md)
2. [GLOSSARY.md](./GLOSSARY.md)
3. [Naming and File Placement Conventions](./conventions/naming-and-file-placement.md)
4. [Code Placement](./foundations/code-placement.md)\n5. [Architecture Guide Template](./docs/architecture-guide-template.md)

Mandatory rules:

- Follow the documentation order defined in `CONTRIBUTING.md`.
- Use Mermaid for every diagram; never add ASCII/Unicode text diagrams.
- Do not present folder layout as architecture without explaining responsibility and dependency direction.
- Distinguish architectural invariants, recommended defaults, framework requirements, and repository conventions.
- Add sources for history, framework behavior, and non-obvious architectural claims.
- Add/update glossary entries and run the glossary linker whenever concepts change.
- Preserve stable anchors when rewriting sections referenced elsewhere.
- Review substantial changes in three passes: pedagogy, architectural rigor, mechanical consistency.\n- Run `node scripts/docs-quality.mjs` and `node scripts/glossary-links.mjs --check` before considering documentation complete.
- Never copy a reference project's accidental complexity into the canonical documentation without first evaluating whether it is a reusable practice.
