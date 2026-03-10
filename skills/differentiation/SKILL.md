---
name: differentiation
description: "Use after research to define product differentiation strategy. Triggers on: differentiation, competitive positioning, unique value prop, strategic advantage, product strategy."
---

# Differentiation — Strategic Positioning

## Overview

Turn research findings into a clear differentiation strategy. Research tells you what exists; differentiation decides how your product will be meaningfully different. Without this, you build a "me too" product that competes on features alone.

<HARD-GATE>
Before producing the differentiation strategy:
1. Read the research report thoroughly
2. Read the original requirements doc
3. Identify where competitors are weak and users are underserved
4. Define a positioning that's defensible, not just "we're better"
5. Get user sign-off on the strategic direction

Do NOT let scope-planning start without a differentiation strategy.
</HARD-GATE>

## Input Contract Validation

On start, verify:
- [ ] Requirements doc exists at `docs/requirements/*.md`
- [ ] Research report exists at `docs/research/*.md`
- [ ] Research report has: Competitive analysis, Assumption validation, Product-market fit assessment

If validation fails, stop and run `/research` first.

## Process

### 1. Map the Competitive Landscape

From the research report, build a feature matrix:

```markdown
## Feature Matrix

| Capability | Competitor A | Competitor B | Competitor C | Gap? |
|-----------|-------------|-------------|-------------|------|
| [feature] | ✅ Strong | ⚠️ Weak | ❌ Missing | [opportunity] |
| [feature] | ❌ Missing | ✅ Strong | ⚠️ Weak | [opportunity] |
```

Identify:
- Features everyone has (table stakes — must have, won't differentiate)
- Features only some have (potential differentiators)
- Features nobody has (blue ocean opportunities)
- Pain points users complain about across all competitors

### 2. Identify Differentiation Axes

Explore multiple dimensions of differentiation — don't default to "more features":

**Possible axes:**
- **User experience** — simpler, faster, more delightful than alternatives
- **Target audience** — serve a niche competitors ignore
- **Pricing model** — free tier, usage-based, lifetime deal, etc.
- **Integration** — works with tools competitors don't support
- **Philosophy** — privacy-first, open-source, local-first, AI-native
- **Speed/Performance** — measurably faster
- **Design** — aesthetically superior
- **Workflow** — fits into existing habits vs. requiring behavior change

For each axis, assess:
- How strong is this advantage?
- How defensible is it? (easy to copy = weak moat)
- Does it matter to target users? (cool ≠ valuable)

### 3. Define Positioning Statement

Craft a clear positioning:

```markdown
## Positioning

**For** [target users]
**Who** [have this problem/need]
**Our product is** [category]
**That** [key differentiator]
**Unlike** [primary competitor/alternative]
**We** [unique advantage]
```

This should be one clear sentence a user could repeat to a friend.

### 4. Define Strategic Bets

Identify 2-3 strategic bets — the things you'll invest in disproportionately:

```markdown
## Strategic Bets

| Bet | Rationale | Risk | Validation Signal |
|-----|-----------|------|-------------------|
| [bet 1] | [why this matters] | [what could go wrong] | [how we'll know it's working] |
| [bet 2] | [why this matters] | [what could go wrong] | [how we'll know it's working] |
```

These bets should directly inform which requirements get prioritized in scope-planning.

### 5. Refine Requirements

Based on the differentiation strategy, propose requirement adjustments:

```markdown
## Requirement Adjustments

### Elevate (move to Must-Have or add emphasis)
- [requirement] — because [ties to differentiation]

### Add (new requirements from differentiation strategy)
- [new requirement] — because [addresses gap/bet]

### Deprioritize (move to Nice-to-Have or remove)
- [requirement] — because [table stakes, not differentiating]

### Keep As-Is
- [requirement] — [still valid as originally scoped]
```

### 6. Review with User

Present the full strategy. Ask:
- Does this positioning resonate?
- Are the strategic bets the right ones?
- Do the requirement adjustments make sense?
- Is there a differentiation angle we're missing?

Iterate until the user approves.

### 7. Save

Save to `docs/strategy/YYYY-MM-DD-[product-name]-differentiation.md`.

## Output Validation

After saving, dispatch the **contract-validator** agent to independently verify the output:

```
Agent: contract-validator
Skill: differentiation
Output path: [the file you just saved]
```

Do NOT proceed to scope-planning until the validator returns PASS.

## Rationalization Prevention

| Thought | Reality |
|---------|---------|
| "We'll just be better at everything" | That's not a strategy. Pick 2-3 things to be best at and accept trade-offs. |
| "Features are the main differentiator" | Features are the easiest to copy. UX, philosophy, and audience are harder to replicate. |
| "The differentiation is obvious from research" | If it's obvious, writing it down takes 10 minutes. If not, you just prevented a "me too" product. |
| "We can figure out positioning later" | Positioning determines what you build. Without it, you build everything and differentiate in nothing. |
| "This is a marketing exercise, not engineering" | Positioning determines architecture. Privacy-first = different tech. AI-native = different stack. |
| "Users don't care about strategy" | Users care about the outcome of strategy — a product that feels like it was built for them. |

## Evidence Gate

Before claiming this skill is complete, you must have:
- [ ] Built competitive feature matrix (show table)
- [ ] Explored multiple differentiation axes (show analysis)
- [ ] Defined clear positioning statement (show statement)
- [ ] Identified 2-3 strategic bets with rationale (show bets)
- [ ] Proposed requirement adjustments tied to strategy (show adjustments)
- [ ] Received user sign-off on differentiation strategy (show confirmation)
- [ ] Saved the file (show path)
- [ ] Dispatched contract-validator and received PASS (show result)

No evidence = not complete. Period.

## Anti-Patterns

| Bad | Good |
|-----|------|
| "We'll be the best bookmark manager" | "We'll be the bookmark manager for developers who live in the terminal" |
| "Our differentiator is AI" | "Our differentiator is AI-powered auto-tagging that actually works (90%+ accuracy) because we fine-tune on user corrections" |
| "We'll compete on price" | "Free for individuals, team pricing tied to seats — undercuts Competitor A's per-bookmark model" |
| "We do everything competitors do, plus more" | "We intentionally skip X and Y to nail Z — the thing competitors get wrong" |
