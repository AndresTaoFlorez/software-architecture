---
name: architecture-review
description: Review a proposed or implemented application change for responsibility ownership, contracts, dependencies, API behavior, security boundaries and test evidence. Use when asked for an architectural review, not for every trivial edit.
---

# Architecture Review

This is a **portable skill template**, not an automatically installed skill. Application-specific instructions and ADRs take precedence; use the handbook for reference, not as a second authority.

## Input

A concrete change request, PR/diff or affected feature. Ask for essential missing context only when review cannot proceed without it.

## Process

1. Read the consuming application's AGENTS.md/CLAUDE.md and relevant ADRs.
2. Inspect relevant code, callers, tests, schemas and contracts; do not infer architecture from folder names.
3. Confirm the handbook checkout's commit, then read its README and only the relevant topic pages. If unavailable, disclose it; if intentionally pinned behind `main`, do not describe it as the latest handbook.
4. Evaluate the actual change:
   - Responsibility and invariant ownership.
   - Supported module interfaces and source dependencies.
   - Request/response contracts, validation and error semantics where applicable.
   - Authentication, authorization, tenant boundaries and data constraints where applicable.
   - Transaction consistency, concurrency and failure handling where applicable.
   - Scope, test coverage and compatibility with existing consumers.
5. Check claims against authoritative standards or current vendor docs when version-sensitive.
6. Run permitted relevant checks, or state precisely why they were not run.
7. Report findings ordered by severity, with exact file locations, impact and focused remedies. Separate verified defects, risks and optional improvements. State which handbook commit was consulted, whether approval is recommended and what remains unverified.

Avoid framework dogma, mandatory abstractions and speculative rewrites. Do not alter files or open PRs unless the task authorizes changes.
