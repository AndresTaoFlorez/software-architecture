# Documentation Validation

Run from the repository root with Node 24:

```bash
npm ci --ignore-scripts
npm run check
```

After editing prose, run `node scripts/glossary-links.mjs --write`, inspect the diff, then run the check again.

## What the local validation commands check

| Check | Coverage |
| --- | --- |
| `test:scripts` | regression fixtures for protected Markdown, source preservation, linking [idempotency](../GLOSSARY.md#idempotency), registry failures, links, anchors, fences and progression |
| Complete feature examples | TypeScript compilation, domain-owned order-status validation and cancellation behavior for the four landings and the Clean feature chapter |
| Frontend ticket example | TypeScript compilation and runtime checks for one domain status vocabulary, subject normalization, valid/invalid HTTP [DTOs](../GLOSSARY.md#data-transfer-object-dto) and injected [gateway](../GLOSSARY.md#gateway) behavior |
| Backend ticket example and exercises | Canonical plain TypeScript modules and exercise modules compile; request shapes, domain creation rules, awaited persistence, failure/result mapping, CLI behavior and deterministic competing-quota behavior are checked. A changed vocabulary/subject limit is compiled and exercised separately. All five layers follow the documented matrix through TypeScript [AST](../GLOSSARY.md#abstract-syntax-tree-ast) inspection of imports, reexports, dynamic imports, import types, require and import-equals, with forbidden-dependency fixtures. Complete Nest/Prisma module snippets receive the same source inspection, but those integrations are not type-checked or executed here. |
| `check:examples` | exact parity of repeated [Domain](../GLOSSARY.md#domain)/[Application](../GLOSSARY.md#application-layer)/[Infrastructure](../GLOSSARY.md#infrastructure) blocks against the canonical order-cancellation guide; regenerate copies with `npm run sync:examples` |
| `check:glossary` | registry/entry/index consistency, required purpose/example/source fields, incompatible aliases and missing eligible prose links |
| `check:docs` | local link/image/reference targets, explicit and GitHub-style heading anchors, malformed known link forms, closed fences, prohibited text diagrams and ordered guide sections |

The parser uses CommonMark syntax and preserves source offsets. The linker does not serialize Markdown. It protects headings, existing links/images, reference definitions, bracketed contents, HTML, code and bare URLs. Ambiguous words such as “repository” require context or an unambiguous registered phrase. Removing a broad alias does not rewrite existing manual links: review their meanings separately.

The ticket dependency test checks layer-first relative references in [Domain](../GLOSSARY.md#domain), [Application](../GLOSSARY.md#application-layer), [Infrastructure](../GLOSSARY.md#infrastructure), [Presentation](../GLOSSARY.md#presentation-layer) and Composition. Inner layers reject package imports; outer fixtures may import framework/platform packages. It rejects computed imports that it cannot resolve. It does not resolve project aliases, inspect third-party transitive dependencies, or enforce capability [public APIs](../GLOSSARY.md#public-api); the fixtures use no aliases, and a real application needs its configured module resolver. [Presentation](../GLOSSARY.md#presentation-layer) imports [Application](../GLOSSARY.md#application-layer) rather than [Domain](../GLOSSARY.md#domain) directly in this example. The quota exercise checks one JavaScript execution agent and does not establish database isolation, rollback, durability or behavior across server processes.

## What still needs review

The local Mermaid validation is **structural**: it checks a recognized declaration and a closed fence. It is not a Mermaid parser and cannot establish syntax or meaning. For substantive diagram changes, parse every affected block using the official Mermaid API, then review whether each arrow represents imports, runtime messages, ownership or containment. A [port](../GLOSSARY.md#port) is a source contract, not a required intermediate runtime object. Parser success alone does not establish conceptual correctness or readable rendering.

Progression checks verify ordered headings; they cannot prove the content teaches the promised responsibilities. Apply the [first-principles review](../CONTRIBUTING.md#3-progressive-disclosure) manually: can a programmer with no architectural vocabulary identify the actual problem, describe the mechanism, and explain the named concept without following several glossary links? Check that definitions do not rely on undefined jargon or circular explanations. Review complete examples, sources, ownership and trade-offs manually. Apply the [realistic change-pressure gate](../CONTRIBUTING.md#10-examples): authoritative rule/data owner, external trust boundaries, significant failures and concurrency assumptions, and expected impact of a business-rule change, integration change and growth across modules/teams. A passing small-example test does not establish production readiness or runtime performance; measure those separately. Type-check complete examples and run behavior checks where available; label responsibility excerpts and their assumptions explicitly.

External URLs are not fetched by the local `npm run check`, so the checks remain independent of network availability. Check primary/official sources during reviews. A reachable page does not prove that it supports a claim. Undefined explicit reference forms are reported; bare bracketed citations are preserved because they need not be Markdown links.

Heading anchors use `github-slugger`, including duplicate collisions. HTML anchor IDs are retained. The scope is repository Markdown navigation; a different publishing renderer may use different rules. Preserve meaningful historical anchors when a heading changes, even if no current internal link points to it.

## Sources

- [mdast-util-from-markdown](https://github.com/syntax-tree/mdast-util-from-markdown)
- [github-slugger](https://github.com/Flet/github-slugger)
- [CommonMark specification](https://spec.commonmark.org/)
- [Mermaid API — parse](https://mermaid.js.org/config/usage.html)
