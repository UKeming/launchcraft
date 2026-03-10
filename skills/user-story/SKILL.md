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

## Input

Accepts any of:
- Raw text describing a need or pain point
- Bullet points from need-discovery skill
- Bug reports or user feedback
- Feature requests

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

### 3. Generate User Stories

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

### 4. Review and Refine

Present all stories to the user. Ask:
- Are any stories missing?
- Are priorities correct?
- Should any story be split or merged?

### 5. Save

Save the final stories to `docs/user-stories/YYYY-MM-DD-[topic].md` in the target project with this file structure:

```markdown
# User Stories: [Topic]

**Date:** YYYY-MM-DD
**Source:** [Where the need came from]
**Status:** Draft | Reviewed | Approved

---

[Stories go here]
```

## Quality Checklist

Every story must have:
- [ ] Specific persona (not "user")
- [ ] Clear, measurable acceptance criteria using Given/When/Then
- [ ] Priority and size estimate
- [ ] No implementation details in the story itself (those go in design docs)

## Anti-Patterns

| Bad | Good |
|-----|------|
| "As a user, I want it to work better" | "As a mobile shopper, I want the search bar visible without scrolling, so I can find products quickly" |
| "Should be fast" | "Given a product search, when results load, then first results appear within 200ms" |
| "Fix the bug" | "As a returning customer, I want my cart preserved across sessions, so I don't lose items" |
