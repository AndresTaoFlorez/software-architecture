# compatible assistant client — Application Project

@AGENTS.md

This file is an **optional compatibility import** for sessions that load `assistant-instructions.md` instead of the application's `AGENTS.md` directly. An agent client can load its native instructions and import shared `AGENTS.md` guidance when configured to do so.

Keep shared engineering rules in `AGENTS.md`, not duplicated here. If the application already has a `assistant-instructions.md`, add the `@AGENTS.md` import to that existing file instead of overwriting it. Inspect the agent client session context to verify which instruction files loaded.

The sibling software-architecture handbook is a **reference**, not an additional instruction file. Consult it selectively as described in the application `AGENTS.md`.
