# Static handbook delivery

The handbook already has canonical Markdown at the repository root. Publishing it must not create another editable copy. This site reads those files directly and emits only ignored build artifacts.

## Decision

Use Astro 7.4.0 and Starlight 0.42.6 with TypeScript's strict preset. Starlight's installed peer requirements are Astro `^7.2.10` and markdown-remark `^7.3.0`; all three runtime packages are pinned. No React application or server is added.

The installed `docsLoader()` defaults to `src/content/docs` and delegates to Astro's glob loader. The handbook has no Starlight frontmatter. A small Content Layer loader instead uses the public `parseData`, `renderMarkdown`, store and watcher interfaces with `docsSchema()`. It derives a required title from the first parsed H1 and renders the original source URL. There is no mirror or synchronization command. Each reload validates a complete snapshot before replacing the store; changes are serialized. Re-rendering all 92 pages is deliberately simple, not an incremental performance claim.

The first H1 becomes a preserved title anchor, because Starlight renders the visible title. Heading IDs are allocated in source order before removing that H1, preserving its reservation and the suffixes of repeated headings. Redundant explicit aliases matching those IDs lose only their duplicate ID. Distinct legacy aliases survive. The remark transform resolves Markdown links relative to their canonical source before applying `/software-architecture/`. Every relative destination must exist locally, including GitHub fallbacks; missing targets fail rendering. Directory links resolve to their README when present. Root README maps to `/`, GLOSSARY to `/glossary/`, and nested README files to their directory. Paths are lowercased and collisions rejected. Other relative references, including maintainer instructions, open GitHub's stable `main` branch. Their existence is checked in the local candidate, not against remote `main` before merge. Raw HTML links are not rewritten; no such navigational reader links were required in this increment.

Reader pages are root README/GLOSSARY plus architecture and extras Markdown, excluding the editorial standard and authoring template. Onboarding, maintenance and root maintainer instructions stay on GitHub. Naming conventions remain reader references.

Use Starlight's native design tokens. Panda would introduce a second styling foundation without a demonstrated requirement. Custom UI, diagram rendering/controls, responsive accessibility and search interaction acceptance belong to later increments.

## Reproduce and evidence

From `site/`, install with `npm ci --ignore-scripts`, then run `npm run build`, `npm test` and `npm run check`. `npm run dev` starts the development server; `npm run preview` serves the generated site. Tests inspecting HTML require a fresh build.

Real build: 93 HTML pages, comprising 92 reader pages and Starlight's 404. HTML is parsed, not regex-counted, to check title duplication, unique IDs and generated reader links/fragments plus local existence and stable branch of GitHub fallbacks (4,686 checks). All nine tests passed. Unit cases cover missing H1, fenced pseudo-headings, invalid routes, collisions, repository escapes, missing reader/fallback/asset/directory targets, directory README resolution and preserved anchors. A regression uses Astro's actual Markdown renderer to verify H1 reservation, repeated heading suffixes, distinct legacy aliases and deduplication. Watch tests inject add/change/unlink events using the real canonical filesystem and a mocked renderer/store: browser HMR and operating-system watcher delivery remain unverified. No canonical file is modified by tests.

Astro check passed with zero errors/warnings/hints. The build reports empty optional i18n and missing custom 404 content; Starlight supplies its fallback. Pagefind generation ran, but search UX was not tested. No visual or diagram acceptance is claimed.

The CI increment repeated a clean installation with supported Node 22.22.1 and npm 10.8.2 without engine warnings, followed by check/build/nine tests and HTTP smoke (six pages/nine assets). See [delivery and recovery](DEPLOYMENT.md) for the exact commands, official action choice, human settings sequence and pending post-merge evidence. `npm audit --omit=dev` still reports ten moderate affected entries from GHSA-rj75-hqrm-r3gf in build-time PostCSS selector parsing. No compatible patch was identified in postcss-nested 6.x's parser range; no forced downgrade or major override was applied. The static reader artifact does not execute that parser at runtime; release review must explicitly accept the remaining trusted-CSS/build dependency exposure or defer deployment.

## Sources

- [Astro Content Loader API](https://docs.astro.build/en/reference/content-loader-reference/)
- [Astro content collections](https://docs.astro.build/en/guides/content-collections/)
- [Astro Markdown configuration](https://docs.astro.build/en/reference/configuration-reference/#markdownprocessor)
- [Starlight content loaders](https://starlight.astro.build/reference/content-loaders/)
- [Starlight schema](https://starlight.astro.build/reference/frontmatter/)
- [Starlight CSS variables](https://starlight.astro.build/guides/css-and-tailwind/#starlight-css-variables)

API decisions were checked against the installed loader types, Starlight loader implementation and actual build errors, not older configuration examples.
