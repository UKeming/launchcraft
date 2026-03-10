---
name: test-report
description: "Use when generating a test report after implementation is complete. Triggers on: creating test reports, documenting test results, verifying test coverage, pre-launch quality check."
---

# Test Report Generator

## Overview

Run all tests, collect results, analyze coverage, and produce a comprehensive test report. This is the quality gate before launch.

<HARD-GATE>
Before generating the report:
1. Confirm implementation is complete (impl skill has been run)
2. Run the FULL test suite — do not rely on cached or partial results
3. Collect actual metrics — do not estimate or approximate

The report must reflect reality. Never fabricate passing results.
</HARD-GATE>

## Input Contract Validation

On start, verify:
- [ ] Implementation code exists (impl skill output)
- [ ] Test files exist in `tests/`
- [ ] Test plan exists at `docs/test-plans/*.md`
- [ ] Tests are runnable (test framework is installed)

If validation fails, list specific violations and stop.

## Process

### 1. Run Full Test Suite

Execute all tests with verbose output and coverage (if available):
- Detect test framework from project config
- Run with coverage flag if supported
- Capture: total, passed, failed, skipped, errors
- Capture: execution time

### 2. Analyze Results

For each test:
- Map back to test plan (T-NNN) and user story (US-NNN)
- Categorize: unit / integration / edge case
- Note any failures with error details

For coverage (if available):
- Overall coverage percentage
- Per-file/component coverage
- Uncovered critical paths

### 3. Generate Report

Produce the report with objective analysis:
- State facts, not opinions
- Every claim backed by test output
- Failures described with reproduction steps
- Clear recommendation: ready to launch or needs fixes

### 4. Review with User

Present key findings:
- Total pass rate
- Any failures and their severity
- Coverage gaps
- Recommendation

Ask: "Should we proceed to launch, or fix issues first?"

### 5. Save

Save to `docs/test-reports/YYYY-MM-DD-[topic]-test-report.md`:

```markdown
# Test Report: [Topic]

**Date:** YYYY-MM-DD
**Related Test Plan:** docs/test-plans/[filename].md
**Status:** Pass | Fail | Partial
**Recommendation:** Ready to Launch | Needs Fixes

---

## Summary

| Metric | Value |
|--------|-------|
| Total Tests | N |
| Passed | N |
| Failed | N |
| Skipped | N |
| Pass Rate | N% |
| Coverage | N% (if available) |
| Execution Time | Ns |

## Results by User Story

| User Story | Tests | Passed | Failed | Status |
|------------|-------|--------|--------|--------|
| US-NNN | N | N | N | PASS/FAIL |

## Failed Tests (if any)

### T-NNN: [test name]

**Error:** [error message]
**Component:** [component name]
**User Story:** US-NNN
**Reproduction:** [how to reproduce]
**Severity:** Critical | Major | Minor

## Coverage Details (if available)

| Component | Coverage | Uncovered Areas |
|-----------|----------|-----------------|
| [name] | N% | [description] |

## Issues & Recommendations

- [Issue description and recommended action]

## Conclusion

[1-2 sentences: overall quality assessment and launch readiness]
```

## Output Validation

After saving, dispatch the **contract-validator** agent to independently verify the output:

```
Agent: contract-validator
Skill: test-report
Output path: [the file you just saved]
```

The validator will check for actual metrics, proper US-NNN mapping, and justified recommendations. Do NOT proceed to launch until the validator returns PASS. If it returns FAIL, fix the violations and re-validate.

## Rationalization Prevention

| Thought | Reality |
|---------|---------|
| "Tests passed last time, no need to rerun" | Rerun NOW. State changes between runs. |
| "Coverage tool isn't set up, skip coverage" | Set it up or document why it's unavailable. Don't silently skip. |
| "These 2 failures are minor, recommend launch anyway" | Report the failures. Let the USER decide if they're minor. |
| "The metrics are approximately right" | Approximate metrics are fabricated metrics. Use exact numbers from test output. |
| "Nobody reads test reports" | The launch skill reads it. The contract-validator reads it. Write it properly. |

## Evidence Gate

Before claiming this skill is complete, you must have:
- [ ] Shown input contract validation results (all checks passed)
- [ ] Run the full test suite FRESH (show the exact command and full output)
- [ ] Report contains actual numbers from that run (not copied from memory)
- [ ] Every failure has reproduction steps (show them)
- [ ] Saved the file (show the file path)
- [ ] Dispatched contract-validator and received PASS (show the result)

No evidence = not complete. Period.

## Anti-Patterns

| Bad | Good |
|-----|------|
| "All tests pass" (without running them) | Show actual test output with numbers |
| "Coverage is good" | "Coverage is 87% — auth module at 62% needs attention" |
| Hiding failures | Listing every failure with details |
| "Ready to launch" with failing tests | "Needs fixes: 2 critical failures in payment flow" |
