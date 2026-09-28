# Documentation Validation

Run from the repository root with Node 24:

```bash
npm ci --ignore-scripts
npm run check
```

After editing prose, run `node scripts/glossary-links.mjs --write`, inspect the diff, then run the check again.

## What CI checks

| Check | Coverage |
| --- | --- |
| `test:scripts` | regression fixtures for protected Markdown, source preservation, linking [idempotency](../GLOSSARY.md#idempotency), registry failures, links, anchors, fences and progression |
| Complete feature examples | TypeScript compilation and cancellation behavior for the four landings and the Clean feature chapter |
| `check:glossary` | registry/entry/index consistency, required purpose/example/source fields, incompatible aliases and missing eligible prose links |
| `check:docs` | local link/image/reference targets, explicit and GitHub-style heading anchors, malformed known link forms, closed fences, prohibited text diagrams and ordered guide sections |
| Demo tests and build | source dependency matrix, lesson dependency policy, Vue/TypeScript and Vite build on every triggered workflow run |

The parser uses CommonMark syntax and preserves source offsets. The linker does not serialize Markdown. It protects headings, existing links/images, reference definitions, bracketed contents, HTML, code and bare URLs. Ambiguous words such as “repository” require context or an unambiguous registered phrase. Removing a broad alias does not rewrite existing manual links: review their meanings separately.

## What still needs review

Mermaid CI validation is **structural**: it checks a recognized declaration and a closed fence. It is not a Mermaid parser and cannot establish syntax or meaning. For substantive diagram changes, parse every affected block using the official Mermaid API, then review whether each arrow represents imports, runtime messages, ownership or containment. A [port](../GLOSSARY.md#port) is a source contract, not a required intermediate runtime object. Parser success alone does not establish conceptual correctness or readable rendering.

Progression checks verify ordered headings; they cannot prove the content teaches the promised responsibilities. Review complete examples, sources, ownership and trade-offs manually. Type-check complete examples and run behavior checks where available; label responsibility excerpts and their assumptions explicitly.

External URLs are not fetched by normal CI, to keep it independent of network availability. Check primary/official sources during reviews. A reachable page does not prove that it supports a claim. Undefined explicit reference forms are reported; bare bracketed citations are preserved because they need not be Markdown links.

Heading anchors use `github-slugger`, including duplicate collisions. HTML anchor IDs are retained. The scope is repository Markdown navigation; a different publishing renderer may use different rules. Preserve meaningful historical anchors when a heading changes, even if no current internal link points to it.

## Sources

- [mdast-util-from-markdown](https://github.com/syntax-tree/mdast-util-from-markdown)
- [github-slugger](https://github.com/Flet/github-slugger)
- [CommonMark specification](https://spec.commonmark.org/)
- [Mermaid API — parse](https://mermaid.js.org/config/usage.html)
