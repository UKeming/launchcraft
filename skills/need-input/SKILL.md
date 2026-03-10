---
name: need-input
description: "Use when starting a new product or feature from scratch. Triggers on: new product idea, feature request, requirement gathering, need analysis, market research input."
---

# Need Input & Analysis

## Overview

Capture, structure, and deeply analyze raw requirements before they enter the pipeline. A vague idea in = vague product out. This skill ensures the input is rich enough to produce a mature product.

<HARD-GATE>
Before passing requirements downstream:
1. Capture the raw need in the user's own words
2. Conduct a deep-dive analysis (target users, market context, competitive landscape, core value prop)
3. Define success criteria — what does "done" look like?
4. Get explicit user sign-off on the structured requirements

Do NOT hand off a one-liner to user-story. Shallow input = shallow product.
</HARD-GATE>

## Input

Accepts any of:
- A product idea ("I want to build X")
- A problem statement ("Users struggle with Y")
- Pasted user feedback, support tickets, forum posts
- Competitor analysis or market observations
- A combination of the above

## Process

### 1. Capture Raw Need

Record exactly what the user said. Then ask probing questions **one at a time**:

**Product vision:**
- What problem does this solve? For whom?
- Why now? What's changed that makes this needed?
- What existing solutions do people use? Why aren't they good enough?

**Scope:**
- What's the MVP — the smallest thing that delivers value?
- What's explicitly OUT of scope for v1?
- What's the dream v2 if v1 succeeds?

**Users:**
- Who are the primary users? Secondary users?
- What's their current workflow without this product?
- What would make them switch to this product?

**Success:**
- How do you measure success? (users, revenue, engagement, other?)
- What's the minimum bar for "this was worth building"?

### 2. Competitive Analysis

Research and present:

```markdown
## Competitive Landscape

| Competitor | Strengths | Weaknesses | Our Differentiation |
|-----------|-----------|------------|---------------------|
| [name] | [what they do well] | [gaps] | [how we're different] |
```

Identify at least 3 competitors or alternative solutions (including "do nothing" or manual workarounds).

### 3. Structure Requirements

Organize findings into a requirements document:

```markdown
# Requirements: [Product Name]

**Date:** YYYY-MM-DD
**Status:** Draft | Reviewed | Approved

## Problem Statement
[2-3 sentences: who has what problem, why it matters]

## Target Users
- **Primary:** [persona, context, motivation]
- **Secondary:** [persona, context, motivation]

## Core Value Proposition
[One sentence: what this product does better than alternatives]

## Functional Requirements
### Must Have (v1)
- [requirement with enough detail to write user stories from]
- [requirement]

### Should Have (v1 if time allows)
- [requirement]

### Nice to Have (v2)
- [requirement]

## Non-Functional Requirements
- **Performance:** [response times, load expectations]
- **Security:** [auth, data protection needs]
- **Accessibility:** [standards to meet]
- **Platform:** [web, mobile, desktop, API]

## Competitive Landscape
[table from step 2]

## Success Criteria
- [measurable criterion]
- [measurable criterion]

## Out of Scope
- [explicit exclusion and why]

## Open Questions
- [unresolved question that needs answering before design]
```

### 4. Review and Refine

Present the structured requirements. Ask:
- Is anything missing from the must-haves?
- Are the success criteria realistic and measurable?
- Any open questions we should resolve now?

Iterate until the user approves.

### 5. Save

Save to `docs/requirements/YYYY-MM-DD-[product-name]-requirements.md`.

## Output Validation

After saving, dispatch the **contract-validator** agent to independently verify the output:

```
Agent: contract-validator
Skill: need-input
Output path: [the file you just saved]
```

Do NOT proceed to user-story until the validator returns PASS.

## Rationalization Prevention

| Thought | Reality |
|---------|---------|
| "The user already knows what they want" | They know the WHAT, not the WHY or the boundaries. Dig deeper. |
| "Competitive analysis is overkill" | Building without knowing alternatives = building something nobody needs. |
| "MVP is obvious" | If it's obvious, writing it down takes 2 minutes. Do it. |
| "Non-functional requirements can wait" | Performance and security designed late = rewrite later. |
| "Let's just start coding" | Requirements → stories → design → tests → code. No shortcuts. |
| "One user type is enough" | Even simple apps have multiple user types (admin, end user, visitor). |

## Evidence Gate

Before claiming this skill is complete, you must have:
- [ ] Captured the raw need verbatim (show it)
- [ ] Asked at least 3 probing questions and received answers (show Q&A)
- [ ] Presented competitive analysis with 3+ entries (show table)
- [ ] Structured requirements with Must/Should/Nice-to-Have tiers (show document)
- [ ] Defined measurable success criteria (show them)
- [ ] Received user sign-off (show confirmation)
- [ ] Saved the file (show path)
- [ ] Dispatched contract-validator and received PASS (show result)

No evidence = not complete. Period.

## Anti-Patterns

| Bad | Good |
|-----|------|
| "Build a todo app" | "Build a todo app for teams of 5-10, focused on daily standups, differentiating from Todoist by X" |
| "Users want it faster" | "Page load > 3s causes 40% bounce rate. Target: < 1s for core actions." |
| "No competitors" | "Competitors: [X], [Y], manual spreadsheets. Our edge: [Z]" |
| Skipping v2 thinking | "v1: core CRUD. v2: collaboration + API. Designed so v2 doesn't require rewrite." |
