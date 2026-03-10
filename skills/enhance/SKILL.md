---
name: enhance
description: "Use after differentiation to expand requirements with additional features, differentiation angles, and user story opportunities. Triggers on: enhancing requirements, adding features, deepening product scope, expanding functionality."
---

# Requirement Enhancer

## Overview

Expand and deepen requirements after differentiation strategy is set. This skill reads everything upstream (requirements, research, differentiation) and proposes additional features, differentiation angles, and user story opportunities. The goal: turn a minimal product into a comprehensive one.

<HARD-GATE>
Before proposing enhancements:
1. Read ALL upstream docs (requirements, research, differentiation)
2. Research competitors' full feature sets via web search
3. Identify gaps between our requirements and a production-grade product
4. Propose enhancements organized by category
5. Get user approval on which enhancements to add

Do NOT just add random features. Every enhancement must tie to user pain points, competitive gaps, or strategic bets.
</HARD-GATE>

## Input Contract Validation

On start, verify:
- [ ] Requirements doc exists at `docs/requirements/*.md`
- [ ] Research report exists at `docs/research/*.md`
- [ ] Differentiation strategy exists at `docs/strategy/*-differentiation.md`

If validation fails, stop and run the missing upstream skill first.

## Process

### 1. Analyze Current State

Read all upstream docs. Build a gap analysis:

```markdown
## Current State Analysis

**Must-Have features:** [count] — [list]
**Should-Have features:** [count] — [list]
**Nice-to-Have features:** [count] — [list]
**Strategic bets:** [list from differentiation]
**Competitive gaps identified:** [list from research]
```

### 2. Research Competitor Feature Sets

Use web search to deeply analyze what competitors offer:

- Full feature lists of top 3-5 competitors (not just highlights)
- Features users request in reviews/forums that competitors lack
- Emerging trends in the space (what new products are doing differently)
- Adjacent product categories that overlap with ours

For each competitor, catalog:
```markdown
### [Competitor Name]

**Total feature count:** [N]
**Features we don't have:**
- [feature]: [why users want it]
- [feature]: [why users want it]

**Features users complain about:**
- [complaint]: [opportunity for us]
```

### 3. Identify Enhancement Opportunities

Categorize opportunities by source:

#### a. Competitive Parity Gaps
Features that 2+ competitors have that we're missing. These are table stakes we should consider.

#### b. User Pain Point Features
Features requested repeatedly in forums, reviews, and support channels. Evidence of real demand.

#### c. Strategic Bet Amplifiers
Features that strengthen our differentiation strategy. Double down on what makes us unique.

#### d. Growth & Retention Features
Features that improve user acquisition, activation, retention, or referral:
- Onboarding improvements (tutorials, templates, quick-start)
- Sharing/collaboration (invite flows, team features, public profiles)
- Notification & engagement (email digests, activity feeds, reminders)
- Import/export & interoperability (migration tools, API, integrations)

#### e. Technical Depth Features
Features that signal product maturity:
- Advanced search/filter
- Keyboard shortcuts & power-user features
- Customization & theming
- Offline support
- Bulk operations
- Analytics & insights dashboard
- Audit log / activity history

### 4. Propose Enhancements

Present a structured proposal. For each enhancement, include:

```markdown
## Enhancement Proposal

### New Must-Have Features (elevate from gaps)
| # | Feature | Source | Rationale | Effort |
|---|---------|--------|-----------|--------|
| 1 | [feature] | Competitive parity | [why needed] | S/M/L |

### New Should-Have Features
| # | Feature | Source | Rationale | Effort |
|---|---------|--------|-----------|--------|

### New Nice-to-Have Features
| # | Feature | Source | Rationale | Effort |
|---|---------|--------|-----------|--------|

### New Differentiation Angles
| # | Angle | Why It Matters | How It Strengthens Strategy |
|---|-------|---------------|---------------------------|

### Additional User Story Opportunities
| # | Story Area | Persona | Journey Stage | Why Missing |
|---|-----------|---------|---------------|-------------|
```

Ask the user: "Which enhancements should we add? You can approve all, select specific ones, or suggest modifications."

### 5. Update Requirements Document

After user approval, update the original requirements document at `docs/requirements/*.md`:
- Add approved features to the appropriate tier (Must/Should/Nice-to-Have)
- Add new differentiation angles to the strategy section
- Update the competitive landscape if new competitors were found
- Add any new non-functional requirements discovered

**IMPORTANT:** Edit the existing requirements file — do NOT create a separate copy. The requirements doc is the single source of truth.

### 6. Save Enhancement Record

Save the enhancement record to `docs/enhanced/YYYY-MM-DD-[product-name]-enhanced.md`:

```markdown
# Enhancement Record: [Product Name]

**Date:** YYYY-MM-DD
**Requirements Doc:** docs/requirements/[filename].md
**Research Report:** docs/research/[filename].md
**Differentiation Strategy:** docs/strategy/[filename].md
**Status:** Approved

## Enhancements Added

### Features Added
| # | Feature | Tier | Source | Rationale |
|---|---------|------|--------|-----------|

### Differentiation Angles Added
| # | Angle | Rationale |
|---|-------|-----------|

### User Story Opportunities Identified
| # | Story Area | Persona | Journey Stage |
|---|-----------|---------|---------------|

## Competitor Deep-Dive
[Detailed competitor feature analysis from Step 2]

## Enhancement Metrics
- **Features before:** [N must + N should + N nice]
- **Features after:** [N must + N should + N nice]
- **Net additions:** [N]
- **New differentiation angles:** [N]
- **New user story opportunities:** [N]
```

## Output Validation

After saving, dispatch the **contract-validator** agent to independently verify the output:

```
Agent: contract-validator
Skill: enhance
Output path: [the enhancement record file]
```

Do NOT proceed until the validator returns PASS.
Once the validator returns PASS, **immediately invoke `/differentiation`** — the differentiation strategy must be re-run on the updated requirements. Do NOT ask the user whether to continue.

## Rationalization Prevention

| Thought | Reality |
|---------|---------|
| "The current requirements are enough" | If 2+ competitors have features we're missing, we're under-scoped. |
| "Adding features will delay launch" | Better to scope correctly now than discover gaps during impl. |
| "Users don't need all these features" | Research the evidence. If users ask for it, they need it. |
| "We'll add features in v2" | v2 never comes if v1 is too thin to attract users. |
| "This is scope creep" | This is scope CORRECTION based on competitive analysis. |
| "The differentiation strategy is fine as-is" | More features = more differentiation opportunities. Re-analyze. |

## Evidence Gate

Before claiming this skill is complete, you must have:
- [ ] Analyzed current requirements state (show feature counts)
- [ ] Researched 3+ competitors' full feature sets via web search (show analysis)
- [ ] Identified enhancement opportunities in 3+ categories (show categorized list)
- [ ] Presented enhancement proposal and received user approval (show approval)
- [ ] Updated the requirements document with approved features (show diff)
- [ ] Saved enhancement record (show path)
- [ ] Dispatched contract-validator and received PASS (show result)

No evidence = not complete. Period.

## Anti-Patterns

| Bad | Good |
|-----|------|
| "Add AI to everything" | "Add AI auto-tagging because 47 Reddit threads request it for competitor X" |
| "Copy all competitor features" | "Add features where we're below table stakes + amplify our strategic bets" |
| "Just add more CRUD operations" | "Add keyboard shortcuts, bulk operations, and search — power-user features that differentiate" |
| "Generic features list" | "Each feature tied to evidence: competitive gap, user request, or strategic bet" |
