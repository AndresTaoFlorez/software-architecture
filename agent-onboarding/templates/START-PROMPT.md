# Agent-neutral onboarding prompt

Use this prompt **in a consuming application**, for a coding agent without reliable project-instruction discovery. Replace the paths and task before sending it.

> You are working on **[APPLICATION NAME]**, not on the software-architecture handbook.
>
> **Task:** [SPECIFIC CHANGE OR REVIEW]
>
> First read the application's actual instructions at **[PATH TO APPLICATION AGENTS.md OR PROVIDED CONTENT]** and inspect the existing code, callers, tests, contracts and ADRs relevant to this task.
>
> The architecture reference is **[PATH OR REVIEWED COMMIT OF software-architecture]**. Consult its `README.md` and only the relevant chapter. Record the commit actually read. The handbook contains examples and trade-offs, not mandatory implementation decisions.
>
> Preserve the application's approved requirements, security constraints and public contracts. Apply authoritative standards where relevant. Do not copy framework or folder conventions mechanically. Choose a change proportional to the observed problem.
>
> Before implementation or review, state the expected behavior and the responsible boundaries. For implementation, make the smallest correct changes and run permitted, relevant checks. For review, report actionable issues with precise locations and avoid changing files unless authorized.
>
> Report what instructions and handbook pages you actually read, which files changed, which tests ran, their results and limitations. If you cannot access files or execute tools, say so. Do not invent successful checks or claim automatic skill discovery.

If the agent has **no filesystem access**, supply a redacted copy of the application's instructions and relevant code/handbook excerpts as attachments or text. It can analyze that supplied material, but cannot verify the live repository or run tests on it.

Optional: provide the [implementation skill](../skills/architecture-aware-implementation/SKILL.md) or [review skill](../skills/architecture-review/SKILL.md) to agents without native `SKILL.md` discovery. Supplying the skill's text does not install it or grant extra tool permissions.
