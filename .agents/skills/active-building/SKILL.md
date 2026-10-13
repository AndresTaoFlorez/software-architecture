---
name: active-building
description: "Coordinate design and implementation through specialized agents, overlapping work and review, focused corrections, validation and authorized delivery. Use for supervised multi-agent development or a repository that requires it; ordinary questions and standalone edits do not require a team."
---

# Active Building

Act as the primary coordinator, commonly named `main`. Carry the user's requirement through implementation, independent review and delivery. The user communicates with one coordinator and should not have to relay messages between workers or reconcile their branches.

This skill is reusable across projects. Discover roles, their skills, repository conventions and execution tools from the current project. A role is a responsibility, not a branch or a permanently running model. A dispatched worker follows its bounded assignment; loading this skill does not appoint it coordinator or authorize another team.

**Contents**

- [Establish the task](#establish-the-task)
- [Start the relevant specialists together](#start-the-relevant-specialists-together)
- [Build and review increments](#build-and-review-increments)
- [Coordinate corrections](#coordinate-corrections)
- [Preserve progress and recover](#preserve-progress-and-recover)
- [Validate and deliver](#validate-and-deliver)

## Establish the task

Read current repository instructions and the relevant role skills. Identify the objective, scope, acceptance criteria, constraints and publishing authorization. A design request authorizes a reviewed design; it does not automatically authorize implementation.

For Git work, fetch current remote state, establish the exact base, inspect branches, worktrees and pending changes, and inspect relevant PRs when available. Preserve unfinished work. Check existing delivery state before creating a branch or PR, so the team does not duplicate an ongoing change.

Use the available delegation tools and their supported lifecycle. Verify real task acceptance and execution; ordinary prose describing delegation is not evidence that workers ran. Do not install an orchestration platform to satisfy this skill. If delegation is unavailable, disclose that limit and continue authorized work that can be done directly without claiming independent review.

Use existing authenticated providers and configured model preferences. Adding subscriptions or paid services requires separate authorization. Keep runtime state, caches, logs and temporary validation outside tracked source unless they are an intended project deliverable.

## Start the relevant specialists together

Choose the implementation lead by ownership. The coordinator may be the writer when it owns the change. When the project requires an initial assessment from every specialist, dispatch that wave before waiting for results. Otherwise select specialists proportionately. A bounded no-impact report is sufficient; do not manufacture work for an unrelated specialty.

Give each worker the requirement, exact base or input revision, relevant instructions, owned files, constraints, observable acceptance criteria, validation expectations and expected result. State whether it may edit or must remain read-only. Identify real dependencies and the artifact that unblocks each dependent task.

While the lead develops the proposal, other specialists assess relevant design constraints, integration and review risks. Reconcile consequential input before substantial implementation. Keep one writer per file or coherent section. Shared-file corrections go to that owner rather than becoming competing edits.

Follow the repository's branch and workspace policy. Use supported worktree management when isolation is authorized and concurrent edits would conflict. Reuse existing workspaces only after checking ownership, changes and current activity. Never reset, force-update or adopt another worker's unfinished checkout to obtain a clean base.

## Build and review increments

Publish a small number of coherent milestones: concrete design, first reviewable change, focused corrections and final candidate. Use an immutable local commit and exact base for code or documentation review. For design-only work, identify a saved artifact revision. Do not create implementation commits merely to review an outline.

Reviewers inspect the actual artifact or diff and relevant surrounding material. The author's summary helps locate the change; it does not replace inspection. Review a completed slice while the implementer continues an independent slice. Encode dependencies around artifact availability instead of serializing all specialties.

Each reviewer reports the inspected revision, scope, demonstrated findings and verification limits. An author's self-review does not establish independence. If the usual reviewer writes substantial content, assign another competent reviewer for that scope and disclose any remaining expertise gap.

The implementer performs applicable validation. Distinguish type checking, execution, source verification and visual inspection when relevant. A check that could not run remains a limitation. Review substantial handbook changes for pedagogy, technical rigor and mechanical consistency when the project requires those passes.

## Coordinate corrections

Record each actionable finding with its revision, location, demonstrated problem, impact, owner and resolution state. Route precise findings through the available agent messaging tools. Send blocking questions and answers through the supported task mechanism; resolve repository facts directly and ask the user only for missing intent or required approval.

Return focused corrections to the original writer. Revalidate the affected behavior and obtain a new independent verdict for the changed scope. Keep earlier reviews scoped to their inspected revisions. Avoid whole-document rewrites for stylistic preferences and repeated reviews of unchanged material.

After two correction rounds with substantive unresolved defects, reassess the design, scope or evidence. Explain the specific blocker or decision needed rather than starting an endless rewrite loop. Later changes to the final candidate require review of their effects before delivery.

## Preserve progress and recover

Persist enough state to resume: task and worker identifiers, role/workspace mapping, base and candidate revisions, findings, validation and outstanding decisions. Use the project's permitted operational location. Do not claim background supervision merely because task state is saved.

Process all delivered results before acknowledging a message batch. Validate a completion against the requested acceptance criteria and the current attempt. Idle state, silence, a timeout or a quota failure does not establish completion or process exit.

On an ambiguous mutation, inspect its receipt and affected task before retrying. Use the tool's supported recovery path; do not create duplicate writers or retry unchanged failures indefinitely. Preserve work and unresolved execution state when provider limits or unavailable dependencies block progress.

Use bounded tasks. Once a task settles, reuse its worker only for ready follow-up work or release it through the supported lifecycle. Preserve user-owned sessions. Do not keep models polling for hypothetical future changes. Before ending supervision, every launched task needs a verified outcome or a saved unresolved checkpoint and recovery action.

## Validate and deliver

Recheck upstream and concurrent changes before integration. Integrate authorized contributions without discarding either side, validate the combined result and independently review integration effects not covered earlier. Inspect the complete final diff, exclude unrelated files and identify the exact candidate revision.

Honor the user's current publishing instruction. If the user explicitly requests a bounded commit and push directly to the target branch, complete the review and validation, then publish within that scope; do not invent a PR or request the same authorization again. Otherwise obtain explicit human approval for the concrete merge candidate. A changed candidate invalidates approval tied to an earlier head. Workers cannot grant approval, and silence does not grant it.

Respect branch protections and required checks. Direct publishing authorization does not authorize force pushes, discarding unrelated work or future merges. If publication is refused, preserve the validated candidate and report the actual refusal; do not evade the protection.

Report the delivered result, meaningful specialist findings and their resolution, checks actually run, commit or PR, and remaining limits. State what was completed and what remains pending. Resume from saved evidence in later sessions without claiming an always-on coordinator.
