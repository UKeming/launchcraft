---
name: research
description: "Use after spark to validate requirements against real market data. Triggers on: market research, competitive deep-dive, user research, product-market fit validation, validating assumptions."
---

# Research — Market & User Validation

## Overview

Validate spark's requirements against real-world data before committing to scope. Spark captures vision; research confirms (or challenges) it with evidence. Building without validation = building what you imagine users want, not what they actually need.

<HARD-GATE>
Before producing the research report:
1. Read the requirements doc from spark thoroughly
2. Conduct web-based market research (search for real data, not assumptions)
3. Validate or challenge every key assumption in the requirements
4. Present findings and get user sign-off on adjusted direction

Do NOT let differentiation start without validated requirements.
</HARD-GATE>

## Input Contract Validation

On start, verify:
- [ ] Requirements doc exists at `docs/requirements/*.md`
- [ ] Requirements doc has: Problem Statement, Target Users, Competitive Landscape, Functional Requirements

If validation fails, stop and run `/spark` first.

## Process

### 1. Extract Assumptions

Read the requirements doc and list every assumption that needs validation:

```markdown
## Assumptions to Validate

| # | Assumption | Source | Risk if Wrong |
|---|-----------|--------|---------------|
| 1 | [e.g., "Users prefer X over Y"] | [Requirements §section] | [Impact] |
| 2 | [e.g., "No existing tool does Z"] | [Competitive Landscape] | [Impact] |
| 3 | [e.g., "Target users are willing to pay"] | [Value Prop] | [Impact] |
```

Present to user. Ask: "Are there other assumptions you'd like me to research?"

### 2. Market Research

Use web search to gather real data on:

**Market landscape:**
- Market size and growth trends for this problem space
- Recent funding/acquisitions in the space (signals of demand)
- Industry reports or analyst coverage

**Competitive deep-dive:**
- Expand beyond spark's 3 competitors — find more
- Analyze pricing models, feature sets, user reviews
- Identify gaps no competitor addresses
- Check Product Hunt, G2, Capterra, Reddit for user sentiment

**User behavior:**
- How do people currently solve this problem? (forums, Reddit, Stack Overflow, Twitter)
- What do they complain about with existing solutions?
- What feature requests appear repeatedly?

For each finding, cite the source.

### 3. Technical Landscape

Research available tools, APIs, and infrastructure:

- What APIs/services exist that could accelerate development?
- Are there open-source solutions to build on?
- What are the technical constraints or risks?
- What tech stack choices do competitors make? (check job postings, tech blogs)

### 4. Validate Assumptions

For each assumption from Step 1, present evidence:

```markdown
## Assumption Validation

| # | Assumption | Verdict | Evidence |
|---|-----------|---------|----------|
| 1 | [assumption] | ✅ Confirmed / ⚠️ Partially / ❌ Challenged | [what you found + source] |
```

### 5. Synthesize Findings

Produce actionable insights:

**Market fit assessment:**
- Is there real demand for this? (evidence-based answer)
- What's the unique angle that existing solutions miss?
- What's the realistic target audience size?

**Requirement adjustments:**
- Which requirements are validated by research?
- Which should be added based on user pain points discovered?
- Which should be deprioritized or removed?
- Any pivot suggestions?

**Risk factors:**
- Market risks (competitors, timing, demand)
- Technical risks (complexity, dependencies, feasibility)
- User adoption risks (switching costs, behavior change needed)

### 6. Review with User

Present the full research report. Ask:
- Do these findings change your vision?
- Should we adjust requirements before scoping?
- Any areas you want me to dig deeper?

Iterate until the user approves the research and any requirement adjustments.

### 7. Save

Save to `docs/research/YYYY-MM-DD-[product-name]-research.md`.

## Output Validation

After saving, dispatch the **contract-validator** agent to independently verify the output:

```
Agent: contract-validator
Skill: research
Output path: [the file you just saved]
```

Do NOT proceed to differentiation until the validator returns PASS.
Once the validator returns PASS, **immediately invoke `/differentiation`** — do NOT ask the user whether to continue.

## Rationalization Prevention

| Thought | Reality |
|---------|---------|
| "The user already did competitive analysis in spark" | Spark's 3-competitor table is a starting point. Research goes deep — pricing, reviews, gaps, user sentiment. |
| "Web search is unreliable" | Unreliable data > no data. Cite sources, let user judge. |
| "This slows down the pipeline" | 1 hour of research saves weeks of building the wrong thing. |
| "The market is obvious" | If it's obvious, research will confirm it quickly. If not, you just saved the project. |
| "Technical research isn't needed yet" | Discovering a critical API doesn't exist AFTER designing = rework. Check now. |
| "I can just summarize what I already know" | Use web search. Real data, not training data. Your knowledge has a cutoff date. |

## Evidence Gate

Before claiming this skill is complete, you must have:
- [ ] Listed assumptions extracted from requirements (show table)
- [ ] Conducted web searches and cited real sources (show search results/URLs)
- [ ] Analyzed competitive landscape beyond spark's initial scan (show expanded analysis)
- [ ] Validated each assumption with evidence (show validation table)
- [ ] Assessed product-market fit with evidence (show assessment)
- [ ] Identified requirement adjustments based on findings (show adjustments)
- [ ] Listed risk factors (show risks)
- [ ] Received user sign-off on research findings (show confirmation)
- [ ] Saved the file (show path)
- [ ] Dispatched contract-validator and received PASS (show result)

No evidence = not complete. Period.

## Anti-Patterns

| Bad | Good |
|-----|------|
| "The market is large and growing" (no numbers) | "Bookmark management SaaS market: $X.XB, growing Y% YoY (Source: [report])" |
| "Users want this feature" (no evidence) | "Feature X requested in 47 Reddit threads, top complaint on G2 for competitor Y" |
| "No real competitors" | "Direct: [A], [B]. Indirect: [C], [D]. DIY: spreadsheets, browser bookmarks" |
| Skipping technical research | "Competitor uses [API]. Alternative: [open-source lib]. Risk: rate limits on free tier." |
| Copy-pasting spark's competitive table | Deep-dive with pricing, reviews, feature matrix, user sentiment |
