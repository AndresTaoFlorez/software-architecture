# Site checks and Pages delivery

The site is built from canonical root Markdown. Only `site/dist/` is uploaded; generated files are ignored by Git. The production address is expected to be `https://andrestaoflorez.github.io/software-architecture/`, not the domain root. This document does not establish that address is live.

**Contents**

- [Local verification](#local-verification)
- [Workflow boundary](#workflow-boundary)
- [Human activation and release](#human-activation-and-release)
- [Recovery](#recovery)
- [Dependency risk and limits](#dependency-risk-and-limits)

## Local verification

Use Node 22.22.1 and npm 10.8.2, as selected in CI. From `site/`:

```sh
npm exec --yes --package=npm@10.8.2 -- npm ci --ignore-scripts
npm run check
npm run build
npm test
npm run smoke
```

The explicit npm package avoids changing a developer's global installation. CI installs that same npm version into its disposable runner. `npm ci` fails on a manifest/lockfile mismatch. Dependency lifecycle scripts are disabled; the clean build below confirms this works with the current lockfile. No lint/format command is configured or claimed.

Verified locally with Node 22.22.1 and npm 10.8.2: clean installation without engine warnings; Astro check had zero errors/warnings/hints; build emitted 93 HTML pages including the fallback 404; nine tests passed, covering 92 reader pages and 4,686 local links/fragments. The HTTP smoke starts and stops an Astro preview child process on localhost port 4322. It requests six representative routes (landing, glossary, frontend, backend, style and deeply nested exercise solution), eight generated assets and the Pagefind JavaScript entry, all with the production base. Keep port 4322 free. It checks successful HTTP responses, HTML headings and nonempty non-HTML assets. Full search interaction, accessibility and diagram rendering are not established by these requests.

For manual preview, run `npm run preview -- --host 127.0.0.1` after building, then open the printed address with `/software-architecture/` appended if necessary. A build is required before tests or preview; a stale `dist` is not evidence for changed content. A negative smoke run temporarily removed the generated Pagefind entry: the check failed with HTTP 404 as expected, and the asset was restored. Standalone actionlint 1.7.12 passed the workflow (download SHA-256 matched the official release asset digest); this author-side check is not an extra configured CI command.

## Workflow boundary

One workflow, `.github/workflows/site.yml`, covers PR checks and production delivery. Every `pull_request` targeting `main` runs the locked install, Astro/TypeScript check, production build, tests and HTTP smoke. A PR, including a fork PR, cannot upload a Pages artifact or enter the deployment job. It receives no Pages write or OIDC permissions. Do not replace this event with `pull_request_target` or expose deployment secrets to PR builds.

Every `push` to `main` runs the same checks, uploads `site/dist` as `github-pages`, then deploys that validated artifact. There are no path filters or manual dispatch triggers. A docs-only commit therefore selects production delivery by configuration; actual event execution remains a post-merge check. Workflow concurrency groups by event and ref; a newer main push cancels the older main run, including its deployment job. PR concurrency is isolated from main. The deploy job needs a successful checks job, uses the `github-pages` environment, and alone receives `pages: write` and `id-token: write`. Checkout disables persisted credentials. No PAT is required.

The official `withastro/action` v6 at `3eafd002e65cc31b4f0eae0bb05450d521562247` was inspected. Its inputs support `path`, `node-version`, `package-manager` (including npm), `build-cmd` and `out-dir`, but its install step runs `npm install`, not `npm ci`. This workflow deliberately uses the supported official GitHub sequence: checkout v7, setup-node v7.0.0, upload-pages-artifact v5 and deploy-pages v5, pinned to immutable SHAs. Setup/upload inputs were checked against their pinned `action.yml`; setup-node's SHA also matches the official Astro action's own dependency. The runner's action runtime is Node 24, independently of the site's selected Node 22.22.1. There is no Astro build wrapper or implicit working-directory assumption.

## Human activation and release

No repository settings or branch rules were changed. The task handoff records Pages as already using GitHub Actions. An unauthenticated Pages API request here returned 404, so this worker cannot independently confirm that private setting; this is not evidence of a missing site. Public read-only API calls confirmed `main` is unprotected and the ruleset list is empty. `gh` is not installed in this environment.

An owner/admin should perform this sequence:

1. In repository Settings → Pages → Build and deployment, verify Source is **GitHub Actions**; select it if necessary. In Settings → Environments → `github-pages`, restrict deployment branches to selected branch `main`. Do not enable a reviewer gate unless an available reviewer can approve it. Check that Actions is enabled and repository policy permits the pinned official actions.
2. Have Codex independently review and push this candidate to existing PR #22. Inspect the actual `Site checks` result on the exact published head SHA. Do not infer a remote pass from local execution.
3. In Settings → Rules → Rulesets → New branch ruleset, name it `main-pr-only`, target branch `main`, enforcement **Active**. Require a pull request before merging; use zero required approvals unless an eligible second reviewer is available (an author cannot approve their own PR). Require the observed GitHub Actions check `Site checks`, with branches up to date before merging. Block force pushes and deletions. Leave the bypass list empty if supported. Confirm an owner can still merge a passing PR before activating; do not add an impossible review/deployment gate. If rulesets are unavailable under the repository plan/permissions, use Settings → Branches → classic protection for exact branch `main` with equivalent PR/check/up-to-date/no-force/no-deletion rules and no administrative bypass where supported. Report any unavailable enforcement rather than claiming protection.
4. Only after explicit human merge approval, merge through PR #22. The main push must create a `Handbook site` run for the merge SHA. Verify both `Site checks` and `Deploy Pages`, artifact `github-pages`, environment deployment and reported `page_url`. Confirm no older main run is still deploying.
5. At that URL check HTTP success for `/software-architecture/`, `/software-architecture/glossary/`, the frontend/backend/style and exercise routes used by `site/tests/smoke.mjs`, a glossary fragment and generated `_astro`/Pagefind assets. Exercise an actual search query and open a result; check browser console/network for base-path failures. Record the merge SHA, workflow run URL, deployment URL and smoke evidence. This is when deployment can be marked successful, not before.

## Recovery

For failed install, compare Node/npm versions and the committed lockfile; reproduce with `npm ci --ignore-scripts`. Do not delete/regenerate the lockfile or run a forced audit fix to make CI green. For failed content checks, correct the canonical source link/title/anchor rather than editing generated HTML. Rerun the complete local sequence after correction.

For upload/deploy failures, inspect the exact run's failed step: confirm Pages Source, environment branch restrictions, Actions policy and deploy-job permissions. A green build alone does not mean Pages published. If no newer main push exists, rerun the failed workflow from Actions after correcting the setting. Do not rerun an obsolete main revision over a newer deployment; create a forward fix through a PR instead.

For a broken release, open a rollback PR reverting the offending source/workflow change to the last known-good revision; run checks, obtain approval and merge. Its new main push rebuilds and deploys the rollback. Never reset/force-push main or treat cached artifacts as source. If this is the first deployment, there may be no previous known-good Pages release; keep activation pending until a forward fix passes.

## Dependency risk and limits

`npm audit --omit=dev` reports ten moderate affected package entries from one advisory, [GHSA-rj75-hqrm-r3gf](https://github.com/advisories/GHSA-rj75-hqrm-r3gf). The installed chain is Starlight → astro-expressive-code → expressive-code/core → `postcss-nested@6.2.0` → `postcss-selector-parser@6.1.4`. The advisory describes quadratic selector parsing/CPU exhaustion below 7.1.6. Published postcss-nested 6.x metadata still requires parser 6.x; no compatible patched parser was identified within that range. The suggested forced audit fix downgrades Starlight to 0.21.5 and is not applied. No untested major override is introduced.

Exposure is build-time: Expressive Code transforms trusted project/dependency CSS during the build. Malicious CSS supplied through an unreviewed dependency, custom style or PR can consume CI CPU; PR builds are not inherently trusted, so the checks job has a 15-minute limit and no deployment credentials. The deployed artifact is static HTML/CSS/JS and does not execute this PostCSS parser at reader runtime. That narrows exposure; it does not repair the vulnerable build dependency. Follow upstream Expressive Code/postcss-nested for a compatible release, then update the lockfile in a separately reviewed dependency change and rerun the checks. Human release review must explicitly accept this temporary build-time risk or defer release. The advisory is documented, not silently suppressed or misrepresented as a clean audit.

No remote check, live deploy, visual/diagram, browser search or accessibility acceptance is claimed by this increment. Mermaid-specific validation is not yet configured. The build still reports optional empty i18n/missing custom 404 content and emits Starlight's fallback. These remain separate acceptance work, not implemented CI checks.

Official references: [Astro GitHub Pages guide](https://docs.astro.build/en/guides/deploy/github/), [Astro action](https://github.com/withastro/action), [GitHub custom Pages workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages), [workflow concurrency](https://docs.github.com/en/actions/using-jobs/using-concurrency), [repository rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets).
