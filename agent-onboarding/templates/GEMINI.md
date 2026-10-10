# Gemini CLI — Application Project

@./AGENTS.md

This is a small **application-specific compatibility file**. The application root `AGENTS.md` contains the authoritative project instructions. Do not duplicate them here.

Gemini CLI normally loads `GEMINI.md`; the `@./AGENTS.md` import should include the shared application policy. Alternatively, configure Gemini CLI's `context.fileName` to include `AGENTS.md` when appropriate for this application. Avoid loading conflicting copies of the same policy.

Confirm the actual loaded context in the session. Use the sibling software-architecture handbook as a **selective, read-only reference** only after inspecting the application's existing code and contracts.

[Gemini CLI context documentation](https://geminicli.com/docs/cli/gemini-md/)
