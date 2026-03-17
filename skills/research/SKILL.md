---
name: research
description: "Use after spark to validate requirements against real market data. Triggers on: market research, competitive deep-dive, user research, product-market fit validation, validating assumptions."
---

# Research — Market & User Validation

<PIPELINE-AUTO-RUN>
**MANDATORY: Do NOT ask user questions. Do NOT wait for approval. Do NOT stop after saving.**
Complete the analysis → save output → dispatch contract-validator → on PASS call Skill tool: Skill(skill='differentiation').
Skip ALL "Review with User" steps. This is a continuous pipeline — you do NOT stop between stages.
**ALL .md files → `.launchcraft/` directory. NEVER save to `docs/` or project root.**
**ALL questions to user → `AskUserQuestion` tool. NEVER output questions as plain text.**
</PIPELINE-AUTO-RUN>

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
- [ ] Requirements doc exists at `.launchcraft/requirements/*.md`
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

Present to user. Use `AskUserQuestion` tool to ask: "Are there other assumptions you'd like me to research?" (Skip in pipeline auto-run.)

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

### 2.5. Competitor UI Analysis (Playwright Screenshots)

**Visit each top competitor's live product and take screenshots.** This is NOT optional — the visual reference is critical for frontend-design and experience-review stages later.

For EACH of the top 3-5 competitors:

1. **Navigate to their website/app** using `browser_navigate`
2. **Screenshot key pages** at 1440×900 (desktop):
   - Landing/marketing page
   - Login/signup page (if accessible)
   - Dashboard/main view (use demo or free trial if available)
   - Settings/profile page
   - Any unique UI that differentiates them
3. **Save screenshots** to `.launchcraft/research/screenshots/[competitor-name]/`
   - `mkdir -p .launchcraft/research/screenshots/[competitor-name]/`
   - Use `browser_take_screenshot` for each page
4. **Analyze UI patterns** — for each competitor, document:

```markdown
### [Competitor Name] — UI Analysis

**Screenshots:** .launchcraft/research/screenshots/[name]/

**Layout patterns:**
- Navigation style: [sidebar / top bar / hamburger / tabs]
- Content layout: [single column / multi-column / bento grid / masonry]
- Information density: [minimal / balanced / dense]

**Key UI elements:**
- [list every notable UI element: search bar, filter panel, drag-and-drop, etc.]

**Design language:**
- Color scheme: [describe]
- Typography: [fonts used]
- Iconography: [style]
- Whitespace usage: [generous / tight / balanced]

**Standout UX patterns:**
- [what makes their UX good/unique?]
- [any patterns we should adopt?]
- [any patterns we should avoid?]

**Page count:** [total distinct pages/views observed]
```

5. **Compile a UI Benchmark** across all competitors:

```markdown
## UI Benchmark Summary

| Pattern | Competitor A | Competitor B | Competitor C | We Should Have |
|---------|-------------|-------------|-------------|----------------|
| Global search (Cmd+K) | ✓ | ✓ | ✗ | ✓ (standard) |
| Dark mode | ✓ | ✓ | ✓ | ✓ (table stakes) |
| Keyboard shortcuts | ✓ | ✗ | ✓ | ✓ |
| Drag-and-drop | ✓ | ✓ | ✗ | ✓ |
| Multiple view modes | ✓ (3) | ✓ (2) | ✗ | ✓ |
| ... | ... | ... | ... | ... |

**Average competitor page count:** [N]
**Our target page count:** >= [N]
```

This UI benchmark flows directly to frontend-design as the visual reference.

### 3. Business Model Validation

Research the monetization landscape:

- What revenue models do competitors use? (subscription tiers, freemium, ads, usage-based)
- What do users actually pay? (search pricing pages, compare tiers)
- Is there willingness to pay for this? (Reddit, forums — "I'd pay for X if it did Y")
- What's the average revenue per user in this space? (analyst reports, funding data)
- Are there successful open-source alternatives? (affects willingness to pay)

### 4. Growth Channel Research

Research how products in this space acquire users:

- Where do target users hang out? (communities, forums, Slack/Discord groups, conferences)
- What content/SEO strategies do competitors use? (blog, YouTube, social media)
- Are there marketplace/platform distribution opportunities? (app stores, plugin ecosystems, integrations)
- What's the typical customer acquisition cost in this space?
- Is there evidence of organic/viral growth in competitor products?

### 5. Regulatory & Compliance Landscape

Research regulatory requirements:

- What data protection regulations apply? (GDPR, CCPA, HIPAA)
- Are there industry-specific compliance requirements?
- What accessibility standards must be met? (WCAG 2.1, Section 508)
- Are there content moderation or liability considerations?
- How do competitors handle compliance? (privacy policies, data residency)

### 6. Technical Landscape

Research available tools, APIs, and infrastructure:

- What APIs/services exist that could accelerate development?
- Are there open-source solutions to build on?
- What are the technical constraints or risks?
- What tech stack choices do competitors make? (check job postings, tech blogs)

### 7. Validate Assumptions

For each assumption from Step 1, present evidence:

```markdown
## Assumption Validation

| # | Assumption | Verdict | Evidence |
|---|-----------|---------|----------|
| 1 | [assumption] | ✅ Confirmed / ⚠️ Partially / ❌ Challenged | [what you found + source] |
```

### 8. Synthesize Findings

Produce actionable insights:

**Market fit assessment:**
- Is there real demand for this? (evidence-based answer)
- What's the unique angle that existing solutions miss?
- What's the realistic target audience size?

**Business model assessment:**
- Is the proposed revenue model validated? (evidence-based answer)
- What pricing tier/structure makes sense based on competitor pricing?
- Willingness to pay evidence (quotes, survey data, competitor pricing)

**Growth strategy assessment:**
- What acquisition channels have evidence of working in this space?
- Is viral/organic growth realistic? (evidence)
- What's the estimated cost of user acquisition?

**Compliance assessment:**
- What regulations apply and what's the compliance burden?
- Are there compliance gaps competitors exploit?

**Requirement adjustments:**
- Which requirements are validated by research?
- Which should be added based on user pain points discovered?
- Which should be deprioritized or removed?
- Any pivot suggestions?

**Risk factors:**
- Market risks (competitors, timing, demand)
- Technical risks (complexity, dependencies, feasibility)
- User adoption risks (switching costs, behavior change needed)
- Regulatory risks (compliance burden, data protection)
- Business model risks (pricing sensitivity, willingness to pay)

### 9. Review with User

Present the full research report. Use `AskUserQuestion` tool to ask: (Skip in pipeline auto-run — auto-approve and proceed.)
- Do these findings change your vision?
- Should we adjust requirements before scoping?
- Any areas you want me to dig deeper?

Iterate until the user approves the research and any requirement adjustments.

### 10. Save

Save to `.launchcraft/research/YYYY-MM-DD-[product-name]-research.md`.

## Output Validation

After saving, dispatch the **contract-validator** agent to independently verify the output:

```
Agent: contract-validator
Skill: research
Output path: [the file you just saved]
```

Do NOT proceed to differentiation until the validator returns PASS.
Once the validator returns PASS, run `echo "differentiation" > .launchcraft/.pipeline-next` then **call the Skill tool: `Skill(skill='differentiation')`** — do NOT ask the user whether to continue.

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
- [ ] Validated business model with competitor pricing data (show analysis)
- [ ] Researched growth channels with evidence (show findings)
- [ ] Assessed regulatory/compliance landscape (show assessment)
- [ ] Listed risk factors including business model and regulatory risks (show risks)
- [ ] Received user sign-off on research findings (show confirmation) — **auto-approved in pipeline auto-run**
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
