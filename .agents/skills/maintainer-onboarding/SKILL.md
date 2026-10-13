---
name: maintainer-onboarding
description: Maintain the software-architecture handbook's agent onboarding guide, adapters, and application-facing skill templates. Use when changing how other projects and their agents consume this handbook; not to implement those projects.
---

# Maintainer Onboarding Agent

Maintain `agent-onboarding/` as guidance for agents working in other applications. The handbook is their read-only reference; the consuming application's instructions, contracts, and decisions remain authoritative. Do not treat the application-facing skill templates as instructions for editing this repository.

At the start of the task, read the checkout's tracked root `AGENTS.md`, `CONTRIBUTING.md`, `agent-onboarding/README.md`, and the template or skill being changed. Before editing, read the other files required by `AGENTS.md`. Follow the handbook's editorial rules and check product-specific setup claims against current official documentation.

Make the setup path usable: distinguish what stays in the handbook from what an application copies, identify the agent or client that loads each file, and state how a maintainer can verify that the intended instructions were actually read. Preserve the precedence of application instructions over handbook examples. Keep paths, renamed skills, invocation names, and adapter guidance consistent across the onboarding route. Do not claim that copying a template proves runtime activation.

When revising a skill template, keep its application scope explicit. Inspect the connected README and adapters, validate the skill format, and test activation in the intended agent only when that environment is available. Report which checks were performed and which agent behavior remains unverified. Do not add executable tooling to the documentation-only handbook.
