---
name: user-story
description: "Use when converting raw needs, feature ideas, or pain points into structured user stories with acceptance criteria. Triggers on: writing user stories, breaking down requirements, defining acceptance criteria."
---

# User Story Writer

<PIPELINE-AUTO-RUN>
**MANDATORY: Do NOT ask user questions. Do NOT wait for approval. Do NOT stop after saving.**
Complete the analysis → save individual story files + index → dispatch contract-validator → on PASS immediately invoke `/design-doc`.
Skip ALL user review steps. This is a continuous pipeline — you do NOT stop between stages.
**ALL .md files → `.launchcraft/` directory. NEVER save to `docs/` or project root.**
**ALL questions to user → `AskUserQuestion` tool. NEVER output questions as plain text.**
</PIPELINE-AUTO-RUN>

<CRITICAL-OUTPUT-RULES>
## OUTPUT FORMAT & PARALLELIZATION — READ THIS FIRST

**Each user story is saved as a SEPARATE .md file.** The output of this skill is NOT one big file. It is:
- N individual story files: `.launchcraft/[domain]/stories/US-NNN-[slug].md`
- 1 index file: `.launchcraft/user-stories-index.md`

**PARALLELIZATION:** After determining domains and assigning features + US-NNN ranges to each:
1. Dispatch one **`user-story-writer`** sub-agent per domain (all in parallel, `run_in_background: true` except last)
2. Each sub-agent writes its domain's story files and commits
3. After all complete → merge branches → build global index + coverage matrix

```
Agent(subagent_type="user-story-writer") per domain:
  - prompt: "Domain: auth, US range: US-001 to US-010, Features: F-001, F-002..."
  - run_in_background: true
```

**If only 1 domain:** write stories directly, no sub-agent overhead.
</CRITICAL-OUTPUT-RULES>

## Overview

Convert enhanced requirements into comprehensive, traceable user stories. Every feature in the requirements doc MUST map to at least one story. No feature left behind.

## Input Contract Validation

On start, verify:
- [ ] Requirements doc exists at `.launchcraft/requirements/*.md`
- [ ] Research report exists at `.launchcraft/research/*.md`
- [ ] Differentiation strategy exists at `.launchcraft/strategy/*-differentiation.md`
- [ ] Enhancement record exists at `.launchcraft/enhanced/*.md`

Read ALL upstream docs. The requirements doc (with enhanced features) is the primary source. The differentiation strategy informs priority. The research report provides user context.

**Story count is driven by the requirements — not by a formula or cap.** Every Must-Have and Should-Have feature needs at least one story. Nice-to-Have features get stories too. The goal is COMPLETE coverage.

## Process

### 1. Extract Feature Inventory

**This is the critical step that guarantees completeness.**

Read the requirements doc and extract EVERY feature into a numbered checklist:

```markdown
## Feature Inventory (from requirements)

### Must-Have Features
- [ ] F-001: [feature name from requirements]
- [ ] F-002: [feature name]
- [ ] F-003: [feature name]
...

### Should-Have Features
- [ ] F-0XX: [feature name]
...

### Nice-to-Have Features
- [ ] F-0XX: [feature name]
...

**Total features:** [N]
```

This inventory is your tracking sheet. Every feature MUST get checked off by mapping to at least one US-NNN before you're done.

### 2. Identify Personas

Extract personas from the requirements doc's Target Users section. In pipeline context, these are already defined — do NOT re-ask the user.

```
Personas identified (from requirements):
- [Persona 1]: [description from requirements]
- [Persona 2]: [description from requirements]
```

If the requirements doc doesn't define personas clearly, infer from the target users and feature set.

### 3. Map User Journeys

For each persona, map the full journey:

```
[Persona] journey:
1. Discovery → How do they find the product?
2. Onboarding → First-time setup and orientation
3. Core usage → Primary tasks and workflows
4. Edge cases → Error states, empty states, offline behavior
5. Return usage → What brings them back?
6. Administration → Settings, account management, data export
```

### 4. Generate & Save Stories (Write Each File Immediately)

Walk through the feature inventory by domain. For each domain, create the folder, then write and **immediately save** each story file.

**Workflow per domain:**

```
1. mkdir -p .launchcraft/[domain]/stories/
2. For each story in this domain:
   a. Compose the story content
   b. Write it to .launchcraft/[domain]/stories/US-NNN-[slug].md (using the Write tool)
   c. Move to next story
```

**Each story file format:**

```markdown
---
id: US-NNN
title: [Short Title]
priority: High | Medium | Low
size: S | M | L
persona: [Persona name]
features: [F-001, F-002]
domain: [domain name]
---

# US-NNN: [Short Title]

> As a [persona], I want [goal/action], so that [benefit/value].

## Acceptance Criteria

- [ ] Given [context], when [action], then [expected result]
- [ ] Given [context], when [action], then [expected result]

## Notes
[Optional: edge cases, technical considerations, dependencies]
```

**Rules:**
- Every story MUST reference which F-NNN feature(s) it covers
- Complex features (L-sized) should be split into multiple stories
- Cover happy path, error path, and edge cases
- Every acceptance criterion must be testable and specific
- Number stories sequentially starting at US-001
- **SAVE EACH FILE IMMEDIATELY** — do not batch all stories and save at the end

### 5. Feature Coverage Matrix

**This is the verification step. Do NOT skip it.**

After writing all stories, build a coverage matrix that maps every feature to its stories:

```markdown
## Feature Coverage Matrix

| Feature ID | Feature Name | Tier | Stories | Covered? |
|-----------|-------------|------|---------|----------|
| F-001 | User registration | Must | US-003, US-004 | YES |
| F-002 | OAuth login | Must | US-005 | YES |
| F-003 | Dashboard | Must | US-010, US-011, US-012 | YES |
| F-004 | Export to CSV | Should | — | **NO** |
| ... | ... | ... | ... | ... |

### Coverage Summary
- **Must-Have:** [X]/[Y] covered ([Z]%)
- **Should-Have:** [X]/[Y] covered ([Z]%)
- **Nice-to-Have:** [X]/[Y] covered ([Z]%)
- **Total:** [X]/[Y] covered ([Z]%)
```

**HARD RULE: Must-Have and Should-Have coverage must be 100%.** If any Must-Have or Should-Have feature shows "NO", write the missing stories NOW before proceeding. Nice-to-Have should be 90%+.

### 6. Journey Coverage Check

After the feature matrix passes, verify journey coverage:
- [ ] Every persona has stories for: discovery, onboarding, core usage, edge cases, return usage, administration
- [ ] Happy paths AND failure paths are covered
- [ ] Empty states are handled (first-time user, no data, no results)
- [ ] Security-related stories exist (authentication, authorization, data privacy)

If any gaps exist, write the missing stories and update the coverage matrix.

### 7. Save Global Index

All individual story files were already saved in Step 4. Now save the global index to `.launchcraft/user-stories-index.md`:

```markdown
# User Stories Index

**Date:** YYYY-MM-DD
**Source:** [requirements doc path]
**Status:** Draft | Reviewed | Approved
**Total Stories:** [N]
**Feature Coverage:** [X]/[Y] ([Z]%)

---

## Feature Inventory

[Feature inventory from Step 1]

---

## Domain Listing

| Domain | Folder | Stories | Count |
|--------|--------|---------|-------|
| Auth | .launchcraft/auth/stories/ | US-001, US-002, ... | [N] |
| Dashboard | .launchcraft/dashboard/stories/ | US-010, US-011, ... | [N] |
| ... | ... | ... | ... |

---

## Feature Coverage Matrix

[Coverage matrix from Step 5]
```

## Output Validation

After saving, dispatch the **contract-validator** agent to independently verify the output:

```
Agent: contract-validator
Skill: user-story
Output path: .launchcraft/user-stories-index.md + .launchcraft/*/stories/US-*.md
```

Do NOT proceed to design-doc until the validator returns PASS. If it returns FAIL, fix the violations and re-validate.
Once the validator returns PASS, **immediately invoke `/design-doc`** — do NOT ask the user whether to continue.

## Rationalization Prevention

| Thought | Reality |
|---------|---------|
| "50 features is too many stories" | 50 features = 50+ stories. That's the point. Write them all. |
| "Some features are too small for a story" | If it's in the requirements, it gets a story. Even "dark mode toggle" has acceptance criteria. |
| "I'll group several features into one story" | One story per feature minimum. Grouping hides gaps. |
| "The coverage matrix is overkill" | The coverage matrix IS the guarantee. Without it, features get silently dropped. |
| "Nice-to-Have features don't need stories" | They do. They're in the requirements for a reason. Write them. |
| "Error paths are obvious" | Then writing Given/When/Then for them takes 10 seconds. Do it. |
| "I need to ask the user more questions" | Upstream docs answered everything. Requirements + research + differentiation + enhance = complete context. |
| "I'll save all stories in one big file" | **NO.** Each story MUST be its own file: `.launchcraft/[domain]/stories/US-NNN-[slug].md`. One file per story. This is the whole point of the domain structure. |
| "Saving 40 files is too many writes" | 40 stories = 40 files. Use the Write tool 40 times. This is not optional. |
| "I'll create the domain folders later" | Create folders NOW as you write each story. `mkdir -p .launchcraft/[domain]/stories/` then write each file. |
| "The index file is enough, stories can be inline" | The index is a TABLE OF CONTENTS — it links to individual files. Stories must be separate files. |

## Evidence Gate

Before claiming this skill is complete, you must have:
- [ ] Extracted feature inventory with ALL features from requirements (show inventory with count)
- [ ] Written stories for every feature (show story count)
- [ ] Built feature coverage matrix (show matrix)
- [ ] Must-Have coverage = 100% (show percentage)
- [ ] Should-Have coverage = 100% (show percentage)
- [ ] Nice-to-Have coverage ≥ 90% (show percentage)
- [ ] Verified journey coverage for all personas (show checklist)
- [ ] **Saved INDIVIDUAL story files** — each story in its own `.launchcraft/[domain]/stories/US-NNN-[slug].md` (show file count matching story count)
- [ ] Saved global index at `.launchcraft/user-stories-index.md` (show path)
- [ ] Verified file count: `ls .launchcraft/*/stories/US-*.md | wc -l` matches total story count (show command output)
- [ ] Dispatched contract-validator and received PASS (show the result)

No evidence = not complete. Period.

## Anti-Patterns

| Bad | Good |
|-----|------|
| "As a user, I want it to work better" | "As a mobile shopper, I want the search bar visible without scrolling, so I can find products quickly" |
| "Should be fast" | "Given a product search, when results load, then first results appear within 200ms" |
| "30 stories covers a 60-feature product" | "62 stories for 60 features, 100% Must-Have coverage, 100% Should-Have coverage" |
| Writing stories without checking requirements | Feature inventory first, then stories, then coverage matrix |
| "Coverage matrix shows 80%, good enough" | Must-Have and Should-Have = 100% or you're not done |
| Saving all stories in one file | Each story is its own `.md` file in `.launchcraft/[domain]/stories/` |
| Flat file structure (no domain folders) | Stories grouped by domain: `.launchcraft/auth/stories/`, `.launchcraft/dashboard/stories/`, etc. |
