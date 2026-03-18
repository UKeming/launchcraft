---
name: research
description: "Use after spark to validate requirements against real market data. Triggers on: market research, competitive deep-dive, user research, product-market fit validation, validating assumptions."
---

# Research — Market & User Validation

<PIPELINE-AUTO-RUN>
**MANDATORY: Do NOT ask user questions. Do NOT wait for approval. Complete your work and return.**
The pipeline orchestrator (`run-pipeline`) handles stage sequencing. Your job is to do THIS stage's work, save output, and return. Do NOT call the next skill yourself.
**ALL .md files → `.launchcraft/` directory. NEVER save to `docs/` or project root.**
**ALL questions to user → `AskUserQuestion` tool. NEVER output questions as plain text.**
</PIPELINE-AUTO-RUN>

<CRITICAL-OUTPUT-RULES>
## OUTPUT: Multiple files, NOT one big report

Research produces a FOLDER of files, not a single report. Each research dimension and each competitor gets its OWN file:

```
.launchcraft/research/
  index.md                           ← summary + links to all files
  assumptions.md                     ← assumption extraction + validation
  competitors/
    [competitor-1].md                ← deep dive per competitor (features, pricing, reviews)
    [competitor-2].md
    [competitor-3].md
  screenshots/
    [competitor-1]/landing.png       ← Playwright screenshots
    [competitor-1]/dashboard.png
  feature-benchmark.md               ← feature count comparison table
  ui-benchmark.md                    ← UI patterns comparison
  market-landscape.md                ← market size, trends, funding
  business-model.md                  ← pricing analysis, willingness to pay
  user-behavior.md                   ← pain points, feature requests, forums
  growth-channels.md                 ← acquisition strategies, CAC
  regulatory.md                      ← compliance, data protection
  technical-landscape.md             ← APIs, open-source, tech stacks
  risk-factors.md                    ← market, technical, adoption risks
  requirement-adjustments.md         ← what to add/change based on research
```

**Parallelization:** Dispatch `research-analyst` sub-agents — one per competitor + one per research topic.
</CRITICAL-OUTPUT-RULES>

## Overview

Deeply validate and expand the requirements from spark. Research is the foundation for everything downstream — thin research = shallow product. Every competitor must be analyzed in detail (every feature counted), every market claim must be evidenced.

## Input Contract Validation

On start, verify:
- [ ] Requirements doc exists at `.launchcraft/requirements/*.md`
- [ ] Requirements doc has: Problem Statement, Target Users, Competitive Landscape, Functional Requirements

If validation fails, stop and run `/spark` first.

## Process

### 0. Scope Confirmation + Task Update

**Before doing any work:**
1. `TaskUpdate`: set this stage's task to `in_progress`
2. Output a brief scope summary: "This stage will [X]. Input: [Y]. Output: [Z]. Estimated: [N] files."
3. In standalone mode: use `AskUserQuestion` to confirm scope before proceeding.
4. In pipeline auto-run: output the summary and proceed immediately.

### 1. Extract Assumptions

Read the requirements doc and list every assumption that needs validation. Save to `.launchcraft/research/assumptions.md`:

```markdown
# Assumptions to Validate

| # | Assumption | Source | Risk if Wrong | Status |
|---|-----------|--------|---------------|--------|
| 1 | [assumption] | [Requirements §section] | [Impact] | PENDING |
```

### 2. Identify Research Targets

From the requirements doc, identify:
- **Competitors:** at least 5 (spark had 3 — find more via web search)
- **Research dimensions:** market, business model, user behavior, growth, regulatory, technical

### 3. Dispatch Parallel Research Agents

Create `.launchcraft/research/` and dispatch `research-analyst` sub-agents in parallel:

```
# One agent per competitor (3-5 agents):
Agent(subagent_type="research-analyst") for each competitor:
  - prompt: "Ultrathink. Research type: competitor
             Competitor: [name] ([url])
             Requirements: .launchcraft/requirements/*.md
             Output: .launchcraft/research/competitors/[name].md
             Screenshots: .launchcraft/research/screenshots/[name]/
             Count EVERY feature. Screenshot EVERY key page."
  - run_in_background: true

# One agent per research dimension (6 agents):
Agent(subagent_type="research-analyst") for each topic:
  - prompt: "Research type: market | business-model | user-behavior | growth | regulatory | technical
             Topic: [specific questions]
             Requirements: .launchcraft/requirements/*.md
             Output: .launchcraft/research/[topic].md
             Cite every claim. Minimum 100 lines."
  - run_in_background: true
```

Total: 9-11 agents running in parallel. Each produces ONE deep file.

### 4. After All Agents Complete — Synthesize

Read all research files and produce synthesis files:

**Feature Benchmark** (`.launchcraft/research/feature-benchmark.md`):
```markdown
# Feature Benchmark

| Competitor | Total Features | Categories | Key Strengths |
|------------|---------------|------------|---------------|
| [name] | [N] | [list] | [strengths] |

**Industry average:** [N] features
**Our current requirements:** [M] features
**Gap:** [N - M] features → enhance must close this gap
```

**UI Benchmark** (`.launchcraft/research/ui-benchmark.md`):
```markdown
# UI Benchmark

| Pattern | Comp A | Comp B | Comp C | We Should Have |
|---------|--------|--------|--------|----------------|
| Global search | ✓ | ✓ | ✗ | ✓ (standard) |

**Average competitor page count:** [N]
**Our target:** >= [N]
```

**Assumption Validation** — update `.launchcraft/research/assumptions.md` with verdicts from research findings.

**Requirement Adjustments** (`.launchcraft/research/requirement-adjustments.md`):
```markdown
# Requirement Adjustments Based on Research

## Features to ADD (discovered from competitor analysis + user pain points)
| # | Feature | Source | Priority | Rationale |
|---|---------|--------|----------|-----------|

## Features to ELEVATE (from Should/Nice to Must)
## Features to DEPRIORITIZE (evidence shows low demand)
## Risks Identified
```

**Research Index** (`.launchcraft/research/index.md`):
```markdown
# Research Index

**Date:** YYYY-MM-DD
**Requirements:** [path]
**Competitors analyzed:** [N]
**Total research files:** [N]
**Feature benchmark gap:** [N] features

## Files
- [assumptions.md](assumptions.md)
- [competitors/](competitors/) — [N] competitor deep-dives
- [feature-benchmark.md](feature-benchmark.md)
- [ui-benchmark.md](ui-benchmark.md)
- [market-landscape.md](market-landscape.md)
- [business-model.md](business-model.md)
- [user-behavior.md](user-behavior.md)
- [growth-channels.md](growth-channels.md)
- [regulatory.md](regulatory.md)
- [technical-landscape.md](technical-landscape.md)
- [risk-factors.md](risk-factors.md)
- [requirement-adjustments.md](requirement-adjustments.md)
```

### 5. Review (standalone only)

Use `AskUserQuestion` tool to ask: "Research complete — any areas to dig deeper?" (Skip in pipeline auto-run.)


### Checkpoint Output (for orchestrator)

Before completing, output a **User Checkpoint Summary** that the orchestrator will show to the user:

```markdown
## Checkpoint: Research Complete

**Competitors analyzed:** [N] ([names])
**Average competitor features:** [N]
**Our current features:** [N]  
**Gap:** [N] features to close
**Recommended scope:** [N] features, [N] pages
**Key insight:** [1-sentence — what's the biggest opportunity?]
```


`TaskUpdate`: set this stage's task to `completed`.

## Output Validation

After saving all files, dispatch the **contract-validator** agent:

```
Agent: contract-validator
Skill: research
Output path: .launchcraft/research/
```

Do NOT proceed to differentiation until the validator returns PASS.
Once validator returns PASS, this skill is complete. Return to the pipeline orchestrator.

## Rationalization Prevention

| Thought | Reality |
|---------|---------|
| "3 competitors is enough" | Find at least 5. The 4th and 5th often reveal the most interesting gaps. |
| "I can summarize competitor features from memory" | Use web search. Visit their actual website. Count features from their pricing/features page. Training data is stale. |
| "One big research report is fine" | Each dimension gets its own file = each agent goes DEEP. One big file = every section is thin. |
| "Screenshots are optional" | Screenshots are MANDATORY for competitor research. Frontend-design needs visual reference. |
| "100 lines per file is a lot" | A proper competitor analysis with feature list, pricing, reviews, and UI analysis is easily 150+ lines. |
| "Market research doesn't need citations" | Uncited research is fiction. Every claim needs a source URL. |
| "I already know this market" | You know training data. The market changed yesterday. Search the web. |

## Evidence Gate

Before claiming this skill is complete, you must have:
- [ ] Assumptions extracted and saved (show file)
- [ ] >= 5 competitor deep-dive files in `.launchcraft/research/competitors/` (show file list)
- [ ] Competitor screenshots in `.launchcraft/research/screenshots/` (show file list)
- [ ] Feature benchmark with competitor feature counts and gap number (show table)
- [ ] UI benchmark with pattern comparison (show table)
- [ ] All 6 research dimension files saved (show file list)
- [ ] Requirement adjustments file with features to add (show table)
- [ ] Research index file linking all files (show path)
- [ ] Dispatched contract-validator and received PASS (show result)
- [ ] Received user sign-off on research findings (show confirmation) — **auto-approved in pipeline auto-run**
