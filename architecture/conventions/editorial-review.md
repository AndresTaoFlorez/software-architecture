# Editorial Review Standard

This standard is for **writing and reviewing the software-architecture handbook**. It supplements [Contributing](../../CONTRIBUTING.md) and the repository's [agent instructions](../../AGENTS.md). It does not prescribe the writing style of applications that consume the handbook.

The goal is not shorter text at any cost. A section is good when a programmer can understand the decision, identify its owner, follow the example and recognize when the advice applies.

**Contents**

- [What good writing does](#what-good-writing-does)
- [Diagnose before rewriting](#diagnose-before-rewriting)
- [How to report a finding](#how-to-report-a-finding)
- [Small example](#small-example)
- [Review and correction loop](#review-and-correction-loop)
- [Acceptance questions](#acceptance-questions)

## What good writing does

Explain as an experienced engineer would explain a design to a colleague, but keep the documentation voice **plain, direct and mostly impersonal**.

- Start from a concrete problem. Explain the mechanism, name the concept and show its consequence.
- Prefer familiar words and short, natural sentences. Define necessary technical terms before relying on them.
- State the responsibility or decision explicitly. A reader should not have to infer the point from a long example.
- Use a focused example when it resolves ambiguity. Keep the important edge case, failure or trade-off.
- Distinguish established facts, standards, framework requirements, handbook conventions and recommendations.
- Keep one authoritative explanation per concept. Link it rather than repeating it across chapters.
- Use paragraphs for reasoning; tables for actual comparisons; diagrams for relationships that prose obscures.

Avoid promotional claims, conversational filler, forced analogies, rhetorical questions, stock transitions and summaries that simply restate the preceding section. **Do not erase useful nuance to make prose sound simpler.**

## Diagnose before rewriting

Do not rewrite a passage because it is long, sounds technical or differs from an arbitrary preferred sentence length. Identify a specific problem and its effect on the reader.

| Check | Evidence that a passage needs work | Revision goal |
| --- | --- | --- |
| Clarity | Undefined term, unclear referent, overloaded sentence, ambiguous action or owner | Make the intended meaning explicit |
| Technical accuracy | False equivalence, unsupported absolute claim, misleading example, missing operational condition | Correct the claim; verify against relevant sources |
| Information value | Same explanation repeated nearby, table narrated again, decorative setup with no consequence | Remove repetition without losing a distinct point |
| Learning order | Example or exercise requires a concept not yet introduced or linked | Explain the prerequisite where needed, or move the material |
| Natural voice | Formulaic openings, exaggerated claims, unnecessary second-person coaching, mechanical transitions | Use neutral, specific engineering prose |
| Cross-document consistency | Conflicting names, paths, rules, examples, definitions or navigation | Reconcile with the canonical explanation |

These are **diagnostic checks, not a scoring formula**. A heading, code block or deliberately detailed explanation can be entirely appropriate.

## How to report a finding

For each substantial issue, record enough context to make the correction reviewable:

1. **Location:** file path, heading and a short excerpt or exact line range.
2. **Problem:** which check fails, with evidence rather than an aesthetic judgment.
3. **Impact:** what the reader might misunderstand, miss or unnecessarily reread.
4. **Change:** a precise rewrite, removal, relocation or link to a canonical explanation.
5. **Verification:** confirm that meaning, dependencies, source claims and linked material still agree.

Prioritize **wrong or misleading content**, then **missing prerequisites and ambiguity**, then **duplication and unnatural wording**. Leave well-written passages alone. Avoid mass changes justified only by preference.

## Small example

**Before**

> In order to successfully implement the Repository pattern in a robust and scalable way, it is important to understand that this useful abstraction essentially allows the application to interact with the persistence layer.

**After**

> A Repository gives an application operation a contract for loading or saving domain objects without depending on a specific database.

**Why:** the revision names the capability and the dependency boundary. It removes empty qualifiers, not necessary technical detail.

A precise explanation might then add: *A Repository does not guarantee transaction isolation or make every query a domain operation.* Keep this kind of qualification when it prevents a real design error.

## Review and correction loop

1. **Read the surrounding chapter and linked canonical pages.** Understand the target audience and what the example must teach.
2. **Review pedagogy.** Can a reader state the problem, responsibility, mechanism and consequence? Are prerequisites introduced before use?
3. **Review correctness.** Inspect code, terminology, API contracts, data flow, constraints, trade-offs and primary sources. Do not simplify away essential conditions.
4. **Review expression.** Remove repetition, unhelpful setup, vague language and mechanical phrasing. Preserve meaningful examples.
5. **Apply focused edits.** Prefer improving the existing passage over adding a second explanation.
6. **Re-read the whole affected section.** Check transitions, links, anchors, glossary terms, exercises, diagrams and related chapters.
7. **Validate what changed.** Check relative links and Markdown structure; parse diagrams or code when appropriate and possible. Report tests actually run, not imagined results.
8. **Stop when the text is accurate and understandable.** Additional rewrites without a diagnosable improvement introduce churn.

For repository-wide work, inventory findings first, group them by canonical topic and resolve dependencies before rewriting dependent pages. Review a representative chapter early to confirm that the standard improves readability rather than merely shortening prose. Proceed in manageable, coherent batches with reviewable diffs.

## Acceptance questions

- Can a developer explain the topic's central decision and when it applies?
- Does every paragraph add a distinct fact, mechanism, consequence, example or necessary caveat?
- Are technical claims accurate and supported at the right level of authority?
- Are examples, paths, contracts and names consistent with connected pages?
- Does the text sound like practical engineering documentation rather than a script?
- Are the previous useful details and backward-compatible anchors still present?
- Has the corrected passage been reviewed in context, rather than in isolation?

A **no-change finding** is a valid outcome. Neither a low word count nor a large number of edited files measures editorial quality.
