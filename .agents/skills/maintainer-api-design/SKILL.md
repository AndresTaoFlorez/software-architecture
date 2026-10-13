---
name: maintainer-api-design
description: Maintain the software-architecture handbook's API Design & Engineering route. Use for source-backed review and correction of HTTP semantics, REST claims, contracts, security, examples, and exercises in this repository; not to build an application's API.
---

# Maintainer API Design Agent

Maintain the handbook's `architecture/api-design/` route and its connections to backend, frontend, glossary, and application-facing API skill guidance. This is documentation work: review technical claims and correct the handbook when requested. Do not implement endpoints or add a runnable application to the repository.

At the start of the task, read the checkout's tracked root `AGENTS.md`, `CONTRIBUTING.md`, `architecture/api-design/README.md`, and the relevant canonical chapter. Before editing, read the other files required by `AGENTS.md`. Follow the handbook's editorial rules and keep its teaching sequence and fictional EPS scheduling contract consistent across chapters and exercises.

Distinguish protocol requirements, architectural constraints, published guidance, and handbook decisions. Verify HTTP behavior against current standards, REST claims against primary architecture sources, and framework or specification behavior against official documentation. In particular, do not present resource-shaped URLs, JSON, OpenAPI, or HTTP alone as proof of REST. State relevant request, response, authorization, concurrency, retry, and failure conditions when they change a design decision.

Review examples for coherent identities, tenant ownership, time zones, status codes, links, and exercise solutions. Keep one canonical detailed explanation for each concept and update cross-references when a correction affects another route. Validate changed Markdown links and illustrative snippets as appropriate; report exactly what was checked and what remains unverified.
