# Using This Handbook With Coding Agents

This handbook is a **read-only architecture reference for an application agent**, regardless of its vendor. The application's own requirements, security constraints, accepted contracts and ADRs remain authoritative. [Root AGENTS.md](../AGENTS.md) and [CONTRIBUTING.md](../CONTRIBUTING.md) govern contributions **to this handbook**, not applications consuming it.

**Contents**

- [Agent-neutral setup](#agent-neutral-setup)
- [Agent-specific connections](#agent-specific-connections)
- [Use a known handbook revision](#use-a-known-handbook-revision)
- [Select the relevant material](#select-the-relevant-material)
- [Install and test optional skills](#install-and-test-optional-skills)
- [Fallback for any other agent](#fallback-for-any-other-agent)

## Agent-neutral setup

1. Place the application and an accessible handbook checkout next to each other. The handbook is not a code dependency.
2. Adapt [the application AGENTS.md template](templates/AGENTS.md) in the **application root**: fill in the actual project decisions, commands and handbook path. It is the shared **content** of the engineering policy, even when a tool loads it through another mechanism.
3. Choose either a pinned handbook commit or a reviewed `main` checkout. Record the exact revision used.
4. Configure your agent to load the **application** instructions. Check that it can read the sibling handbook, then ask it to consult only the relevant guide for its task.
5. Verify its behavior and the application's actual tests. Neither a present instruction file nor a copied skill proves that the agent used it.

Example workspace:

```text
workspace/
  support-platform/
    AGENTS.md
    src/
  software-architecture/
    README.md
    architecture/
    agent-onboarding/
```

From the application root, if the sibling handbook does not exist:

```sh
git clone https://github.com/AndresTaoFlorez/software-architecture.git ../software-architecture
```

Access to sibling folders may require workspace permission. Do not claim to have read files the agent cannot access.

## Agent-specific connections

There is **no universal instruction loader**. Use the same engineering policy and select a small adapter for the agent actually running.

| Agent or environment | Application instructions | Optional skills | Check |
| --- | --- | --- | --- |
| **Codex** | Root `AGENTS.md` | `.agents/skills/<name>/SKILL.md` | Confirm project instructions and invoke or inspect the selected skill |
| **Claude Code** | Direct `AGENTS.md` when supported, or a project `CLAUDE.md` importing it | `.claude/skills/<name>/SKILL.md` | Use `/context`; confirm imports and skill discovery |
| **Gemini CLI** | `GEMINI.md` importing the application's `AGENTS.md`, or a configured context filename | `.agents/skills/<name>/SKILL.md` or `.gemini/skills/<name>/SKILL.md` | Inspect loaded context and run `/skills list` |
| **Cursor** | Root `AGENTS.md`; project rules are another supported mechanism | Agent/version-specific; use manual skill loading when uncertain | Inspect active rules; do not assume SKILL.md discovery |
| **OpenCode** | Root `AGENTS.md` | `.agents/skills/<name>/SKILL.md` or `.opencode/skills/<name>/SKILL.md` | Confirm the agent's loaded rules and skill availability |
| **GitHub Copilot** | `AGENTS.md` in supported agent modes; `.github/copilot-instructions.md` for repository-wide chat instructions | `.agents/skills/<name>/SKILL.md` in supported environments | Verify which Copilot surface and instruction files were loaded |
| **Other coding agents** | Use the agent's supported project-instruction feature, or the [manual start prompt](templates/START-PROMPT.md) | If it understands Agent Skills, install as documented; otherwise give it the relevant skill content directly | Observe which sources it actually reads and which tests it runs |

**Adapter templates:** [Claude Code](templates/CLAUDE.md), [Gemini CLI](templates/GEMINI.md), and [GitHub Copilot](templates/copilot-instructions.md). Adapt rather than overwrite any existing provider instructions. Do not copy all adapter files into every application.

Claude Code's direct AGENTS.md loading depends on version and project instruction precedence; consult [Claude Code memory](https://code.claude.com/docs/en/memory) and check `/context`. For Codex see [instructions](https://developers.openai.com/codex/guides/agents-md) and [skills](https://developers.openai.com/codex/skills). For other supported products see [Gemini context](https://geminicli.com/docs/cli/gemini-md/) and [skills](https://geminicli.com/docs/cli/skills/), [Cursor rules](https://docs.cursor.com/context/rules-for-ai), [OpenCode rules](https://opencode.ai/docs/rules/) and [skills](https://opencode.ai/docs/skills/), and [Copilot instruction support](https://docs.github.com/en/copilot/reference/custom-instructions-support).

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

A pinned HEAD may intentionally differ from `origin/main`. To advance a clean checkout tracking `main`, inspect its changes first, then fast-forward; do not replace other agents' branches or uncommitted work.

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

The skill definitions follow the [Agent Skills specification](https://agentskills.io/specification):

- [Architecture-aware Implementation](skills/architecture-aware-implementation/SKILL.md): implement a bounded feature or refactor without losing existing contracts.
- [Architecture Review](skills/architecture-review/SKILL.md): review a concrete change and report actionable findings without editing it.

Copy a reviewed skill directory to the **consuming application**, using the supported path from the table. The copies are independent and need updating if the source skill changes. Do not install them at the handbook root: that would confuse documentation-maintenance agents with application-development agents.

In a **new session**, perform two different checks:

1. **Explicit invocation:** ask to use the named skill; confirm the agent loads the application's copied `SKILL.md` and follows it.
2. **Task-based discovery:** describe a relevant task *without naming the skill*; check whether the agent discovers and uses it. If not, rely on explicit invocation rather than claiming automatic selection.

For Codex, explicitly invoke `$architecture-aware-implementation` or `$architecture-review`. For Claude Code, use `/architecture-aware-implementation` or `/architecture-review`. Gemini CLI can list available skills with `/skills list`. Other agents may use different commands or require explicit file references.

These are **manual reviewable templates**; no automatic installation or code execution occurs by copying them. If the agent lacks a skill runtime, give it the relevant SKILL.md text as task instructions, subject to its normal trust and permission boundaries.

## Fallback for any other agent

Use [the agent-neutral start prompt](templates/START-PROMPT.md) as the first instruction in an agent that does not discover repository files. Provide the application's adapted `AGENTS.md` and only the relevant handbook pages **through a supported read tool, attachment or pasted text**.

When file access, skills or shell execution is unavailable, the agent can still review material supplied to it. It must distinguish that limited review from full integration, never claim automatic instruction loading, and not report unexecuted tests as passed. Do not paste private credentials, patient data, or other secrets to supply context.

**Completion evidence:** agent and version, application instruction file actually loaded, handbook commit and chapters actually read, skill activation method (explicit, automatic or manual), changes made, checks executed and limitations. A documentation-only review can verify paths and formats, but it cannot establish every agent's runtime behavior.
