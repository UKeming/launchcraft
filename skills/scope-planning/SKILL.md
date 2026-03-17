---
name: scope-planning
description: "Use after differentiation to determine product scope, story count, and design doc breakdown. Triggers on: scoping a product, planning how many stories to write, deciding design doc structure."
---

# Scope Planning

## Overview

Analyze requirements and determine the right scope: how many user stories, how to split design docs, what the implementation modules are. This ensures the product is comprehensive — not under-scoped (toy app) or over-scoped (never ships).

<HARD-GATE>
Before producing the scope plan:
1. Read the requirements doc thoroughly
2. Identify all personas, features, and integration points
3. Classify product complexity (Simple / Medium / Complex)
4. Get user confirmation on the scope plan

Do NOT let user-story or design-doc start without a scope plan.
</HARD-GATE>

## Input Contract Validation

On start, verify:
- [ ] Requirements doc exists at `.launchcraft/requirements/*.md`
- [ ] Requirements doc has: Problem Statement, Target Users, Functional Requirements (Must/Should/Nice)
- [ ] Research folder exists at `.launchcraft/research/` with `index.md` and competitor files
- [ ] Differentiation strategy exists at `.launchcraft/strategy/*-differentiation.md`

If requirements missing, run `/spark` first.
If research missing, run `/research` first.
If differentiation missing, run `/differentiation` first.

## Process

### 1. Analyze Complexity

Read the requirements doc, research report, and differentiation strategy. Score:

| Factor | Simple (1) | Medium (2) | Complex (3) |
|--------|-----------|------------|-------------|
| Personas | 1-2 | 3-4 | 5+ |
| Must-have features | 3-5 | 6-12 | 13+ |
| External integrations | 0-1 | 2-3 | 4+ |
| Data entities | 1-3 | 4-8 | 9+ |
| Auth/roles | None or basic | Role-based | Multi-tenant |
| Real-time needs | None | Some (notifications) | Core (chat, collab) |

**Complexity = average score rounded:**
- 1.0-1.5 → Simple
- 1.6-2.4 → Medium
- 2.5-3.0 → Complex

### 2. Determine Story Count

Based on complexity, calculate:

```
Personas: [N identified from requirements]
Journey stages per persona: 6 (discovery, onboarding, core usage, edge cases, return usage, admin)
Stories per stage: varies by complexity

Simple:  1-2 stories/stage → total: N × 6 × 1.5 ≈ 15-20 stories
Medium:  2-3 stories/stage → total: N × 6 × 2.5 ≈ 25-40 stories
Complex: 3-5 stories/stage → total: N × 6 × 4   ≈ 40-70 stories
```

Present the calculation. Use `AskUserQuestion` tool for feedback. (Skip in pipeline auto-run — proceed with calculated count.)

### 3. Plan Domain Structure

Every product is organized into **domain folders**. Each domain co-locates its stories and design doc:

```
.launchcraft/[domain]/
  stories/       ← individual US-NNN-[slug].md files
  design.md      ← domain's design doc
```

Every product gets a **system** domain plus feature domains:

```
Identify domains by:
1. Group related Must-Have requirements by functional area
2. Each group that has 3+ user stories = 1 domain
3. Smaller groups merge into the nearest related domain
4. System domain covers: overall architecture, DB, auth, deployment, shared infra
```

Example for a bookmark manager:
```
.launchcraft/
  system/          (architecture, DB, API framework, auth)
  bookmark-crud/   (create, read, update, delete, organize)
  search-filter/   (search, tags, filters, sort)
  sharing/         (share links, permissions, public pages)
  import-export/   (browser import, CSV export, API)
```

**Target domain count:**
- Simple: system + 2-3 feature domains
- Medium: system + 3-5 feature domains
- Complex: system + 5-8 feature domains

### 4. Produce Scope Plan

Present and save the scope plan:

```markdown
# Scope Plan: [Product Name]

**Date:** YYYY-MM-DD
**Requirements:** .launchcraft/requirements/[filename].md
**Complexity:** Simple | Medium | Complex
**Status:** Draft | Approved

## Complexity Analysis

| Factor | Score | Rationale |
|--------|-------|-----------|
| Personas | [1-3] | [why] |
| Must-have features | [1-3] | [why] |
| External integrations | [1-3] | [why] |
| Data entities | [1-3] | [why] |
| Auth/roles | [1-3] | [why] |
| Real-time needs | [1-3] | [why] |
| **Average** | **[N]** | **[Simple/Medium/Complex]** |

## User Story Plan

**Target story count:** [N]
**Personas:** [list]

| Persona | Journey Stage | Estimated Stories |
|---------|--------------|-------------------|
| [persona] | Discovery | [N] |
| [persona] | Onboarding | [N] |
| [persona] | Core Usage | [N] |
| [persona] | Edge Cases | [N] |
| [persona] | Return Usage | [N] |
| [persona] | Admin/Settings | [N] |
| **Total** | | **[N]** |

## Domain Structure

**Total domains:** system + [N] feature domains

| Domain | Folder | Scope | Related Requirements |
|--------|--------|-------|---------------------|
| system | .launchcraft/system/ | Architecture, DB, auth, deployment | All |
| [domain] | .launchcraft/[domain]/ | [scope] | [Must-Have items] |
| [domain] | .launchcraft/[domain]/ | [scope] | [Must-Have items] |

## Implementation Modules

Suggested implementation order (by dependency):
1. [module] — foundational, no dependencies
2. [module] — depends on #1
3. [module] — depends on #1, #2
```

### 5. Review

Use `AskUserQuestion` tool to ask: (Skip in pipeline auto-run — auto-approve the scope plan.)
- Is the complexity classification correct?
- Is the story count appropriate?
- Does the domain structure make sense?
- Is the implementation order right?

Iterate until approved.

### 6. Save

Save to `.launchcraft/plans/YYYY-MM-DD-[product-name]-scope-plan.md`.

## Output Validation

After saving, dispatch the **contract-validator** agent:

```
Agent: contract-validator
Skill: scope-planning
Output path: [the file you just saved]
```

Do NOT proceed to user-story until the validator returns PASS.
Once validator returns PASS, dispatch **product-manager** agent to review this stage's output. If PM says PROCEED: run `echo "user-story" > .launchcraft/.pipeline-next` then **call the Skill tool: `Skill(skill='user-story')`**. If PM says ROLLBACK(target): run `echo "target" > .launchcraft/.pipeline-next` then call `Skill(skill=target)`. Save PM review to `.launchcraft/pm-reviews/`.

## Rationalization Prevention

| Thought | Reality |
|---------|---------|
| "This is clearly simple, skip the analysis" | Score it anyway. "Simple" projects that are actually Medium waste weeks. |
| "3 stories per persona is enough" | Map the journey first. If 3 stories skip onboarding and error handling, the app is incomplete. |
| "One big design doc is fine" | One 50-page doc is unreadable. Split by domain folder. |
| "Implementation order doesn't matter yet" | Dependencies discovered during impl = rework. Plan now. |
| "The user just wants to start building" | 30 minutes of scoping saves days of rework. |

## Evidence Gate

Before claiming this skill is complete, you must have:
- [ ] Shown complexity scoring with rationale per factor (show table)
- [ ] Calculated story count with formula (show calculation)
- [ ] Listed design doc breakdown with scope per doc (show list)
- [ ] Defined implementation order with dependencies (show order)
- [ ] Received user approval on the scope plan (show confirmation) — **auto-approved in pipeline auto-run**
- [ ] Saved the file (show path)
- [ ] Dispatched contract-validator and received PASS (show result)

No evidence = not complete. Period.

## Anti-Patterns

| Bad | Good |
|-----|------|
| "About 10 stories should be enough" | "3 personas × 6 stages × 2 stories/stage = 36 stories" |
| "One design doc for everything" | "1 system + 4 feature docs, split by domain" |
| "Build everything in parallel" | "Module A first (foundational), then B and C (depend on A)" |
