# User Story Skill Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create the `user-story` skill for the LaunchCraft Claude Code plugin, which generates structured user stories from discovered needs or manual input.

**Architecture:** A SKILL.md file that guides Claude through a collaborative process — accepting raw needs (text, bullet points, or output from need-discovery skill), asking clarifying questions, and producing well-structured user stories with acceptance criteria. The skill outputs stories to `docs/user-stories/` in the target project.

**Tech Stack:** Claude Code plugin system (SKILL.md format with YAML frontmatter)

---

### Task 1: Scaffold LaunchCraft Plugin Structure

**Files:**
- Create: `.claude-plugin/plugin.json`

**Step 1: Create plugin manifest**

```json
{
  "name": "launchcraft",
  "description": "End-to-end product development pipeline: need discovery, user stories, design, TDD, implementation, testing, and launch",
  "version": "0.1.0",
  "author": {
    "name": "UKeming"
  },
  "homepage": "https://github.com/UKeming/launchcraft",
  "repository": "https://github.com/UKeming/launchcraft",
  "license": "MIT",
  "keywords": ["pipeline", "product-development", "skills", "launch", "tdd"]
}
```

**Step 2: Verify directory structure**

Run: `ls -la .claude-plugin/`
Expected: `plugin.json` exists

**Step 3: Commit**

```bash
git add .claude-plugin/plugin.json
git commit -m "feat: scaffold LaunchCraft plugin manifest"
```

---

### Task 2: Write User Story Skill - Failing Test

**Files:**
- Create: `tests/user-story/test-prompt.md`

**Step 1: Write a test prompt that exercises the skill**

Create a test scenario document that describes what the skill should do when given a raw need. This serves as our "failing test" — we run it without the skill and document what goes wrong.

```markdown
# User Story Skill Test

## Input
Raw need: "Users complain they can't find the search bar on mobile devices"

## Expected Behavior
1. Skill asks clarifying questions (who are the users? what devices? what's the current search UX?)
2. Generates user stories in standard format: "As a [persona], I want [goal], so that [benefit]"
3. Each story has acceptance criteria
4. Stories are saved to `docs/user-stories/` in markdown
5. Stories are sized (small/medium/large) with priority

## Must NOT
- Generate stories without asking at least one clarifying question
- Produce vague acceptance criteria like "it should work well"
- Skip persona identification
```

**Step 2: Run baseline without skill**

Run: Start a Claude Code session, paste the raw need, and observe that without the skill, Claude produces unstructured or inconsistent output. Document the gaps.

**Step 3: Commit**

```bash
git add tests/user-story/test-prompt.md
git commit -m "test: add user-story skill test prompt"
```

---

### Task 3: Write the User Story SKILL.md

**Files:**
- Create: `skills/user-story/SKILL.md`

**Step 1: Write the skill file**

```markdown
---
name: user-story
description: "Use when converting raw needs, feature ideas, or pain points into structured user stories with acceptance criteria. Triggers on: writing user stories, breaking down requirements, defining acceptance criteria."
---

# User Story Writer

## Overview

Convert raw needs into well-structured user stories through collaborative refinement. Always clarify before generating.

<HARD-GATE>
Do NOT generate user stories until you have asked at least one clarifying question and confirmed the target persona(s). Jumping straight to stories produces generic, unhelpful output.
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

For each story, use this format:

```markdown
## US-[NNN]: [Short Title]

**Priority:** High | Medium | Low
**Size:** S | M | L
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

Save the final stories to `docs/user-stories/YYYY-MM-DD-[topic].md` in the target project.

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
```

**Step 2: Verify file structure**

Run: `head -5 skills/user-story/SKILL.md`
Expected: YAML frontmatter with name and description

**Step 3: Commit**

```bash
git add skills/user-story/SKILL.md
git commit -m "feat: add user-story skill"
```

---

### Task 4: Test the Skill

**Files:**
- Modify: `tests/user-story/test-prompt.md` (add results)

**Step 1: Run the test prompt with the skill loaded**

Start a new Claude Code session with the LaunchCraft plugin loaded. Use the test prompt from Task 2. Verify:

1. Skill asks clarifying questions before generating stories
2. Stories follow the exact format (persona, priority, size, acceptance criteria)
3. Acceptance criteria use Given/When/Then
4. Stories are saved to the correct path
5. No vague language

**Step 2: Document test results**

Add a results section to `tests/user-story/test-prompt.md` with pass/fail for each criterion.

**Step 3: Fix any issues found**

If the skill doesn't meet criteria, update `skills/user-story/SKILL.md` and re-test.

**Step 4: Commit**

```bash
git add -A
git commit -m "test: verify user-story skill and document results"
```

---

### Task 5: Push and Verify

**Step 1: Push all changes**

Run: `git push`

**Step 2: Verify repo structure**

Run: `git ls-files`
Expected:
```
.claude-plugin/plugin.json
.gitignore
docs/plans/2026-03-09-launchcraft-design.md
docs/plans/2026-03-09-user-story-skill.md
skills/user-story/SKILL.md
tests/user-story/test-prompt.md
```
