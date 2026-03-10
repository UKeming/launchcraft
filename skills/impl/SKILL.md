---
name: impl
description: "Use when implementing code to make failing tests pass, guided by a design doc. Triggers on: implementing features, writing production code, making tests green, TDD green phase."
---

# Implementation

## Overview

Write the minimum code to make all failing tests pass, following the design doc architecture. This is the GREEN phase of TDD. When all tests pass, every user story has been implemented (because every story has tests, and every test maps to a story).

<HARD-GATE>
Before writing any implementation code:
1. Read ALL design docs and understand the architecture
2. Read the test plan's Story → Test Coverage Matrix
3. Run all tests and confirm they FAIL (red phase complete)
4. Plan implementation order by component dependency

Do NOT modify any test files. Tests are the spec.
</HARD-GATE>

## Input Contract Validation

On start, verify:
- [ ] Design docs exist at `docs/designs/*.md`
- [ ] Test files exist in `tests/`
- [ ] Test plan exists at `docs/test-plans/*.md`
- [ ] Test plan has Story → Test Coverage Matrix with 100% story coverage
- [ ] All tests currently FAIL (red phase is complete)

If validation fails, list specific violations and stop.

## Process

### 1. Build Execution Plan

Read the test plan and design docs. Map the implementation order:

```markdown
## Implementation Plan

### Component Dependency Order
1. [Component] — foundational, no dependencies → makes T-001, T-002 pass → covers US-001
2. [Component] — depends on #1 → makes T-010, T-011 pass → covers US-005, US-006
3. [Component] — depends on #1, #2 → makes T-020, T-021 pass → covers US-010
...

### Progress Tracker
| # | Component | Tests to Pass | Stories Covered | Status |
|---|-----------|--------------|----------------|--------|
| 1 | [component] | T-001, T-002 | US-001 | PENDING |
| 2 | [component] | T-010, T-011 | US-005, US-006 | PENDING |
| ... | ... | ... | ... | ... |
```

### 2. Implement Component by Component

For each component in order:

1. **Read the relevant tests** — understand what behavior is expected
2. **Read the design doc section** — understand the architecture
3. **Write minimal code** to make those tests pass
4. **Run tests** — confirm the component's tests now pass
5. **Check no other tests broke** — run full suite
6. **Update Progress Tracker** — mark component as DONE

### 3. Verify All Tests Pass

After all components are implemented:
- Run the full test suite
- Every test must PASS
- If any test fails, fix the implementation (not the test)

### 4. Story Implementation Verification

After all tests pass, verify the traceability chain is complete:

```markdown
## Story Implementation Verification

| US-NNN | Story Title | Tests | All Pass? | Implemented? |
|--------|------------|-------|-----------|-------------|
| US-001 | User registration | T-001, T-002, T-050 | YES | YES |
| US-002 | OAuth login | T-003, T-004 | YES | YES |
| ... | ... | ... | ... | ... |

**All tests pass:** YES
**All stories implemented:** [X]/[Y] (must be 100%)
```

This verification proves: every story → has tests → tests pass → story is implemented.

### 5. Refactor (Optional)

If the code works but could be cleaner:
- Refactor only with user approval
- Run tests after each refactor to ensure nothing breaks
- Keep refactoring commits separate from feature commits

## Output Validation

After implementation is complete, dispatch the **contract-validator** agent:

```
Agent: contract-validator
Skill: impl
Output path: [project root]
```

The validator will run all tests, check no test files were modified, and verify code structure. Do NOT proceed until the validator returns PASS.

After contract-validator PASS, dispatch the **code-reviewer** agent:

```
Agent: code-reviewer
Skill: impl
Code paths: [source code directories]
Design doc: docs/designs/[filename].md
```

The code-reviewer will check design adherence, security, and code quality, then auto-fix any issues. All tests must still PASS after fixes.

Once the code-reviewer completes, **immediately invoke `/test-report`** — do NOT ask the user whether to continue.

## Rationalization Prevention

| Thought | Reality |
|---------|---------|
| "This test is wrong, I need to fix it" | Tests are the spec. Fix your code, not the test. |
| "I'll add this extra feature while I'm here" | YAGNI. Implement what the tests require. Nothing more. |
| "One big commit is fine for a small change" | One commit per component. Always. |
| "I don't need to run the full suite after each component" | One broken component can cascade. Run full suite every time. |
| "I'll refactor as I go" | GREEN first, REFACTOR second. Separate concerns. |
| "The tests pass locally, should be fine" | Show the output. Evidence beats assumptions. |

## Evidence Gate

Before claiming this skill is complete, you must have:
- [ ] Built Execution Plan with component order and story mapping (show plan)
- [ ] Run tests before implementation and shown they ALL FAIL (show output)
- [ ] Implemented all components with progress tracker updated (show tracker)
- [ ] Run full test suite and shown ALL PASS (show output)
- [ ] Built Story Implementation Verification with 100% coverage (show table)
- [ ] Shown git log proving commits per component
- [ ] Dispatched contract-validator and received PASS (show the result)

No evidence = not complete. Period.

## Anti-Patterns

| Bad | Good |
|-----|------|
| Writing more code than tests require | Writing minimum code to pass tests |
| Modifying tests to match implementation | Fixing implementation to match tests |
| One giant commit | One commit per component |
| Implementing features not in design doc | Sticking to the spec |
| Premature optimization | Make it work, then make it right |
| "Tests pass, done" | "Tests pass AND Story Implementation Verification shows 100%" |
