# compatible assistant client — Application Project

@AGENTS.md

This file is an **optional compatibility import** for sessions that load `assistant-instructions.md` instead of the application's `AGENTS.md` directly. Modern compatible assistant client can also read `AGENTS.md` when no project `assistant-instructions.md` takes precedence.

Keep shared engineering rules in `AGENTS.md`, not duplicated here. If the application already has a `assistant-instructions.md`, add the `@AGENTS.md` import to that existing file instead of overwriting it. Inspect the agent client session context to verify which instruction files loaded.

The sibling software-architecture handbook is a **reference**, not an additional instruction file. Consult it selectively as described in the application `AGENTS.md`.
