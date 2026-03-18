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
Call Agent(subagent_type='product-manager', prompt='Stage: [stage-name], Output: [paths]')
  ↓ if ROLLBACK(target): jump back to target stage in the loop
  ↓ if PROCEED: continue to next stage
```

**IMPORTANT:** After each Skill() call returns, IMMEDIATELY make the next Agent/Skill call. Do NOT output a summary. Do NOT ask the user anything. Do NOT stop.

### 3. Stage-Specific Notes

**research:** Dispatches parallel research-analyst agents. Wait for all to complete.

**differentiation → enhance:** PM may rollback between these. If PM says "not enough features" after differentiation, go to enhance. If PM says "not enough features" after enhance, go back to research.

**user-story:** Dispatches parallel user-story-writer agents. Followed by depth-validator.

**design-doc:** Dispatches parallel design-doc-writer agents. Followed by depth-validator.

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
