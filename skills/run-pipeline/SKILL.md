---
name: run-pipeline
description: "Run the full LaunchCraft pipeline from current stage to completion. Use this instead of individual stage commands for automatic end-to-end execution."
---

# Pipeline Orchestrator

This skill runs the ENTIRE LaunchCraft pipeline in one continuous turn. It calls each stage skill in sequence, validates after each, dispatches the PM review, and proceeds to the next. The agent NEVER stops between stages.

<CRITICAL>
**You are an orchestrator.** Your ONLY job is to call Skill() and Agent() tools in the right order.
Do NOT write code. Do NOT create files directly. Do NOT summarize between stages.
Each stage is a Skill() call — make the next call IMMEDIATELY after the previous completes.
</CRITICAL>

## How It Works

```
for each stage in pipeline:
  1. Call Skill(skill='stage-name')        ← stage does its work
  2. Call Agent(subagent_type='contract-validator')  ← validate output
  3. If FAIL: fix and re-validate
  4. Call Agent(subagent_type='product-manager')     ← PM review
  5. If ROLLBACK(target): jump to target stage
  6. If PROCEED: continue to next stage
```

## Pipeline Order

```
research → differentiation → enhance → user-story → design-doc
  → frontend-design → tdd-testing → impl → experience-review
  → test-report → launch
```

Note: spark runs BEFORE this orchestrator (spark collects requirements from the user). This orchestrator starts AFTER spark + contract-validator pass.

## Process

### 1. Detect Current Stage

Read `.launchcraft/` to determine what's already done:

```bash
# What exists?
ls .launchcraft/requirements/ 2>/dev/null   # spark done?
ls .launchcraft/research/index.md 2>/dev/null  # research done?
ls .launchcraft/strategy/ 2>/dev/null       # differentiation done?
ls .launchcraft/enhanced/ 2>/dev/null       # enhance done?
ls .launchcraft/stories/ 2>/dev/null        # user-story done?
ls .launchcraft/designs/ 2>/dev/null        # design-doc done?
ls .launchcraft/frontend-design/ 2>/dev/null # frontend-design done?
ls .launchcraft/test-plans/ 2>/dev/null     # tdd-testing done?
# etc.
```

Start from the FIRST incomplete stage.

### 2. Run Each Stage

For each remaining stage, execute this loop:

```
Call Skill(skill='[stage-name]')
  ↓ stage completes (saves its output)
Call Agent(subagent_type='contract-validator', prompt='Skill: [stage-name], Output: [paths]')
  ↓ if FAIL: read violations, fix, re-validate (max 3 retries)
  ↓ if PASS: continue
USER CHECKPOINT (if this stage has one — see table below)
  ↓ present key decisions to user via AskUserQuestion
  ↓ user confirms or redirects
Call Agent(subagent_type='product-manager', prompt='Stage: [stage-name], Output: [paths]')
  ↓ if ROLLBACK(target): jump back to target stage in the loop
  ↓ if PROCEED: continue to next stage
```

### 2.5 User Checkpoints

**Do NOT ask procedural questions** ("should I continue?", "ready for next stage?"). **DO ask substantive decisions** that affect what the product looks like. Use `AskUserQuestion` with structured options for every checkpoint.

| After Stage | Checkpoint Question | Why |
|------------|-------------------|-----|
| **research** | "Here's the competitive landscape: [top 3 competitors + feature gaps]. Our product should target [N] features and [N] pages. Does this match your ambition?" Options: Looks right / I want MORE / I want LESS / Other | Sets the scope baseline — everything downstream follows this |
| **differentiation** | "Here are 3 positioning strategies: [A], [B], [C]. Which direction resonates with your vision?" Options: [A] / [B] / [C] | Product direction — wrong choice = wrong product |
| **enhance** | "We expanded to [N] features. Here are the top 10 additions: [list]. Any features you want to ADD or REMOVE?" Options: Approve all / Let me review the full list / Add more / Remove some | Feature set — this is what gets built |
| **user-story** | "Here are [N] stories across [M] domains: [domain list with counts]. Missing anything?" Options: Looks complete / Add stories for [X] / Too many, trim | Story coverage — gaps here = missing features |
| **design-doc** | "Architecture approach: [chosen approach]. Key tech decisions: [list]. Any concerns?" Options: Approve / Change approach / Other | Architecture — expensive to change later |
| **frontend-design** | "Aesthetic direction: [chosen style]. Here's a preview: [screenshot of first page]. Does this match your vision?" Options: Love it / Try bolder / Try more minimal / Different style entirely | Visual direction — subjective, user MUST approve |
| **experience-review** | (Already has checkpoint — NEEDS-FIXES rollback decision) | — |
| **launch** | (Already has checkpoint — API keys) | — |

**Stages with NO checkpoint** (auto-proceed): tdd-testing, impl, test-report. These are execution stages where the spec is already set — no subjective decisions.

**IMPORTANT:** Checkpoints are for DECISIONS, not approvals. Don't ask "does this look ok?" — ask "which of these 3 options do you prefer?" Give the user concrete choices, not open-ended questions.

### 3. Stage-Specific Notes

**research:** Dispatches parallel research-analyst agents. Wait for all to complete.

**differentiation → enhance:** PM may rollback between these. If PM says "not enough features" after differentiation, go to enhance. If PM says "not enough features" after enhance, go back to research.

**user-story:** Dispatches parallel user-story-writer agents. Followed by depth-validator.

**user-story → scouts → design-doc:** After user-story completes, dispatch 5-7 parallel `scout` agents:
- architecture-scout: system design patterns, infrastructure decisions
- security-scout: auth patterns, data protection, OWASP top 10
- performance-scout: caching, lazy loading, bundle optimization
- ux-scout: interaction patterns, accessibility, responsive design
- integration-scout: third-party APIs, webhooks, browser extensions
- testing-scout: test strategy, fixtures, CI/CD pipeline
- observability-scout: logging, monitoring, error tracking

All run in parallel. Results saved to `.launchcraft/scouts/`. Design-doc agents read scout findings.

**design-doc:** Dispatches parallel design-doc-writer agents. Followed by depth-validator.

**impl → SHIP gate:** After impl completes and contract-validator passes, dispatch `ship-reviewer` agent.
- If SHIP: proceed to experience-review
- If NEEDS_WORK: the agent lists specific issues. Fix them (call Skill(skill='impl') again or edit directly). Re-dispatch ship-reviewer. Max 3 retries.
- This prevents "declaring done" on incomplete implementations.

**experience-review:** Dispatches experience-reviewer agent. If NEEDS-FIXES: use AskUserQuestion to show user the issues and proposed rollback. Execute rollback to the target stage.

**launch:** This is the ONE stage where you MUST stop for user input (API keys). Use AskUserQuestion for each key.

### 4. Completion

After launch + accountant (post-launch) complete:
1. `TaskUpdate`: mark all tasks as `completed`
2. Present the final deliverables to the user:
   - Deployed URL
   - Financial report
   - Pipeline summary

## Rollback Handling

When PM says ROLLBACK(target):
1. Save PM review to `.launchcraft/pm-reviews/`
2. Append rollback reason to `.launchcraft/pipeline-context.md`
3. Jump back to the target stage in the loop (do NOT restart from the beginning)
4. The target stage reads pipeline-context.md to understand what needs to change

When experience-reviewer says NEEDS-FIXES:
1. Show user the issues via AskUserQuestion
2. Rollback to the stage the user confirms
3. Continue pipeline from that stage

## Rules

- **NEVER stop between stages** (except for launch API keys and experience-review rollback decisions)
- **NEVER summarize between stages** — just call the next Skill()
- **NEVER skip a stage** — every stage must run and pass validation
- If a stage fails 3 times, use AskUserQuestion to ask the user how to proceed
- The entire pipeline should run as ONE continuous agent turn
