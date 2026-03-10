---
name: impl
description: "Use when implementing code to make failing tests pass, guided by a design doc. Triggers on: implementing features, writing production code, making tests green, TDD green phase."
---

# Implementation

## Overview

Write the minimum code to make all failing tests pass, following the design doc architecture. This is the GREEN phase of TDD.

<HARD-GATE>
Before writing any implementation code:
1. Read the design doc and understand the architecture
2. Run all tests and confirm they FAIL (red phase complete)
3. Plan implementation order with user (which component first?)

Do NOT modify any test files. Tests are the spec.
</HARD-GATE>

## Input Contract Validation

On start, verify:
- [ ] Design doc exists at `docs/designs/*.md`
- [ ] Test files exist in `tests/`
- [ ] Test plan exists at `docs/test-plans/*.md`
- [ ] All tests currently FAIL (red phase is complete)

If validation fails, list specific violations and stop.

## Process

### 1. Plan Implementation Order

Analyze test dependencies and design doc components. Propose an order:

```
Implementation order:
1. [Component] — [why first: no dependencies / foundational]
2. [Component] — [depends on #1]
3. [Component] — [depends on #1 and #2]
```

Get user approval on the order.

### 2. Implement Component by Component

For each component:

1. **Read the relevant tests** — understand what behavior is expected
2. **Write minimal code** to make those tests pass
3. **Run tests** — confirm the component's tests now pass
4. **Check no other tests broke** — run full suite
5. **Commit** — one commit per component with message referencing the component

### 3. Verify All Tests Pass

After all components are implemented:
- Run the full test suite
- Every test must PASS
- If any test fails, fix the implementation (not the test)

### 4. Refactor (Optional)

If the code works but could be cleaner:
- Refactor only with user approval
- Run tests after each refactor to ensure nothing breaks
- Keep refactoring commits separate from feature commits

## Output Self-Validation

Before declaring implementation complete, verify:
- [ ] All tests pass (run full suite, show output)
- [ ] No test files were modified
- [ ] Code follows the design doc architecture
- [ ] Each component has its own commit
- [ ] No dead code or unused imports

If any check fails, fix before declaring complete.

## Anti-Patterns

| Bad | Good |
|-----|------|
| Writing more code than tests require | Writing minimum code to pass tests |
| Modifying tests to match implementation | Fixing implementation to match tests |
| One giant commit | One commit per component |
| Implementing features not in design doc | Sticking to the spec |
| Premature optimization | Make it work, then make it right |
