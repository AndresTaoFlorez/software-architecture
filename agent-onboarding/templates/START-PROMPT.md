# Agent-neutral onboarding prompt

Use this prompt **in a consuming application** when the agent does not reliably load project instructions. Replace the bracketed values before sending it.

> You are working on **[APPLICATION NAME]**.
>
> **Task:** [SPECIFIC CHANGE OR REVIEW]
>
> 1. Read the application's instructions: **[PATH TO APPLICATION AGENTS.md OR ATTACHED TEXT]**. Inspect the code, callers, tests, contracts and architecture decisions relevant to this task.
> 2. The architecture handbook is at **[ACCESSIBLE PATH OR URL TO software-architecture]**. The intended commit is **[REVIEWED COMMIT SHA]**. Check the commit actually available, then read its `README.md` and only the guide needed for this task.
> 3. State the expected behavior and responsible boundaries. Follow the application's approved requirements, security rules and public contracts. Use the handbook as guidance, not as a required folder structure.
> 4. If implementing, make the smallest complete change and run relevant checks. If reviewing, report actionable findings with file locations; do not edit unless the task allows it.
> 5. Report the instructions and handbook pages actually read, the commit consulted, changes or findings, checks run and remaining limits. Say when files or tools were unavailable. Do not claim an unrun test passed.

If the agent has **no filesystem access**, supply redacted application instructions and relevant code and handbook excerpts. It can review supplied material, but cannot verify the live repository, its commit or its tests.

For agents without skill discovery, you can also supply the [implementation skill](../skills/architecture-aware-implementation/SKILL.md) or [review skill](../skills/architecture-review/SKILL.md) as task instructions. This does not install the skill or grant permissions.
