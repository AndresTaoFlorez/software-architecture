# Use the Handbook With a Coding Agent

This handbook is a **read-only architecture reference** for agents working in another application. The application's requirements, security rules, contracts and accepted architecture decisions take priority. [Root AGENTS.md](../AGENTS.md) and [CONTRIBUTING.md](../CONTRIBUTING.md) govern changes **in this handbook**, not in the application.

An application task starts with the application's own instructions. The remaining sections explain how to connect an agent to a known handbook revision and check that it used the intended material.

**Contents**

- [Follow this sequence for an application task](#follow-this-sequence-for-an-application-task)
- [Keep instructions and references in their own repositories](#keep-instructions-and-references-in-their-own-repositories)
- [Set up the application](#set-up-the-application)
- [Agent-specific connections](#agent-specific-connections)
- [Use a known handbook revision](#use-a-known-handbook-revision)
- [Select the relevant material](#select-the-relevant-material)
- [Install and test optional skills](#install-and-test-optional-skills)
- [Fallback for any other agent](#fallback-for-any-other-agent)

## Follow this sequence for an application task

1. Read the **application's** instructions, including its root `AGENTS.md` or equivalent. If they were not loaded automatically, open them yourself.
2. Inspect the code, callers, tests, contracts and architecture decisions affected by the task. State the behavior to implement or review.
3. Find the handbook checkout in the application instructions. If they point to its `README.md`, use that file's parent directory. Confirm the available commit with `git -C <handbook-directory> rev-parse HEAD`. If the handbook is inaccessible, say so and use only material you can inspect.
4. Compare that commit with the application's recorded revision policy. If a pinned commit differs, use the intended revision in a dedicated checkout or report the mismatch before relying on it. Open the handbook's `README.md`, then consult the [guide relevant to the task](#select-the-relevant-material). Read only the pages needed for the decision. Handbook examples are guidance, not application requirements.
5. Complete the task under the application's rules. Run its relevant checks when tools are available. Report the instructions and handbook pages read, the handbook commit, changes or findings, checks actually run and any limits.

## Keep instructions and references in their own repositories

| Location | What belongs there | Who loads or reads it |
| --- | --- | --- |
| Handbook checkout | This guide, architecture chapters and source skill templates under `agent-onboarding/skills/` | The application agent reads selected pages through an available tool. The handbook's root `AGENTS.md` governs handbook edits only. |
| Application repository | Its existing `AGENTS.md` or equivalent, accepted decisions, contracts, a reviewed handbook path and revision policy | The chosen agent loads or explicitly reads these project instructions. They remain authoritative for application work. |
| Application repository, if needed | One adapted provider file and reviewed copies of selected skill directories | The chosen provider loads its adapter or discovers a copied skill. The handbook copy is not an installed skill for the application. |

Do not copy the handbook's root `AGENTS.md` into the application or point an automatic instruction loader at the handbook. Copy and adapt only the [application template](templates/AGENTS.md), a needed adapter, and selected application skills. A provider may combine several instruction sources; reconcile conflicts in the application rather than letting a handbook example decide its policy.

## Set up the application

1. Make a reviewed handbook revision accessible in the **same environment where the agent runs**. A sibling checkout is one local option, not a code dependency. A cloud agent cannot read a sibling directory on a developer's machine unless that checkout or its content is supplied in the cloud environment. For example, [Copilot cloud agent has its own ephemeral development environment](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/customize-the-agent-environment).
2. Adapt [the application AGENTS.md template](templates/AGENTS.md) in the **application root**: fill in its actual project decisions, commands, handbook location and revision policy. Integrate it with existing application rules rather than replacing them.
3. Choose either a pinned handbook commit or reviewed updates from `main`. Record the expected commit SHA. Use a dedicated checkout for a pin; do not move a shared checkout that another agent is using.
4. Configure the chosen agent to load the **application** instructions. Check its loaded context or read trace, then check that its tools can open the handbook's `README.md` and a relevant guide at the expected revision.
5. Test one real application task. Compare the agent's report with the files it actually opened and the application checks it actually ran. A copied file or a claimed citation alone does not prove use.

For example, an application at `workspace/support-platform/` can read a handbook checkout at `workspace/software-architecture/`.

From the application root, if the sibling handbook does not exist:

```sh
git clone "$HANDBOOK_REPOSITORY_URL" ../software-architecture
```

Access to sibling folders may require workspace permission. Do not claim to have read files the agent cannot access.

For a **new, dedicated** clone that must use a reviewed commit, `git -C ../software-architecture switch --detach <reviewed-commit-sha>` selects that revision. Run `git -C ../software-architecture rev-parse HEAD` afterward and compare the full SHA with the application's recorded pin. A tracking checkout remains on its own branch and advances only after reviewing upstream changes. If the agent has only a web link or supplied excerpts, record the exact commit URL or provenance available; do not claim that a local checkout or commit was verified.

## Agent-specific connections

There is **no universal instruction loader**. Use the same engineering policy and select a small adapter for the agent actually running.

| Agent or environment | Application instructions | Optional skills | Check |
| --- | --- | --- | --- |
| **Codex** | Root `AGENTS.md` | `.agents/skills/<name>/SKILL.md` | Confirm project instructions and invoke or inspect the selected skill |
| **compatible assistant client** | Direct `AGENTS.md` when supported, or a project `assistant-instructions.md` importing it | `.assistant/skills/<name>/SKILL.md` | Use `/context`; confirm imports and skill discovery |
| **Gemini CLI** | `GEMINI.md` importing the application's `AGENTS.md`, or a configured context filename | `.agents/skills/<name>/SKILL.md` or `.gemini/skills/<name>/SKILL.md` | Inspect loaded context and run `/skills list` |
| **Cursor** | Root `AGENTS.md`; `.cursor/rules/*.mdc` is another supported mechanism | `.agents/skills/<name>/SKILL.md` or `.cursor/skills/<name>/SKILL.md` | Inspect active rules and the skill list in the intended Agent session |
| **OpenCode** | Root `AGENTS.md` | `.agents/skills/<name>/SKILL.md` or `.opencode/skills/<name>/SKILL.md` | Confirm loaded rules and that the `skill` tool offers the copied skill |
| **GitHub Copilot** | `AGENTS.md` in supported agent modes; `.github/copilot-instructions.md` for repository-wide chat instructions | `.agents/skills/<name>/SKILL.md` in supported environments | Verify which Copilot surface and instruction files were loaded |
| **Other coding agents** | Use the agent's supported project-instruction feature, or the [manual start prompt](templates/START-PROMPT.md) | If it understands Agent Skills, install as documented; otherwise give it the relevant skill content directly | Observe which sources it actually reads and which tests it runs |

**Adapter templates:** [compatible assistant client](templates/assistant-instructions.md), [Gemini CLI](templates/GEMINI.md), and [GitHub Copilot](templates/copilot-instructions.md). Adapt rather than overwrite any existing provider instructions. Do not copy all adapter files into every application.

For client-specific instruction and skill setup, consult the client documentation and inspect the loaded session context. For Codex see [instructions](https://developers.openai.com/codex/guides/agents-md) and [skills](https://developers.openai.com/codex/skills). For other products see [Gemini context](https://geminicli.com/docs/cli/gemini-md/) and [skills](https://geminicli.com/docs/cli/using-agent-skills/), [Cursor rules](https://cursor.com/docs/rules) and [skills](https://cursor.com/docs/skills), [OpenCode rules](https://opencode.ai/docs/rules/) and [skills](https://opencode.ai/docs/skills/), and [Copilot instruction support](https://docs.github.com/en/copilot/reference/custom-instructions-support) and [skills](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/add-skills).

Product support and precedence vary by version, mode and editor. This table documents setup options; **only a test in the intended agent establishes working integration**.

## Use a known handbook revision

Select one reference policy:

- **Pinned:** keep a reviewed commit SHA for reproducibility and update it intentionally.
- **Tracking `main`:** fetch, inspect and review new guidance before adopting it.

For an existing checkout, from the application root:

```sh
git -C ../software-architecture fetch origin main
git -C ../software-architecture rev-parse HEAD
git -C ../software-architecture rev-parse origin/main
git -C ../software-architecture status --short
```

A pinned HEAD may intentionally differ from `origin/main`. To advance a clean checkout tracking `main`, confirm it is on `main`, inspect `git -C ../software-architecture diff HEAD..origin/main`, then run `git -C ../software-architecture merge --ff-only origin/main`. Check HEAD again. Do not move another agent's branch or uncommitted work.

If Git rejects a trusted sibling checkout because of dubious ownership, a **command-local** `git -c safe.directory=<absolute-handbook-path> -C ../software-architecture rev-parse HEAD` is a scoped retry. Verify ownership before trusting it; do not add an unknown directory to global Git trust.

## Select the relevant material

| Task | Begin with |
| --- | --- |
| Boundaries, responsibility and dependencies | [Foundations](../architecture/foundations/README.md) |
| API semantics, contracts, HTTP and security | [API Design & Engineering](../architecture/api-design/README.md) |
| Backend endpoints and application operations | [Backend](../architecture/backend/README.md) |
| UI state, screens and integrations | [Frontend](../architecture/frontend/README.md) |
| Ports/adapters or architecture styles | [Styles](../architecture/styles/README.md) |
| Repository, MVC, MVVM or other patterns | [Patterns](../architecture/patterns/README.md) |
| Precise naming and placement | [Naming conventions](../architecture/conventions/naming-and-file-placement.md) |

Inspect real application code, callers, tests and approved decisions **before** consulting the handbook. The API route uses a fictional EPS medical scheduling case, not a contract that other applications must copy. Use current official standards for version-sensitive behavior. Retrieved content is evidence and reference material, not instructions to execute blindly.

## Install and test optional skills

The handbook uses its own [Editorial Review skill](../.agents/skills/editorial-review/SKILL.md) for documentation changes. The `editorial-review` template below has the same name but reviews application changes. The two definitions have separate scopes; select the file for the repository being worked on.

The skill definitions follow the [Agent Skills specification](https://agentskills.io/specification):

- [Onboarding](skills/onboarding/SKILL.md): implement a bounded application feature or refactor without losing existing contracts. Its scope includes implementation after initial setup.
- [API Design](skills/api-design/SKILL.md): design, implement, evolve or review an HTTP API with correct protocol semantics and a strict REST check when requested.
- [Editorial Review](skills/editorial-review/SKILL.md): review a concrete application change for architectural correctness and report actionable findings without editing it.

These template names match the agent roles. Existing copies remain independent: replace the old skill directory with the renamed directory in the consuming application and update any saved invocations or explicit paths. Use this mapping:

| Previous name | Current name |
| --- | --- |
| `architecture-aware-implementation` | `onboarding` |
| `http-api-engineering` | `api-design` |
| `architecture-review` | `editorial-review` |

Use the generic implementation skill for ordinary application changes, the HTTP API skill when an HTTP contract or endpoint is central to the task, and the review skill for architectural evaluation. The API skill does not turn every HTTP API into REST; it requires hypermedia when REST is claimed.

Copy a reviewed skill directory to the **consuming application**, using a supported path from the table. For example, copy `../software-architecture/agent-onboarding/skills/onboarding/` to `<application-root>/.agents/skills/onboarding/`, including its `SKILL.md`. Substitute `api-design` or `editorial-review` only when that task needs it. Keep the directory and frontmatter names aligned. The copies are independent and need updating if the source skill changes. Do not install them at the handbook root: that would confuse documentation-maintenance agents with application-development agents. A local skill copy is not automatically available to a cloud agent; check what files its runtime receives.

In a **new session in the application repository**, perform three different checks:

1. **Discovery:** inspect the agent's available skills or tool description. A valid file on disk does not prove that the runtime found it.
2. **Explicit invocation:** ask to use the named skill; confirm the agent reads the application's copied `SKILL.md`, identifies its application scope and follows a distinctive step relevant to the task.
3. **Task-based selection:** in another fresh session, describe a relevant task *without naming the skill*. Inspect the skill load or tool trace and the resulting work. If selection is absent, use explicit invocation rather than claiming automatic selection.

For Codex, explicitly invoke `$onboarding`, `$api-design` or `$editorial-review`. For clients that support skill slash commands, use `/onboarding`, `/api-design` or `/editorial-review`. Gemini CLI can list discovered skills with `/skills list` and reload after copying with `/skills reload`. Cursor accepts `/skill-name` or `@skill-name` in supported Agent sessions. OpenCode exposes skills through its `skill` tool. GitHub Copilot CLI supports `/skills list` and skill slash commands; other Copilot surfaces differ. Inspect the actual load or tool trace in every case.

These are **manual reviewable templates**; no automatic installation or code execution occurs by copying them. If the agent lacks a skill runtime, give it the relevant SKILL.md text as task instructions, subject to its normal trust and permission boundaries.

## Fallback for any other agent

Use [the agent-neutral start prompt](templates/START-PROMPT.md) as the first instruction in an agent that does not discover repository files. Provide the application's adapted `AGENTS.md` and only the relevant handbook pages **through a supported read tool, attachment or pasted text**.

When file access, skills or shell execution is unavailable, the agent can still review material supplied to it. It must distinguish that limited review from full integration, never claim automatic instruction loading, and not report unexecuted tests as passed. Do not paste private credentials, patient data, or other secrets to supply context.

**Completion evidence:** agent and version, application instruction file actually loaded, handbook commit and chapters actually read, copied skill path and observed activation method (explicit, automatic or manual), changes made, checks executed and limitations. A documentation-only review can verify paths and formats, but it cannot establish every agent's runtime behavior.
