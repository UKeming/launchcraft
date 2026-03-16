---
name: debugging
description: "Use when any pipeline stage fails, tests break unexpectedly, deployment issues occur, or contract validation fails. Triggers on: pipeline stuck, skill failure, unexpected errors, test failures after impl."
---

# Pipeline Debugging

## Overview

Systematically diagnose and fix issues when any LaunchCraft pipeline stage fails. Trace root causes — never apply symptom fixes.

<HARD-GATE>
Before proposing any fix:
1. Reproduce the failure with exact error output
2. Trace the root cause (not just the symptom)
3. Form a single hypothesis and test it minimally

Do NOT guess-and-fix. Do NOT apply multiple changes at once.
</HARD-GATE>

## When to Use

- Contract validator returns FAIL
- Tests pass locally but fail in CI
- Skill produces unexpected output format
- Deployment fails or smoke tests fail
- Pipeline stage receives invalid input from upstream

## Process

### 1. Reproduce

Run the exact command that failed. Capture:
- Full error output
- Exit code
- Environment context (which skill, which stage, what input)

If you cannot reproduce, the bug is environmental — check: file paths, dependencies, permissions.

### 2. Trace Root Cause

Work backward from the error:

```
Error location → What called it → What provided the input → Where did it go wrong?
```

Check at each boundary:
- **Skill output**: Does it match the contract in .launchcraft/contracts.md?
- **File format**: Is the markdown well-formed? YAML frontmatter valid?
- **Data flow**: Did upstream skill produce what downstream expects?
- **External deps**: Is wrangler/test framework/build tool working?

### 3. Diagnose

Identify which category the issue falls into:

| Category | Symptoms | Typical Fix |
|----------|----------|-------------|
| **Contract violation** | Validator fails on specific field | Fix skill output or update contract |
| **Upstream pollution** | Valid format but wrong content | Re-run upstream skill |
| **Tool failure** | External command fails | Check tool installation, config, auth |
| **Skill logic** | Skill skips steps or produces wrong structure | Update SKILL.md instructions |
| **Environment** | Works sometimes, fails other times | Check paths, permissions, state |

### 4. Fix

Apply ONE fix at a time:
1. Write the fix
2. Re-run the failing command
3. Verify the fix resolved the issue
4. Check nothing else broke

If 3 fixes fail for the same issue, stop and reconsider — you may be fixing the wrong thing.

### 5. Prevent Recurrence

After fixing, ask:
- Should a contract rule be added to catch this earlier?
- Should a skill's HARD-GATE be strengthened?
- Should the contract-validator check for this case?

Document the fix in the project's memory for future reference.

## Rollback Protocol

If a fix makes things worse:
1. `git stash` or `git checkout` the broken change
2. Return to step 2 (Trace Root Cause) with new information
3. The failed fix IS information — it eliminates a hypothesis

## Common Pipeline Failures

| Failure | First Check |
|---------|-------------|
| user-story output rejected | Missing US-NNN format, vague acceptance criteria |
| design-doc output rejected | Missing required sections, no US-NNN references |
| tdd-testing: tests pass (should fail) | Implementation already exists, or tests don't test real behavior |
| impl: tests still fail | Wrong component, missing dependency, test expects different interface |
| test-report: metrics are placeholders | Test framework not installed, wrong run command |
| launch: deploy fails | Wrangler not configured, DNS not set up, build fails |

## Anti-Patterns

| Bad | Good |
|-----|------|
| "Let me try changing this and see" | "The error says X, which means Y, so I'll check Z" |
| Changing 5 things at once | Changing 1 thing, verifying, then next |
| "It works on my machine" | Reproduce in the exact failing environment |
| Ignoring intermittent failures | Intermittent = race condition or state dependency |
| Deleting and recreating | Understanding why the original broke |
