# Agent-neutral onboarding prompt

Use this prompt **in a consuming application** when the agent does not reliably load project instructions. Replace the bracketed values before sending it.

> You are working on **[APPLICATION NAME]**.
>
> **Task:** [SPECIFIC CHANGE OR REVIEW]
>
> 1. Read the application's instructions: **[PATH TO APPLICATION AGENTS.md OR ATTACHED TEXT]**. Inspect the code, callers, tests, contracts and architecture decisions relevant to this task.
> 2. The architecture handbook is at **[ACCESSIBLE CHECKOUT PATH OR COMMIT-PINNED URL]**. The intended commit is **[REVIEWED COMMIT SHA]**. Verify the checkout's HEAD or the URL's commit against that revision before relying on it. Then read its `README.md` and only the guide needed for this task. Report a mismatch or inaccessible source.
> 3. State the expected behavior and responsible boundaries. Follow the application's approved requirements, security rules and public contracts. Use the handbook as guidance, not as a required folder structure.
> 4. If a reviewed application-facing skill is available and its trigger fits, use only that focused skill (for example, `api-design` for public HTTP contract choices or `backend-architecture` for server implementation). Confirm the agent actually loaded the copied skill; otherwise follow the relevant handbook pages directly. If implementing, make the smallest complete change and run relevant checks. If reviewing, report actionable findings with file locations; do not edit unless the task allows it.
> 5. Report the instructions and handbook pages actually read, the commit consulted, changes or findings, checks run and remaining limits. Say when files or tools were unavailable. Do not claim an unrun test passed.

If the agent has **no filesystem access**, supply redacted application instructions and relevant code and handbook excerpts. A commit-pinned URL can identify handbook content when the agent has web access. Supplied excerpts alone cannot verify the live repository, its commit or its tests.

For agents without skill discovery, supply the relevant handbook pages as task instructions. You may also provide only the reviewed application skill relevant to the task, such as [API Design](../skills/api-design/SKILL.md) or [Backend Architecture](../skills/backend-architecture/SKILL.md). This does not install the skill or grant permissions.
