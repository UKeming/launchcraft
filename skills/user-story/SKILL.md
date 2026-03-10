---
name: user-story
description: "Use when converting raw needs, feature ideas, or pain points into structured user stories with acceptance criteria. Triggers on: writing user stories, breaking down requirements, defining acceptance criteria."
---

# User Story Writer

## Overview

Convert raw needs into well-structured user stories through collaborative refinement. Always clarify before generating.

<HARD-GATE>
Do NOT generate user stories until you have:
1. Asked at least one clarifying question about the need
2. Identified persona(s) and presented them to the user
3. Received explicit user confirmation on the persona(s)

All three steps must complete before generating any stories. Jumping straight to stories produces generic, unhelpful output.
</HARD-GATE>

## Input Contract Validation

On start, verify:
- [ ] Scope plan exists at `docs/plans/*-scope-plan.md`
- [ ] Requirements doc exists at `docs/requirements/*.md`

Read the scope plan first — it defines how many stories to write, for which personas, and across which journey stages. The requirements doc provides the detail.

If no scope plan exists, stop and run `/scope-planning` first.

## Process

### 1. Understand the Need

Read the input and identify gaps. Ask **one question at a time**:

- **Who** — Who are the users/personas affected?
- **What** — What exactly is the problem or desired outcome?
- **Why** — Why does this matter? What's the impact?
- **Constraints** — Technical, timeline, or scope constraints?

Prefer multiple choice questions when possible. Stop asking when you have enough to write specific stories.

### 2. Identify Personas

Before writing stories, explicitly list the persona(s):

```
Personas identified:
- [Persona 1]: [Brief description, goals, context]
- [Persona 2]: [Brief description, goals, context]
```

Get user confirmation on personas before proceeding.

### 3. Map the Complete User Journey

Before writing individual stories, map out the full user journey for each persona:

```
[Persona] journey:
1. Discovery → How do they find the product?
2. Onboarding → First-time setup and orientation
3. Core usage → Primary tasks and workflows
4. Edge cases → Error states, empty states, offline behavior
5. Return usage → What brings them back?
6. Administration → Settings, account management, data export
```

Every step in the journey should produce at least one user story. This ensures complete coverage — no orphan features, no missing flows.

### 4. Generate User Stories

**Minimum output:** A mature product requires comprehensive stories. Aim for:
- At least 3-5 stories per persona
- Stories covering: happy path, error handling, edge cases, onboarding, settings
- Every acceptance criterion must be testable and specific

Number stories sequentially starting at 001 within each topic file.

For each story, use this format:

```markdown
## US-[NNN]: [Short Title]

**Priority:** High (must have) | Medium (should have) | Low (nice to have)
**Size:** S (< 1 day) | M (1-3 days) | L (3-5 days, consider splitting)
**Persona:** [Persona name]

> As a [persona], I want [goal/action], so that [benefit/value].

### Acceptance Criteria

- [ ] Given [context], when [action], then [expected result]
- [ ] Given [context], when [action], then [expected result]

### Notes
[Optional: edge cases, technical considerations, dependencies]
```

### 5. Completeness Check

Before presenting to user, verify coverage:
- [ ] Every persona has stories for: onboarding, core usage, error handling, settings
- [ ] Happy paths AND failure paths are covered
- [ ] Empty states are handled (first-time user, no data, no results)
- [ ] Accessibility stories exist (keyboard navigation, screen reader, color contrast)
- [ ] Security-related stories exist (authentication, authorization, data privacy)

If any gaps exist, write the missing stories before presenting.

### 6. Review and Refine

Present all stories organized by persona and journey stage. Ask:
- Are any stories missing?
- Are priorities correct?
- Should any story be split or merged?
- Are there personas we haven't considered?

Iterate until comprehensive.

### 7. Save

Save the final stories to `docs/user-stories/YYYY-MM-DD-[topic].md` in the target project with this file structure:

```markdown
# User Stories: [Topic]

**Date:** YYYY-MM-DD
**Source:** [Where the need came from]
**Status:** Draft | Reviewed | Approved

---

[Stories go here]
```

## Output Validation

After saving, dispatch the **contract-validator** agent to independently verify the output:

```
Agent: contract-validator
Skill: user-story
Output path: [the file you just saved]
```

Do NOT proceed to design-doc until the validator returns PASS. If it returns FAIL, fix the violations and re-validate.
Once the validator returns PASS, **immediately invoke `/design-doc`** — do NOT ask the user whether to continue.

## Rationalization Prevention

If you catch yourself thinking any of these, STOP — you're about to skip a step:

| Thought | Reality |
|---------|---------|
| "The need is clear enough, no questions needed" | You WILL miss edge cases. Ask anyway. |
| "I already know the persona" | Confirm with the user. Your assumption may be wrong. |
| "One big story covers it" | Big stories hide complexity. Split them. |
| "Acceptance criteria are obvious" | If they're obvious, writing Given/When/Then takes 30 seconds. Do it. |
| "The user seems impatient, skip clarifying" | Vague stories waste MORE time downstream. |
| "This is just a small feature" | Small features have personas and acceptance criteria too. |

## Evidence Gate

Before claiming this skill is complete, you must have:
- [ ] Asked at least one clarifying question (show the question and answer)
- [ ] Presented personas and received user confirmation (show the confirmation)
- [ ] Saved the file (show the file path)
- [ ] Dispatched contract-validator and received PASS (show the result)

No evidence = not complete. Period.

## Anti-Patterns

| Bad | Good |
|-----|------|
| "As a user, I want it to work better" | "As a mobile shopper, I want the search bar visible without scrolling, so I can find products quickly" |
| "Should be fast" | "Given a product search, when results load, then first results appear within 200ms" |
| "Fix the bug" | "As a returning customer, I want my cart preserved across sessions, so I don't lose items" |
